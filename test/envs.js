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
    args: ['-e', 'console.log("EXIT:", process.env._LAST_EXIT)'],
    envs: process.env
  }];

  var job  = Job.New();

  var i = 0;
  job.emitter.on('task', function (proc) {
    if (i++ == 0) return;

    var sum = Cat(function(data) {
      t.equal(data.toString(), 'EXIT: 1\n');
    });
    proc.stdout.pipe(sum);
  });

  while( tasks.length > 0) job.queue(tasks.shift());
});
