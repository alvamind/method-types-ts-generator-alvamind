import { describe, test, beforeAll, afterAll, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateExposedMethodsType } from '../src';

const testDir = path.join(__dirname, 'test-files');
const outputDir = path.join(__dirname, 'output');

beforeEach(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
  await fs.mkdir(testDir, { recursive: true });
  await fs.writeFile(path.join(testDir, 'temp.ts'), '', 'utf-8');
});

afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
  await fs.rm(outputDir, { recursive: true, force: true });
});

describe('Type Generator Test Suite', () => {
  beforeEach(async () => {
    await fs.writeFile(path.join(testDir, 'temp.ts'), '', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(path.join(testDir, 'temp.ts'));
  })

  test('Test Case 1: Basic class with no methods', async () => {
    const input = `
            export class MyClass {}
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test1.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain('export interface ExposedMethods');
    expect(output).toContain('MyClass: {');
  });

  test('Test Case 2: Class with single method', async () => {
    const input = `
            export class MyClass {
                myMethod(input: string): string { return input}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test2.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*string/);
  });

  test('Test Case 3: Class with method and primitive return type', async () => {
    const input = `
            export class MyClass {
                myMethod(): number { return 1}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test3.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/myMethod\s*\(\s*\):\s*number/);
  });

  test('Test Case 4: Method with Promise return type', async () => {
    const input = `
          export interface MyData<T> {
             data: T;
          }
            export class MyClass {
                async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input});}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test4.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\).*MyData\s*<\s*string\s*>/);
  });

  test('Test Case 5: Method with generics parameter', async () => {
    const input = `
        export interface MyData<T> {
           data: T;
        }
           export class MyClass {
                myMethod<T>(input: T): MyData<T> { return {data: input}}
            }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test5.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod.*\(\s*input:\s*T\s*\).*MyData\s*<\s*T\s*>/);
  });

  test('Test Case 6: Method with optional parameters', async () => {
    const input = `
           export class MyClass {
               myMethod(input?: string): void {}
           }
       `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test6.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toMatch(/myMethod\s*\(\s*input\?\s*:\s*string\s*\):\s*void/);
  });

  test('Test Case 7: Method with interface parameter', async () => {
    const input = `
                export interface User {
                    name: string;
                    email: string
                }
                export class MyClass {
                    myMethod(user: User): User { return user}
                }
            `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test7.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { User } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*user:\s*.*User\s*\):\s*.*User/);
  });

  test('Test Case 8: Method with Promise return type and promise return type option', async () => {
    const input = `
            export interface MyData<T> {
               data: T;
            }
              export class MyClass {
                   async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
              }
          `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test8.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'promise' }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\):\s*Promise\s*<.*MyData\s*<\s*string\s*>.*>/);
  });

  test('Test Case 9: Method with Promise return type and raw return type option', async () => {
    const input = `
        export interface MyData<T> {
           data: T;
        }
          export class MyClass {
               async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
           }
        `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test9.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'raw' }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod\s*\(\s*input:\s*string\s*\).*MyData\s*<\s*string\s*>/);
  });

  test('Test Case 10: Class with method that has multi generics parameter and return type', async () => {
    const input = `
           export interface MyData<T> {
                data: T,
           }
           export class MyClass {
                myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
                    return Promise.resolve({data: {input, option}})
                }
           }
       `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test10.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod.*\(\s*input:\s*T,\s*option:\s*K\s*\).*MyData\s*<.*input:\s*T.*option:\s*K.*>/);
  });

  test('Test Case 11: Class with method that has multi generics parameter and raw return type', async () => {
    const input = `
           export interface MyData<T> {
                data: T,
           }
           export class MyClass {
                myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
                    return Promise.resolve({data: {input, option}})
                }
           }
       `;
    await fs.writeFile(path.join(testDir, 'temp.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test11.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'raw' }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');
    expect(output).toContain(`import { MyData } from '../test-files/temp'`);
    expect(output).toMatch(/myMethod.*\(\s*input:\s*T,\s*option:\s*K\s*\).*MyData\s*<.*input:\s*T.*option:\s*K.*>/);
  });


  test('Test Case 12: Multiple classes in different files with shared interfaces', async () => {
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

    await fs.writeFile(path.join(testDir, 'user.service.ts'), userService, 'utf-8');
    await fs.writeFile(path.join(testDir, 'auth.service.ts'), authService, 'utf-8');

    const outputFile = path.join(outputDir, 'test12.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');

    expect(output).toContain(`import { User } from '../test-files/user.service'`);
    expect(output).toMatch(/UserService:\s*{[^}]*getUser\s*\(\s*id:\s*number\s*\):\s*User/);
    expect(output).toMatch(/getUsers\s*\(\s*\):\s*User\[\]/);
    expect(output).toMatch(/AuthService:\s*{[^}]*login\s*\(\s*username:\s*string,\s*password:\s*string\s*\):\s*string/);
    expect(output).toMatch(/getLoggedInUser\s*\(\s*\):\s*User/);
  });

  test('Test Case 13: Complex service with different return type options', async () => {
    const input = `
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

        processWithMultiOption<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
          return Promise.resolve({ data: { input, option } });
        }
      }
    `;

    await fs.writeFile(path.join(testDir, 'ai.service.ts'), input, 'utf-8');

    // Test raw return type
    const outputFileRaw = path.join(outputDir, 'test13-raw.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'raw' }, outputFileRaw);
    const outputRaw = await fs.readFile(outputFileRaw, 'utf-8');
    expect(outputRaw).toMatch(/process\s*\(\s*input:\s*string\s*\):\s*MyData\s*<\s*string\s*>/);
    expect(outputRaw).toMatch(/processWithOption\s*\(\s*input:\s*T\s*\):\s*MyData\s*<\s*T\s*>/);

    // Test promise return type
    const outputFilePromise = path.join(outputDir, 'test13-promise.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'promise' }, outputFilePromise);
    const outputPromise = await fs.readFile(outputFilePromise, 'utf-8');
    expect(outputPromise).toMatch(/process.*:\s*Promise\s*<\s*MyData\s*<\s*string\s*>\s*>/);

    // Test observable return type
    const outputFileObservable = path.join(outputDir, 'test13-observable.d.ts');
    await generateExposedMethodsType({ scanPath: testDir, returnType: 'observable' }, outputFileObservable);
    const outputObservable = await fs.readFile(outputFileObservable, 'utf-8');
    expect(outputObservable).toMatch(/process.*:\s*Observable\s*<\s*MyData\s*<\s*string\s*>\s*>/);
  });

  test('Test Case 14: Handling of Partial and other utility types', async () => {
    const input = `
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
    `;

    await fs.writeFile(path.join(testDir, 'user-update.service.ts'), input, 'utf-8');
    const outputFile = path.join(outputDir, 'test14.d.ts');
    await generateExposedMethodsType({ scanPath: testDir }, outputFile);
    const output = await fs.readFile(outputFile, 'utf-8');

    expect(output).toMatch(/updateUser\s*\(\s*id:\s*number,\s*partialUser:\s*Partial\s*<\s*User\s*>\)/);
    expect(output).toMatch(/getFilteredUsers\s*\(\s*filter:\s*Pick\s*<\s*User,\s*['"]name['"]\s*\|\s*['"]email['"]\s*>\)/);
  });
});
