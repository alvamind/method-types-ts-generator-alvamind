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
  "version": "1.0.0",
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
    "source": "generate-source output=source.md exclude=dist/,README.md,nats-rpc.test.ts,rpc-nats-alvamind-1.0.0.tgz,.gitignore",
    "dev": "bun run src/index.ts --watch",
    "build": "tsc && tsc -p tsconfig.build.json",
    "clean": "rimraf dist && clean",
    "commit": "commit",
    "split-code": "split-code source=combined.ts markers=src/,lib/ outputDir=./output",
    "publish-npm": "publish-npm patch"
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
    "alvamind-tools": "^1.0.16",
    "chalk": "4.1.2",
    "ts-morph": "^25.0.0",
    "type-fest": "^4.31.0",
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
  return options as CliOptions;
}
async function main() {
  console.log(chalk.blue.bold('\n=== Method Types Generator ==='));
  try {
    const options = parseArgs();
    console.log(chalk.cyan('Configuration:'));
    console.log(chalk.gray(`Target Directory: ${options.targetDir}`));
    console.log(chalk.gray(`Exclude Patterns: ${options.excludeFiles?.join(', ') || 'none'}`));
    console.log(chalk.gray(`Output File: ${options.outputFile}`));
    console.log(chalk.gray(`Return Type: ${options.returnType}\n`));
    await generateExposedMethodsType(
      {
        scanPath: options.targetDir,
        excludeFiles: options.excludeFiles,
        returnType: options.returnType,
      },
      options.outputFile,
    );
    console.log(chalk.green.bold(`\n✓ Successfully generated type definitions`));
    console.log(chalk.gray(`Output: ${path.resolve(options.outputFile)}\n`));
  } catch (error) {
    console.error(chalk.red.bold('\nError generating type definitions:'));
    console.error(chalk.red(error));
    process.exit(1);
  }
}
main();

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
    console.log(chalk.cyan(`[NATS] Scanning classes in ${scanPath}`));
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
                console.log(chalk.cyan(`[NATS] Found method: ${chalk.bold(methodName)} in class ${chalk.bold(className)}`));
                methods.push({ methodName });
            });
            classInfos.push({ className, methods });
        });
    }
    console.log(chalk.yellow(`[NATS] Found ${classInfos.length} classes with methods`));
    return classInfos;
}
// src/core/type-extractor.ts
import { Project, Type, TypeFormatFlags } from 'ts-morph';
import { TypeInformation } from '../interfaces/type-information';
import { resolveImportPath } from './import-resolver';
import chalk from 'chalk';
import * as path from 'path';
async function collectImports(
  declaration: any,
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
function resolveTypeText(type: Type, node: any): string {
  const typeText = type.getText();
  console.log(chalk.yellow(`[DEBUG] Resolving type: ${typeText}`));
  if (typeText.startsWith('Partial<') || typeText.startsWith('Pick<')) {
    console.log(chalk.blue(`[DEBUG] Detected utility type: ${typeText}`));
    const typeArguments = type.getTypeArguments();
    console.log(chalk.blue(`[DEBUG] Type arguments: ${typeArguments.length}`));
    if (typeArguments.length > 0) {
      const typeArgTexts = typeArguments.map(arg => {
        const argText = arg.getText(node, TypeFormatFlags.NoTruncation);
        console.log(chalk.blue(`[DEBUG] Type argument: ${argText}`));
        return argText;
      });
      const resolvedTypeText = typeText.replace(/<.*>/, `<${typeArgTexts.join(', ')}>`);
      console.log(chalk.green(`[DEBUG] Resolved utility type: ${resolvedTypeText}`));
      return resolvedTypeText;
    }
  }
  if (typeText.startsWith('Promise<')) {
    console.log(chalk.blue(`[DEBUG] Detected Promise type: ${typeText}`));
    const typeArguments = type.getTypeArguments();
    console.log(chalk.blue(`[DEBUG] Promise type arguments: ${typeArguments.length}`));
    if (typeArguments.length > 0) {
      const typeArgTexts = typeArguments.map(arg => {
        const argText = arg.getText(node, TypeFormatFlags.NoTruncation);
        console.log(chalk.blue(`[DEBUG] Promise type argument: ${argText}`));
        return argText;
      });
      const resolvedTypeText = `Promise<${typeArgTexts.join(', ')}>`;
      console.log(chalk.green(`[DEBUG] Resolved Promise type: ${resolvedTypeText}`));
      return resolvedTypeText;
    }
  }
  console.log(chalk.green(`[DEBUG] Resolved type: ${typeText}`));
  return typeText;
}
export async function extractTypeInformation(
  scanPath: string,
  tsFiles: string[],
  outputPath: string,
  fileMap: Map<string, string>
): Promise<TypeInformation> {
  console.log(chalk.cyan(`[NATS] Extracting type information...`));
  const project = new Project();
  project.addSourceFilesAtPaths(tsFiles);
  const typeInfo: TypeInformation = {
    imports: new Set<string>(),
    methodParams: new Map(),
    methodReturns: new Map(),
    localInterfaces: new Set<string>(),
  };
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.getClasses().forEach(classDeclaration => {
      const className = classDeclaration.getName();
      if (!className) return;
      const methodParams = new Map<string, { type: string; name: string; optional: boolean }[]>();
      const methodReturns = new Map<string, string>();
      classDeclaration.getMethods().forEach(methodDeclaration => {
        const methodName = methodDeclaration.getName();
        console.log(chalk.magenta(`[DEBUG] Processing method: ${methodName}`));
        const params: { type: string; name: string; optional: boolean }[] = [];
        methodDeclaration.getParameters().forEach(parameter => {
          const paramType = parameter.getType();
          const typeText = resolveTypeText(paramType, parameter);
          console.log(chalk.magenta(`[DEBUG] Parameter: ${parameter.getName()}, Type: ${typeText}`));
          params.push({
            type: typeText,
            name: parameter.getName(),
            optional: parameter.isOptional()
          });
          collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
        });
        methodParams.set(methodName, params);
        const returnType = methodDeclaration.getReturnType();
        const returnTypeText = resolveTypeText(returnType, methodDeclaration);
        console.log(chalk.magenta(`[DEBUG] Return type: ${returnTypeText}`));
        methodReturns.set(methodName, returnTypeText);
        const returnTypeSymbol = returnType.getSymbol();
        if (returnTypeSymbol && returnTypeSymbol.getName() === "Promise") {
          returnType.getTypeArguments().forEach(typeArg => {
            collectImports(typeArg.getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
          });
        } else {
          collectImports(returnTypeSymbol?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
        }
      });
      typeInfo.methodParams.set(className, methodParams);
      typeInfo.methodReturns.set(className, methodReturns);
    });
  }
  console.log(chalk.cyan(`[NATS] Finished extracting type information`));
  return typeInfo;
}

// src/index.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import { ClassInfo } from './interfaces/class-info';
import { TypeInformation } from './interfaces/type-information';
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
        const methodParams = typeInfo.methodParams.get(className);
        const methodReturns = typeInfo.methodReturns.get(className);
        methods.forEach(method => {
            const params = methodParams?.get(method.methodName) || [];
            let returnTypeString = methodReturns?.get(method.methodName) || "any";
            returnTypeString = returnTypeString.replace(/import\([^)]+\)\./g, '');
            const genericParams = method.methodName.match(/<[^>]+>/);
            const genericParamsString = genericParams ? genericParams[0] : '';
            const paramString = params
                .map(p => `${p.name}${p.optional ? "?" : ""}: ${p.type.replace(/import\([^)]+\)\./g, '')}`)
                .join(", ");
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
            output += `    ${method.methodName}${genericParamsString}(${paramString}): ${returnTypeOutput};\n`;
        });
        output += "  };\n";
    });
    output += "}\n";
    return output;
}
export async function generateExposedMethodsType(
    options: { scanPath: string, excludeFiles?: string[], returnType?: string },
    outputPath: string,
) {
    try {
        const excludePatterns = createRegexPatterns(options.excludeFiles);
        const tsFiles = await getAllTsFiles(options.scanPath, excludePatterns);
        console.log(chalk.yellow(`[NATS] Found ${tsFiles.length} TypeScript files to process`));
        const project = new Project();
        project.addSourceFilesAtPaths(tsFiles);
        const fileMap = await scanProject(options.scanPath);
        const typeInfo = await extractTypeInformation(options.scanPath, tsFiles, outputPath, fileMap);
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

// src/interfaces/class-info.ts
export interface MethodInfo {
    methodName: string;
}
export interface ClassInfo {
    className: string;
    methods: MethodInfo[];
}
// src/interfaces/type-information.ts
export interface TypeInformation {
    imports: Set<string>;
    methodParams: Map<string, Map<string, { type: string; name: string; optional: boolean }[]>>;
    methodReturns: Map<string, Map<string, string>>;
    localInterfaces: Set<string>;
}
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
beforeAll(async () => {
  await fs.mkdir(testDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
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
  test('Test Case 1: Basic class with no methods', async () => {
    const input = `
            export class MyClass {}
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test1.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain('export interface ExposedMethods');
    expect(output).toContain('MyClass: {');
  });
  test('Test Case 2: Class with single method', async () => {
    const input = `
            export class MyClass {
                myMethod(input: string): string { return input}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test2.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*string/);
  });
  test('Test Case 3: Class with method and primitive return type', async () => {
    const input = `
            export class MyClass {
                myMethod(): number { return 1}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test3.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/myMethod\s*\(\s*\):\s*number/);
  });
  test('Test Case 4: Method with Promise return type', async () => {
    const input = `
          export interface MyData<T> {
             data: T;
          }
            export class MyClass {
                async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input});}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test4.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\).*MyData\s*<\s*string\s*>/);
  });
  test('Test Case 5: Method with generics parameter', async () => {
    const input = `
        export interface MyData<T> {
           data: T;
        }
           export class MyClass {
                myMethod<T>(input: T): MyData<T> { return {data: input}}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test5.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod.*\(\s*input:\s*T\s*\).*MyData\s*<\s*T\s*>/);
  });
  test('Test Case 6: Method with optional parameters', async () => {
    const input = `
           export class MyClass {
               myMethod(input?: string): void {}
           }
       `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test6.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/myMethod\s*\(\s*input\?\s*:\s*string\s*\):\s*void/);
  });
  test('Test Case 7: Method with interface parameter', async () => {
    const input = `
                export interface User {
                    name: string;
                    email: string
                }
                export class MyClass {
                    myMethod(user: User): User { return user}
                }
            `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test7.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { User } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*user:\s*.*User\s*\):\s*.*User/);
  });
  test('Test Case 8: Method with Promise return type and promise return type option', async () => {
    const input = `
            export interface MyData<T> {
               data: T;
            }
              export class MyClass {
                   async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
              }
          `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test8.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'promise' }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*Promise\s*<.*MyData\s*<\s*string\s*>.*>/);
  });
  test('Test Case 9: Method with Promise return type and raw return type option', async () => {
    const input = `
        export interface MyData<T> {
           data: T;
        }
          export class MyClass {
               async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
           }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test9.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'raw' }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\).*MyData\s*<\s*string\s*>/);
  });
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
  test('Test Case 11: Class with method that has multi generics parameter and raw return type', async () => {
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
    const outputFile = path.join(outputDir, 'test11.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'raw' }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod.*\(\s*input:\s*T,\s*option:\s*K\s*\).*MyData\s*<.*input:\s*T.*option:\s*K.*>/);
  });
  test('Test Case 12: Multiple classes in different files with shared interfaces', async () => {
    const userService = `
      export interface User {
        id: number;
        name: string;
        email: string;
      }
      export class UserService {
        async getUser(id: number): Promise<User> {
          return { id, name: 'John', email: 'john@example.com' };
        }
        getUsers(): User[] {
          return [{ id: 1, name: 'John', email: 'john@example.com' }];
        }
      }
    `;
    const authService = `
      import { User } from './user.service';
      export class AuthService {
        login(username: string, password: string): Promise<string> {
          return Promise.resolve("token");
        }
        getLoggedInUser(): Promise<User> {
          return Promise.resolve({ id: 1, name: 'John', email: 'john@example.com' });
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'user.service.ts'), userService, 'utf-8');
    await fs.writeFile(path.join(testDir, 'auth.service.ts'), authService, 'utf-8');
    const outputFile = path.join(outputDir, 'test12.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { User } from '../test-files/user.service'`);
    expect(output).toMatch(/UserService:\s*{[^}]*getUser\s*\(\s*id:\s*number\s*\):\s*User/);
    expect(output).toMatch(/getUsers\s*\(\s*\):\s*User\[\]/);
    expect(output).toMatch(/AuthService:\s*{[^}]*login\s*\(\s*username:\s*string,\s*password:\s*string\s*\):\s*string/);
    expect(output).toMatch(/getLoggedInUser\s*\(\s*\):\s*User/);
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
  test('Test Case 14: Handling of Partial and other utility types', async () => {
    const input = `
      export interface User {
        id: number;
        name: string;
        email: string;
      }
      export class UserService {
        async updateUser(id: number, partialUser: Partial<User>): Promise<User> {
          return Promise.resolve({ id: 1, name: 'John', email: 'john@example.com' });
        }
        getFilteredUsers(filter: Pick<User, 'name' | 'email'>): User[] {
          return [{ id: 1, name: 'John', email: 'john@example.com' }];
        }
      }
    `;
    await fs.writeFile(path.join(testDir, 'user-update.service.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test14.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/updateUser\s*\(\s*id:\s*number,\s*partialUser:\s*Partial\s*<\s*User\s*>\)/);
    expect(output).toMatch(/getFilteredUsers\s*\(\s*filter:\s*Pick\s*<\s*User,\s*['"]name['"]\s*\|\s*['"]email['"]\s*>\)/);
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

