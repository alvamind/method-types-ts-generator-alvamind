import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test6: TestCase = {
  id: 'test6',
  description: 'Method with optional parameters',
  input: {
    fileName: 'temp.ts',
    content: `
           export class MyClass {
               myMethod(input?: string): void {}
           }
       `,
  },
  output: {
    outputFileName: 'test6.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input\?\s*:\s*string\s*\):\s*void/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test6.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      const parameters = methodSignature.getParameters();
      if (parameters.length !== 1) return { passed: false, message: `Expected 1 parameter, but found ${parameters.length}` };
      const firstParameter = parameters[0];
      if (!firstParameter.isOptional()) return { passed: false, message: `Expected optional parameter, but found non optional parameter` };
      if (firstParameter.getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string, but found ${firstParameter.getType().getText()}` };
      if (methodSignature.getReturnType().getText() !== 'void') return { passed: false, message: `Expected return type void, but found ${methodSignature.getReturnType().getText()}` };

      return { passed: true };
    }
  },
};
