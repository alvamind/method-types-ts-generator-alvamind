import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test14: TestCase = {
  id: 'test13-promise',
  description: 'Complex service with different return type options promise',
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
    options: { returnType: 'promise' },
  },
  output: {
    outputFileName: 'test13-promise.d.ts',
    assertions: (output) => {
      expect(output).toMatch(/process.*:\s*Promise\s*<\s*MyData\s*<\s*string\s*>\s*>/);
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test13-promise.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const aiService = interfaceDeclaration.getProperty('AiService');
      if (!aiService) return { passed: false, message: 'AiService property not found' };

      const processMethod = aiService.getType().getApparentProperties().find(prop => prop.getName() === 'process')?.getValueDeclaration() as MethodSignature | undefined;
      if (!processMethod) return { passed: false, message: 'process method not found' };

      if (processMethod.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for process, but found ${processMethod.getParameters().length}` };
      const firstParameter = processMethod.getParameters()[0];
      if (firstParameter.getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string, but found ${firstParameter.getType().getText()}` };

      if (!processMethod.getReturnType().getText().includes('Promise<MyData<string>>')) return { passed: false, message: `Expected return type Promise<MyData<string>>, but found ${processMethod.getReturnType().getText()}` };
      return { passed: true };
    },
    assertType: "regex"
  },
};
