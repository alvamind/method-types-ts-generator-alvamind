import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test16: TestCase = {
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
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test14.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const userService = interfaceDeclaration.getProperty('UserService');
      if (!userService) return { passed: false, message: 'UserService property not found' };

      const updateUserMethod = userService.getType().getApparentProperties().find(prop => prop.getName() === 'updateUser')?.getValueDeclaration() as MethodSignature | undefined;
      if (!updateUserMethod) return { passed: false, message: 'updateUser method not found' };
      if (updateUserMethod.getParameters().length !== 2) return { passed: false, message: `Expected 2 parameters for updateUser, but found ${updateUserMethod.getParameters().length}` };
      const firstParameter = updateUserMethod.getParameters()[0];
      const secondParameter = updateUserMethod.getParameters()[1];

      if (firstParameter.getType().getText() !== 'number') return { passed: false, message: `Expected parameter type number for updateUser, but found ${firstParameter.getType().getText()}` };
      if (secondParameter.getType().getText() !== 'Partial<User>') return { passed: false, message: `Expected parameter type Partial<User> for updateUser, but found ${secondParameter.getType().getText()}` };
      if (!updateUserMethod.getReturnType().getText().includes('Promise<User>')) return { passed: false, message: `Expected return type Promise<User> for updateUser, but found ${updateUserMethod.getReturnType().getText()}` };

      const getFilteredUsersMethod = userService.getType().getApparentProperties().find(prop => prop.getName() === 'getFilteredUsers')?.getValueDeclaration() as MethodSignature | undefined;
      if (!getFilteredUsersMethod) return { passed: false, message: 'getFilteredUsers method not found' };
      if (getFilteredUsersMethod.getParameters().length !== 1) return { passed: false, message: `Expected 1 parameter for getFilteredUsers, but found ${getFilteredUsersMethod.getParameters().length}` };
      const firstParameterFilteredUsers = getFilteredUsersMethod.getParameters()[0];
      if (!firstParameterFilteredUsers.getType().getText().includes('Pick<User, "name" | "email">')) return { passed: false, message: `Expected parameter type Pick<User, "name" | "email"> for getFilteredUsers, but found ${firstParameterFilteredUsers.getType().getText()}` };
      if (getFilteredUsersMethod.getReturnType().getText() !== 'User[]') return { passed: false, message: `Expected return type User[] for getFilteredUsers, but found ${getFilteredUsersMethod.getReturnType().getText()}` };
      return { passed: true };
    }
  },
};
