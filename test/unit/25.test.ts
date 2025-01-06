import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test25: TestCase = {
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
    },
    tsMorphAssertion: (project) => {
      const interfaceDeclaration = project.getSourceFileOrThrow('test25.d.ts')?.getInterface('ExposedMethods');
      if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
      const treeService = interfaceDeclaration.getProperty('TreeService');
      if (!treeService) return { passed: false, message: 'TreeService property not found' };

      const createTreeMethod = treeService.getType().getApparentProperties().find(prop => prop.getName() === 'createTree')?.getValueDeclaration() as MethodSignature | undefined;
      if (!createTreeMethod) return { passed: false, message: 'createTree method not found' };
      const parameters = createTreeMethod.getParameters();
      if (parameters.length !== 2) return { passed: false, message: `Expected 2 parameters for createTree, but found ${parameters.length}` };
      const firstParameter = parameters[0];
      const secondParameter = parameters[1];
      if (firstParameter.getType().getText() !== 'T') return { passed: false, message: `Expected parameter type T, but found ${firstParameter.getType().getText()}` };
      if (!secondParameter.getType().getText().includes('TreeNode<T>[]')) return { passed: false, message: `Expected parameter type TreeNode<T>[] for createTree, but found ${secondParameter.getType().getText()}` };
      if (!createTreeMethod.getReturnType().getText().includes('TreeNode<T>')) return { passed: false, message: `Expected return type TreeNode<T> for createTree, but found ${createTreeMethod.getReturnType().getText()}` };

      const typeParameters = createTreeMethod.getTypeParameters();
      if (typeParameters.length !== 1) return { passed: false, message: `Expected 1 type parameter for createTree, but found ${typeParameters.length}` };
      const firstTypeParameter = typeParameters[0];
      if (firstTypeParameter.getName() !== 'T') return { passed: false, message: `Expected type parameter T for createTree, but found ${firstTypeParameter.getName()}` };
      return { passed: true };
    }
  },
};
