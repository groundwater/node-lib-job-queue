var test   = require('tap').test;

var events = require('events');
var Job    = require('../index.js')();

test("abort with SIGQUIT", function (t) {
  t.plan(2);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'setTimeout(function(){}, 1000)'],
    envs: process.env,
    cwd: process.cwd(),
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
    envs: process.env,
    cwd: process.cwd(),
  }];

  var job = Job.New();

  job.emitter.on('task', function (proc) {
    job.abort();
  });
  job.emitter.on('exit', function (info) {
    t.strictEqual(info.code, null);
    t.equal(info.signal, 'SIGKILL');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});

test("calling abort after end", function (t) {
  t.plan(1);

  var tasks = [{
    exec: process.argv[0],
    args: ['-v'],
    envs: process.env,
    cwd: process.cwd(),
  }];

  var job = Job.New();

  job.emitter.on('end', function (info) {
    job.abort();
  });

  job.emitter.on('abort', function () {
    t.ok(true, 'should emit an abort event');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});

test("calling abort after task event", function (t) {
  t.plan(1);

  var tasks = [{
    exec: process.argv[0],
    args: ['-v'],
    envs: process.env,
    cwd: process.cwd(),
  }];

  var job = Job.New();

  job.emitter.on('task', function () {
    job.abort();
  });

  job.emitter.on('abort', function () {
    t.ok(true, 'should emit an abort event');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});

test("calling abort immediately", function (t) {
  t.plan(2);

  var tasks = [{
    exec: process.argv[0],
    args: ['-v'],
    envs: process.env,
    cwd: process.cwd(),
  }];

  var job = Job.New();

  job.emitter.on('abort', function () {
    t.ok(true, 'should emit an abort event');
  });

  job.abort();

  t.throws(function(){
    job.queue(tasks.shift());
  }, 'cannot queue after abort')
});

test("throws if queueing to aborted queue", function (t) {
  t.plan(1);

  var task = {
    exec: process.argv[0],
    args: ['-v'],
    envs: process.env,
    cwd: process.cwd(),
  };

  var job = Job.New();

  job.emitter.on('task', function (proc) {
    job.abort()
    t.throws(function(){
      job.queue(task)
    }, 'queueing to an aborted queue should throw')
  });

  job.queue(task);
});
