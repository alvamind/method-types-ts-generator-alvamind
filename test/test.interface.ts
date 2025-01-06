import path from "path";
import { Project } from "ts-morph";

// --- Constants ---
export const baseTestDir = path.join(__dirname, 'test-files');
export const outputDir = path.join(__dirname, 'output');

// --- Interfaces ---
export interface TestCaseInput {
  fileName: string;
  content: string;
  options?: {
    returnType?: 'promise' | 'raw' | 'observable';
  };
}

export interface TsMorphAssertionResult {
  passed: boolean,
  message?: string
}

export type TsMorphAssertion = (project: Project, outputFile: string) => TsMorphAssertionResult

export interface TestCaseOutput {
  outputFileName: string;
  assertions: (output: string) => void;
  tsMorphAssertion?: TsMorphAssertion;
  assertType?: 'regex' | 'ts-morph' | 'both';
}

export interface TestCase {
  id: string;
  description: string;
  input: TestCaseInput;
  output: TestCaseOutput;
}
