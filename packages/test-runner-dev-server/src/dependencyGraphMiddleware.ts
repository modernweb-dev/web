import { constants } from '@web/test-runner-core';
import { DepGraph } from 'dependency-graph';
import debounce from 'debounce';
import path from 'path';
import { Middleware } from 'koa';
import { FSWatcher } from 'chokidar';

const { PARAM_SESSION_ID } = constants;

export interface DependencyGraphMiddlewareArgs {
  onRequest404: (sessionId: string, url: string) => void;
  onRerunSessions: (sessionIds: string[]) => void;
  rootDir: string;
  fileWatcher: FSWatcher;
}

function toFilePath(browserPath: string) {
  return browserPath.replace(new RegExp('/', 'g'), path.sep);
}

export function dependencyGraphMiddleware({
  rootDir,
  fileWatcher,
  onRequest404,
  onRerunSessions,
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

    // re run specified sessions
    onRerunSessions(Array.from(sessionsToRerun));

    pendingChangedFiles = new Set<string>();
  }

  const rerunSessions = debounce(syncRerunSessions, 300);

  function onFileChanged(filePath: string) {
    pendingChangedFiles.add(filePath);
    rerunSessions();
  }

  fileWatcher.addListener('change', onFileChanged);
  fileWatcher.addListener('unlink', onFileChanged);

  return async (ctx, next) => {
    let dependantUrl;
    let dependencyPath;
    let dependencyUrl;

    if (ctx.path.endsWith('/')) {
      // If the request is for a HTML file without a file extension, we should set itself as the dependant
      dependantUrl = new URL(ctx.href);
      dependencyPath = `${ctx.path}index.html`;
      dependencyUrl = dependencyPath;
    } else if (!ctx.headers.referer) {
      // certain files like source maps are fetched without a referer, we skip those
      return next();
    } else {
      dependantUrl = new URL(ctx.headers.referer as string);
      dependencyPath = ctx.path;
      dependencyUrl = ctx.url;
    }

    const dependantFilePath = dependantUrl.searchParams.has(PARAM_SESSION_ID)
      ? // the dependant is the test HTML file, we remember the full href and mark it with a null byte
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

    await next();

    if (ctx.status === 404) {
      for (const sessionId of getSessionIdsForPath(ctx.url)) {
        onRequest404(sessionId, ctx.url.substring(1));
      }
    }
  };
}
