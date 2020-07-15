import * as fs from 'fs';
import * as path from 'path';

const nodePackages = [
  'dev-server-core',
  'dev-server-esbuild',
  'dev-server-rollup',
  'dev-server-legacy',
  'test-runner',
  'test-runner-core',
  'test-runner-cli',
  'test-runner-server',
  'test-runner-chrome',
  'test-runner-puppeteer',
  'test-runner-playwright',
  'test-runner-selenium',
  'test-runner-browserstack',
  'test-runner-coverage-v8',
];
const browserPackages = ['test-runner-browser-lib', 'test-runner-helpers', 'test-runner-mocha'];

const PACKAGE_TSCONFIG = 'tsconfig.json';
const PROJECT_TSCONFIG = 'tsconfig.project.json';
const TSCONFIG_COMMENT = `// GENERATED by update-package-tsconfig\n`;

const packagesRoot = path.join(__dirname, '..', 'packages');

type DirectoryName = string;
type PackageName = string;

const packageJSONMap: Map<
  PackageName,
  {
    name: string;
    dependencies: { [packageName: string]: string };
    devDependencies: { [packageName: string]: string };
  }
> = new Map();

const packageDirnameMap: Map<PackageName, DirectoryName> = new Map();

nodePackages.forEach(packageDirname => {
  const packageJSONPath = path.join(packagesRoot, packageDirname, 'package.json');
  const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  const packageName = packageJSONData.name;
  packageDirnameMap.set(packageName, packageDirname);
  packageJSONMap.set(packageName, packageJSONData);
});

const internalDependencyMap: Map<string, string[]> = new Map();
packageDirnameMap.forEach((_packageDirname, packageName) => {
  const { dependencies, devDependencies } = packageJSONMap.get(packageName)!;

  const internalDependencies = [
    ...(dependencies ? Object.keys(dependencies) : []),
    ...(devDependencies ? Object.keys(devDependencies) : []),
  ].filter(dep => packageDirnameMap.has(dep));

  internalDependencyMap.set(packageName, internalDependencies);
});

function resolveInternalDependencies(dependencies: string[]): string[] {
  const childDeps = [];

  for (const idep of dependencies) {
    const deps = internalDependencyMap.get(idep)!;
    const res = resolveInternalDependencies(deps);
    for (const jdep of res) {
      childDeps.push(jdep);
    }
  }
  const resolved = childDeps.concat(dependencies);
  // remove all duplicated after the first appearance
  return resolved.filter((item, idx) => resolved.indexOf(item) === idx);
}

packageDirnameMap.forEach((packageDirname, packageName) => {
  const tsconfigPath = path.join(packagesRoot, packageDirname, PACKAGE_TSCONFIG);

  const internalDependencies = resolveInternalDependencies(internalDependencyMap.get(packageName)!);
  const tsconfigData = browserPackages.includes(packageDirname)
    ? {
        extends: '../../tsconfig.browser.json',
        compilerOptions: {
          outDir: './dist',
          module: 'ESNext',
          rootDir: './src',
        },
        include: ['src'],
        exclude: ['tests', 'dist'],
      }
    : {
        extends: '../../tsconfig.base.json',
        compilerOptions: {
          outDir: './dist',
          module: 'commonjs',
          rootDir: './src',
          composite: true,
        },
        references: internalDependencies.map(dep => {
          return { path: `../${packageDirnameMap.get(dep)}/${PACKAGE_TSCONFIG}` };
        }),
        include: ['src'],
        exclude: ['tests', 'dist'],
      };
  fs.writeFileSync(tsconfigPath, TSCONFIG_COMMENT + JSON.stringify(tsconfigData, null, '  '));
});

const projectLevelTsconfigPath = path.join(packagesRoot, PROJECT_TSCONFIG);

const projectLevelTsconfigData = {
  files: [],
  references: resolveInternalDependencies(
    Array.from(packageDirnameMap.keys()),
  ).map(packageName => ({ path: `./${packageDirnameMap.get(packageName)}/${PACKAGE_TSCONFIG}` })),
};

fs.writeFileSync(
  projectLevelTsconfigPath,
  TSCONFIG_COMMENT + JSON.stringify(projectLevelTsconfigData, null, '  '),
);
