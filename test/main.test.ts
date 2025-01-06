import { describe, test, beforeAll, afterAll, expect } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateExposedMethodsType } from '../src';

// --- Constants ---
const baseTestDir = path.join(__dirname, 'test-files');
const outputDir = path.join(__dirname, 'output');

// --- Interfaces ---
interface TestCaseInput {
  fileName: string;
  content: string;
  options?: {
    returnType?: 'promise' | 'raw' | 'observable';
  };
}

interface TestCaseOutput {
  outputFileName: string;
  assertions: (output: string) => void;
}

interface TestCase {
  id: string;
  description: string;
  input: TestCaseInput;
  output: TestCaseOutput;
}

// --- Functions ---
const createTestDir = async () => {
  await fs.mkdir(baseTestDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
};

const cleanupTestDir = async () => {
  await fs.rm(baseTestDir, { recursive: true, force: true });
  await fs.rm(outputDir, { recursive: true, force: true });
};

const writeTestFile = async (testDir: string, fileName: string, content: string) => {
  await fs.writeFile(path.join(testDir, fileName), content, 'utf-8');
};

const readOutputFile = async (outputFile: string) => {
  return await fs.readFile(outputFile, 'utf-8');
};


const runTestCase = async (testCase: TestCase) => {
  const testCaseDir = path.join(baseTestDir, testCase.id);
  await fs.mkdir(testCaseDir, { recursive: true });

  const { fileName, content, options } = testCase.input;
  await writeTestFile(testCaseDir, fileName, content);

  const { outputFileName, assertions } = testCase.output;
  const outputFile = path.join(outputDir, outputFileName);
  await generateExposedMethodsType(
    { scanPath: testCaseDir, ...options },
    outputFile
  );
  const output = await readOutputFile(outputFile);
  assertions(output);
  await fs.rm(testCaseDir, { recursive: true, force: true });
};

// --- Test Suite ---
describe('Type Generator Test Suite (Parallel)', () => {
  beforeAll(createTestDir);
  afterAll(cleanupTestDir);

  const testCases: TestCase[] = [
    {
      id: 'test1',
      description: 'Basic class with no methods',
      input: {
        fileName: 'temp.ts',
        content: 'export class MyClass {}',
      },
      output: {
        outputFileName: 'test1.d.ts',
        assertions: (output) => {
          expect(output).toContain('export interface ExposedMethods');
          expect(output).toContain('MyClass: {');
        }
      },
    },
    {
      id: 'test2',
      description: 'Class with single method',
      input: {
        fileName: 'temp.ts',
        content: 'export class MyClass { myMethod(input: string): string { return input} }',
      },
      output: {
        outputFileName: 'test2.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*string/);
        }
      },
    },
    {
      id: 'test3',
      description: 'Class with method and primitive return type',
      input: {
        fileName: 'temp.ts',
        content: 'export class MyClass { myMethod(): number { return 1} }',
      },
      output: {
        outputFileName: 'test3.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/myMethod\s*\(\s*\):\s*number/);
        }
      },
    },
    {
      id: 'test4',
      description: 'Method with Promise return type',
      input: {
        fileName: 'temp.ts',
        content: `
          export interface MyData<T> {
             data: T;
          }
            export class MyClass {
                async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input});}
            }
        `,
      },
      output: {
        outputFileName: 'test4.d.ts',
        assertions: (output) => {
          expect(output).toContain(`import { MyData } from '../test-files/test4/temp'`);
          expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\).*MyData\s*<\s*string\s*>/);
        }
      },
    },
    {
      id: 'test5',
      description: 'Method with generics parameter',
      input: {
        fileName: 'temp.ts',
        content: `
        export interface MyData<T> {
           data: T;
        }
           export class MyClass {
                myMethod<T>(input: T): MyData<T> { return {data: input}}
            }
        `,
      },
      output: {
        outputFileName: 'test5.d.ts',
        assertions: (output) => {
          expect(output).toContain(`import { MyData } from '../test-files/test5/temp'`);
          expect(output).toMatch(/myMethod.*\(\s*input:\s*T\s*\).*MyData\s*<\s*T\s*>/);
        }
      },
    },
    {
      id: 'test6',
      description: 'Method with optional parameters',
      input: {
        fileName: 'temp.ts',
        content: `
           export class MyClass {
               myMethod(input?: string): void {}
           }
       `,
      },
      output: {
        outputFileName: 'test6.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/myMethod\s*\(\s*input\?\s*:\s*string\s*\):\s*void/);
        }
      },
    },
    {
      id: 'test7',
      description: 'Method with interface parameter',
      input: {
        fileName: 'temp.ts',
        content: `
                export interface User {
                    name: string;
                    email: string
                }
                export class MyClass {
                    myMethod(user: User): User { return user}
                }
            `,
      },
      output: {
        outputFileName: 'test7.d.ts',
        assertions: (output) => {
          expect(output).toContain(`import { User } from '../test-files/test7/temp'`);
          expect(output).toMatch(/myMethod\s*\(\s*user:\s*.*User\s*\):\s*.*User/);
        }
      },
    },
    {
      id: 'test8',
      description: 'Method with Promise return type and promise return type option',
      input: {
        fileName: 'temp.ts',
        content: `
            export interface MyData<T> {
               data: T;
            }
              export class MyClass {
                   async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
              }
          `,
        options: { returnType: 'promise' },
      },
      output: {
        outputFileName: 'test8.d.ts',
        assertions: (output) => {
          expect(output).toContain(`import { MyData } from '../test-files/test8/temp'`);
          expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*Promise\s*<.*MyData\s*<\s*string\s*>.*>/);
        }
      },
    },
    {
      id: 'test9',
      description: 'Method with Promise return type and raw return type option',
      input: {
        fileName: 'temp.ts',
        content: `
        export interface MyData<T> {
           data: T;
        }
          export class MyClass {
               async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
           }
        `,
        options: { returnType: 'raw' },
      },
      output: {
        outputFileName: 'test9.d.ts',
        assertions: (output) => {
          expect(output).toContain(`import { MyData } from '../test-files/test9/temp'`);
          expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\).*MyData\s*<\s*string\s*>/);
        }
      },
    },
    {
      id: 'test10',
      description: 'Class with method that has multi generics parameter and return type',
      input: {
        fileName: 'temp.ts',
        content: `
           export interface MyData<T> {
                data: T,
           }
           export class MyClass {
                myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
                    return Promise.resolve({data: {input, option}})
                }
           }
       `,
      },
      output: {
        outputFileName: 'test10.d.ts',
        assertions: (output) => {
          expect(output).toContain(`import { MyData } from '../test-files/test10/temp'`);
          expect(output).toMatch(/myMethod.*\(\s*input:\s*T,\s*option:\s*K\s*\).*MyData\s*<.*input:\s*T.*option:\s*K.*>/);
        }
      },
    },
    {
      id: 'test11',
      description: 'Class with method that has multi generics parameter and raw return type',
      input: {
        fileName: 'temp.ts',
        content: `
           export interface MyData<T> {
                data: T,
           }
           export class MyClass {
                myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
                    return Promise.resolve({data: {input, option}})
                }
           }
       `,
        options: { returnType: 'raw' },
      },
      output: {
        outputFileName: 'test11.d.ts',
        assertions: (output) => {
          expect(output).toContain(`import { MyData } from '../test-files/test11/temp'`);
          expect(output).toMatch(/myMethod.*\(\s*input:\s*T,\s*option:\s*K\s*\).*MyData\s*<.*input:\s*T.*option:\s*K.*>/);
        }
      },
    },
    {
      id: 'test12',
      description: 'Multiple classes in different files with shared interfaces',
      input: {
        fileName: '',
        content: '',
      },
      output: {
        outputFileName: 'test12.d.ts',
        assertions: async (output) => {
          const testCaseDir = path.join(baseTestDir, 'test12');
          // Create user.service.ts
          const userService = `
                      export interface User {
                        id: number;
                        name: string;
                        email: string;
                      }

                      export class UserService {
                        async getUser(id: number): Promise<User> {
                          return { id, name: 'John', email: 'john@example.com' };
                        }

                        getUsers(): User[] {
                          return [{ id: 1, name: 'John', email: 'john@example.com' }];
                        }
                      }
                    `;

          // Create auth.service.ts
          const authService = `
                      import { User } from './user.service';

                      export class AuthService {
                        login(username: string, password: string): Promise<string> {
                          return Promise.resolve("token");
                        }

                        getLoggedInUser(): Promise<User> {
                          return Promise.resolve({ id: 1, name: 'John', email: 'john@example.com' });
                        }
                      }
                    `;

          await writeTestFile(testCaseDir, 'user.service.ts', userService);
          await writeTestFile(testCaseDir, 'auth.service.ts', authService);
          expect(output).toContain(`import { User } from '../test-files/test12/user.service'`);
          expect(output).toMatch(/UserService:\s*{[^}]*getUser\s*\(\s*id:\s*number\s*\):\s*User/);
          expect(output).toMatch(/getUsers\s*\(\s*\):\s*User\[\]/);
          expect(output).toMatch(/AuthService:\s*{[^}]*login\s*\(\s*username:\s*string,\s*password:\s*string\s*\):\s*string/);
          expect(output).toMatch(/getLoggedInUser\s*\(\s*\):\s*User/);
          await fs.rm(testCaseDir, { recursive: true, force: true });
        }
      }
    },
    {
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
        }
      }
    },
    {
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
        }
      },
    },
    {
      id: 'test13-observable',
      description: 'Complex service with different return type options observable',
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
        options: { returnType: 'observable' },
      },
      output: {
        outputFileName: 'test13-observable.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/process.*:\s*Observable\s*<\s*MyData\s*<\s*string\s*>\s*>/);
        }
      },
    },
    {
      id: 'test14',
      description: 'Handling of Partial and other utility types',
      input: {
        fileName: 'user-update.service.ts',
        content: `
      export interface User {
        id: number;
        name: string;
        email: string;
      }

      export class UserService {
        async updateUser(id: number, partialUser: Partial<User>): Promise<User> {
          return Promise.resolve({ id: 1, name: 'John', email: 'john@example.com' });
        }

        getFilteredUsers(filter: Pick<User, 'name' | 'email'>): User[] {
          return [{ id: 1, name: 'John', email: 'john@example.com' }];
        }
      }
    `,
      },
      output: {
        outputFileName: 'test14.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/updateUser\s*\(\s*id:\s*number,\s*partialUser:\s*Partial\s*<\s*User\s*>\)/);
          expect(output).toMatch(/getFilteredUsers\s*\(\s*filter:\s*Pick\s*<\s*User,\s*['"]name['"]\s*\|\s*['"]email['"]\s*>\)/);
        }
      },
    },
    {
      id: 'test15',
      description: 'Method with default parameters',
      input: {
        fileName: 'temp.ts',
        content: `
      export class MyClass {
        myMethod(input: string = "default"): string {
          return input;
        }
      }
    `,
      },
      output: {
        outputFileName: 'test15.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/myMethod\s*\(\s*input\?\s*:\s*string\s*\):\s*string/);
        }
      },
    },
    {
      id: 'test16',
      description: 'Overloaded methods',
      input: {
        fileName: 'temp.ts',
        content: `
      export class MyClass {
        myMethod(input: string): string;
        myMethod(input: number): number;
        myMethod(input: string | number): string | number {
          return input;
        }
      }
    `,
      },
      output: {
        outputFileName: 'test16.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*string/);
          expect(output).toMatch(/myMethod\s*\(\s*input:\s*number\s*\):\s*number/);
        }
      },
    },
    {
      id: 'test17',
      description: 'Class inheritance',
      input: {
        fileName: 'temp.ts',
        content: `
      export class BaseClass {
        baseMethod(): string {
          return "base";
        }
      }

      export class MyClass extends BaseClass {
        myMethod(): string {
          return "child";
        }
      }
    `,
      },
      output: {
        outputFileName: 'test17.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/baseMethod\s*\(\s*\):\s*string/);
          expect(output).toMatch(/myMethod\s*\(\s*\):\s*string/);
        }
      },
    },
    {
      id: 'test18',
      description: 'Complex nested generics',
      input: {
        fileName: 'temp.ts',
        content: `
      export interface MyData<T> {
        data: T;
      }

      export class MyClass {
        myMethod<T, K>(input: T, option: K): Promise<MyData<{ input: T; option: K; nested: MyData<K> }>> {
          return Promise.resolve({ data: { input, option, nested: { data: option } } });
        }
      }
    `,
      },
      output: {
        outputFileName: 'test18.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/myMethod\s*<\s*T,\s*K\s*>\s*\(\s*input:\s*T,\s*option:\s*K\s*\):\s*Promise\s*<\s*MyData\s*<\s*\{\s*input:\s*T;\s*option:\s*K;\s*nested:\s*MyData\s*<\s*K\s*>;\s*}\s*>\s*>/);
        }
      },
    },
    {
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
        }
      },
    },
    {
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
        }
      },
    },
    {
      id: 'test23',
      description: 'Conditional types in method signatures',
      input: {
        fileName: 'temp.ts',
        content: `
      export type IsString<T> = T extends string ? true : false;

      export class TypeChecker {
        checkType<T>(input: T): IsString<T> {
          return (typeof input === "string") as IsString<T>;
        }
      }
    `,
      },
      output: {
        outputFileName: 'test23.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/checkType\s*<\s*T\s*>\s*\(\s*input:\s*T\s*\):\s*IsString\s*<\s*T\s*>/);
        }
      },
    },
    {
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
        }
      },
    },
    {
      id: 'test25',
      description: 'Recursive types in method signatures',
      input: {
        fileName: 'temp.ts',
        content: `
      export interface TreeNode<T> {
        value: T;
        children: TreeNode<T>[];
      }

      export class TreeService {
        createTree<T>(value: T, children: TreeNode<T>[] = []): TreeNode<T> {
          return { value, children };
        }
      }
    `,
      },
      output: {
        outputFileName: 'test25.d.ts',
        assertions: (output) => {
          expect(output).toMatch(/createTree\s*<\s*T\s*>\s*\(\s*value:\s*T,\s*children\?\s*:\s*TreeNode\s*<\s*T\s*>\[\]\s*\):\s*TreeNode\s*<\s*T\s*>/);
        }
      },
    },
  ];

  for (const testCase of testCases) {
    test(testCase.description, async () => {
      await runTestCase(testCase);
    });
  }
});
