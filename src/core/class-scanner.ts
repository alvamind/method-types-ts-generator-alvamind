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
