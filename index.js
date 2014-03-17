function Job(require) {
  this.require = require;
  this.emitter = null;

  this.pending = [];
  this.current = null;
  this.settled = [];

  this.running = true;

  this.lastExit;
}

function clone(obj) {
  var out = {};

  Object.keys(obj).forEach(function(key) {
    out[key] = obj[key];
  })

  return out;
}

function next(job) {
  if (job.pending.length == 0) return;
  if (!job.running)            return;
  if (job.current)             return;

  var task = job.pending.shift();
  var exec = task.exec;
  var args = task.args;
  var envs = task.envs;
  var opts = {
    stdio: 'pipe',
    env  : clone(envs)
  };

  opts.env._LAST_EXIT = job.lastExit || null;

  job.current = job.require.Spawn(exec, args, opts);
  job.current.on('exit', function (code, signal) {
    job.lastExit = code || signal || 0;
    job.current  = null;

    var info = {
      code   : code,
      signal : signal
    };

    job.settled.push(info);

    job.emitter.emit('exit', info);

    var hasNext = (job.pending.length > 0) && job.running;
    if (hasNext) next(job);
    else         job.emitter.emit('end');
  });

  job.emitter.emit('task', job.current);
}

Job.prototype.queue = function (task) {

  this.pending.push(task);

  next(this);
};

Job.prototype.abort = function () {
  this.running = false;
  this.current.kill('SIGKILL');
};

Job.New = function () {
  var emitter = new this.Emitter();
  return this.NewWithEmitter(emitter);
}

Job.NewEmpty = function () {
  return new Job(this);
}

Job.NewWithEmitter = function (emitter) {
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
  var deps = {
    Spawn: {
      value: require('child_process').spawn
    },
    Emitter: {
      value: require('events').EventEmitter
    }
  };
  return inject(deps);
}

/*

  Initializer

*/

module.exports = function INIT(deps) {
  if (typeof deps === 'object') return inject(deps);
  else if (deps === undefined)  return defaults();
  else                          throw new Error('injection error');
};
