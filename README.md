# ⚡️ method-types-ts-generator-alvamind ⚡️

## The Ultimate TypeScript Method Type Generator

[![npm version](https://badge.fury.io/js/method-types-ts-generator-alvamind.svg)](https://badge.fury.io/js/method-types-ts-generator-alvamind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Tired of manually writing TypeScript types for your methods? Say no more! `method-types-ts-generator-alvamind` is here to automate that tedious process, saving you time and headaches. This library scans your TypeScript files, extracts method signatures, and generates a ready-to-use `.d.ts` file with all the types for your exposed methods. Whether you're building microservices, complex applications, or anything in between, this tool will boost your productivity and ensure type safety.

## ✨ Features & Benefits

*   **Effortless Type Generation:** Automatically creates TypeScript definitions from your code.
*   **Deep Scanning:** Recursively traverses your directories to find all relevant `.ts` files.
*   **Handles Complex Types:** Supports generics, promises, optional parameters, and more!
*   **Customizable Output:** Control where the generated `.d.ts` file is saved.
*   **Clean & Readable Output:** The generated types are formatted for maximum clarity.
*   **Boosts Productivity:** Eliminate the need to manually maintain method types.
*   **Ensures Type Safety:** Catch potential type errors at compile-time, not runtime.
*   **Easy to Use:** Simple CLI interface makes it a breeze to integrate into your projects.
*   **Framework Agnostic:** Works with any TypeScript project.
*   **Open Source & Free:** Contribute to the project and use it without restrictions.

## 🚀 Getting Started

### Installation

```bash
bun add method-types-ts-generator-alvamind
```

or

```bash
npm install method-types-ts-generator-alvamind
```

### Basic Usage

```bash
method-types-ts-generator-alvamind generate <scanPath> <outputPath>
```

*   `<scanPath>`: The path to the directory containing your TypeScript files.
*   `<outputPath>`: The path to where you want the generated `.d.ts` file.

#### Example

Let's say you have a directory `src/services` with a file like `userService.ts`:

```typescript
// src/services/userService.ts
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  async getUser(id: number): Promise<User> {
      // Some implementation here
      return { id, name: "John Doe", email: "john@example.com" };
  }

  async createUser(name: string, email:string): Promise<User>{
    // Some implementation here
      return { id: 1, name: name, email: email };
  }

    async updateUser(id:number, user: Partial<User>): Promise<User> {
         // Some implementation here
        return { ...user, id: id} as User
    }
}
```

To generate type definitions, run:

```bash
method-types-ts-generator-alvamind generate ./src/services ./src/generated/exposed-methods.d.ts
```

This will create a file named `exposed-methods.d.ts` in the `src/generated` directory with following content.

```typescript
// Auto-generated by method-types-ts-generator-alvamind

export interface ExposedMethods {
  UserService: {
    getUser(id: number): Promise<User>;
    createUser(name: string, email: string): Promise<User>;
    updateUser(id: number, user: Partial<User>): Promise<User>;
  };
}

```

Now you can import and use these types in your project!

```typescript
import { ExposedMethods } from './src/generated/exposed-methods';

async function main() {
  const userService = {} as ExposedMethods['UserService']

  const user = await userService.getUser(1);
  console.log(user)
}
main()
```

### Advanced Usage

*   **Nested Directories:** `method-types-ts-generator-alvamind` can scan nested directories to generate types for all your services.
*   **Custom Output Path:** You can specify a custom output path for your generated type definitions.
*  **Generics, Promises, Optionals:** The generator handles all of these types with ease.

## ⚙️ How it Works (Under the Hood)

The magic behind `method-types-ts-generator-alvamind` involves several steps:

1.  **Scanning:** It uses the TypeScript compiler API to scan the directory you provide and identifies all `.ts` files.
2.  **Parsing:** It parses each file to find class declarations and methods within those classes.
3.  **Extraction:** It extracts the name and parameter types for each method, including return types.
4.  **Type Generation:** It generates TypeScript interface that represents the structure of the scanned methods.
5. **Output:** Finally it writes the generated type definitions to a `.d.ts` file in the output location.

## 🗺️ Roadmap

*   **v1.0.0**: Initial release with basic functionality.
*   **v1.1.0**: Support for filtering classes/methods with decorators.
*   **v1.2.0**: Configurable naming patterns for generated interfaces.
*   **v1.3.0**: Support for comments and jsDoc in generated types.
*   **v1.4.0**: Watch mode, automatically regenerate types on file changes.

   * We welcome suggestions and contributions. Please check the "Open Contribution" section below.

## 🤝 Open Contribution

We welcome and encourage contributions to the project! If you have any ideas, bug reports, or feature requests, please submit them as issues. If you would like to contribute to the code, please follow these steps:

1.  Fork the repository.
2.  Create a new branch with your changes.
3.  Submit a pull request with a clear explanation of your changes.
4.  Ensure your code adheres to the projects code style.

## 💖 Support & Donation

`method-types-ts-generator-alvamind` is an open-source project that we dedicate our time to create. If you find it useful, consider supporting us with a donation! Your support enables us to keep the project maintained, add new features, and support the open-source community.

*   **GitHub Sponsors:** [Link to GitHub Sponsors](https://github.com/sponsors/alvamind)
*   **Buy us a coffee:** [Link to donation page](https://www.buymeacoffee.com/alvamind)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

If you have any questions or feedback, please feel free to contact us.

*   Email: [alvaminddigital@gmail.com](mailto:alvaminddigital@gmail.com)
*   GitHub: [Alvamind GitHub](https://github.com/alvamind)

Let's build awesome things together! 🚀
