import {
  Project,
  SourceFile,
  TypeChecker,
  Type,
  TypeFormatFlags,
  Node,
  Symbol,
  TypeFlags,
  TypeParameterDeclaration,
  ParameterDeclaration,
  MethodDeclaration,
  InterfaceDeclaration,
  ClassDeclaration
} from 'ts-morph';
import chalk from 'chalk';
import { ClassInfo, MethodInfo } from '../interfaces/class-info.js';
import { TypeInformation, MethodSignature, MethodParameter, TypeParameter } from '../interfaces/type-information';
import { resolveImportPath } from './import-resolver';
import * as path from 'path';
import { extractTypeInformation as extractTypeInfo } from './type-extractor';

export async function scanClasses(scanPath: string, tsFiles: string[]): Promise<ClassInfo[]> {
  const project = new Project();
  project.addSourceFilesAtPaths(tsFiles);
  const classInfos: ClassInfo[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.getClasses().forEach(classDeclaration => {
      const className = classDeclaration.getName();
      if (!className) return;

      const methods: MethodInfo[] = [];
      classDeclaration.getMethods().forEach(methodDeclaration => {
        const methodName = methodDeclaration.getName();
        methods.push({ methodName });
      });
      classInfos.push({ className, methods });
    });
  }
  return classInfos;
}
export async function extractTypeInformation(
  scanPath: string,
  tsFiles: string[],
  outputPath: string,
  fileMap: Map<string, string>,
): Promise<TypeInformation> {
  const project = new Project();
  project.addSourceFilesAtPaths(tsFiles);

  const typeInfo: TypeInformation = {
    imports: new Set<string>(),
    methodSignatures: new Map(),
    localInterfaces: new Set<string>(),
  };
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.getClasses().forEach(classDeclaration => {
      const className = classDeclaration.getName();
      if (!className) return;

      const methodSignatures = new Map<string, MethodSignature[]>();
      classDeclaration.getMethods().forEach(methodDeclaration => {
        const methodName = methodDeclaration.getName();
        const signatures: MethodSignature[] = [];
        const methodSignature = extractTypeInfo(
          scanPath,
          tsFiles,
          outputPath,
          fileMap,
        ).then(typeInfo => {
          const methodSignatures = typeInfo.methodSignatures.get(className)
          const signature = methodSignatures?.get(methodName) || [];
          signatures.push(...signature);
        });
        methodSignatures.set(methodName, signatures);

      });
      typeInfo.methodSignatures.set(className, methodSignatures)
    });
  }
  return typeInfo
}
