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