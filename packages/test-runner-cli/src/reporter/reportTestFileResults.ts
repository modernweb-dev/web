import { TestSession } from '@web/test-runner-core';
import chalk from 'chalk';
import { relative } from 'path';
import { reportTestsErrors } from './reportTestsErrors';
import { reportBrowserLogs } from './reportBrowserLogs';
import { reportRequest404s } from './reportRequest404s';
import { reportTestFileErrors } from './reportTestFileErrors';
import { SourceMapFunction } from '../utils/createSourceMapFunction';
import { BufferedLogger } from './BufferedLogger';

export async function reportTestFileResults(
  logger: BufferedLogger,
  testFile: string,
  allBrowserNames: string[],
  favoriteBrowser: string,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sessionsForTestFile: TestSession[],
  sourceMapFunction: SourceMapFunction,
) {
  const failedSessions = sessionsForTestFile.filter(s => !s.passed);

  await reportBrowserLogs(
    logger,
    sessionsForTestFile,
    rootDir,
    stackLocationRegExp,
    sourceMapFunction,
  );
  reportRequest404s(logger, sessionsForTestFile);
  await reportTestFileErrors(
    logger,
    allBrowserNames,
    favoriteBrowser,
    sessionsForTestFile,
    rootDir,
    stackLocationRegExp,
    sourceMapFunction,
  );

  if (failedSessions.length > 0) {
    await reportTestsErrors(
      logger,
      allBrowserNames,
      favoriteBrowser,
      failedSessions,
      rootDir,
      stackLocationRegExp,
      sourceMapFunction,
    );
  }

  if (logger.buffer.length > 0) {
    logger.buffer.unshift({
      method: 'log',
      args: [`${chalk.bold(chalk.cyanBright(relative(process.cwd(), testFile)))}:\n`],
    });
  }
}
