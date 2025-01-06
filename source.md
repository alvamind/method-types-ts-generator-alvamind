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
  "version": "1.0.2",
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
    "source": "generate-source output=source.md exclude=dist/,README.md,.gitignore",
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
import * as path from 'path';
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
  if (!options.returnType) options.returnType = 'raw';
  if (!options.resolver) options.resolver = 'regex';
  if (!options.logLevel) options.logLevel = 'silent';
  return options as CliOptions;
}
async function main() {
  const options = parseArgs();
  if (options.logLevel !== 'silent') {
    console.log(chalk.blue.bold('\n=== Method Types Generator ==='));
    console.log(chalk.cyan('Configuration:'));
    console.log(chalk.gray(`Target Directory: ${options.targetDir}`));
    console.log(chalk.gray(`Exclude Patterns: ${options.excludeFiles?.join(', ') || 'none'}`));
    console.log(chalk.gray(`Output File: ${options.outputFile}`));
    console.log(chalk.gray(`Resolver: ${options.resolver}`));
    console.log(chalk.gray(`Return Type: ${options.returnType}\n`));
  }
  try {
    await generateExposedMethodsType(
      {
        scanPath: options.targetDir,
        excludeFiles: options.excludeFiles,
        returnType: options.returnType,
        logLevel: options.logLevel,
        resolver: options.resolver,
      },
      options.outputFile,
    );
    if (options.logLevel !== 'silent') {
      console.log(chalk.green.bold(`\n✓ Successfully generated type definitions`));
      console.log(chalk.gray(`Output: ${path.resolve(options.outputFile)}\n`));
    }
  } catch (error) {
    console.error(chalk.red.bold('\nError generating type definitions:'));
    console.error(chalk.red(error));
    process.exit(1);
  }
}
main();

// src/core/analyzer-factory.ts
import { ClassInfo } from '../interfaces/class-info';
import { TypeInformation } from '../interfaces/type-information';
import { ClassScanner } from './class-scanner';
import { TsMorphTypeExtractor } from './ts-morph-type-extractor';
import { RegexAnalyzer } from './regex-analyzer';
export type AnalyzerType = 'ts-morph' | 'regex';
export interface Analyzer {
  scanClasses(tsFiles: string[]): Promise<ClassInfo[]>;
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
        scanClasses: async (tsFiles: string[]) => {
          return new ClassScanner().scanClasses(tsFiles);
        },
        extractTypeInformation: async (scanPath: string, tsFiles: string[], outputPath: string, fileMap: Map<string, string>) => {
          return new TsMorphTypeExtractor().extractTypeInformation(scanPath, tsFiles, outputPath, fileMap);
        }
      };
    case 'regex':
      return new RegexAnalyzer();
    default:
      throw new Error(`Unknown analyzer type: ${type}`);
  }
}

// src/core/class-scanner.ts
import { Project, ClassDeclaration, MethodDeclaration } from 'ts-morph';
import { ClassInfo, MethodInfo } from '../interfaces/class-info';
export class ClassScanner {
    async scanClasses(tsFiles: string[]): Promise<ClassInfo[]> {
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

// src/core/regex-analyzer.ts
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
      const typeDefRegex = /export\s+(interface|type)\s+(\w+)(?:<[^>]*>)?[^;{]*{[^}]*}/g;
      let typeMatch;
      while ((typeMatch = typeDefRegex.exec(content)) !== null) {
        const typeName = typeMatch[2];
        console.log(chalk.magenta(`[DEBUG] Found type/interface: ${typeName}`));
        const importPath = resolveImportPath(outputPath, filePath, fileMap);
        typeInfo.imports.add(`import { ${typeName} } from '${importPath}';`);
        typeInfo.localInterfaces.add(typeName);
      }
      const classRegex = /export\s+(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?/g;
      let classMatch;
      while ((classMatch = classRegex.exec(content)) !== null) {
        const className = classMatch[1];
        const methodSignatures = new Map<string, MethodSignature[]>();
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
      .replace(/\s+/g, ' ')
      .replace(/Promise\s*<(.+)>/, '$1')
      .replace(/\s*([<>])\s*/g, '$1')
      .replace(/\s*,\s*/g, ', ');
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
    cleaned = cleaned.replace(/\s*=\s*[^,)]+/g, '');
    return cleaned;
  }
}

// src/core/ts-morph-type-extractor.ts
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
  for (const classInfo of classInfos) {
    const { className, methods } = classInfo;
    if (methods.length === 0) {
      output += `  ${className}: {};\n`;
      continue;
    }
    output += `  ${className}: {\n`;
    const methodSignatures = typeInfo.methodSignatures.get(className);
    if (methodSignatures) {
      for (const [methodName, signatures] of methodSignatures) {
        signatures.forEach(signature => {
          const typeParams = signature.typeParameters.length > 0
            ? `<${signature.typeParameters.map(tp =>
              `${tp.name}${tp.constraint ? ` extends ${tp.constraint}` : ''}`
            ).join(", ")}>`
            : "";
          const params = signature.parameters
            .map(p => `${p.name}${p.optional ? "?" : ""}: ${p.type}`)
            .join(", ");
          let returnTypeStr = signature.returnType;
          if (returnType === 'promise' && !returnTypeStr.startsWith('Promise<')) {
            returnTypeStr = `Promise<${returnTypeStr}>`;
          } else if (returnType === 'observable') {
            returnTypeStr = `Observable<${returnTypeStr.startsWith('Promise<')
              ? returnTypeStr.slice(8, -1)
              : returnTypeStr}>`;
          } else if (returnType === 'raw' && returnTypeStr.startsWith('Promise<')) {
            returnTypeStr = returnTypeStr.slice(8, -1);
          }
          output += `    ${signature.name}${typeParams}(${params}): ${returnTypeStr};\n`;
        });
      }
    }
    output += "  };\n";
  }
  output += "}\n";
  return output;
}
export async function generateExposedMethodsType(
  options: {
    scanPath: string,
    excludeFiles?: string[],
    returnType?: string,
    logLevel?: 'silent' | 'info' | 'debug',
    resolver?: AnalyzerType
  },
  outputPath: string,
) {
  try {
    const excludePatterns = createRegexPatterns(options.excludeFiles);
    const tsFiles = await getAllTsFiles(options.scanPath, excludePatterns);
    if (options.logLevel === 'info' || options.logLevel === 'debug') {
      console.log(chalk.yellow(`[NATS] Found ${tsFiles.length} TypeScript files to process`));
    }
    const fileMap = await scanProject(options.scanPath);
    const analyzerType = options.resolver || 'regex';
    const analyzer = createAnalyzer(analyzerType);
    const classInfos = await analyzer.scanClasses(tsFiles);
    if (options.logLevel === 'debug') {
      console.log(chalk.blue(`[DEBUG] Found classes:`), classInfos);
    }
    const typeInfo = await analyzer.extractTypeInformation(
      options.scanPath,
      tsFiles,
      outputPath,
      fileMap,
    );
    if (options.logLevel === 'debug') {
      console.log(chalk.blue(`[DEBUG] Extracted type information:`), typeInfo);
    }
    const project = new Project();
    project.addSourceFilesAtPaths(tsFiles);
    const interfaceString = generateInterfaceString(classInfos, typeInfo, options.returnType || 'raw', project);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, interfaceString, "utf-8");
    if (options.logLevel === 'info' || options.logLevel === 'debug') {
      console.log(chalk.green(`[NATS] Successfully generated types at ${outputPath}`));
    }
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
// test/main.test.ts
import { describe, test, beforeAll, afterAll, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateExposedMethodsType } from '../src';
const testDir = path.join(__dirname, 'test-files');
const outputDir = path.join(__dirname, 'output');
beforeEach(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
  await fs.mkdir(testDir, { recursive: true });
  await fs.writeFile(path.join(testDir, 'temp.ts'), '', 'utf-8');
});
afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
  await fs.rm(outputDir, { recursive: true, force: true });
});
describe('Type Generator Test Suite', () => {
  beforeEach(async () => {
    await fs.writeFile(path.join(testDir, 'temp.ts'), '', 'utf-8');
  });
  afterEach(async () => {
    await fs.rm(path.join(testDir, 'temp.ts'));
  })
  test('Test Case 10: Class with method that has multi generics parameter and return type', async () => {
    const input = `
           export interface MyData<T> {
                data: T,
           }
           export class MyClass {
                myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
                    return Promise.resolve({data: {input, option}})
                }
           }
       `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test10.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod.*\(\s*input:\s*T,\s*option:\s*K\s*\).*MyData\s*<.*input:\s*T.*option:\s*K.*>/);
  });
  test('Test Case 13: Complex service with different return type options', async () => {
    const input = `
      export interface MyData<T> {
        data: T;
        error?: string;
      }
      export class AiService {
        async process(input: string): Promise<MyData<string>> {
          return { data: input };
        }
        processWithOption<T>(input: T): Promise<MyData<T>> {
          return Promise.resolve({ data: input });
        }
        processWithMultiOption<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
          return Promise.resolve({ data: { input, option } });
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'ai.service.ts'), input, 'utf-8');
    const outputFileRaw = path.join(outputDir, 'test13-raw.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'raw' }, outputFileRaw);
    const outputRaw = await fs.readFile(outputFileRaw, 'utf-8');
    expect(outputRaw).toMatch(/process\s*\(\s*input:\s*string\s*\):\s*MyData\s*<\s*string\s*>/);
    expect(outputRaw).toMatch(/processWithOption\s*\(\s*input:\s*T\s*\):\s*MyData\s*<\s*T\s*>/);
    const outputFilePromise = path.join(outputDir, 'test13-promise.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'promise' }, outputFilePromise);
    const outputPromise = await fs.readFile(outputFilePromise, 'utf-8');
    expect(outputPromise).toMatch(/process.*:\s*Promise\s*<\s*MyData\s*<\s*string\s*>\s*>/);
    const outputFileObservable = path.join(outputDir, 'test13-observable.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'observable' }, outputFileObservable);
    const outputObservable = await fs.readFile(outputFileObservable, 'utf-8');
    expect(outputObservable).toMatch(/process.*:\s*Observable\s*<\s*MyData\s*<\s*string\s*>\s*>/);
  });
  test('Test Case 18: Complex nested generics', async () => {
    const input = `
      export interface MyData<T> {
        data: T;
      }
      export class MyClass {
        myMethod<T, K>(input: T, option: K): Promise<MyData<{ input: T; option: K; nested: MyData<K> }>> {
          return Promise.resolve({ data: { input, option, nested: { data: option } } });
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test18.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/myMethod\s*<\s*T,\s*K\s*>\s*\(\s*input:\s*T,\s*option:\s*K\s*\):\s*Promise\s*<\s*MyData\s*<\s*\{\s*input:\s*T;\s*option:\s*K;\s*nested:\s*MyData\s*<\s*K\s*>;\s*}\s*>\s*>/);
  });
  test('Test Case 21: Async/Await with complex return type', async () => {
    const input = `
      export interface Response<T> {
        status: number;
        data: T;
      }
      export class ApiService {
        async fetchData<T>(url: string): Promise<Response<T>> {
          const response = await fetch(url);
          return { status: response.status, data: await response.json() };
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test21.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/fetchData\s*<\s*T\s*>\s*\(\s*url:\s*string\s*\):\s*Promise\s*<\s*Response\s*<\s*T\s*>\s*>/);
  });
  test('Test Case 22: Readonly properties and methods', async () => {
    const input = `
      export class ConfigService {
        readonly apiUrl: string = "https://api.example.com";
        getConfig(): { apiUrl: string } {
          return { apiUrl: this.apiUrl };
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test22.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/getConfig\s*\(\s*\):\s*\{\s*apiUrl:\s*string;\s*\}/);
  });
  test('Test Case 23: Conditional types in method signatures', async () => {
    const input = `
      export type IsString<T> = T extends string ? true : false;
      export class TypeChecker {
        checkType<T>(input: T): IsString<T> {
          return (typeof input === "string") as IsString<T>;
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test23.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/checkType\s*<\s*T\s*>\s*\(\s*input:\s*T\s*\):\s*IsString\s*<\s*T\s*>/);
  });
  test('Test Case 25: Recursive types in method signatures', async () => {
    const input = `
      export interface TreeNode<T> {
        value: T;
        children: TreeNode<T>[];
      }
      export class TreeService {
        createTree<T>(value: T, children: TreeNode<T>[] = []): TreeNode<T> {
          return { value, children };
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test25.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/createTree\s*<\s*T\s*>\s*\(\s*value:\s*T,\s*children\?\s*:\s*TreeNode\s*<\s*T\s*>\[\]\s*\):\s*TreeNode\s*<\s*T\s*>/);
  });
});

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

