import fs from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import concurrently from 'concurrently';
import { green, red, yellow } from 'nanocolors';

export function runWorkspacesScripts({ script, concurrency, filteredPackages = [] }) {
  const moduleDir = dirname(fileURLToPath(import.meta.url));

  function findPackagesWithScript(directory) {
    const packages = [];

    for (const name of fs.readdirSync(directory)) {
      if (!filteredPackages.includes(name)) {
        const pkgPath = join(directory, name);
        const pkgJsonPath = join(pkgPath, 'package.json');

        if (fs.existsSync(pkgJsonPath)) {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

          if (pkgJson && pkgJson.scripts && pkgJson.scripts[script]) {
            packages.push(pkgPath);
          }
        }
      }
    }

    return packages;
  }

  const packagesDir = join(moduleDir, '..', 'packages');
  const packagesWithScript = findPackagesWithScript(packagesDir);

  const commands = packagesWithScript.map(pkgPath => ({
    name: basename(pkgPath),
    command: `cd ${pkgPath} && npm run ${script}`,
  }));

  const { result } = concurrently(commands, { maxProcesses: concurrency });
  result
    .then(() => {
      console.log(
        green(
          `Successfully executed command ${yellow(script)} for packages: ${yellow(
            commands.map(c => c.name).join(', '),
          )}`,
        ),
      );
      console.log();
    })
    .catch(error => {
      if (error instanceof Error) {
        console.error(error);
      } else if (Array.isArray(error)) {
        const count = error.filter(error => error !== 0).length;
        console.log('');
        console.log(
          red(
            `Failed to execute command ${yellow(
              script,
            )} for ${count} packages. But we don't know which ones, because concurrently doesn't say.`,
          ),
        );
        console.log();
      }
      process.exit(1);
    });
}
