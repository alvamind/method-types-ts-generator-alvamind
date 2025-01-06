// test/unit/28.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature, InterfaceDeclaration, TypeParameterDeclaration, ParameterDeclaration } from "ts-morph";

export const test28: TestCase = {
  id: 'test28',
  description: 'Complex Union Type with multiple imported types',
  input: {
    fileName: 'temp.ts',
    content: `
           interface TypeA { a: string }
           interface TypeB { b: number }
         export class MyClass {
             myMethod(input: string | number | TypeA | TypeB): string | number | TypeA | TypeB { return input; }
         }
         `,
  },
  output: {
    outputFileName: 'test28.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\|\s*number\s*\|\s*TypeA\s*\|\s*TypeB\s*\)\s*:\s*string\s*\|\s*number\s*\|\s*TypeA\s*\|\s*TypeB/);
      expect(output).toMatch(/import { TypeA } from '\.\.\/test-files\/test28\/temp';/);
      expect(output).toMatch(/import { TypeB } from '\.\.\/test-files\/test28\/temp';/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test28.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) {
        return { passed: false, message: 'ExposedMethods interface not found' };
      }
      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) {
        return { passed: false, message: 'MyClass property not found' };
      }
      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) {
        return { passed: false, message: 'myMethod method not found' };
      }

      const parameters = myMethod.getParameters();
      if (parameters.length !== 1) {
        return { passed: false, message: `Expected 1 parameter for myMethod, but found ${parameters.length}` };
      }
      const param = parameters[0] as ParameterDeclaration
      if (param.getType().getText() !== 'string | number | TypeA | TypeB') {
        return { passed: false, message: `Expected parameter type 'string | number | TypeA | TypeB' for myMethod, but found ${param.getType().getText()}` };
      }
      if (myMethod.getReturnType().getText() !== 'string | number | TypeA | TypeB') {
        return { passed: false, message: `Expected return type 'string | number | TypeA | TypeB' for myMethod, but found ${myMethod.getReturnType().getText()}` };
      }

      const sourceFile = project.getSourceFileOrThrow('test28.d.ts');
      const importDeclarations = sourceFile.getImportDeclarations();
      const import1 = importDeclarations.find(imp => imp.getModuleSpecifierValue() === "../test-files/test28/temp")
      const import2 = importDeclarations.find(imp => imp.getModuleSpecifierValue() === "../test-files/test28/temp")
      if (!import1) {
        return { passed: false, message: 'Import declaration for TypeA not found' };
      }
      if (!import2) {
        return { passed: false, message: 'Import declaration for TypeB not found' };
      }
      if (!import1.getNamedImports().find(imp => imp.getName() === 'TypeA')) {
        return { passed: false, message: 'Import specifier for TypeA not found' };
      }
      if (!import2.getNamedImports().find(imp => imp.getName() === 'TypeB')) {
        return { passed: false, message: 'Import specifier for TypeB not found' };
      }
      return { passed: true };
    }
  },
};
