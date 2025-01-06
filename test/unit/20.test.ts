import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test20: TestCase = {
  id: 'test18',
  description: 'Complex nested generics',
  input: {
    fileName: 'temp.ts',
    content: `
export interface MyData<T> {
data: T;
}

export class MyClass {
myMethod<T, K>(input: T, option: K): Promise<MyData<{ input: T; option: K; nested: MyData<K> }>> {
return Promise.resolve({ data: { input, option, nested: { data: option } } });
}
}
`,
  },
  output: {
    outputFileName: 'test18.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*<\s*T,\s*K\s*>\s*\(\s*input:\s*T,\s*option:\s*K\s*\):\s*Promise\s*<\s*MyData\s*<\s*\{\s*input:\s*T;\s*option:\s*K;\s*nested:\s*MyData\s*<\s*K\s*>;\s*}\s*>\s*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test18.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const property = interfaceDeclaration.getProperty('MyClass');
      if (!property) return { passed: false, message: 'MyClass property not found' };
      const methodSignature = property.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!methodSignature) return { passed: false, message: 'myMethod method not found' };
      const parameters = methodSignature.getParameters();
      if (parameters.length !== 2) return { passed: false, message: `Expected 2 parameter for myMethod, but found ${parameters.length}` };
      const firstParameter = parameters[0];
      const secondParameter = parameters[1];
      if (firstParameter.getType().getText() !== 'T') return { passed: false, message: `Expected parameter type T for myMethod, but found ${firstParameter.getType().getText()}` };
      if (secondParameter.getType().getText() !== 'K') return { passed: false, message: `Expected parameter type K for myMethod, but found ${secondParameter.getType().getText()}` };

      const returnType = methodSignature.getReturnType().getText();
      if (!returnType.includes('Promise<MyData<{ input: T; option: K; nested: MyData<K>; }>>')) return { passed: false, message: `Expected return type Promise<MyData<{ input: T; option: K; nested: MyData<K>; }>>, but found ${returnType}` };
      const typeParameters = methodSignature.getTypeParameters();
      if (typeParameters.length !== 2) return { passed: false, message: `Expected 2 type parameters, but found ${typeParameters.length}` };
      const firstTypeParameter = typeParameters[0];
      const secondTypeParameter = typeParameters[1];
      if (firstTypeParameter.getName() !== 'T') return { passed: false, message: `Expected type parameter T for myMethod, but found ${firstTypeParameter.getName()}` };
      if (secondTypeParameter.getName() !== 'K') return { passed: false, message: `Expected type parameter K for myMethod, but found ${secondTypeParameter.getName()}` };

      return { passed: true };
    }
  },
};
