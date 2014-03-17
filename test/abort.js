var test   = require('tap').test;

var events = require('events');
var Job    = require('../index.js')();

test(function (t) {
  t.plan(1);

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
    t.equal(info.signal, 'SIGQUIT');
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});
