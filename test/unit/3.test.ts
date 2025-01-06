import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test3: TestCase = {
  id: 'test3',
  description: 'Class with method and primitive return type',
  input: {
    fileName: 'temp.ts',
    content: 'export class MyClass { myMethod(): number { return 1} }',
  },
  output: {
    outputFileName: 'test3.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*\):\s*number/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test3.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      if (methodSignature.getParameters().length > 0) return { passed: false, message: `Expected 0 parameters, but found ${methodSignature.getParameters().length}` };
      if (methodSignature.getReturnType().getText() !== 'number') return { passed: false, message: `Expected return type number, but found ${methodSignature.getReturnType().getText()}` };

      return { passed: true };
    }
  },
};
