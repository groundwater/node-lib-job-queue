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

// A task event occurs every time a new process starts.
// The process object started is emitted.
job.emitter.on('task', function (proc) {
  console.log('task started');
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stderr);
});

// An exit event occurs every time a child process exists.
// The exit status of the process is emitted.
job.emitter.on('exit', function (status) {
  console.log('task exited with code', status.code);
});

// An end event occurs when the last item in the queue exists.
// If you queue a task *after* an end event, you will have another end event.
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

Calling `abort` irrevocably kills your job, and all tasks associated with it.
The default kill signal is `SIGKILL` because catchable signals are non-deterministic.

You can specify another signal to `abort()` if you like.
