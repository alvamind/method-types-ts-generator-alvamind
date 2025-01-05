import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import { ClassInfo } from './interfaces/class-info';
import { TypeInformation, MethodSignature } from './interfaces/type-information';
import { createRegexPatterns } from './utils/regex-utils';
import { getAllTsFiles, scanProject } from './core/file-scanner';
import { extractTypeInformation } from './core/type-extractor';
import { scanClasses } from './core/project-analyzer';
import { Project } from 'ts-morph';
function generateInterfaceString(classInfos: ClassInfo[], typeInfo: TypeInformation, returnType: string, project: Project): string {
  let output = "// Auto-generated by rpc-nats-alvamind\n\n";
  if (typeInfo.imports.size > 0) {
    output += Array.from(typeInfo.imports).join("\n") + "\n\n";
  }
  output += "export interface ExposedMethods {\n";
  const uniqueClasses = new Map<string, Set<ClassInfo['methods'][number]>>();
  for (const classInfo of classInfos) {
    if (!uniqueClasses.has(classInfo.className)) {
      uniqueClasses.set(classInfo.className, new Set());
    }
    const methods = uniqueClasses.get(classInfo.className)!;
    classInfo.methods.forEach(method => {
      methods.add(method);
    });
  }
  uniqueClasses.forEach((methods, className) => {
    output += `  ${className}: {\n`;
    const methodSignatures = typeInfo.methodSignatures.get(className);

    methodSignatures?.forEach((signatures, methodName) => {
      signatures.forEach(signature => {
        const params = signature.parameters
          .map(p => `${p.name}${p.optional ? "?" : ""}: ${p.type.replace(/import\\([^)]+\\)\\./g, '')}`)
          .join(", ");
        const typeParams = signature.typeParameters.map(p => `${p.name}${p.constraint ? ` extends ${p.constraint}` : ''}`).join(",")
        let returnTypeString = signature.returnType
        returnTypeString = returnTypeString.replace(/import\([^)]+\)\./g, '');
        const isPromiseType = returnTypeString.startsWith('Promise<');
        if (isPromiseType && returnType === 'raw') {
          returnTypeString = returnTypeString.replace(/Promise<(.+)>/, '$1');
        }
        let returnTypeOutput: string;
        switch (returnType) {
          case 'promise':
            returnTypeOutput = isPromiseType ?
              returnTypeString :
              `Promise<${returnTypeString}>`;
            break;
          case 'observable':
            returnTypeOutput = `Observable<${isPromiseType ?
              returnTypeString.replace(/Promise<(.+)>/, '$1') :
              returnTypeString}>`;
            break;
          default: // 'raw'
            returnTypeOutput = returnTypeString;
        }
        output += `    ${signature.name}${typeParams ? `<${typeParams}>` : ""}(${params}): ${returnTypeOutput};\n`;
      })
    })
    output += "  };\n";
  });
  output += "}\n";
  return output;
}
export async function generateExposedMethodsType(
  options: { scanPath: string, excludeFiles?: string[], returnType?: string, logLevel?: 'silent' | 'info' | 'debug' },
  outputPath: string,
) {
  try {
    const excludePatterns = createRegexPatterns(options.excludeFiles);
    const tsFiles = await getAllTsFiles(options.scanPath, excludePatterns);
    console.log(chalk.yellow(`[NATS] Found ${tsFiles.length} TypeScript files to process`));
    const project = new Project();
    project.addSourceFilesAtPaths(tsFiles);
    const fileMap = await scanProject(options.scanPath);
    const { logLevel } = options;
    const typeInfo = await extractTypeInformation(
      options.scanPath,
      tsFiles,
      outputPath,
      fileMap,
      options.logLevel
    );
    const classInfos = await scanClasses(options.scanPath, tsFiles);
    const interfaceString = generateInterfaceString(classInfos, typeInfo, options.returnType || 'raw', project);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, interfaceString, "utf-8");
  } catch (error) {
    console.error(chalk.red.bold('[NATS] Error generating exposed methods types:'));
    console.error(chalk.red(error));
    throw error;
  }
}
