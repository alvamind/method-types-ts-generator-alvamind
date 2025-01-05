export interface TypeInformation {
    imports: Set<string>;
    methodParams: Map<string, Map<string, { type: string; name: string; optional: boolean }[]>>;
    methodReturns: Map<string, Map<string, string>>;
    localInterfaces: Set<string>;
}