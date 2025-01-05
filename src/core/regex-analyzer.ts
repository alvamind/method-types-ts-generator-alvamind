import * as fs from 'fs/promises';
import { ClassInfo, MethodInfo } from '../interfaces/class-info';
import { MethodSignature, TypeInformation, MethodParameter, TypeParameter } from '../interfaces/type-information';
import { Analyzer } from './analyzer-factory';
import { resolveImportPath } from './import-resolver';
import chalk from 'chalk';

export class RegexAnalyzer implements Analyzer {
  async scanClasses(tsFiles: string[]): Promise<ClassInfo[]> {
    console.log(chalk.blue('[DEBUG] RegexAnalyzer.scanClasses - Starting scan'));
    const classInfos: ClassInfo[] = [];

    for (const filePath of tsFiles) {
      console.log(chalk.blue(`[DEBUG] Scanning file: ${filePath}`));
      const content = await fs.readFile(filePath, 'utf-8');

      const classRegex = /export\s+(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?/g;
      let classMatch;

      while ((classMatch = classRegex.exec(content)) !== null) {
        const className = classMatch[1];
        console.log(chalk.cyan(`[DEBUG] Found class: ${className}`));

        const classStart = classMatch.index;
        let braceCount = 0;
        let classBody = '';
        let inClass = false;

        for (let i = classStart; i < content.length; i++) {
          if (content[i] === '{') {
            braceCount++;
            if (!inClass) inClass = true;
          } else if (content[i] === '}') {
            braceCount--;
          }

          if (inClass) {
            classBody += content[i];
          }

          if (inClass && braceCount === 0) {
            break;
          }
        }


        const methods: MethodInfo[] = [];
        const methodRegex = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[^{;]+)?/g;
        let methodMatch;
        while ((methodMatch = methodRegex.exec(classBody)) !== null) {
          const methodName = methodMatch[1];
          if (!methodName.startsWith('_') &&
            !methodName.startsWith('#') &&
            methodName !== 'constructor') {
            console.log(chalk.green(`[DEBUG] Found method: ${methodName} in class ${className}`));
            methods.push({ methodName });
          }
        }


        classInfos.push({ className, methods });
      }
    }

    console.log(chalk.blue(`[DEBUG] Found ${classInfos.length} classes`));
    return classInfos;
  }

  async extractTypeInformation(
    scanPath: string,
    tsFiles: string[],
    outputPath: string,
    fileMap: Map<string, string>,
  ): Promise<TypeInformation> {
    console.log(chalk.blue('[DEBUG] RegexAnalyzer.extractTypeInformation - Starting extraction'));

    const typeInfo: TypeInformation = {
      imports: new Set<string>(),
      methodSignatures: new Map(),
      localInterfaces: new Set<string>(),
    };

    for (const filePath of tsFiles) {
      console.log(chalk.cyan(`[DEBUG] Processing file: ${filePath}`));
      const content = await fs.readFile(filePath, 'utf-8');

      // Extract interfaces and types first
      const typeDefRegex = /export\s+(interface|type)\s+(\w+)(?:<[^>]*>)?[^;{]*{[^}]*}/g;
      let typeMatch;
      while ((typeMatch = typeDefRegex.exec(content)) !== null) {
        const typeName = typeMatch[2];
        console.log(chalk.magenta(`[DEBUG] Found type/interface: ${typeName}`));
        const importPath = resolveImportPath(outputPath, filePath, fileMap);
        typeInfo.imports.add(`import { ${typeName} } from '${importPath}';`);
        typeInfo.localInterfaces.add(typeName);
      }

      // Process classes
      const classRegex = /export\s+(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?/g;
      let classMatch;

      while ((classMatch = classRegex.exec(content)) !== null) {
        const className = classMatch[1];
        console.log(chalk.yellow(`[DEBUG] Processing class: ${className}`));

        // Extract class body
        const classStart = classMatch.index;
        let braceCount = 0;
        let classBody = '';
        let inClass = false;

        for (let i = classStart; i < content.length; i++) {
          if (content[i] === '{') {
            braceCount++;
            if (!inClass) inClass = true;
          } else if (content[i] === '}') {
            braceCount--;
          }

          if (inClass) {
            classBody += content[i];
          }

          if (inClass && braceCount === 0) {
            break;
          }
        }

        const methodSignatures = new Map<string, MethodSignature[]>();
        // Enhanced method regex to capture more details
        const methodRegex = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*(?:<([^>]*)>)?\s*\(([^)]*)\)\s*(?::\s*([^{;]+))?/g;
        let methodMatch;

        while ((methodMatch = methodRegex.exec(classBody)) !== null) {
          const methodName = methodMatch[1];
          const typeParamsStr = methodMatch[2];
          const paramsStr = methodMatch[3];
          const returnTypeStr = methodMatch[4];

          if (methodName && !methodName.startsWith('_') && !methodName.startsWith('#') && methodName !== 'constructor') {
            console.log(chalk.green(`[DEBUG] Processing method: ${methodName}`));

            // Parse type parameters with constraints
            const typeParameters = this.parseTypeParameters(typeParamsStr || '');
            console.log(chalk.yellow(`[DEBUG] Type parameters for ${methodName}:`, typeParameters));

            // Parse method parameters
            const parameters = this.parseParameters(paramsStr || '');
            console.log(chalk.yellow(`[DEBUG] Parameters for ${methodName}:`, parameters));

            // Clean and process return type
            const returnType = this.cleanupType(returnTypeStr || 'void');
            console.log(chalk.yellow(`[DEBUG] Return type for ${methodName}:`, returnType));

            const signature: MethodSignature = {
              name: methodName,
              typeParameters,
              parameters,
              returnType
            };

            // Add to method signatures, handling overloads
            const existingSignatures = methodSignatures.get(methodName) || [];
            const isDuplicate = existingSignatures.some(existing =>
              this.areSignaturesEqual(existing, signature)
            );

            if (!isDuplicate) {
              console.log(chalk.cyan(`[DEBUG] Adding signature for ${methodName}:`), signature);
              existingSignatures.push(signature);
              methodSignatures.set(methodName, existingSignatures);
            }

            // Extract and add any referenced types from parameters and return type
            this.extractReferencedTypes(signature, filePath, outputPath, fileMap, typeInfo);
          }
        }

        if (methodSignatures.size > 0) {
          typeInfo.methodSignatures.set(className, methodSignatures);
        }
      }
    }

    return typeInfo;
  }

  private areSignaturesEqual(sig1: MethodSignature, sig2: MethodSignature): boolean {
    return sig1.name === sig2.name &&
      sig1.returnType === sig2.returnType &&
      this.areParamsEqual(sig1.parameters, sig2.parameters) &&
      this.areTypeParamsEqual(sig1.typeParameters, sig2.typeParameters);
  }

  private areParamsEqual(params1: MethodParameter[], params2: MethodParameter[]): boolean {
    if (params1.length !== params2.length) return false;
    return params1.every((p1, i) => {
      const p2 = params2[i];
      return p1.name === p2.name &&
        p1.type === p2.type &&
        p1.optional === p2.optional;
    });
  }

  private areTypeParamsEqual(tp1: TypeParameter[], tp2: TypeParameter[]): boolean {
    if (tp1.length !== tp2.length) return false;
    return tp1.every((t1, i) => {
      const t2 = tp2[i];
      return t1.name === t2.name && t1.constraint === t2.constraint;
    });
  }

  private extractReferencedTypes(
    signature: MethodSignature,
    filePath: string,
    outputPath: string,
    fileMap: Map<string, string>,
    typeInfo: TypeInformation
  ): void {
    // Extract types from parameters
    signature.parameters.forEach(param => {
      const types = this.findReferencedTypes(param.type);
      types.forEach(type => {
        if (!typeInfo.localInterfaces.has(type)) {
          const importPath = resolveImportPath(outputPath, filePath, fileMap);
          typeInfo.imports.add(`import { ${type} } from '${importPath}';`);
        }
      });
    });

    // Extract types from return type
    const returnTypes = this.findReferencedTypes(signature.returnType);
    returnTypes.forEach(type => {
      if (!typeInfo.localInterfaces.has(type)) {
        const importPath = resolveImportPath(outputPath, filePath, fileMap);
        typeInfo.imports.add(`import { ${type} } from '${importPath}';`);
      }
    });
  }

  private findReferencedTypes(typeStr: string): Set<string> {
    const types = new Set<string>();
    const typeRegex = /[A-Z]\w+(?=[\[\]<>,\s{}|&]|$)/g;
    let match;

    while ((match = typeRegex.exec(typeStr)) !== null) {
      const type = match[0];
      // Exclude built-in types
      if (!['String', 'Number', 'Boolean', 'Object', 'Array', 'Promise', 'Date'].includes(type)) {
        types.add(type);
      }
    }

    return types;
  }


  private parseTypeParameters(typeParamsStr: string): TypeParameter[] {
    if (!typeParamsStr.trim()) return [];

    console.log(chalk.yellow(`[DEBUG] Parsing type parameters: ${typeParamsStr}`));
    return typeParamsStr.split(',').map(param => {
      const [name, constraint] = param.trim().split(/\s+extends\s+/);
      return { name: name.trim(), constraint: constraint?.trim() };
    });
  }

  private parseParameters(paramsStr: string): MethodParameter[] {
    if (!paramsStr.trim()) return [];

    const params = [];
    let currentParam = '';
    let depth = 0;

    for (let i = 0; i < paramsStr.length; i++) {
      const char = paramsStr[i];

      if (char === '<' || char === '{' || char === '(') depth++;
      if (char === '>' || char === '}' || char === ')') depth--;

      if (char === ',' && depth === 0) {
        params.push(currentParam);
        currentParam = '';
      } else {
        currentParam += char;
      }
    }
    if (currentParam) params.push(currentParam);

    return params.map(param => {
      const [name, typeStr] = param.split(':').map(s => s.trim());

      // Handle optional parameters and default values
      const optional = name.includes('?') || param.includes('=');
      const cleanName = name.replace(/[?=].*$/, '');

      let type = typeStr;
      if (param.includes('=')) {
        type = type?.split('=')[0].trim();
      }

      return {
        name: cleanName,
        type: this.cleanupType(type || 'any'),
        optional
      };
    });
  }


  private cleanupType(type: string): string {
    let cleaned = type.trim();

    // Handle complex generic types better
    if (cleaned.includes('<')) {
      let depth = 0;
      let finalType = '';
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (char === '<') depth++;
        if (char === '>') depth--;
        finalType += char;
        if (depth === 0 && i < cleaned.length - 1) {
          const nextChar = cleaned[i + 1];
          if (nextChar === '{' || nextChar === '[' || nextChar === '|') {
            finalType += ' ';
          }
        }
      }
      cleaned = finalType;
    }

    // Remove Promise wrapper if raw return type requested
    if (cleaned.startsWith('Promise<')) {
      cleaned = cleaned.substring(8, cleaned.length - 1);
    }

    // Handle default values
    cleaned = cleaned.replace(/\s*=\s*[^,)]+/g, '');

    // Clean up spacing
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

}
