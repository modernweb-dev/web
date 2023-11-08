import { Middleware, Context } from '@web/dev-server-core';
import { DepGraph } from 'dependency-graph';
import debounce from 'debounce';
import path from 'path';
import { FSWatcher } from 'chokidar';

import { TestSessionManager } from '../../test-session/TestSessionManager.js';
import { constants } from '../../index.js';
import { TestSession } from '../../test-session/TestSession.js';

const IGNORED_404s = ['favicon.ico'];
const { PARAM_SESSION_ID } = constants;

export type RunSessions = (sessions: Iterable<TestSession>) => void;

export interface DependencyGraphMiddlewareArgs {
  sessions: TestSessionManager;
  rootDir: string;
  fileWatcher: FSWatcher;
  testFrameworkImport?: string;
  runSessions: RunSessions;
}

function onRerunSessions(
  runSessions: RunSessions,
  sessions: TestSessionManager,
  sessionIds?: string[],
) {
  const sessionsToRerun = sessionIds
    ? (sessionIds
        .map(id => {
          const session = sessions.get(id);
          if (!session && !sessions.getDebug(id)) {
            throw new Error(`Could not find session ${id}`);
          }
          return session;
        })
        .filter(s => s) as TestSession[])
    : sessions.all();
  runSessions(sessionsToRerun);
}

function onRequest404(sessions: TestSessionManager, sessionId: string, url: string) {
  if (sessions.getDebug(sessionId)) {
    return;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Could not find session ${sessionId}`);
  }

  const { request404s } = session;
  if (!request404s.includes(url) && !IGNORED_404s.some(i => url.endsWith(i))) {
    sessions.update({ ...session, request404s: [...request404s, url] });
  }
}

function toFilePath(browserPath: string) {
  return browserPath.replace(new RegExp('/', 'g'), path.sep);
}

export function watchFilesMiddleware({
  rootDir,
  fileWatcher,
  sessions,
  runSessions,
  testFrameworkImport,
}: DependencyGraphMiddlewareArgs): Middleware {
  const fileGraph = new DepGraph({ circular: true });
  const urlGraph = new DepGraph({ circular: true });
  let pendingChangedFiles = new Set<string>();

  function getSessionIdsForPath(path: string) {
    const ids = new Set<string>();

    if (urlGraph.hasNode(path)) {
      for (const dependant of urlGraph.dependantsOf(path)) {
        if (dependant.startsWith('\0')) {
          const url = new URL(dependant.substring(1));
          const id = url.searchParams.get(PARAM_SESSION_ID);
          if (!id) {
            throw new Error('Missing session id parameter');
          }
          ids.add(id);
        }
      }
    }

    return ids;
  }

  function getSessionIdsForFile(file: string) {
    const ids = new Set<string>();

    if (fileGraph.hasNode(file)) {
      for (const dependant of fileGraph.dependantsOf(file)) {
        if (dependant.startsWith('\0')) {
          const url = new URL(dependant.substring(1));
          const id = url.searchParams.get(PARAM_SESSION_ID);
          if (!id) {
            throw new Error('Missing session id parameter');
          }
          ids.add(id);
        }
      }
    }

    return ids;
  }

  function syncRerunSessions() {
    const sessionsToRerun = new Set<string>();

    // search dependants of changed files for test HTML files, and reload only those
    for (const file of pendingChangedFiles) {
      for (const id of getSessionIdsForFile(file)) {
        sessionsToRerun.add(id);
      }
    }

    if (sessionsToRerun.size > 0) {
      // re run specified sessions
      onRerunSessions(runSessions, sessions, Array.from(sessionsToRerun));
    } else {
      // re run alll sessions
      onRerunSessions(runSessions, sessions);
    }

    pendingChangedFiles = new Set<string>();
  }

  const rerunSessions = debounce(syncRerunSessions, 300);

  function onFileChanged(filePath: string) {
    pendingChangedFiles.add(filePath);
    rerunSessions();
  }

  fileWatcher.addListener('change', onFileChanged);
  fileWatcher.addListener('unlink', onFileChanged);

  function addDependencyMapping(ctx: Context, testFrameworkImport?: string) {
    if ((testFrameworkImport && ctx.path === testFrameworkImport) || ctx.path.endsWith('/')) {
      // the test framework or test runner HTML don't need to be tracked
      // we specifcally don't want to track the test framework, because it
      // requests all test files which would mess up the dependancy graph
      return;
    }

    // who is requesting this dependency
    let dependantUrl: URL;
    if (ctx.URL.searchParams.has(PARAM_SESSION_ID)) {
      // if the requested file itself has a session id in the URL, use that as the dependant
      // this way when this file changes, we know session it belongs to
      dependantUrl = ctx.URL;
    } else if (ctx.headers.referer) {
      // most requests contain a referer, the file which requested this file
      dependantUrl = new URL(ctx.headers.referer as string);
    } else {
      // certain files like source maps are fetched without a referer, we skip those
      return;
    }

    const dependencyPath = ctx.path;
    const dependencyUrl = ctx.url;

    const dependantFilePath = dependantUrl.searchParams.has(PARAM_SESSION_ID)
      ? // the dependant is the test file itself,
        // we remember the full href and mark it with a null byte so that
        // later we can extract the session id
        `\0${dependantUrl.href}`
      : // the dependant is a "regular" file, we resolve it to the file path
        path.join(rootDir, toFilePath(dependantUrl.pathname));
    const dependencyFilePath = path.join(rootDir, toFilePath(dependencyPath));
    const dependantPath = dependantUrl.searchParams.has(PARAM_SESSION_ID)
      ? dependantFilePath
      : dependantUrl.pathname;

    fileGraph.addNode(dependantFilePath);
    fileGraph.addNode(dependencyFilePath);
    fileGraph.addDependency(dependantFilePath, dependencyFilePath);

    urlGraph.addNode(dependantPath);
    urlGraph.addNode(dependencyUrl);
    urlGraph.addDependency(dependantPath, dependencyUrl);
  }

  return async (ctx, next) => {
    addDependencyMapping(ctx, testFrameworkImport);

    await next();

    if (ctx.status === 404) {
      for (const sessionId of getSessionIdsForPath(ctx.url)) {
        onRequest404(sessions, sessionId, ctx.url.substring(1));
      }
    }
  };
}
