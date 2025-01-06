// test/unit/26.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test26: TestCase = {
  id: 'test26',
  description: 'Combined Literal Types',
  input: {
    fileName: 'temp.ts',
    content: `
        export class MyClass {
            myMethod(input: "on" | "off" | 1 | 2 | true | false): string | number | boolean { return input; }
        }
        `,
  },
  output: {
    outputFileName: 'test26.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*"on"\s*\|\s*"off"\s*\|\s*1\s*\|\s*2\s*\|\s*true\s*\|\s*false\s*\)\s*:\s*string\s*\|\s*number\s*\|\s*boolean/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test26.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };

      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) return { passed: false, message: 'MyClass property not found' };

      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) return { passed: false, message: 'myMethod method not found' };

      const param = myMethod.getParameters()[0];
      if (!param) return { passed: false, message: 'myMethod parameter not found' };
      const paramType = param.getType().getText();
      expect(paramType).toBe(`"on" | "off" | 1 | 2 | true | false`);


      const returnType = myMethod.getReturnType().getText()
      expect(returnType).toBe('string | number | boolean')

      return { passed: true };
    }
  },
};
