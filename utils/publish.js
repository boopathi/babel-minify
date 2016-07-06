/**
 * This exists because README is not published to npm when doing
 * lerna publish. And it is a bug upstream with npm and not with lerna
 *
 * https://github.com/lerna/lerna/issues/64
 * https://github.com/npm/newww/issues/389
 */

const lerna = require('lerna');
const npm = require('lerna/lib/NpmUtilities');
// const git = require('lerna/lib/GitUtilities');

// function runVersion(cb) {
//   const PublishCommand = lerna.__commands__.publish;
//   const flags = {
//     skipNpm: true,
//     skipGit: true,
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
  const PublishCommand = lerna.__commands__.publish;
  const flags = {
    skipNpm: true,
    skipGit: true,
  };
  const publish = new PublishCommand([], flags);
  publish.runValidations();
  publish.runPreparations();

  publish.initialize(function (err) {
    if (err) throw err;

    publish.updateUpdatedPackages();

    publish.updates.forEach(update => {
      const dir = update.package.location;
      const tag = 'latest';
      npm.publishTaggedInDir(tag, dir, function (err, out) {
        cb(err, out, update, publish);
      });
    });
  });
}

function run() {
  runPublish(function (err, out /*, update*/) {
    /* eslint-disable no-console */
    // console.log(update.package.name, update.package.version);
    if (err) return console.error(err.toString());
    console.log(out.toString());
    /* eslint-enable */
  });
}

if (require.main === module) {
  run();
}
