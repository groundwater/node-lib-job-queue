var test   = require('tap').test;
var os = require('os')
var liquid = require('lib-stream-liquify')
var solid  = require('lib-stream-solidify');
var events = require('events');
var Job    = require('../index.js')();

test("accept stdin argument", function (t) {
  var task = {
    exec: process.argv[0],
    args: ['-e', 'process.stdin.pipe(process.stdout)'],
    envs: process.env,
    cwd: process.cwd(),
    stdio: [{path: __dirname + '/stdio.txt'}]
  };

  var job = Job.New();

  job.emitter.on('task', function (proc) {
    solid(proc.stdout).text(function(e, txt) {
      t.equals(txt, 'STDIO TEST\n')
      t.end();
    })
  });

  job.add(task);
});

test("accept stdout argument", function (t) {
  var tmp = os.tmpdir() + '/lib-job-queue.test';
  var task = {
    exec: process.argv[0],
    args: ['-e', 'process.stdin.pipe(process.stdout)'],
    envs: process.env,
    cwd: process.cwd(),
    stdio: [null, {path: tmp}]
  };

  var job = Job.New();

  job.emitter.on('task', function (proc) {
    liquid({a: 'a'}).pipe(proc.stdin);
  });

  job.emitter.on('exit', function () {
    t.equal(require('fs').readFileSync(tmp).toString(), '{"a":"a"}');
    t.end();
  })

  job.add(task);
});

test("accept stderr argument", function (t) {
  var tmp = os.tmpdir() + '/lib-job-queue.test';
  var task = {
    exec: process.argv[0],
    args: ['-e', 'process.stdin.pipe(process.stderr)'],
    envs: process.env,
    cwd: process.cwd(),
    stdio: [null, null, {path: tmp}]
  };

  var job = Job.New();

  job.emitter.on('task', function (proc) {
    liquid({b: 'b'}).pipe(proc.stdin);
  });

  job.emitter.on('exit', function () {
    t.equal(require('fs').readFileSync(tmp).toString(), '{"b":"b"}');
    t.end();
  })

  job.add(task);
});

test("accept stdin, stdout argument", function (t) {
  var tmp = os.tmpdir() + '/lib-job-queue.test';
  var task = {
    exec: process.argv[0],
    args: ['-e', 'process.stdin.pipe(process.stdout)'],
    envs: process.env,
    cwd: process.cwd(),
    stdio: [{path: __dirname + '/stdio.txt'}, {path: tmp}]
  };

  var job = Job.New();

  job.emitter.on('exit', function () {
    t.equal(require('fs').readFileSync(tmp).toString().trim(), 'STDIO TEST');
    t.end();
  })

  job.add(task);
});
