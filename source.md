# Project: method-types-ts-generator-alvamind

dist
scripts
src
src/core
src/interfaces
src/utils
test
====================
// .npmignore
# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
# IDE
.idea
.vscode
*.suo
*.njsproj
*.sln
# OS
.DS_Store
Thumbs.db
# Node
node_modules
npm-shrinkwrap.json
# Test
test
# Build
dist
# Git
.git
.gitignore
# Optional
*.tgz

// package.json
{
  "name": "method-types-ts-generator-alvamind",
  "version": "1.0.1",
  "description": "A TypeScript method type generator",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/alvamind/method-types-ts-generator-alvamind.git"
  },
  "bin": {
    "method-types-ts-generator": "./dist/scripts/generate-type-cli.js"
  },
  "scripts": {
    "source": "generate-source output=source.md exclude=dist/,README.md,*.test.ts,.gitignore",
    "dev": "bun run src/index.ts --watch",
    "build": "tsc && tsc -p tsconfig.build.json",
    "commit": "commit",
    "split-code": "split-code source=combined.ts markers=src/,lib/ outputDir=./output",
    "publish-npm": "publish-npm patch",
    "clean": "clean"
  },
  "keywords": [
    "typescript",
    "types",
    "generator",
    "cli"
  ],
  "author": "Alvamind",
  "license": "MIT",
  "files": [
    "dist",
    "src",
    "scripts",
    "README.md",
    "index.d.ts"
  ],
  "dependencies": {
    "alvamind-tools": "^1.0.17",
    "chalk": "4.1.2",
    "ts-morph": "^25.0.0",
    "typescript": "^5.7.2"
  },
  "devDependencies": {
    "@types/bun": "^1.1.14",
    "@types/node": "^20.17.11",
    "bun-types": "^1.1.42",
    "rimraf": "^5.0.10"
  }
}
// scripts/generate-type-cli.ts
#!/usr/bin/env bun
import 'reflect-metadata';
import { generateExposedMethodsType } from '../src/index';
import chalk from 'chalk';
import * as path from "path";
interface CliOptions {
  targetDir: string;
  excludeFiles?: string[];
  outputFile: string;
  returnType?: 'promise' | 'observable' | 'raw';
  logLevel?: 'silent' | 'info' | 'debug';
  resolver?: 'ts-morph' | 'regex';
}
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: Partial<CliOptions> = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      switch (key) {
        case 'targetDir':
          options.targetDir = value;
          break;
        case 'excludeFiles':
          options.excludeFiles = value.split(',');
          break;
        case 'outputFile':
          options.outputFile = value;
          break;
        case 'returnType':
          if (['promise', 'observable', 'raw'].includes(value)) {
            options.returnType = value as CliOptions['returnType'];
          }
          break;
        case 'logLevel':
          if (['silent', 'info', 'debug'].includes(value)) {
            options.logLevel = value as CliOptions['logLevel'];
          }
          break;
        case 'resolver':
          if (['ts-morph', 'regex'].includes(value)) {
            options.resolver = value as CliOptions['resolver'];
          }
          break;
      }
    }
  }
  if (!options.targetDir) {
    console.error(chalk.red('Error: --targetDir is required'));
    process.exit(1);
  }
  if (!options.outputFile) {
    console.error(chalk.red('Error: --outputFile is required'));
    process.exit(1);
  }
  if (!options.returnType) {
    options.returnType = 'raw';
  }
  if (!options.resolver) {
    options.resolver = 'regex';
  }
  if (!options.logLevel) {
    options.logLevel = 'silent';
  }
  return options as CliOptions;
}
async function main() {
  if (parseArgs().logLevel !== 'silent') console.log(chalk.blue.bold('\n=== Method Types Generator ==='));
  try {
    const options = parseArgs();
    if (options.logLevel === 'info' || options.logLevel === 'debug') console.log(chalk.cyan('Configuration:'));
    if (options.logLevel === 'info' || options.logLevel === 'debug') console.log(chalk.gray(`Target Directory: ${options.targetDir}`));
    if (options.logLevel === 'info' || options.logLevel === 'debug') console.log(chalk.gray(`Exclude Patterns: ${options.excludeFiles?.join(', ') || 'none'}`));
    if (options.logLevel === 'info' || options.logLevel === 'debug') console.log(chalk.gray(`Output File: ${options.outputFile}`));
    if (options.logLevel === 'info' || options.logLevel === 'debug') console.log(chalk.gray(`Resolver: ${options.resolver}`));
    if (options.logLevel === 'info' || options.logLevel === 'debug') console.log(chalk.gray(`Return Type: ${options.returnType}\n`));
    await generateExposedMethodsType(
      {
        scanPath: options.targetDir,
        excludeFiles: options.excludeFiles,
        returnType: options.returnType,
        logLevel: options.logLevel,
        resolver: options.resolver
      },
      options.outputFile,
    );
    if (options.logLevel !== 'silent') console.log(chalk.green.bold(`\n✓ Successfully generated type definitions`));
    if (options.logLevel !== 'silent') console.log(chalk.gray(`Output: ${path.resolve(options.outputFile)}\n`));
  } catch (error) {
    console.error(chalk.red.bold('\nError generating type definitions:'));
    console.error(chalk.red(error));
    process.exit(1);
  }
}
main();

// src/core/analyzer-factory.ts
import { scanClasses, extractTypeInformation } from './project-analyzer';
import { scanClassesRegex, extractTypeInformationRegex } from './regex-analyzer';
import { ClassInfo } from '../interfaces/class-info';
import { TypeInformation } from '../interfaces/type-information';
export type AnalyzerType = 'ts-morph' | 'regex';
export interface Analyzer {
    scanClasses(scanPath: string, tsFiles: string[]): Promise<ClassInfo[]>;
    extractTypeInformation(
        scanPath: string,
        tsFiles: string[],
        outputPath: string,
        fileMap: Map<string, string>,
    ): Promise<TypeInformation>;
}
export function createAnalyzer(type: AnalyzerType): Analyzer {
    switch (type) {
        case 'ts-morph':
            return {
                scanClasses,
                extractTypeInformation,
            };
        case 'regex':
            return {
                scanClasses: scanClassesRegex,
                extractTypeInformation: extractTypeInformationRegex,
            };
        default:
            throw new Error(`Unknown analyzer type: ${type}`);
    }
}

// src/core/file-scanner.ts
import * as fs from 'fs/promises';
import * as path from 'path';
export async function getAllTsFiles(dir: string, excludePatterns: RegExp[]): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await getAllTsFiles(fullPath, excludePatterns));
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            const shouldExclude = excludePatterns.some(pattern => pattern.test(entry.name));
            if (!shouldExclude) {
                files.push(fullPath);
            }
        }
    }
    return files;
}
export async function scanProject(projectDir: string): Promise<Map<string, string>> {
    const fileMap = new Map<string, string>();
    async function scanDirectory(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.ts')) {
                const fileName = path.basename(entry.name, '.ts');
                fileMap.set(fileName, fullPath);
            }
        }
    }
    await scanDirectory(projectDir);
    return fileMap;
}
// src/core/import-resolver.ts
import * as path from 'path';
export function resolveImportPath(outputPath: string, filePath: string, fileMap: Map<string, string>): string {
    const fileName = path.basename(filePath, '.ts');
    const sourceFilePath = fileMap.get(fileName);
    if (!sourceFilePath) {
        throw new Error(`File ${fileName} not found in project.`);
    }
    const relativePath = path.relative(path.dirname(outputPath), path.dirname(sourceFilePath));
    const importPath = path.join(relativePath, fileName).replace(/\\/g, '/');
    return importPath.startsWith('..') ? importPath : `./${importPath}`;
}
// src/core/project-analyzer.ts
import { Project, SourceFile } from 'ts-morph';
import chalk from 'chalk';
import { ClassInfo, MethodInfo } from '../interfaces/class-info.js';
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
        let imports = {};
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
            let overloadedMethodSignatures = {};
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

// src/core/type-extractor.ts
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
      return `[${type.getTupleElements().map(t => resolveType(t, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(', ')}]`;
    }
    if (type.isAnonymous()) {
      const properties = type.getProperties();
      if (properties.length > 0) {
        const props = properties.map(prop => {
          const declaration = prop.getDeclarations()[0];
          if (declaration && Node.isPropertySignature(declaration)) {
            const name = prop.getName();
            const propType = declaration.getType();
            return `${name}${declaration.hasQuestionToken() ? "?" : ""}: ${resolveType(propType, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)}`;
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
    return type.getUnionTypes().map(t => resolveType(t, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(" | ");
  }
  if (type.isIntersection()) {
    return type.getIntersectionTypes().map(t => resolveType(t, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap)).join(" & ");
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
            collectImports(argType.getSymbol()!.getDeclarations()[0], imports!, project!, outputPath!, scanPath!, fileMap!);
          }
          return resolveType(argType, node, logLevel, typeChecker, imports, project, outputPath, scanPath, fileMap);
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

// src/index.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import { ClassInfo } from './interfaces/class-info';
import { TypeInformation, MethodSignature } from './interfaces/type-information';
import { createRegexPatterns } from './utils/regex-utils';
import { getAllTsFiles, scanProject } from './core/file-scanner';
import { Project } from 'ts-morph';
import { AnalyzerType, createAnalyzer } from './core/analyzer-factory';
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
  options: { scanPath: string, excludeFiles?: string[], returnType?: string, logLevel?: 'silent' | 'info' | 'debug', resolver?: AnalyzerType },
  outputPath: string,
) {
  try {
    const excludePatterns = createRegexPatterns(options.excludeFiles);
    const tsFiles = await getAllTsFiles(options.scanPath, excludePatterns);
    if (options.logLevel === 'info' || options.logLevel === 'debug') console.log(chalk.yellow(`[NATS] Found ${tsFiles.length} TypeScript files to process`));
    const fileMap = await scanProject(options.scanPath);
    const analyzerType = options.resolver || 'regex';
    const analyzer = createAnalyzer(analyzerType);
    const classInfos = await analyzer.scanClasses(options.scanPath, tsFiles);
    const typeInfo = await analyzer.extractTypeInformation(
      options.scanPath,
      tsFiles,
      outputPath,
      fileMap
    );
    const project = new Project();
    project.addSourceFilesAtPaths(tsFiles);
    const interfaceString = generateInterfaceString(classInfos, typeInfo, options.returnType || 'raw', project);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, interfaceString, "utf-8");
  } catch (error) {
    console.error(chalk.red.bold('[NATS] Error generating exposed methods types:'));
    console.error(chalk.red(error));
    throw error;
  }
}

// src/interfaces/class-info.ts
export interface MethodInfo {
    methodName: string;
}
export interface ClassInfo {
    className: string;
    methods: MethodInfo[];
}
// src/interfaces/type-information.ts
import { Type } from 'ts-morph';
export interface TypeParameter {
  name: string;
  constraint?: string;
}
export interface MethodParameter {
  name: string;
  type: string;
  optional: boolean;
}
export interface MethodSignature {
  name: string;
  typeParameters: TypeParameter[];
  parameters: MethodParameter[];
  returnType: string;
}
export interface TypeInformation {
  imports: Set<string>;
  methodSignatures: Map<string, Map<string, MethodSignature[]>>;
  localInterfaces: Set<string>;
}

// src/utils/logger.ts
import chalk from 'chalk';
export type LogLevel = 'silent' | 'info' | 'debug';
export class Logger {
    private static instance: Logger;
    private currentLevel: LogLevel = 'silent';
    private constructor() { }
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }
    debug(message: string): void {
        if (this.currentLevel === 'debug') {
            console.log(chalk.gray(`[DEBUG] ${message}`));
        }
    }
    info(message: string): void {
        if (this.currentLevel === 'info' || this.currentLevel === 'debug') {
            console.log(message);
        }
    }
    success(message: string): void {
        if (this.currentLevel !== 'silent') {
            console.log(chalk.green(message));
        }
    }
    error(message: string): void {
        console.error(chalk.red(message));
    }
}
export const logger = Logger.getInstance();

// src/utils/regex-utils.ts
export function createRegexPatterns(excludeFiles?: string[]): RegExp[] {
    if (!excludeFiles) return [];
    return excludeFiles.map(pattern => {
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
        return new RegExp(regexPattern);
    });
}
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "exclude": ["test", "dist", "scripts"],
  "compilerOptions": {
    "declaration": true,
    "outDir": "./dist"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "lib": ["ESNext"],
    "types": ["bun-types"]
  },
  "include": ["src*.ts", "scripts*.ts"],
  "exclude": ["node_modules"]
}

