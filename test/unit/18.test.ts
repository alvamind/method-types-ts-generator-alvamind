import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test18: TestCase = {
  id: 'test18',
  description: 'Overloaded methods',
  input: {
    fileName: 'temp.ts',
    content: `
export class MyClass {
  myMethod(input: string): string;
  myMethod(input: number): number;
  myMethod(input: string | number): string | number {
    return input;
  }
}
`,
  },
  output: {
    outputFileName: 'test18.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*string/);
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*number\s*\):\s*number/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test18.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignatures = property.getType().getApparentProperties().filter(prop => prop.getName() === 'myMethod').map(prop => prop.getValueDeclaration()) as MethodSignature[];
      if (methodSignatures.length !== 2) return { passed: false, message: `Expected 2 overloads for myMethod, but found ${methodSignatures.length}` };

      const firstOverload = methodSignatures[0];
      const secondOverload = methodSignatures[1];
      if (firstOverload.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter in first overload, but found ${firstOverload.getParameters().length}` };
      if (secondOverload.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter in second overload, but found ${secondOverload.getParameters().length}` };
      const firstParameterFirstOverload = firstOverload.getParameters()[0];
      const firstParameterSecondOverload = secondOverload.getParameters()[0];
      if (firstParameterFirstOverload.getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string in first overload, but found ${firstParameterFirstOverload.getType().getText()}` };
      if (firstOverload.getReturnType().getText() !== 'string') return { passed: false, message: `Expected return type string in first overload, but found ${firstOverload.getReturnType().getText()}` };
      if (firstParameterSecondOverload.getType().getText() !== 'number') return { passed: false, message: `Expected parameter type number in second overload, but found ${firstParameterSecondOverload.getType().getText()}` };
      if (secondOverload.getReturnType().getText() !== 'number') return { passed: false, message: `Expected return type number in second overload, but found ${secondOverload.getReturnType().getText()}` };

      return { passed: true };
    },
    assertType: "regex"
  },
};
