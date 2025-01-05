
import {
    Project,
    Type,
    TypeFormatFlags,
    Node,
    Symbol,
    TypeParameterDeclaration,
    MethodDeclaration,
    ParameterDeclaration,
    TypeChecker,
    TypeFlags,
    PropertySignature
} from 'ts-morph';
import { TypeInformation, MethodSignature, MethodParameter, TypeParameter } from '../interfaces/type-information';
import { resolveImportPath } from './import-resolver';
import * as path from 'path';
export class TsMorphTypeExtractor {
    private async collectImports(
        declaration: Node | undefined,
        imports: Set<string>,
        project: Project,
        outputPath: string,
        scanPath: string,
        fileMap: Map<string, string>
    ): Promise<void> {
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
    private resolveType(type: Type, node: Node, typeChecker?: TypeChecker, imports?: Set<string>, project?: Project, outputPath?: string, scanPath?: string, fileMap?: Map<string, string>): string {
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
                return `[${type.getTupleElements().map(t => this.resolveType(t, node, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(', ')}]`;
            }
            if (type.isAnonymous()) {
                const properties = type.getProperties();
                if (properties.length > 0) {
                    const props = properties.map(prop => {
                        const declaration = prop.getDeclarations()[0];
                        if (declaration && Node.isPropertySignature(declaration)) {
                            const name = prop.getName();
                            const propType = declaration.getType();
                            return `${name}${declaration.hasQuestionToken() ? "?" : ""}: ${this.resolveType(propType, node, typeChecker, imports, project, outputPath, scanPath, fileMap)}`;
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
            return type.getUnionTypes().map(t => this.resolveType(t, node, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(" | ");
        }
        if (type.isIntersection()) {
            return type.getIntersectionTypes().map(t => this.resolveType(t, node, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(" & ");
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
                    return `Promise<${typeArgs.map(t => {
                        const argType = t;
                        if (argType.getSymbol()) {
                            this.collectImports(argType.getSymbol()!.getDeclarations()[0], imports!, project!, outputPath!, scanPath!, fileMap!);
                        }
                        return this.resolveType(argType, node, typeChecker, imports, project, outputPath, scanPath, fileMap);
                    }).join(", ")}>`;
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
    private extractTypeParameter(typeParameter: TypeParameterDeclaration, node: Node, typeChecker?: TypeChecker): TypeParameter {
        return {
            name: typeParameter.getName(),
            constraint: typeParameter.getConstraint() ? this.resolveType(typeChecker!.getTypeAtLocation(typeParameter.getConstraint()!), node, typeChecker) : undefined
        };
    }
    private extractMethodParameter(parameter: ParameterDeclaration, typeChecker?: TypeChecker): MethodParameter {
        const paramType = parameter.getType();
        return {
            name: parameter.getName(),
            type: this.resolveType(paramType, parameter, typeChecker),
            optional: parameter.isOptional()
        };
    }
    private extractMethodSignature(method: MethodDeclaration, typeChecker?: TypeChecker, imports?: Set<string>, project?: Project, outputPath?: string, scanPath?: string, fileMap?: Map<string, string>): MethodSignature {
        return {
            name: method.getName(),
            typeParameters: method.getTypeParameters().map(param => this.extractTypeParameter(param, method, typeChecker)),
            parameters: method.getParameters().map(parameter => this.extractMethodParameter(parameter, typeChecker)),
            returnType: this.resolveType(method.getReturnType(), method, typeChecker, imports, project, outputPath, scanPath, fileMap)
        };
    }
    async extractTypeInformation(
        scanPath: string,
        tsFiles: string[],
        outputPath: string,
        fileMap: Map<string, string>,
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
            for (const classDeclaration of sourceFile.getClasses()) {
                const className = classDeclaration.getName();
                if (!className) continue;
                const methodSignatures = new Map<string, MethodSignature[]>();
                const methodPromises = classDeclaration.getMethods().map(async methodDeclaration => {
                    const methodName = methodDeclaration.getName();
                    const signatures: MethodSignature[] = [];
                    const overloads = methodDeclaration.getOverloads();
                    if (overloads.length > 0) {
                        for (const overload of overloads) {
                            const signature = this.extractMethodSignature(overload, typeChecker, typeInfo.imports, project, outputPath, scanPath, fileMap);
                            signatures.push(signature);
                            for (const parameter of overload.getParameters()) {
                                await this.collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
                            }
                            await this.collectImports(overload.getReturnType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
                        }
                    } else {
                        const signature = this.extractMethodSignature(methodDeclaration, typeChecker, typeInfo.imports, project, outputPath, scanPath, fileMap);
                        signatures.push(signature)
                        for (const parameter of methodDeclaration.getParameters()) {
                            await this.collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
                        }
                        await this.collectImports(methodDeclaration.getReturnType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
                    }
                    methodSignatures.set(methodName, signatures);
                });
                await Promise.all(methodPromises);
                typeInfo.methodSignatures.set(className, methodSignatures);
            }
        }
        return typeInfo;
    }
}
