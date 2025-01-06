// test/unit/31.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature, TypeParameterDeclaration, ParameterDeclaration } from "ts-morph";

export const test31: TestCase = {
  id: "test31",
  description: "Index Signatures",
  input: {
    fileName: "temp.ts",
    content: `
        export class MyClass {
            myMethod<T>(input: { [key: string]: number } | { [key: string]: T }): { [key: string]: number } | { [key: string]: T } { return input; }
        }
        `,
  },
  output: {
    outputFileName: "test31.d.ts",
    assertions: (output) => {
      expect(output).toMatch(
        /myMethod<T>\(input: { \[key: string]: number; } \| { \[key: string]: T; }\): { \[key: string]: number; } \| { \[key: string]: T; };/
      );
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test31.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };

      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) return { passed: false, message: 'MyClass property not found' };

      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) return { passed: false, message: 'myMethod method not found' };

      const typeParameters = myMethod.getTypeParameters();
      if (typeParameters.length !== 1) return { passed: false, message: `Expected 1 type parameter, but found ${typeParameters.length}` };
      if (typeParameters[0]?.getName() !== "T") return { passed: false, message: `Expected type parameter "T" , but found ${typeParameters[0]?.getName()}` };

      const parameters = myMethod.getParameters();
      if (parameters.length !== 1) return { passed: false, message: `Expected 1 parameter for myMethod, but found ${parameters.length}` };
      const parameterName = parameters[0]?.getName()
      if (parameterName !== 'input') return { passed: false, message: `Expected parameter name "input", but found "${parameterName}"` }

      const normalizeType = (type: string) => type
        .replace(/;\s*}/g, '}')  // remove optional semicolons before closing brace
        .replace(/\s+/g, ' ')    // normalize spaces
        .trim();

      const parameterType = parameters[0]?.getType().getText();
      const expectedParameterType = normalizeType(`{ [key: string]: number } | { [key: string]: T }`);
      const actualParameterType = normalizeType(parameterType);
      if (actualParameterType !== expectedParameterType) return { passed: false, message: `Expected parameter type '${expectedParameterType}' but got '${actualParameterType}'` };

      const returnType = myMethod.getReturnType().getText();
      const expectedReturnType = normalizeType(`{ [key: string]: number } | { [key: string]: T }`);
      const actualReturnType = normalizeType(returnType);
      if (actualReturnType !== expectedReturnType) return { passed: false, message: `Expected return type '${expectedReturnType}' but got '${actualReturnType}'` };

      return { passed: true };
    },
  },
};
