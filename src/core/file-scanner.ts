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