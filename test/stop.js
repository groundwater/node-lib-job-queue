var test   = require('tap').test;

var events = require('events');
var Job    = require('../index.js')();

test('can abort', function (t) {
  t.plan(3);

  var tasks = [{
    exec: process.argv[0],
    args: ['-e', 'setTimeout(function(){}, 100)'],
    envs: process.env,
    cwd: process.cwd(),
  },{
    exec: 'FAIL',
    args: ['-v'],
    envs: process.env,
    cwd: process.cwd(),
  }];

  var info = new events.EventEmitter();
  var job  = Job.NewWithEmitter(info);

  info.on('task', function (task) {
    t.ok(task);

    job.abort();
  });
  info.on('exit', function (task) {
    t.ok(task);
  });
  info.on('end', function () {
    t.ok(true, 'should exit');
  });

  while( tasks.length > 0) job.add(tasks.shift());

});
