import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test8: TestCase = {
  id: 'test8',
  description: 'Method with Promise return type and promise return type option',
  input: {
    fileName: 'temp.ts',
    content: `
            export interface MyData<T> {
               data: T;
            }
              export class MyClass {
                   async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
              }
          `,
    options: { returnType: 'promise' },
  },
  output: {
    outputFileName: 'test8.d.ts',
    assertions: (output) => {
      expect(output).toContain(`import { MyData } from '../test-files/test8/temp'`);
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*Promise\s*<.*MyData\s*<\s*string\s*>.*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test8.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      if (methodSignature.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter, but found ${methodSignature.getParameters().length}` };
      const firstParameter = methodSignature.getParameters()[0];
      if (firstParameter.getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string, but found ${firstParameter.getType().getText()}` };
      if (!methodSignature.getReturnType().getText().includes('Promise<MyData<string>>')) return { passed: false, message: `Expected return type Promise<MyData<string>>, but found ${methodSignature.getReturnType().getText()}` };
      return { passed: true };
    },
    assertType: "ts-morph"
  },
};
