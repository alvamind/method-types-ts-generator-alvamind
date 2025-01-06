// test/unit/23.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test23: TestCase = {
  id: 'test23',
  description: 'Class inheritance with different signatures and types',
  input: {
    fileName: 'temp.ts',
    content: `
            export class BaseClass {
                baseMethod(input: string): string {
                    return input;
                }
            }

            export class MyClass extends BaseClass {
              baseMethod(input: number): number {
                 return input;
              }
              myMethod(input: string): string {
                  return input
              }
            }
        `,
  },
  output: {
    outputFileName: 'test23.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/BaseClass:\s*{\s*baseMethod\(input:\s*string\s*\):\s*string;\s*}/);
      expect(output).toMatch(/MyClass:\s*{\s*baseMethod\(input:\s*number\s*\):\s*number;[\s\S]*myMethod\(input:\s*string\s*\):\s*string;\s*}/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test23.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };

      const baseClassProperty = interfaceDeclaration.getProperty('BaseClass');
      if (!baseClassProperty) return { passed: false, message: 'BaseClass property not found' };
      const myClassProperty = interfaceDeclaration.getProperty('MyClass');
      if (!myClassProperty) return { passed: false, message: 'MyClass property not found' };

      const baseMethodBase = baseClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'baseMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!baseMethodBase) return { passed: false, message: 'baseMethod in BaseClass not found' };
      if (baseMethodBase.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for baseMethod in BaseClass, but found ${baseMethodBase.getParameters().length}` };
      if (baseMethodBase.getReturnType().getText() !== 'string') return { passed: false, message: `Expected return type string for baseMethod in BaseClass, but found ${baseMethodBase.getReturnType().getText()}` };
      if (baseMethodBase.getParameters()[0].getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string for baseMethod in BaseClass, but found ${baseMethodBase.getParameters()[0].getType().getText()}` };


      const baseMethodMyClass = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'baseMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!baseMethodMyClass) return { passed: false, message: 'baseMethod in MyClass not found' };
      if (baseMethodMyClass.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for baseMethod in MyClass, but found ${baseMethodMyClass.getParameters().length}` };
      if (baseMethodMyClass.getReturnType().getText() !== 'number') return { passed: false, message: `Expected return type number for baseMethod in MyClass, but found ${baseMethodMyClass.getReturnType().getText()}` };
      if (baseMethodMyClass.getParameters()[0].getType().getText() !== 'number') return { passed: false, message: `Expected parameter type number for baseMethod in MyClass, but found ${baseMethodMyClass.getParameters()[0].getType().getText()}` };


      const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
      if (!myMethod) return { passed: false, message: 'myMethod method not found' };
      if (myMethod.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for myMethod, but found ${myMethod.getParameters().length}` };
      if (myMethod.getReturnType().getText() !== 'string') return { passed: false, message: `Expected return type string for myMethod, but found ${myMethod.getReturnType().getText()}` };
      if (myMethod.getParameters()[0].getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string for myMethod, but found ${myMethod.getParameters()[0].getType().getText()}` };

      return { passed: true };
    },
    assertType: 'both', // Ensures both regex and ts-morph assertions must pass
  },
};
