import { expect } from "bun:test";
import { TestCase } from "../test.interface";

export const test1: TestCase = {
  id: 'test1',
  description: 'Basic class with no methods',
  input: {
    fileName: 'temp.ts',
    content: 'export class MyClass {}',
  },
  output: {
    outputFileName: 'test1.d.ts',
    assertions: (output) => {
      expect(output).toContain('export interface ExposedMethods');
      expect(output).toContain('MyClass: {');
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test1.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      return { passed: true };
    }
  },
};