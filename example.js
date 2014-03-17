var events = require('events');
var Job    = require('./index.js')();

var tasks = [{
  exec: process.argv[0],
  args: ['-e', 'setTimeout(function(){}, 500)']
},{
  exec: process.argv[0],
  args: ['-e', 'setTimeout(function(){}, 500)']
}];

var info = new events.EventEmitter();
var job  = Job.NewWithEmitter(info);

info.on('error', console.log);
info.on('task', function (task) {
  console.log('startin task', task);
});
info.on('exit', function (task) {
  console.log('task exited', task);
});
info.on('end', function () {
  console.log('done job');
});

while( tasks.length > 0) job.queue(tasks.shift());
