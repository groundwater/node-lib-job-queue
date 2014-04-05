var test   = require('tap').test;
var Cat    = require('concat-stream');

var events = require('events');
var Job    = require('../index.js')();

test(function (t) {
  t.plan(3);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'console.log("hello world")'],
    envs: process.env,
    cwd: process.cwd(),
  }];

  var job  = Job.New();

  job.emitter.on('task', function (proc) {
    var sum = Cat(function(data) {
      t.equal(data.toString(), 'hello world\n');
    });
    proc.stdout.pipe(sum);
  });
  job.emitter.on('exit', function (task) {
    t.ok(task, 'should exit');
  });
  job.emitter.on('end', function () {
    t.ok(true, 'should end');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});
