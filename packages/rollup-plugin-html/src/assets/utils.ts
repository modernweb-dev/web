import { Document, Element } from 'parse5';
import path from 'path';
import { findElements, getTagName, getAttribute } from '@web/parse5-utils';
import { createError } from '../utils';
import { serialize } from 'v8';

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

function isAsset(node: Element) {
  let path = '';
  switch (getTagName(node)) {
    case 'img':
      path = getAttribute(node, 'src') ?? '';
      break;
    case 'source':
      if (getAttribute(node, 'src')) {
        path = getAttribute(node, 'src') ?? '';
      } else {
        path = extractFirstUrlOfSrcSet(node) ?? '';
      }
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
      return false;
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

export function isHashedAsset(node: Element) {
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

export function getSourceAttribute(node: Element) {
  switch (getTagName(node)) {
    case 'img': {
      return 'src';
    }
    case 'source': {
      return getAttribute(node, 'src') ? 'src' : 'srcset';
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
      throw new Error(`Unknown node with tagname ${getTagName(node)}`);
  }
}

export function getSourcePaths(node: Element) {
  const key = getSourceAttribute(node);

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

export function findAssets(document: Document) {
  return findElements(document, isAsset);
}
