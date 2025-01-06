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
import { test26 } from './unit/26.test';
import { test27 } from './unit/27.test';
import { test28 } from './unit/28.test';
import { test29 } from './unit/29.test';
import { test30 } from './unit/30.test';
import { test31 } from './unit/31.test';




// --- Functions ---
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
  if (assertType === 'regex') assertionResult = `Regex Assertion: ${regexPassed ? "Passed" : "Failed"}`
  else if (assertType === 'ts-morph') assertionResult = `Ts-Morph Assertion: ${tsMorphPassed ? "Passed" : "Failed"}`
  else assertionResult = `Regex Assertion: ${regexPassed ? "Passed" : "Failed"}, Ts-Morph Assertion: ${tsMorphPassed ? "Passed" : "Failed"}`;

  if (testPassed) {
    console.log(`Test Case ${testCase.id}: ${testCase.description} - ${assertionResult}`);
  } else {
    console.error(`Test Case ${testCase.id}: ${testCase.description} - ${assertionResult} ${tsMorphMessage ? `. Error: ${tsMorphMessage}` : ''}`);
  }
  expect(testPassed).toBe(true)

  await fs.rm(testCaseDir, { recursive: true, force: true });
};






















// --- Test Suite ---
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
    test26,
    test27,
    test28,
    test29,
    test30,
    test31

  ];

  for (const testCase of testCases) {
    test(testCase.description, async () => {
      await runTestCase(testCase);
    });
  }
});
