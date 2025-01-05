# Project: method-types-ts-generator-alvamind

dist
scripts
src
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
    "clean": "rimraf dist",
    "prebuild": "npm run clean"
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
    "typescript": "^5.7.2"
  },
  "devDependencies": {
    "@types/node": "^20.17.11",
    "bun-types": "^1.1.42",
    "rimraf": "^5.0.10"
  }
}

// scripts/generate-type-cli.ts
#!/usr/bin/env bun
import 'reflect-metadata';
import { generateExposedMethodsType } from '../src/generate-exposed-types';
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

// src/generate-exposed-types.ts
import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { Project, SourceFile, ClassDeclaration, MethodDeclaration, Type, ParameterDeclaration, TypeAliasDeclaration, InterfaceDeclaration, Symbol, SyntaxKind } from 'ts-morph';
interface TypeInformation {
  imports: Set<string>;
  methodParams: Map<string, Map<string, { type: string; name: string; optional: boolean }[]>>;
  methodReturns: Map<string, Map<string, string>>;
  localInterfaces: Set<string>;
}
interface MethodInfo {
  methodName: string;
}
interface ClassInfo {
  className: string;
  methods: MethodInfo[];
}
function createRegexPatterns(excludeFiles?: string[]): RegExp[] {
  if (!excludeFiles) return [];
  return excludeFiles.map(pattern => {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    return new RegExp(regexPattern);
  });
}
async function getAllTsFiles(dir: string, excludePatterns: RegExp[]): Promise<string[]> {
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
async function scanClasses(scanPath: string, tsFiles: string[]): Promise<ClassInfo[]> {
  console.log(chalk.cyan(`[NATS] Scanning classes in ${scanPath}`));
  const project = new Project();
  project.addSourceFilesAtPaths(tsFiles);
  const classInfos: ClassInfo[] = [];
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.getClasses().forEach(classDeclaration => {
      const className = classDeclaration.getName();
      if (!className) return
      const methods: MethodInfo[] = [];
      classDeclaration.getMethods().forEach(methodDeclaration => {
        const methodName = methodDeclaration.getName();
        console.log(chalk.cyan(`[NATS] Found method: ${chalk.bold(methodName)} in class ${chalk.bold(className)}`));
        methods.push({ methodName });
      });
      if (methods.length > 0) {
        classInfos.push({ className, methods });
      }
    });
  }
  console.log(chalk.yellow(`[NATS] Found ${classInfos.length} classes with methods`));
  return classInfos;
}
async function extractTypeInformation(scanPath: string, tsFiles: string[], outputPath: string): Promise<TypeInformation> {
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
      const className = classDeclaration.getName()
      if (!className) return;
      const methodParams = new Map<string, { type: string; name: string; optional: boolean }[]>();
      const methodReturns = new Map<string, string>();
      classDeclaration.getMethods().forEach(methodDeclaration => {
        const methodName = methodDeclaration.getName();
        const params: { type: string; name: string; optional: boolean }[] = [];
        methodDeclaration.getParameters().forEach(parameter => {
          const paramType = parameter.getType();
          params.push({
            type: paramType.getText(),
            name: parameter.getName(),
            optional: parameter.isOptional()
          });
          collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, tsFiles);
        })
        methodParams.set(methodName, params);
        const returnType = methodDeclaration.getReturnType();
        methodReturns.set(methodName, returnType.getText());
        const returnTypeSymbol = returnType.getSymbol();
        if (returnTypeSymbol && returnTypeSymbol.getName() === "Promise") {
          returnType.getTypeArguments().forEach(typeArg => {
            collectImports(typeArg.getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, tsFiles);
          })
        }
        else {
          collectImports(returnTypeSymbol?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, tsFiles);
        }
      });
      typeInfo.methodParams.set(className, methodParams);
      typeInfo.methodReturns.set(className, methodReturns);
    });
  }
  console.log(chalk.cyan(`[NATS] Finished extracting type information`));
  return typeInfo;
}
function collectImports(declaration: any, imports: Set<string>, project: Project, outputPath: string, scanPath: string, tsFiles: string[]) {
  if (!declaration) {
    return;
  }
  const symbol = declaration.getSymbol();
  if (symbol) {
    const typeName = symbol.getName();
    const declarations = symbol.getDeclarations()
    if (declarations && declarations.length > 0) {
      const sourceFile = declarations[0].getSourceFile();
      if (sourceFile) {
        if (sourceFile.getFilePath().includes("node_modules/typescript/lib") ||
          ["Promise", "Partial", "Omit", "Pick", "Record", "Exclude", "Extract"].includes(typeName)
        ) {
          return;
        }
        const modulePath = sourceFile.getFilePath();
        const relativePath = path.relative(path.dirname(outputPath), modulePath).replace(/\.ts$/, "");
        if (!Array.from(imports).some(imp => imp.includes(`{ ${typeName} }`))) {
          imports.add(`import { ${typeName} } from '${relativePath}';`);
        }
      }
    }
  }
  if (declaration.getType && declaration.getType().getTypeArguments) {
    declaration.getType().getTypeArguments().forEach((typeArg: Type) => {
      collectImports(typeArg.getSymbol()?.getDeclarations()?.[0], imports, project, outputPath, scanPath, tsFiles)
    })
  }
}
function generateInterfaceString(classInfos: ClassInfo[], typeInfo: TypeInformation, returnType: string): string {
  let output = "// Auto-generated by rpc-nats-alvamind\n\n";
  if (typeInfo.imports.size > 0) {
    output += Array.from(typeInfo.imports).join("\n") + "\n\n";
  }
  output += "export interface ExposedMethods {\n";
  for (const classInfo of classInfos) {
    output += `  ${classInfo.className}: {\n`;
    const methodParams = typeInfo.methodParams.get(classInfo.className);
    const methodReturns = typeInfo.methodReturns.get(classInfo.className);
    for (const method of classInfo.methods) {
      const params = methodParams?.get(method.methodName) || [];
      const returnTypeString = methodReturns?.get(method.methodName) || "any";
      const paramString = params.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ");
      let returnTypeOutput: string
      switch (returnType) {
        case 'promise':
          returnTypeOutput = `Promise<${returnTypeString}>`
          break;
        case 'observable':
          returnTypeOutput = `Observable<${returnTypeString}>`
          break
        default:
          returnTypeOutput = returnTypeString
          break;
      }
      output += `    ${method.methodName}(${paramString}): ${returnTypeOutput};\n`;
    }
    output += "  };\n";
  }
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
    const typeInfo = await extractTypeInformation(options.scanPath, tsFiles, outputPath);
    const classInfos = await scanClasses(options.scanPath, tsFiles);
    const interfaceString = generateInterfaceString(classInfos, typeInfo, options.returnType || 'raw');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, interfaceString, "utf-8");
  } catch (error) {
    console.error(chalk.red.bold('[NATS] Error generating exposed methods types:'));
    console.error(chalk.red(error));
    throw error
  }
}

// src/index.ts
export { generateExposedMethodsType, generateTypeCli } from './generate-exposed-types';

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

