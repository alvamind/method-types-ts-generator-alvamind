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