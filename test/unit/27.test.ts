// test/unit/27.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { InterfaceDeclaration, MethodSignature, TypeAliasDeclaration, TypeParameterDeclaration } from "ts-morph";

export const test27: TestCase = {
  id: 'test27',
  description: 'Combined Union and Intersection Types',
  input: {
    fileName: 'temp.ts',
    content: `
      interface TypeA { a: string }
      interface TypeB { b: number }
    export class MyClass {
        myMethod(input: string | number | TypeA & TypeB): string | number | TypeA & TypeB { return input; }
    }
    `,
  },
  output: {
    outputFileName: 'test27.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/import { TypeA } from '.\/temp';/);
      expect(output).toMatch(/import { TypeB } from '.\/temp';/);
      expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\|\s*number\s*\|\s*TypeA\s*&\s*TypeB\s*\)\s*:\s*string\s*\|\s*number\s*\|\s*TypeA\s*&\s*TypeB/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test27.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) return { passed: false, message: 'MyClass property not found' };
      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) return { passed: false, message: 'myMethod method not found' };
      const inputParam = myMethod.getParameters()[0];
      if (!inputParam) return { passed: false, message: 'input parameter not found' };

      const normalizeType = (type: string) => type
        .replace(/\s+/g, ' ')  // normalize spaces
        .trim();

      const expectedReturnTypeText = normalizeType('string | number | TypeA & TypeB');
      const actualReturnTypeText = normalizeType(myMethod.getReturnType().getText());
      if (actualReturnTypeText !== expectedReturnTypeText) {
        return { passed: false, message: `Expected return type "${expectedReturnTypeText}", but got "${actualReturnTypeText}"` };
      }

      const expectedInputTypeText = normalizeType('string | number | TypeA & TypeB');
      const actualInputTypeText = normalizeType(inputParam.getType().getText());
      if (actualInputTypeText !== expectedInputTypeText) {
        return { passed: false, message: `Expected input type "${expectedInputTypeText}", but got "${actualInputTypeText}"` };
      }

      const importDeclarations = project.getSourceFileOrThrow('test27.d.ts')?.getImportDeclarations();
      if (!importDeclarations) return { passed: false, message: 'Import Declarations not found' }
      const importTypeA = importDeclarations.find(declaration => declaration.getModuleSpecifierValue() === './temp' && declaration.getNamedImports().find(imp => imp.getName() === 'TypeA'));
      if (!importTypeA) return { passed: false, message: 'Import TypeA not found' }
      const importTypeB = importDeclarations.find(declaration => declaration.getModuleSpecifierValue() === './temp' && declaration.getNamedImports().find(imp => imp.getName() === 'TypeB'));
      if (!importTypeB) return { passed: false, message: 'Import TypeB not found' }
      return { passed: true };
    }
  },
};
