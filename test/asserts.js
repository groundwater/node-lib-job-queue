var test   = require('tap').test;
var Job    = require('../index.js')();

var node   = process.argv[0];

test(function (t) {

  var job = Job.New();

  t.throws(function () {
    job.queue();
  });

  t.throws(function () {
    job.queue({});
  });

  t.throws(function () {
    job.queue({exec: node});
  });

  t.throws(function() {
    job.queue({exec: node, args: []})
  });

  t.end();
});
