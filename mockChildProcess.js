var stream = require('stream');
var events = require('events');
var util = require('util');

util.inherits(StdReadable, stream.Readable);
function StdReadable(opts) {
  stream.Readable.call(this, opts);
}

StdReadable.prototype._read = function () {
  //
}

StdReadable.prototype.fill = function(data) {
  this.push(data);
}

util.inherits(MockProcess, events.EventEmitter);
function MockProcess (opts) {
  events.EventEmitter.call(this, opts);

  this.events = null;
  this.stdout = null;
  this.stderr = null;
  this.stdin  = null;
  this.pid    = 1;
}

function MockChildModule() {
  this.events = new events.EventEmitter;
}

MockChildModule.prototype.spawn = function (exec, args, opts) {
  this.events.emit('spawn', exec, args, opts);

  var proc = new StdReadable;

  proc.stdout = new StdReadable;
  proc.stderr = new StdReadable;

  return proc;
}

module.exports = function () {
  return new MockChildModule();
}
