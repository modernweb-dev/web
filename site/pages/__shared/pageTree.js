import { PageTree } from '@rocket/engine';

export const pageTree = new PageTree();
await pageTree.restore(new URL('../pageTreeData.rocketGenerated.json', import.meta.url));
