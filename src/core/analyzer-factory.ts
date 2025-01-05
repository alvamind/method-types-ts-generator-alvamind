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
