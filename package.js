Package.describe({
  name: 'marvin:talk',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Lightweight direct messaging for Meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'git@github.com:marvinmarnold/talk.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'accounts-base', 'mongo', 'check', 'underscore']);

  api.use('meteorhacks:aggregate@1.3.0')

  api.addFiles(['messages.js', 'threads.js', 'talk.js']);
  api.addFiles('talk-server.js', 'server');

  api.export('Talk');
});

Package.onTest(function(api) {
  api.use(['ecmascript', 'random', 'accounts-password']);
  api.use('tinytest');
  api.use('marvin:talk');
  api.addFiles('talk-tests.js', 'client');
});
