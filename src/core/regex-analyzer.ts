// src/core/regex-analyzer.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { ClassInfo, MethodInfo } from '../interfaces/class-info';
import { MethodSignature, TypeInformation } from '../interfaces/type-information';

export async function scanClassesRegex(scanPath: string, tsFiles: string[]): Promise<ClassInfo[]> {
  const classInfos: ClassInfo[] = [];
  for (const filePath of tsFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    const classRegex = /export\s+class\s+(\w+)\s*(?:extends\s+\w+)?\s*\{([^}]*)\}/g;
    let classMatch;
    while ((classMatch = classRegex.exec(content)) !== null) {
      const className = classMatch[1];
      const classBody = classMatch[2];
      const methods: MethodInfo[] = [];
      const methodRegex = /(\w+)\s*<[^>]*>\s*\(([^)]*)\)\s*(:\s*(Promise<([\w\s<>{}]+)>|([\w\s<>{}]+)))?\s*\{/g;
      let methodMatch;
      while ((methodMatch = methodRegex.exec(classBody)) !== null) {
        const methodName = methodMatch[1];
        methods.push({ methodName });
      }
      classInfos.push({ className, methods });
    }
  }
  return classInfos;
}

export async function extractTypeInformationRegex(
  scanPath: string,
  tsFiles: string[],
  outputPath: string,
  fileMap: Map<string, string>,
): Promise<TypeInformation> {
  const typeInfo: TypeInformation = {
    imports: new Set<string>(),
    methodSignatures: new Map(),
    localInterfaces: new Set<string>(),
  };
  for (const filePath of tsFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    const importRegex = /import\s+\{\s*([\w,\s]+)\s*\}\s+from\s+['"]([^'"]+)['"];/g;
    let match;
    // Fix: Explicit type for imports
    let imports: { [key: string]: string } = {};
    while ((match = importRegex.exec(content)) !== null) {
      const symbols = match[1].split(',').map(s => s.trim());
      const importPath = match[2];
      symbols.forEach(symbol => {
        imports[symbol] = importPath;
      });
    }
    const classRegex = /export\s+class\s+(\w+)\s*(?:extends\s+\w+)?\s*\{([^}]*)\}/g;
    let classMatch;
    while ((classMatch = classRegex.exec(content)) !== null) {
      const className = classMatch[1];
      const classBody = classMatch[2];
      const methodSignatures = new Map<string, MethodSignature[]>();
      const methodRegex = /(\w+)\s*<[^>]*>\s*\(([^)]*)\)\s*(:\s*(Promise<([\w\s<>{}]+)>|([\w\s<>{}]+)))?\s*\{/g;
      let methodMatch;
      while ((methodMatch = methodRegex.exec(classBody)) !== null) {
        const methodName = methodMatch[1];
        let params = methodMatch[2].trim();
        let returnType = methodMatch[5] || methodMatch[6] || 'void';
        params = params.replace(/(\w+)\s*\?\s*:\s*([\w<>{}]+)/g, '$1?: $2');
        params = params.replace(/(\w+)\s*:\s*([\w<>{}]+)\s*=[\s\S]*?(?=,|$)/g, '$1?: $2');
        if (imports[returnType]) {
          returnType = `{${returnType}} from '${imports[returnType]}'`;
        }
        const interfaceTypeRegex = /(\w+)\s*:\s*(\w+)/g;
        let paramMatch;
        while ((paramMatch = interfaceTypeRegex.exec(params)) !== null) {
          const paramName = paramMatch[1];
          const paramType = paramMatch[2];
          if (imports[paramType]) {
            params = params.replace(`${paramType}`, `{${paramType}} from '${imports[paramType]}'`);
          }
        }
        methodSignatures.set(methodName, [{
          name: methodName,
          typeParameters: [],
          parameters: params.split(",").map((param) => {
            const name = param.split(/(\?|\:)/)[0]?.trim();
            const type = param.split(/(\?|\:)/)[2]?.trim();
            return {
              name,
              type: type || 'any',
              optional: param.includes("?")
            };
          }),
          returnType: returnType.replace("Promise<", "")?.replace(">", "")
        }]);
      }
      const overloadedMethodRegex = /(\w+)\s*\(([^)]*)\)\s*(:\s*([\w\s<>{}]+))?;/g;
      let overloadedMethodMatch;

      // Fix: Explicit type for overloadedMethodSignatures
      let overloadedMethodSignatures: { [key: string]: MethodSignature[] } = {};
      while ((overloadedMethodMatch = overloadedMethodRegex.exec(classBody)) !== null) {
        const overloadedMethodName = overloadedMethodMatch[1];
        let overloadedParams = overloadedMethodMatch[2].trim();
        let overloadedReturnType = overloadedMethodMatch[4] || 'void';
        overloadedParams = overloadedParams.replace(/(\w+)\s*\?\s*:\s*([\w<>{}]+)/g, '$1?: $2');
        overloadedParams = overloadedParams.replace(/(\w+)\s*:\s*([\w<>{}]+)\s*=[\s\S]*?(?=,|$)/g, '$1?: $2');
        if (imports[overloadedReturnType]) {
          overloadedReturnType = `{${overloadedReturnType}} from '${imports[overloadedReturnType]}'`;
        }
        const interfaceTypeRegex = /(\w+)\s*:\s*(\w+)/g;
        let paramMatch;
        while ((paramMatch = interfaceTypeRegex.exec(overloadedParams)) !== null) {
          const paramName = paramMatch[1];
          const paramType = paramMatch[2];
          if (imports[paramType]) {
            overloadedParams = overloadedParams.replace(`${paramType}`, `{${paramType}} from '${imports[paramType]}'`);
          }
        }
        if (!overloadedMethodSignatures[overloadedMethodName]) {
          overloadedMethodSignatures[overloadedMethodName] = [];
        }
        overloadedMethodSignatures[overloadedMethodName].push({
          name: overloadedMethodName,
          typeParameters: [],
          parameters: overloadedParams.split(",").map((param) => {
            const name = param.split(/(\?|\:)/)[0]?.trim();
            const type = param.split(/(\?|\:)/)[2]?.trim();
            return {
              name,
              type: type || 'any',
              optional: param.includes("?")
            };
          }),
          returnType: overloadedReturnType
        });
      }
      for (const method in overloadedMethodSignatures) {
        if (methodSignatures.has(method)) {
          overloadedMethodSignatures[method].forEach(signature => {
            methodSignatures.get(method)?.push(signature);
          });
        } else {
          methodSignatures.set(method, overloadedMethodSignatures[method]);
        }
      }
      typeInfo.methodSignatures.set(className, methodSignatures);
    }
  }
  return typeInfo;
}
