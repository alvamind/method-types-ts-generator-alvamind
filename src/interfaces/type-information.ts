import { Type } from 'ts-morph';

export interface TypeParameter {
  name: string;
  constraint?: string;
}

export interface MethodParameter {
  name: string;
  type: string;
  optional: boolean;
}

export interface MethodSignature {
  name: string;
  typeParameters: TypeParameter[];
  parameters: MethodParameter[];
  returnType: string;
}

export interface TypeInformation {
  imports: Set<string>;
  methodSignatures: Map<string, Map<string, MethodSignature[]>>;
  localInterfaces: Set<string>;
}
