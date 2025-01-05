import {
  Project,
  Type,
  TypeFormatFlags,
  Node,
  Symbol,
  TypeParameterDeclaration,
  MethodDeclaration,
  ParameterDeclaration,
  SourceFile,
  SyntaxKind,
  TypeNode,
  TypeChecker,
  InterfaceDeclaration,
  ClassDeclaration,
  TypeFlags,
} from 'ts-morph';
import { TypeInformation, MethodSignature, MethodParameter, TypeParameter } from '../interfaces/type-information';
import { resolveImportPath } from './import-resolver';
import chalk from 'chalk';
import * as path from 'path';

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


function resolveType(type: Type, node: Node, logLevel?: 'silent' | 'info' | 'debug', typeChecker?: TypeChecker, imports?: Set<string>, project?: Project, outputPath?: string, scanPath?: string, fileMap?: Map<string, string>): string {
  if (type.isString()) {
    return "string";
  }
  if (type.isNumber()) {
    return "number";
  }
  if (type.isBoolean()) {
    return "boolean";
  }
  if (type.isNull()) {
    return "null";
  }
  if (type.isUndefined()) {
    return "undefined";
  }
  if (type.isAny()) {
    return "any";
  }
  if (type.isUnknown()) {
    return "unknown";
  }
  if (type.isVoid()) {
    return "void";
  }
  if (type.isLiteral()) {
    return JSON.stringify(type.getLiteralValue());
  }
  if (type.isObject()) {
    const symbol = type.getSymbol();
    if (symbol) {
      if (type.isClass()) {
        return symbol.getName();
      }
      if (type.isInterface()) {
        return symbol.getName()
      }
    }


    if (type.isTuple()) {
      return `[${type.getTupleElements().map(t => resolveType(t, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(', ')}]`;
    }

    if (type.isAnonymous()) {
      if (logLevel === 'debug') {
        console.log(chalk.blue(`[DEBUG] Processing Anonymous Type: ${type.getText(node, TypeFormatFlags.NoTruncation)}`))
      }
      const properties = type.getProperties();
      if (properties.length > 0) {
        const props = properties.map(prop => {
          const declaration = prop.getDeclarations()[0];
          if (declaration && Node.isPropertySignature(declaration)) {
            const name = prop.getName()
            const propType = declaration.getType();
            return `${name}${declaration.hasQuestionToken() ? "?" : ""}: ${resolveType(propType, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)}`
          }
          return ""
        }).join(', ')
        return `{${props}}`
      }
    }
  }
  if (type.isTypeParameter()) {
    const symbol = type.getSymbol();
    if (symbol) {
      return symbol.getName()
    }
    return type.getText();
  }

  if (type.isUnion()) {
    return type.getUnionTypes().map(t => resolveType(t, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(" | ")
  }
  if (type.isIntersection()) {
    return type.getIntersectionTypes().map(t => resolveType(t, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(" & ")
  }
  if (type.isEnum()) {
    const symbol = type.getSymbol();
    if (symbol) {
      return symbol.getName()
    }
  }
  if (type.isClassOrInterface()) {
    const symbol = type.getSymbol();
    if (symbol) {
      return symbol.getName();
    }
  }
  if (type.getFlags() & TypeFlags.Object) {
    const symbol = type.getSymbol()
    if (symbol && symbol.getName() === "Promise") {
      const typeArgs = type.getTypeArguments();
      if (typeArgs.length > 0) {
        return `Promise<${typeArgs.map(t => {
          const argType = t
          if (argType.getSymbol()) {
            collectImports(argType.getSymbol()!.getDeclarations()[0], imports!, project!, outputPath!, scanPath!, fileMap!);
          }
          return resolveType(argType, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)
        }).join(", ")}>`
      }
      return `Promise<any>`
    }

  }
  if (type.getFlags() & TypeFlags.Conditional) {
    return type.getText(node, TypeFormatFlags.NoTruncation)
  }
  if (type.getFlags() & TypeFlags.IndexedAccess) {
    return type.getText(node, TypeFormatFlags.NoTruncation)
  }


  if (logLevel === 'debug') console.log(chalk.yellow(`[DEBUG] Default resolving type: ${type.getText(node, TypeFormatFlags.NoTruncation)}`));
  return type.getText(node, TypeFormatFlags.NoTruncation);
}
function extractTypeParameter(typeParameter: TypeParameterDeclaration, node: Node, logLevel?: 'silent' | 'info' | 'debug', typeChecker?: TypeChecker): TypeParameter {
  return {
    name: typeParameter.getName(),
    constraint: typeParameter.getConstraint() ? resolveType(typeChecker!.getTypeAtLocation(typeParameter.getConstraint()!), node, logLevel, typeChecker) : undefined
  };
}

function extractMethodParameter(parameter: ParameterDeclaration, logLevel?: 'silent' | 'info' | 'debug', typeChecker?: TypeChecker): MethodParameter {
  const paramType = parameter.getType();
  return {
    name: parameter.getName(),
    type: resolveType(paramType, parameter, logLevel, typeChecker),
    optional: parameter.isOptional()
  };
}

function extractMethodSignature(method: MethodDeclaration, logLevel?: 'silent' | 'info' | 'debug', typeChecker?: TypeChecker, imports?: Set<string>, project?: Project, outputPath?: string, scanPath?: string, fileMap?: Map<string, string>): MethodSignature {
  return {
    name: method.getName(),
    typeParameters: method.getTypeParameters().map(param => extractTypeParameter(param, method, logLevel, typeChecker)),
    parameters: method.getParameters().map(parameter => extractMethodParameter(parameter, logLevel, typeChecker)),
    returnType: resolveType(method.getReturnType(), method, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)
  };
}

export async function extractTypeInformation(
  scanPath: string,
  tsFiles: string[],
  outputPath: string,
  fileMap: Map<string, string>,
  logLevel?: 'silent' | 'info' | 'debug'
): Promise<TypeInformation> {
  if (logLevel === 'info' || logLevel === 'debug') console.log(chalk.cyan(`[NATS] Extracting type information...`));

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
        if (logLevel === 'debug') console.log(chalk.magenta(`[DEBUG] Processing method: ${methodName}`));
        const signatures: MethodSignature[] = [];
        const overloads = methodDeclaration.getOverloads();
        if (overloads.length > 0) {
          overloads.forEach(overload => {
            const signature = extractMethodSignature(overload, logLevel, typeChecker, typeInfo.imports, project, outputPath, scanPath, fileMap);
            signatures.push(signature)
            overload.getParameters().forEach(parameter => {
              collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
            })
            collectImports(overload.getReturnType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
          })
        } else {
          const signature = extractMethodSignature(methodDeclaration, logLevel, typeChecker, typeInfo.imports, project, outputPath, scanPath, fileMap)
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
  if (logLevel === 'info' || logLevel === 'debug') console.log(chalk.cyan(`[NATS] Finished extracting type information`));
  return typeInfo;
}
