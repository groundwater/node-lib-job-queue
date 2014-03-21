var test   = require('tap').test;

var events = require('events');
var Job    = require('../index.js')();

test("abort with SIGQUIT", function (t) {
  t.plan(2);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'setTimeout(function(){}, 1000)'],
    envs: process.env
  }];

  var job = Job.New();

  job.emitter.on('task', function (proc) {
    job.abort('SIGQUIT');
  });
  job.emitter.on('exit', function (info) {
    t.strictEqual(info.code, null);
    t.equal(info.signal, 'SIGQUIT');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});

test("abort with SIGKILL", function (t) {
  t.plan(2);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'setTimeout(function(){}, 1000)'],
    envs: process.env
  }];

  var job = Job.New();

  job.emitter.on('task', function (proc) {
    job.abort('SIGKILL');
  });
  job.emitter.on('exit', function (info) {
    t.strictEqual(info.code, null);
    t.equal(info.signal, 'SIGKILL');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});
