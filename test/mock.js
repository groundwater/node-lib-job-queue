var test   = require('tap').test;

var mockChild = require('../mockChildProcess.js')();
var events = require('events');
var Job    = require('../index.js')({
  Spawn: {
    value: function (){
      return mockChild.spawn.apply(mockChild, arguments);
    }
  },
  Emitter: {
    value: require('events').EventEmitter
  },
  JobTypes: {
    value: require('lib-proto-job')
  }
});

test(function (t) {
  t.plan(3);

  var task = {
    exec: 'EXEC',
    args: ['ARG1'],
    envs: {ENV1: 'env1'},
    cwd: 'CWD',
  };

  var job  = Job.New();

  mockChild.events.on('spawn', function (exec, args, opts) {
    t.equals(exec, 'EXEC');
    t.deepEquals(args, ['ARG1']);
    t.deepEquals(opts, {
      cwd: 'CWD',
      env: {
        _LAST_EXIT: null,
        ENV1: 'env1',
      },
      stdio: 'pipe',
    })
  });

  job.add(task);
});
