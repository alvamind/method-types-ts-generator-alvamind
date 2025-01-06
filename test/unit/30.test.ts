// test/unit/30.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test30: TestCase = {
  id: 'test30',
  description: 'Tuple with Optional and rest',
  input: {
    fileName: 'temp.ts',
    content: `
        export class MyClass {
          myMethod(input: [string, number?, ...boolean[]]): [string, number?, ...boolean[]] {
            return input;
          }
        }
        `,
  },
  output: {
    outputFileName: 'test30.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input\s*:\s*\[string,\s*number\?,\s*\.\.\.boolean\[\]\]\s*\)\s*:\s*\[string,\s*number\?,\s*\.\.\.boolean\[\]\]/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test30.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found.' };

      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) return { passed: false, message: 'MyClass property not found in ExposedMethods interface.' };

      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) return { passed: false, message: 'myMethod method not found in MyClass property.' };

      const parameters = myMethod.getParameters();
      if (parameters.length !== 1) return { passed: false, message: `Expected 1 parameter for myMethod, but found ${parameters.length}.` };

      const inputParameter = parameters[0];
      if (!inputParameter) return { passed: false, message: "Input parameter not found in the myMethod method." };

      const inputParameterType = inputParameter.getType().getText();
      if (inputParameterType !== "[string, number?, ...boolean[]]") {
        return { passed: false, message: `Expected parameter type "[string, number?, ...boolean[]]" for input parameter, but found "${inputParameterType}".` }
      }

      const returnType = myMethod.getReturnType().getText();
      if (returnType !== "[string, number?, ...boolean[]]") {
        return { passed: false, message: `Expected return type "[string, number?, ...boolean[]]" for myMethod, but found "${returnType}".` }
      }

      return { passed: true };
    },
  },
};
