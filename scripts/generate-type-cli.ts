#!/usr/bin/env bun
import 'reflect-metadata';
import { generateTypeCli } from '../src/index';
const args = process.argv.slice(2);
const scanPath = args[1];
const outputPath = args[2];
if (args[0] !== 'generate') {
  console.error('Invalid command, usage: method-types-ts-generator-alvamind generate <scanPath> <outputPath>')
  process.exit(1)
}
if (!scanPath) {
  console.error('scanPath is required')
  process.exit(1)
}
generateTypeCli(scanPath, outputPath).then(() => {
  console.log('Type generate successfully')
}).catch((error: any) => {
  console.error(error)
});
