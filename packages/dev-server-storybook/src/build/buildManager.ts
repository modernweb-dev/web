import { createRollupConfig } from './createRollupConfig';
import { buildAndWrite } from './buildAndWrite';
import { MainJs } from '../shared/readStorybookConfig';
import { createManagerHtml } from '../shared/createManagerHtml';

interface BuildmanagerParams {
  outputDir: string;
  mainJs: MainJs;
}

export async function buildManager(params: BuildmanagerParams) {
  const managerHtml = createManagerHtml(params.mainJs);
  const config = createRollupConfig({
    outputDir: params.outputDir,
    indexFilename: 'index.html',
    indexHtmlString: managerHtml,
  });

  await buildAndWrite(config);
}
