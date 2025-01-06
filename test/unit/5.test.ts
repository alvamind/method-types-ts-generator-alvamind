import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test5: TestCase = {
  id: 'test5',
  description: 'Method with generics parameter',
  input: {
    fileName: 'temp.ts',
    content: `
        export interface MyData<T> {
           data: T;
        }
           export class MyClass {
                myMethod<T>(input: T): MyData<T> { return {data: input}}
            }
        `,
  },
  output: {
    outputFileName: 'test5.d.ts',
    assertions: (output) => {
      expect(output).toContain(`import { MyData } from '../test-files/test5/temp'`);
      expect(output).toMatch(/myMethod.*\(\s*input:\s*T\s*\).*MyData\s*<\s*T\s*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test5.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      const parameters = methodSignature.getParameters();
      if (parameters.length !== 1) return { passed: false, message: `Expected 1 parameter, but found ${parameters.length}` };
      const firstParameter = parameters[0];
      if (firstParameter.getType().getText() !== 'T') return { passed: false, message: `Expected type T, but found ${firstParameter.getType().getText()}` };
      if (!methodSignature.getReturnType().getText().includes('MyData<T>')) return { passed: false, message: `Expected return type MyData<T>, but found ${methodSignature.getReturnType().getText()}` };
      const typeParameters = methodSignature.getTypeParameters();
      if (typeParameters.length !== 1) return { passed: false, message: `Expected 1 type parameter, but found ${typeParameters.length}` };
      const firstTypeParameter = typeParameters[0];
      if (firstTypeParameter.getName() !== 'T') return { passed: false, message: `Expected type parameter T, but found ${firstTypeParameter.getName()}` };

      return { passed: true };
    }
  },
};
