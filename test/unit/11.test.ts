import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test11: TestCase = {
  id: 'test11',
  description: 'Class with method that has multi generics parameter and raw return type',
  input: {
    fileName: 'temp.ts',
    content: `
           export interface MyData<T> {
                data: T,
           }
           export class MyClass {
                myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
                    return Promise.resolve({data: {input, option}})
                }
           }
       `,
    options: { returnType: 'raw' },
  },
  output: {
    outputFileName: 'test11.d.ts',
    assertions: (output) => {
      expect(output).toContain(`import { MyData } from '../test-files/test11/temp'`);
      expect(output).toMatch(/myMethod.*\(\s*input:\s*T,\s*option:\s*K\s*\).*MyData\s*<.*input:\s*T.*option:\s*K.*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test11.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod not found' };
      const parameters = methodSignature.getParameters();
      if (parameters.length !== 2) return { passed: false, message: `Expected 2 parameters, but found ${parameters.length}` };
      const firstParameter = parameters[0];
      const secondParameter = parameters[1];
      if (firstParameter.getType().getText() !== 'T') return { passed: false, message: `Expected parameter type T, but found ${firstParameter.getType().getText()}` };
      if (secondParameter.getType().getText() !== 'K') return { passed: false, message: `Expected parameter type K, but found ${secondParameter.getType().getText()}` };
      if (!methodSignature.getReturnType().getText().includes('MyData<{ input: T; option: K; }>')) return { passed: false, message: `Expected return type MyData<{ input: T; option: K; }>, but found ${methodSignature.getReturnType().getText()}` };

      const typeParameters = methodSignature.getTypeParameters();
      if (typeParameters.length !== 2) return { passed: false, message: `Expected 2 type parameters, but found ${typeParameters.length}` };
      const firstTypeParameter = typeParameters[0];
      const secondTypeParameter = typeParameters[1];
      if (firstTypeParameter.getName() !== 'T') return { passed: false, message: `Expected type parameter T, but found ${firstTypeParameter.getName()}` };
      if (secondTypeParameter.getName() !== 'K') return { passed: false, message: `Expected type parameter K, but found ${secondTypeParameter.getName()}` };

      return { passed: true };
    }
  },
};
