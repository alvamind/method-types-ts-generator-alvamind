import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test19: TestCase = {
  id: 'test17',
  description: 'Class inheritance',
  input: {
    fileName: 'temp.ts',
    content: `
export class BaseClass {
baseMethod(): string {
return "base";
}
}

export class MyClass extends BaseClass {
myMethod(): string {
return "child";
}
}
`,
  },
  output: {
    outputFileName: 'test17.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/baseMethod\s*\(\s*\):\s*string/);
      expect(output).toMatch(/myMethod\s*\(\s*\):\s*string/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test17.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const baseClassProperty = interfaceDeclaration.getProperty('BaseClass');
      if (!baseClassProperty) return { passed: false, message: 'BaseClass property not found' };
      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) return { passed: false, message: 'MyClass property not found' };
      const baseMethod = baseClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'baseMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!baseMethod) return { passed: false, message: 'baseMethod method not found' };
      if (baseMethod.getParameters().length !== 0) return { passed: false, message: `Expected 0 parameter for baseMethod, but found ${baseMethod.getParameters().length}` };
      if (baseMethod.getReturnType().getText() !== 'string') return { passed: false, message: `Expected return type string for baseMethod, but found ${baseMethod.getReturnType().getText()}` };
      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) return { passed: false, message: 'myMethod method not found' };
      if (myMethod.getParameters().length !== 0) return { passed: false, message: `Expected 0 parameter for myMethod, but found ${myMethod.getParameters().length}` };
      if (myMethod.getReturnType().getText() !== 'string') return { passed: false, message: `Expected return type string for myMethod, but found ${myMethod.getReturnType().getText()}` };
      return { passed: true };
    }
  },
};
