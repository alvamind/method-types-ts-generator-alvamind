#!/usr/bin/env bun

import 'reflect-metadata';
import { generateExposedMethodsType } from '../src/index';
import chalk from 'chalk';
import * as path from "path";

interface CliOptions {
  targetDir: string;
  excludeFiles?: string[];
  outputFile: string;
  returnType?: 'promise' | 'observable' | 'raw';
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: Partial<CliOptions> = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      switch (key) {
        case 'targetDir':
          options.targetDir = value;
          break;
        case 'excludeFiles':
          options.excludeFiles = value.split(',');
          break;
        case 'outputFile':
          options.outputFile = value;
          break;
        case 'returnType':
          if (['promise', 'observable', 'raw'].includes(value)) {
            options.returnType = value as CliOptions['returnType'];
          }
          break;
      }
    }
  }

  if (!options.targetDir) {
    console.error(chalk.red('Error: --targetDir is required'));
    process.exit(1);
  }

  if (!options.outputFile) {
    console.error(chalk.red('Error: --outputFile is required'));
    process.exit(1);
  }

  if (!options.returnType) {
    options.returnType = 'raw';
  }

  return options as CliOptions;
}


async function main() {
  console.log(chalk.blue.bold('\n=== Method Types Generator ==='));
  try {
    const options = parseArgs();
    console.log(chalk.cyan('Configuration:'));
    console.log(chalk.gray(`Target Directory: ${options.targetDir}`));
    console.log(chalk.gray(`Exclude Patterns: ${options.excludeFiles?.join(', ') || 'none'}`));
    console.log(chalk.gray(`Output File: ${options.outputFile}`));
    console.log(chalk.gray(`Return Type: ${options.returnType}\n`));


    await generateExposedMethodsType(
      {
        scanPath: options.targetDir,
        excludeFiles: options.excludeFiles,
        returnType: options.returnType,
      },
      options.outputFile,
    );


    console.log(chalk.green.bold(`\n✓ Successfully generated type definitions`));
    console.log(chalk.gray(`Output: ${path.resolve(options.outputFile)}\n`));
  } catch (error) {
    console.error(chalk.red.bold('\nError generating type definitions:'));
    console.error(chalk.red(error));
    process.exit(1);
  }
}

main();
