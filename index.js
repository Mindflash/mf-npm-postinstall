'use strict';

const fs = require('fs');
const path = require('path');
const colors = require('colors');
const execSync = require('child_process').execSync;

const plainPackage = fs.readFileSync('./package.json');
const cwd = process.cwd();

let { dependencies, devDependencies } = JSON.parse(plainPackage);
let linkedDeps = 0, depsToLink = 0;

Object.assign(dependencies, devDependencies);

console.log(`Linking dependencies...\n\n`.underline.magenta);

const npmVer = parseInt(execSync(`npm -v`).toString().replace(/\./g, ''));

if (isNaN(npmVer)) {
  throw new Error('Could not detect npm version');
}

// npm@5.1.0 or above is required (https://github.com/npm/npm/issues/17257)
if (npmVer < 510) {
  console.log(`Warn: npm@5.1.0 or above is required. Skipping linking.`.bold.red);
  process.exit(0);
}

for (let key in dependencies) {
  if (dependencies[key].includes("github.com:Mindflash")) {
    depsToLink++;

    const mfPath = path.resolve(`${cwd}/..`);

    try {
      fs.accessSync(`${mfPath}/${key}`);
    }
    catch (exc) {
      console.error(`\u2716 ${key} - is missing. Make sure you clone it first!`.bold.red);
      continue;
    }

    try {
      execSync(`rm -r ${cwd}/node_modules/${key} && ln -s ${mfPath}/${key} ./node_modules`);
    }
    catch (exc) {
      console.error(`\u2716 ${key} wasn't linked`.bold.red);
      continue;
    }

    linkedDeps++;
    console.log(`\u2714 ${key}`.green);
  }
}

if (linkedDeps === depsToLink) {
  console.log(`\n\n${linkedDeps} / ${depsToLink} linked`.green);
  console.log(fs.readFileSync(__dirname + '/ascii-success.txt').toString().magenta);
}
else {
  console.log(`\n\n${linkedDeps} / ${depsToLink} linked\n`.red);
  console.log(fs.readFileSync(__dirname + '/ascii-failure.txt').toString().red);
  process.exit(1);
}
