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
        const methodRegex = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*(?:<([^>]*)>)?\s*\(([^)]*)\)\s*(?::\s*([^{;]+))(?=\s*[{;])/g; let methodMatch;
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

      // Extract interfaces and types
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
        const methodSignatures = new Map<string, MethodSignature[]>();

        // Extract class body and methods
        const classBody = this.extractClassBody(content, classMatch.index);
        const methodRegex = /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*(?:<([^>]*)>)?\s*\(([^)]*)\)\s*(?::\s*([^{;]+))?/g;

        let methodMatch;
        while ((methodMatch = methodRegex.exec(classBody)) !== null) {
          const methodName = methodMatch[1];
          if (!methodName.startsWith('_') && !methodName.startsWith('#') && methodName !== 'constructor') {
            const signature = this.extractMethodSignature(methodMatch);
            const existingSignatures = methodSignatures.get(methodName) || [];
            methodSignatures.set(methodName, [...existingSignatures, signature]);
          }
        }

        if (methodSignatures.size > 0) {
          typeInfo.methodSignatures.set(className, methodSignatures);
        }
      }
    }

    return typeInfo;
  }

  private extractClassBody(content: string, startIndex: number): string {
    let braceCount = 0;
    let classBody = '';
    let inClass = false;

    for (let i = startIndex; i < content.length; i++) {
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

    return classBody;
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

  private extractMethodSignature(methodMatch: RegExpExecArray): MethodSignature {
    const [, methodName, typeParams, params, returnType] = methodMatch;

    const signature: MethodSignature = {
      name: methodName,
      typeParameters: this.parseTypeParameters(typeParams || ''),
      parameters: this.parseParameters(params || ''),
      returnType: this.cleanupType(returnType || 'void')
    };

    // Handle Promise return types
    if (returnType?.includes('Promise<')) {
      signature.returnType = `Promise<${this.cleanupType(returnType.match(/Promise\s*<(.+)>/)?.[1] || 'void')}>`;
    }

    return signature;
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
    const params = typeParamsStr.split(',').map(param => {
      const [name, constraint] = param.trim().split(/\s+extends\s+/);
      return { name: name.trim(), constraint: constraint?.trim() };
    });
    return params;
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
    if (!type) return 'void';

    let cleaned = type.trim()
      // Remove newlines and extra spaces
      .replace(/\s+/g, ' ')
      // Handle Promise wrapper
      .replace(/Promise\s*<(.+)>/, '$1')
      // Clean up spaces around brackets
      .replace(/\s*([<>])\s*/g, '$1')
      // Clean up spaces around commas
      .replace(/\s*,\s*/g, ', ');

    // Handle nested generic types
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

    // Handle default values
    cleaned = cleaned.replace(/\s*=\s*[^,)]+/g, '');

    return cleaned;
  }

}
