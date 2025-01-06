import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test17: TestCase = {
  id: 'test15',
  description: 'Method with default parameters',
  input: {
    fileName: 'temp.ts',
    content: `
export class MyClass {
myMethod(input: string = "default"): string {
return input;
}
}
`,
  },
  output: {
    outputFileName: 'test15.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input\?\s*:\s*string\s*\):\s*string/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test15.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      if (methodSignature.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter, but found ${methodSignature.getParameters().length}` };
      const firstParameter = methodSignature.getParameters()[0];
      if (!firstParameter.isOptional()) return { passed: false, message: 'Expected parameter to be optional' };
      if (firstParameter.getType().getText() !== 'string') return { passed: false, message: `Expected parameter type to be string, but found ${firstParameter.getType().getText()}` };
      if (methodSignature.getReturnType().getText() !== 'string') return { passed: false, message: `Expected return type string, but found ${methodSignature.getReturnType().getText()}` };
      return { passed: true };
    }
  },
};
