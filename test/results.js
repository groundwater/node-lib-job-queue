var test   = require('tap').test;

var events = require('events');
var Job    = require('../index.js')();

test(function (t) {
  t.plan(5);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'process.exit(1)'],
    envs: process.env
  },{
    exec: process.argv[0],
    args: ['-e', 'process.exit(1)'],
    envs: process.env
  }];

  var info = new events.EventEmitter();
  var job  = Job.NewWithEmitter(info);

  info.on('task', function (proc) {
    t.ok(proc);
  });
  info.on('exit', function (task) {
    var _task = job.results[job.results.length -1];
    // task should be last results item
    t.equal(task, _task);
    t.equal(task.code, 1);
    t.ifError(task.signal);
  });
  info.on('end', function () {
    // should be two results items
    t.equal(job.results.length, 2);
  });

  while( tasks.length > 0) job.queue(tasks.shift());

});
