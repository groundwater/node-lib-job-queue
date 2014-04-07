/*

  Main Class

*/

function Job(require) {
  this.require = require;
  this.emitter = null;

  this.pending = [];
  this.current = null;
  this.results = [];

  this.running = true;

  this.lastExit= null;
}


/*

  Methods

*/

Job.prototype.queue = function jobQueue(task) {
  var taskType = this.require.JobTypes.task;
  this.pending.push(taskType.marshal(task));

  // move this to nextTick because the 'emit task' in
  // next() should probably be called asynchronously
  //
  // TODO: i don't have a test around this
  process.nextTick(next.bind(this));
};

Job.prototype.abort = function jobAbort(signal) {
  var method  = signal || 'SIGKILL';

  this.running = false;
  if (this.current) this.current.kill(method)

  this.emitter.emit('abort');
};


/*

  Private Methods

*/

function clone(obj) {
  var out = {};

  Object.keys(obj).forEach(function cloneEachKey(key) {
    out[key] = obj[key];
  })

  return out;
}

function makeProc(task, lastExit) {
  var spawn = this.require.Spawn;
  var exec = task.exec;
  var args = task.args;
  var envs = task.envs;
  var stds = task.stdio;
  var opts = {
    stdio: 'pipe',
    env  : clone(envs),
    cwd  : task.cwd,
  };

  opts.env._LAST_EXIT = lastExit;

  var proc = spawn(exec, args, opts);

  var stdio, path;
  if (stds && (stdio = stds[0]) && (path = stdio.path)) {
    var readStr = this.require.read(path);
    readStr.pipe(proc.stdin);
  }

  if (stds && (stdio = stds[1]) && (path = stdio.path)) {
    var writeStr = this.require.write(path);
    proc.stdout.pipe(writeStr);
  }

  if (stds && (stdio = stds[2]) && (path = stdio.path)) {
    var writeStr = this.require.write(path);
    proc.stderr.pipe(writeStr);
  }

  return proc;
}

function next() {
  var job = this;

  if (job.pending.length == 0) return;
  if (!job.running)            return;
  if (job.current)             return;

  var task = job.pending.shift();

  job.current = makeProc.call(job, task, job.lastExit);
  job.current.on('exit', function jobOnExit(code, signal) {
    job.lastExit = code || signal || 0;
    job.current  = null;

    // create exit stanza
    var info = {
      code   : code,
      signal : signal
    };

    // exit stanza needs to be in the results pile
    // before we emit an exit event
    job.results.push(info);

    job.emitter.emit('exit', info);

    // stop if there are no more tasks in the queue
    var hasNext = (job.pending.length > 0) && job.running;
    if (hasNext) next.call(job);
    else         job.emitter.emit('end');
  });

  job.emitter.emit('task', job.current);
}


/*

  Constructors

*/

Job.New = function JobNew() {
  var emitter = new this.Emitter();
  return this.NewWithEmitter(emitter);
}

Job.NewEmpty = function JobNewEmpty() {
  return new Job(this);
}

Job.NewWithEmitter = function JobNewWithEmitter(emitter) {
  var job = this.NewEmpty();

  job.emitter = emitter;

  return job;
}


/*

  Injectors

*/

function inject(deps) {
  return Object.create(Job, deps);
}

function defaults() {
  return {
    Spawn: {
      value: require('child_process').spawn
    },
    Emitter: {
      value: require('events').EventEmitter
    },
    JobTypes: {
      value: require('lib-proto-job')
    },
    read: {
      value: require('fs').createReadStream
    },
    write: {
      value: require('fs').createWriteStream
    }
  };
}


/*

  Initializer

*/

module.exports = function INIT(deps) {
  return inject(deps || defaults())
};
