import { expect } from "bun:test";
import { baseTestDir, TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph";
import { writeTestFile } from "../main.test";
import * as fs from 'fs/promises';
import * as path from 'path';

export const test12: TestCase = {
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
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test12.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const userService = interfaceDeclaration.getProperty('UserService');
      if (!userService) return { passed: false, message: 'UserService property not found' };
      const authService = interfaceDeclaration.getProperty('AuthService');
      if (!authService) return { passed: false, message: 'AuthService property not found' };

      const getUserMethod = userService.getType().getApparentProperties().find(prop => prop.getName() === 'getUser')?.getValueDeclaration() as MethodSignature | undefined;
      if (!getUserMethod) return { passed: false, message: 'getUser method not found in UserService' };

      const getUsersMethod = userService.getType().getApparentProperties().find(prop => prop.getName() === 'getUsers')?.getValueDeclaration() as MethodSignature | undefined;
      if (!getUsersMethod) return { passed: false, message: 'getUsers method not found in UserService' };

      const loginMethod = authService.getType().getApparentProperties().find(prop => prop.getName() === 'login')?.getValueDeclaration() as MethodSignature | undefined;
      if (!loginMethod) return { passed: false, message: 'login method not found in AuthService' };
      const getLoggedInUserMethod = authService.getType().getApparentProperties().find(prop => prop.getName() === 'getLoggedInUser')?.getValueDeclaration() as MethodSignature | undefined;
      if (!getLoggedInUserMethod) return { passed: false, message: 'getLoggedInUser method not found in AuthService' };

      if (getUserMethod.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for getUser, but found ${getUserMethod.getParameters().length}` };
      const firstParameter = getUserMethod.getParameters()[0];
      if (firstParameter.getType().getText() !== 'number') return { passed: false, message: `Expected parameter type number for getUser, but found ${firstParameter.getType().getText()}` };
      if (!getUserMethod.getReturnType().getText().includes('Promise<User>')) return { passed: false, message: `Expected return type Promise<User> for getUser, but found ${getUserMethod.getReturnType().getText()}` };

      if (getUsersMethod.getParameters().length !== 0) return { passed: false, message: `Expected 0 parameter for getUsers, but found ${getUsersMethod.getParameters().length}` };
      if (getUsersMethod.getReturnType().getText() !== 'User[]') return { passed: false, message: `Expected return type User[], but found ${getUsersMethod.getReturnType().getText()}` };

      if (loginMethod.getParameters().length !== 2) return { passed: false, message: `Expected 2 parameter for login, but found ${loginMethod.getParameters().length}` };
      if (loginMethod.getParameters()[0].getType().getText() !== 'string') return {
        passed: false, message: `Expected parameter type string for login, but found ${loginMethod.getType().getText()}`
      };
      if (loginMethod.getParameters()[1].getType().getText() !== 'string') return { passed: false, message: `Expected parameter type string for login, but found ${loginMethod.getParameters()[1].getType().getText()}` };

      if (loginMethod.getReturnType().getText() !== 'Promise<string>') return { passed: false, message: `Expected return type Promise<string> for login, but found ${loginMethod.getReturnType().getText()}` };

      if (getLoggedInUserMethod.getParameters().length !== 0) return { passed: false, message: `Expected 0 parameter for getLoggedInUser, but found ${getLoggedInUserMethod.getParameters().length}` };

      if (!getLoggedInUserMethod.getReturnType().getText().includes('Promise<User>')) return { passed: false, message: `Expected return type Promise<User> for getLoggedInUser, but found ${getLoggedInUserMethod.getReturnType().getText()}` };

      return { passed: true };
    }
  }
};
