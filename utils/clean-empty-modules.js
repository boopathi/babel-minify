const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const exec = require('child_process').execSync;

module.exports = cleanEmptyModules;

if (require.main === module) {
  cleanEmptyModules();
}

function cleanEmptyModules(root = path.join(__dirname, '../')) {
  const emptyMods = getEmptyModules(root);

  const gitStatus = exec('git status --porcelain', {
    cwd: root,
    timeout: 5000
  });

  const untrackedMods = gitStatus.toString()
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.indexOf('??') === 0)
    .map(line => line.split('??')[1].trim())
    .filter(file => file.indexOf('packages') === 0)
    .map(file => path.resolve(path.join(root, file)))

  const toRemove = emptyMods
    .map(mod => path.resolve(path.join(root, 'packages', mod)))
    .filter(mod => untrackedMods.indexOf(mod) === -1);

  toRemove.forEach(mod => {
    rimraf.sync(mod);
  });

  const warning = 'The following packages were not removed becuase there are some untracked files in it\n'
    + untrackedMods.join('\n');

  return {
    removedAbs: toRemove,
    removed: toRemove.map(mod => path.relative(path.join(root, 'packages'), mod)),
    keptAbs: untrackedMods,
    kept: untrackedMods.map(mod => path.relative(path.join(root, 'packages'), mod)),
    warning
  };
}

function getEmptyModules(root) {
  return fs
    .readdirSync(path.join(root, 'packages'))
    .filter(mod => isDir(path.join(root, 'packages', mod)))
    .filter(mod => {
      if (isFile(path.join(root, 'packages', mod, 'package.json'))) {
        // not empty
        return false;
      } else if (isFile(path.join(root, 'packages', mod, 'index.js'))) {
        // not empty
        return false;
      }
      // empty module
      return true;
    });
}

function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (e) {
    return false;
  }
}

function isDir(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (e) {
    return false;
  }
}
