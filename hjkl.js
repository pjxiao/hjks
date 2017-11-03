(function (w, d) {
  // scroll width
  var W = 32;

  /**
   * Input key buffer
   *
   * @constructor
   * @param {String} [current] - current key
   * @param {String} [prev] - previous key
   */
  var Buffer = function (current, prev) {
    this.current = current || null;
    this.prev = prev || null;
  };

  /**
   * Put new key into buffer
   *
   * @constructor
   * @param {String} k - new key
   */
  Buffer.prototype.put = function (k) {
    this.prev = this.current;
    this.current = k;
  };

  /**
   * Pair of keys
   *
   * @constructor
   * @param {String} ks - keys
   */
  var Pair = function (ks) {
    if (ks.length === 2) {
      this.e1 = ks[0];
      this.e2 = ks[1];
    } else {
      this.e1 = null; 
      this.e2 = ks[0];
    }
  };

  /**
   * Compare with keys
   *
   * @constructor
   * @param {String} e1 - previous key
   * @param {String} e2 - current key
   */
  Pair.prototype.match = function (e1, e2) {
    return (  // e.g. gg (['a', 'b'])
      this.e1 === e1 &&
      this.e2 === e2 
    ) || (  // e.g. j (['c', undefined])
      this.e1 === null &&
      this.e2 === e2
    );
  }

  /**
   * Check if an element is editable
   *
   * @param {HTMLElement} elem - the element to be checked
   */
  var isEditable = function (elem) {
    return (
      elem.isContentEditable ||
      elem.tagName === 'INPUT' ||
      elem.tagName === 'TEXTAREA'
    );
  };

  /**
   * Eventlistener builder
   *
   * @param {Buffer} buffer - keep which keys are pressed
   * @param {Array} callbacks - callbacks
   */
  var Listener = function (buffer, callbacks) {
    this.buffer = buffer;
    this.callbacks = callbacks || [];
  };

  /**
   * Generate a callback to be passed to addEventListener
   */
  Listener.prototype.listen = function () {
    var b = this.buffer;
    var cs = this.callbacks;

    return function (e) {
      if (!isEditable(e.target)) {
        b.put(
          e.shiftKey
          ? e.key.toUpperCase()
          : e.key
        );
        cs.filter(function (c) {
          return c.key.match(b.prev, b.current);
        }).forEach(function (c) {
          c.callback();
        });
      }
      return true;
    };
  };

  /**
   * A listener notify to c when ks are pressed
   *
   * @param {String} ks - when to notify
   * @param {Function} c - where to notify
   */
  Listener.prototype.notifyWhen = function (ks, c) {
    return new Listener(
      this.buffer,
      this.callbacks.concat([{
        "key": new Pair(ks),
        "callback": c
      }])
    )
  };

  /**
   * Entrypoint
   */
  function main() {
    d.addEventListener(
      'keydown',
      (new Listener(new Buffer())
        ).notifyWhen('h', function () {
          w.scrollBy(-1 * W, 0);
        }).notifyWhen('j', function () {
          w.scrollBy(0, W);
        }).notifyWhen('k', function () {
          w.scrollBy(0, -1 * W);
        }).notifyWhen('l', function () {
          w.scrollBy(W, 0);
        }).notifyWhen('gg', function () {
          w.scrollTo(0, 0);
        }).notifyWhen('G', function () {
          w.scrollTo(0, d.body.parentNode.scrollHeight);
        }).listen(),
      true
    );
  }

  main();
}(window, document));
