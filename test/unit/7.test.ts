import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test7: TestCase = {
  id: 'test7',
  description: 'Method with interface parameter',
  input: {
    fileName: 'temp.ts',
    content: `
                export interface User {
                    name: string;
                    email: string
                }
                export class MyClass {
                    myMethod(user: User): User { return user}
                }
            `,
  },
  output: {
    outputFileName: 'test7.d.ts',
    assertions: (output) => {
      expect(output).toContain(`import { User } from '../test-files/test7/temp'`);
      expect(output).toMatch(/myMethod\s*\(\s*user:\s*.*User\s*\):\s*.*User/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test7.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      const parameters = methodSignature.getParameters();
      if (parameters.length !== 1) return { passed: false, message: `Expected 1 parameter, but found ${parameters.length}` };
      const firstParameter = parameters[0];
      if (!firstParameter.getType().getText().includes('User')) return { passed: false, message: `Expected parameter type User, but found ${firstParameter.getType().getText()}` };
      if (!methodSignature.getReturnType().getText().includes('User')) return { passed: false, message: `Expected return type User, but found ${methodSignature.getReturnType().getText()}` };
      return { passed: true };
    }
  },
};
