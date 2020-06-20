/* eslint-disable */
const fs = require('fs-extra');
const path = require('path');

/**
 * Script to update a single dependency on the monorepo. Example:
 *
 * yarn update-dependency rollup ^1.2.3
 */

const isDefined = _ => !!_;
const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies'];

const [, , pkg, version] = process.argv;

if (!pkg || !version) {
  throw new Error(
    'Package and version must be specified. For example: yarn update-dependency rollup ^1.2.3',
  );
}

function forEachParallel(items, callback) {
  return Promise.all(items.map(callback));
}

async function run() {
  const basedir = path.resolve(__dirname, '..');
  const dirs = [
    ...(await fs.readdir(path.join(basedir, 'packages'))).map(dir => path.join('packages', dir)),
    ...(await fs.readdir(path.join(basedir, 'demo', 'projects'))).map(dir =>
      path.join('demo', 'projects', dir),
    ),
  ];

  const rootPackageJsonPath = path.join(basedir, 'package.json');
  const readRootPackageJsonTask = fs.readJSON(rootPackageJsonPath, 'utf-8');

  // read all project package.json
  let packageJsons = await Promise.all(
    dirs.map(async dir => {
      const packageJsonPath = path.join(basedir, dir, 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) return null;
      const content = await fs.readJSON(packageJsonPath, 'utf-8');
      return { content, path: packageJsonPath };
    }),
  );
  packageJsons = packageJsons.filter(isDefined);

  // read root package json
  const rootPackageJson = await readRootPackageJsonTask;
  packageJsons.push({ content: rootPackageJson, path: rootPackageJsonPath });

  // update package.json files
  await forEachParallel(packageJsons, async ({ content: packageJson, path: packageJsonPath }) => {
    let changed = false;

    for (const field of dependencyFields) {
      if (packageJson[field] && pkg in packageJson[field]) {
        packageJson[field][pkg] = version;
        changed = true;
      }
    }

    if (changed) {
      console.log('updating package.json in ', packageJsonPath);
      await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
    }
  });
}

run().catch(e => {
  console.error(e);
});
