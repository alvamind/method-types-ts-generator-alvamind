import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test2: TestCase = {
  id: 'test2',
  description: 'Class with single method',
  input: {
    fileName: 'temp.ts',
    content: 'export class MyClass { myMethod(input: string): string { return input} }',
  },
  output: {
    outputFileName: 'test2.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*string/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test2.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      const parameters = methodSignature.getParameters();
      if (parameters.length !== 1) return { passed: false, message: `Expected 1 parameter, but found ${parameters.length}` };
      const firstParameter = parameters[0];
      if (firstParameter.getType().getText() !== 'string') return { passed: false, message: `Expected type string, but found ${firstParameter.getType().getText()}` };
      if (methodSignature.getReturnType().getText() !== 'string') return { passed: false, message: `Expected return type string, but found ${methodSignature.getReturnType().getText()}` };
      return { passed: true };
    }
  },
};
