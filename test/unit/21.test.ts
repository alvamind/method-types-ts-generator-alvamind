import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test21: TestCase = {
  id: 'test21',
  description: 'Async/Await with complex return type',
  input: {
    fileName: 'temp.ts',
    content: `
export interface Response<T> {
status: number;
data: T;
}

export class ApiService {
async fetchData<T>(url: string): Promise<Response<T>> {
const response = await fetch(url);
return { status: response.status, data: await response.json() };
}
}
`,
  },
  output: {
    outputFileName: 'test21.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/fetchData\s*<\s*T\s*>\s*\(\s*url:\s*string\s*\):\s*Promise\s*<\s*Response\s*<\s*T\s*>\s*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test21.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const apiService = interfaceDeclaration.getProperty('ApiService');
      if (!apiService) return { passed: false, message: 'ApiService property not found' };
      const fetchDataMethod = apiService.getType().getApparentProperties().find(prop => prop.getName() === 'fetchData')?.getValueDeclaration() as MethodSignature | undefined;
      if (!fetchDataMethod) return { passed: false, message: 'fetchData method not found' };
      if (fetchDataMethod.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter, but found ${fetchDataMethod.getParameters().length}` };
      const firstParameter = fetchDataMethod.getParameters()[0];
      if (firstParameter.getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string for fetchData, but found ${firstParameter.getType().getText()}` };
      const returnType = fetchDataMethod.getReturnType().getText();
      if (!returnType.includes('Promise<Response<T>>')) return { passed: false, message: `Expected return type Promise<Response<T>> for fetchData, but found ${returnType}` };
      const typeParameters = fetchDataMethod.getTypeParameters();
      if (typeParameters.length !== 1) return { passed: false, message: `Expected 1 type parameter for fetchData, but found ${typeParameters.length}` };
      const firstTypeParameter = typeParameters[0];
      if (firstTypeParameter.getName() !== 'T') return { passed: false, message: `Expected type parameter T for fetchData, but found ${firstTypeParameter.getName()}` };
      return { passed: true };
    }
  },
};
