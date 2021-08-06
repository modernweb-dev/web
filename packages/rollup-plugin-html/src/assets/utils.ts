import { Document, Node, DefaultTreeNode } from 'parse5';
import path from 'path';
import {
  findElements,
  getTagName,
  getAttribute,
  findNodes,
  DefaultTreeElement,
  getTemplateContent,
  getChildNodes,
} from '@web/parse5-utils';
import { createError } from '../utils';
import { serialize } from 'v8';
import { TagAndAttribute } from '../RollupPluginHTMLOptions';

const hashedLinkRels = ['stylesheet'];
const linkRels = [...hashedLinkRels, 'icon', 'manifest', 'apple-touch-icon', 'mask-icon'];

function getSrcSetUrls(srcset: string) {
  if (!srcset) {
    return [];
  }
  const srcsetParts = srcset.includes(',') ? srcset.split(',') : [srcset];
  const urls = srcsetParts
    .map(url => url.trim())
    .map(url => (url.includes(' ') ? url.split(' ')[0] : url));
  return urls;
}

function extractFirstUrlOfSrcSet(node: Element) {
  const srcset = getAttribute(node, 'srcset');
  if (!srcset) {
    return '';
  }
  const urls = getSrcSetUrls(srcset);
  return urls[0];
}

function isAsset(node: Node, extractAssets?: boolean | TagAndAttribute[]) {
  let path = '';
  switch (getTagName(node)) {
    case 'img':
      path = getAttribute(node, 'src') ?? '';
      break;
    case 'source':
      path = extractFirstUrlOfSrcSet(node) ?? '';
      break;
    case 'link':
      if (linkRels.includes(getAttribute(node, 'rel') ?? '')) {
        path = getAttribute(node, 'href') ?? '';
      }
      break;
    case 'meta':
      if (getAttribute(node, 'property') === 'og:image' && getAttribute(node, 'content')) {
        path = getAttribute(node, 'content') ?? '';
      }
      break;
    case 'script':
      if (getAttribute(node, 'type') !== 'module' && getAttribute(node, 'src')) {
        path = getAttribute(node, 'src') ?? '';
      }
      break;
    default:
      if (Array.isArray(extractAssets)) {
        const attr = extractAssets.find(({ tagName }) => tagName === getTagName(node))?.attribute;
        path = attr ? getAttribute(node, attr) ?? '' : '';
      }
  }
  if (!path) {
    return false;
  }
  try {
    new URL(path);
    return false;
  } catch (e) {
    return true;
  }
}

export function isHashedAsset(node: Node, extractAssets?: boolean | TagAndAttribute[]) {
  switch (getTagName(node)) {
    case 'img':
      return true;
    case 'source':
      return true;
    case 'script':
      return true;
    case 'link':
      return hashedLinkRels.includes(getAttribute(node, 'rel')!);
    case 'meta':
      return true;
    default:
      if (Array.isArray(extractAssets)) {
        return Boolean(extractAssets.find(({ tagName }) => tagName === getTagName(node)));
      }
      return false;
  }
}

export function resolveAssetFilePath(
  browserPath: string,
  htmlDir: string,
  projectRootDir: string,
  absolutePathPrefix?: string,
) {
  const _browserPath =
    absolutePathPrefix && browserPath[0] === '/'
      ? '/' + path.posix.relative(absolutePathPrefix, browserPath)
      : browserPath;
  return path.join(
    _browserPath.startsWith('/') ? projectRootDir : htmlDir,
    _browserPath.split('/').join(path.sep),
  );
}

export function getSourceAttribute(node: Node, extractAssets?: boolean | TagAndAttribute[]) {
  switch (getTagName(node)) {
    case 'img': {
      return 'src';
    }
    case 'source': {
      return 'srcset';
    }
    case 'link': {
      return 'href';
    }
    case 'script': {
      return 'src';
    }
    case 'meta': {
      return 'content';
    }
    default:
      if (Array.isArray(extractAssets)) {
        const attr = extractAssets.find(({ tagName }) => tagName === getTagName(node))?.attribute;
        if (attr) {
          return attr;
        }
      }
      throw new Error(`Unknown node with tagname ${getTagName(node)}`);
  }
}

export function getSourcePaths(node: Node, extractAssets?: boolean | TagAndAttribute[]) {
  const key = getSourceAttribute(node, extractAssets);
  const src = getAttribute(node, key);
  if (typeof key !== 'string' || src === '') {
    throw createError(`Missing attribute ${key} in element ${serialize(node)}`);
  }

  let paths: string[] = [];
  if (src) {
    paths = key !== 'srcset' ? [src] : getSrcSetUrls(src);
  }

  return paths;
}

function findAllElements(
  nodes: Node | Node[],
  test: (node: Node) => boolean,
  elements: DefaultTreeElement[] = [],
): DefaultTreeElement[] {
  elements.push(...findElements(nodes, test));
  const templates = findNodes(
    nodes,
    (node: DefaultTreeNode) => node.nodeName === 'template',
  ) as Element[];
  for (const template of templates) {
    elements.push(...findAllElements(getChildNodes(getTemplateContent(template)), test));
  }
  return elements;
}

export function findAssets(document: Document, extractAssets?: boolean | TagAndAttribute[]) {
  function isAssetInjected(node: Node) {
    return isAsset(node, extractAssets);
  }
  return findAllElements(document, isAssetInjected);
}
