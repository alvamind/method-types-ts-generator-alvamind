import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test24: TestCase = {
  id: 'test24',
  description: 'Mapped types in method signatures',
  input: {
    fileName: 'temp.ts',
    content: `
export type ReadonlyRecord<K extends keyof any, T> = {
readonly [P in K]: T;
};

export class RecordService {
createRecord<K extends string, T>(keys: K[], value: T): ReadonlyRecord<K, T> {
return keys.reduce((acc, key) => ({ ...acc, [key]: value }), {} as ReadonlyRecord<K, T>);
}
}
`,
  },
  output: {
    outputFileName: 'test24.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/createRecord\s*<\s*K\s*extends\s*string,\s*T\s*>\s*\(\s*keys:\s*K\[\],\s*value:\s*T\s*\):\s*ReadonlyRecord\s*<\s*K,\s*T\s*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test24.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const recordService = interfaceDeclaration.getProperty('RecordService');
      if (!recordService) return { passed: false, message: 'RecordService property not found' };

      const createRecordMethod = recordService.getType().getApparentProperties().find(prop => prop.getName() === 'createRecord')?.getValueDeclaration() as MethodSignature | undefined;
      if (!createRecordMethod) return { passed: false, message: 'createRecord method not found' };

      if (createRecordMethod.getParameters().length !== 2) return { passed: false, message: `Expected 2 parameters, but found ${createRecordMethod.getParameters().length}` };
      const firstParameter = createRecordMethod.getParameters()[0];
      const secondParameter = createRecordMethod.getParameters()[1];
      if (firstParameter.getType().getText() !== 'K[]') return { passed: false, message: `Expected parameter type K[] for createRecord, but found ${firstParameter.getType().getText()}` };
      if (secondParameter.getType().getText() !== 'T') return {
        passed: false,
        message: `Expected parameter type T for createRecord, but found ${secondParameter.getType().getText()}`
      };
      if (!createRecordMethod.getReturnType().getText().includes('ReadonlyRecord<K, T>')) return { passed: false, message: `Expected return type ReadonlyRecord<K, T> for createRecord, but found ${createRecordMethod.getReturnType().getText()}` };

      const typeParameters = createRecordMethod.getTypeParameters();
      if (typeParameters.length !== 2) return { passed: false, message: `Expected 2 type parameters for createRecord, but found ${typeParameters.length}` };
      const firstTypeParameter = typeParameters[0];
      const secondTypeParameter = typeParameters[1];

      if (firstTypeParameter.getName() !== 'K') return { passed: false, message: `Expected type parameter K for createRecord, but found ${firstTypeParameter.getName()}` };
      if (secondTypeParameter.getName() !== 'T') return { passed: false, message: `Expected type parameter T for createRecord, but found ${secondTypeParameter.getName()}` };

      return { passed: true };
    }
  },
};
