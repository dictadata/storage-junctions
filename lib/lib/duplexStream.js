/**
 * queueStream - duplex stream with a queue
 */

const { Duplex } = require('stream');

module.exports = class DuplexStream extends Duplex {

  constructor(options) {
    super(options);

    // an internal FIFO buffer
    this.queue = [];
    this.head = 0;
  }

  _write(chunk, encoding, callback) {

    this.queue.push(chunk);
    callback();
  }

  _read(size) {
    let sent = 0;
    while (this.head < this.queue.length && sent < size) {
      var chunk = this.queue[this.head];
      this.queue[this.head] = null;
      this.head++;

      this.push(chunk);

      if (Buffer.isBuffer(chunk) || typeof chunk === "string")
        sent += chunk.length;
    }

    // free space
    if (this.head * 2 > this.queue.length) {
      this.queue = this.queue.slice(this.head);
      this.head = 0;
    }
  }

};
