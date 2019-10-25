/**
 * queueStream - duplex stream with a queue
 */

const { Duplex } = require('stream');

module.exports = class DuplexStream extends Duplex {

  constructor(options) {
    super(options);

    // an internal FIFO buffer
    this.queue = [];
    this.offset = 0;
  }

  _write(chunk, encoding, callback) {
    this.queue.push(chunk);
    callback();
  }

  _read(size) {
    if (this.queue.length == 0) return;

    var chunk = this.queue[this.offset];
    this.queue[this.offset] = null;

    // increment, free space if necessary
    if (++this.offset * 2 > this.queue.length) {
      this.queue = this.queue.slice(this.offset);
      this.offset = 0;
    }

    this.push(chunk);
  }

};
