var test   = require('tap').test;
var Cat    = require('concat-stream');

var events = require('events');
var Job    = require('../index.js')();

test(function (t) {
  t.plan(1);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'process.exit(1)'],
    envs: process.env
  },{
    exec: process.argv[0],
    args: ['-e', 'console.exit(2)'],
    envs: process.env
  }];

  var job  = Job.New();
  var code = [1, 2];
  job.emitter.on('exit', function (info) {
    t.equal(code.shift(), info.code);
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});

test(function (t) {
  t.plan(1);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'setTimeout(function(){}, 1000)'],
    envs: process.env
  }];

  var job  = Job.New();
  job.emitter.on('task', function (proc) {
    proc.kill('SIGKILL');
  });
  job.emitter.on('exit', function (info) {
    t.equal(info.signal, 'SIGKILL');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});

test(function (t) {
  t.plan(1);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'setTimeout(function(){}, 1000)'],
    envs: process.env
  }];

  var job  = Job.New();
  job.emitter.on('task', function (proc) {
    job.abort();
  });
  job.emitter.on('exit', function (info) {
    t.equal(info.signal, 'SIGKILL');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});

test("last exit should be null before running a job", function (t) {
  t.plan(1);

  var job = Job.New();

  t.strictEqual(job.lastExit, null);
});
