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
  ts,
  Identifier,
  QualifiedName,
  ExpressionWithTypeArguments,
  ImportDeclaration,
  StringLiteral,
  VariableStatement,
  VariableDeclaration,
  JSDoc,
  PropertyDeclaration,
  ConstructorDeclaration,
  MethodSignature,
  TypeAliasDeclaration,
  TypeLiteralNode,
  PropertySignature,
  IndexSignatureDeclaration,
  CallSignatureDeclaration,
  HeritageClause,
  HeritageClauseableNode,
  NamespaceImport,
  BindingName,
  BindingPattern,
  ImportClause,
  ImportSpecifier,
  JSDocTag,
  JSDocTypeExpression,
  JSDocType,
  GetAccessorDeclaration,
  SetAccessorDeclaration,
  SyntaxList,
  ModifierableNode,
  TypeElementTypes
} from 'ts-morph';
import { TypeInformation, MethodSignature as MethodSignatureInfo, MethodParameter, TypeParameter } from '../interfaces/type-information';
import { resolveImportPath } from './import-resolver';
import chalk from 'chalk';
import * as path from 'path';
import { logger } from '../utils/logger';


function isPromiseType(type: Type): boolean {
  return type.getText().startsWith('Promise<');
}

function isVoidType(type: Type): boolean {
  return type.isVoid() || type.getText() === 'void';
}

function isAnyType(type: Type): boolean {
  return type.isAny() || type.getText() === 'any';
}

function isBuiltInType(type: Type): boolean {
  const builtInTypes = ['string', 'number', 'boolean', 'void', 'any', 'null', 'undefined', 'unknown', 'symbol'];
  const typeText = type.getText()
  return builtInTypes.includes(typeText);
}
function getImportStatement(symbol: Symbol | undefined, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string, aliasName?: string): string | undefined {
  if (!symbol) return undefined;
  const declarations = symbol.getDeclarations();
  if (declarations.length === 0) return undefined
  const firstDeclaration = declarations[0];
  if (!firstDeclaration || !Node.isNode(firstDeclaration)) return undefined
  const declarationSourceFile = firstDeclaration.getSourceFile();
  if (declarationSourceFile === sourceFile) return undefined;
  if (!fileMap.has(path.basename(declarationSourceFile.getFilePath(), '.ts'))) return undefined
  const importPath = resolveImportPath(outputPath, declarationSourceFile.getFilePath(), fileMap);
  let importName = symbol.getName();
  if (aliasName) {
    return `import { ${importName} as ${aliasName} } from '${importPath}';`;
  }
  return `import { ${importName} } from '${importPath}';`;
}

function getTypeStringFromTypeNode(node: TypeNode | undefined, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string): string {
  if (!node) return 'any';
  const typeChecker = node.getProject().getTypeChecker();
  const type = typeChecker.getTypeAtLocation(node)
  const symbol = type.getSymbol();
  const aliasSymbol = type.getAliasSymbol()
  if (symbol || aliasSymbol) {
    const importStatement = getImportStatement(aliasSymbol || symbol, sourceFile, fileMap, outputPath, aliasSymbol?.getName());
    if (importStatement) {
      let typeText = node.getText();
      if (aliasSymbol && symbol?.getName() !== aliasSymbol.getName()) {
        typeText = aliasSymbol.getName();
      }
      return typeText
    }
  }
  return node.getText()
}

function getTypeString(type: Type, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string): string {
  // Handle union types
  if (type.isUnion()) {
    return type.getUnionTypes()
      .map(t => getTypeString(t, sourceFile, fileMap, outputPath))
      .join(' | ');
  }

  // Handle intersection types  
  if (type.isIntersection()) {
    return type.getIntersectionTypes()
      .map(t => getTypeString(t, sourceFile, fileMap, outputPath))
      .join(' & ');
  }

  const symbol = type.getSymbol();
  const aliasSymbol = type.getAliasSymbol();
  const actualSymbol = aliasSymbol || symbol;
  if (actualSymbol) {
    const importStatement = getImportStatement(actualSymbol, sourceFile, fileMap, outputPath, aliasSymbol?.getName());
    if (importStatement) {
      let typeText = type.getText();
      if (aliasSymbol && symbol?.getName() !== aliasSymbol.getName()) {
        typeText = aliasSymbol.getName();
      }
      return typeText;
    }
  }
  if (isBuiltInType(type)) {
    return type.getText()
  }
  return type.getText();
}


function extractTypeParameters(typeParameters: TypeParameterDeclaration[], sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string): TypeParameter[] {
  return typeParameters.map(tp => {
    const constraintType = tp.getConstraint();
    const constraint = constraintType ? getTypeStringFromTypeNode(constraintType, sourceFile, fileMap, outputPath) : undefined;
    return {
      name: tp.getName(),
      constraint,
    }
  });
}

function extractMethodParameters(parameters: ParameterDeclaration[], sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string): MethodParameter[] {
  return parameters.map(parameter => {
    const typeNode = parameter.getTypeNode()
    const typeString = getTypeStringFromTypeNode(typeNode, sourceFile, fileMap, outputPath);
    return {
      name: parameter.getName(),
      type: typeString,
      optional: parameter.isOptional() || !!parameter.getInitializer()
    };
  });
}

function extractReturnType(method: MethodDeclaration | MethodSignature | ConstructorDeclaration | CallSignatureDeclaration | GetAccessorDeclaration | SetAccessorDeclaration, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string): string {
  const typeChecker = method.getProject().getTypeChecker();
  let returnType: Type;
  let returnTypeNode = method.getReturnTypeNode();

  if (returnTypeNode) {
    return getTypeStringFromTypeNode(returnTypeNode, sourceFile, fileMap, outputPath);
  }

  if (Node.isMethodDeclaration(method) || Node.isConstructorDeclaration(method) || Node.isCallSignatureDeclaration(method)) {
    returnType = method.getSignature().getReturnType();
  } else {
    returnType = typeChecker.getSignatureFromNode(method as any)!.getReturnType();
  }

  // Handle async methods
  if (Node.isMethodDeclaration(method) && method.isAsync()) {
    const innerType = isPromiseType(returnType) ? returnType.getTypeArguments()[0] : returnType;
    const typeString = getTypeString(innerType, sourceFile, fileMap, outputPath);
    return `Promise<${typeString}>`;
  }

  // Handle existing Promise types
  if (isPromiseType(returnType)) {
    const innerType = returnType.getTypeArguments()[0];
    if (isVoidType(innerType)) {
      return 'Promise<void>';
    }
    const typeString = getTypeString(innerType, sourceFile, fileMap, outputPath);
    return `Promise<${typeString}>`;
  }

  // ...remaining return type logic...
  return getTypeString(returnType, sourceFile, fileMap, outputPath);
}


function extractMethodSignature(methodDeclaration: MethodDeclaration | MethodSignature | ConstructorDeclaration | CallSignatureDeclaration | GetAccessorDeclaration | SetAccessorDeclaration, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string): MethodSignatureInfo[] {
  const signatures: MethodSignatureInfo[] = [];

  if (Node.isMethodDeclaration(methodDeclaration)) {
    // Handle method overloads
    const overloads = methodDeclaration.getOverloads();

    overloads.forEach(overload => {
      signatures.push({
        name: overload.getName(),
        parameters: extractMethodParameters(overload.getParameters(), sourceFile, fileMap, outputPath),
        returnType: extractReturnType(overload, sourceFile, fileMap, outputPath),
        typeParameters: extractTypeParameters(overload.getTypeParameters(), sourceFile, fileMap, outputPath)
      });
    });

    // Add implementation signature if no overloads
    if (signatures.length === 0) {
      signatures.push({
        name: methodDeclaration.getName(),
        parameters: extractMethodParameters(methodDeclaration.getParameters(), sourceFile, fileMap, outputPath),
        returnType: extractReturnType(methodDeclaration, sourceFile, fileMap, outputPath),
        typeParameters: extractTypeParameters(methodDeclaration.getTypeParameters(), sourceFile, fileMap, outputPath)
      });
    }
  } else {
    // Handle other declaration types
    let methodName = 'unknown';
    if (Node.isConstructorDeclaration(methodDeclaration)) {
      methodName = 'constructor';
    } else if (Node.isCallSignatureDeclaration(methodDeclaration)) {
      methodName = 'call';
    } else if (Node.isGetAccessorDeclaration(methodDeclaration) || Node.isSetAccessorDeclaration(methodDeclaration)) {
      methodName = methodDeclaration.getName();
    }

    signatures.push({
      name: methodName,
      parameters: extractMethodParameters(methodDeclaration.getParameters(), sourceFile, fileMap, outputPath),
      returnType: extractReturnType(methodDeclaration, sourceFile, fileMap, outputPath),
      typeParameters: extractTypeParameters(methodDeclaration.getTypeParameters(), sourceFile, fileMap, outputPath)
    });
  }

  return signatures;
}

function extractProperties(declaration: ClassDeclaration | InterfaceDeclaration | TypeLiteralNode, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string, methods: Map<string, MethodSignatureInfo[]>): void {
  if (Node.isClassDeclaration(declaration) || Node.isInterfaceDeclaration(declaration)) {
    declaration.getProperties().forEach(propertyDeclaration => {
      if (Node.isPropertyDeclaration(propertyDeclaration)) {
        const isStatic = propertyDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.StaticKeyword);
        const isPrivate = propertyDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.PrivateKeyword);
        const isProtected = propertyDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.ProtectedKeyword);

        if (isStatic || isPrivate || isProtected) return;
      }

      const type = propertyDeclaration.getType();
      const typeNode = propertyDeclaration.getTypeNode()
      const typeString = getTypeStringFromTypeNode(typeNode, sourceFile, fileMap, outputPath);
      methods.set(propertyDeclaration.getName(), [{
        name: propertyDeclaration.getName(),
        parameters: [],
        returnType: typeString,
        typeParameters: []
      }]);
    })
  }
}


function extractIndexSignatures(declaration: TypeLiteralNode | InterfaceDeclaration, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string, methods: Map<string, MethodSignatureInfo[]>): void {
  declaration.getIndexSignatures().forEach(signature => {
    const keyTypeNode = signature.getKeyTypeNode();
    const returnTypeNode = signature.getReturnTypeNode();
    const keyType = getTypeStringFromTypeNode(keyTypeNode, sourceFile, fileMap, outputPath);
    const returnType = getTypeStringFromTypeNode(returnTypeNode, sourceFile, fileMap, outputPath);
    const indexSignature = `[${signature.getKeyName()}: ${keyType}]`;

    methods.set(indexSignature, [{
      name: indexSignature,
      parameters: [],
      returnType: returnType,
      typeParameters: []
    }]);
  });
}

function extractHeritageClauses(node: ClassDeclaration | InterfaceDeclaration, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string, methods: Map<string, MethodSignatureInfo[]>): void {
  if (!Node.isHeritageClauseable(node)) {
    return;
  }
  const baseTypes = node.getBaseTypes();
  baseTypes.forEach(baseType => {
    const symbol = baseType.getSymbol()
    if (!symbol) return
    const declarations = symbol.getDeclarations();
    if (declarations.length === 0) return
    const firstDeclaration = declarations[0];
    if (!firstDeclaration || !Node.isNode(firstDeclaration)) return;
    if (Node.isInterfaceDeclaration(firstDeclaration)) {
      extractInterfaceMethods(firstDeclaration, sourceFile, fileMap, outputPath, methods);
    }
    if (Node.isClassDeclaration(firstDeclaration)) {
      extractClassMethods(firstDeclaration, sourceFile, fileMap, outputPath, methods);
    }
  });

}
function extractClassMethods(declaration: ClassDeclaration, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string, methods: Map<string, MethodSignatureInfo[]>): void {
  declaration.getMethods().forEach(methodDeclaration => {
    const isStatic = methodDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.StaticKeyword);
    const isPrivate = methodDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.PrivateKeyword);
    const isProtected = methodDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.ProtectedKeyword);
    if (isStatic || isPrivate || isProtected) return;
    const methodInfos = extractMethodSignature(methodDeclaration, sourceFile, fileMap, outputPath);
    methodInfos.forEach(methodInfo => {
      if (!methods.has(methodInfo.name)) {
        methods.set(methodInfo.name, []);
      }
      methods.get(methodInfo.name)!.push(methodInfo);
    });
  });
  declaration.getConstructors().forEach(constructorDeclaration => {
    const methodInfos = extractMethodSignature(constructorDeclaration, sourceFile, fileMap, outputPath);
    methodInfos.forEach(methodInfo => {
      if (!methods.has('constructor')) {
        methods.set('constructor', []);
      }
      methods.get('constructor')!.push(methodInfo);
    });
  })
  declaration.getGetAccessors().forEach(getAccessorDeclaration => {
    const isStatic = getAccessorDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.StaticKeyword);
    const isPrivate = getAccessorDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.PrivateKeyword);
    const isProtected = getAccessorDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.ProtectedKeyword);
    if (isStatic || isPrivate || isProtected) return;
    const methodInfos = extractMethodSignature(getAccessorDeclaration, sourceFile, fileMap, outputPath);
    methodInfos.forEach(methodInfo => {
      if (!methods.has(getAccessorDeclaration.getName())) {
        methods.set(getAccessorDeclaration.getName(), []);
      }
      methods.get(getAccessorDeclaration.getName())!.push(methodInfo);
    });
  })
  declaration.getSetAccessors().forEach(setAccessorDeclaration => {
    const isStatic = setAccessorDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.StaticKeyword);
    const isPrivate = setAccessorDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.PrivateKeyword);
    const isProtected = setAccessorDeclaration.getModifiers().some(modifier => modifier.getKind() === SyntaxKind.ProtectedKeyword);
    if (isStatic || isPrivate || isProtected) return;
    const methodInfos = extractMethodSignature(setAccessorDeclaration, sourceFile, fileMap, outputPath);
    methodInfos.forEach(methodInfo => {
      if (!methods.has(setAccessorDeclaration.getName())) {
        methods.set(setAccessorDeclaration.getName(), []);
      }
      methods.get(setAccessorDeclaration.getName())!.push(methodInfo);
    });
  });
}
function extractInterfaceMethods(declaration: InterfaceDeclaration, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string, methods: Map<string, MethodSignatureInfo[]>): void {
  declaration.getMethods().forEach(methodDeclaration => {
    const methodInfos = extractMethodSignature(methodDeclaration, sourceFile, fileMap, outputPath);
    methodInfos.forEach(methodInfo => {
      if (!methods.has(methodInfo.name)) {
        methods.set(methodInfo.name, []);
      }
      methods.get(methodInfo.name)!.push(methodInfo);
    });
  });
  declaration.getCallSignatures().forEach(callSignature => {
    const methodInfos = extractMethodSignature(callSignature as any, sourceFile, fileMap, outputPath);
    methodInfos.forEach(methodInfo => {
      if (!methods.has('call')) {
        methods.set('call', []);
      }
      methods.get('call')!.push(methodInfo);
    });
  });
}

function extractDeclarationMethods(declaration: ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration, sourceFile: SourceFile, fileMap: Map<string, string>, outputPath: string, methods: Map<string, MethodSignatureInfo[]>): void {
  if (Node.isClassDeclaration(declaration)) {
    extractClassMethods(declaration, sourceFile, fileMap, outputPath, methods);
    extractProperties(declaration, sourceFile, fileMap, outputPath, methods);
    extractHeritageClauses(declaration, sourceFile, fileMap, outputPath, methods)
  }
  if (Node.isInterfaceDeclaration(declaration)) {
    extractInterfaceMethods(declaration, sourceFile, fileMap, outputPath, methods)
    extractProperties(declaration, sourceFile, fileMap, outputPath, methods);
    extractIndexSignatures(declaration, sourceFile, fileMap, outputPath, methods)
    extractHeritageClauses(declaration, sourceFile, fileMap, outputPath, methods)
  }
  if (Node.isTypeAliasDeclaration(declaration)) {
    const typeNode = declaration.getTypeNode()
    if (Node.isTypeLiteral(typeNode)) {
      typeNode.getMethods().forEach(methodDeclaration => {
        const methodInfos = extractMethodSignature(methodDeclaration, sourceFile, fileMap, outputPath);
        methodInfos.forEach(methodInfo => {
          if (!methods.has(methodInfo.name)) {
            methods.set(methodInfo.name, []);
          }
          methods.get(methodInfo.name)!.push(methodInfo);
        });
      });
      typeNode.getCallSignatures().forEach(callSignature => {
        const methodInfos = extractMethodSignature(callSignature as any, sourceFile, fileMap, outputPath);
        methodInfos.forEach(methodInfo => {
          if (!methods.has('call')) {
            methods.set('call', []);
          }
          methods.get('call')!.push(methodInfo);
        });
      });
      extractProperties(typeNode, sourceFile, fileMap, outputPath, methods);
      extractIndexSignatures(typeNode, sourceFile, fileMap, outputPath, methods)
    }
  }

}
export async function extractTypeInformation(
  scanPath: string,
  tsFiles: string[],
  outputPath: string,
  fileMap: Map<string, string>,
  logLevel?: 'silent' | 'info' | 'debug'
): Promise<TypeInformation> {
  const project = new Project();
  project.addSourceFilesAtPaths(tsFiles);
  const typeInfo: TypeInformation = {
    imports: new Set<string>(),
    methodSignatures: new Map(),
    localInterfaces: new Set()
  };
  for (const sourceFile of project.getSourceFiles()) {
    for (const classDeclaration of sourceFile.getClasses()) {
      const className = classDeclaration.getName();
      if (!className) continue;
      const methodSignatures = new Map<string, MethodSignatureInfo[]>();
      extractDeclarationMethods(classDeclaration, sourceFile, fileMap, outputPath, methodSignatures);
      typeInfo.methodSignatures.set(className, methodSignatures);
      if (logLevel === 'debug') {
        console.log(chalk.gray(`[DEBUG] Extracted class: ${className}`), methodSignatures);
      }
    }
    for (const interfaceDeclaration of sourceFile.getInterfaces()) {
      const interfaceName = interfaceDeclaration.getName();
      const methodSignatures = new Map<string, MethodSignatureInfo[]>();
      extractDeclarationMethods(interfaceDeclaration, sourceFile, fileMap, outputPath, methodSignatures);
      typeInfo.methodSignatures.set(interfaceName, methodSignatures);
      if (logLevel === 'debug') {
        console.log(chalk.gray(`[DEBUG] Extracted interface: ${interfaceName}`), methodSignatures);
      }
    }
    for (const typeAliasDeclaration of sourceFile.getTypeAliases()) {
      const typeAliasName = typeAliasDeclaration.getName();
      const methodSignatures = new Map<string, MethodSignatureInfo[]>();
      extractDeclarationMethods(typeAliasDeclaration, sourceFile, fileMap, outputPath, methodSignatures);
      typeInfo.methodSignatures.set(typeAliasName, methodSignatures);
      if (logLevel === 'debug') {
        console.log(chalk.gray(`[DEBUG] Extracted type: ${typeAliasName}`), methodSignatures);
      }
      typeInfo.localInterfaces.add(typeAliasName)
    }
  }
  project.getSourceFiles().forEach(sourceFile => {
    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      const importStatement = importDeclaration.getText();
      typeInfo.imports.add(importStatement);
    });
  });
  if (logLevel === 'debug') {
    console.log(chalk.gray(`[DEBUG] Extracted types:`), typeInfo);
  }
  return typeInfo;
}
