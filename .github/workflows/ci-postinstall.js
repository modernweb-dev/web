const fs = require('fs');
const path = require('path');

const testRunnerBin = path.resolve('packages', 'test-runner', 'dist', 'bin.js');
const projectsDir = path.resolve('demo', 'projects');
const projects = fs.readdirSync(projectsDir);

for (const project of projects) {
  const linkDestination = path.resolve(projectsDir, project, 'node_modules', '.bin', 'wtr');
  fs.linkSync(testRunnerBin, linkDestination);
}
