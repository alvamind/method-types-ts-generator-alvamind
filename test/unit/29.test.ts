// test/unit/29.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature, InterfaceDeclaration, TypeAliasDeclaration } from "ts-morph";

export const test29: TestCase = {
  id: 'test29',
  description: 'Tuple Types',
  input: {
    fileName: 'temp.ts',
    content: `
      export class MyClass {
        myMethod(input: [string, number] | [string, number?]): [string, number] | [string, number?] {
          return input;
        }
      }
    `,
  },
  output: {
    outputFileName: 'test29.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*\[string,\s*number]\s*\|\s*\[string,\s*number\?]\s*\)\s*:\s*\[string,\s*number]\s*\|\s*\[string,\s*number\?]/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test29.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };

      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) return { passed: false, message: 'MyClass property not found' };

      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) return { passed: false, message: 'myMethod method not found' };


      const inputParameter = myMethod.getParameters()[0];
      if (!inputParameter) return { passed: false, message: 'Input parameter not found in myMethod' };

      const expectedType = '[string, number] | [string, number?]';

      if (inputParameter.getType().getText() !== expectedType) {
        return { passed: false, message: `Expected input parameter type to be "${expectedType}", but found "${inputParameter.getType().getText()}"` };
      }

      const returnType = myMethod.getReturnType().getText();
      if (returnType !== '[string, number] | [string, number?]') {
        return { passed: false, message: `Expected return type to be "[string, number] | [string, number?]", but got "${returnType}"` };
      }


      return { passed: true };
    }
  },
};
