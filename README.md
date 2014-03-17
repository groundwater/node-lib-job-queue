# job queue

## install

```bash
npm install --save lib-job-queue
```

## usage

Run a sequence of **tasks** in order,
where each task is a child process.

```javascript
var Job = require('lib-job-queue')();

var job = Job.New();

job.queue({
  exec: 'ps',
  args: ['aux']
});
job.queue({
  exec: 'ps',
  args: ['-ef']
})

job.emitter.on('task', function () {
  console.log('task started');
});
job.emitter.on('exit', function () {
  console.log('task exited');
});
job.emitter.on('end', function () {
  console.log('job exited');
});
```

Abort a job, killing the in-process task and ending the sequence.

```javascript
job.queue({
  exec: 'node',
  args: ['-e', 'setTimeout(function(){}, 100000)']
});
job.emitter.on('task', function() {
  job.abort();
});
```
