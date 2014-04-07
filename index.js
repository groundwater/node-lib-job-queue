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

function next() {
  var job = this;

  if (job.pending.length == 0) return;
  if (!job.running)            return;
  if (job.current)             return;

  var task = job.pending.shift();
  var exec = task.exec;
  var args = task.args;
  var envs = task.envs;
  var opts = {
    stdio: 'pipe',
    env  : clone(envs),
    cwd  : task.cwd,
  };

  opts.env._LAST_EXIT = job.lastExit;

  job.current = job.require.Spawn(exec, args, opts);
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

  var std, path, stdin, stdout, stderr;

  std = task.stdio;

  if (std && (stdin = std[0]) && (path = stdin.path)) {
    var readStr = job.require.read(path);
    readStr.pipe(job.current.stdin);
  }

  if (std && (stdout = std[1]) && (path = stdout.path)) {
    var writeStr = job.require.write(path);
    job.current.stdout.pipe(writeStr);
  }

  if (std && (stderr = std[2]) && (path = stderr.path)) {
    var writeStr = job.require.write(path);
    job.current.stderr.pipe(writeStr);
  }

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
