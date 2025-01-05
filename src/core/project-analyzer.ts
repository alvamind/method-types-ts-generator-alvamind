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
  MethodDeclaration
} from 'ts-morph';
import chalk from 'chalk';
import { ClassInfo, MethodInfo } from '../interfaces/class-info.js';
import { TypeInformation, MethodSignature, MethodParameter, TypeParameter } from '../interfaces/type-information';
import { resolveImportPath } from './import-resolver';
import * as path from 'path';

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

function resolveType(type: Type, node: Node, typeChecker?: TypeChecker): string {
  if (type.isString()) return "string";
  if (type.isNumber()) return "number";
  if (type.isBoolean()) return "boolean";
  if (type.isNull()) return "null";
  if (type.isUndefined()) return "undefined";
  if (type.isAny()) return "any";
  if (type.isUnknown()) return "unknown";
  if (type.isVoid()) return "void";
  if (type.isLiteral()) return JSON.stringify(type.getLiteralValue());

  if (type.isObject()) {
    const symbol = type.getSymbol();
    if (symbol) {
      if (type.isClass() || type.isInterface()) {
        return symbol.getName();
      }
    }

    if (type.isTuple()) {
      return `[${type.getTupleElements().map(t => resolveType(t, node, typeChecker)).join(', ')}]`;
    }

    if (type.isAnonymous()) {
      const properties = type.getProperties();
      if (properties.length > 0) {
        const props = properties.map(prop => {
          const declaration = prop.getDeclarations()[0];
          if (declaration && Node.isPropertySignature(declaration)) {
            const name = prop.getName();
            const propType = declaration.getType();
            return `${name}${declaration.hasQuestionToken() ? "?" : ""}: ${resolveType(propType, node, typeChecker)}`;
          }
          return "";
        }).join(', ');
        return `{${props}}`;
      }
    }
  }

  if (type.isTypeParameter()) {
    const symbol = type.getSymbol();
    if (symbol) return symbol.getName();
    return type.getText();
  }

  if (type.isUnion()) {
    return type.getUnionTypes().map(t => resolveType(t, node, typeChecker)).join(" | ");
  }

  if (type.isIntersection()) {
    return type.getIntersectionTypes().map(t => resolveType(t, node, typeChecker)).join(" & ");
  }

  if (type.isEnum()) {
    const symbol = type.getSymbol();
    if (symbol) return symbol.getName();
  }

  if (type.isClassOrInterface()) {
    const symbol = type.getSymbol();
    if (symbol) return symbol.getName();
  }
  if (type.getFlags() & TypeFlags.Object) {
    const symbol = type.getSymbol();
    if (symbol && symbol.getName() === "Promise") {
      const typeArgs = type.getTypeArguments();
      if (typeArgs.length > 0) {
        return `Promise<${typeArgs.map(t => resolveType(t, node, typeChecker)).join(", ")}>`;
      }
      return `Promise<any>`;
    }
  }

  if (type.getFlags() & TypeFlags.Conditional) {
    return type.getText(node, TypeFormatFlags.NoTruncation);
  }

  if (type.getFlags() & TypeFlags.IndexedAccess) {
    return type.getText(node, TypeFormatFlags.NoTruncation);
  }

  return type.getText(node, TypeFormatFlags.NoTruncation);
}


function extractTypeParameter(typeParameter: TypeParameterDeclaration, node: Node, typeChecker?: TypeChecker): TypeParameter {
  return {
    name: typeParameter.getName(),
    constraint: typeParameter.getConstraint() ? resolveType(typeChecker!.getTypeAtLocation(typeParameter.getConstraint()!), node, typeChecker) : undefined
  };
}


function extractMethodParameter(parameter: ParameterDeclaration, typeChecker?: TypeChecker): MethodParameter {
  const paramType = parameter.getType();
  return {
    name: parameter.getName(),
    type: resolveType(paramType, parameter, typeChecker),
    optional: parameter.isOptional()
  };
}

function extractMethodSignature(method: MethodDeclaration, typeChecker: TypeChecker, imports: Set<string>, project: Project, outputPath: string, scanPath: string, fileMap: Map<string, string>): MethodSignature {
  return {
    name: method.getName(),
    typeParameters: method.getTypeParameters().map(param => extractTypeParameter(param, method, typeChecker)),
    parameters: method.getParameters().map(parameter => extractMethodParameter(parameter, typeChecker)),
    returnType: resolveType(method.getReturnType(), method, typeChecker)
  };
}


async function collectImports(
  declaration: Node | undefined,
  imports: Set<string>,
  project: Project,
  outputPath: string,
  scanPath: string,
  fileMap: Map<string, string>
) {
  if (!declaration) return;
  const symbol = declaration.getSymbol();
  if (!symbol) return;
  const typeName = symbol.getName();
  if (["T", "K", "U", "V"].includes(typeName) || ["Promise"].includes(typeName)) {
    return;
  }
  const declarations = symbol.getDeclarations();
  if (!declarations || declarations.length === 0) return;
  const sourceFile = declarations[0].getSourceFile();
  if (!sourceFile) return;
  if (sourceFile.getFilePath().includes("node_modules/typescript/lib")) {
    return;
  }
  const modulePath = sourceFile.getFilePath();
  const fileName = path.basename(modulePath, '.ts');
  const importPath = resolveImportPath(outputPath, modulePath, fileMap);
  if (!Array.from(imports).some(imp => imp.includes(`{ ${typeName} }`))) {
    imports.add(`import { ${typeName} } from '${importPath}';`);
  }
}

export async function extractTypeInformation(
  scanPath: string,
  tsFiles: string[],
  outputPath: string,
  fileMap: Map<string, string>
): Promise<TypeInformation> {
  const project = new Project();
  project.addSourceFilesAtPaths(tsFiles);
  const typeChecker = project.getTypeChecker();
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
        const overloads = methodDeclaration.getOverloads();
        if (overloads.length > 0) {
          overloads.forEach(overload => {
            const signature = extractMethodSignature(overload, typeChecker, typeInfo.imports, project, outputPath, scanPath, fileMap);
            signatures.push(signature)
            overload.getParameters().forEach(parameter => {
              collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
            })
            collectImports(overload.getReturnType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
          })
        } else {
          const signature = extractMethodSignature(methodDeclaration, typeChecker, typeInfo.imports, project, outputPath, scanPath, fileMap)
          signatures.push(signature)
          methodDeclaration.getParameters().forEach(parameter => {
            collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
          });
          collectImports(methodDeclaration.getReturnType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
        }
        methodSignatures.set(methodName, signatures)
      });
      typeInfo.methodSignatures.set(className, methodSignatures)
    });
  }
  return typeInfo;
}
