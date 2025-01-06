#TS-Morph API

import { errors, StandardizedFilePath, ts } from "@ts-morph/common";
export declare class CompilerOptionsContainer extends SettingsContainer<ts.CompilerOptions> {
  constructor(defaultSettings?: ts.CompilerOptions);
  set(settings: Partial<ts.CompilerOptions>): void;
  getEncoding(): string;
}
export interface FileSystemHost {
  isCaseSensitive(): boolean;
  delete(path: string): Promise<void>;
  deleteSync(path: string): void;
  readDirSync(dirPath: string): RuntimeDirEntry[];
  readFile(filePath: string, encoding?: string): Promise<string>;
  readFileSync(filePath: string, encoding?: string): string;
  writeFile(filePath: string, fileText: string): Promise<void>;
  writeFileSync(filePath: string, fileText: string): void;
  mkdir(dirPath: string): Promise<void>;
  mkdirSync(dirPath: string): void;
  move(srcPath: string, destPath: string): Promise<void>;
  moveSync(srcPath: string, destPath: string): void;
  copy(srcPath: string, destPath: string): Promise<void>;
  copySync(srcPath: string, destPath: string): void;
  fileExists(filePath: string): Promise<boolean>;
  fileExistsSync(filePath: string): boolean;
  directoryExists(dirPath: string): Promise<boolean>;
  directoryExistsSync(dirPath: string): boolean;
  realpathSync(path: string): string;
  getCurrentDirectory(): string;
  glob(patterns: ReadonlyArray<string>): Promise<string[]>;
  globSync(patterns: ReadonlyArray<string>): string[];
}
export declare class InMemoryFileSystemHost implements FileSystemHost {
  #private;
  constructor();
  isCaseSensitive(): boolean;
  delete(path: string): Promise<void>;
  deleteSync(path: string): void;
  readDirSync(dirPath: string): RuntimeDirEntry[];
  readFile(filePath: string, encoding?: string): Promise<string>;
  readFileSync(filePath: string, encoding?: string): string;
  writeFile(filePath: string, fileText: string): Promise<void>;
  writeFileSync(filePath: string, fileText: string): void;
  mkdir(dirPath: string): Promise<void>;
  mkdirSync(dirPath: string): void;
  move(srcPath: string, destPath: string): Promise<void>;
  moveSync(srcPath: string, destPath: string): void;
  copy(srcPath: string, destPath: string): Promise<void>;
  copySync(srcPath: string, destPath: string): void;
  fileExists(filePath: string): Promise<boolean>;
  fileExistsSync(filePath: string): boolean;
  directoryExists(dirPath: string): Promise<boolean>;
  directoryExistsSync(dirPath: string): boolean;
  realpathSync(path: string): string;
  getCurrentDirectory(): string;
  glob(patterns: ReadonlyArray<string>): Promise<string[]>;
  globSync(patterns: ReadonlyArray<string>): string[];
}
export interface ResolutionHost {
  resolveModuleNames?: ts.LanguageServiceHost["resolveModuleNames"];
  getResolvedModuleWithFailedLookupLocationsFromCache?: ts.LanguageServiceHost["getResolvedModuleWithFailedLookupLocationsFromCache"];
  resolveTypeReferenceDirectives?: ts.LanguageServiceHost["resolveTypeReferenceDirectives"];
}
export type ResolutionHostFactory = (moduleResolutionHost: ts.ModuleResolutionHost, getCompilerOptions: () => ts.CompilerOptions) => ResolutionHost;
export declare const ResolutionHosts: {
      deno: ResolutionHostFactory;
  };
export interface RuntimeDirEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
}
export declare abstract class SettingsContainer<T extends object> {
  #private;
  protected _settings: T;
  constructor(defaultSettings: T);
  reset(): void;
  get(): T;
  set(settings: Partial<T>): void;
  onModified(action: () => void): void;
}
declare const ArgumentError: typeof errors.ArgumentError;
declare const ArgumentNullOrWhitespaceError: typeof errors.ArgumentNullOrWhitespaceError;
declare const ArgumentOutOfRangeError: typeof errors.ArgumentOutOfRangeError;
declare const ArgumentTypeError: typeof errors.ArgumentTypeError;
declare const BaseError: typeof errors.BaseError;
declare const DirectoryNotFoundError: typeof errors.DirectoryNotFoundError;
declare const FileNotFoundError: typeof errors.FileNotFoundError;
declare const InvalidOperationError: typeof errors.InvalidOperationError;
declare const NotImplementedError: typeof errors.NotImplementedError;
declare const NotSupportedError: typeof errors.NotSupportedError;
declare const PathNotFoundError: typeof errors.PathNotFoundError;
export declare class Directory {
  #private;
  private constructor();
  isAncestorOf(possibleDescendant: Directory | SourceFile): boolean;
  isDescendantOf(possibleAncestor: Directory): boolean;
  getPath(): StandardizedFilePath;
  getBaseName(): string;
  getParentOrThrow(message?: string | (() => string)): Directory;
  getParent(): Directory | undefined;
  getDirectoryOrThrow(path: string): Directory;
  getDirectoryOrThrow(condition: (directory: Directory) => boolean): Directory;
  getDirectory(path: string): Directory | undefined;
  getDirectory(condition: (directory: Directory) => boolean): Directory | undefined;
  getSourceFileOrThrow(path: string): SourceFile;
  getSourceFileOrThrow(condition: (sourceFile: SourceFile) => boolean): SourceFile;
  getSourceFile(path: string): SourceFile | undefined;
  getSourceFile(condition: (sourceFile: SourceFile) => boolean): SourceFile | undefined;
  getDirectories(): Directory[];
  getSourceFiles(): SourceFile[];
  getSourceFiles(globPattern: string): SourceFile[];
  getSourceFiles(globPatterns: ReadonlyArray<string>): SourceFile[];
  getDescendantSourceFiles(): SourceFile[];
  getDescendantDirectories(): Directory[];
  addSourceFilesAtPaths(fileGlobs: string | ReadonlyArray<string>): SourceFile[];
  addDirectoryAtPathIfExists(relativeOrAbsoluteDirPath: string, options?: DirectoryAddOptions): Directory | undefined;
  addDirectoryAtPath(relativeOrAbsoluteDirPath: string, options?: DirectoryAddOptions): Directory;
  createDirectory(relativeOrAbsoluteDirPath: string): Directory;
  createSourceFile(relativeFilePath: string, sourceFileText?: string | OptionalKind<SourceFileStructure> | WriterFunction, options?: SourceFileCreateOptions): SourceFile;
  addSourceFileAtPathIfExists(relativeFilePath: string): SourceFile | undefined;
  addSourceFileAtPath(relativeFilePath: string): SourceFile;
  emit(options?: {
        emitOnlyDtsFiles?: boolean;
        outDir?: string;
        declarationDir?: string;
    }): Promise<DirectoryEmitResult>;
  emitSync(options?: {
        emitOnlyDtsFiles?: boolean;
        outDir?: string;
        declarationDir?: string;
    }): DirectoryEmitResult;
  copyToDirectory(dirPathOrDirectory: string | Directory, options?: DirectoryCopyOptions): Directory;
  copy(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions): Directory;
  copyImmediately(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions): Promise<Directory>;
  copyImmediatelySync(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions): Directory;
  moveToDirectory(dirPathOrDirectory: string | Directory, options?: DirectoryMoveOptions): this;
  move(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions): this;
  moveImmediately(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions): Promise<this>;
  moveImmediatelySync(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions): this;
  clear(): void;
  clearImmediately(): Promise<void>;
  clearImmediatelySync(): void;
  delete(): void;
  deleteImmediately(): Promise<void>;
  deleteImmediatelySync(): void;
  forget(): void;
  save(): Promise<void>;
  saveSync(): void;
  getRelativePathTo(fileOrDirPath: string): string;
  getRelativePathTo(sourceFile: SourceFile): string;
  getRelativePathTo(directory: Directory): string;
  getRelativePathAsModuleSpecifierTo(filePath: string): string;
  getRelativePathAsModuleSpecifierTo(sourceFile: SourceFile): string;
  getRelativePathAsModuleSpecifierTo(directory: Directory): string;
  getProject(): Project;
  wasForgotten(): boolean;
}
export interface DirectoryAddOptions {
  recursive?: boolean;
}
export interface DirectoryCopyOptions extends SourceFileCopyOptions {
  includeUntrackedFiles?: boolean;
}
export declare class DirectoryEmitResult {
  #private;
  private constructor();
  getSkippedFilePaths(): StandardizedFilePath[];
  getOutputFilePaths(): StandardizedFilePath[];
}
export interface DirectoryMoveOptions extends SourceFileMoveOptions {
}
export declare class ManipulationError extends errors.InvalidOperationError {
  readonly filePath: string;
  readonly oldText: string;
  readonly newText: string;
  constructor(filePath: string, oldText: string, newText: string, errorMessage: string);
}
export declare class Project {
  #private;
  constructor(options?: ProjectOptions);
  get manipulationSettings(): ManipulationSettingsContainer;
  get compilerOptions(): CompilerOptionsContainer;
  resolveSourceFileDependencies(): SourceFile[];
  addDirectoryAtPathIfExists(dirPath: string, options?: DirectoryAddOptions): Directory | undefined;
  addDirectoryAtPath(dirPath: string, options?: DirectoryAddOptions): Directory;
  createDirectory(dirPath: string): Directory;
  getDirectoryOrThrow(dirPath: string, message?: string | (() => string)): Directory;
  getDirectory(dirPath: string): Directory | undefined;
  getDirectories(): Directory[];
  getRootDirectories(): Directory[];
  addSourceFilesAtPaths(fileGlobs: string | ReadonlyArray<string>): SourceFile[];
  addSourceFileAtPathIfExists(filePath: string): SourceFile | undefined;
  addSourceFileAtPath(filePath: string): SourceFile;
  addSourceFilesFromTsConfig(tsConfigFilePath: string): SourceFile[];
  createSourceFile(filePath: string, sourceFileText?: string | OptionalKind<SourceFileStructure> | WriterFunction, options?: SourceFileCreateOptions): SourceFile;
  removeSourceFile(sourceFile: SourceFile): boolean;
  getSourceFileOrThrow(fileNameOrPath: string): SourceFile;
  getSourceFileOrThrow(searchFunction: (file: SourceFile) => boolean): SourceFile;
  getSourceFile(fileNameOrPath: string): SourceFile | undefined;
  getSourceFile(searchFunction: (file: SourceFile) => boolean): SourceFile | undefined;
  getSourceFiles(): SourceFile[];
  getSourceFiles(globPattern: string): SourceFile[];
  getSourceFiles(globPatterns: ReadonlyArray<string>): SourceFile[];
  getAmbientModule(moduleName: string): Symbol | undefined;
  getAmbientModuleOrThrow(moduleName: string, message?: string | (() => string)): Symbol;
  getAmbientModules(): Symbol[];
  save(): Promise<void>;
  saveSync(): void;
  enableLogging(enabled?: boolean): void;
  getPreEmitDiagnostics(): Diagnostic[];
  getLanguageService(): LanguageService;
  getProgram(): Program;
  getTypeChecker(): TypeChecker;
  getFileSystem(): FileSystemHost;
  emit(emitOptions?: EmitOptions): Promise<EmitResult>;
  emitSync(emitOptions?: EmitOptions): EmitResult;
  emitToMemory(emitOptions?: EmitOptions): MemoryEmitResult;
  getCompilerOptions(): CompilerOptions;
  getConfigFileParsingDiagnostics(): Diagnostic[];
  createWriter(): CodeBlockWriter;
  forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => T): T;
  forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => Promise<T>): Promise<T>;
  formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<Diagnostic>, opts?: {
        newLineChar?: "\n" | "\r\n";
    }): string;
  getModuleResolutionHost(): ts.ModuleResolutionHost;
}
export interface ProjectOptions {
  compilerOptions?: CompilerOptions;
  tsConfigFilePath?: string;
  defaultCompilerOptions?: CompilerOptions;
  skipAddingFilesFromTsConfig?: boolean;
  skipFileDependencyResolution?: boolean;
  skipLoadingLibFiles?: boolean;
  libFolderPath?: string;
  manipulationSettings?: Partial<ManipulationSettings>;
  useInMemoryFileSystem?: boolean;
  fileSystem?: FileSystemHost;
  resolutionHost?: ResolutionHostFactory;
}
export interface SourceFileCreateOptions {
  overwrite?: boolean;
  scriptKind?: ScriptKind;
}
export type Constructor<T> = new (...args: any[]) => T;
export type InstanceOf<T> = T extends new (...args: any[]) => infer U ? U : never;
export type WriterFunction = (writer: CodeBlockWriter) => void;
export declare function createWrappedNode<T extends ts.Node = ts.Node>(node: T, opts?: CreateWrappedNodeOptions): CompilerNodeToWrappedType<T>;
export interface CreateWrappedNodeOptions {
  compilerOptions?: CompilerOptions;
  sourceFile?: ts.SourceFile;
  typeChecker?: ts.TypeChecker;
}
export declare function printNode(node: ts.Node, options?: PrintNodeOptions): string;
export declare function printNode(node: ts.Node, sourceFile: ts.SourceFile, options?: PrintNodeOptions): string;
export interface PrintNodeOptions {
  removeComments?: boolean;
  newLineKind?: NewLineKind;
  emitHint?: EmitHint;
  scriptKind?: ScriptKind;
}
export type SourceFileReferencingNodes = ImportDeclaration | ExportDeclaration | ImportEqualsDeclaration | CallExpression;
export interface CompilerOptionsFromTsConfigOptions {
  encoding?: string;
  fileSystem?: FileSystemHost;
}
export interface CompilerOptionsFromTsConfigResult {
  options: CompilerOptions;
  errors: Diagnostic[];
}
export declare function getCompilerOptionsFromTsConfig(filePath: string, options?: CompilerOptionsFromTsConfigOptions): CompilerOptionsFromTsConfigResult;
export declare class Writers {
  private constructor();
  static object(obj: {
        [key: string]: WriterFunctionOrValue | undefined;
    }): WriterFunction;
  static objectType(structure: TypeElementMemberedNodeStructure): WriterFunction;
  static unionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]): (writer: CodeBlockWriter) => void;
  static intersectionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]): (writer: CodeBlockWriter) => void;
  static assertion(type: WriterFunctionOrValue, assertionType: WriterFunctionOrValue): (writer: CodeBlockWriter) => void;
  static returnStatement(value: WriterFunctionOrValue): WriterFunction;
}
export type WriterFunctionOrValue = string | number | WriterFunction;
export type AssertionKey = Identifier | StringLiteral;
export type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName | PrivateIdentifier | NoSubstitutionTemplateLiteral | BigIntLiteral;
export type ModuleName = Identifier | StringLiteral;
export type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;
export type ArrayBindingElement = BindingElement | OmittedExpression;
export type BindingName = Identifier | BindingPattern;
export type BindingPattern = ObjectBindingPattern | ArrayBindingPattern;
export type BooleanLiteral = TrueLiteral | FalseLiteral;
export type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | Decorator | JsxCallLike | InstanceofExpression;
export type EntityNameExpression = Identifier | PropertyAccessExpression;
export type DeclarationName = PropertyName | JsxAttributeName | StringLiteralLike | ElementAccessExpression | BindingPattern | EntityNameExpression;
export type EntityName = Identifier | QualifiedName;
export type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;
export type JsxAttributeName = Identifier | JsxNamespacedName;
export type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;
export type JsxCallLike = JsxOpeningLikeElement | JsxOpeningFragment;
export type JsxOpeningLikeElement = JsxSelfClosingElement | JsxOpeningElement;
export type JsxTagNameExpression = Identifier | ThisExpression | JsxTagNamePropertyAccess | JsxNamespacedName;
export interface JsxTagNamePropertyAccess extends PropertyAccessExpression {
  getExpression(): Identifier | ThisExpression | JsxTagNamePropertyAccess;
}
export type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
export type CaseOrDefaultClause = CaseClause | DefaultClause;
export type ModuleReference = EntityName | ExternalModuleReference;
export type StringLiteralLike = StringLiteral | NoSubstitutionTemplateLiteral;
export type TypeElementTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration | IndexSignatureDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;
export type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;
export type LocalTargetDeclarations = SourceFile | ClassDeclaration | InterfaceDeclaration | EnumDeclaration | FunctionDeclaration | VariableDeclaration | TypeAliasDeclaration | ModuleDeclaration | ExportAssignment;
export type ExportedDeclarations = ClassDeclaration | InterfaceDeclaration | EnumDeclaration | FunctionDeclaration | VariableDeclaration | TypeAliasDeclaration | ModuleDeclaration | Expression | SourceFile;
export declare function AmbientableNode<T extends Constructor<AmbientableNodeExtensionType>>(Base: T): Constructor<AmbientableNode> & T;
export interface AmbientableNode {
  hasDeclareKeyword(): boolean;
  getDeclareKeyword(): Node | undefined;
  getDeclareKeywordOrThrow(message?: string | (() => string)): Node;
  isAmbient(): boolean;
  setHasDeclareKeyword(value?: boolean): this;
}
type AmbientableNodeExtensionType = Node & ModifierableNode;
export declare function ArgumentedNode<T extends Constructor<ArgumentedNodeExtensionType>>(Base: T): Constructor<ArgumentedNode> & T;
export interface ArgumentedNode {
  getArguments(): Node[];
  addArgument(argumentText: string | WriterFunction): Node;
  addArguments(argumentTexts: ReadonlyArray<string | WriterFunction> | WriterFunction): Node[];
  insertArgument(index: number, argumentText: string | WriterFunction): Node;
  insertArguments(index: number, argumentTexts: ReadonlyArray<string | WriterFunction> | WriterFunction): Node[];
  removeArgument(arg: Node): this;
  removeArgument(index: number): this;
}
type ArgumentedNodeExtensionType = Node<ts.Node & {
      arguments?: ts.NodeArray<ts.Node>;
  }>;
export declare function AsyncableNode<T extends Constructor<AsyncableNodeExtensionType>>(Base: T): Constructor<AsyncableNode> & T;
export interface AsyncableNode {
  isAsync(): boolean;
  getAsyncKeyword(): Node<ts.AsyncKeyword> | undefined;
  getAsyncKeywordOrThrow(message?: string | (() => string)): Node<ts.AsyncKeyword>;
  setIsAsync(value: boolean): this;
}
type AsyncableNodeExtensionType = Node & ModifierableNode;
export declare function AwaitableNode<T extends Constructor<AwaitableNodeExtensionType>>(Base: T): Constructor<AwaitableNode> & T;
export interface AwaitableNode {
  isAwaited(): boolean;
  getAwaitKeyword(): Node<ts.AwaitKeyword> | undefined;
  getAwaitKeywordOrThrow(message?: string | (() => string)): Node<ts.AwaitKeyword>;
  setIsAwaited(value: boolean): this;
}
type AwaitableNodeExtensionType = Node<ts.Node & {
      awaitModifier?: ts.AwaitKeyword;
  }>;
export declare function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T;
export interface BodiedNode {
  getBody(): Node;
  setBodyText(textOrWriterFunction: string | WriterFunction): this;
  getBodyText(): string;
}
type BodiedNodeExtensionType = Node<ts.Node & {
      body: ts.Node;
  }>;
export declare function BodyableNode<T extends Constructor<BodyableNodeExtensionType>>(Base: T): Constructor<BodyableNode> & T;
export interface BodyableNode {
  getBodyOrThrow(message?: string | (() => string)): Node;
  getBody(): Node | undefined;
  getBodyText(): string | undefined;
  hasBody(): boolean;
  setBodyText(textOrWriterFunction: string | WriterFunction): this;
  addBody(): this;
  removeBody(): this;
}
type BodyableNodeExtensionType = Node<ts.Node & {
      body?: ts.Node;
  }>;
export declare function ChildOrderableNode<T extends Constructor<ChildOrderableNodeExtensionType>>(Base: T): Constructor<ChildOrderableNode> & T;
export interface ChildOrderableNode {
  setOrder(order: number): this;
}
type ChildOrderableNodeExtensionType = Node;
export declare function DecoratableNode<T extends Constructor<DecoratableNodeExtensionType>>(Base: T): Constructor<DecoratableNode> & T;
export interface DecoratableNode {
  getDecorator(name: string): Decorator | undefined;
  getDecorator(findFunction: (declaration: Decorator) => boolean): Decorator | undefined;
  getDecoratorOrThrow(name: string): Decorator;
  getDecoratorOrThrow(findFunction: (declaration: Decorator) => boolean): Decorator;
  getDecorators(): Decorator[];
  addDecorator(structure: OptionalKind<DecoratorStructure>): Decorator;
  addDecorators(structures: ReadonlyArray<OptionalKind<DecoratorStructure>>): Decorator[];
  insertDecorator(index: number, structure: OptionalKind<DecoratorStructure>): Decorator;
  insertDecorators(index: number, structures: ReadonlyArray<OptionalKind<DecoratorStructure>>): Decorator[];
}
type DecoratableNodeExtensionType = Node<ts.Node> & ModifierableNode;
export declare function DotDotDotTokenableNode<T extends Constructor<DotDotDotTokenableNodeExtensionType>>(Base: T): Constructor<DotDotDotTokenableNode> & T;
export interface DotDotDotTokenableNode {
  getDotDotDotToken(): Node<ts.DotDotDotToken> | undefined;
  getDotDotDotTokenOrThrow(message?: string | (() => string)): Node<ts.DotDotDotToken>;
}
type DotDotDotTokenableNodeExtensionType = Node<ts.Node & {
      dotDotDotToken?: ts.DotDotDotToken;
  }>;
export declare function ExclamationTokenableNode<T extends Constructor<ExclamationTokenableNodeExtensionType>>(Base: T): Constructor<ExclamationTokenableNode> & T;
export interface ExclamationTokenableNode {
  hasExclamationToken(): boolean;
  getExclamationTokenNode(): Node<ts.ExclamationToken> | undefined;
  getExclamationTokenNodeOrThrow(message?: string | (() => string)): Node<ts.ExclamationToken>;
  setHasExclamationToken(value: boolean): this;
}
type ExclamationTokenableNodeExtensionType = Node<ts.Node & {
      exclamationToken?: ts.ExclamationToken;
  }>;
export declare function ExportableNode<T extends Constructor<ExportableNodeExtensionType>>(Base: T): Constructor<ExportableNode> & T;
export interface ExportableNode extends ExportGetableNode {
  setIsDefaultExport(value: boolean): this;
  setIsExported(value: boolean): this;
}
type ExportableNodeExtensionType = Node & ModifierableNode;
export declare function ExportGetableNode<T extends Constructor<ExportGetableNodeExtensionType>>(Base: T): Constructor<ExportGetableNode> & T;
export interface ExportGetableNode {
  hasExportKeyword(): boolean;
  getExportKeyword(): Node | undefined;
  getExportKeywordOrThrow(message?: string | (() => string)): Node;
  hasDefaultKeyword(): boolean;
  getDefaultKeyword(): Node | undefined;
  getDefaultKeywordOrThrow(message?: string | (() => string)): Node;
  isExported(): boolean;
  isDefaultExport(): boolean;
  isNamedExport(): boolean;
}
type ExportGetableNodeExtensionType = Node;
export declare function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T;
export interface ExtendsClauseableNode {
  getExtends(): ExpressionWithTypeArguments[];
  addExtends(texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
  addExtends(text: string): ExpressionWithTypeArguments;
  insertExtends(index: number, texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
  insertExtends(index: number, text: string): ExpressionWithTypeArguments;
  removeExtends(index: number): this;
  removeExtends(extendsNode: ExpressionWithTypeArguments): this;
}
type ExtendsClauseableNodeExtensionType = Node & HeritageClauseableNode;
export declare function GeneratorableNode<T extends Constructor<GeneratorableNodeExtensionType>>(Base: T): Constructor<GeneratorableNode> & T;
export interface GeneratorableNode {
  isGenerator(): boolean;
  getAsteriskToken(): Node<ts.AsteriskToken> | undefined;
  getAsteriskTokenOrThrow(message?: string | (() => string)): Node<ts.AsteriskToken>;
  setIsGenerator(value: boolean): this;
}
type GeneratorableNodeExtensionType = Node<ts.Node & {
      asteriskToken?: ts.AsteriskToken;
  }>;
export declare function HeritageClauseableNode<T extends Constructor<HeritageClauseableNodeExtensionType>>(Base: T): Constructor<HeritageClauseableNode> & T;
export interface HeritageClauseableNode {
  getHeritageClauses(): HeritageClause[];
  getHeritageClauseByKind(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword): HeritageClause | undefined;
  getHeritageClauseByKindOrThrow(kind: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword): HeritageClause;
}
type HeritageClauseableNodeExtensionType = Node<ts.Node & {
      heritageClauses?: ts.NodeArray<ts.HeritageClause>;
  }>;
export declare function ImplementsClauseableNode<T extends Constructor<ImplementsClauseableNodeExtensionType>>(Base: T): Constructor<ImplementsClauseableNode> & T;
export interface ImplementsClauseableNode {
  getImplements(): ExpressionWithTypeArguments[];
  addImplements(text: string): ExpressionWithTypeArguments;
  addImplements(text: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
  insertImplements(index: number, texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
  insertImplements(index: number, text: string): ExpressionWithTypeArguments;
  removeImplements(index: number): this;
  removeImplements(implementsNode: ExpressionWithTypeArguments): this;
}
type ImplementsClauseableNodeExtensionType = Node & HeritageClauseableNode;
export declare function InitializerExpressionableNode<T extends Constructor<InitializerExpressionableNodeExtensionType>>(Base: T): Constructor<InitializerExpressionableNode> & T;
export interface InitializerExpressionableNode extends InitializerExpressionGetableNode {
  removeInitializer(): this;
  setInitializer(textOrWriterFunction: string | WriterFunction): this;
}
type InitializerExpressionableNodeExtensionType = Node<ts.Node & {
      initializer?: ts.Expression;
  }>;
export declare function InitializerExpressionGetableNode<T extends Constructor<InitializerExpressionGetableNodeExtensionType>>(Base: T): Constructor<InitializerExpressionGetableNode> & T;
export interface InitializerExpressionGetableNode {
  hasInitializer(): boolean;
  getInitializer(): Expression | undefined;
  getInitializerIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
  getInitializerIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
  getInitializerOrThrow(message?: string | (() => string)): Expression;
}
type InitializerExpressionGetableNodeExtensionType = Node<ts.Node & {
      initializer?: ts.Expression;
  }>;
export declare function JSDocableNode<T extends Constructor<JSDocableNodeExtensionType>>(Base: T): Constructor<JSDocableNode> & T;
export interface JSDocableNode {
  getJsDocs(): JSDoc[];
  addJsDoc(structure: OptionalKind<JSDocStructure> | string | WriterFunction): JSDoc;
  addJsDocs(structures: ReadonlyArray<OptionalKind<JSDocStructure> | string | WriterFunction>): JSDoc[];
  insertJsDoc(index: number, structure: OptionalKind<JSDocStructure> | string | WriterFunction): JSDoc;
  insertJsDocs(index: number, structures: ReadonlyArray<OptionalKind<JSDocStructure> | string | WriterFunction>): JSDoc[];
}
type JSDocableNodeExtensionType = Node<ts.Node & {
      jsDoc?: ts.NodeArray<ts.JSDoc>;
  }>;
export declare function LiteralLikeNode<T extends Constructor<LiteralLikeNodeExtensionType>>(Base: T): Constructor<LiteralLikeNode> & T;
export interface LiteralLikeNode {
  getLiteralText(): string;
  isTerminated(): boolean;
  hasExtendedUnicodeEscape(): boolean;
}
type LiteralLikeNodeExtensionType = Node<ts.LiteralLikeNode>;
export declare function ModifierableNode<T extends Constructor<ModifierableNodeExtensionType>>(Base: T): Constructor<ModifierableNode> & T;
export interface ModifierableNode {
  getModifiers(): Node<ts.Modifier>[];
  getFirstModifierByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
  getFirstModifierByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  hasModifier(kind: SyntaxKind): boolean;
  hasModifier(text: ModifierTexts): boolean;
  toggleModifier(text: ModifierTexts, value?: boolean): this;
}
type ModifierableNodeExtensionType = Node;
export type ModifierTexts = "export" | "default" | "declare" | "abstract" | "public" | "protected" | "private" | "readonly" | "static" | "async" | "const" | "override" | "in" | "out" | "accessor";
export declare function ModuledNode<T extends Constructor<ModuledNodeExtensionType>>(Base: T): Constructor<ModuledNode> & T;
export interface ModuledNode {
  addImportDeclaration(structure: OptionalKind<ImportDeclarationStructure>): ImportDeclaration;
  addImportDeclarations(structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>): ImportDeclaration[];
  insertImportDeclaration(index: number, structure: OptionalKind<ImportDeclarationStructure>): ImportDeclaration;
  insertImportDeclarations(index: number, structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>): ImportDeclaration[];
  getImportDeclaration(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration | undefined;
  getImportDeclaration(moduleSpecifier: string): ImportDeclaration | undefined;
  getImportDeclarationOrThrow(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration;
  getImportDeclarationOrThrow(moduleSpecifier: string): ImportDeclaration;
  getImportDeclarations(): ImportDeclaration[];
  addExportDeclaration(structure: OptionalKind<ExportDeclarationStructure>): ExportDeclaration;
  addExportDeclarations(structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>>): ExportDeclaration[];
  insertExportDeclaration(index: number, structure: OptionalKind<ExportDeclarationStructure>): ExportDeclaration;
  insertExportDeclarations(index: number, structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>>): ExportDeclaration[];
  getExportDeclaration(condition: (exportDeclaration: ExportDeclaration) => boolean, message?: string | (() => string)): ExportDeclaration | undefined;
  getExportDeclaration(moduleSpecifier: string): ExportDeclaration | undefined;
  getExportDeclarationOrThrow(condition: (exportDeclaration: ExportDeclaration) => boolean, message?: string | (() => string)): ExportDeclaration;
  getExportDeclarationOrThrow(moduleSpecifier: string, message?: string | (() => string)): ExportDeclaration;
  getExportDeclarations(): ExportDeclaration[];
  addExportAssignment(structure: OptionalKind<ExportAssignmentStructure>): ExportAssignment;
  addExportAssignments(structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>>): ExportAssignment[];
  insertExportAssignment(index: number, structure: OptionalKind<ExportAssignmentStructure>): ExportAssignment;
  insertExportAssignments(index: number, structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>>): ExportAssignment[];
  getExportAssignment(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment | undefined;
  getExportAssignmentOrThrow(condition: (exportAssignment: ExportAssignment) => boolean, message?: string | (() => string)): ExportAssignment;
  getExportAssignments(): ExportAssignment[];
  getDefaultExportSymbol(): Symbol | undefined;
  getDefaultExportSymbolOrThrow(message?: string | (() => string)): Symbol;
  getExportSymbols(): Symbol[];
  getExportedDeclarations(): ReadonlyMap<string, ExportedDeclarations[]>;
  removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this;
}
type ModuledNodeExtensionType = Node<ts.SourceFile | ts.ModuleDeclaration> & StatementedNode;
export declare function BindingNamedNode<T extends Constructor<BindingNamedNodeExtensionType>>(Base: T): Constructor<BindingNamedNode> & T;
export interface BindingNamedNode extends BindingNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}
type BindingNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.BindingName>;
export type BindingNamedNodeSpecific = NamedNodeSpecificBase<BindingName>;
export declare function ImportAttributeNamedNode<T extends Constructor<ImportAttributeNamedNodeExtensionType>>(Base: T): Constructor<ImportAttributeNamedNode> & T;
export interface ImportAttributeNamedNode extends ImportAttributeNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}
type ImportAttributeNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.ImportAttributeName>;
export type ImportAttributeNamedNodeSpecific = NamedNodeSpecificBase<AssertionKey>;
export declare function ModuleNamedNode<T extends Constructor<ModuleNamedNodeExtensionType>>(Base: T): Constructor<ModuleNamedNode> & T;
export interface ModuleNamedNode extends ModuleNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}
type ModuleNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.ModuleName>;
export type ModuleNamedNodeSpecific = NamedNodeSpecificBase<ModuleName>;
export declare function NameableNode<T extends Constructor<NameableNodeExtensionType>>(Base: T): Constructor<NameableNode> & T;
export interface NameableNode extends NameableNodeSpecific, ReferenceFindableNode, RenameableNode {
}
type NameableNodeExtensionType = Node<ts.Node & {
      name?: ts.Identifier;
  }>;
export interface NameableNodeSpecific {
  getNameNode(): Identifier | undefined;
  getNameNodeOrThrow(message?: string | (() => string)): Identifier;
  getName(): string | undefined;
  getNameOrThrow(message?: string | (() => string)): string;
  removeName(): this;
}
export declare function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T;
export interface NamedNode extends NamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}
type NamedNodeExtensionType = NamedNodeBaseExtensionType<ts.Identifier>;
export type NamedNodeSpecific = NamedNodeSpecificBase<Identifier>;
export declare function NamedNodeBase<TCompilerNode extends ts.Node, U extends Constructor<NamedNodeBaseExtensionType<TCompilerNode>>>(Base: U): Constructor<NamedNodeSpecificBase<CompilerNodeToWrappedType<TCompilerNode>>> & U;
export interface NamedNodeSpecificBase<TNode extends Node> {
  getNameNode(): TNode;
  getName(): string;
}
type NamedNodeBaseExtensionType<TCompilerNode extends ts.Node> = Node<ts.Node & {
      name: TCompilerNode;
  }>;
export declare function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T;
export interface PropertyNamedNode extends PropertyNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}
type PropertyNamedNodeExtensionType = NamedNodeBaseExtensionType<ts.PropertyName>;
export type PropertyNamedNodeSpecific = NamedNodeSpecificBase<PropertyName>;
export declare function ReferenceFindableNode<T extends Constructor<ReferenceFindableNodeExtensionType>>(Base: T): Constructor<ReferenceFindableNode> & T;
export interface ReferenceFindableNode {
  findReferences(): ReferencedSymbol[];
  findReferencesAsNodes(): Node[];
}
type ReferenceFindableNodeExtensionType = Node<ts.Node & {
      name?: ts.PropertyName | ts.BindingName | ts.DeclarationName | ts.StringLiteral;
  }>;
export declare function RenameableNode<T extends Constructor<RenameableNodeExtensionType>>(Base: T): Constructor<RenameableNode> & T;
export interface RenameableNode {
  rename(newName: string, options?: RenameOptions): this;
}
type RenameableNodeExtensionType = Node<ts.Node>;
export declare function OverrideableNode<T extends Constructor<OverrideableNodeExtensionType>>(Base: T): Constructor<OverrideableNode> & T;
export interface OverrideableNode {
  hasOverrideKeyword(): boolean;
  getOverrideKeyword(): Node<ts.OverrideKeyword> | undefined;
  getOverrideKeywordOrThrow(message?: string | (() => string)): Node<ts.Modifier>;
  setHasOverrideKeyword(value: boolean): this;
}
type OverrideableNodeExtensionType = Node & ModifierableNode;
export declare function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T;
export interface ParameteredNode {
  getParameter(name: string): ParameterDeclaration | undefined;
  getParameter(findFunction: (declaration: ParameterDeclaration) => boolean): ParameterDeclaration | undefined;
  getParameterOrThrow(name: string): ParameterDeclaration;
  getParameterOrThrow(findFunction: (declaration: ParameterDeclaration) => boolean): ParameterDeclaration;
  getParameters(): ParameterDeclaration[];
  addParameter(structure: OptionalKind<ParameterDeclarationStructure>): ParameterDeclaration;
  addParameters(structures: ReadonlyArray<OptionalKind<ParameterDeclarationStructure>>): ParameterDeclaration[];
  insertParameters(index: number, structures: ReadonlyArray<OptionalKind<ParameterDeclarationStructure>>): ParameterDeclaration[];
  insertParameter(index: number, structure: OptionalKind<ParameterDeclarationStructure>): ParameterDeclaration;
}
type ParameteredNodeExtensionType = Node<ts.Node & {
      parameters: ts.NodeArray<ts.ParameterDeclaration>;
  }>;
export declare function QuestionDotTokenableNode<T extends Constructor<QuestionDotTokenableNodeExtensionType>>(Base: T): Constructor<QuestionDotTokenableNode> & T;
export interface QuestionDotTokenableNode {
  hasQuestionDotToken(): boolean;
  getQuestionDotTokenNode(): Node<ts.QuestionDotToken> | undefined;
  getQuestionDotTokenNodeOrThrow(message?: string | (() => string)): Node<ts.QuestionDotToken>;
  setHasQuestionDotToken(value: boolean): this;
}
type QuestionDotTokenableNodeExtensionType = Node<ts.Node & {
      questionDotToken?: ts.QuestionDotToken;
  }>;
export declare function QuestionTokenableNode<T extends Constructor<QuestionTokenableNodeExtensionType>>(Base: T): Constructor<QuestionTokenableNode> & T;
export interface QuestionTokenableNode {
  hasQuestionToken(): boolean;
  getQuestionTokenNode(): Node<ts.QuestionToken> | undefined;
  getQuestionTokenNodeOrThrow(message?: string | (() => string)): Node<ts.QuestionToken>;
  setHasQuestionToken(value: boolean): this;
}
type QuestionTokenableNodeExtensionType = Node<ts.Node & {
      questionToken?: ts.QuestionToken;
  }>;
export declare function ReadonlyableNode<T extends Constructor<ReadonlyableNodeExtensionType>>(Base: T): Constructor<ReadonlyableNode> & T;
export interface ReadonlyableNode {
  isReadonly(): boolean;
  getReadonlyKeyword(): Node | undefined;
  getReadonlyKeywordOrThrow(message?: string | (() => string)): Node;
  setIsReadonly(value: boolean): this;
}
type ReadonlyableNodeExtensionType = Node & ModifierableNode;
export declare function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionType>>(Base: T): Constructor<ReturnTypedNode> & T;
export interface ReturnTypedNode {
  getReturnType(): Type;
  getReturnTypeNode(): TypeNode | undefined;
  getReturnTypeNodeOrThrow(message?: string | (() => string)): TypeNode;
  setReturnType(textOrWriterFunction: string | WriterFunction): this;
  removeReturnType(): this;
  getSignature(): Signature;
}
type ReturnTypedNodeExtensionType = Node<ts.SignatureDeclaration>;
export declare function ScopeableNode<T extends Constructor<ScopeableNodeExtensionType>>(Base: T): Constructor<ScopeableNode> & T;
export interface ScopeableNode {
  getScope(): Scope | undefined;
  setScope(scope: Scope | undefined): this;
  hasScopeKeyword(): boolean;
}
type ScopeableNodeExtensionType = Node & ModifierableNode;
export declare function ScopedNode<T extends Constructor<ScopedNodeExtensionType>>(Base: T): Constructor<ScopedNode> & T;
export interface ScopedNode {
  getScope(): Scope;
  setScope(scope: Scope | undefined): this;
  hasScopeKeyword(): boolean;
}
type ScopedNodeExtensionType = Node & ModifierableNode;
export declare function SignaturedDeclaration<T extends Constructor<SignaturedDeclarationExtensionType>>(Base: T): Constructor<SignaturedDeclaration> & T;
export interface SignaturedDeclaration extends ParameteredNode, ReturnTypedNode {
}
type SignaturedDeclarationExtensionType = Node<ts.SignatureDeclaration>;
export declare function StaticableNode<T extends Constructor<StaticableNodeExtensionType>>(Base: T): Constructor<StaticableNode> & T;
export interface StaticableNode {
  isStatic(): boolean;
  getStaticKeyword(): Node | undefined;
  getStaticKeywordOrThrow(message?: string | (() => string)): Node;
  setIsStatic(value: boolean): this;
}
type StaticableNodeExtensionType = Node & ModifierableNode;
export declare function TextInsertableNode<T extends Constructor<TextInsertableNodeExtensionType>>(Base: T): Constructor<TextInsertableNode> & T;
export interface TextInsertableNode {
  insertText(pos: number, textOrWriterFunction: string | WriterFunction): this;
  replaceText(range: [number, number], textOrWriterFunction: string | WriterFunction): this;
  removeText(): this;
  removeText(pos: number, end: number): this;
}
type TextInsertableNodeExtensionType = Node;
export declare function TypeArgumentedNode<T extends Constructor<TypeArgumentedNodeExtensionType>>(Base: T): Constructor<TypeArgumentedNode> & T;
export interface TypeArgumentedNode {
  getTypeArguments(): TypeNode[];
  addTypeArgument(argumentText: string): TypeNode;
  addTypeArguments(argumentTexts: ReadonlyArray<string>): TypeNode[];
  insertTypeArgument(index: number, argumentText: string): TypeNode;
  insertTypeArguments(index: number, argumentTexts: ReadonlyArray<string>): TypeNode[];
  removeTypeArgument(typeArg: Node): this;
  removeTypeArgument(index: number): this;
}
type TypeArgumentedNodeExtensionType = Node<ts.Node & {
      typeArguments?: ts.NodeArray<ts.TypeNode>;
  }>;
export declare function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T;
export interface TypedNode {
  getTypeNode(): TypeNode | undefined;
  getTypeNodeOrThrow(message?: string | (() => string)): TypeNode;
  setType(textOrWriterFunction: string | WriterFunction): this;
  removeType(): this;
}
type TypedNodeExtensionType = Node<ts.Node & {
      type?: ts.TypeNode;
  }>;
export declare function TypeElementMemberedNode<T extends Constructor<TypeElementMemberedNodeExtensionType>>(Base: T): Constructor<TypeElementMemberedNode> & T;
export interface TypeElementMemberedNode {
  addMember(member: string | WriterFunction | TypeElementMemberStructures): TypeElementTypes | CommentTypeElement;
  addMembers(members: string | WriterFunction | ReadonlyArray<string | WriterFunction | TypeElementMemberStructures>): (TypeElementTypes | CommentTypeElement)[];
  insertMember(index: number, member: string | WriterFunction | TypeElementMemberStructures): TypeElementTypes | CommentTypeElement;
  insertMembers(index: number, members: string | WriterFunction | ReadonlyArray<string | WriterFunction | TypeElementMemberStructures>): (TypeElementTypes | CommentTypeElement)[];
  addConstructSignature(structure: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclaration;
  addConstructSignatures(structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>): ConstructSignatureDeclaration[];
  insertConstructSignature(index: number, structure: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclaration;
  insertConstructSignatures(index: number, structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>): ConstructSignatureDeclaration[];
  getConstructSignature(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration | undefined;
  getConstructSignatureOrThrow(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration;
  getConstructSignatures(): ConstructSignatureDeclaration[];
  addCallSignature(structure: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclaration;
  addCallSignatures(structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[];
  insertCallSignature(index: number, structure: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclaration;
  insertCallSignatures(index: number, structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[];
  getCallSignature(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration | undefined;
  getCallSignatureOrThrow(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration;
  getCallSignatures(): CallSignatureDeclaration[];
  addIndexSignature(structure: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclaration;
  addIndexSignatures(structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[];
  insertIndexSignature(index: number, structure: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclaration;
  insertIndexSignatures(index: number, structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[];
  getIndexSignature(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration | undefined;
  getIndexSignatureOrThrow(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration;
  getIndexSignatures(): IndexSignatureDeclaration[];
  addMethod(structure: OptionalKind<MethodSignatureStructure>): MethodSignature;
  addMethods(structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[];
  insertMethod(index: number, structure: OptionalKind<MethodSignatureStructure>): MethodSignature;
  insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[];
  getMethod(name: string): MethodSignature | undefined;
  getMethod(findFunction: (member: MethodSignature) => boolean): MethodSignature | undefined;
  getMethodOrThrow(name: string): MethodSignature;
  getMethodOrThrow(findFunction: (member: MethodSignature) => boolean): MethodSignature;
  getMethods(): MethodSignature[];
  addProperty(structure: OptionalKind<PropertySignatureStructure>): PropertySignature;
  addProperties(structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[];
  insertProperty(index: number, structure: OptionalKind<PropertySignatureStructure>): PropertySignature;
  insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[];
  getProperty(name: string): PropertySignature | undefined;
  getProperty(findFunction: (member: PropertySignature) => boolean): PropertySignature | undefined;
  getPropertyOrThrow(name: string): PropertySignature;
  getPropertyOrThrow(findFunction: (member: PropertySignature) => boolean): PropertySignature;
  getProperties(): PropertySignature[];
  addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  getGetAccessor(name: string): GetAccessorDeclaration | undefined;
  getGetAccessor(findFunction: (member: GetAccessorDeclaration) => boolean): GetAccessorDeclaration | undefined;
  getGetAccessorOrThrow(name: string): GetAccessorDeclaration;
  getGetAccessorOrThrow(findFunction: (member: GetAccessorDeclaration) => boolean): GetAccessorDeclaration;
  getGetAccessors(): GetAccessorDeclaration[];
  addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  getSetAccessor(name: string): SetAccessorDeclaration | undefined;
  getSetAccessor(findFunction: (member: SetAccessorDeclaration) => boolean): SetAccessorDeclaration | undefined;
  getSetAccessorOrThrow(name: string): SetAccessorDeclaration;
  getSetAccessorOrThrow(findFunction: (member: SetAccessorDeclaration) => boolean): SetAccessorDeclaration;
  getSetAccessors(): SetAccessorDeclaration[];
  getMembers(): TypeElementTypes[];
  getMembersWithComments(): (TypeElementTypes | CommentTypeElement)[];
}
type TypeElementMemberedNodeExtensionType = Node<ts.Node & {
      members: ts.NodeArray<ts.TypeElement>;
  }>;
export declare function TypeParameteredNode<T extends Constructor<TypeParameteredNodeExtensionType>>(Base: T): Constructor<TypeParameteredNode> & T;
export interface TypeParameteredNode {
  getTypeParameter(name: string): TypeParameterDeclaration | undefined;
  getTypeParameter(findFunction: (declaration: TypeParameterDeclaration) => boolean): TypeParameterDeclaration | undefined;
  getTypeParameterOrThrow(name: string): TypeParameterDeclaration;
  getTypeParameterOrThrow(findFunction: (declaration: TypeParameterDeclaration) => boolean): TypeParameterDeclaration;
  getTypeParameters(): TypeParameterDeclaration[];
  addTypeParameter(structure: OptionalKind<TypeParameterDeclarationStructure> | string): TypeParameterDeclaration;
  addTypeParameters(structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string>): TypeParameterDeclaration[];
  insertTypeParameter(index: number, structure: OptionalKind<TypeParameterDeclarationStructure> | string): TypeParameterDeclaration;
  insertTypeParameters(index: number, structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string>): TypeParameterDeclaration[];
}
type TypeParameteredNodeExtensionType = Node<ts.Node & {
      typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>;
  }>;
export declare function UnwrappableNode<T extends Constructor<UnwrappableNodeExtensionType>>(Base: T): Constructor<UnwrappableNode> & T;
export interface UnwrappableNode {
  unwrap(): void;
}
type UnwrappableNodeExtensionType = Node;
export declare class ArrayBindingPattern extends Node<ts.ArrayBindingPattern> {
  getElements(): (BindingElement | OmittedExpression)[];
  getParent(): NodeParentType<ts.ArrayBindingPattern>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ArrayBindingPattern>>;
}
declare const BindingElementBase: Constructor<DotDotDotTokenableNode> & Constructor<InitializerExpressionableNode> & Constructor<BindingNamedNode> & typeof Node;
export declare class BindingElement extends BindingElementBase<ts.BindingElement> {
  getPropertyNameNodeOrThrow(message?: string | (() => string)): PropertyName;
  getPropertyNameNode(): PropertyName | undefined;
  getParent(): NodeParentType<ts.BindingElement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.BindingElement>>;
}
export declare class ObjectBindingPattern extends Node<ts.ObjectBindingPattern> {
  getElements(): BindingElement[];
  getParent(): NodeParentType<ts.ObjectBindingPattern>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ObjectBindingPattern>>;
}
export declare function AbstractableNode<T extends Constructor<AbstractableNodeExtensionType>>(Base: T): Constructor<AbstractableNode> & T;
export interface AbstractableNode {
  isAbstract(): boolean;
  getAbstractKeyword(): Node | undefined;
  getAbstractKeywordOrThrow(message?: string | (() => string)): Node;
  setIsAbstract(isAbstract: boolean): this;
}
type AbstractableNodeExtensionType = Node & ModifierableNode;
export declare function ClassLikeDeclarationBase<T extends Constructor<ClassLikeDeclarationBaseExtensionType>>(Base: T): Constructor<ClassLikeDeclarationBase> & T;
export interface ClassLikeDeclarationBase extends NameableNode, TextInsertableNode, ImplementsClauseableNode, HeritageClauseableNode, AbstractableNode, JSDocableNode, TypeParameteredNode, DecoratableNode, ModifierableNode, ClassLikeDeclarationBaseSpecific {
}
declare function ClassLikeDeclarationBaseSpecific<T extends Constructor<ClassLikeDeclarationBaseSpecificExtensionType>>(Base: T): Constructor<ClassLikeDeclarationBaseSpecific> & T;
interface ClassLikeDeclarationBaseSpecific {
  setExtends(text: string | WriterFunction): this;
  removeExtends(): this;
  getExtendsOrThrow(message?: string | (() => string)): ExpressionWithTypeArguments;
  getExtends(): ExpressionWithTypeArguments | undefined;
  addMember(member: string | WriterFunction | ClassMemberStructures): ClassMemberTypes | CommentClassElement;
  addMembers(members: string | WriterFunction | ReadonlyArray<string | WriterFunction | ClassMemberStructures>): (ClassMemberTypes | CommentClassElement)[];
  insertMember(index: number, member: string | WriterFunction | ClassMemberStructures): ClassMemberTypes | CommentClassElement;
  insertMembers(index: number, members: string | WriterFunction | ReadonlyArray<string | WriterFunction | ClassMemberStructures>): (ClassMemberTypes | CommentClassElement)[];
  addConstructor(structure?: OptionalKind<ConstructorDeclarationStructure>): ConstructorDeclaration;
  addConstructors(structures: ReadonlyArray<OptionalKind<ConstructorDeclarationStructure>>): ConstructorDeclaration[];
  insertConstructor(index: number, structure?: OptionalKind<ConstructorDeclarationStructure>): ConstructorDeclaration;
  insertConstructors(index: number, structures: ReadonlyArray<OptionalKind<ConstructorDeclarationStructure>>): ConstructorDeclaration[];
  getConstructors(): ConstructorDeclaration[];
  addStaticBlock(structure?: OptionalKind<ClassStaticBlockDeclarationStructure>): ClassStaticBlockDeclaration;
  addStaticBlocks(structures: ReadonlyArray<OptionalKind<ClassStaticBlockDeclarationStructure>>): ClassStaticBlockDeclaration[];
  insertStaticBlock(index: number, structure?: OptionalKind<ClassStaticBlockDeclarationStructure>): ClassStaticBlockDeclaration;
  insertStaticBlocks(index: number, structures: ReadonlyArray<OptionalKind<ClassStaticBlockDeclarationStructure>>): ClassStaticBlockDeclaration[];
  getStaticBlocks(): ClassStaticBlockDeclaration[];
  addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  addProperty(structure: OptionalKind<PropertyDeclarationStructure>): PropertyDeclaration;
  addProperties(structures: ReadonlyArray<OptionalKind<PropertyDeclarationStructure>>): PropertyDeclaration[];
  insertProperty(index: number, structure: OptionalKind<PropertyDeclarationStructure>): PropertyDeclaration;
  insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertyDeclarationStructure>>): PropertyDeclaration[];
  addMethod(structure: OptionalKind<MethodDeclarationStructure>): MethodDeclaration;
  addMethods(structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>): MethodDeclaration[];
  insertMethod(index: number, structure: OptionalKind<MethodDeclarationStructure>): MethodDeclaration;
  insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>): MethodDeclaration[];
  getInstanceProperty(name: string): ClassInstancePropertyTypes | undefined;
  getInstanceProperty(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes | undefined;
  getInstancePropertyOrThrow(name: string): ClassInstancePropertyTypes;
  getInstancePropertyOrThrow(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes;
  getInstanceProperties(): ClassInstancePropertyTypes[];
  getStaticProperty(name: string): ClassStaticPropertyTypes | undefined;
  getStaticProperty(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes | undefined;
  getStaticPropertyOrThrow(name: string): ClassStaticPropertyTypes;
  getStaticPropertyOrThrow(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes;
  getStaticProperties(): ClassStaticPropertyTypes[];
  getProperty(name: string): PropertyDeclaration | undefined;
  getProperty(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration | undefined;
  getPropertyOrThrow(name: string): PropertyDeclaration;
  getPropertyOrThrow(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration;
  getProperties(): PropertyDeclaration[];
  getGetAccessor(name: string): GetAccessorDeclaration | undefined;
  getGetAccessor(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration | undefined;
  getGetAccessorOrThrow(name: string): GetAccessorDeclaration;
  getGetAccessorOrThrow(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration;
  getGetAccessors(): GetAccessorDeclaration[];
  getSetAccessor(name: string): SetAccessorDeclaration | undefined;
  getSetAccessor(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration | undefined;
  getSetAccessorOrThrow(name: string): SetAccessorDeclaration;
  getSetAccessorOrThrow(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration;
  getSetAccessors(): SetAccessorDeclaration[];
  getMethod(name: string): MethodDeclaration | undefined;
  getMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
  getMethodOrThrow(name: string): MethodDeclaration;
  getMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
  getMethods(): MethodDeclaration[];
  getInstanceMethod(name: string): MethodDeclaration | undefined;
  getInstanceMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
  getInstanceMethodOrThrow(name: string): MethodDeclaration;
  getInstanceMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
  getInstanceMethods(): MethodDeclaration[];
  getStaticMethod(name: string): MethodDeclaration | undefined;
  getStaticMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
  getStaticMethodOrThrow(name: string): MethodDeclaration;
  getStaticMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
  getStaticMethods(): MethodDeclaration[];
  getInstanceMember(name: string): ClassInstanceMemberTypes | undefined;
  getInstanceMember(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes | undefined;
  getInstanceMemberOrThrow(name: string): ClassInstanceMemberTypes;
  getInstanceMemberOrThrow(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes;
  getInstanceMembers(): ClassInstanceMemberTypes[];
  getStaticMember(name: string): ClassStaticMemberTypes | undefined;
  getStaticMember(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes | undefined;
  getStaticMemberOrThrow(name: string): ClassStaticMemberTypes;
  getStaticMemberOrThrow(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes;
  getStaticMembers(): ClassStaticMemberTypes[];
  getMembers(): ClassMemberTypes[];
  getMembersWithComments(): (ClassMemberTypes | CommentClassElement)[];
  getMember(name: string): ClassMemberTypes | undefined;
  getMember(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes | undefined;
  getMemberOrThrow(name: string): ClassMemberTypes;
  getMemberOrThrow(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes;
  getBaseTypes(): Type[];
  getBaseClassOrThrow(message?: string | (() => string)): ClassDeclaration;
  getBaseClass(): ClassDeclaration | undefined;
  getDerivedClasses(): ClassDeclaration[];
}
export type ClassPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;
export type ClassInstancePropertyTypes = ClassPropertyTypes | ParameterDeclaration;
export type ClassInstanceMemberTypes = MethodDeclaration | ClassInstancePropertyTypes;
export type ClassStaticPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;
export type ClassStaticMemberTypes = MethodDeclaration | ClassStaticBlockDeclaration | ClassStaticPropertyTypes;
export type ClassMemberTypes = MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration | ClassStaticBlockDeclaration;
type ClassLikeDeclarationBaseExtensionType = Node<ts.ClassLikeDeclarationBase>;
type ClassLikeDeclarationBaseSpecificExtensionType = Node<ts.ClassLikeDeclarationBase> & HeritageClauseableNode & ModifierableNode & NameableNode;
declare const ClassDeclarationBase: Constructor<ModuleChildableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ClassLikeDeclarationBase> & typeof Statement;
export declare class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
  set(structure: Partial<ClassDeclarationStructure>): this;
  getStructure(): ClassDeclarationStructure;
  extractInterface(name?: string): InterfaceDeclarationStructure;
  extractStaticInterface(name: string): InterfaceDeclarationStructure;
  getParent(): NodeParentType<ts.ClassDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ClassDeclaration>>;
}
export declare class ClassElement<T extends ts.ClassElement = ts.ClassElement> extends Node<T> {
  remove(): void;
}
declare const ClassExpressionBase: Constructor<ClassLikeDeclarationBase> & typeof PrimaryExpression;
export declare class ClassExpression extends ClassExpressionBase<ts.ClassExpression> {
  getParent(): NodeParentType<ts.ClassExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ClassExpression>>;
}
declare const ClassStaticBlockDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<StatementedNode> & Constructor<JSDocableNode> & Constructor<BodiedNode> & typeof ClassElement;
export declare class ClassStaticBlockDeclaration extends ClassStaticBlockDeclarationBase<ts.ClassStaticBlockDeclaration> {
  getName(): "static";
  isStatic(): true;
  set(structure: Partial<ClassStaticBlockDeclarationStructure>): this;
  getStructure(): ClassStaticBlockDeclarationStructure;
  getParent(): NodeParentType<ts.ClassStaticBlockDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ClassStaticBlockDeclaration>>;
}
export declare class CommentClassElement extends ClassElement<CompilerCommentClassElement> {
}
declare const ConstructorDeclarationBase: Constructor<ReferenceFindableNode> & Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<OverloadableNode> & Constructor<ScopedNode> & Constructor<FunctionLikeDeclaration> & Constructor<BodyableNode> & typeof ClassElement;
declare const ConstructorDeclarationOverloadBase: Constructor<TypeParameteredNode> & Constructor<JSDocableNode> & Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<ScopedNode> & Constructor<ModifierableNode> & Constructor<SignaturedDeclaration> & typeof ClassElement;
export declare class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
  set(structure: Partial<ConstructorDeclarationStructure>): this;
  addOverload(structure: OptionalKind<ConstructorDeclarationOverloadStructure>): ConstructorDeclaration;
  addOverloads(structures: ReadonlyArray<OptionalKind<ConstructorDeclarationOverloadStructure>>): ConstructorDeclaration[];
  insertOverload(index: number, structure: OptionalKind<ConstructorDeclarationOverloadStructure>): ConstructorDeclaration;
  insertOverloads(index: number, structures: ReadonlyArray<OptionalKind<ConstructorDeclarationOverloadStructure>>): ConstructorDeclaration[];
  getStructure(): ConstructorDeclarationStructure | ConstructorDeclarationOverloadStructure;
  getParent(): NodeParentType<ts.ConstructorDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ConstructorDeclaration>>;
}
declare const GetAccessorDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<StaticableNode> & Constructor<FunctionLikeDeclaration> & Constructor<BodyableNode> & Constructor<PropertyNamedNode> & typeof ClassElement;
export declare class GetAccessorDeclaration extends GetAccessorDeclarationBase<ts.GetAccessorDeclaration> {
  set(structure: Partial<GetAccessorDeclarationStructure>): this;
  getSetAccessor(): SetAccessorDeclaration | undefined;
  getSetAccessorOrThrow(message?: string | (() => string)): SetAccessorDeclaration;
  getStructure(): GetAccessorDeclarationStructure;
  getParent(): NodeParentType<ts.GetAccessorDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.GetAccessorDeclaration>>;
}
declare const MethodDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<OverrideableNode> & Constructor<OverloadableNode> & Constructor<BodyableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<QuestionTokenableNode> & Constructor<StaticableNode> & Constructor<AsyncableNode> & Constructor<GeneratorableNode> & Constructor<FunctionLikeDeclaration> & Constructor<PropertyNamedNode> & typeof ClassElement;
declare const MethodDeclarationOverloadBase: Constructor<JSDocableNode> & Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<OverrideableNode> & Constructor<ScopedNode> & Constructor<TypeParameteredNode> & Constructor<AbstractableNode> & Constructor<QuestionTokenableNode> & Constructor<StaticableNode> & Constructor<AsyncableNode> & Constructor<ModifierableNode> & Constructor<GeneratorableNode> & Constructor<SignaturedDeclaration> & typeof ClassElement;
export declare class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
  set(structure: Partial<MethodDeclarationStructure>): this;
  addOverload(structure: OptionalKind<MethodDeclarationOverloadStructure>): MethodDeclaration;
  addOverloads(structures: ReadonlyArray<OptionalKind<MethodDeclarationOverloadStructure>>): MethodDeclaration[];
  insertOverload(index: number, structure: OptionalKind<MethodDeclarationOverloadStructure>): MethodDeclaration;
  insertOverloads(index: number, structures: ReadonlyArray<OptionalKind<MethodDeclarationOverloadStructure>>): MethodDeclaration[];
  getStructure(): MethodDeclarationStructure | MethodDeclarationOverloadStructure;
  getParent(): NodeParentType<ts.MethodDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.MethodDeclaration>>;
}
declare const PropertyDeclarationBase: Constructor<ChildOrderableNode> & Constructor<OverrideableNode> & Constructor<AmbientableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<StaticableNode> & Constructor<JSDocableNode> & Constructor<ReadonlyableNode> & Constructor<ExclamationTokenableNode> & Constructor<QuestionTokenableNode> & Constructor<InitializerExpressionableNode> & Constructor<TypedNode> & Constructor<PropertyNamedNode> & Constructor<ModifierableNode> & typeof ClassElement;
export declare class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
  hasAccessorKeyword(): boolean;
  setHasAccessorKeyword(value: boolean): this;
  set(structure: Partial<PropertyDeclarationStructure>): this;
  remove(): void;
  getStructure(): PropertyDeclarationStructure;
  getParent(): NodeParentType<ts.PropertyDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.PropertyDeclaration>>;
}
declare const SetAccessorDeclarationBase: Constructor<ChildOrderableNode> & Constructor<TextInsertableNode> & Constructor<DecoratableNode> & Constructor<AbstractableNode> & Constructor<ScopedNode> & Constructor<StaticableNode> & Constructor<FunctionLikeDeclaration> & Constructor<BodyableNode> & Constructor<PropertyNamedNode> & typeof ClassElement;
export declare class SetAccessorDeclaration extends SetAccessorDeclarationBase<ts.SetAccessorDeclaration> {
  set(structure: Partial<SetAccessorDeclarationStructure>): this;
  getGetAccessor(): GetAccessorDeclaration | undefined;
  getGetAccessorOrThrow(message?: string | (() => string)): GetAccessorDeclaration;
  getStructure(): SetAccessorDeclarationStructure;
  getParent(): NodeParentType<ts.SetAccessorDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SetAccessorDeclaration>>;
}
export declare class CommentRange extends TextRange<ts.CommentRange> {
  private constructor();
  getKind(): ts.CommentKind;
}
export declare abstract class CompilerCommentNode implements ts.Node {
  #private;
  pos: number;
  end: number;
  kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
  flags: ts.NodeFlags;
  modifiers?: ts.NodeArray<ts.Modifier> | undefined;
  parent: ts.Node;
  protected constructor();
  getSourceFile(): ts.SourceFile;
  getChildCount(sourceFile?: ts.SourceFile | undefined): number;
  getChildAt(index: number, sourceFile?: ts.SourceFile | undefined): ts.Node;
  getChildren(sourceFile?: ts.SourceFile | undefined): ts.Node[];
  getStart(sourceFile?: ts.SourceFile | undefined, includeJsDocComment?: boolean | undefined): number;
  getFullStart(): number;
  getEnd(): number;
  getWidth(sourceFile?: ts.SourceFileLike | undefined): number;
  getFullWidth(): number;
  getLeadingTriviaWidth(sourceFile?: ts.SourceFile | undefined): number;
  getFullText(sourceFile?: ts.SourceFile | undefined): string;
  getText(sourceFile?: ts.SourceFile | undefined): string;
  getFirstToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined;
  getLastToken(sourceFile?: ts.SourceFile | undefined): ts.Node | undefined;
  forEachChild<T>(cbNode: (node: ts.Node) => T | undefined, cbNodeArray?: ((nodes: ts.NodeArray<ts.Node>) => T | undefined) | undefined): T | undefined;
}
export declare class CompilerCommentStatement extends CompilerCommentNode implements ts.Statement {
  _jsdocContainerBrand: any;
  _statementBrand: any;
}
export declare class CompilerCommentClassElement extends CompilerCommentNode implements ts.ClassElement {
  _classElementBrand: any;
  _declarationBrand: any;
}
export declare class CompilerCommentTypeElement extends CompilerCommentNode implements ts.TypeElement {
  _typeElementBrand: any;
  _declarationBrand: any;
}
export declare class CompilerCommentObjectLiteralElement extends CompilerCommentNode implements ts.ObjectLiteralElement {
  _declarationBrand: any;
  _objectLiteralBrand: any;
  declarationBrand: any;
}
export declare class CompilerCommentEnumMember extends CompilerCommentNode implements ts.Node {
}
export type NodePropertyToWrappedType<NodeType extends ts.Node, KeyName extends keyof NodeType, NonNullableNodeType = NonNullable<NodeType[KeyName]>> = NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeTypeForNullable> | undefined ? CompilerNodeToWrappedType<ArrayNodeTypeForNullable>[] | undefined : NodeType[KeyName] extends ts.NodeArray<infer ArrayNodeType> ? CompilerNodeToWrappedType<ArrayNodeType>[] : NodeType[KeyName] extends ts.Node ? CompilerNodeToWrappedType<NodeType[KeyName]> : NonNullableNodeType extends ts.Node ? CompilerNodeToWrappedType<NonNullableNodeType> | undefined : NodeType[KeyName];
export type NodeParentType<NodeType extends ts.Node> = NodeType extends ts.SourceFile ? undefined : ts.Node extends NodeType ? CompilerNodeToWrappedType<NodeType["parent"]> | undefined : CompilerNodeToWrappedType<NodeType["parent"]>;
export declare class Node<NodeType extends ts.Node = ts.Node> {
  #private;
  static readonly isAnyKeyword: (node: Node | undefined) => node is Expression;
  static readonly isArrayBindingPattern: (node: Node | undefined) => node is ArrayBindingPattern;
  static readonly isArrayLiteralExpression: (node: Node | undefined) => node is ArrayLiteralExpression;
  static readonly isArrowFunction: (node: Node | undefined) => node is ArrowFunction;
  static readonly isAsExpression: (node: Node | undefined) => node is AsExpression;
  static readonly isAwaitExpression: (node: Node | undefined) => node is AwaitExpression;
  static readonly isBigIntLiteral: (node: Node | undefined) => node is BigIntLiteral;
  static readonly isBinaryExpression: (node: Node | undefined) => node is BinaryExpression;
  static readonly isBindingElement: (node: Node | undefined) => node is BindingElement;
  static readonly isBlock: (node: Node | undefined) => node is Block;
  static readonly isBooleanKeyword: (node: Node | undefined) => node is Expression;
  static readonly isBreakStatement: (node: Node | undefined) => node is BreakStatement;
  static readonly isCallExpression: (node: Node | undefined) => node is CallExpression;
  static readonly isCaseBlock: (node: Node | undefined) => node is CaseBlock;
  static readonly isCaseClause: (node: Node | undefined) => node is CaseClause;
  static readonly isCatchClause: (node: Node | undefined) => node is CatchClause;
  static readonly isClassDeclaration: (node: Node | undefined) => node is ClassDeclaration;
  static readonly isClassExpression: (node: Node | undefined) => node is ClassExpression;
  static readonly isClassStaticBlockDeclaration: (node: Node | undefined) => node is ClassStaticBlockDeclaration;
  static readonly isCommaListExpression: (node: Node | undefined) => node is CommaListExpression;
  static readonly isComputedPropertyName: (node: Node | undefined) => node is ComputedPropertyName;
  static readonly isConditionalExpression: (node: Node | undefined) => node is ConditionalExpression;
  static readonly isContinueStatement: (node: Node | undefined) => node is ContinueStatement;
  static readonly isDebuggerStatement: (node: Node | undefined) => node is DebuggerStatement;
  static readonly isDecorator: (node: Node | undefined) => node is Decorator;
  static readonly isDefaultClause: (node: Node | undefined) => node is DefaultClause;
  static readonly isDeleteExpression: (node: Node | undefined) => node is DeleteExpression;
  static readonly isDoStatement: (node: Node | undefined) => node is DoStatement;
  static readonly isElementAccessExpression: (node: Node | undefined) => node is ElementAccessExpression;
  static readonly isEmptyStatement: (node: Node | undefined) => node is EmptyStatement;
  static readonly isEnumDeclaration: (node: Node | undefined) => node is EnumDeclaration;
  static readonly isEnumMember: (node: Node | undefined) => node is EnumMember;
  static readonly isExportAssignment: (node: Node | undefined) => node is ExportAssignment;
  static readonly isExportDeclaration: (node: Node | undefined) => node is ExportDeclaration;
  static readonly isExportSpecifier: (node: Node | undefined) => node is ExportSpecifier;
  static readonly isExpressionStatement: (node: Node | undefined) => node is ExpressionStatement;
  static readonly isExpressionWithTypeArguments: (node: Node | undefined) => node is ExpressionWithTypeArguments;
  static readonly isExternalModuleReference: (node: Node | undefined) => node is ExternalModuleReference;
  static readonly isForInStatement: (node: Node | undefined) => node is ForInStatement;
  static readonly isForOfStatement: (node: Node | undefined) => node is ForOfStatement;
  static readonly isForStatement: (node: Node | undefined) => node is ForStatement;
  static readonly isFunctionDeclaration: (node: Node | undefined) => node is FunctionDeclaration;
  static readonly isFunctionExpression: (node: Node | undefined) => node is FunctionExpression;
  static readonly isHeritageClause: (node: Node | undefined) => node is HeritageClause;
  static readonly isIdentifier: (node: Node | undefined) => node is Identifier;
  static readonly isIfStatement: (node: Node | undefined) => node is IfStatement;
  static readonly isImportAttribute: (node: Node | undefined) => node is ImportAttribute;
  static readonly isImportAttributes: (node: Node | undefined) => node is ImportAttributes;
  static readonly isImportClause: (node: Node | undefined) => node is ImportClause;
  static readonly isImportDeclaration: (node: Node | undefined) => node is ImportDeclaration;
  static readonly isImportEqualsDeclaration: (node: Node | undefined) => node is ImportEqualsDeclaration;
  static readonly isImportSpecifier: (node: Node | undefined) => node is ImportSpecifier;
  static readonly isInferKeyword: (node: Node | undefined) => node is Node<ts.Token<SyntaxKind.InferKeyword>>;
  static readonly isInterfaceDeclaration: (node: Node | undefined) => node is InterfaceDeclaration;
  static readonly isJSDoc: (node: Node | undefined) => node is JSDoc;
  static readonly isJSDocAllType: (node: Node | undefined) => node is JSDocAllType;
  static readonly isJSDocAugmentsTag: (node: Node | undefined) => node is JSDocAugmentsTag;
  static readonly isJSDocAuthorTag: (node: Node | undefined) => node is JSDocAuthorTag;
  static readonly isJSDocCallbackTag: (node: Node | undefined) => node is JSDocCallbackTag;
  static readonly isJSDocClassTag: (node: Node | undefined) => node is JSDocClassTag;
  static readonly isJSDocDeprecatedTag: (node: Node | undefined) => node is JSDocDeprecatedTag;
  static readonly isJSDocEnumTag: (node: Node | undefined) => node is JSDocEnumTag;
  static readonly isJSDocFunctionType: (node: Node | undefined) => node is JSDocFunctionType;
  static readonly isJSDocImplementsTag: (node: Node | undefined) => node is JSDocImplementsTag;
  static readonly isJSDocLink: (node: Node | undefined) => node is JSDocLink;
  static readonly isJSDocLinkCode: (node: Node | undefined) => node is JSDocLinkCode;
  static readonly isJSDocLinkPlain: (node: Node | undefined) => node is JSDocLinkPlain;
  static readonly isJSDocMemberName: (node: Node | undefined) => node is JSDocMemberName;
  static readonly isJSDocNamepathType: (node: Node | undefined) => node is JSDocNamepathType;
  static readonly isJSDocNameReference: (node: Node | undefined) => node is JSDocNameReference;
  static readonly isJSDocNonNullableType: (node: Node | undefined) => node is JSDocNonNullableType;
  static readonly isJSDocNullableType: (node: Node | undefined) => node is JSDocNullableType;
  static readonly isJSDocOptionalType: (node: Node | undefined) => node is JSDocOptionalType;
  static readonly isJSDocOverloadTag: (node: Node | undefined) => node is JSDocOverloadTag;
  static readonly isJSDocOverrideTag: (node: Node | undefined) => node is JSDocOverrideTag;
  static readonly isJSDocParameterTag: (node: Node | undefined) => node is JSDocParameterTag;
  static readonly isJSDocPrivateTag: (node: Node | undefined) => node is JSDocPrivateTag;
  static readonly isJSDocPropertyTag: (node: Node | undefined) => node is JSDocPropertyTag;
  static readonly isJSDocProtectedTag: (node: Node | undefined) => node is JSDocProtectedTag;
  static readonly isJSDocPublicTag: (node: Node | undefined) => node is JSDocPublicTag;
  static readonly isJSDocReadonlyTag: (node: Node | undefined) => node is JSDocReadonlyTag;
  static readonly isJSDocReturnTag: (node: Node | undefined) => node is JSDocReturnTag;
  static readonly isJSDocSatisfiesTag: (node: Node | undefined) => node is JSDocSatisfiesTag;
  static readonly isJSDocSeeTag: (node: Node | undefined) => node is JSDocSeeTag;
  static readonly isJSDocSignature: (node: Node | undefined) => node is JSDocSignature;
  static readonly isJSDocTemplateTag: (node: Node | undefined) => node is JSDocTemplateTag;
  static readonly isJSDocText: (node: Node | undefined) => node is JSDocText;
  static readonly isJSDocThisTag: (node: Node | undefined) => node is JSDocThisTag;
  static readonly isJSDocThrowsTag: (node: Node | undefined) => node is JSDocThrowsTag;
  static readonly isJSDocTypedefTag: (node: Node | undefined) => node is JSDocTypedefTag;
  static readonly isJSDocTypeExpression: (node: Node | undefined) => node is JSDocTypeExpression;
  static readonly isJSDocTypeLiteral: (node: Node | undefined) => node is JSDocTypeLiteral;
  static readonly isJSDocTypeTag: (node: Node | undefined) => node is JSDocTypeTag;
  static readonly isJSDocUnknownType: (node: Node | undefined) => node is JSDocUnknownType;
  static readonly isJSDocVariadicType: (node: Node | undefined) => node is JSDocVariadicType;
  static readonly isJsxAttribute: (node: Node | undefined) => node is JsxAttribute;
  static readonly isJsxClosingElement: (node: Node | undefined) => node is JsxClosingElement;
  static readonly isJsxClosingFragment: (node: Node | undefined) => node is JsxClosingFragment;
  static readonly isJsxElement: (node: Node | undefined) => node is JsxElement;
  static readonly isJsxExpression: (node: Node | undefined) => node is JsxExpression;
  static readonly isJsxFragment: (node: Node | undefined) => node is JsxFragment;
  static readonly isJsxNamespacedName: (node: Node | undefined) => node is JsxNamespacedName;
  static readonly isJsxOpeningElement: (node: Node | undefined) => node is JsxOpeningElement;
  static readonly isJsxOpeningFragment: (node: Node | undefined) => node is JsxOpeningFragment;
  static readonly isJsxSelfClosingElement: (node: Node | undefined) => node is JsxSelfClosingElement;
  static readonly isJsxSpreadAttribute: (node: Node | undefined) => node is JsxSpreadAttribute;
  static readonly isJsxText: (node: Node | undefined) => node is JsxText;
  static readonly isLabeledStatement: (node: Node | undefined) => node is LabeledStatement;
  static readonly isMetaProperty: (node: Node | undefined) => node is MetaProperty;
  static readonly isMethodDeclaration: (node: Node | undefined) => node is MethodDeclaration;
  static readonly isMethodSignature: (node: Node | undefined) => node is MethodSignature;
  static readonly isModuleBlock: (node: Node | undefined) => node is ModuleBlock;
  static readonly isModuleDeclaration: (node: Node | undefined) => node is ModuleDeclaration;
  static readonly isNamedExports: (node: Node | undefined) => node is NamedExports;
  static readonly isNamedImports: (node: Node | undefined) => node is NamedImports;
  static readonly isNamedTupleMember: (node: Node | undefined) => node is NamedTupleMember;
  static readonly isNamespaceExport: (node: Node | undefined) => node is NamespaceExport;
  static readonly isNamespaceImport: (node: Node | undefined) => node is NamespaceImport;
  static readonly isNeverKeyword: (node: Node | undefined) => node is Node<ts.Token<SyntaxKind.NeverKeyword>>;
  static readonly isNewExpression: (node: Node | undefined) => node is NewExpression;
  static readonly isNonNullExpression: (node: Node | undefined) => node is NonNullExpression;
  static readonly isNoSubstitutionTemplateLiteral: (node: Node | undefined) => node is NoSubstitutionTemplateLiteral;
  static readonly isNotEmittedStatement: (node: Node | undefined) => node is NotEmittedStatement;
  static readonly isNumberKeyword: (node: Node | undefined) => node is Expression;
  static readonly isNumericLiteral: (node: Node | undefined) => node is NumericLiteral;
  static readonly isObjectBindingPattern: (node: Node | undefined) => node is ObjectBindingPattern;
  static readonly isObjectKeyword: (node: Node | undefined) => node is Expression;
  static readonly isObjectLiteralExpression: (node: Node | undefined) => node is ObjectLiteralExpression;
  static readonly isOmittedExpression: (node: Node | undefined) => node is OmittedExpression;
  static readonly isParenthesizedExpression: (node: Node | undefined) => node is ParenthesizedExpression;
  static readonly isPartiallyEmittedExpression: (node: Node | undefined) => node is PartiallyEmittedExpression;
  static readonly isPostfixUnaryExpression: (node: Node | undefined) => node is PostfixUnaryExpression;
  static readonly isPrefixUnaryExpression: (node: Node | undefined) => node is PrefixUnaryExpression;
  static readonly isPrivateIdentifier: (node: Node | undefined) => node is PrivateIdentifier;
  static readonly isPropertyAccessExpression: (node: Node | undefined) => node is PropertyAccessExpression;
  static readonly isPropertyAssignment: (node: Node | undefined) => node is PropertyAssignment;
  static readonly isPropertyDeclaration: (node: Node | undefined) => node is PropertyDeclaration;
  static readonly isPropertySignature: (node: Node | undefined) => node is PropertySignature;
  static readonly isQualifiedName: (node: Node | undefined) => node is QualifiedName;
  static readonly isRegularExpressionLiteral: (node: Node | undefined) => node is RegularExpressionLiteral;
  static readonly isReturnStatement: (node: Node | undefined) => node is ReturnStatement;
  static readonly isSatisfiesExpression: (node: Node | undefined) => node is SatisfiesExpression;
  static readonly isSemicolonToken: (node: Node | undefined) => node is Node<ts.Token<SyntaxKind.SemicolonToken>>;
  static readonly isShorthandPropertyAssignment: (node: Node | undefined) => node is ShorthandPropertyAssignment;
  static readonly isSourceFile: (node: Node | undefined) => node is SourceFile;
  static readonly isSpreadAssignment: (node: Node | undefined) => node is SpreadAssignment;
  static readonly isSpreadElement: (node: Node | undefined) => node is SpreadElement;
  static readonly isStringKeyword: (node: Node | undefined) => node is Expression;
  static readonly isStringLiteral: (node: Node | undefined) => node is StringLiteral;
  static readonly isSwitchStatement: (node: Node | undefined) => node is SwitchStatement;
  static readonly isSymbolKeyword: (node: Node | undefined) => node is Expression;
  static readonly isSyntaxList: (node: Node | undefined) => node is SyntaxList;
  static readonly isTaggedTemplateExpression: (node: Node | undefined) => node is TaggedTemplateExpression;
  static readonly isTemplateExpression: (node: Node | undefined) => node is TemplateExpression;
  static readonly isTemplateHead: (node: Node | undefined) => node is TemplateHead;
  static readonly isTemplateMiddle: (node: Node | undefined) => node is TemplateMiddle;
  static readonly isTemplateSpan: (node: Node | undefined) => node is TemplateSpan;
  static readonly isTemplateTail: (node: Node | undefined) => node is TemplateTail;
  static readonly isThrowStatement: (node: Node | undefined) => node is ThrowStatement;
  static readonly isTryStatement: (node: Node | undefined) => node is TryStatement;
  static readonly isTypeAliasDeclaration: (node: Node | undefined) => node is TypeAliasDeclaration;
  static readonly isTypeOfExpression: (node: Node | undefined) => node is TypeOfExpression;
  static readonly isUndefinedKeyword: (node: Node | undefined) => node is Expression;
  static readonly isVariableDeclaration: (node: Node | undefined) => node is VariableDeclaration;
  static readonly isVariableDeclarationList: (node: Node | undefined) => node is VariableDeclarationList;
  static readonly isVariableStatement: (node: Node | undefined) => node is VariableStatement;
  static readonly isVoidExpression: (node: Node | undefined) => node is VoidExpression;
  static readonly isWhileStatement: (node: Node | undefined) => node is WhileStatement;
  static readonly isWithStatement: (node: Node | undefined) => node is WithStatement;
  static readonly isYieldExpression: (node: Node | undefined) => node is YieldExpression;
  protected constructor();
  get compilerNode(): NodeType;
  forget(): void;
  forgetDescendants(): void;
  wasForgotten(): boolean;
  getKind(): SyntaxKind;
  getKindName(): string;
  getFlags(): ts.NodeFlags;
  print(options?: PrintNodeOptions): string;
  getSymbolOrThrow(message?: string | (() => string)): Symbol;
  getSymbol(): Symbol | undefined;
  getSymbolsInScope(meaning: SymbolFlags): Symbol[];
  getLocalOrThrow(name: string, message?: string | (() => string)): Symbol;
  getLocal(name: string): Symbol | undefined;
  getLocals(): Symbol[];
  getType(): Type;
  containsRange(pos: number, end: number): boolean;
  isInStringAtPos(pos: number): boolean;
  asKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  isKind<TKind extends SyntaxKind>(kind: TKind): this is KindToNodeMappings[TKind];
  asKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getFirstChildOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  getFirstChildOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getFirstChild<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
  getFirstChild(condition?: (node: Node) => boolean): Node | undefined;
  getLastChildOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  getLastChildOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getLastChild<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
  getLastChild(condition?: (node: Node) => boolean): Node | undefined;
  getFirstDescendantOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  getFirstDescendantOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getFirstDescendant<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
  getFirstDescendant(condition?: (node: Node) => boolean): Node | undefined;
  getPreviousSiblingOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  getPreviousSiblingOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getPreviousSibling<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
  getPreviousSibling(condition?: (node: Node) => boolean): Node | undefined;
  getNextSiblingOrThrow<T extends Node>(condition?: (node: Node) => node is T, message?: string | (() => string)): T;
  getNextSiblingOrThrow(condition?: (node: Node) => boolean, message?: string | (() => string)): Node;
  getNextSibling<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
  getNextSibling(condition?: (node: Node) => boolean): Node | undefined;
  getPreviousSiblings(): Node[];
  getNextSiblings(): Node[];
  getChildren(): Node[];
  getChildAtIndex(index: number): Node;
  getChildSyntaxListOrThrow(message?: string | (() => string)): SyntaxList;
  getChildSyntaxList(): SyntaxList | undefined;
  forEachChild<T>(cbNode: (node: Node) => T | undefined, cbNodeArray?: (nodes: Node[]) => T | undefined): T | undefined;
  forEachDescendant<T>(cbNode: (node: Node, traversal: ForEachDescendantTraversalControl) => T | undefined, cbNodeArray?: (nodes: Node[], traversal: ForEachDescendantTraversalControl) => T | undefined): T | undefined;
  forEachChildAsArray(): Node<ts.Node>[];
  forEachDescendantAsArray(): Node<ts.Node>[];
  getDescendants(): Node[];
  getDescendantStatements(): (Statement | Expression)[];
  getChildCount(): number;
  getChildAtPos(pos: number): Node | undefined;
  getDescendantAtPos(pos: number): Node | undefined;
  getDescendantAtStartWithWidth(start: number, width: number): Node | undefined;
  getPos(): number;
  getEnd(): number;
  getStart(includeJsDocComments?: boolean): number;
  getFullStart(): number;
  getNonWhitespaceStart(): number;
  getWidth(includeJsDocComments?: boolean): number;
  getFullWidth(): number;
  getLeadingTriviaWidth(): number;
  getTrailingTriviaWidth(): number;
  getTrailingTriviaEnd(): number;
  getText(includeJsDocComments?: boolean): string;
  getText(options: {
        trimLeadingIndentation?: boolean;
        includeJsDocComments?: boolean;
    }): string;
  getFullText(): string;
  getCombinedModifierFlags(): ts.ModifierFlags;
  getSourceFile(): SourceFile;
  getProject(): Project;
  getNodeProperty<KeyType extends keyof LocalNodeType, LocalNodeType extends ts.Node = NodeType>(propertyName: KeyType): NodePropertyToWrappedType<LocalNodeType, KeyType>;
  getAncestors(): Node[];
  getParent(): Node<ts.Node> | undefined;
  getParentOrThrow(message?: string | (() => string)): Node<ts.Node>;
  getParentWhileOrThrow<T extends Node>(condition: (parent: Node, node: Node) => parent is T, message?: string | (() => string)): T;
  getParentWhileOrThrow(condition: (parent: Node, node: Node) => boolean, message?: string | (() => string)): Node;
  getParentWhile<T extends Node>(condition: (parent: Node, child: Node) => parent is T): T | undefined;
  getParentWhile(condition: (parent: Node, child: Node) => boolean): Node | undefined;
  getParentWhileKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getParentWhileKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getLastToken(): Node;
  isInSyntaxList(): boolean;
  getParentSyntaxListOrThrow(message?: string | (() => string)): SyntaxList;
  getParentSyntaxList(): SyntaxList | undefined;
  getChildIndex(): number;
  getIndentationLevel(): number;
  getChildIndentationLevel(): number;
  getIndentationText(offset?: number): string;
  getChildIndentationText(offset?: number): string;
  getStartLinePos(includeJsDocComments?: boolean): number;
  getStartLineNumber(includeJsDocComments?: boolean): number;
  getEndLineNumber(): number;
  isFirstNodeOnLine(): boolean;
  replaceWithText(textOrWriterFunction: string | WriterFunction): Node;
  prependWhitespace(textOrWriterFunction: string | WriterFunction): void;
  appendWhitespace(textOrWriterFunction: string | WriterFunction): void;
  formatText(settings?: FormatCodeSettings): void;
  transform(visitNode: (traversal: TransformTraversalControl) => ts.Node): Node;
  getLeadingCommentRanges(): CommentRange[];
  getTrailingCommentRanges(): CommentRange[];
  getChildrenOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][];
  getFirstChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getFirstChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getFirstChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getFirstChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getLastChildByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getLastChildByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getLastChildIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getLastChildIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getChildAtIndexIfKindOrThrow<TKind extends SyntaxKind>(index: number, kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getChildAtIndexIfKind<TKind extends SyntaxKind>(index: number, kind: TKind): KindToNodeMappings[TKind] | undefined;
  getPreviousSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getNextSiblingIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getPreviousSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getNextSiblingIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getParentIfOrThrow<T extends Node>(condition: (parent: Node | undefined, node: Node) => parent is T, message?: string | (() => string)): T;
  getParentIfOrThrow(condition: (parent: Node | undefined, node: Node) => boolean, message?: string | (() => string)): Node;
  getParentIf<T extends Node>(condition: (parent: Node | undefined, node: Node) => parent is T): T | undefined;
  getParentIf(condition: (parent: Node | undefined, node: Node) => boolean): Node | undefined;
  getParentIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getParentIfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getFirstAncestorByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getFirstAncestorByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  getFirstAncestorOrThrow<T extends Node>(condition?: (node: Node) => node is T): T;
  getFirstAncestorOrThrow(condition?: (node: Node) => boolean): Node;
  getFirstAncestor<T extends Node>(condition?: (node: Node) => node is T): T | undefined;
  getFirstAncestor(condition?: (node: Node) => boolean): Node | undefined;
  getDescendantsOfKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind][];
  getFirstDescendantByKindOrThrow<TKind extends SyntaxKind>(kind: TKind, message?: string | (() => string)): KindToNodeMappings[TKind];
  getFirstDescendantByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
  static hasExpression<T extends Node>(node: T): node is T & {
        getExpression(): Expression;
    };
  static hasName<T extends Node>(node: T): node is T & {
        getName(): string;
        getNameNode(): Node;
    };
  static hasBody<T extends Node>(node: T): node is T & {
        getBody(): Node;
    };
  static hasStructure<T extends Node>(node: T): node is T & {
        getStructure(): Structures;
    };
  static is<TKind extends keyof KindToNodeMappings>(kind: TKind): (node: Node | undefined) => node is KindToNodeMappings[TKind];
  static isNode(value: unknown): value is Node;
  static isCommentNode(node: Node | undefined): node is CommentStatement | CommentClassElement | CommentTypeElement | CommentObjectLiteralElement | CommentEnumMember;
  static isCommentStatement(node: Node | undefined): node is CommentStatement;
  static isCommentClassElement(node: Node | undefined): node is CommentClassElement;
  static isCommentTypeElement(node: Node | undefined): node is CommentTypeElement;
  static isCommentObjectLiteralElement(node: Node | undefined): node is CommentObjectLiteralElement;
  static isCommentEnumMember(node: Node | undefined): node is CommentEnumMember;
  static isAbstractable<T extends Node>(node: T | undefined): node is AbstractableNode & AbstractableNodeExtensionType & T;
  static isAmbientable<T extends Node>(node: T | undefined): node is AmbientableNode & AmbientableNodeExtensionType & T;
  static isArgumented<T extends Node>(node: T | undefined): node is ArgumentedNode & ArgumentedNodeExtensionType & T;
  static isArrayTypeNode(node: Node | undefined): node is ArrayTypeNode;
  static isAsyncable<T extends Node>(node: T | undefined): node is AsyncableNode & AsyncableNodeExtensionType & T;
  static isAwaitable<T extends Node>(node: T | undefined): node is AwaitableNode & AwaitableNodeExtensionType & T;
  static isBindingNamed<T extends Node>(node: T | undefined): node is BindingNamedNode & BindingNamedNodeExtensionType & T;
  static isBodied<T extends Node>(node: T | undefined): node is BodiedNode & BodiedNodeExtensionType & T;
  static isBodyable<T extends Node>(node: T | undefined): node is BodyableNode & BodyableNodeExtensionType & T;
  static isCallSignatureDeclaration(node: Node | undefined): node is CallSignatureDeclaration;
  static isChildOrderable<T extends Node>(node: T | undefined): node is ChildOrderableNode & ChildOrderableNodeExtensionType & T;
  static isClassLikeDeclarationBase<T extends Node>(node: T | undefined): node is ClassLikeDeclarationBase & ClassLikeDeclarationBaseExtensionType & T;
  static isConditionalTypeNode(node: Node | undefined): node is ConditionalTypeNode;
  static isConstructorDeclaration(node: Node | undefined): node is ConstructorDeclaration;
  static isConstructorTypeNode(node: Node | undefined): node is ConstructorTypeNode;
  static isConstructSignatureDeclaration(node: Node | undefined): node is ConstructSignatureDeclaration;
  static isDecoratable<T extends Node>(node: T | undefined): node is DecoratableNode & DecoratableNodeExtensionType & T;
  static isDotDotDotTokenable<T extends Node>(node: T | undefined): node is DotDotDotTokenableNode & DotDotDotTokenableNodeExtensionType & T;
  static isExclamationTokenable<T extends Node>(node: T | undefined): node is ExclamationTokenableNode & ExclamationTokenableNodeExtensionType & T;
  static isExportable<T extends Node>(node: T | undefined): node is ExportableNode & ExportableNodeExtensionType & T;
  static isExportGetable<T extends Node>(node: T | undefined): node is ExportGetableNode & ExportGetableNodeExtensionType & T;
  static isExpression(node: Node | undefined): node is Expression;
  static isExpressionable<T extends Node>(node: T | undefined): node is ExpressionableNode & ExpressionableNodeExtensionType & T;
  static isExpressioned<T extends Node>(node: T | undefined): node is ExpressionedNode & ExpressionedNodeExtensionType & T;
  static isExtendsClauseable<T extends Node>(node: T | undefined): node is ExtendsClauseableNode & ExtendsClauseableNodeExtensionType & T;
  static isFalseLiteral(node: Node | undefined): node is FalseLiteral;
  static isFunctionLikeDeclaration<T extends Node>(node: T | undefined): node is FunctionLikeDeclaration & FunctionLikeDeclarationExtensionType & T;
  static isFunctionTypeNode(node: Node | undefined): node is FunctionTypeNode;
  static isGeneratorable<T extends Node>(node: T | undefined): node is GeneratorableNode & GeneratorableNodeExtensionType & T;
  static isGetAccessorDeclaration(node: Node | undefined): node is GetAccessorDeclaration;
  static isHeritageClauseable<T extends Node>(node: T | undefined): node is HeritageClauseableNode & HeritageClauseableNodeExtensionType & T;
  static isImplementsClauseable<T extends Node>(node: T | undefined): node is ImplementsClauseableNode & ImplementsClauseableNodeExtensionType & T;
  static isImportAttributeNamed<T extends Node>(node: T | undefined): node is ImportAttributeNamedNode & ImportAttributeNamedNodeExtensionType & T;
  static isImportExpression(node: Node | undefined): node is ImportExpression;
  static isImportTypeNode(node: Node | undefined): node is ImportTypeNode;
  static isIndexedAccessTypeNode(node: Node | undefined): node is IndexedAccessTypeNode;
  static isIndexSignatureDeclaration(node: Node | undefined): node is IndexSignatureDeclaration;
  static isInferTypeNode(node: Node | undefined): node is InferTypeNode;
  static isInitializerExpressionable<T extends Node>(node: T | undefined): node is InitializerExpressionableNode & InitializerExpressionableNodeExtensionType & T;
  static isInitializerExpressionGetable<T extends Node>(node: T | undefined): node is InitializerExpressionGetableNode & InitializerExpressionGetableNodeExtensionType & T;
  static isIntersectionTypeNode(node: Node | undefined): node is IntersectionTypeNode;
  static isIterationStatement(node: Node | undefined): node is IterationStatement;
  static isJSDocable<T extends Node>(node: T | undefined): node is JSDocableNode & JSDocableNodeExtensionType & T;
  static isJSDocPropertyLikeTag<T extends Node>(node: T | undefined): node is JSDocPropertyLikeTag & JSDocPropertyLikeTagExtensionType & T;
  static isJSDocTag(node: Node | undefined): node is JSDocTag;
  static isJSDocType(node: Node | undefined): node is JSDocType;
  static isJSDocTypeExpressionableTag<T extends Node>(node: T | undefined): node is JSDocTypeExpressionableTag & JSDocTypeExpressionableTagExtensionType & T;
  static isJSDocTypeParameteredTag<T extends Node>(node: T | undefined): node is JSDocTypeParameteredTag & JSDocTypeParameteredTagExtensionType & T;
  static isJSDocUnknownTag(node: Node | undefined): node is JSDocUnknownTag;
  static isJsxAttributed<T extends Node>(node: T | undefined): node is JsxAttributedNode & JsxAttributedNodeExtensionType & T;
  static isJsxTagNamed<T extends Node>(node: T | undefined): node is JsxTagNamedNode & JsxTagNamedNodeExtensionType & T;
  static isLeftHandSideExpression(node: Node | undefined): node is LeftHandSideExpression;
  static isLeftHandSideExpressioned<T extends Node>(node: T | undefined): node is LeftHandSideExpressionedNode & LeftHandSideExpressionedNodeExtensionType & T;
  static isLiteralExpression(node: Node | undefined): node is LiteralExpression;
  static isLiteralLike<T extends Node>(node: T | undefined): node is LiteralLikeNode & LiteralLikeNodeExtensionType & T;
  static isLiteralTypeNode(node: Node | undefined): node is LiteralTypeNode;
  static isMappedTypeNode(node: Node | undefined): node is MappedTypeNode;
  static isMemberExpression(node: Node | undefined): node is MemberExpression;
  static isModifierable<T extends Node>(node: T | undefined): node is ModifierableNode & ModifierableNodeExtensionType & T;
  static isModuleChildable<T extends Node>(node: T | undefined): node is ModuleChildableNode & ModuleChildableNodeExtensionType & T;
  static isModuled<T extends Node>(node: T | undefined): node is ModuledNode & ModuledNodeExtensionType & T;
  static isModuleNamed<T extends Node>(node: T | undefined): node is ModuleNamedNode & ModuleNamedNodeExtensionType & T;
  static isNameable<T extends Node>(node: T | undefined): node is NameableNode & NameableNodeExtensionType & T;
  static isNamed<T extends Node>(node: T | undefined): node is NamedNode & NamedNodeExtensionType & T;
  static isNodeWithTypeArguments(node: Node | undefined): node is NodeWithTypeArguments;
  static isNullLiteral(node: Node | undefined): node is NullLiteral;
  static isOverloadable<T extends Node>(node: T | undefined): node is OverloadableNode & OverloadableNodeExtensionType & T;
  static isOverrideable<T extends Node>(node: T | undefined): node is OverrideableNode & OverrideableNodeExtensionType & T;
  static isParameterDeclaration(node: Node | undefined): node is ParameterDeclaration;
  static isParametered<T extends Node>(node: T | undefined): node is ParameteredNode & ParameteredNodeExtensionType & T;
  static isParenthesizedTypeNode(node: Node | undefined): node is ParenthesizedTypeNode;
  static isPrimaryExpression(node: Node | undefined): node is PrimaryExpression;
  static isPropertyNamed<T extends Node>(node: T | undefined): node is PropertyNamedNode & PropertyNamedNodeExtensionType & T;
  static isQuestionDotTokenable<T extends Node>(node: T | undefined): node is QuestionDotTokenableNode & QuestionDotTokenableNodeExtensionType & T;
  static isQuestionTokenable<T extends Node>(node: T | undefined): node is QuestionTokenableNode & QuestionTokenableNodeExtensionType & T;
  static isReadonlyable<T extends Node>(node: T | undefined): node is ReadonlyableNode & ReadonlyableNodeExtensionType & T;
  static isReferenceFindable<T extends Node>(node: T | undefined): node is ReferenceFindableNode & ReferenceFindableNodeExtensionType & T;
  static isRenameable<T extends Node>(node: T | undefined): node is RenameableNode & RenameableNodeExtensionType & T;
  static isRestTypeNode(node: Node | undefined): node is RestTypeNode;
  static isReturnTyped<T extends Node>(node: T | undefined): node is ReturnTypedNode & ReturnTypedNodeExtensionType & T;
  static isScopeable<T extends Node>(node: T | undefined): node is ScopeableNode & ScopeableNodeExtensionType & T;
  static isScoped<T extends Node>(node: T | undefined): node is ScopedNode & ScopedNodeExtensionType & T;
  static isSetAccessorDeclaration(node: Node | undefined): node is SetAccessorDeclaration;
  static isSignaturedDeclaration<T extends Node>(node: T | undefined): node is SignaturedDeclaration & SignaturedDeclarationExtensionType & T;
  static isStatement(node: Node | undefined): node is Statement;
  static isStatemented<T extends Node>(node: T | undefined): node is StatementedNode & StatementedNodeExtensionType & T;
  static isStaticable<T extends Node>(node: T | undefined): node is StaticableNode & StaticableNodeExtensionType & T;
  static isSuperExpression(node: Node | undefined): node is SuperExpression;
  static isTemplateLiteralTypeNode(node: Node | undefined): node is TemplateLiteralTypeNode;
  static isTextInsertable<T extends Node>(node: T | undefined): node is TextInsertableNode & TextInsertableNodeExtensionType & T;
  static isThisExpression(node: Node | undefined): node is ThisExpression;
  static isThisTypeNode(node: Node | undefined): node is ThisTypeNode;
  static isTrueLiteral(node: Node | undefined): node is TrueLiteral;
  static isTupleTypeNode(node: Node | undefined): node is TupleTypeNode;
  static isTypeArgumented<T extends Node>(node: T | undefined): node is TypeArgumentedNode & TypeArgumentedNodeExtensionType & T;
  static isTypeAssertion(node: Node | undefined): node is TypeAssertion;
  static isTyped<T extends Node>(node: T | undefined): node is TypedNode & TypedNodeExtensionType & T;
  static isTypeElement(node: Node | undefined): node is TypeElement;
  static isTypeElementMembered<T extends Node>(node: T | undefined): node is TypeElementMemberedNode & TypeElementMemberedNodeExtensionType & T;
  static isTypeLiteral(node: Node | undefined): node is TypeLiteralNode;
  static isTypeNode(node: Node | undefined): node is TypeNode;
  static isTypeOperatorTypeNode(node: Node | undefined): node is TypeOperatorTypeNode;
  static isTypeParameterDeclaration(node: Node | undefined): node is TypeParameterDeclaration;
  static isTypeParametered<T extends Node>(node: T | undefined): node is TypeParameteredNode & TypeParameteredNodeExtensionType & T;
  static isTypePredicate(node: Node | undefined): node is TypePredicateNode;
  static isTypeQuery(node: Node | undefined): node is TypeQueryNode;
  static isTypeReference(node: Node | undefined): node is TypeReferenceNode;
  static isUnaryExpression(node: Node | undefined): node is UnaryExpression;
  static isUnaryExpressioned<T extends Node>(node: T | undefined): node is UnaryExpressionedNode & UnaryExpressionedNodeExtensionType & T;
  static isUnionTypeNode(node: Node | undefined): node is UnionTypeNode;
  static isUnwrappable<T extends Node>(node: T | undefined): node is UnwrappableNode & UnwrappableNodeExtensionType & T;
  static isUpdateExpression(node: Node | undefined): node is UpdateExpression;
}
export declare enum Scope {
  Public = "public",
  Protected = "protected",
  Private = "private"
}
export declare class SyntaxList extends Node<ts.SyntaxList> {
  addChildText(textOrWriterFunction: string | WriterFunction | ReadonlyArray<string | WriterFunction>): Node<ts.Node>[];
  insertChildText(index: number, textOrWriterFunction: string | WriterFunction | ReadonlyArray<string | WriterFunction>): Node<ts.Node>[];
  getParent(): NodeParentType<ts.SyntaxList>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SyntaxList>>;
}
export declare class TextRange<TRange extends ts.TextRange = ts.TextRange> {
  #private;
  protected constructor();
  get compilerObject(): TRange;
  getSourceFile(): SourceFile;
  getPos(): number;
  getEnd(): number;
  getWidth(): number;
  getText(): string;
  wasForgotten(): boolean;
}
export interface ForEachDescendantTraversalControl {
  stop(): void;
  skip(): void;
  up(): void;
}
export interface TransformTraversalControl {
  factory: ts.NodeFactory;
  currentNode: ts.Node;
  visitChildren(): ts.Node;
}
export type CompilerNodeToWrappedType<T extends ts.Node> = T extends ts.ObjectDestructuringAssignment ? ObjectDestructuringAssignment : T extends ts.ArrayDestructuringAssignment ? ArrayDestructuringAssignment : T extends ts.SuperElementAccessExpression ? SuperElementAccessExpression : T extends ts.SuperPropertyAccessExpression ? SuperPropertyAccessExpression : T extends ts.AssignmentExpression<infer U> ? AssignmentExpression<ts.AssignmentExpression<U>> : T["kind"] extends keyof ImplementedKindToNodeMappings ? ImplementedKindToNodeMappings[T["kind"]] : T extends ts.SyntaxList ? SyntaxList : T extends ts.JSDocTypeExpression ? JSDocTypeExpression : T extends ts.JSDocType ? JSDocType : T extends ts.NodeWithTypeArguments ? NodeWithTypeArguments : T extends ts.TypeNode ? TypeNode : T extends ts.JSDocTag ? JSDocTag : T extends ts.LiteralExpression ? LiteralExpression : T extends ts.PrimaryExpression ? PrimaryExpression : T extends ts.MemberExpression ? MemberExpression : T extends ts.LeftHandSideExpression ? LeftHandSideExpression : T extends ts.UpdateExpression ? UpdateExpression : T extends ts.UnaryExpression ? UnaryExpression : T extends ts.Expression ? Expression : T extends ts.IterationStatement ? IterationStatement : T extends CompilerCommentStatement ? CommentStatement : T extends CompilerCommentClassElement ? CommentClassElement : T extends CompilerCommentTypeElement ? CommentTypeElement : T extends CompilerCommentObjectLiteralElement ? CommentObjectLiteralElement : T extends CompilerCommentEnumMember ? CommentEnumMember : T extends ts.TypeElement ? TypeElement : T extends ts.Statement ? Statement : T extends ts.ClassElement ? ClassElement : T extends ts.ObjectLiteralElement ? ObjectLiteralElement : Node<T>;
declare const DecoratorBase: Constructor<LeftHandSideExpressionedNode> & typeof Node;
export declare class Decorator extends DecoratorBase<ts.Decorator> {
  private _getInnerExpression;
  getName(): string;
  getNameNode(): Identifier;
  getFullName(): string;
  isDecoratorFactory(): boolean;
  setIsDecoratorFactory(isDecoratorFactory: boolean): this;
  getCallExpressionOrThrow(message?: string | (() => string)): CallExpression;
  getCallExpression(): CallExpression | undefined;
  getArguments(): Node[];
  getTypeArguments(): TypeNode[];
  addTypeArgument(argumentText: string): TypeNode<ts.TypeNode>;
  addTypeArguments(argumentTexts: ReadonlyArray<string>): TypeNode<ts.TypeNode>[];
  insertTypeArgument(index: number, argumentText: string): TypeNode<ts.TypeNode>;
  insertTypeArguments(index: number, argumentTexts: ReadonlyArray<string>): TypeNode<ts.TypeNode>[];
  removeTypeArgument(typeArg: Node): this;
  removeTypeArgument(index: number): this;
  addArgument(argumentText: string | WriterFunction): Node<ts.Node>;
  addArguments(argumentTexts: ReadonlyArray<string | WriterFunction> | WriterFunction): Node<ts.Node>[];
  insertArgument(index: number, argumentText: string | WriterFunction): Node<ts.Node>;
  insertArguments(index: number, argumentTexts: ReadonlyArray<string | WriterFunction> | WriterFunction): Node<ts.Node>[];
  removeArgument(node: Node): this;
  removeArgument(index: number): this;
  remove(): void;
  set(structure: Partial<DecoratorStructure>): this;
  getStructure(): DecoratorStructure;
  getParent(): NodeParentType<ts.Decorator>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.Decorator>>;
}
export declare function JSDocPropertyLikeTag<T extends Constructor<JSDocPropertyLikeTagExtensionType>>(Base: T): Constructor<JSDocPropertyLikeTag> & T;
export interface JSDocPropertyLikeTag {
  getTypeExpression(): JSDocTypeExpression | undefined;
  getTypeExpressionOrThrow(message?: string | (() => string)): JSDocTypeExpression;
  getName(): string;
  getNameNode(): EntityName;
  isBracketed(): boolean;
}
type JSDocPropertyLikeTagExtensionType = Node<ts.JSDocPropertyLikeTag> & JSDocTag;
export declare function JSDocTypeExpressionableTag<T extends Constructor<JSDocTypeExpressionableTagExtensionType>>(Base: T): Constructor<JSDocTypeExpressionableTag> & T;
export interface JSDocTypeExpressionableTag {
  getTypeExpression(): JSDocTypeExpression | undefined;
  getTypeExpressionOrThrow(message?: string | (() => string)): JSDocTypeExpression;
}
type JSDocTypeExpressionableTagExtensionType = Node<ts.Node & {
      typeExpression: ts.JSDocTypeExpression | undefined;
  }> & JSDocTag;
export declare function JSDocTypeParameteredTag<T extends Constructor<JSDocTypeParameteredTagExtensionType>>(Base: T): Constructor<JSDocTypeParameteredTag> & T;
export interface JSDocTypeParameteredTag {
  getTypeParameters(): TypeParameterDeclaration[];
}
type JSDocTypeParameteredTagExtensionType = Node<ts.Node & {
      typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>;
  }> & JSDocTag;
declare const JSDocBase: typeof Node;
export declare class JSDoc extends JSDocBase<ts.JSDoc> {
  isMultiLine(): boolean;
  getTags(): JSDocTag[];
  getInnerText(): string;
  getComment(): string | (JSDocText | JSDocLink | JSDocLinkCode | JSDocLinkPlain | undefined)[] | undefined;
  getCommentText(): string | undefined;
  getDescription(): string;
  setDescription(textOrWriterFunction: string | WriterFunction): this;
  addTag(structure: OptionalKind<JSDocTagStructure>): JSDocTag<ts.JSDocTag>;
  addTags(structures: ReadonlyArray<OptionalKind<JSDocTagStructure>>): JSDocTag<ts.JSDocTag>[];
  insertTag(index: number, structure: OptionalKind<JSDocTagStructure>): JSDocTag<ts.JSDocTag>;
  insertTags(index: number, structures: ReadonlyArray<OptionalKind<JSDocTagStructure>>): JSDocTag<ts.JSDocTag>[];
  remove(): void;
  set(structure: Partial<JSDocStructure>): Node<ts.Node>;
  getStructure(): JSDocStructure;
  getParent(): NodeParentType<ts.JSDoc>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDoc>>;
}
export declare class JSDocAllType extends JSDocType<ts.JSDocAllType> {
  getParent(): NodeParentType<ts.JSDocAllType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocAllType>>;
}
export declare class JSDocAugmentsTag extends JSDocTag<ts.JSDocAugmentsTag> {
  getParent(): NodeParentType<ts.JSDocAugmentsTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocAugmentsTag>>;
}
export declare class JSDocAuthorTag extends JSDocTag<ts.JSDocAuthorTag> {
  getParent(): NodeParentType<ts.JSDocAuthorTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocAuthorTag>>;
}
export declare class JSDocCallbackTag extends JSDocTag<ts.JSDocCallbackTag> {
  getParent(): NodeParentType<ts.JSDocCallbackTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocCallbackTag>>;
}
export declare class JSDocClassTag extends JSDocTag<ts.JSDocClassTag> {
  getParent(): NodeParentType<ts.JSDocClassTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocClassTag>>;
}
export declare class JSDocDeprecatedTag extends JSDocTag<ts.JSDocDeprecatedTag> {
  getParent(): NodeParentType<ts.JSDocDeprecatedTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocDeprecatedTag>>;
}
export declare class JSDocEnumTag extends JSDocTag<ts.JSDocEnumTag> {
  getParent(): NodeParentType<ts.JSDocEnumTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocEnumTag>>;
}
declare const JSDocFunctionTypeBase: Constructor<SignaturedDeclaration> & typeof JSDocType;
export declare class JSDocFunctionType extends JSDocFunctionTypeBase<ts.JSDocFunctionType> {
  getParent(): NodeParentType<ts.JSDocFunctionType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocFunctionType>>;
}
export declare class JSDocImplementsTag extends JSDocTag<ts.JSDocImplementsTag> {
  getParent(): NodeParentType<ts.JSDocImplementsTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocImplementsTag>>;
}
export declare class JSDocLink extends Node<ts.JSDocLink> {
  getParent(): NodeParentType<ts.JSDocLink>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocLink>>;
}
export declare class JSDocLinkCode extends Node<ts.JSDocLinkCode> {
  getParent(): NodeParentType<ts.JSDocLinkCode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocLinkCode>>;
}
export declare class JSDocLinkPlain extends Node<ts.JSDocLinkPlain> {
  getParent(): NodeParentType<ts.JSDocLinkPlain>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocLinkPlain>>;
}
export declare class JSDocMemberName extends Node<ts.JSDocMemberName> {
  getParent(): NodeParentType<ts.JSDocMemberName>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocMemberName>>;
}
export declare class JSDocNamepathType extends JSDocType<ts.JSDocNamepathType> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  getParent(): NodeParentType<ts.JSDocNamepathType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocNamepathType>>;
}
export declare class JSDocNameReference extends Node<ts.JSDocNameReference> {
  getName(): Identifier | QualifiedName | JSDocMemberName;
  getParent(): NodeParentType<ts.JSDocNameReference>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocNameReference>>;
}
export declare class JSDocNonNullableType extends JSDocType<ts.JSDocNonNullableType> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  isPostfix(): boolean;
  getParent(): NodeParentType<ts.JSDocNonNullableType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocNonNullableType>>;
}
export declare class JSDocNullableType extends JSDocType<ts.JSDocNullableType> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  isPostfix(): boolean;
  getParent(): NodeParentType<ts.JSDocNullableType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocNullableType>>;
}
export declare class JSDocOptionalType extends JSDocType<ts.JSDocOptionalType> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  getParent(): NodeParentType<ts.JSDocOptionalType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocOptionalType>>;
}
declare const JSDocOverloadTagBase: Constructor<JSDocTypeExpressionableTag> & typeof JSDocTag;
export declare class JSDocOverloadTag extends JSDocOverloadTagBase<ts.JSDocOverloadTag> {
  getParent(): NodeParentType<ts.JSDocOverloadTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocOverloadTag>>;
}
export declare class JSDocOverrideTag extends JSDocTag<ts.JSDocOverrideTag> {
  getParent(): NodeParentType<ts.JSDocOverrideTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocOverrideTag>>;
}
declare const JSDocParameterTagBase: Constructor<JSDocPropertyLikeTag> & typeof JSDocTag;
export declare class JSDocParameterTag extends JSDocParameterTagBase<ts.JSDocParameterTag> {
  getParent(): NodeParentType<ts.JSDocParameterTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocParameterTag>>;
}
export declare class JSDocPrivateTag extends JSDocTag<ts.JSDocPrivateTag> {
  getParent(): NodeParentType<ts.JSDocPrivateTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocPrivateTag>>;
}
declare const JSDocPropertyTagBase: Constructor<JSDocPropertyLikeTag> & typeof JSDocTag;
export declare class JSDocPropertyTag extends JSDocPropertyTagBase<ts.JSDocPropertyTag> {
  getParent(): NodeParentType<ts.JSDocPropertyTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocPropertyTag>>;
}
export declare class JSDocProtectedTag extends JSDocTag<ts.JSDocProtectedTag> {
  getParent(): NodeParentType<ts.JSDocProtectedTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocProtectedTag>>;
}
export declare class JSDocPublicTag extends JSDocTag<ts.JSDocPublicTag> {
  getParent(): NodeParentType<ts.JSDocPublicTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocPublicTag>>;
}
export declare class JSDocReadonlyTag extends JSDocTag<ts.JSDocReadonlyTag> {
  getParent(): NodeParentType<ts.JSDocReadonlyTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocReadonlyTag>>;
}
declare const JSDocReturnTagBase: Constructor<JSDocTypeExpressionableTag> & typeof JSDocTag;
export declare class JSDocReturnTag extends JSDocReturnTagBase<ts.JSDocReturnTag> {
  getParent(): NodeParentType<ts.JSDocReturnTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocReturnTag>>;
}
declare const JSDocSatisfiesTagBase: Constructor<JSDocTypeExpressionableTag> & typeof JSDocTag;
export declare class JSDocSatisfiesTag extends JSDocSatisfiesTagBase<ts.JSDocSatisfiesTag> {
  getParent(): NodeParentType<ts.JSDocSatisfiesTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocSatisfiesTag>>;
}
declare const JSDocSeeTagBase: Constructor<JSDocTypeExpressionableTag> & typeof JSDocTag;
export declare class JSDocSeeTag extends JSDocSeeTagBase<ts.JSDocSeeTag> {
  getParent(): NodeParentType<ts.JSDocSeeTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocSeeTag>>;
}
export declare class JSDocSignature extends JSDocType<ts.JSDocSignature> {
  getTypeNode(): JSDocReturnTag | undefined;
  getParent(): NodeParentType<ts.JSDocSignature>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocSignature>>;
}
declare const JSDocTagBase: typeof Node;
export declare class JSDocTag<NodeType extends ts.JSDocTag = ts.JSDocTag> extends JSDocTagBase<NodeType> {
  getTagName(): string;
  getTagNameNode(): Identifier;
  setTagName(tagName: string): Node<ts.Node>;
  getComment(): string | (JSDocText | JSDocLink | JSDocLinkCode | JSDocLinkPlain | undefined)[] | undefined;
  getCommentText(): string | undefined;
  remove(): void;
  set(structure: Partial<JSDocTagStructure>): Node<ts.Node>;
  replaceWithText(textOrWriterFunction: string | WriterFunction): Node;
  getStructure(): JSDocTagStructure;
}
export declare class JSDocTagInfo {
  #private;
  private constructor();
  get compilerObject(): ts.JSDocTagInfo;
  getName(): string;
  getText(): ts.SymbolDisplayPart[];
}
declare const JSDocTemplateTagBase: Constructor<JSDocTypeParameteredTag> & typeof JSDocTag;
export declare class JSDocTemplateTag extends JSDocTemplateTagBase<ts.JSDocTemplateTag> {
  getConstraint(): JSDocTypeExpression | undefined;
  getConstraintOrThrow(message?: string | (() => string)): JSDocTypeExpression;
  getParent(): NodeParentType<ts.JSDocTemplateTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocTemplateTag>>;
}
export declare class JSDocText extends Node<ts.JSDocText> {
  getParent(): NodeParentType<ts.JSDocText>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocText>>;
}
declare const JSDocThisTagBase: Constructor<JSDocTypeExpressionableTag> & typeof JSDocTag;
export declare class JSDocThisTag extends JSDocThisTagBase<ts.JSDocThisTag> {
  getParent(): NodeParentType<ts.JSDocThisTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocThisTag>>;
}
declare const JSDocThrowsTagBase: Constructor<JSDocTypeExpressionableTag> & typeof JSDocTag;
export declare class JSDocThrowsTag extends JSDocThrowsTagBase<ts.JSDocThrowsTag> {
  getParent(): NodeParentType<ts.JSDocThrowsTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocThrowsTag>>;
}
export declare class JSDocType<T extends ts.JSDocType = ts.JSDocType> extends TypeNode<T> {
}
export declare class JSDocTypedefTag extends JSDocTag<ts.JSDocTypedefTag> {
  getParent(): NodeParentType<ts.JSDocTypedefTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocTypedefTag>>;
}
export declare class JSDocTypeExpression extends TypeNode<ts.JSDocTypeExpression> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  getParent(): NodeParentType<ts.JSDocTypeExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocTypeExpression>>;
}
export declare class JSDocTypeLiteral extends JSDocType<ts.JSDocTypeLiteral> {
  isArrayType(): boolean;
  getPropertyTags(): JSDocTag<ts.JSDocTag>[] | undefined;
  getParent(): NodeParentType<ts.JSDocTypeLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocTypeLiteral>>;
}
export declare class JSDocTypeTag extends JSDocTag<ts.JSDocTypeTag> {
  getTypeExpression(): JSDocTypeExpression | undefined;
  getParent(): NodeParentType<ts.JSDocTypeTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocTypeTag>>;
}
export declare class JSDocUnknownTag extends JSDocTag<ts.JSDocUnknownTag> {
  getParent(): NodeParentType<ts.JSDocUnknownTag>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocUnknownTag>>;
}
export declare class JSDocUnknownType extends JSDocType<ts.JSDocUnknownType> {
  getParent(): NodeParentType<ts.JSDocUnknownType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocUnknownType>>;
}
export declare class JSDocVariadicType extends JSDocType<ts.JSDocVariadicType> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  getParent(): NodeParentType<ts.JSDocVariadicType>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JSDocVariadicType>>;
}
export declare class CommentEnumMember extends Node<CompilerCommentEnumMember> {
  remove(): void;
}
declare const EnumDeclarationBase: Constructor<TextInsertableNode> & Constructor<ModuleChildableNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Statement;
export declare class EnumDeclaration extends EnumDeclarationBase<ts.EnumDeclaration> {
  set(structure: Partial<EnumDeclarationStructure>): this;
  addMember(structure: OptionalKind<EnumMemberStructure>): EnumMember;
  addMember(structure: OptionalKind<EnumMemberStructure> | WriterFunction | string): EnumMember | CommentEnumMember;
  addMembers(structures: ReadonlyArray<OptionalKind<EnumMemberStructure>>): EnumMember[];
  addMembers(structures: ReadonlyArray<OptionalKind<EnumMemberStructure> | WriterFunction | string> | string | WriterFunction): (EnumMember | CommentEnumMember)[];
  insertMember(index: number, structure: OptionalKind<EnumMemberStructure>): EnumMember;
  insertMember(index: number, structure: OptionalKind<EnumMemberStructure> | WriterFunction | string): EnumMember | CommentEnumMember;
  insertMembers(index: number, structures: ReadonlyArray<OptionalKind<EnumMemberStructure>>): EnumMember[];
  insertMembers(index: number, structures: ReadonlyArray<OptionalKind<EnumMemberStructure> | WriterFunction | string> | WriterFunction | string): (EnumMember | CommentEnumMember)[];
  getMember(name: string): EnumMember | undefined;
  getMember(findFunction: (declaration: EnumMember) => boolean): EnumMember | undefined;
  getMemberOrThrow(name: string): EnumMember;
  getMemberOrThrow(findFunction: (declaration: EnumMember) => boolean): EnumMember;
  getMembers(): EnumMember[];
  getMembersWithComments(): (EnumMember | CommentEnumMember)[];
  setIsConstEnum(value: boolean): this;
  isConstEnum(): boolean;
  getConstKeyword(): Node<ts.Node> | undefined;
  getStructure(): EnumDeclarationStructure;
  getParent(): NodeParentType<ts.EnumDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.EnumDeclaration>>;
}
declare const EnumMemberBase: Constructor<JSDocableNode> & Constructor<InitializerExpressionableNode> & Constructor<PropertyNamedNode> & typeof Node;
export declare class EnumMember extends EnumMemberBase<ts.EnumMember> {
  getValue(): string | number | undefined;
  setValue(value: string | number): this;
  remove(): void;
  set(structure: Partial<EnumMemberStructure>): this;
  getStructure(): EnumMemberStructure;
  getParent(): NodeParentType<ts.EnumMember>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.EnumMember>>;
}
declare const ArrayDestructuringAssignmentBase: typeof AssignmentExpression;
export declare class ArrayDestructuringAssignment extends ArrayDestructuringAssignmentBase<ts.ArrayDestructuringAssignment> {
  getLeft(): ArrayLiteralExpression;
  getParent(): NodeParentType<ts.ArrayDestructuringAssignment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ArrayDestructuringAssignment>>;
}
export declare class ArrayLiteralExpression extends PrimaryExpression<ts.ArrayLiteralExpression> {
  getElements(): Expression[];
  addElement(textOrWriterFunction: string | WriterFunction, options?: {
        useNewLines?: boolean;
    }): Expression<ts.Expression>;
  addElements(textsOrWriterFunction: ReadonlyArray<string | WriterFunction> | WriterFunction, options?: {
        useNewLines?: boolean;
    }): Expression<ts.Expression>[];
  insertElement(index: number, textOrWriterFunction: string | WriterFunction, options?: {
        useNewLines?: boolean;
    }): Expression<ts.Expression>;
  insertElements(index: number, textsOrWriterFunction: ReadonlyArray<string | WriterFunction> | WriterFunction, options?: {
        useNewLines?: boolean;
    }): Expression<ts.Expression>[];
  removeElement(index: number): void;
  removeElement(element: Expression): void;
  getParent(): NodeParentType<ts.ArrayLiteralExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ArrayLiteralExpression>>;
}
declare const AsExpressionBase: Constructor<TypedNode> & Constructor<ExpressionedNode> & typeof Expression;
export declare class AsExpression extends AsExpressionBase<ts.AsExpression> {
  getParent(): NodeParentType<ts.AsExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.AsExpression>>;
}
declare const AssignmentExpressionBase: typeof BinaryExpression;
export declare class AssignmentExpression<T extends ts.AssignmentExpression<ts.AssignmentOperatorToken> = ts.AssignmentExpression<ts.AssignmentOperatorToken>> extends AssignmentExpressionBase<T> {
  getOperatorToken(): Node<ts.AssignmentOperatorToken>;
}
declare const AwaitExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;
export declare class AwaitExpression extends AwaitExpressionBase<ts.AwaitExpression> {
  getParent(): NodeParentType<ts.AwaitExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.AwaitExpression>>;
}
export interface InstanceofExpression extends BinaryExpression {
  compilerNode: ts.InstanceofExpression;
  getOperatorToken(): Node<ts.Token<SyntaxKind.InstanceOfKeyword>>;
}
declare const BinaryExpressionBase: typeof Expression;
export declare class BinaryExpression<T extends ts.BinaryExpression = ts.BinaryExpression> extends BinaryExpressionBase<T> {
  getLeft(): Expression;
  getOperatorToken(): Node<ts.BinaryOperatorToken>;
  getRight(): Expression;
}
declare const CallExpressionBase: Constructor<TypeArgumentedNode> & Constructor<ArgumentedNode> & Constructor<QuestionDotTokenableNode> & Constructor<LeftHandSideExpressionedNode> & typeof LeftHandSideExpression;
export declare class CallExpression<T extends ts.CallExpression = ts.CallExpression> extends CallExpressionBase<T> {
  getReturnType(): Type;
}
declare const CommaListExpressionBase: typeof Expression;
export declare class CommaListExpression extends CommaListExpressionBase<ts.CommaListExpression> {
  getElements(): Expression[];
  getParent(): NodeParentType<ts.CommaListExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.CommaListExpression>>;
}
declare const ConditionalExpressionBase: typeof Expression;
export declare class ConditionalExpression extends ConditionalExpressionBase<ts.ConditionalExpression> {
  getCondition(): Expression;
  getQuestionToken(): Node<ts.QuestionToken>;
  getWhenTrue(): Expression;
  getColonToken(): Node<ts.ColonToken>;
  getWhenFalse(): Expression;
  getParent(): NodeParentType<ts.ConditionalExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ConditionalExpression>>;
}
declare const DeleteExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;
export declare class DeleteExpression extends DeleteExpressionBase<ts.DeleteExpression> {
  getParent(): NodeParentType<ts.DeleteExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.DeleteExpression>>;
}
declare const ElementAccessExpressionBase: Constructor<QuestionDotTokenableNode> & Constructor<LeftHandSideExpressionedNode> & typeof MemberExpression;
export declare class ElementAccessExpression<T extends ts.ElementAccessExpression = ts.ElementAccessExpression> extends ElementAccessExpressionBase<T> {
  getArgumentExpression(): Expression | undefined;
  getArgumentExpressionOrThrow(message?: string | (() => string)): Expression<ts.Expression>;
}
export declare class Expression<T extends ts.Expression = ts.Expression> extends Node<T> {
  getContextualType(): Type | undefined;
}
export declare function ExpressionableNode<T extends Constructor<ExpressionableNodeExtensionType>>(Base: T): Constructor<ExpressionableNode> & T;
export interface ExpressionableNode {
  getExpression(): Expression | undefined;
  getExpressionOrThrow(message?: string | (() => string)): Expression;
  getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
  getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
}
type ExpressionableNodeExtensionType = Node<ts.Node & {
      expression?: ts.Expression;
  }>;
export declare function BaseExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>, TExpression extends Node = CompilerNodeToWrappedType<InstanceOf<T>["compilerNode"]>>(Base: T): Constructor<BaseExpressionedNode<TExpression>> & T;
export interface BaseExpressionedNode<TExpression extends Node> {
  getExpression(): TExpression;
  getExpressionIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
  getExpressionIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
  setExpression(textOrWriterFunction: string | WriterFunction): this;
}
export declare function ExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>>(Base: T): Constructor<ExpressionedNode> & T;
export interface ExpressionedNode extends BaseExpressionedNode<Expression> {
}
type ExpressionedNodeExtensionType = Node<ts.Node & {
      expression: ts.Expression;
  }>;
export declare function ImportExpressionedNode<T extends Constructor<ImportExpressionedNodeExtensionType>>(Base: T): Constructor<ImportExpressionedNode> & T;
export interface ImportExpressionedNode extends BaseExpressionedNode<ImportExpression> {
}
type ImportExpressionedNodeExtensionType = Node<ts.Node & {
      expression: ts.ImportExpression;
  }>;
export declare function LeftHandSideExpressionedNode<T extends Constructor<LeftHandSideExpressionedNodeExtensionType>>(Base: T): Constructor<LeftHandSideExpressionedNode> & T;
export interface LeftHandSideExpressionedNode extends BaseExpressionedNode<LeftHandSideExpression> {
}
type LeftHandSideExpressionedNodeExtensionType = Node<ts.Node & {
      expression: ts.LeftHandSideExpression;
  }>;
export declare function SuperExpressionedNode<T extends Constructor<SuperExpressionedNodeExtensionType>>(Base: T): Constructor<SuperExpressionedNode> & T;
export interface SuperExpressionedNode extends BaseExpressionedNode<SuperExpression> {
}
type SuperExpressionedNodeExtensionType = Node<ts.Node & {
      expression: ts.SuperExpression;
  }>;
export declare function UnaryExpressionedNode<T extends Constructor<UnaryExpressionedNodeExtensionType>>(Base: T): Constructor<UnaryExpressionedNode> & T;
export interface UnaryExpressionedNode extends BaseExpressionedNode<UnaryExpression> {
}
type UnaryExpressionedNodeExtensionType = Node<ts.Node & {
      expression: ts.UnaryExpression;
  }>;
declare const ImportExpressionBase: typeof PrimaryExpression;
export declare class ImportExpression extends ImportExpressionBase<ts.ImportExpression> {
  getParent(): NodeParentType<ts.ImportExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportExpression>>;
}
export declare class LeftHandSideExpression<T extends ts.LeftHandSideExpression = ts.LeftHandSideExpression> extends UpdateExpression<T> {
}
declare const LiteralExpressionBase: Constructor<LiteralLikeNode> & typeof PrimaryExpression;
export declare class LiteralExpression<T extends ts.LiteralExpression = ts.LiteralExpression> extends LiteralExpressionBase<T> {
}
export declare class MemberExpression<T extends ts.MemberExpression = ts.MemberExpression> extends LeftHandSideExpression<T> {
}
declare const MetaPropertyBase: Constructor<NamedNode> & typeof PrimaryExpression;
export declare class MetaProperty extends MetaPropertyBase<ts.MetaProperty> {
  getKeywordToken(): SyntaxKind.ImportKeyword | SyntaxKind.NewKeyword;
  getParent(): NodeParentType<ts.MetaProperty>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.MetaProperty>>;
}
declare const NewExpressionBase: Constructor<TypeArgumentedNode> & Constructor<ArgumentedNode> & Constructor<LeftHandSideExpressionedNode> & typeof PrimaryExpression;
export declare class NewExpression extends NewExpressionBase<ts.NewExpression> {
  getParent(): NodeParentType<ts.NewExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NewExpression>>;
}
declare const NonNullExpressionBase: Constructor<ExpressionedNode> & typeof LeftHandSideExpression;
export declare class NonNullExpression extends NonNullExpressionBase<ts.NonNullExpression> {
  getParent(): NodeParentType<ts.NonNullExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NonNullExpression>>;
}
export declare class CommentObjectLiteralElement extends ObjectLiteralElement<CompilerCommentObjectLiteralElement> {
}
declare const ObjectDestructuringAssignmentBase: typeof AssignmentExpression;
export declare class ObjectDestructuringAssignment extends ObjectDestructuringAssignmentBase<ts.ObjectDestructuringAssignment> {
  getLeft(): ObjectLiteralExpression;
  getParent(): NodeParentType<ts.ObjectDestructuringAssignment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ObjectDestructuringAssignment>>;
}
export declare class ObjectLiteralElement<T extends ts.ObjectLiteralElement = ts.ObjectLiteralElement> extends Node<T> {
  remove(): void;
}
declare const ObjectLiteralExpressionBase: typeof PrimaryExpression;
export declare class ObjectLiteralExpression extends ObjectLiteralExpressionBase<ts.ObjectLiteralExpression> {
  #private;
  getPropertyOrThrow(name: string): ObjectLiteralElementLike;
  getPropertyOrThrow(findFunction: (property: ObjectLiteralElementLike) => boolean): ObjectLiteralElementLike;
  getProperty(name: string): ObjectLiteralElementLike | undefined;
  getProperty(findFunction: (property: ObjectLiteralElementLike) => boolean): ObjectLiteralElementLike | undefined;
  getProperties(): ObjectLiteralElementLike[];
  getPropertiesWithComments(): (ObjectLiteralElementLike | CommentObjectLiteralElement)[];
  addProperty(structure: string | WriterFunction | ObjectLiteralExpressionPropertyStructures): CommentObjectLiteralElement | ObjectLiteralElementLike;
  addProperties(structures: string | WriterFunction | ReadonlyArray<string | WriterFunction | ObjectLiteralExpressionPropertyStructures>): (CommentObjectLiteralElement | ObjectLiteralElementLike)[];
  insertProperty(index: number, structure: string | WriterFunction | ObjectLiteralExpressionPropertyStructures): CommentObjectLiteralElement | ObjectLiteralElementLike;
  insertProperties(index: number, structures: string | WriterFunction | ReadonlyArray<string | WriterFunction | ObjectLiteralExpressionPropertyStructures>): (CommentObjectLiteralElement | ObjectLiteralElementLike)[];
  addPropertyAssignment(structure: OptionalKind<PropertyAssignmentStructure>): PropertyAssignment;
  addPropertyAssignments(structures: ReadonlyArray<OptionalKind<PropertyAssignmentStructure>>): PropertyAssignment[];
  insertPropertyAssignment(index: number, structure: OptionalKind<PropertyAssignmentStructure>): PropertyAssignment;
  insertPropertyAssignments(index: number, structures: ReadonlyArray<OptionalKind<PropertyAssignmentStructure>>): PropertyAssignment[];
  addShorthandPropertyAssignment(structure: OptionalKind<ShorthandPropertyAssignmentStructure>): ShorthandPropertyAssignment;
  addShorthandPropertyAssignments(structures: ReadonlyArray<OptionalKind<ShorthandPropertyAssignmentStructure>>): ShorthandPropertyAssignment[];
  insertShorthandPropertyAssignment(index: number, structure: OptionalKind<ShorthandPropertyAssignmentStructure>): ShorthandPropertyAssignment;
  insertShorthandPropertyAssignments(index: number, structures: ReadonlyArray<OptionalKind<ShorthandPropertyAssignmentStructure>>): ShorthandPropertyAssignment[];
  addSpreadAssignment(structure: OptionalKind<SpreadAssignmentStructure>): SpreadAssignment;
  addSpreadAssignments(structures: ReadonlyArray<OptionalKind<SpreadAssignmentStructure>>): SpreadAssignment[];
  insertSpreadAssignment(index: number, structure: OptionalKind<SpreadAssignmentStructure>): SpreadAssignment;
  insertSpreadAssignments(index: number, structures: ReadonlyArray<OptionalKind<SpreadAssignmentStructure>>): SpreadAssignment[];
  addMethod(structure: OptionalKind<MethodDeclarationStructure>): MethodDeclaration;
  addMethods(structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>): MethodDeclaration[];
  insertMethod(index: number, structure: OptionalKind<MethodDeclarationStructure>): MethodDeclaration;
  insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>): MethodDeclaration[];
  addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  getParent(): NodeParentType<ts.ObjectLiteralExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ObjectLiteralExpression>>;
}
declare const PropertyAssignmentBase: Constructor<InitializerExpressionGetableNode> & Constructor<QuestionTokenableNode> & Constructor<PropertyNamedNode> & typeof ObjectLiteralElement;
export declare class PropertyAssignment extends PropertyAssignmentBase<ts.PropertyAssignment> {
  removeInitializer(): ShorthandPropertyAssignment;
  setInitializer(textOrWriterFunction: string | WriterFunction): this;
  set(structure: Partial<PropertyAssignmentStructure>): this | ShorthandPropertyAssignment;
  getStructure(): PropertyAssignmentStructure;
  getParent(): NodeParentType<ts.PropertyAssignment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.PropertyAssignment>>;
}
declare const ShorthandPropertyAssignmentBase: Constructor<InitializerExpressionGetableNode> & Constructor<QuestionTokenableNode> & Constructor<NamedNode> & typeof ObjectLiteralElement;
export declare class ShorthandPropertyAssignment extends ShorthandPropertyAssignmentBase<ts.ShorthandPropertyAssignment> {
  hasObjectAssignmentInitializer(): boolean;
  getObjectAssignmentInitializerOrThrow(message?: string | (() => string)): Expression<ts.Expression>;
  getObjectAssignmentInitializer(): Expression | undefined;
  getEqualsTokenOrThrow(message?: string | (() => string)): Node<ts.EqualsToken>;
  getEqualsToken(): Node<ts.EqualsToken> | undefined;
  removeObjectAssignmentInitializer(): this;
  setInitializer(text: string): PropertyAssignment;
  set(structure: Partial<ShorthandPropertyAssignmentStructure>): this;
  getStructure(): ShorthandPropertyAssignmentStructure;
  getValueSymbol(): Symbol | undefined;
  getValueSymbolOrThrow(message?: string | (() => string)): Symbol;
  getParent(): NodeParentType<ts.ShorthandPropertyAssignment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ShorthandPropertyAssignment>>;
}
declare const SpreadAssignmentBase: Constructor<ExpressionedNode> & typeof ObjectLiteralElement;
export declare class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
  set(structure: Partial<SpreadAssignmentStructure>): this;
  getStructure(): SpreadAssignmentStructure;
  getParent(): NodeParentType<ts.SpreadAssignment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SpreadAssignment>>;
}
declare const OmittedExpressionBase: typeof Expression;
export declare class OmittedExpression extends OmittedExpressionBase<ts.OmittedExpression> {
  getParent(): NodeParentType<ts.OmittedExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.OmittedExpression>>;
}
declare const ParenthesizedExpressionBase: Constructor<ExpressionedNode> & typeof Expression;
export declare class ParenthesizedExpression extends ParenthesizedExpressionBase<ts.ParenthesizedExpression> {
  getParent(): NodeParentType<ts.ParenthesizedExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ParenthesizedExpression>>;
}
declare const PartiallyEmittedExpressionBase: Constructor<ExpressionedNode> & typeof Expression;
export declare class PartiallyEmittedExpression extends PartiallyEmittedExpressionBase<ts.PartiallyEmittedExpression> {
  getParent(): NodeParentType<ts.PartiallyEmittedExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.PartiallyEmittedExpression>>;
}
declare const PostfixUnaryExpressionBase: typeof UnaryExpression;
export declare class PostfixUnaryExpression extends PostfixUnaryExpressionBase<ts.PostfixUnaryExpression> {
  getOperatorToken(): ts.PostfixUnaryOperator;
  getOperand(): LeftHandSideExpression;
  getParent(): NodeParentType<ts.PostfixUnaryExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.PostfixUnaryExpression>>;
}
declare const PrefixUnaryExpressionBase: typeof UnaryExpression;
export declare class PrefixUnaryExpression extends PrefixUnaryExpressionBase<ts.PrefixUnaryExpression> {
  getOperatorToken(): ts.PrefixUnaryOperator;
  getOperand(): UnaryExpression;
  getParent(): NodeParentType<ts.PrefixUnaryExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.PrefixUnaryExpression>>;
}
export declare class PrimaryExpression<T extends ts.PrimaryExpression = ts.PrimaryExpression> extends MemberExpression<T> {
}
declare const PropertyAccessExpressionBase: Constructor<NamedNode> & Constructor<QuestionDotTokenableNode> & Constructor<LeftHandSideExpressionedNode> & typeof MemberExpression;
export declare class PropertyAccessExpression<T extends ts.PropertyAccessExpression = ts.PropertyAccessExpression> extends PropertyAccessExpressionBase<T> {
}
declare const SatisfiesExpressionBase: Constructor<TypedNode> & Constructor<ExpressionedNode> & typeof Expression;
export declare class SatisfiesExpression extends SatisfiesExpressionBase<ts.SatisfiesExpression> {
  getParent(): NodeParentType<ts.SatisfiesExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SatisfiesExpression>>;
}
declare const SpreadElementBase: Constructor<ExpressionedNode> & typeof Expression;
export declare class SpreadElement extends SpreadElementBase<ts.SpreadElement> {
  getParent(): NodeParentType<ts.SpreadElement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SpreadElement>>;
}
declare const SuperElementAccessExpressionBase: Constructor<SuperExpressionedNode> & typeof ElementAccessExpression;
export declare class SuperElementAccessExpression extends SuperElementAccessExpressionBase<ts.SuperElementAccessExpression> {
  getParent(): NodeParentType<ts.SuperElementAccessExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SuperElementAccessExpression>>;
}
declare const SuperExpressionBase: typeof PrimaryExpression;
export declare class SuperExpression extends SuperExpressionBase<ts.SuperExpression> {
  getParent(): NodeParentType<ts.SuperExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SuperExpression>>;
}
declare const SuperPropertyAccessExpressionBase: Constructor<SuperExpressionedNode> & typeof PropertyAccessExpression;
export declare class SuperPropertyAccessExpression extends SuperPropertyAccessExpressionBase<ts.SuperPropertyAccessExpression> {
  getParent(): NodeParentType<ts.SuperPropertyAccessExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SuperPropertyAccessExpression>>;
}
declare const ThisExpressionBase: typeof PrimaryExpression;
export declare class ThisExpression extends ThisExpressionBase<ts.ThisExpression> {
  getParent(): NodeParentType<ts.ThisExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ThisExpression>>;
}
declare const TypeAssertionBase: Constructor<TypedNode> & Constructor<UnaryExpressionedNode> & typeof UnaryExpression;
export declare class TypeAssertion extends TypeAssertionBase<ts.TypeAssertion> {
  getParent(): NodeParentType<ts.TypeAssertion>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeAssertion>>;
}
declare const TypeOfExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;
export declare class TypeOfExpression extends TypeOfExpressionBase<ts.TypeOfExpression> {
  getParent(): NodeParentType<ts.TypeOfExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeOfExpression>>;
}
export declare class UnaryExpression<T extends ts.UnaryExpression = ts.UnaryExpression> extends Expression<T> {
}
export declare class UpdateExpression<T extends ts.UpdateExpression = ts.UpdateExpression> extends UnaryExpression<T> {
}
declare const VoidExpressionBase: Constructor<UnaryExpressionedNode> & typeof UnaryExpression;
export declare class VoidExpression extends VoidExpressionBase<ts.VoidExpression> {
  getParent(): NodeParentType<ts.VoidExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.VoidExpression>>;
}
declare const YieldExpressionBase: Constructor<ExpressionableNode> & Constructor<GeneratorableNode> & typeof Expression;
export declare class YieldExpression extends YieldExpressionBase<ts.YieldExpression> {
  getParent(): NodeParentType<ts.YieldExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.YieldExpression>>;
}
declare const ArrowFunctionBase: Constructor<TextInsertableNode> & Constructor<BodiedNode> & Constructor<AsyncableNode> & Constructor<FunctionLikeDeclaration> & typeof Expression;
export declare class ArrowFunction extends ArrowFunctionBase<ts.ArrowFunction> {
  getEqualsGreaterThan(): Node<ts.Token<SyntaxKind.EqualsGreaterThanToken>>;
  getParent(): NodeParentType<ts.ArrowFunction>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ArrowFunction>>;
}
declare const FunctionDeclarationBase: Constructor<UnwrappableNode> & Constructor<TextInsertableNode> & Constructor<OverloadableNode> & Constructor<BodyableNode> & Constructor<AsyncableNode> & Constructor<GeneratorableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<FunctionLikeDeclaration> & Constructor<ModuleChildableNode> & Constructor<NameableNode> & typeof Statement;
declare const FunctionDeclarationOverloadBase: Constructor<UnwrappableNode> & Constructor<TextInsertableNode> & Constructor<AsyncableNode> & Constructor<GeneratorableNode> & Constructor<SignaturedDeclaration> & Constructor<AmbientableNode> & Constructor<ModuleChildableNode> & Constructor<JSDocableNode> & Constructor<TypeParameteredNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & typeof Statement;
export declare class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
  addOverload(structure: OptionalKind<FunctionDeclarationOverloadStructure>): FunctionDeclaration;
  addOverloads(structures: ReadonlyArray<OptionalKind<FunctionDeclarationOverloadStructure>>): FunctionDeclaration[];
  insertOverload(index: number, structure: OptionalKind<FunctionDeclarationOverloadStructure>): FunctionDeclaration;
  insertOverloads(index: number, structures: ReadonlyArray<OptionalKind<FunctionDeclarationOverloadStructure>>): FunctionDeclaration[];
  remove(): void;
  set(structure: Partial<FunctionDeclarationStructure>): this;
  getStructure(): FunctionDeclarationStructure | FunctionDeclarationOverloadStructure;
  getParent(): NodeParentType<ts.FunctionDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.FunctionDeclaration>>;
}
declare const FunctionExpressionBase: Constructor<JSDocableNode> & Constructor<TextInsertableNode> & Constructor<BodiedNode> & Constructor<AsyncableNode> & Constructor<GeneratorableNode> & Constructor<StatementedNode> & Constructor<TypeParameteredNode> & Constructor<SignaturedDeclaration> & Constructor<ModifierableNode> & Constructor<NameableNode> & typeof PrimaryExpression;
export declare class FunctionExpression extends FunctionExpressionBase<ts.FunctionExpression> {
  getParent(): NodeParentType<ts.FunctionExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.FunctionExpression>>;
}
export declare function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T;
export interface FunctionLikeDeclaration extends JSDocableNode, TypeParameteredNode, SignaturedDeclaration, StatementedNode, ModifierableNode {
}
type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;
export declare function OverloadableNode<T extends Constructor<OverloadableNodeExtensionType>>(Base: T): Constructor<OverloadableNode> & T;
export interface OverloadableNode {
  getOverloads(): this[];
  getImplementation(): this | undefined;
  getImplementationOrThrow(message?: string | (() => string)): this;
  isOverload(): boolean;
  isImplementation(): boolean;
}
type OverloadableNodeExtensionType = Node & BodyableNode;
declare const ParameterDeclarationBase: Constructor<OverrideableNode> & Constructor<QuestionTokenableNode> & Constructor<DecoratableNode> & Constructor<ScopeableNode> & Constructor<ReadonlyableNode> & Constructor<ModifierableNode> & Constructor<DotDotDotTokenableNode> & Constructor<TypedNode> & Constructor<InitializerExpressionableNode> & Constructor<BindingNamedNode> & typeof Node;
export declare class ParameterDeclaration extends ParameterDeclarationBase<ts.ParameterDeclaration> {
  isRestParameter(): boolean;
  isParameterProperty(): boolean;
  setIsRestParameter(value: boolean): this;
  isOptional(): boolean;
  remove(): void;
  set(structure: Partial<ParameterDeclarationStructure>): this;
  getStructure(): ParameterDeclarationStructure;
  setHasQuestionToken(value: boolean): this;
  setInitializer(textOrWriterFunction: string | WriterFunction): this;
  setType(textOrWriterFunction: string | WriterFunction): this;
  getParent(): NodeParentType<ts.ParameterDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ParameterDeclaration>>;
}
export declare class HeritageClause extends Node<ts.HeritageClause> {
  getTypeNodes(): ExpressionWithTypeArguments[];
  getToken(): SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword;
  removeExpression(index: number): this;
  removeExpression(expressionNode: ExpressionWithTypeArguments): this;
  getParent(): NodeParentType<ts.HeritageClause>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.HeritageClause>>;
}
declare const CallSignatureDeclarationBase: Constructor<TypeParameteredNode> & Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<SignaturedDeclaration> & typeof TypeElement;
export declare class CallSignatureDeclaration extends CallSignatureDeclarationBase<ts.CallSignatureDeclaration> {
  set(structure: Partial<CallSignatureDeclarationStructure>): this;
  getStructure(): CallSignatureDeclarationStructure;
  getParent(): NodeParentType<ts.CallSignatureDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.CallSignatureDeclaration>>;
}
export declare class CommentTypeElement extends TypeElement<CompilerCommentTypeElement> {
}
declare const ConstructSignatureDeclarationBase: Constructor<TypeParameteredNode> & Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<SignaturedDeclaration> & typeof TypeElement;
export declare class ConstructSignatureDeclaration extends ConstructSignatureDeclarationBase<ts.ConstructSignatureDeclaration> {
  set(structure: Partial<ConstructSignatureDeclarationStructure>): this;
  getStructure(): ConstructSignatureDeclarationStructure;
  getParent(): NodeParentType<ts.ConstructSignatureDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ConstructSignatureDeclaration>>;
}
declare const IndexSignatureDeclarationBase: Constructor<ReturnTypedNode> & Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<ReadonlyableNode> & Constructor<ModifierableNode> & typeof TypeElement;
export declare class IndexSignatureDeclaration extends IndexSignatureDeclarationBase<ts.IndexSignatureDeclaration> {
  getKeyName(): string;
  setKeyName(name: string): void;
  getKeyNameNode(): BindingName;
  getKeyType(): Type;
  setKeyType(type: string): this;
  getKeyTypeNode(): TypeNode;
  set(structure: Partial<IndexSignatureDeclarationStructure>): this;
  getStructure(): IndexSignatureDeclarationStructure;
  getParent(): NodeParentType<ts.IndexSignatureDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.IndexSignatureDeclaration>>;
}
declare const InterfaceDeclarationBase: Constructor<TypeElementMemberedNode> & Constructor<TextInsertableNode> & Constructor<ExtendsClauseableNode> & Constructor<HeritageClauseableNode> & Constructor<TypeParameteredNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ModuleChildableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Statement;
export declare class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
  getBaseTypes(): Type[];
  getBaseDeclarations(): (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[];
  getImplementations(): ImplementationLocation[];
  set(structure: Partial<InterfaceDeclarationStructure>): this;
  getStructure(): InterfaceDeclarationStructure;
  getParent(): NodeParentType<ts.InterfaceDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.InterfaceDeclaration>>;
}
declare const MethodSignatureBase: Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<QuestionTokenableNode> & Constructor<TypeParameteredNode> & Constructor<SignaturedDeclaration> & Constructor<PropertyNamedNode> & typeof TypeElement;
export declare class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
  set(structure: Partial<MethodSignatureStructure>): this;
  getStructure(): MethodSignatureStructure;
  getParent(): NodeParentType<ts.MethodSignature>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.MethodSignature>>;
}
declare const PropertySignatureBase: Constructor<ChildOrderableNode> & Constructor<JSDocableNode> & Constructor<ReadonlyableNode> & Constructor<QuestionTokenableNode> & Constructor<InitializerExpressionableNode> & Constructor<TypedNode> & Constructor<PropertyNamedNode> & Constructor<ModifierableNode> & typeof TypeElement;
export declare class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
  set(structure: Partial<PropertySignatureStructure>): this;
  getStructure(): PropertySignatureStructure;
  getParent(): NodeParentType<ts.PropertySignature>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.PropertySignature>>;
}
export declare class TypeElement<TNode extends ts.TypeElement = ts.TypeElement> extends Node<TNode> {
  remove(): void;
}
export declare function JsxAttributedNode<T extends Constructor<JsxAttributedNodeExtensionType>>(Base: T): Constructor<JsxAttributedNode> & T;
export interface JsxAttributedNode {
  getAttributes(): JsxAttributeLike[];
  getAttribute(name: string): JsxAttributeLike | undefined;
  getAttribute(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike | undefined;
  getAttributeOrThrow(name: string): JsxAttributeLike;
  getAttributeOrThrow(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike;
  addAttribute(attribute: OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>): JsxAttributeLike;
  addAttributes(attributes: ReadonlyArray<OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>>): JsxAttributeLike[];
  insertAttribute(index: number, attribute: OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>): JsxAttributeLike;
  insertAttributes(index: number, attributes: ReadonlyArray<OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>>): JsxAttributeLike[];
}
type JsxAttributedNodeExtensionType = Node<ts.Node & {
      attributes: ts.JsxAttributes;
  }> & JsxTagNamedNode;
export declare function JsxTagNamedNode<T extends Constructor<JsxTagNamedNodeExtensionType>>(Base: T): Constructor<JsxTagNamedNode> & T;
export interface JsxTagNamedNode {
  getTagNameNode(): JsxTagNameExpression;
}
type JsxTagNamedNodeExtensionType = Node<ts.Node & {
      tagName: ts.JsxTagNameExpression;
  }>;
declare const JsxAttributeBase: typeof Node;
export declare class JsxAttribute extends JsxAttributeBase<ts.JsxAttribute> {
  getNameNode(): JsxAttributeName;
  setName(name: string | JsxNamespacedNameStructure): this;
  getInitializerOrThrow(message?: string | (() => string)): StringLiteral | JsxElement | JsxSelfClosingElement | JsxFragment | JsxExpression;
  getInitializer(): JsxElement | JsxExpression | JsxFragment | JsxSelfClosingElement | StringLiteral | undefined;
  setInitializer(textOrWriterFunction: string | WriterFunction): this;
  removeInitializer(): this;
  remove(): void;
  set(structure: Partial<JsxAttributeStructure>): this;
  getStructure(): JsxAttributeStructure;
  getParent(): NodeParentType<ts.JsxAttribute>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxAttribute>>;
}
declare const JsxClosingElementBase: Constructor<JsxTagNamedNode> & typeof Node;
export declare class JsxClosingElement extends JsxClosingElementBase<ts.JsxClosingElement> {
  getParent(): NodeParentType<ts.JsxClosingElement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxClosingElement>>;
}
export declare class JsxClosingFragment extends Expression<ts.JsxClosingFragment> {
  getParent(): NodeParentType<ts.JsxClosingFragment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxClosingFragment>>;
}
declare const JsxElementBase: typeof PrimaryExpression;
export declare class JsxElement extends JsxElementBase<ts.JsxElement> {
  getJsxChildren(): JsxChild[];
  getOpeningElement(): JsxOpeningElement;
  getClosingElement(): JsxClosingElement;
  setBodyText(textOrWriterFunction: string | WriterFunction): this;
  setBodyTextInline(textOrWriterFunction: string | WriterFunction): this;
  set(structure: Partial<JsxElementStructure>): this;
  getStructure(): JsxElementStructure;
  getParent(): NodeParentType<ts.JsxElement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxElement>>;
}
declare const JsxExpressionBase: Constructor<ExpressionableNode> & Constructor<DotDotDotTokenableNode> & typeof Expression;
export declare class JsxExpression extends JsxExpressionBase<ts.JsxExpression> {
  getParent(): NodeParentType<ts.JsxExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxExpression>>;
}
export declare class JsxFragment extends PrimaryExpression<ts.JsxFragment> {
  getJsxChildren(): JsxChild[];
  getOpeningFragment(): JsxOpeningFragment;
  getClosingFragment(): JsxClosingFragment;
  getParent(): NodeParentType<ts.JsxFragment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxFragment>>;
}
declare const JsxNamespacedNameBase: typeof Node;
export declare class JsxNamespacedName extends JsxNamespacedNameBase<ts.JsxNamespacedName> {
  getNamespaceNode(): Identifier;
  getNameNode(): Identifier;
  set(structure: JsxNamespacedNameStructure): this;
  getStructure(): JsxNamespacedNameStructure;
  getParent(): NodeParentType<ts.JsxNamespacedName>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxNamespacedName>>;
}
declare const JsxOpeningElementBase: Constructor<JsxAttributedNode> & Constructor<JsxTagNamedNode> & typeof Expression;
export declare class JsxOpeningElement extends JsxOpeningElementBase<ts.JsxOpeningElement> {
  getParent(): NodeParentType<ts.JsxOpeningElement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxOpeningElement>>;
}
export declare class JsxOpeningFragment extends Expression<ts.JsxOpeningFragment> {
  getParent(): NodeParentType<ts.JsxOpeningFragment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxOpeningFragment>>;
}
declare const JsxSelfClosingElementBase: Constructor<JsxAttributedNode> & Constructor<JsxTagNamedNode> & typeof PrimaryExpression;
export declare class JsxSelfClosingElement extends JsxSelfClosingElementBase<ts.JsxSelfClosingElement> {
  set(structure: Partial<JsxSelfClosingElementStructure>): this;
  getStructure(): JsxSelfClosingElementStructure;
  getParent(): NodeParentType<ts.JsxSelfClosingElement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxSelfClosingElement>>;
}
declare const JsxSpreadAttributeBase: Constructor<ExpressionedNode> & typeof Node;
export declare class JsxSpreadAttribute extends JsxSpreadAttributeBase<ts.JsxSpreadAttribute> {
  remove(): void;
  set(structure: Partial<JsxSpreadAttributeStructure>): this;
  getStructure(): JsxSpreadAttributeStructure;
  getParent(): NodeParentType<ts.JsxSpreadAttribute>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxSpreadAttribute>>;
}
declare const JsxTextBase: Constructor<LiteralLikeNode> & typeof Node;
export declare class JsxText extends JsxTextBase<ts.JsxText> {
  containsOnlyTriviaWhiteSpaces(): boolean;
  getParent(): NodeParentType<ts.JsxText>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.JsxText>>;
}
export interface ImplementedKindToNodeMappings {
  [SyntaxKind.SourceFile]: SourceFile;
  [SyntaxKind.ArrayBindingPattern]: ArrayBindingPattern;
  [SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpression;
  [SyntaxKind.ArrayType]: ArrayTypeNode;
  [SyntaxKind.ArrowFunction]: ArrowFunction;
  [SyntaxKind.AsExpression]: AsExpression;
  [SyntaxKind.AwaitExpression]: AwaitExpression;
  [SyntaxKind.BigIntLiteral]: BigIntLiteral;
  [SyntaxKind.BindingElement]: BindingElement;
  [SyntaxKind.BinaryExpression]: BinaryExpression;
  [SyntaxKind.Block]: Block;
  [SyntaxKind.BreakStatement]: BreakStatement;
  [SyntaxKind.CallExpression]: CallExpression;
  [SyntaxKind.CallSignature]: CallSignatureDeclaration;
  [SyntaxKind.CaseBlock]: CaseBlock;
  [SyntaxKind.CaseClause]: CaseClause;
  [SyntaxKind.CatchClause]: CatchClause;
  [SyntaxKind.ClassDeclaration]: ClassDeclaration;
  [SyntaxKind.ClassExpression]: ClassExpression;
  [SyntaxKind.ClassStaticBlockDeclaration]: ClassStaticBlockDeclaration;
  [SyntaxKind.ConditionalType]: ConditionalTypeNode;
  [SyntaxKind.Constructor]: ConstructorDeclaration;
  [SyntaxKind.ConstructorType]: ConstructorTypeNode;
  [SyntaxKind.ConstructSignature]: ConstructSignatureDeclaration;
  [SyntaxKind.ContinueStatement]: ContinueStatement;
  [SyntaxKind.CommaListExpression]: CommaListExpression;
  [SyntaxKind.ComputedPropertyName]: ComputedPropertyName;
  [SyntaxKind.ConditionalExpression]: ConditionalExpression;
  [SyntaxKind.DebuggerStatement]: DebuggerStatement;
  [SyntaxKind.Decorator]: Decorator;
  [SyntaxKind.DefaultClause]: DefaultClause;
  [SyntaxKind.DeleteExpression]: DeleteExpression;
  [SyntaxKind.DoStatement]: DoStatement;
  [SyntaxKind.ElementAccessExpression]: ElementAccessExpression;
  [SyntaxKind.EmptyStatement]: EmptyStatement;
  [SyntaxKind.EnumDeclaration]: EnumDeclaration;
  [SyntaxKind.EnumMember]: EnumMember;
  [SyntaxKind.ExportAssignment]: ExportAssignment;
  [SyntaxKind.ExportDeclaration]: ExportDeclaration;
  [SyntaxKind.ExportSpecifier]: ExportSpecifier;
  [SyntaxKind.ExpressionWithTypeArguments]: ExpressionWithTypeArguments;
  [SyntaxKind.ExpressionStatement]: ExpressionStatement;
  [SyntaxKind.ExternalModuleReference]: ExternalModuleReference;
  [SyntaxKind.QualifiedName]: QualifiedName;
  [SyntaxKind.ForInStatement]: ForInStatement;
  [SyntaxKind.ForOfStatement]: ForOfStatement;
  [SyntaxKind.ForStatement]: ForStatement;
  [SyntaxKind.FunctionDeclaration]: FunctionDeclaration;
  [SyntaxKind.FunctionExpression]: FunctionExpression;
  [SyntaxKind.FunctionType]: FunctionTypeNode;
  [SyntaxKind.GetAccessor]: GetAccessorDeclaration;
  [SyntaxKind.HeritageClause]: HeritageClause;
  [SyntaxKind.Identifier]: Identifier;
  [SyntaxKind.IfStatement]: IfStatement;
  [SyntaxKind.ImportClause]: ImportClause;
  [SyntaxKind.ImportDeclaration]: ImportDeclaration;
  [SyntaxKind.ImportEqualsDeclaration]: ImportEqualsDeclaration;
  [SyntaxKind.ImportSpecifier]: ImportSpecifier;
  [SyntaxKind.ImportType]: ImportTypeNode;
  [SyntaxKind.ImportAttribute]: ImportAttribute;
  [SyntaxKind.ImportAttributes]: ImportAttributes;
  [SyntaxKind.IndexedAccessType]: IndexedAccessTypeNode;
  [SyntaxKind.IndexSignature]: IndexSignatureDeclaration;
  [SyntaxKind.InferType]: InferTypeNode;
  [SyntaxKind.InterfaceDeclaration]: InterfaceDeclaration;
  [SyntaxKind.IntersectionType]: IntersectionTypeNode;
  [SyntaxKind.JSDocAllType]: JSDocAllType;
  [SyntaxKind.JSDocAugmentsTag]: JSDocAugmentsTag;
  [SyntaxKind.JSDocAuthorTag]: JSDocAuthorTag;
  [SyntaxKind.JSDocCallbackTag]: JSDocCallbackTag;
  [SyntaxKind.JSDocClassTag]: JSDocClassTag;
  [SyntaxKind.JSDocDeprecatedTag]: JSDocDeprecatedTag;
  [SyntaxKind.JSDocEnumTag]: JSDocEnumTag;
  [SyntaxKind.JSDocFunctionType]: JSDocFunctionType;
  [SyntaxKind.JSDocImplementsTag]: JSDocImplementsTag;
  [SyntaxKind.JSDocLink]: JSDocLink;
  [SyntaxKind.JSDocLinkCode]: JSDocLinkCode;
  [SyntaxKind.JSDocLinkPlain]: JSDocLinkPlain;
  [SyntaxKind.JSDocMemberName]: JSDocMemberName;
  [SyntaxKind.JSDocNamepathType]: JSDocNamepathType;
  [SyntaxKind.JSDocNameReference]: JSDocNameReference;
  [SyntaxKind.JSDocNonNullableType]: JSDocNonNullableType;
  [SyntaxKind.JSDocNullableType]: JSDocNullableType;
  [SyntaxKind.JSDocOptionalType]: JSDocOptionalType;
  [SyntaxKind.JSDocOverrideTag]: JSDocOverrideTag;
  [SyntaxKind.JSDocParameterTag]: JSDocParameterTag;
  [SyntaxKind.JSDocPrivateTag]: JSDocPrivateTag;
  [SyntaxKind.JSDocPropertyTag]: JSDocPropertyTag;
  [SyntaxKind.JSDocProtectedTag]: JSDocProtectedTag;
  [SyntaxKind.JSDocPublicTag]: JSDocPublicTag;
  [SyntaxKind.JSDocReturnTag]: JSDocReturnTag;
  [SyntaxKind.JSDocReadonlyTag]: JSDocReadonlyTag;
  [SyntaxKind.JSDocThrowsTag]: JSDocThrowsTag;
  [SyntaxKind.JSDocOverloadTag]: JSDocOverloadTag;
  [SyntaxKind.JSDocSatisfiesTag]: JSDocSatisfiesTag;
  [SyntaxKind.JSDocSeeTag]: JSDocSeeTag;
  [SyntaxKind.JSDocSignature]: JSDocSignature;
  [SyntaxKind.JSDocTag]: JSDocUnknownTag;
  [SyntaxKind.JSDocTemplateTag]: JSDocTemplateTag;
  [SyntaxKind.JSDocText]: JSDocText;
  [SyntaxKind.JSDocThisTag]: JSDocThisTag;
  [SyntaxKind.JSDocTypeExpression]: JSDocTypeExpression;
  [SyntaxKind.JSDocTypeLiteral]: JSDocTypeLiteral;
  [SyntaxKind.JSDocTypeTag]: JSDocTypeTag;
  [SyntaxKind.JSDocTypedefTag]: JSDocTypedefTag;
  [SyntaxKind.JSDocUnknownType]: JSDocUnknownType;
  [SyntaxKind.JSDocVariadicType]: JSDocVariadicType;
  [SyntaxKind.JsxAttribute]: JsxAttribute;
  [SyntaxKind.JsxClosingElement]: JsxClosingElement;
  [SyntaxKind.JsxClosingFragment]: JsxClosingFragment;
  [SyntaxKind.JsxElement]: JsxElement;
  [SyntaxKind.JsxExpression]: JsxExpression;
  [SyntaxKind.JsxFragment]: JsxFragment;
  [SyntaxKind.JsxNamespacedName]: JsxNamespacedName;
  [SyntaxKind.JsxOpeningElement]: JsxOpeningElement;
  [SyntaxKind.JsxOpeningFragment]: JsxOpeningFragment;
  [SyntaxKind.JsxSelfClosingElement]: JsxSelfClosingElement;
  [SyntaxKind.JsxSpreadAttribute]: JsxSpreadAttribute;
  [SyntaxKind.JsxText]: JsxText;
  [SyntaxKind.LabeledStatement]: LabeledStatement;
  [SyntaxKind.LiteralType]: LiteralTypeNode;
  [SyntaxKind.MappedType]: MappedTypeNode;
  [SyntaxKind.MetaProperty]: MetaProperty;
  [SyntaxKind.MethodDeclaration]: MethodDeclaration;
  [SyntaxKind.MethodSignature]: MethodSignature;
  [SyntaxKind.ModuleBlock]: ModuleBlock;
  [SyntaxKind.ModuleDeclaration]: ModuleDeclaration;
  [SyntaxKind.NamedExports]: NamedExports;
  [SyntaxKind.NamedImports]: NamedImports;
  [SyntaxKind.NamedTupleMember]: NamedTupleMember;
  [SyntaxKind.NamespaceExport]: NamespaceExport;
  [SyntaxKind.NamespaceImport]: NamespaceImport;
  [SyntaxKind.NewExpression]: NewExpression;
  [SyntaxKind.NonNullExpression]: NonNullExpression;
  [SyntaxKind.NotEmittedStatement]: NotEmittedStatement;
  [SyntaxKind.NoSubstitutionTemplateLiteral]: NoSubstitutionTemplateLiteral;
  [SyntaxKind.NumericLiteral]: NumericLiteral;
  [SyntaxKind.ObjectBindingPattern]: ObjectBindingPattern;
  [SyntaxKind.ObjectLiteralExpression]: ObjectLiteralExpression;
  [SyntaxKind.OmittedExpression]: OmittedExpression;
  [SyntaxKind.Parameter]: ParameterDeclaration;
  [SyntaxKind.ParenthesizedExpression]: ParenthesizedExpression;
  [SyntaxKind.ParenthesizedType]: ParenthesizedTypeNode;
  [SyntaxKind.PartiallyEmittedExpression]: PartiallyEmittedExpression;
  [SyntaxKind.PostfixUnaryExpression]: PostfixUnaryExpression;
  [SyntaxKind.PrefixUnaryExpression]: PrefixUnaryExpression;
  [SyntaxKind.PrivateIdentifier]: PrivateIdentifier;
  [SyntaxKind.PropertyAccessExpression]: PropertyAccessExpression;
  [SyntaxKind.PropertyAssignment]: PropertyAssignment;
  [SyntaxKind.PropertyDeclaration]: PropertyDeclaration;
  [SyntaxKind.PropertySignature]: PropertySignature;
  [SyntaxKind.RegularExpressionLiteral]: RegularExpressionLiteral;
  [SyntaxKind.RestType]: RestTypeNode;
  [SyntaxKind.ReturnStatement]: ReturnStatement;
  [SyntaxKind.SatisfiesExpression]: SatisfiesExpression;
  [SyntaxKind.SetAccessor]: SetAccessorDeclaration;
  [SyntaxKind.ShorthandPropertyAssignment]: ShorthandPropertyAssignment;
  [SyntaxKind.SpreadAssignment]: SpreadAssignment;
  [SyntaxKind.SpreadElement]: SpreadElement;
  [SyntaxKind.StringLiteral]: StringLiteral;
  [SyntaxKind.SwitchStatement]: SwitchStatement;
  [SyntaxKind.SyntaxList]: SyntaxList;
  [SyntaxKind.TaggedTemplateExpression]: TaggedTemplateExpression;
  [SyntaxKind.TemplateExpression]: TemplateExpression;
  [SyntaxKind.TemplateHead]: TemplateHead;
  [SyntaxKind.TemplateLiteralType]: TemplateLiteralTypeNode;
  [SyntaxKind.TemplateMiddle]: TemplateMiddle;
  [SyntaxKind.TemplateSpan]: TemplateSpan;
  [SyntaxKind.TemplateTail]: TemplateTail;
  [SyntaxKind.ThisType]: ThisTypeNode;
  [SyntaxKind.ThrowStatement]: ThrowStatement;
  [SyntaxKind.TryStatement]: TryStatement;
  [SyntaxKind.TupleType]: TupleTypeNode;
  [SyntaxKind.TypeAliasDeclaration]: TypeAliasDeclaration;
  [SyntaxKind.TypeAssertionExpression]: TypeAssertion;
  [SyntaxKind.TypeLiteral]: TypeLiteralNode;
  [SyntaxKind.TypeOperator]: TypeOperatorTypeNode;
  [SyntaxKind.TypeParameter]: TypeParameterDeclaration;
  [SyntaxKind.TypePredicate]: TypePredicateNode;
  [SyntaxKind.TypeQuery]: TypeQueryNode;
  [SyntaxKind.TypeReference]: TypeReferenceNode;
  [SyntaxKind.UnionType]: UnionTypeNode;
  [SyntaxKind.VariableDeclaration]: VariableDeclaration;
  [SyntaxKind.VariableDeclarationList]: VariableDeclarationList;
  [SyntaxKind.VariableStatement]: VariableStatement;
  [SyntaxKind.JSDoc]: JSDoc;
  [SyntaxKind.TypeOfExpression]: TypeOfExpression;
  [SyntaxKind.WhileStatement]: WhileStatement;
  [SyntaxKind.WithStatement]: WithStatement;
  [SyntaxKind.YieldExpression]: YieldExpression;
  [SyntaxKind.SemicolonToken]: Node<ts.Token<SyntaxKind.SemicolonToken>>;
  [SyntaxKind.InferKeyword]: Node<ts.Token<SyntaxKind.InferKeyword>>;
  [SyntaxKind.NeverKeyword]: Node<ts.Token<SyntaxKind.NeverKeyword>>;
  [SyntaxKind.AnyKeyword]: Expression;
  [SyntaxKind.BooleanKeyword]: Expression;
  [SyntaxKind.NumberKeyword]: Expression;
  [SyntaxKind.ObjectKeyword]: Expression;
  [SyntaxKind.StringKeyword]: Expression;
  [SyntaxKind.SymbolKeyword]: Expression;
  [SyntaxKind.UndefinedKeyword]: Expression;
  [SyntaxKind.FalseKeyword]: FalseLiteral;
  [SyntaxKind.ImportKeyword]: ImportExpression;
  [SyntaxKind.NullKeyword]: NullLiteral;
  [SyntaxKind.SuperKeyword]: SuperExpression;
  [SyntaxKind.ThisKeyword]: ThisExpression;
  [SyntaxKind.TrueKeyword]: TrueLiteral;
  [SyntaxKind.VoidExpression]: VoidExpression;
}
export interface KindToNodeMappings extends ImplementedKindToNodeMappings {
  [kind: number]: Node;
}
export interface KindToExpressionMappings {
  [kind: number]: Node;
  [SyntaxKind.ArrayLiteralExpression]: ArrayLiteralExpression;
  [SyntaxKind.ArrowFunction]: ArrowFunction;
  [SyntaxKind.AsExpression]: AsExpression;
  [SyntaxKind.AwaitExpression]: AwaitExpression;
  [SyntaxKind.BigIntLiteral]: BigIntLiteral;
  [SyntaxKind.BinaryExpression]: BinaryExpression;
  [SyntaxKind.CallExpression]: CallExpression;
  [SyntaxKind.ClassExpression]: ClassExpression;
  [SyntaxKind.CommaListExpression]: CommaListExpression;
  [SyntaxKind.ConditionalExpression]: ConditionalExpression;
  [SyntaxKind.DeleteExpression]: DeleteExpression;
  [SyntaxKind.ElementAccessExpression]: ElementAccessExpression;
  [SyntaxKind.FunctionExpression]: FunctionExpression;
  [SyntaxKind.Identifier]: Identifier;
  [SyntaxKind.JsxClosingFragment]: JsxClosingFragment;
  [SyntaxKind.JsxElement]: JsxElement;
  [SyntaxKind.JsxExpression]: JsxExpression;
  [SyntaxKind.JsxFragment]: JsxFragment;
  [SyntaxKind.JsxOpeningElement]: JsxOpeningElement;
  [SyntaxKind.JsxOpeningFragment]: JsxOpeningFragment;
  [SyntaxKind.JsxSelfClosingElement]: JsxSelfClosingElement;
  [SyntaxKind.MetaProperty]: MetaProperty;
  [SyntaxKind.NewExpression]: NewExpression;
  [SyntaxKind.NonNullExpression]: NonNullExpression;
  [SyntaxKind.NoSubstitutionTemplateLiteral]: NoSubstitutionTemplateLiteral;
  [SyntaxKind.NumericLiteral]: NumericLiteral;
  [SyntaxKind.ObjectLiteralExpression]: ObjectLiteralExpression;
  [SyntaxKind.OmittedExpression]: OmittedExpression;
  [SyntaxKind.ParenthesizedExpression]: ParenthesizedExpression;
  [SyntaxKind.PartiallyEmittedExpression]: PartiallyEmittedExpression;
  [SyntaxKind.PostfixUnaryExpression]: PostfixUnaryExpression;
  [SyntaxKind.PrefixUnaryExpression]: PrefixUnaryExpression;
  [SyntaxKind.PropertyAccessExpression]: PropertyAccessExpression;
  [SyntaxKind.RegularExpressionLiteral]: RegularExpressionLiteral;
  [SyntaxKind.SatisfiesExpression]: SatisfiesExpression;
  [SyntaxKind.SpreadElement]: SpreadElement;
  [SyntaxKind.StringLiteral]: StringLiteral;
  [SyntaxKind.TaggedTemplateExpression]: TaggedTemplateExpression;
  [SyntaxKind.TemplateExpression]: TemplateExpression;
  [SyntaxKind.TypeAssertionExpression]: TypeAssertion;
  [SyntaxKind.TypeOfExpression]: TypeOfExpression;
  [SyntaxKind.YieldExpression]: YieldExpression;
  [SyntaxKind.AnyKeyword]: Expression;
  [SyntaxKind.BooleanKeyword]: Expression;
  [SyntaxKind.NumberKeyword]: Expression;
  [SyntaxKind.ObjectKeyword]: Expression;
  [SyntaxKind.StringKeyword]: Expression;
  [SyntaxKind.SymbolKeyword]: Expression;
  [SyntaxKind.UndefinedKeyword]: Expression;
  [SyntaxKind.FalseKeyword]: FalseLiteral;
  [SyntaxKind.ImportKeyword]: ImportExpression;
  [SyntaxKind.NullKeyword]: NullLiteral;
  [SyntaxKind.SuperKeyword]: SuperExpression;
  [SyntaxKind.ThisKeyword]: ThisExpression;
  [SyntaxKind.TrueKeyword]: TrueLiteral;
  [SyntaxKind.VoidExpression]: VoidExpression;
}
declare const BigIntLiteralBase: typeof LiteralExpression;
export declare class BigIntLiteral extends BigIntLiteralBase<ts.BigIntLiteral> {
  getLiteralValue(): unknown;
  setLiteralValue(value: unknown): this;
  getParent(): NodeParentType<ts.BigIntLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.BigIntLiteral>>;
}
declare const TrueLiteralBase: typeof PrimaryExpression;
export declare class TrueLiteral extends TrueLiteralBase<ts.TrueLiteral> {
  getLiteralValue(): boolean;
  setLiteralValue(value: boolean): this | FalseLiteral;
  getParent(): NodeParentType<ts.TrueLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TrueLiteral>>;
}
declare const FalseLiteralBase: typeof PrimaryExpression;
export declare class FalseLiteral extends FalseLiteralBase<ts.FalseLiteral> {
  getLiteralValue(): boolean;
  setLiteralValue(value: boolean): this | TrueLiteral;
  getParent(): NodeParentType<ts.FalseLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.FalseLiteral>>;
}
declare const NullLiteralBase: typeof PrimaryExpression;
export declare class NullLiteral extends NullLiteralBase<ts.NullLiteral> {
  getParent(): NodeParentType<ts.NullLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NullLiteral>>;
}
declare const NumericLiteralBase: typeof LiteralExpression;
export declare class NumericLiteral extends NumericLiteralBase<ts.NumericLiteral> {
  getLiteralValue(): number;
  setLiteralValue(value: number): this;
  getParent(): NodeParentType<ts.NumericLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NumericLiteral>>;
}
export declare enum QuoteKind {
  Single = "'",
  Double = "\""
}
declare const RegularExpressionLiteralBase: typeof LiteralExpression;
export declare class RegularExpressionLiteral extends RegularExpressionLiteralBase<ts.RegularExpressionLiteral> {
  getLiteralValue(): RegExp;
  setLiteralValue(pattern: string, flags?: string): this;
  setLiteralValue(regExp: RegExp): this;
  getParent(): NodeParentType<ts.RegularExpressionLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.RegularExpressionLiteral>>;
}
declare const StringLiteralBase: typeof LiteralExpression;
export declare class StringLiteral extends StringLiteralBase<ts.StringLiteral> {
  getLiteralValue(): string;
  setLiteralValue(value: string): this;
  getQuoteKind(): QuoteKind;
  getParent(): NodeParentType<ts.StringLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.StringLiteral>>;
}
declare const NoSubstitutionTemplateLiteralBase: typeof LiteralExpression;
export declare class NoSubstitutionTemplateLiteral extends NoSubstitutionTemplateLiteralBase<ts.NoSubstitutionTemplateLiteral> {
  getLiteralValue(): string;
  setLiteralValue(value: string): TemplateLiteral;
  getParent(): NodeParentType<ts.NoSubstitutionTemplateLiteral>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NoSubstitutionTemplateLiteral>>;
}
export declare class TaggedTemplateExpression extends MemberExpression<ts.TaggedTemplateExpression> {
  getTag(): LeftHandSideExpression;
  getTemplate(): TemplateLiteral;
  removeTag(): TemplateLiteral;
  getParent(): NodeParentType<ts.TaggedTemplateExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TaggedTemplateExpression>>;
}
declare const TemplateExpressionBase: typeof PrimaryExpression;
export declare class TemplateExpression extends TemplateExpressionBase<ts.TemplateExpression> {
  getHead(): TemplateHead;
  getTemplateSpans(): TemplateSpan[];
  setLiteralValue(value: string): Node<ts.Node>;
  getParent(): NodeParentType<ts.TemplateExpression>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TemplateExpression>>;
}
declare const TemplateHeadBase: Constructor<LiteralLikeNode> & typeof Node;
export declare class TemplateHead extends TemplateHeadBase<ts.TemplateHead> {
  getParent(): NodeParentType<ts.TemplateHead>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TemplateHead>>;
}
declare const TemplateMiddleBase: Constructor<LiteralLikeNode> & typeof Node;
export declare class TemplateMiddle extends TemplateMiddleBase<ts.TemplateMiddle> {
  getParent(): NodeParentType<ts.TemplateMiddle>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TemplateMiddle>>;
}
declare const TemplateSpanBase: Constructor<ExpressionedNode> & typeof Node;
export declare class TemplateSpan extends TemplateSpanBase<ts.TemplateSpan> {
  getLiteral(): TemplateMiddle | TemplateTail;
  getParent(): NodeParentType<ts.TemplateSpan>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TemplateSpan>>;
}
declare const TemplateTailBase: Constructor<LiteralLikeNode> & typeof Node;
export declare class TemplateTail extends TemplateTailBase<ts.TemplateTail> {
  getParent(): NodeParentType<ts.TemplateTail>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TemplateTail>>;
}
declare const ExportAssignmentBase: Constructor<ExpressionedNode> & Constructor<JSDocableNode> & typeof Statement;
export declare class ExportAssignment extends ExportAssignmentBase<ts.ExportAssignment> {
  isExportEquals(): boolean;
  setIsExportEquals(value: boolean): this;
  set(structure: Partial<ExportAssignmentStructure>): this;
  getStructure(): ExportAssignmentStructure;
  getParent(): NodeParentType<ts.ExportAssignment>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ExportAssignment>>;
}
declare const ExportDeclarationBase: typeof Statement;
export declare class ExportDeclaration extends ExportDeclarationBase<ts.ExportDeclaration> {
  isTypeOnly(): boolean;
  setIsTypeOnly(value: boolean): this;
  getNamespaceExport(): NamespaceExport | undefined;
  getNamespaceExportOrThrow(message?: string | (() => string)): NamespaceExport;
  setNamespaceExport(name: string): this;
  setModuleSpecifier(text: string): this;
  setModuleSpecifier(sourceFile: SourceFile): this;
  getModuleSpecifier(): StringLiteral | undefined;
  getModuleSpecifierValue(): string | undefined;
  getModuleSpecifierSourceFileOrThrow(message?: string | (() => string)): SourceFile;
  getModuleSpecifierSourceFile(): SourceFile | undefined;
  isModuleSpecifierRelative(): boolean;
  removeModuleSpecifier(): this;
  hasModuleSpecifier(): boolean;
  isNamespaceExport(): boolean;
  hasNamedExports(): boolean;
  addNamedExport(namedExport: OptionalKind<ExportSpecifierStructure> | string | WriterFunction): ExportSpecifier;
  addNamedExports(namedExports: ReadonlyArray<OptionalKind<ExportSpecifierStructure> | string | WriterFunction> | WriterFunction): ExportSpecifier[];
  insertNamedExport(index: number, namedExport: OptionalKind<ExportSpecifierStructure> | string | WriterFunction): ExportSpecifier;
  insertNamedExports(index: number, namedExports: ReadonlyArray<OptionalKind<ExportSpecifierStructure> | string | WriterFunction> | WriterFunction): ExportSpecifier[];
  getNamedExports(): ExportSpecifier[];
  toNamespaceExport(): this;
  setAttributes(elements: ReadonlyArray<OptionalKind<ImportAttributeStructure>> | undefined): this;
  getAttributes(): ImportAttributes | undefined;
  set(structure: Partial<ExportDeclarationStructure>): this;
  getStructure(): ExportDeclarationStructure;
  getParent(): NodeParentType<ts.ExportDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ExportDeclaration>>;
}
declare const ExportSpecifierBase: typeof Node;
export declare class ExportSpecifier extends ExportSpecifierBase<ts.ExportSpecifier> {
  setName(name: string): this;
  getName(): string;
  getNameNode(): StringLiteral | Identifier;
  renameAlias(alias: string): this;
  setAlias(alias: string): this;
  removeAlias(): this;
  removeAliasWithRename(): this;
  getAliasNode(): StringLiteral | Identifier | undefined;
  isTypeOnly(): boolean;
  setIsTypeOnly(value: boolean): this;
  getExportDeclaration(): ExportDeclaration;
  getLocalTargetSymbolOrThrow(message?: string | (() => string)): Symbol;
  getLocalTargetSymbol(): Symbol | undefined;
  getLocalTargetDeclarations(): LocalTargetDeclarations[];
  remove(): void;
  set(structure: Partial<ExportSpecifierStructure>): this;
  getStructure(): ExportSpecifierStructure;
  getParent(): NodeParentType<ts.ExportSpecifier>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ExportSpecifier>>;
}
declare const ExternalModuleReferenceBase: Constructor<ExpressionableNode> & typeof Node;
export declare class ExternalModuleReference extends ExternalModuleReferenceBase<ts.ExternalModuleReference> {
  getReferencedSourceFileOrThrow(message?: string | (() => string)): SourceFile;
  isRelative(): boolean;
  getReferencedSourceFile(): SourceFile | undefined;
  getParent(): NodeParentType<ts.ExternalModuleReference>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ExternalModuleReference>>;
}
declare const ImportAttributeBase: Constructor<ImportAttributeNamedNode> & typeof Node;
export declare class ImportAttribute extends ImportAttributeBase<ts.ImportAttribute> {
  getValue(): Expression;
  set(structure: Partial<ImportAttributeStructure>): this;
  getStructure(): ImportAttributeStructure;
  getParent(): NodeParentType<ts.ImportAttribute>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportAttribute>>;
}
declare const ImportAttributesBase: typeof Node;
export declare class ImportAttributes extends ImportAttributesBase<ts.ImportAttributes> {
  setElements(elements: ReadonlyArray<OptionalKind<ImportAttributeStructure>>): this;
  getElements(): ImportAttribute[];
  remove(): void;
  getParent(): NodeParentType<ts.ImportAttributes>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportAttributes>>;
}
declare const ImportClauseBase: typeof Node;
export declare class ImportClause extends ImportClauseBase<ts.ImportClause> {
  isTypeOnly(): boolean;
  setIsTypeOnly(value: boolean): this;
  getDefaultImportOrThrow(message?: string | (() => string)): Identifier;
  getDefaultImport(): Identifier | undefined;
  getNamedBindingsOrThrow(message?: string | (() => string)): NamespaceImport | NamedImports;
  getNamedBindings(): NamespaceImport | NamedImports | undefined;
  getNamespaceImportOrThrow(message?: string | (() => string)): Identifier;
  getNamespaceImport(): Identifier | undefined;
  getNamedImports(): ImportSpecifier[];
  getParent(): NodeParentType<ts.ImportClause>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportClause>>;
}
declare const ImportDeclarationBase: typeof Statement;
export declare class ImportDeclaration extends ImportDeclarationBase<ts.ImportDeclaration> {
  isTypeOnly(): boolean;
  setIsTypeOnly(value: boolean): this;
  setModuleSpecifier(text: string): this;
  setModuleSpecifier(sourceFile: SourceFile): this;
  getModuleSpecifier(): StringLiteral;
  getModuleSpecifierValue(): string;
  getModuleSpecifierSourceFileOrThrow(message?: string | (() => string)): SourceFile;
  getModuleSpecifierSourceFile(): SourceFile | undefined;
  isModuleSpecifierRelative(): boolean;
  setDefaultImport(text: string): this;
  renameDefaultImport(text: string): this;
  getDefaultImportOrThrow(message?: string | (() => string)): Identifier;
  getDefaultImport(): Identifier | undefined;
  setNamespaceImport(text: string): this;
  removeNamespaceImport(): this;
  removeDefaultImport(): this;
  getNamespaceImportOrThrow(message?: string | (() => string)): Identifier;
  getNamespaceImport(): Identifier | undefined;
  addNamedImport(namedImport: OptionalKind<ImportSpecifierStructure> | string | WriterFunction): ImportSpecifier;
  addNamedImports(namedImports: ReadonlyArray<OptionalKind<ImportSpecifierStructure> | string | WriterFunction> | WriterFunction): ImportSpecifier[];
  insertNamedImport(index: number, namedImport: OptionalKind<ImportSpecifierStructure> | string | WriterFunction): ImportSpecifier;
  insertNamedImports(index: number, namedImports: ReadonlyArray<OptionalKind<ImportSpecifierStructure> | string | WriterFunction> | WriterFunction): ImportSpecifier[];
  getNamedImports(): ImportSpecifier[];
  removeNamedImports(): this;
  getImportClauseOrThrow(message?: string | (() => string)): ImportClause;
  getImportClause(): ImportClause | undefined;
  setAttributes(elements: ReadonlyArray<OptionalKind<ImportAttributeStructure>> | undefined): this;
  getAttributes(): ImportAttributes | undefined;
  set(structure: Partial<ImportDeclarationStructure>): this;
  getStructure(): ImportDeclarationStructure;
  getParent(): NodeParentType<ts.ImportDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportDeclaration>>;
}
declare const ImportEqualsDeclarationBase: Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<JSDocableNode> & Constructor<NamedNode> & typeof Statement;
export declare class ImportEqualsDeclaration extends ImportEqualsDeclarationBase<ts.ImportEqualsDeclaration> {
  isTypeOnly(): boolean;
  setIsTypeOnly(value: boolean): this;
  getModuleReference(): ModuleReference;
  isExternalModuleReferenceRelative(): boolean;
  setExternalModuleReference(externalModuleReference: string): this;
  setExternalModuleReference(sourceFile: SourceFile): this;
  getExternalModuleReferenceSourceFileOrThrow(message?: string | (() => string)): SourceFile;
  getExternalModuleReferenceSourceFile(): SourceFile | undefined;
  getParent(): NodeParentType<ts.ImportEqualsDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportEqualsDeclaration>>;
}
declare const ImportSpecifierBase: typeof Node;
export declare class ImportSpecifier extends ImportSpecifierBase<ts.ImportSpecifier> {
  setName(name: string): this;
  getName(): string;
  getNameNode(): StringLiteral | Identifier;
  renameAlias(alias: string): this;
  setAlias(alias: string): this;
  removeAlias(): this;
  removeAliasWithRename(): this;
  getAliasNode(): Identifier | undefined;
  isTypeOnly(): boolean;
  setIsTypeOnly(value: boolean): this;
  getImportDeclaration(): ImportDeclaration;
  remove(): void;
  set(structure: Partial<ImportSpecifierStructure>): this;
  getStructure(): ImportSpecifierStructure;
  getParent(): NodeParentType<ts.ImportSpecifier>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportSpecifier>>;
}
declare const ModuleBlockBase: Constructor<StatementedNode> & typeof Statement;
export declare class ModuleBlock extends ModuleBlockBase<ts.ModuleBlock> {
  getParent(): NodeParentType<ts.ModuleBlock>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ModuleBlock>>;
}
export declare function ModuleChildableNode<T extends Constructor<ModuleChildableNodeExtensionType>>(Base: T): Constructor<ModuleChildableNode> & T;
export interface ModuleChildableNode {
  getParentModule(): ModuleDeclaration | undefined;
  getParentModuleOrThrow(message?: string | (() => string)): ModuleDeclaration;
}
type ModuleChildableNodeExtensionType = Node;
declare const ModuleDeclarationBase: Constructor<ModuledNode> & Constructor<UnwrappableNode> & Constructor<TextInsertableNode> & Constructor<BodyableNode> & Constructor<ModuleChildableNode> & Constructor<StatementedNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<ModuleNamedNode> & typeof Statement;
export declare class ModuleDeclaration extends ModuleDeclarationBase<ts.ModuleDeclaration> {
  getName(): string;
  setName(newName: string): this;
  rename(newName: string, options?: RenameOptions): this;
  getNameNodes(): Identifier[] | StringLiteral;
  hasNamespaceKeyword(): boolean;
  hasModuleKeyword(): boolean;
  setDeclarationKind(kind: ModuleDeclarationKind): this;
  getDeclarationKind(): ModuleDeclarationKind;
  getDeclarationKindKeyword(): Node<ts.Node> | undefined;
  set(structure: Partial<ModuleDeclarationStructure>): this;
  getStructure(): ModuleDeclarationStructure;
  getParent(): NodeParentType<ts.ModuleDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ModuleDeclaration>>;
}
export declare enum ModuleDeclarationKind {
  Namespace = "namespace",
  Module = "module",
  Global = "global"
}
declare const NamedExportsBase: typeof Node;
export declare class NamedExports extends NamedExportsBase<ts.NamedExports> {
  getElements(): ExportSpecifier[];
  getParent(): NodeParentType<ts.NamedExports>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NamedExports>>;
}
declare const NamedImportsBase: typeof Node;
export declare class NamedImports extends NamedImportsBase<ts.NamedImports> {
  getElements(): ImportSpecifier[];
  getParent(): NodeParentType<ts.NamedImports>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NamedImports>>;
}
declare const NamespaceExportBase: Constructor<RenameableNode> & typeof Node;
export declare class NamespaceExport extends NamespaceExportBase<ts.NamespaceExport> {
  setName(name: string): this;
  getName(): string;
  getNameNode(): StringLiteral | Identifier;
  getParent(): NodeParentType<ts.NamespaceExport>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NamespaceExport>>;
}
declare const NamespaceImportBase: Constructor<RenameableNode> & typeof Node;
export declare class NamespaceImport extends NamespaceImportBase<ts.NamespaceImport> {
  setName(name: string): this;
  getName(): string;
  getNameNode(): Identifier;
  getParent(): NodeParentType<ts.NamespaceImport>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NamespaceImport>>;
}
export declare class FileReference extends TextRange<ts.FileReference> {
  constructor(compilerObject: ts.FileReference, sourceFile: SourceFile);
  getFileName(): string;
}
export declare enum FileSystemRefreshResult {
  NoChange = 0,
  Updated = 1,
  Deleted = 2
}
export interface SourceFileCopyOptions {
  overwrite?: boolean;
}
export interface SourceFileMoveOptions {
  overwrite?: boolean;
}
export interface SourceFileEmitOptions extends EmitOptionsBase {
}
declare const SourceFileBase: Constructor<ModuledNode> & Constructor<StatementedNode> & Constructor<TextInsertableNode> & typeof Node;
export declare class SourceFile extends SourceFileBase<ts.SourceFile> {
  #private;
  private constructor();
  getFilePath(): StandardizedFilePath;
  getBaseName(): string;
  getBaseNameWithoutExtension(): string;
  getExtension(): string;
  getDirectory(): Directory;
  getDirectoryPath(): StandardizedFilePath;
  getFullText(): string;
  getLineAndColumnAtPos(pos: number): {
        line: number;
        column: number;
    };
  getLengthFromLineStartAtPos(pos: number): number;
  copyToDirectory(dirPathOrDirectory: string | Directory, options?: SourceFileCopyOptions): SourceFile;
  copy(filePath: string, options?: SourceFileCopyOptions): SourceFile;
  copyImmediately(filePath: string, options?: SourceFileCopyOptions): Promise<SourceFile>;
  copyImmediatelySync(filePath: string, options?: SourceFileCopyOptions): SourceFile;
  moveToDirectory(dirPathOrDirectory: string | Directory, options?: SourceFileMoveOptions): SourceFile;
  move(filePath: string, options?: SourceFileMoveOptions): SourceFile;
  moveImmediately(filePath: string, options?: SourceFileMoveOptions): Promise<SourceFile>;
  moveImmediatelySync(filePath: string, options?: SourceFileMoveOptions): SourceFile;
  delete(): void;
  deleteImmediately(): Promise<void>;
  deleteImmediatelySync(): void;
  save(): Promise<void>;
  saveSync(): void;
  getPathReferenceDirectives(): FileReference[];
  getTypeReferenceDirectives(): FileReference[];
  getLibReferenceDirectives(): FileReference[];
  getReferencingSourceFiles(): SourceFile[];
  getReferencingNodesInOtherSourceFiles(): SourceFileReferencingNodes[];
  getReferencingLiteralsInOtherSourceFiles(): StringLiteral[];
  getReferencedSourceFiles(): SourceFile[];
  getNodesReferencingOtherSourceFiles(): SourceFileReferencingNodes[];
  getLiteralsReferencingOtherSourceFiles(): StringLiteral[];
  getImportStringLiterals(): StringLiteral[];
  getLanguageVersion(): ScriptTarget;
  getLanguageVariant(): LanguageVariant;
  getScriptKind(): ScriptKind;
  isDeclarationFile(): boolean;
  isFromExternalLibrary(): boolean;
  isInNodeModules(): boolean;
  isSaved(): boolean;
  getPreEmitDiagnostics(): Diagnostic[];
  unindent(pos: number, times?: number): this;
  unindent(positionRange: [number, number], times?: number): this;
  indent(pos: number, times?: number): this;
  indent(positionRange: [number, number], times?: number): this;
  emit(options?: SourceFileEmitOptions): Promise<EmitResult>;
  emitSync(options?: SourceFileEmitOptions): EmitResult;
  getEmitOutput(options?: {
        emitOnlyDtsFiles?: boolean;
    }): EmitOutput;
  formatText(settings?: FormatCodeSettings): void;
  refreshFromFileSystem(): Promise<FileSystemRefreshResult>;
  refreshFromFileSystemSync(): FileSystemRefreshResult;
  getRelativePathTo(fileOrDirPath: string): string;
  getRelativePathTo(sourceFile: SourceFile): string;
  getRelativePathTo(directory: Directory): string;
  getRelativePathAsModuleSpecifierTo(filePath: string): string;
  getRelativePathAsModuleSpecifierTo(sourceFile: SourceFile): string;
  getRelativePathAsModuleSpecifierTo(directory: Directory): string;
  onModified(subscription: (sender: SourceFile) => void, subscribe?: boolean): this;
  organizeImports(formatSettings?: FormatCodeSettings, userPreferences?: UserPreferences): this;
  fixUnusedIdentifiers(formatSettings?: FormatCodeSettings, userPreferences?: UserPreferences): this;
  fixMissingImports(formatSettings?: FormatCodeSettings, userPreferences?: UserPreferences): this;
  applyTextChanges(textChanges: ReadonlyArray<ts.TextChange | TextChange>): this;
  set(structure: Partial<SourceFileStructure>): this;
  getStructure(): SourceFileStructure;
  getParent(): NodeParentType<ts.SourceFile>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SourceFile>>;
}
declare function CommonIdentifierBase<T extends Constructor<CommonIdentifierBaseExtensionType>>(Base: T): Constructor<CommonIdentifierBase> & T;
interface CommonIdentifierBase {
  getText(): string;
  getDefinitionNodes(): Node[];
  getDefinitions(): DefinitionInfo[];
}
type CommonIdentifierBaseExtensionType = Node<ts.Node & {
      text: string;
  }>;
declare const ComputedPropertyNameBase: Constructor<ExpressionedNode> & typeof Node;
export declare class ComputedPropertyName extends ComputedPropertyNameBase<ts.ComputedPropertyName> {
  getParent(): NodeParentType<ts.ComputedPropertyName>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ComputedPropertyName>>;
}
declare const IdentifierBase: Constructor<CommonIdentifierBase> & Constructor<ReferenceFindableNode> & Constructor<RenameableNode> & typeof PrimaryExpression;
export declare class Identifier extends IdentifierBase<ts.Identifier> {
  getImplementations(): ImplementationLocation[];
  getParent(): NodeParentType<ts.Identifier>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.Identifier>>;
}
declare const PrivateIdentifierBase: Constructor<CommonIdentifierBase> & Constructor<ReferenceFindableNode> & Constructor<RenameableNode> & typeof Node;
export declare class PrivateIdentifier extends PrivateIdentifierBase<ts.PrivateIdentifier> {
  getParent(): NodeParentType<ts.PrivateIdentifier>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.PrivateIdentifier>>;
}
export declare class QualifiedName extends Node<ts.QualifiedName> {
  getLeft(): EntityName;
  getRight(): Identifier;
  getParent(): NodeParentType<ts.QualifiedName>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.QualifiedName>>;
}
declare const BlockBase: Constructor<TextInsertableNode> & Constructor<StatementedNode> & typeof Statement;
export declare class Block extends BlockBase<ts.Block> {
  getParent(): NodeParentType<ts.Block>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.Block>>;
}
export declare class BreakStatement extends Statement<ts.BreakStatement> {
  getLabel(): Identifier | undefined;
  getLabelOrThrow(message?: string | (() => string)): Identifier;
  getParent(): NodeParentType<ts.BreakStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.BreakStatement>>;
}
declare const CaseBlockBase: Constructor<TextInsertableNode> & typeof Node;
export declare class CaseBlock extends CaseBlockBase<ts.CaseBlock> {
  getClauses(): CaseOrDefaultClause[];
  removeClause(index: number): this;
  removeClauses(indexRange: [number, number]): this;
  getParent(): NodeParentType<ts.CaseBlock>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.CaseBlock>>;
}
declare const CaseClauseBase: Constructor<JSDocableNode> & Constructor<ExpressionedNode> & Constructor<TextInsertableNode> & Constructor<StatementedNode> & typeof Node;
export declare class CaseClause extends CaseClauseBase<ts.CaseClause> {
  remove(): void;
  getParent(): NodeParentType<ts.CaseClause>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.CaseClause>>;
}
declare const CatchClauseBase: typeof Node;
export declare class CatchClause extends CatchClauseBase<ts.CatchClause> {
  getBlock(): Block;
  getVariableDeclaration(): VariableDeclaration | undefined;
  getVariableDeclarationOrThrow(message?: string | (() => string)): VariableDeclaration;
  getParent(): NodeParentType<ts.CatchClause>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.CatchClause>>;
}
export declare class CommentStatement extends Statement<CompilerCommentStatement> {
}
export declare class ContinueStatement extends Statement<ts.ContinueStatement> {
  getLabel(): Identifier | undefined;
  getLabelOrThrow(message?: string | (() => string)): Identifier;
  getParent(): NodeParentType<ts.ContinueStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ContinueStatement>>;
}
declare const DebuggerStatementBase: typeof Statement;
export declare class DebuggerStatement extends DebuggerStatementBase<ts.DebuggerStatement> {
  getParent(): NodeParentType<ts.DebuggerStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.DebuggerStatement>>;
}
declare const DefaultClauseBase: Constructor<TextInsertableNode> & Constructor<StatementedNode> & typeof Node;
export declare class DefaultClause extends DefaultClauseBase<ts.DefaultClause> {
  remove(): void;
  getParent(): NodeParentType<ts.DefaultClause>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.DefaultClause>>;
}
declare const DoStatementBase: Constructor<ExpressionedNode> & typeof IterationStatement;
export declare class DoStatement extends DoStatementBase<ts.DoStatement> {
  getParent(): NodeParentType<ts.DoStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.DoStatement>>;
}
declare const EmptyStatementBase: typeof Statement;
export declare class EmptyStatement extends EmptyStatementBase<ts.EmptyStatement> {
  getParent(): NodeParentType<ts.EmptyStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.EmptyStatement>>;
}
declare const ExpressionStatementBase: Constructor<ExpressionedNode> & Constructor<JSDocableNode> & typeof Statement;
export declare class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
  getParent(): NodeParentType<ts.ExpressionStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ExpressionStatement>>;
}
declare const ForInStatementBase: Constructor<ExpressionedNode> & typeof IterationStatement;
export declare class ForInStatement extends ForInStatementBase<ts.ForInStatement> {
  getInitializer(): VariableDeclarationList | Expression;
  getParent(): NodeParentType<ts.ForInStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ForInStatement>>;
}
declare const ForOfStatementBase: Constructor<ExpressionedNode> & Constructor<AwaitableNode> & typeof IterationStatement;
export declare class ForOfStatement extends ForOfStatementBase<ts.ForOfStatement> {
  getInitializer(): VariableDeclarationList | Expression;
  getParent(): NodeParentType<ts.ForOfStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ForOfStatement>>;
}
declare const ForStatementBase: typeof IterationStatement;
export declare class ForStatement extends ForStatementBase<ts.ForStatement> {
  getInitializer(): VariableDeclarationList | Expression | undefined;
  getInitializerOrThrow(message?: string | (() => string)): Expression<ts.Expression> | VariableDeclarationList;
  getCondition(): Expression | undefined;
  getConditionOrThrow(message?: string | (() => string)): Expression<ts.Expression>;
  getIncrementor(): Expression | undefined;
  getIncrementorOrThrow(message?: string | (() => string)): Expression<ts.Expression>;
  getParent(): NodeParentType<ts.ForStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ForStatement>>;
}
declare const IfStatementBase: Constructor<ExpressionedNode> & typeof Statement;
export declare class IfStatement extends IfStatementBase<ts.IfStatement> {
  getThenStatement(): Statement;
  getElseStatement(): Statement | undefined;
  remove(): void;
  getParent(): NodeParentType<ts.IfStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.IfStatement>>;
}
export declare class IterationStatement<T extends ts.IterationStatement = ts.IterationStatement> extends Statement<T> {
  getStatement(): Statement;
}
declare const LabeledStatementBase: Constructor<JSDocableNode> & typeof Statement;
export declare class LabeledStatement extends LabeledStatementBase<ts.LabeledStatement> {
  getLabel(): Identifier;
  getStatement(): Statement;
  getParent(): NodeParentType<ts.LabeledStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.LabeledStatement>>;
}
declare const NotEmittedStatementBase: typeof Statement;
export declare class NotEmittedStatement extends NotEmittedStatementBase<ts.NotEmittedStatement> {
  getParent(): NodeParentType<ts.NotEmittedStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NotEmittedStatement>>;
}
declare const ReturnStatementBase: Constructor<ExpressionableNode> & typeof Statement;
export declare class ReturnStatement extends ReturnStatementBase<ts.ReturnStatement> {
  getParent(): NodeParentType<ts.ReturnStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ReturnStatement>>;
}
declare const StatementBase: Constructor<ChildOrderableNode> & typeof Node;
export declare class Statement<T extends ts.Statement = ts.Statement> extends StatementBase<T> {
  remove(): void;
}
export declare function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T;
export interface StatementedNode {
  getStatements(): Statement[];
  getStatementsWithComments(): Statement[];
  getStatement<T extends Statement>(findFunction: (statement: Statement) => statement is T): T | undefined;
  getStatement(findFunction: (statement: Statement) => boolean): Statement | undefined;
  getStatementOrThrow<T extends Statement>(findFunction: (statement: Statement) => statement is T): T;
  getStatementOrThrow(findFunction: (statement: Statement) => boolean): Statement;
  getStatementByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappingsWithCommentStatements[TKind] | undefined;
  getStatementByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappingsWithCommentStatements[TKind];
  addStatements(statements: string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures>): Statement[];
  insertStatements(index: number, statements: string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures>): Statement[];
  removeStatement(index: number): this;
  removeStatements(indexRange: [number, number]): this;
  addClass(structure: OptionalKind<ClassDeclarationStructure>): ClassDeclaration;
  addClasses(structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>>): ClassDeclaration[];
  insertClass(index: number, structure: OptionalKind<ClassDeclarationStructure>): ClassDeclaration;
  insertClasses(index: number, structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>>): ClassDeclaration[];
  getClasses(): ClassDeclaration[];
  getClass(name: string): ClassDeclaration | undefined;
  getClass(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration | undefined;
  getClassOrThrow(name: string): ClassDeclaration;
  getClassOrThrow(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration;
  addEnum(structure: OptionalKind<EnumDeclarationStructure>): EnumDeclaration;
  addEnums(structures: ReadonlyArray<OptionalKind<EnumDeclarationStructure>>): EnumDeclaration[];
  insertEnum(index: number, structure: OptionalKind<EnumDeclarationStructure>): EnumDeclaration;
  insertEnums(index: number, structures: ReadonlyArray<OptionalKind<EnumDeclarationStructure>>): EnumDeclaration[];
  getEnums(): EnumDeclaration[];
  getEnum(name: string): EnumDeclaration | undefined;
  getEnum(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration | undefined;
  getEnumOrThrow(name: string): EnumDeclaration;
  getEnumOrThrow(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration;
  addFunction(structure: OptionalKind<FunctionDeclarationStructure>): FunctionDeclaration;
  addFunctions(structures: ReadonlyArray<OptionalKind<FunctionDeclarationStructure>>): FunctionDeclaration[];
  insertFunction(index: number, structure: OptionalKind<FunctionDeclarationStructure>): FunctionDeclaration;
  insertFunctions(index: number, structures: ReadonlyArray<OptionalKind<FunctionDeclarationStructure>>): FunctionDeclaration[];
  getFunctions(): FunctionDeclaration[];
  getFunction(name: string): FunctionDeclaration | undefined;
  getFunction(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration | undefined;
  getFunctionOrThrow(name: string): FunctionDeclaration;
  getFunctionOrThrow(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration;
  addInterface(structure: OptionalKind<InterfaceDeclarationStructure>): InterfaceDeclaration;
  addInterfaces(structures: ReadonlyArray<OptionalKind<InterfaceDeclarationStructure>>): InterfaceDeclaration[];
  insertInterface(index: number, structure: OptionalKind<InterfaceDeclarationStructure>): InterfaceDeclaration;
  insertInterfaces(index: number, structures: ReadonlyArray<OptionalKind<InterfaceDeclarationStructure>>): InterfaceDeclaration[];
  getInterfaces(): InterfaceDeclaration[];
  getInterface(name: string): InterfaceDeclaration | undefined;
  getInterface(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration | undefined;
  getInterfaceOrThrow(name: string): InterfaceDeclaration;
  getInterfaceOrThrow(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration;
  addModule(structure: OptionalKind<ModuleDeclarationStructure>): ModuleDeclaration;
  addModules(structures: ReadonlyArray<OptionalKind<ModuleDeclarationStructure>>): ModuleDeclaration[];
  insertModule(index: number, structure: OptionalKind<ModuleDeclarationStructure>): ModuleDeclaration;
  insertModules(index: number, structures: ReadonlyArray<OptionalKind<ModuleDeclarationStructure>>): ModuleDeclaration[];
  getModules(): ModuleDeclaration[];
  getModule(name: string): ModuleDeclaration | undefined;
  getModule(findFunction: (declaration: ModuleDeclaration) => boolean): ModuleDeclaration | undefined;
  getModuleOrThrow(name: string): ModuleDeclaration;
  getModuleOrThrow(findFunction: (declaration: ModuleDeclaration) => boolean): ModuleDeclaration;
  addTypeAlias(structure: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclaration;
  addTypeAliases(structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>>): TypeAliasDeclaration[];
  insertTypeAlias(index: number, structure: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclaration;
  insertTypeAliases(index: number, structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>>): TypeAliasDeclaration[];
  getTypeAliases(): TypeAliasDeclaration[];
  getTypeAlias(name: string): TypeAliasDeclaration | undefined;
  getTypeAlias(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration | undefined;
  getTypeAliasOrThrow(name: string): TypeAliasDeclaration;
  getTypeAliasOrThrow(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration;
  addVariableStatement(structure: OptionalKind<VariableStatementStructure>): VariableStatement;
  addVariableStatements(structures: ReadonlyArray<OptionalKind<VariableStatementStructure>>): VariableStatement[];
  insertVariableStatement(index: number, structure: OptionalKind<VariableStatementStructure>): VariableStatement;
  insertVariableStatements(index: number, structures: ReadonlyArray<OptionalKind<VariableStatementStructure>>): VariableStatement[];
  getVariableStatements(): VariableStatement[];
  getVariableStatement(name: string): VariableStatement | undefined;
  getVariableStatement(findFunction: (declaration: VariableStatement) => boolean): VariableStatement | undefined;
  getVariableStatementOrThrow(name: string): VariableStatement;
  getVariableStatementOrThrow(findFunction: (declaration: VariableStatement) => boolean): VariableStatement;
  getVariableDeclarations(): VariableDeclaration[];
  getVariableDeclaration(name: string): VariableDeclaration | undefined;
  getVariableDeclaration(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration | undefined;
  getVariableDeclarationOrThrow(name: string): VariableDeclaration;
  getVariableDeclarationOrThrow(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration;
}
type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration | ts.CaseClause | ts.DefaultClause | ts.ModuleBlock>;
export interface KindToNodeMappingsWithCommentStatements extends ImplementedKindToNodeMappings {
  [kind: number]: Node;
  [SyntaxKind.SingleLineCommentTrivia]: CommentStatement;
  [SyntaxKind.MultiLineCommentTrivia]: CommentStatement;
}
declare const SwitchStatementBase: Constructor<ExpressionedNode> & typeof Statement;
export declare class SwitchStatement extends SwitchStatementBase<ts.SwitchStatement> {
  getCaseBlock(): CaseBlock;
  getClauses(): CaseOrDefaultClause[];
  removeClause(index: number): CaseBlock;
  removeClauses(indexRange: [number, number]): CaseBlock;
  getParent(): NodeParentType<ts.SwitchStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.SwitchStatement>>;
}
declare const ThrowStatementBase: Constructor<ExpressionedNode> & typeof Statement;
export declare class ThrowStatement extends ThrowStatementBase<ts.ThrowStatement> {
  getParent(): NodeParentType<ts.ThrowStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ThrowStatement>>;
}
declare const TryStatementBase: typeof Statement;
export declare class TryStatement extends TryStatementBase<ts.TryStatement> {
  getTryBlock(): Block;
  getCatchClause(): CatchClause | undefined;
  getCatchClauseOrThrow(message?: string | (() => string)): CatchClause;
  getFinallyBlock(): Block | undefined;
  getFinallyBlockOrThrow(message?: string | (() => string)): Block;
  getParent(): NodeParentType<ts.TryStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TryStatement>>;
}
declare const VariableStatementBase: Constructor<ModuleChildableNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & typeof Statement;
export declare class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
  getDeclarationList(): VariableDeclarationList;
  getDeclarations(): VariableDeclaration[];
  getDeclarationKind(): VariableDeclarationKind;
  getDeclarationKindKeywords(): Node<ts.Node>[];
  setDeclarationKind(type: VariableDeclarationKind): VariableDeclarationList;
  addDeclaration(structure: OptionalKind<VariableDeclarationStructure>): VariableDeclaration;
  addDeclarations(structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>): VariableDeclaration[];
  insertDeclaration(index: number, structure: OptionalKind<VariableDeclarationStructure>): VariableDeclaration;
  insertDeclarations(index: number, structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>): VariableDeclaration[];
  set(structure: Partial<VariableStatementStructure>): this;
  getStructure(): VariableStatementStructure;
  getParent(): NodeParentType<ts.VariableStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.VariableStatement>>;
}
declare const WhileStatementBase: Constructor<ExpressionedNode> & typeof IterationStatement;
export declare class WhileStatement extends WhileStatementBase<ts.WhileStatement> {
  getParent(): NodeParentType<ts.WhileStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.WhileStatement>>;
}
declare const WithStatementBase: Constructor<ExpressionedNode> & typeof Statement;
export declare class WithStatement extends WithStatementBase<ts.WithStatement> {
  getStatement(): Statement;
  getParent(): NodeParentType<ts.WithStatement>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.WithStatement>>;
}
export declare class ArrayTypeNode extends TypeNode<ts.ArrayTypeNode> {
  getElementTypeNode(): TypeNode;
  getParent(): NodeParentType<ts.ArrayTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ArrayTypeNode>>;
}
export declare class ConditionalTypeNode extends TypeNode<ts.ConditionalTypeNode> {
  getCheckType(): TypeNode<ts.TypeNode>;
  getExtendsType(): TypeNode<ts.TypeNode>;
  getTrueType(): TypeNode<ts.TypeNode>;
  getFalseType(): TypeNode<ts.TypeNode>;
  getParent(): NodeParentType<ts.ConditionalTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ConditionalTypeNode>>;
}
declare const ConstructorTypeNodeBase: Constructor<AbstractableNode> & Constructor<ModifierableNode> & typeof FunctionOrConstructorTypeNodeBase;
export declare class ConstructorTypeNode extends ConstructorTypeNodeBase<ts.ConstructorTypeNode> {
  getParent(): NodeParentType<ts.ConstructorTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ConstructorTypeNode>>;
}
declare const ExpressionWithTypeArgumentsBase: Constructor<LeftHandSideExpressionedNode> & typeof NodeWithTypeArguments;
export declare class ExpressionWithTypeArguments extends ExpressionWithTypeArgumentsBase<ts.ExpressionWithTypeArguments> {
  getParent(): NodeParentType<ts.ExpressionWithTypeArguments>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ExpressionWithTypeArguments>>;
}
declare const FunctionOrConstructorTypeNodeBaseBase: Constructor<SignaturedDeclaration> & typeof TypeNode;
export declare class FunctionOrConstructorTypeNodeBase<T extends ts.FunctionOrConstructorTypeNode = ts.FunctionOrConstructorTypeNode> extends FunctionOrConstructorTypeNodeBaseBase<T> {
}
declare const FunctionTypeNodeBase: Constructor<TypeParameteredNode> & typeof FunctionOrConstructorTypeNodeBase;
export declare class FunctionTypeNode extends FunctionTypeNodeBase<ts.FunctionTypeNode> {
  getParent(): NodeParentType<ts.FunctionTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.FunctionTypeNode>>;
}
export declare class ImportTypeNode extends NodeWithTypeArguments<ts.ImportTypeNode> {
  setArgument(text: string): this;
  getArgument(): TypeNode;
  setQualifier(text: string): this;
  getQualifierOrThrow(message?: string | (() => string)): EntityName;
  getQualifier(): EntityName | undefined;
  getAttributes(): ImportAttributes | undefined;
  getAttributesOrThrow(message?: string | (() => string)): ImportAttributes;
  getParent(): NodeParentType<ts.ImportTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ImportTypeNode>>;
}
export declare class IndexedAccessTypeNode extends TypeNode<ts.IndexedAccessTypeNode> {
  getObjectTypeNode(): TypeNode;
  getIndexTypeNode(): TypeNode;
  getParent(): NodeParentType<ts.IndexedAccessTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.IndexedAccessTypeNode>>;
}
export declare class InferTypeNode extends TypeNode<ts.InferTypeNode> {
  getTypeParameter(): TypeParameterDeclaration;
  getParent(): NodeParentType<ts.InferTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.InferTypeNode>>;
}
export declare class IntersectionTypeNode extends TypeNode<ts.IntersectionTypeNode> {
  getTypeNodes(): TypeNode[];
  getParent(): NodeParentType<ts.IntersectionTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.IntersectionTypeNode>>;
}
export declare class LiteralTypeNode extends TypeNode<ts.LiteralTypeNode> {
  getLiteral(): NullLiteral | BooleanLiteral | LiteralExpression | PrefixUnaryExpression;
  getParent(): NodeParentType<ts.LiteralTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.LiteralTypeNode>>;
}
export declare class MappedTypeNode extends TypeNode<ts.MappedTypeNode> {
  getNameTypeNode(): TypeNode | undefined;
  getNameTypeNodeOrThrow(message?: string | (() => string)): TypeNode;
  getReadonlyToken(): Node<ts.ReadonlyKeyword> | Node<ts.PlusToken> | Node<ts.MinusToken> | undefined;
  getReadonlyTokenOrThrow(message?: string | (() => string)): Node<ts.ReadonlyKeyword> | Node<ts.PlusToken> | Node<ts.MinusToken>;
  getQuestionToken(): Node<ts.QuestionToken> | Node<ts.PlusToken> | Node<ts.MinusToken> | undefined;
  getQuestionTokenOrThrow(message?: string | (() => string)): Node<ts.QuestionToken> | Node<ts.PlusToken> | Node<ts.MinusToken>;
  getTypeParameter(): TypeParameterDeclaration;
  getTypeNode(): TypeNode | undefined;
  getTypeNodeOrThrow(message?: string | (() => string)): TypeNode;
  getParent(): NodeParentType<ts.MappedTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.MappedTypeNode>>;
}
declare const NamedTupleMemberBase: Constructor<TypedNode> & Constructor<QuestionTokenableNode> & Constructor<DotDotDotTokenableNode> & Constructor<JSDocableNode> & Constructor<NamedNode> & typeof TypeNode;
export declare class NamedTupleMember extends NamedTupleMemberBase<ts.NamedTupleMember> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  removeType(): never;
  getParent(): NodeParentType<ts.NamedTupleMember>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.NamedTupleMember>>;
}
export declare class ParenthesizedTypeNode extends TypeNode<ts.ParenthesizedTypeNode> {
  getTypeNode(): TypeNode;
  setType(textOrWriterFunction: string | WriterFunction): this;
  getParent(): NodeParentType<ts.ParenthesizedTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ParenthesizedTypeNode>>;
}
export declare class RestTypeNode extends TypeNode<ts.RestTypeNode> {
  getTypeNode(): TypeNode<ts.TypeNode>;
  getParent(): NodeParentType<ts.RestTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.RestTypeNode>>;
}
export declare class TemplateLiteralTypeNode extends TypeNode<ts.TemplateLiteralTypeNode> {
  getHead(): TemplateHead;
  getTemplateSpans(): TypeNode<ts.TypeNode>[];
  setLiteralValue(value: string): Node<ts.Node>;
  getParent(): NodeParentType<ts.TemplateLiteralTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TemplateLiteralTypeNode>>;
}
export declare class ThisTypeNode extends TypeNode<ts.ThisTypeNode> {
  getParent(): NodeParentType<ts.ThisTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.ThisTypeNode>>;
}
export declare class TupleTypeNode extends TypeNode<ts.TupleTypeNode> {
  getElements(): (TypeNode<ts.TypeNode> | NamedTupleMember)[];
  getParent(): NodeParentType<ts.TupleTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TupleTypeNode>>;
}
declare const TypeAliasDeclarationBase: Constructor<TypeParameteredNode> & Constructor<TypedNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode> & Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Statement;
export declare class TypeAliasDeclaration extends TypeAliasDeclarationBase<ts.TypeAliasDeclaration> {
  set(structure: Partial<TypeAliasDeclarationStructure>): this;
  getStructure(): TypeAliasDeclarationStructure;
  getParent(): NodeParentType<ts.TypeAliasDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeAliasDeclaration>>;
}
declare const TypeLiteralNodeBase: Constructor<TypeElementMemberedNode> & typeof TypeNode;
export declare class TypeLiteralNode extends TypeLiteralNodeBase<ts.TypeLiteralNode> {
  getParent(): NodeParentType<ts.TypeLiteralNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeLiteralNode>>;
}
export declare class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
}
declare const NodeWithTypeArgumentsBase: Constructor<TypeArgumentedNode> & typeof TypeNode;
export declare class NodeWithTypeArguments<T extends ts.NodeWithTypeArguments = ts.NodeWithTypeArguments> extends NodeWithTypeArgumentsBase<T> {
}
export declare class TypeOperatorTypeNode extends TypeNode<ts.TypeOperatorNode> {
  getOperator(): SyntaxKind.KeyOfKeyword | SyntaxKind.ReadonlyKeyword | SyntaxKind.UniqueKeyword;
  getTypeNode(): TypeNode;
  getParent(): NodeParentType<ts.TypeOperatorNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeOperatorNode>>;
}
export declare enum TypeParameterVariance {
  None = 0,
  In = 1,
  Out = 2,
  InOut = 3
}
declare const TypeParameterDeclarationBase: Constructor<ModifierableNode> & Constructor<NamedNode> & typeof Node;
export declare class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
  isConst(): boolean;
  setIsConst(value: boolean): this;
  getConstraint(): TypeNode | undefined;
  getConstraintOrThrow(message?: string | (() => string)): TypeNode<ts.TypeNode>;
  setConstraint(text: string | WriterFunction): this;
  removeConstraint(): this;
  getDefault(): TypeNode | undefined;
  getDefaultOrThrow(message?: string | (() => string)): TypeNode<ts.TypeNode>;
  setDefault(text: string | WriterFunction): this;
  removeDefault(): this;
  setVariance(variance: TypeParameterVariance): this;
  getVariance(): TypeParameterVariance;
  remove(): void;
  set(structure: Partial<TypeParameterDeclarationStructure>): this;
  getStructure(): TypeParameterDeclarationStructure;
  getParent(): NodeParentType<ts.TypeParameterDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeParameterDeclaration>>;
}
export declare class TypePredicateNode extends TypeNode<ts.TypePredicateNode> {
  getParameterNameNode(): Identifier | ThisTypeNode;
  hasAssertsModifier(): boolean;
  getAssertsModifier(): Node<ts.AssertsKeyword> | undefined;
  getAssertsModifierOrThrow(message?: string | (() => string)): Node<ts.AssertsKeyword>;
  getTypeNode(): TypeNode | undefined;
  getTypeNodeOrThrow(message?: string | (() => string)): TypeNode;
  getParent(): NodeParentType<ts.TypePredicateNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypePredicateNode>>;
}
export declare class TypeQueryNode extends NodeWithTypeArguments<ts.TypeQueryNode> {
  getExprName(): EntityName;
  getParent(): NodeParentType<ts.TypeQueryNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeQueryNode>>;
}
export declare class TypeReferenceNode extends NodeWithTypeArguments<ts.TypeReferenceNode> {
  getTypeName(): EntityName;
  getParent(): NodeParentType<ts.TypeReferenceNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.TypeReferenceNode>>;
}
export declare class UnionTypeNode extends TypeNode<ts.UnionTypeNode> {
  getTypeNodes(): TypeNode[];
  getParent(): NodeParentType<ts.UnionTypeNode>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.UnionTypeNode>>;
}
declare const VariableDeclarationBase: Constructor<ExportGetableNode> & Constructor<ExclamationTokenableNode> & Constructor<TypedNode> & Constructor<InitializerExpressionableNode> & Constructor<BindingNamedNode> & typeof Node;
export declare class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
  remove(): void;
  getVariableStatementOrThrow(message?: string | (() => string)): VariableStatement;
  getVariableStatement(): VariableStatement | undefined;
  set(structure: Partial<VariableDeclarationStructure>): this;
  getStructure(): VariableDeclarationStructure;
  getParent(): NodeParentType<ts.VariableDeclaration>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.VariableDeclaration>>;
}
export declare enum VariableDeclarationKind {
  Var = "var",
  Let = "let",
  Const = "const",
  AwaitUsing = "await using",
  Using = "using"
}
declare const VariableDeclarationListBase: Constructor<ModifierableNode> & typeof Node;
export declare class VariableDeclarationList extends VariableDeclarationListBase<ts.VariableDeclarationList> {
  getDeclarations(): VariableDeclaration[];
  getDeclarationKind(): VariableDeclarationKind;
  getDeclarationKindKeywords(): Node[];
  setDeclarationKind(type: VariableDeclarationKind): this;
  addDeclaration(structure: OptionalKind<VariableDeclarationStructure>): VariableDeclaration;
  addDeclarations(structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>): VariableDeclaration[];
  insertDeclaration(index: number, structure: OptionalKind<VariableDeclarationStructure>): VariableDeclaration;
  insertDeclarations(index: number, structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>): VariableDeclaration[];
  getParent(): NodeParentType<ts.VariableDeclarationList>;
  getParentOrThrow(message?: string | (() => string)): NonNullable<NodeParentType<ts.VariableDeclarationList>>;
}
export declare class Signature {
  #private;
  private constructor();
  get compilerSignature(): ts.Signature;
  getTypeParameters(): TypeParameter[];
  getParameters(): Symbol[];
  getReturnType(): Type;
  getDocumentationComments(): SymbolDisplayPart[];
  getJsDocTags(): JSDocTagInfo[];
  getDeclaration(): MethodSignature | MethodDeclaration | ConstructorDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | CallSignatureDeclaration | ConstructSignatureDeclaration | IndexSignatureDeclaration | FunctionTypeNode | ConstructorTypeNode | FunctionExpression | ArrowFunction | FunctionDeclaration | JSDocFunctionType;
}
export declare class Symbol {
  #private;
  private constructor();
  get compilerSymbol(): ts.Symbol;
  getName(): string;
  getEscapedName(): string;
  getAliasedSymbolOrThrow(message?: string | (() => string)): Symbol;
  getImmediatelyAliasedSymbol(): Symbol | undefined;
  getImmediatelyAliasedSymbolOrThrow(message?: string | (() => string)): Symbol;
  getAliasedSymbol(): Symbol | undefined;
  getExportSymbol(): Symbol;
  isAlias(): boolean;
  isOptional(): boolean;
  getFlags(): SymbolFlags;
  hasFlags(flags: SymbolFlags): boolean;
  getValueDeclarationOrThrow(message?: string | (() => string)): Node;
  getValueDeclaration(): Node | undefined;
  getDeclarations(): Node[];
  getExportOrThrow(name: string, message?: string | (() => string)): Symbol;
  getExport(name: string): Symbol | undefined;
  getExports(): Symbol[];
  getGlobalExportOrThrow(name: string, message?: string | (() => string)): Symbol;
  getGlobalExport(name: string): Symbol | undefined;
  getGlobalExports(): Symbol[];
  getMemberOrThrow(name: string, message?: string | (() => string)): Symbol;
  getMember(name: string): Symbol | undefined;
  getMembers(): Symbol[];
  getDeclaredType(): Type;
  getTypeAtLocation(node: Node): Type<ts.Type>;
  getFullyQualifiedName(): string;
  getJsDocTags(): JSDocTagInfo[];
}
export interface FormatCodeSettings extends ts.FormatCodeSettings {
  ensureNewLineAtEndOfFile?: boolean;
}
export interface RenameOptions {
  renameInComments?: boolean;
  renameInStrings?: boolean;
  usePrefixAndSuffixText?: boolean;
}
export interface UserPreferences extends ts.UserPreferences {
}
export declare class LanguageService {
  #private;
  private constructor();
  get compilerObject(): ts.LanguageService;
  getProgram(): Program;
  getDefinitions(node: Node): DefinitionInfo[];
  getDefinitionsAtPosition(sourceFile: SourceFile, pos: number): DefinitionInfo[];
  getImplementations(node: Node): ImplementationLocation[];
  getImplementationsAtPosition(sourceFile: SourceFile, pos: number): ImplementationLocation[];
  findReferences(node: Node): ReferencedSymbol[];
  findReferencesAsNodes(node: Node): Node<ts.Node>[];
  findReferencesAtPosition(sourceFile: SourceFile, pos: number): ReferencedSymbol[];
  findRenameLocations(node: Node, options?: RenameOptions): RenameLocation[];
  getSuggestionDiagnostics(filePathOrSourceFile: SourceFile | string): DiagnosticWithLocation[];
  getFormattingEditsForRange(filePath: string, range: [number, number], formatSettings: FormatCodeSettings): TextChange[];
  getFormattingEditsForDocument(filePath: string, formatSettings: FormatCodeSettings): TextChange[];
  getFormattedDocumentText(filePath: string, formatSettings: FormatCodeSettings): string;
  getEmitOutput(sourceFile: SourceFile, emitOnlyDtsFiles?: boolean): EmitOutput;
  getEmitOutput(filePath: string, emitOnlyDtsFiles?: boolean): EmitOutput;
  getIdentationAtPosition(sourceFile: SourceFile, position: number, settings?: EditorSettings): number;
  getIdentationAtPosition(filePath: string, position: number, settings?: EditorSettings): number;
  organizeImports(sourceFile: SourceFile, formatSettings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
  organizeImports(filePath: string, formatSettings?: FormatCodeSettings, userPreferences?: UserPreferences): FileTextChanges[];
  getEditsForRefactor(filePathOrSourceFile: string | SourceFile, formatSettings: FormatCodeSettings, positionOrRange: number | {
        getPos(): number;
        getEnd(): number;
    }, refactorName: string, actionName: string, preferences?: UserPreferences): RefactorEditInfo | undefined;
  getCombinedCodeFix(filePathOrSourceFile: string | SourceFile, fixId: {}, formatSettings?: FormatCodeSettings, preferences?: UserPreferences): CombinedCodeActions;
  getCodeFixesAtPosition(filePathOrSourceFile: string | SourceFile, start: number, end: number, errorCodes: ReadonlyArray<number>, formatOptions?: FormatCodeSettings, preferences?: UserPreferences): CodeFixAction[];
}
export interface ProgramEmitOptions extends EmitOptions {
  writeFile?: ts.WriteFileCallback;
}
export interface EmitOptions extends EmitOptionsBase {
  targetSourceFile?: SourceFile;
}
export interface EmitOptionsBase {
  emitOnlyDtsFiles?: boolean;
  customTransformers?: ts.CustomTransformers;
}
export declare class Program {
  #private;
  private constructor();
  get compilerObject(): ts.Program;
  getTypeChecker(): TypeChecker;
  emit(options?: ProgramEmitOptions): Promise<EmitResult>;
  emitSync(options?: ProgramEmitOptions): EmitResult;
  emitToMemory(options?: EmitOptions): MemoryEmitResult;
  getSyntacticDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[];
  getSemanticDiagnostics(sourceFile?: SourceFile): Diagnostic[];
  getDeclarationDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[];
  getGlobalDiagnostics(): Diagnostic[];
  getConfigFileParsingDiagnostics(): Diagnostic[];
  getEmitModuleResolutionKind(): ModuleResolutionKind;
  isSourceFileFromExternalLibrary(sourceFile: SourceFile): boolean;
}
export declare class CodeAction<TCompilerObject extends ts.CodeAction = ts.CodeAction> {
  #private;
  protected constructor();
  get compilerObject(): TCompilerObject;
  getDescription(): string;
  getChanges(): FileTextChanges[];
}
export declare class CodeFixAction extends CodeAction<ts.CodeFixAction> {
  getFixName(): string;
  getFixId(): {} | undefined;
  getFixAllDescription(): string | undefined;
}
export declare class CombinedCodeActions {
  #private;
  private constructor();
  get compilerObject(): ts.CombinedCodeActions;
  getChanges(): FileTextChanges[];
  applyChanges(options?: ApplyFileTextChangesOptions): this;
}
export declare class DefinitionInfo<TCompilerObject extends ts.DefinitionInfo = ts.DefinitionInfo> extends DocumentSpan<TCompilerObject> {
  protected constructor();
  getKind(): ts.ScriptElementKind;
  getName(): string;
  getContainerKind(): ts.ScriptElementKind;
  getContainerName(): string;
  getDeclarationNode(): Node | undefined;
}
export declare class Diagnostic<TCompilerObject extends ts.Diagnostic = ts.Diagnostic> {
  protected constructor();
  get compilerObject(): TCompilerObject;
  getSourceFile(): SourceFile | undefined;
  getMessageText(): string | DiagnosticMessageChain;
  getLineNumber(): number | undefined;
  getStart(): number | undefined;
  getLength(): number | undefined;
  getCategory(): DiagnosticCategory;
  getCode(): number;
  getSource(): string | undefined;
}
export declare class DiagnosticMessageChain {
  private constructor();
  get compilerObject(): ts.DiagnosticMessageChain;
  getMessageText(): string;
  getNext(): DiagnosticMessageChain[] | undefined;
  getCode(): number;
  getCategory(): DiagnosticCategory;
}
export declare class DiagnosticWithLocation extends Diagnostic<ts.DiagnosticWithLocation> {
  private constructor();
  getLineNumber(): number;
  getStart(): number;
  getLength(): number;
  getSourceFile(): SourceFile;
}
export declare class DocumentSpan<TCompilerObject extends ts.DocumentSpan = ts.DocumentSpan> {
  protected constructor();
  get compilerObject(): TCompilerObject;
  getSourceFile(): SourceFile;
  getTextSpan(): TextSpan;
  getNode(): Node<ts.Node>;
  getOriginalTextSpan(): TextSpan | undefined;
  getOriginalFileName(): string | undefined;
}
export declare class EmitOutput {
  #private;
  private constructor();
  get compilerObject(): ts.EmitOutput;
  getDiagnostics(): Diagnostic<ts.Diagnostic>[];
  getEmitSkipped(): boolean;
  getOutputFiles(): OutputFile[];
}
export declare class EmitResult {
  protected constructor();
  get compilerObject(): ts.EmitResult;
  getEmitSkipped(): boolean;
  getDiagnostics(): Diagnostic<ts.Diagnostic>[];
}
export interface ApplyFileTextChangesOptions {
  overwrite?: boolean;
}
export declare class FileTextChanges {
  #private;
  private constructor();
  getFilePath(): string;
  getSourceFile(): SourceFile | undefined;
  getTextChanges(): TextChange[];
  applyChanges(options?: ApplyFileTextChangesOptions): this | undefined;
  isNewFile(): boolean;
}
export declare class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
  private constructor();
  getKind(): ts.ScriptElementKind;
  getDisplayParts(): SymbolDisplayPart[];
}
export interface MemoryEmitResultFile {
  filePath: StandardizedFilePath;
  text: string;
  writeByteOrderMark: boolean;
}
export declare class MemoryEmitResult extends EmitResult {
  #private;
  private constructor();
  getFiles(): MemoryEmitResultFile[];
  saveFiles(): Promise<void[]>;
  saveFilesSync(): void;
}
export declare class OutputFile {
  #private;
  private constructor();
  get compilerObject(): ts.OutputFile;
  getFilePath(): StandardizedFilePath;
  getWriteByteOrderMark(): boolean;
  getText(): string;
}
export declare class RefactorEditInfo {
  #private;
  private constructor();
  get compilerObject(): ts.RefactorEditInfo;
  getEdits(): FileTextChanges[];
  getRenameFilePath(): string | undefined;
  getRenameLocation(): number | undefined;
  applyChanges(options?: ApplyFileTextChangesOptions): this;
}
export declare class ReferencedSymbol {
  #private;
  private constructor();
  get compilerObject(): ts.ReferencedSymbol;
  getDefinition(): ReferencedSymbolDefinitionInfo;
  getReferences(): ReferencedSymbolEntry[];
}
export declare class ReferencedSymbolDefinitionInfo extends DefinitionInfo<ts.ReferencedSymbolDefinitionInfo> {
  private constructor();
  getDisplayParts(): SymbolDisplayPart[];
}
export declare class ReferenceEntry<T extends ts.ReferenceEntry = ts.ReferenceEntry> extends DocumentSpan<T> {
  protected constructor();
  isWriteAccess(): boolean;
  isInString(): true | undefined;
}
export declare class ReferencedSymbolEntry extends ReferenceEntry<ts.ReferencedSymbolEntry> {
  private constructor();
  isDefinition(): boolean | undefined;
}
export declare class RenameLocation extends DocumentSpan<ts.RenameLocation> {
  getPrefixText(): string | undefined;
  getSuffixText(): string | undefined;
}
export declare class SymbolDisplayPart {
  #private;
  private constructor();
  get compilerObject(): ts.SymbolDisplayPart;
  getText(): string;
  getKind(): string;
}
export declare class TextChange {
  #private;
  private constructor();
  get compilerObject(): ts.TextChange;
  getSpan(): TextSpan;
  getNewText(): string;
}
export declare class TextSpan {
  #private;
  private constructor();
  get compilerObject(): ts.TextSpan;
  getStart(): number;
  getEnd(): number;
  getLength(): number;
}
export declare class TypeChecker {
  #private;
  private constructor();
  get compilerObject(): ts.TypeChecker;
  getAmbientModules(): Symbol[];
  getApparentType(type: Type): Type<ts.Type>;
  getConstantValue(node: EnumMember): string | number | undefined;
  getFullyQualifiedName(symbol: Symbol): string;
  getTypeAtLocation(node: Node): Type;
  getContextualType(expression: Expression): Type | undefined;
  getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type;
  getDeclaredTypeOfSymbol(symbol: Symbol): Type;
  getSymbolAtLocation(node: Node): Symbol | undefined;
  getAliasedSymbol(symbol: Symbol): Symbol | undefined;
  getImmediatelyAliasedSymbol(symbol: Symbol): Symbol | undefined;
  getExportSymbolOfSymbol(symbol: Symbol): Symbol;
  getPropertiesOfType(type: Type): Symbol[];
  getTypeText(type: Type, enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags): string;
  getReturnTypeOfSignature(signature: Signature): Type;
  getSignatureFromNode(node: Node<ts.SignatureDeclaration>): Signature | undefined;
  getExportsOfModule(moduleSymbol: Symbol): Symbol[];
  getExportSpecifierLocalTargetSymbol(exportSpecifier: ExportSpecifier): Symbol | undefined;
  getResolvedSignature(node: CallLikeExpression): Signature | undefined;
  getResolvedSignatureOrThrow(node: CallLikeExpression, message?: string | (() => string)): Signature;
  getBaseTypeOfLiteralType(type: Type): Type<ts.Type>;
  getSymbolsInScope(node: Node, meaning: SymbolFlags): Symbol[];
  getTypeArguments(typeReference: Type): Type<ts.Type>[];
  isTypeAssignableTo(sourceType: Type, targetType: Type): boolean;
  getShorthandAssignmentValueSymbol(node: Node): Symbol | undefined;
  resolveName(name: string, location: Node | undefined, meaning: SymbolFlags, excludeGlobals: boolean): Symbol | undefined;
}
export declare class Type<TType extends ts.Type = ts.Type> {
  #private;
  protected constructor();
  get compilerType(): TType;
  getText(enclosingNode?: Node, typeFormatFlags?: TypeFormatFlags): string;
  getAliasSymbol(): Symbol | undefined;
  getAliasSymbolOrThrow(message?: string | (() => string)): Symbol;
  getAliasTypeArguments(): Type[];
  getApparentType(): Type;
  getArrayElementTypeOrThrow(message?: string | (() => string)): Type<ts.Type>;
  getArrayElementType(): Type<ts.Type> | undefined;
  getBaseTypes(): Type<ts.BaseType>[];
  getBaseTypeOfLiteralType(): Type<ts.Type>;
  getCallSignatures(): Signature[];
  getConstructSignatures(): Signature[];
  getConstraintOrThrow(message?: string | (() => string)): Type<ts.Type>;
  getConstraint(): Type<ts.Type> | undefined;
  getDefaultOrThrow(message?: string | (() => string)): Type<ts.Type>;
  getDefault(): Type<ts.Type> | undefined;
  getProperties(): Symbol[];
  getPropertyOrThrow(name: string): Symbol;
  getPropertyOrThrow(findFunction: (declaration: Symbol) => boolean): Symbol;
  getProperty(name: string): Symbol | undefined;
  getProperty(findFunction: (declaration: Symbol) => boolean): Symbol | undefined;
  getApparentProperties(): Symbol[];
  getApparentProperty(name: string): Symbol | undefined;
  getApparentProperty(findFunction: (declaration: Symbol) => boolean): Symbol | undefined;
  isNullable(): boolean;
  getNonNullableType(): Type;
  getNumberIndexType(): Type | undefined;
  getStringIndexType(): Type | undefined;
  getTargetType(): Type<ts.GenericType> | undefined;
  getTargetTypeOrThrow(message?: string | (() => string)): Type<ts.GenericType>;
  getTypeArguments(): Type[];
  getTupleElements(): Type[];
  getUnionTypes(): Type[];
  getIntersectionTypes(): Type[];
  getLiteralValue(): string | number | ts.PseudoBigInt | undefined;
  getLiteralValueOrThrow(message?: string | (() => string)): string | number | ts.PseudoBigInt;
  getLiteralFreshType(): Type<ts.FreshableType> | undefined;
  getLiteralFreshTypeOrThrow(message?: string | (() => string)): Type<ts.FreshableType>;
  getLiteralRegularType(): Type<ts.FreshableType> | undefined;
  getLiteralRegularTypeOrThrow(message?: string | (() => string)): Type<ts.FreshableType>;
  getSymbol(): Symbol | undefined;
  getSymbolOrThrow(message?: string | (() => string)): Symbol;
  isAssignableTo(target: Type): boolean;
  isAnonymous(): boolean;
  isAny(): boolean;
  isNever(): boolean;
  isArray(): boolean;
  isReadonlyArray(): boolean;
  isTemplateLiteral(): this is Type<ts.TemplateLiteralType>;
  isBoolean(): boolean;
  isString(): boolean;
  isNumber(): boolean;
  isBigInt(): boolean;
  isLiteral(): boolean;
  isBooleanLiteral(): boolean;
  isBigIntLiteral(): boolean;
  isEnumLiteral(): boolean;
  isNumberLiteral(): this is Type<ts.NumberLiteralType>;
  isStringLiteral(): this is Type<ts.StringLiteralType>;
  isClass(): this is Type<ts.InterfaceType>;
  isClassOrInterface(): this is Type<ts.InterfaceType>;
  isEnum(): boolean;
  isInterface(): this is Type<ts.InterfaceType>;
  isObject(): this is Type<ts.ObjectType>;
  isTypeParameter(): this is TypeParameter;
  isTuple(): this is Type<ts.TupleType>;
  isUnion(): this is Type<ts.UnionType>;
  isIntersection(): this is Type<ts.IntersectionType>;
  isUnionOrIntersection(): this is Type<ts.UnionOrIntersectionType>;
  isUnknown(): boolean;
  isNull(): boolean;
  isUndefined(): boolean;
  isVoid(): boolean;
  getFlags(): TypeFlags;
  getObjectFlags(): 0 | ObjectFlags.Class | ObjectFlags.Interface | ObjectFlags.Reference | ObjectFlags.Tuple | ObjectFlags.Anonymous | ObjectFlags.Mapped | ObjectFlags.Instantiated | ObjectFlags.ObjectLiteral | ObjectFlags.EvolvingArray | ObjectFlags.ObjectLiteralPatternWithComputedProperties | ObjectFlags.ReverseMapped | ObjectFlags.JsxAttributes | ObjectFlags.JSLiteral | ObjectFlags.FreshLiteral | ObjectFlags.ArrayLiteral | ObjectFlags.ClassOrInterface | ObjectFlags.ContainsSpread | ObjectFlags.ObjectRestType | ObjectFlags.InstantiationExpressionType | ObjectFlags.SingleSignatureType;
}
export declare class TypeParameter extends Type<ts.TypeParameter> {
  #private;
  getConstraintOrThrow(message?: string | (() => string)): Type;
  getConstraint(): Type | undefined;
  getDefaultOrThrow(message?: string | (() => string)): Type;
  getDefault(): Type | undefined;
}
export declare enum IndentationText {
  TwoSpaces = "  ",
  FourSpaces = "    ",
  EightSpaces = "        ",
  Tab = "\t"
}
export interface ManipulationSettings extends SupportedFormatCodeSettingsOnly {
  indentationText: IndentationText;
  newLineKind: NewLineKind;
  quoteKind: QuoteKind;
  usePrefixAndSuffixTextForRename: boolean;
  useTrailingCommas: boolean;
}
export interface SupportedFormatCodeSettings extends SupportedFormatCodeSettingsOnly, EditorSettings {
}
export interface SupportedFormatCodeSettingsOnly {
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: boolean;
}
export declare class ManipulationSettingsContainer extends SettingsContainer<ManipulationSettings> {
  #private;
  constructor();
  getEditorSettings(): Readonly<EditorSettings>;
  getFormatCodeSettings(): Readonly<SupportedFormatCodeSettings>;
  getUserPreferences(): Readonly<UserPreferences>;
  getQuoteKind(): QuoteKind;
  getNewLineKind(): NewLineKind;
  getNewLineKindAsString(): "\r\n" | "\n";
  getIndentationText(): IndentationText;
  getUsePrefixAndSuffixTextForRename(): boolean;
  getUseTrailingCommas(): boolean;
  set(settings: Partial<ManipulationSettings>): void;
}
export type StatementStructures = ClassDeclarationStructure | EnumDeclarationStructure | FunctionDeclarationStructure | InterfaceDeclarationStructure | ModuleDeclarationStructure | TypeAliasDeclarationStructure | ImportDeclarationStructure | ExportDeclarationStructure | ExportAssignmentStructure | VariableStatementStructure;
export type ClassMemberStructures = ConstructorDeclarationStructure | GetAccessorDeclarationStructure | SetAccessorDeclarationStructure | MethodDeclarationStructure | PropertyDeclarationStructure | ClassStaticBlockDeclarationStructure;
export type TypeElementMemberStructures = CallSignatureDeclarationStructure | ConstructSignatureDeclarationStructure | IndexSignatureDeclarationStructure | MethodSignatureStructure | PropertySignatureStructure;
export type InterfaceMemberStructures = TypeElementMemberStructures;
export type ObjectLiteralExpressionPropertyStructures = PropertyAssignmentStructure | ShorthandPropertyAssignmentStructure | SpreadAssignmentStructure | GetAccessorDeclarationStructure | SetAccessorDeclarationStructure | MethodDeclarationStructure;
export type JsxStructures = JsxAttributeStructure | JsxSpreadAttributeStructure | JsxElementStructure | JsxSelfClosingElementStructure;
export type Structures = ImportAttributeStructure | StatementStructures | ClassMemberStructures | EnumMemberStructure | InterfaceMemberStructures | ObjectLiteralExpressionPropertyStructures | JsxStructures | FunctionDeclarationOverloadStructure | MethodDeclarationOverloadStructure | ConstructorDeclarationOverloadStructure | ParameterDeclarationStructure | TypeParameterDeclarationStructure | SourceFileStructure | ExportSpecifierStructure | ImportSpecifierStructure | VariableDeclarationStructure | JSDocStructure | JSDocTagStructure | DecoratorStructure;
export interface AbstractableNodeStructure {
  isAbstract?: boolean;
}
export interface AmbientableNodeStructure {
  hasDeclareKeyword?: boolean;
}
export interface AsyncableNodeStructure {
  isAsync?: boolean;
}
export interface AwaitableNodeStructure {
  isAwaited?: boolean;
}
export interface DecoratableNodeStructure {
  decorators?: OptionalKind<DecoratorStructure>[];
}
export interface ExclamationTokenableNodeStructure {
  hasExclamationToken?: boolean;
}
export interface ExportableNodeStructure {
  isExported?: boolean;
  isDefaultExport?: boolean;
}
export interface ExtendsClauseableNodeStructure {
  extends?: (string | WriterFunction)[] | WriterFunction;
}
export interface GeneratorableNodeStructure {
  isGenerator?: boolean;
}
export interface ImplementsClauseableNodeStructure {
  implements?: (string | WriterFunction)[] | WriterFunction;
}
export interface InitializerExpressionableNodeStructure {
  initializer?: string | WriterFunction;
}
export interface JSDocableNodeStructure {
  docs?: (OptionalKind<JSDocStructure> | string)[];
}
export interface BindingNamedNodeStructure {
  name: string;
}
export interface ImportAttributeNamedNodeStructure {
  name: string;
}
export interface ModuleNamedNodeStructure {
  name: string;
}
export interface NameableNodeStructure {
  name?: string;
}
export interface NamedNodeStructure {
  name: string;
}
export interface PropertyNameableNodeStructure {
  name?: string;
}
export interface PropertyNamedNodeStructure {
  name: string;
}
export interface OverrideableNodeStructure {
  hasOverrideKeyword?: boolean;
}
export interface ParameteredNodeStructure {
  parameters?: OptionalKind<ParameterDeclarationStructure>[];
}
export interface QuestionDotTokenableNodeStructure {
  hasQuestionDotToken?: boolean;
}
export interface QuestionTokenableNodeStructure {
  hasQuestionToken?: boolean;
}
export interface ReadonlyableNodeStructure {
  isReadonly?: boolean;
}
export interface ReturnTypedNodeStructure {
  returnType?: string | WriterFunction;
}
export interface ScopeableNodeStructure {
  scope?: Scope;
}
export interface ScopedNodeStructure {
  scope?: Scope;
}
export interface SignaturedDeclarationStructure extends ParameteredNodeStructure, ReturnTypedNodeStructure {
}
export interface StaticableNodeStructure {
  isStatic?: boolean;
}
export interface TypedNodeStructure {
  type?: string | WriterFunction;
}
export interface TypeElementMemberedNodeStructure {
  callSignatures?: OptionalKind<CallSignatureDeclarationStructure>[];
  constructSignatures?: OptionalKind<ConstructSignatureDeclarationStructure>[];
  getAccessors?: OptionalKind<GetAccessorDeclarationStructure>[];
  indexSignatures?: OptionalKind<IndexSignatureDeclarationStructure>[];
  methods?: OptionalKind<MethodSignatureStructure>[];
  properties?: OptionalKind<PropertySignatureStructure>[];
  setAccessors?: OptionalKind<SetAccessorDeclarationStructure>[];
}
export interface TypeParameteredNodeStructure {
  typeParameters?: (OptionalKind<TypeParameterDeclarationStructure> | string)[];
}
export interface ClassLikeDeclarationBaseStructure extends NameableNodeStructure, ClassLikeDeclarationBaseSpecificStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AbstractableNodeStructure {
}
interface ClassLikeDeclarationBaseSpecificStructure {
  extends?: string | WriterFunction;
  ctors?: OptionalKind<ConstructorDeclarationStructure>[];
  staticBlocks?: OptionalKind<ClassStaticBlockDeclarationStructure>[];
  properties?: OptionalKind<PropertyDeclarationStructure>[];
  getAccessors?: OptionalKind<GetAccessorDeclarationStructure>[];
  setAccessors?: OptionalKind<SetAccessorDeclarationStructure>[];
  methods?: OptionalKind<MethodDeclarationStructure>[];
}
export interface ClassDeclarationStructure extends Structure, ClassLikeDeclarationBaseStructure, ClassDeclarationSpecificStructure, AmbientableNodeStructure, ExportableNodeStructure {
  name?: string;
}
interface ClassDeclarationSpecificStructure extends KindedStructure<StructureKind.Class> {
}
export interface ClassStaticBlockDeclarationStructure extends Structure, ClassStaticBlockDeclarationSpecificStructure, JSDocableNodeStructure, StatementedNodeStructure {
}
interface ClassStaticBlockDeclarationSpecificStructure extends KindedStructure<StructureKind.ClassStaticBlock> {
}
export interface ConstructorDeclarationStructure extends Structure, ConstructorDeclarationSpecificStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure {
}
interface ConstructorDeclarationSpecificStructure extends KindedStructure<StructureKind.Constructor> {
  overloads?: OptionalKind<ConstructorDeclarationOverloadStructure>[];
}
export interface ConstructorDeclarationOverloadStructure extends Structure, ConstructorDeclarationOverloadSpecificStructure, ScopedNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure {
}
interface ConstructorDeclarationOverloadSpecificStructure extends KindedStructure<StructureKind.ConstructorOverload> {
}
export interface GetAccessorDeclarationStructure extends Structure, GetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure {
}
interface GetAccessorDeclarationSpecificStructure extends KindedStructure<StructureKind.GetAccessor> {
}
export interface MethodDeclarationStructure extends Structure, MethodDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure, QuestionTokenableNodeStructure, OverrideableNodeStructure {
}
interface MethodDeclarationSpecificStructure extends KindedStructure<StructureKind.Method> {
  overloads?: OptionalKind<MethodDeclarationOverloadStructure>[];
}
export interface MethodDeclarationOverloadStructure extends Structure, MethodDeclarationOverloadSpecificStructure, StaticableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, QuestionTokenableNodeStructure, OverrideableNodeStructure {
}
interface MethodDeclarationOverloadSpecificStructure extends KindedStructure<StructureKind.MethodOverload> {
}
export interface PropertyDeclarationStructure extends Structure, PropertyDeclarationSpecificStructure, PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, ExclamationTokenableNodeStructure, StaticableNodeStructure, ScopedNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, AmbientableNodeStructure, OverrideableNodeStructure {
}
interface PropertyDeclarationSpecificStructure extends KindedStructure<StructureKind.Property> {
  hasAccessorKeyword?: boolean;
}
export interface SetAccessorDeclarationStructure extends Structure, SetAccessorDeclarationSpecificStructure, PropertyNamedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure, FunctionLikeDeclarationStructure {
}
interface SetAccessorDeclarationSpecificStructure extends KindedStructure<StructureKind.SetAccessor> {
}
export interface DecoratorStructure extends Structure, DecoratorSpecificStructure {
}
interface DecoratorSpecificStructure extends KindedStructure<StructureKind.Decorator> {
  name: string;
  arguments?: (string | WriterFunction)[] | WriterFunction;
  typeArguments?: string[];
}
export interface JSDocStructure extends Structure, JSDocSpecificStructure {
}
interface JSDocSpecificStructure extends KindedStructure<StructureKind.JSDoc> {
  description?: string | WriterFunction;
  tags?: OptionalKind<JSDocTagStructure>[];
}
export interface JSDocTagStructure extends Structure, JSDocTagSpecificStructure {
}
interface JSDocTagSpecificStructure extends KindedStructure<StructureKind.JSDocTag> {
  tagName: string;
  text?: string | WriterFunction;
}
export interface EnumDeclarationStructure extends Structure, NamedNodeStructure, EnumDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
}
interface EnumDeclarationSpecificStructure extends KindedStructure<StructureKind.Enum> {
  isConst?: boolean;
  members?: OptionalKind<EnumMemberStructure>[];
}
export interface EnumMemberStructure extends Structure, EnumMemberSpecificStructure, PropertyNamedNodeStructure, JSDocableNodeStructure, InitializerExpressionableNodeStructure {
}
interface EnumMemberSpecificStructure extends KindedStructure<StructureKind.EnumMember> {
  value?: number | string;
}
export interface ExpressionedNodeStructure {
  expression: string | WriterFunction;
}
export interface PropertyAssignmentStructure extends Structure, PropertyAssignmentSpecificStructure, PropertyNamedNodeStructure {
}
interface PropertyAssignmentSpecificStructure extends KindedStructure<StructureKind.PropertyAssignment> {
  initializer: string | WriterFunction;
}
export interface ShorthandPropertyAssignmentStructure extends Structure, ShorthandPropertyAssignmentSpecificStructure, NamedNodeStructure {
}
interface ShorthandPropertyAssignmentSpecificStructure extends KindedStructure<StructureKind.ShorthandPropertyAssignment> {
}
export interface SpreadAssignmentStructure extends Structure, SpreadAssignmentSpecificStructure, ExpressionedNodeStructure {
}
interface SpreadAssignmentSpecificStructure extends KindedStructure<StructureKind.SpreadAssignment> {
}
export interface FunctionDeclarationStructure extends Structure, FunctionDeclarationSpecificStructure, NameableNodeStructure, FunctionLikeDeclarationStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
}
interface FunctionDeclarationSpecificStructure extends KindedStructure<StructureKind.Function> {
  overloads?: OptionalKind<FunctionDeclarationOverloadStructure>[];
}
export interface FunctionDeclarationOverloadStructure extends Structure, FunctionDeclarationOverloadSpecificStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
}
interface FunctionDeclarationOverloadSpecificStructure extends KindedStructure<StructureKind.FunctionOverload> {
}
export interface FunctionLikeDeclarationStructure extends SignaturedDeclarationStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, StatementedNodeStructure {
}
export interface ParameterDeclarationStructure extends Structure, BindingNamedNodeStructure, TypedNodeStructure, ReadonlyableNodeStructure, DecoratableNodeStructure, QuestionTokenableNodeStructure, ScopeableNodeStructure, InitializerExpressionableNodeStructure, ParameterDeclarationSpecificStructure, OverrideableNodeStructure {
}
interface ParameterDeclarationSpecificStructure extends KindedStructure<StructureKind.Parameter> {
  isRestParameter?: boolean;
}
export interface CallSignatureDeclarationStructure extends Structure, CallSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}
interface CallSignatureDeclarationSpecificStructure extends KindedStructure<StructureKind.CallSignature> {
}
export interface ConstructSignatureDeclarationStructure extends Structure, ConstructSignatureDeclarationSpecificStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}
interface ConstructSignatureDeclarationSpecificStructure extends KindedStructure<StructureKind.ConstructSignature> {
}
export interface IndexSignatureDeclarationStructure extends Structure, IndexSignatureDeclarationSpecificStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure {
}
interface IndexSignatureDeclarationSpecificStructure extends KindedStructure<StructureKind.IndexSignature> {
  keyName?: string;
  keyType?: string;
}
export interface InterfaceDeclarationStructure extends Structure, NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, TypeElementMemberedNodeStructure {
}
interface InterfaceDeclarationSpecificStructure extends KindedStructure<StructureKind.Interface> {
}
export interface MethodSignatureStructure extends Structure, PropertyNamedNodeStructure, MethodSignatureSpecificStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure {
}
interface MethodSignatureSpecificStructure extends KindedStructure<StructureKind.MethodSignature> {
}
export interface PropertySignatureStructure extends Structure, PropertySignatureSpecificStructure, PropertyNamedNodeStructure, TypedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, InitializerExpressionableNodeStructure {
}
interface PropertySignatureSpecificStructure extends KindedStructure<StructureKind.PropertySignature> {
}
export interface JsxAttributedNodeStructure {
  attributes?: (OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure)[];
}
export interface JsxTagNamedNodeStructure {
  name: string;
}
export interface JsxAttributeStructure extends Structure, JsxAttributeSpecificStructure {
}
interface JsxAttributeSpecificStructure extends KindedStructure<StructureKind.JsxAttribute> {
  name: string | JsxNamespacedNameStructure;
  initializer?: string;
}
export interface JsxElementStructure extends Structure, JsxElementSpecificStructure {
}
interface JsxElementSpecificStructure extends KindedStructure<StructureKind.JsxElement> {
  name: string;
  attributes?: (OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure)[];
  children?: (OptionalKind<JsxElementStructure> | JsxSelfClosingElementStructure)[];
  bodyText?: string;
}
export interface JsxNamespacedNameStructure {
  namespace: string;
  name: string;
}
export interface JsxSelfClosingElementStructure extends Structure, JsxTagNamedNodeStructure, JsxSelfClosingElementSpecificStructure, JsxAttributedNodeStructure {
}
interface JsxSelfClosingElementSpecificStructure extends KindedStructure<StructureKind.JsxSelfClosingElement> {
}
export interface JsxSpreadAttributeStructure extends Structure, JsxSpreadAttributeSpecificStructure {
}
interface JsxSpreadAttributeSpecificStructure extends KindedStructure<StructureKind.JsxSpreadAttribute> {
  expression: string;
}
export interface ExportAssignmentStructure extends Structure, ExportAssignmentSpecificStructure, JSDocableNodeStructure {
}
interface ExportAssignmentSpecificStructure extends KindedStructure<StructureKind.ExportAssignment> {
  isExportEquals?: boolean;
  expression: string | WriterFunction;
}
export interface ExportDeclarationStructure extends Structure, ExportDeclarationSpecificStructure {
}
interface ExportDeclarationSpecificStructure extends KindedStructure<StructureKind.ExportDeclaration> {
  isTypeOnly?: boolean;
  namespaceExport?: string;
  namedExports?: (string | OptionalKind<ExportSpecifierStructure> | WriterFunction)[] | WriterFunction;
  moduleSpecifier?: string;
  attributes?: OptionalKind<ImportAttributeStructure>[] | undefined;
}
export interface ExportSpecifierStructure extends Structure, ExportSpecifierSpecificStructure {
}
interface ExportSpecifierSpecificStructure extends KindedStructure<StructureKind.ExportSpecifier> {
  name: string;
  alias?: string;
  isTypeOnly?: boolean;
}
export interface ImportAttributeStructure extends Structure, ImportAttributeStructureSpecificStructure, ImportAttributeNamedNodeStructure {
}
interface ImportAttributeStructureSpecificStructure extends KindedStructure<StructureKind.ImportAttribute> {
  value: string;
}
export interface ImportDeclarationStructure extends Structure, ImportDeclarationSpecificStructure {
}
interface ImportDeclarationSpecificStructure extends KindedStructure<StructureKind.ImportDeclaration> {
  isTypeOnly?: boolean;
  defaultImport?: string;
  namespaceImport?: string;
  namedImports?: (OptionalKind<ImportSpecifierStructure> | string | WriterFunction)[] | WriterFunction;
  moduleSpecifier: string;
  attributes?: OptionalKind<ImportAttributeStructure>[] | undefined;
}
export interface ImportSpecifierStructure extends Structure, ImportSpecifierSpecificStructure {
}
interface ImportSpecifierSpecificStructure extends KindedStructure<StructureKind.ImportSpecifier> {
  name: string;
  isTypeOnly?: boolean;
  alias?: string;
}
export interface ModuleDeclarationStructure extends Structure, ModuleNamedNodeStructure, ModuleDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, StatementedNodeStructure {
}
interface ModuleDeclarationSpecificStructure extends KindedStructure<StructureKind.Module> {
  declarationKind?: ModuleDeclarationKind;
}
export interface SourceFileStructure extends Structure, SourceFileSpecificStructure, StatementedNodeStructure {
}
interface SourceFileSpecificStructure {
  kind: StructureKind.SourceFile;
}
export interface StatementedNodeStructure {
  statements?: (string | WriterFunction | StatementStructures)[] | string | WriterFunction;
}
export interface VariableDeclarationStructure extends Structure, VariableDeclarationSpecificStructure, BindingNamedNodeStructure, InitializerExpressionableNodeStructure, TypedNodeStructure, ExclamationTokenableNodeStructure {
}
interface VariableDeclarationSpecificStructure extends KindedStructure<StructureKind.VariableDeclaration> {
}
export interface VariableStatementStructure extends Structure, VariableStatementSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
}
interface VariableStatementSpecificStructure extends KindedStructure<StructureKind.VariableStatement> {
  declarationKind?: VariableDeclarationKind;
  declarations: OptionalKind<VariableDeclarationStructure>[];
}
export interface Structure {
  leadingTrivia?: string | WriterFunction | (string | WriterFunction)[];
  trailingTrivia?: string | WriterFunction | (string | WriterFunction)[];
}
export declare const Structure: {
      readonly hasName: <T extends Structure>(structure: T) => structure is T & {
          name: string;
      };
      readonly isCallSignature: (structure: unknown) => structure is CallSignatureDeclarationStructure;
      readonly isJSDocable: <T_1>(structure: T_1) => structure is T_1 & JSDocableNodeStructure;
      readonly isSignatured: <T_2>(structure: T_2) => structure is T_2 & SignaturedDeclarationStructure;
      readonly isParametered: <T_3>(structure: T_3) => structure is T_3 & ParameteredNodeStructure;
      readonly isReturnTyped: <T_4>(structure: T_4) => structure is T_4 & ReturnTypedNodeStructure;
      readonly isTypeParametered: <T_5>(structure: T_5) => structure is T_5 & TypeParameteredNodeStructure;
      readonly isClass: (structure: unknown) => structure is ClassDeclarationStructure;
      readonly isClassLikeDeclarationBase: <T_6>(structure: T_6) => structure is T_6 & ClassLikeDeclarationBaseStructure;
      readonly isNameable: <T_7>(structure: T_7) => structure is T_7 & NameableNodeStructure;
      readonly isImplementsClauseable: <T_8>(structure: T_8) => structure is T_8 & ImplementsClauseableNodeStructure;
      readonly isDecoratable: <T_9>(structure: T_9) => structure is T_9 & DecoratableNodeStructure;
      readonly isAbstractable: <T_10>(structure: T_10) => structure is T_10 & AbstractableNodeStructure;
      readonly isAmbientable: <T_11>(structure: T_11) => structure is T_11 & AmbientableNodeStructure;
      readonly isExportable: <T_12>(structure: T_12) => structure is T_12 & ExportableNodeStructure;
      readonly isClassStaticBlock: (structure: unknown) => structure is ClassStaticBlockDeclarationStructure;
      readonly isStatemented: <T_13>(structure: T_13) => structure is T_13 & StatementedNodeStructure;
      readonly isConstructorDeclarationOverload: (structure: unknown) => structure is ConstructorDeclarationOverloadStructure;
      readonly isScoped: <T_14>(structure: T_14) => structure is T_14 & ScopedNodeStructure;
      readonly isConstructor: (structure: unknown) => structure is ConstructorDeclarationStructure;
      readonly isFunctionLike: <T_15>(structure: T_15) => structure is T_15 & FunctionLikeDeclarationStructure;
      readonly isConstructSignature: (structure: unknown) => structure is ConstructSignatureDeclarationStructure;
      readonly isDecorator: (structure: unknown) => structure is DecoratorStructure;
      readonly isEnum: (structure: unknown) => structure is EnumDeclarationStructure;
      readonly isNamed: <T_16>(structure: T_16) => structure is T_16 & NamedNodeStructure;
      readonly isEnumMember: (structure: unknown) => structure is EnumMemberStructure;
      readonly isPropertyNamed: <T_17>(structure: T_17) => structure is T_17 & PropertyNamedNodeStructure;
      readonly isInitializerExpressionable: <T_18>(structure: T_18) => structure is T_18 & InitializerExpressionableNodeStructure;
      readonly isExportAssignment: (structure: unknown) => structure is ExportAssignmentStructure;
      readonly isExportDeclaration: (structure: unknown) => structure is ExportDeclarationStructure;
      readonly isExportSpecifier: (structure: unknown) => structure is ExportSpecifierStructure;
      readonly isFunctionDeclarationOverload: (structure: unknown) => structure is FunctionDeclarationOverloadStructure;
      readonly isAsyncable: <T_19>(structure: T_19) => structure is T_19 & AsyncableNodeStructure;
      readonly isGeneratorable: <T_20>(structure: T_20) => structure is T_20 & GeneratorableNodeStructure;
      readonly isFunction: (structure: unknown) => structure is FunctionDeclarationStructure;
      readonly isGetAccessor: (structure: unknown) => structure is GetAccessorDeclarationStructure;
      readonly isStaticable: <T_21>(structure: T_21) => structure is T_21 & StaticableNodeStructure;
      readonly isImportAttribute: (structure: unknown) => structure is ImportAttributeStructure;
      readonly isImportAttributeNamed: <T_22>(structure: T_22) => structure is T_22 & ImportAttributeNamedNodeStructure;
      readonly isImportDeclaration: (structure: unknown) => structure is ImportDeclarationStructure;
      readonly isImportSpecifier: (structure: unknown) => structure is ImportSpecifierStructure;
      readonly isIndexSignature: (structure: unknown) => structure is IndexSignatureDeclarationStructure;
      readonly isReadonlyable: <T_23>(structure: T_23) => structure is T_23 & ReadonlyableNodeStructure;
      readonly isInterface: (structure: unknown) => structure is InterfaceDeclarationStructure;
      readonly isExtendsClauseable: <T_24>(structure: T_24) => structure is T_24 & ExtendsClauseableNodeStructure;
      readonly isTypeElementMembered: <T_25>(structure: T_25) => structure is T_25 & TypeElementMemberedNodeStructure;
      readonly isJSDoc: (structure: unknown) => structure is JSDocStructure;
      readonly isJSDocTag: (structure: unknown) => structure is JSDocTagStructure;
      readonly isJsxAttribute: (structure: unknown) => structure is JsxAttributeStructure;
      readonly isJsxElement: (structure: unknown) => structure is JsxElementStructure;
      readonly isJsxSelfClosingElement: (structure: unknown) => structure is JsxSelfClosingElementStructure;
      readonly isJsxTagNamed: <T_26>(structure: T_26) => structure is T_26 & JsxTagNamedNodeStructure;
      readonly isJsxAttributed: <T_27>(structure: T_27) => structure is T_27 & JsxAttributedNodeStructure;
      readonly isJsxSpreadAttribute: (structure: unknown) => structure is JsxSpreadAttributeStructure;
      readonly isMethodDeclarationOverload: (structure: unknown) => structure is MethodDeclarationOverloadStructure;
      readonly isQuestionTokenable: <T_28>(structure: T_28) => structure is T_28 & QuestionTokenableNodeStructure;
      readonly isOverrideable: <T_29>(structure: T_29) => structure is T_29 & OverrideableNodeStructure;
      readonly isMethod: (structure: unknown) => structure is MethodDeclarationStructure;
      readonly isMethodSignature: (structure: unknown) => structure is MethodSignatureStructure;
      readonly isModule: (structure: unknown) => structure is ModuleDeclarationStructure;
      readonly isModuleNamed: <T_30>(structure: T_30) => structure is T_30 & ModuleNamedNodeStructure;
      readonly isParameter: (structure: unknown) => structure is ParameterDeclarationStructure;
      readonly isBindingNamed: <T_31>(structure: T_31) => structure is T_31 & BindingNamedNodeStructure;
      readonly isTyped: <T_32>(structure: T_32) => structure is T_32 & TypedNodeStructure;
      readonly isScopeable: <T_33>(structure: T_33) => structure is T_33 & ScopeableNodeStructure;
      readonly isPropertyAssignment: (structure: unknown) => structure is PropertyAssignmentStructure;
      readonly isProperty: (structure: unknown) => structure is PropertyDeclarationStructure;
      readonly isExclamationTokenable: <T_34>(structure: T_34) => structure is T_34 & ExclamationTokenableNodeStructure;
      readonly isPropertySignature: (structure: unknown) => structure is PropertySignatureStructure;
      readonly isSetAccessor: (structure: unknown) => structure is SetAccessorDeclarationStructure;
      readonly isShorthandPropertyAssignment: (structure: unknown) => structure is ShorthandPropertyAssignmentStructure;
      readonly isSourceFile: (structure: unknown) => structure is SourceFileStructure;
      readonly isSpreadAssignment: (structure: unknown) => structure is SpreadAssignmentStructure;
      readonly isExpressioned: <T_35>(structure: T_35) => structure is T_35 & ExpressionedNodeStructure;
      readonly isTypeAlias: (structure: unknown) => structure is TypeAliasDeclarationStructure;
      readonly isTypeParameter: (structure: unknown) => structure is TypeParameterDeclarationStructure;
      readonly isVariableDeclaration: (structure: unknown) => structure is VariableDeclarationStructure;
      readonly isVariableStatement: (structure: unknown) => structure is VariableStatementStructure;
  };
export interface KindedStructure<TKind extends StructureKind> {
  kind: TKind;
}
export declare enum StructureKind {
  ImportAttribute = 0,
  CallSignature = 1,
  Class = 2,
  ClassStaticBlock = 3,
  ConstructSignature = 4,
  Constructor = 5,
  ConstructorOverload = 6,
  Decorator = 7,
  Enum = 8,
  EnumMember = 9,
  ExportAssignment = 10,
  ExportDeclaration = 11,
  ExportSpecifier = 12,
  Function = 13,
  FunctionOverload = 14,
  GetAccessor = 15,
  ImportDeclaration = 16,
  ImportSpecifier = 17,
  IndexSignature = 18,
  Interface = 19,
  JsxAttribute = 20,
  JsxSpreadAttribute = 21,
  JsxElement = 22,
  JsxSelfClosingElement = 23,
  JSDoc = 24,
  JSDocTag = 25,
  Method = 26,
  MethodOverload = 27,
  MethodSignature = 28,
  Module = 29,
  Parameter = 30,
  Property = 31,
  PropertyAssignment = 32,
  PropertySignature = 33,
  SetAccessor = 34,
  ShorthandPropertyAssignment = 35,
  SourceFile = 36,
  SpreadAssignment = 37,
  TypeAlias = 38,
  TypeParameter = 39,
  VariableDeclaration = 40,
  VariableStatement = 41
}
export interface TypeAliasDeclarationStructure extends Structure, TypeAliasDeclarationSpecificStructure, NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
  type: string | WriterFunction;
}
interface TypeAliasDeclarationSpecificStructure extends KindedStructure<StructureKind.TypeAlias> {
  type: string | WriterFunction;
}
export interface TypeParameterDeclarationStructure extends Structure, TypeParameterDeclarationSpecificStructure, NamedNodeStructure {
}
interface TypeParameterDeclarationSpecificStructure extends KindedStructure<StructureKind.TypeParameter> {
  isConst?: boolean;
  constraint?: string | WriterFunction;
  default?: string | WriterFunction;
  variance?: TypeParameterVariance;
}
export type OptionalKind<TStructure extends {
      kind?: StructureKind;
  }> = Pick<TStructure, Exclude<keyof TStructure, "kind">> & Partial<Pick<TStructure, "kind">>;
export declare function forEachStructureChild<TStructure>(structures: ReadonlyArray<Structures>, callback: (child: Structures) => TStructure | void): TStructure | undefined;
export declare function forEachStructureChild<TStructure>(structure: Structures, callback: (child: Structures) => TStructure | void): TStructure | undefined;
import { CompilerOptions, DiagnosticCategory, EditorSettings, EmitHint, LanguageVariant, ModuleKind, ModuleResolutionKind, NewLineKind, NodeFlags, ObjectFlags, ScriptKind, ScriptTarget, SymbolFlags, SyntaxKind, TypeFlags, TypeFormatFlags } from "@ts-morph/common";
export { ts, CompilerOptions, DiagnosticCategory, EditorSettings, EmitHint, LanguageVariant, ModuleKind, ModuleResolutionKind, NewLineKind, NodeFlags, ObjectFlags, ScriptKind, ScriptTarget, SymbolFlags, SyntaxKind, TypeFlags, TypeFormatFlags };
export declare class CodeBlockWriter {
  constructor(opts?: Partial<CodeBlockWriterOptions>);
  getOptions(): CodeBlockWriterOptions;
  queueIndentationLevel(indentationLevel: number): this;
  queueIndentationLevel(whitespaceText: string): this;
  hangingIndent(action: () => void): this;
  hangingIndentUnlessBlock(action: () => void): this;
  setIndentationLevel(indentationLevel: number): this;
  setIndentationLevel(whitespaceText: string): this;
  withIndentationLevel(indentationLevel: number, action: () => void): this;
  withIndentationLevel(whitespaceText: string, action: () => void): this;
  getIndentationLevel(): number;
  block(block?: () => void): this;
  inlineBlock(block?: () => void): this;
  indent(times?: number): this;
  indent(block: () => void): this;
  conditionalWriteLine(condition: boolean | undefined, textFunc: () => string): this;
  conditionalWriteLine(condition: boolean | undefined, text: string): this;
  writeLine(text: string): this;
  newLineIfLastNot(): this;
  blankLineIfLastNot(): this;
  conditionalBlankLine(condition: boolean | undefined): this;
  blankLine(): this;
  conditionalNewLine(condition: boolean | undefined): this;
  newLine(): this;
  quote(): this;
  quote(text: string): this;
  spaceIfLastNot(): this;
  space(times?: number): this;
  tabIfLastNot(): this;
  tab(times?: number): this;
  conditionalWrite(condition: boolean | undefined, textFunc: () => string): this;
  conditionalWrite(condition: boolean | undefined, text: string): this;
  write(text: string): this;
  closeComment(): this;
  unsafeInsert(pos: number, text: string): this;
  getLength(): number;
  isInComment(): boolean;
  isAtStartOfFirstLineOfBlock(): boolean;
  isOnFirstLineOfBlock(): boolean;
  isInString(): boolean;
  isLastNewLine(): boolean;
  isLastBlankLine(): boolean;
  isLastSpace(): boolean;
  isLastTab(): boolean;
  getLastChar(): string | undefined;
  endsWith(text: string): boolean;
  iterateLastChars<T>(action: (char: string, index: number) => T | undefined): T | undefined;
  iterateLastCharCodes<T>(action: (charCode: number, index: number) => T | undefined): T | undefined;
  toString(): string;
}
export interface CodeBlockWriterOptions {
  newLine: "\n" | "\r\n";
  indentNumberOfSpaces: number;
  useTabs: boolean;
  useSingleQuote: boolean;
}


Okay, I've reviewed the test cases and merged similar ones, while still ensuring comprehensive coverage of the edge cases. Here's the revised list, with some tests removed and others combined:

**Revised Test Cases (26 - 57):**

**1. Literal Types (26-28)**

*   **Test 26:** Combined Literal Types
    *   **Input:**
        ```ts
        export class MyClass {
            myMethod(input: "on" | "off" | 1 | 2 | true | false): string | number | boolean { return input; }
        }
        ```
    *   **Expected Output:**
        ```ts
        export interface ExposedMethods {
            MyClass: {
                myMethod(input: "on" | "off" | 1 | 2 | true | false): string | number | boolean;
            };
        }
        ```

**2. Union and Intersection Types (27-28)**

*   **Test 27:** Combined Union and Intersection Types
    *   **Input:**
        ```ts
          interface TypeA { a: string }
          interface TypeB { b: number }
        export class MyClass {
            myMethod(input: string | number | TypeA & TypeB): string | number | TypeA & TypeB { return input; }
        }
        ```
    *   **Expected Output:**
        ```ts
        import { TypeA } from '../test-files/test27/temp';
        import { TypeB } from '../test-files/test27/temp';
        export interface ExposedMethods {
          MyClass: {
            myMethod(input: string | number | TypeA & TypeB): string | number | TypeA & TypeB;
          };
        }
        ```
*    **Test 28:** Complex Union Type with multiple imported types
     *   **Input:**
        ```ts
           interface TypeA { a: string }
           interface TypeB { b: number }
         export class MyClass {
             myMethod(input: string | number | TypeA | TypeB): string | number | TypeA | TypeB { return input; }
         }
         ```
    *   **Expected Output:**
        ```ts
        import { TypeA } from '../test-files/test28/temp';
        import { TypeB } from '../test-files/test28/temp';
        export interface ExposedMethods {
            MyClass: {
                myMethod(input: string | number | TypeA | TypeB): string | number | TypeA | TypeB;
            };
        }
        ```

**3. Tuple Types (29-30)**

*   **Test 29:** Combined Tuple Types
    *   **Input:**
        ```ts
        export class MyClass {
          myMethod(input: [string, number] | [string, number?]): [string, number] | [string, number?] {
            return input;
          }
        }
        ```
    *   **Expected Output:**
        ```ts
        export interface ExposedMethods {
          MyClass: {
            myMethod(input: [string, number] | [string, number?]): [string, number] | [string, number?];
          };
        }
        ```
*   **Test 30:** Tuple with Optional and rest
    *   **Input:**
        ```ts
        export class MyClass {
          myMethod(input: [string, number?, ...boolean[]]): [string, number?, ...boolean[]] {
            return input;
          }
        }
        ```
    *   **Expected Output:**
        ```ts
        export interface ExposedMethods {
          MyClass: {
            myMethod(input: [string, number?, ...boolean[]]): [string, number?, ...boolean[]];
          };
        }
        ```

**4. Index Signatures (31-32)**

*   **Test 31:** Index Signatures
    *   **Input:**
        ```ts
        export class MyClass {
            myMethod<T>(input: { [key: string]: number } | { [key: string]: T }): { [key: string]: number } | { [key: string]: T } { return input; }
        }
        ```
    *   **Expected Output:**
        ```ts
        export interface ExposedMethods {
            MyClass: {
                myMethod<T>(input: { [key: string]: number } | { [key: string]: T }): { [key: string]: number } | { [key: string]: T };
            };
        }
        ```
*   **Test 32:** Index signature with symbol and number
    *   **Input:**
        ```ts
        export class MyClass {
            myMethod(input: { [key: number]: string, [key: symbol]: number }): { [key: number]: string, [key: symbol]: number } { return input; }
        }
        ```
    *   **Expected Output:**
        ```ts
        export interface ExposedMethods {
            MyClass: {
                myMethod(input: { [key: number]: string, [key: symbol]: number }): { [key: number]: string, [key: symbol]: number };
            };
        }
        ```

**5. Type Aliases (33-34)**

*   **Test 33:** Type Aliases with and without generics
    *   **Input:**
        ```ts
        type MyAlias = string | number;
        type MyAliasGeneric<T> = T[];
        export class MyClass {
            myMethod<T>(input: MyAlias | MyAliasGeneric<T>): MyAlias | MyAliasGeneric<T> { return input; }
        }
        ```
    *   **Expected Output:**
        ```ts
        import { MyAlias } from '../test-files/test33/temp';
        import { MyAliasGeneric } from '../test-files/test33/temp';
        export interface ExposedMethods {
            MyClass: {
                myMethod<T>(input: MyAlias | MyAliasGeneric<T>): MyAlias | MyAliasGeneric<T>;
            };
        }
        ```
*   **Test 34:** Type Alias with conditional
    *  **Input:**
        ```ts
        type IsString<T> = T extends string ? true : false;
        export class MyClass {
          myMethod<T>(input: T): IsString<T> {
            return (typeof input === "string") as IsString<T>;
          }
        }
        ```
    *  **Expected Output:**
        ```ts
         import { IsString } from '../test-files/test34/temp';
        export interface ExposedMethods {
          MyClass: {
            myMethod<T>(input: T): IsString<T>;
          };
        }
        ```
**6. Enums (35)**

*   **Test 35:** Combined Enums
    *   **Input:**
         ```ts
         export enum Status {
             Active,
             Inactive
         }
         enum OtherStatus {
            Pending,
            Done,
         }
         export class MyClass {
            myMethod(input: Status | OtherStatus): Status | OtherStatus { return input; }
        }
        ```
    *   **Expected Output:**
         ```ts
         import { Status } from '../test-files/test35/temp';
         export interface ExposedMethods {
            MyClass: {
                myMethod(input: Status | OtherStatus): Status | OtherStatus;
            };
        }
        ```
**7. Recursive Types (36-37)**

*   **Test 36:** Recursive Type with and without generics
    *   **Input:**
        ```ts
        export interface Node {
            value: string;
            children: Node[];
        }

        export interface NodeGeneric<T> {
            value: T;
            children: NodeGeneric<T>[];
        }

        export class MyClass {
            myMethod<T>(input: Node | NodeGeneric<T>): Node | NodeGeneric<T> { return input; }
        }
        ```
    *   **Expected Output:**
        ```ts
         import { Node } from '../test-files/test36/temp';
         import { NodeGeneric } from '../test-files/test36/temp';
        export interface ExposedMethods {
            MyClass: {
                myMethod<T>(input: Node | NodeGeneric<T>): Node | NodeGeneric<T>;
            };
        }
        ```
*    **Test 37:** Recursive Type with conditional
      *  **Input:**
        ```ts
          export interface TreeNode<T> {
            value: T;
            children: Array<TreeNode<T>> | undefined;
          }

        export class MyClass {
             myMethod<T>(input: TreeNode<T>): TreeNode<T> { return input; }
        }
        ```
    *   **Expected Output:**
         ```ts
         import { TreeNode } from '../test-files/test37/temp';
         export interface ExposedMethods {
            MyClass: {
                myMethod<T>(input: TreeNode<T>): TreeNode<T>;
            };
        }
         ```

**8. Mapped Types (38-40)**

*   **Test 38:** Mapped Types
    *   **Input:**
        ```ts
         export interface User {
           name: string;
           email: string;
         }

        type ReadonlyUser = {
            readonly [P in keyof User]: User[P];
        };
        type PartialUser = Partial<User>

        export class MyClass {
            myMethod(input: ReadonlyUser | PartialUser): ReadonlyUser | PartialUser { return input; }
        }
        ```
    *   **Expected Output:**
        ```ts
        import { ReadonlyUser } from '../test-files/test38/temp';
        import { PartialUser } from '../test-files/test38/temp';
        export interface ExposedMethods {
            MyClass: {
                myMethod(input: ReadonlyUser | PartialUser): ReadonlyUser | PartialUser;
            };
        }
        ```
*   **Test 39:** Mapped Type with Pick and Omit
    *   **Input:**
        ```ts
         export interface User {
           name: string;
           email: string;
           id: number;
         }
        export class MyClass {
            myMethod(input: Pick<User, "name" | "email"> | Omit<User, "id">): Pick<User, "name" | "email"> | Omit<User, "id"> { return input; }
         }
        ```
     *   **Expected Output:**
        ```ts
        import { User } from '../test-files/test39/temp';
        export interface ExposedMethods {
          MyClass: {
            myMethod(input: Pick<User, "name" | "email"> | Omit<User, "id">): Pick<User, "name" | "email"> | Omit<User, "id">;
          };
        }
        ```
*    **Test 40:** Mapped Type with complex scenario
        *   **Input:**
        ```ts
            export interface User {
            name: string;
            email: string;
            id: number;
            }
            type MyMappedType<T> = {
                [P in keyof T]?: T[P] extends string ? number : T[P]
            }
            export class MyClass {
                myMethod(input: MyMappedType<User>): MyMappedType<User> {
                    return input
                }
            }
            ```
        *  **Expected Output:**
            ```ts
        import { MyMappedType } from '../test-files/test40/temp';
        import { User } from '../test-files/test40/temp';
            export interface ExposedMethods {
                MyClass: {
                    myMethod(input: MyMappedType<User>): MyMappedType<User>;
                };
            }
            ```
**9. Parameter Default Values (41-42)**

*   **Test 41:** Parameter Default Values
    *   **Input:**
        ```ts
        export class MyClass {
            myMethod(input1: string = "default", input2: number = 123, input3: boolean = true): string | number | boolean { return input1 || input2 || input3; }
        }
        ```
    *   **Expected Output:**
        ```ts
        export interface ExposedMethods {
            MyClass: {
                myMethod(input1?: string, input2?: number, input3?: boolean): string | number | boolean;
            };
        }
        ```
*   **Test 42:** Parameter default value and optional
    *   **Input:**
        ```ts
        export class MyClass {
           myMethod(input1: string = "default", input2?: number, input3?: boolean): string | number | boolean { return input1 || input2 || input3; }
        }
        ```
    *  **Expected Output:**
        ```ts
        export interface ExposedMethods {
            MyClass: {
                myMethod(input1?: string, input2?: number, input3?: boolean): string | number | boolean;
            };
        }
        ```
**10. Full Type String with Import (43-48)**

*   **Test 43:** Imported Types
    *   **Input:**
        ```ts
         import { User } from './user';
         import { MyType } from './types';

        export class MyClass {
            myMethod(input1: User, input2: MyType): User | MyType { return input1 || input2; }
        }
        ```
      *   `user.ts`
         ```ts
         export interface User {
           name: string;
           email: string;
         }
         ```
        `types.ts`
        ```ts
        export type MyType = string | number;
        ```
    *   **Expected Output:**
        ```ts
        import { User } from '../test-files/test43/user';
        import { MyType } from '../test-files/test43/types';
        export interface ExposedMethods {
            MyClass: {
                myMethod(input1: User, input2: MyType): User | MyType;
            };
        }
        ```
*   **Test 44:** Explicit Generic Type with Import
     *   **Input:**
        ```ts
        import { MyData } from './types';
        import { MyUnion } from './types';

        export class MyClass {
           myMethod<T>(input: T): MyData<T> | MyUnion {
              return { data: input } ;
           }
        }
        ```
        `types.ts`
        ```ts
        export interface MyData<T> { data: T }
        export type MyUnion = string | number;
        ```
    *   **Expected Output:**
        ```ts
        import { MyData } from '../test-files/test44/types';
        import { MyUnion } from '../test-files/test44/types';
        export interface ExposedMethods {
            MyClass: {
                myMethod<T>(input: T): MyData<T> | MyUnion;
            };
        }
        ```

*   **Test 45:** Explicit Type with Import
    *   **Input:**
        ```ts
         import { MyTuple } from './types';
         import { TypeA, TypeB } from './types';
         import { MyMappedType } from './types';

         export class MyClass {
             myMethod(input1: MyTuple, input2: TypeA & TypeB, input3: MyMappedType): MyTuple | TypeA & TypeB | MyMappedType {
                 return input1 || input2 || input3
             }
         }
        ```
        `types.ts`
        ```ts
        export type MyTuple = [string, number];
        export interface TypeA { a: string }
        export interface TypeB { b: number }
        export type MyMappedType = { [key: string]: number }
        ```
    *   **Expected Output:**
        ```ts
         import { MyTuple } from '../test-files/test45/types';
         import { TypeA } from '../test-files/test45/types';
         import { TypeB } from '../test-files/test45/types';
         import { MyMappedType } from '../test-files/test45/types';
        export interface ExposedMethods {
            MyClass: {
                myMethod(input1: MyTuple, input2: TypeA & TypeB, input3: MyMappedType): MyTuple | TypeA & TypeB | MyMappedType;
            };
        }
        ```
*   **Test 46:** Import with alias
    *   **Input:**
        ```ts
            import { User as MyUser } from './user';
            export class MyClass {
                myMethod(input: MyUser): MyUser {
                    return input
                }
            }
        ```
        `user.ts`
        ```ts
            export interface User {
                name: string;
                email: string
            }
        ```
        *   **Expected Output:**
            ```ts
            import { User as MyUser } from '../test-files/test46/user';
            export interface ExposedMethods {
                MyClass: {
                    myMethod(input: MyUser): MyUser;
                };
            }
            ```
*   **Test 47:** Import with namespace
    *   **Input:**
            ```ts
                import * as MyModule from './user';
                export class MyClass {
                  myMethod(input: MyModule.User): MyModule.User {
                    return input;
                  }
                }
            ```
            `user.ts`
            ```ts
                export interface User {
                    name: string;
                    email: string
                }
            ```
        *   **Expected Output:**
            ```ts
            import * as MyModule from '../test-files/test47/user';
            export interface ExposedMethods {
                MyClass: {
                  myMethod(input: MyModule.User): any;
                };
            }
            ```
*   **Test 48:** Default Import
    * **Input:**
        ```ts
            import MyDefault from './user';
            export class MyClass {
                myMethod(input: MyDefault): MyDefault {
                    return input
                }
            }
        ```
        `user.ts`
        ```ts
          const user = {
            name: 'John',
            email: 'john@example.com'
          }
          export default user
        ```
        * **Expected Output:**
            ```ts
            import MyDefault from '../test-files/test48/user';
            export interface ExposedMethods {
                MyClass: {
                  myMethod(input: any): any;
                };
            }
            ```
**11. Return Type `raw`, `promise`, `observable` (49-51)**

*   **Test 49:** Return Types
    *   **Input:**
        ```ts
         export class MyClass {
             async myMethod1(): Promise<string> {
                return Promise.resolve("test");
            }
             myMethod2() {}
             async myMethod3() {}
             myMethod4(): string { return "test"}
         }
        ```
    *   **Options:** `{ returnType: 'raw' }`
    *   **Expected Output:**
        ```ts
         export interface ExposedMethods {
             MyClass: {
                myMethod1(): Promise<string>;
                myMethod2(): void;
                myMethod3(): Promise<void>;
                myMethod4(): string;
            };
         }
        ```
*   **Test 50:** Return Types with promise
    *   **Input:**
        ```ts
         export class MyClass {
             async myMethod1(): Promise<string> {
                return Promise.resolve("test");
            }
             myMethod2() {}
             async myMethod3() {}
            myMethod4(): string { return "test"}
         }
        ```
    *   **Options:** `{ returnType: 'promise' }`
    *   **Expected Output:**
        ```ts
         export interface ExposedMethods {
             MyClass: {
                myMethod1(): Promise<string>;
                myMethod2(): Promise<void>;
                myMethod3(): Promise<void>;
                myMethod4(): Promise<string>;
            };
         }
        ```

*   **Test 51:** Return Types with observable
    *   **Input:**
        ```ts
         export class MyClass {
             async myMethod1(): Promise<string> {
                return Promise.resolve("test");
            }
             myMethod2() {}
             async myMethod3() {}
            myMethod4(): string { return "test"}
         }
        ```
    *   **Options:** `{ returnType: 'observable' }`
    *   **Expected Output:**
        ```ts
        import { Observable } from 'rxjs';
         export interface ExposedMethods {
             MyClass: {
                myMethod1(): Observable<string>;
                myMethod2(): Observable<void>;
                myMethod3(): Observable<void>;
                myMethod4(): Observable<string>;
            };
         }
        ```

**12. Prototype Chain and Overrides (52-53)**

*   **Test 52:** Combined Prototype Chain and overrides
    *   **Input:**
        ```ts
        export class BaseClass {
           baseMethod1(): string {
             return "base";
           }
           baseMethod2(input: string): string {
             return input
           }
        }

        export class MyClass extends BaseClass {
           baseMethod1(): string {
             return "child";
           }
           myMethod(): string {
                return "child";
            }
            baseMethod2(input: number): number {
                return input;
            }
        }
        ```
    *  **Expected Output:**
        ```ts
        export interface ExposedMethods {
            BaseClass: {
               baseMethod1(): string;
               baseMethod2(input: string): string;
            };
            MyClass: {
               baseMethod1(): string;
               baseMethod2(input: number): number;
               myMethod(): string;
            };
        }
        ```
*   **Test 53:** Prototype Chain with different signatures and types
    *   **Input:**
        ```ts
            export class BaseClass {
                baseMethod(input: string): string {
                    return input;
                }
            }

            export class MyClass extends BaseClass {
              baseMethod(input: number): number {
                 return input;
              }
              myMethod(input: string): string {
                  return input
              }
            }
        ```
   *  **Expected Output:**
        ```ts
        export interface ExposedMethods {
            BaseClass: {
               baseMethod(input: string): string;
            };
            MyClass: {
              baseMethod(input: number): number;
              myMethod(input: string): string;
            };
        }
        ```

**13. Optional Parameters (54-57)**
*   **Test 54:** Optional Parameter
    *   **Input:**
        ```ts
            export class MyClass {
                myMethod(input1?: string, input2?: number, input3?: boolean): string | number | boolean {
                    return input1 || input2 || input3;
                }
            }
        ```
    *  **Expected Output:**
        ```ts
            export interface ExposedMethods {
                MyClass: {
                  myMethod(input1?: string, input2?: number, input3?: boolean): string | number | boolean;
                };
            }
         ```
*   **Test 55:** Optional Parameter with default value
    *   **Input:**
        ```ts
          export class MyClass {
              myMethod(input1: string = "default", input2?: number, input3: boolean = true): string | number | boolean {
                return input1 || input2 || input3;
              }
          }
        ```
    *   **Expected Output:**
        ```ts
          export interface ExposedMethods {
              MyClass: {
                myMethod(input1?: string, input2?: number, input3?: boolean): string | number | boolean;
              };
          }
        ```
*    **Test 56:**  Optional Parameter with union
        *   **Input:**
            ```ts
                export class MyClass {
                    myMethod(input?: string | number): string | number {
                        return input || "";
                    }
                }
            ```
        * **Expected Output:**
            ```ts
                export interface ExposedMethods {
                    MyClass: {
                        myMethod(input?: string | number): string | number;
                    };
                }
            ```
*   **Test 57:** Optional Parameter with literal type
    *  **Input:**
        ```ts
        export class MyClass {
            myMethod(input?: "on" | "off"): string {
                return input || "";
            }
        }
        ```
    *   **Expected Output:**
        ```ts
        export interface ExposedMethods {
            MyClass: {
                myMethod(input?: "on" | "off"): string;
            };
        }
        ```

This revised list should be more concise while covering all necessary scenarios. Let me know if you have any further requests.



give me 31.test.s from above for this. dont forget to use regex and ts-morph assertions

Project: method-types-ts-generator-alvamind
📂 Included Patterns:

main.test.ts

test.interface.ts

19.test.ts

🚫 Excluded Patterns:

/node_modules/

/.git/

**/generate-source.ts

**/.zed-settings.json

**/.vscode/settings.json

**/package-lock.json

**/bun.lockb

/build/

source.md

dist/

README.md

.gitignore

📁 Directory Structure:

test

test/unit

💻 Source Code:

====================

// test/main.test.ts
import { describe, test, beforeAll, afterAll, expect } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateExposedMethodsType } from '../src';
import { Project, InterfaceDeclaration, MethodSignature, TypeParameterDeclaration, ParameterDeclaration } from 'ts-morph';
import { baseTestDir, outputDir, TestCase, TsMorphAssertion } from './test.interface';
import { test1 } from './unit/1.test';
import { test10 } from './unit/10.test';
import { test13 } from './unit/13.test';
import { test14 } from './unit/14.test';
import { test15 } from './unit/15.test';
import { test16 } from './unit/16.test';
import { test17 } from './unit/17.test';
import { test18 } from './unit/18.test';
import { test19 } from './unit/19.test';
import { test2 } from './unit/2.test';
import { test20 } from './unit/20.test';
import { test23 } from './unit/23.test';
import { test24 } from './unit/24.test';
import { test25 } from './unit/25.test';
import { test3 } from './unit/3.test';
import { test4 } from './unit/4.test';
import { test5 } from './unit/5.test';
import { test6 } from './unit/6.test';
import { test7 } from './unit/7.test';
import { test8 } from './unit/8.test';
import { test9 } from './unit/9.test';
import { test21 } from './unit/21.test';
import { test22 } from './unit/22.test';
import { test12 } from './unit/12.test';
import { test11 } from './unit/11.test';
const createTestDir = async () => {
await fs.mkdir(baseTestDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
};
const cleanupTestDir = async () => {
await fs.rm(baseTestDir, { recursive: true, force: true });
await fs.rm(outputDir, { recursive: true, force: true });
};
export const writeTestFile = async (testDir: string, fileName: string, content: string) => {
await fs.writeFile(path.join(testDir, fileName), content, 'utf-8');
};
const readOutputFile = async (outputFile: string) => {
return await fs.readFile(outputFile, 'utf-8');
};
const runTsMorphAssertion = async (outputFile: string, tsMorphAssertion?: TsMorphAssertion) => {
if (!tsMorphAssertion) return { passed: true }
const project = new Project();
project.addSourceFileAtPath(outputFile);
return tsMorphAssertion(project, outputFile);
};
const runTestCase = async (testCase: TestCase) => {
const testCaseDir = path.join(baseTestDir, testCase.id);
await fs.mkdir(testCaseDir, { recursive: true });
const { fileName, content, options } = testCase.input;
await writeTestFile(testCaseDir, fileName, content);
const { outputFileName, assertions, tsMorphAssertion, assertType = 'both' } = testCase.output;
const outputFile = path.join(outputDir, outputFileName);
await generateExposedMethodsType(
{ scanPath: testCaseDir, ...options },
outputFile
);
const output = await readOutputFile(outputFile);
let regexPassed = false;
try {
assertions(output)
regexPassed = true
} catch (e) { }
const tsMorphAssertionResult = await runTsMorphAssertion(outputFile, tsMorphAssertion);
const tsMorphPassed = tsMorphAssertionResult.passed;
const tsMorphMessage = tsMorphAssertionResult.message
let testPassed = false;
if (assertType === 'regex') testPassed = regexPassed;
else if (assertType === 'ts-morph') testPassed = tsMorphPassed;
else testPassed = regexPassed && tsMorphPassed;
let assertionResult = ''
if (assertType === 'regex') assertionResult = Regex Assertion: ${regexPassed ? "Passed" : "Failed"}
else if (assertType === 'ts-morph') assertionResult = Ts-Morph Assertion: ${tsMorphPassed ? "Passed" : "Failed"}
else assertionResult = Regex Assertion: ${regexPassed ? "Passed" : "Failed"}, Ts-Morph Assertion: ${tsMorphPassed ? "Passed" : "Failed"};
if (testPassed) {
console.log(Test Case ${testCase.id}: ${testCase.description} - ${assertionResult});
} else {
console.error(Test Case ${testCase.id}: ${testCase.description} - ${assertionResult} ${tsMorphMessage ? . Error: ${tsMorphMessage} : ''});
}
expect(testPassed).toBe(true)
await fs.rm(testCaseDir, { recursive: true, force: true });
};
describe('Type Generator Test Suite (Parallel)', () => {
beforeAll(createTestDir);
afterAll(cleanupTestDir);
const testCases: TestCase[] = [
test1,
test2,
test3,
test4,
test5,
test6,
test7,
test8,
test9,
test10,
test11,
test12,
test13,
test14,
test15,
test16,
test17,
test18,
test19,
test20,
test21,
test22,
test23,
test24,
test25,
];
for (const testCase of testCases) {
test(testCase.description, async () => {
await runTestCase(testCase);
});
}
});

// test/test.interface.ts
import path from "path";
import { Project } from "ts-morph";
export const baseTestDir = path.join(__dirname, 'test-files');
export const outputDir = path.join(__dirname, 'output');
export interface TestCaseInput {
fileName: string;
content: string;
options?: {
returnType?: 'promise' | 'raw' | 'observable';
};
}
export interface TsMorphAssertionResult {
passed: boolean,
message?: string
}
export type TsMorphAssertion = (project: Project, outputFile: string) => TsMorphAssertionResult
export interface TestCaseOutput {
outputFileName: string;
assertions: (output: string) => void;
tsMorphAssertion?: TsMorphAssertion;
assertType?: 'regex' | 'ts-morph' | 'both';
}
export interface TestCase {
id: string;
description: string;
input: TestCaseInput;
output: TestCaseOutput;
}

// test/unit/19.test.ts
import { expect } from "bun:test";
import { TestCase } from "../test.interface";
import { MethodSignature } from "ts-morph"; export const test19: TestCase = {
id: 'test17',
description: 'Class inheritance',
input: {
fileName: 'temp.ts',
content: export class BaseClass { baseMethod(): string { return "base"; } } export class MyClass extends BaseClass { myMethod(): string { return "child"; } },
},
output: {
outputFileName: 'test17.d.ts',
assertions: (output) => {
expect(output).toMatch(/baseMethod\s*(\s*):\sstring/);
expect(output).toMatch(/myMethod\s(\s*):\s*string/);
},
tsMorphAssertion: (project) => {
const interfaceDeclaration = project.getSourceFileOrThrow('test17.d.ts')?.getInterface('ExposedMethods');
if (!interfaceDeclaration) return { passed: false, message: 'ExposedMethods interface not found' };
const baseClassProperty = interfaceDeclaration.getProperty('BaseClass');
if (!baseClassProperty) return { passed: false, message: 'BaseClass property not found' };
const myClassProperty = interfaceDeclaration.getProperty('MyClass');
if (!myClassProperty) return { passed: false, message: 'MyClass property not found' };
const baseMethod = baseClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'baseMethod')?.getValueDeclaration() as MethodSignature | undefined;
if (!baseMethod) return { passed: false, message: 'baseMethod method not found' };
if (baseMethod.getParameters().length !== 0) return { passed: false, message: Expected 0 parameter for baseMethod, but found ${baseMethod.getParameters().length} };
if (baseMethod.getReturnType().getText() !== 'string') return { passed: false, message: Expected return type string for baseMethod, but found ${baseMethod.getReturnType().getText()} };
const myMethod = myClassProperty.getType().getApparentProperties().find(prop => prop.getName() === 'myMethod')?.getValueDeclaration() as MethodSignature | undefined;
if (!myMethod) return { passed: false, message: 'myMethod method not found' };
if (myMethod.getParameters().length !== 0) return { passed: false, message: Expected 0 parameter for myMethod, but found ${myMethod.getParameters().length} };
if (myMethod.getReturnType().getText() !== 'string') return { passed: false, message: Expected return type string for myMethod, but found ${myMethod.getReturnType().getText()} };
return { passed: true };
}
},
};
