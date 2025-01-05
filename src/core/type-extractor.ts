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

function resolveTypeText(type: Type, node: any, logLevel?: 'silent' | 'info' | 'debug'): string {
  const typeText = type.getText();
  if (logLevel === 'debug') console.log(chalk.yellow(`[DEBUG] Resolving type: ${typeText}`));

  // Handle utility types like Partial and Pick
  if (typeText.startsWith('Partial<') || typeText.startsWith('Pick<')) {
    if (logLevel === 'debug') console.log(chalk.blue(`[DEBUG] Detected utility type: ${typeText}`));
    const typeArguments = type.getTypeArguments();
    if (logLevel === 'debug') console.log(chalk.blue(`[DEBUG] Type arguments: ${typeArguments.length}`));

    if (typeArguments.length > 0) {
      const typeArgTexts = typeArguments.map(arg => {
        const argText = arg.getText(node, TypeFormatFlags.NoTruncation);
        if (logLevel === 'debug') console.log(chalk.blue(`[DEBUG] Type argument: ${argText}`));
        return argText;
      });
      const resolvedTypeText = typeText.replace(/<.*>/, `<${typeArgTexts.join(', ')}>`);
      if (logLevel === 'debug') console.log(chalk.green(`[DEBUG] Resolved utility type: ${resolvedTypeText}`));
      return resolvedTypeText;
    }
  }

  // Handle Promise types
  if (typeText.startsWith('Promise<')) {
    if (logLevel === 'debug') console.log(chalk.blue(`[DEBUG] Detected Promise type: ${typeText}`));
    const typeArguments = type.getTypeArguments();
    if (logLevel === 'debug') console.log(chalk.blue(`[DEBUG] Promise type arguments: ${typeArguments.length}`));

    if (typeArguments.length > 0) {
      const typeArgTexts = typeArguments.map(arg => {
        const argText = arg.getText(node, TypeFormatFlags.NoTruncation);
        if (logLevel === 'debug') console.log(chalk.blue(`[DEBUG] Promise type argument: ${argText}`));
        return argText;
      });
      const resolvedTypeText = `Promise<${typeArgTexts.join(', ')}>`;
      if (logLevel === 'debug') console.log(chalk.green(`[DEBUG] Resolved Promise type: ${resolvedTypeText}`));
      return resolvedTypeText;
    }
  }

  // Default case: return the type text
  if (logLevel === 'debug') console.log(chalk.green(`[DEBUG] Resolved type: ${typeText}`));
  return typeText;
}

export async function extractTypeInformation(
  scanPath: string,
  tsFiles: string[],
  outputPath: string,
  fileMap: Map<string, string>,
  logLevel?: 'silent' | 'info' | 'debug' // Add this parameter
): Promise<TypeInformation> {
  if (logLevel === 'info' || logLevel === 'debug') console.log(chalk.cyan(`[NATS] Extracting type information...`));

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
        if (logLevel === 'debug') console.log(chalk.magenta(`[DEBUG] Processing method: ${methodName}`));

        // Extract method parameters
        const params: { type: string; name: string; optional: boolean }[] = [];
        methodDeclaration.getParameters().forEach(parameter => {
          const paramType = parameter.getType();
          const typeText = resolveTypeText(paramType, parameter);
          if (logLevel === 'debug') console.log(chalk.magenta(`[DEBUG] Parameter: ${parameter.getName()}, Type: ${typeText}`));

          params.push({
            type: typeText,
            name: parameter.getName(),
            optional: parameter.isOptional()
          });

          collectImports(parameter.getType().getSymbol()?.getDeclarations()?.[0], typeInfo.imports, project, outputPath, scanPath, fileMap);
        });
        methodParams.set(methodName, params);

        // Extract method return type
        const returnType = methodDeclaration.getReturnType();
        const returnTypeText = resolveTypeText(returnType, methodDeclaration);
        if (logLevel === 'debug') console.log(chalk.magenta(`[DEBUG] Return type: ${returnTypeText}`));

        methodReturns.set(methodName, returnTypeText);

        // Collect imports for return type
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

  if (logLevel === 'info' || logLevel === 'debug') console.log(chalk.cyan(`[NATS] Finished extracting type information`));
  return typeInfo;
}
