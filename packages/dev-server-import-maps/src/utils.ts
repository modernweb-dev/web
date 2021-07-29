import picoMatch from 'picomatch';
import { Context, getHtmlPath } from '@web/dev-server-core';
import { Element as ElementAst } from 'parse5';
import { getAttribute } from '@web/parse5-utils';
import { ParsedImportMap } from '@import-maps/resolve';

import { NormalizedInjectSetting, InjectSetting } from './importMapsPlugin';

export const IMPORT_MAP_PARAM = 'wds-import-map';

function createMatchers(inject: InjectSetting) {
  if (!inject.include && !inject.exclude) {
    return { include: picoMatch('**/*') };
  }

  return {
    include: inject.include ? picoMatch(inject.include) : undefined,
    exclude: inject.exclude ? picoMatch(inject.exclude) : undefined,
  };
}

export function normalizeInjectSetting(
  setting?: InjectSetting | InjectSetting[],
): NormalizedInjectSetting[] {
  if (setting == null) {
    return [];
  }

  const injectedImportMaps = Array.isArray(setting) ? setting : [setting];
  return injectedImportMaps.map(i => ({ importMap: i.importMap, ...createMatchers(i) }));
}

export function shouldInject(path: string, setting: NormalizedInjectSetting) {
  // Treat directory paths such as `/foo/` as `/foo/index.html`
  const normalizedPath = path.endsWith('/') ? `${path}index.html` : path;
  const included = !setting.include || setting.include(normalizedPath);
  const excluded = setting.exclude && setting.exclude(normalizedPath);
  return included && !excluded;
}

export function mergeImportMaps(a: ParsedImportMap, b: ParsedImportMap) {
  const merged: ParsedImportMap = {
    imports: {
      ...a.imports,
      ...b.imports,
    },
    scopes: a.scopes ? { ...a.scopes } : undefined,
  };

  if (b.scopes) {
    if (!merged.scopes) {
      merged.scopes = {};
    }

    for (const [key, value] of Object.entries(b.scopes)) {
      merged.scopes[key] = {
        ...merged.scopes[key],
        ...value,
      };
    }
  }
  return merged;
}

export function withImportMapIdParam(path: string, id: string) {
  const suffix = `${IMPORT_MAP_PARAM}=${id}`;
  const hasParams = new URL(path, 'http://localhost/').searchParams.toString() === '';
  return hasParams ? `${path}?${suffix}` : `${path}&${suffix}`;
}

export function getDocumentBaseUrl(context: Context, baseNode?: ElementAst | null) {
  if (baseNode) {
    const baseHref = getAttribute(baseNode, 'href');
    if (typeof baseHref === 'string') {
      // there was a <base href="..."> on the page
      return new URL(baseHref, context.URL.href);
    }
  }

  // there was no <base href="...">, use the path
  return new URL('./', context.URL.href);
}

export function getRequestImportMapId(
  context: Context,
  importMapsIdsByHtmlPath: Map<string, number>,
) {
  if (context.response.is('html')) {
    // for HTML files get the import map based on the HTML path
    const htmlPath = getHtmlPath(context.path);
    const importMapId = importMapsIdsByHtmlPath.get(htmlPath);
    // console.log({
    //   path: context.path,
    //   htmlPath,
    //   importMapId,
    //   keys: Array.from(importMapsIdsByHtmlPath.keys()),
    // });
    if (importMapId == null) {
      return;
    }
    return String(importMapId);
  }

  // for other files get the import map id from the module's query params
  return context.URL.searchParams.get(IMPORT_MAP_PARAM);
}
