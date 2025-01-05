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
          // collect import here
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
