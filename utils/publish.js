/**
 * This exists because README is not published to npm when doing
 * lerna publish. And it is a bug upstream with npm and not with lerna
 *
 * https://github.com/lerna/lerna/issues/64
 * https://github.com/npm/newww/issues/389
 */

const fs = require('fs');
const path = require('path');
const lerna = require('lerna');
const npm = require('lerna/lib/NpmUtilities');
const git = require('lerna/lib/GitUtilities');

const packagesDir = path.join(__dirname, '../packages');

// function runVersion(cb) {
//   const PublishCommand = lerna.__commands__.publish;
//   const flags = {
//     skipNpm: true
//   };
//   const publish = new PublishCommand([], flags);
//   publish.runValidations();
//   publish.runPreparations();
//   publish._attempt('initialize', () => {
//     publish._attempt('execute', () => {
//       cb();
//     });
//   });
// }

function runPublish(cb) {
  const UpdatedCommand = lerna.__commands__.updated;

  const updated = new UpdatedCommand([], {});
  updated.runPreparations();
  updated.initialize(function () {

    let published = 0;
    let errors = [];
    let outputs = [];

    updated.updates.forEach(update => {
      const dir = update.package.location;
      const tag = 'latest';
      npm.publishTaggedInDir(tag, dir, function (err, out) {
        errors.push(err);
        outputs.push(out);
        published++;

        if (published >= updated.updates.length) {
          cb(errors, outputs, updated.updates);
        }
      });
    });
  });
}

function run() {
  let updates = [];
  const primaryPackage = 'babel-minify';

  runPublish(function (errors, outputs, updates) {
    errors.forEach(err => {
      if (err) throw err;
    });
    outputs.forEach(out => console.log(out));

    let primaryPresent = false;
    let primary = null;
    for (let i of updates) {
      if (updates[i].package.name === primaryPackage) {
        primaryPresent = true;
        primary = updates[i];
        break;
      }
    }

    if (primaryPresent) {
      const tag = `v${primary.package.version}`;
      git.addTag(tag);
      git.pushWithTags([tag]);
    } else {
      const tags = updates.map(update =>
        `${update.package.name}@${update.package.version}`
      );
      tags.forEach(tag => git.addTag(tag));
      git.pushWithTags(tags);
    }
  });
}

if (require.main === module) {
  run();
}
