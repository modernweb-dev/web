/* eslint-disable */
import fs from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import concurrently from 'concurrently';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const script = process.argv[process.argv.length - 1];

function findPackagesWithScript(directory) {
  const packages = [];

  for (const name of fs.readdirSync(directory)) {
    const pkgPath = join(directory, name);
    const pkgJsonPath = join(pkgPath, 'package.json');

    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

      if (pkgJson && pkgJson.scripts && pkgJson.scripts[script]) {
        packages.push(pkgPath);
      }
    }
  }

  return packages;
}

const packagesDir = join(moduleDir, '..', 'packages');
const demoDir = join(moduleDir, '..', 'demo', 'projects');

const packagesWithScript = [
  ...findPackagesWithScript(packagesDir),
  ...findPackagesWithScript(demoDir),
];

const commands = packagesWithScript.map(pkgPath => ({
  name: basename(pkgPath),
  command: `cd ${pkgPath} && yarn ${script}`,
}));

concurrently(commands, { maxProcesses: 10 });
