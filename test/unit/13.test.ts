import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test13: TestCase = {
  id: 'test13',
  description: 'Complex service with different return type options',
  input: {
    fileName: 'ai.service.ts',
    content: `
export interface MyData<T> {
data: T;
error?: string;
}

export class AiService {
async process(input: string): Promise<MyData<string>> {
return { data: input };
}

processWithOption<T>(input: T): Promise<MyData<T>> {
return Promise.resolve({ data: input });
}

processWithMultiOption<T, K>(input: T, option: K): Promise<MyData<{ input: T, option: K }>> {
  return Promise.resolve({ data: { input, option } });
}
}
`,
  },
  output: {
    outputFileName: 'test13-raw.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/process\s*\(\s*input:\s*string\s*\):\s*MyData\s*<\s*string\s*>/);
      expect(output).toMatch(/processWithOption\s*\(\s*input:\s*T\s*\):\s*MyData\s*<\s*T\s*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test13-raw.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const aiService = interfaceDeclaration.getProperty('AiService');
      if (!aiService) return { passed: false, message: 'AiService property not found' };

      const processMethod = aiService.getType().getApparentProperties().find(prop => prop.getName() === 'process')?.getValueDeclaration() as MethodSignature | undefined;
      if (!processMethod) return { passed: false, message: 'process method not found' };
      const processWithOptionMethod = aiService.getType().getApparentProperties().find(prop => prop.getName() === 'processWithOption')?.getValueDeclaration() as MethodSignature | undefined;
      if (!processWithOptionMethod) return { passed: false, message: 'processWithOption method not found' };
      if (processMethod.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for process, but found ${processMethod.getParameters().length}` };
      const firstParameter = processMethod.getParameters()[0];
      if (firstParameter.getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string, but found ${firstParameter.getType().getText()}` };

      if (!processMethod.getReturnType().getText().includes('MyData<string>')) return { passed: false, message: `Expected return type MyData<string> for process, but found ${processMethod.getReturnType().getText()}` };

      if (processWithOptionMethod.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for processWithOption, but found ${processWithOptionMethod.getParameters().length}` };
      const firstParameterProcessWithOption = processWithOptionMethod.getParameters()[0];
      if (firstParameterProcessWithOption.getType().getText() !== 'T') return { passed: false, message: `Expected parameter type T for processWithOption, but found ${firstParameterProcessWithOption.getType().getText()}` };

      if (!processWithOptionMethod.getReturnType().getText().includes('MyData<T>')) return { passed: false, message: `Expected return type MyData<T> for processWithOption, but found ${processWithOptionMethod.getReturnType().getText()}` };
      return { passed: true };
    }
  }
};
