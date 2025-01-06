import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";

export const test22: TestCase = {
  id: 'test22',
  description: 'Readonly properties and methods',
  input: {
    fileName: 'temp.ts',
    content: `
export class ConfigService {
readonly apiUrl: string = "https://api.example.com";

getConfig(): { apiUrl: string } {
return { apiUrl: this.apiUrl };
}
}
`,
  },
  output: {
    outputFileName: 'test22.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/getConfig\s*\(\s*\):\s*\{\s*apiUrl:\s*string;\s*\}/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test22.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const configService = interfaceDeclaration.getProperty('ConfigService');
      if (!configService) return { passed: false, message: 'ConfigService property not found' };

      const getConfigMethod = configService.getType().getApparentProperties().find(prop => prop.getName() === 'getConfig')?.getValueDeclaration() as MethodSignature | undefined;
      if (!getConfigMethod) return { passed: false, message: 'getConfig method not found' };
      if (getConfigMethod.getParameters().length !== 0) return { passed: false, message: `Expected 0 parameter for getConfig, but found ${getConfigMethod.getParameters().length}` };
      if (!getConfigMethod.getReturnType().getText().includes('{ apiUrl: string; }')) return { passed: false, message: `Expected return type { apiUrl: string; } for getConfig, but found ${getConfigMethod.getReturnType().getText()}` };
      return { passed: true };
    },
    assertType: "ts-morph"
  },
};
