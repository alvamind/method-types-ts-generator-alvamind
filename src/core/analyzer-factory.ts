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
