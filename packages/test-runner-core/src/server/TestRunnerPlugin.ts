import { Plugin } from '@web/dev-server-core';
import { BasicTestSession } from '../test-session/BasicTestSession';

export type ExecuteCommandResult = void | unknown | Promise<void> | Promise<unknown>;

export interface ExecuteCommandArgs<TPayload> {
  command: string;
  payload?: TPayload;
  session: BasicTestSession;
}

export interface TestRunnerPlugin<TPayload = unknown> extends Plugin {
  executeCommand?(args: ExecuteCommandArgs<TPayload>): ExecuteCommandResult;
}
