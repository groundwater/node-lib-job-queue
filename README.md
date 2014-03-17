# job queue

[![Build Status](https://travis-ci.org/groundwater/node-lib-job-queue.png?branch=master)](https://travis-ci.org/groundwater/node-lib-job-queue)
[![NPM version](https://badge.fury.io/js/lib-job-queue.png)](http://badge.fury.io/js/lib-job-queue)

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
  args: ['aux'],
  envs: process.env
});

job.queue({
  exec: 'ps',
  args: ['-ef'],
  envs: process.env
})

job.emitter.on('task', function (proc) {
  console.log('task started');
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
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
  args: ['-e', 'setTimeout(function(){}, 100000)'],
  envs: process.env
});

job.queue({
  exec: 'node',
  args: ['-e', 'setTimeout(function(){}, 100000)'],
  envs: process.env
});

job.emitter.on('task', function() {
  // this aborts immediately
  job.abort();
});
```
