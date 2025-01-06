**Test 1**

*   **Input:**
    ```ts
    export class MyClass {}
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
      MyClass: {
      };
    }
    ```

**Test 2**

*   **Input:**
    ```ts
    export class MyClass { myMethod(input: string): string { return input} }
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
      MyClass: {
        myMethod(input: string): string;
      };
    }
    ```

**Test 3**

*   **Input:**
    ```ts
    export class MyClass { myMethod(): number { return 1} }
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
      MyClass: {
        myMethod(): number;
      };
    }
    ```

**Test 4**

*   **Input:**
    ```ts
     export interface MyData<T> {
        data: T;
     }
      export class MyClass {
        async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input});}
      }
    ```
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test4/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod(input: string): Promise<MyData<string>>;
      };
    }
    ```

**Test 5**

*   **Input:**
    ```ts
    export interface MyData<T> {
       data: T;
    }
       export class MyClass {
            myMethod<T>(input: T): MyData<T> { return {data: input}}
        }
    ```
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test5/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod<T>(input: T): MyData<T>;
      };
    }
    ```

**Test 6**

*   **Input:**
    ```ts
    export class MyClass {
        myMethod(input?: string): void {}
    }
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
      MyClass: {
        myMethod(input?: string): void;
      };
    }
    ```

**Test 7**

*   **Input:**
    ```ts
    export interface User {
        name: string;
        email: string
    }
    export class MyClass {
        myMethod(user: User): User { return user}
    }
    ```
*   **Expected Output:**
    ```ts
    import { User } from '../test-files/test7/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod(user: User): User;
      };
    }
    ```

**Test 8**

*   **Input:**
    ```ts
    export interface MyData<T> {
       data: T;
    }
      export class MyClass {
        async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
      }
    ```
    *   **Options:** `{ returnType: 'promise' }`
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test8/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod(input: string): Promise<MyData<string>>;
      };
    }
    ```

**Test 9**

*   **Input:**
    ```ts
    export interface MyData<T> {
        data: T;
    }
    export class MyClass {
        async myMethod(input: string): Promise<MyData<string>> { return Promise.resolve({data: input}) }
    }
    ```
    *   **Options:** `{ returnType: 'raw' }`
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test9/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod(input: string): MyData<string>;
      };
    }
    ```

**Test 10**

*   **Input:**
    ```ts
    export interface MyData<T> {
         data: T,
    }
    export class MyClass {
        myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
            return Promise.resolve({data: {input, option}})
        }
    }
    ```
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test10/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod<T, K>(input: T, option: K): Promise<MyData<{ input: T; option: K; }>>;
      };
    }
    ```

**Test 11**

*   **Input:**
    ```ts
    export interface MyData<T> {
         data: T,
    }
    export class MyClass {
        myMethod<T, K>(input: T, option: K): Promise<MyData<{input: T, option: K}>> {
            return Promise.resolve({data: {input, option}})
        }
    }
    ```
    *   **Options:** `{ returnType: 'raw' }`
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test11/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod<T, K>(input: T, option: K): MyData<{ input: T; option: K; }>;
      };
    }
    ```

**Test 12**

*   **Input:**
    *   `user.service.ts`:
        ```ts
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
        ```
    *   `auth.service.ts`:
        ```ts
        import { User } from './user.service';

        export class AuthService {
            login(username: string, password: string): Promise<string> {
                return Promise.resolve("token");
            }

            getLoggedInUser(): Promise<User> {
                return Promise.resolve({ id: 1, name: 'John', email: 'john@example.com' });
            }
        }
        ```
*   **Expected Output:**
    ```ts
    import { User } from '../test-files/test12/user.service';
    export interface ExposedMethods {
      UserService: {
        getUser(id: number): Promise<User>;
        getUsers(): User[];
      };
      AuthService: {
        login(username: string, password: string): Promise<string>;
        getLoggedInUser(): Promise<User>;
      };
    }
    ```

**Test 13**

*   **Input:**
    ```ts
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
    ```
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test13/ai.service';
    export interface ExposedMethods {
      AiService: {
        process(input: string): MyData<string>;
        processWithOption<T>(input: T): MyData<T>;
      };
    }
    ```

**Test 14**

*   **Input:**
    ```ts
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
    ```
    *   **Options:** `{ returnType: 'promise' }`
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test13-promise/ai.service';
    export interface ExposedMethods {
      AiService: {
        process(input: string): Promise<MyData<string>>;
      };
    }
    ```

**Test 15**

*   **Input:**
    ```ts
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
    ```
    *   **Options:** `{ returnType: 'observable' }`
*  **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test13-observable/ai.service';
    import { Observable } from 'rxjs';
    export interface ExposedMethods {
      AiService: {
        process(input: string): Observable<MyData<string>>;
      };
    }
    ```

**Test 16**

*   **Input:**
    ```ts
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
    ```
*   **Expected Output:**
    ```ts
    import { User } from '../test-files/test14/user-update.service';
    export interface ExposedMethods {
      UserService: {
        updateUser(id: number, partialUser: Partial<User>): Promise<User>;
        getFilteredUsers(filter: Pick<User, "name" | "email">): User[];
      };
    }
    ```

**Test 17**

*   **Input:**
    ```ts
    export class MyClass {
      myMethod(input: string = "default"): string {
        return input;
      }
    }
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
      MyClass: {
        myMethod(input?: string): string;
      };
    }
    ```

**Test 18**

*   **Input:**
    ```ts
    export class MyClass {
        myMethod(input: string): string;
        myMethod(input: number): number;
        myMethod(input: string | number): string | number {
        return input;
        }
    }
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
      MyClass: {
        myMethod(input: string): string;
        myMethod(input: number): number;
      };
    }
    ```

**Test 19**

*   **Input:**
    ```ts
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
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
        BaseClass: {
            baseMethod(): string;
        };
        MyClass: {
            myMethod(): string;
        };
    }
    ```

**Test 20**

*   **Input:**
    ```ts
    export interface MyData<T> {
      data: T;
    }

    export class MyClass {
      myMethod<T, K>(input: T, option: K): Promise<MyData<{ input: T; option: K; nested: MyData<K> }>> {
        return Promise.resolve({ data: { input, option, nested: { data: option } } });
      }
    }
    ```
*   **Expected Output:**
    ```ts
    import { MyData } from '../test-files/test18/temp';
    export interface ExposedMethods {
      MyClass: {
        myMethod<T, K>(input: T, option: K): Promise<MyData<{ input: T; option: K; nested: MyData<K>; }>>;
      };
    }
    ```

**Test 21**

*   **Input:**
    ```ts
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
    ```
*   **Expected Output:**
    ```ts
    import { Response } from '../test-files/test21/temp';
    export interface ExposedMethods {
        ApiService: {
            fetchData<T>(url: string): Promise<Response<T>>;
        };
    }
    ```

**Test 22**

*  **Input:**
    ```ts
    export class ConfigService {
        readonly apiUrl: string = "https://api.example.com";

        getConfig(): { apiUrl: string } {
            return { apiUrl: this.apiUrl };
        }
    }
    ```
*   **Expected Output:**
    ```ts
    export interface ExposedMethods {
      ConfigService: {
        getConfig(): { apiUrl: string; };
      };
    }
    ```

**Test 23**

*   **Input:**
    ```ts
    export type IsString<T> = T extends string ? true : false;

    export class TypeChecker {
      checkType<T>(input: T): IsString<T> {
        return (typeof input === "string") as IsString<T>;
      }
    }
    ```
*   **Expected Output:**
    ```ts
    import { IsString } from '../test-files/test23/temp';
    export interface ExposedMethods {
      TypeChecker: {
        checkType<T>(input: T): IsString<T>;
      };
    }
    ```

**Test 24**

*   **Input:**
    ```ts
    export type ReadonlyRecord<K extends keyof any, T> = {
      readonly [P in K]: T;
    };

    export class RecordService {
      createRecord<K extends string, T>(keys: K[], value: T): ReadonlyRecord<K, T> {
        return keys.reduce((acc, key) => ({ ...acc, [key]: value }), {} as ReadonlyRecord<K, T>);
      }
    }
    ```
*   **Expected Output:**
    ```ts
    import { ReadonlyRecord } from '../test-files/test24/temp';
    export interface ExposedMethods {
        RecordService: {
            createRecord<K extends string, T>(keys: K[], value: T): ReadonlyRecord<K, T>;
        };
    }
    ```

**Test 25**

*   **Input:**
    ```ts
    export interface TreeNode<T> {
      value: T;
      children: TreeNode<T>[];
    }

    export class TreeService {
      createTree<T>(value: T, children: TreeNode<T>[] = []): TreeNode<T> {
        return { value, children };
      }
    }
    ```
*   **Expected Output:**
    ```ts
    import { TreeNode } from '../test-files/test25/temp';
    export interface ExposedMethods {
      TreeService: {
        createTree<T>(value: T, children?: TreeNode<T>[]): TreeNode<T>;
      };
    }
    ```

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
