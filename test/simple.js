var test   = require('tap').test;

var events = require('events');
var Job    = require('../index.js')();

test(function (t) {
  t.plan(5);

  var tasks = [{
    exec: process.argv[0],
    args: ['-v'],
    envs: process.env,
    cwd: process.cwd(),
  },{
    exec: process.argv[0],
    args: ['-v'],
    envs: process.env,
    cwd: process.cwd(),
  }];

  var info = new events.EventEmitter();
  var job  = Job.NewWithEmitter(info);

  info.on('task', function (proc) {
    t.ok(proc);
  });
  info.on('exit', function (task) {
    t.ok(task);
  });
  info.on('end', function () {
    t.ok(true);
  });

  while( tasks.length > 0) job.queue(tasks.shift());

});
