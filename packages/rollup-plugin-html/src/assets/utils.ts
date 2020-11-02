import { Document, Node } from 'parse5';
import path from 'path';
import { findElements, getTagName, getAttribute } from '@web/parse5-utils';
import { createError } from '../utils';
import { serialize } from 'v8';

const hashedLinkRels = ['stylesheet'];
const linkRels = [...hashedLinkRels, 'icon', 'manifest', 'apple-touch-icon', 'mask-icon'];

function isAsset(node: Node) {
  let path = '';
  switch (getTagName(node)) {
    case 'img':
      path = getAttribute(node, 'src') ?? '';
      break;
    case 'link':
      if (linkRels.includes(getAttribute(node, 'rel') ?? '')) {
        path = getAttribute(node, 'href') ?? '';
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

export function isHashedAsset(node: Node) {
  switch (getTagName(node)) {
    case 'img':
      return true;
    case 'link':
      return hashedLinkRels.includes(getAttribute(node, 'rel')!);
    default:
      return false;
  }
}

export function resolveAssetFilePath(browserPath: string, htmlDir: string, projectRootDir: string) {
  return path.join(
    browserPath.startsWith('/') ? projectRootDir : htmlDir,
    browserPath.split('/').join(path.sep),
  );
}

export function getSourceAttribute(node: Node) {
  switch (getTagName(node)) {
    case 'img': {
      return 'src';
    }
    case 'link': {
      return 'href';
    }
    default:
      throw new Error(`Unknown node with tagname ${getTagName(node)}`);
  }
}

export function getSourcePath(node: Node) {
  const key = getSourceAttribute(node);
  const src = getAttribute(node, key);
  if (typeof key !== 'string' || src === '') {
    throw createError(`Missing attribute ${key} in element ${serialize(node)}`);
  }
  return src as string;
}

export function findAssets(document: Document) {
  return findElements(document, isAsset);
}
