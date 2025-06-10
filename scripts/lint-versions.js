#!/usr/bin/env node
const { readdirSync, existsSync, readFileSync, writeFileSync } = require('fs');

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(pathMeta => pathMeta.isDirectory())
    .map(pathMeta => pathMeta.name);

function readPackageJsonDeps(filePath) {
  if (existsSync(filePath)) {
    const jsonData = JSON.parse(readFileSync(filePath, 'utf-8'));
    const merged = { ...jsonData.dependencies, ...jsonData.devDependencies };
    const result = {};
    Object.keys(merged).forEach(dep => {
      if (merged[dep] && !merged[dep].includes('file:')) {
        result[dep] = merged[dep];
      }
    });
    return result;
  }
  return {};
}

function readPackageJsonNameVersion(filePath) {
  if (existsSync(filePath)) {
    const jsonData = JSON.parse(readFileSync(filePath, 'utf-8'));
    const result = {};
    result[jsonData.name] = `^${jsonData.version}`;
    return result;
  }
  return {};
}

function compareVersions(versionsA, versionsB) {
  let output = {};
  const newVersions = { ...versionsA };
  Object.keys(versionsB).forEach(dep => {
    if (versionsA[dep] && versionsB[dep] && versionsA[dep] !== versionsB[dep]) {
      output[dep] = [versionsA[dep], versionsB[dep]];
    }
    if (!newVersions[dep]) {
      newVersions[dep] = versionsB[dep];
    }
  });

  return {
    output,
    newVersions,
  };
}

let currentVersions = readPackageJsonDeps('./package.json');
let endReturn = 0;

// find all versions in the monorepo
for (const subPackage of getDirectories('./packages')) {
  const filePath = `./packages/${subPackage}/package.json`;
  currentVersions = { ...currentVersions, ...readPackageJsonNameVersion(filePath) };
}

const fixes = new Map();

// lint all versions in packages
for (const subPackage of getDirectories('./packages')) {
  const filePath = `./packages/${subPackage}/package.json`;
  const subPackageVersions = readPackageJsonDeps(filePath);
  const { output, newVersions } = compareVersions(currentVersions, subPackageVersions);
  currentVersions = { ...newVersions };
  const entries = Object.entries(output);
  if (entries.length) {
    fixes.set(filePath, output);
    console.log(`Version mismatches found in "${filePath}":`);
    console.log(
      entries.reduce(
        (acc, [dep, [should, is]]) => `${acc}  - "${dep}" should be "${should}" but is "${is}"\n`,
        '',
      ),
    );
    console.log();
    endReturn = 1;
  }
}

function fixJSON(filePath, changes) {
  const json = JSON.parse(readFileSync(filePath, 'utf8'));
  for (const [dep, [should]] of Object.entries(changes)) {
    json.dependencies[dep] = should;
  }
  writeFileSync(filePath, JSON.stringify(json, null, 2));
}

if (fixes.size && process.argv.includes('--fix')) {
  for (const [filePath, changes] of fixes) {
    fixJSON(filePath, changes);
  }
  console.log('package.json files updated, run `npm install`');
}

if (endReturn === 0) {
  console.log('All versions are aligned 💪');
}

process.exit(endReturn);
