/**
 * Copyright 2018 Google Inc. All rights reserved.
 * Modifications copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Ported from Playwright 1.56 `crAccessibility.ts` and `accessibility.ts`, which
 * Playwright 1.57 removed. Changes: only the `interestingOnly: true` mode, and
 * the tree is read through a public CDP session.
 */
import type { playwright } from '@web/test-runner-playwright';

interface AXValue {
  value?: unknown;
}

interface AXNode {
  nodeId: string;
  backendDOMNodeId?: number;
  role?: AXValue;
  name?: AXValue;
  description?: AXValue;
  value?: AXValue;
  properties?: { name: string; value: AXValue }[];
  childIds?: string[];
}

interface TreeNode {
  payload: AXNode;
  role: string;
  name: string;
  children: TreeNode[];
  richlyEditable: boolean;
  editable: boolean;
  focusable: boolean;
  hidden: boolean;
  hasFocusableChild?: boolean;
}

export interface A11ySnapshotNode {
  role: string;
  name: string;
  value?: string | number;
  children?: A11ySnapshotNode[];
  [property: string]: unknown;
}

const CONTROL_ROLES = new Set([
  'button',
  'checkbox',
  'ColorWell',
  'combobox',
  'DisclosureTriangle',
  'listbox',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'radio',
  'scrollbar',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
  'tree',
]);

const LEAF_ROLES = new Set([
  'doc-cover',
  'graphics-symbol',
  'img',
  'Meter',
  'scrollbar',
  'slider',
  'separator',
  'progressbar',
]);

const TEXT_ROLES = new Set(['LineBreak', 'text', 'InlineTextBox', 'StaticText']);

// The key order follows the snapshot of Playwright 1.56.
const STRING_PROPERTIES = ['description', 'keyshortcuts', 'roledescription', 'valuetext'];
const BOOLEAN_PROPERTIES = [
  'disabled',
  'expanded',
  'focused',
  'modal',
  'multiline',
  'multiselectable',
  'readonly',
  'required',
  'selected',
];
const NUMBER_PROPERTIES = ['level', 'valuemin', 'valuemax'];
const TOKEN_PROPERTIES = ['autocomplete', 'haspopup', 'invalid', 'orientation'];

let rootCounter = 0;

function createNode(payload: AXNode): TreeNode {
  const node: TreeNode = {
    payload,
    role: payload.role ? String(payload.role.value) : 'Unknown',
    name: payload.name ? String(payload.name.value) : '',
    children: [],
    richlyEditable: false,
    editable: false,
    focusable: false,
    hidden: false,
  };
  for (const { name, value } of payload.properties || []) {
    if (name === 'editable') {
      node.richlyEditable = value.value === 'richtext';
      node.editable = true;
    }
    if (name === 'focusable') node.focusable = !!value.value;
    if (name === 'hidden') node.hidden = !!value.value;
  }
  return node;
}

function hasFocusableChild(node: TreeNode): boolean {
  if (node.hasFocusableChild === undefined) {
    node.hasFocusableChild = node.children.some(
      child => child.focusable || hasFocusableChild(child),
    );
  }
  return node.hasFocusableChild;
}

function isPlainTextField(node: TreeNode) {
  if (node.richlyEditable) return false;
  if (node.editable) return true;
  return node.role === 'textbox' || node.role === 'ComboBox' || node.role === 'searchbox';
}

function isLeafNode(node: TreeNode) {
  if (!node.children.length) return true;
  if (isPlainTextField(node) || TEXT_ROLES.has(node.role)) return true;
  if (LEAF_ROLES.has(node.role)) return true;
  if (hasFocusableChild(node)) return false;
  if (node.focusable && node.role !== 'WebArea' && node.role !== 'RootWebArea' && node.name) {
    return true;
  }
  return node.role === 'heading' && !!node.name;
}

function isInteresting(node: TreeNode, insideControl: boolean) {
  if (node.role === 'Ignored' || node.hidden) return false;
  if (node.focusable || node.richlyEditable) return true;
  if (CONTROL_ROLES.has(node.role)) return true;
  if (insideControl) return false;
  return isLeafNode(node) && !!node.name;
}

function collectInterestingNodes(
  collection: Set<TreeNode>,
  node: TreeNode,
  insideControl: boolean,
) {
  if (isInteresting(node, insideControl)) collection.add(node);
  if (isLeafNode(node)) return;
  const childInsideControl = insideControl || CONTROL_ROLES.has(node.role);
  for (const child of node.children) {
    collectInterestingNodes(collection, child, childInsideControl);
  }
}

function toTristate(value: unknown) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return 'mixed';
}

function serializeNode(node: TreeNode): A11ySnapshotNode {
  const properties = new Map<string, unknown>();
  for (const { name, value } of node.payload.properties || []) {
    properties.set(name.toLowerCase(), value.value);
  }
  if (node.payload.description) {
    properties.set('description', node.payload.description.value);
  }

  let role = node.role;
  if (role === 'RootWebArea') role = 'WebArea';
  if (role === 'StaticText') role = 'text';
  const result: A11ySnapshotNode = {
    role,
    name: node.payload.name ? String(node.payload.name.value || '') : '',
  };
  for (const key of STRING_PROPERTIES) {
    if (properties.has(key)) result[key] = properties.get(key);
  }
  for (const key of BOOLEAN_PROPERTIES) {
    if (key === 'focused' && (node.role === 'WebArea' || node.role === 'RootWebArea')) continue;
    if (properties.get(key)) result[key] = properties.get(key);
  }
  if (properties.has('checked')) result.checked = toTristate(properties.get('checked'));
  if (properties.has('pressed')) result.pressed = toTristate(properties.get('pressed'));
  for (const key of NUMBER_PROPERTIES) {
    if (properties.has(key)) result[key] = properties.get(key);
  }
  for (const key of TOKEN_PROPERTIES) {
    const value = properties.get(key);
    if (value && value !== 'false') result[key] = value;
  }
  return result;
}

function serializeTree(node: TreeNode, interestingNodes: Set<TreeNode>): A11ySnapshotNode[] {
  const children = node.children.flatMap(child => serializeTree(child, interestingNodes));
  if (!interestingNodes.has(node)) return children;
  const result = serializeNode(node);
  if (children.length) result.children = children;
  const value = node.payload.value?.value;
  if (typeof value === 'string' || typeof value === 'number') result.value = value;
  return [result];
}

/**
 * Returns the same accessibility snapshot as `page.accessibility.snapshot()` in
 * Playwright 1.56, which Playwright 1.57 removed. Works in Chromium only.
 */
export async function chromiumA11ySnapshot(
  page: playwright.Page,
  root?: playwright.ElementHandle | null,
): Promise<A11ySnapshotNode | null> {
  const cdp = await page.context().newCDPSession(page);
  try {
    let rootBackendNodeId: number | undefined;
    if (root) {
      // An element handle belongs to the CDP session of Playwright. Pass the
      // element through a global to get its object ID in this session.
      rootCounter += 1;
      const key = `__wtrA11ySnapshotRoot${rootCounter}`;
      await root.evaluate((element, globalKey) => {
        (globalThis as Record<string, unknown>)[globalKey] = element;
      }, key);
      const { result } = await cdp.send('Runtime.evaluate', {
        expression: `(() => { const element = globalThis.${key}; delete globalThis.${key}; return element; })()`,
      });
      const { node } = await cdp.send('DOM.describeNode', { objectId: result.objectId });
      rootBackendNodeId = node.backendNodeId;
    }

    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const nodeById = new Map<string, TreeNode>(
      (nodes as AXNode[]).map(payload => [payload.nodeId, createNode(payload)]),
    );
    for (const node of nodeById.values()) {
      for (const childId of node.payload.childIds || []) {
        const child = nodeById.get(childId);
        if (child) node.children.push(child);
      }
    }
    const tree = nodeById.values().next().value;
    if (!tree) return null;

    let needle: TreeNode | undefined;
    if (root) {
      needle = [...nodeById.values()].find(
        node => node.payload.backendDOMNodeId === rootBackendNodeId,
      );
    }
    const interestingNodes = new Set<TreeNode>();
    collectInterestingNodes(interestingNodes, tree, false);
    if (root && (!needle || !interestingNodes.has(needle))) return null;
    return serializeTree(needle || tree, interestingNodes)[0] ?? null;
  } finally {
    await cdp.detach();
  }
}
