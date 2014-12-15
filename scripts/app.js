(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.0.0
 */

(function() {
    "use strict";

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$asap$$len = 0;

    var $$asap$$default = function asap(callback, arg) {
      $$asap$$queue[$$asap$$len] = callback;
      $$asap$$queue[$$asap$$len + 1] = arg;
      $$asap$$len += 2;
      if ($$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$asap$$scheduleFlush();
      }
    };

    var $$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$asap$$useNextTick() {
      return function() {
        process.nextTick($$asap$$flush);
      };
    }

    function $$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$asap$$useSetTimeout() {
      return function() {
        setTimeout($$asap$$flush, 1);
      };
    }

    var $$asap$$queue = new Array(1000);

    function $$asap$$flush() {
      for (var i = 0; i < $$asap$$len; i+=2) {
        var callback = $$asap$$queue[i];
        var arg = $$asap$$queue[i+1];

        callback(arg);

        $$asap$$queue[i] = undefined;
        $$asap$$queue[i+1] = undefined;
      }

      $$asap$$len = 0;
    }

    var $$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$asap$$scheduleFlush = $$asap$$useNextTick();
    } else if ($$asap$$BrowserMutationObserver) {
      $$asap$$scheduleFlush = $$asap$$useMutationObserver();
    } else if ($$asap$$isWorker) {
      $$asap$$scheduleFlush = $$asap$$useMessageChannel();
    } else {
      $$asap$$scheduleFlush = $$asap$$useSetTimeout();
    }

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function $$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.')
    }

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
       $$asap$$default(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          $$$internal$$resolve(promise, value);
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$reject(promise, $$$internal$$selfFullfillment());
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
      } else {
        $$asap$$default($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$asap$$default($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$asap$$default($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$$enumerator$$default = $$$enumerator$$Enumerator;

    $$$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$es6$promise$promise$$counter = 0;

    function $$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @constructor
    */
    function $$es6$promise$promise$$Promise(resolver, label) {
      this._id = $$es6$promise$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof $$es6$promise$promise$$Promise)) {
          $$es6$promise$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    $$es6$promise$promise$$Promise.all = $$promise$all$$default;
    $$es6$promise$promise$$Promise.race = $$promise$race$$default;
    $$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
    $$es6$promise$promise$$Promise.reject = $$promise$reject$$default;

    $$es6$promise$promise$$Promise.prototype = {
      constructor: $$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection, label) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          return this;
        }

        parent._onerror = null;

        var child = new this.constructor($$$internal$$noop, label);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          $$asap$$default(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(null, onRejection, label);
      }
    };

    var $$es6$promise$polyfill$$default = function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport =
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return $$utils$$isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = $$es6$promise$promise$$default;
      }
    };

    var es6$promise$umd$$ES6Promise = {
      Promise: $$es6$promise$promise$$default,
      polyfill: $$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = es6$promise$umd$$ES6Promise;
    }
}).call(this);
}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"Wb8Gej":1}],3:[function(require,module,exports){
/**
 * @license
 * pixi.js - v2.1.0
 * Copyright (c) 2012-2014, Mat Groves
 * http://goodboydigital.com/
 *
 * Compiled: 2014-11-12
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(){var a=this,b=b||{};b.WEBGL_RENDERER=0,b.CANVAS_RENDERER=1,b.VERSION="v2.1.0",b.blendModes={NORMAL:0,ADD:1,MULTIPLY:2,SCREEN:3,OVERLAY:4,DARKEN:5,LIGHTEN:6,COLOR_DODGE:7,COLOR_BURN:8,HARD_LIGHT:9,SOFT_LIGHT:10,DIFFERENCE:11,EXCLUSION:12,HUE:13,SATURATION:14,COLOR:15,LUMINOSITY:16},b.scaleModes={DEFAULT:0,LINEAR:0,NEAREST:1},b._UID=0,"undefined"!=typeof Float32Array?(b.Float32Array=Float32Array,b.Uint16Array=Uint16Array):(b.Float32Array=Array,b.Uint16Array=Array),b.INTERACTION_FREQUENCY=30,b.AUTO_PREVENT_DEFAULT=!0,b.PI_2=2*Math.PI,b.RAD_TO_DEG=180/Math.PI,b.DEG_TO_RAD=Math.PI/180,b.RETINA_PREFIX="@2x",b.dontSayHello=!1,b.defaultRenderOptions={view:null,transparent:!1,antialias:!1,preserveDrawingBuffer:!1,resolution:1,clearBeforeRender:!0,autoResize:!1},b.sayHello=function(a){if(!b.dontSayHello){if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){var c=["%c %c %c Pixi.js "+b.VERSION+" - "+a+"  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ ","background: #ff66a5","background: #ff66a5","color: #ff66a5; background: #030307;","background: #ff66a5","background: #ffc3dc","background: #ff66a5","color: #ff2424; background: #fff","color: #ff2424; background: #fff","color: #ff2424; background: #fff"];console.log.apply(console,c)}else window.console&&console.log("Pixi.js "+b.VERSION+" - http://www.pixijs.com/");b.dontSayHello=!0}},b.Point=function(a,b){this.x=a||0,this.y=b||0},b.Point.prototype.clone=function(){return new b.Point(this.x,this.y)},b.Point.prototype.set=function(a,b){this.x=a||0,this.y=b||(0!==b?this.x:0)},b.Point.prototype.constructor=b.Point,b.Rectangle=function(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0},b.Rectangle.prototype.clone=function(){return new b.Rectangle(this.x,this.y,this.width,this.height)},b.Rectangle.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=this.x;if(a>=c&&a<=c+this.width){var d=this.y;if(b>=d&&b<=d+this.height)return!0}return!1},b.Rectangle.prototype.constructor=b.Rectangle,b.EmptyRectangle=new b.Rectangle(0,0,0,0),b.Polygon=function(a){if(a instanceof Array||(a=Array.prototype.slice.call(arguments)),a[0]instanceof b.Point){for(var c=[],d=0,e=a.length;e>d;d++)c.push(a[d].x,a[d].y);a=c}this.closed=!0,this.points=a},b.Polygon.prototype.clone=function(){var a=this.points.slice();return new b.Polygon(a)},b.Polygon.prototype.contains=function(a,b){for(var c=!1,d=this.points.length/2,e=0,f=d-1;d>e;f=e++){var g=this.points[2*e],h=this.points[2*e+1],i=this.points[2*f],j=this.points[2*f+1],k=h>b!=j>b&&(i-g)*(b-h)/(j-h)+g>a;k&&(c=!c)}return c},b.Polygon.prototype.constructor=b.Polygon,b.Circle=function(a,b,c){this.x=a||0,this.y=b||0,this.radius=c||0},b.Circle.prototype.clone=function(){return new b.Circle(this.x,this.y,this.radius)},b.Circle.prototype.contains=function(a,b){if(this.radius<=0)return!1;var c=this.x-a,d=this.y-b,e=this.radius*this.radius;return c*=c,d*=d,e>=c+d},b.Circle.prototype.getBounds=function(){return new b.Rectangle(this.x-this.radius,this.y-this.radius,2*this.radius,2*this.radius)},b.Circle.prototype.constructor=b.Circle,b.Ellipse=function(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0},b.Ellipse.prototype.clone=function(){return new b.Ellipse(this.x,this.y,this.width,this.height)},b.Ellipse.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=(a-this.x)/this.width,d=(b-this.y)/this.height;return c*=c,d*=d,1>=c+d},b.Ellipse.prototype.getBounds=function(){return new b.Rectangle(this.x-this.width,this.y-this.height,this.width,this.height)},b.Ellipse.prototype.constructor=b.Ellipse,b.RoundedRectangle=function(a,b,c,d,e){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0,this.radius=e||20},b.RoundedRectangle.prototype.clone=function(){return new b.RoundedRectangle(this.x,this.y,this.width,this.height,this.radius)},b.RoundedRectangle.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=this.x;if(a>=c&&a<=c+this.width){var d=this.y;if(b>=d&&b<=d+this.height)return!0}return!1},b.RoundedRectangle.prototype.constructor=b.RoundedRectangle,b.Matrix=function(){this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0},b.Matrix.prototype.fromArray=function(a){this.a=a[0],this.b=a[1],this.c=a[3],this.d=a[4],this.tx=a[2],this.ty=a[5]},b.Matrix.prototype.toArray=function(a){this.array||(this.array=new b.Float32Array(9));var c=this.array;return a?(c[0]=this.a,c[1]=this.b,c[2]=0,c[3]=this.c,c[4]=this.d,c[5]=0,c[6]=this.tx,c[7]=this.ty,c[8]=1):(c[0]=this.a,c[1]=this.c,c[2]=this.tx,c[3]=this.b,c[4]=this.d,c[5]=this.ty,c[6]=0,c[7]=0,c[8]=1),c},b.Matrix.prototype.apply=function(a,c){return c=c||new b.Point,c.x=this.a*a.x+this.c*a.y+this.tx,c.y=this.b*a.x+this.d*a.y+this.ty,c},b.Matrix.prototype.applyInverse=function(a,c){c=c||new b.Point;var d=1/(this.a*this.d+this.c*-this.b);return c.x=this.d*d*a.x+-this.c*d*a.y+(this.ty*this.c-this.tx*this.d)*d,c.y=this.a*d*a.y+-this.b*d*a.x+(-this.ty*this.a+this.tx*this.b)*d,c},b.Matrix.prototype.translate=function(a,b){return this.tx+=a,this.ty+=b,this},b.Matrix.prototype.scale=function(a,b){return this.a*=a,this.d*=b,this.c*=a,this.b*=b,this.tx*=a,this.ty*=b,this},b.Matrix.prototype.rotate=function(a){var b=Math.cos(a),c=Math.sin(a),d=this.a,e=this.c,f=this.tx;return this.a=d*b-this.b*c,this.b=d*c+this.b*b,this.c=e*b-this.d*c,this.d=e*c+this.d*b,this.tx=f*b-this.ty*c,this.ty=f*c+this.ty*b,this},b.Matrix.prototype.append=function(a){var b=this.a,c=this.b,d=this.c,e=this.d;return this.a=a.a*b+a.b*d,this.b=a.a*c+a.b*e,this.c=a.c*b+a.d*d,this.d=a.c*c+a.d*e,this.tx=a.tx*b+a.ty*d+this.tx,this.ty=a.tx*c+a.ty*e+this.ty,this},b.Matrix.prototype.identity=function(){return this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0,this},b.identityMatrix=new b.Matrix,b.DisplayObject=function(){this.position=new b.Point,this.scale=new b.Point(1,1),this.pivot=new b.Point(0,0),this.rotation=0,this.alpha=1,this.visible=!0,this.hitArea=null,this.buttonMode=!1,this.renderable=!1,this.parent=null,this.stage=null,this.worldAlpha=1,this._interactive=!1,this.defaultCursor="pointer",this.worldTransform=new b.Matrix,this._sr=0,this._cr=1,this.filterArea=null,this._bounds=new b.Rectangle(0,0,1,1),this._currentBounds=null,this._mask=null,this._cacheAsBitmap=!1,this._cacheIsDirty=!1},b.DisplayObject.prototype.constructor=b.DisplayObject,Object.defineProperty(b.DisplayObject.prototype,"interactive",{get:function(){return this._interactive},set:function(a){this._interactive=a,this.stage&&(this.stage.dirty=!0)}}),Object.defineProperty(b.DisplayObject.prototype,"worldVisible",{get:function(){var a=this;do{if(!a.visible)return!1;a=a.parent}while(a);return!0}}),Object.defineProperty(b.DisplayObject.prototype,"mask",{get:function(){return this._mask},set:function(a){this._mask&&(this._mask.isMask=!1),this._mask=a,this._mask&&(this._mask.isMask=!0)}}),Object.defineProperty(b.DisplayObject.prototype,"filters",{get:function(){return this._filters},set:function(a){if(a){for(var b=[],c=0;c<a.length;c++)for(var d=a[c].passes,e=0;e<d.length;e++)b.push(d[e]);this._filterBlock={target:this,filterPasses:b}}this._filters=a}}),Object.defineProperty(b.DisplayObject.prototype,"cacheAsBitmap",{get:function(){return this._cacheAsBitmap},set:function(a){this._cacheAsBitmap!==a&&(a?this._generateCachedSprite():this._destroyCachedSprite(),this._cacheAsBitmap=a)}}),b.DisplayObject.prototype.updateTransform=function(){var a,c,d,e,f,g,h=this.parent.worldTransform,i=this.worldTransform;this.rotation%b.PI_2?(this.rotation!==this.rotationCache&&(this.rotationCache=this.rotation,this._sr=Math.sin(this.rotation),this._cr=Math.cos(this.rotation)),a=this._cr*this.scale.x,c=this._sr*this.scale.x,d=-this._sr*this.scale.y,e=this._cr*this.scale.y,f=this.position.x,g=this.position.y,(this.pivot.x||this.pivot.y)&&(f-=this.pivot.x*a+this.pivot.y*d,g-=this.pivot.x*c+this.pivot.y*e),i.a=a*h.a+c*h.c,i.b=a*h.b+c*h.d,i.c=d*h.a+e*h.c,i.d=d*h.b+e*h.d,i.tx=f*h.a+g*h.c+h.tx,i.ty=f*h.b+g*h.d+h.ty):(a=this.scale.x,e=this.scale.y,f=this.position.x-this.pivot.x*a,g=this.position.y-this.pivot.y*e,i.a=a*h.a,i.b=a*h.b,i.c=e*h.c,i.d=e*h.d,i.tx=f*h.a+g*h.c+h.tx,i.ty=f*h.b+g*h.d+h.ty),this.worldAlpha=this.alpha*this.parent.worldAlpha},b.DisplayObject.prototype.displayObjectUpdateTransform=b.DisplayObject.prototype.updateTransform,b.DisplayObject.prototype.getBounds=function(a){return a=a,b.EmptyRectangle},b.DisplayObject.prototype.getLocalBounds=function(){return this.getBounds(b.identityMatrix)},b.DisplayObject.prototype.setStageReference=function(a){this.stage=a,this._interactive&&(this.stage.dirty=!0)},b.DisplayObject.prototype.generateTexture=function(a,c,d){var e=this.getLocalBounds(),f=new b.RenderTexture(0|e.width,0|e.height,d,c,a);return b.DisplayObject._tempMatrix.tx=-e.x,b.DisplayObject._tempMatrix.ty=-e.y,f.render(this,b.DisplayObject._tempMatrix),f},b.DisplayObject.prototype.updateCache=function(){this._generateCachedSprite()},b.DisplayObject.prototype.toGlobal=function(a){return this.updateTransform(),this.worldTransform.apply(a)},b.DisplayObject.prototype.toLocal=function(a,b){return b&&(a=b.toGlobal(a)),this.updateTransform(),this.worldTransform.applyInverse(a)},b.DisplayObject.prototype._renderCachedSprite=function(a){this._cachedSprite.worldAlpha=this.worldAlpha,a.gl?b.Sprite.prototype._renderWebGL.call(this._cachedSprite,a):b.Sprite.prototype._renderCanvas.call(this._cachedSprite,a)},b.DisplayObject.prototype._generateCachedSprite=function(){this._cacheAsBitmap=!1;var a=this.getLocalBounds();if(this._cachedSprite)this._cachedSprite.texture.resize(0|a.width,0|a.height);else{var c=new b.RenderTexture(0|a.width,0|a.height);this._cachedSprite=new b.Sprite(c),this._cachedSprite.worldTransform=this.worldTransform}var d=this._filters;this._filters=null,this._cachedSprite.filters=d,b.DisplayObject._tempMatrix.tx=-a.x,b.DisplayObject._tempMatrix.ty=-a.y,this._cachedSprite.texture.render(this,b.DisplayObject._tempMatrix),this._cachedSprite.anchor.x=-(a.x/a.width),this._cachedSprite.anchor.y=-(a.y/a.height),this._filters=d,this._cacheAsBitmap=!0},b.DisplayObject.prototype._destroyCachedSprite=function(){this._cachedSprite&&(this._cachedSprite.texture.destroy(!0),this._cachedSprite=null)},b.DisplayObject.prototype._renderWebGL=function(a){a=a},b.DisplayObject.prototype._renderCanvas=function(a){a=a},b.DisplayObject._tempMatrix=new b.Matrix,Object.defineProperty(b.DisplayObject.prototype,"x",{get:function(){return this.position.x},set:function(a){this.position.x=a}}),Object.defineProperty(b.DisplayObject.prototype,"y",{get:function(){return this.position.y},set:function(a){this.position.y=a}}),b.DisplayObjectContainer=function(){b.DisplayObject.call(this),this.children=[]},b.DisplayObjectContainer.prototype=Object.create(b.DisplayObject.prototype),b.DisplayObjectContainer.prototype.constructor=b.DisplayObjectContainer,Object.defineProperty(b.DisplayObjectContainer.prototype,"width",{get:function(){return this.scale.x*this.getLocalBounds().width},set:function(a){var b=this.getLocalBounds().width;this.scale.x=0!==b?a/b:1,this._width=a}}),Object.defineProperty(b.DisplayObjectContainer.prototype,"height",{get:function(){return this.scale.y*this.getLocalBounds().height},set:function(a){var b=this.getLocalBounds().height;this.scale.y=0!==b?a/b:1,this._height=a}}),b.DisplayObjectContainer.prototype.addChild=function(a){return this.addChildAt(a,this.children.length)},b.DisplayObjectContainer.prototype.addChildAt=function(a,b){if(b>=0&&b<=this.children.length)return a.parent&&a.parent.removeChild(a),a.parent=this,this.children.splice(b,0,a),this.stage&&a.setStageReference(this.stage),a;throw new Error(a+"addChildAt: The index "+b+" supplied is out of bounds "+this.children.length)},b.DisplayObjectContainer.prototype.swapChildren=function(a,b){if(a!==b){var c=this.getChildIndex(a),d=this.getChildIndex(b);if(0>c||0>d)throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");this.children[c]=b,this.children[d]=a}},b.DisplayObjectContainer.prototype.getChildIndex=function(a){var b=this.children.indexOf(a);if(-1===b)throw new Error("The supplied DisplayObject must be a child of the caller");return b},b.DisplayObjectContainer.prototype.setChildIndex=function(a,b){if(0>b||b>=this.children.length)throw new Error("The supplied index is out of bounds");var c=this.getChildIndex(a);this.children.splice(c,1),this.children.splice(b,0,a)},b.DisplayObjectContainer.prototype.getChildAt=function(a){if(0>a||a>=this.children.length)throw new Error("getChildAt: Supplied index "+a+" does not exist in the child list, or the supplied DisplayObject must be a child of the caller");return this.children[a]},b.DisplayObjectContainer.prototype.removeChild=function(a){var b=this.children.indexOf(a);if(-1!==b)return this.removeChildAt(b)},b.DisplayObjectContainer.prototype.removeChildAt=function(a){var b=this.getChildAt(a);return this.stage&&b.removeStageReference(),b.parent=void 0,this.children.splice(a,1),b},b.DisplayObjectContainer.prototype.removeChildren=function(a,b){var c=a||0,d="number"==typeof b?b:this.children.length,e=d-c;if(e>0&&d>=e){for(var f=this.children.splice(c,e),g=0;g<f.length;g++){var h=f[g];this.stage&&h.removeStageReference(),h.parent=void 0}return f}if(0===e&&0===this.children.length)return[];throw new Error("removeChildren: Range Error, numeric values are outside the acceptable range")},b.DisplayObjectContainer.prototype.updateTransform=function(){if(this.visible&&(this.displayObjectUpdateTransform(),!this._cacheAsBitmap))for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform()},b.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform=b.DisplayObjectContainer.prototype.updateTransform,b.DisplayObjectContainer.prototype.getBounds=function(){if(0===this.children.length)return b.EmptyRectangle;for(var a,c,d,e=1/0,f=1/0,g=-1/0,h=-1/0,i=!1,j=0,k=this.children.length;k>j;j++){var l=this.children[j];l.visible&&(i=!0,a=this.children[j].getBounds(),e=e<a.x?e:a.x,f=f<a.y?f:a.y,c=a.width+a.x,d=a.height+a.y,g=g>c?g:c,h=h>d?h:d)}if(!i)return b.EmptyRectangle;var m=this._bounds;return m.x=e,m.y=f,m.width=g-e,m.height=h-f,m},b.DisplayObjectContainer.prototype.getLocalBounds=function(){var a=this.worldTransform;this.worldTransform=b.identityMatrix;for(var c=0,d=this.children.length;d>c;c++)this.children[c].updateTransform();var e=this.getBounds();return this.worldTransform=a,e},b.DisplayObjectContainer.prototype.setStageReference=function(a){this.stage=a,this._interactive&&(this.stage.dirty=!0);for(var b=0,c=this.children.length;c>b;b++){var d=this.children[b];d.setStageReference(a)}},b.DisplayObjectContainer.prototype.removeStageReference=function(){for(var a=0,b=this.children.length;b>a;a++){var c=this.children[a];c.removeStageReference()}this._interactive&&(this.stage.dirty=!0),this.stage=null},b.DisplayObjectContainer.prototype._renderWebGL=function(a){if(this.visible&&!(this.alpha<=0)){if(this._cacheAsBitmap)return this._renderCachedSprite(a),void 0;var b,c;if(this._mask||this._filters){for(this._filters&&(a.spriteBatch.flush(),a.filterManager.pushFilter(this._filterBlock)),this._mask&&(a.spriteBatch.stop(),a.maskManager.pushMask(this.mask,a),a.spriteBatch.start()),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a);a.spriteBatch.stop(),this._mask&&a.maskManager.popMask(this._mask,a),this._filters&&a.filterManager.popFilter(),a.spriteBatch.start()}else for(b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a)}},b.DisplayObjectContainer.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha){if(this._cacheAsBitmap)return this._renderCachedSprite(a),void 0;this._mask&&a.maskManager.pushMask(this._mask,a);for(var b=0,c=this.children.length;c>b;b++){var d=this.children[b];d._renderCanvas(a)}this._mask&&a.maskManager.popMask(a)}},b.Sprite=function(a){b.DisplayObjectContainer.call(this),this.anchor=new b.Point,this.texture=a,this._width=0,this._height=0,this.tint=16777215,this.blendMode=b.blendModes.NORMAL,this.shader=null,a.baseTexture.hasLoaded?this.onTextureUpdate():this.texture.on("update",this.onTextureUpdate.bind(this)),this.renderable=!0},b.Sprite.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Sprite.prototype.constructor=b.Sprite,Object.defineProperty(b.Sprite.prototype,"width",{get:function(){return this.scale.x*this.texture.frame.width},set:function(a){this.scale.x=a/this.texture.frame.width,this._width=a}}),Object.defineProperty(b.Sprite.prototype,"height",{get:function(){return this.scale.y*this.texture.frame.height},set:function(a){this.scale.y=a/this.texture.frame.height,this._height=a}}),b.Sprite.prototype.setTexture=function(a){this.texture=a,this.cachedTint=16777215},b.Sprite.prototype.onTextureUpdate=function(){this._width&&(this.scale.x=this._width/this.texture.frame.width),this._height&&(this.scale.y=this._height/this.texture.frame.height)},b.Sprite.prototype.getBounds=function(a){var b=this.texture.frame.width,c=this.texture.frame.height,d=b*(1-this.anchor.x),e=b*-this.anchor.x,f=c*(1-this.anchor.y),g=c*-this.anchor.y,h=a||this.worldTransform,i=h.a,j=h.b,k=h.c,l=h.d,m=h.tx,n=h.ty,o=i*e+k*g+m,p=l*g+j*e+n,q=i*d+k*g+m,r=l*g+j*d+n,s=i*d+k*f+m,t=l*f+j*d+n,u=i*e+k*f+m,v=l*f+j*e+n,w=-1/0,x=-1/0,y=1/0,z=1/0;y=y>o?o:y,y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,z=z>p?p:z,z=z>r?r:z,z=z>t?t:z,z=z>v?v:z,w=o>w?o:w,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w,x=p>x?p:x,x=r>x?r:x,x=t>x?t:x,x=v>x?v:x;var A=this._bounds;return A.x=y,A.width=w-y,A.y=z,A.height=x-z,this._currentBounds=A,A},b.Sprite.prototype._renderWebGL=function(a){if(this.visible&&!(this.alpha<=0)){var b,c;if(this._mask||this._filters){var d=a.spriteBatch;for(this._filters&&(d.flush(),a.filterManager.pushFilter(this._filterBlock)),this._mask&&(d.stop(),a.maskManager.pushMask(this.mask,a),d.start()),d.render(this),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a);d.stop(),this._mask&&a.maskManager.popMask(this._mask,a),this._filters&&a.filterManager.popFilter(),d.start()}else for(a.spriteBatch.render(this),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a)}},b.Sprite.prototype._renderCanvas=function(a){if(!(this.visible===!1||0===this.alpha||this.texture.crop.width<=0||this.texture.crop.height<=0)){if(this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,a.context.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]),this._mask&&a.maskManager.pushMask(this._mask,a),this.texture.valid){var c=this.texture.baseTexture.resolution/a.resolution;a.context.globalAlpha=this.worldAlpha,a.roundPixels?a.context.setTransform(this.worldTransform.a,this.worldTransform.b,this.worldTransform.c,this.worldTransform.d,this.worldTransform.tx*a.resolution|0,this.worldTransform.ty*a.resolution|0):a.context.setTransform(this.worldTransform.a,this.worldTransform.b,this.worldTransform.c,this.worldTransform.d,this.worldTransform.tx*a.resolution,this.worldTransform.ty*a.resolution),a.smoothProperty&&a.scaleMode!==this.texture.baseTexture.scaleMode&&(a.scaleMode=this.texture.baseTexture.scaleMode,a.context[a.smoothProperty]=a.scaleMode===b.scaleModes.LINEAR);var d=this.texture.trim?this.texture.trim.x-this.anchor.x*this.texture.trim.width:this.anchor.x*-this.texture.frame.width,e=this.texture.trim?this.texture.trim.y-this.anchor.y*this.texture.trim.height:this.anchor.y*-this.texture.frame.height;16777215!==this.tint?(this.cachedTint!==this.tint&&(this.cachedTint=this.tint,this.tintedTexture=b.CanvasTinter.getTintedTexture(this,this.tint)),a.context.drawImage(this.tintedTexture,0,0,this.texture.crop.width,this.texture.crop.height,d/c,e/c,this.texture.crop.width/c,this.texture.crop.height/c)):a.context.drawImage(this.texture.baseTexture.source,this.texture.crop.x,this.texture.crop.y,this.texture.crop.width,this.texture.crop.height,d/c,e/c,this.texture.crop.width/c,this.texture.crop.height/c)}for(var f=0,g=this.children.length;g>f;f++)this.children[f]._renderCanvas(a);this._mask&&a.maskManager.popMask(a)}},b.Sprite.fromFrame=function(a){var c=b.TextureCache[a];if(!c)throw new Error('The frameId "'+a+'" does not exist in the texture cache'+this);return new b.Sprite(c)},b.Sprite.fromImage=function(a,c,d){var e=b.Texture.fromImage(a,c,d);return new b.Sprite(e)},b.SpriteBatch=function(a){b.DisplayObjectContainer.call(this),this.textureThing=a,this.ready=!1},b.SpriteBatch.prototype=Object.create(b.DisplayObjectContainer.prototype),b.SpriteBatch.prototype.constructor=b.SpriteBatch,b.SpriteBatch.prototype.initWebGL=function(a){this.fastSpriteBatch=new b.WebGLFastSpriteBatch(a),this.ready=!0},b.SpriteBatch.prototype.updateTransform=function(){b.DisplayObject.prototype.updateTransform.call(this)},b.SpriteBatch.prototype._renderWebGL=function(a){!this.visible||this.alpha<=0||!this.children.length||(this.ready||this.initWebGL(a.gl),a.spriteBatch.stop(),a.shaderManager.setShader(a.shaderManager.fastShader),this.fastSpriteBatch.begin(this,a),this.fastSpriteBatch.render(this),a.spriteBatch.start())},b.SpriteBatch.prototype._renderCanvas=function(a){if(this.visible&&!(this.alpha<=0)&&this.children.length){var c=a.context;c.globalAlpha=this.worldAlpha,b.DisplayObject.prototype.updateTransform.call(this);for(var d=this.worldTransform,e=!0,f=0;f<this.children.length;f++){var g=this.children[f];if(g.visible){var h=g.texture,i=h.frame;if(c.globalAlpha=this.worldAlpha*g.alpha,g.rotation%(2*Math.PI)===0)e&&(c.setTransform(d.a,d.b,d.c,d.d,d.tx,d.ty),e=!1),c.drawImage(h.baseTexture.source,i.x,i.y,i.width,i.height,g.anchor.x*-i.width*g.scale.x+g.position.x+.5|0,g.anchor.y*-i.height*g.scale.y+g.position.y+.5|0,i.width*g.scale.x,i.height*g.scale.y);else{e||(e=!0),b.DisplayObject.prototype.updateTransform.call(g);var j=g.worldTransform;a.roundPixels?c.setTransform(j.a,j.b,j.c,j.d,0|j.tx,0|j.ty):c.setTransform(j.a,j.b,j.c,j.d,j.tx,j.ty),c.drawImage(h.baseTexture.source,i.x,i.y,i.width,i.height,g.anchor.x*-i.width+.5|0,g.anchor.y*-i.height+.5|0,i.width,i.height)}}}}},b.MovieClip=function(a){b.Sprite.call(this,a[0]),this.textures=a,this.animationSpeed=1,this.loop=!0,this.onComplete=null,this.currentFrame=0,this.playing=!1},b.MovieClip.prototype=Object.create(b.Sprite.prototype),b.MovieClip.prototype.constructor=b.MovieClip,Object.defineProperty(b.MovieClip.prototype,"totalFrames",{get:function(){return this.textures.length}}),b.MovieClip.prototype.stop=function(){this.playing=!1},b.MovieClip.prototype.play=function(){this.playing=!0},b.MovieClip.prototype.gotoAndStop=function(a){this.playing=!1,this.currentFrame=a;var b=this.currentFrame+.5|0;this.setTexture(this.textures[b%this.textures.length])},b.MovieClip.prototype.gotoAndPlay=function(a){this.currentFrame=a,this.playing=!0},b.MovieClip.prototype.updateTransform=function(){if(b.Sprite.prototype.updateTransform.call(this),this.playing){this.currentFrame+=this.animationSpeed;var a=this.currentFrame+.5|0;this.currentFrame=this.currentFrame%this.textures.length,this.loop||a<this.textures.length?this.setTexture(this.textures[a%this.textures.length]):a>=this.textures.length&&(this.gotoAndStop(this.textures.length-1),this.onComplete&&this.onComplete())}},b.MovieClip.fromFrames=function(a){for(var c=[],d=0;d<a.length;d++)c.push(new b.Texture.fromFrame(a[d]));return new b.MovieClip(c)},b.MovieClip.fromImages=function(a){for(var c=[],d=0;d<a.length;d++)c.push(new b.Texture.fromImage(a[d]));return new b.MovieClip(c)},b.FilterBlock=function(){this.visible=!0,this.renderable=!0},b.FilterBlock.prototype.constructor=b.FilterBlock,b.Text=function(a,c){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.resolution=1,b.Sprite.call(this,b.Texture.fromCanvas(this.canvas)),this.setText(a),this.setStyle(c)},b.Text.prototype=Object.create(b.Sprite.prototype),b.Text.prototype.constructor=b.Text,Object.defineProperty(b.Text.prototype,"width",{get:function(){return this.dirty&&(this.updateText(),this.dirty=!1),this.scale.x*this.texture.frame.width},set:function(a){this.scale.x=a/this.texture.frame.width,this._width=a}}),Object.defineProperty(b.Text.prototype,"height",{get:function(){return this.dirty&&(this.updateText(),this.dirty=!1),this.scale.y*this.texture.frame.height},set:function(a){this.scale.y=a/this.texture.frame.height,this._height=a}}),b.Text.prototype.setStyle=function(a){a=a||{},a.font=a.font||"bold 20pt Arial",a.fill=a.fill||"black",a.align=a.align||"left",a.stroke=a.stroke||"black",a.strokeThickness=a.strokeThickness||0,a.wordWrap=a.wordWrap||!1,a.wordWrapWidth=a.wordWrapWidth||100,a.dropShadow=a.dropShadow||!1,a.dropShadowAngle=a.dropShadowAngle||Math.PI/6,a.dropShadowDistance=a.dropShadowDistance||4,a.dropShadowColor=a.dropShadowColor||"black",this.style=a,this.dirty=!0},b.Text.prototype.setText=function(a){this.text=a.toString()||" ",this.dirty=!0},b.Text.prototype.updateText=function(){this.texture.baseTexture.resolution=this.resolution,this.context.font=this.style.font;var a=this.text;this.style.wordWrap&&(a=this.wordWrap(this.text));for(var b=a.split(/(?:\r\n|\r|\n)/),c=[],d=0,e=this.determineFontProperties(this.style.font),f=0;f<b.length;f++){var g=this.context.measureText(b[f]).width;c[f]=g,d=Math.max(d,g)}var h=d+this.style.strokeThickness;this.style.dropShadow&&(h+=this.style.dropShadowDistance),this.canvas.width=(h+this.context.lineWidth)*this.resolution;var i=e.fontSize+this.style.strokeThickness,j=i*b.length;this.style.dropShadow&&(j+=this.style.dropShadowDistance),this.canvas.height=j*this.resolution,this.context.scale(this.resolution,this.resolution),navigator.isCocoonJS&&this.context.clearRect(0,0,this.canvas.width,this.canvas.height),this.context.font=this.style.font,this.context.strokeStyle=this.style.stroke,this.context.lineWidth=this.style.strokeThickness,this.context.textBaseline="alphabetic";var k,l;if(this.style.dropShadow){this.context.fillStyle=this.style.dropShadowColor;var m=Math.sin(this.style.dropShadowAngle)*this.style.dropShadowDistance,n=Math.cos(this.style.dropShadowAngle)*this.style.dropShadowDistance;for(f=0;f<b.length;f++)k=this.style.strokeThickness/2,l=this.style.strokeThickness/2+f*i+e.ascent,"right"===this.style.align?k+=d-c[f]:"center"===this.style.align&&(k+=(d-c[f])/2),this.style.fill&&this.context.fillText(b[f],k+m,l+n)}for(this.context.fillStyle=this.style.fill,f=0;f<b.length;f++)k=this.style.strokeThickness/2,l=this.style.strokeThickness/2+f*i+e.ascent,"right"===this.style.align?k+=d-c[f]:"center"===this.style.align&&(k+=(d-c[f])/2),this.style.stroke&&this.style.strokeThickness&&this.context.strokeText(b[f],k,l),this.style.fill&&this.context.fillText(b[f],k,l);this.updateTexture()},b.Text.prototype.updateTexture=function(){this.texture.baseTexture.width=this.canvas.width,this.texture.baseTexture.height=this.canvas.height,this.texture.crop.width=this.texture.frame.width=this.canvas.width,this.texture.crop.height=this.texture.frame.height=this.canvas.height,this._width=this.canvas.width,this._height=this.canvas.height,this.texture.baseTexture.dirty()},b.Text.prototype._renderWebGL=function(a){this.dirty&&(this.resolution=a.resolution,this.updateText(),this.dirty=!1),b.Sprite.prototype._renderWebGL.call(this,a)},b.Text.prototype._renderCanvas=function(a){this.dirty&&(this.resolution=a.resolution,this.updateText(),this.dirty=!1),b.Sprite.prototype._renderCanvas.call(this,a)},b.Text.prototype.determineFontProperties=function(a){var c=b.Text.fontPropertiesCache[a];if(!c){c={};var d=b.Text.fontPropertiesCanvas,e=b.Text.fontPropertiesContext;e.font=a;var f=Math.ceil(e.measureText("|Mq").width),g=Math.ceil(e.measureText("M").width),h=2*g;g=1.4*g|0,d.width=f,d.height=h,e.fillStyle="#f00",e.fillRect(0,0,f,h),e.font=a,e.textBaseline="alphabetic",e.fillStyle="#000",e.fillText("|Mq",0,g);var i,j,k=e.getImageData(0,0,f,h).data,l=k.length,m=4*f,n=0,o=!1;for(i=0;g>i;i++){for(j=0;m>j;j+=4)if(255!==k[n+j]){o=!0;break}if(o)break;n+=m}for(c.ascent=g-i,n=l-m,o=!1,i=h;i>g;i--){for(j=0;m>j;j+=4)if(255!==k[n+j]){o=!0;break}if(o)break;n-=m}c.descent=i-g,c.fontSize=c.ascent+c.descent,b.Text.fontPropertiesCache[a]=c}return c},b.Text.prototype.wordWrap=function(a){for(var b="",c=a.split("\n"),d=0;d<c.length;d++){for(var e=this.style.wordWrapWidth,f=c[d].split(" "),g=0;g<f.length;g++){var h=this.context.measureText(f[g]).width,i=h+this.context.measureText(" ").width;0===g||i>e?(g>0&&(b+="\n"),b+=f[g],e=this.style.wordWrapWidth-h):(e-=i,b+=" "+f[g])}d<c.length-1&&(b+="\n")}return b},b.Text.prototype.getBounds=function(a){return this.dirty&&(this.updateText(),this.dirty=!1),b.Sprite.prototype.getBounds.call(this,a)},b.Text.prototype.destroy=function(a){this.context=null,this.canvas=null,this.texture.destroy(void 0===a?!0:a)},b.Text.fontPropertiesCache={},b.Text.fontPropertiesCanvas=document.createElement("canvas"),b.Text.fontPropertiesContext=b.Text.fontPropertiesCanvas.getContext("2d"),b.BitmapText=function(a,c){b.DisplayObjectContainer.call(this),this.textWidth=0,this.textHeight=0,this._pool=[],this.setText(a),this.setStyle(c),this.updateText(),this.dirty=!1},b.BitmapText.prototype=Object.create(b.DisplayObjectContainer.prototype),b.BitmapText.prototype.constructor=b.BitmapText,b.BitmapText.prototype.setText=function(a){this.text=a||" ",this.dirty=!0},b.BitmapText.prototype.setStyle=function(a){a=a||{},a.align=a.align||"left",this.style=a;var c=a.font.split(" ");this.fontName=c[c.length-1],this.fontSize=c.length>=2?parseInt(c[c.length-2],10):b.BitmapText.fonts[this.fontName].size,this.dirty=!0,this.tint=a.tint},b.BitmapText.prototype.updateText=function(){for(var a=b.BitmapText.fonts[this.fontName],c=new b.Point,d=null,e=[],f=0,g=[],h=0,i=this.fontSize/a.size,j=0;j<this.text.length;j++){var k=this.text.charCodeAt(j);if(/(?:\r\n|\r|\n)/.test(this.text.charAt(j)))g.push(c.x),f=Math.max(f,c.x),h++,c.x=0,c.y+=a.lineHeight,d=null;else{var l=a.chars[k];l&&(d&&l.kerning[d]&&(c.x+=l.kerning[d]),e.push({texture:l.texture,line:h,charCode:k,position:new b.Point(c.x+l.xOffset,c.y+l.yOffset)}),c.x+=l.xAdvance,d=k)}}g.push(c.x),f=Math.max(f,c.x);var m=[];for(j=0;h>=j;j++){var n=0;"right"===this.style.align?n=f-g[j]:"center"===this.style.align&&(n=(f-g[j])/2),m.push(n)}var o=this.children.length,p=e.length,q=this.tint||16777215;for(j=0;p>j;j++){var r=o>j?this.children[j]:this._pool.pop();r?r.setTexture(e[j].texture):r=new b.Sprite(e[j].texture),r.position.x=(e[j].position.x+m[e[j].line])*i,r.position.y=e[j].position.y*i,r.scale.x=r.scale.y=i,r.tint=q,r.parent||this.addChild(r)}for(;this.children.length>p;){var s=this.getChildAt(this.children.length-1);this._pool.push(s),this.removeChild(s)}this.textWidth=f*i,this.textHeight=(c.y+a.lineHeight)*i},b.BitmapText.prototype.updateTransform=function(){this.dirty&&(this.updateText(),this.dirty=!1),b.DisplayObjectContainer.prototype.updateTransform.call(this)},b.BitmapText.fonts={},b.InteractionData=function(){this.global=new b.Point,this.target=null,this.originalEvent=null},b.InteractionData.prototype.getLocalPosition=function(a,c){var d=a.worldTransform,e=this.global,f=d.a,g=d.c,h=d.tx,i=d.b,j=d.d,k=d.ty,l=1/(f*j+g*-i);return c=c||new b.Point,c.x=j*l*e.x+-g*l*e.y+(k*g-h*j)*l,c.y=f*l*e.y+-i*l*e.x+(-k*f+h*i)*l,c},b.InteractionData.prototype.constructor=b.InteractionData,b.InteractionManager=function(a){this.stage=a,this.mouse=new b.InteractionData,this.touches={},this.tempPoint=new b.Point,this.mouseoverEnabled=!0,this.pool=[],this.interactiveItems=[],this.interactionDOMElement=null,this.onMouseMove=this.onMouseMove.bind(this),this.onMouseDown=this.onMouseDown.bind(this),this.onMouseOut=this.onMouseOut.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.onTouchStart=this.onTouchStart.bind(this),this.onTouchEnd=this.onTouchEnd.bind(this),this.onTouchMove=this.onTouchMove.bind(this),this.last=0,this.currentCursorStyle="inherit",this.mouseOut=!1,this.resolution=1},b.InteractionManager.prototype.constructor=b.InteractionManager,b.InteractionManager.prototype.collectInteractiveSprite=function(a,b){for(var c=a.children,d=c.length,e=d-1;e>=0;e--){var f=c[e];f._interactive?(b.interactiveChildren=!0,this.interactiveItems.push(f),f.children.length>0&&this.collectInteractiveSprite(f,f)):(f.__iParent=null,f.children.length>0&&this.collectInteractiveSprite(f,b))
}},b.InteractionManager.prototype.setTarget=function(a){this.target=a,this.resolution=a.resolution,null===this.interactionDOMElement&&this.setTargetDomElement(a.view)},b.InteractionManager.prototype.setTargetDomElement=function(a){this.removeEvents(),window.navigator.msPointerEnabled&&(a.style["-ms-content-zooming"]="none",a.style["-ms-touch-action"]="none"),this.interactionDOMElement=a,a.addEventListener("mousemove",this.onMouseMove,!0),a.addEventListener("mousedown",this.onMouseDown,!0),a.addEventListener("mouseout",this.onMouseOut,!0),a.addEventListener("touchstart",this.onTouchStart,!0),a.addEventListener("touchend",this.onTouchEnd,!0),a.addEventListener("touchmove",this.onTouchMove,!0),window.addEventListener("mouseup",this.onMouseUp,!0)},b.InteractionManager.prototype.removeEvents=function(){this.interactionDOMElement&&(this.interactionDOMElement.style["-ms-content-zooming"]="",this.interactionDOMElement.style["-ms-touch-action"]="",this.interactionDOMElement.removeEventListener("mousemove",this.onMouseMove,!0),this.interactionDOMElement.removeEventListener("mousedown",this.onMouseDown,!0),this.interactionDOMElement.removeEventListener("mouseout",this.onMouseOut,!0),this.interactionDOMElement.removeEventListener("touchstart",this.onTouchStart,!0),this.interactionDOMElement.removeEventListener("touchend",this.onTouchEnd,!0),this.interactionDOMElement.removeEventListener("touchmove",this.onTouchMove,!0),this.interactionDOMElement=null,window.removeEventListener("mouseup",this.onMouseUp,!0))},b.InteractionManager.prototype.update=function(){if(this.target){var a=Date.now(),c=a-this.last;if(c=c*b.INTERACTION_FREQUENCY/1e3,!(1>c)){this.last=a;var d=0;this.dirty&&this.rebuildInteractiveGraph();var e=this.interactiveItems.length,f="inherit",g=!1;for(d=0;e>d;d++){var h=this.interactiveItems[d];h.__hit=this.hitTest(h,this.mouse),this.mouse.target=h,h.__hit&&!g?(h.buttonMode&&(f=h.defaultCursor),h.interactiveChildren||(g=!0),h.__isOver||(h.mouseover&&h.mouseover(this.mouse),h.__isOver=!0)):h.__isOver&&(h.mouseout&&h.mouseout(this.mouse),h.__isOver=!1)}this.currentCursorStyle!==f&&(this.currentCursorStyle=f,this.interactionDOMElement.style.cursor=f)}}},b.InteractionManager.prototype.rebuildInteractiveGraph=function(){this.dirty=!1;for(var a=this.interactiveItems.length,b=0;a>b;b++)this.interactiveItems[b].interactiveChildren=!1;this.interactiveItems=[],this.stage.interactive&&this.interactiveItems.push(this.stage),this.collectInteractiveSprite(this.stage,this.stage)},b.InteractionManager.prototype.onMouseMove=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;var b=this.interactionDOMElement.getBoundingClientRect();this.mouse.global.x=(a.clientX-b.left)*(this.target.width/b.width)/this.resolution,this.mouse.global.y=(a.clientY-b.top)*(this.target.height/b.height)/this.resolution;for(var c=this.interactiveItems.length,d=0;c>d;d++){var e=this.interactiveItems[d];e.mousemove&&e.mousemove(this.mouse)}},b.InteractionManager.prototype.onMouseDown=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a,b.AUTO_PREVENT_DEFAULT&&this.mouse.originalEvent.preventDefault();for(var c=this.interactiveItems.length,d=this.mouse.originalEvent,e=2===d.button||3===d.which,f=e?"rightdown":"mousedown",g=e?"rightclick":"click",h=e?"__rightIsDown":"__mouseIsDown",i=e?"__isRightDown":"__isDown",j=0;c>j;j++){var k=this.interactiveItems[j];if((k[f]||k[g])&&(k[h]=!0,k.__hit=this.hitTest(k,this.mouse),k.__hit&&(k[f]&&k[f](this.mouse),k[i]=!0,!k.interactiveChildren)))break}},b.InteractionManager.prototype.onMouseOut=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;var b=this.interactiveItems.length;this.interactionDOMElement.style.cursor="inherit";for(var c=0;b>c;c++){var d=this.interactiveItems[c];d.__isOver&&(this.mouse.target=d,d.mouseout&&d.mouseout(this.mouse),d.__isOver=!1)}this.mouseOut=!0,this.mouse.global.x=-1e4,this.mouse.global.y=-1e4},b.InteractionManager.prototype.onMouseUp=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;for(var b=this.interactiveItems.length,c=!1,d=this.mouse.originalEvent,e=2===d.button||3===d.which,f=e?"rightup":"mouseup",g=e?"rightclick":"click",h=e?"rightupoutside":"mouseupoutside",i=e?"__isRightDown":"__isDown",j=0;b>j;j++){var k=this.interactiveItems[j];(k[g]||k[f]||k[h])&&(k.__hit=this.hitTest(k,this.mouse),k.__hit&&!c?(k[f]&&k[f](this.mouse),k[i]&&k[g]&&k[g](this.mouse),k.interactiveChildren||(c=!0)):k[i]&&k[h]&&k[h](this.mouse),k[i]=!1)}},b.InteractionManager.prototype.hitTest=function(a,c){var d=c.global;if(!a.worldVisible)return!1;var e,f=a.worldTransform,g=f.a,h=f.b,i=f.c,j=f.tx,k=f.d,l=f.ty,m=1/(g*k+i*-h),n=k*m*d.x+-i*m*d.y+(l*i-j*k)*m,o=g*m*d.y+-h*m*d.x+(-l*g+j*h)*m;if(c.target=a,a.hitArea&&a.hitArea.contains)return a.hitArea.contains(n,o)?(c.target=a,!0):!1;if(a instanceof b.Sprite){var p,q=a.texture.frame.width,r=a.texture.frame.height,s=-q*a.anchor.x;if(n>s&&s+q>n&&(p=-r*a.anchor.y,o>p&&p+r>o))return c.target=a,!0}else if(a instanceof b.Graphics){var t=a.graphicsData;for(e=0;e<t.length;e++){var u=t[e];if(u.fill&&u.shape&&u.shape.contains(n,o))return c.target=a,!0}}var v=a.children.length;for(e=0;v>e;e++){var w=a.children[e],x=this.hitTest(w,c);if(x)return c.target=a,!0}return!1},b.InteractionManager.prototype.onTouchMove=function(a){this.dirty&&this.rebuildInteractiveGraph();var b,c=this.interactionDOMElement.getBoundingClientRect(),d=a.changedTouches,e=0;for(e=0;e<d.length;e++){var f=d[e];b=this.touches[f.identifier],b.originalEvent=a,b.global.x=(f.clientX-c.left)*(this.target.width/c.width)/this.resolution,b.global.y=(f.clientY-c.top)*(this.target.height/c.height)/this.resolution,!navigator.isCocoonJS||c.left||c.top||a.target.style.width||a.target.style.height||(b.global.x=f.clientX,b.global.y=f.clientY);for(var g=0;g<this.interactiveItems.length;g++){var h=this.interactiveItems[g];h.touchmove&&h.__touchData&&h.__touchData[f.identifier]&&h.touchmove(b)}}},b.InteractionManager.prototype.onTouchStart=function(a){this.dirty&&this.rebuildInteractiveGraph();var c=this.interactionDOMElement.getBoundingClientRect();b.AUTO_PREVENT_DEFAULT&&a.preventDefault();for(var d=a.changedTouches,e=0;e<d.length;e++){var f=d[e],g=this.pool.pop();g||(g=new b.InteractionData),g.originalEvent=a,this.touches[f.identifier]=g,g.global.x=(f.clientX-c.left)*(this.target.width/c.width)/this.resolution,g.global.y=(f.clientY-c.top)*(this.target.height/c.height)/this.resolution,!navigator.isCocoonJS||c.left||c.top||a.target.style.width||a.target.style.height||(g.global.x=f.clientX,g.global.y=f.clientY);for(var h=this.interactiveItems.length,i=0;h>i;i++){var j=this.interactiveItems[i];if((j.touchstart||j.tap)&&(j.__hit=this.hitTest(j,g),j.__hit&&(j.touchstart&&j.touchstart(g),j.__isDown=!0,j.__touchData=j.__touchData||{},j.__touchData[f.identifier]=g,!j.interactiveChildren)))break}}},b.InteractionManager.prototype.onTouchEnd=function(a){this.dirty&&this.rebuildInteractiveGraph();for(var b=this.interactionDOMElement.getBoundingClientRect(),c=a.changedTouches,d=0;d<c.length;d++){var e=c[d],f=this.touches[e.identifier],g=!1;f.global.x=(e.clientX-b.left)*(this.target.width/b.width)/this.resolution,f.global.y=(e.clientY-b.top)*(this.target.height/b.height)/this.resolution,!navigator.isCocoonJS||b.left||b.top||a.target.style.width||a.target.style.height||(f.global.x=e.clientX,f.global.y=e.clientY);for(var h=this.interactiveItems.length,i=0;h>i;i++){var j=this.interactiveItems[i];j.__touchData&&j.__touchData[e.identifier]&&(j.__hit=this.hitTest(j,j.__touchData[e.identifier]),f.originalEvent=a,(j.touchend||j.tap)&&(j.__hit&&!g?(j.touchend&&j.touchend(f),j.__isDown&&j.tap&&j.tap(f),j.interactiveChildren||(g=!0)):j.__isDown&&j.touchendoutside&&j.touchendoutside(f),j.__isDown=!1),j.__touchData[e.identifier]=null)}this.pool.push(f),this.touches[e.identifier]=null}},b.Stage=function(a){b.DisplayObjectContainer.call(this),this.worldTransform=new b.Matrix,this.interactive=!0,this.interactionManager=new b.InteractionManager(this),this.dirty=!0,this.stage=this,this.stage.hitArea=new b.Rectangle(0,0,1e5,1e5),this.setBackgroundColor(a)},b.Stage.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Stage.prototype.constructor=b.Stage,b.Stage.prototype.setInteractionDelegate=function(a){this.interactionManager.setTargetDomElement(a)},b.Stage.prototype.updateTransform=function(){this.worldAlpha=1;for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform();this.dirty&&(this.dirty=!1,this.interactionManager.dirty=!0),this.interactive&&this.interactionManager.update()},b.Stage.prototype.setBackgroundColor=function(a){this.backgroundColor=a||0,this.backgroundColorSplit=b.hex2rgb(this.backgroundColor);var c=this.backgroundColor.toString(16);c="000000".substr(0,6-c.length)+c,this.backgroundColorString="#"+c},b.Stage.prototype.getMousePosition=function(){return this.interactionManager.mouse.global},function(a){for(var b=0,c=["ms","moz","webkit","o"],d=0;d<c.length&&!a.requestAnimationFrame;++d)a.requestAnimationFrame=a[c[d]+"RequestAnimationFrame"],a.cancelAnimationFrame=a[c[d]+"CancelAnimationFrame"]||a[c[d]+"CancelRequestAnimationFrame"];a.requestAnimationFrame||(a.requestAnimationFrame=function(c){var d=(new Date).getTime(),e=Math.max(0,16-(d-b)),f=a.setTimeout(function(){c(d+e)},e);return b=d+e,f}),a.cancelAnimationFrame||(a.cancelAnimationFrame=function(a){clearTimeout(a)}),a.requestAnimFrame=a.requestAnimationFrame}(this),b.hex2rgb=function(a){return[(a>>16&255)/255,(a>>8&255)/255,(255&a)/255]},b.rgb2hex=function(a){return(255*a[0]<<16)+(255*a[1]<<8)+255*a[2]},"function"!=typeof Function.prototype.bind&&(Function.prototype.bind=function(){return function(a){function b(){for(var d=arguments.length,f=new Array(d);d--;)f[d]=arguments[d];return f=e.concat(f),c.apply(this instanceof b?this:a,f)}var c=this,d=arguments.length-1,e=[];if(d>0)for(e.length=d;d--;)e[d]=arguments[d+1];if("function"!=typeof c)throw new TypeError;return b.prototype=function f(a){return a&&(f.prototype=a),this instanceof f?void 0:new f}(c.prototype),b}}()),b.AjaxRequest=function(){var a=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Microsoft.XMLHTTP"];if(!window.ActiveXObject)return window.XMLHttpRequest?new window.XMLHttpRequest:!1;for(var b=0;b<a.length;b++)try{return new window.ActiveXObject(a[b])}catch(c){}},b.canUseNewCanvasBlendModes=function(){if("undefined"==typeof document)return!1;var a=document.createElement("canvas");a.width=1,a.height=1;var b=a.getContext("2d");return b.fillStyle="#000",b.fillRect(0,0,1,1),b.globalCompositeOperation="multiply",b.fillStyle="#fff",b.fillRect(0,0,1,1),0===b.getImageData(0,0,1,1).data[0]},b.getNextPowerOfTwo=function(a){if(a>0&&0===(a&a-1))return a;for(var b=1;a>b;)b<<=1;return b},b.EventTarget={call:function(a){a&&(a=a.prototype||a,b.EventTarget.mixin(a))},mixin:function(a){a.listeners=function(a){return this._listeners=this._listeners||{},this._listeners[a]?this._listeners[a].slice():[]},a.emit=a.dispatchEvent=function(a,c){if(this._listeners=this._listeners||{},"object"==typeof a&&(c=a,a=a.type),c&&c.__isEventObject===!0||(c=new b.Event(this,a,c)),this._listeners&&this._listeners[a]){var d,e=this._listeners[a].slice(0),f=e.length,g=e[0];for(d=0;f>d;g=e[++d])if(g.call(this,c),c.stoppedImmediate)return this;if(c.stopped)return this}return this.parent&&this.parent.emit&&this.parent.emit.call(this.parent,a,c),this},a.on=a.addEventListener=function(a,b){return this._listeners=this._listeners||{},(this._listeners[a]=this._listeners[a]||[]).push(b),this},a.once=function(a,b){function c(){b.apply(d.off(a,c),arguments)}this._listeners=this._listeners||{};var d=this;return c._originalHandler=b,this.on(a,c)},a.off=a.removeEventListener=function(a,b){if(this._listeners=this._listeners||{},!this._listeners[a])return this;for(var c=this._listeners[a],d=b?c.length:0;d-->0;)(c[d]===b||c[d]._originalHandler===b)&&c.splice(d,1);return 0===c.length&&delete this._listeners[a],this},a.removeAllListeners=function(a){return this._listeners=this._listeners||{},this._listeners[a]?(delete this._listeners[a],this):this}}},b.Event=function(a,b,c){this.__isEventObject=!0,this.stopped=!1,this.stoppedImmediate=!1,this.target=a,this.type=b,this.data=c,this.content=c,this.timeStamp=Date.now()},b.Event.prototype.stopPropagation=function(){this.stopped=!0},b.Event.prototype.stopImmediatePropagation=function(){this.stoppedImmediate=!0},b.autoDetectRenderer=function(a,c,d){a||(a=800),c||(c=600);var e=function(){try{var a=document.createElement("canvas");return!!window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))}catch(b){return!1}}();return e?new b.WebGLRenderer(a,c,d):new b.CanvasRenderer(a,c,d)},b.autoDetectRecommendedRenderer=function(a,c,d){a||(a=800),c||(c=600);var e=function(){try{var a=document.createElement("canvas");return!!window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))}catch(b){return!1}}(),f=/Android/i.test(navigator.userAgent);return e&&!f?new b.WebGLRenderer(a,c,d):new b.CanvasRenderer(a,c,d)},b.PolyK={},b.PolyK.Triangulate=function(a){var c=!0,d=a.length>>1;if(3>d)return[];for(var e=[],f=[],g=0;d>g;g++)f.push(g);g=0;for(var h=d;h>3;){var i=f[(g+0)%h],j=f[(g+1)%h],k=f[(g+2)%h],l=a[2*i],m=a[2*i+1],n=a[2*j],o=a[2*j+1],p=a[2*k],q=a[2*k+1],r=!1;if(b.PolyK._convex(l,m,n,o,p,q,c)){r=!0;for(var s=0;h>s;s++){var t=f[s];if(t!==i&&t!==j&&t!==k&&b.PolyK._PointInTriangle(a[2*t],a[2*t+1],l,m,n,o,p,q)){r=!1;break}}}if(r)e.push(i,j,k),f.splice((g+1)%h,1),h--,g=0;else if(g++>3*h){if(!c)return null;for(e=[],f=[],g=0;d>g;g++)f.push(g);g=0,h=d,c=!1}}return e.push(f[0],f[1],f[2]),e},b.PolyK._PointInTriangle=function(a,b,c,d,e,f,g,h){var i=g-c,j=h-d,k=e-c,l=f-d,m=a-c,n=b-d,o=i*i+j*j,p=i*k+j*l,q=i*m+j*n,r=k*k+l*l,s=k*m+l*n,t=1/(o*r-p*p),u=(r*q-p*s)*t,v=(o*s-p*q)*t;return u>=0&&v>=0&&1>u+v},b.PolyK._convex=function(a,b,c,d,e,f,g){return(b-d)*(e-c)+(c-a)*(f-d)>=0===g},b.initDefaultShaders=function(){},b.CompileVertexShader=function(a,c){return b._CompileShader(a,c,a.VERTEX_SHADER)},b.CompileFragmentShader=function(a,c){return b._CompileShader(a,c,a.FRAGMENT_SHADER)},b._CompileShader=function(a,b,c){var d=b.join("\n"),e=a.createShader(c);return a.shaderSource(e,d),a.compileShader(e),a.getShaderParameter(e,a.COMPILE_STATUS)?e:(window.console.log(a.getShaderInfoLog(e)),null)},b.compileProgram=function(a,c,d){var e=b.CompileFragmentShader(a,d),f=b.CompileVertexShader(a,c),g=a.createProgram();return a.attachShader(g,f),a.attachShader(g,e),a.linkProgram(g),a.getProgramParameter(g,a.LINK_STATUS)||window.console.log("Could not initialise shaders"),g},b.PixiShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision lowp float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"],this.textureCount=0,this.firstRun=!0,this.dirty=!0,this.attributes=[],this.init()},b.PixiShader.prototype.constructor=b.PixiShader,b.PixiShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc||b.PixiShader.defaultVertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.dimensions=a.getUniformLocation(c,"dimensions"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.colorAttribute=a.getAttribLocation(c,"aColor"),-1===this.colorAttribute&&(this.colorAttribute=2),this.attributes=[this.aVertexPosition,this.aTextureCoord,this.colorAttribute];for(var d in this.uniforms)this.uniforms[d].uniformLocation=a.getUniformLocation(c,d);this.initUniforms(),this.program=c},b.PixiShader.prototype.initUniforms=function(){this.textureCount=1;var a,b=this.gl;for(var c in this.uniforms){a=this.uniforms[c];var d=a.type;"sampler2D"===d?(a._init=!1,null!==a.value&&this.initSampler2D(a)):"mat2"===d||"mat3"===d||"mat4"===d?(a.glMatrix=!0,a.glValueLength=1,"mat2"===d?a.glFunc=b.uniformMatrix2fv:"mat3"===d?a.glFunc=b.uniformMatrix3fv:"mat4"===d&&(a.glFunc=b.uniformMatrix4fv)):(a.glFunc=b["uniform"+d],a.glValueLength="2f"===d||"2i"===d?2:"3f"===d||"3i"===d?3:"4f"===d||"4i"===d?4:1)}},b.PixiShader.prototype.initSampler2D=function(a){if(a.value&&a.value.baseTexture&&a.value.baseTexture.hasLoaded){var b=this.gl;if(b.activeTexture(b["TEXTURE"+this.textureCount]),b.bindTexture(b.TEXTURE_2D,a.value.baseTexture._glTextures[b.id]),a.textureData){var c=a.textureData,d=c.magFilter?c.magFilter:b.LINEAR,e=c.minFilter?c.minFilter:b.LINEAR,f=c.wrapS?c.wrapS:b.CLAMP_TO_EDGE,g=c.wrapT?c.wrapT:b.CLAMP_TO_EDGE,h=c.luminance?b.LUMINANCE:b.RGBA;if(c.repeat&&(f=b.REPEAT,g=b.REPEAT),b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL,!!c.flipY),c.width){var i=c.width?c.width:512,j=c.height?c.height:2,k=c.border?c.border:0;b.texImage2D(b.TEXTURE_2D,0,h,i,j,k,h,b.UNSIGNED_BYTE,null)}else b.texImage2D(b.TEXTURE_2D,0,h,b.RGBA,b.UNSIGNED_BYTE,a.value.baseTexture.source);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,d),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,e),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,f),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,g)}b.uniform1i(a.uniformLocation,this.textureCount),a._init=!0,this.textureCount++}},b.PixiShader.prototype.syncUniforms=function(){this.textureCount=1;var a,c=this.gl;for(var d in this.uniforms)a=this.uniforms[d],1===a.glValueLength?a.glMatrix===!0?a.glFunc.call(c,a.uniformLocation,a.transpose,a.value):a.glFunc.call(c,a.uniformLocation,a.value):2===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y):3===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y,a.value.z):4===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y,a.value.z,a.value.w):"sampler2D"===a.type&&(a._init?(c.activeTexture(c["TEXTURE"+this.textureCount]),a.value.baseTexture._dirty[c.id]?b.instances[c.id].updateTexture(a.value.baseTexture):c.bindTexture(c.TEXTURE_2D,a.value.baseTexture._glTextures[c.id]),c.uniform1i(a.uniformLocation,this.textureCount),this.textureCount++):this.initSampler2D(a))},b.PixiShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.PixiShader.defaultVertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","attribute vec4 aColor;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","varying vec2 vTextureCoord;","varying vec4 vColor;","const vec2 center = vec2(-1.0, 1.0);","void main(void) {","   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;","   vColor = vec4(color * aColor.x, aColor.x);","}"],b.PixiFastShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision lowp float;","varying vec2 vTextureCoord;","varying float vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aPositionCoord;","attribute vec2 aScale;","attribute float aRotation;","attribute vec2 aTextureCoord;","attribute float aColor;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform mat3 uMatrix;","varying vec2 vTextureCoord;","varying float vColor;","const vec2 center = vec2(-1.0, 1.0);","void main(void) {","   vec2 v;","   vec2 sv = aVertexPosition * aScale;","   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);","   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);","   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;","   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","   vColor = aColor;","}"],this.textureCount=0,this.init()},b.PixiFastShader.prototype.constructor=b.PixiFastShader,b.PixiFastShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.dimensions=a.getUniformLocation(c,"dimensions"),this.uMatrix=a.getUniformLocation(c,"uMatrix"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aPositionCoord=a.getAttribLocation(c,"aPositionCoord"),this.aScale=a.getAttribLocation(c,"aScale"),this.aRotation=a.getAttribLocation(c,"aRotation"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.colorAttribute=a.getAttribLocation(c,"aColor"),-1===this.colorAttribute&&(this.colorAttribute=2),this.attributes=[this.aVertexPosition,this.aPositionCoord,this.aScale,this.aRotation,this.aTextureCoord,this.colorAttribute],this.program=c},b.PixiFastShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.StripShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","uniform float alpha;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * alpha;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","varying vec2 vTextureCoord;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","}"],this.init()},b.StripShader.prototype.constructor=b.StripShader,b.StripShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.colorAttribute=a.getAttribLocation(c,"aColor"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.attributes=[this.aVertexPosition,this.aTextureCoord],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.StripShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attribute=null},b.PrimitiveShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec4 vColor;","void main(void) {","   gl_FragColor = vColor;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec4 aColor;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform float alpha;","uniform vec3 tint;","varying vec4 vColor;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","   vColor = aColor * vec4(tint * alpha, alpha);","}"],this.init()},b.PrimitiveShader.prototype.constructor=b.PrimitiveShader,b.PrimitiveShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.tintColor=a.getUniformLocation(c,"tint"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.colorAttribute=a.getAttribLocation(c,"aColor"),this.attributes=[this.aVertexPosition,this.colorAttribute],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.PrimitiveShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.ComplexPrimitiveShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec4 vColor;","void main(void) {","   gl_FragColor = vColor;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform vec3 tint;","uniform float alpha;","uniform vec3 color;","varying vec4 vColor;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","   vColor = vec4(color * alpha * tint, alpha);","}"],this.init()},b.ComplexPrimitiveShader.prototype.constructor=b.ComplexPrimitiveShader,b.ComplexPrimitiveShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.tintColor=a.getUniformLocation(c,"tint"),this.color=a.getUniformLocation(c,"color"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.attributes=[this.aVertexPosition,this.colorAttribute],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.ComplexPrimitiveShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attribute=null},b.WebGLGraphics=function(){},b.WebGLGraphics.renderGraphics=function(a,c){var d,e=c.gl,f=c.projection,g=c.offset,h=c.shaderManager.primitiveShader;a.dirty&&b.WebGLGraphics.updateGraphics(a,e);for(var i=a._webGL[e.id],j=0;j<i.data.length;j++)1===i.data[j].mode?(d=i.data[j],c.stencilManager.pushStencil(a,d,c),e.drawElements(e.TRIANGLE_FAN,4,e.UNSIGNED_SHORT,2*(d.indices.length-4)),c.stencilManager.popStencil(a,d,c)):(d=i.data[j],c.shaderManager.setShader(h),h=c.shaderManager.primitiveShader,e.uniformMatrix3fv(h.translationMatrix,!1,a.worldTransform.toArray(!0)),e.uniform2f(h.projectionVector,f.x,-f.y),e.uniform2f(h.offsetVector,-g.x,-g.y),e.uniform3fv(h.tintColor,b.hex2rgb(a.tint)),e.uniform1f(h.alpha,a.worldAlpha),e.bindBuffer(e.ARRAY_BUFFER,d.buffer),e.vertexAttribPointer(h.aVertexPosition,2,e.FLOAT,!1,24,0),e.vertexAttribPointer(h.colorAttribute,4,e.FLOAT,!1,24,8),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,d.indexBuffer),e.drawElements(e.TRIANGLE_STRIP,d.indices.length,e.UNSIGNED_SHORT,0))},b.WebGLGraphics.updateGraphics=function(a,c){var d=a._webGL[c.id];d||(d=a._webGL[c.id]={lastIndex:0,data:[],gl:c}),a.dirty=!1;var e;if(a.clearDirty){for(a.clearDirty=!1,e=0;e<d.data.length;e++){var f=d.data[e];f.reset(),b.WebGLGraphics.graphicsDataPool.push(f)}d.data=[],d.lastIndex=0}var g;for(e=d.lastIndex;e<a.graphicsData.length;e++){var h=a.graphicsData[e];if(h.type===b.Graphics.POLY){if(h.points=h.shape.points.slice(),h.shape.closed&&h.points[0]!==h.points[h.points.length-2]&&h.points[1]!==h.points[h.points.length-1]&&h.points.push(h.points[0],h.points[1]),h.fill&&h.points.length>=6)if(h.points.length<12){g=b.WebGLGraphics.switchMode(d,0);var i=b.WebGLGraphics.buildPoly(h,g);i||(g=b.WebGLGraphics.switchMode(d,1),b.WebGLGraphics.buildComplexPoly(h,g))}else g=b.WebGLGraphics.switchMode(d,1),b.WebGLGraphics.buildComplexPoly(h,g);h.lineWidth>0&&(g=b.WebGLGraphics.switchMode(d,0),b.WebGLGraphics.buildLine(h,g))}else g=b.WebGLGraphics.switchMode(d,0),h.type===b.Graphics.RECT?b.WebGLGraphics.buildRectangle(h,g):h.type===b.Graphics.CIRC||h.type===b.Graphics.ELIP?b.WebGLGraphics.buildCircle(h,g):h.type===b.Graphics.RREC&&b.WebGLGraphics.buildRoundedRectangle(h,g);d.lastIndex++}for(e=0;e<d.data.length;e++)g=d.data[e],g.dirty&&g.upload()},b.WebGLGraphics.switchMode=function(a,c){var d;return a.data.length?(d=a.data[a.data.length-1],(d.mode!==c||1===c)&&(d=b.WebGLGraphics.graphicsDataPool.pop()||new b.WebGLGraphicsData(a.gl),d.mode=c,a.data.push(d))):(d=b.WebGLGraphics.graphicsDataPool.pop()||new b.WebGLGraphicsData(a.gl),d.mode=c,a.data.push(d)),d.dirty=!0,d},b.WebGLGraphics.buildRectangle=function(a,c){var d=a.shape,e=d.x,f=d.y,g=d.width,h=d.height;if(a.fill){var i=b.hex2rgb(a.fillColor),j=a.fillAlpha,k=i[0]*j,l=i[1]*j,m=i[2]*j,n=c.points,o=c.indices,p=n.length/6;n.push(e,f),n.push(k,l,m,j),n.push(e+g,f),n.push(k,l,m,j),n.push(e,f+h),n.push(k,l,m,j),n.push(e+g,f+h),n.push(k,l,m,j),o.push(p,p,p+1,p+2,p+3,p+3)}if(a.lineWidth){var q=a.points;a.points=[e,f,e+g,f,e+g,f+h,e,f+h,e,f],b.WebGLGraphics.buildLine(a,c),a.points=q}},b.WebGLGraphics.buildRoundedRectangle=function(a,c){var d=a.shape,e=d.x,f=d.y,g=d.width,h=d.height,i=d.radius,j=[];if(j.push(e,f+i),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e,f+h-i,e,f+h,e+i,f+h)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+g-i,f+h,e+g,f+h,e+g,f+h-i)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+g,f+i,e+g,f,e+g-i,f)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+i,f,e,f,e,f+i)),a.fill){var k=b.hex2rgb(a.fillColor),l=a.fillAlpha,m=k[0]*l,n=k[1]*l,o=k[2]*l,p=c.points,q=c.indices,r=p.length/6,s=b.PolyK.Triangulate(j),t=0;for(t=0;t<s.length;t+=3)q.push(s[t]+r),q.push(s[t]+r),q.push(s[t+1]+r),q.push(s[t+2]+r),q.push(s[t+2]+r);for(t=0;t<j.length;t++)p.push(j[t],j[++t],m,n,o,l)}if(a.lineWidth){var u=a.points;a.points=j,b.WebGLGraphics.buildLine(a,c),a.points=u}},b.WebGLGraphics.quadraticBezierCurve=function(a,b,c,d,e,f){function g(a,b,c){var d=b-a;return a+d*c}for(var h,i,j,k,l,m,n=20,o=[],p=0,q=0;n>=q;q++)p=q/n,h=g(a,c,p),i=g(b,d,p),j=g(c,e,p),k=g(d,f,p),l=g(h,j,p),m=g(i,k,p),o.push(l,m);return o},b.WebGLGraphics.buildCircle=function(a,c){var d,e,f=a.shape,g=f.x,h=f.y;a.type===b.Graphics.CIRC?(d=f.radius,e=f.radius):(d=f.width,e=f.height);var i=40,j=2*Math.PI/i,k=0;if(a.fill){var l=b.hex2rgb(a.fillColor),m=a.fillAlpha,n=l[0]*m,o=l[1]*m,p=l[2]*m,q=c.points,r=c.indices,s=q.length/6;for(r.push(s),k=0;i+1>k;k++)q.push(g,h,n,o,p,m),q.push(g+Math.sin(j*k)*d,h+Math.cos(j*k)*e,n,o,p,m),r.push(s++,s++);r.push(s-1)}if(a.lineWidth){var t=a.points;for(a.points=[],k=0;i+1>k;k++)a.points.push(g+Math.sin(j*k)*d,h+Math.cos(j*k)*e);b.WebGLGraphics.buildLine(a,c),a.points=t}},b.WebGLGraphics.buildLine=function(a,c){var d=0,e=a.points;if(0!==e.length){if(a.lineWidth%2)for(d=0;d<e.length;d++)e[d]+=.5;var f=new b.Point(e[0],e[1]),g=new b.Point(e[e.length-2],e[e.length-1]);if(f.x===g.x&&f.y===g.y){e=e.slice(),e.pop(),e.pop(),g=new b.Point(e[e.length-2],e[e.length-1]);var h=g.x+.5*(f.x-g.x),i=g.y+.5*(f.y-g.y);e.unshift(h,i),e.push(h,i)}var j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G=c.points,H=c.indices,I=e.length/2,J=e.length,K=G.length/6,L=a.lineWidth/2,M=b.hex2rgb(a.lineColor),N=a.lineAlpha,O=M[0]*N,P=M[1]*N,Q=M[2]*N;for(l=e[0],m=e[1],n=e[2],o=e[3],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,G.push(l-r,m-s,O,P,Q,N),G.push(l+r,m+s,O,P,Q,N),d=1;I-1>d;d++)l=e[2*(d-1)],m=e[2*(d-1)+1],n=e[2*d],o=e[2*d+1],p=e[2*(d+1)],q=e[2*(d+1)+1],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,t=-(o-q),u=n-p,F=Math.sqrt(t*t+u*u),t/=F,u/=F,t*=L,u*=L,x=-s+m-(-s+o),y=-r+n-(-r+l),z=(-r+l)*(-s+o)-(-r+n)*(-s+m),A=-u+q-(-u+o),B=-t+n-(-t+p),C=(-t+p)*(-u+o)-(-t+n)*(-u+q),D=x*B-A*y,Math.abs(D)<.1?(D+=10.1,G.push(n-r,o-s,O,P,Q,N),G.push(n+r,o+s,O,P,Q,N)):(j=(y*C-B*z)/D,k=(A*z-x*C)/D,E=(j-n)*(j-n)+(k-o)+(k-o),E>19600?(v=r-t,w=s-u,F=Math.sqrt(v*v+w*w),v/=F,w/=F,v*=L,w*=L,G.push(n-v,o-w),G.push(O,P,Q,N),G.push(n+v,o+w),G.push(O,P,Q,N),G.push(n-v,o-w),G.push(O,P,Q,N),J++):(G.push(j,k),G.push(O,P,Q,N),G.push(n-(j-n),o-(k-o)),G.push(O,P,Q,N)));for(l=e[2*(I-2)],m=e[2*(I-2)+1],n=e[2*(I-1)],o=e[2*(I-1)+1],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,G.push(n-r,o-s),G.push(O,P,Q,N),G.push(n+r,o+s),G.push(O,P,Q,N),H.push(K),d=0;J>d;d++)H.push(K++);
H.push(K-1)}},b.WebGLGraphics.buildComplexPoly=function(a,c){var d=a.points.slice();if(!(d.length<6)){var e=c.indices;c.points=d,c.alpha=a.fillAlpha,c.color=b.hex2rgb(a.fillColor);for(var f,g,h=1/0,i=-1/0,j=1/0,k=-1/0,l=0;l<d.length;l+=2)f=d[l],g=d[l+1],h=h>f?f:h,i=f>i?f:i,j=j>g?g:j,k=g>k?g:k;d.push(h,j,i,j,i,k,h,k);var m=d.length/2;for(l=0;m>l;l++)e.push(l)}},b.WebGLGraphics.buildPoly=function(a,c){var d=a.points;if(!(d.length<6)){var e=c.points,f=c.indices,g=d.length/2,h=b.hex2rgb(a.fillColor),i=a.fillAlpha,j=h[0]*i,k=h[1]*i,l=h[2]*i,m=b.PolyK.Triangulate(d);if(!m)return!1;var n=e.length/6,o=0;for(o=0;o<m.length;o+=3)f.push(m[o]+n),f.push(m[o]+n),f.push(m[o+1]+n),f.push(m[o+2]+n),f.push(m[o+2]+n);for(o=0;g>o;o++)e.push(d[2*o],d[2*o+1],j,k,l,i);return!0}},b.WebGLGraphics.graphicsDataPool=[],b.WebGLGraphicsData=function(a){this.gl=a,this.color=[0,0,0],this.points=[],this.indices=[],this.lastIndex=0,this.buffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.mode=1,this.alpha=1,this.dirty=!0},b.WebGLGraphicsData.prototype.reset=function(){this.points=[],this.indices=[],this.lastIndex=0},b.WebGLGraphicsData.prototype.upload=function(){var a=this.gl;this.glPoints=new b.Float32Array(this.points),a.bindBuffer(a.ARRAY_BUFFER,this.buffer),a.bufferData(a.ARRAY_BUFFER,this.glPoints,a.STATIC_DRAW),this.glIndicies=new b.Uint16Array(this.indices),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.glIndicies,a.STATIC_DRAW),this.dirty=!1},b.glContexts=[],b.instances=[],b.WebGLRenderer=function(a,c,d){if(d)for(var e in b.defaultRenderOptions)"undefined"==typeof d[e]&&(d[e]=b.defaultRenderOptions[e]);else d=b.defaultRenderOptions;b.defaultRenderer||(b.sayHello("webGL"),b.defaultRenderer=this),this.type=b.WEBGL_RENDERER,this.resolution=d.resolution,this.transparent=d.transparent,this.autoResize=d.autoResize||!1,this.preserveDrawingBuffer=d.preserveDrawingBuffer,this.clearBeforeRender=d.clearBeforeRender,this.width=a||800,this.height=c||600,this.view=d.view||document.createElement("canvas"),this.contextLostBound=this.handleContextLost.bind(this),this.contextRestoredBound=this.handleContextRestored.bind(this),this.view.addEventListener("webglcontextlost",this.contextLostBound,!1),this.view.addEventListener("webglcontextrestored",this.contextRestoredBound,!1),this._contextOptions={alpha:this.transparent,antialias:d.antialias,premultipliedAlpha:this.transparent&&"notMultiplied"!==this.transparent,stencil:!0,preserveDrawingBuffer:d.preserveDrawingBuffer},this.projection=new b.Point,this.offset=new b.Point(0,0),this.shaderManager=new b.WebGLShaderManager,this.spriteBatch=new b.WebGLSpriteBatch,this.maskManager=new b.WebGLMaskManager,this.filterManager=new b.WebGLFilterManager,this.stencilManager=new b.WebGLStencilManager,this.blendModeManager=new b.WebGLBlendModeManager,this.renderSession={},this.renderSession.gl=this.gl,this.renderSession.drawCount=0,this.renderSession.shaderManager=this.shaderManager,this.renderSession.maskManager=this.maskManager,this.renderSession.filterManager=this.filterManager,this.renderSession.blendModeManager=this.blendModeManager,this.renderSession.spriteBatch=this.spriteBatch,this.renderSession.stencilManager=this.stencilManager,this.renderSession.renderer=this,this.renderSession.resolution=this.resolution,this.initContext(),this.mapBlendModes()},b.WebGLRenderer.prototype.constructor=b.WebGLRenderer,b.WebGLRenderer.prototype.initContext=function(){var a=this.view.getContext("webgl",this._contextOptions)||this.view.getContext("experimental-webgl",this._contextOptions);if(this.gl=a,!a)throw new Error("This browser does not support webGL. Try using the canvas renderer");this.glContextId=a.id=b.WebGLRenderer.glContextId++,b.glContexts[this.glContextId]=a,b.instances[this.glContextId]=this,a.disable(a.DEPTH_TEST),a.disable(a.CULL_FACE),a.enable(a.BLEND),this.shaderManager.setContext(a),this.spriteBatch.setContext(a),this.maskManager.setContext(a),this.filterManager.setContext(a),this.blendModeManager.setContext(a),this.stencilManager.setContext(a),this.renderSession.gl=this.gl,this.resize(this.width,this.height)},b.WebGLRenderer.prototype.render=function(a){if(!this.contextLost){this.__stage!==a&&(a.interactive&&a.interactionManager.removeEvents(),this.__stage=a),a.updateTransform();var b=this.gl;a._interactive?a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this)):a._interactiveEventsAdded&&(a._interactiveEventsAdded=!1,a.interactionManager.setTarget(this)),b.viewport(0,0,this.width,this.height),b.bindFramebuffer(b.FRAMEBUFFER,null),this.clearBeforeRender&&(this.transparent?b.clearColor(0,0,0,0):b.clearColor(a.backgroundColorSplit[0],a.backgroundColorSplit[1],a.backgroundColorSplit[2],1),b.clear(b.COLOR_BUFFER_BIT)),this.renderDisplayObject(a,this.projection)}},b.WebGLRenderer.prototype.renderDisplayObject=function(a,c,d){this.renderSession.blendModeManager.setBlendMode(b.blendModes.NORMAL),this.renderSession.drawCount=0,this.renderSession.projection=c,this.renderSession.offset=this.offset,this.spriteBatch.begin(this.renderSession),this.filterManager.begin(this.renderSession,d),a._renderWebGL(this.renderSession),this.spriteBatch.end()},b.WebGLRenderer.prototype.resize=function(a,b){this.width=a*this.resolution,this.height=b*this.resolution,this.view.width=this.width,this.view.height=this.height,this.autoResize&&(this.view.style.width=this.width/this.resolution+"px",this.view.style.height=this.height/this.resolution+"px"),this.gl.viewport(0,0,this.width,this.height),this.projection.x=this.width/2/this.resolution,this.projection.y=-this.height/2/this.resolution},b.WebGLRenderer.prototype.updateTexture=function(a){if(a.hasLoaded){var c=this.gl;return a._glTextures[c.id]||(a._glTextures[c.id]=c.createTexture()),c.bindTexture(c.TEXTURE_2D,a._glTextures[c.id]),c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultipliedAlpha),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,a.source),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,a.scaleMode===b.scaleModes.LINEAR?c.LINEAR:c.NEAREST),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,a.scaleMode===b.scaleModes.LINEAR?c.LINEAR:c.NEAREST),a._powerOf2?(c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.REPEAT),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.REPEAT)):(c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.CLAMP_TO_EDGE),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.CLAMP_TO_EDGE)),a._dirty[c.id]=!1,a._glTextures[c.id]}},b.WebGLRenderer.prototype.handleContextLost=function(a){a.preventDefault(),this.contextLost=!0},b.WebGLRenderer.prototype.handleContextRestored=function(){this.initContext();for(var a in b.TextureCache){var c=b.TextureCache[a].baseTexture;c._glTextures=[]}this.contextLost=!1},b.WebGLRenderer.prototype.destroy=function(){this.view.removeEventListener("webglcontextlost",this.contextLostBound),this.view.removeEventListener("webglcontextrestored",this.contextRestoredBound),b.glContexts[this.glContextId]=null,this.projection=null,this.offset=null,this.shaderManager.destroy(),this.spriteBatch.destroy(),this.maskManager.destroy(),this.filterManager.destroy(),this.shaderManager=null,this.spriteBatch=null,this.maskManager=null,this.filterManager=null,this.gl=null,this.renderSession=null},b.WebGLRenderer.prototype.mapBlendModes=function(){var a=this.gl;b.blendModesWebGL||(b.blendModesWebGL=[],b.blendModesWebGL[b.blendModes.NORMAL]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.ADD]=[a.SRC_ALPHA,a.DST_ALPHA],b.blendModesWebGL[b.blendModes.MULTIPLY]=[a.DST_COLOR,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SCREEN]=[a.SRC_ALPHA,a.ONE],b.blendModesWebGL[b.blendModes.OVERLAY]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.DARKEN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.LIGHTEN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR_DODGE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR_BURN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.HARD_LIGHT]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SOFT_LIGHT]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.DIFFERENCE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.EXCLUSION]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.HUE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SATURATION]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.LUMINOSITY]=[a.ONE,a.ONE_MINUS_SRC_ALPHA])},b.WebGLRenderer.glContextId=0,b.WebGLBlendModeManager=function(){this.currentBlendMode=99999},b.WebGLBlendModeManager.prototype.constructor=b.WebGLBlendModeManager,b.WebGLBlendModeManager.prototype.setContext=function(a){this.gl=a},b.WebGLBlendModeManager.prototype.setBlendMode=function(a){if(this.currentBlendMode===a)return!1;this.currentBlendMode=a;var c=b.blendModesWebGL[this.currentBlendMode];return this.gl.blendFunc(c[0],c[1]),!0},b.WebGLBlendModeManager.prototype.destroy=function(){this.gl=null},b.WebGLMaskManager=function(){},b.WebGLMaskManager.prototype.constructor=b.WebGLMaskManager,b.WebGLMaskManager.prototype.setContext=function(a){this.gl=a},b.WebGLMaskManager.prototype.pushMask=function(a,c){var d=c.gl;a.dirty&&b.WebGLGraphics.updateGraphics(a,d),a._webGL[d.id].data.length&&c.stencilManager.pushStencil(a,a._webGL[d.id].data[0],c)},b.WebGLMaskManager.prototype.popMask=function(a,b){var c=this.gl;b.stencilManager.popStencil(a,a._webGL[c.id].data[0],b)},b.WebGLMaskManager.prototype.destroy=function(){this.gl=null},b.WebGLStencilManager=function(){this.stencilStack=[],this.reverse=!0,this.count=0},b.WebGLStencilManager.prototype.setContext=function(a){this.gl=a},b.WebGLStencilManager.prototype.pushStencil=function(a,b,c){var d=this.gl;this.bindGraphics(a,b,c),0===this.stencilStack.length&&(d.enable(d.STENCIL_TEST),d.clear(d.STENCIL_BUFFER_BIT),this.reverse=!0,this.count=0),this.stencilStack.push(b);var e=this.count;d.colorMask(!1,!1,!1,!1),d.stencilFunc(d.ALWAYS,0,255),d.stencilOp(d.KEEP,d.KEEP,d.INVERT),1===b.mode?(d.drawElements(d.TRIANGLE_FAN,b.indices.length-4,d.UNSIGNED_SHORT,0),this.reverse?(d.stencilFunc(d.EQUAL,255-e,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)):(d.stencilFunc(d.EQUAL,e,255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)),d.drawElements(d.TRIANGLE_FAN,4,d.UNSIGNED_SHORT,2*(b.indices.length-4)),this.reverse?d.stencilFunc(d.EQUAL,255-(e+1),255):d.stencilFunc(d.EQUAL,e+1,255),this.reverse=!this.reverse):(this.reverse?(d.stencilFunc(d.EQUAL,e,255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)):(d.stencilFunc(d.EQUAL,255-e,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)),d.drawElements(d.TRIANGLE_STRIP,b.indices.length,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e+1,255):d.stencilFunc(d.EQUAL,255-(e+1),255)),d.colorMask(!0,!0,!0,!0),d.stencilOp(d.KEEP,d.KEEP,d.KEEP),this.count++},b.WebGLStencilManager.prototype.bindGraphics=function(a,c,d){this._currentGraphics=a;var e,f=this.gl,g=d.projection,h=d.offset;1===c.mode?(e=d.shaderManager.complexPrimitiveShader,d.shaderManager.setShader(e),f.uniformMatrix3fv(e.translationMatrix,!1,a.worldTransform.toArray(!0)),f.uniform2f(e.projectionVector,g.x,-g.y),f.uniform2f(e.offsetVector,-h.x,-h.y),f.uniform3fv(e.tintColor,b.hex2rgb(a.tint)),f.uniform3fv(e.color,c.color),f.uniform1f(e.alpha,a.worldAlpha*c.alpha),f.bindBuffer(f.ARRAY_BUFFER,c.buffer),f.vertexAttribPointer(e.aVertexPosition,2,f.FLOAT,!1,8,0),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,c.indexBuffer)):(e=d.shaderManager.primitiveShader,d.shaderManager.setShader(e),f.uniformMatrix3fv(e.translationMatrix,!1,a.worldTransform.toArray(!0)),f.uniform2f(e.projectionVector,g.x,-g.y),f.uniform2f(e.offsetVector,-h.x,-h.y),f.uniform3fv(e.tintColor,b.hex2rgb(a.tint)),f.uniform1f(e.alpha,a.worldAlpha),f.bindBuffer(f.ARRAY_BUFFER,c.buffer),f.vertexAttribPointer(e.aVertexPosition,2,f.FLOAT,!1,24,0),f.vertexAttribPointer(e.colorAttribute,4,f.FLOAT,!1,24,8),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,c.indexBuffer))},b.WebGLStencilManager.prototype.popStencil=function(a,b,c){var d=this.gl;if(this.stencilStack.pop(),this.count--,0===this.stencilStack.length)d.disable(d.STENCIL_TEST);else{var e=this.count;this.bindGraphics(a,b,c),d.colorMask(!1,!1,!1,!1),1===b.mode?(this.reverse=!this.reverse,this.reverse?(d.stencilFunc(d.EQUAL,255-(e+1),255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)):(d.stencilFunc(d.EQUAL,e+1,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)),d.drawElements(d.TRIANGLE_FAN,4,d.UNSIGNED_SHORT,2*(b.indices.length-4)),d.stencilFunc(d.ALWAYS,0,255),d.stencilOp(d.KEEP,d.KEEP,d.INVERT),d.drawElements(d.TRIANGLE_FAN,b.indices.length-4,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e,255):d.stencilFunc(d.EQUAL,255-e,255)):(this.reverse?(d.stencilFunc(d.EQUAL,e+1,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)):(d.stencilFunc(d.EQUAL,255-(e+1),255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)),d.drawElements(d.TRIANGLE_STRIP,b.indices.length,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e,255):d.stencilFunc(d.EQUAL,255-e,255)),d.colorMask(!0,!0,!0,!0),d.stencilOp(d.KEEP,d.KEEP,d.KEEP)}},b.WebGLStencilManager.prototype.destroy=function(){this.stencilStack=null,this.gl=null},b.WebGLShaderManager=function(){this.maxAttibs=10,this.attribState=[],this.tempAttribState=[];for(var a=0;a<this.maxAttibs;a++)this.attribState[a]=!1;this.stack=[]},b.WebGLShaderManager.prototype.constructor=b.WebGLShaderManager,b.WebGLShaderManager.prototype.setContext=function(a){this.gl=a,this.primitiveShader=new b.PrimitiveShader(a),this.complexPrimitiveShader=new b.ComplexPrimitiveShader(a),this.defaultShader=new b.PixiShader(a),this.fastShader=new b.PixiFastShader(a),this.stripShader=new b.StripShader(a),this.setShader(this.defaultShader)},b.WebGLShaderManager.prototype.setAttribs=function(a){var b;for(b=0;b<this.tempAttribState.length;b++)this.tempAttribState[b]=!1;for(b=0;b<a.length;b++){var c=a[b];this.tempAttribState[c]=!0}var d=this.gl;for(b=0;b<this.attribState.length;b++)this.attribState[b]!==this.tempAttribState[b]&&(this.attribState[b]=this.tempAttribState[b],this.tempAttribState[b]?d.enableVertexAttribArray(b):d.disableVertexAttribArray(b))},b.WebGLShaderManager.prototype.setShader=function(a){return this._currentId===a._UID?!1:(this._currentId=a._UID,this.currentShader=a,this.gl.useProgram(a.program),this.setAttribs(a.attributes),!0)},b.WebGLShaderManager.prototype.destroy=function(){this.attribState=null,this.tempAttribState=null,this.primitiveShader.destroy(),this.complexPrimitiveShader.destroy(),this.defaultShader.destroy(),this.fastShader.destroy(),this.stripShader.destroy(),this.gl=null},b.WebGLSpriteBatch=function(){this.vertSize=6,this.size=2e3;var a=4*this.size*this.vertSize,c=6*this.size;this.vertices=new b.Float32Array(a),this.indices=new b.Uint16Array(c),this.lastIndexCount=0;for(var d=0,e=0;c>d;d+=6,e+=4)this.indices[d+0]=e+0,this.indices[d+1]=e+1,this.indices[d+2]=e+2,this.indices[d+3]=e+0,this.indices[d+4]=e+2,this.indices[d+5]=e+3;this.drawing=!1,this.currentBatchSize=0,this.currentBaseTexture=null,this.dirty=!0,this.textures=[],this.blendModes=[],this.shaders=[],this.sprites=[],this.defaultShader=new b.AbstractFilter(["precision lowp float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"])},b.WebGLSpriteBatch.prototype.setContext=function(a){this.gl=a,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.indices,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertices,a.DYNAMIC_DRAW),this.currentBlendMode=99999;var c=new b.PixiShader(a);c.fragmentSrc=this.defaultShader.fragmentSrc,c.uniforms={},c.init(),this.defaultShader.shaders[a.id]=c},b.WebGLSpriteBatch.prototype.begin=function(a){this.renderSession=a,this.shader=this.renderSession.shaderManager.defaultShader,this.start()},b.WebGLSpriteBatch.prototype.end=function(){this.flush()},b.WebGLSpriteBatch.prototype.render=function(a){var b=a.texture;this.currentBatchSize>=this.size&&(this.flush(),this.currentBaseTexture=b.baseTexture);var c=b._uvs;if(c){var d,e,f,g,h=a.worldAlpha,i=a.tint,j=this.vertices,k=a.anchor.x,l=a.anchor.y;if(b.trim){var m=b.trim;e=m.x-k*m.width,d=e+b.crop.width,g=m.y-l*m.height,f=g+b.crop.height}else d=b.frame.width*(1-k),e=b.frame.width*-k,f=b.frame.height*(1-l),g=b.frame.height*-l;var n=4*this.currentBatchSize*this.vertSize,o=b.baseTexture.resolution,p=a.worldTransform,q=p.a/o,r=p.b/o,s=p.c/o,t=p.d/o,u=p.tx,v=p.ty;j[n++]=q*e+s*g+u,j[n++]=t*g+r*e+v,j[n++]=c.x0,j[n++]=c.y0,j[n++]=h,j[n++]=i,j[n++]=q*d+s*g+u,j[n++]=t*g+r*d+v,j[n++]=c.x1,j[n++]=c.y1,j[n++]=h,j[n++]=i,j[n++]=q*d+s*f+u,j[n++]=t*f+r*d+v,j[n++]=c.x2,j[n++]=c.y2,j[n++]=h,j[n++]=i,j[n++]=q*e+s*f+u,j[n++]=t*f+r*e+v,j[n++]=c.x3,j[n++]=c.y3,j[n++]=h,j[n++]=i,this.sprites[this.currentBatchSize++]=a}},b.WebGLSpriteBatch.prototype.renderTilingSprite=function(a){var c=a.tilingTexture;this.currentBatchSize>=this.size&&(this.flush(),this.currentBaseTexture=c.baseTexture),a._uvs||(a._uvs=new b.TextureUvs);var d=a._uvs;a.tilePosition.x%=c.baseTexture.width*a.tileScaleOffset.x,a.tilePosition.y%=c.baseTexture.height*a.tileScaleOffset.y;var e=a.tilePosition.x/(c.baseTexture.width*a.tileScaleOffset.x),f=a.tilePosition.y/(c.baseTexture.height*a.tileScaleOffset.y),g=a.width/c.baseTexture.width/(a.tileScale.x*a.tileScaleOffset.x),h=a.height/c.baseTexture.height/(a.tileScale.y*a.tileScaleOffset.y);d.x0=0-e,d.y0=0-f,d.x1=1*g-e,d.y1=0-f,d.x2=1*g-e,d.y2=1*h-f,d.x3=0-e,d.y3=1*h-f;var i=a.worldAlpha,j=a.tint,k=this.vertices,l=a.width,m=a.height,n=a.anchor.x,o=a.anchor.y,p=l*(1-n),q=l*-n,r=m*(1-o),s=m*-o,t=4*this.currentBatchSize*this.vertSize,u=c.baseTexture.resolution,v=a.worldTransform,w=v.a/u,x=v.b/u,y=v.c/u,z=v.d/u,A=v.tx,B=v.ty;k[t++]=w*q+y*s+A,k[t++]=z*s+x*q+B,k[t++]=d.x0,k[t++]=d.y0,k[t++]=i,k[t++]=j,k[t++]=w*p+y*s+A,k[t++]=z*s+x*p+B,k[t++]=d.x1,k[t++]=d.y1,k[t++]=i,k[t++]=j,k[t++]=w*p+y*r+A,k[t++]=z*r+x*p+B,k[t++]=d.x2,k[t++]=d.y2,k[t++]=i,k[t++]=j,k[t++]=w*q+y*r+A,k[t++]=z*r+x*q+B,k[t++]=d.x3,k[t++]=d.y3,k[t++]=i,k[t++]=j,this.sprites[this.currentBatchSize++]=a},b.WebGLSpriteBatch.prototype.flush=function(){if(0!==this.currentBatchSize){var a,c=this.gl;if(this.dirty){this.dirty=!1,c.activeTexture(c.TEXTURE0),c.bindBuffer(c.ARRAY_BUFFER,this.vertexBuffer),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a=this.defaultShader.shaders[c.id];var d=4*this.vertSize;c.vertexAttribPointer(a.aVertexPosition,2,c.FLOAT,!1,d,0),c.vertexAttribPointer(a.aTextureCoord,2,c.FLOAT,!1,d,8),c.vertexAttribPointer(a.colorAttribute,2,c.FLOAT,!1,d,16)}if(this.currentBatchSize>.5*this.size)c.bufferSubData(c.ARRAY_BUFFER,0,this.vertices);else{var e=this.vertices.subarray(0,4*this.currentBatchSize*this.vertSize);c.bufferSubData(c.ARRAY_BUFFER,0,e)}for(var f,g,h,i,j=0,k=0,l=null,m=this.renderSession.blendModeManager.currentBlendMode,n=null,o=!1,p=!1,q=0,r=this.currentBatchSize;r>q;q++){if(i=this.sprites[q],f=i.texture.baseTexture,g=i.blendMode,h=i.shader||this.defaultShader,o=m!==g,p=n!==h,(l!==f||o||p)&&(this.renderBatch(l,j,k),k=q,j=0,l=f,o&&(m=g,this.renderSession.blendModeManager.setBlendMode(m)),p)){n=h,a=n.shaders[c.id],a||(a=new b.PixiShader(c),a.fragmentSrc=n.fragmentSrc,a.uniforms=n.uniforms,a.init(),n.shaders[c.id]=a),this.renderSession.shaderManager.setShader(a),a.dirty&&a.syncUniforms();var s=this.renderSession.projection;c.uniform2f(a.projectionVector,s.x,s.y);var t=this.renderSession.offset;c.uniform2f(a.offsetVector,t.x,t.y)}j++}this.renderBatch(l,j,k),this.currentBatchSize=0}},b.WebGLSpriteBatch.prototype.renderBatch=function(a,b,c){if(0!==b){var d=this.gl;a._dirty[d.id]?this.renderSession.renderer.updateTexture(a):d.bindTexture(d.TEXTURE_2D,a._glTextures[d.id]),d.drawElements(d.TRIANGLES,6*b,d.UNSIGNED_SHORT,6*c*2),this.renderSession.drawCount++}},b.WebGLSpriteBatch.prototype.stop=function(){this.flush(),this.dirty=!0},b.WebGLSpriteBatch.prototype.start=function(){this.dirty=!0},b.WebGLSpriteBatch.prototype.destroy=function(){this.vertices=null,this.indices=null,this.gl.deleteBuffer(this.vertexBuffer),this.gl.deleteBuffer(this.indexBuffer),this.currentBaseTexture=null,this.gl=null},b.WebGLFastSpriteBatch=function(a){this.vertSize=10,this.maxSize=6e3,this.size=this.maxSize;var c=4*this.size*this.vertSize,d=6*this.maxSize;this.vertices=new b.Float32Array(c),this.indices=new b.Uint16Array(d),this.vertexBuffer=null,this.indexBuffer=null,this.lastIndexCount=0;for(var e=0,f=0;d>e;e+=6,f+=4)this.indices[e+0]=f+0,this.indices[e+1]=f+1,this.indices[e+2]=f+2,this.indices[e+3]=f+0,this.indices[e+4]=f+2,this.indices[e+5]=f+3;this.drawing=!1,this.currentBatchSize=0,this.currentBaseTexture=null,this.currentBlendMode=0,this.renderSession=null,this.shader=null,this.matrix=null,this.setContext(a)},b.WebGLFastSpriteBatch.prototype.constructor=b.WebGLFastSpriteBatch,b.WebGLFastSpriteBatch.prototype.setContext=function(a){this.gl=a,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.indices,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertices,a.DYNAMIC_DRAW)},b.WebGLFastSpriteBatch.prototype.begin=function(a,b){this.renderSession=b,this.shader=this.renderSession.shaderManager.fastShader,this.matrix=a.worldTransform.toArray(!0),this.start()},b.WebGLFastSpriteBatch.prototype.end=function(){this.flush()},b.WebGLFastSpriteBatch.prototype.render=function(a){var b=a.children,c=b[0];if(c.texture._uvs){this.currentBaseTexture=c.texture.baseTexture,c.blendMode!==this.renderSession.blendModeManager.currentBlendMode&&(this.flush(),this.renderSession.blendModeManager.setBlendMode(c.blendMode));for(var d=0,e=b.length;e>d;d++)this.renderSprite(b[d]);this.flush()}},b.WebGLFastSpriteBatch.prototype.renderSprite=function(a){if(a.visible&&(a.texture.baseTexture===this.currentBaseTexture||(this.flush(),this.currentBaseTexture=a.texture.baseTexture,a.texture._uvs))){var b,c,d,e,f,g,h,i,j=this.vertices;if(b=a.texture._uvs,c=a.texture.frame.width,d=a.texture.frame.height,a.texture.trim){var k=a.texture.trim;f=k.x-a.anchor.x*k.width,e=f+a.texture.crop.width,h=k.y-a.anchor.y*k.height,g=h+a.texture.crop.height}else e=a.texture.frame.width*(1-a.anchor.x),f=a.texture.frame.width*-a.anchor.x,g=a.texture.frame.height*(1-a.anchor.y),h=a.texture.frame.height*-a.anchor.y;i=4*this.currentBatchSize*this.vertSize,j[i++]=f,j[i++]=h,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x0,j[i++]=b.y1,j[i++]=a.alpha,j[i++]=e,j[i++]=h,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x1,j[i++]=b.y1,j[i++]=a.alpha,j[i++]=e,j[i++]=g,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x2,j[i++]=b.y2,j[i++]=a.alpha,j[i++]=f,j[i++]=g,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x3,j[i++]=b.y3,j[i++]=a.alpha,this.currentBatchSize++,this.currentBatchSize>=this.size&&this.flush()}},b.WebGLFastSpriteBatch.prototype.flush=function(){if(0!==this.currentBatchSize){var a=this.gl;if(this.currentBaseTexture._glTextures[a.id]||this.renderSession.renderer.updateTexture(this.currentBaseTexture,a),a.bindTexture(a.TEXTURE_2D,this.currentBaseTexture._glTextures[a.id]),this.currentBatchSize>.5*this.size)a.bufferSubData(a.ARRAY_BUFFER,0,this.vertices);else{var b=this.vertices.subarray(0,4*this.currentBatchSize*this.vertSize);a.bufferSubData(a.ARRAY_BUFFER,0,b)}a.drawElements(a.TRIANGLES,6*this.currentBatchSize,a.UNSIGNED_SHORT,0),this.currentBatchSize=0,this.renderSession.drawCount++}},b.WebGLFastSpriteBatch.prototype.stop=function(){this.flush()},b.WebGLFastSpriteBatch.prototype.start=function(){var a=this.gl;a.activeTexture(a.TEXTURE0),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer);var b=this.renderSession.projection;a.uniform2f(this.shader.projectionVector,b.x,b.y),a.uniformMatrix3fv(this.shader.uMatrix,!1,this.matrix);var c=4*this.vertSize;a.vertexAttribPointer(this.shader.aVertexPosition,2,a.FLOAT,!1,c,0),a.vertexAttribPointer(this.shader.aPositionCoord,2,a.FLOAT,!1,c,8),a.vertexAttribPointer(this.shader.aScale,2,a.FLOAT,!1,c,16),a.vertexAttribPointer(this.shader.aRotation,1,a.FLOAT,!1,c,24),a.vertexAttribPointer(this.shader.aTextureCoord,2,a.FLOAT,!1,c,28),a.vertexAttribPointer(this.shader.colorAttribute,1,a.FLOAT,!1,c,36)},b.WebGLFilterManager=function(){this.filterStack=[],this.offsetX=0,this.offsetY=0},b.WebGLFilterManager.prototype.constructor=b.WebGLFilterManager,b.WebGLFilterManager.prototype.setContext=function(a){this.gl=a,this.texturePool=[],this.initShaderBuffers()},b.WebGLFilterManager.prototype.begin=function(a,b){this.renderSession=a,this.defaultShader=a.shaderManager.defaultShader;var c=this.renderSession.projection;this.width=2*c.x,this.height=2*-c.y,this.buffer=b},b.WebGLFilterManager.prototype.pushFilter=function(a){var c=this.gl,d=this.renderSession.projection,e=this.renderSession.offset;a._filterArea=a.target.filterArea||a.target.getBounds(),this.filterStack.push(a);var f=a.filterPasses[0];this.offsetX+=a._filterArea.x,this.offsetY+=a._filterArea.y;var g=this.texturePool.pop();g?g.resize(this.width,this.height):g=new b.FilterTexture(this.gl,this.width,this.height),c.bindTexture(c.TEXTURE_2D,g.texture);var h=a._filterArea,i=f.padding;h.x-=i,h.y-=i,h.width+=2*i,h.height+=2*i,h.x<0&&(h.x=0),h.width>this.width&&(h.width=this.width),h.y<0&&(h.y=0),h.height>this.height&&(h.height=this.height),c.bindFramebuffer(c.FRAMEBUFFER,g.frameBuffer),c.viewport(0,0,h.width,h.height),d.x=h.width/2,d.y=-h.height/2,e.x=-h.x,e.y=-h.y,c.colorMask(!0,!0,!0,!0),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT),a._glFilterTexture=g},b.WebGLFilterManager.prototype.popFilter=function(){var a=this.gl,c=this.filterStack.pop(),d=c._filterArea,e=c._glFilterTexture,f=this.renderSession.projection,g=this.renderSession.offset;if(c.filterPasses.length>1){a.viewport(0,0,d.width,d.height),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),this.vertexArray[0]=0,this.vertexArray[1]=d.height,this.vertexArray[2]=d.width,this.vertexArray[3]=d.height,this.vertexArray[4]=0,this.vertexArray[5]=0,this.vertexArray[6]=d.width,this.vertexArray[7]=0,a.bufferSubData(a.ARRAY_BUFFER,0,this.vertexArray),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),this.uvArray[2]=d.width/this.width,this.uvArray[5]=d.height/this.height,this.uvArray[6]=d.width/this.width,this.uvArray[7]=d.height/this.height,a.bufferSubData(a.ARRAY_BUFFER,0,this.uvArray);var h=e,i=this.texturePool.pop();i||(i=new b.FilterTexture(this.gl,this.width,this.height)),i.resize(this.width,this.height),a.bindFramebuffer(a.FRAMEBUFFER,i.frameBuffer),a.clear(a.COLOR_BUFFER_BIT),a.disable(a.BLEND);for(var j=0;j<c.filterPasses.length-1;j++){var k=c.filterPasses[j];a.bindFramebuffer(a.FRAMEBUFFER,i.frameBuffer),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,h.texture),this.applyFilterPass(k,d,d.width,d.height);var l=h;h=i,i=l}a.enable(a.BLEND),e=h,this.texturePool.push(i)}var m=c.filterPasses[c.filterPasses.length-1];this.offsetX-=d.x,this.offsetY-=d.y;var n=this.width,o=this.height,p=0,q=0,r=this.buffer;if(0===this.filterStack.length)a.colorMask(!0,!0,!0,!0);else{var s=this.filterStack[this.filterStack.length-1];d=s._filterArea,n=d.width,o=d.height,p=d.x,q=d.y,r=s._glFilterTexture.frameBuffer}f.x=n/2,f.y=-o/2,g.x=p,g.y=q,d=c._filterArea;var t=d.x-p,u=d.y-q;a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),this.vertexArray[0]=t,this.vertexArray[1]=u+d.height,this.vertexArray[2]=t+d.width,this.vertexArray[3]=u+d.height,this.vertexArray[4]=t,this.vertexArray[5]=u,this.vertexArray[6]=t+d.width,this.vertexArray[7]=u,a.bufferSubData(a.ARRAY_BUFFER,0,this.vertexArray),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),this.uvArray[2]=d.width/this.width,this.uvArray[5]=d.height/this.height,this.uvArray[6]=d.width/this.width,this.uvArray[7]=d.height/this.height,a.bufferSubData(a.ARRAY_BUFFER,0,this.uvArray),a.viewport(0,0,n,o),a.bindFramebuffer(a.FRAMEBUFFER,r),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,e.texture),this.applyFilterPass(m,d,n,o),this.texturePool.push(e),c._glFilterTexture=null},b.WebGLFilterManager.prototype.applyFilterPass=function(a,c,d,e){var f=this.gl,g=a.shaders[f.id];g||(g=new b.PixiShader(f),g.fragmentSrc=a.fragmentSrc,g.uniforms=a.uniforms,g.init(),a.shaders[f.id]=g),this.renderSession.shaderManager.setShader(g),f.uniform2f(g.projectionVector,d/2,-e/2),f.uniform2f(g.offsetVector,0,0),a.uniforms.dimensions&&(a.uniforms.dimensions.value[0]=this.width,a.uniforms.dimensions.value[1]=this.height,a.uniforms.dimensions.value[2]=this.vertexArray[0],a.uniforms.dimensions.value[3]=this.vertexArray[5]),g.syncUniforms(),f.bindBuffer(f.ARRAY_BUFFER,this.vertexBuffer),f.vertexAttribPointer(g.aVertexPosition,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ARRAY_BUFFER,this.uvBuffer),f.vertexAttribPointer(g.aTextureCoord,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ARRAY_BUFFER,this.colorBuffer),f.vertexAttribPointer(g.colorAttribute,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,this.indexBuffer),f.drawElements(f.TRIANGLES,6,f.UNSIGNED_SHORT,0),this.renderSession.drawCount++},b.WebGLFilterManager.prototype.initShaderBuffers=function(){var a=this.gl;this.vertexBuffer=a.createBuffer(),this.uvBuffer=a.createBuffer(),this.colorBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.vertexArray=new b.Float32Array([0,0,1,0,0,1,1,1]),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertexArray,a.STATIC_DRAW),this.uvArray=new b.Float32Array([0,0,1,0,0,1,1,1]),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),a.bufferData(a.ARRAY_BUFFER,this.uvArray,a.STATIC_DRAW),this.colorArray=new b.Float32Array([1,16777215,1,16777215,1,16777215,1,16777215]),a.bindBuffer(a.ARRAY_BUFFER,this.colorBuffer),a.bufferData(a.ARRAY_BUFFER,this.colorArray,a.STATIC_DRAW),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,1,3,2]),a.STATIC_DRAW)},b.WebGLFilterManager.prototype.destroy=function(){var a=this.gl;this.filterStack=null,this.offsetX=0,this.offsetY=0;for(var b=0;b<this.texturePool.length;b++)this.texturePool[b].destroy();this.texturePool=null,a.deleteBuffer(this.vertexBuffer),a.deleteBuffer(this.uvBuffer),a.deleteBuffer(this.colorBuffer),a.deleteBuffer(this.indexBuffer)},b.FilterTexture=function(a,c,d,e){this.gl=a,this.frameBuffer=a.createFramebuffer(),this.texture=a.createTexture(),e=e||b.scaleModes.DEFAULT,a.bindTexture(a.TEXTURE_2D,this.texture),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,e===b.scaleModes.LINEAR?a.LINEAR:a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,e===b.scaleModes.LINEAR?a.LINEAR:a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.bindFramebuffer(a.FRAMEBUFFER,this.frameBuffer),a.bindFramebuffer(a.FRAMEBUFFER,this.frameBuffer),a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,this.texture,0),this.renderBuffer=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,this.renderBuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.RENDERBUFFER,this.renderBuffer),this.resize(c,d)},b.FilterTexture.prototype.constructor=b.FilterTexture,b.FilterTexture.prototype.clear=function(){var a=this.gl;a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT)},b.FilterTexture.prototype.resize=function(a,b){if(this.width!==a||this.height!==b){this.width=a,this.height=b;var c=this.gl;c.bindTexture(c.TEXTURE_2D,this.texture),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,a,b,0,c.RGBA,c.UNSIGNED_BYTE,null),c.bindRenderbuffer(c.RENDERBUFFER,this.renderBuffer),c.renderbufferStorage(c.RENDERBUFFER,c.DEPTH_STENCIL,a,b)
}},b.FilterTexture.prototype.destroy=function(){var a=this.gl;a.deleteFramebuffer(this.frameBuffer),a.deleteTexture(this.texture),this.frameBuffer=null,this.texture=null},b.CanvasBuffer=function(a,b){this.width=a,this.height=b,this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.canvas.width=a,this.canvas.height=b},b.CanvasBuffer.prototype.constructor=b.CanvasBuffer,b.CanvasBuffer.prototype.clear=function(){this.context.setTransform(1,0,0,1,0,0),this.context.clearRect(0,0,this.width,this.height)},b.CanvasBuffer.prototype.resize=function(a,b){this.width=this.canvas.width=a,this.height=this.canvas.height=b},b.CanvasMaskManager=function(){},b.CanvasMaskManager.prototype.constructor=b.CanvasMaskManager,b.CanvasMaskManager.prototype.pushMask=function(a,c){var d=c.context;d.save();var e=a.alpha,f=a.worldTransform,g=c.resolution;d.setTransform(f.a*g,f.b*g,f.c*g,f.d*g,f.tx*g,f.ty*g),b.CanvasGraphics.renderGraphicsMask(a,d),d.clip(),a.worldAlpha=e},b.CanvasMaskManager.prototype.popMask=function(a){a.context.restore()},b.CanvasTinter=function(){},b.CanvasTinter.getTintedTexture=function(a,c){var d=a.texture;c=b.CanvasTinter.roundColor(c);var e="#"+("00000"+(0|c).toString(16)).substr(-6);if(d.tintCache=d.tintCache||{},d.tintCache[e])return d.tintCache[e];var f=b.CanvasTinter.canvas||document.createElement("canvas");if(b.CanvasTinter.tintMethod(d,c,f),b.CanvasTinter.convertTintToImage){var g=new Image;g.src=f.toDataURL(),d.tintCache[e]=g}else d.tintCache[e]=f,b.CanvasTinter.canvas=null;return f},b.CanvasTinter.tintWithMultiply=function(a,b,c){var d=c.getContext("2d"),e=a.crop;c.width=e.width,c.height=e.height,d.fillStyle="#"+("00000"+(0|b).toString(16)).substr(-6),d.fillRect(0,0,e.width,e.height),d.globalCompositeOperation="multiply",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height),d.globalCompositeOperation="destination-atop",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height)},b.CanvasTinter.tintWithOverlay=function(a,b,c){var d=c.getContext("2d"),e=a.crop;c.width=e.width,c.height=e.height,d.globalCompositeOperation="copy",d.fillStyle="#"+("00000"+(0|b).toString(16)).substr(-6),d.fillRect(0,0,e.width,e.height),d.globalCompositeOperation="destination-atop",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height)},b.CanvasTinter.tintWithPerPixel=function(a,c,d){var e=d.getContext("2d"),f=a.crop;d.width=f.width,d.height=f.height,e.globalCompositeOperation="copy",e.drawImage(a.baseTexture.source,f.x,f.y,f.width,f.height,0,0,f.width,f.height);for(var g=b.hex2rgb(c),h=g[0],i=g[1],j=g[2],k=e.getImageData(0,0,f.width,f.height),l=k.data,m=0;m<l.length;m+=4)l[m+0]*=h,l[m+1]*=i,l[m+2]*=j;e.putImageData(k,0,0)},b.CanvasTinter.roundColor=function(a){var c=b.CanvasTinter.cacheStepsPerColorChannel,d=b.hex2rgb(a);return d[0]=Math.min(255,d[0]/c*c),d[1]=Math.min(255,d[1]/c*c),d[2]=Math.min(255,d[2]/c*c),b.rgb2hex(d)},b.CanvasTinter.cacheStepsPerColorChannel=8,b.CanvasTinter.convertTintToImage=!1,b.CanvasTinter.canUseMultiply=b.canUseNewCanvasBlendModes(),b.CanvasTinter.tintMethod=b.CanvasTinter.canUseMultiply?b.CanvasTinter.tintWithMultiply:b.CanvasTinter.tintWithPerPixel,b.CanvasRenderer=function(a,c,d){if(d)for(var e in b.defaultRenderOptions)"undefined"==typeof d[e]&&(d[e]=b.defaultRenderOptions[e]);else d=b.defaultRenderOptions;b.defaultRenderer||(b.sayHello("Canvas"),b.defaultRenderer=this),this.type=b.CANVAS_RENDERER,this.resolution=d.resolution,this.clearBeforeRender=d.clearBeforeRender,this.transparent=d.transparent,this.autoResize=d.autoResize||!1,this.width=a||800,this.height=c||600,this.width*=this.resolution,this.height*=this.resolution,this.view=d.view||document.createElement("canvas"),this.context=this.view.getContext("2d",{alpha:this.transparent}),this.refresh=!0,this.view.width=this.width*this.resolution,this.view.height=this.height*this.resolution,this.count=0,this.maskManager=new b.CanvasMaskManager,this.renderSession={context:this.context,maskManager:this.maskManager,scaleMode:null,smoothProperty:null,roundPixels:!1},this.mapBlendModes(),this.resize(a,c),"imageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="imageSmoothingEnabled":"webkitImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="webkitImageSmoothingEnabled":"mozImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="mozImageSmoothingEnabled":"oImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="oImageSmoothingEnabled":"msImageSmoothingEnabled"in this.context&&(this.renderSession.smoothProperty="msImageSmoothingEnabled")},b.CanvasRenderer.prototype.constructor=b.CanvasRenderer,b.CanvasRenderer.prototype.render=function(a){a.updateTransform(),this.context.setTransform(1,0,0,1,0,0),this.context.globalAlpha=1,this.renderSession.currentBlendMode=b.blendModes.NORMAL,this.context.globalCompositeOperation=b.blendModesCanvas[b.blendModes.NORMAL],navigator.isCocoonJS&&this.view.screencanvas&&(this.context.fillStyle="black",this.context.clear()),this.clearBeforeRender&&(this.transparent?this.context.clearRect(0,0,this.width,this.height):(this.context.fillStyle=a.backgroundColorString,this.context.fillRect(0,0,this.width,this.height))),this.renderDisplayObject(a),a.interactive&&(a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this)))},b.CanvasRenderer.prototype.destroy=function(a){"undefined"==typeof a&&(a=!0),a&&this.view.parent&&this.view.parent.removeChild(this.view),this.view=null,this.context=null,this.maskManager=null,this.renderSession=null},b.CanvasRenderer.prototype.resize=function(a,b){this.width=a*this.resolution,this.height=b*this.resolution,this.view.width=this.width,this.view.height=this.height,this.autoResize&&(this.view.style.width=this.width/this.resolution+"px",this.view.style.height=this.height/this.resolution+"px")},b.CanvasRenderer.prototype.renderDisplayObject=function(a,b){this.renderSession.context=b||this.context,this.renderSession.resolution=this.resolution,a._renderCanvas(this.renderSession)},b.CanvasRenderer.prototype.mapBlendModes=function(){b.blendModesCanvas||(b.blendModesCanvas=[],b.canUseNewCanvasBlendModes()?(b.blendModesCanvas[b.blendModes.NORMAL]="source-over",b.blendModesCanvas[b.blendModes.ADD]="lighter",b.blendModesCanvas[b.blendModes.MULTIPLY]="multiply",b.blendModesCanvas[b.blendModes.SCREEN]="screen",b.blendModesCanvas[b.blendModes.OVERLAY]="overlay",b.blendModesCanvas[b.blendModes.DARKEN]="darken",b.blendModesCanvas[b.blendModes.LIGHTEN]="lighten",b.blendModesCanvas[b.blendModes.COLOR_DODGE]="color-dodge",b.blendModesCanvas[b.blendModes.COLOR_BURN]="color-burn",b.blendModesCanvas[b.blendModes.HARD_LIGHT]="hard-light",b.blendModesCanvas[b.blendModes.SOFT_LIGHT]="soft-light",b.blendModesCanvas[b.blendModes.DIFFERENCE]="difference",b.blendModesCanvas[b.blendModes.EXCLUSION]="exclusion",b.blendModesCanvas[b.blendModes.HUE]="hue",b.blendModesCanvas[b.blendModes.SATURATION]="saturation",b.blendModesCanvas[b.blendModes.COLOR]="color",b.blendModesCanvas[b.blendModes.LUMINOSITY]="luminosity"):(b.blendModesCanvas[b.blendModes.NORMAL]="source-over",b.blendModesCanvas[b.blendModes.ADD]="lighter",b.blendModesCanvas[b.blendModes.MULTIPLY]="source-over",b.blendModesCanvas[b.blendModes.SCREEN]="source-over",b.blendModesCanvas[b.blendModes.OVERLAY]="source-over",b.blendModesCanvas[b.blendModes.DARKEN]="source-over",b.blendModesCanvas[b.blendModes.LIGHTEN]="source-over",b.blendModesCanvas[b.blendModes.COLOR_DODGE]="source-over",b.blendModesCanvas[b.blendModes.COLOR_BURN]="source-over",b.blendModesCanvas[b.blendModes.HARD_LIGHT]="source-over",b.blendModesCanvas[b.blendModes.SOFT_LIGHT]="source-over",b.blendModesCanvas[b.blendModes.DIFFERENCE]="source-over",b.blendModesCanvas[b.blendModes.EXCLUSION]="source-over",b.blendModesCanvas[b.blendModes.HUE]="source-over",b.blendModesCanvas[b.blendModes.SATURATION]="source-over",b.blendModesCanvas[b.blendModes.COLOR]="source-over",b.blendModesCanvas[b.blendModes.LUMINOSITY]="source-over"))},b.CanvasGraphics=function(){},b.CanvasGraphics.renderGraphics=function(a,c){for(var d=a.worldAlpha,e="",f=0;f<a.graphicsData.length;f++){var g=a.graphicsData[f],h=g.shape;if(c.strokeStyle=e="#"+("00000"+(0|g.lineColor).toString(16)).substr(-6),c.lineWidth=g.lineWidth,g.type===b.Graphics.POLY){c.beginPath();var i=h.points;c.moveTo(i[0],i[1]);for(var j=1;j<i.length/2;j++)c.lineTo(i[2*j],i[2*j+1]);h.closed&&c.lineTo(i[0],i[1]),i[0]===i[i.length-2]&&i[1]===i[i.length-1]&&c.closePath(),g.fill&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke())}else if(g.type===b.Graphics.RECT)(g.fillColor||0===g.fillColor)&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fillRect(h.x,h.y,h.width,h.height)),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.strokeRect(h.x,h.y,h.width,h.height));else if(g.type===b.Graphics.CIRC)c.beginPath(),c.arc(h.x,h.y,h.radius,0,2*Math.PI),c.closePath(),g.fill&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke());else if(g.type===b.Graphics.ELIP){var k=2*h.width,l=2*h.height,m=h.x-k/2,n=h.y-l/2;c.beginPath();var o=.5522848,p=k/2*o,q=l/2*o,r=m+k,s=n+l,t=m+k/2,u=n+l/2;c.moveTo(m,u),c.bezierCurveTo(m,u-q,t-p,n,t,n),c.bezierCurveTo(t+p,n,r,u-q,r,u),c.bezierCurveTo(r,u+q,t+p,s,t,s),c.bezierCurveTo(t-p,s,m,u+q,m,u),c.closePath(),g.fill&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke())}else if(g.type===b.Graphics.RREC){var v=h.x,w=h.y,x=h.width,y=h.height,z=h.radius,A=Math.min(x,y)/2|0;z=z>A?A:z,c.beginPath(),c.moveTo(v,w+z),c.lineTo(v,w+y-z),c.quadraticCurveTo(v,w+y,v+z,w+y),c.lineTo(v+x-z,w+y),c.quadraticCurveTo(v+x,w+y,v+x,w+y-z),c.lineTo(v+x,w+z),c.quadraticCurveTo(v+x,w,v+x-z,w),c.lineTo(v+z,w),c.quadraticCurveTo(v,w,v,w+z),c.closePath(),(g.fillColor||0===g.fillColor)&&(c.globalAlpha=g.fillAlpha*d,c.fillStyle=e="#"+("00000"+(0|g.fillColor).toString(16)).substr(-6),c.fill()),g.lineWidth&&(c.globalAlpha=g.lineAlpha*d,c.stroke())}}},b.CanvasGraphics.renderGraphicsMask=function(a,c){var d=a.graphicsData.length;if(0!==d){d>1&&(d=1,window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object"));for(var e=0;1>e;e++){var f=a.graphicsData[e],g=f.shape;if(f.type===b.Graphics.POLY){c.beginPath();var h=g.points;c.moveTo(h[0],h[1]);for(var i=1;i<h.length/2;i++)c.lineTo(h[2*i],h[2*i+1]);h[0]===h[h.length-2]&&h[1]===h[h.length-1]&&c.closePath()}else if(f.type===b.Graphics.RECT)c.beginPath(),c.rect(g.x,g.y,g.width,g.height),c.closePath();else if(f.type===b.Graphics.CIRC)c.beginPath(),c.arc(g.x,g.y,g.radius,0,2*Math.PI),c.closePath();else if(f.type===b.Graphics.ELIP){var j=2*g.width,k=2*g.height,l=g.x-j/2,m=g.y-k/2;c.beginPath();var n=.5522848,o=j/2*n,p=k/2*n,q=l+j,r=m+k,s=l+j/2,t=m+k/2;c.moveTo(l,t),c.bezierCurveTo(l,t-p,s-o,m,s,m),c.bezierCurveTo(s+o,m,q,t-p,q,t),c.bezierCurveTo(q,t+p,s+o,r,s,r),c.bezierCurveTo(s-o,r,l,t+p,l,t),c.closePath()}else if(f.type===b.Graphics.RREC){var u=g.points,v=u[0],w=u[1],x=u[2],y=u[3],z=u[4],A=Math.min(x,y)/2|0;z=z>A?A:z,c.beginPath(),c.moveTo(v,w+z),c.lineTo(v,w+y-z),c.quadraticCurveTo(v,w+y,v+z,w+y),c.lineTo(v+x-z,w+y),c.quadraticCurveTo(v+x,w+y,v+x,w+y-z),c.lineTo(v+x,w+z),c.quadraticCurveTo(v+x,w,v+x-z,w),c.lineTo(v+z,w),c.quadraticCurveTo(v,w,v,w+z),c.closePath()}}}},b.Graphics=function(){b.DisplayObjectContainer.call(this),this.renderable=!0,this.fillAlpha=1,this.lineWidth=0,this.lineColor=0,this.graphicsData=[],this.tint=16777215,this.blendMode=b.blendModes.NORMAL,this.currentPath=null,this._webGL=[],this.isMask=!1,this.boundsPadding=0,this._localBounds=new b.Rectangle(0,0,1,1),this.dirty=!0,this.webGLDirty=!1,this.cachedSpriteDirty=!1},b.Graphics.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Graphics.prototype.constructor=b.Graphics,Object.defineProperty(b.Graphics.prototype,"cacheAsBitmap",{get:function(){return this._cacheAsBitmap},set:function(a){this._cacheAsBitmap=a,this._cacheAsBitmap?this._generateCachedSprite():(this.destroyCachedSprite(),this.dirty=!0)}}),b.Graphics.prototype.lineStyle=function(a,c,d){if(this.lineWidth=a||0,this.lineColor=c||0,this.lineAlpha=arguments.length<3?1:d,this.currentPath){if(this.currentPath.shape.points.length)return this.drawShape(new b.Polygon(this.currentPath.shape.points.slice(-2))),this;this.currentPath.lineWidth=this.lineWidth,this.currentPath.lineColor=this.lineColor,this.currentPath.lineAlpha=this.lineAlpha}return this},b.Graphics.prototype.moveTo=function(a,c){return this.drawShape(new b.Polygon([a,c])),this},b.Graphics.prototype.lineTo=function(a,b){return this.currentPath.shape.points.push(a,b),this.dirty=!0,this},b.Graphics.prototype.quadraticCurveTo=function(a,b,c,d){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);var e,f,g=20,h=this.currentPath.shape.points;0===h.length&&this.moveTo(0,0);for(var i=h[h.length-2],j=h[h.length-1],k=0,l=1;g>=l;l++)k=l/g,e=i+(a-i)*k,f=j+(b-j)*k,h.push(e+(a+(c-a)*k-e)*k,f+(b+(d-b)*k-f)*k);return this.dirty=!0,this},b.Graphics.prototype.bezierCurveTo=function(a,b,c,d,e,f){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);for(var g,h,i,j,k,l=20,m=this.currentPath.shape.points,n=m[m.length-2],o=m[m.length-1],p=0,q=1;l>=q;q++)p=q/l,g=1-p,h=g*g,i=h*g,j=p*p,k=j*p,m.push(i*n+3*h*p*a+3*g*j*c+k*e,i*o+3*h*p*b+3*g*j*d+k*f);return this.dirty=!0,this},b.Graphics.prototype.arcTo=function(a,b,c,d,e){this.currentPath?0===this.currentPath.shape.points.length&&this.currentPath.shape.points.push(a,b):this.moveTo(a,b);var f=this.currentPath.shape.points,g=f[f.length-2],h=f[f.length-1],i=h-b,j=g-a,k=d-b,l=c-a,m=Math.abs(i*l-j*k);if(1e-8>m||0===e)(f[f.length-2]!==a||f[f.length-1]!==b)&&f.push(a,b);else{var n=i*i+j*j,o=k*k+l*l,p=i*k+j*l,q=e*Math.sqrt(n)/m,r=e*Math.sqrt(o)/m,s=q*p/n,t=r*p/o,u=q*l+r*j,v=q*k+r*i,w=j*(r+s),x=i*(r+s),y=l*(q+t),z=k*(q+t),A=Math.atan2(x-v,w-u),B=Math.atan2(z-v,y-u);this.arc(u+a,v+b,e,A,B,j*k>l*i)}return this.dirty=!0,this},b.Graphics.prototype.arc=function(a,b,c,d,e,f){var g=a+Math.cos(d)*c,h=b+Math.sin(d)*c,i=this.currentPath.shape.points;if(0===i.length?(this.moveTo(g,h),i=this.currentPath.shape.points):(i[i.length-2]!==g||i[i.length-1]!==h)&&i.push(g,h),d===e)return this;!f&&d>=e?e+=2*Math.PI:f&&e>=d&&(d+=2*Math.PI);var j=f?-1*(d-e):e-d,k=Math.abs(j)/(2*Math.PI)*40;if(0===j)return this;for(var l=j/(2*k),m=2*l,n=Math.cos(l),o=Math.sin(l),p=k-1,q=p%1/p,r=0;p>=r;r++){var s=r+q*r,t=l+d+m*s,u=Math.cos(t),v=-Math.sin(t);i.push((n*u+o*v)*c+a,(n*-v+o*u)*c+b)}return this.dirty=!0,this},b.Graphics.prototype.beginFill=function(a,b){return this.filling=!0,this.fillColor=a||0,this.fillAlpha=void 0===b?1:b,this.currentPath&&this.currentPath.shape.points.length<=2&&(this.currentPath.fill=this.filling,this.currentPath.fillColor=this.fillColor,this.currentPath.fillAlpha=this.fillAlpha),this},b.Graphics.prototype.endFill=function(){return this.filling=!1,this.fillColor=null,this.fillAlpha=1,this},b.Graphics.prototype.drawRect=function(a,c,d,e){return this.drawShape(new b.Rectangle(a,c,d,e)),this},b.Graphics.prototype.drawRoundedRect=function(a,c,d,e,f){return this.drawShape(new b.RoundedRectangle(a,c,d,e,f)),this},b.Graphics.prototype.drawCircle=function(a,c,d){return this.drawShape(new b.Circle(a,c,d)),this},b.Graphics.prototype.drawEllipse=function(a,c,d,e){return this.drawShape(new b.Ellipse(a,c,d,e)),this},b.Graphics.prototype.drawPolygon=function(a){return a instanceof Array||(a=Array.prototype.slice.call(arguments)),this.drawShape(new b.Polygon(a)),this},b.Graphics.prototype.clear=function(){return this.lineWidth=0,this.filling=!1,this.dirty=!0,this.clearDirty=!0,this.graphicsData=[],this},b.Graphics.prototype.generateTexture=function(a,c){a=a||1;var d=this.getBounds(),e=new b.CanvasBuffer(d.width*a,d.height*a),f=b.Texture.fromCanvas(e.canvas,c);return f.baseTexture.resolution=a,e.context.scale(a,a),e.context.translate(-d.x,-d.y),b.CanvasGraphics.renderGraphics(this,e.context),f},b.Graphics.prototype._renderWebGL=function(a){if(this.visible!==!1&&0!==this.alpha&&this.isMask!==!0){if(this._cacheAsBitmap)return(this.dirty||this.cachedSpriteDirty)&&(this._generateCachedSprite(),this.updateCachedSpriteTexture(),this.cachedSpriteDirty=!1,this.dirty=!1),this._cachedSprite.worldAlpha=this.worldAlpha,b.Sprite.prototype._renderWebGL.call(this._cachedSprite,a),void 0;if(a.spriteBatch.stop(),a.blendModeManager.setBlendMode(this.blendMode),this._mask&&a.maskManager.pushMask(this._mask,a),this._filters&&a.filterManager.pushFilter(this._filterBlock),this.blendMode!==a.spriteBatch.currentBlendMode){a.spriteBatch.currentBlendMode=this.blendMode;var c=b.blendModesWebGL[a.spriteBatch.currentBlendMode];a.spriteBatch.gl.blendFunc(c[0],c[1])}if(this.webGLDirty&&(this.dirty=!0,this.webGLDirty=!1),b.WebGLGraphics.renderGraphics(this,a),this.children.length){a.spriteBatch.start();for(var d=0,e=this.children.length;e>d;d++)this.children[d]._renderWebGL(a);a.spriteBatch.stop()}this._filters&&a.filterManager.popFilter(),this._mask&&a.maskManager.popMask(this.mask,a),a.drawCount++,a.spriteBatch.start()}},b.Graphics.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha&&this.isMask!==!0){if(this._cacheAsBitmap)return(this.dirty||this.cachedSpriteDirty)&&(this._generateCachedSprite(),this.updateCachedSpriteTexture(),this.cachedSpriteDirty=!1,this.dirty=!1),this._cachedSprite.alpha=this.alpha,b.Sprite.prototype._renderCanvas.call(this._cachedSprite,a),void 0;var c=a.context,d=this.worldTransform;this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,c.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]),this._mask&&a.maskManager.pushMask(this._mask,a);var e=a.resolution;c.setTransform(d.a*e,d.b*e,d.c*e,d.d*e,d.tx*e,d.ty*e),b.CanvasGraphics.renderGraphics(this,c);for(var f=0,g=this.children.length;g>f;f++)this.children[f]._renderCanvas(a);this._mask&&a.maskManager.popMask(a)}},b.Graphics.prototype.getBounds=function(a){if(this.isMask)return b.EmptyRectangle;this.dirty&&(this.updateLocalBounds(),this.webGLDirty=!0,this.cachedSpriteDirty=!0,this.dirty=!1);var c=this._localBounds,d=c.x,e=c.width+c.x,f=c.y,g=c.height+c.y,h=a||this.worldTransform,i=h.a,j=h.b,k=h.c,l=h.d,m=h.tx,n=h.ty,o=i*e+k*g+m,p=l*g+j*e+n,q=i*d+k*g+m,r=l*g+j*d+n,s=i*d+k*f+m,t=l*f+j*d+n,u=i*e+k*f+m,v=l*f+j*e+n,w=o,x=p,y=o,z=p;return y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,z=z>r?r:z,z=z>t?t:z,z=z>v?v:z,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w,x=r>x?r:x,x=t>x?t:x,x=v>x?v:x,this._bounds.x=y,this._bounds.width=w-y,this._bounds.y=z,this._bounds.height=x-z,this._bounds},b.Graphics.prototype.updateLocalBounds=function(){var a=1/0,c=-1/0,d=1/0,e=-1/0;if(this.graphicsData.length)for(var f,g,h,i,j,k,l=0;l<this.graphicsData.length;l++){var m=this.graphicsData[l],n=m.type,o=m.lineWidth;if(f=m.shape,n===b.Graphics.RECT||n===b.Graphics.RREC)h=f.x-o/2,i=f.y-o/2,j=f.width+o,k=f.height+o,a=a>h?h:a,c=h+j>c?h+j:c,d=d>i?i:d,e=i+k>e?i+k:e;else if(n===b.Graphics.CIRC)h=f.x,i=f.y,j=f.radius+o/2,k=f.radius+o/2,a=a>h-j?h-j:a,c=h+j>c?h+j:c,d=d>i-k?i-k:d,e=i+k>e?i+k:e;else if(n===b.Graphics.ELIP)h=f.x,i=f.y,j=f.width+o/2,k=f.height+o/2,a=a>h-j?h-j:a,c=h+j>c?h+j:c,d=d>i-k?i-k:d,e=i+k>e?i+k:e;else{g=f.points;for(var p=0;p<g.length;p+=2)h=g[p],i=g[p+1],a=a>h-o?h-o:a,c=h+o>c?h+o:c,d=d>i-o?i-o:d,e=i+o>e?i+o:e}}else a=0,c=0,d=0,e=0;var q=this.boundsPadding;this._localBounds.x=a-q,this._localBounds.width=c-a+2*q,this._localBounds.y=d-q,this._localBounds.height=e-d+2*q},b.Graphics.prototype._generateCachedSprite=function(){var a=this.getLocalBounds();if(this._cachedSprite)this._cachedSprite.buffer.resize(a.width,a.height);else{var c=new b.CanvasBuffer(a.width,a.height),d=b.Texture.fromCanvas(c.canvas);this._cachedSprite=new b.Sprite(d),this._cachedSprite.buffer=c,this._cachedSprite.worldTransform=this.worldTransform}this._cachedSprite.anchor.x=-(a.x/a.width),this._cachedSprite.anchor.y=-(a.y/a.height),this._cachedSprite.buffer.context.translate(-a.x,-a.y),this.worldAlpha=1,b.CanvasGraphics.renderGraphics(this,this._cachedSprite.buffer.context),this._cachedSprite.alpha=this.alpha},b.Graphics.prototype.updateCachedSpriteTexture=function(){var a=this._cachedSprite,b=a.texture,c=a.buffer.canvas;b.baseTexture.width=c.width,b.baseTexture.height=c.height,b.crop.width=b.frame.width=c.width,b.crop.height=b.frame.height=c.height,a._width=c.width,a._height=c.height,b.baseTexture.dirty()},b.Graphics.prototype.destroyCachedSprite=function(){this._cachedSprite.texture.destroy(!0),this._cachedSprite=null},b.Graphics.prototype.drawShape=function(a){this.currentPath&&this.currentPath.shape.points.length<=2&&this.graphicsData.pop(),this.currentPath=null;var c=new b.GraphicsData(this.lineWidth,this.lineColor,this.lineAlpha,this.fillColor,this.fillAlpha,this.filling,a);return this.graphicsData.push(c),c.type===b.Graphics.POLY&&(c.shape.closed=this.filling,this.currentPath=c),this.dirty=!0,c},b.GraphicsData=function(a,b,c,d,e,f,g){this.lineWidth=a,this.lineColor=b,this.lineAlpha=c,this.fillColor=d,this.fillAlpha=e,this.fill=f,this.shape=g,this.type=g.type},b.Graphics.POLY=0,b.Graphics.RECT=1,b.Graphics.CIRC=2,b.Graphics.ELIP=3,b.Graphics.RREC=4,b.Polygon.prototype.type=b.Graphics.POLY,b.Rectangle.prototype.type=b.Graphics.RECT,b.Circle.prototype.type=b.Graphics.CIRC,b.Ellipse.prototype.type=b.Graphics.ELIP,b.RoundedRectangle.prototype.type=b.Graphics.RREC,b.Strip=function(a){b.DisplayObjectContainer.call(this),this.texture=a,this.uvs=new b.Float32Array([0,1,1,1,1,0,0,1]),this.verticies=new b.Float32Array([0,0,100,0,100,100,0,100]),this.colors=new b.Float32Array([1,1,1,1]),this.indices=new b.Uint16Array([0,1,2,3]),this.dirty=!0,this.blendMode=b.blendModes.NORMAL,this.padding=0},b.Strip.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Strip.prototype.constructor=b.Strip,b.Strip.prototype._renderWebGL=function(a){!this.visible||this.alpha<=0||(a.spriteBatch.stop(),this._vertexBuffer||this._initWebGL(a),a.shaderManager.setShader(a.shaderManager.stripShader),this._renderStrip(a),a.spriteBatch.start())},b.Strip.prototype._initWebGL=function(a){var b=a.gl;this._vertexBuffer=b.createBuffer(),this._indexBuffer=b.createBuffer(),this._uvBuffer=b.createBuffer(),this._colorBuffer=b.createBuffer(),b.bindBuffer(b.ARRAY_BUFFER,this._vertexBuffer),b.bufferData(b.ARRAY_BUFFER,this.verticies,b.DYNAMIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,this._uvBuffer),b.bufferData(b.ARRAY_BUFFER,this.uvs,b.STATIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,this._colorBuffer),b.bufferData(b.ARRAY_BUFFER,this.colors,b.STATIC_DRAW),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,this._indexBuffer),b.bufferData(b.ELEMENT_ARRAY_BUFFER,this.indices,b.STATIC_DRAW)},b.Strip.prototype._renderStrip=function(a){var b=a.gl,c=a.projection,d=a.offset,e=a.shaderManager.stripShader;a.blendModeManager.setBlendMode(this.blendMode),b.uniformMatrix3fv(e.translationMatrix,!1,this.worldTransform.toArray(!0)),b.uniform2f(e.projectionVector,c.x,-c.y),b.uniform2f(e.offsetVector,-d.x,-d.y),b.uniform1f(e.alpha,this.worldAlpha),this.dirty?(this.dirty=!1,b.bindBuffer(b.ARRAY_BUFFER,this._vertexBuffer),b.bufferData(b.ARRAY_BUFFER,this.verticies,b.STATIC_DRAW),b.vertexAttribPointer(e.aVertexPosition,2,b.FLOAT,!1,0,0),b.bindBuffer(b.ARRAY_BUFFER,this._uvBuffer),b.bufferData(b.ARRAY_BUFFER,this.uvs,b.STATIC_DRAW),b.vertexAttribPointer(e.aTextureCoord,2,b.FLOAT,!1,0,0),b.activeTexture(b.TEXTURE0),this.texture.baseTexture._dirty[b.id]?a.renderer.updateTexture(this.texture.baseTexture):b.bindTexture(b.TEXTURE_2D,this.texture.baseTexture._glTextures[b.id]),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,this._indexBuffer),b.bufferData(b.ELEMENT_ARRAY_BUFFER,this.indices,b.STATIC_DRAW)):(b.bindBuffer(b.ARRAY_BUFFER,this._vertexBuffer),b.bufferSubData(b.ARRAY_BUFFER,0,this.verticies),b.vertexAttribPointer(e.aVertexPosition,2,b.FLOAT,!1,0,0),b.bindBuffer(b.ARRAY_BUFFER,this._uvBuffer),b.vertexAttribPointer(e.aTextureCoord,2,b.FLOAT,!1,0,0),b.activeTexture(b.TEXTURE0),this.texture.baseTexture._dirty[b.id]?a.renderer.updateTexture(this.texture.baseTexture):b.bindTexture(b.TEXTURE_2D,this.texture.baseTexture._glTextures[b.id]),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,this._indexBuffer)),b.drawElements(b.TRIANGLE_STRIP,this.indices.length,b.UNSIGNED_SHORT,0)},b.Strip.prototype._renderCanvas=function(a){var b=a.context,c=this.worldTransform;a.roundPixels?b.setTransform(c.a,c.b,c.c,c.d,0|c.tx,0|c.ty):b.setTransform(c.a,c.b,c.c,c.d,c.tx,c.ty);var d=this,e=d.verticies,f=d.uvs,g=e.length/2;this.count++;for(var h=0;g-2>h;h++){var i=2*h,j=e[i],k=e[i+2],l=e[i+4],m=e[i+1],n=e[i+3],o=e[i+5];if(this.padding>0){var p=(j+k+l)/3,q=(m+n+o)/3,r=j-p,s=m-q,t=Math.sqrt(r*r+s*s);j=p+r/t*(t+3),m=q+s/t*(t+3),r=k-p,s=n-q,t=Math.sqrt(r*r+s*s),k=p+r/t*(t+3),n=q+s/t*(t+3),r=l-p,s=o-q,t=Math.sqrt(r*r+s*s),l=p+r/t*(t+3),o=q+s/t*(t+3)}var u=f[i]*d.texture.width,v=f[i+2]*d.texture.width,w=f[i+4]*d.texture.width,x=f[i+1]*d.texture.height,y=f[i+3]*d.texture.height,z=f[i+5]*d.texture.height;b.save(),b.beginPath(),b.moveTo(j,m),b.lineTo(k,n),b.lineTo(l,o),b.closePath(),b.clip();var A=u*y+x*w+v*z-y*w-x*v-u*z,B=j*y+x*l+k*z-y*l-x*k-j*z,C=u*k+j*w+v*l-k*w-j*v-u*l,D=u*y*l+x*k*w+j*v*z-j*y*w-x*v*l-u*k*z,E=m*y+x*o+n*z-y*o-x*n-m*z,F=u*n+m*w+v*o-n*w-m*v-u*o,G=u*y*o+x*n*w+m*v*z-m*y*w-x*v*o-u*n*z;b.transform(B/A,E/A,C/A,F/A,D/A,G/A),b.drawImage(d.texture.baseTexture.source,0,0),b.restore()}},b.Strip.prototype.renderStripFlat=function(a){var b=this.context,c=a.verticies,d=c.length/2;this.count++,b.beginPath();for(var e=1;d-2>e;e++){var f=2*e,g=c[f],h=c[f+2],i=c[f+4],j=c[f+1],k=c[f+3],l=c[f+5];b.moveTo(g,j),b.lineTo(h,k),b.lineTo(i,l)}b.fillStyle="#FF0000",b.fill(),b.closePath()},b.Strip.prototype.onTextureUpdate=function(){this.updateFrame=!0},b.Rope=function(a,c){b.Strip.call(this,a),this.points=c,this.verticies=new b.Float32Array(4*c.length),this.uvs=new b.Float32Array(4*c.length),this.colors=new b.Float32Array(2*c.length),this.indices=new b.Uint16Array(2*c.length),this.refresh()},b.Rope.prototype=Object.create(b.Strip.prototype),b.Rope.prototype.constructor=b.Rope,b.Rope.prototype.refresh=function(){var a=this.points;if(!(a.length<1)){var b=this.uvs,c=a[0],d=this.indices,e=this.colors;this.count-=.2,b[0]=0,b[1]=0,b[2]=0,b[3]=1,e[0]=1,e[1]=1,d[0]=0,d[1]=1;for(var f,g,h,i=a.length,j=1;i>j;j++)f=a[j],g=4*j,h=j/(i-1),j%2?(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1):(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1),g=2*j,e[g]=1,e[g+1]=1,g=2*j,d[g]=g,d[g+1]=g+1,c=f}},b.Rope.prototype.updateTransform=function(){var a=this.points;if(!(a.length<1)){var c,d=a[0],e={x:0,y:0};this.count-=.2;for(var f,g,h,i,j,k=this.verticies,l=a.length,m=0;l>m;m++)f=a[m],g=4*m,c=m<a.length-1?a[m+1]:f,e.y=-(c.x-d.x),e.x=c.y-d.y,h=10*(1-m/(l-1)),h>1&&(h=1),i=Math.sqrt(e.x*e.x+e.y*e.y),j=this.texture.height/2,e.x/=i,e.y/=i,e.x*=j,e.y*=j,k[g]=f.x+e.x,k[g+1]=f.y+e.y,k[g+2]=f.x-e.x,k[g+3]=f.y-e.y,d=f;b.DisplayObjectContainer.prototype.updateTransform.call(this)}},b.Rope.prototype.setTexture=function(a){this.texture=a},b.TilingSprite=function(a,c,d){b.Sprite.call(this,a),this._width=c||100,this._height=d||100,this.tileScale=new b.Point(1,1),this.tileScaleOffset=new b.Point(1,1),this.tilePosition=new b.Point(0,0),this.renderable=!0,this.tint=16777215,this.blendMode=b.blendModes.NORMAL},b.TilingSprite.prototype=Object.create(b.Sprite.prototype),b.TilingSprite.prototype.constructor=b.TilingSprite,Object.defineProperty(b.TilingSprite.prototype,"width",{get:function(){return this._width},set:function(a){this._width=a}}),Object.defineProperty(b.TilingSprite.prototype,"height",{get:function(){return this._height},set:function(a){this._height=a}}),b.TilingSprite.prototype.setTexture=function(a){this.texture!==a&&(this.texture=a,this.refreshTexture=!0,this.cachedTint=16777215)},b.TilingSprite.prototype._renderWebGL=function(a){if(this.visible!==!1&&0!==this.alpha){var c,d;for(this._mask&&(a.spriteBatch.stop(),a.maskManager.pushMask(this.mask,a),a.spriteBatch.start()),this._filters&&(a.spriteBatch.flush(),a.filterManager.pushFilter(this._filterBlock)),!this.tilingTexture||this.refreshTexture?(this.generateTilingTexture(!0),this.tilingTexture&&this.tilingTexture.needsUpdate&&(b.updateWebGLTexture(this.tilingTexture.baseTexture,a.gl),this.tilingTexture.needsUpdate=!1)):a.spriteBatch.renderTilingSprite(this),c=0,d=this.children.length;d>c;c++)this.children[c]._renderWebGL(a);a.spriteBatch.stop(),this._filters&&a.filterManager.popFilter(),this._mask&&a.maskManager.popMask(this._mask,a),a.spriteBatch.start()}},b.TilingSprite.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha){var c=a.context;this._mask&&a.maskManager.pushMask(this._mask,c),c.globalAlpha=this.worldAlpha;var d,e,f=this.worldTransform,g=a.resolution;if(c.setTransform(f.a*g,f.c*g,f.b*g,f.d*g,f.tx*g,f.ty*g),!this.__tilePattern||this.refreshTexture){if(this.generateTilingTexture(!1),!this.tilingTexture)return;this.__tilePattern=c.createPattern(this.tilingTexture.baseTexture.source,"repeat")}this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,c.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]);var h=this.tilePosition,i=this.tileScale;for(h.x%=this.tilingTexture.baseTexture.width,h.y%=this.tilingTexture.baseTexture.height,c.scale(i.x,i.y),c.translate(h.x+this.anchor.x*-this._width,h.y+this.anchor.y*-this._height),c.fillStyle=this.__tilePattern,c.fillRect(-h.x,-h.y,this._width/i.x,this._height/i.y),c.scale(1/i.x,1/i.y),c.translate(-h.x+this.anchor.x*this._width,-h.y+this.anchor.y*this._height),this._mask&&a.maskManager.popMask(a.context),d=0,e=this.children.length;e>d;d++)this.children[d]._renderCanvas(a)}},b.TilingSprite.prototype.getBounds=function(){var a=this._width,b=this._height,c=a*(1-this.anchor.x),d=a*-this.anchor.x,e=b*(1-this.anchor.y),f=b*-this.anchor.y,g=this.worldTransform,h=g.a,i=g.b,j=g.c,k=g.d,l=g.tx,m=g.ty,n=h*d+j*f+l,o=k*f+i*d+m,p=h*c+j*f+l,q=k*f+i*c+m,r=h*c+j*e+l,s=k*e+i*c+m,t=h*d+j*e+l,u=k*e+i*d+m,v=-1/0,w=-1/0,x=1/0,y=1/0;x=x>n?n:x,x=x>p?p:x,x=x>r?r:x,x=x>t?t:x,y=y>o?o:y,y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,v=n>v?n:v,v=p>v?p:v,v=r>v?r:v,v=t>v?t:v,w=o>w?o:w,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w;var z=this._bounds;return z.x=x,z.width=v-x,z.y=y,z.height=w-y,this._currentBounds=z,z},b.TilingSprite.prototype.onTextureUpdate=function(){},b.TilingSprite.prototype.generateTilingTexture=function(a){if(this.texture.baseTexture.hasLoaded){var c,d,e=this.originalTexture||this.texture,f=e.frame,g=f.width!==e.baseTexture.width||f.height!==e.baseTexture.height,h=!1;if(a?(c=b.getNextPowerOfTwo(f.width),d=b.getNextPowerOfTwo(f.height),(f.width!==c||f.height!==d)&&(h=!0)):g&&(c=f.width,d=f.height,h=!0),h){var i;this.tilingTexture&&this.tilingTexture.isTiling?(i=this.tilingTexture.canvasBuffer,i.resize(c,d),this.tilingTexture.baseTexture.width=c,this.tilingTexture.baseTexture.height=d,this.tilingTexture.needsUpdate=!0):(i=new b.CanvasBuffer(c,d),this.tilingTexture=b.Texture.fromCanvas(i.canvas),this.tilingTexture.canvasBuffer=i,this.tilingTexture.isTiling=!0),i.context.drawImage(e.baseTexture.source,e.crop.x,e.crop.y,e.crop.width,e.crop.height,0,0,c,d),this.tileScaleOffset.x=f.width/c,this.tileScaleOffset.y=f.height/d}else this.tilingTexture&&this.tilingTexture.isTiling&&this.tilingTexture.destroy(!0),this.tileScaleOffset.x=1,this.tileScaleOffset.y=1,this.tilingTexture=e;this.refreshTexture=!1,this.originalTexture=this.texture,this.texture=this.tilingTexture,this.tilingTexture.baseTexture._powerOf2=!0}};var c={};c.BoneData=function(a,b){this.name=a,this.parent=b},c.BoneData.prototype={length:0,x:0,y:0,rotation:0,scaleX:1,scaleY:1},c.SlotData=function(a,b){this.name=a,this.boneData=b},c.SlotData.prototype={r:1,g:1,b:1,a:1,attachmentName:null},c.Bone=function(a,b){this.data=a,this.parent=b,this.setToSetupPose()
},c.Bone.yDown=!1,c.Bone.prototype={x:0,y:0,rotation:0,scaleX:1,scaleY:1,m00:0,m01:0,worldX:0,m10:0,m11:0,worldY:0,worldRotation:0,worldScaleX:1,worldScaleY:1,updateWorldTransform:function(a,b){var d=this.parent;null!=d?(this.worldX=this.x*d.m00+this.y*d.m01+d.worldX,this.worldY=this.x*d.m10+this.y*d.m11+d.worldY,this.worldScaleX=d.worldScaleX*this.scaleX,this.worldScaleY=d.worldScaleY*this.scaleY,this.worldRotation=d.worldRotation+this.rotation):(this.worldX=this.x,this.worldY=this.y,this.worldScaleX=this.scaleX,this.worldScaleY=this.scaleY,this.worldRotation=this.rotation);var e=this.worldRotation*Math.PI/180,f=Math.cos(e),g=Math.sin(e);this.m00=f*this.worldScaleX,this.m10=g*this.worldScaleX,this.m01=-g*this.worldScaleY,this.m11=f*this.worldScaleY,a&&(this.m00=-this.m00,this.m01=-this.m01),b&&(this.m10=-this.m10,this.m11=-this.m11),c.Bone.yDown&&(this.m10=-this.m10,this.m11=-this.m11)},setToSetupPose:function(){var a=this.data;this.x=a.x,this.y=a.y,this.rotation=a.rotation,this.scaleX=a.scaleX,this.scaleY=a.scaleY}},c.Slot=function(a,b,c){this.data=a,this.skeleton=b,this.bone=c,this.setToSetupPose()},c.Slot.prototype={r:1,g:1,b:1,a:1,_attachmentTime:0,attachment:null,setAttachment:function(a){this.attachment=a,this._attachmentTime=this.skeleton.time},setAttachmentTime:function(a){this._attachmentTime=this.skeleton.time-a},getAttachmentTime:function(){return this.skeleton.time-this._attachmentTime},setToSetupPose:function(){var a=this.data;this.r=a.r,this.g=a.g,this.b=a.b,this.a=a.a;for(var b=this.skeleton.data.slots,c=0,d=b.length;d>c;c++)if(b[c]==a){this.setAttachment(a.attachmentName?this.skeleton.getAttachmentBySlotIndex(c,a.attachmentName):null);break}}},c.Skin=function(a){this.name=a,this.attachments={}},c.Skin.prototype={addAttachment:function(a,b,c){this.attachments[a+":"+b]=c},getAttachment:function(a,b){return this.attachments[a+":"+b]},_attachAll:function(a,b){for(var c in b.attachments){var d=c.indexOf(":"),e=parseInt(c.substring(0,d),10),f=c.substring(d+1),g=a.slots[e];if(g.attachment&&g.attachment.name==f){var h=this.getAttachment(e,f);h&&g.setAttachment(h)}}}},c.Animation=function(a,b,c){this.name=a,this.timelines=b,this.duration=c},c.Animation.prototype={apply:function(a,b,c){c&&this.duration&&(b%=this.duration);for(var d=this.timelines,e=0,f=d.length;f>e;e++)d[e].apply(a,b,1)},mix:function(a,b,c,d){c&&this.duration&&(b%=this.duration);for(var e=this.timelines,f=0,g=e.length;g>f;f++)e[f].apply(a,b,d)}},c.binarySearch=function(a,b,c){var d=0,e=Math.floor(a.length/c)-2;if(!e)return c;for(var f=e>>>1;;){if(a[(f+1)*c]<=b?d=f+1:e=f,d==e)return(d+1)*c;f=d+e>>>1}},c.linearSearch=function(a,b,c){for(var d=0,e=a.length-c;e>=d;d+=c)if(a[d]>b)return d;return-1},c.Curves=function(a){this.curves=[],this.curves.length=6*(a-1)},c.Curves.prototype={setLinear:function(a){this.curves[6*a]=0},setStepped:function(a){this.curves[6*a]=-1},setCurve:function(a,b,c,d,e){var f=.1,g=f*f,h=g*f,i=3*f,j=3*g,k=6*g,l=6*h,m=2*-b+d,n=2*-c+e,o=3*(b-d)+1,p=3*(c-e)+1,q=6*a,r=this.curves;r[q]=b*i+m*j+o*h,r[q+1]=c*i+n*j+p*h,r[q+2]=m*k+o*l,r[q+3]=n*k+p*l,r[q+4]=o*l,r[q+5]=p*l},getCurvePercent:function(a,b){b=0>b?0:b>1?1:b;var c=6*a,d=this.curves,e=d[c];if(!e)return b;if(-1==e)return 0;for(var f=d[c+1],g=d[c+2],h=d[c+3],i=d[c+4],j=d[c+5],k=e,l=f,m=8;;){if(k>=b){var n=k-e,o=l-f;return o+(l-o)*(b-n)/(k-n)}if(!m)break;m--,e+=g,f+=h,g+=i,h+=j,k+=e,l+=f}return l+(1-l)*(b-k)/(1-k)}},c.RotateTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=2*a},c.RotateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/2},setFrame:function(a,b,c){a*=2,this.frames[a]=b,this.frames[a+1]=c},apply:function(a,b,d){var e,f=this.frames;if(!(b<f[0])){var g=a.bones[this.boneIndex];if(b>=f[f.length-2]){for(e=g.data.rotation+f[f.length-1]-g.rotation;e>180;)e-=360;for(;-180>e;)e+=360;return g.rotation+=e*d,void 0}var h=c.binarySearch(f,b,2),i=f[h-1],j=f[h],k=1-(b-j)/(f[h-2]-j);for(k=this.curves.getCurvePercent(h/2-1,k),e=f[h+1]-i;e>180;)e-=360;for(;-180>e;)e+=360;for(e=g.data.rotation+(i+e*k)-g.rotation;e>180;)e-=360;for(;-180>e;)e+=360;g.rotation+=e*d}}},c.TranslateTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=3*a},c.TranslateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,d){var e=this.frames;if(!(b<e[0])){var f=a.bones[this.boneIndex];if(b>=e[e.length-3])return f.x+=(f.data.x+e[e.length-2]-f.x)*d,f.y+=(f.data.y+e[e.length-1]-f.y)*d,void 0;var g=c.binarySearch(e,b,3),h=e[g-2],i=e[g-1],j=e[g],k=1-(b-j)/(e[g+-3]-j);k=this.curves.getCurvePercent(g/3-1,k),f.x+=(f.data.x+h+(e[g+1]-h)*k-f.x)*d,f.y+=(f.data.y+i+(e[g+2]-i)*k-f.y)*d}}},c.ScaleTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=3*a},c.ScaleTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,d){var e=this.frames;if(!(b<e[0])){var f=a.bones[this.boneIndex];if(b>=e[e.length-3])return f.scaleX+=(f.data.scaleX-1+e[e.length-2]-f.scaleX)*d,f.scaleY+=(f.data.scaleY-1+e[e.length-1]-f.scaleY)*d,void 0;var g=c.binarySearch(e,b,3),h=e[g-2],i=e[g-1],j=e[g],k=1-(b-j)/(e[g+-3]-j);k=this.curves.getCurvePercent(g/3-1,k),f.scaleX+=(f.data.scaleX-1+h+(e[g+1]-h)*k-f.scaleX)*d,f.scaleY+=(f.data.scaleY-1+i+(e[g+2]-i)*k-f.scaleY)*d}}},c.ColorTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=5*a},c.ColorTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length/5},setFrame:function(a,b,c,d,e,f){a*=5,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d,this.frames[a+3]=e,this.frames[a+4]=f},apply:function(a,b,d){var e=this.frames;if(!(b<e[0])){var f=a.slots[this.slotIndex];if(b>=e[e.length-5]){var g=e.length-1;return f.r=e[g-3],f.g=e[g-2],f.b=e[g-1],f.a=e[g],void 0}var h=c.binarySearch(e,b,5),i=e[h-4],j=e[h-3],k=e[h-2],l=e[h-1],m=e[h],n=1-(b-m)/(e[h-5]-m);n=this.curves.getCurvePercent(h/5-1,n);var o=i+(e[h+1]-i)*n,p=j+(e[h+2]-j)*n,q=k+(e[h+3]-k)*n,r=l+(e[h+4]-l)*n;1>d?(f.r+=(o-f.r)*d,f.g+=(p-f.g)*d,f.b+=(q-f.b)*d,f.a+=(r-f.a)*d):(f.r=o,f.g=p,f.b=q,f.a=r)}}},c.AttachmentTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=a,this.attachmentNames=[],this.attachmentNames.length=a},c.AttachmentTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length},setFrame:function(a,b,c){this.frames[a]=b,this.attachmentNames[a]=c},apply:function(a,b){var d=this.frames;if(!(b<d[0])){var e;e=b>=d[d.length-1]?d.length-1:c.binarySearch(d,b,1)-1;var f=this.attachmentNames[e];a.slots[this.slotIndex].setAttachment(f?a.getAttachmentBySlotIndex(this.slotIndex,f):null)}}},c.SkeletonData=function(){this.bones=[],this.slots=[],this.skins=[],this.animations=[]},c.SkeletonData.prototype={defaultSkin:null,findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return slot[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSkin:function(a){for(var b=this.skins,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findAnimation:function(a){for(var b=this.animations,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null}},c.Skeleton=function(a){this.data=a,this.bones=[];for(var b=0,d=a.bones.length;d>b;b++){var e=a.bones[b],f=e.parent?this.bones[a.bones.indexOf(e.parent)]:null;this.bones.push(new c.Bone(e,f))}for(this.slots=[],this.drawOrder=[],b=0,d=a.slots.length;d>b;b++){var g=a.slots[b],h=this.bones[a.bones.indexOf(g.boneData)],i=new c.Slot(g,this,h);this.slots.push(i),this.drawOrder.push(i)}},c.Skeleton.prototype={x:0,y:0,skin:null,r:1,g:1,b:1,a:1,time:0,flipX:!1,flipY:!1,updateWorldTransform:function(){for(var a=this.flipX,b=this.flipY,c=this.bones,d=0,e=c.length;e>d;d++)c[d].updateWorldTransform(a,b)},setToSetupPose:function(){this.setBonesToSetupPose(),this.setSlotsToSetupPose()},setBonesToSetupPose:function(){for(var a=this.bones,b=0,c=a.length;c>b;b++)a[b].setToSetupPose()},setSlotsToSetupPose:function(){for(var a=this.slots,b=0,c=a.length;c>b;b++)a[b].setToSetupPose(b)},getRootBone:function(){return this.bones.length?this.bones[0]:null},findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},setSkinByName:function(a){var b=this.data.findSkin(a);if(!b)throw"Skin not found: "+a;this.setSkin(b)},setSkin:function(a){this.skin&&a&&a._attachAll(this,this.skin),this.skin=a},getAttachmentBySlotName:function(a,b){return this.getAttachmentBySlotIndex(this.data.findSlotIndex(a),b)},getAttachmentBySlotIndex:function(a,b){if(this.skin){var c=this.skin.getAttachment(a,b);if(c)return c}return this.data.defaultSkin?this.data.defaultSkin.getAttachment(a,b):null},setAttachment:function(a,b){for(var c=this.slots,d=0,e=c.size;e>d;d++){var f=c[d];if(f.data.name==a){var g=null;if(b&&(g=this.getAttachment(d,b),null==g))throw"Attachment not found: "+b+", for slot: "+a;return f.setAttachment(g),void 0}}throw"Slot not found: "+a},update:function(a){time+=a}},c.AttachmentType={region:0},c.RegionAttachment=function(){this.offset=[],this.offset.length=8,this.uvs=[],this.uvs.length=8},c.RegionAttachment.prototype={x:0,y:0,rotation:0,scaleX:1,scaleY:1,width:0,height:0,rendererObject:null,regionOffsetX:0,regionOffsetY:0,regionWidth:0,regionHeight:0,regionOriginalWidth:0,regionOriginalHeight:0,setUVs:function(a,b,c,d,e){var f=this.uvs;e?(f[2]=a,f[3]=d,f[4]=a,f[5]=b,f[6]=c,f[7]=b,f[0]=c,f[1]=d):(f[0]=a,f[1]=d,f[2]=a,f[3]=b,f[4]=c,f[5]=b,f[6]=c,f[7]=d)},updateOffset:function(){var a=this.width/this.regionOriginalWidth*this.scaleX,b=this.height/this.regionOriginalHeight*this.scaleY,c=-this.width/2*this.scaleX+this.regionOffsetX*a,d=-this.height/2*this.scaleY+this.regionOffsetY*b,e=c+this.regionWidth*a,f=d+this.regionHeight*b,g=this.rotation*Math.PI/180,h=Math.cos(g),i=Math.sin(g),j=c*h+this.x,k=c*i,l=d*h+this.y,m=d*i,n=e*h+this.x,o=e*i,p=f*h+this.y,q=f*i,r=this.offset;r[0]=j-m,r[1]=l+k,r[2]=j-q,r[3]=p+k,r[4]=n-q,r[5]=p+o,r[6]=n-m,r[7]=l+o},computeVertices:function(a,b,c,d){a+=c.worldX,b+=c.worldY;var e=c.m00,f=c.m01,g=c.m10,h=c.m11,i=this.offset;d[0]=i[0]*e+i[1]*f+a,d[1]=i[0]*g+i[1]*h+b,d[2]=i[2]*e+i[3]*f+a,d[3]=i[2]*g+i[3]*h+b,d[4]=i[4]*e+i[5]*f+a,d[5]=i[4]*g+i[5]*h+b,d[6]=i[6]*e+i[7]*f+a,d[7]=i[6]*g+i[7]*h+b}},c.AnimationStateData=function(a){this.skeletonData=a,this.animationToMixTime={}},c.AnimationStateData.prototype={defaultMix:0,setMixByName:function(a,b,c){var d=this.skeletonData.findAnimation(a);if(!d)throw"Animation not found: "+a;var e=this.skeletonData.findAnimation(b);if(!e)throw"Animation not found: "+b;this.setMix(d,e,c)},setMix:function(a,b,c){this.animationToMixTime[a.name+":"+b.name]=c},getMix:function(a,b){var c=this.animationToMixTime[a.name+":"+b.name];return c?c:this.defaultMix}},c.AnimationState=function(a){this.data=a,this.queue=[]},c.AnimationState.prototype={animationSpeed:1,current:null,previous:null,currentTime:0,previousTime:0,currentLoop:!1,previousLoop:!1,mixTime:0,mixDuration:0,update:function(a){if(this.currentTime+=a*this.animationSpeed,this.previousTime+=a,this.mixTime+=a,this.queue.length>0){var b=this.queue[0];this.currentTime>=b.delay&&(this._setAnimation(b.animation,b.loop),this.queue.shift())}},apply:function(a){if(this.current)if(this.previous){this.previous.apply(a,this.previousTime,this.previousLoop);var b=this.mixTime/this.mixDuration;b>=1&&(b=1,this.previous=null),this.current.mix(a,this.currentTime,this.currentLoop,b)}else this.current.apply(a,this.currentTime,this.currentLoop)},clearAnimation:function(){this.previous=null,this.current=null,this.queue.length=0},_setAnimation:function(a,b){this.previous=null,a&&this.current&&(this.mixDuration=this.data.getMix(this.current,a),this.mixDuration>0&&(this.mixTime=0,this.previous=this.current,this.previousTime=this.currentTime,this.previousLoop=this.currentLoop)),this.current=a,this.currentLoop=b,this.currentTime=0},setAnimationByName:function(a,b){var c=this.data.skeletonData.findAnimation(a);if(!c)throw"Animation not found: "+a;this.setAnimation(c,b)},setAnimation:function(a,b){this.queue.length=0,this._setAnimation(a,b)},addAnimationByName:function(a,b,c){var d=this.data.skeletonData.findAnimation(a);if(!d)throw"Animation not found: "+a;this.addAnimation(d,b,c)},addAnimation:function(a,b,c){var d={};if(d.animation=a,d.loop=b,!c||0>=c){var e=this.queue.length?this.queue[this.queue.length-1].animation:this.current;c=null!=e?e.duration-this.data.getMix(e,a)+(c||0):0}d.delay=c,this.queue.push(d)},isComplete:function(){return!this.current||this.currentTime>=this.current.duration}},c.SkeletonJson=function(a){this.attachmentLoader=a},c.SkeletonJson.prototype={scale:1,readSkeletonData:function(a){for(var b,d=new c.SkeletonData,e=a.bones,f=0,g=e.length;g>f;f++){var h=e[f],i=null;if(h.parent&&(i=d.findBone(h.parent),!i))throw"Parent bone not found: "+h.parent;b=new c.BoneData(h.name,i),b.length=(h.length||0)*this.scale,b.x=(h.x||0)*this.scale,b.y=(h.y||0)*this.scale,b.rotation=h.rotation||0,b.scaleX=h.scaleX||1,b.scaleY=h.scaleY||1,d.bones.push(b)}var j=a.slots;for(f=0,g=j.length;g>f;f++){var k=j[f];if(b=d.findBone(k.bone),!b)throw"Slot bone not found: "+k.bone;var l=new c.SlotData(k.name,b),m=k.color;m&&(l.r=c.SkeletonJson.toColor(m,0),l.g=c.SkeletonJson.toColor(m,1),l.b=c.SkeletonJson.toColor(m,2),l.a=c.SkeletonJson.toColor(m,3)),l.attachmentName=k.attachment,d.slots.push(l)}var n=a.skins;for(var o in n)if(n.hasOwnProperty(o)){var p=n[o],q=new c.Skin(o);for(var r in p)if(p.hasOwnProperty(r)){var s=d.findSlotIndex(r),t=p[r];for(var u in t)if(t.hasOwnProperty(u)){var v=this.readAttachment(q,u,t[u]);null!=v&&q.addAttachment(s,u,v)}}d.skins.push(q),"default"==q.name&&(d.defaultSkin=q)}var w=a.animations;for(var x in w)w.hasOwnProperty(x)&&this.readAnimation(x,w[x],d);return d},readAttachment:function(a,b,d){b=d.name||b;var e=c.AttachmentType[d.type||"region"];if(e==c.AttachmentType.region){var f=new c.RegionAttachment;return f.x=(d.x||0)*this.scale,f.y=(d.y||0)*this.scale,f.scaleX=d.scaleX||1,f.scaleY=d.scaleY||1,f.rotation=d.rotation||0,f.width=(d.width||32)*this.scale,f.height=(d.height||32)*this.scale,f.updateOffset(),f.rendererObject={},f.rendererObject.name=b,f.rendererObject.scale={},f.rendererObject.scale.x=f.scaleX,f.rendererObject.scale.y=f.scaleY,f.rendererObject.rotation=-f.rotation*Math.PI/180,f}throw"Unknown attachment type: "+e},readAnimation:function(a,b,d){var e,f,g,h,i,j,k,l=[],m=0,n=b.bones;for(var o in n)if(n.hasOwnProperty(o)){var p=d.findBoneIndex(o);if(-1==p)throw"Bone not found: "+o;var q=n[o];for(g in q)if(q.hasOwnProperty(g))if(i=q[g],"rotate"==g){for(f=new c.RotateTimeline(i.length),f.boneIndex=p,e=0,j=0,k=i.length;k>j;j++)h=i[j],f.setFrame(e,h.time,h.angle),c.SkeletonJson.readCurve(f,e,h),e++;l.push(f),m=Math.max(m,f.frames[2*f.getFrameCount()-2])}else{if("translate"!=g&&"scale"!=g)throw"Invalid timeline type for a bone: "+g+" ("+o+")";var r=1;for("scale"==g?f=new c.ScaleTimeline(i.length):(f=new c.TranslateTimeline(i.length),r=this.scale),f.boneIndex=p,e=0,j=0,k=i.length;k>j;j++){h=i[j];var s=(h.x||0)*r,t=(h.y||0)*r;f.setFrame(e,h.time,s,t),c.SkeletonJson.readCurve(f,e,h),e++}l.push(f),m=Math.max(m,f.frames[3*f.getFrameCount()-3])}}var u=b.slots;for(var v in u)if(u.hasOwnProperty(v)){var w=u[v],x=d.findSlotIndex(v);for(g in w)if(w.hasOwnProperty(g))if(i=w[g],"color"==g){for(f=new c.ColorTimeline(i.length),f.slotIndex=x,e=0,j=0,k=i.length;k>j;j++){h=i[j];var y=h.color,z=c.SkeletonJson.toColor(y,0),A=c.SkeletonJson.toColor(y,1),B=c.SkeletonJson.toColor(y,2),C=c.SkeletonJson.toColor(y,3);f.setFrame(e,h.time,z,A,B,C),c.SkeletonJson.readCurve(f,e,h),e++}l.push(f),m=Math.max(m,f.frames[5*f.getFrameCount()-5])}else{if("attachment"!=g)throw"Invalid timeline type for a slot: "+g+" ("+v+")";for(f=new c.AttachmentTimeline(i.length),f.slotIndex=x,e=0,j=0,k=i.length;k>j;j++)h=i[j],f.setFrame(e++,h.time,h.name);l.push(f),m=Math.max(m,f.frames[f.getFrameCount()-1])}}d.animations.push(new c.Animation(a,l,m))}},c.SkeletonJson.readCurve=function(a,b,c){var d=c.curve;d&&("stepped"==d?a.curves.setStepped(b):d instanceof Array&&a.curves.setCurve(b,d[0],d[1],d[2],d[3]))},c.SkeletonJson.toColor=function(a,b){if(8!=a.length)throw"Color hexidecimal length must be 8, recieved: "+a;return parseInt(a.substr(2*b,2),16)/255},c.Atlas=function(a,b){this.textureLoader=b,this.pages=[],this.regions=[];var d=new c.AtlasReader(a),e=[];e.length=4;for(var f=null;;){var g=d.readLine();if(null==g)break;if(g=d.trim(g),g.length)if(f){var h=new c.AtlasRegion;h.name=g,h.page=f,h.rotate="true"==d.readValue(),d.readTuple(e);var i=parseInt(e[0],10),j=parseInt(e[1],10);d.readTuple(e);var k=parseInt(e[0],10),l=parseInt(e[1],10);h.u=i/f.width,h.v=j/f.height,h.rotate?(h.u2=(i+l)/f.width,h.v2=(j+k)/f.height):(h.u2=(i+k)/f.width,h.v2=(j+l)/f.height),h.x=i,h.y=j,h.width=Math.abs(k),h.height=Math.abs(l),4==d.readTuple(e)&&(h.splits=[parseInt(e[0],10),parseInt(e[1],10),parseInt(e[2],10),parseInt(e[3],10)],4==d.readTuple(e)&&(h.pads=[parseInt(e[0],10),parseInt(e[1],10),parseInt(e[2],10),parseInt(e[3],10)],d.readTuple(e))),h.originalWidth=parseInt(e[0],10),h.originalHeight=parseInt(e[1],10),d.readTuple(e),h.offsetX=parseInt(e[0],10),h.offsetY=parseInt(e[1],10),h.index=parseInt(d.readValue(),10),this.regions.push(h)}else{f=new c.AtlasPage,f.name=g,f.format=c.Atlas.Format[d.readValue()],d.readTuple(e),f.minFilter=c.Atlas.TextureFilter[e[0]],f.magFilter=c.Atlas.TextureFilter[e[1]];var m=d.readValue();f.uWrap=c.Atlas.TextureWrap.clampToEdge,f.vWrap=c.Atlas.TextureWrap.clampToEdge,"x"==m?f.uWrap=c.Atlas.TextureWrap.repeat:"y"==m?f.vWrap=c.Atlas.TextureWrap.repeat:"xy"==m&&(f.uWrap=f.vWrap=c.Atlas.TextureWrap.repeat),b.load(f,g),this.pages.push(f)}else f=null}},c.Atlas.prototype={findRegion:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},dispose:function(){for(var a=this.pages,b=0,c=a.length;c>b;b++)this.textureLoader.unload(a[b].rendererObject)},updateUVs:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++){var e=b[c];e.page==a&&(e.u=e.x/a.width,e.v=e.y/a.height,e.rotate?(e.u2=(e.x+e.height)/a.width,e.v2=(e.y+e.width)/a.height):(e.u2=(e.x+e.width)/a.width,e.v2=(e.y+e.height)/a.height))}}},c.Atlas.Format={alpha:0,intensity:1,luminanceAlpha:2,rgb565:3,rgba4444:4,rgb888:5,rgba8888:6},c.Atlas.TextureFilter={nearest:0,linear:1,mipMap:2,mipMapNearestNearest:3,mipMapLinearNearest:4,mipMapNearestLinear:5,mipMapLinearLinear:6},c.Atlas.TextureWrap={mirroredRepeat:0,clampToEdge:1,repeat:2},c.AtlasPage=function(){},c.AtlasPage.prototype={name:null,format:null,minFilter:null,magFilter:null,uWrap:null,vWrap:null,rendererObject:null,width:0,height:0},c.AtlasRegion=function(){},c.AtlasRegion.prototype={page:null,name:null,x:0,y:0,width:0,height:0,u:0,v:0,u2:0,v2:0,offsetX:0,offsetY:0,originalWidth:0,originalHeight:0,index:0,rotate:!1,splits:null,pads:null},c.AtlasReader=function(a){this.lines=a.split(/\r\n|\r|\n/)},c.AtlasReader.prototype={index:0,trim:function(a){return a.replace(/^\s+|\s+$/g,"")},readLine:function(){return this.index>=this.lines.length?null:this.lines[this.index++]},readValue:function(){var a=this.readLine(),b=a.indexOf(":");if(-1==b)throw"Invalid line: "+a;return this.trim(a.substring(b+1))},readTuple:function(a){var b=this.readLine(),c=b.indexOf(":");if(-1==c)throw"Invalid line: "+b;for(var d=0,e=c+1;3>d;d++){var f=b.indexOf(",",e);if(-1==f){if(!d)throw"Invalid line: "+b;break}a[d]=this.trim(b.substr(e,f-e)),e=f+1}return a[d]=this.trim(b.substring(e)),d+1}},c.AtlasAttachmentLoader=function(a){this.atlas=a},c.AtlasAttachmentLoader.prototype={newAttachment:function(a,b,d){switch(b){case c.AttachmentType.region:var e=this.atlas.findRegion(d);if(!e)throw"Region not found in atlas: "+d+" ("+b+")";var f=new c.RegionAttachment(d);return f.rendererObject=e,f.setUVs(e.u,e.v,e.u2,e.v2,e.rotate),f.regionOffsetX=e.offsetX,f.regionOffsetY=e.offsetY,f.regionWidth=e.width,f.regionHeight=e.height,f.regionOriginalWidth=e.originalWidth,f.regionOriginalHeight=e.originalHeight,f}throw"Unknown attachment type: "+b}},c.Bone.yDown=!0,b.AnimCache={},b.Spine=function(a){if(b.DisplayObjectContainer.call(this),this.spineData=b.AnimCache[a],!this.spineData)throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: "+a);this.skeleton=new c.Skeleton(this.spineData),this.skeleton.updateWorldTransform(),this.stateData=new c.AnimationStateData(this.spineData),this.state=new c.AnimationState(this.stateData),this.slotContainers=[];for(var d=0,e=this.skeleton.drawOrder.length;e>d;d++){var f=this.skeleton.drawOrder[d],g=f.attachment,h=new b.DisplayObjectContainer;if(this.slotContainers.push(h),this.addChild(h),g instanceof c.RegionAttachment){var i=g.rendererObject.name,j=this.createSprite(f,g.rendererObject);f.currentSprite=j,f.currentSpriteName=i,h.addChild(j)}}},b.Spine.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Spine.prototype.constructor=b.Spine,b.Spine.prototype.updateTransform=function(){this.lastTime=this.lastTime||Date.now();var a=.001*(Date.now()-this.lastTime);this.lastTime=Date.now(),this.state.update(a),this.state.apply(this.skeleton),this.skeleton.updateWorldTransform();for(var d=this.skeleton.drawOrder,e=0,f=d.length;f>e;e++){var g=d[e],h=g.attachment,i=this.slotContainers[e];if(h instanceof c.RegionAttachment){if(h.rendererObject&&(!g.currentSpriteName||g.currentSpriteName!=h.name)){var j=h.rendererObject.name;if(void 0!==g.currentSprite&&(g.currentSprite.visible=!1),g.sprites=g.sprites||{},void 0!==g.sprites[j])g.sprites[j].visible=!0;else{var k=this.createSprite(g,h.rendererObject);i.addChild(k)}g.currentSprite=g.sprites[j],g.currentSpriteName=j}i.visible=!0;var l=g.bone;i.position.x=l.worldX+h.x*l.m00+h.y*l.m01,i.position.y=l.worldY+h.x*l.m10+h.y*l.m11,i.scale.x=l.worldScaleX,i.scale.y=l.worldScaleY,i.rotation=-(g.bone.worldRotation*Math.PI/180),i.alpha=g.a,g.currentSprite.tint=b.rgb2hex([g.r,g.g,g.b])}else i.visible=!1}b.DisplayObjectContainer.prototype.updateTransform.call(this)},b.Spine.prototype.createSprite=function(a,c){var d=b.TextureCache[c.name]?c.name:c.name+".png",e=new b.Sprite(b.Texture.fromFrame(d));return e.scale=c.scale,e.rotation=c.rotation,e.anchor.x=e.anchor.y=.5,a.sprites=a.sprites||{},a.sprites[c.name]=e,e},b.BaseTextureCache={},b.BaseTextureCacheIdGenerator=0,b.BaseTexture=function(a,c){if(this.resolution=1,this.width=100,this.height=100,this.scaleMode=c||b.scaleModes.DEFAULT,this.hasLoaded=!1,this.source=a,this._UID=b._UID++,this.premultipliedAlpha=!0,this._glTextures=[],this._dirty=[!0,!0,!0,!0],a){if((this.source.complete||this.source.getContext)&&this.source.width&&this.source.height)this.hasLoaded=!0,this.width=this.source.naturalWidth||this.source.width,this.height=this.source.naturalHeight||this.source.height,this.dirty();else{var d=this;this.source.onload=function(){d.hasLoaded=!0,d.width=d.source.naturalWidth||d.source.width,d.height=d.source.naturalHeight||d.source.height,d.dirty(),d.dispatchEvent({type:"loaded",content:d})},this.source.onerror=function(){d.dispatchEvent({type:"error",content:d})}}this.imageUrl=null,this._powerOf2=!1}},b.BaseTexture.prototype.constructor=b.BaseTexture,b.EventTarget.mixin(b.BaseTexture.prototype),b.BaseTexture.prototype.destroy=function(){this.imageUrl?(delete b.BaseTextureCache[this.imageUrl],delete b.TextureCache[this.imageUrl],this.imageUrl=null,navigator.isCocoonJS||(this.source.src="")):this.source&&this.source._pixiId&&delete b.BaseTextureCache[this.source._pixiId],this.source=null,this.unloadFromGPU()},b.BaseTexture.prototype.updateSourceImage=function(a){this.hasLoaded=!1,this.source.src=null,this.source.src=a},b.BaseTexture.prototype.dirty=function(){for(var a=0;a<this._glTextures.length;a++)this._dirty[a]=!0},b.BaseTexture.prototype.unloadFromGPU=function(){this.dirty();for(var a=this._glTextures.length-1;a>=0;a--){var c=this._glTextures[a],d=b.glContexts[a];d&&c&&d.deleteTexture(c)}this._glTextures.length=0,this.dirty()},b.BaseTexture.fromImage=function(a,c,d){var e=b.BaseTextureCache[a];if(void 0===c&&-1===a.indexOf("data:")&&(c=!0),!e){var f=new Image;c&&(f.crossOrigin=""),f.src=a,e=new b.BaseTexture(f,d),e.imageUrl=a,b.BaseTextureCache[a]=e,-1!==a.indexOf(b.RETINA_PREFIX+".")&&(e.resolution=2)}return e},b.BaseTexture.fromCanvas=function(a,c){a._pixiId||(a._pixiId="canvas_"+b.TextureCacheIdGenerator++);var d=b.BaseTextureCache[a._pixiId];return d||(d=new b.BaseTexture(a,c),b.BaseTextureCache[a._pixiId]=d),d},b.TextureCache={},b.FrameCache={},b.TextureCacheIdGenerator=0,b.Texture=function(a,c,d,e){this.noFrame=!1,c||(this.noFrame=!0,c=new b.Rectangle(0,0,1,1)),a instanceof b.Texture&&(a=a.baseTexture),this.baseTexture=a,this.frame=c,this.trim=e,this.valid=!1,this.requiresUpdate=!1,this._uvs=null,this.width=0,this.height=0,this.crop=d||new b.Rectangle(0,0,1,1),a.hasLoaded?(this.noFrame&&(c=new b.Rectangle(0,0,a.width,a.height)),this.setFrame(c)):a.addEventListener("loaded",this.onBaseTextureLoaded.bind(this))},b.Texture.prototype.constructor=b.Texture,b.EventTarget.mixin(b.Texture.prototype),b.Texture.prototype.onBaseTextureLoaded=function(){var a=this.baseTexture;a.removeEventListener("loaded",this.onLoaded),this.noFrame&&(this.frame=new b.Rectangle(0,0,a.width,a.height)),this.setFrame(this.frame),this.dispatchEvent({type:"update",content:this})},b.Texture.prototype.destroy=function(a){a&&this.baseTexture.destroy(),this.valid=!1},b.Texture.prototype.setFrame=function(a){if(this.noFrame=!1,this.frame=a,this.width=a.width,this.height=a.height,this.crop.x=a.x,this.crop.y=a.y,this.crop.width=a.width,this.crop.height=a.height,!this.trim&&(a.x+a.width>this.baseTexture.width||a.y+a.height>this.baseTexture.height))throw new Error("Texture Error: frame does not fit inside the base Texture dimensions "+this);this.valid=a&&a.width&&a.height&&this.baseTexture.source&&this.baseTexture.hasLoaded,this.trim&&(this.width=this.trim.width,this.height=this.trim.height,this.frame.width=this.trim.width,this.frame.height=this.trim.height),this.valid&&this._updateUvs()},b.Texture.prototype._updateUvs=function(){this._uvs||(this._uvs=new b.TextureUvs);var a=this.crop,c=this.baseTexture.width,d=this.baseTexture.height;this._uvs.x0=a.x/c,this._uvs.y0=a.y/d,this._uvs.x1=(a.x+a.width)/c,this._uvs.y1=a.y/d,this._uvs.x2=(a.x+a.width)/c,this._uvs.y2=(a.y+a.height)/d,this._uvs.x3=a.x/c,this._uvs.y3=(a.y+a.height)/d},b.Texture.fromImage=function(a,c,d){var e=b.TextureCache[a];return e||(e=new b.Texture(b.BaseTexture.fromImage(a,c,d)),b.TextureCache[a]=e),e},b.Texture.fromFrame=function(a){var c=b.TextureCache[a];if(!c)throw new Error('The frameId "'+a+'" does not exist in the texture cache ');return c},b.Texture.fromCanvas=function(a,c){var d=b.BaseTexture.fromCanvas(a,c);return new b.Texture(d)},b.Texture.addTextureToCache=function(a,c){b.TextureCache[c]=a},b.Texture.removeTextureFromCache=function(a){var c=b.TextureCache[a];return delete b.TextureCache[a],delete b.BaseTextureCache[a],c},b.TextureUvs=function(){this.x0=0,this.y0=0,this.x1=0,this.y1=0,this.x2=0,this.y2=0,this.x3=0,this.y3=0},b.Texture.emptyTexture=new b.Texture(new b.BaseTexture),b.RenderTexture=function(a,c,d,e,f){if(this.width=a||100,this.height=c||100,this.resolution=f||1,this.frame=new b.Rectangle(0,0,this.width*this.resolution,this.height*this.resolution),this.crop=new b.Rectangle(0,0,this.width*this.resolution,this.height*this.resolution),this.baseTexture=new b.BaseTexture,this.baseTexture.width=this.width*this.resolution,this.baseTexture.height=this.height*this.resolution,this.baseTexture._glTextures=[],this.baseTexture.resolution=this.resolution,this.baseTexture.scaleMode=e||b.scaleModes.DEFAULT,this.baseTexture.hasLoaded=!0,b.Texture.call(this,this.baseTexture,new b.Rectangle(0,0,this.width,this.height)),this.renderer=d||b.defaultRenderer,this.renderer.type===b.WEBGL_RENDERER){var g=this.renderer.gl;this.baseTexture._dirty[g.id]=!1,this.textureBuffer=new b.FilterTexture(g,this.width*this.resolution,this.height*this.resolution,this.baseTexture.scaleMode),this.baseTexture._glTextures[g.id]=this.textureBuffer.texture,this.render=this.renderWebGL,this.projection=new b.Point(.5*this.width,.5*-this.height)}else this.render=this.renderCanvas,this.textureBuffer=new b.CanvasBuffer(this.width*this.resolution,this.height*this.resolution),this.baseTexture.source=this.textureBuffer.canvas;this.valid=!0,this._updateUvs()},b.RenderTexture.prototype=Object.create(b.Texture.prototype),b.RenderTexture.prototype.constructor=b.RenderTexture,b.RenderTexture.prototype.resize=function(a,c,d){(a!==this.width||c!==this.height)&&(this.valid=a>0&&c>0,this.width=this.frame.width=this.crop.width=a,this.height=this.frame.height=this.crop.height=c,d&&(this.baseTexture.width=this.width,this.baseTexture.height=this.height),this.renderer.type===b.WEBGL_RENDERER&&(this.projection.x=this.width/2,this.projection.y=-this.height/2),this.valid&&this.textureBuffer.resize(this.width*this.resolution,this.height*this.resolution))},b.RenderTexture.prototype.clear=function(){this.valid&&(this.renderer.type===b.WEBGL_RENDERER&&this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER,this.textureBuffer.frameBuffer),this.textureBuffer.clear())},b.RenderTexture.prototype.renderWebGL=function(a,b,c){if(this.valid){var d=a.worldTransform;d.identity(),d.translate(0,2*this.projection.y),b&&d.append(b),d.scale(1,-1),a.worldAlpha=1;for(var e=a.children,f=0,g=e.length;g>f;f++)e[f].updateTransform();var h=this.renderer.gl;h.viewport(0,0,this.width*this.resolution,this.height*this.resolution),h.bindFramebuffer(h.FRAMEBUFFER,this.textureBuffer.frameBuffer),c&&this.textureBuffer.clear(),this.renderer.spriteBatch.dirty=!0,this.renderer.renderDisplayObject(a,this.projection,this.textureBuffer.frameBuffer),this.renderer.spriteBatch.dirty=!0}},b.RenderTexture.prototype.renderCanvas=function(a,b,c){if(this.valid){var d=a.worldTransform;d.identity(),b&&d.append(b),a.worldAlpha=1;for(var e=a.children,f=0,g=e.length;g>f;f++)e[f].updateTransform();c&&this.textureBuffer.clear();var h=this.textureBuffer.context,i=this.renderer.resolution;this.renderer.resolution=this.resolution,this.renderer.renderDisplayObject(a,h),this.renderer.resolution=i}},b.RenderTexture.prototype.getImage=function(){var a=new Image;return a.src=this.getBase64(),a},b.RenderTexture.prototype.getBase64=function(){return this.getCanvas().toDataURL()},b.RenderTexture.prototype.getCanvas=function(){if(this.renderer.type===b.WEBGL_RENDERER){var a=this.renderer.gl,c=this.textureBuffer.width,d=this.textureBuffer.height,e=new Uint8Array(4*c*d);a.bindFramebuffer(a.FRAMEBUFFER,this.textureBuffer.frameBuffer),a.readPixels(0,0,c,d,a.RGBA,a.UNSIGNED_BYTE,e),a.bindFramebuffer(a.FRAMEBUFFER,null);var f=new b.CanvasBuffer(c,d),g=f.context.getImageData(0,0,c,d);return g.data.set(e),f.context.putImageData(g,0,0),f.canvas}return this.textureBuffer.canvas},b.RenderTexture.tempMatrix=new b.Matrix,b.VideoTexture=function(a,c){if(!a)throw new Error("No video source element specified.");(a.readyState===a.HAVE_ENOUGH_DATA||a.readyState===a.HAVE_FUTURE_DATA)&&a.width&&a.height&&(a.complete=!0),b.BaseTexture.call(this,a,c),this.autoUpdate=!1,this.updateBound=this._onUpdate.bind(this),a.complete||(this._onCanPlay=this.onCanPlay.bind(this),a.addEventListener("canplay",this._onCanPlay),a.addEventListener("canplaythrough",this._onCanPlay),a.addEventListener("play",this.onPlayStart.bind(this)),a.addEventListener("pause",this.onPlayStop.bind(this)))
},b.VideoTexture.prototype=Object.create(b.BaseTexture.prototype),b.VideoTexture.constructor=b.VideoTexture,b.VideoTexture.prototype._onUpdate=function(){this.autoUpdate&&(window.requestAnimationFrame(this.updateBound),this.dirty())},b.VideoTexture.prototype.onPlayStart=function(){this.autoUpdate||(window.requestAnimationFrame(this.updateBound),this.autoUpdate=!0)},b.VideoTexture.prototype.onPlayStop=function(){this.autoUpdate=!1},b.VideoTexture.prototype.onCanPlay=function(){"canplaythrough"===event.type&&(this.hasLoaded=!0,this.source&&(this.source.removeEventListener("canplay",this._onCanPlay),this.source.removeEventListener("canplaythrough",this._onCanPlay),this.width=this.source.videoWidth,this.height=this.source.videoHeight,this.__loaded||(this.__loaded=!0,this.dispatchEvent({type:"loaded",content:this}))))},b.VideoTexture.baseTextureFromVideo=function(a,c){a._pixiId||(a._pixiId="video_"+b.TextureCacheIdGenerator++);var d=b.BaseTextureCache[a._pixiId];return d||(d=new b.VideoTexture(a,c),b.BaseTextureCache[a._pixiId]=d),d},b.VideoTexture.prototype.destroy=function(){this.source&&this.source._pixiId&&(b.BaseTextureCache[this.source._pixiId]=null,delete b.BaseTextureCache[this.source._pixiId],this.source._pixiId=null,delete this.source._pixiId),b.BaseTexture.prototype.destroy.call(this)},b.VideoTexture.textureFromVideo=function(a,c){var d=b.VideoTexture.baseTextureFromVideo(a,c);return new b.Texture(d)},b.VideoTexture.fromUrl=function(a,c){var d=document.createElement("video");return d.src=a,d.autoPlay=!0,d.play(),b.VideoTexture.textureFromVideo(d,c)},b.AssetLoader=function(a,c){this.assetURLs=a,this.crossorigin=c,this.loadersByType={jpg:b.ImageLoader,jpeg:b.ImageLoader,png:b.ImageLoader,gif:b.ImageLoader,webp:b.ImageLoader,json:b.JsonLoader,atlas:b.AtlasLoader,anim:b.SpineLoader,xml:b.BitmapFontLoader,fnt:b.BitmapFontLoader}},b.EventTarget.mixin(b.AssetLoader.prototype),b.AssetLoader.prototype.constructor=b.AssetLoader,b.AssetLoader.prototype._getDataType=function(a){var b="data:",c=a.slice(0,b.length).toLowerCase();if(c===b){var d=a.slice(b.length),e=d.indexOf(",");if(-1===e)return null;var f=d.slice(0,e).split(";")[0];return f&&"text/plain"!==f.toLowerCase()?f.split("/").pop().toLowerCase():"txt"}return null},b.AssetLoader.prototype.load=function(){function a(a){b.onAssetLoaded(a.data.content)}var b=this;this.loadCount=this.assetURLs.length;for(var c=0;c<this.assetURLs.length;c++){var d=this.assetURLs[c],e=this._getDataType(d);e||(e=d.split("?").shift().split(".").pop().toLowerCase());var f=this.loadersByType[e];if(!f)throw new Error(e+" is an unsupported file type");var g=new f(d,this.crossorigin);g.on("loaded",a),g.load()}},b.AssetLoader.prototype.onAssetLoaded=function(a){this.loadCount--,this.emit("onProgress",{content:this,loader:a}),this.onProgress&&this.onProgress(a),this.loadCount||(this.emit("onComplete",{content:this}),this.onComplete&&this.onComplete())},b.JsonLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.loaded=!1},b.JsonLoader.prototype.constructor=b.JsonLoader,b.EventTarget.mixin(b.JsonLoader.prototype),b.JsonLoader.prototype.load=function(){window.XDomainRequest&&this.crossorigin?(this.ajaxRequest=new window.XDomainRequest,this.ajaxRequest.timeout=3e3,this.ajaxRequest.onerror=this.onError.bind(this),this.ajaxRequest.ontimeout=this.onError.bind(this),this.ajaxRequest.onprogress=function(){}):this.ajaxRequest=window.XMLHttpRequest?new window.XMLHttpRequest:new window.ActiveXObject("Microsoft.XMLHTTP"),this.ajaxRequest.onload=this.onJSONLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.send()},b.JsonLoader.prototype.onJSONLoaded=function(){if(!this.ajaxRequest.responseText)return this.onError(),void 0;if(this.json=JSON.parse(this.ajaxRequest.responseText),this.json.frames){var a=this.baseUrl+this.json.meta.image,d=new b.ImageLoader(a,this.crossorigin),e=this.json.frames;this.texture=d.texture.baseTexture,d.addEventListener("loaded",this.onLoaded.bind(this));for(var f in e){var g=e[f].frame;if(g){var h=new b.Rectangle(g.x,g.y,g.w,g.h),i=h.clone(),j=null;if(e[f].trimmed){var k=e[f].sourceSize,l=e[f].spriteSourceSize;j=new b.Rectangle(l.x,l.y,k.w,k.h)}b.TextureCache[f]=new b.Texture(this.texture,h,i,j)}}d.load()}else if(this.json.bones){var m=new c.SkeletonJson,n=m.readSkeletonData(this.json);b.AnimCache[this.url]=n,this.onLoaded()}else this.onLoaded()},b.JsonLoader.prototype.onLoaded=function(){this.loaded=!0,this.dispatchEvent({type:"loaded",content:this})},b.JsonLoader.prototype.onError=function(){this.dispatchEvent({type:"error",content:this})},b.AtlasLoader=function(a,b){this.url=a,this.baseUrl=a.replace(/[^\/]*$/,""),this.crossorigin=b,this.loaded=!1},b.AtlasLoader.constructor=b.AtlasLoader,b.EventTarget.mixin(b.AtlasLoader.prototype),b.AtlasLoader.prototype.load=function(){this.ajaxRequest=new b.AjaxRequest,this.ajaxRequest.onreadystatechange=this.onAtlasLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.overrideMimeType&&this.ajaxRequest.overrideMimeType("application/json"),this.ajaxRequest.send(null)},b.AtlasLoader.prototype.onAtlasLoaded=function(){if(4===this.ajaxRequest.readyState)if(200===this.ajaxRequest.status||-1===window.location.href.indexOf("http")){this.atlas={meta:{image:[]},frames:[]};var a=this.ajaxRequest.responseText.split(/\r?\n/),c=-3,d=0,e=null,f=!1,g=0,h=0,i=this.onLoaded.bind(this);for(g=0;g<a.length;g++)if(a[g]=a[g].replace(/^\s+|\s+$/g,""),""===a[g]&&(f=g+1),a[g].length>0){if(f===g)this.atlas.meta.image.push(a[g]),d=this.atlas.meta.image.length-1,this.atlas.frames.push({}),c=-3;else if(c>0)if(c%7===1)null!=e&&(this.atlas.frames[d][e.name]=e),e={name:a[g],frame:{}};else{var j=a[g].split(" ");if(c%7===3)e.frame.x=Number(j[1].replace(",","")),e.frame.y=Number(j[2]);else if(c%7===4)e.frame.w=Number(j[1].replace(",","")),e.frame.h=Number(j[2]);else if(c%7===5){var k={x:0,y:0,w:Number(j[1].replace(",","")),h:Number(j[2])};k.w>e.frame.w||k.h>e.frame.h?(e.trimmed=!0,e.realSize=k):e.trimmed=!1}}c++}if(null!=e&&(this.atlas.frames[d][e.name]=e),this.atlas.meta.image.length>0){for(this.images=[],h=0;h<this.atlas.meta.image.length;h++){var l=this.baseUrl+this.atlas.meta.image[h],m=this.atlas.frames[h];this.images.push(new b.ImageLoader(l,this.crossorigin));for(g in m){var n=m[g].frame;n&&(b.TextureCache[g]=new b.Texture(this.images[h].texture.baseTexture,{x:n.x,y:n.y,width:n.w,height:n.h}),m[g].trimmed&&(b.TextureCache[g].realSize=m[g].realSize,b.TextureCache[g].trim.x=0,b.TextureCache[g].trim.y=0))}}for(this.currentImageId=0,h=0;h<this.images.length;h++)this.images[h].on("loaded",i);this.images[this.currentImageId].load()}else this.onLoaded()}else this.onError()},b.AtlasLoader.prototype.onLoaded=function(){this.images.length-1>this.currentImageId?(this.currentImageId++,this.images[this.currentImageId].load()):(this.loaded=!0,this.emit("loaded",{content:this}))},b.AtlasLoader.prototype.onError=function(){this.emit("error",{content:this})},b.SpriteSheetLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.texture=null,this.frames={}},b.SpriteSheetLoader.prototype.constructor=b.SpriteSheetLoader,b.EventTarget.mixin(b.SpriteSheetLoader.prototype),b.SpriteSheetLoader.prototype.load=function(){var a=this,c=new b.JsonLoader(this.url,this.crossorigin);c.on("loaded",function(b){a.json=b.data.content.json,a.onLoaded()}),c.load()},b.SpriteSheetLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.ImageLoader=function(a,c){this.texture=b.Texture.fromImage(a,c),this.frames=[]},b.ImageLoader.prototype.constructor=b.ImageLoader,b.EventTarget.mixin(b.ImageLoader.prototype),b.ImageLoader.prototype.load=function(){this.texture.baseTexture.hasLoaded?this.onLoaded():this.texture.baseTexture.on("loaded",this.onLoaded.bind(this))},b.ImageLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.ImageLoader.prototype.loadFramedSpriteSheet=function(a,c,d){this.frames=[];for(var e=Math.floor(this.texture.width/a),f=Math.floor(this.texture.height/c),g=0,h=0;f>h;h++)for(var i=0;e>i;i++,g++){var j=new b.Texture(this.texture.baseTexture,{x:i*a,y:h*c,width:a,height:c});this.frames.push(j),d&&(b.TextureCache[d+"-"+g]=j)}this.load()},b.BitmapFontLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.texture=null},b.BitmapFontLoader.prototype.constructor=b.BitmapFontLoader,b.EventTarget.mixin(b.BitmapFontLoader.prototype),b.BitmapFontLoader.prototype.load=function(){this.ajaxRequest=new b.AjaxRequest,this.ajaxRequest.onreadystatechange=this.onXMLLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.overrideMimeType&&this.ajaxRequest.overrideMimeType("application/xml"),this.ajaxRequest.send(null)},b.BitmapFontLoader.prototype.onXMLLoaded=function(){if(4===this.ajaxRequest.readyState&&(200===this.ajaxRequest.status||-1===window.location.protocol.indexOf("http"))){var a=this.ajaxRequest.responseXML;if(!a||/MSIE 9/i.test(navigator.userAgent)||navigator.isCocoonJS)if("function"==typeof window.DOMParser){var c=new DOMParser;a=c.parseFromString(this.ajaxRequest.responseText,"text/xml")}else{var d=document.createElement("div");d.innerHTML=this.ajaxRequest.responseText,a=d}var e=this.baseUrl+a.getElementsByTagName("page")[0].getAttribute("file"),f=new b.ImageLoader(e,this.crossorigin);this.texture=f.texture.baseTexture;var g={},h=a.getElementsByTagName("info")[0],i=a.getElementsByTagName("common")[0];g.font=h.getAttribute("face"),g.size=parseInt(h.getAttribute("size"),10),g.lineHeight=parseInt(i.getAttribute("lineHeight"),10),g.chars={};for(var j=a.getElementsByTagName("char"),k=0;k<j.length;k++){var l=parseInt(j[k].getAttribute("id"),10),m=new b.Rectangle(parseInt(j[k].getAttribute("x"),10),parseInt(j[k].getAttribute("y"),10),parseInt(j[k].getAttribute("width"),10),parseInt(j[k].getAttribute("height"),10));g.chars[l]={xOffset:parseInt(j[k].getAttribute("xoffset"),10),yOffset:parseInt(j[k].getAttribute("yoffset"),10),xAdvance:parseInt(j[k].getAttribute("xadvance"),10),kerning:{},texture:b.TextureCache[l]=new b.Texture(this.texture,m)}}var n=a.getElementsByTagName("kerning");for(k=0;k<n.length;k++){var o=parseInt(n[k].getAttribute("first"),10),p=parseInt(n[k].getAttribute("second"),10),q=parseInt(n[k].getAttribute("amount"),10);g.chars[p].kerning[o]=q}b.BitmapText.fonts[g.font]=g,f.addEventListener("loaded",this.onLoaded.bind(this)),f.load()}},b.BitmapFontLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.SpineLoader=function(a,b){this.url=a,this.crossorigin=b,this.loaded=!1},b.SpineLoader.prototype.constructor=b.SpineLoader,b.EventTarget.mixin(b.SpineLoader.prototype),b.SpineLoader.prototype.load=function(){var a=this,c=new b.JsonLoader(this.url,this.crossorigin);c.on("loaded",function(b){a.json=b.data.content.json,a.onLoaded()}),c.load()},b.SpineLoader.prototype.onLoaded=function(){this.loaded=!0,this.emit("loaded",{content:this})},b.AbstractFilter=function(a,b){this.passes=[this],this.shaders=[],this.dirty=!0,this.padding=0,this.uniforms=b||{},this.fragmentSrc=a||[]},b.AbstractFilter.prototype.constructor=b.AbstractFilter,b.AbstractFilter.prototype.syncUniforms=function(){for(var a=0,b=this.shaders.length;b>a;a++)this.shaders[a].dirty=!0},b.AlphaMaskFilter=function(a){b.AbstractFilter.call(this),this.passes=[this],a.baseTexture._powerOf2=!0,this.uniforms={mask:{type:"sampler2D",value:a},mapDimensions:{type:"2f",value:{x:1,y:5112}},dimensions:{type:"4fv",value:[0,0,0,0]}},a.baseTexture.hasLoaded?(this.uniforms.mask.value.x=a.width,this.uniforms.mask.value.y=a.height):(this.boundLoadedFunction=this.onTextureLoaded.bind(this),a.baseTexture.on("loaded",this.boundLoadedFunction)),this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D mask;","uniform sampler2D uSampler;","uniform vec2 offset;","uniform vec4 dimensions;","uniform vec2 mapDimensions;","void main(void) {","   vec2 mapCords = vTextureCoord.xy;","   mapCords += (dimensions.zw + offset)/ dimensions.xy ;","   mapCords.y *= -1.0;","   mapCords.y += 1.0;","   mapCords *= dimensions.xy / mapDimensions;","   vec4 original =  texture2D(uSampler, vTextureCoord);","   float maskAlpha =  texture2D(mask, mapCords).r;","   original *= maskAlpha;","   gl_FragColor =  original;","}"]},b.AlphaMaskFilter.prototype=Object.create(b.AbstractFilter.prototype),b.AlphaMaskFilter.prototype.constructor=b.AlphaMaskFilter,b.AlphaMaskFilter.prototype.onTextureLoaded=function(){this.uniforms.mapDimensions.value.x=this.uniforms.mask.value.width,this.uniforms.mapDimensions.value.y=this.uniforms.mask.value.height,this.uniforms.mask.value.baseTexture.off("loaded",this.boundLoadedFunction)},Object.defineProperty(b.AlphaMaskFilter.prototype,"map",{get:function(){return this.uniforms.mask.value},set:function(a){this.uniforms.mask.value=a}}),b.ColorMatrixFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={matrix:{type:"mat4",value:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float invert;","uniform mat4 matrix;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;","}"]},b.ColorMatrixFilter.prototype=Object.create(b.AbstractFilter.prototype),b.ColorMatrixFilter.prototype.constructor=b.ColorMatrixFilter,Object.defineProperty(b.ColorMatrixFilter.prototype,"matrix",{get:function(){return this.uniforms.matrix.value},set:function(a){this.uniforms.matrix.value=a}}),b.GrayFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={gray:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","uniform float gray;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);","}"]},b.GrayFilter.prototype=Object.create(b.AbstractFilter.prototype),b.GrayFilter.prototype.constructor=b.GrayFilter,Object.defineProperty(b.GrayFilter.prototype,"gray",{get:function(){return this.uniforms.gray.value},set:function(a){this.uniforms.gray.value=a}}),b.DisplacementFilter=function(a){b.AbstractFilter.call(this),this.passes=[this],a.baseTexture._powerOf2=!0,this.uniforms={displacementMap:{type:"sampler2D",value:a},scale:{type:"2f",value:{x:30,y:30}},offset:{type:"2f",value:{x:0,y:0}},mapDimensions:{type:"2f",value:{x:1,y:5112}},dimensions:{type:"4fv",value:[0,0,0,0]}},a.baseTexture.hasLoaded?(this.uniforms.mapDimensions.value.x=a.width,this.uniforms.mapDimensions.value.y=a.height):(this.boundLoadedFunction=this.onTextureLoaded.bind(this),a.baseTexture.on("loaded",this.boundLoadedFunction)),this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D displacementMap;","uniform sampler2D uSampler;","uniform vec2 scale;","uniform vec2 offset;","uniform vec4 dimensions;","uniform vec2 mapDimensions;","void main(void) {","   vec2 mapCords = vTextureCoord.xy;","   mapCords += (dimensions.zw + offset)/ dimensions.xy ;","   mapCords.y *= -1.0;","   mapCords.y += 1.0;","   vec2 matSample = texture2D(displacementMap, mapCords).xy;","   matSample -= 0.5;","   matSample *= scale;","   matSample /= mapDimensions;","   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));","   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);","   vec2 cord = vTextureCoord;","}"]},b.DisplacementFilter.prototype=Object.create(b.AbstractFilter.prototype),b.DisplacementFilter.prototype.constructor=b.DisplacementFilter,b.DisplacementFilter.prototype.onTextureLoaded=function(){this.uniforms.mapDimensions.value.x=this.uniforms.displacementMap.value.width,this.uniforms.mapDimensions.value.y=this.uniforms.displacementMap.value.height,this.uniforms.displacementMap.value.baseTexture.off("loaded",this.boundLoadedFunction)},Object.defineProperty(b.DisplacementFilter.prototype,"map",{get:function(){return this.uniforms.displacementMap.value},set:function(a){this.uniforms.displacementMap.value=a}}),Object.defineProperty(b.DisplacementFilter.prototype,"scale",{get:function(){return this.uniforms.scale.value},set:function(a){this.uniforms.scale.value=a}}),Object.defineProperty(b.DisplacementFilter.prototype,"offset",{get:function(){return this.uniforms.offset.value},set:function(a){this.uniforms.offset.value=a}}),b.PixelateFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={invert:{type:"1f",value:0},dimensions:{type:"4fv",value:new b.Float32Array([1e4,100,10,10])},pixelSize:{type:"2f",value:{x:10,y:10}}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec2 testDim;","uniform vec4 dimensions;","uniform vec2 pixelSize;","uniform sampler2D uSampler;","void main(void) {","   vec2 coord = vTextureCoord;","   vec2 size = dimensions.xy/pixelSize;","   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;","   gl_FragColor = texture2D(uSampler, color);","}"]},b.PixelateFilter.prototype=Object.create(b.AbstractFilter.prototype),b.PixelateFilter.prototype.constructor=b.PixelateFilter,Object.defineProperty(b.PixelateFilter.prototype,"size",{get:function(){return this.uniforms.pixelSize.value},set:function(a){this.dirty=!0,this.uniforms.pixelSize.value=a}}),b.BlurXFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","   vec4 sum = vec4(0.0);","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;","   gl_FragColor = sum;","}"]},b.BlurXFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurXFilter.prototype.constructor=b.BlurXFilter,Object.defineProperty(b.BlurXFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.dirty=!0,this.uniforms.blur.value=1/7e3*a}}),b.BlurYFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","   vec4 sum = vec4(0.0);","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;","   gl_FragColor = sum;","}"]},b.BlurYFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurYFilter.prototype.constructor=b.BlurYFilter,Object.defineProperty(b.BlurYFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.uniforms.blur.value=1/7e3*a}}),b.BlurFilter=function(){this.blurXFilter=new b.BlurXFilter,this.blurYFilter=new b.BlurYFilter,this.passes=[this.blurXFilter,this.blurYFilter]},b.BlurFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurFilter.prototype.constructor=b.BlurFilter,Object.defineProperty(b.BlurFilter.prototype,"blur",{get:function(){return this.blurXFilter.blur},set:function(a){this.blurXFilter.blur=this.blurYFilter.blur=a}}),Object.defineProperty(b.BlurFilter.prototype,"blurX",{get:function(){return this.blurXFilter.blur},set:function(a){this.blurXFilter.blur=a}}),Object.defineProperty(b.BlurFilter.prototype,"blurY",{get:function(){return this.blurYFilter.blur},set:function(a){this.blurYFilter.blur=a}}),b.InvertFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={invert:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float invert;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);","}"]},b.InvertFilter.prototype=Object.create(b.AbstractFilter.prototype),b.InvertFilter.prototype.constructor=b.InvertFilter,Object.defineProperty(b.InvertFilter.prototype,"invert",{get:function(){return this.uniforms.invert.value},set:function(a){this.uniforms.invert.value=a}}),b.SepiaFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={sepia:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float sepia;","uniform sampler2D uSampler;","const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);","}"]},b.SepiaFilter.prototype=Object.create(b.AbstractFilter.prototype),b.SepiaFilter.prototype.constructor=b.SepiaFilter,Object.defineProperty(b.SepiaFilter.prototype,"sepia",{get:function(){return this.uniforms.sepia.value},set:function(a){this.uniforms.sepia.value=a}}),b.TwistFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={radius:{type:"1f",value:.5},angle:{type:"1f",value:5},offset:{type:"2f",value:{x:.5,y:.5}}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec4 dimensions;","uniform sampler2D uSampler;","uniform float radius;","uniform float angle;","uniform vec2 offset;","void main(void) {","   vec2 coord = vTextureCoord - offset;","   float distance = length(coord);","   if (distance < radius) {","       float ratio = (radius - distance) / radius;","       float angleMod = ratio * ratio * angle;","       float s = sin(angleMod);","       float c = cos(angleMod);","       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);","   }","   gl_FragColor = texture2D(uSampler, coord+offset);","}"]},b.TwistFilter.prototype=Object.create(b.AbstractFilter.prototype),b.TwistFilter.prototype.constructor=b.TwistFilter,Object.defineProperty(b.TwistFilter.prototype,"offset",{get:function(){return this.uniforms.offset.value},set:function(a){this.dirty=!0,this.uniforms.offset.value=a}}),Object.defineProperty(b.TwistFilter.prototype,"radius",{get:function(){return this.uniforms.radius.value},set:function(a){this.dirty=!0,this.uniforms.radius.value=a}}),Object.defineProperty(b.TwistFilter.prototype,"angle",{get:function(){return this.uniforms.angle.value},set:function(a){this.dirty=!0,this.uniforms.angle.value=a}}),b.ColorStepFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={step:{type:"1f",value:5}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","uniform float step;","void main(void) {","   vec4 color = texture2D(uSampler, vTextureCoord);","   color = floor(color * step) / step;","   gl_FragColor = color;","}"]},b.ColorStepFilter.prototype=Object.create(b.AbstractFilter.prototype),b.ColorStepFilter.prototype.constructor=b.ColorStepFilter,Object.defineProperty(b.ColorStepFilter.prototype,"step",{get:function(){return this.uniforms.step.value},set:function(a){this.uniforms.step.value=a}}),b.DotScreenFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={scale:{type:"1f",value:1},angle:{type:"1f",value:5},dimensions:{type:"4fv",value:[0,0,0,0]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec4 dimensions;","uniform sampler2D uSampler;","uniform float angle;","uniform float scale;","float pattern() {","   float s = sin(angle), c = cos(angle);","   vec2 tex = vTextureCoord * dimensions.xy;","   vec2 point = vec2(","       c * tex.x - s * tex.y,","       s * tex.x + c * tex.y","   ) * scale;","   return (sin(point.x) * sin(point.y)) * 4.0;","}","void main() {","   vec4 color = texture2D(uSampler, vTextureCoord);","   float average = (color.r + color.g + color.b) / 3.0;","   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);","}"]},b.DotScreenFilter.prototype=Object.create(b.AbstractFilter.prototype),b.DotScreenFilter.prototype.constructor=b.DotScreenFilter,Object.defineProperty(b.DotScreenFilter.prototype,"scale",{get:function(){return this.uniforms.scale.value},set:function(a){this.dirty=!0,this.uniforms.scale.value=a}}),Object.defineProperty(b.DotScreenFilter.prototype,"angle",{get:function(){return this.uniforms.angle.value},set:function(a){this.dirty=!0,this.uniforms.angle.value=a}}),b.CrossHatchFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);","    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);","    if (lum < 1.00) {","        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.75) {","        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.50) {","        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.3) {","        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","}"]},b.CrossHatchFilter.prototype=Object.create(b.AbstractFilter.prototype),b.CrossHatchFilter.prototype.constructor=b.CrossHatchFilter,Object.defineProperty(b.CrossHatchFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.uniforms.blur.value=1/7e3*a}}),b.RGBSplitFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={red:{type:"2f",value:{x:20,y:20}},green:{type:"2f",value:{x:-20,y:20}},blue:{type:"2f",value:{x:20,y:-20}},dimensions:{type:"4fv",value:[0,0,0,0]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec2 red;","uniform vec2 green;","uniform vec2 blue;","uniform vec4 dimensions;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;","   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;","   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;","   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;","}"]},b.RGBSplitFilter.prototype=Object.create(b.AbstractFilter.prototype),b.RGBSplitFilter.prototype.constructor=b.RGBSplitFilter,Object.defineProperty(b.RGBSplitFilter.prototype,"red",{get:function(){return this.uniforms.red.value},set:function(a){this.uniforms.red.value=a}}),Object.defineProperty(b.RGBSplitFilter.prototype,"green",{get:function(){return this.uniforms.green.value},set:function(a){this.uniforms.green.value=a}}),Object.defineProperty(b.RGBSplitFilter.prototype,"blue",{get:function(){return this.uniforms.blue.value},set:function(a){this.uniforms.blue.value=a}}),"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=b),exports.PIXI=b):"undefined"!=typeof define&&define.amd?define(b):a.PIXI=b}).call(this);
},{}],4:[function(require,module,exports){
module.exports = require('./lib/rot');

},{"./lib/rot":5}],5:[function(require,module,exports){
(function (process,global){
/*
	This is rot.js, the ROguelike Toolkit in JavaScript.
	Version 0.5~dev, generated on Wed Jul 30 2014 21:33:18 GMT-0500 (CDT).
*/
/**
 * @namespace Add objects for Node.js enviroment
 */
if ((typeof process !== "undefined" && process !== null ? process.env : void 0) != null) {
	window = global;
	document = {
		body: {
			appendChild: function(child) {},
			scrollLeft: 0,
			scrollTop: 0
		},
		createElement: function(type) {
			var canvas;
			return canvas = {
				getBoundingClientRect: function() {
					var rect;
					return rect = {
						left: 0,
						top: 0
					};
				},
				getContext: function(type) {
					var context;
					return context = {
						_termcolor: null,
						beginPath: function() {},
						canvas: canvas,
						drawImage: function(a, b, c, d, e, f, g, h, i) {},
						fill: function() {},
						fillRect: function(x, y, w, h) {
							if(this._termcolor !== null) {
								var clearCmd = this._termcolor.clearToAnsi(this.fillStyle);
								process.stdout.write(clearCmd);
							}
						},
						fillStyle: "#000",
						fillText: function(chs, x, y) {},
						font: "monospace",
						lineTo: function(x, y) {},
						measureText: function(ch) {
							var result;
							return result = {
								width: 12
							};
						},
						moveTo: function(x, y) {},
						textAlign: "center",
						textBaseline: "middle"
					};
				},
				height: 0,
				style: {
					left: "100px",
					position: "absolute",
					top: "100px",
					visibility: "hidden"
				},
				width: 0
			};
		},
		documentElement: {
			scrollLeft: 0,
			scrollTop: 0
		}
	};
}
/**
 * @namespace Top-level ROT namespace
 */
var ROT = {
	/**
	 * @returns {bool} Is rot.js supported by this browser?
	 */
	isSupported: function() {
		return !!(document.createElement("canvas").getContext && Function.prototype.bind);
	},

	/** Default with for display and map generators */
	DEFAULT_WIDTH: 80,
	/** Default height for display and map generators */
	DEFAULT_HEIGHT: 25,

	/** Directional constants. Ordering is important! */
	DIRS: {
		"4": [
			[ 0, -1],
			[ 1,  0],
			[ 0,  1],
			[-1,  0]
		],
		"8": [
			[ 0, -1],
			[ 1, -1],
			[ 1,  0],
			[ 1,  1],
			[ 0,  1],
			[-1,  1],
			[-1,  0],
			[-1, -1]
		],
		"6": [
			[-1, -1],
			[ 1, -1],
			[ 2,  0],
			[ 1,  1],
			[-1,  1],
			[-2,  0]
		]
	},

	/** Cancel key. */
	VK_CANCEL: 3, 
	/** Help key. */
	VK_HELP: 6, 
	/** Backspace key. */
	VK_BACK_SPACE: 8, 
	/** Tab key. */
	VK_TAB: 9, 
	/** 5 key on Numpad when NumLock is unlocked. Or on Mac, clear key which is positioned at NumLock key. */
	VK_CLEAR: 12, 
	/** Return/enter key on the main keyboard. */
	VK_RETURN: 13, 
	/** Reserved, but not used. */
	VK_ENTER: 14, 
	/** Shift key. */
	VK_SHIFT: 16, 
	/** Control key. */
	VK_CONTROL: 17, 
	/** Alt (Option on Mac) key. */
	VK_ALT: 18, 
	/** Pause key. */
	VK_PAUSE: 19, 
	/** Caps lock. */
	VK_CAPS_LOCK: 20, 
	/** Escape key. */
	VK_ESCAPE: 27, 
	/** Space bar. */
	VK_SPACE: 32, 
	/** Page Up key. */
	VK_PAGE_UP: 33, 
	/** Page Down key. */
	VK_PAGE_DOWN: 34, 
	/** End key. */
	VK_END: 35, 
	/** Home key. */
	VK_HOME: 36, 
	/** Left arrow. */
	VK_LEFT: 37, 
	/** Up arrow. */
	VK_UP: 38, 
	/** Right arrow. */
	VK_RIGHT: 39, 
	/** Down arrow. */
	VK_DOWN: 40, 
	/** Print Screen key. */
	VK_PRINTSCREEN: 44, 
	/** Ins(ert) key. */
	VK_INSERT: 45, 
	/** Del(ete) key. */
	VK_DELETE: 46, 
	/***/
	VK_0: 48,
	/***/
	VK_1: 49,
	/***/
	VK_2: 50,
	/***/
	VK_3: 51,
	/***/
	VK_4: 52,
	/***/
	VK_5: 53,
	/***/
	VK_6: 54,
	/***/
	VK_7: 55,
	/***/
	VK_8: 56,
	/***/
	VK_9: 57,
	/** Colon (:) key. Requires Gecko 15.0 */
	VK_COLON: 58, 
	/** Semicolon (;) key. */
	VK_SEMICOLON: 59, 
	/** Less-than (<) key. Requires Gecko 15.0 */
	VK_LESS_THAN: 60, 
	/** Equals (=) key. */
	VK_EQUALS: 61, 
	/** Greater-than (>) key. Requires Gecko 15.0 */
	VK_GREATER_THAN: 62, 
	/** Question mark (?) key. Requires Gecko 15.0 */
	VK_QUESTION_MARK: 63, 
	/** Atmark (@) key. Requires Gecko 15.0 */
	VK_AT: 64, 
	/***/
	VK_A: 65,
	/***/
	VK_B: 66,
	/***/
	VK_C: 67,
	/***/
	VK_D: 68,
	/***/
	VK_E: 69,
	/***/
	VK_F: 70,
	/***/
	VK_G: 71,
	/***/
	VK_H: 72,
	/***/
	VK_I: 73,
	/***/
	VK_J: 74,
	/***/
	VK_K: 75,
	/***/
	VK_L: 76,
	/***/
	VK_M: 77,
	/***/
	VK_N: 78,
	/***/
	VK_O: 79,
	/***/
	VK_P: 80,
	/***/
	VK_Q: 81,
	/***/
	VK_R: 82,
	/***/
	VK_S: 83,
	/***/
	VK_T: 84,
	/***/
	VK_U: 85,
	/***/
	VK_V: 86,
	/***/
	VK_W: 87,
	/***/
	VK_X: 88,
	/***/
	VK_Y: 89,
	/***/
	VK_Z: 90,
	/***/
	VK_CONTEXT_MENU: 93,
	/** 0 on the numeric keypad. */
	VK_NUMPAD0: 96, 
	/** 1 on the numeric keypad. */
	VK_NUMPAD1: 97, 
	/** 2 on the numeric keypad. */
	VK_NUMPAD2: 98, 
	/** 3 on the numeric keypad. */
	VK_NUMPAD3: 99, 
	/** 4 on the numeric keypad. */
	VK_NUMPAD4: 100, 
	/** 5 on the numeric keypad. */
	VK_NUMPAD5: 101, 
	/** 6 on the numeric keypad. */
	VK_NUMPAD6: 102, 
	/** 7 on the numeric keypad. */
	VK_NUMPAD7: 103, 
	/** 8 on the numeric keypad. */
	VK_NUMPAD8: 104, 
	/** 9 on the numeric keypad. */
	VK_NUMPAD9: 105, 
	/** * on the numeric keypad. */
	VK_MULTIPLY: 106,
	/** + on the numeric keypad. */
	VK_ADD: 107, 
	/***/
	VK_SEPARATOR: 108,
	/** - on the numeric keypad. */
	VK_SUBTRACT: 109, 
	/** Decimal point on the numeric keypad. */
	VK_DECIMAL: 110, 
	/** / on the numeric keypad. */
	VK_DIVIDE: 111, 
	/** F1 key. */
	VK_F1: 112, 
	/** F2 key. */
	VK_F2: 113, 
	/** F3 key. */
	VK_F3: 114, 
	/** F4 key. */
	VK_F4: 115, 
	/** F5 key. */
	VK_F5: 116, 
	/** F6 key. */
	VK_F6: 117, 
	/** F7 key. */
	VK_F7: 118, 
	/** F8 key. */
	VK_F8: 119, 
	/** F9 key. */
	VK_F9: 120, 
	/** F10 key. */
	VK_F10: 121, 
	/** F11 key. */
	VK_F11: 122, 
	/** F12 key. */
	VK_F12: 123, 
	/** F13 key. */
	VK_F13: 124, 
	/** F14 key. */
	VK_F14: 125, 
	/** F15 key. */
	VK_F15: 126, 
	/** F16 key. */
	VK_F16: 127, 
	/** F17 key. */
	VK_F17: 128, 
	/** F18 key. */
	VK_F18: 129, 
	/** F19 key. */
	VK_F19: 130, 
	/** F20 key. */
	VK_F20: 131, 
	/** F21 key. */
	VK_F21: 132, 
	/** F22 key. */
	VK_F22: 133, 
	/** F23 key. */
	VK_F23: 134, 
	/** F24 key. */
	VK_F24: 135, 
	/** Num Lock key. */
	VK_NUM_LOCK: 144, 
	/** Scroll Lock key. */
	VK_SCROLL_LOCK: 145, 
	/** Circumflex (^) key. Requires Gecko 15.0 */
	VK_CIRCUMFLEX: 160, 
	/** Exclamation (!) key. Requires Gecko 15.0 */
	VK_EXCLAMATION: 161, 
	/** Double quote () key. Requires Gecko 15.0 */
	VK_DOUBLE_QUOTE: 162, 
	/** Hash (#) key. Requires Gecko 15.0 */
	VK_HASH: 163, 
	/** Dollar sign ($) key. Requires Gecko 15.0 */
	VK_DOLLAR: 164, 
	/** Percent (%) key. Requires Gecko 15.0 */
	VK_PERCENT: 165, 
	/** Ampersand (&) key. Requires Gecko 15.0 */
	VK_AMPERSAND: 166, 
	/** Underscore (_) key. Requires Gecko 15.0 */
	VK_UNDERSCORE: 167, 
	/** Open parenthesis (() key. Requires Gecko 15.0 */
	VK_OPEN_PAREN: 168, 
	/** Close parenthesis ()) key. Requires Gecko 15.0 */
	VK_CLOSE_PAREN: 169, 
	/* Asterisk (*) key. Requires Gecko 15.0 */
	VK_ASTERISK: 170,
	/** Plus (+) key. Requires Gecko 15.0 */
	VK_PLUS: 171, 
	/** Pipe (|) key. Requires Gecko 15.0 */
	VK_PIPE: 172, 
	/** Hyphen-US/docs/Minus (-) key. Requires Gecko 15.0 */
	VK_HYPHEN_MINUS: 173, 
	/** Open curly bracket ({) key. Requires Gecko 15.0 */
	VK_OPEN_CURLY_BRACKET: 174, 
	/** Close curly bracket (}) key. Requires Gecko 15.0 */
	VK_CLOSE_CURLY_BRACKET: 175, 
	/** Tilde (~) key. Requires Gecko 15.0 */
	VK_TILDE: 176, 
	/** Comma (,) key. */
	VK_COMMA: 188, 
	/** Period (.) key. */
	VK_PERIOD: 190, 
	/** Slash (/) key. */
	VK_SLASH: 191, 
	/** Back tick (`) key. */
	VK_BACK_QUOTE: 192, 
	/** Open square bracket ([) key. */
	VK_OPEN_BRACKET: 219, 
	/** Back slash (\) key. */
	VK_BACK_SLASH: 220, 
	/** Close square bracket (]) key. */
	VK_CLOSE_BRACKET: 221, 
	/** Quote (''') key. */
	VK_QUOTE: 222, 
	/** Meta key on Linux, Command key on Mac. */
	VK_META: 224, 
	/** AltGr key on Linux. Requires Gecko 15.0 */
	VK_ALTGR: 225, 
	/** Windows logo key on Windows. Or Super or Hyper key on Linux. Requires Gecko 15.0 */
	VK_WIN: 91, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_KANA: 21, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_HANGUL: 21, 
	/** 英数 key on Japanese Mac keyboard. Requires Gecko 15.0 */
	VK_EISU: 22, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_JUNJA: 23, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_FINAL: 24, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_HANJA: 25, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_KANJI: 25, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_CONVERT: 28, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_NONCONVERT: 29, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_ACCEPT: 30, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_MODECHANGE: 31, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_SELECT: 41, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_PRINT: 42, 
	/** Linux support for this keycode was added in Gecko 4.0. */
	VK_EXECUTE: 43, 
	/** Linux support for this keycode was added in Gecko 4.0.	 */
	VK_SLEEP: 95 
};
/**
 * @namespace
 * Contains text tokenization and breaking routines
 */
ROT.Text = {
	RE_COLORS: /%([bc]){([^}]*)}/g,

	/* token types */
	TYPE_TEXT:		0,
	TYPE_NEWLINE:	1,
	TYPE_FG:		2,
	TYPE_BG:		3,

	/**
	 * Measure size of a resulting text block
	 */
	measure: function(str, maxWidth) {
		var result = {width:0, height:1};
		var tokens = this.tokenize(str, maxWidth);
		var lineWidth = 0;

		for (var i=0;i<tokens.length;i++) {
			var token = tokens[i];
			switch (token.type) {
				case this.TYPE_TEXT:
					lineWidth += token.value.length;
				break;

				case this.TYPE_NEWLINE:
					result.height++;
					result.width = Math.max(result.width, lineWidth);
					lineWidth = 0;
				break;
			}
		}
		result.width = Math.max(result.width, lineWidth);

		return result;
	},

	/**
	 * Convert string to a series of a formatting commands
	 */
	tokenize: function(str, maxWidth) {
		var result = [];

		/* first tokenization pass - split texts and color formatting commands */
		var offset = 0;
		str.replace(this.RE_COLORS, function(match, type, name, index) {
			/* string before */
			var part = str.substring(offset, index);
			if (part.length) {
				result.push({
					type: ROT.Text.TYPE_TEXT,
					value: part
				});
			}

			/* color command */
			result.push({
				type: (type == "c" ? ROT.Text.TYPE_FG : ROT.Text.TYPE_BG),
				value: name.trim()
			});

			offset = index + match.length;
			return "";
		});

		/* last remaining part */
		var part = str.substring(offset);
		if (part.length) {
			result.push({
				type: ROT.Text.TYPE_TEXT,
				value: part
			});
		}

		return this._breakLines(result, maxWidth);
	},

	/* insert line breaks into first-pass tokenized data */
	_breakLines: function(tokens, maxWidth) {
		if (!maxWidth) { maxWidth = Infinity; };

		var i = 0;
		var lineLength = 0;
		var lastTokenWithSpace = -1;

		while (i < tokens.length) { /* take all text tokens, remove space, apply linebreaks */
			var token = tokens[i];
			if (token.type == ROT.Text.TYPE_NEWLINE) { /* reset */
				lineLength = 0; 
				lastTokenWithSpace = -1;
			}
			if (token.type != ROT.Text.TYPE_TEXT) { /* skip non-text tokens */
				i++;
				continue; 
			}

			/* remove spaces at the beginning of line */
			while (lineLength == 0 && token.value.charAt(0) == " ") { token.value = token.value.substring(1); }

			/* forced newline? insert two new tokens after this one */
			var index = token.value.indexOf("\n");
			if (index != -1) { 
				token.value = this._breakInsideToken(tokens, i, index, true); 

				/* if there are spaces at the end, we must remove them (we do not want the line too long) */
				var arr = token.value.split("");
				while (arr[arr.length-1] == " ") { arr.pop(); }
				token.value = arr.join("");
			}

			/* token degenerated? */
			if (!token.value.length) {
				tokens.splice(i, 1);
				continue;
			}

			if (lineLength + token.value.length > maxWidth) { /* line too long, find a suitable breaking spot */

				/* is it possible to break within this token? */
				var index = -1;
				while (1) {
					var nextIndex = token.value.indexOf(" ", index+1);
					if (nextIndex == -1) { break; }
					if (lineLength + nextIndex > maxWidth) { break; }
					index = nextIndex;
				}

				if (index != -1) { /* break at space within this one */
					token.value = this._breakInsideToken(tokens, i, index, true);
				} else if (lastTokenWithSpace != -1) { /* is there a previous token where a break can occur? */
					var token = tokens[lastTokenWithSpace];
					var breakIndex = token.value.lastIndexOf(" ");
					token.value = this._breakInsideToken(tokens, lastTokenWithSpace, breakIndex, true);
					i = lastTokenWithSpace;
				} else { /* force break in this token */
					token.value = this._breakInsideToken(tokens, i, maxWidth-lineLength, false);
				}

			} else { /* line not long, continue */
				lineLength += token.value.length;
				if (token.value.indexOf(" ") != -1) { lastTokenWithSpace = i; }
			}
			
			i++; /* advance to next token */
		}


		tokens.push({type: ROT.Text.TYPE_NEWLINE}); /* insert fake newline to fix the last text line */

		/* remove trailing space from text tokens before newlines */
		var lastTextToken = null;
		for (var i=0;i<tokens.length;i++) {
			var token = tokens[i];
			switch (token.type) {
				case ROT.Text.TYPE_TEXT: lastTextToken = token; break;
				case ROT.Text.TYPE_NEWLINE: 
					if (lastTextToken) { /* remove trailing space */
						var arr = lastTextToken.value.split("");
						while (arr[arr.length-1] == " ") { arr.pop(); }
						lastTextToken.value = arr.join("");
					}
					lastTextToken = null;
				break;
			}
		}

		tokens.pop(); /* remove fake token */

		return tokens;
	},

	/**
	 * Create new tokens and insert them into the stream
	 * @param {object[]} tokens
	 * @param {int} tokenIndex Token being processed
	 * @param {int} breakIndex Index within current token's value
	 * @param {bool} removeBreakChar Do we want to remove the breaking character?
	 * @returns {string} remaining unbroken token value
	 */
	_breakInsideToken: function(tokens, tokenIndex, breakIndex, removeBreakChar) {
		var newBreakToken = {
			type: ROT.Text.TYPE_NEWLINE
		}
		var newTextToken = {
			type: ROT.Text.TYPE_TEXT,
			value: tokens[tokenIndex].value.substring(breakIndex + (removeBreakChar ? 1 : 0))
		}
		tokens.splice(tokenIndex+1, 0, newBreakToken, newTextToken);
		return tokens[tokenIndex].value.substring(0, breakIndex);
	}
}
/**
 * @returns {any} Randomly picked item, null when length=0
 */
Array.prototype.random = function() {
	if (!this.length) { return null; }
	return this[Math.floor(ROT.RNG.getUniform() * this.length)];
}

/**
 * @returns {array} New array with randomized items
 * FIXME destroys this!
 */
Array.prototype.randomize = function() {
	var result = [];
	while (this.length) {
		var index = this.indexOf(this.random());
		result.push(this.splice(index, 1)[0]);
	}
	return result;
}
/**
 * Always positive modulus
 * @param {int} n Modulus
 * @returns {int} this modulo n
 */
Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}
/**
 * @returns {string} First letter capitalized
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.substring(1);
}

/** 
 * Left pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.lpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return s+this;
}

/** 
 * Right pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.rpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return this+s;
}

/**
 * Format a string in a flexible way. Scans for %s strings and replaces them with arguments. List of patterns is modifiable via String.format.map.
 * @param {string} template
 * @param {any} [argv]
 */
String.format = function(template) {
	var map = String.format.map;
	var args = Array.prototype.slice.call(arguments, 1);

	var replacer = function(match, group1, group2, index) {
		if (template.charAt(index-1) == "%") { return match.substring(1); }
		if (!args.length) { return match; }
		var obj = args[0];

		var group = group1 || group2;
		var parts = group.split(",");
		var name = parts.shift();
		var method = map[name.toLowerCase()];
		if (!method) { return match; }

		var obj = args.shift();
		var replaced = obj[method].apply(obj, parts);

		var first = name.charAt(0);
		if (first != first.toLowerCase()) { replaced = replaced.capitalize(); }

		return replaced;
	}
	return template.replace(/%(?:([a-z]+)|(?:{([^}]+)}))/gi, replacer);
}

String.format.map = {
	"s": "toString"
}

/**
 * Convenience shortcut to String.format(this)
 */
String.prototype.format = function() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(this);
	return String.format.apply(String, args);
}

if (!Object.create) {  
	/**
	 * ES5 Object.create
	 */
	Object.create = function(o) {  
		var tmp = function() {};
		tmp.prototype = o;
		return new tmp();
	};  
}  
/**
 * Sets prototype of this function to an instance of parent function
 * @param {function} parent
 */
Function.prototype.extend = function(parent) {
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
	return this;
}
window.requestAnimationFrame =
	window.requestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function(cb) { return setTimeout(cb, 1000/60); };

window.cancelAnimationFrame =
	window.cancelAnimationFrame
	|| window.mozCancelAnimationFrame
	|| window.webkitCancelAnimationFrame
	|| window.oCancelAnimationFrame
	|| window.msCancelAnimationFrame
	|| function(id) { return clearTimeout(id); };
/**
 * @class Visual map display
 * @param {object} [options]
 * @param {int} [options.width=ROT.DEFAULT_WIDTH]
 * @param {int} [options.height=ROT.DEFAULT_HEIGHT]
 * @param {int} [options.fontSize=15]
 * @param {string} [options.fontFamily="monospace"]
 * @param {string} [options.fontStyle=""] bold/italic/none/both
 * @param {string} [options.fg="#ccc"]
 * @param {string} [options.bg="#000"]
 * @param {float} [options.spacing=1]
 * @param {float} [options.border=0]
 * @param {string} [options.layout="rect"]
 * @param {int} [options.tileWidth=32]
 * @param {int} [options.tileHeight=32]
 * @param {object} [options.tileMap={}]
 * @param {image} [options.tileSet=null]
 */
ROT.Display = function(options) {
	var canvas = document.createElement("canvas");
	this._context = canvas.getContext("2d");
	this._data = {};
	this._dirty = false; /* false = nothing, true = all, object = dirty cells */
	this._options = {};
	this._backend = null;
	
	var defaultOptions = {
		width: ROT.DEFAULT_WIDTH,
		height: ROT.DEFAULT_HEIGHT,
		layout: "rect",
		fontSize: 15,
		spacing: 1,
		border: 0,
		fontFamily: "monospace",
		fontStyle: "",
		fg: "#ccc",
		bg: "#000",
		tileWidth: 32,
		tileHeight: 32,
		tileMap: {},
		tileSet: null,
		termColor: "xterm"
	};
	for (var p in options) { defaultOptions[p] = options[p]; }
	this.setOptions(defaultOptions);
	this.DEBUG = this.DEBUG.bind(this);

	this._tick = this._tick.bind(this);
	requestAnimationFrame(this._tick);
}

/**
 * Debug helper, ideal as a map generator callback. Always bound to this.
 * @param {int} x
 * @param {int} y
 * @param {int} what
 */
ROT.Display.prototype.DEBUG = function(x, y, what) {
	var colors = [this._options.bg, this._options.fg];
	this.draw(x, y, null, null, colors[what % colors.length]);
}

/**
 * Clear the whole display (cover it with background color)
 */
ROT.Display.prototype.clear = function() {
	this._data = {};
	this._dirty = true;
}

/**
 * @see ROT.Display
 */
ROT.Display.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
	if (options.width || options.height || options.fontSize || options.fontFamily || options.spacing || options.layout) {
		if (options.layout) { 
			this._backend = new ROT.Display[options.layout.capitalize()](this._context);
		}

		var font = (this._options.fontStyle ? this._options.fontStyle + " " : "") + this._options.fontSize + "px " + this._options.fontFamily;
		this._context.font = font;
		this._backend.compute(this._options);
		this._context.font = font;
		this._context.textAlign = "center";
		this._context.textBaseline = "middle";
		this._dirty = true;
	}
	return this;
}

/**
 * Returns currently set options
 * @returns {object} Current options object 
 */
ROT.Display.prototype.getOptions = function() {
	return this._options;
}

/**
 * Returns the DOM node of this display
 * @returns {node} DOM node
 */
ROT.Display.prototype.getContainer = function() {
	return this._context.canvas;
}

/**
 * Compute the maximum width/height to fit into a set of given constraints
 * @param {int} availWidth Maximum allowed pixel width
 * @param {int} availHeight Maximum allowed pixel height
 * @returns {int[2]} cellWidth,cellHeight
 */
ROT.Display.prototype.computeSize = function(availWidth, availHeight) {
	return this._backend.computeSize(availWidth, availHeight, this._options);
}

/**
 * Compute the maximum font size to fit into a set of given constraints
 * @param {int} availWidth Maximum allowed pixel width
 * @param {int} availHeight Maximum allowed pixel height
 * @returns {int} fontSize
 */
ROT.Display.prototype.computeFontSize = function(availWidth, availHeight) {
	return this._backend.computeFontSize(availWidth, availHeight, this._options);
}

/**
 * Convert a DOM event (mouse or touch) to map coordinates. Uses first touch for multi-touch.
 * @param {Event} e event
 * @returns {int[2]} -1 for values outside of the canvas
 */
ROT.Display.prototype.eventToPosition = function(e) {
	if (e.touches) {
		var x = e.touches[0].clientX;
		var y = e.touches[0].clientY;
	} else {
		var x = e.clientX;
		var y = e.clientY;
	}

	var rect = this._context.canvas.getBoundingClientRect();
	x -= rect.left;
	y -= rect.top;
	
	if (x < 0 || y < 0 || x >= this._context.canvas.width || y >= this._context.canvas.height) { return [-1, -1]; }

	return this._backend.eventToPosition(x, y);
}

/**
 * @param {int} x
 * @param {int} y
 * @param {string || string[]} ch One or more chars (will be overlapping themselves)
 * @param {string} [fg] foreground color
 * @param {string} [bg] background color
 */
ROT.Display.prototype.draw = function(x, y, ch, fg, bg) {
	if (!fg) { fg = this._options.fg; }
	if (!bg) { bg = this._options.bg; }
	this._data[x+","+y] = [x, y, ch, fg, bg];
	
	if (this._dirty === true) { return; } /* will already redraw everything */
	if (!this._dirty) { this._dirty = {}; } /* first! */
	this._dirty[x+","+y] = true;
}

/**
 * Draws a text at given position. Optionally wraps at a maximum length. Currently does not work with hex layout.
 * @param {int} x
 * @param {int} y
 * @param {string} text May contain color/background format specifiers, %c{name}/%b{name}, both optional. %c{}/%b{} resets to default.
 * @param {int} [maxWidth] wrap at what width?
 * @returns {int} lines drawn
 */
ROT.Display.prototype.drawText = function(x, y, text, maxWidth) {
	var fg = null;
	var bg = null;
	var cx = x;
	var cy = y;
	var lines = 1;
	if (!maxWidth) { maxWidth = this._options.width-x; }

	var tokens = ROT.Text.tokenize(text, maxWidth);

	while (tokens.length) { /* interpret tokenized opcode stream */
		var token = tokens.shift();
		switch (token.type) {
			case ROT.Text.TYPE_TEXT:
				for (var i=0;i<token.value.length;i++) {
					this.draw(cx++, cy, token.value.charAt(i), fg, bg);
				}
			break;

			case ROT.Text.TYPE_FG:
				fg = token.value || null;
			break;

			case ROT.Text.TYPE_BG:
				bg = token.value || null;
			break;

			case ROT.Text.TYPE_NEWLINE:
				cx = x;
				cy++;
				lines++
			break;
		}
	}

	return lines;
}

/**
 * Timer tick: update dirty parts
 */
ROT.Display.prototype._tick = function() {
	requestAnimationFrame(this._tick);

	if (!this._dirty) { return; }

	if (this._dirty === true) { /* draw all */
		this._context.fillStyle = this._options.bg;
		this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);

		for (var id in this._data) { /* redraw cached data */
			this._draw(id, false);
		}

	} else { /* draw only dirty */
		for (var key in this._dirty) {
			this._draw(key, true);
		}
	}

	this._dirty = false;
}

/**
 * @param {string} key What to draw
 * @param {bool} clearBefore Is it necessary to clean before?
 */
ROT.Display.prototype._draw = function(key, clearBefore) {
	var data = this._data[key];
	if (data[4] != this._options.bg) { clearBefore = true; }

	this._backend.draw(data, clearBefore);
}
/**
 * @class Abstract display backend module
 * @private
 */
ROT.Display.Backend = function(context) {
	this._context = context;
}

ROT.Display.Backend.prototype.compute = function(options) {
}

ROT.Display.Backend.prototype.draw = function(data, clearBefore) {
}

ROT.Display.Backend.prototype.computeSize = function(availWidth, availHeight) {
}

ROT.Display.Backend.prototype.computeFontSize = function(availWidth, availHeight) {
}

ROT.Display.Backend.prototype.eventToPosition = function(x, y) {
}
/**
 * @class Rectangular backend
 * @private
 */
ROT.Display.Rect = function(context) {
	ROT.Display.Backend.call(this, context);
	
	this._spacingX = 0;
	this._spacingY = 0;
	this._canvasCache = {};
	this._options = {};
}
ROT.Display.Rect.extend(ROT.Display.Backend);

ROT.Display.Rect.cache = false;

ROT.Display.Rect.prototype.compute = function(options) {
	this._canvasCache = {};
	this._options = options;

	var charWidth = Math.ceil(this._context.measureText("W").width);
	this._spacingX = Math.ceil(options.spacing * charWidth);
	this._spacingY = Math.ceil(options.spacing * options.fontSize);
	this._context.canvas.width = options.width * this._spacingX;
	this._context.canvas.height = options.height * this._spacingY;
}

ROT.Display.Rect.prototype.draw = function(data, clearBefore) {
	if (this.constructor.cache) {
		this._drawWithCache(data, clearBefore);
	} else {
		this._drawNoCache(data, clearBefore);
	}
}

ROT.Display.Rect.prototype._drawWithCache = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var hash = ""+ch+fg+bg;
	if (hash in this._canvasCache) {
		var canvas = this._canvasCache[hash];
	} else {
		var b = this._options.border;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.width = this._spacingX;
		canvas.height = this._spacingY;
		ctx.fillStyle = bg;
		ctx.fillRect(b, b, canvas.width-b, canvas.height-b);
		
		if (ch) {
			ctx.fillStyle = fg;
			ctx.font = this._context.font;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			var chars = [].concat(ch);
			for (var i=0;i<chars.length;i++) {
				ctx.fillText(chars[i], this._spacingX/2, this._spacingY/2);
			}
		}
		this._canvasCache[hash] = canvas;
	}
	
	this._context.drawImage(canvas, x*this._spacingX, y*this._spacingY);
}

ROT.Display.Rect.prototype._drawNoCache = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	if (clearBefore) { 
		var b = this._options.border;
		this._context.fillStyle = bg;
		this._context.fillRect(x*this._spacingX + b, y*this._spacingY + b, this._spacingX - b, this._spacingY - b);
	}
	
	if (!ch) { return; }

	this._context.fillStyle = fg;

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		this._context.fillText(chars[i], (x+0.5) * this._spacingX, (y+0.5) * this._spacingY);
	}
}

ROT.Display.Rect.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._spacingX);
	var height = Math.floor(availHeight / this._spacingY);
	return [width, height];
}

ROT.Display.Rect.prototype.computeFontSize = function(availWidth, availHeight) {
	var boxWidth = Math.floor(availWidth / this._options.width);
	var boxHeight = Math.floor(availHeight / this._options.height);

	/* compute char ratio */
	var oldFont = this._context.font;
	this._context.font = "100px " + this._options.fontFamily;
	var width = Math.ceil(this._context.measureText("W").width);
	this._context.font = oldFont;
	var ratio = width / 100;
		
	var widthFraction = ratio * boxHeight / boxWidth;
	if (widthFraction > 1) { /* too wide with current aspect ratio */
		boxHeight = Math.floor(boxHeight / widthFraction);
	}
	return Math.floor(boxHeight / this._options.spacing);
}

ROT.Display.Rect.prototype.eventToPosition = function(x, y) {
	return [Math.floor(x/this._spacingX), Math.floor(y/this._spacingY)];
}
/**
 * @class Hexagonal backend
 * @private
 */
ROT.Display.Hex = function(context) {
	ROT.Display.Backend.call(this, context);

	this._spacingX = 0;
	this._spacingY = 0;
	this._hexSize = 0;
	this._options = {};
}
ROT.Display.Hex.extend(ROT.Display.Backend);

ROT.Display.Hex.prototype.compute = function(options) {
	this._options = options;

	var charWidth = Math.ceil(this._context.measureText("W").width);
	this._hexSize = Math.floor(options.spacing * (options.fontSize + charWidth/Math.sqrt(3)) / 2);
	this._spacingX = this._hexSize * Math.sqrt(3) / 2;
	this._spacingY = this._hexSize * 1.5;
	this._context.canvas.width = Math.ceil( (options.width + 1) * this._spacingX );
	this._context.canvas.height = Math.ceil( (options.height - 1) * this._spacingY + 2*this._hexSize );
}

ROT.Display.Hex.prototype.draw = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var cx = (x+1) * this._spacingX;
	var cy = y * this._spacingY + this._hexSize;

	if (clearBefore) { 
		this._context.fillStyle = bg;
		this._fill(cx, cy);
	}
	
	if (!ch) { return; }

	this._context.fillStyle = fg;

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		this._context.fillText(chars[i], cx, cy);
	}
}


ROT.Display.Hex.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._spacingX) - 1;
	var height = Math.floor((availHeight - 2*this._hexSize) / this._spacingY + 1);
	return [width, height];
}

ROT.Display.Hex.prototype.computeFontSize = function(availWidth, availHeight) {
	var hexSizeWidth = 2*availWidth / ((this._options.width+1) * Math.sqrt(3)) - 1;
	var hexSizeHeight = availHeight / (2 + 1.5*(this._options.height-1));
	var hexSize = Math.min(hexSizeWidth, hexSizeHeight);

	/* compute char ratio */
	var oldFont = this._context.font;
	this._context.font = "100px " + this._options.fontFamily;
	var width = Math.ceil(this._context.measureText("W").width);
	this._context.font = oldFont;
	var ratio = width / 100;

	hexSize = Math.floor(hexSize)+1; /* closest larger hexSize */

	var fontSize = 2*hexSize / (this._options.spacing * (1 + ratio / Math.sqrt(3)));

	/* closest smaller fontSize */
	return Math.ceil(fontSize)-1;
}

ROT.Display.Hex.prototype.eventToPosition = function(x, y) {
	var height = this._context.canvas.height / this._options.height;
	y = Math.floor(y/height);
	
	if (y.mod(2)) { /* odd row */
		x -= this._spacingX;
		x = 1 + 2*Math.floor(x/(2*this._spacingX));
	} else {
		x = 2*Math.floor(x/(2*this._spacingX));
	}
	
	return [x, y];
}

ROT.Display.Hex.prototype._fill = function(cx, cy) {
	var a = this._hexSize;
	var b = this._options.border;
	
	this._context.beginPath();
	this._context.moveTo(cx, cy-a+b);
	this._context.lineTo(cx + this._spacingX - b, cy-a/2+b);
	this._context.lineTo(cx + this._spacingX - b, cy+a/2-b);
	this._context.lineTo(cx, cy+a-b);
	this._context.lineTo(cx - this._spacingX + b, cy+a/2-b);
	this._context.lineTo(cx - this._spacingX + b, cy-a/2+b);
	this._context.lineTo(cx, cy-a+b);
	this._context.fill();
}
/**
 * @class Tile backend
 * @private
 */
ROT.Display.Tile = function(context) {
	ROT.Display.Rect.call(this, context);
	
	this._options = {};
}
ROT.Display.Tile.extend(ROT.Display.Rect);

ROT.Display.Tile.prototype.compute = function(options) {
	this._options = options;
	this._context.canvas.width = options.width * options.tileWidth;
	this._context.canvas.height = options.height * options.tileHeight;
}

ROT.Display.Tile.prototype.draw = function(data, clearBefore) {
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	var tileWidth = this._options.tileWidth;
	var tileHeight = this._options.tileHeight;

	if (clearBefore) {
		var b = this._options.border;
		this._context.fillStyle = bg;
		this._context.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
	}

	if (!ch) { return; }

	var chars = [].concat(ch);
	for (var i=0;i<chars.length;i++) {
		var tile = this._options.tileMap[chars[i]];
		if (!tile) { throw new Error("Char '" + chars[i] + "' not found in tileMap"); }
		
		this._context.drawImage(
			this._options.tileSet,
			tile[0], tile[1], tileWidth, tileHeight,
			x*tileWidth, y*tileHeight, tileWidth, tileHeight
		);
	}
}

ROT.Display.Tile.prototype.computeSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._options.tileWidth);
	var height = Math.floor(availHeight / this._options.tileHeight);
	return [width, height];
}

ROT.Display.Tile.prototype.computeFontSize = function(availWidth, availHeight) {
	var width = Math.floor(availWidth / this._options.width);
	var height = Math.floor(availHeight / this._options.height);
	return [width, height];
}
/**
 * @class Terminal backend
 * @private
 */
ROT.Display.Term = function(context) {
	ROT.Display.Backend.call(this, context);
	this._cx = -1;
	this._cy = -1;
	this._lastColor = "";
	this._options = {};
	this._ox = 0;
	this._oy = 0;
	this._termcolor = {};
}
ROT.Display.Term.extend(ROT.Display.Backend);

ROT.Display.Term.prototype.compute = function(options) {
	this._options = options;
	this._ox = Math.floor((process.stdout.columns - options.width) / 2);
	this._oy = Math.floor((process.stdout.rows - options.height) / 2);
	this._termcolor = new ROT.Display.Term[options.termColor.capitalize()](this._context);
	this._context._termcolor = this._termcolor;
}

ROT.Display.Term.prototype.draw = function(data, clearBefore) {
	// determine where to draw what with what colors
	var x = data[0];
	var y = data[1];
	var ch = data[2];
	var fg = data[3];
	var bg = data[4];

	// determine if we need to move the terminal cursor
	var dx = this._ox + x;
	var dy = this._oy + y;
	if (dx < 0 || dx >= process.stdout.columns) { return; }
	if (dy < 0 || dy >= process.stdout.rows) { return; }
	if (dx !== this._cx || dy !== this._cy) {
		process.stdout.write(this._termcolor.positionToAnsi(dx,dy));
		this._cx = dx;
		this._cy = dy;
	}

	// terminals automatically clear, but if we're clearing when we're
	// not otherwise provided with a character, just use a space instead
	if (clearBefore) {
		if (!ch) {
			ch = " ";
		}
	}
		
	// if we're not clearing and not provided with a character, do nothing
	if (!ch) { return; }

	// determine if we need to change colors
	var newColor = this._termcolor.colorToAnsi(fg,bg);
	if (newColor !== this._lastColor) {
		process.stdout.write(newColor);
		this._lastColor = newColor;
	}

	// write the provided symbol to the display
	var chars = [].concat(ch);
	process.stdout.write(chars[0]);

	// update our position, given that we wrote a character
	this._cx++;
	if (this._cx >= process.stdout.columns) {
		this._cx = 0;
		this._cy++;
	}
}

ROT.Display.Term.prototype.computeSize = function(availWidth, availHeight) {
	return [process.stdout.columns, process.stdout.rows];
}

ROT.Display.Term.prototype.computeFontSize = function(availWidth, availHeight) {
	return 12;
}

ROT.Display.Term.prototype.eventToPosition = function(x, y) {
	return [x,y]
}
/**
 * @class Abstract terminal code module
 * @private
 */
ROT.Display.Term.Color = function(context) {
	this._context = context;
}

ROT.Display.Term.Color.prototype.clearToAnsi = function(bg) {
}

ROT.Display.Term.Color.prototype.colorToAnsi = function(fg, bg) {
}

ROT.Display.Term.Color.prototype.positionToAnsi = function(x, y) {
}
/**
 * @class xterm terminal code module
 * @private
 */
ROT.Display.Term.Xterm = function(context) {
	ROT.Display.Term.Color.call(this, context);
}
ROT.Display.Term.Xterm.extend(ROT.Display.Term.Color);

ROT.Display.Term.Xterm.prototype.clearToAnsi = function(bg) {
	return "\x1b[0;48;5;"
		+ this._termcolor(bg)
		+ "m\x1b[2J";
}

ROT.Display.Term.Xterm.prototype.colorToAnsi = function(fg, bg) {
	return "\x1b[0;38;5;"
		+ this._termcolor(fg)
		+ ";48;5;"
		+ this._termcolor(bg)
		+ "m";
}

ROT.Display.Term.Xterm.prototype.positionToAnsi = function(x, y) {
	return "\x1b[" + (y+1) + ";" + (x+1) + "H";
}

ROT.Display.Term.Xterm.prototype._termcolor = function(color) {
	var SRC_COLORS = 256.0;
	var DST_COLORS = 6.0;
	var COLOR_RATIO = DST_COLORS / SRC_COLORS;
	var rgb = ROT.Color.fromString(color);
	var r = Math.floor(rgb[0] * COLOR_RATIO);
	var g = Math.floor(rgb[1] * COLOR_RATIO);
	var b = Math.floor(rgb[2] * COLOR_RATIO);
	return r*36 + g*6 + b*1 + 16;
}
/**
 * @namespace
 * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
 */
ROT.RNG = {
	/**
	 * @returns {number} 
	 */
	getSeed: function() {
		return this._seed;
	},

	/**
	 * @param {number} seed Seed the number generator
	 */
	setSeed: function(seed) {
		seed = (seed < 1 ? 1/seed : seed);

		this._seed = seed;
		this._s0 = (seed >>> 0) * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s1 = seed * this._frac;

		seed = (seed*69069 + 1) >>> 0;
		this._s2 = seed * this._frac;

		this._c = 1;
		return this;
	},

	/**
	 * @returns {float} Pseudorandom value [0,1), uniformly distributed
	 */
	getUniform: function() {
		var t = 2091639 * this._s0 + this._c * this._frac;
		this._s0 = this._s1;
		this._s1 = this._s2;
		this._c = t | 0;
		this._s2 = t - this._c;
		return this._s2;
	},

	/**
	 * @param {int} lowerBound The lower end of the range to return a value from, inclusive
	 * @param {int} upperBound The upper end of the range to return a value from, inclusive
	 * @returns {int} Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
	 */
	getUniformInt: function(lowerBound, upperBound) {
		var max = Math.max(lowerBound, upperBound);
		var min = Math.min(lowerBound, upperBound);
		return Math.floor(this.getUniform() * (max - min + 1)) + min;
	},

	/**
	 * @param {float} [mean=0] Mean value
	 * @param {float} [stddev=1] Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
	 * @returns {float} A normally distributed pseudorandom value
	 */
	getNormal: function(mean, stddev) {
		do {
			var u = 2*this.getUniform()-1;
			var v = 2*this.getUniform()-1;
			var r = u*u + v*v;
		} while (r > 1 || r == 0);

		var gauss = u * Math.sqrt(-2*Math.log(r)/r);
		return (mean || 0) + gauss*(stddev || 1);
	},

	/**
	 * @returns {int} Pseudorandom value [1,100] inclusive, uniformly distributed
	 */
	getPercentage: function() {
		return 1 + Math.floor(this.getUniform()*100);
	},
	
	/**
	 * @param {object} data key=whatever, value=weight (relative probability)
	 * @returns {string} whatever
	 */
	getWeightedValue: function(data) {
		var avail = [];
		var total = 0;
		
		for (var id in data) {
			total += data[id];
		}
		var random = Math.floor(this.getUniform()*total);
		
		var part = 0;
		for (var id in data) {
			part += data[id];
			if (random < part) { return id; }
		}
		
		return null;
	},

	/**
	 * Get RNG state. Useful for storing the state and re-setting it via setState.
	 * @returns {?} Internal state
	 */
	getState: function() {
		return [this._s0, this._s1, this._s2, this._c];
	},

	/**
	 * Set a previously retrieved state.
	 * @param {?} state
	 */
	setState: function(state) {
		this._s0 = state[0];
		this._s1 = state[1];
		this._s2 = state[2];
		this._c  = state[3];
		return this;
	},

	_s0: 0,
	_s1: 0,
	_s2: 0,
	_c: 0,
	_frac: 2.3283064365386963e-10 /* 2^-32 */
}

ROT.RNG.setSeed(Date.now());
/**
 * @class (Markov process)-based string generator. 
 * Copied from a <a href="http://www.roguebasin.roguelikedevelopment.org/index.php?title=Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme">RogueBasin article</a>. 
 * Offers configurable order and prior.
 * @param {object} [options]
 * @param {bool} [options.words=false] Use word mode?
 * @param {int} [options.order=3]
 * @param {float} [options.prior=0.001]
 */
ROT.StringGenerator = function(options) {
	this._options = {
		words: false,
		order: 3,
		prior: 0.001
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._boundary = String.fromCharCode(0);
	this._suffix = this._boundary;
	this._prefix = [];
	for (var i=0;i<this._options.order;i++) { this._prefix.push(this._boundary); }

	this._priorValues = {};
	this._priorValues[this._boundary] = this._options.prior;

	this._data = {};
}

/**
 * Remove all learning data
 */
ROT.StringGenerator.prototype.clear = function() {
	this._data = {};
	this._priorValues = {};
}

/**
 * @returns {string} Generated string
 */
ROT.StringGenerator.prototype.generate = function() {
	var result = [this._sample(this._prefix)];
	while (result[result.length-1] != this._boundary) {
		result.push(this._sample(result));
	}
	return this._join(result.slice(0, -1));
}

/**
 * Observe (learn) a string from a training set
 */
ROT.StringGenerator.prototype.observe = function(string) {
	var tokens = this._split(string);

	for (var i=0; i<tokens.length; i++) {
		this._priorValues[tokens[i]] = this._options.prior;
	}

	tokens = this._prefix.concat(tokens).concat(this._suffix); /* add boundary symbols */

	for (var i=this._options.order; i<tokens.length; i++) {
		var context = tokens.slice(i-this._options.order, i);
		var event = tokens[i];
		for (var j=0; j<context.length; j++) {
			var subcontext = context.slice(j);
			this._observeEvent(subcontext, event);
		}
	}
}

ROT.StringGenerator.prototype.getStats = function() {
	var parts = [];

	var priorCount = 0;
	for (var p in this._priorValues) { priorCount++; }
	priorCount--; /* boundary */
	parts.push("distinct samples: " + priorCount);

	var dataCount = 0;
	var eventCount = 0;
	for (var p in this._data) { 
		dataCount++; 
		for (var key in this._data[p]) {
			eventCount++;
		}
	}
	parts.push("dictionary size (contexts): " + dataCount);
	parts.push("dictionary size (events): " + eventCount);

	return parts.join(", ");
}

/**
 * @param {string}
 * @returns {string[]}
 */
ROT.StringGenerator.prototype._split = function(str) {
	return str.split(this._options.words ? /\s+/ : "");
}

/**
 * @param {string[]}
 * @returns {string} 
 */
ROT.StringGenerator.prototype._join = function(arr) {
	return arr.join(this._options.words ? " " : "");
}

/**
 * @param {string[]} context
 * @param {string} event
 */
ROT.StringGenerator.prototype._observeEvent = function(context, event) {
	var key = this._join(context);
	if (!(key in this._data)) { this._data[key] = {}; }
	var data = this._data[key];

	if (!(event in data)) { data[event] = 0; }
	data[event]++;
}

/**
 * @param {string[]}
 * @returns {string}
 */
ROT.StringGenerator.prototype._sample = function(context) {
	context = this._backoff(context);
	var key = this._join(context);
	var data = this._data[key];

	var available = {};

	if (this._options.prior) {
		for (var event in this._priorValues) { available[event] = this._priorValues[event]; }
		for (var event in data) { available[event] += data[event]; }
	} else { 
		available = data;
	}

	return this._pickRandom(available);
}

/**
 * @param {string[]}
 * @returns {string[]}
 */
ROT.StringGenerator.prototype._backoff = function(context) {
	if (context.length > this._options.order) {
		context = context.slice(-this._options.order);
	} else if (context.length < this._options.order) {
		context = this._prefix.slice(0, this._options.order - context.length).concat(context);
	}

	while (!(this._join(context) in this._data) && context.length > 0) { context = context.slice(1); }

	return context;
}


ROT.StringGenerator.prototype._pickRandom = function(data) {
	var total = 0;
	
	for (var id in data) {
		total += data[id];
	}
	var random = ROT.RNG.getUniform()*total;
	
	var part = 0;
	for (var id in data) {
		part += data[id];
		if (random < part) { return id; }
	}
}
/**
 * @class Generic event queue: stores events and retrieves them based on their time
 */
ROT.EventQueue = function() {
	this._time = 0;
	this._events = [];
	this._eventTimes = [];
}

/**
 * @returns {number} Elapsed time
 */
ROT.EventQueue.prototype.getTime = function() {
	return this._time;
}

/**
 * Clear all scheduled events
 */
ROT.EventQueue.prototype.clear = function() {
	this._events = [];
	this._eventTimes = [];
	return this;
}

/**
 * @param {?} event
 * @param {number} time
 */
ROT.EventQueue.prototype.add = function(event, time) {
	var index = this._events.length;
	for (var i=0;i<this._eventTimes.length;i++) {
		if (this._eventTimes[i] > time) {
			index = i;
			break;
		}
	}

	this._events.splice(index, 0, event);
	this._eventTimes.splice(index, 0, time);
}

/**
 * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
 * @returns {? || null} The event previously added by addEvent, null if no event available
 */
ROT.EventQueue.prototype.get = function() {
	if (!this._events.length) { return null; }

	var time = this._eventTimes.splice(0, 1)[0];
	if (time > 0) { /* advance */
		this._time += time;
		for (var i=0;i<this._eventTimes.length;i++) { this._eventTimes[i] -= time; }
	}

	return this._events.splice(0, 1)[0];
}

/**
 * Remove an event from the queue
 * @param {?} event
 * @returns {bool} success?
 */
ROT.EventQueue.prototype.remove = function(event) {
	var index = this._events.indexOf(event);
	if (index == -1) { return false }
	this._remove(index);
	return true;
}

/**
 * Remove an event from the queue
 * @param {int} index
 */
ROT.EventQueue.prototype._remove = function(index) {
	this._events.splice(index, 1);
	this._eventTimes.splice(index, 1);
}
/**
 * @class Abstract scheduler
 */
ROT.Scheduler = function() {
	this._queue = new ROT.EventQueue();
	this._repeat = [];
	this._current = null;
}

/**
 * @see ROT.EventQueue#getTime
 */
ROT.Scheduler.prototype.getTime = function() {
	return this._queue.getTime();
}

/**
 * @param {?} item
 * @param {bool} repeat
 */
ROT.Scheduler.prototype.add = function(item, repeat) {
	if (repeat) { this._repeat.push(item); }
	return this;
}

/**
 * Clear all items
 */
ROT.Scheduler.prototype.clear = function() {
	this._queue.clear();
	this._repeat = [];
	this._current = null;
	return this;
}

/**
 * Remove a previously added item
 * @param {?} item
 * @returns {bool} successful?
 */
ROT.Scheduler.prototype.remove = function(item) {
	var result = this._queue.remove(item);

	var index = this._repeat.indexOf(item);
	if (index != -1) { this._repeat.splice(index, 1); }

	if (this._current == item) { this._current = null; }

	return result;
}

/**
 * Schedule next item
 * @returns {?}
 */
ROT.Scheduler.prototype.next = function() {
	this._current = this._queue.get();
	return this._current;
}
/**
 * @class Simple fair scheduler (round-robin style)
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Simple = function() {
	ROT.Scheduler.call(this);
}
ROT.Scheduler.Simple.extend(ROT.Scheduler);

/**
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Simple.prototype.add = function(item, repeat) {
	this._queue.add(item, 0);
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Simple.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, 0);
	}
	return ROT.Scheduler.prototype.next.call(this);
}
/**
 * @class Speed-based scheduler
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Speed = function() {
	ROT.Scheduler.call(this);
}
ROT.Scheduler.Speed.extend(ROT.Scheduler);

/**
 * @param {object} item anything with "getSpeed" method
 * @param {bool} repeat
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Speed.prototype.add = function(item, repeat) {
	this._queue.add(item, 1/item.getSpeed());
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Speed.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, 1/this._current.getSpeed());
	}
	return ROT.Scheduler.prototype.next.call(this);
}
/**
 * @class Action-based scheduler
 * @augments ROT.Scheduler
 */
ROT.Scheduler.Action = function() {
	ROT.Scheduler.call(this);
	this._defaultDuration = 1; /* for newly added */
	this._duration = this._defaultDuration; /* for this._current */
}
ROT.Scheduler.Action.extend(ROT.Scheduler);

/**
 * @param {object} item
 * @param {bool} repeat
 * @param {number} [time=1]
 * @see ROT.Scheduler#add
 */
ROT.Scheduler.Action.prototype.add = function(item, repeat, time) {
	this._queue.add(item, time || this._defaultDuration);
	return ROT.Scheduler.prototype.add.call(this, item, repeat);
}

ROT.Scheduler.Action.prototype.clear = function() {
	this._duration = this._defaultDuration;
	return ROT.Scheduler.prototype.clear.call(this);
}

ROT.Scheduler.Action.prototype.remove = function(item) {
	if (item == this._current) { this._duration = this._defaultDuration; }
	return ROT.Scheduler.prototype.remove.call(this, item);
}

/**
 * @see ROT.Scheduler#next
 */
ROT.Scheduler.Action.prototype.next = function() {
	if (this._current && this._repeat.indexOf(this._current) != -1) {
		this._queue.add(this._current, this._duration || this._defaultDuration);
		this._duration = this._defaultDuration;
	}
	return ROT.Scheduler.prototype.next.call(this);
}

/**
 * Set duration for the active item
 */
ROT.Scheduler.Action.prototype.setDuration = function(time) {
	if (this._current) { this._duration = time; }
	return this;
}
/**
 * @class Asynchronous main loop
 * @param {ROT.Scheduler} scheduler
 */
ROT.Engine = function(scheduler) {
	this._scheduler = scheduler;
	this._lock = 1;
}

/**
 * Start the main loop. When this call returns, the loop is locked.
 */
ROT.Engine.prototype.start = function() {
	return this.unlock();
}

/**
 * Interrupt the engine by an asynchronous action
 */
ROT.Engine.prototype.lock = function() {
	this._lock++;
	return this;
}

/**
 * Resume execution (paused by a previous lock)
 */
ROT.Engine.prototype.unlock = function() {
	if (!this._lock) { throw new Error("Cannot unlock unlocked engine"); }
	this._lock--;

	while (!this._lock) {
		var actor = this._scheduler.next();
		if (!actor) { return this.lock(); } /* no actors */
		var result = actor.act();
		if (result && result.then) { /* actor returned a "thenable", looks like a Promise */
			this.lock();
			result.then(this.unlock.bind(this));
		}
	}

	return this;
}
/**
 * @class Base map generator
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 */
ROT.Map = function(width, height) {
	this._width = width || ROT.DEFAULT_WIDTH;
	this._height = height || ROT.DEFAULT_HEIGHT;
};

ROT.Map.prototype.create = function(callback) {}

ROT.Map.prototype._fillMap = function(value) {
	var map = [];
	for (var i=0;i<this._width;i++) {
		map.push([]);
		for (var j=0;j<this._height;j++) { map[i].push(value); }
	}
	return map;
}
/**
 * @class Simple empty rectangular room
 * @augments ROT.Map
 */
ROT.Map.Arena = function(width, height) {
	ROT.Map.call(this, width, height);
}
ROT.Map.Arena.extend(ROT.Map);

ROT.Map.Arena.prototype.create = function(callback) {
	var w = this._width-1;
	var h = this._height-1;
	for (var i=0;i<=w;i++) {
		for (var j=0;j<=h;j++) {
			var empty = (i && j && i<w && j<h);
			callback(i, j, empty ? 0 : 1);
		}
	}
	return this;
}
/**
 * @class Recursively divided maze, http://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
 * @augments ROT.Map
 */
ROT.Map.DividedMaze = function(width, height) {
	ROT.Map.call(this, width, height);
	this._stack = [];
}
ROT.Map.DividedMaze.extend(ROT.Map);

ROT.Map.DividedMaze.prototype.create = function(callback) {
	var w = this._width;
	var h = this._height;
	
	this._map = [];
	
	for (var i=0;i<w;i++) {
		this._map.push([]);
		for (var j=0;j<h;j++) {
			var border = (i == 0 || j == 0 || i+1 == w || j+1 == h);
			this._map[i].push(border ? 1 : 0);
		}
	}
	
	this._stack = [
		[1, 1, w-2, h-2]
	];
	this._process();
	
	for (var i=0;i<w;i++) {
		for (var j=0;j<h;j++) {
			callback(i, j, this._map[i][j]);
		}
	}
	this._map = null;
	return this;
}

ROT.Map.DividedMaze.prototype._process = function() {
	while (this._stack.length) {
		var room = this._stack.shift(); /* [left, top, right, bottom] */
		this._partitionRoom(room);
	}
}

ROT.Map.DividedMaze.prototype._partitionRoom = function(room) {
	var availX = [];
	var availY = [];
	
	for (var i=room[0]+1;i<room[2];i++) {
		var top = this._map[i][room[1]-1];
		var bottom = this._map[i][room[3]+1];
		if (top && bottom && !(i % 2)) { availX.push(i); }
	}
	
	for (var j=room[1]+1;j<room[3];j++) {
		var left = this._map[room[0]-1][j];
		var right = this._map[room[2]+1][j];
		if (left && right && !(j % 2)) { availY.push(j); }
	}

	if (!availX.length || !availY.length) { return; }

	var x = availX.random();
	var y = availY.random();
	
	this._map[x][y] = 1;
	
	var walls = [];
	
	var w = []; walls.push(w); /* left part */
	for (var i=room[0]; i<x; i++) { 
		this._map[i][y] = 1;
		w.push([i, y]); 
	}
	
	var w = []; walls.push(w); /* right part */
	for (var i=x+1; i<=room[2]; i++) { 
		this._map[i][y] = 1;
		w.push([i, y]); 
	}

	var w = []; walls.push(w); /* top part */
	for (var j=room[1]; j<y; j++) { 
		this._map[x][j] = 1;
		w.push([x, j]); 
	}
	
	var w = []; walls.push(w); /* bottom part */
	for (var j=y+1; j<=room[3]; j++) { 
		this._map[x][j] = 1;
		w.push([x, j]); 
	}
		
	var solid = walls.random();
	for (var i=0;i<walls.length;i++) {
		var w = walls[i];
		if (w == solid) { continue; }
		
		var hole = w.random();
		this._map[hole[0]][hole[1]] = 0;
	}

	this._stack.push([room[0], room[1], x-1, y-1]); /* left top */
	this._stack.push([x+1, room[1], room[2], y-1]); /* right top */
	this._stack.push([room[0], y+1, x-1, room[3]]); /* left bottom */
	this._stack.push([x+1, y+1, room[2], room[3]]); /* right bottom */
}
/**
 * @class Icey's Maze generator
 * See http://www.roguebasin.roguelikedevelopment.org/index.php?title=Simple_maze for explanation
 * @augments ROT.Map
 */
ROT.Map.IceyMaze = function(width, height, regularity) {
	ROT.Map.call(this, width, height);
	this._regularity = regularity || 0;
}
ROT.Map.IceyMaze.extend(ROT.Map);

ROT.Map.IceyMaze.prototype.create = function(callback) {
	var width = this._width;
	var height = this._height;
	
	var map = this._fillMap(1);
	
	width -= (width % 2 ? 1 : 2);
	height -= (height % 2 ? 1 : 2);

	var cx = 0;
	var cy = 0;
	var nx = 0;
	var ny = 0;

	var done = 0;
	var blocked = false;
	var dirs = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0]
	];
	do {
		cx = 1 + 2*Math.floor(ROT.RNG.getUniform()*(width-1) / 2);
		cy = 1 + 2*Math.floor(ROT.RNG.getUniform()*(height-1) / 2);

		if (!done) { map[cx][cy] = 0; }
		
		if (!map[cx][cy]) {
			this._randomize(dirs);
			do {
				if (Math.floor(ROT.RNG.getUniform()*(this._regularity+1)) == 0) { this._randomize(dirs); }
				blocked = true;
				for (var i=0;i<4;i++) {
					nx = cx + dirs[i][0]*2;
					ny = cy + dirs[i][1]*2;
					if (this._isFree(map, nx, ny, width, height)) {
						map[nx][ny] = 0;
						map[cx + dirs[i][0]][cy + dirs[i][1]] = 0;
						
						cx = nx;
						cy = ny;
						blocked = false;
						done++;
						break;
					}
				}
			} while (!blocked);
		}
	} while (done+1 < width*height/4);
	
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			callback(i, j, map[i][j]);
		}
	}
	this._map = null;
	return this;
}

ROT.Map.IceyMaze.prototype._randomize = function(dirs) {
	for (var i=0;i<4;i++) {
		dirs[i][0] = 0;
		dirs[i][1] = 0;
	}
	
	switch (Math.floor(ROT.RNG.getUniform()*4)) {
		case 0:
			dirs[0][0] = -1; dirs[1][0] = 1;
			dirs[2][1] = -1; dirs[3][1] = 1;
		break;
		case 1:
			dirs[3][0] = -1; dirs[2][0] = 1;
			dirs[1][1] = -1; dirs[0][1] = 1;
		break;
		case 2:
			dirs[2][0] = -1; dirs[3][0] = 1;
			dirs[0][1] = -1; dirs[1][1] = 1;
		break;
		case 3:
			dirs[1][0] = -1; dirs[0][0] = 1;
			dirs[3][1] = -1; dirs[2][1] = 1;
		break;
	}
}

ROT.Map.IceyMaze.prototype._isFree = function(map, x, y, width, height) {
	if (x < 1 || y < 1 || x >= width || y >= height) { return false; }
	return map[x][y];
}
/**
 * @class Maze generator - Eller's algorithm
 * See http://homepages.cwi.nl/~tromp/maze.html for explanation
 * @augments ROT.Map
 */
ROT.Map.EllerMaze = function(width, height) {
	ROT.Map.call(this, width, height);
}
ROT.Map.EllerMaze.extend(ROT.Map);

ROT.Map.EllerMaze.prototype.create = function(callback) {
	var map = this._fillMap(1);
	var w = Math.ceil((this._width-2)/2);
	
	var rand = 9/24;
	
	var L = [];
	var R = [];
	
	for (var i=0;i<w;i++) {
		L.push(i);
		R.push(i);
	}
	L.push(w-1); /* fake stop-block at the right side */

	for (var j=1;j+3<this._height;j+=2) {
		/* one row */
		for (var i=0;i<w;i++) {
			/* cell coords (will be always empty) */
			var x = 2*i+1;
			var y = j;
			map[x][y] = 0;
			
			/* right connection */
			if (i != L[i+1] && ROT.RNG.getUniform() > rand) {
				this._addToList(i, L, R);
				map[x+1][y] = 0;
			}
			
			/* bottom connection */
			if (i != L[i] && ROT.RNG.getUniform() > rand) {
				/* remove connection */
				this._removeFromList(i, L, R);
			} else {
				/* create connection */
				map[x][y+1] = 0;
			}
		}
	}

	/* last row */
	for (var i=0;i<w;i++) {
		/* cell coords (will be always empty) */
		var x = 2*i+1;
		var y = j;
		map[x][y] = 0;
		
		/* right connection */
		if (i != L[i+1] && (i == L[i] || ROT.RNG.getUniform() > rand)) {
			/* dig right also if the cell is separated, so it gets connected to the rest of maze */
			this._addToList(i, L, R);
			map[x+1][y] = 0;
		}
		
		this._removeFromList(i, L, R);
	}
	
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			callback(i, j, map[i][j]);
		}
	}
	
	return this;
}

/**
 * Remove "i" from its list
 */
ROT.Map.EllerMaze.prototype._removeFromList = function(i, L, R) {
	R[L[i]] = R[i];
	L[R[i]] = L[i];
	R[i] = i;
	L[i] = i;
}

/**
 * Join lists with "i" and "i+1"
 */
ROT.Map.EllerMaze.prototype._addToList = function(i, L, R) {
	R[L[i+1]] = R[i];
	L[R[i]] = L[i+1];
	R[i] = i+1;
	L[i+1] = i;
}
/**
 * @class Cellular automaton map generator
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.born] List of neighbor counts for a new cell to be born in empty space
 * @param {int[]} [options.survive] List of neighbor counts for an existing  cell to survive
 * @param {int} [options.topology] Topology 4 or 6 or 8
 */
ROT.Map.Cellular = function(width, height, options) {
	ROT.Map.call(this, width, height);
	this._options = {
		born: [5, 6, 7, 8],
		survive: [4, 5, 6, 7, 8],
		topology: 8,
		connected: false
	};
	this.setOptions(options);
	
	this._dirs = ROT.DIRS[this._options.topology];
	this._map = this._fillMap(0);
}
ROT.Map.Cellular.extend(ROT.Map);

/**
 * Fill the map with random values
 * @param {float} probability Probability for a cell to become alive; 0 = all empty, 1 = all full
 */
ROT.Map.Cellular.prototype.randomize = function(probability) {
	for (var i=0;i<this._width;i++) {
		for (var j=0;j<this._height;j++) {
			this._map[i][j] = (ROT.RNG.getUniform() < probability ? 1 : 0);
		}
	}
	return this;
}

/**
 * Change options.
 * @see ROT.Map.Cellular
 */
ROT.Map.Cellular.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
}

ROT.Map.Cellular.prototype.set = function(x, y, value) {
	this._map[x][y] = value;
}

ROT.Map.Cellular.prototype.create = function(callback) {
	var newMap = this._fillMap(0);
	var born = this._options.born;
	var survive = this._options.survive;


	for (var j=0;j<this._height;j++) {
		var widthStep = 1;
		var widthStart = 0;
		if (this._options.topology == 6) { 
			widthStep = 2;
			widthStart = j%2;
		}

		for (var i=widthStart; i<this._width; i+=widthStep) {

			var cur = this._map[i][j];
			var ncount = this._getNeighbors(i, j);
			
			if (cur && survive.indexOf(ncount) != -1) { /* survive */
				newMap[i][j] = 1;
			} else if (!cur && born.indexOf(ncount) != -1) { /* born */
				newMap[i][j] = 1;
			}			
		}
	}
	
	this._map = newMap;

	// optinially connect every space
	if (this._options.connected) {
		this._completeMaze();	
	}

	if (callback) { 
		for (var i = 0; i < this._width; i++) {
			for (var j = 0; j < this._height; j++) {
				callback(i, j, newMap[i][j]);
			}
		}
	}
}

/**
 * Get neighbor count at [i,j] in this._map
 */
ROT.Map.Cellular.prototype._getNeighbors = function(cx, cy) {
	var result = 0;
	for (var i=0;i<this._dirs.length;i++) {
		var dir = this._dirs[i];
		var x = cx + dir[0];
		var y = cy + dir[1];
		
		if (x < 0 || x >= this._width || x < 0 || y >= this._width) { continue; }
		result += (this._map[x][y] == 1 ? 1 : 0);
	}
	
	return result;
}

/**
 * Make sure every non-wall space is accessible.
 */
ROT.Map.Cellular.prototype._completeMaze = function() {
	var allFreeSpace = [];
	var notConnected = {};
	// find all free space
	for (var x = 0; x < this._width; x++) {
		for (var y = 0; y < this._height; y++) {
			if (this._freeSpace(x, y)) {
				var p = [x, y];
				notConnected[this._pointKey(p)] = p;
				allFreeSpace.push([x, y]);
			}
		}
	}
	var start = allFreeSpace[ROT.RNG.getUniformInt(0, allFreeSpace.length - 1)];

	var key = this._pointKey(start);
	var connected = {};
	connected[key] = start;
	delete notConnected[key]

	// find what's connected to the starting point
	this._findConnected(connected, notConnected, [start]);

	while(Object.keys(notConnected).length > 0) {

		// find two points from notConnected to connected
		var p = this._getFromTo(connected, notConnected);
		var from = p[0]; // notConnected
		var to = p[1]; // connected

		// find everything connected to the starting point
		var local = {};
		local[this._pointKey(from)] = from;
		this._findConnected(local, notConnected, [from], true);

		// connect to a connected square
		this._tunnelToConnected(to, from, connected, notConnected);

		// now all of local is connected
		for (var k in local) {
			var pp = local[k];
			this._map[pp[0]][pp[1]] = 0;
			connected[k] = pp;
			delete notConnected[k];
		}
	}
}

/**
 * Find random points to connect. Search for the closest point in the larger space. 
 * This is to minimize the length of the passage while maintaining good performance.
 */
ROT.Map.Cellular.prototype._getFromTo = function(connected, notConnected) {
	var from, to, d;
	var connectedKeys = Object.keys(connected);
	var notConnectedKeys = Object.keys(notConnected);
	for (var i = 0; i < 5; i++) {
		if (connectedKeys.length < notConnectedKeys.length) {
			var keys = connectedKeys;
			to = connected[keys[ROT.RNG.getUniformInt(0, keys.length - 1)]]
			from = this._getClosest(to, notConnected);
		} else {
			var keys = notConnectedKeys;
			from = notConnected[keys[ROT.RNG.getUniformInt(0, keys.length - 1)]]
			to = this._getClosest(from, connected);
		}
		d = (from[0] - to[0]) * (from[0] - to[0]) + (from[1] - to[1]) * (from[1] - to[1]);
		if (d < 64) {
			break;
		}
	}
	// console.log(">>> connected=" + to + " notConnected=" + from + " dist=" + d);
	return [from, to];
}

ROT.Map.Cellular.prototype._getClosest = function(point, space) {
	var minPoint = null;
	var minDist = null;
	for (k in space) {
		var p = space[k];
		var d = (p[0] - point[0]) * (p[0] - point[0]) + (p[1] - point[1]) * (p[1] - point[1]);
		if (minDist == null || d < minDist) {
			minDist = d;
			minPoint = p;
		}
	}
	return minPoint;
}

ROT.Map.Cellular.prototype._findConnected = function(connected, notConnected, stack, keepNotConnected) {
	while(stack.length > 0) {
		var p = stack.splice(0, 1)[0];
		var tests = [
			[p[0] + 1, p[1]],
			[p[0] - 1, p[1]],
			[p[0],     p[1] + 1],
			[p[0],     p[1] - 1]
		];
		for (var i = 0; i < tests.length; i++) {
			var key = this._pointKey(tests[i]);
			if (connected[key] == null && this._freeSpace(tests[i][0], tests[i][1])) {
				connected[key] = tests[i];
				if (!keepNotConnected) {
					delete notConnected[key];
				}
				stack.push(tests[i]);
			}
		}
	}
}

ROT.Map.Cellular.prototype._tunnelToConnected = function(to, from, connected, notConnected) {
	var key = this._pointKey(from);
	var a, b;
	if (from[0] < to[0]) {
		a = from;
		b = to;
	} else {
		a = to;
		b = from;
	}
	for (var xx = a[0]; xx <= b[0]; xx++) {
		this._map[xx][a[1]] = 0;
		var p = [xx, a[1]];
		var pkey = this._pointKey(p);
		connected[pkey] = p;
		delete notConnected[pkey];
	}

	// x is now fixed
	var x = b[0];

	if (from[1] < to[1]) {
		a = from;
		b = to;
	} else {
		a = to;
		b = from;
	}
	for (var yy = a[1]; yy < b[1]; yy++) {
		this._map[x][yy] = 0;
		var p = [x, yy];
		var pkey = this._pointKey(p);
		connected[pkey] = p;
		delete notConnected[pkey];
	}
}

ROT.Map.Cellular.prototype._freeSpace = function(x, y) {
	return x >= 0 && x < this._width && y >= 0 && y < this._height && this._map[x][y] != 1;
}

ROT.Map.Cellular.prototype._pointKey = function(p) {
	return p[0] + "." + p[1];
}

/**
 * @class Dungeon map: has rooms and corridors
 * @augments ROT.Map
 */
ROT.Map.Dungeon = function(width, height) {
	ROT.Map.call(this, width, height);
	this._rooms = []; /* list of all rooms */
	this._corridors = [];
}
ROT.Map.Dungeon.extend(ROT.Map);

/**
 * Get all generated rooms
 * @returns {ROT.Map.Feature.Room[]}
 */
ROT.Map.Dungeon.prototype.getRooms = function() {
	return this._rooms;
}

/**
 * Get all generated corridors
 * @returns {ROT.Map.Feature.Corridor[]}
 */
ROT.Map.Dungeon.prototype.getCorridors = function() {
	return this._corridors;
}
/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at 
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm.
 * @augments ROT.Map.Dungeon
 */
ROT.Map.Digger = function(width, height, options) {
	ROT.Map.Dungeon.call(this, width, height);
	
	this._options = {
		roomWidth: [3, 9], /* room minimum and maximum width */
		roomHeight: [3, 5], /* room minimum and maximum height */
		corridorLength: [3, 10], /* corridor minimum and maximum length */
		dugPercentage: 0.2, /* we stop after this percentage of level area has been dug out */
		timeLimit: 1000 /* we stop after this much time has passed (msec) */
	}
	for (var p in options) { this._options[p] = options[p]; }
	
	this._features = {
		"Room": 4,
		"Corridor": 4
	}
	this._featureAttempts = 20; /* how many times do we try to create a feature on a suitable wall */
	this._walls = {}; /* these are available for digging */
	
	this._digCallback = this._digCallback.bind(this);
	this._canBeDugCallback = this._canBeDugCallback.bind(this);
	this._isWallCallback = this._isWallCallback.bind(this);
	this._priorityWallCallback = this._priorityWallCallback.bind(this);
}
ROT.Map.Digger.extend(ROT.Map.Dungeon);

/**
 * Create a map
 * @see ROT.Map#create
 */
ROT.Map.Digger.prototype.create = function(callback) {
	this._rooms = [];
	this._corridors = [];
	this._map = this._fillMap(1);
	this._walls = {};
	this._dug = 0;
	var area = (this._width-2) * (this._height-2);

	this._firstRoom();
	
	var t1 = Date.now();

	do {
		var t2 = Date.now();
		if (t2 - t1 > this._options.timeLimit) { break; }

		/* find a good wall */
		var wall = this._findWall();
		if (!wall) { break; } /* no more walls */
		
		var parts = wall.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		var dir = this._getDiggingDirection(x, y);
		if (!dir) { continue; } /* this wall is not suitable */
		
//		console.log("wall", x, y);

		/* try adding a feature */
		var featureAttempts = 0;
		do {
			featureAttempts++;
			if (this._tryFeature(x, y, dir[0], dir[1])) { /* feature added */
				//if (this._rooms.length + this._corridors.length == 2) { this._rooms[0].addDoor(x, y); } /* first room oficially has doors */
				this._removeSurroundingWalls(x, y);
				this._removeSurroundingWalls(x-dir[0], y-dir[1]);
				break; 
			}
		} while (featureAttempts < this._featureAttempts);
		
		var priorityWalls = 0;
		for (var id in this._walls) { 
			if (this._walls[id] > 1) { priorityWalls++; }
		}

	} while (this._dug/area < this._options.dugPercentage || priorityWalls); /* fixme number of priority walls */

	this._addDoors();

	if (callback) {
		for (var i=0;i<this._width;i++) {
			for (var j=0;j<this._height;j++) {
				callback(i, j, this._map[i][j]);
			}
		}
	}
	
	this._walls = {};
	this._map = null;

	return this;
}

ROT.Map.Digger.prototype._digCallback = function(x, y, value) {
	if (value == 0 || value == 2) { /* empty */
		this._map[x][y] = 0;
		this._dug++;
	} else { /* wall */
		this._walls[x+","+y] = 1;
	}
}

ROT.Map.Digger.prototype._isWallCallback = function(x, y) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Digger.prototype._canBeDugCallback = function(x, y) {
	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Digger.prototype._priorityWallCallback = function(x, y) {
	this._walls[x+","+y] = 2;
}

ROT.Map.Digger.prototype._firstRoom = function() {
	var cx = Math.floor(this._width/2);
	var cy = Math.floor(this._height/2);
	var room = ROT.Map.Feature.Room.createRandomCenter(cx, cy, this._options);
	this._rooms.push(room);
	room.create(this._digCallback);
}

/**
 * Get a suitable wall
 */
ROT.Map.Digger.prototype._findWall = function() {
	var prio1 = [];
	var prio2 = [];
	for (var id in this._walls) {
		var prio = this._walls[id];
		if (prio == 2) { 
			prio2.push(id); 
		} else {
			prio1.push(id);
		}
	}
	
	var arr = (prio2.length ? prio2 : prio1);
	if (!arr.length) { return null; } /* no walls :/ */
	
	var id = arr.random();
	delete this._walls[id];

	return id;
}

/**
 * Tries adding a feature
 * @returns {bool} was this a successful try?
 */
ROT.Map.Digger.prototype._tryFeature = function(x, y, dx, dy) {
	var feature = ROT.RNG.getWeightedValue(this._features);
	feature = ROT.Map.Feature[feature].createRandomAt(x, y, dx, dy, this._options);
	
	if (!feature.isValid(this._isWallCallback, this._canBeDugCallback)) {
//		console.log("not valid");
//		feature.debug();
		return false;
	}
	
	feature.create(this._digCallback);
//	feature.debug();

	if (feature instanceof ROT.Map.Feature.Room) { this._rooms.push(feature); }
	if (feature instanceof ROT.Map.Feature.Corridor) { 
		feature.createPriorityWalls(this._priorityWallCallback);
		this._corridors.push(feature); 
	}
	
	return true;
}

ROT.Map.Digger.prototype._removeSurroundingWalls = function(cx, cy) {
	var deltas = ROT.DIRS[4];

	for (var i=0;i<deltas.length;i++) {
		var delta = deltas[i];
		var x = cx + delta[0];
		var y = cy + delta[1];
		delete this._walls[x+","+y];
		var x = cx + 2*delta[0];
		var y = cy + 2*delta[1];
		delete this._walls[x+","+y];
	}
}

/**
 * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
 */
ROT.Map.Digger.prototype._getDiggingDirection = function(cx, cy) {
	var result = null;
	var deltas = ROT.DIRS[4];
	
	for (var i=0;i<deltas.length;i++) {
		var delta = deltas[i];
		var x = cx + delta[0];
		var y = cy + delta[1];
		
		if (x < 0 || y < 0 || x >= this._width || y >= this._width) { return null; }
		
		if (!this._map[x][y]) { /* there already is another empty neighbor! */
			if (result) { return null; }
			result = delta;
		}
	}
	
	/* no empty neighbor */
	if (!result) { return null; }
	
	return [-result[0], -result[1]];
}

/**
 * Find empty spaces surrounding rooms, and apply doors.
 */
ROT.Map.Digger.prototype._addDoors = function() {
	var data = this._map;
	var isWallCallback = function(x, y) {
		return (data[x][y] == 1);
	}
	for (var i = 0; i < this._rooms.length; i++ ) {
		var room = this._rooms[i];
		room.clearDoors();
		room.addDoors(isWallCallback);
	}
}
/**
 * @class Dungeon generator which tries to fill the space evenly. Generates independent rooms and tries to connect them.
 * @augments ROT.Map.Dungeon
 */
ROT.Map.Uniform = function(width, height, options) {
	ROT.Map.Dungeon.call(this, width, height);

	this._options = {
		roomWidth: [3, 9], /* room minimum and maximum width */
		roomHeight: [3, 5], /* room minimum and maximum height */
		roomDugPercentage: 0.1, /* we stop after this percentage of level area has been dug out by rooms */
		timeLimit: 1000 /* we stop after this much time has passed (msec) */
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._roomAttempts = 20; /* new room is created N-times until is considered as impossible to generate */
	this._corridorAttempts = 20; /* corridors are tried N-times until the level is considered as impossible to connect */

	this._connected = []; /* list of already connected rooms */
	this._unconnected = []; /* list of remaining unconnected rooms */
	
	this._digCallback = this._digCallback.bind(this);
	this._canBeDugCallback = this._canBeDugCallback.bind(this);
	this._isWallCallback = this._isWallCallback.bind(this);
}
ROT.Map.Uniform.extend(ROT.Map.Dungeon);

/**
 * Create a map. If the time limit has been hit, returns null.
 * @see ROT.Map#create
 */
ROT.Map.Uniform.prototype.create = function(callback) {
	var t1 = Date.now();
	while (1) {
		var t2 = Date.now();
		if (t2 - t1 > this._options.timeLimit) { return null; } /* time limit! */
	
		this._map = this._fillMap(1);
		this._dug = 0;
		this._rooms = [];
		this._unconnected = [];
		this._generateRooms();
		if (this._rooms.length < 2) { continue; }
		if (this._generateCorridors()) { break; }
	}
	
	if (callback) {
		for (var i=0;i<this._width;i++) {
			for (var j=0;j<this._height;j++) {
				callback(i, j, this._map[i][j]);
			}
		}
	}
	
	return this;
}

/**
 * Generates a suitable amount of rooms
 */
ROT.Map.Uniform.prototype._generateRooms = function() {
	var w = this._width-2;
	var h = this._height-2;

	do {
		var room = this._generateRoom();
		if (this._dug/(w*h) > this._options.roomDugPercentage) { break; } /* achieved requested amount of free space */
	} while (room);

	/* either enough rooms, or not able to generate more of them :) */
}

/**
 * Try to generate one room
 */
ROT.Map.Uniform.prototype._generateRoom = function() {
	var count = 0;
	while (count < this._roomAttempts) {
		count++;
		
		var room = ROT.Map.Feature.Room.createRandom(this._width, this._height, this._options);
		if (!room.isValid(this._isWallCallback, this._canBeDugCallback)) { continue; }
		
		room.create(this._digCallback);
		this._rooms.push(room);
		return room;
	} 

	/* no room was generated in a given number of attempts */
	return null;
}

/**
 * Generates connectors beween rooms
 * @returns {bool} success Was this attempt successfull?
 */
ROT.Map.Uniform.prototype._generateCorridors = function() {
	var cnt = 0;
	while (cnt < this._corridorAttempts) {
		cnt++;
		this._corridors = [];

		/* dig rooms into a clear map */
		this._map = this._fillMap(1);
		for (var i=0;i<this._rooms.length;i++) { 
			var room = this._rooms[i];
			room.clearDoors();
			room.create(this._digCallback); 
		}

		this._unconnected = this._rooms.slice().randomize();
		this._connected = [];
		if (this._unconnected.length) { this._connected.push(this._unconnected.pop()); } /* first one is always connected */
		
		while (1) {
			/* 1. pick random connected room */
			var connected = this._connected.random();
			
			/* 2. find closest unconnected */
			var room1 = this._closestRoom(this._unconnected, connected);
			
			/* 3. connect it to closest connected */
			var room2 = this._closestRoom(this._connected, room1);
			
			var ok = this._connectRooms(room1, room2);
			if (!ok) { break; } /* stop connecting, re-shuffle */
			
			if (!this._unconnected.length) { return true; } /* done; no rooms remain */
		}
	}
	return false;
}

/**
 * For a given room, find the closest one from the list
 */
ROT.Map.Uniform.prototype._closestRoom = function(rooms, room) {
	var dist = Infinity;
	var center = room.getCenter();
	var result = null;
	
	for (var i=0;i<rooms.length;i++) {
		var r = rooms[i];
		var c = r.getCenter();
		var dx = c[0]-center[0];
		var dy = c[1]-center[1];
		var d = dx*dx+dy*dy;
		
		if (d < dist) {
			dist = d;
			result = r;
		}
	}
	
	return result;
}

ROT.Map.Uniform.prototype._connectRooms = function(room1, room2) {
	/*
		room1.debug();
		room2.debug();
	*/

	var center1 = room1.getCenter();
	var center2 = room2.getCenter();

	var diffX = center2[0] - center1[0];
	var diffY = center2[1] - center1[1];

	if (Math.abs(diffX) < Math.abs(diffY)) { /* first try connecting north-south walls */
		var dirIndex1 = (diffY > 0 ? 2 : 0);
		var dirIndex2 = (dirIndex1 + 2) % 4;
		var min = room2.getLeft();
		var max = room2.getRight();
		var index = 0;
	} else { /* first try connecting east-west walls */
		var dirIndex1 = (diffX > 0 ? 1 : 3);
		var dirIndex2 = (dirIndex1 + 2) % 4;
		var min = room2.getTop();
		var max = room2.getBottom();
		var index = 1;
	}

	var start = this._placeInWall(room1, dirIndex1); /* corridor will start here */
	if (!start) { return false; }

	if (start[index] >= min && start[index] <= max) { /* possible to connect with straight line (I-like) */
		var end = start.slice();
		var value = null;
		switch (dirIndex2) {
			case 0: value = room2.getTop()-1; break;
			case 1: value = room2.getRight()+1; break;
			case 2: value = room2.getBottom()+1; break;
			case 3: value = room2.getLeft()-1; break;
		}
		end[(index+1)%2] = value;
		this._digLine([start, end]);
		
	} else if (start[index] < min-1 || start[index] > max+1) { /* need to switch target wall (L-like) */

		var diff = start[index] - center2[index];
		switch (dirIndex2) {
			case 0:
			case 1:	var rotation = (diff < 0 ? 3 : 1); break;
			case 2:
			case 3:	var rotation = (diff < 0 ? 1 : 3); break;
		}
		dirIndex2 = (dirIndex2 + rotation) % 4;
		
		var end = this._placeInWall(room2, dirIndex2);
		if (!end) { return false; }

		var mid = [0, 0];
		mid[index] = start[index];
		var index2 = (index+1)%2;
		mid[index2] = end[index2];
		this._digLine([start, mid, end]);
		
	} else { /* use current wall pair, but adjust the line in the middle (S-like) */
	
		var index2 = (index+1)%2;
		var end = this._placeInWall(room2, dirIndex2);
		if (!end) { return; }
		var mid = Math.round((end[index2] + start[index2])/2);

		var mid1 = [0, 0];
		var mid2 = [0, 0];
		mid1[index] = start[index];
		mid1[index2] = mid;
		mid2[index] = end[index];
		mid2[index2] = mid;
		this._digLine([start, mid1, mid2, end]);
	}

	room1.addDoor(start[0], start[1]);
	room2.addDoor(end[0], end[1]);
	
	var index = this._unconnected.indexOf(room1);
	if (index != -1) {
		this._unconnected.splice(index, 1);
		this._connected.push(room1);
	}

	var index = this._unconnected.indexOf(room2);
	if (index != -1) {
		this._unconnected.splice(index, 1);
		this._connected.push(room2);
	}
	
	return true;
}

ROT.Map.Uniform.prototype._placeInWall = function(room, dirIndex) {
	var start = [0, 0];
	var dir = [0, 0];
	var length = 0;
	
	switch (dirIndex) {
		case 0:
			dir = [1, 0];
			start = [room.getLeft(), room.getTop()-1];
			length = room.getRight()-room.getLeft()+1;
		break;
		case 1:
			dir = [0, 1];
			start = [room.getRight()+1, room.getTop()];
			length = room.getBottom()-room.getTop()+1;
		break;
		case 2:
			dir = [1, 0];
			start = [room.getLeft(), room.getBottom()+1];
			length = room.getRight()-room.getLeft()+1;
		break;
		case 3:
			dir = [0, 1];
			start = [room.getLeft()-1, room.getTop()];
			length = room.getBottom()-room.getTop()+1;
		break;
	}
	
	var avail = [];
	var lastBadIndex = -2;

	for (var i=0;i<length;i++) {
		var x = start[0] + i*dir[0];
		var y = start[1] + i*dir[1];
		avail.push(null);
		
		var isWall = (this._map[x][y] == 1);
		if (isWall) {
			if (lastBadIndex != i-1) { avail[i] = [x, y]; }
		} else {
			lastBadIndex = i;
			if (i) { avail[i-1] = null; }
		}
	}
	
	for (var i=avail.length-1; i>=0; i--) {
		if (!avail[i]) { avail.splice(i, 1); }
	}
	return (avail.length ? avail.random() : null);
}

/**
 * Dig a polyline.
 */
ROT.Map.Uniform.prototype._digLine = function(points) {
	for (var i=1;i<points.length;i++) {
		var start = points[i-1];
		var end = points[i];
		var corridor = new ROT.Map.Feature.Corridor(start[0], start[1], end[0], end[1]);
		corridor.create(this._digCallback);
		this._corridors.push(corridor);
	}
}

ROT.Map.Uniform.prototype._digCallback = function(x, y, value) {
	this._map[x][y] = value;
	if (value == 0) { this._dug++; }
}

ROT.Map.Uniform.prototype._isWallCallback = function(x, y) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

ROT.Map.Uniform.prototype._canBeDugCallback = function(x, y) {
	if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
	return (this._map[x][y] == 1);
}

/**
 * @author hyakugei
 * @class Dungeon generator which uses the "orginal" Rogue dungeon generation algorithm. See http://kuoi.com/~kamikaze/GameDesign/art07_rogue_dungeon.php
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.cellWidth=3] Number of cells to create on the horizontal (number of rooms horizontally)
 * @param {int[]} [options.cellHeight=3] Number of cells to create on the vertical (number of rooms vertically) 
 * @param {int} [options.roomWidth] Room min and max width - normally set auto-magically via the constructor.
 * @param {int} [options.roomHeight] Room min and max height - normally set auto-magically via the constructor. 
 */
ROT.Map.Rogue = function(width, height, options) {
	ROT.Map.call(this, width, height);
	
	this._options = {
		cellWidth: 3,  // NOTE to self, these could probably work the same as the roomWidth/room Height values
		cellHeight: 3  //     ie. as an array with min-max values for each direction....
	}
	
	for (var p in options) { this._options[p] = options[p]; }
	
	/*
	Set the room sizes according to the over-all width of the map, 
	and the cell sizes. 
	*/
	
	if (!this._options.hasOwnProperty("roomWidth")) {
		this._options["roomWidth"] = this._calculateRoomSize(width, this._options["cellWidth"]);
	}
	if (!this._options.hasOwnProperty["roomHeight"]) {
		this._options["roomHeight"] = this._calculateRoomSize(height, this._options["cellHeight"]);
	}
	
}

ROT.Map.Rogue.extend(ROT.Map); 

/**
 * @see ROT.Map#create
 */
ROT.Map.Rogue.prototype.create = function(callback) {
	this.map = this._fillMap(1);
	this.rooms = [];
	this.connectedCells = [];
	
	this._initRooms();
	this._connectRooms();
	this._connectUnconnectedRooms();
	this._createRandomRoomConnections();
	this._createRooms();
	this._createCorridors();
	
	if (callback) {
		for (var i = 0; i < this._width; i++) {
			for (var j = 0; j < this._height; j++) {
				callback(i, j, this.map[i][j]);   
			}
		}
	}
	
	return this;
}

ROT.Map.Rogue.prototype._getRandomInt = function(min, max) {
	return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min;
}

ROT.Map.Rogue.prototype._calculateRoomSize = function(size, cell) {
	var max = Math.floor((size/cell) * 0.8);
	var min = Math.floor((size/cell) * 0.25);
	if (min < 2) min = 2;
	if (max < 2) max = 2;
	return [min, max];
}

ROT.Map.Rogue.prototype._initRooms = function () { 
	// create rooms array. This is the "grid" list from the algo.  
	for (var i = 0; i < this._options.cellWidth; i++) {  
		this.rooms.push([]);
		for(var j = 0; j < this._options.cellHeight; j++) {
			this.rooms[i].push({"x":0, "y":0, "width":0, "height":0, "connections":[], "cellx":i, "celly":j});
		}
	}
}

ROT.Map.Rogue.prototype._connectRooms = function() {
	//pick random starting grid
	var cgx = this._getRandomInt(0, this._options.cellWidth-1);
	var cgy = this._getRandomInt(0, this._options.cellHeight-1);
	
	var idx;
	var ncgx;
	var ncgy;
	
	var found = false;
	var room;
	var otherRoom;
	
	// find  unconnected neighbour cells
	do {
	
		//var dirToCheck = [0,1,2,3,4,5,6,7];
		var dirToCheck = [0,2,4,6];
		dirToCheck = dirToCheck.randomize();
		
		do {
			found = false;
			idx = dirToCheck.pop();
			
			
			ncgx = cgx + ROT.DIRS[8][idx][0];
			ncgy = cgy + ROT.DIRS[8][idx][1];
			
			if(ncgx < 0 || ncgx >= this._options.cellWidth) continue;
			if(ncgy < 0 || ncgy >= this._options.cellHeight) continue;
			
			room = this.rooms[cgx][cgy];
			
			if(room["connections"].length > 0)
			{
				// as long as this room doesn't already coonect to me, we are ok with it. 
				if(room["connections"][0][0] == ncgx &&
				room["connections"][0][1] == ncgy)
				{
					break;
				}
			}
			
			otherRoom = this.rooms[ncgx][ncgy];
			
			if (otherRoom["connections"].length == 0) { 
				otherRoom["connections"].push([cgx,cgy]);
				
				this.connectedCells.push([ncgx, ncgy]);
				cgx = ncgx;
				cgy = ncgy;
				found = true;
			}
					
		} while (dirToCheck.length > 0 && found == false)
		
	} while (dirToCheck.length > 0)

}

ROT.Map.Rogue.prototype._connectUnconnectedRooms = function() {
	//While there are unconnected rooms, try to connect them to a random connected neighbor 
	//(if a room has no connected neighbors yet, just keep cycling, you'll fill out to it eventually).
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	
	var randomConnectedCell;
	this.connectedCells = this.connectedCells.randomize();
	var room;
	var otherRoom;
	var validRoom;
	
	for (var i = 0; i < this._options.cellWidth; i++) {
		for (var j = 0; j < this._options.cellHeight; j++)  {
				
			room = this.rooms[i][j];
			
			if (room["connections"].length == 0) {
				var directions = [0,2,4,6];
				directions = directions.randomize();
				
				var validRoom = false;
				
				do {
					
					var dirIdx = directions.pop();
					var newI = i + ROT.DIRS[8][dirIdx][0];
					var newJ = j + ROT.DIRS[8][dirIdx][1];
					
					if (newI < 0 || newI >= cw || 
					newJ < 0 || newJ >= ch) {
						continue;
					}
					
					otherRoom = this.rooms[newI][newJ];
					
					validRoom = true;
					
					if (otherRoom["connections"].length == 0) {
						break;
					}
					
					for (var k = 0; k < otherRoom["connections"].length; k++) {
						if(otherRoom["connections"][k][0] == i && 
						otherRoom["connections"][k][1] == j) {
							validRoom = false;
							break;
						}
					}
					
					if (validRoom) break;
					
				} while (directions.length)
				
				if(validRoom) { 
					room["connections"].push( [otherRoom["cellx"], otherRoom["celly"]] );  
				} else {
					console.log("-- Unable to connect room.");
				}
			}
		}
	}
}

ROT.Map.Rogue.prototype._createRandomRoomConnections = function(connections) {
	// Empty for now. 
}


ROT.Map.Rogue.prototype._createRooms = function() {
	// Create Rooms 
	
	var w = this._width;
	var h = this._height;
	
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	
	var cwp = Math.floor(this._width / cw);
	var chp = Math.floor(this._height / ch);
	
	var roomw;
	var roomh;
	var roomWidth = this._options["roomWidth"];
	var roomHeight = this._options["roomHeight"];
	var sx;
	var sy;
	var tx;
	var ty;
	var otherRoom;
	
	for (var i = 0; i < cw; i++) {
		for (var j = 0; j < ch; j++) {
			sx = cwp * i;
			sy = chp * j;
			
			if (sx == 0) sx = 1;
			if (sy == 0) sy = 1;
			
			roomw = this._getRandomInt(roomWidth[0], roomWidth[1]);
			roomh = this._getRandomInt(roomHeight[0], roomHeight[1]);
			
			if (j > 0) {
				otherRoom = this.rooms[i][j-1];
				while (sy - (otherRoom["y"] + otherRoom["height"] ) < 3) {
					sy++;
				}
			}
			
			if (i > 0) {
				otherRoom = this.rooms[i-1][j];
				while(sx - (otherRoom["x"] + otherRoom["width"]) < 3) {
					sx++;
				}
			}
						
			var sxOffset = Math.round(this._getRandomInt(0, cwp-roomw)/2);
			var syOffset = Math.round(this._getRandomInt(0, chp-roomh)/2);
			
			while (sx + sxOffset + roomw >= w) {
				if(sxOffset) {
					sxOffset--;
				} else {
					roomw--; 
				}
			}
			
			while (sy + syOffset + roomh >= h) { 
				if(syOffset) {
					syOffset--;
				} else {
					roomh--; 
				}
			}
			
			sx = sx + sxOffset;
			sy = sy + syOffset;
			
			this.rooms[i][j]["x"] = sx;
			this.rooms[i][j]["y"] = sy;
			this.rooms[i][j]["width"] = roomw;
			this.rooms[i][j]["height"] = roomh;  
			
			for (var ii = sx; ii < sx + roomw; ii++) {
				for (var jj = sy; jj < sy + roomh; jj++) {
					this.map[ii][jj] = 0;
				}
			}  
		}
	}
}

ROT.Map.Rogue.prototype._getWallPosition = function(aRoom, aDirection) {
	var rx;
	var ry;
	var door;
	
	if (aDirection == 1 || aDirection == 3) {
		rx = this._getRandomInt(aRoom["x"] + 1, aRoom["x"] + aRoom["width"] - 2);
		if (aDirection == 1) {
			ry = aRoom["y"] - 2;
			door = ry + 1;
		} else {
			ry = aRoom["y"] + aRoom["height"] + 1;
			door = ry -1;
		}
		
		this.map[rx][door] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
		
	} else if (aDirection == 2 || aDirection == 4) {
		ry = this._getRandomInt(aRoom["y"] + 1, aRoom["y"] + aRoom["height"] - 2);
		if(aDirection == 2) {
			rx = aRoom["x"] + aRoom["width"] + 1;
			door = rx - 1;
		} else {
			rx = aRoom["x"] - 2;
			door = rx + 1;
		}
		
		this.map[door][ry] = 0; // i'm not setting a specific 'door' tile value right now, just empty space. 
		
	}
	return [rx, ry];
}

/***
* @param startPosition a 2 element array
* @param endPosition a 2 element array
*/
ROT.Map.Rogue.prototype._drawCorridore = function (startPosition, endPosition) {
	var xOffset = endPosition[0] - startPosition[0];
	var yOffset = endPosition[1] - startPosition[1];
	
	var xpos = startPosition[0];
	var ypos = startPosition[1];
	
	var tempDist;
	var xDir;
	var yDir;
	
	var move; // 2 element array, element 0 is the direction, element 1 is the total value to move. 
	var moves = []; // a list of 2 element arrays
	
	var xAbs = Math.abs(xOffset);
	var yAbs = Math.abs(yOffset);
	
	var percent = ROT.RNG.getUniform(); // used to split the move at different places along the long axis
	var firstHalf = percent;
	var secondHalf = 1 - percent;
	
	xDir = xOffset > 0 ? 2 : 6;
	yDir = yOffset > 0 ? 4 : 0;
	
	if (xAbs < yAbs) {
		// move firstHalf of the y offset
		tempDist = Math.ceil(yAbs * firstHalf);
		moves.push([yDir, tempDist]);
		// move all the x offset
		moves.push([xDir, xAbs]);
		// move sendHalf of the  y offset
		tempDist = Math.floor(yAbs * secondHalf);
		moves.push([yDir, tempDist]);
	} else {
		//  move firstHalf of the x offset
		tempDist = Math.ceil(xAbs * firstHalf);
		moves.push([xDir, tempDist]);
		// move all the y offset
		moves.push([yDir, yAbs]);
		// move secondHalf of the x offset.
		tempDist = Math.floor(xAbs * secondHalf);
		moves.push([xDir, tempDist]);  
	}
	
	this.map[xpos][ypos] = 0;
	
	while (moves.length > 0) {
		move = moves.pop();
		while (move[1] > 0) {
			xpos += ROT.DIRS[8][move[0]][0];
			ypos += ROT.DIRS[8][move[0]][1];
			this.map[xpos][ypos] = 0;
			move[1] = move[1] - 1;
		}
	}
}

ROT.Map.Rogue.prototype._createCorridors = function () {
	// Draw Corridors between connected rooms
	
	var cw = this._options.cellWidth;
	var ch = this._options.cellHeight;
	var room;
	var connection;
	var otherRoom;
	var wall;
	var otherWall;
	
	for (var i = 0; i < cw; i++) {
		for (var j = 0; j < ch; j++) {
			room = this.rooms[i][j];
			
			for (var k = 0; k < room["connections"].length; k++) {
					
				connection = room["connections"][k]; 
				
				otherRoom = this.rooms[connection[0]][connection[1]];
				
				// figure out what wall our corridor will start one.
				// figure out what wall our corridor will end on. 
				if (otherRoom["cellx"] > room["cellx"] ) {
					wall = 2;
					otherWall = 4;
				} else if (otherRoom["cellx"] < room["cellx"] ) {
					wall = 4;
					otherWall = 2;
				} else if(otherRoom["celly"] > room["celly"]) {
					wall = 3;
					otherWall = 1;
				} else if(otherRoom["celly"] < room["celly"]) {
					wall = 1;
					otherWall = 3;
				}
				
				this._drawCorridore(this._getWallPosition(room, wall), this._getWallPosition(otherRoom, otherWall));
			}
		}
	}
}
/**
 * @class Dungeon feature; has own .create() method
 */
ROT.Map.Feature = function() {}
ROT.Map.Feature.prototype.isValid = function(canBeDugCallback) {}
ROT.Map.Feature.prototype.create = function(digCallback) {}
ROT.Map.Feature.prototype.debug = function() {}
ROT.Map.Feature.createRandomAt = function(x, y, dx, dy, options) {}

/**
 * @class Room
 * @augments ROT.Map.Feature
 * @param {int} x1
 * @param {int} y1
 * @param {int} x2
 * @param {int} y2
 * @param {int} [doorX]
 * @param {int} [doorY]
 */
ROT.Map.Feature.Room = function(x1, y1, x2, y2, doorX, doorY) {
	this._x1 = x1;
	this._y1 = y1;
	this._x2 = x2;
	this._y2 = y2;
	this._doors = {};
	if (arguments.length > 4) { this.addDoor(doorX, doorY); }
}
ROT.Map.Feature.Room.extend(ROT.Map.Feature);

/**
 * Room of random size, with a given doors and direction
 */
ROT.Map.Feature.Room.createRandomAt = function(x, y, dx, dy, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	if (dx == 1) { /* to the right */
		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
		return new this(x+1, y2, x+width, y2+height-1, x, y);
	}
	
	if (dx == -1) { /* to the left */
		var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
		return new this(x-width, y2, x-1, y2+height-1, x, y);
	}

	if (dy == 1) { /* to the bottom */
		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
		return new this(x2, y+1, x2+width-1, y+height, x, y);
	}

	if (dy == -1) { /* to the top */
		var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
		return new this(x2, y-height, x2+width-1, y-1, x, y);
	}
}

/**
 * Room of random size, positioned around center coords
 */
ROT.Map.Feature.Room.createRandomCenter = function(cx, cy, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

	var x1 = cx - Math.floor(ROT.RNG.getUniform()*width);
	var y1 = cy - Math.floor(ROT.RNG.getUniform()*height);
	var x2 = x1 + width - 1;
	var y2 = y1 + height - 1;

	return new this(x1, y1, x2, y2);
}

/**
 * Room of random size within a given dimensions
 */
ROT.Map.Feature.Room.createRandom = function(availWidth, availHeight, options) {
	var min = options.roomWidth[0];
	var max = options.roomWidth[1];
	var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var min = options.roomHeight[0];
	var max = options.roomHeight[1];
	var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	var left = availWidth - width - 1;
	var top = availHeight - height - 1;

	var x1 = 1 + Math.floor(ROT.RNG.getUniform()*left);
	var y1 = 1 + Math.floor(ROT.RNG.getUniform()*top);
	var x2 = x1 + width - 1;
	var y2 = y1 + height - 1;

	return new this(x1, y1, x2, y2);
}

ROT.Map.Feature.Room.prototype.addDoor = function(x, y) {
	this._doors[x+","+y] = 1;
	return this;
}

/**
 * @param {function}
 */
ROT.Map.Feature.Room.prototype.getDoors = function(callback) {
	for (var key in this._doors) {
		var parts = key.split(",");
		callback(parseInt(parts[0]), parseInt(parts[1]));
	}
	return this;
}

ROT.Map.Feature.Room.prototype.clearDoors = function() {
	this._doors = {};
	return this;
}

ROT.Map.Feature.Room.prototype.addDoors = function(isWallCallback) {
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;

	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x != left && x != right && y != top && y != bottom) { continue; }
			if (isWallCallback(x, y)) { continue; }

			this.addDoor(x, y);
		}
	}

	return this;
}

ROT.Map.Feature.Room.prototype.debug = function() {
	console.log("room", this._x1, this._y1, this._x2, this._y2);
}

ROT.Map.Feature.Room.prototype.isValid = function(isWallCallback, canBeDugCallback) { 
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;
	
	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x == left || x == right || y == top || y == bottom) {
				if (!isWallCallback(x, y)) { return false; }
			} else {
				if (!canBeDugCallback(x, y)) { return false; }
			}
		}
	}

	return true;
}

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
 */
ROT.Map.Feature.Room.prototype.create = function(digCallback) { 
	var left = this._x1-1;
	var right = this._x2+1;
	var top = this._y1-1;
	var bottom = this._y2+1;
	
	var value = 0;
	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if (x+","+y in this._doors) {
				value = 2;
			} else if (x == left || x == right || y == top || y == bottom) {
				value = 1;
			} else {
				value = 0;
			}
			digCallback(x, y, value);
		}
	}
}

ROT.Map.Feature.Room.prototype.getCenter = function() {
	return [Math.round((this._x1 + this._x2)/2), Math.round((this._y1 + this._y2)/2)];
}

ROT.Map.Feature.Room.prototype.getLeft = function() {
	return this._x1;
}

ROT.Map.Feature.Room.prototype.getRight = function() {
	return this._x2;
}

ROT.Map.Feature.Room.prototype.getTop = function() {
	return this._y1;
}

ROT.Map.Feature.Room.prototype.getBottom = function() {
	return this._y2;
}

/**
 * @class Corridor
 * @augments ROT.Map.Feature
 * @param {int} startX
 * @param {int} startY
 * @param {int} endX
 * @param {int} endY
 */
ROT.Map.Feature.Corridor = function(startX, startY, endX, endY) {
	this._startX = startX;
	this._startY = startY;
	this._endX = endX; 
	this._endY = endY;
	this._endsWithAWall = true;
}
ROT.Map.Feature.Corridor.extend(ROT.Map.Feature);

ROT.Map.Feature.Corridor.createRandomAt = function(x, y, dx, dy, options) {
	var min = options.corridorLength[0];
	var max = options.corridorLength[1];
	var length = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));
	
	return new this(x, y, x + dx*length, y + dy*length);
}

ROT.Map.Feature.Corridor.prototype.debug = function() {
	console.log("corridor", this._startX, this._startY, this._endX, this._endY);
}

ROT.Map.Feature.Corridor.prototype.isValid = function(isWallCallback, canBeDugCallback){ 
	var sx = this._startX;
	var sy = this._startY;
	var dx = this._endX-sx;
	var dy = this._endY-sy;
	var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
	
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;
	
	var ok = true;
	for (var i=0; i<length; i++) {
		var x = sx + i*dx;
		var y = sy + i*dy;

		if (!canBeDugCallback(     x,      y)) { ok = false; }
		if (!isWallCallback  (x + nx, y + ny)) { ok = false; }
		if (!isWallCallback  (x - nx, y - ny)) { ok = false; }
		
		if (!ok) {
			length = i;
			this._endX = x-dx;
			this._endY = y-dy;
			break;
		}
	}
	
	/**
	 * If the length degenerated, this corridor might be invalid
	 */
	 
	/* not supported */
	if (length == 0) { return false; } 
	
	 /* length 1 allowed only if the next space is empty */
	if (length == 1 && isWallCallback(this._endX + dx, this._endY + dy)) { return false; }
	
	/**
	 * We do not want the corridor to crash into a corner of a room;
	 * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
	 * 
	 * Situation:
	 * #######1
	 * .......?
	 * #######2
	 * 
	 * The corridor was dug from left to right.
	 * 1, 2 - problematic corners, ? = N+1th cell (not dug)
	 */
	var firstCornerBad = !isWallCallback(this._endX + dx + nx, this._endY + dy + ny);
	var secondCornerBad = !isWallCallback(this._endX + dx - nx, this._endY + dy - ny);
	this._endsWithAWall = isWallCallback(this._endX + dx, this._endY + dy);
	if ((firstCornerBad || secondCornerBad) && this._endsWithAWall) { return false; }

	return true;
}

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
 */
ROT.Map.Feature.Corridor.prototype.create = function(digCallback) { 
	var sx = this._startX;
	var sy = this._startY;
	var dx = this._endX-sx;
	var dy = this._endY-sy;
	var length = 1+Math.max(Math.abs(dx), Math.abs(dy));
	
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;
	
	for (var i=0; i<length; i++) {
		var x = sx + i*dx;
		var y = sy + i*dy;
		digCallback(x, y, 0);
	}
	
	return true;
}

ROT.Map.Feature.Corridor.prototype.createPriorityWalls = function(priorityWallCallback) {
	if (!this._endsWithAWall) { return; }

	var sx = this._startX;
	var sy = this._startY;

	var dx = this._endX-sx;
	var dy = this._endY-sy;
	if (dx) { dx = dx/Math.abs(dx); }
	if (dy) { dy = dy/Math.abs(dy); }
	var nx = dy;
	var ny = -dx;

	priorityWallCallback(this._endX + dx, this._endY + dy);
	priorityWallCallback(this._endX + nx, this._endY + ny);
	priorityWallCallback(this._endX - nx, this._endY - ny);
}/**
 * @class Base noise generator
 */
ROT.Noise = function() {
};

ROT.Noise.prototype.get = function(x, y) {}
/**
 * A simple 2d implementation of simplex noise by Ondrej Zara
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 */

/**
 * @class 2D simplex noise generator
 * @param {int} [gradients=256] Random gradients
 */
ROT.Noise.Simplex = function(gradients) {
	ROT.Noise.call(this);

	this._F2 = 0.5 * (Math.sqrt(3) - 1);
    this._G2 = (3 - Math.sqrt(3)) / 6;

	this._gradients = [
		[ 0, -1],
		[ 1, -1],
		[ 1,  0],
		[ 1,  1],
		[ 0,  1],
		[-1,  1],
		[-1,  0],
		[-1, -1]
	];

	var permutations = [];
	var count = gradients || 256;
	for (var i=0;i<count;i++) { permutations.push(i); }
	permutations = permutations.randomize();

	this._perms = [];
	this._indexes = [];

	for (var i=0;i<2*count;i++) {
		this._perms.push(permutations[i % count]);
		this._indexes.push(this._perms[i] % this._gradients.length);
	}

};
ROT.Noise.Simplex.extend(ROT.Noise);

ROT.Noise.Simplex.prototype.get = function(xin, yin) {
	var perms = this._perms;
	var indexes = this._indexes;
	var count = perms.length/2;
	var G2 = this._G2;

	var n0 =0, n1 = 0, n2 = 0, gi; // Noise contributions from the three corners

	// Skew the input space to determine which simplex cell we're in
	var s = (xin + yin) * this._F2; // Hairy factor for 2D
	var i = Math.floor(xin + s);
	var j = Math.floor(yin + s);
	var t = (i + j) * G2;
	var X0 = i - t; // Unskew the cell origin back to (x,y) space
	var Y0 = j - t;
	var x0 = xin - X0; // The x,y distances from the cell origin
	var y0 = yin - Y0;

	// For the 2D case, the simplex shape is an equilateral triangle.
	// Determine which simplex we are in.
	var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	if (x0 > y0) {
		i1 = 1;
		j1 = 0;
	} else { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
		i1 = 0;
		j1 = 1;
	} // upper triangle, YX order: (0,0)->(0,1)->(1,1)

	// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	// c = (3-sqrt(3))/6
	var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	var y1 = y0 - j1 + G2;
	var x2 = x0 - 1 + 2*G2; // Offsets for last corner in (x,y) unskewed coords
	var y2 = y0 - 1 + 2*G2;

	// Work out the hashed gradient indices of the three simplex corners
	var ii = i.mod(count);
	var jj = j.mod(count);

	// Calculate the contribution from the three corners
	var t0 = 0.5 - x0*x0 - y0*y0;
	if (t0 >= 0) {
		t0 *= t0;
		gi = indexes[ii+perms[jj]];
		var grad = this._gradients[gi];
		n0 = t0 * t0 * (grad[0] * x0 + grad[1] * y0);
	}
	
	var t1 = 0.5 - x1*x1 - y1*y1;
	if (t1 >= 0) {
		t1 *= t1;
		gi = indexes[ii+i1+perms[jj+j1]];
		var grad = this._gradients[gi];
		n1 = t1 * t1 * (grad[0] * x1 + grad[1] * y1);
	}
	
	var t2 = 0.5 - x2*x2 - y2*y2;
	if (t2 >= 0) {
		t2 *= t2;
		gi = indexes[ii+1+perms[jj+1]];
		var grad = this._gradients[gi];
		n2 = t2 * t2 * (grad[0] * x2 + grad[1] * y2);
	}

	// Add contributions from each corner to get the final noise value.
	// The result is scaled to return values in the interval [-1,1].
	return 70 * (n0 + n1 + n2);
}
/**
 * @class Abstract FOV algorithm
 * @param {function} lightPassesCallback Does the light pass through x,y?
 * @param {object} [options]
 * @param {int} [options.topology=8] 4/6/8
 */
ROT.FOV = function(lightPassesCallback, options) {
	this._lightPasses = lightPassesCallback;
	this._options = {
		topology: 8
	}
	for (var p in options) { this._options[p] = options[p]; }
};

/**
 * Compute visibility for a 360-degree circle
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.prototype.compute = function(x, y, R, callback) {}

/**
 * Return all neighbors in a concentric ring
 * @param {int} cx center-x
 * @param {int} cy center-y
 * @param {int} r range
 */
ROT.FOV.prototype._getCircle = function(cx, cy, r) {
	var result = [];
	var dirs, countFactor, startOffset;

	switch (this._options.topology) {
		case 4:
			countFactor = 1;
			startOffset = [0, 1];
			dirs = [
				ROT.DIRS[8][7],
				ROT.DIRS[8][1],
				ROT.DIRS[8][3],
				ROT.DIRS[8][5]
			]
		break;

		case 6:
			dirs = ROT.DIRS[6];
			countFactor = 1;
			startOffset = [-1, 1];
		break;

		case 8:
			dirs = ROT.DIRS[4];
			countFactor = 2;
			startOffset = [-1, 1];
		break;
	}

	/* starting neighbor */
	var x = cx + startOffset[0]*r;
	var y = cy + startOffset[1]*r;

	/* circle */
	for (var i=0;i<dirs.length;i++) {
		for (var j=0;j<r*countFactor;j++) {
			result.push([x, y]);
			x += dirs[i][0];
			y += dirs[i][1];

		}
	}

	return result;
}
/**
 * @class Discrete shadowcasting algorithm. Obsoleted by Precise shadowcasting.
 * @augments ROT.FOV
 */
ROT.FOV.DiscreteShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.DiscreteShadowcasting.extend(ROT.FOV);

/**
 * @see ROT.FOV#compute
 */
ROT.FOV.DiscreteShadowcasting.prototype.compute = function(x, y, R, callback) {
	var center = this._coords;
	var map = this._map;

	/* this place is always visible */
	callback(x, y, 0);

	/* standing in a dark place. FIXME is this a good idea?  */
	if (!this._lightPasses(x, y)) { return; }
	
	/* start and end angles */
	var DATA = [];
	
	var A, B, cx, cy, blocks;

	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		var neighbors = this._getCircle(x, y, r);
		var angle = 360 / neighbors.length;

		for (var i=0;i<neighbors.length;i++) {
			cx = neighbors[i][0];
			cy = neighbors[i][1];
			A = angle * (i - 0.5);
			B = A + angle;
			
			blocks = !this._lightPasses(cx, cy);
			if (this._visibleCoords(Math.floor(A), Math.ceil(B), blocks, DATA)) { callback(cx, cy, r, 1); }
			
			if (DATA.length == 2 && DATA[0] == 0 && DATA[1] == 360) { return; } /* cutoff? */

		} /* for all cells in this ring */
	} /* for all rings */
}

/**
 * @param {int} A start angle
 * @param {int} B end angle
 * @param {bool} blocks Does current cell block visibility?
 * @param {int[][]} DATA shadowed angle pairs
 */
ROT.FOV.DiscreteShadowcasting.prototype._visibleCoords = function(A, B, blocks, DATA) {
	if (A < 0) { 
		var v1 = arguments.callee(0, B, blocks, DATA);
		var v2 = arguments.callee(360+A, 360, blocks, DATA);
		return v1 || v2;
	}
	
	var index = 0;
	while (index < DATA.length && DATA[index] < A) { index++; }
	
	if (index == DATA.length) { /* completely new shadow */
		if (blocks) { DATA.push(A, B); } 
		return true;
	}
	
	var count = 0;
	
	if (index % 2) { /* this shadow starts in an existing shadow, or within its ending boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		if (count == 0) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, B);
			} else {
				DATA.splice(index-count, count);
			}
		}
		
		return true;

	} else { /* this shadow starts outside an existing shadow, or within a starting boundary */
		while (index < DATA.length && DATA[index] < B) {
			index++;
			count++;
		}
		
		/* visible when outside an existing shadow, or when overlapping */
		if (A == DATA[index-count] && count == 1) { return false; }
		
		if (blocks) { 
			if (count % 2) {
				DATA.splice(index-count, count, A);
			} else {
				DATA.splice(index-count, count, A, B);
			}
		}
			
		return true;
	}
}
/**
 * @class Precise shadowcasting algorithm
 * @augments ROT.FOV
 */
ROT.FOV.PreciseShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.PreciseShadowcasting.extend(ROT.FOV);

/**
 * @see ROT.FOV#compute
 */
ROT.FOV.PreciseShadowcasting.prototype.compute = function(x, y, R, callback) {
	/* this place is always visible */
	callback(x, y, 0, 1);

	/* standing in a dark place. FIXME is this a good idea?  */
	if (!this._lightPasses(x, y)) { return; }
	
	/* list of all shadows */
	var SHADOWS = [];
	
	var cx, cy, blocks, A1, A2, visibility;

	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		var neighbors = this._getCircle(x, y, r);
		var neighborCount = neighbors.length;

		for (var i=0;i<neighborCount;i++) {
			cx = neighbors[i][0];
			cy = neighbors[i][1];
			/* shift half-an-angle backwards to maintain consistency of 0-th cells */
			A1 = [i ? 2*i-1 : 2*neighborCount-1, 2*neighborCount];
			A2 = [2*i+1, 2*neighborCount]; 
			
			blocks = !this._lightPasses(cx, cy);
			visibility = this._checkVisibility(A1, A2, blocks, SHADOWS);
			if (visibility) { callback(cx, cy, r, visibility); }

			if (SHADOWS.length == 2 && SHADOWS[0][0] == 0 && SHADOWS[1][0] == SHADOWS[1][1]) { return; } /* cutoff? */

		} /* for all cells in this ring */
	} /* for all rings */
}

/**
 * @param {int[2]} A1 arc start
 * @param {int[2]} A2 arc end
 * @param {bool} blocks Does current arc block visibility?
 * @param {int[][]} SHADOWS list of active shadows
 */
ROT.FOV.PreciseShadowcasting.prototype._checkVisibility = function(A1, A2, blocks, SHADOWS) {
	if (A1[0] > A2[0]) { /* split into two sub-arcs */
		var v1 = this._checkVisibility(A1, [A1[1], A1[1]], blocks, SHADOWS);
		var v2 = this._checkVisibility([0, 1], A2, blocks, SHADOWS);
		return (v1+v2)/2;
	}

	/* index1: first shadow >= A1 */
	var index1 = 0, edge1 = false;
	while (index1 < SHADOWS.length) {
		var old = SHADOWS[index1];
		var diff = old[0]*A1[1] - A1[0]*old[1];
		if (diff >= 0) { /* old >= A1 */
			if (diff == 0 && !(index1 % 2)) { edge1 = true; }
			break;
		}
		index1++;
	}

	/* index2: last shadow <= A2 */
	var index2 = SHADOWS.length, edge2 = false;
	while (index2--) {
		var old = SHADOWS[index2];
		var diff = A2[0]*old[1] - old[0]*A2[1];
		if (diff >= 0) { /* old <= A2 */
			if (diff == 0 && (index2 % 2)) { edge2 = true; }
			break;
		}
	}

	var visible = true;
	if (index1 == index2 && (edge1 || edge2)) {  /* subset of existing shadow, one of the edges match */
		visible = false; 
	} else if (edge1 && edge2 && index1+1==index2 && (index2 % 2)) { /* completely equivalent with existing shadow */
		visible = false;
	} else if (index1 > index2 && (index1 % 2)) { /* subset of existing shadow, not touching */
		visible = false;
	}
	
	if (!visible) { return 0; } /* fast case: not visible */
	
	var visibleLength, P;

	/* compute the length of visible arc, adjust list of shadows (if blocking) */
	var remove = index2-index1+1;
	if (remove % 2) {
		if (index1 % 2) { /* first edge within existing shadow, second outside */
			var P = SHADOWS[index1];
			visibleLength = (A2[0]*P[1] - P[0]*A2[1]) / (P[1] * A2[1]);
			if (blocks) { SHADOWS.splice(index1, remove, A2); }
		} else { /* second edge within existing shadow, first outside */
			var P = SHADOWS[index2];
			visibleLength = (P[0]*A1[1] - A1[0]*P[1]) / (A1[1] * P[1]);
			if (blocks) { SHADOWS.splice(index1, remove, A1); }
		}
	} else {
		if (index1 % 2) { /* both edges within existing shadows */
			var P1 = SHADOWS[index1];
			var P2 = SHADOWS[index2];
			visibleLength = (P2[0]*P1[1] - P1[0]*P2[1]) / (P1[1] * P2[1]);
			if (blocks) { SHADOWS.splice(index1, remove); }
		} else { /* both edges outside existing shadows */
			if (blocks) { SHADOWS.splice(index1, remove, A1, A2); }
			return 1; /* whole arc visible! */
		}
	}

	var arcLength = (A2[0]*A1[1] - A1[0]*A2[1]) / (A1[1] * A2[1]);

	return visibleLength/arcLength;
}
/**
 * @class Recursive shadowcasting algorithm
 * Currently only supports 4/8 topologies, not hexagonal.
 * Based on Peter Harkins' implementation of Björn Bergström's algorithm described here: http://www.roguebasin.com/index.php?title=FOV_using_recursive_shadowcasting
 * @augments ROT.FOV
 */
ROT.FOV.RecursiveShadowcasting = function(lightPassesCallback, options) {
	ROT.FOV.call(this, lightPassesCallback, options);
}
ROT.FOV.RecursiveShadowcasting.extend(ROT.FOV);

/** Octants used for translating recursive shadowcasting offsets */
ROT.FOV.RecursiveShadowcasting.OCTANTS = [
	[-1,  0,  0,  1],
	[ 0, -1,  1,  0],
	[ 0, -1, -1,  0],
	[-1,  0,  0, -1],
	[ 1,  0,  0, -1],
	[ 0,  1, -1,  0],
	[ 0,  1,  1,  0],
	[ 1,  0,  0,  1]
];

/**
 * Compute visibility for a 360-degree circle
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute = function(x, y, R, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	for(var i = 0; i < ROT.FOV.RecursiveShadowcasting.OCTANTS.length; i++) {
		this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[i], R, callback);
	}
}

/**
 * Compute visibility for a 180-degree arc
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {int} dir Direction to look in (expressed in a ROT.DIR value);
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute180 = function(x, y, R, dir, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 180 degrees
	var nextPreviousOctant = (dir - 2 + 8) % 8; //Need to retrieve the previous two octants to render a full 180 degrees
	var nextOctant = (dir+ 1 + 8) % 8; //Need to grab to next octant to render a full 180 degrees
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[nextPreviousOctant], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[previousOctant], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[dir], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[nextOctant], R, callback);
}

/**
 * Compute visibility for a 90-degree arc
 * @param {int} x
 * @param {int} y
 * @param {int} R Maximum visibility radius
 * @param {int} dir Direction to look in (expressed in a ROT.DIR value);
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype.compute90 = function(x, y, R, dir, callback) {
	//You can always see your own tile
	callback(x, y, 0, true);
	var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 90 degrees
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[dir], R, callback);
	this._renderOctant(x, y, ROT.FOV.RecursiveShadowcasting.OCTANTS[previousOctant], R, callback);
}

/**
 * Render one octant (45-degree arc) of the viewshed
 * @param {int} x
 * @param {int} y
 * @param {int} octant Octant to be rendered
 * @param {int} R Maximum visibility radius
 * @param {function} callback
 */
ROT.FOV.RecursiveShadowcasting.prototype._renderOctant = function(x, y, octant, R, callback) {
	//Radius incremented by 1 to provide same coverage area as other shadowcasting radiuses
	this._castVisibility(x, y, 1, 1.0, 0.0, R + 1, octant[0], octant[1], octant[2], octant[3], callback);
}

/**
 * Actually calculates the visibility
 * @param {int} startX The starting X coordinate
 * @param {int} startY The starting Y coordinate
 * @param {int} row The row to render
 * @param {float} visSlopeStart The slope to start at
 * @param {float} visSlopeEnd The slope to end at
 * @param {int} radius The radius to reach out to
 * @param {int} xx 
 * @param {int} xy 
 * @param {int} yx 
 * @param {int} yy 
 * @param {function} callback The callback to use when we hit a block that is visible
 */
ROT.FOV.RecursiveShadowcasting.prototype._castVisibility = function(startX, startY, row, visSlopeStart, visSlopeEnd, radius, xx, xy, yx, yy, callback) {
	if(visSlopeStart < visSlopeEnd) { return; }
	for(var i = row; i <= radius; i++) {
		var dx = -i - 1;
		var dy = -i;
		var blocked = false;
		var newStart = 0;

		//'Row' could be column, names here assume octant 0 and would be flipped for half the octants
		while(dx <= 0) {
			dx += 1;

			//Translate from relative coordinates to map coordinates
			var mapX = startX + dx * xx + dy * xy;
			var mapY = startY + dx * yx + dy * yy;

			//Range of the row
			var slopeStart = (dx - 0.5) / (dy + 0.5);
			var slopeEnd = (dx + 0.5) / (dy - 0.5);
		
			//Ignore if not yet at left edge of Octant
			if(slopeEnd > visSlopeStart) { continue; }
			
			//Done if past right edge
			if(slopeStart < visSlopeEnd) { break; }
				
			//If it's in range, it's visible
			if((dx * dx + dy * dy) < (radius * radius)) {
				callback(mapX, mapY, i, true);
			}
	
			if(!blocked) {
				//If tile is a blocking tile, cast around it
				if(!this._lightPasses(mapX, mapY) && i < radius) {
					blocked = true;
					this._castVisibility(startX, startY, i + 1, visSlopeStart, slopeStart, radius, xx, xy, yx, yy, callback);
					newStart = slopeEnd;
				}
			} else {
				//Keep narrowing if scanning across a block
				if(!this._lightPasses(mapX, mapY)) {
					newStart = slopeEnd;
					continue;
				}
			
				//Block has ended
				blocked = false;
				visSlopeStart = newStart;
			}
		}
		if(blocked) { break; }
	}
}
/**
 * @namespace Color operations
 */
ROT.Color = {
	fromString: function(str) {
		var cached, r;
		if (str in this._cache) {
			cached = this._cache[str];
		} else {
			if (str.charAt(0) == "#") { /* hex rgb */

				var values = str.match(/[0-9a-f]/gi).map(function(x) { return parseInt(x, 16); });
				if (values.length == 3) {
					cached = values.map(function(x) { return x*17; });
				} else {
					for (var i=0;i<3;i++) {
						values[i+1] += 16*values[i];
						values.splice(i, 1);
					}
					cached = values;
				}

			} else if (r = str.match(/rgb\(([0-9, ]+)\)/i)) { /* decimal rgb */
				cached = r[1].split(/\s*,\s*/).map(function(x) { return parseInt(x); });
			} else { /* html name */
				cached = [0, 0, 0];
			}

			this._cache[str] = cached;
		}

		return cached.slice();
	},

	/**
	 * Add two or more colors
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	add: function(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] += arguments[j][i];
			}
		}
		return result;
	},

	/**
	 * Add two or more colors, MODIFIES FIRST ARGUMENT
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	add_: function(color1, color2) {
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				color1[i] += arguments[j][i];
			}
		}
		return color1;
	},

	/**
	 * Multiply (mix) two or more colors
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	multiply: function(color1, color2) {
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				result[i] *= arguments[j][i] / 255;
			}
			result[i] = Math.round(result[i]);
		}
		return result;
	},

	/**
	 * Multiply (mix) two or more colors, MODIFIES FIRST ARGUMENT
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @returns {number[]}
	 */
	multiply_: function(color1, color2) {
		for (var i=0;i<3;i++) {
			for (var j=1;j<arguments.length;j++) {
				color1[i] *= arguments[j][i] / 255;
			}
			color1[i] = Math.round(color1[i]);
		}
		return color1;
	},

	/**
	 * Interpolate (blend) two colors with a given factor
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @param {float} [factor=0.5] 0..1
	 * @returns {number[]}
	 */
	interpolate: function(color1, color2, factor) {
		if (arguments.length < 3) { factor = 0.5; }
		var result = color1.slice();
		for (var i=0;i<3;i++) {
			result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
		}
		return result;
	},

	/**
	 * Interpolate (blend) two colors with a given factor in HSL mode
	 * @param {number[]} color1
	 * @param {number[]} color2
	 * @param {float} [factor=0.5] 0..1
	 * @returns {number[]}
	 */
	interpolateHSL: function(color1, color2, factor) {
		if (arguments.length < 3) { factor = 0.5; }
		var hsl1 = this.rgb2hsl(color1);
		var hsl2 = this.rgb2hsl(color2);
		for (var i=0;i<3;i++) {
			hsl1[i] += factor*(hsl2[i]-hsl1[i]);
		}
		return this.hsl2rgb(hsl1);
	},

	/**
	 * Create a new random color based on this one
	 * @param {number[]} color
	 * @param {number[]} diff Set of standard deviations
	 * @returns {number[]}
	 */
	randomize: function(color, diff) {
		if (!(diff instanceof Array)) { diff = ROT.RNG.getNormal(0, diff); }
		var result = color.slice();
		for (var i=0;i<3;i++) {
			result[i] += (diff instanceof Array ? Math.round(ROT.RNG.getNormal(0, diff[i])) : diff);
		}
		return result;
	},

	/**
	 * Converts an RGB color value to HSL. Expects 0..255 inputs, produces 0..1 outputs.
	 * @param {number[]} color
	 * @returns {number[]}
	 */
	rgb2hsl: function(color) {
		var r = color[0]/255;
		var g = color[1]/255;
		var b = color[2]/255;

		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
			switch(max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	},

	/**
	 * Converts an HSL color value to RGB. Expects 0..1 inputs, produces 0..255 outputs.
	 * @param {number[]} color
	 * @returns {number[]}
	 */
	hsl2rgb: function(color) {
		var l = color[2];

		if (color[1] == 0) {
			l = Math.round(l*255);
			return [l, l, l];
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var s = color[1];
			var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
			var p = 2 * l - q;
			var r = hue2rgb(p, q, color[0] + 1/3);
			var g = hue2rgb(p, q, color[0]);
			var b = hue2rgb(p, q, color[0] - 1/3);
			return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
		}
	},

	toRGB: function(color) {
		return "rgb(" + this._clamp(color[0]) + "," + this._clamp(color[1]) + "," + this._clamp(color[2]) + ")";
	},

	toHex: function(color) {
		var parts = [];
		for (var i=0;i<3;i++) {
			parts.push(this._clamp(color[i]).toString(16).lpad("0", 2));
		}
		return "#" + parts.join("");
	},

	_clamp: function(num) {
		if (num < 0) {
			return 0;
		} else if (num > 255) {
			return 255;
		} else {
			return num;
		}
	},

	_cache: {
		"black": [0,0,0],
		"navy": [0,0,128],
		"darkblue": [0,0,139],
		"mediumblue": [0,0,205],
		"blue": [0,0,255],
		"darkgreen": [0,100,0],
		"green": [0,128,0],
		"teal": [0,128,128],
		"darkcyan": [0,139,139],
		"deepskyblue": [0,191,255],
		"darkturquoise": [0,206,209],
		"mediumspringgreen": [0,250,154],
		"lime": [0,255,0],
		"springgreen": [0,255,127],
		"aqua": [0,255,255],
		"cyan": [0,255,255],
		"midnightblue": [25,25,112],
		"dodgerblue": [30,144,255],
		"forestgreen": [34,139,34],
		"seagreen": [46,139,87],
		"darkslategray": [47,79,79],
		"darkslategrey": [47,79,79],
		"limegreen": [50,205,50],
		"mediumseagreen": [60,179,113],
		"turquoise": [64,224,208],
		"royalblue": [65,105,225],
		"steelblue": [70,130,180],
		"darkslateblue": [72,61,139],
		"mediumturquoise": [72,209,204],
		"indigo": [75,0,130],
		"darkolivegreen": [85,107,47],
		"cadetblue": [95,158,160],
		"cornflowerblue": [100,149,237],
		"mediumaquamarine": [102,205,170],
		"dimgray": [105,105,105],
		"dimgrey": [105,105,105],
		"slateblue": [106,90,205],
		"olivedrab": [107,142,35],
		"slategray": [112,128,144],
		"slategrey": [112,128,144],
		"lightslategray": [119,136,153],
		"lightslategrey": [119,136,153],
		"mediumslateblue": [123,104,238],
		"lawngreen": [124,252,0],
		"chartreuse": [127,255,0],
		"aquamarine": [127,255,212],
		"maroon": [128,0,0],
		"purple": [128,0,128],
		"olive": [128,128,0],
		"gray": [128,128,128],
		"grey": [128,128,128],
		"skyblue": [135,206,235],
		"lightskyblue": [135,206,250],
		"blueviolet": [138,43,226],
		"darkred": [139,0,0],
		"darkmagenta": [139,0,139],
		"saddlebrown": [139,69,19],
		"darkseagreen": [143,188,143],
		"lightgreen": [144,238,144],
		"mediumpurple": [147,112,216],
		"darkviolet": [148,0,211],
		"palegreen": [152,251,152],
		"darkorchid": [153,50,204],
		"yellowgreen": [154,205,50],
		"sienna": [160,82,45],
		"brown": [165,42,42],
		"darkgray": [169,169,169],
		"darkgrey": [169,169,169],
		"lightblue": [173,216,230],
		"greenyellow": [173,255,47],
		"paleturquoise": [175,238,238],
		"lightsteelblue": [176,196,222],
		"powderblue": [176,224,230],
		"firebrick": [178,34,34],
		"darkgoldenrod": [184,134,11],
		"mediumorchid": [186,85,211],
		"rosybrown": [188,143,143],
		"darkkhaki": [189,183,107],
		"silver": [192,192,192],
		"mediumvioletred": [199,21,133],
		"indianred": [205,92,92],
		"peru": [205,133,63],
		"chocolate": [210,105,30],
		"tan": [210,180,140],
		"lightgray": [211,211,211],
		"lightgrey": [211,211,211],
		"palevioletred": [216,112,147],
		"thistle": [216,191,216],
		"orchid": [218,112,214],
		"goldenrod": [218,165,32],
		"crimson": [220,20,60],
		"gainsboro": [220,220,220],
		"plum": [221,160,221],
		"burlywood": [222,184,135],
		"lightcyan": [224,255,255],
		"lavender": [230,230,250],
		"darksalmon": [233,150,122],
		"violet": [238,130,238],
		"palegoldenrod": [238,232,170],
		"lightcoral": [240,128,128],
		"khaki": [240,230,140],
		"aliceblue": [240,248,255],
		"honeydew": [240,255,240],
		"azure": [240,255,255],
		"sandybrown": [244,164,96],
		"wheat": [245,222,179],
		"beige": [245,245,220],
		"whitesmoke": [245,245,245],
		"mintcream": [245,255,250],
		"ghostwhite": [248,248,255],
		"salmon": [250,128,114],
		"antiquewhite": [250,235,215],
		"linen": [250,240,230],
		"lightgoldenrodyellow": [250,250,210],
		"oldlace": [253,245,230],
		"red": [255,0,0],
		"fuchsia": [255,0,255],
		"magenta": [255,0,255],
		"deeppink": [255,20,147],
		"orangered": [255,69,0],
		"tomato": [255,99,71],
		"hotpink": [255,105,180],
		"coral": [255,127,80],
		"darkorange": [255,140,0],
		"lightsalmon": [255,160,122],
		"orange": [255,165,0],
		"lightpink": [255,182,193],
		"pink": [255,192,203],
		"gold": [255,215,0],
		"peachpuff": [255,218,185],
		"navajowhite": [255,222,173],
		"moccasin": [255,228,181],
		"bisque": [255,228,196],
		"mistyrose": [255,228,225],
		"blanchedalmond": [255,235,205],
		"papayawhip": [255,239,213],
		"lavenderblush": [255,240,245],
		"seashell": [255,245,238],
		"cornsilk": [255,248,220],
		"lemonchiffon": [255,250,205],
		"floralwhite": [255,250,240],
		"snow": [255,250,250],
		"yellow": [255,255,0],
		"lightyellow": [255,255,224],
		"ivory": [255,255,240],
		"white": [255,255,255]
	}
}
/**
 * @class Lighting computation, based on a traditional FOV for multiple light sources and multiple passes.
 * @param {function} reflectivityCallback Callback to retrieve cell reflectivity (0..1)
 * @param {object} [options]
 * @param {int} [options.passes=1] Number of passes. 1 equals to simple FOV of all light sources, >1 means a *highly simplified* radiosity-like algorithm.
 * @param {int} [options.emissionThreshold=100] Cells with emissivity > threshold will be treated as light source in the next pass.
 * @param {int} [options.range=10] Max light range
 */
ROT.Lighting = function(reflectivityCallback, options) {
	this._reflectivityCallback = reflectivityCallback;
	this._options = {
		passes: 1,
		emissionThreshold: 100,
		range: 10
	};
	this._fov = null;

	this._lights = {};
	this._reflectivityCache = {};
	this._fovCache = {};

	this.setOptions(options);
}

/**
 * Adjust options at runtime
 * @see ROT.Lighting
 * @param {object} [options]
 */
ROT.Lighting.prototype.setOptions = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
	if (options.range) { this.reset(); }
	return this;
}

/**
 * Set the used Field-Of-View algo
 * @param {ROT.FOV} fov
 */
ROT.Lighting.prototype.setFOV = function(fov) {
	this._fov = fov;
	this._fovCache = {};
	return this;
}

/**
 * Set (or remove) a light source
 * @param {int} x
 * @param {int} y
 * @param {null || string || number[3]} color
 */
ROT.Lighting.prototype.setLight = function(x, y, color) {
	var key = x+","+y;

	if (color) {
		this._lights[key] = (typeof(color) == "string" ? ROT.Color.fromString(color) : color);
	} else {
		delete this._lights[key];
	}
	return this;
}

/**
 * Reset the pre-computed topology values. Call whenever the underlying map changes its light-passability.
 */
ROT.Lighting.prototype.reset = function() {
	this._reflectivityCache = {};
	this._fovCache = {};

	return this;
}

/**
 * Compute the lighting
 * @param {function} lightingCallback Will be called with (x, y, color) for every lit cell
 */
ROT.Lighting.prototype.compute = function(lightingCallback) {
	var doneCells = {};
	var emittingCells = {};
	var litCells = {};

	for (var key in this._lights) { /* prepare emitters for first pass */
		var light = this._lights[key];
		if (!(key in emittingCells)) { emittingCells[key] = [0, 0, 0]; }

		ROT.Color.add_(emittingCells[key], light);
	}

	for (var i=0;i<this._options.passes;i++) { /* main loop */
		this._emitLight(emittingCells, litCells, doneCells);
		if (i+1 == this._options.passes) { continue; } /* not for the last pass */
		emittingCells = this._computeEmitters(litCells, doneCells);
	}

	for (var litKey in litCells) { /* let the user know what and how is lit */
		var parts = litKey.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		lightingCallback(x, y, litCells[litKey]);
	}

	return this;
}

/**
 * Compute one iteration from all emitting cells
 * @param {object} emittingCells These emit light
 * @param {object} litCells Add projected light to these
 * @param {object} doneCells These already emitted, forbid them from further calculations
 */
ROT.Lighting.prototype._emitLight = function(emittingCells, litCells, doneCells) {
	for (var key in emittingCells) {
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		this._emitLightFromCell(x, y, emittingCells[key], litCells);
		doneCells[key] = 1;
	}
	return this;
}

/**
 * Prepare a list of emitters for next pass
 * @param {object} litCells
 * @param {object} doneCells
 * @returns {object}
 */
ROT.Lighting.prototype._computeEmitters = function(litCells, doneCells) {
	var result = {};

	for (var key in litCells) {
		if (key in doneCells) { continue; } /* already emitted */

		var color = litCells[key];

		if (key in this._reflectivityCache) {
			var reflectivity = this._reflectivityCache[key];
		} else {
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			var reflectivity = this._reflectivityCallback(x, y);
			this._reflectivityCache[key] = reflectivity;
		}

		if (reflectivity == 0) { continue; } /* will not reflect at all */

		/* compute emission color */
		var emission = [];
		var intensity = 0;
		for (var i=0;i<3;i++) {
			var part = Math.round(color[i]*reflectivity);
			emission[i] = part;
			intensity += part;
		}
		if (intensity > this._options.emissionThreshold) { result[key] = emission; }
	}

	return result;
}

/**
 * Compute one iteration from one cell
 * @param {int} x
 * @param {int} y
 * @param {number[]} color
 * @param {object} litCells Cell data to by updated
 */
ROT.Lighting.prototype._emitLightFromCell = function(x, y, color, litCells) {
	var key = x+","+y;
	if (key in this._fovCache) {
		var fov = this._fovCache[key];
	} else {
		var fov = this._updateFOV(x, y);
	}

	for (var fovKey in fov) {
		var formFactor = fov[fovKey];

		if (fovKey in litCells) { /* already lit */
			var result = litCells[fovKey];
		} else { /* newly lit */
			var result = [0, 0, 0];
			litCells[fovKey] = result;
		}

		for (var i=0;i<3;i++) { result[i] += Math.round(color[i]*formFactor); } /* add light color */
	}

	return this;
}

/**
 * Compute FOV ("form factor") for a potential light source at [x,y]
 * @param {int} x
 * @param {int} y
 * @returns {object}
 */
ROT.Lighting.prototype._updateFOV = function(x, y) {
	var key1 = x+","+y;
	var cache = {};
	this._fovCache[key1] = cache;
	var range = this._options.range;
	var cb = function(x, y, r, vis) {
		var key2 = x+","+y;
		var formFactor = vis * (1-r/range);
		if (formFactor == 0) { return; }
		cache[key2] = formFactor;
	}
	this._fov.compute(x, y, range, cb.bind(this));

	return cache;
}
/**
 * @class Abstract pathfinder
 * @param {int} toX Target X coord
 * @param {int} toY Target Y coord
 * @param {function} passableCallback Callback to determine map passability
 * @param {object} [options]
 * @param {int} [options.topology=8]
 */
ROT.Path = function(toX, toY, passableCallback, options) {
	this._toX = toX;
	this._toY = toY;
	this._fromX = null;
	this._fromY = null;
	this._passableCallback = passableCallback;
	this._options = {
		topology: 8
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._dirs = ROT.DIRS[this._options.topology];
	if (this._options.topology == 8) { /* reorder dirs for more aesthetic result (vertical/horizontal first) */
		this._dirs = [
			this._dirs[0],
			this._dirs[2],
			this._dirs[4],
			this._dirs[6],
			this._dirs[1],
			this._dirs[3],
			this._dirs[5],
			this._dirs[7]
		]
	}
}

/**
 * Compute a path from a given point
 * @param {int} fromX
 * @param {int} fromY
 * @param {function} callback Will be called for every path item with arguments "x" and "y"
 */
ROT.Path.prototype.compute = function(fromX, fromY, callback) {
}

ROT.Path.prototype._getNeighbors = function(cx, cy) {
	var result = [];
	for (var i=0;i<this._dirs.length;i++) {
		var dir = this._dirs[i];
		var x = cx + dir[0];
		var y = cy + dir[1];
		
		if (!this._passableCallback(x, y)) { continue; }
		result.push([x, y]);
	}
	
	return result;
}
/**
 * @class Simplified Dijkstra's algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
ROT.Path.Dijkstra = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._computed = {};
	this._todo = [];
	this._add(toX, toY, null);
}
ROT.Path.Dijkstra.extend(ROT.Path);

/**
 * Compute a path from a given point
 * @see ROT.Path#compute
 */
ROT.Path.Dijkstra.prototype.compute = function(fromX, fromY, callback) {
	var key = fromX+","+fromY;
	if (!(key in this._computed)) { this._compute(fromX, fromY); }
	if (!(key in this._computed)) { return; }
	
	var item = this._computed[key];
	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

/**
 * Compute a non-cached value
 */
ROT.Path.Dijkstra.prototype._compute = function(fromX, fromY) {
	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { return; }
		
		var neighbors = this._getNeighbors(item.x, item.y);
		
		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._computed) { continue; } /* already done */	
			this._add(x, y, item); 
		}
	}
}

ROT.Path.Dijkstra.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev
	}
	this._computed[x+","+y] = obj;
	this._todo.push(obj);
}
/**
 * @class Simplified A* algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
ROT.Path.AStar = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._todo = [];
	this._done = {};
	this._fromX = null;
	this._fromY = null;
}
ROT.Path.AStar.extend(ROT.Path);

/**
 * Compute a path from a given point
 * @see ROT.Path#compute
 */
ROT.Path.AStar.prototype.compute = function(fromX, fromY, callback) {
	this._todo = [];
	this._done = {};
	this._fromX = fromX;
	this._fromY = fromY;
	this._add(this._toX, this._toY, null);

	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { break; }
		var neighbors = this._getNeighbors(item.x, item.y);

		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._done) { continue; }
			this._add(x, y, item); 
		}
	}
	
	var item = this._done[fromX+","+fromY];
	if (!item) { return; }
	
	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

ROT.Path.AStar.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev,
		g: (prev ? prev.g+1 : 0),
		h: this._distance(x, y)
	}
	this._done[x+","+y] = obj;
	
	/* insert into priority queue */
	
	var f = obj.g + obj.h;
	for (var i=0;i<this._todo.length;i++) {
		var item = this._todo[i];
		if (f < item.g + item.h) {
			this._todo.splice(i, 0, obj);
			return;
		}
	}
	
	this._todo.push(obj);
}

ROT.Path.AStar.prototype._distance = function(x, y) {
	switch (this._options.topology) {
		case 4:
			return (Math.abs(x-this._fromX) + Math.abs(y-this._fromY));
		break;

		case 6:
			var dx = Math.abs(x - this._fromX);
			var dy = Math.abs(y - this._fromY);
			return dy + Math.max(0, (dx-dy)/2);
		break;

		case 8: 
			return Math.max(Math.abs(x-this._fromX), Math.abs(y-this._fromY));
		break;
	}
}
/**
 * @namespace Export to Node.js module
 */
exports.ROT = ROT;

}).call(this,require("Wb8Gej"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"Wb8Gej":1}],6:[function(require,module,exports){
var FLOOR, Level, ROT, Tile, WALL, create2DArray, idCounter;

ROT = require('rot-js').ROT;

WALL = 1;

FLOOR = 0;

idCounter = 0;

Level = (function() {
  function Level(_arg) {
    this.width = _arg.width, this.height = _arg.height;
    this.id = idCounter++;
    this.freeTiles = [];
    this.tiles = create2DArray(this.width, this.height);
  }

  Level.prototype.generate = function() {
    var callback, tiles;
    tiles = create2DArray(this.width, this.height);
    callback = (function(_this) {
      return function(x, y, wall) {
        var _base;
        if ((_base = tiles[x])[y] == null) {
          _base[y] = [];
        }
        tiles[x][y] = wall;
        if (wall !== 1) {
          return _this.freeTiles.push([x, y]);
        }
      };
    })(this);
    this.map = new ROT.Map.Digger(this.width, this.height);
    this.map.create(callback);
    return this.processGeneratedMap(this.map, tiles);
  };

  Level.prototype.processGeneratedMap = function(map, rawTiles) {
    var x, y, _i, _ref, _results;
    _results = [];
    for (x = _i = 0, _ref = this.width; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (y = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          _results1.push(this.tiles[x][y] = this.createTile(rawTiles, x, y));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Level.prototype.createTile = function(rawTiles, x, y) {
    if (rawTiles[x][y] === 1) {
      return this.createWallTile(rawTiles, x, y);
    } else {
      return this.createFloorTile(rawTiles, x, y);
    }
  };

  Level.prototype.createFloorTile = function(rawTiles, x, y) {
    var tile;
    tile = new Tile('floor');
    tile.north = this.hasNorthWall(rawTiles, x, y) ? 'wall' : 'none';
    tile.east = this.hasEastWall(rawTiles, x, y) ? 'wall' : 'none';
    tile.south = this.hasSouthWall(rawTiles, x, y) ? 'wall' : 'none';
    tile.west = this.hasWestWall(rawTiles, x, y) ? 'wall' : 'none';
    return tile;
  };

  Level.prototype.createWallTile = function(rawTiles, x, y) {
    var tile;
    if (this.adjacentFloorTile(rawTiles, x, y)) {
      tile = new Tile('wall');
      tile.north = this.wallContinuesNorth(rawTiles, x, y) ? 'wall' : 'none';
      tile.east = this.wallContinuesEast(rawTiles, x, y) ? 'wall' : 'none';
      tile.south = this.wallContinuesSouth(rawTiles, x, y) ? 'wall' : 'none';
      tile.west = this.wallContinuesWest(rawTiles, x, y) ? 'wall' : 'none';
      return tile;
    }
  };

  Level.prototype.adjacentFloorTile = function(rawTiles, x, y) {
    return this.adjacentTiles(rawTiles, x, y).indexOf(FLOOR) !== -1;
  };

  Level.prototype.adjacentTiles = function(rawTiles, x, y) {
    var result;
    result = [];
    if (y > 0) {
      result.push(rawTiles[x][y - 1]);
    }
    if (y > 0 && x < this.width) {
      result.push(rawTiles[x + 1][y - 1]);
    }
    if (x < this.width) {
      result.push(rawTiles[x + 1][y]);
    }
    if (x < this.width && y < this.height) {
      result.push(rawTiles[x + 1][y + 1]);
    }
    if (y < this.height) {
      result.push(rawTiles[x][y + 1]);
    }
    if (x > 0 && y < this.height) {
      result.push(rawTiles[x - 1][y + 1]);
    }
    if (x > 0) {
      result.push(rawTiles[x - 1][y]);
    }
    if (x > 0 && y > 0) {
      result.push(rawTiles[x - 1][y - 1]);
    }
    return result;
  };

  Level.prototype.hasNorthWall = function(tiles, x, y) {
    if (y === 0) {
      return true;
    }
    return tiles[x][y - 1] === 1;
  };

  Level.prototype.hasSouthWall = function(tiles, x, y) {
    if (y === this.height) {
      return true;
    }
    return tiles[x][y + 1] === 1;
  };

  Level.prototype.hasWestWall = function(tiles, x, y) {
    if (x === 0) {
      return true;
    }
    return tiles[x - 1][y] === 1;
  };

  Level.prototype.hasEastWall = function(tiles, x, y) {
    if (x === this.width) {
      return true;
    }
    return tiles[x + 1][y] === 1;
  };

  Level.prototype.wallContinuesNorth = function(tiles, x, y) {
    if (y === 0) {
      return false;
    }
    return tiles[x][y - 1] === 1 && this.adjacentFloorTile(tiles, x, y - 1);
  };

  Level.prototype.wallContinuesSouth = function(tiles, x, y) {
    if (y === this.height) {
      return false;
    }
    return tiles[x][y + 1] === 1 && this.adjacentFloorTile(tiles, x, y + 1);
  };

  Level.prototype.wallContinuesWest = function(tiles, x, y) {
    if (x === 0) {
      return false;
    }
    return tiles[x - 1][y] === 1 && this.adjacentFloorTile(tiles, x - 1, y);
  };

  Level.prototype.wallContinuesEast = function(tiles, x, y) {
    if (x === this.width) {
      return false;
    }
    return tiles[x + 1][y] === 1 && this.adjacentFloorTile(tiles, x + 1, y);
  };

  return Level;

})();

Tile = (function() {
  function Tile(type) {
    this.type = type;
  }

  return Tile;

})();

create2DArray = function(width, height) {
  var i, tiles, _i;
  tiles = [];
  for (i = _i = 0; 0 <= width ? _i <= width : _i >= width; i = 0 <= width ? ++_i : --_i) {
    tiles[i] = new Array(height);
  }
  return tiles;
};

module.exports.Level = Level;


},{"rot-js":4}],7:[function(require,module,exports){
var Player;

Player = (function() {
  function Player(_arg) {
    this.x = _arg.x, this.y = _arg.y;
  }

  Player.prototype.move = function(_arg) {
    var x, y;
    x = _arg.x, y = _arg.y;
    this.x += x;
    return this.y += y;
  };

  Player.prototype.observedMaps = {};

  return Player;

})();

module.exports.Player = Player;


},{}],8:[function(require,module,exports){
var FloorTextures, Game, Level, Player, Promise, ROT, RulesEngine, Schedulable, WaitForPlayerInput, WallTextures, pixi,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

pixi = require('pixi.js');

ROT = require('rot-js').ROT;

Level = require('./Level').Level;

Player = require('./Player').Player;

Promise = require('es6-promise').Promise;

FloorTextures = require('./tiles/dawnlike/Floor').FloorTextures;

WallTextures = require('./tiles/dawnlike/Wall').WallTextures;

Game = (function() {
  Game.prototype.scale = new pixi.Point(1, 1);

  function Game(_arg) {
    var freeTile;
    this.stage = _arg.stage, this.renderer = _arg.renderer;
    this.scheduler = new ROT.Scheduler.Simple();
    this.engine = new ROT.Engine(this.scheduler);
    this.level = new Level({
      width: 80,
      height: 40
    });
    this.level.generate();
    this.thingsHaveChanged = true;
    this.rulesEngine = new RulesEngine(this.level, (function(_this) {
      return function() {
        _this.thingsHaveChanged = true;
        return _this.updateLayers();
      };
    })(this));
    freeTile = this.level.freeTiles[0];
    this.player = new Player({
      x: freeTile[0],
      y: freeTile[1]
    });
    this.layers = {
      level: new pixi.DisplayObjectContainer(),
      entities: new pixi.DisplayObjectContainer()
    };
    this.rootDisplayObjectContainer = new pixi.DisplayObjectContainer();
    this.rootDisplayObjectContainer.addChild(this.layers.level);
    this.rootDisplayObjectContainer.addChild(this.layers.entities);
    this.rootDisplayObjectContainer.scale = this.scale;
    this.stage.addChild(this.rootDisplayObjectContainer);
  }

  Game.prototype.load = function() {
    return this.loadTextures().then((function(_this) {
      return function() {
        _this.scheduler.add(new WaitForPlayerInput(_this.rulesEngine, _this.player), true);
        _this.engine.start();
        _this.drawLevel(_this.level);
        return _this.drawCreatures();
      };
    })(this))["catch"](function(error) {
      return console.error(error);
    });
  };

  Game.prototype.loadTextures = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var humanoidTexture;
        FloorTextures.load();
        WallTextures.load('brick/light').then(function(wallTexture) {
          _this.wallTexture = wallTexture;
          return resolve();
        }, reject);
        _this.floorTextureMap = FloorTextures.floorTypes.bricks.grey;
        humanoidTexture = pixi.Texture.fromImage("images/dawnlike/Characters/Humanoid0.png");
        return _this.playerTexture = new pixi.Texture(humanoidTexture, new pixi.Rectangle(16 * 0, 16 * 7, 16, 16));
      };
    })(this));
  };

  Game.prototype.updateLayers = function() {
    this.clearLayers();
    this.drawCreatures();
    return this.drawLevel();
  };

  Game.prototype.clearLayers = function() {
    var layer, name, _ref, _results;
    _ref = this.layers;
    _results = [];
    for (name in _ref) {
      layer = _ref[name];
      _results.push(layer.removeChildren());
    }
    return _results;
  };

  Game.prototype.draw = function() {
    if (!this.thingsHaveChanged) {
      return;
    }
    this.renderer.render(this.stage);
    this.thingsHaveChanged = false;
  };

  Game.prototype.floorSprite = function(x, y) {
    var sprite, tile;
    tile = this.level.tiles[x][y];
    sprite = new pixi.Sprite(this.floorTextureMap[tile.north][tile.east][tile.south][tile.west]);
    sprite.x = x * 16;
    sprite.y = y * 16;
    return sprite;
  };

  Game.prototype.wallSprite = function(x, y) {
    var sprite, textureName, tile;
    tile = this.level.tiles[x][y];
    textureName = "" + (tile.north === 'wall' ? 'N' : '_') + (tile.east === "wall" ? "E" : "_") + (tile.south === "wall" ? "S" : "_") + (tile.west === "wall" ? "W" : "_");
    sprite = new pixi.Sprite(this.wallTexture[textureName]);
    sprite.x = x * 16;
    sprite.y = y * 16;
    return sprite;
  };

  Game.prototype.drawTile = function(x, y) {
    var wallSprite, _ref;
    switch ((_ref = this.level.tiles[x][y]) != null ? _ref.type : void 0) {
      case 'floor':
        return this.layers.level.addChild(this.floorSprite(x, y));
      case 'wall':
        wallSprite = this.wallSprite(x, y);
        if (wallSprite != null) {
          return this.layers.level.addChild(wallSprite);
        }
    }
  };

  Game.prototype.drawLevel = function(level) {
    var fov;
    fov = new ROT.FOV.PreciseShadowcasting((function(_this) {
      return function(x, y) {
        return _this.rulesEngine.lightPasses(x, y);
      };
    })(this));
    return fov.compute(this.player.x, this.player.y, 15, (function(_this) {
      return function(x, y, r, visibility) {
        return _this.drawTile(x, y);
      };
    })(this));
  };

  Game.prototype.drawCreatures = function() {
    this.player.sprite = new pixi.Sprite(this.playerTexture);
    this.player.sprite.x = 16 * this.player.x;
    this.player.sprite.y = 16 * this.player.y;
    return this.layers.entities.addChild(this.player.sprite);
  };

  return Game;

})();

RulesEngine = (function() {
  function RulesEngine(level, thingsChangedCallback) {
    this.level = level;
    this.thingsChangedCallback = thingsChangedCallback;
  }

  RulesEngine.prototype.step = function(_arg) {
    var actor, destX, destY, destinationTile, direction, movementDiff, xDiff, yDiff, _ref;
    actor = _arg.actor, direction = _arg.direction;
    movementDiff = ROT.DIRS[8][direction];
    xDiff = movementDiff[0], yDiff = movementDiff[1];
    _ref = [actor.x + xDiff, actor.y + yDiff], destX = _ref[0], destY = _ref[1];
    destinationTile = this.level.tiles[destX][destY];
    if ((destinationTile != null ? destinationTile.type : void 0) === 'floor') {
      actor.x = destX;
      actor.y = destY;
      this.thingsChangedCallback();
      return true;
    } else {
      return false;
    }
  };

  RulesEngine.prototype.lightPasses = function(x, y) {
    var _ref, _ref1;
    return ((_ref = this.level.tiles[x]) != null ? (_ref1 = _ref[y]) != null ? _ref1.type : void 0 : void 0) === 'floor';
  };

  return RulesEngine;

})();

Schedulable = (function() {
  function Schedulable() {}

  Schedulable.prototype.act = function() {
    return Promise.resolve();
  };

  return Schedulable;

})();

WaitForPlayerInput = (function(_super) {
  __extends(WaitForPlayerInput, _super);

  WaitForPlayerInput.prototype.KEYMAP = {
    38: 0,
    33: 1,
    39: 2,
    34: 3,
    40: 4,
    35: 5,
    37: 6,
    36: 7
  };

  function WaitForPlayerInput(rulesEngine, player) {
    this.rulesEngine = rulesEngine;
    this.player = player;
  }

  WaitForPlayerInput.prototype.act = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var keydownHandler;
        keydownHandler = function(event) {
          var code, direction;
          code = event.keyCode;
          if (!(code in _this.KEYMAP)) {
            return;
          }
          event.preventDefault();
          direction = _this.KEYMAP[code];
          if (_this.rulesEngine.step({
            actor: _this.player,
            direction: direction
          })) {
            window.removeEventListener('keydown', keydownHandler);
            return resolve();
          }
        };
        return window.addEventListener('keydown', keydownHandler);
      };
    })(this));
  };

  return WaitForPlayerInput;

})(Schedulable);

module.exports.Game = Game;


},{"./Level":6,"./Player":7,"./tiles/dawnlike/Floor":10,"./tiles/dawnlike/Wall":11,"es6-promise":2,"pixi.js":3,"rot-js":4}],9:[function(require,module,exports){
var Game, pixi;

pixi = require("pixi.js");

Game = require('./game').Game;

document.addEventListener("DOMContentLoaded", function() {
  var game, renderer, stage;
  renderer = new pixi.WebGLRenderer(80 * 16, 40 * 16);
  document.body.appendChild(renderer.view);
  stage = new pixi.Stage;
  game = new Game({
    renderer: renderer,
    stage: stage
  });
  return game.load().then(function() {
    var drawLoop;
    drawLoop = function() {
      game.draw();
      return requestAnimationFrame(drawLoop);
    };
    return drawLoop();
  });
});


},{"./game":8,"pixi.js":3}],10:[function(require,module,exports){
var FloorTextures, floorMap, floorMapAt, floorMapGroupAt, pixi, textureAt,
  __slice = [].slice;

pixi = require('pixi.js');

textureAt = function(originX, originY, x, y, w, h, baseTexture) {
  return new pixi.Texture(baseTexture, new pixi.Rectangle(originX + x * w, originY + y * h, w, h));
};

floorMap = function(originX, originY, tileWidth, tileHeight, baseTexture) {
  var oX, oY, th, tw;
  oX = originX;
  oY = originY;
  tw = tileWidth;
  th = tileHeight;
  return {
    wall: {
      wall: {
        wall: {
          wall: textureAt(oX, oY, 5, 0, tw, th, baseTexture),
          none: textureAt(oX, oY, 6, 1, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 3, 0, tw, th, baseTexture),
          none: textureAt(oX, oY, 2, 0, tw, th, baseTexture)
        }
      },
      none: {
        wall: {
          wall: textureAt(oX, oY, 4, 1, tw, th, baseTexture),
          none: textureAt(oX, oY, 5, 1, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 0, 0, tw, th, baseTexture),
          none: textureAt(oX, oY, 1, 0, tw, th, baseTexture)
        }
      }
    },
    none: {
      wall: {
        wall: {
          wall: textureAt(oX, oY, 3, 2, tw, th, baseTexture),
          none: textureAt(oX, oY, 2, 2, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 3, 1, tw, th, baseTexture),
          none: textureAt(oX, oY, 2, 1, tw, th, baseTexture)
        }
      },
      none: {
        wall: {
          wall: textureAt(oX, oY, 0, 2, tw, th, baseTexture),
          none: textureAt(oX, oY, 1, 2, tw, th, baseTexture)
        },
        none: {
          wall: textureAt(oX, oY, 0, 1, tw, th, baseTexture),
          none: textureAt(oX, oY, 1, 1, tw, th, baseTexture)
        }
      }
    }
  };
};

floorMapAt = function(column, row, tileWidth, tileHeight, baseTexture) {
  var floorMapHeight, floorMapWidth;
  floorMapWidth = 7;
  floorMapHeight = 3;
  return floorMap(column * floorMapWidth * tileWidth, row * floorMapHeight * tileHeight, tileWidth, tileHeight, baseTexture);
};

floorMapGroupAt = function() {
  var baseTexture, column, i, name, names, result, row, tileHeight, tileWidth, _i, _len;
  column = arguments[0], row = arguments[1], tileWidth = arguments[2], tileHeight = arguments[3], baseTexture = arguments[4], names = 6 <= arguments.length ? __slice.call(arguments, 5) : [];
  result = {};
  for (i = _i = 0, _len = names.length; _i < _len; i = ++_i) {
    name = names[i];
    result[names[i]] = floorMapAt(column, row + i, tileWidth, tileHeight, baseTexture);
  }
  return result;
};

FloorTextures = (function() {
  function FloorTextures() {}

  FloorTextures.load = function() {
    var th, tileHeight, tileWidth, tw;
    this.baseTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Floor.png");
    tw = tileWidth = 16;
    th = tileHeight = 16;
    return this.floorTypes = {
      blackAndWhite: floorMapAt(0, 0, tw, th, this.baseTexture),
      bricks: floorMapGroupAt(0, 1, tw, th, this.baseTexture, 'cyan', 'grey', 'darkgrey', 'blue'),
      grass: floorMapGroupAt(1, 1, tw, th, this.baseTexture, 'cyan', 'grey', 'darkgreen', 'blue'),
      rock: floorMapGroupAt(2, 1, tw, th, this.baseTexture, 'yellow', 'orange', 'red', 'blue'),
      dirt: floorMapGroupAt(0, 5, tw, th, this.baseTexture, 'yellow', 'orange', 'red', 'blue'),
      planks: floorMapGroupAt(1, 5, tw, th, this.baseTexture, 'pink', 'orange', 'greygreen', 'brown'),
      sunlitDirt: floorMapGroupAt(2, 5, tw, th, this.baseTexture, 'yellow', 'orange', 'brown', 'blue'),
      furrows: floorMapGroupAt(0, 9, tw, th, this.baseTexture, 'orange', 'brown', 'blue', 'darkblue')
    };
  };

  return FloorTextures;

})();

module.exports.FloorTextures = FloorTextures;


},{"pixi.js":3}],11:[function(require,module,exports){
var Promise, WallTextureVariant, WallTextures, pixi,
  __slice = [].slice;

pixi = require('pixi.js');

Promise = require('es6-promise').Promise;

WallTextures = (function() {
  function WallTextures() {}

  WallTextures.load = function(variant) {
    var loader, result;
    loader = new pixi.JsonLoader("images/dawnlike/Objects/textures/wall/" + variant + ".json");
    result = null;
    return new Promise(function(resolve, reject) {
      var originalLoaderJSONHandler;
      originalLoaderJSONHandler = loader.onJSONLoaded;
      loader.onJSONLoaded = function() {
        originalLoaderJSONHandler.apply(loader);
        return result = new WallTextureVariant(variant);
      };
      loader.once('loaded', function() {
        return resolve(result);
      });
      loader.once('error', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        console.log.apply(console, args);
        return reject.apply(null, args);
      });
      return loader.load();
    });
  };

  return WallTextures;

})();

WallTextureVariant = (function() {
  function WallTextureVariant(name) {
    var textureId, textureName, textureNames, _i, _len;
    this.name = name;
    textureNames = ['NESW', 'NE_W', 'N_SW', 'N__W', '_ESW', '_E_W', '____', 'NES_', 'NE__', 'N_S_', 'N___', '_ES_', '__SW'];
    for (_i = 0, _len = textureNames.length; _i < _len; _i++) {
      textureName = textureNames[_i];
      textureId = "" + textureName + ".png";
      this[textureName] = pixi.TextureCache[textureId];
      pixi.Texture.removeTextureFromCache(textureId);
    }
    this.___W = this._E_W;
    this._E__ = this._E_W;
    this.__S_ = this.N_S_;
  }

  return WallTextureVariant;

})();

module.exports.WallTextures = WallTextures;


},{"es6-promise":2,"pixi.js":3}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy93bWFkZGVuL0Ryb3Bib3gvUHJvamVjdHMvcGVyc29uYWwvbXktcm9ndWVsaWtlL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvd21hZGRlbi9Ecm9wYm94L1Byb2plY3RzL3BlcnNvbmFsL215LXJvZ3VlbGlrZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL3dtYWRkZW4vRHJvcGJveC9Qcm9qZWN0cy9wZXJzb25hbC9teS1yb2d1ZWxpa2Uvbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2Rpc3QvZXM2LXByb21pc2UuanMiLCIvVXNlcnMvd21hZGRlbi9Ecm9wYm94L1Byb2plY3RzL3BlcnNvbmFsL215LXJvZ3VlbGlrZS9ub2RlX21vZHVsZXMvcGl4aS5qcy9iaW4vcGl4aS5qcyIsIi9Vc2Vycy93bWFkZGVuL0Ryb3Bib3gvUHJvamVjdHMvcGVyc29uYWwvbXktcm9ndWVsaWtlL25vZGVfbW9kdWxlcy9yb3QtanMvaW5kZXguanMiLCIvVXNlcnMvd21hZGRlbi9Ecm9wYm94L1Byb2plY3RzL3BlcnNvbmFsL215LXJvZ3VlbGlrZS9ub2RlX21vZHVsZXMvcm90LWpzL2xpYi9yb3QuanMiLCIvVXNlcnMvd21hZGRlbi9Ecm9wYm94L1Byb2plY3RzL3BlcnNvbmFsL215LXJvZ3VlbGlrZS9zcmMvc2NyaXB0cy9MZXZlbC5jb2ZmZWUiLCIvVXNlcnMvd21hZGRlbi9Ecm9wYm94L1Byb2plY3RzL3BlcnNvbmFsL215LXJvZ3VlbGlrZS9zcmMvc2NyaXB0cy9QbGF5ZXIuY29mZmVlIiwiL1VzZXJzL3dtYWRkZW4vRHJvcGJveC9Qcm9qZWN0cy9wZXJzb25hbC9teS1yb2d1ZWxpa2Uvc3JjL3NjcmlwdHMvZ2FtZS5jb2ZmZWUiLCIvVXNlcnMvd21hZGRlbi9Ecm9wYm94L1Byb2plY3RzL3BlcnNvbmFsL215LXJvZ3VlbGlrZS9zcmMvc2NyaXB0cy9tYWluLmNvZmZlZSIsIi9Vc2Vycy93bWFkZGVuL0Ryb3Bib3gvUHJvamVjdHMvcGVyc29uYWwvbXktcm9ndWVsaWtlL3NyYy9zY3JpcHRzL3RpbGVzL2Rhd25saWtlL0Zsb29yLmNvZmZlZSIsIi9Vc2Vycy93bWFkZGVuL0Ryb3Bib3gvUHJvamVjdHMvcGVyc29uYWwvbXktcm9ndWVsaWtlL3NyYy9zY3JpcHRzL3RpbGVzL2Rhd25saWtlL1dhbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdjhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHhLQSxJQUFBLHVEQUFBOztBQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLEdBQXhCLENBQUE7O0FBQUEsSUFFQSxHQUFPLENBRlAsQ0FBQTs7QUFBQSxLQUdBLEdBQVEsQ0FIUixDQUFBOztBQUFBLFNBS0EsR0FBWSxDQUxaLENBQUE7O0FBQUE7QUFRZSxFQUFBLGVBQUMsSUFBRCxHQUFBO0FBQ1gsSUFEYyxJQUFDLENBQUEsYUFBQSxPQUFPLElBQUMsQ0FBQSxjQUFBLE1BQ3ZCLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxFQUFELEdBQU0sU0FBQSxFQUFOLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFEYixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLGFBQUEsQ0FBYyxJQUFDLENBQUEsS0FBZixFQUFzQixJQUFDLENBQUEsTUFBdkIsQ0FGVCxDQURXO0VBQUEsQ0FBYjs7QUFBQSxrQkFLQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSxlQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsYUFBQSxDQUFjLElBQUMsQ0FBQSxLQUFmLEVBQXNCLElBQUMsQ0FBQSxNQUF2QixDQUFSLENBQUE7QUFBQSxJQUNBLFFBQUEsR0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLElBQVAsR0FBQTtBQUNULFlBQUEsS0FBQTs7ZUFBUyxDQUFBLENBQUEsSUFBTTtTQUFmO0FBQUEsUUFDQSxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFULEdBQWMsSUFEZCxDQUFBO0FBRUEsUUFBQSxJQUE4QixJQUFBLEtBQVEsQ0FBdEM7aUJBQUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBaEIsRUFBQTtTQUhTO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEWCxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsR0FBRCxHQUFXLElBQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLEtBQWhCLEVBQXVCLElBQUMsQ0FBQSxNQUF4QixDQUxYLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLFFBQVosQ0FOQSxDQUFBO1dBT0EsSUFBQyxDQUFBLG1CQUFELENBQXFCLElBQUMsQ0FBQSxHQUF0QixFQUEyQixLQUEzQixFQVJRO0VBQUEsQ0FMVixDQUFBOztBQUFBLGtCQWVBLG1CQUFBLEdBQXFCLFNBQUMsR0FBRCxFQUFNLFFBQU4sR0FBQTtBQUNuQixRQUFBLHdCQUFBO0FBQUE7U0FBUywrRkFBVCxHQUFBO0FBQ0U7O0FBQUE7YUFBUyxxR0FBVCxHQUFBO0FBQ0UseUJBQUEsSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQVYsR0FBZSxJQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosRUFBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBZixDQURGO0FBQUE7O29CQUFBLENBREY7QUFBQTtvQkFEbUI7RUFBQSxDQWZyQixDQUFBOztBQUFBLGtCQW9CQSxVQUFBLEdBQVksU0FBQyxRQUFELEVBQVcsQ0FBWCxFQUFjLENBQWQsR0FBQTtBQUNWLElBQUEsSUFBRyxRQUFTLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFaLEtBQWtCLENBQXJCO2FBQ0UsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsUUFBaEIsRUFBMEIsQ0FBMUIsRUFBNkIsQ0FBN0IsRUFERjtLQUFBLE1BQUE7YUFHRSxJQUFDLENBQUEsZUFBRCxDQUFpQixRQUFqQixFQUEyQixDQUEzQixFQUE4QixDQUE5QixFQUhGO0tBRFU7RUFBQSxDQXBCWixDQUFBOztBQUFBLGtCQTBCQSxlQUFBLEdBQWlCLFNBQUMsUUFBRCxFQUFXLENBQVgsRUFBYyxDQUFkLEdBQUE7QUFDZixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxPQUFMLENBQVgsQ0FBQTtBQUFBLElBQ0EsSUFBSSxDQUFDLEtBQUwsR0FBZ0IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBQXVCLENBQXZCLEVBQXlCLENBQXpCLENBQUgsR0FBb0MsTUFBcEMsR0FBZ0QsTUFEN0QsQ0FBQTtBQUFBLElBRUEsSUFBSSxDQUFDLElBQUwsR0FBZSxJQUFDLENBQUEsV0FBRCxDQUFhLFFBQWIsRUFBc0IsQ0FBdEIsRUFBd0IsQ0FBeEIsQ0FBSCxHQUFtQyxNQUFuQyxHQUErQyxNQUYzRCxDQUFBO0FBQUEsSUFHQSxJQUFJLENBQUMsS0FBTCxHQUFnQixJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFBdUIsQ0FBdkIsRUFBeUIsQ0FBekIsQ0FBSCxHQUFvQyxNQUFwQyxHQUFnRCxNQUg3RCxDQUFBO0FBQUEsSUFJQSxJQUFJLENBQUMsSUFBTCxHQUFlLElBQUMsQ0FBQSxXQUFELENBQWEsUUFBYixFQUFzQixDQUF0QixFQUF3QixDQUF4QixDQUFILEdBQW1DLE1BQW5DLEdBQStDLE1BSjNELENBQUE7V0FLQSxLQU5lO0VBQUEsQ0ExQmpCLENBQUE7O0FBQUEsa0JBa0NBLGNBQUEsR0FBZ0IsU0FBQyxRQUFELEVBQVcsQ0FBWCxFQUFjLENBQWQsR0FBQTtBQUNkLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsUUFBbkIsRUFBNkIsQ0FBN0IsRUFBZ0MsQ0FBaEMsQ0FBSDtBQUNFLE1BQUEsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLE1BQUwsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsS0FBTCxHQUFnQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsUUFBcEIsRUFBNkIsQ0FBN0IsRUFBK0IsQ0FBL0IsQ0FBSCxHQUEwQyxNQUExQyxHQUFzRCxNQURuRSxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsSUFBTCxHQUFlLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixRQUFuQixFQUE0QixDQUE1QixFQUE4QixDQUE5QixDQUFILEdBQXlDLE1BQXpDLEdBQXFELE1BRmpFLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxLQUFMLEdBQWdCLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixRQUFwQixFQUE2QixDQUE3QixFQUErQixDQUEvQixDQUFILEdBQTBDLE1BQTFDLEdBQXNELE1BSG5FLENBQUE7QUFBQSxNQUlBLElBQUksQ0FBQyxJQUFMLEdBQWUsSUFBQyxDQUFBLGlCQUFELENBQW1CLFFBQW5CLEVBQTRCLENBQTVCLEVBQThCLENBQTlCLENBQUgsR0FBeUMsTUFBekMsR0FBcUQsTUFKakUsQ0FBQTthQUtBLEtBTkY7S0FEYztFQUFBLENBbENoQixDQUFBOztBQUFBLGtCQTJDQSxpQkFBQSxHQUFtQixTQUFDLFFBQUQsRUFBVyxDQUFYLEVBQWMsQ0FBZCxHQUFBO1dBQ2pCLElBQUMsQ0FBQSxhQUFELENBQWUsUUFBZixFQUF5QixDQUF6QixFQUE0QixDQUE1QixDQUE4QixDQUFDLE9BQS9CLENBQXVDLEtBQXZDLENBQUEsS0FBaUQsQ0FBQSxFQURoQztFQUFBLENBM0NuQixDQUFBOztBQUFBLGtCQThDQSxhQUFBLEdBQWUsU0FBQyxRQUFELEVBQVcsQ0FBWCxFQUFjLENBQWQsR0FBQTtBQUNiLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLEVBQVQsQ0FBQTtBQUNBLElBQUEsSUFBaUMsQ0FBQSxHQUFJLENBQXJDO0FBQUEsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVMsQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUF4QixDQUFBLENBQUE7S0FEQTtBQUVBLElBQUEsSUFBbUMsQ0FBQSxHQUFJLENBQUosSUFBUyxDQUFBLEdBQUksSUFBQyxDQUFBLEtBQWpEO0FBQUEsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVMsQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFLLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBMUIsQ0FBQSxDQUFBO0tBRkE7QUFHQSxJQUFBLElBQWlDLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBdEM7QUFBQSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBUyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQUssQ0FBQSxDQUFBLENBQTFCLENBQUEsQ0FBQTtLQUhBO0FBSUEsSUFBQSxJQUFtQyxDQUFBLEdBQUksSUFBQyxDQUFBLEtBQUwsSUFBYyxDQUFBLEdBQUksSUFBQyxDQUFBLE1BQXREO0FBQUEsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVMsQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFLLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBMUIsQ0FBQSxDQUFBO0tBSkE7QUFLQSxJQUFBLElBQWlDLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBdEM7QUFBQSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBUyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQXhCLENBQUEsQ0FBQTtLQUxBO0FBTUEsSUFBQSxJQUFtQyxDQUFBLEdBQUksQ0FBSixJQUFTLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBakQ7QUFBQSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBUyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUExQixDQUFBLENBQUE7S0FOQTtBQU9BLElBQUEsSUFBaUMsQ0FBQSxHQUFJLENBQXJDO0FBQUEsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVMsQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFLLENBQUEsQ0FBQSxDQUExQixDQUFBLENBQUE7S0FQQTtBQVFBLElBQUEsSUFBbUMsQ0FBQSxHQUFJLENBQUosSUFBUyxDQUFBLEdBQUksQ0FBaEQ7QUFBQSxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBUyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUExQixDQUFBLENBQUE7S0FSQTtXQVNBLE9BVmE7RUFBQSxDQTlDZixDQUFBOztBQUFBLGtCQTBEQSxZQUFBLEdBQWMsU0FBQyxLQUFELEVBQVEsQ0FBUixFQUFXLENBQVgsR0FBQTtBQUNaLElBQUEsSUFBZSxDQUFBLEtBQUssQ0FBcEI7QUFBQSxhQUFPLElBQVAsQ0FBQTtLQUFBO1dBQ0EsS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQVQsS0FBaUIsRUFGTDtFQUFBLENBMURkLENBQUE7O0FBQUEsa0JBOERBLFlBQUEsR0FBYyxTQUFDLEtBQUQsRUFBUSxDQUFSLEVBQVcsQ0FBWCxHQUFBO0FBQ1osSUFBQSxJQUFlLENBQUEsS0FBSyxJQUFDLENBQUEsTUFBckI7QUFBQSxhQUFPLElBQVAsQ0FBQTtLQUFBO1dBQ0EsS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQVQsS0FBaUIsRUFGTDtFQUFBLENBOURkLENBQUE7O0FBQUEsa0JBa0VBLFdBQUEsR0FBYSxTQUFDLEtBQUQsRUFBUSxDQUFSLEVBQVcsQ0FBWCxHQUFBO0FBQ1gsSUFBQSxJQUFlLENBQUEsS0FBSyxDQUFwQjtBQUFBLGFBQU8sSUFBUCxDQUFBO0tBQUE7V0FDQSxLQUFNLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBSyxDQUFBLENBQUEsQ0FBWCxLQUFpQixFQUZOO0VBQUEsQ0FsRWIsQ0FBQTs7QUFBQSxrQkFzRUEsV0FBQSxHQUFhLFNBQUMsS0FBRCxFQUFRLENBQVIsRUFBVyxDQUFYLEdBQUE7QUFDWCxJQUFBLElBQWUsQ0FBQSxLQUFLLElBQUMsQ0FBQSxLQUFyQjtBQUFBLGFBQU8sSUFBUCxDQUFBO0tBQUE7V0FDQSxLQUFNLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBSyxDQUFBLENBQUEsQ0FBWCxLQUFpQixFQUZOO0VBQUEsQ0F0RWIsQ0FBQTs7QUFBQSxrQkEwRUEsa0JBQUEsR0FBb0IsU0FBQyxLQUFELEVBQVEsQ0FBUixFQUFXLENBQVgsR0FBQTtBQUNsQixJQUFBLElBQWdCLENBQUEsS0FBSyxDQUFyQjtBQUFBLGFBQU8sS0FBUCxDQUFBO0tBQUE7V0FDQSxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBVCxLQUFpQixDQUFqQixJQUFzQixJQUFDLENBQUEsaUJBQUQsQ0FBbUIsS0FBbkIsRUFBMEIsQ0FBMUIsRUFBNkIsQ0FBQSxHQUFFLENBQS9CLEVBRko7RUFBQSxDQTFFcEIsQ0FBQTs7QUFBQSxrQkE4RUEsa0JBQUEsR0FBb0IsU0FBQyxLQUFELEVBQVEsQ0FBUixFQUFXLENBQVgsR0FBQTtBQUNsQixJQUFBLElBQWdCLENBQUEsS0FBSyxJQUFDLENBQUEsTUFBdEI7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQUFBO1dBQ0EsS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQVQsS0FBaUIsQ0FBakIsSUFBc0IsSUFBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLEVBQTBCLENBQTFCLEVBQTZCLENBQUEsR0FBRSxDQUEvQixFQUZKO0VBQUEsQ0E5RXBCLENBQUE7O0FBQUEsa0JBa0ZBLGlCQUFBLEdBQW1CLFNBQUMsS0FBRCxFQUFRLENBQVIsRUFBVyxDQUFYLEdBQUE7QUFDakIsSUFBQSxJQUFnQixDQUFBLEtBQUssQ0FBckI7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQUFBO1dBQ0EsS0FBTSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQUssQ0FBQSxDQUFBLENBQVgsS0FBaUIsQ0FBakIsSUFBc0IsSUFBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLEVBQTBCLENBQUEsR0FBRSxDQUE1QixFQUErQixDQUEvQixFQUZMO0VBQUEsQ0FsRm5CLENBQUE7O0FBQUEsa0JBc0ZBLGlCQUFBLEdBQW1CLFNBQUMsS0FBRCxFQUFRLENBQVIsRUFBVyxDQUFYLEdBQUE7QUFDakIsSUFBQSxJQUFnQixDQUFBLEtBQUssSUFBQyxDQUFBLEtBQXRCO0FBQUEsYUFBTyxLQUFQLENBQUE7S0FBQTtXQUNBLEtBQU0sQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFLLENBQUEsQ0FBQSxDQUFYLEtBQWlCLENBQWpCLElBQXNCLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixFQUEwQixDQUFBLEdBQUUsQ0FBNUIsRUFBK0IsQ0FBL0IsRUFGTDtFQUFBLENBdEZuQixDQUFBOztlQUFBOztJQVJGLENBQUE7O0FBQUE7QUFvR2UsRUFBQSxjQUFFLElBQUYsR0FBQTtBQUFTLElBQVIsSUFBQyxDQUFBLE9BQUEsSUFBTyxDQUFUO0VBQUEsQ0FBYjs7Y0FBQTs7SUFwR0YsQ0FBQTs7QUFBQSxhQXNHQSxHQUFnQixTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDZCxNQUFBLFlBQUE7QUFBQSxFQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFDQSxPQUFTLGdGQUFULEdBQUE7QUFDRSxJQUFBLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBZSxJQUFBLEtBQUEsQ0FBTSxNQUFOLENBQWYsQ0FERjtBQUFBLEdBREE7U0FHQSxNQUpjO0FBQUEsQ0F0R2hCLENBQUE7O0FBQUEsTUE0R00sQ0FBQyxPQUFPLENBQUMsS0FBZixHQUF1QixLQTVHdkIsQ0FBQTs7OztBQ0FBLElBQUEsTUFBQTs7QUFBQTtBQUNlLEVBQUEsZ0JBQUMsSUFBRCxHQUFBO0FBQWEsSUFBVixJQUFDLENBQUEsU0FBQSxHQUFHLElBQUMsQ0FBQSxTQUFBLENBQUssQ0FBYjtFQUFBLENBQWI7O0FBQUEsbUJBRUEsSUFBQSxHQUFNLFNBQUMsSUFBRCxHQUFBO0FBQ0osUUFBQSxJQUFBO0FBQUEsSUFETyxTQUFBLEdBQUcsU0FBQSxDQUNWLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxDQUFELElBQU0sQ0FBTixDQUFBO1dBQ0EsSUFBQyxDQUFBLENBQUQsSUFBTSxFQUZGO0VBQUEsQ0FGTixDQUFBOztBQUFBLG1CQU1BLFlBQUEsR0FBYyxFQU5kLENBQUE7O2dCQUFBOztJQURGLENBQUE7O0FBQUEsTUFTTSxDQUFDLE9BQU8sQ0FBQyxNQUFmLEdBQXdCLE1BVHhCLENBQUE7Ozs7QUNBQSxJQUFBLGtIQUFBO0VBQUE7aVNBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBQVAsQ0FBQTs7QUFBQSxHQUNBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxHQUR4QixDQUFBOztBQUFBLEtBRUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQUFrQixDQUFDLEtBRjNCLENBQUE7O0FBQUEsTUFHQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQW1CLENBQUMsTUFIN0IsQ0FBQTs7QUFBQSxPQUlBLEdBQVUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxPQUpqQyxDQUFBOztBQUFBLGFBS0EsR0FBZ0IsT0FBQSxDQUFRLHdCQUFSLENBQWlDLENBQUMsYUFMbEQsQ0FBQTs7QUFBQSxZQU1BLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBQWdDLENBQUMsWUFOaEQsQ0FBQTs7QUFBQTtBQVNFLGlCQUFBLEtBQUEsR0FBVyxJQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFhLENBQWIsQ0FBWCxDQUFBOztBQUVhLEVBQUEsY0FBQyxJQUFELEdBQUE7QUFDWCxRQUFBLFFBQUE7QUFBQSxJQURjLElBQUMsQ0FBQSxhQUFBLE9BQU8sSUFBQyxDQUFBLGdCQUFBLFFBQ3ZCLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFkLENBQUEsQ0FBakIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBQyxDQUFBLFNBQVosQ0FEZCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBRCxHQUFhLElBQUEsS0FBQSxDQUFNO0FBQUEsTUFBQSxLQUFBLEVBQU8sRUFBUDtBQUFBLE1BQVcsTUFBQSxFQUFRLEVBQW5CO0tBQU4sQ0FIYixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBQSxDQUpBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQU5yQixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLFdBQUEsQ0FBWSxJQUFDLENBQUEsS0FBYixFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ3JDLFFBQUEsS0FBQyxDQUFBLGlCQUFELEdBQXFCLElBQXJCLENBQUE7ZUFDQSxLQUFDLENBQUEsWUFBRCxDQUFBLEVBRnFDO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FQbkIsQ0FBQTtBQUFBLElBWUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBVSxDQUFBLENBQUEsQ0FaNUIsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE1BQUEsQ0FBTztBQUFBLE1BQUEsQ0FBQSxFQUFHLFFBQVMsQ0FBQSxDQUFBLENBQVo7QUFBQSxNQUFnQixDQUFBLEVBQUcsUUFBUyxDQUFBLENBQUEsQ0FBNUI7S0FBUCxDQWJkLENBQUE7QUFBQSxJQWVBLElBQUMsQ0FBQSxNQUFELEdBQVU7QUFBQSxNQUNSLEtBQUEsRUFBVyxJQUFBLElBQUksQ0FBQyxzQkFBTCxDQUFBLENBREg7QUFBQSxNQUVSLFFBQUEsRUFBYyxJQUFBLElBQUksQ0FBQyxzQkFBTCxDQUFBLENBRk47S0FmVixDQUFBO0FBQUEsSUFtQkEsSUFBQyxDQUFBLDBCQUFELEdBQWtDLElBQUEsSUFBSSxDQUFDLHNCQUFMLENBQUEsQ0FuQmxDLENBQUE7QUFBQSxJQW9CQSxJQUFDLENBQUEsMEJBQTBCLENBQUMsUUFBNUIsQ0FBcUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUE3QyxDQXBCQSxDQUFBO0FBQUEsSUFxQkEsSUFBQyxDQUFBLDBCQUEwQixDQUFDLFFBQTVCLENBQXFDLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBN0MsQ0FyQkEsQ0FBQTtBQUFBLElBc0JBLElBQUMsQ0FBQSwwQkFBMEIsQ0FBQyxLQUE1QixHQUFvQyxJQUFDLENBQUEsS0F0QnJDLENBQUE7QUFBQSxJQXVCQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsSUFBQyxDQUFBLDBCQUFqQixDQXZCQSxDQURXO0VBQUEsQ0FGYjs7QUFBQSxpQkE0QkEsSUFBQSxHQUFNLFNBQUEsR0FBQTtXQUNKLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBZSxDQUFDLElBQWhCLENBQXFCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDbkIsUUFBQSxLQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBbUIsSUFBQSxrQkFBQSxDQUFtQixLQUFDLENBQUEsV0FBcEIsRUFBaUMsS0FBQyxDQUFBLE1BQWxDLENBQW5CLEVBQThELElBQTlELENBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFFQSxLQUFDLENBQUEsU0FBRCxDQUFXLEtBQUMsQ0FBQSxLQUFaLENBRkEsQ0FBQTtlQUdBLEtBQUMsQ0FBQSxhQUFELENBQUEsRUFKbUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixDQUtBLENBQUMsT0FBRCxDQUxBLENBS08sU0FBQyxLQUFELEdBQUE7YUFDTCxPQUFPLENBQUMsS0FBUixDQUFjLEtBQWQsRUFESztJQUFBLENBTFAsRUFESTtFQUFBLENBNUJOLENBQUE7O0FBQUEsaUJBcUNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDUixJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ1YsWUFBQSxlQUFBO0FBQUEsUUFBQSxhQUFhLENBQUMsSUFBZCxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBRUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsYUFBbEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUF1QyxTQUFDLFdBQUQsR0FBQTtBQUNyQyxVQUFBLEtBQUMsQ0FBQSxXQUFELEdBQWUsV0FBZixDQUFBO2lCQUNBLE9BQUEsQ0FBQSxFQUZxQztRQUFBLENBQXZDLEVBR0UsTUFIRixDQUZBLENBQUE7QUFBQSxRQU9BLEtBQUMsQ0FBQSxlQUFELEdBQW1CLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBUG5ELENBQUE7QUFBQSxRQVFBLGVBQUEsR0FBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFiLENBQXVCLDBDQUF2QixDQVJsQixDQUFBO2VBU0EsS0FBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxJQUFJLENBQUMsT0FBTCxDQUNuQixlQURtQixFQUVmLElBQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxFQUFBLEdBQUssQ0FBcEIsRUFBdUIsRUFBQSxHQUFLLENBQTVCLEVBQStCLEVBQS9CLEVBQW1DLEVBQW5DLENBRmUsRUFWWDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsRUFEUTtFQUFBLENBckNkLENBQUE7O0FBQUEsaUJBcURBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBREEsQ0FBQTtXQUVBLElBQUMsQ0FBQSxTQUFELENBQUEsRUFIWTtFQUFBLENBckRkLENBQUE7O0FBQUEsaUJBMERBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFDWCxRQUFBLDJCQUFBO0FBQUE7QUFBQTtTQUFBLFlBQUE7eUJBQUE7QUFDRSxvQkFBQSxLQUFLLENBQUMsY0FBTixDQUFBLEVBQUEsQ0FERjtBQUFBO29CQURXO0VBQUEsQ0ExRGIsQ0FBQTs7QUFBQSxpQkE4REEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLElBQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxpQkFBZjtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLEtBQWxCLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEtBRnJCLENBREk7RUFBQSxDQTlETixDQUFBOztBQUFBLGlCQW9FQSxXQUFBLEdBQWEsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO0FBQ1gsUUFBQSxZQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUF2QixDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQWEsSUFBQSxJQUFJLENBQUMsTUFBTCxDQUNYLElBQUMsQ0FBQSxlQUFpQixDQUFBLElBQUksQ0FBQyxLQUFMLENBQWMsQ0FBQSxJQUFJLENBQUMsSUFBTCxDQUFhLENBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBYyxDQUFBLElBQUksQ0FBQyxJQUFMLENBRGhELENBRGIsQ0FBQTtBQUFBLElBS0EsTUFBTSxDQUFDLENBQVAsR0FBVyxDQUFBLEdBQUksRUFMZixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsQ0FBUCxHQUFXLENBQUEsR0FBSSxFQU5mLENBQUE7V0FPQSxPQVJXO0VBQUEsQ0FwRWIsQ0FBQTs7QUFBQSxpQkE4RUEsVUFBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNWLFFBQUEseUJBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQXZCLENBQUE7QUFBQSxJQUNBLFdBQUEsR0FBYyxFQUFBLEdBQUUsQ0FBRyxJQUFJLENBQUMsS0FBTCxLQUFjLE1BQWpCLEdBQTZCLEdBQTdCLEdBQXNDLEdBQXRDLENBQUYsR0FBOEMsQ0FBRyxJQUFJLENBQUMsSUFBTCxLQUFhLE1BQWhCLEdBQTRCLEdBQTVCLEdBQXFDLEdBQXJDLENBQTlDLEdBQXlGLENBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxNQUFqQixHQUE2QixHQUE3QixHQUFzQyxHQUF0QyxDQUF6RixHQUFxSSxDQUFHLElBQUksQ0FBQyxJQUFMLEtBQWEsTUFBaEIsR0FBNEIsR0FBNUIsR0FBcUMsR0FBckMsQ0FEbkosQ0FBQTtBQUFBLElBRUEsTUFBQSxHQUFhLElBQUEsSUFBSSxDQUFDLE1BQUwsQ0FDWCxJQUFDLENBQUEsV0FBWSxDQUFBLFdBQUEsQ0FERixDQUZiLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxDQUFQLEdBQVcsQ0FBQSxHQUFJLEVBTmYsQ0FBQTtBQUFBLElBT0EsTUFBTSxDQUFDLENBQVAsR0FBVyxDQUFBLEdBQUksRUFQZixDQUFBO1dBUUEsT0FUVTtFQUFBLENBOUVaLENBQUE7O0FBQUEsaUJBeUZBLFFBQUEsR0FBVSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7QUFDUixRQUFBLGdCQUFBO0FBQUEsMERBQXlCLENBQUUsYUFBM0I7QUFBQSxXQUNPLE9BRFA7ZUFFSSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFkLENBQXVCLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBYixFQUFnQixDQUFoQixDQUF2QixFQUZKO0FBQUEsV0FHTyxNQUhQO0FBSUksUUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLEVBQWUsQ0FBZixDQUFiLENBQUE7QUFDQSxRQUFBLElBQXFDLGtCQUFyQztpQkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFkLENBQXVCLFVBQXZCLEVBQUE7U0FMSjtBQUFBLEtBRFE7RUFBQSxDQXpGVixDQUFBOztBQUFBLGlCQWlHQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFDVCxRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBVSxJQUFBLEdBQUcsQ0FBQyxHQUFHLENBQUMsb0JBQVIsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtlQUFVLEtBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUFWO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FBVixDQUFBO1dBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLENBQXJCLEVBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBaEMsRUFBbUMsRUFBbkMsRUFBdUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsVUFBVixHQUFBO2VBQ3JDLEtBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixFQUFhLENBQWIsRUFEcUM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QyxFQUZTO0VBQUEsQ0FqR1gsQ0FBQTs7QUFBQSxpQkEwR0EsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQXFCLElBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFDLENBQUEsYUFBYixDQUFyQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFmLEdBQW1CLEVBQUEsR0FBSyxJQUFDLENBQUEsTUFBTSxDQUFDLENBRGhDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQWYsR0FBbUIsRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FGaEMsQ0FBQTtXQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQWpCLENBQTBCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbEMsRUFKYTtFQUFBLENBMUdmLENBQUE7O2NBQUE7O0lBVEYsQ0FBQTs7QUFBQTtBQTBIZSxFQUFBLHFCQUFFLEtBQUYsRUFBVSxxQkFBVixHQUFBO0FBQWtDLElBQWpDLElBQUMsQ0FBQSxRQUFBLEtBQWdDLENBQUE7QUFBQSxJQUF6QixJQUFDLENBQUEsd0JBQUEscUJBQXdCLENBQWxDO0VBQUEsQ0FBYjs7QUFBQSx3QkFDQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7QUFDSixRQUFBLGlGQUFBO0FBQUEsSUFETyxhQUFBLE9BQU8saUJBQUEsU0FDZCxDQUFBO0FBQUEsSUFBQSxZQUFBLEdBQWUsR0FBRyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxTQUFBLENBQTNCLENBQUE7QUFBQSxJQUNDLHVCQUFELEVBQVEsdUJBRFIsQ0FBQTtBQUFBLElBRUEsT0FBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBTixHQUFVLEtBQVgsRUFBa0IsS0FBSyxDQUFDLENBQU4sR0FBVSxLQUE1QixDQUFqQixFQUFDLGVBQUQsRUFBUSxlQUZSLENBQUE7QUFBQSxJQUdBLGVBQUEsR0FBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFNLENBQUEsS0FBQSxDQUFPLENBQUEsS0FBQSxDQUh0QyxDQUFBO0FBSUEsSUFBQSwrQkFBRyxlQUFlLENBQUUsY0FBakIsS0FBeUIsT0FBNUI7QUFDRSxNQUFBLEtBQUssQ0FBQyxDQUFOLEdBQVUsS0FBVixDQUFBO0FBQUEsTUFDQSxLQUFLLENBQUMsQ0FBTixHQUFVLEtBRFYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FGQSxDQUFBO2FBR0EsS0FKRjtLQUFBLE1BQUE7YUFNRSxNQU5GO0tBTEk7RUFBQSxDQUROLENBQUE7O0FBQUEsd0JBYUEsV0FBQSxHQUFhLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNYLFFBQUEsV0FBQTtvRkFBbUIsQ0FBRSx1QkFBckIsS0FBNkIsUUFEbEI7RUFBQSxDQWJiLENBQUE7O3FCQUFBOztJQTFIRixDQUFBOztBQUFBOzJCQTJJRTs7QUFBQSx3QkFBQSxHQUFBLEdBQUssU0FBQSxHQUFBO1dBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBQSxFQUFIO0VBQUEsQ0FBTCxDQUFBOztxQkFBQTs7SUEzSUYsQ0FBQTs7QUFBQTtBQThJRSx1Q0FBQSxDQUFBOztBQUFBLCtCQUFBLE1BQUEsR0FBUTtBQUFBLElBRU4sRUFBQSxFQUFJLENBRkU7QUFBQSxJQUdOLEVBQUEsRUFBSSxDQUhFO0FBQUEsSUFJTixFQUFBLEVBQUksQ0FKRTtBQUFBLElBS04sRUFBQSxFQUFJLENBTEU7QUFBQSxJQU1OLEVBQUEsRUFBSSxDQU5FO0FBQUEsSUFPTixFQUFBLEVBQUksQ0FQRTtBQUFBLElBUU4sRUFBQSxFQUFJLENBUkU7QUFBQSxJQVNOLEVBQUEsRUFBSSxDQVRFO0dBQVIsQ0FBQTs7QUFZYSxFQUFBLDRCQUFFLFdBQUYsRUFBZ0IsTUFBaEIsR0FBQTtBQUF5QixJQUF4QixJQUFDLENBQUEsY0FBQSxXQUF1QixDQUFBO0FBQUEsSUFBVixJQUFDLENBQUEsU0FBQSxNQUFTLENBQXpCO0VBQUEsQ0FaYjs7QUFBQSwrQkFjQSxHQUFBLEdBQUssU0FBQSxHQUFBO1dBQ0MsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNWLFlBQUEsY0FBQTtBQUFBLFFBQUEsY0FBQSxHQUFpQixTQUFDLEtBQUQsR0FBQTtBQUNmLGNBQUEsZUFBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFiLENBQUE7QUFDQSxVQUFBLElBQUEsQ0FBQSxDQUFjLElBQUEsSUFBUSxLQUFDLENBQUEsTUFBdkIsQ0FBQTtBQUFBLGtCQUFBLENBQUE7V0FEQTtBQUFBLFVBRUEsS0FBSyxDQUFDLGNBQU4sQ0FBQSxDQUZBLENBQUE7QUFBQSxVQUlBLFNBQUEsR0FBWSxLQUFDLENBQUEsTUFBTyxDQUFBLElBQUEsQ0FKcEIsQ0FBQTtBQUtBLFVBQUEsSUFBRyxLQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBbUI7QUFBQSxZQUFBLEtBQUEsRUFBTyxLQUFDLENBQUEsTUFBUjtBQUFBLFlBQWdCLFNBQUEsRUFBVyxTQUEzQjtXQUFuQixDQUFIO0FBQ0UsWUFBQSxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsU0FBM0IsRUFBc0MsY0FBdEMsQ0FBQSxDQUFBO21CQUNBLE9BQUEsQ0FBQSxFQUZGO1dBTmU7UUFBQSxDQUFqQixDQUFBO2VBVUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLGNBQW5DLEVBWFU7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSLEVBREQ7RUFBQSxDQWRMLENBQUE7OzRCQUFBOztHQUQrQixZQTdJakMsQ0FBQTs7QUFBQSxNQTBLTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLElBMUt0QixDQUFBOzs7O0FDQ0EsSUFBQSxVQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUFQLENBQUE7O0FBQUEsSUFDQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsSUFEekIsQ0FBQTs7QUFBQSxRQUdRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFNBQUEsR0FBQTtBQUM1QyxNQUFBLHFCQUFBO0FBQUEsRUFBQSxRQUFBLEdBQWUsSUFBQSxJQUFJLENBQUMsYUFBTCxDQUFtQixFQUFBLEdBQUssRUFBeEIsRUFBNEIsRUFBQSxHQUFLLEVBQWpDLENBQWYsQ0FBQTtBQUFBLEVBQ0EsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFkLENBQTBCLFFBQVEsQ0FBQyxJQUFuQyxDQURBLENBQUE7QUFBQSxFQUVBLEtBQUEsR0FBUSxHQUFBLENBQUEsSUFBUSxDQUFDLEtBRmpCLENBQUE7QUFBQSxFQUlBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FDVDtBQUFBLElBQUEsUUFBQSxFQUFVLFFBQVY7QUFBQSxJQUNBLEtBQUEsRUFBTyxLQURQO0dBRFMsQ0FKWCxDQUFBO1NBU0EsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFXLENBQUMsSUFBWixDQUFpQixTQUFBLEdBQUE7QUFDZixRQUFBLFFBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxDQUFBO2FBQ0EscUJBQUEsQ0FBc0IsUUFBdEIsRUFGUztJQUFBLENBQVgsQ0FBQTtXQUdBLFFBQUEsQ0FBQSxFQUplO0VBQUEsQ0FBakIsRUFWNEM7QUFBQSxDQUE5QyxDQUhBLENBQUE7Ozs7QUNEQSxJQUFBLHFFQUFBO0VBQUEsa0JBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBQVAsQ0FBQTs7QUFBQSxTQUVBLEdBQVksU0FBQyxPQUFELEVBQVUsT0FBVixFQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUErQixXQUEvQixHQUFBO1NBQ04sSUFBQSxJQUFJLENBQUMsT0FBTCxDQUFhLFdBQWIsRUFDRSxJQUFBLElBQUksQ0FBQyxTQUFMLENBQWUsT0FBQSxHQUFVLENBQUEsR0FBSSxDQUE3QixFQUFnQyxPQUFBLEdBQVUsQ0FBQSxHQUFJLENBQTlDLEVBQWlELENBQWpELEVBQW9ELENBQXBELENBREYsRUFETTtBQUFBLENBRlosQ0FBQTs7QUFBQSxRQU9BLEdBQVcsU0FBQyxPQUFELEVBQVUsT0FBVixFQUFtQixTQUFuQixFQUE4QixVQUE5QixFQUEwQyxXQUExQyxHQUFBO0FBRVQsTUFBQSxjQUFBO0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBTCxDQUFBO0FBQUEsRUFDQSxFQUFBLEdBQUssT0FETCxDQUFBO0FBQUEsRUFFQSxFQUFBLEdBQUssU0FGTCxDQUFBO0FBQUEsRUFHQSxFQUFBLEdBQUssVUFITCxDQUFBO1NBS0E7QUFBQSxJQUNFLElBQUEsRUFBTTtBQUFBLE1BQ0osSUFBQSxFQUFNO0FBQUEsUUFDSixJQUFBLEVBQU07QUFBQSxVQUNKLElBQUEsRUFBTSxTQUFBLENBQVUsRUFBVixFQUFjLEVBQWQsRUFBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsRUFBeEIsRUFBNEIsRUFBNUIsRUFBZ0MsV0FBaEMsQ0FERjtBQUFBLFVBRUosSUFBQSxFQUFNLFNBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZCxFQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxXQUFoQyxDQUZGO1NBREY7QUFBQSxRQUtKLElBQUEsRUFBTTtBQUFBLFVBQ0osSUFBQSxFQUFNLFNBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZCxFQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxXQUFoQyxDQURGO0FBQUEsVUFFSixJQUFBLEVBQU0sU0FBQSxDQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLEVBQXhCLEVBQTRCLEVBQTVCLEVBQWdDLFdBQWhDLENBRkY7U0FMRjtPQURGO0FBQUEsTUFXSixJQUFBLEVBQU07QUFBQSxRQUNKLElBQUEsRUFBTTtBQUFBLFVBQ0osSUFBQSxFQUFNLFNBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZCxFQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxXQUFoQyxDQURGO0FBQUEsVUFFSixJQUFBLEVBQU0sU0FBQSxDQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLEVBQXhCLEVBQTRCLEVBQTVCLEVBQWdDLFdBQWhDLENBRkY7U0FERjtBQUFBLFFBS0osSUFBQSxFQUFNO0FBQUEsVUFDSixJQUFBLEVBQU0sU0FBQSxDQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLEVBQXhCLEVBQTRCLEVBQTVCLEVBQWdDLFdBQWhDLENBREY7QUFBQSxVQUVKLElBQUEsRUFBTSxTQUFBLENBQVUsRUFBVixFQUFjLEVBQWQsRUFBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsRUFBeEIsRUFBNEIsRUFBNUIsRUFBZ0MsV0FBaEMsQ0FGRjtTQUxGO09BWEY7S0FEUjtBQUFBLElBdUJFLElBQUEsRUFBTTtBQUFBLE1BQ0osSUFBQSxFQUFNO0FBQUEsUUFDSixJQUFBLEVBQU07QUFBQSxVQUNKLElBQUEsRUFBTSxTQUFBLENBQVUsRUFBVixFQUFjLEVBQWQsRUFBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsRUFBeEIsRUFBNEIsRUFBNUIsRUFBZ0MsV0FBaEMsQ0FERjtBQUFBLFVBRUosSUFBQSxFQUFNLFNBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZCxFQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxXQUFoQyxDQUZGO1NBREY7QUFBQSxRQUtKLElBQUEsRUFBTTtBQUFBLFVBQ0osSUFBQSxFQUFNLFNBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZCxFQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxXQUFoQyxDQURGO0FBQUEsVUFFSixJQUFBLEVBQU0sU0FBQSxDQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLEVBQXhCLEVBQTRCLEVBQTVCLEVBQWdDLFdBQWhDLENBRkY7U0FMRjtPQURGO0FBQUEsTUFXSixJQUFBLEVBQU07QUFBQSxRQUNKLElBQUEsRUFBTTtBQUFBLFVBQ0osSUFBQSxFQUFNLFNBQUEsQ0FBVSxFQUFWLEVBQWMsRUFBZCxFQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixFQUF4QixFQUE0QixFQUE1QixFQUFnQyxXQUFoQyxDQURGO0FBQUEsVUFFSixJQUFBLEVBQU0sU0FBQSxDQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLEVBQXhCLEVBQTRCLEVBQTVCLEVBQWdDLFdBQWhDLENBRkY7U0FERjtBQUFBLFFBS0osSUFBQSxFQUFNO0FBQUEsVUFDSixJQUFBLEVBQU0sU0FBQSxDQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLEVBQXhCLEVBQTRCLEVBQTVCLEVBQWdDLFdBQWhDLENBREY7QUFBQSxVQUVKLElBQUEsRUFBTSxTQUFBLENBQVUsRUFBVixFQUFjLEVBQWQsRUFBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsRUFBeEIsRUFBNEIsRUFBNUIsRUFBZ0MsV0FBaEMsQ0FGRjtTQUxGO09BWEY7S0F2QlI7SUFQUztBQUFBLENBUFgsQ0FBQTs7QUFBQSxVQTZEQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxTQUFkLEVBQXlCLFVBQXpCLEVBQXFDLFdBQXJDLEdBQUE7QUFDWCxNQUFBLDZCQUFBO0FBQUEsRUFBQSxhQUFBLEdBQWdCLENBQWhCLENBQUE7QUFBQSxFQUNBLGNBQUEsR0FBaUIsQ0FEakIsQ0FBQTtTQUVBLFFBQUEsQ0FDRSxNQUFBLEdBQVMsYUFBVCxHQUF5QixTQUQzQixFQUVFLEdBQUEsR0FBTSxjQUFOLEdBQXVCLFVBRnpCLEVBRXFDLFNBRnJDLEVBRWdELFVBRmhELEVBRTRELFdBRjVELEVBSFc7QUFBQSxDQTdEYixDQUFBOztBQUFBLGVBcUVBLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixNQUFBLGlGQUFBO0FBQUEsRUFEaUIsdUJBQVEsb0JBQUssMEJBQVcsMkJBQVksNEJBQWEsK0RBQ2xFLENBQUE7QUFBQSxFQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFDQSxPQUFBLG9EQUFBO29CQUFBO0FBQ0UsSUFBQSxNQUFPLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBTixDQUFQLEdBQW1CLFVBQUEsQ0FBVyxNQUFYLEVBQW1CLEdBQUEsR0FBTSxDQUF6QixFQUE0QixTQUE1QixFQUF1QyxVQUF2QyxFQUFtRCxXQUFuRCxDQUFuQixDQURGO0FBQUEsR0FEQTtTQUdBLE9BSmdCO0FBQUEsQ0FyRWxCLENBQUE7O0FBQUE7NkJBNEVFOztBQUFBLEVBQUEsYUFBQyxDQUFBLElBQUQsR0FBTyxTQUFBLEdBQUE7QUFDTCxRQUFBLDZCQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBYixDQUF1QixtQ0FBdkIsQ0FBZixDQUFBO0FBQUEsSUFFQSxFQUFBLEdBQUssU0FBQSxHQUFZLEVBRmpCLENBQUE7QUFBQSxJQUdBLEVBQUEsR0FBSyxVQUFBLEdBQWEsRUFIbEIsQ0FBQTtXQUtBLElBQUMsQ0FBQSxVQUFELEdBQWM7QUFBQSxNQUNaLGFBQUEsRUFBZSxVQUFBLENBQVcsQ0FBWCxFQUFhLENBQWIsRUFBZSxFQUFmLEVBQWtCLEVBQWxCLEVBQXNCLElBQUMsQ0FBQSxXQUF2QixDQURIO0FBQUEsTUFFWixNQUFBLEVBQVEsZUFBQSxDQUFnQixDQUFoQixFQUFrQixDQUFsQixFQUFvQixFQUFwQixFQUF1QixFQUF2QixFQUEyQixJQUFDLENBQUEsV0FBNUIsRUFBeUMsTUFBekMsRUFBaUQsTUFBakQsRUFBeUQsVUFBekQsRUFBcUUsTUFBckUsQ0FGSTtBQUFBLE1BR1osS0FBQSxFQUFRLGVBQUEsQ0FBZ0IsQ0FBaEIsRUFBa0IsQ0FBbEIsRUFBb0IsRUFBcEIsRUFBdUIsRUFBdkIsRUFBMkIsSUFBQyxDQUFBLFdBQTVCLEVBQXlDLE1BQXpDLEVBQWlELE1BQWpELEVBQXlELFdBQXpELEVBQXNFLE1BQXRFLENBSEk7QUFBQSxNQUlaLElBQUEsRUFBUSxlQUFBLENBQWdCLENBQWhCLEVBQWtCLENBQWxCLEVBQW9CLEVBQXBCLEVBQXVCLEVBQXZCLEVBQTJCLElBQUMsQ0FBQSxXQUE1QixFQUF5QyxRQUF6QyxFQUFtRCxRQUFuRCxFQUE2RCxLQUE3RCxFQUFvRSxNQUFwRSxDQUpJO0FBQUEsTUFLWixJQUFBLEVBQVEsZUFBQSxDQUFnQixDQUFoQixFQUFrQixDQUFsQixFQUFvQixFQUFwQixFQUF1QixFQUF2QixFQUEyQixJQUFDLENBQUEsV0FBNUIsRUFBeUMsUUFBekMsRUFBbUQsUUFBbkQsRUFBNkQsS0FBN0QsRUFBb0UsTUFBcEUsQ0FMSTtBQUFBLE1BTVosTUFBQSxFQUFRLGVBQUEsQ0FBZ0IsQ0FBaEIsRUFBa0IsQ0FBbEIsRUFBb0IsRUFBcEIsRUFBdUIsRUFBdkIsRUFBMkIsSUFBQyxDQUFBLFdBQTVCLEVBQXlDLE1BQXpDLEVBQWlELFFBQWpELEVBQTJELFdBQTNELEVBQXdFLE9BQXhFLENBTkk7QUFBQSxNQU9aLFVBQUEsRUFBWSxlQUFBLENBQWdCLENBQWhCLEVBQWtCLENBQWxCLEVBQW9CLEVBQXBCLEVBQXVCLEVBQXZCLEVBQTJCLElBQUMsQ0FBQSxXQUE1QixFQUF5QyxRQUF6QyxFQUFtRCxRQUFuRCxFQUE2RCxPQUE3RCxFQUFzRSxNQUF0RSxDQVBBO0FBQUEsTUFRWixPQUFBLEVBQVMsZUFBQSxDQUFnQixDQUFoQixFQUFrQixDQUFsQixFQUFvQixFQUFwQixFQUF1QixFQUF2QixFQUEyQixJQUFDLENBQUEsV0FBNUIsRUFBeUMsUUFBekMsRUFBbUQsT0FBbkQsRUFBNEQsTUFBNUQsRUFBb0UsVUFBcEUsQ0FSRztNQU5UO0VBQUEsQ0FBUCxDQUFBOzt1QkFBQTs7SUE1RUYsQ0FBQTs7QUFBQSxNQTZGTSxDQUFDLE9BQU8sQ0FBQyxhQUFmLEdBQStCLGFBN0YvQixDQUFBOzs7O0FDQUEsSUFBQSwrQ0FBQTtFQUFBLGtCQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUFQLENBQUE7O0FBQUEsT0FDQSxHQUFVLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUMsT0FEakMsQ0FBQTs7QUFBQTs0QkFJRTs7QUFBQSxFQUFBLFlBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxPQUFELEdBQUE7QUFDTCxRQUFBLGNBQUE7QUFBQSxJQUFBLE1BQUEsR0FBYSxJQUFBLElBQUksQ0FBQyxVQUFMLENBQWlCLHdDQUFBLEdBQXVDLE9BQXZDLEdBQWdELE9BQWpFLENBQWIsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLElBRFQsQ0FBQTtXQUVJLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQWlCVixVQUFBLHlCQUFBO0FBQUEsTUFBQSx5QkFBQSxHQUE0QixNQUFNLENBQUMsWUFBbkMsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLFlBQVAsR0FBc0IsU0FBQSxHQUFBO0FBQ3BCLFFBQUEseUJBQXlCLENBQUMsS0FBMUIsQ0FBZ0MsTUFBaEMsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxHQUFhLElBQUEsa0JBQUEsQ0FBbUIsT0FBbkIsRUFGTztNQUFBLENBRHRCLENBQUE7QUFBQSxNQUtBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixTQUFBLEdBQUE7ZUFDcEIsT0FBQSxDQUFRLE1BQVIsRUFEb0I7TUFBQSxDQUF0QixDQUxBLENBQUE7QUFBQSxNQVFBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQixTQUFBLEdBQUE7QUFBYSxZQUFBLElBQUE7QUFBQSxRQUFaLDhEQUFZLENBQUE7QUFBQSxRQUFBLE9BQU8sQ0FBQyxHQUFSLGdCQUFZLElBQVosQ0FBQSxDQUFBO2VBQXNCLE1BQUEsYUFBTyxJQUFQLEVBQW5DO01BQUEsQ0FBckIsQ0FSQSxDQUFBO2FBU0EsTUFBTSxDQUFDLElBQVAsQ0FBQSxFQTFCVTtJQUFBLENBQVIsRUFIQztFQUFBLENBQVAsQ0FBQTs7c0JBQUE7O0lBSkYsQ0FBQTs7QUFBQTtBQW9DZSxFQUFBLDRCQUFFLElBQUYsR0FBQTtBQUNYLFFBQUEsOENBQUE7QUFBQSxJQURZLElBQUMsQ0FBQSxPQUFBLElBQ2IsQ0FBQTtBQUFBLElBQUEsWUFBQSxHQUFlLENBQUUsTUFBRixFQUFVLE1BQVYsRUFBa0IsTUFBbEIsRUFBMEIsTUFBMUIsRUFBa0MsTUFBbEMsRUFBMEMsTUFBMUMsRUFDYixNQURhLEVBQ0wsTUFESyxFQUNHLE1BREgsRUFDVyxNQURYLEVBQ21CLE1BRG5CLEVBQzJCLE1BRDNCLEVBQ21DLE1BRG5DLENBQWYsQ0FBQTtBQUVBLFNBQUEsbURBQUE7cUNBQUE7QUFDRSxNQUFBLFNBQUEsR0FBWSxFQUFBLEdBQUUsV0FBRixHQUFlLE1BQTNCLENBQUE7QUFBQSxNQUNBLElBQUssQ0FBQSxXQUFBLENBQUwsR0FBb0IsSUFBSSxDQUFDLFlBQWEsQ0FBQSxTQUFBLENBRHRDLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQWIsQ0FBb0MsU0FBcEMsQ0FGQSxDQURGO0FBQUEsS0FGQTtBQUFBLElBTUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsSUFOVCxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQVBULENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLElBUlQsQ0FEVztFQUFBLENBQWI7OzRCQUFBOztJQXBDRixDQUFBOztBQUFBLE1BK0NNLENBQUMsT0FBTyxDQUFDLFlBQWYsR0FBOEIsWUEvQzlCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDIuMC4wXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgZnVuY3Rpb24gJCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJHV0aWxzJCRpc01heWJlVGhlbmFibGUoeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsO1xuICAgIH1cblxuICAgIHZhciAkJHV0aWxzJCRfaXNBcnJheTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheSkge1xuICAgICAgJCR1dGlscyQkX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciAkJHV0aWxzJCRpc0FycmF5ID0gJCR1dGlscyQkX2lzQXJyYXk7XG4gICAgdmFyICQkdXRpbHMkJG5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG4gICAgZnVuY3Rpb24gJCR1dGlscyQkRigpIHsgfVxuXG4gICAgdmFyICQkdXRpbHMkJG9fY3JlYXRlID0gKE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY29uZCBhcmd1bWVudCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG8gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICAkJHV0aWxzJCRGLnByb3RvdHlwZSA9IG87XG4gICAgICByZXR1cm4gbmV3ICQkdXRpbHMkJEYoKTtcbiAgICB9KTtcblxuICAgIHZhciAkJGFzYXAkJGxlbiA9IDA7XG5cbiAgICB2YXIgJCRhc2FwJCRkZWZhdWx0ID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICAkJGFzYXAkJHF1ZXVlWyQkYXNhcCQkbGVuXSA9IGNhbGxiYWNrO1xuICAgICAgJCRhc2FwJCRxdWV1ZVskJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgJCRhc2FwJCRsZW4gKz0gMjtcbiAgICAgIGlmICgkJGFzYXAkJGxlbiA9PT0gMikge1xuICAgICAgICAvLyBJZiBsZW4gaXMgMSwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgJCRhc2FwJCRzY2hlZHVsZUZsdXNoKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciAkJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG4gICAgdmFyICQkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSAkJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCAkJGFzYXAkJGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblxuICAgIC8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG4gICAgdmFyICQkYXNhcCQkaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gJCRhc2FwJCR1c2VOZXh0VGljaygpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygkJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3ICQkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoJCRhc2FwJCRmbHVzaCk7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHdlYiB3b3JrZXJcbiAgICBmdW5jdGlvbiAkJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gJCRhc2FwJCRmbHVzaDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkYXNhcCQkdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dCgkJGFzYXAkJGZsdXNoLCAxKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyICQkYXNhcCQkcXVldWUgPSBuZXcgQXJyYXkoMTAwMCk7XG5cbiAgICBmdW5jdGlvbiAkJGFzYXAkJGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkJGFzYXAkJGxlbjsgaSs9Mikge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAkJGFzYXAkJHF1ZXVlW2ldO1xuICAgICAgICB2YXIgYXJnID0gJCRhc2FwJCRxdWV1ZVtpKzFdO1xuXG4gICAgICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICAgICAgJCRhc2FwJCRxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgJCRhc2FwJCRxdWV1ZVtpKzFdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICAkJGFzYXAkJGxlbiA9IDA7XG4gICAgfVxuXG4gICAgdmFyICQkYXNhcCQkc2NoZWR1bGVGbHVzaDtcblxuICAgIC8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAgICQkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkYXNhcCQkdXNlTmV4dFRpY2soKTtcbiAgICB9IGVsc2UgaWYgKCQkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICQkYXNhcCQkc2NoZWR1bGVGbHVzaCA9ICQkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAoJCRhc2FwJCRpc1dvcmtlcikge1xuICAgICAgJCRhc2FwJCRzY2hlZHVsZUZsdXNoID0gJCRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSAkJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkbm9vcCgpIHt9XG4gICAgdmFyICQkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyICQkJGludGVybmFsJCRGVUxGSUxMRUQgPSAxO1xuICAgIHZhciAkJCRpbnRlcm5hbCQkUkVKRUNURUQgID0gMjtcbiAgICB2YXIgJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SID0gbmV3ICQkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHNlbGZGdWxsZmlsbG1lbnQoKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJylcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkZ2V0VGhlbihwcm9taXNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAkJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgICQkYXNhcCQkZGVmYXVsdChmdW5jdGlvbihwcm9taXNlKSB7XG4gICAgICAgIHZhciBzZWFsZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVycm9yID0gJCQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdGhlbmFibGUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuXG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlKSB7XG4gICAgICBpZiAodGhlbmFibGUuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpIHtcbiAgICAgIGlmIChtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yID09PSBwcm9taXNlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICQkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0aGVuID0gJCQkaW50ZXJuYWwkJGdldFRoZW4obWF5YmVUaGVuYWJsZSk7XG5cbiAgICAgICAgaWYgKHRoZW4gPT09ICQkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgJCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGVuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmICgkJHV0aWxzJCRpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCAkJCRpbnRlcm5hbCQkc2VsZkZ1bGxmaWxsbWVudCgpKTtcbiAgICAgIH0gZWxzZSBpZiAoJCR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgICAgIGlmIChwcm9taXNlLl9vbmVycm9yKSB7XG4gICAgICAgIHByb21pc2UuX29uZXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgJCQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gJCQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICAgICAgcHJvbWlzZS5fc3RhdGUgPSAkJCRpbnRlcm5hbCQkRlVMRklMTEVEO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJGFzYXAkJGRlZmF1bHQoJCQkaW50ZXJuYWwkJHB1Ymxpc2gsIHByb21pc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuICAgICAgcHJvbWlzZS5fc3RhdGUgPSAkJCRpbnRlcm5hbCQkUkVKRUNURUQ7XG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgICAgICQkYXNhcCQkZGVmYXVsdCgkJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbiwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcGFyZW50Ll9zdWJzY3JpYmVycztcbiAgICAgIHZhciBsZW5ndGggPSBzdWJzY3JpYmVycy5sZW5ndGg7XG5cbiAgICAgIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArICQkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArICQkJGludGVybmFsJCRSRUpFQ1RFRF0gID0gb25SZWplY3Rpb247XG5cbiAgICAgIGlmIChsZW5ndGggPT09IDAgJiYgcGFyZW50Ll9zdGF0ZSkge1xuICAgICAgICAkJGFzYXAkJGRlZmF1bHQoJCQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSkge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgc2V0dGxlZCA9IHByb21pc2UuX3N0YXRlO1xuXG4gICAgICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgICB2YXIgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaWJlcnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICAgICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyICQkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IgPSBuZXcgJCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IGU7XG4gICAgICAgIHJldHVybiAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSAkJHV0aWxzJCRpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgICAgICB2YWx1ZSwgZXJyb3IsIHN1Y2NlZWRlZCwgZmFpbGVkO1xuXG4gICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgdmFsdWUgPSAkJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSAkJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCAkJCRpbnRlcm5hbCQkY2Fubm90UmV0dXJuT3duKCkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGRldGFpbDtcbiAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSAkJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGZhaWxlZCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09ICQkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKXtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGVudW1lcmF0b3IkJG1ha2VTZXR0bGVkUmVzdWx0KHN0YXRlLCBwb3NpdGlvbiwgdmFsdWUpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXRlOiAnZnVsZmlsbGVkJyxcbiAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdGU6ICdyZWplY3RlZCcsXG4gICAgICAgICAgcmVhc29uOiB2YWx1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0LCBhYm9ydE9uUmVqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICB0aGlzLl9hYm9ydE9uUmVqZWN0ID0gYWJvcnRPblJlamVjdDtcblxuICAgICAgaWYgKHRoaXMuX3ZhbGlkYXRlSW5wdXQoaW5wdXQpKSB7XG4gICAgICAgIHRoaXMuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICB0aGlzLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgICAgICB0aGlzLl9lbnVtZXJhdGUoKTtcbiAgICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHRoaXMucHJvbWlzZSwgdGhpcy5fdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgICQkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0ZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHJldHVybiAkJHV0aWxzJCRpc0FycmF5KGlucHV0KTtcbiAgICB9O1xuXG4gICAgJCQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG4gICAgfTtcblxuICAgICQkJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICAgIH07XG5cbiAgICB2YXIgJCQkZW51bWVyYXRvciQkZGVmYXVsdCA9ICQkJGVudW1lcmF0b3IkJEVudW1lcmF0b3I7XG5cbiAgICAkJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuZ3RoICA9IHRoaXMubGVuZ3RoO1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG4gICAgICB2YXIgaW5wdXQgICA9IHRoaXMuX2lucHV0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24oZW50cnksIGkpIHtcbiAgICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICAgIGlmICgkJHV0aWxzJCRpc01heWJlVGhlbmFibGUoZW50cnkpKSB7XG4gICAgICAgIGlmIChlbnRyeS5jb25zdHJ1Y3RvciA9PT0gYyAmJiBlbnRyeS5fc3RhdGUgIT09ICQkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgICAgZW50cnkuX29uZXJyb3IgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChjLnJlc29sdmUoZW50cnkpLCBpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoJCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgZW50cnkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkJCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSAkJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcblxuICAgICAgICBpZiAodGhpcy5fYWJvcnRPblJlamVjdCAmJiBzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdGhpcy5fbWFrZVJlc3VsdChzdGF0ZSwgaSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJCQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX21ha2VSZXN1bHQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuXG4gICAgJCQkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uKHByb21pc2UsIGkpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgJCQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdCgkJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KCQkJGludGVybmFsJCRSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgJCRwcm9taXNlJGFsbCQkZGVmYXVsdCA9IGZ1bmN0aW9uIGFsbChlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIG5ldyAkJCRlbnVtZXJhdG9yJCRkZWZhdWx0KHRoaXMsIGVudHJpZXMsIHRydWUgLyogYWJvcnQgb24gcmVqZWN0ICovLCBsYWJlbCkucHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRyYWNlJCRkZWZhdWx0ID0gZnVuY3Rpb24gcmFjZShlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG5cbiAgICAgIGlmICghJCR1dGlscyQkaXNBcnJheShlbnRyaWVzKSkge1xuICAgICAgICAkJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbG1lbnQodmFsdWUpIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGlvbihyZWFzb24pIHtcbiAgICAgICAgJCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09ICQkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSksIHVuZGVmaW5lZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdmFyICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVzb2x2ZShvYmplY3QsIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKCQkJGludGVybmFsJCRub29wLCBsYWJlbCk7XG4gICAgICAkJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHZhciAkJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0ID0gZnVuY3Rpb24gcmVqZWN0KHJlYXNvbiwgbGFiZWwpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IoJCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgICQkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICB2YXIgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRjb3VudGVyID0gMDtcblxuICAgIGZ1bmN0aW9uICQkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiAkJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzTmV3KCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG5cbiAgICB2YXIgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0ID0gJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlO1xuXG4gICAgLyoqXG4gICAgICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gICAgICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICAgICAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2XigJlzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgICAgIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBUZXJtaW5vbG9neVxuICAgICAgLS0tLS0tLS0tLS1cblxuICAgICAgLSBgcHJvbWlzZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHdpdGggYSBgdGhlbmAgbWV0aG9kIHdob3NlIGJlaGF2aW9yIGNvbmZvcm1zIHRvIHRoaXMgc3BlY2lmaWNhdGlvbi5cbiAgICAgIC0gYHRoZW5hYmxlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgYHRoZW5gIG1ldGhvZC5cbiAgICAgIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgICAgIC0gYGV4Y2VwdGlvbmAgaXMgYSB2YWx1ZSB0aGF0IGlzIHRocm93biB1c2luZyB0aGUgdGhyb3cgc3RhdGVtZW50LlxuICAgICAgLSBgcmVhc29uYCBpcyBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoeSBhIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAgICAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIEEgcHJvbWlzZSBjYW4gYmUgaW4gb25lIG9mIHRocmVlIHN0YXRlczogcGVuZGluZywgZnVsZmlsbGVkLCBvciByZWplY3RlZC5cblxuICAgICAgUHJvbWlzZXMgdGhhdCBhcmUgZnVsZmlsbGVkIGhhdmUgYSBmdWxmaWxsbWVudCB2YWx1ZSBhbmQgYXJlIGluIHRoZSBmdWxmaWxsZWRcbiAgICAgIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgICAgIHJlamVjdGVkIHN0YXRlLiAgQSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZXZlciBhIHRoZW5hYmxlLlxuXG4gICAgICBQcm9taXNlcyBjYW4gYWxzbyBiZSBzYWlkIHRvICpyZXNvbHZlKiBhIHZhbHVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBhbHNvIGFcbiAgICAgIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgICAgIHNldHRsZWQgc3RhdGUuICBTbyBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IHJlamVjdHMgd2lsbFxuICAgICAgaXRzZWxmIHJlamVjdCwgYW5kIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgd2lsbFxuICAgICAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICAgICAgQmFzaWMgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgYGBganNcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIG9uIHN1Y2Nlc3NcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAgICAgLy8gb24gZmFpbHVyZVxuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgICAgIGBYTUxIdHRwUmVxdWVzdGBzLlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGhhbmRsZXI7XG4gICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICB4aHIuc2VuZCgpO1xuXG4gICAgICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignZ2V0SlNPTjogYCcgKyB1cmwgKyAnYCBmYWlsZWQgd2l0aCBzdGF0dXM6IFsnICsgdGhpcy5zdGF0dXMgKyAnXScpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBnZXRKU09OKCcvcG9zdHMuanNvbicpLnRoZW4oZnVuY3Rpb24oanNvbikge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgVW5saWtlIGNhbGxiYWNrcywgcHJvbWlzZXMgYXJlIGdyZWF0IGNvbXBvc2FibGUgcHJpbWl0aXZlcy5cblxuICAgICAgYGBganNcbiAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgZ2V0SlNPTignL3Bvc3RzJyksXG4gICAgICAgIGdldEpTT04oJy9jb21tZW50cycpXG4gICAgICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgIHZhbHVlc1swXSAvLyA9PiBwb3N0c0pTT05cbiAgICAgICAgdmFsdWVzWzFdIC8vID0+IGNvbW1lbnRzSlNPTlxuXG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAY2xhc3MgUHJvbWlzZVxuICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZXJcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiAkJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UocmVzb2x2ZXIsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9pZCA9ICQkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fbGFiZWwgPSBsYWJlbDtcbiAgICAgIHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgICAgaWYgKCQkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICBpZiAoISQkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlKSkge1xuICAgICAgICAgICQkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLmFsbCA9ICQkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJhY2UgPSAkJHByb21pc2UkcmFjZSQkZGVmYXVsdDtcbiAgICAkJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9ICQkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgICQkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yZWplY3QgPSAkJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuXG4gICAgJCRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiAkJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UsXG5cbiAgICAvKipcbiAgICAgIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICAgICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICAgIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBDaGFpbmluZ1xuICAgICAgLS0tLS0tLS1cblxuICAgICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICAgIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAgICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gICAgICB9KTtcblxuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICAgICAgfSk7XG4gICAgICBgYGBcbiAgICAgIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFzc2ltaWxhdGlvblxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gICAgICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gICAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgICAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBTaW1wbGUgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBhdXRob3IsIGJvb2tzO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcblxuICAgICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG5cbiAgICAgIH1cblxuICAgICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kQXV0aG9yKCkuXG4gICAgICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgICAvLyBmb3VuZCBib29rc1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgdGhlblxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24sIGxhYmVsKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhdGUgPSBwYXJlbnQuX3N0YXRlO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gJCQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcigkJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gcGFyZW50Ll9yZXN1bHQ7XG5cbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzW3N0YXRlIC0gMV07XG4gICAgICAgICAgJCRhc2FwJCRkZWZhdWx0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgICAgIGFzIHRoZSBjYXRjaCBibG9jayBvZiBhIHRyeS9jYXRjaCBzdGF0ZW1lbnQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBmaW5kQXV0aG9yKCl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGRuJ3QgZmluZCB0aGF0IGF1dGhvcicpO1xuICAgICAgfVxuXG4gICAgICAvLyBzeW5jaHJvbm91c1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmluZEF1dGhvcigpO1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH1cblxuICAgICAgLy8gYXN5bmMgd2l0aCBwcm9taXNlc1xuICAgICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIGNhdGNoXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbiwgbGFiZWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbiwgbGFiZWwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgJCRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdCA9IGZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICAgICAgdmFyIGxvY2FsO1xuXG4gICAgICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbG9jYWwgPSBnbG9iYWw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgICAgICBsb2NhbCA9IHdpbmRvdztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsID0gc2VsZjtcbiAgICAgIH1cblxuICAgICAgdmFyIGVzNlByb21pc2VTdXBwb3J0ID1cbiAgICAgICAgXCJQcm9taXNlXCIgaW4gbG9jYWwgJiZcbiAgICAgICAgLy8gU29tZSBvZiB0aGVzZSBtZXRob2RzIGFyZSBtaXNzaW5nIGZyb21cbiAgICAgICAgLy8gRmlyZWZveC9DaHJvbWUgZXhwZXJpbWVudGFsIGltcGxlbWVudGF0aW9uc1xuICAgICAgICBcInJlc29sdmVcIiBpbiBsb2NhbC5Qcm9taXNlICYmXG4gICAgICAgIFwicmVqZWN0XCIgaW4gbG9jYWwuUHJvbWlzZSAmJlxuICAgICAgICBcImFsbFwiIGluIGxvY2FsLlByb21pc2UgJiZcbiAgICAgICAgXCJyYWNlXCIgaW4gbG9jYWwuUHJvbWlzZSAmJlxuICAgICAgICAvLyBPbGRlciB2ZXJzaW9uIG9mIHRoZSBzcGVjIGhhZCBhIHJlc29sdmVyIG9iamVjdFxuICAgICAgICAvLyBhcyB0aGUgYXJnIHJhdGhlciB0aGFuIGEgZnVuY3Rpb25cbiAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciByZXNvbHZlO1xuICAgICAgICAgIG5ldyBsb2NhbC5Qcm9taXNlKGZ1bmN0aW9uKHIpIHsgcmVzb2x2ZSA9IHI7IH0pO1xuICAgICAgICAgIHJldHVybiAkJHV0aWxzJCRpc0Z1bmN0aW9uKHJlc29sdmUpO1xuICAgICAgICB9KCkpO1xuXG4gICAgICBpZiAoIWVzNlByb21pc2VTdXBwb3J0KSB7XG4gICAgICAgIGxvY2FsLlByb21pc2UgPSAkJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2UgPSB7XG4gICAgICBQcm9taXNlOiAkJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQsXG4gICAgICBwb2x5ZmlsbDogJCRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZVsnZXhwb3J0cyddKSB7XG4gICAgICBtb2R1bGVbJ2V4cG9ydHMnXSA9IGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpc1snRVM2UHJvbWlzZSddID0gZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cbn0pLmNhbGwodGhpcyk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIldiOEdlalwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBAbGljZW5zZVxuICogcGl4aS5qcyAtIHYyLjEuMFxuICogQ29weXJpZ2h0IChjKSAyMDEyLTIwMTQsIE1hdCBHcm92ZXNcbiAqIGh0dHA6Ly9nb29kYm95ZGlnaXRhbC5jb20vXG4gKlxuICogQ29tcGlsZWQ6IDIwMTQtMTEtMTJcbiAqXG4gKiBwaXhpLmpzIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKi9cbihmdW5jdGlvbigpe3ZhciBhPXRoaXMsYj1ifHx7fTtiLldFQkdMX1JFTkRFUkVSPTAsYi5DQU5WQVNfUkVOREVSRVI9MSxiLlZFUlNJT049XCJ2Mi4xLjBcIixiLmJsZW5kTW9kZXM9e05PUk1BTDowLEFERDoxLE1VTFRJUExZOjIsU0NSRUVOOjMsT1ZFUkxBWTo0LERBUktFTjo1LExJR0hURU46NixDT0xPUl9ET0RHRTo3LENPTE9SX0JVUk46OCxIQVJEX0xJR0hUOjksU09GVF9MSUdIVDoxMCxESUZGRVJFTkNFOjExLEVYQ0xVU0lPTjoxMixIVUU6MTMsU0FUVVJBVElPTjoxNCxDT0xPUjoxNSxMVU1JTk9TSVRZOjE2fSxiLnNjYWxlTW9kZXM9e0RFRkFVTFQ6MCxMSU5FQVI6MCxORUFSRVNUOjF9LGIuX1VJRD0wLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBGbG9hdDMyQXJyYXk/KGIuRmxvYXQzMkFycmF5PUZsb2F0MzJBcnJheSxiLlVpbnQxNkFycmF5PVVpbnQxNkFycmF5KTooYi5GbG9hdDMyQXJyYXk9QXJyYXksYi5VaW50MTZBcnJheT1BcnJheSksYi5JTlRFUkFDVElPTl9GUkVRVUVOQ1k9MzAsYi5BVVRPX1BSRVZFTlRfREVGQVVMVD0hMCxiLlBJXzI9MipNYXRoLlBJLGIuUkFEX1RPX0RFRz0xODAvTWF0aC5QSSxiLkRFR19UT19SQUQ9TWF0aC5QSS8xODAsYi5SRVRJTkFfUFJFRklYPVwiQDJ4XCIsYi5kb250U2F5SGVsbG89ITEsYi5kZWZhdWx0UmVuZGVyT3B0aW9ucz17dmlldzpudWxsLHRyYW5zcGFyZW50OiExLGFudGlhbGlhczohMSxwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6ITEscmVzb2x1dGlvbjoxLGNsZWFyQmVmb3JlUmVuZGVyOiEwLGF1dG9SZXNpemU6ITF9LGIuc2F5SGVsbG89ZnVuY3Rpb24oYSl7aWYoIWIuZG9udFNheUhlbGxvKXtpZihuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImNocm9tZVwiKT4tMSl7dmFyIGM9W1wiJWMgJWMgJWMgUGl4aS5qcyBcIitiLlZFUlNJT04rXCIgLSBcIithK1wiICAlYyAgJWMgIGh0dHA6Ly93d3cucGl4aWpzLmNvbS8gICVjICVjIOKZpSVj4pmlJWPimaUgXCIsXCJiYWNrZ3JvdW5kOiAjZmY2NmE1XCIsXCJiYWNrZ3JvdW5kOiAjZmY2NmE1XCIsXCJjb2xvcjogI2ZmNjZhNTsgYmFja2dyb3VuZDogIzAzMDMwNztcIixcImJhY2tncm91bmQ6ICNmZjY2YTVcIixcImJhY2tncm91bmQ6ICNmZmMzZGNcIixcImJhY2tncm91bmQ6ICNmZjY2YTVcIixcImNvbG9yOiAjZmYyNDI0OyBiYWNrZ3JvdW5kOiAjZmZmXCIsXCJjb2xvcjogI2ZmMjQyNDsgYmFja2dyb3VuZDogI2ZmZlwiLFwiY29sb3I6ICNmZjI0MjQ7IGJhY2tncm91bmQ6ICNmZmZcIl07Y29uc29sZS5sb2cuYXBwbHkoY29uc29sZSxjKX1lbHNlIHdpbmRvdy5jb25zb2xlJiZjb25zb2xlLmxvZyhcIlBpeGkuanMgXCIrYi5WRVJTSU9OK1wiIC0gaHR0cDovL3d3dy5waXhpanMuY29tL1wiKTtiLmRvbnRTYXlIZWxsbz0hMH19LGIuUG9pbnQ9ZnVuY3Rpb24oYSxiKXt0aGlzLng9YXx8MCx0aGlzLnk9Ynx8MH0sYi5Qb2ludC5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IGIuUG9pbnQodGhpcy54LHRoaXMueSl9LGIuUG9pbnQucHJvdG90eXBlLnNldD1mdW5jdGlvbihhLGIpe3RoaXMueD1hfHwwLHRoaXMueT1ifHwoMCE9PWI/dGhpcy54OjApfSxiLlBvaW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlBvaW50LGIuUmVjdGFuZ2xlPWZ1bmN0aW9uKGEsYixjLGQpe3RoaXMueD1hfHwwLHRoaXMueT1ifHwwLHRoaXMud2lkdGg9Y3x8MCx0aGlzLmhlaWdodD1kfHwwfSxiLlJlY3RhbmdsZS5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IGIuUmVjdGFuZ2xlKHRoaXMueCx0aGlzLnksdGhpcy53aWR0aCx0aGlzLmhlaWdodCl9LGIuUmVjdGFuZ2xlLnByb3RvdHlwZS5jb250YWlucz1mdW5jdGlvbihhLGIpe2lmKHRoaXMud2lkdGg8PTB8fHRoaXMuaGVpZ2h0PD0wKXJldHVybiExO3ZhciBjPXRoaXMueDtpZihhPj1jJiZhPD1jK3RoaXMud2lkdGgpe3ZhciBkPXRoaXMueTtpZihiPj1kJiZiPD1kK3RoaXMuaGVpZ2h0KXJldHVybiEwfXJldHVybiExfSxiLlJlY3RhbmdsZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5SZWN0YW5nbGUsYi5FbXB0eVJlY3RhbmdsZT1uZXcgYi5SZWN0YW5nbGUoMCwwLDAsMCksYi5Qb2x5Z29uPWZ1bmN0aW9uKGEpe2lmKGEgaW5zdGFuY2VvZiBBcnJheXx8KGE9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSksYVswXWluc3RhbmNlb2YgYi5Qb2ludCl7Zm9yKHZhciBjPVtdLGQ9MCxlPWEubGVuZ3RoO2U+ZDtkKyspYy5wdXNoKGFbZF0ueCxhW2RdLnkpO2E9Y310aGlzLmNsb3NlZD0hMCx0aGlzLnBvaW50cz1hfSxiLlBvbHlnb24ucHJvdG90eXBlLmNsb25lPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5wb2ludHMuc2xpY2UoKTtyZXR1cm4gbmV3IGIuUG9seWdvbihhKX0sYi5Qb2x5Z29uLnByb3RvdHlwZS5jb250YWlucz1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz0hMSxkPXRoaXMucG9pbnRzLmxlbmd0aC8yLGU9MCxmPWQtMTtkPmU7Zj1lKyspe3ZhciBnPXRoaXMucG9pbnRzWzIqZV0saD10aGlzLnBvaW50c1syKmUrMV0saT10aGlzLnBvaW50c1syKmZdLGo9dGhpcy5wb2ludHNbMipmKzFdLGs9aD5iIT1qPmImJihpLWcpKihiLWgpLyhqLWgpK2c+YTtrJiYoYz0hYyl9cmV0dXJuIGN9LGIuUG9seWdvbi5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Qb2x5Z29uLGIuQ2lyY2xlPWZ1bmN0aW9uKGEsYixjKXt0aGlzLng9YXx8MCx0aGlzLnk9Ynx8MCx0aGlzLnJhZGl1cz1jfHwwfSxiLkNpcmNsZS5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IGIuQ2lyY2xlKHRoaXMueCx0aGlzLnksdGhpcy5yYWRpdXMpfSxiLkNpcmNsZS5wcm90b3R5cGUuY29udGFpbnM9ZnVuY3Rpb24oYSxiKXtpZih0aGlzLnJhZGl1czw9MClyZXR1cm4hMTt2YXIgYz10aGlzLngtYSxkPXRoaXMueS1iLGU9dGhpcy5yYWRpdXMqdGhpcy5yYWRpdXM7cmV0dXJuIGMqPWMsZCo9ZCxlPj1jK2R9LGIuQ2lyY2xlLnByb3RvdHlwZS5nZXRCb3VuZHM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IGIuUmVjdGFuZ2xlKHRoaXMueC10aGlzLnJhZGl1cyx0aGlzLnktdGhpcy5yYWRpdXMsMip0aGlzLnJhZGl1cywyKnRoaXMucmFkaXVzKX0sYi5DaXJjbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQ2lyY2xlLGIuRWxsaXBzZT1mdW5jdGlvbihhLGIsYyxkKXt0aGlzLng9YXx8MCx0aGlzLnk9Ynx8MCx0aGlzLndpZHRoPWN8fDAsdGhpcy5oZWlnaHQ9ZHx8MH0sYi5FbGxpcHNlLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3JldHVybiBuZXcgYi5FbGxpcHNlKHRoaXMueCx0aGlzLnksdGhpcy53aWR0aCx0aGlzLmhlaWdodCl9LGIuRWxsaXBzZS5wcm90b3R5cGUuY29udGFpbnM9ZnVuY3Rpb24oYSxiKXtpZih0aGlzLndpZHRoPD0wfHx0aGlzLmhlaWdodDw9MClyZXR1cm4hMTt2YXIgYz0oYS10aGlzLngpL3RoaXMud2lkdGgsZD0oYi10aGlzLnkpL3RoaXMuaGVpZ2h0O3JldHVybiBjKj1jLGQqPWQsMT49YytkfSxiLkVsbGlwc2UucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbigpe3JldHVybiBuZXcgYi5SZWN0YW5nbGUodGhpcy54LXRoaXMud2lkdGgsdGhpcy55LXRoaXMuaGVpZ2h0LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpfSxiLkVsbGlwc2UucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuRWxsaXBzZSxiLlJvdW5kZWRSZWN0YW5nbGU9ZnVuY3Rpb24oYSxiLGMsZCxlKXt0aGlzLng9YXx8MCx0aGlzLnk9Ynx8MCx0aGlzLndpZHRoPWN8fDAsdGhpcy5oZWlnaHQ9ZHx8MCx0aGlzLnJhZGl1cz1lfHwyMH0sYi5Sb3VuZGVkUmVjdGFuZ2xlLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3JldHVybiBuZXcgYi5Sb3VuZGVkUmVjdGFuZ2xlKHRoaXMueCx0aGlzLnksdGhpcy53aWR0aCx0aGlzLmhlaWdodCx0aGlzLnJhZGl1cyl9LGIuUm91bmRlZFJlY3RhbmdsZS5wcm90b3R5cGUuY29udGFpbnM9ZnVuY3Rpb24oYSxiKXtpZih0aGlzLndpZHRoPD0wfHx0aGlzLmhlaWdodDw9MClyZXR1cm4hMTt2YXIgYz10aGlzLng7aWYoYT49YyYmYTw9Yyt0aGlzLndpZHRoKXt2YXIgZD10aGlzLnk7aWYoYj49ZCYmYjw9ZCt0aGlzLmhlaWdodClyZXR1cm4hMH1yZXR1cm4hMX0sYi5Sb3VuZGVkUmVjdGFuZ2xlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlJvdW5kZWRSZWN0YW5nbGUsYi5NYXRyaXg9ZnVuY3Rpb24oKXt0aGlzLmE9MSx0aGlzLmI9MCx0aGlzLmM9MCx0aGlzLmQ9MSx0aGlzLnR4PTAsdGhpcy50eT0wfSxiLk1hdHJpeC5wcm90b3R5cGUuZnJvbUFycmF5PWZ1bmN0aW9uKGEpe3RoaXMuYT1hWzBdLHRoaXMuYj1hWzFdLHRoaXMuYz1hWzNdLHRoaXMuZD1hWzRdLHRoaXMudHg9YVsyXSx0aGlzLnR5PWFbNV19LGIuTWF0cml4LnByb3RvdHlwZS50b0FycmF5PWZ1bmN0aW9uKGEpe3RoaXMuYXJyYXl8fCh0aGlzLmFycmF5PW5ldyBiLkZsb2F0MzJBcnJheSg5KSk7dmFyIGM9dGhpcy5hcnJheTtyZXR1cm4gYT8oY1swXT10aGlzLmEsY1sxXT10aGlzLmIsY1syXT0wLGNbM109dGhpcy5jLGNbNF09dGhpcy5kLGNbNV09MCxjWzZdPXRoaXMudHgsY1s3XT10aGlzLnR5LGNbOF09MSk6KGNbMF09dGhpcy5hLGNbMV09dGhpcy5jLGNbMl09dGhpcy50eCxjWzNdPXRoaXMuYixjWzRdPXRoaXMuZCxjWzVdPXRoaXMudHksY1s2XT0wLGNbN109MCxjWzhdPTEpLGN9LGIuTWF0cml4LnByb3RvdHlwZS5hcHBseT1mdW5jdGlvbihhLGMpe3JldHVybiBjPWN8fG5ldyBiLlBvaW50LGMueD10aGlzLmEqYS54K3RoaXMuYyphLnkrdGhpcy50eCxjLnk9dGhpcy5iKmEueCt0aGlzLmQqYS55K3RoaXMudHksY30sYi5NYXRyaXgucHJvdG90eXBlLmFwcGx5SW52ZXJzZT1mdW5jdGlvbihhLGMpe2M9Y3x8bmV3IGIuUG9pbnQ7dmFyIGQ9MS8odGhpcy5hKnRoaXMuZCt0aGlzLmMqLXRoaXMuYik7cmV0dXJuIGMueD10aGlzLmQqZCphLngrLXRoaXMuYypkKmEueSsodGhpcy50eSp0aGlzLmMtdGhpcy50eCp0aGlzLmQpKmQsYy55PXRoaXMuYSpkKmEueSstdGhpcy5iKmQqYS54KygtdGhpcy50eSp0aGlzLmErdGhpcy50eCp0aGlzLmIpKmQsY30sYi5NYXRyaXgucHJvdG90eXBlLnRyYW5zbGF0ZT1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLnR4Kz1hLHRoaXMudHkrPWIsdGhpc30sYi5NYXRyaXgucHJvdG90eXBlLnNjYWxlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuYSo9YSx0aGlzLmQqPWIsdGhpcy5jKj1hLHRoaXMuYio9Yix0aGlzLnR4Kj1hLHRoaXMudHkqPWIsdGhpc30sYi5NYXRyaXgucHJvdG90eXBlLnJvdGF0ZT1mdW5jdGlvbihhKXt2YXIgYj1NYXRoLmNvcyhhKSxjPU1hdGguc2luKGEpLGQ9dGhpcy5hLGU9dGhpcy5jLGY9dGhpcy50eDtyZXR1cm4gdGhpcy5hPWQqYi10aGlzLmIqYyx0aGlzLmI9ZCpjK3RoaXMuYipiLHRoaXMuYz1lKmItdGhpcy5kKmMsdGhpcy5kPWUqYyt0aGlzLmQqYix0aGlzLnR4PWYqYi10aGlzLnR5KmMsdGhpcy50eT1mKmMrdGhpcy50eSpiLHRoaXN9LGIuTWF0cml4LnByb3RvdHlwZS5hcHBlbmQ9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5hLGM9dGhpcy5iLGQ9dGhpcy5jLGU9dGhpcy5kO3JldHVybiB0aGlzLmE9YS5hKmIrYS5iKmQsdGhpcy5iPWEuYSpjK2EuYiplLHRoaXMuYz1hLmMqYithLmQqZCx0aGlzLmQ9YS5jKmMrYS5kKmUsdGhpcy50eD1hLnR4KmIrYS50eSpkK3RoaXMudHgsdGhpcy50eT1hLnR4KmMrYS50eSplK3RoaXMudHksdGhpc30sYi5NYXRyaXgucHJvdG90eXBlLmlkZW50aXR5PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYT0xLHRoaXMuYj0wLHRoaXMuYz0wLHRoaXMuZD0xLHRoaXMudHg9MCx0aGlzLnR5PTAsdGhpc30sYi5pZGVudGl0eU1hdHJpeD1uZXcgYi5NYXRyaXgsYi5EaXNwbGF5T2JqZWN0PWZ1bmN0aW9uKCl7dGhpcy5wb3NpdGlvbj1uZXcgYi5Qb2ludCx0aGlzLnNjYWxlPW5ldyBiLlBvaW50KDEsMSksdGhpcy5waXZvdD1uZXcgYi5Qb2ludCgwLDApLHRoaXMucm90YXRpb249MCx0aGlzLmFscGhhPTEsdGhpcy52aXNpYmxlPSEwLHRoaXMuaGl0QXJlYT1udWxsLHRoaXMuYnV0dG9uTW9kZT0hMSx0aGlzLnJlbmRlcmFibGU9ITEsdGhpcy5wYXJlbnQ9bnVsbCx0aGlzLnN0YWdlPW51bGwsdGhpcy53b3JsZEFscGhhPTEsdGhpcy5faW50ZXJhY3RpdmU9ITEsdGhpcy5kZWZhdWx0Q3Vyc29yPVwicG9pbnRlclwiLHRoaXMud29ybGRUcmFuc2Zvcm09bmV3IGIuTWF0cml4LHRoaXMuX3NyPTAsdGhpcy5fY3I9MSx0aGlzLmZpbHRlckFyZWE9bnVsbCx0aGlzLl9ib3VuZHM9bmV3IGIuUmVjdGFuZ2xlKDAsMCwxLDEpLHRoaXMuX2N1cnJlbnRCb3VuZHM9bnVsbCx0aGlzLl9tYXNrPW51bGwsdGhpcy5fY2FjaGVBc0JpdG1hcD0hMSx0aGlzLl9jYWNoZUlzRGlydHk9ITF9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5EaXNwbGF5T2JqZWN0LE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLFwiaW50ZXJhY3RpdmVcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5faW50ZXJhY3RpdmU9YSx0aGlzLnN0YWdlJiYodGhpcy5zdGFnZS5kaXJ0eT0hMCl9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUsXCJ3b3JsZFZpc2libGVcIix7Z2V0OmZ1bmN0aW9uKCl7dmFyIGE9dGhpcztkb3tpZighYS52aXNpYmxlKXJldHVybiExO2E9YS5wYXJlbnR9d2hpbGUoYSk7cmV0dXJuITB9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUsXCJtYXNrXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9tYXNrfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5fbWFzayYmKHRoaXMuX21hc2suaXNNYXNrPSExKSx0aGlzLl9tYXNrPWEsdGhpcy5fbWFzayYmKHRoaXMuX21hc2suaXNNYXNrPSEwKX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZSxcImZpbHRlcnNcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2ZpbHRlcnN9LHNldDpmdW5jdGlvbihhKXtpZihhKXtmb3IodmFyIGI9W10sYz0wO2M8YS5sZW5ndGg7YysrKWZvcih2YXIgZD1hW2NdLnBhc3NlcyxlPTA7ZTxkLmxlbmd0aDtlKyspYi5wdXNoKGRbZV0pO3RoaXMuX2ZpbHRlckJsb2NrPXt0YXJnZXQ6dGhpcyxmaWx0ZXJQYXNzZXM6Yn19dGhpcy5fZmlsdGVycz1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLFwiY2FjaGVBc0JpdG1hcFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY2FjaGVBc0JpdG1hcH0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuX2NhY2hlQXNCaXRtYXAhPT1hJiYoYT90aGlzLl9nZW5lcmF0ZUNhY2hlZFNwcml0ZSgpOnRoaXMuX2Rlc3Ryb3lDYWNoZWRTcHJpdGUoKSx0aGlzLl9jYWNoZUFzQml0bWFwPWEpfX0pLGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtPWZ1bmN0aW9uKCl7dmFyIGEsYyxkLGUsZixnLGg9dGhpcy5wYXJlbnQud29ybGRUcmFuc2Zvcm0saT10aGlzLndvcmxkVHJhbnNmb3JtO3RoaXMucm90YXRpb24lYi5QSV8yPyh0aGlzLnJvdGF0aW9uIT09dGhpcy5yb3RhdGlvbkNhY2hlJiYodGhpcy5yb3RhdGlvbkNhY2hlPXRoaXMucm90YXRpb24sdGhpcy5fc3I9TWF0aC5zaW4odGhpcy5yb3RhdGlvbiksdGhpcy5fY3I9TWF0aC5jb3ModGhpcy5yb3RhdGlvbikpLGE9dGhpcy5fY3IqdGhpcy5zY2FsZS54LGM9dGhpcy5fc3IqdGhpcy5zY2FsZS54LGQ9LXRoaXMuX3NyKnRoaXMuc2NhbGUueSxlPXRoaXMuX2NyKnRoaXMuc2NhbGUueSxmPXRoaXMucG9zaXRpb24ueCxnPXRoaXMucG9zaXRpb24ueSwodGhpcy5waXZvdC54fHx0aGlzLnBpdm90LnkpJiYoZi09dGhpcy5waXZvdC54KmErdGhpcy5waXZvdC55KmQsZy09dGhpcy5waXZvdC54KmMrdGhpcy5waXZvdC55KmUpLGkuYT1hKmguYStjKmguYyxpLmI9YSpoLmIrYypoLmQsaS5jPWQqaC5hK2UqaC5jLGkuZD1kKmguYitlKmguZCxpLnR4PWYqaC5hK2cqaC5jK2gudHgsaS50eT1mKmguYitnKmguZCtoLnR5KTooYT10aGlzLnNjYWxlLngsZT10aGlzLnNjYWxlLnksZj10aGlzLnBvc2l0aW9uLngtdGhpcy5waXZvdC54KmEsZz10aGlzLnBvc2l0aW9uLnktdGhpcy5waXZvdC55KmUsaS5hPWEqaC5hLGkuYj1hKmguYixpLmM9ZSpoLmMsaS5kPWUqaC5kLGkudHg9ZipoLmErZypoLmMraC50eCxpLnR5PWYqaC5iK2cqaC5kK2gudHkpLHRoaXMud29ybGRBbHBoYT10aGlzLmFscGhhKnRoaXMucGFyZW50LndvcmxkQWxwaGF9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuZGlzcGxheU9iamVjdFVwZGF0ZVRyYW5zZm9ybT1iLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbihhKXtyZXR1cm4gYT1hLGIuRW1wdHlSZWN0YW5nbGV9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuZ2V0TG9jYWxCb3VuZHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXRCb3VuZHMoYi5pZGVudGl0eU1hdHJpeCl9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuc2V0U3RhZ2VSZWZlcmVuY2U9ZnVuY3Rpb24oYSl7dGhpcy5zdGFnZT1hLHRoaXMuX2ludGVyYWN0aXZlJiYodGhpcy5zdGFnZS5kaXJ0eT0hMCl9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuZ2VuZXJhdGVUZXh0dXJlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZT10aGlzLmdldExvY2FsQm91bmRzKCksZj1uZXcgYi5SZW5kZXJUZXh0dXJlKDB8ZS53aWR0aCwwfGUuaGVpZ2h0LGQsYyxhKTtyZXR1cm4gYi5EaXNwbGF5T2JqZWN0Ll90ZW1wTWF0cml4LnR4PS1lLngsYi5EaXNwbGF5T2JqZWN0Ll90ZW1wTWF0cml4LnR5PS1lLnksZi5yZW5kZXIodGhpcyxiLkRpc3BsYXlPYmplY3QuX3RlbXBNYXRyaXgpLGZ9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUudXBkYXRlQ2FjaGU9ZnVuY3Rpb24oKXt0aGlzLl9nZW5lcmF0ZUNhY2hlZFNwcml0ZSgpfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnRvR2xvYmFsPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpLHRoaXMud29ybGRUcmFuc2Zvcm0uYXBwbHkoYSl9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUudG9Mb2NhbD1mdW5jdGlvbihhLGIpe3JldHVybiBiJiYoYT1iLnRvR2xvYmFsKGEpKSx0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpLHRoaXMud29ybGRUcmFuc2Zvcm0uYXBwbHlJbnZlcnNlKGEpfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLl9yZW5kZXJDYWNoZWRTcHJpdGU9ZnVuY3Rpb24oYSl7dGhpcy5fY2FjaGVkU3ByaXRlLndvcmxkQWxwaGE9dGhpcy53b3JsZEFscGhhLGEuZ2w/Yi5TcHJpdGUucHJvdG90eXBlLl9yZW5kZXJXZWJHTC5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSxhKTpiLlNwcml0ZS5wcm90b3R5cGUuX3JlbmRlckNhbnZhcy5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSxhKX0sYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5fZ2VuZXJhdGVDYWNoZWRTcHJpdGU9ZnVuY3Rpb24oKXt0aGlzLl9jYWNoZUFzQml0bWFwPSExO3ZhciBhPXRoaXMuZ2V0TG9jYWxCb3VuZHMoKTtpZih0aGlzLl9jYWNoZWRTcHJpdGUpdGhpcy5fY2FjaGVkU3ByaXRlLnRleHR1cmUucmVzaXplKDB8YS53aWR0aCwwfGEuaGVpZ2h0KTtlbHNle3ZhciBjPW5ldyBiLlJlbmRlclRleHR1cmUoMHxhLndpZHRoLDB8YS5oZWlnaHQpO3RoaXMuX2NhY2hlZFNwcml0ZT1uZXcgYi5TcHJpdGUoYyksdGhpcy5fY2FjaGVkU3ByaXRlLndvcmxkVHJhbnNmb3JtPXRoaXMud29ybGRUcmFuc2Zvcm19dmFyIGQ9dGhpcy5fZmlsdGVyczt0aGlzLl9maWx0ZXJzPW51bGwsdGhpcy5fY2FjaGVkU3ByaXRlLmZpbHRlcnM9ZCxiLkRpc3BsYXlPYmplY3QuX3RlbXBNYXRyaXgudHg9LWEueCxiLkRpc3BsYXlPYmplY3QuX3RlbXBNYXRyaXgudHk9LWEueSx0aGlzLl9jYWNoZWRTcHJpdGUudGV4dHVyZS5yZW5kZXIodGhpcyxiLkRpc3BsYXlPYmplY3QuX3RlbXBNYXRyaXgpLHRoaXMuX2NhY2hlZFNwcml0ZS5hbmNob3IueD0tKGEueC9hLndpZHRoKSx0aGlzLl9jYWNoZWRTcHJpdGUuYW5jaG9yLnk9LShhLnkvYS5oZWlnaHQpLHRoaXMuX2ZpbHRlcnM9ZCx0aGlzLl9jYWNoZUFzQml0bWFwPSEwfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLl9kZXN0cm95Q2FjaGVkU3ByaXRlPWZ1bmN0aW9uKCl7dGhpcy5fY2FjaGVkU3ByaXRlJiYodGhpcy5fY2FjaGVkU3ByaXRlLnRleHR1cmUuZGVzdHJveSghMCksdGhpcy5fY2FjaGVkU3ByaXRlPW51bGwpfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXthPWF9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuX3JlbmRlckNhbnZhcz1mdW5jdGlvbihhKXthPWF9LGIuRGlzcGxheU9iamVjdC5fdGVtcE1hdHJpeD1uZXcgYi5NYXRyaXgsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUsXCJ4XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBvc2l0aW9uLnh9LHNldDpmdW5jdGlvbihhKXt0aGlzLnBvc2l0aW9uLng9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZSxcInlcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucG9zaXRpb24ueX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMucG9zaXRpb24ueT1hfX0pLGIuRGlzcGxheU9iamVjdENvbnRhaW5lcj1mdW5jdGlvbigpe2IuRGlzcGxheU9iamVjdC5jYWxsKHRoaXMpLHRoaXMuY2hpbGRyZW49W119LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlKSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuRGlzcGxheU9iamVjdENvbnRhaW5lcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZSxcIndpZHRoXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnNjYWxlLngqdGhpcy5nZXRMb2NhbEJvdW5kcygpLndpZHRofSxzZXQ6ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5nZXRMb2NhbEJvdW5kcygpLndpZHRoO3RoaXMuc2NhbGUueD0wIT09Yj9hL2I6MSx0aGlzLl93aWR0aD1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLFwiaGVpZ2h0XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnNjYWxlLnkqdGhpcy5nZXRMb2NhbEJvdW5kcygpLmhlaWdodH0sc2V0OmZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQ7dGhpcy5zY2FsZS55PTAhPT1iP2EvYjoxLHRoaXMuX2hlaWdodD1hfX0pLGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuYWRkQ2hpbGQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuYWRkQ2hpbGRBdChhLHRoaXMuY2hpbGRyZW4ubGVuZ3RoKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5hZGRDaGlsZEF0PWZ1bmN0aW9uKGEsYil7aWYoYj49MCYmYjw9dGhpcy5jaGlsZHJlbi5sZW5ndGgpcmV0dXJuIGEucGFyZW50JiZhLnBhcmVudC5yZW1vdmVDaGlsZChhKSxhLnBhcmVudD10aGlzLHRoaXMuY2hpbGRyZW4uc3BsaWNlKGIsMCxhKSx0aGlzLnN0YWdlJiZhLnNldFN0YWdlUmVmZXJlbmNlKHRoaXMuc3RhZ2UpLGE7dGhyb3cgbmV3IEVycm9yKGErXCJhZGRDaGlsZEF0OiBUaGUgaW5kZXggXCIrYitcIiBzdXBwbGllZCBpcyBvdXQgb2YgYm91bmRzIFwiK3RoaXMuY2hpbGRyZW4ubGVuZ3RoKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5zd2FwQ2hpbGRyZW49ZnVuY3Rpb24oYSxiKXtpZihhIT09Yil7dmFyIGM9dGhpcy5nZXRDaGlsZEluZGV4KGEpLGQ9dGhpcy5nZXRDaGlsZEluZGV4KGIpO2lmKDA+Y3x8MD5kKXRocm93IG5ldyBFcnJvcihcInN3YXBDaGlsZHJlbjogQm90aCB0aGUgc3VwcGxpZWQgRGlzcGxheU9iamVjdHMgbXVzdCBiZSBhIGNoaWxkIG9mIHRoZSBjYWxsZXIuXCIpO3RoaXMuY2hpbGRyZW5bY109Yix0aGlzLmNoaWxkcmVuW2RdPWF9fSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLmdldENoaWxkSW5kZXg9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5jaGlsZHJlbi5pbmRleE9mKGEpO2lmKC0xPT09Yil0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgRGlzcGxheU9iamVjdCBtdXN0IGJlIGEgY2hpbGQgb2YgdGhlIGNhbGxlclwiKTtyZXR1cm4gYn0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5zZXRDaGlsZEluZGV4PWZ1bmN0aW9uKGEsYil7aWYoMD5ifHxiPj10aGlzLmNoaWxkcmVuLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgaW5kZXggaXMgb3V0IG9mIGJvdW5kc1wiKTt2YXIgYz10aGlzLmdldENoaWxkSW5kZXgoYSk7dGhpcy5jaGlsZHJlbi5zcGxpY2UoYywxKSx0aGlzLmNoaWxkcmVuLnNwbGljZShiLDAsYSl9LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuZ2V0Q2hpbGRBdD1mdW5jdGlvbihhKXtpZigwPmF8fGE+PXRoaXMuY2hpbGRyZW4ubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcImdldENoaWxkQXQ6IFN1cHBsaWVkIGluZGV4IFwiK2ErXCIgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGNoaWxkIGxpc3QsIG9yIHRoZSBzdXBwbGllZCBEaXNwbGF5T2JqZWN0IG11c3QgYmUgYSBjaGlsZCBvZiB0aGUgY2FsbGVyXCIpO3JldHVybiB0aGlzLmNoaWxkcmVuW2FdfSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLnJlbW92ZUNoaWxkPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuY2hpbGRyZW4uaW5kZXhPZihhKTtpZigtMSE9PWIpcmV0dXJuIHRoaXMucmVtb3ZlQ2hpbGRBdChiKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5yZW1vdmVDaGlsZEF0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuZ2V0Q2hpbGRBdChhKTtyZXR1cm4gdGhpcy5zdGFnZSYmYi5yZW1vdmVTdGFnZVJlZmVyZW5jZSgpLGIucGFyZW50PXZvaWQgMCx0aGlzLmNoaWxkcmVuLnNwbGljZShhLDEpLGJ9LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUucmVtb3ZlQ2hpbGRyZW49ZnVuY3Rpb24oYSxiKXt2YXIgYz1hfHwwLGQ9XCJudW1iZXJcIj09dHlwZW9mIGI/Yjp0aGlzLmNoaWxkcmVuLmxlbmd0aCxlPWQtYztpZihlPjAmJmQ+PWUpe2Zvcih2YXIgZj10aGlzLmNoaWxkcmVuLnNwbGljZShjLGUpLGc9MDtnPGYubGVuZ3RoO2crKyl7dmFyIGg9ZltnXTt0aGlzLnN0YWdlJiZoLnJlbW92ZVN0YWdlUmVmZXJlbmNlKCksaC5wYXJlbnQ9dm9pZCAwfXJldHVybiBmfWlmKDA9PT1lJiYwPT09dGhpcy5jaGlsZHJlbi5sZW5ndGgpcmV0dXJuW107dGhyb3cgbmV3IEVycm9yKFwicmVtb3ZlQ2hpbGRyZW46IFJhbmdlIEVycm9yLCBudW1lcmljIHZhbHVlcyBhcmUgb3V0c2lkZSB0aGUgYWNjZXB0YWJsZSByYW5nZVwiKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm09ZnVuY3Rpb24oKXtpZih0aGlzLnZpc2libGUmJih0aGlzLmRpc3BsYXlPYmplY3RVcGRhdGVUcmFuc2Zvcm0oKSwhdGhpcy5fY2FjaGVBc0JpdG1hcCkpZm9yKHZhciBhPTAsYj10aGlzLmNoaWxkcmVuLmxlbmd0aDtiPmE7YSsrKXRoaXMuY2hpbGRyZW5bYV0udXBkYXRlVHJhbnNmb3JtKCl9LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuZGlzcGxheU9iamVjdENvbnRhaW5lclVwZGF0ZVRyYW5zZm9ybT1iLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbigpe2lmKDA9PT10aGlzLmNoaWxkcmVuLmxlbmd0aClyZXR1cm4gYi5FbXB0eVJlY3RhbmdsZTtmb3IodmFyIGEsYyxkLGU9MS8wLGY9MS8wLGc9LTEvMCxoPS0xLzAsaT0hMSxqPTAsaz10aGlzLmNoaWxkcmVuLmxlbmd0aDtrPmo7aisrKXt2YXIgbD10aGlzLmNoaWxkcmVuW2pdO2wudmlzaWJsZSYmKGk9ITAsYT10aGlzLmNoaWxkcmVuW2pdLmdldEJvdW5kcygpLGU9ZTxhLng/ZTphLngsZj1mPGEueT9mOmEueSxjPWEud2lkdGgrYS54LGQ9YS5oZWlnaHQrYS55LGc9Zz5jP2c6YyxoPWg+ZD9oOmQpfWlmKCFpKXJldHVybiBiLkVtcHR5UmVjdGFuZ2xlO3ZhciBtPXRoaXMuX2JvdW5kcztyZXR1cm4gbS54PWUsbS55PWYsbS53aWR0aD1nLWUsbS5oZWlnaHQ9aC1mLG19LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuZ2V0TG9jYWxCb3VuZHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLndvcmxkVHJhbnNmb3JtO3RoaXMud29ybGRUcmFuc2Zvcm09Yi5pZGVudGl0eU1hdHJpeDtmb3IodmFyIGM9MCxkPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2Q+YztjKyspdGhpcy5jaGlsZHJlbltjXS51cGRhdGVUcmFuc2Zvcm0oKTt2YXIgZT10aGlzLmdldEJvdW5kcygpO3JldHVybiB0aGlzLndvcmxkVHJhbnNmb3JtPWEsZX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5zZXRTdGFnZVJlZmVyZW5jZT1mdW5jdGlvbihhKXt0aGlzLnN0YWdlPWEsdGhpcy5faW50ZXJhY3RpdmUmJih0aGlzLnN0YWdlLmRpcnR5PSEwKTtmb3IodmFyIGI9MCxjPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2M+YjtiKyspe3ZhciBkPXRoaXMuY2hpbGRyZW5bYl07ZC5zZXRTdGFnZVJlZmVyZW5jZShhKX19LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUucmVtb3ZlU3RhZ2VSZWZlcmVuY2U9ZnVuY3Rpb24oKXtmb3IodmFyIGE9MCxiPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2I+YTthKyspe3ZhciBjPXRoaXMuY2hpbGRyZW5bYV07Yy5yZW1vdmVTdGFnZVJlZmVyZW5jZSgpfXRoaXMuX2ludGVyYWN0aXZlJiYodGhpcy5zdGFnZS5kaXJ0eT0hMCksdGhpcy5zdGFnZT1udWxsfSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXtpZih0aGlzLnZpc2libGUmJiEodGhpcy5hbHBoYTw9MCkpe2lmKHRoaXMuX2NhY2hlQXNCaXRtYXApcmV0dXJuIHRoaXMuX3JlbmRlckNhY2hlZFNwcml0ZShhKSx2b2lkIDA7dmFyIGIsYztpZih0aGlzLl9tYXNrfHx0aGlzLl9maWx0ZXJzKXtmb3IodGhpcy5fZmlsdGVycyYmKGEuc3ByaXRlQmF0Y2guZmx1c2goKSxhLmZpbHRlck1hbmFnZXIucHVzaEZpbHRlcih0aGlzLl9maWx0ZXJCbG9jaykpLHRoaXMuX21hc2smJihhLnNwcml0ZUJhdGNoLnN0b3AoKSxhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMubWFzayxhKSxhLnNwcml0ZUJhdGNoLnN0YXJ0KCkpLGI9MCxjPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2M+YjtiKyspdGhpcy5jaGlsZHJlbltiXS5fcmVuZGVyV2ViR0woYSk7YS5zcHJpdGVCYXRjaC5zdG9wKCksdGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKHRoaXMuX21hc2ssYSksdGhpcy5fZmlsdGVycyYmYS5maWx0ZXJNYW5hZ2VyLnBvcEZpbHRlcigpLGEuc3ByaXRlQmF0Y2guc3RhcnQoKX1lbHNlIGZvcihiPTAsYz10aGlzLmNoaWxkcmVuLmxlbmd0aDtjPmI7YisrKXRoaXMuY2hpbGRyZW5bYl0uX3JlbmRlcldlYkdMKGEpfX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzPWZ1bmN0aW9uKGEpe2lmKHRoaXMudmlzaWJsZSE9PSExJiYwIT09dGhpcy5hbHBoYSl7aWYodGhpcy5fY2FjaGVBc0JpdG1hcClyZXR1cm4gdGhpcy5fcmVuZGVyQ2FjaGVkU3ByaXRlKGEpLHZvaWQgMDt0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMuX21hc2ssYSk7Zm9yKHZhciBiPTAsYz10aGlzLmNoaWxkcmVuLmxlbmd0aDtjPmI7YisrKXt2YXIgZD10aGlzLmNoaWxkcmVuW2JdO2QuX3JlbmRlckNhbnZhcyhhKX10aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnBvcE1hc2soYSl9fSxiLlNwcml0ZT1mdW5jdGlvbihhKXtiLkRpc3BsYXlPYmplY3RDb250YWluZXIuY2FsbCh0aGlzKSx0aGlzLmFuY2hvcj1uZXcgYi5Qb2ludCx0aGlzLnRleHR1cmU9YSx0aGlzLl93aWR0aD0wLHRoaXMuX2hlaWdodD0wLHRoaXMudGludD0xNjc3NzIxNSx0aGlzLmJsZW5kTW9kZT1iLmJsZW5kTW9kZXMuTk9STUFMLHRoaXMuc2hhZGVyPW51bGwsYS5iYXNlVGV4dHVyZS5oYXNMb2FkZWQ/dGhpcy5vblRleHR1cmVVcGRhdGUoKTp0aGlzLnRleHR1cmUub24oXCJ1cGRhdGVcIix0aGlzLm9uVGV4dHVyZVVwZGF0ZS5iaW5kKHRoaXMpKSx0aGlzLnJlbmRlcmFibGU9ITB9LGIuU3ByaXRlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpLGIuU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlNwcml0ZSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5TcHJpdGUucHJvdG90eXBlLFwid2lkdGhcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2NhbGUueCp0aGlzLnRleHR1cmUuZnJhbWUud2lkdGh9LHNldDpmdW5jdGlvbihhKXt0aGlzLnNjYWxlLng9YS90aGlzLnRleHR1cmUuZnJhbWUud2lkdGgsdGhpcy5fd2lkdGg9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5TcHJpdGUucHJvdG90eXBlLFwiaGVpZ2h0XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnNjYWxlLnkqdGhpcy50ZXh0dXJlLmZyYW1lLmhlaWdodH0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuc2NhbGUueT1hL3RoaXMudGV4dHVyZS5mcmFtZS5oZWlnaHQsdGhpcy5faGVpZ2h0PWF9fSksYi5TcHJpdGUucHJvdG90eXBlLnNldFRleHR1cmU9ZnVuY3Rpb24oYSl7dGhpcy50ZXh0dXJlPWEsdGhpcy5jYWNoZWRUaW50PTE2Nzc3MjE1fSxiLlNwcml0ZS5wcm90b3R5cGUub25UZXh0dXJlVXBkYXRlPWZ1bmN0aW9uKCl7dGhpcy5fd2lkdGgmJih0aGlzLnNjYWxlLng9dGhpcy5fd2lkdGgvdGhpcy50ZXh0dXJlLmZyYW1lLndpZHRoKSx0aGlzLl9oZWlnaHQmJih0aGlzLnNjYWxlLnk9dGhpcy5faGVpZ2h0L3RoaXMudGV4dHVyZS5mcmFtZS5oZWlnaHQpfSxiLlNwcml0ZS5wcm90b3R5cGUuZ2V0Qm91bmRzPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMudGV4dHVyZS5mcmFtZS53aWR0aCxjPXRoaXMudGV4dHVyZS5mcmFtZS5oZWlnaHQsZD1iKigxLXRoaXMuYW5jaG9yLngpLGU9YiotdGhpcy5hbmNob3IueCxmPWMqKDEtdGhpcy5hbmNob3IueSksZz1jKi10aGlzLmFuY2hvci55LGg9YXx8dGhpcy53b3JsZFRyYW5zZm9ybSxpPWguYSxqPWguYixrPWguYyxsPWguZCxtPWgudHgsbj1oLnR5LG89aSplK2sqZyttLHA9bCpnK2oqZStuLHE9aSpkK2sqZyttLHI9bCpnK2oqZCtuLHM9aSpkK2sqZittLHQ9bCpmK2oqZCtuLHU9aSplK2sqZittLHY9bCpmK2oqZStuLHc9LTEvMCx4PS0xLzAseT0xLzAsej0xLzA7eT15Pm8/bzp5LHk9eT5xP3E6eSx5PXk+cz9zOnkseT15PnU/dTp5LHo9ej5wP3A6eix6PXo+cj9yOnosej16PnQ/dDp6LHo9ej52P3Y6eix3PW8+dz9vOncsdz1xPnc/cTp3LHc9cz53P3M6dyx3PXU+dz91OncseD1wPng/cDp4LHg9cj54P3I6eCx4PXQ+eD90OngseD12Png/djp4O3ZhciBBPXRoaXMuX2JvdW5kcztyZXR1cm4gQS54PXksQS53aWR0aD13LXksQS55PXosQS5oZWlnaHQ9eC16LHRoaXMuX2N1cnJlbnRCb3VuZHM9QSxBfSxiLlNwcml0ZS5wcm90b3R5cGUuX3JlbmRlcldlYkdMPWZ1bmN0aW9uKGEpe2lmKHRoaXMudmlzaWJsZSYmISh0aGlzLmFscGhhPD0wKSl7dmFyIGIsYztpZih0aGlzLl9tYXNrfHx0aGlzLl9maWx0ZXJzKXt2YXIgZD1hLnNwcml0ZUJhdGNoO2Zvcih0aGlzLl9maWx0ZXJzJiYoZC5mbHVzaCgpLGEuZmlsdGVyTWFuYWdlci5wdXNoRmlsdGVyKHRoaXMuX2ZpbHRlckJsb2NrKSksdGhpcy5fbWFzayYmKGQuc3RvcCgpLGEubWFza01hbmFnZXIucHVzaE1hc2sodGhpcy5tYXNrLGEpLGQuc3RhcnQoKSksZC5yZW5kZXIodGhpcyksYj0wLGM9dGhpcy5jaGlsZHJlbi5sZW5ndGg7Yz5iO2IrKyl0aGlzLmNoaWxkcmVuW2JdLl9yZW5kZXJXZWJHTChhKTtkLnN0b3AoKSx0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnBvcE1hc2sodGhpcy5fbWFzayxhKSx0aGlzLl9maWx0ZXJzJiZhLmZpbHRlck1hbmFnZXIucG9wRmlsdGVyKCksZC5zdGFydCgpfWVsc2UgZm9yKGEuc3ByaXRlQmF0Y2gucmVuZGVyKHRoaXMpLGI9MCxjPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2M+YjtiKyspdGhpcy5jaGlsZHJlbltiXS5fcmVuZGVyV2ViR0woYSl9fSxiLlNwcml0ZS5wcm90b3R5cGUuX3JlbmRlckNhbnZhcz1mdW5jdGlvbihhKXtpZighKHRoaXMudmlzaWJsZT09PSExfHwwPT09dGhpcy5hbHBoYXx8dGhpcy50ZXh0dXJlLmNyb3Aud2lkdGg8PTB8fHRoaXMudGV4dHVyZS5jcm9wLmhlaWdodDw9MCkpe2lmKHRoaXMuYmxlbmRNb2RlIT09YS5jdXJyZW50QmxlbmRNb2RlJiYoYS5jdXJyZW50QmxlbmRNb2RlPXRoaXMuYmxlbmRNb2RlLGEuY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249Yi5ibGVuZE1vZGVzQ2FudmFzW2EuY3VycmVudEJsZW5kTW9kZV0pLHRoaXMuX21hc2smJmEubWFza01hbmFnZXIucHVzaE1hc2sodGhpcy5fbWFzayxhKSx0aGlzLnRleHR1cmUudmFsaWQpe3ZhciBjPXRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5yZXNvbHV0aW9uL2EucmVzb2x1dGlvbjthLmNvbnRleHQuZ2xvYmFsQWxwaGE9dGhpcy53b3JsZEFscGhhLGEucm91bmRQaXhlbHM/YS5jb250ZXh0LnNldFRyYW5zZm9ybSh0aGlzLndvcmxkVHJhbnNmb3JtLmEsdGhpcy53b3JsZFRyYW5zZm9ybS5iLHRoaXMud29ybGRUcmFuc2Zvcm0uYyx0aGlzLndvcmxkVHJhbnNmb3JtLmQsdGhpcy53b3JsZFRyYW5zZm9ybS50eCphLnJlc29sdXRpb258MCx0aGlzLndvcmxkVHJhbnNmb3JtLnR5KmEucmVzb2x1dGlvbnwwKTphLmNvbnRleHQuc2V0VHJhbnNmb3JtKHRoaXMud29ybGRUcmFuc2Zvcm0uYSx0aGlzLndvcmxkVHJhbnNmb3JtLmIsdGhpcy53b3JsZFRyYW5zZm9ybS5jLHRoaXMud29ybGRUcmFuc2Zvcm0uZCx0aGlzLndvcmxkVHJhbnNmb3JtLnR4KmEucmVzb2x1dGlvbix0aGlzLndvcmxkVHJhbnNmb3JtLnR5KmEucmVzb2x1dGlvbiksYS5zbW9vdGhQcm9wZXJ0eSYmYS5zY2FsZU1vZGUhPT10aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlJiYoYS5zY2FsZU1vZGU9dGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSxhLmNvbnRleHRbYS5zbW9vdGhQcm9wZXJ0eV09YS5zY2FsZU1vZGU9PT1iLnNjYWxlTW9kZXMuTElORUFSKTt2YXIgZD10aGlzLnRleHR1cmUudHJpbT90aGlzLnRleHR1cmUudHJpbS54LXRoaXMuYW5jaG9yLngqdGhpcy50ZXh0dXJlLnRyaW0ud2lkdGg6dGhpcy5hbmNob3IueCotdGhpcy50ZXh0dXJlLmZyYW1lLndpZHRoLGU9dGhpcy50ZXh0dXJlLnRyaW0/dGhpcy50ZXh0dXJlLnRyaW0ueS10aGlzLmFuY2hvci55KnRoaXMudGV4dHVyZS50cmltLmhlaWdodDp0aGlzLmFuY2hvci55Ki10aGlzLnRleHR1cmUuZnJhbWUuaGVpZ2h0OzE2Nzc3MjE1IT09dGhpcy50aW50Pyh0aGlzLmNhY2hlZFRpbnQhPT10aGlzLnRpbnQmJih0aGlzLmNhY2hlZFRpbnQ9dGhpcy50aW50LHRoaXMudGludGVkVGV4dHVyZT1iLkNhbnZhc1RpbnRlci5nZXRUaW50ZWRUZXh0dXJlKHRoaXMsdGhpcy50aW50KSksYS5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLnRpbnRlZFRleHR1cmUsMCwwLHRoaXMudGV4dHVyZS5jcm9wLndpZHRoLHRoaXMudGV4dHVyZS5jcm9wLmhlaWdodCxkL2MsZS9jLHRoaXMudGV4dHVyZS5jcm9wLndpZHRoL2MsdGhpcy50ZXh0dXJlLmNyb3AuaGVpZ2h0L2MpKTphLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2UsdGhpcy50ZXh0dXJlLmNyb3AueCx0aGlzLnRleHR1cmUuY3JvcC55LHRoaXMudGV4dHVyZS5jcm9wLndpZHRoLHRoaXMudGV4dHVyZS5jcm9wLmhlaWdodCxkL2MsZS9jLHRoaXMudGV4dHVyZS5jcm9wLndpZHRoL2MsdGhpcy50ZXh0dXJlLmNyb3AuaGVpZ2h0L2MpfWZvcih2YXIgZj0wLGc9dGhpcy5jaGlsZHJlbi5sZW5ndGg7Zz5mO2YrKyl0aGlzLmNoaWxkcmVuW2ZdLl9yZW5kZXJDYW52YXMoYSk7dGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKGEpfX0sYi5TcHJpdGUuZnJvbUZyYW1lPWZ1bmN0aW9uKGEpe3ZhciBjPWIuVGV4dHVyZUNhY2hlW2FdO2lmKCFjKXRocm93IG5ldyBFcnJvcignVGhlIGZyYW1lSWQgXCInK2ErJ1wiIGRvZXMgbm90IGV4aXN0IGluIHRoZSB0ZXh0dXJlIGNhY2hlJyt0aGlzKTtyZXR1cm4gbmV3IGIuU3ByaXRlKGMpfSxiLlNwcml0ZS5mcm9tSW1hZ2U9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWIuVGV4dHVyZS5mcm9tSW1hZ2UoYSxjLGQpO3JldHVybiBuZXcgYi5TcHJpdGUoZSl9LGIuU3ByaXRlQmF0Y2g9ZnVuY3Rpb24oYSl7Yi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLmNhbGwodGhpcyksdGhpcy50ZXh0dXJlVGhpbmc9YSx0aGlzLnJlYWR5PSExfSxiLlNwcml0ZUJhdGNoLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpLGIuU3ByaXRlQmF0Y2gucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuU3ByaXRlQmF0Y2gsYi5TcHJpdGVCYXRjaC5wcm90b3R5cGUuaW5pdFdlYkdMPWZ1bmN0aW9uKGEpe3RoaXMuZmFzdFNwcml0ZUJhdGNoPW5ldyBiLldlYkdMRmFzdFNwcml0ZUJhdGNoKGEpLHRoaXMucmVhZHk9ITB9LGIuU3ByaXRlQmF0Y2gucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybT1mdW5jdGlvbigpe2IuRGlzcGxheU9iamVjdC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtLmNhbGwodGhpcyl9LGIuU3ByaXRlQmF0Y2gucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXshdGhpcy52aXNpYmxlfHx0aGlzLmFscGhhPD0wfHwhdGhpcy5jaGlsZHJlbi5sZW5ndGh8fCh0aGlzLnJlYWR5fHx0aGlzLmluaXRXZWJHTChhLmdsKSxhLnNwcml0ZUJhdGNoLnN0b3AoKSxhLnNoYWRlck1hbmFnZXIuc2V0U2hhZGVyKGEuc2hhZGVyTWFuYWdlci5mYXN0U2hhZGVyKSx0aGlzLmZhc3RTcHJpdGVCYXRjaC5iZWdpbih0aGlzLGEpLHRoaXMuZmFzdFNwcml0ZUJhdGNoLnJlbmRlcih0aGlzKSxhLnNwcml0ZUJhdGNoLnN0YXJ0KCkpfSxiLlNwcml0ZUJhdGNoLnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzPWZ1bmN0aW9uKGEpe2lmKHRoaXMudmlzaWJsZSYmISh0aGlzLmFscGhhPD0wKSYmdGhpcy5jaGlsZHJlbi5sZW5ndGgpe3ZhciBjPWEuY29udGV4dDtjLmdsb2JhbEFscGhhPXRoaXMud29ybGRBbHBoYSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybS5jYWxsKHRoaXMpO2Zvcih2YXIgZD10aGlzLndvcmxkVHJhbnNmb3JtLGU9ITAsZj0wO2Y8dGhpcy5jaGlsZHJlbi5sZW5ndGg7ZisrKXt2YXIgZz10aGlzLmNoaWxkcmVuW2ZdO2lmKGcudmlzaWJsZSl7dmFyIGg9Zy50ZXh0dXJlLGk9aC5mcmFtZTtpZihjLmdsb2JhbEFscGhhPXRoaXMud29ybGRBbHBoYSpnLmFscGhhLGcucm90YXRpb24lKDIqTWF0aC5QSSk9PT0wKWUmJihjLnNldFRyYW5zZm9ybShkLmEsZC5iLGQuYyxkLmQsZC50eCxkLnR5KSxlPSExKSxjLmRyYXdJbWFnZShoLmJhc2VUZXh0dXJlLnNvdXJjZSxpLngsaS55LGkud2lkdGgsaS5oZWlnaHQsZy5hbmNob3IueCotaS53aWR0aCpnLnNjYWxlLngrZy5wb3NpdGlvbi54Ky41fDAsZy5hbmNob3IueSotaS5oZWlnaHQqZy5zY2FsZS55K2cucG9zaXRpb24ueSsuNXwwLGkud2lkdGgqZy5zY2FsZS54LGkuaGVpZ2h0Kmcuc2NhbGUueSk7ZWxzZXtlfHwoZT0hMCksYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm0uY2FsbChnKTt2YXIgaj1nLndvcmxkVHJhbnNmb3JtO2Eucm91bmRQaXhlbHM/Yy5zZXRUcmFuc2Zvcm0oai5hLGouYixqLmMsai5kLDB8ai50eCwwfGoudHkpOmMuc2V0VHJhbnNmb3JtKGouYSxqLmIsai5jLGouZCxqLnR4LGoudHkpLGMuZHJhd0ltYWdlKGguYmFzZVRleHR1cmUuc291cmNlLGkueCxpLnksaS53aWR0aCxpLmhlaWdodCxnLmFuY2hvci54Ki1pLndpZHRoKy41fDAsZy5hbmNob3IueSotaS5oZWlnaHQrLjV8MCxpLndpZHRoLGkuaGVpZ2h0KX19fX19LGIuTW92aWVDbGlwPWZ1bmN0aW9uKGEpe2IuU3ByaXRlLmNhbGwodGhpcyxhWzBdKSx0aGlzLnRleHR1cmVzPWEsdGhpcy5hbmltYXRpb25TcGVlZD0xLHRoaXMubG9vcD0hMCx0aGlzLm9uQ29tcGxldGU9bnVsbCx0aGlzLmN1cnJlbnRGcmFtZT0wLHRoaXMucGxheWluZz0hMX0sYi5Nb3ZpZUNsaXAucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5TcHJpdGUucHJvdG90eXBlKSxiLk1vdmllQ2xpcC5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Nb3ZpZUNsaXAsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuTW92aWVDbGlwLnByb3RvdHlwZSxcInRvdGFsRnJhbWVzXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnRleHR1cmVzLmxlbmd0aH19KSxiLk1vdmllQ2xpcC5wcm90b3R5cGUuc3RvcD1mdW5jdGlvbigpe3RoaXMucGxheWluZz0hMX0sYi5Nb3ZpZUNsaXAucHJvdG90eXBlLnBsYXk9ZnVuY3Rpb24oKXt0aGlzLnBsYXlpbmc9ITB9LGIuTW92aWVDbGlwLnByb3RvdHlwZS5nb3RvQW5kU3RvcD1mdW5jdGlvbihhKXt0aGlzLnBsYXlpbmc9ITEsdGhpcy5jdXJyZW50RnJhbWU9YTt2YXIgYj10aGlzLmN1cnJlbnRGcmFtZSsuNXwwO3RoaXMuc2V0VGV4dHVyZSh0aGlzLnRleHR1cmVzW2IldGhpcy50ZXh0dXJlcy5sZW5ndGhdKX0sYi5Nb3ZpZUNsaXAucHJvdG90eXBlLmdvdG9BbmRQbGF5PWZ1bmN0aW9uKGEpe3RoaXMuY3VycmVudEZyYW1lPWEsdGhpcy5wbGF5aW5nPSEwfSxiLk1vdmllQ2xpcC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtPWZ1bmN0aW9uKCl7aWYoYi5TcHJpdGUucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybS5jYWxsKHRoaXMpLHRoaXMucGxheWluZyl7dGhpcy5jdXJyZW50RnJhbWUrPXRoaXMuYW5pbWF0aW9uU3BlZWQ7dmFyIGE9dGhpcy5jdXJyZW50RnJhbWUrLjV8MDt0aGlzLmN1cnJlbnRGcmFtZT10aGlzLmN1cnJlbnRGcmFtZSV0aGlzLnRleHR1cmVzLmxlbmd0aCx0aGlzLmxvb3B8fGE8dGhpcy50ZXh0dXJlcy5sZW5ndGg/dGhpcy5zZXRUZXh0dXJlKHRoaXMudGV4dHVyZXNbYSV0aGlzLnRleHR1cmVzLmxlbmd0aF0pOmE+PXRoaXMudGV4dHVyZXMubGVuZ3RoJiYodGhpcy5nb3RvQW5kU3RvcCh0aGlzLnRleHR1cmVzLmxlbmd0aC0xKSx0aGlzLm9uQ29tcGxldGUmJnRoaXMub25Db21wbGV0ZSgpKX19LGIuTW92aWVDbGlwLmZyb21GcmFtZXM9ZnVuY3Rpb24oYSl7Zm9yKHZhciBjPVtdLGQ9MDtkPGEubGVuZ3RoO2QrKyljLnB1c2gobmV3IGIuVGV4dHVyZS5mcm9tRnJhbWUoYVtkXSkpO3JldHVybiBuZXcgYi5Nb3ZpZUNsaXAoYyl9LGIuTW92aWVDbGlwLmZyb21JbWFnZXM9ZnVuY3Rpb24oYSl7Zm9yKHZhciBjPVtdLGQ9MDtkPGEubGVuZ3RoO2QrKyljLnB1c2gobmV3IGIuVGV4dHVyZS5mcm9tSW1hZ2UoYVtkXSkpO3JldHVybiBuZXcgYi5Nb3ZpZUNsaXAoYyl9LGIuRmlsdGVyQmxvY2s9ZnVuY3Rpb24oKXt0aGlzLnZpc2libGU9ITAsdGhpcy5yZW5kZXJhYmxlPSEwfSxiLkZpbHRlckJsb2NrLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkZpbHRlckJsb2NrLGIuVGV4dD1mdW5jdGlvbihhLGMpe3RoaXMuY2FudmFzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksdGhpcy5jb250ZXh0PXRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKSx0aGlzLnJlc29sdXRpb249MSxiLlNwcml0ZS5jYWxsKHRoaXMsYi5UZXh0dXJlLmZyb21DYW52YXModGhpcy5jYW52YXMpKSx0aGlzLnNldFRleHQoYSksdGhpcy5zZXRTdHlsZShjKX0sYi5UZXh0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuU3ByaXRlLnByb3RvdHlwZSksYi5UZXh0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlRleHQsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuVGV4dC5wcm90b3R5cGUsXCJ3aWR0aFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaXJ0eSYmKHRoaXMudXBkYXRlVGV4dCgpLHRoaXMuZGlydHk9ITEpLHRoaXMuc2NhbGUueCp0aGlzLnRleHR1cmUuZnJhbWUud2lkdGh9LHNldDpmdW5jdGlvbihhKXt0aGlzLnNjYWxlLng9YS90aGlzLnRleHR1cmUuZnJhbWUud2lkdGgsdGhpcy5fd2lkdGg9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5UZXh0LnByb3RvdHlwZSxcImhlaWdodFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaXJ0eSYmKHRoaXMudXBkYXRlVGV4dCgpLHRoaXMuZGlydHk9ITEpLHRoaXMuc2NhbGUueSp0aGlzLnRleHR1cmUuZnJhbWUuaGVpZ2h0fSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5zY2FsZS55PWEvdGhpcy50ZXh0dXJlLmZyYW1lLmhlaWdodCx0aGlzLl9oZWlnaHQ9YX19KSxiLlRleHQucHJvdG90eXBlLnNldFN0eWxlPWZ1bmN0aW9uKGEpe2E9YXx8e30sYS5mb250PWEuZm9udHx8XCJib2xkIDIwcHQgQXJpYWxcIixhLmZpbGw9YS5maWxsfHxcImJsYWNrXCIsYS5hbGlnbj1hLmFsaWdufHxcImxlZnRcIixhLnN0cm9rZT1hLnN0cm9rZXx8XCJibGFja1wiLGEuc3Ryb2tlVGhpY2tuZXNzPWEuc3Ryb2tlVGhpY2tuZXNzfHwwLGEud29yZFdyYXA9YS53b3JkV3JhcHx8ITEsYS53b3JkV3JhcFdpZHRoPWEud29yZFdyYXBXaWR0aHx8MTAwLGEuZHJvcFNoYWRvdz1hLmRyb3BTaGFkb3d8fCExLGEuZHJvcFNoYWRvd0FuZ2xlPWEuZHJvcFNoYWRvd0FuZ2xlfHxNYXRoLlBJLzYsYS5kcm9wU2hhZG93RGlzdGFuY2U9YS5kcm9wU2hhZG93RGlzdGFuY2V8fDQsYS5kcm9wU2hhZG93Q29sb3I9YS5kcm9wU2hhZG93Q29sb3J8fFwiYmxhY2tcIix0aGlzLnN0eWxlPWEsdGhpcy5kaXJ0eT0hMH0sYi5UZXh0LnByb3RvdHlwZS5zZXRUZXh0PWZ1bmN0aW9uKGEpe3RoaXMudGV4dD1hLnRvU3RyaW5nKCl8fFwiIFwiLHRoaXMuZGlydHk9ITB9LGIuVGV4dC5wcm90b3R5cGUudXBkYXRlVGV4dD1mdW5jdGlvbigpe3RoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5yZXNvbHV0aW9uPXRoaXMucmVzb2x1dGlvbix0aGlzLmNvbnRleHQuZm9udD10aGlzLnN0eWxlLmZvbnQ7dmFyIGE9dGhpcy50ZXh0O3RoaXMuc3R5bGUud29yZFdyYXAmJihhPXRoaXMud29yZFdyYXAodGhpcy50ZXh0KSk7Zm9yKHZhciBiPWEuc3BsaXQoLyg/OlxcclxcbnxcXHJ8XFxuKS8pLGM9W10sZD0wLGU9dGhpcy5kZXRlcm1pbmVGb250UHJvcGVydGllcyh0aGlzLnN0eWxlLmZvbnQpLGY9MDtmPGIubGVuZ3RoO2YrKyl7dmFyIGc9dGhpcy5jb250ZXh0Lm1lYXN1cmVUZXh0KGJbZl0pLndpZHRoO2NbZl09ZyxkPU1hdGgubWF4KGQsZyl9dmFyIGg9ZCt0aGlzLnN0eWxlLnN0cm9rZVRoaWNrbmVzczt0aGlzLnN0eWxlLmRyb3BTaGFkb3cmJihoKz10aGlzLnN0eWxlLmRyb3BTaGFkb3dEaXN0YW5jZSksdGhpcy5jYW52YXMud2lkdGg9KGgrdGhpcy5jb250ZXh0LmxpbmVXaWR0aCkqdGhpcy5yZXNvbHV0aW9uO3ZhciBpPWUuZm9udFNpemUrdGhpcy5zdHlsZS5zdHJva2VUaGlja25lc3Msaj1pKmIubGVuZ3RoO3RoaXMuc3R5bGUuZHJvcFNoYWRvdyYmKGorPXRoaXMuc3R5bGUuZHJvcFNoYWRvd0Rpc3RhbmNlKSx0aGlzLmNhbnZhcy5oZWlnaHQ9aip0aGlzLnJlc29sdXRpb24sdGhpcy5jb250ZXh0LnNjYWxlKHRoaXMucmVzb2x1dGlvbix0aGlzLnJlc29sdXRpb24pLG5hdmlnYXRvci5pc0NvY29vbkpTJiZ0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsMCx0aGlzLmNhbnZhcy53aWR0aCx0aGlzLmNhbnZhcy5oZWlnaHQpLHRoaXMuY29udGV4dC5mb250PXRoaXMuc3R5bGUuZm9udCx0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGU9dGhpcy5zdHlsZS5zdHJva2UsdGhpcy5jb250ZXh0LmxpbmVXaWR0aD10aGlzLnN0eWxlLnN0cm9rZVRoaWNrbmVzcyx0aGlzLmNvbnRleHQudGV4dEJhc2VsaW5lPVwiYWxwaGFiZXRpY1wiO3ZhciBrLGw7aWYodGhpcy5zdHlsZS5kcm9wU2hhZG93KXt0aGlzLmNvbnRleHQuZmlsbFN0eWxlPXRoaXMuc3R5bGUuZHJvcFNoYWRvd0NvbG9yO3ZhciBtPU1hdGguc2luKHRoaXMuc3R5bGUuZHJvcFNoYWRvd0FuZ2xlKSp0aGlzLnN0eWxlLmRyb3BTaGFkb3dEaXN0YW5jZSxuPU1hdGguY29zKHRoaXMuc3R5bGUuZHJvcFNoYWRvd0FuZ2xlKSp0aGlzLnN0eWxlLmRyb3BTaGFkb3dEaXN0YW5jZTtmb3IoZj0wO2Y8Yi5sZW5ndGg7ZisrKWs9dGhpcy5zdHlsZS5zdHJva2VUaGlja25lc3MvMixsPXRoaXMuc3R5bGUuc3Ryb2tlVGhpY2tuZXNzLzIrZippK2UuYXNjZW50LFwicmlnaHRcIj09PXRoaXMuc3R5bGUuYWxpZ24/ays9ZC1jW2ZdOlwiY2VudGVyXCI9PT10aGlzLnN0eWxlLmFsaWduJiYoays9KGQtY1tmXSkvMiksdGhpcy5zdHlsZS5maWxsJiZ0aGlzLmNvbnRleHQuZmlsbFRleHQoYltmXSxrK20sbCtuKX1mb3IodGhpcy5jb250ZXh0LmZpbGxTdHlsZT10aGlzLnN0eWxlLmZpbGwsZj0wO2Y8Yi5sZW5ndGg7ZisrKWs9dGhpcy5zdHlsZS5zdHJva2VUaGlja25lc3MvMixsPXRoaXMuc3R5bGUuc3Ryb2tlVGhpY2tuZXNzLzIrZippK2UuYXNjZW50LFwicmlnaHRcIj09PXRoaXMuc3R5bGUuYWxpZ24/ays9ZC1jW2ZdOlwiY2VudGVyXCI9PT10aGlzLnN0eWxlLmFsaWduJiYoays9KGQtY1tmXSkvMiksdGhpcy5zdHlsZS5zdHJva2UmJnRoaXMuc3R5bGUuc3Ryb2tlVGhpY2tuZXNzJiZ0aGlzLmNvbnRleHQuc3Ryb2tlVGV4dChiW2ZdLGssbCksdGhpcy5zdHlsZS5maWxsJiZ0aGlzLmNvbnRleHQuZmlsbFRleHQoYltmXSxrLGwpO3RoaXMudXBkYXRlVGV4dHVyZSgpfSxiLlRleHQucHJvdG90eXBlLnVwZGF0ZVRleHR1cmU9ZnVuY3Rpb24oKXt0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUud2lkdGg9dGhpcy5jYW52YXMud2lkdGgsdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLmhlaWdodD10aGlzLmNhbnZhcy5oZWlnaHQsdGhpcy50ZXh0dXJlLmNyb3Aud2lkdGg9dGhpcy50ZXh0dXJlLmZyYW1lLndpZHRoPXRoaXMuY2FudmFzLndpZHRoLHRoaXMudGV4dHVyZS5jcm9wLmhlaWdodD10aGlzLnRleHR1cmUuZnJhbWUuaGVpZ2h0PXRoaXMuY2FudmFzLmhlaWdodCx0aGlzLl93aWR0aD10aGlzLmNhbnZhcy53aWR0aCx0aGlzLl9oZWlnaHQ9dGhpcy5jYW52YXMuaGVpZ2h0LHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5kaXJ0eSgpfSxiLlRleHQucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXt0aGlzLmRpcnR5JiYodGhpcy5yZXNvbHV0aW9uPWEucmVzb2x1dGlvbix0aGlzLnVwZGF0ZVRleHQoKSx0aGlzLmRpcnR5PSExKSxiLlNwcml0ZS5wcm90b3R5cGUuX3JlbmRlcldlYkdMLmNhbGwodGhpcyxhKX0sYi5UZXh0LnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzPWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJih0aGlzLnJlc29sdXRpb249YS5yZXNvbHV0aW9uLHRoaXMudXBkYXRlVGV4dCgpLHRoaXMuZGlydHk9ITEpLGIuU3ByaXRlLnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzLmNhbGwodGhpcyxhKX0sYi5UZXh0LnByb3RvdHlwZS5kZXRlcm1pbmVGb250UHJvcGVydGllcz1mdW5jdGlvbihhKXt2YXIgYz1iLlRleHQuZm9udFByb3BlcnRpZXNDYWNoZVthXTtpZighYyl7Yz17fTt2YXIgZD1iLlRleHQuZm9udFByb3BlcnRpZXNDYW52YXMsZT1iLlRleHQuZm9udFByb3BlcnRpZXNDb250ZXh0O2UuZm9udD1hO3ZhciBmPU1hdGguY2VpbChlLm1lYXN1cmVUZXh0KFwifE1xXCIpLndpZHRoKSxnPU1hdGguY2VpbChlLm1lYXN1cmVUZXh0KFwiTVwiKS53aWR0aCksaD0yKmc7Zz0xLjQqZ3wwLGQud2lkdGg9ZixkLmhlaWdodD1oLGUuZmlsbFN0eWxlPVwiI2YwMFwiLGUuZmlsbFJlY3QoMCwwLGYsaCksZS5mb250PWEsZS50ZXh0QmFzZWxpbmU9XCJhbHBoYWJldGljXCIsZS5maWxsU3R5bGU9XCIjMDAwXCIsZS5maWxsVGV4dChcInxNcVwiLDAsZyk7dmFyIGksaixrPWUuZ2V0SW1hZ2VEYXRhKDAsMCxmLGgpLmRhdGEsbD1rLmxlbmd0aCxtPTQqZixuPTAsbz0hMTtmb3IoaT0wO2c+aTtpKyspe2ZvcihqPTA7bT5qO2orPTQpaWYoMjU1IT09a1tuK2pdKXtvPSEwO2JyZWFrfWlmKG8pYnJlYWs7bis9bX1mb3IoYy5hc2NlbnQ9Zy1pLG49bC1tLG89ITEsaT1oO2k+ZztpLS0pe2ZvcihqPTA7bT5qO2orPTQpaWYoMjU1IT09a1tuK2pdKXtvPSEwO2JyZWFrfWlmKG8pYnJlYWs7bi09bX1jLmRlc2NlbnQ9aS1nLGMuZm9udFNpemU9Yy5hc2NlbnQrYy5kZXNjZW50LGIuVGV4dC5mb250UHJvcGVydGllc0NhY2hlW2FdPWN9cmV0dXJuIGN9LGIuVGV4dC5wcm90b3R5cGUud29yZFdyYXA9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVwiXCIsYz1hLnNwbGl0KFwiXFxuXCIpLGQ9MDtkPGMubGVuZ3RoO2QrKyl7Zm9yKHZhciBlPXRoaXMuc3R5bGUud29yZFdyYXBXaWR0aCxmPWNbZF0uc3BsaXQoXCIgXCIpLGc9MDtnPGYubGVuZ3RoO2crKyl7dmFyIGg9dGhpcy5jb250ZXh0Lm1lYXN1cmVUZXh0KGZbZ10pLndpZHRoLGk9aCt0aGlzLmNvbnRleHQubWVhc3VyZVRleHQoXCIgXCIpLndpZHRoOzA9PT1nfHxpPmU/KGc+MCYmKGIrPVwiXFxuXCIpLGIrPWZbZ10sZT10aGlzLnN0eWxlLndvcmRXcmFwV2lkdGgtaCk6KGUtPWksYis9XCIgXCIrZltnXSl9ZDxjLmxlbmd0aC0xJiYoYis9XCJcXG5cIil9cmV0dXJuIGJ9LGIuVGV4dC5wcm90b3R5cGUuZ2V0Qm91bmRzPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmRpcnR5JiYodGhpcy51cGRhdGVUZXh0KCksdGhpcy5kaXJ0eT0hMSksYi5TcHJpdGUucHJvdG90eXBlLmdldEJvdW5kcy5jYWxsKHRoaXMsYSl9LGIuVGV4dC5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbihhKXt0aGlzLmNvbnRleHQ9bnVsbCx0aGlzLmNhbnZhcz1udWxsLHRoaXMudGV4dHVyZS5kZXN0cm95KHZvaWQgMD09PWE/ITA6YSl9LGIuVGV4dC5mb250UHJvcGVydGllc0NhY2hlPXt9LGIuVGV4dC5mb250UHJvcGVydGllc0NhbnZhcz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLGIuVGV4dC5mb250UHJvcGVydGllc0NvbnRleHQ9Yi5UZXh0LmZvbnRQcm9wZXJ0aWVzQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKSxiLkJpdG1hcFRleHQ9ZnVuY3Rpb24oYSxjKXtiLkRpc3BsYXlPYmplY3RDb250YWluZXIuY2FsbCh0aGlzKSx0aGlzLnRleHRXaWR0aD0wLHRoaXMudGV4dEhlaWdodD0wLHRoaXMuX3Bvb2w9W10sdGhpcy5zZXRUZXh0KGEpLHRoaXMuc2V0U3R5bGUoYyksdGhpcy51cGRhdGVUZXh0KCksdGhpcy5kaXJ0eT0hMX0sYi5CaXRtYXBUZXh0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpLGIuQml0bWFwVGV4dC5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5CaXRtYXBUZXh0LGIuQml0bWFwVGV4dC5wcm90b3R5cGUuc2V0VGV4dD1mdW5jdGlvbihhKXt0aGlzLnRleHQ9YXx8XCIgXCIsdGhpcy5kaXJ0eT0hMH0sYi5CaXRtYXBUZXh0LnByb3RvdHlwZS5zZXRTdHlsZT1mdW5jdGlvbihhKXthPWF8fHt9LGEuYWxpZ249YS5hbGlnbnx8XCJsZWZ0XCIsdGhpcy5zdHlsZT1hO3ZhciBjPWEuZm9udC5zcGxpdChcIiBcIik7dGhpcy5mb250TmFtZT1jW2MubGVuZ3RoLTFdLHRoaXMuZm9udFNpemU9Yy5sZW5ndGg+PTI/cGFyc2VJbnQoY1tjLmxlbmd0aC0yXSwxMCk6Yi5CaXRtYXBUZXh0LmZvbnRzW3RoaXMuZm9udE5hbWVdLnNpemUsdGhpcy5kaXJ0eT0hMCx0aGlzLnRpbnQ9YS50aW50fSxiLkJpdG1hcFRleHQucHJvdG90eXBlLnVwZGF0ZVRleHQ9ZnVuY3Rpb24oKXtmb3IodmFyIGE9Yi5CaXRtYXBUZXh0LmZvbnRzW3RoaXMuZm9udE5hbWVdLGM9bmV3IGIuUG9pbnQsZD1udWxsLGU9W10sZj0wLGc9W10saD0wLGk9dGhpcy5mb250U2l6ZS9hLnNpemUsaj0wO2o8dGhpcy50ZXh0Lmxlbmd0aDtqKyspe3ZhciBrPXRoaXMudGV4dC5jaGFyQ29kZUF0KGopO2lmKC8oPzpcXHJcXG58XFxyfFxcbikvLnRlc3QodGhpcy50ZXh0LmNoYXJBdChqKSkpZy5wdXNoKGMueCksZj1NYXRoLm1heChmLGMueCksaCsrLGMueD0wLGMueSs9YS5saW5lSGVpZ2h0LGQ9bnVsbDtlbHNle3ZhciBsPWEuY2hhcnNba107bCYmKGQmJmwua2VybmluZ1tkXSYmKGMueCs9bC5rZXJuaW5nW2RdKSxlLnB1c2goe3RleHR1cmU6bC50ZXh0dXJlLGxpbmU6aCxjaGFyQ29kZTprLHBvc2l0aW9uOm5ldyBiLlBvaW50KGMueCtsLnhPZmZzZXQsYy55K2wueU9mZnNldCl9KSxjLngrPWwueEFkdmFuY2UsZD1rKX19Zy5wdXNoKGMueCksZj1NYXRoLm1heChmLGMueCk7dmFyIG09W107Zm9yKGo9MDtoPj1qO2orKyl7dmFyIG49MDtcInJpZ2h0XCI9PT10aGlzLnN0eWxlLmFsaWduP249Zi1nW2pdOlwiY2VudGVyXCI9PT10aGlzLnN0eWxlLmFsaWduJiYobj0oZi1nW2pdKS8yKSxtLnB1c2gobil9dmFyIG89dGhpcy5jaGlsZHJlbi5sZW5ndGgscD1lLmxlbmd0aCxxPXRoaXMudGludHx8MTY3NzcyMTU7Zm9yKGo9MDtwPmo7aisrKXt2YXIgcj1vPmo/dGhpcy5jaGlsZHJlbltqXTp0aGlzLl9wb29sLnBvcCgpO3I/ci5zZXRUZXh0dXJlKGVbal0udGV4dHVyZSk6cj1uZXcgYi5TcHJpdGUoZVtqXS50ZXh0dXJlKSxyLnBvc2l0aW9uLng9KGVbal0ucG9zaXRpb24ueCttW2Vbal0ubGluZV0pKmksci5wb3NpdGlvbi55PWVbal0ucG9zaXRpb24ueSppLHIuc2NhbGUueD1yLnNjYWxlLnk9aSxyLnRpbnQ9cSxyLnBhcmVudHx8dGhpcy5hZGRDaGlsZChyKX1mb3IoO3RoaXMuY2hpbGRyZW4ubGVuZ3RoPnA7KXt2YXIgcz10aGlzLmdldENoaWxkQXQodGhpcy5jaGlsZHJlbi5sZW5ndGgtMSk7dGhpcy5fcG9vbC5wdXNoKHMpLHRoaXMucmVtb3ZlQ2hpbGQocyl9dGhpcy50ZXh0V2lkdGg9ZippLHRoaXMudGV4dEhlaWdodD0oYy55K2EubGluZUhlaWdodCkqaX0sYi5CaXRtYXBUZXh0LnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm09ZnVuY3Rpb24oKXt0aGlzLmRpcnR5JiYodGhpcy51cGRhdGVUZXh0KCksdGhpcy5kaXJ0eT0hMSksYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm0uY2FsbCh0aGlzKX0sYi5CaXRtYXBUZXh0LmZvbnRzPXt9LGIuSW50ZXJhY3Rpb25EYXRhPWZ1bmN0aW9uKCl7dGhpcy5nbG9iYWw9bmV3IGIuUG9pbnQsdGhpcy50YXJnZXQ9bnVsbCx0aGlzLm9yaWdpbmFsRXZlbnQ9bnVsbH0sYi5JbnRlcmFjdGlvbkRhdGEucHJvdG90eXBlLmdldExvY2FsUG9zaXRpb249ZnVuY3Rpb24oYSxjKXt2YXIgZD1hLndvcmxkVHJhbnNmb3JtLGU9dGhpcy5nbG9iYWwsZj1kLmEsZz1kLmMsaD1kLnR4LGk9ZC5iLGo9ZC5kLGs9ZC50eSxsPTEvKGYqaitnKi1pKTtyZXR1cm4gYz1jfHxuZXcgYi5Qb2ludCxjLng9aipsKmUueCstZypsKmUueSsoaypnLWgqaikqbCxjLnk9ZipsKmUueSstaSpsKmUueCsoLWsqZitoKmkpKmwsY30sYi5JbnRlcmFjdGlvbkRhdGEucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuSW50ZXJhY3Rpb25EYXRhLGIuSW50ZXJhY3Rpb25NYW5hZ2VyPWZ1bmN0aW9uKGEpe3RoaXMuc3RhZ2U9YSx0aGlzLm1vdXNlPW5ldyBiLkludGVyYWN0aW9uRGF0YSx0aGlzLnRvdWNoZXM9e30sdGhpcy50ZW1wUG9pbnQ9bmV3IGIuUG9pbnQsdGhpcy5tb3VzZW92ZXJFbmFibGVkPSEwLHRoaXMucG9vbD1bXSx0aGlzLmludGVyYWN0aXZlSXRlbXM9W10sdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQ9bnVsbCx0aGlzLm9uTW91c2VNb3ZlPXRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSx0aGlzLm9uTW91c2VEb3duPXRoaXMub25Nb3VzZURvd24uYmluZCh0aGlzKSx0aGlzLm9uTW91c2VPdXQ9dGhpcy5vbk1vdXNlT3V0LmJpbmQodGhpcyksdGhpcy5vbk1vdXNlVXA9dGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSx0aGlzLm9uVG91Y2hTdGFydD10aGlzLm9uVG91Y2hTdGFydC5iaW5kKHRoaXMpLHRoaXMub25Ub3VjaEVuZD10aGlzLm9uVG91Y2hFbmQuYmluZCh0aGlzKSx0aGlzLm9uVG91Y2hNb3ZlPXRoaXMub25Ub3VjaE1vdmUuYmluZCh0aGlzKSx0aGlzLmxhc3Q9MCx0aGlzLmN1cnJlbnRDdXJzb3JTdHlsZT1cImluaGVyaXRcIix0aGlzLm1vdXNlT3V0PSExLHRoaXMucmVzb2x1dGlvbj0xfSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5JbnRlcmFjdGlvbk1hbmFnZXIsYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLmNvbGxlY3RJbnRlcmFjdGl2ZVNwcml0ZT1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1hLmNoaWxkcmVuLGQ9Yy5sZW5ndGgsZT1kLTE7ZT49MDtlLS0pe3ZhciBmPWNbZV07Zi5faW50ZXJhY3RpdmU/KGIuaW50ZXJhY3RpdmVDaGlsZHJlbj0hMCx0aGlzLmludGVyYWN0aXZlSXRlbXMucHVzaChmKSxmLmNoaWxkcmVuLmxlbmd0aD4wJiZ0aGlzLmNvbGxlY3RJbnRlcmFjdGl2ZVNwcml0ZShmLGYpKTooZi5fX2lQYXJlbnQ9bnVsbCxmLmNoaWxkcmVuLmxlbmd0aD4wJiZ0aGlzLmNvbGxlY3RJbnRlcmFjdGl2ZVNwcml0ZShmLGIpKVxufX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnNldFRhcmdldD1mdW5jdGlvbihhKXt0aGlzLnRhcmdldD1hLHRoaXMucmVzb2x1dGlvbj1hLnJlc29sdXRpb24sbnVsbD09PXRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50JiZ0aGlzLnNldFRhcmdldERvbUVsZW1lbnQoYS52aWV3KX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnNldFRhcmdldERvbUVsZW1lbnQ9ZnVuY3Rpb24oYSl7dGhpcy5yZW1vdmVFdmVudHMoKSx3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQmJihhLnN0eWxlW1wiLW1zLWNvbnRlbnQtem9vbWluZ1wiXT1cIm5vbmVcIixhLnN0eWxlW1wiLW1zLXRvdWNoLWFjdGlvblwiXT1cIm5vbmVcIiksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQ9YSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIix0aGlzLm9uTW91c2VNb3ZlLCEwKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIix0aGlzLm9uTW91c2VEb3duLCEwKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLHRoaXMub25Nb3VzZU91dCwhMCksYS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLHRoaXMub25Ub3VjaFN0YXJ0LCEwKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLHRoaXMub25Ub3VjaEVuZCwhMCksYS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsdGhpcy5vblRvdWNoTW92ZSwhMCksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsdGhpcy5vbk1vdXNlVXAsITApfSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQmJih0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5zdHlsZVtcIi1tcy1jb250ZW50LXpvb21pbmdcIl09XCJcIix0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5zdHlsZVtcIi1tcy10b3VjaC1hY3Rpb25cIl09XCJcIix0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsdGhpcy5vbk1vdXNlTW92ZSwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLHRoaXMub25Nb3VzZURvd24sITApLHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLHRoaXMub25Nb3VzZU91dCwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIix0aGlzLm9uVG91Y2hTdGFydCwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsdGhpcy5vblRvdWNoRW5kLCEwKSx0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsdGhpcy5vblRvdWNoTW92ZSwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQ9bnVsbCx3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIix0aGlzLm9uTW91c2VVcCwhMCkpfSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7aWYodGhpcy50YXJnZXQpe3ZhciBhPURhdGUubm93KCksYz1hLXRoaXMubGFzdDtpZihjPWMqYi5JTlRFUkFDVElPTl9GUkVRVUVOQ1kvMWUzLCEoMT5jKSl7dGhpcy5sYXN0PWE7dmFyIGQ9MDt0aGlzLmRpcnR5JiZ0aGlzLnJlYnVpbGRJbnRlcmFjdGl2ZUdyYXBoKCk7dmFyIGU9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxmPVwiaW5oZXJpdFwiLGc9ITE7Zm9yKGQ9MDtlPmQ7ZCsrKXt2YXIgaD10aGlzLmludGVyYWN0aXZlSXRlbXNbZF07aC5fX2hpdD10aGlzLmhpdFRlc3QoaCx0aGlzLm1vdXNlKSx0aGlzLm1vdXNlLnRhcmdldD1oLGguX19oaXQmJiFnPyhoLmJ1dHRvbk1vZGUmJihmPWguZGVmYXVsdEN1cnNvciksaC5pbnRlcmFjdGl2ZUNoaWxkcmVufHwoZz0hMCksaC5fX2lzT3Zlcnx8KGgubW91c2VvdmVyJiZoLm1vdXNlb3Zlcih0aGlzLm1vdXNlKSxoLl9faXNPdmVyPSEwKSk6aC5fX2lzT3ZlciYmKGgubW91c2VvdXQmJmgubW91c2VvdXQodGhpcy5tb3VzZSksaC5fX2lzT3Zlcj0hMSl9dGhpcy5jdXJyZW50Q3Vyc29yU3R5bGUhPT1mJiYodGhpcy5jdXJyZW50Q3Vyc29yU3R5bGU9Zix0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5zdHlsZS5jdXJzb3I9Zil9fX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnJlYnVpbGRJbnRlcmFjdGl2ZUdyYXBoPWZ1bmN0aW9uKCl7dGhpcy5kaXJ0eT0hMTtmb3IodmFyIGE9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxiPTA7YT5iO2IrKyl0aGlzLmludGVyYWN0aXZlSXRlbXNbYl0uaW50ZXJhY3RpdmVDaGlsZHJlbj0hMTt0aGlzLmludGVyYWN0aXZlSXRlbXM9W10sdGhpcy5zdGFnZS5pbnRlcmFjdGl2ZSYmdGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLnB1c2godGhpcy5zdGFnZSksdGhpcy5jb2xsZWN0SW50ZXJhY3RpdmVTcHJpdGUodGhpcy5zdGFnZSx0aGlzLnN0YWdlKX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VNb3ZlPWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJnRoaXMucmVidWlsZEludGVyYWN0aXZlR3JhcGgoKSx0aGlzLm1vdXNlLm9yaWdpbmFsRXZlbnQ9YTt2YXIgYj10aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTt0aGlzLm1vdXNlLmdsb2JhbC54PShhLmNsaWVudFgtYi5sZWZ0KSoodGhpcy50YXJnZXQud2lkdGgvYi53aWR0aCkvdGhpcy5yZXNvbHV0aW9uLHRoaXMubW91c2UuZ2xvYmFsLnk9KGEuY2xpZW50WS1iLnRvcCkqKHRoaXMudGFyZ2V0LmhlaWdodC9iLmhlaWdodCkvdGhpcy5yZXNvbHV0aW9uO2Zvcih2YXIgYz10aGlzLmludGVyYWN0aXZlSXRlbXMubGVuZ3RoLGQ9MDtjPmQ7ZCsrKXt2YXIgZT10aGlzLmludGVyYWN0aXZlSXRlbXNbZF07ZS5tb3VzZW1vdmUmJmUubW91c2Vtb3ZlKHRoaXMubW91c2UpfX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VEb3duPWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJnRoaXMucmVidWlsZEludGVyYWN0aXZlR3JhcGgoKSx0aGlzLm1vdXNlLm9yaWdpbmFsRXZlbnQ9YSxiLkFVVE9fUFJFVkVOVF9ERUZBVUxUJiZ0aGlzLm1vdXNlLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtmb3IodmFyIGM9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxkPXRoaXMubW91c2Uub3JpZ2luYWxFdmVudCxlPTI9PT1kLmJ1dHRvbnx8Mz09PWQud2hpY2gsZj1lP1wicmlnaHRkb3duXCI6XCJtb3VzZWRvd25cIixnPWU/XCJyaWdodGNsaWNrXCI6XCJjbGlja1wiLGg9ZT9cIl9fcmlnaHRJc0Rvd25cIjpcIl9fbW91c2VJc0Rvd25cIixpPWU/XCJfX2lzUmlnaHREb3duXCI6XCJfX2lzRG93blwiLGo9MDtjPmo7aisrKXt2YXIgaz10aGlzLmludGVyYWN0aXZlSXRlbXNbal07aWYoKGtbZl18fGtbZ10pJiYoa1toXT0hMCxrLl9faGl0PXRoaXMuaGl0VGVzdChrLHRoaXMubW91c2UpLGsuX19oaXQmJihrW2ZdJiZrW2ZdKHRoaXMubW91c2UpLGtbaV09ITAsIWsuaW50ZXJhY3RpdmVDaGlsZHJlbikpKWJyZWFrfX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VPdXQ9ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eSYmdGhpcy5yZWJ1aWxkSW50ZXJhY3RpdmVHcmFwaCgpLHRoaXMubW91c2Uub3JpZ2luYWxFdmVudD1hO3ZhciBiPXRoaXMuaW50ZXJhY3RpdmVJdGVtcy5sZW5ndGg7dGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuc3R5bGUuY3Vyc29yPVwiaW5oZXJpdFwiO2Zvcih2YXIgYz0wO2I+YztjKyspe3ZhciBkPXRoaXMuaW50ZXJhY3RpdmVJdGVtc1tjXTtkLl9faXNPdmVyJiYodGhpcy5tb3VzZS50YXJnZXQ9ZCxkLm1vdXNlb3V0JiZkLm1vdXNlb3V0KHRoaXMubW91c2UpLGQuX19pc092ZXI9ITEpfXRoaXMubW91c2VPdXQ9ITAsdGhpcy5tb3VzZS5nbG9iYWwueD0tMWU0LHRoaXMubW91c2UuZ2xvYmFsLnk9LTFlNH0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VVcD1mdW5jdGlvbihhKXt0aGlzLmRpcnR5JiZ0aGlzLnJlYnVpbGRJbnRlcmFjdGl2ZUdyYXBoKCksdGhpcy5tb3VzZS5vcmlnaW5hbEV2ZW50PWE7Zm9yKHZhciBiPXRoaXMuaW50ZXJhY3RpdmVJdGVtcy5sZW5ndGgsYz0hMSxkPXRoaXMubW91c2Uub3JpZ2luYWxFdmVudCxlPTI9PT1kLmJ1dHRvbnx8Mz09PWQud2hpY2gsZj1lP1wicmlnaHR1cFwiOlwibW91c2V1cFwiLGc9ZT9cInJpZ2h0Y2xpY2tcIjpcImNsaWNrXCIsaD1lP1wicmlnaHR1cG91dHNpZGVcIjpcIm1vdXNldXBvdXRzaWRlXCIsaT1lP1wiX19pc1JpZ2h0RG93blwiOlwiX19pc0Rvd25cIixqPTA7Yj5qO2orKyl7dmFyIGs9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zW2pdOyhrW2ddfHxrW2ZdfHxrW2hdKSYmKGsuX19oaXQ9dGhpcy5oaXRUZXN0KGssdGhpcy5tb3VzZSksay5fX2hpdCYmIWM/KGtbZl0mJmtbZl0odGhpcy5tb3VzZSksa1tpXSYma1tnXSYma1tnXSh0aGlzLm1vdXNlKSxrLmludGVyYWN0aXZlQ2hpbGRyZW58fChjPSEwKSk6a1tpXSYma1toXSYma1toXSh0aGlzLm1vdXNlKSxrW2ldPSExKX19LGIuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5oaXRUZXN0PWZ1bmN0aW9uKGEsYyl7dmFyIGQ9Yy5nbG9iYWw7aWYoIWEud29ybGRWaXNpYmxlKXJldHVybiExO3ZhciBlLGY9YS53b3JsZFRyYW5zZm9ybSxnPWYuYSxoPWYuYixpPWYuYyxqPWYudHgsaz1mLmQsbD1mLnR5LG09MS8oZyprK2kqLWgpLG49ayptKmQueCstaSptKmQueSsobCppLWoqaykqbSxvPWcqbSpkLnkrLWgqbSpkLngrKC1sKmcraipoKSptO2lmKGMudGFyZ2V0PWEsYS5oaXRBcmVhJiZhLmhpdEFyZWEuY29udGFpbnMpcmV0dXJuIGEuaGl0QXJlYS5jb250YWlucyhuLG8pPyhjLnRhcmdldD1hLCEwKTohMTtpZihhIGluc3RhbmNlb2YgYi5TcHJpdGUpe3ZhciBwLHE9YS50ZXh0dXJlLmZyYW1lLndpZHRoLHI9YS50ZXh0dXJlLmZyYW1lLmhlaWdodCxzPS1xKmEuYW5jaG9yLng7aWYobj5zJiZzK3E+biYmKHA9LXIqYS5hbmNob3IueSxvPnAmJnArcj5vKSlyZXR1cm4gYy50YXJnZXQ9YSwhMH1lbHNlIGlmKGEgaW5zdGFuY2VvZiBiLkdyYXBoaWNzKXt2YXIgdD1hLmdyYXBoaWNzRGF0YTtmb3IoZT0wO2U8dC5sZW5ndGg7ZSsrKXt2YXIgdT10W2VdO2lmKHUuZmlsbCYmdS5zaGFwZSYmdS5zaGFwZS5jb250YWlucyhuLG8pKXJldHVybiBjLnRhcmdldD1hLCEwfX12YXIgdj1hLmNoaWxkcmVuLmxlbmd0aDtmb3IoZT0wO3Y+ZTtlKyspe3ZhciB3PWEuY2hpbGRyZW5bZV0seD10aGlzLmhpdFRlc3QodyxjKTtpZih4KXJldHVybiBjLnRhcmdldD1hLCEwfXJldHVybiExfSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUub25Ub3VjaE1vdmU9ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eSYmdGhpcy5yZWJ1aWxkSW50ZXJhY3RpdmVHcmFwaCgpO3ZhciBiLGM9dGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksZD1hLmNoYW5nZWRUb3VjaGVzLGU9MDtmb3IoZT0wO2U8ZC5sZW5ndGg7ZSsrKXt2YXIgZj1kW2VdO2I9dGhpcy50b3VjaGVzW2YuaWRlbnRpZmllcl0sYi5vcmlnaW5hbEV2ZW50PWEsYi5nbG9iYWwueD0oZi5jbGllbnRYLWMubGVmdCkqKHRoaXMudGFyZ2V0LndpZHRoL2Mud2lkdGgpL3RoaXMucmVzb2x1dGlvbixiLmdsb2JhbC55PShmLmNsaWVudFktYy50b3ApKih0aGlzLnRhcmdldC5oZWlnaHQvYy5oZWlnaHQpL3RoaXMucmVzb2x1dGlvbiwhbmF2aWdhdG9yLmlzQ29jb29uSlN8fGMubGVmdHx8Yy50b3B8fGEudGFyZ2V0LnN0eWxlLndpZHRofHxhLnRhcmdldC5zdHlsZS5oZWlnaHR8fChiLmdsb2JhbC54PWYuY2xpZW50WCxiLmdsb2JhbC55PWYuY2xpZW50WSk7Zm9yKHZhciBnPTA7Zzx0aGlzLmludGVyYWN0aXZlSXRlbXMubGVuZ3RoO2crKyl7dmFyIGg9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zW2ddO2gudG91Y2htb3ZlJiZoLl9fdG91Y2hEYXRhJiZoLl9fdG91Y2hEYXRhW2YuaWRlbnRpZmllcl0mJmgudG91Y2htb3ZlKGIpfX19LGIuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5vblRvdWNoU3RhcnQ9ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eSYmdGhpcy5yZWJ1aWxkSW50ZXJhY3RpdmVHcmFwaCgpO3ZhciBjPXRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO2IuQVVUT19QUkVWRU5UX0RFRkFVTFQmJmEucHJldmVudERlZmF1bHQoKTtmb3IodmFyIGQ9YS5jaGFuZ2VkVG91Y2hlcyxlPTA7ZTxkLmxlbmd0aDtlKyspe3ZhciBmPWRbZV0sZz10aGlzLnBvb2wucG9wKCk7Z3x8KGc9bmV3IGIuSW50ZXJhY3Rpb25EYXRhKSxnLm9yaWdpbmFsRXZlbnQ9YSx0aGlzLnRvdWNoZXNbZi5pZGVudGlmaWVyXT1nLGcuZ2xvYmFsLng9KGYuY2xpZW50WC1jLmxlZnQpKih0aGlzLnRhcmdldC53aWR0aC9jLndpZHRoKS90aGlzLnJlc29sdXRpb24sZy5nbG9iYWwueT0oZi5jbGllbnRZLWMudG9wKSoodGhpcy50YXJnZXQuaGVpZ2h0L2MuaGVpZ2h0KS90aGlzLnJlc29sdXRpb24sIW5hdmlnYXRvci5pc0NvY29vbkpTfHxjLmxlZnR8fGMudG9wfHxhLnRhcmdldC5zdHlsZS53aWR0aHx8YS50YXJnZXQuc3R5bGUuaGVpZ2h0fHwoZy5nbG9iYWwueD1mLmNsaWVudFgsZy5nbG9iYWwueT1mLmNsaWVudFkpO2Zvcih2YXIgaD10aGlzLmludGVyYWN0aXZlSXRlbXMubGVuZ3RoLGk9MDtoPmk7aSsrKXt2YXIgaj10aGlzLmludGVyYWN0aXZlSXRlbXNbaV07aWYoKGoudG91Y2hzdGFydHx8ai50YXApJiYoai5fX2hpdD10aGlzLmhpdFRlc3QoaixnKSxqLl9faGl0JiYoai50b3VjaHN0YXJ0JiZqLnRvdWNoc3RhcnQoZyksai5fX2lzRG93bj0hMCxqLl9fdG91Y2hEYXRhPWouX190b3VjaERhdGF8fHt9LGouX190b3VjaERhdGFbZi5pZGVudGlmaWVyXT1nLCFqLmludGVyYWN0aXZlQ2hpbGRyZW4pKSlicmVha319fSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUub25Ub3VjaEVuZD1mdW5jdGlvbihhKXt0aGlzLmRpcnR5JiZ0aGlzLnJlYnVpbGRJbnRlcmFjdGl2ZUdyYXBoKCk7Zm9yKHZhciBiPXRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLGM9YS5jaGFuZ2VkVG91Y2hlcyxkPTA7ZDxjLmxlbmd0aDtkKyspe3ZhciBlPWNbZF0sZj10aGlzLnRvdWNoZXNbZS5pZGVudGlmaWVyXSxnPSExO2YuZ2xvYmFsLng9KGUuY2xpZW50WC1iLmxlZnQpKih0aGlzLnRhcmdldC53aWR0aC9iLndpZHRoKS90aGlzLnJlc29sdXRpb24sZi5nbG9iYWwueT0oZS5jbGllbnRZLWIudG9wKSoodGhpcy50YXJnZXQuaGVpZ2h0L2IuaGVpZ2h0KS90aGlzLnJlc29sdXRpb24sIW5hdmlnYXRvci5pc0NvY29vbkpTfHxiLmxlZnR8fGIudG9wfHxhLnRhcmdldC5zdHlsZS53aWR0aHx8YS50YXJnZXQuc3R5bGUuaGVpZ2h0fHwoZi5nbG9iYWwueD1lLmNsaWVudFgsZi5nbG9iYWwueT1lLmNsaWVudFkpO2Zvcih2YXIgaD10aGlzLmludGVyYWN0aXZlSXRlbXMubGVuZ3RoLGk9MDtoPmk7aSsrKXt2YXIgaj10aGlzLmludGVyYWN0aXZlSXRlbXNbaV07ai5fX3RvdWNoRGF0YSYmai5fX3RvdWNoRGF0YVtlLmlkZW50aWZpZXJdJiYoai5fX2hpdD10aGlzLmhpdFRlc3QoaixqLl9fdG91Y2hEYXRhW2UuaWRlbnRpZmllcl0pLGYub3JpZ2luYWxFdmVudD1hLChqLnRvdWNoZW5kfHxqLnRhcCkmJihqLl9faGl0JiYhZz8oai50b3VjaGVuZCYmai50b3VjaGVuZChmKSxqLl9faXNEb3duJiZqLnRhcCYmai50YXAoZiksai5pbnRlcmFjdGl2ZUNoaWxkcmVufHwoZz0hMCkpOmouX19pc0Rvd24mJmoudG91Y2hlbmRvdXRzaWRlJiZqLnRvdWNoZW5kb3V0c2lkZShmKSxqLl9faXNEb3duPSExKSxqLl9fdG91Y2hEYXRhW2UuaWRlbnRpZmllcl09bnVsbCl9dGhpcy5wb29sLnB1c2goZiksdGhpcy50b3VjaGVzW2UuaWRlbnRpZmllcl09bnVsbH19LGIuU3RhZ2U9ZnVuY3Rpb24oYSl7Yi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLmNhbGwodGhpcyksdGhpcy53b3JsZFRyYW5zZm9ybT1uZXcgYi5NYXRyaXgsdGhpcy5pbnRlcmFjdGl2ZT0hMCx0aGlzLmludGVyYWN0aW9uTWFuYWdlcj1uZXcgYi5JbnRlcmFjdGlvbk1hbmFnZXIodGhpcyksdGhpcy5kaXJ0eT0hMCx0aGlzLnN0YWdlPXRoaXMsdGhpcy5zdGFnZS5oaXRBcmVhPW5ldyBiLlJlY3RhbmdsZSgwLDAsMWU1LDFlNSksdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IoYSl9LGIuU3RhZ2UucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZSksYi5TdGFnZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5TdGFnZSxiLlN0YWdlLnByb3RvdHlwZS5zZXRJbnRlcmFjdGlvbkRlbGVnYXRlPWZ1bmN0aW9uKGEpe3RoaXMuaW50ZXJhY3Rpb25NYW5hZ2VyLnNldFRhcmdldERvbUVsZW1lbnQoYSl9LGIuU3RhZ2UucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybT1mdW5jdGlvbigpe3RoaXMud29ybGRBbHBoYT0xO2Zvcih2YXIgYT0wLGI9dGhpcy5jaGlsZHJlbi5sZW5ndGg7Yj5hO2ErKyl0aGlzLmNoaWxkcmVuW2FdLnVwZGF0ZVRyYW5zZm9ybSgpO3RoaXMuZGlydHkmJih0aGlzLmRpcnR5PSExLHRoaXMuaW50ZXJhY3Rpb25NYW5hZ2VyLmRpcnR5PSEwKSx0aGlzLmludGVyYWN0aXZlJiZ0aGlzLmludGVyYWN0aW9uTWFuYWdlci51cGRhdGUoKX0sYi5TdGFnZS5wcm90b3R5cGUuc2V0QmFja2dyb3VuZENvbG9yPWZ1bmN0aW9uKGEpe3RoaXMuYmFja2dyb3VuZENvbG9yPWF8fDAsdGhpcy5iYWNrZ3JvdW5kQ29sb3JTcGxpdD1iLmhleDJyZ2IodGhpcy5iYWNrZ3JvdW5kQ29sb3IpO3ZhciBjPXRoaXMuYmFja2dyb3VuZENvbG9yLnRvU3RyaW5nKDE2KTtjPVwiMDAwMDAwXCIuc3Vic3RyKDAsNi1jLmxlbmd0aCkrYyx0aGlzLmJhY2tncm91bmRDb2xvclN0cmluZz1cIiNcIitjfSxiLlN0YWdlLnByb3RvdHlwZS5nZXRNb3VzZVBvc2l0aW9uPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb25NYW5hZ2VyLm1vdXNlLmdsb2JhbH0sZnVuY3Rpb24oYSl7Zm9yKHZhciBiPTAsYz1bXCJtc1wiLFwibW96XCIsXCJ3ZWJraXRcIixcIm9cIl0sZD0wO2Q8Yy5sZW5ndGgmJiFhLnJlcXVlc3RBbmltYXRpb25GcmFtZTsrK2QpYS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9YVtjW2RdK1wiUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCJdLGEuY2FuY2VsQW5pbWF0aW9uRnJhbWU9YVtjW2RdK1wiQ2FuY2VsQW5pbWF0aW9uRnJhbWVcIl18fGFbY1tkXStcIkNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZVwiXTthLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8KGEucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGMpe3ZhciBkPShuZXcgRGF0ZSkuZ2V0VGltZSgpLGU9TWF0aC5tYXgoMCwxNi0oZC1iKSksZj1hLnNldFRpbWVvdXQoZnVuY3Rpb24oKXtjKGQrZSl9LGUpO3JldHVybiBiPWQrZSxmfSksYS5jYW5jZWxBbmltYXRpb25GcmFtZXx8KGEuY2FuY2VsQW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oYSl7Y2xlYXJUaW1lb3V0KGEpfSksYS5yZXF1ZXN0QW5pbUZyYW1lPWEucmVxdWVzdEFuaW1hdGlvbkZyYW1lfSh0aGlzKSxiLmhleDJyZ2I9ZnVuY3Rpb24oYSl7cmV0dXJuWyhhPj4xNiYyNTUpLzI1NSwoYT4+OCYyNTUpLzI1NSwoMjU1JmEpLzI1NV19LGIucmdiMmhleD1mdW5jdGlvbihhKXtyZXR1cm4oMjU1KmFbMF08PDE2KSsoMjU1KmFbMV08PDgpKzI1NSphWzJdfSxcImZ1bmN0aW9uXCIhPXR5cGVvZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCYmKEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kPWZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXtmb3IodmFyIGQ9YXJndW1lbnRzLmxlbmd0aCxmPW5ldyBBcnJheShkKTtkLS07KWZbZF09YXJndW1lbnRzW2RdO3JldHVybiBmPWUuY29uY2F0KGYpLGMuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGI/dGhpczphLGYpfXZhciBjPXRoaXMsZD1hcmd1bWVudHMubGVuZ3RoLTEsZT1bXTtpZihkPjApZm9yKGUubGVuZ3RoPWQ7ZC0tOyllW2RdPWFyZ3VtZW50c1tkKzFdO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGMpdGhyb3cgbmV3IFR5cGVFcnJvcjtyZXR1cm4gYi5wcm90b3R5cGU9ZnVuY3Rpb24gZihhKXtyZXR1cm4gYSYmKGYucHJvdG90eXBlPWEpLHRoaXMgaW5zdGFuY2VvZiBmP3ZvaWQgMDpuZXcgZn0oYy5wcm90b3R5cGUpLGJ9fSgpKSxiLkFqYXhSZXF1ZXN0PWZ1bmN0aW9uKCl7dmFyIGE9W1wiTXN4bWwyLlhNTEhUVFAuNi4wXCIsXCJNc3htbDIuWE1MSFRUUC4zLjBcIixcIk1pY3Jvc29mdC5YTUxIVFRQXCJdO2lmKCF3aW5kb3cuQWN0aXZlWE9iamVjdClyZXR1cm4gd2luZG93LlhNTEh0dHBSZXF1ZXN0P25ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3Q6ITE7Zm9yKHZhciBiPTA7YjxhLmxlbmd0aDtiKyspdHJ5e3JldHVybiBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoYVtiXSl9Y2F0Y2goYyl7fX0sYi5jYW5Vc2VOZXdDYW52YXNCbGVuZE1vZGVzPWZ1bmN0aW9uKCl7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIGRvY3VtZW50KXJldHVybiExO3ZhciBhPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7YS53aWR0aD0xLGEuaGVpZ2h0PTE7dmFyIGI9YS5nZXRDb250ZXh0KFwiMmRcIik7cmV0dXJuIGIuZmlsbFN0eWxlPVwiIzAwMFwiLGIuZmlsbFJlY3QoMCwwLDEsMSksYi5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJtdWx0aXBseVwiLGIuZmlsbFN0eWxlPVwiI2ZmZlwiLGIuZmlsbFJlY3QoMCwwLDEsMSksMD09PWIuZ2V0SW1hZ2VEYXRhKDAsMCwxLDEpLmRhdGFbMF19LGIuZ2V0TmV4dFBvd2VyT2ZUd289ZnVuY3Rpb24oYSl7aWYoYT4wJiYwPT09KGEmYS0xKSlyZXR1cm4gYTtmb3IodmFyIGI9MTthPmI7KWI8PD0xO3JldHVybiBifSxiLkV2ZW50VGFyZ2V0PXtjYWxsOmZ1bmN0aW9uKGEpe2EmJihhPWEucHJvdG90eXBlfHxhLGIuRXZlbnRUYXJnZXQubWl4aW4oYSkpfSxtaXhpbjpmdW5jdGlvbihhKXthLmxpc3RlbmVycz1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fbGlzdGVuZXJzPXRoaXMuX2xpc3RlbmVyc3x8e30sdGhpcy5fbGlzdGVuZXJzW2FdP3RoaXMuX2xpc3RlbmVyc1thXS5zbGljZSgpOltdfSxhLmVtaXQ9YS5kaXNwYXRjaEV2ZW50PWZ1bmN0aW9uKGEsYyl7aWYodGhpcy5fbGlzdGVuZXJzPXRoaXMuX2xpc3RlbmVyc3x8e30sXCJvYmplY3RcIj09dHlwZW9mIGEmJihjPWEsYT1hLnR5cGUpLGMmJmMuX19pc0V2ZW50T2JqZWN0PT09ITB8fChjPW5ldyBiLkV2ZW50KHRoaXMsYSxjKSksdGhpcy5fbGlzdGVuZXJzJiZ0aGlzLl9saXN0ZW5lcnNbYV0pe3ZhciBkLGU9dGhpcy5fbGlzdGVuZXJzW2FdLnNsaWNlKDApLGY9ZS5sZW5ndGgsZz1lWzBdO2ZvcihkPTA7Zj5kO2c9ZVsrK2RdKWlmKGcuY2FsbCh0aGlzLGMpLGMuc3RvcHBlZEltbWVkaWF0ZSlyZXR1cm4gdGhpcztpZihjLnN0b3BwZWQpcmV0dXJuIHRoaXN9cmV0dXJuIHRoaXMucGFyZW50JiZ0aGlzLnBhcmVudC5lbWl0JiZ0aGlzLnBhcmVudC5lbWl0LmNhbGwodGhpcy5wYXJlbnQsYSxjKSx0aGlzfSxhLm9uPWEuYWRkRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLl9saXN0ZW5lcnM9dGhpcy5fbGlzdGVuZXJzfHx7fSwodGhpcy5fbGlzdGVuZXJzW2FdPXRoaXMuX2xpc3RlbmVyc1thXXx8W10pLnB1c2goYiksdGhpc30sYS5vbmNlPWZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYygpe2IuYXBwbHkoZC5vZmYoYSxjKSxhcmd1bWVudHMpfXRoaXMuX2xpc3RlbmVycz10aGlzLl9saXN0ZW5lcnN8fHt9O3ZhciBkPXRoaXM7cmV0dXJuIGMuX29yaWdpbmFsSGFuZGxlcj1iLHRoaXMub24oYSxjKX0sYS5vZmY9YS5yZW1vdmVFdmVudExpc3RlbmVyPWZ1bmN0aW9uKGEsYil7aWYodGhpcy5fbGlzdGVuZXJzPXRoaXMuX2xpc3RlbmVyc3x8e30sIXRoaXMuX2xpc3RlbmVyc1thXSlyZXR1cm4gdGhpcztmb3IodmFyIGM9dGhpcy5fbGlzdGVuZXJzW2FdLGQ9Yj9jLmxlbmd0aDowO2QtLT4wOykoY1tkXT09PWJ8fGNbZF0uX29yaWdpbmFsSGFuZGxlcj09PWIpJiZjLnNwbGljZShkLDEpO3JldHVybiAwPT09Yy5sZW5ndGgmJmRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbYV0sdGhpc30sYS5yZW1vdmVBbGxMaXN0ZW5lcnM9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX2xpc3RlbmVycz10aGlzLl9saXN0ZW5lcnN8fHt9LHRoaXMuX2xpc3RlbmVyc1thXT8oZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1thXSx0aGlzKTp0aGlzfX19LGIuRXZlbnQ9ZnVuY3Rpb24oYSxiLGMpe3RoaXMuX19pc0V2ZW50T2JqZWN0PSEwLHRoaXMuc3RvcHBlZD0hMSx0aGlzLnN0b3BwZWRJbW1lZGlhdGU9ITEsdGhpcy50YXJnZXQ9YSx0aGlzLnR5cGU9Yix0aGlzLmRhdGE9Yyx0aGlzLmNvbnRlbnQ9Yyx0aGlzLnRpbWVTdGFtcD1EYXRlLm5vdygpfSxiLkV2ZW50LnByb3RvdHlwZS5zdG9wUHJvcGFnYXRpb249ZnVuY3Rpb24oKXt0aGlzLnN0b3BwZWQ9ITB9LGIuRXZlbnQucHJvdG90eXBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbj1mdW5jdGlvbigpe3RoaXMuc3RvcHBlZEltbWVkaWF0ZT0hMH0sYi5hdXRvRGV0ZWN0UmVuZGVyZXI9ZnVuY3Rpb24oYSxjLGQpe2F8fChhPTgwMCksY3x8KGM9NjAwKTt2YXIgZT1mdW5jdGlvbigpe3RyeXt2YXIgYT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO3JldHVybiEhd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCYmKGEuZ2V0Q29udGV4dChcIndlYmdsXCIpfHxhLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIikpfWNhdGNoKGIpe3JldHVybiExfX0oKTtyZXR1cm4gZT9uZXcgYi5XZWJHTFJlbmRlcmVyKGEsYyxkKTpuZXcgYi5DYW52YXNSZW5kZXJlcihhLGMsZCl9LGIuYXV0b0RldGVjdFJlY29tbWVuZGVkUmVuZGVyZXI9ZnVuY3Rpb24oYSxjLGQpe2F8fChhPTgwMCksY3x8KGM9NjAwKTt2YXIgZT1mdW5jdGlvbigpe3RyeXt2YXIgYT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO3JldHVybiEhd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCYmKGEuZ2V0Q29udGV4dChcIndlYmdsXCIpfHxhLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIikpfWNhdGNoKGIpe3JldHVybiExfX0oKSxmPS9BbmRyb2lkL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtyZXR1cm4gZSYmIWY/bmV3IGIuV2ViR0xSZW5kZXJlcihhLGMsZCk6bmV3IGIuQ2FudmFzUmVuZGVyZXIoYSxjLGQpfSxiLlBvbHlLPXt9LGIuUG9seUsuVHJpYW5ndWxhdGU9ZnVuY3Rpb24oYSl7dmFyIGM9ITAsZD1hLmxlbmd0aD4+MTtpZigzPmQpcmV0dXJuW107Zm9yKHZhciBlPVtdLGY9W10sZz0wO2Q+ZztnKyspZi5wdXNoKGcpO2c9MDtmb3IodmFyIGg9ZDtoPjM7KXt2YXIgaT1mWyhnKzApJWhdLGo9ZlsoZysxKSVoXSxrPWZbKGcrMiklaF0sbD1hWzIqaV0sbT1hWzIqaSsxXSxuPWFbMipqXSxvPWFbMipqKzFdLHA9YVsyKmtdLHE9YVsyKmsrMV0scj0hMTtpZihiLlBvbHlLLl9jb252ZXgobCxtLG4sbyxwLHEsYykpe3I9ITA7Zm9yKHZhciBzPTA7aD5zO3MrKyl7dmFyIHQ9ZltzXTtpZih0IT09aSYmdCE9PWomJnQhPT1rJiZiLlBvbHlLLl9Qb2ludEluVHJpYW5nbGUoYVsyKnRdLGFbMip0KzFdLGwsbSxuLG8scCxxKSl7cj0hMTticmVha319fWlmKHIpZS5wdXNoKGksaixrKSxmLnNwbGljZSgoZysxKSVoLDEpLGgtLSxnPTA7ZWxzZSBpZihnKys+MypoKXtpZighYylyZXR1cm4gbnVsbDtmb3IoZT1bXSxmPVtdLGc9MDtkPmc7ZysrKWYucHVzaChnKTtnPTAsaD1kLGM9ITF9fXJldHVybiBlLnB1c2goZlswXSxmWzFdLGZbMl0pLGV9LGIuUG9seUsuX1BvaW50SW5UcmlhbmdsZT1mdW5jdGlvbihhLGIsYyxkLGUsZixnLGgpe3ZhciBpPWctYyxqPWgtZCxrPWUtYyxsPWYtZCxtPWEtYyxuPWItZCxvPWkqaStqKmoscD1pKmsraipsLHE9aSptK2oqbixyPWsqaytsKmwscz1rKm0rbCpuLHQ9MS8obypyLXAqcCksdT0ocipxLXAqcykqdCx2PShvKnMtcCpxKSp0O3JldHVybiB1Pj0wJiZ2Pj0wJiYxPnUrdn0sYi5Qb2x5Sy5fY29udmV4PWZ1bmN0aW9uKGEsYixjLGQsZSxmLGcpe3JldHVybihiLWQpKihlLWMpKyhjLWEpKihmLWQpPj0wPT09Z30sYi5pbml0RGVmYXVsdFNoYWRlcnM9ZnVuY3Rpb24oKXt9LGIuQ29tcGlsZVZlcnRleFNoYWRlcj1mdW5jdGlvbihhLGMpe3JldHVybiBiLl9Db21waWxlU2hhZGVyKGEsYyxhLlZFUlRFWF9TSEFERVIpfSxiLkNvbXBpbGVGcmFnbWVudFNoYWRlcj1mdW5jdGlvbihhLGMpe3JldHVybiBiLl9Db21waWxlU2hhZGVyKGEsYyxhLkZSQUdNRU5UX1NIQURFUil9LGIuX0NvbXBpbGVTaGFkZXI9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWIuam9pbihcIlxcblwiKSxlPWEuY3JlYXRlU2hhZGVyKGMpO3JldHVybiBhLnNoYWRlclNvdXJjZShlLGQpLGEuY29tcGlsZVNoYWRlcihlKSxhLmdldFNoYWRlclBhcmFtZXRlcihlLGEuQ09NUElMRV9TVEFUVVMpP2U6KHdpbmRvdy5jb25zb2xlLmxvZyhhLmdldFNoYWRlckluZm9Mb2coZSkpLG51bGwpfSxiLmNvbXBpbGVQcm9ncmFtPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZT1iLkNvbXBpbGVGcmFnbWVudFNoYWRlcihhLGQpLGY9Yi5Db21waWxlVmVydGV4U2hhZGVyKGEsYyksZz1hLmNyZWF0ZVByb2dyYW0oKTtyZXR1cm4gYS5hdHRhY2hTaGFkZXIoZyxmKSxhLmF0dGFjaFNoYWRlcihnLGUpLGEubGlua1Byb2dyYW0oZyksYS5nZXRQcm9ncmFtUGFyYW1ldGVyKGcsYS5MSU5LX1NUQVRVUyl8fHdpbmRvdy5jb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBpbml0aWFsaXNlIHNoYWRlcnNcIiksZ30sYi5QaXhpU2hhZGVyPWZ1bmN0aW9uKGEpe3RoaXMuX1VJRD1iLl9VSUQrKyx0aGlzLmdsPWEsdGhpcy5wcm9ncmFtPW51bGwsdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbG93cCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCkgKiB2Q29sb3IgO1wiLFwifVwiXSx0aGlzLnRleHR1cmVDb3VudD0wLHRoaXMuZmlyc3RSdW49ITAsdGhpcy5kaXJ0eT0hMCx0aGlzLmF0dHJpYnV0ZXM9W10sdGhpcy5pbml0KCl9LGIuUGl4aVNoYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5QaXhpU2hhZGVyLGIuUGl4aVNoYWRlci5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2wsYz1iLmNvbXBpbGVQcm9ncmFtKGEsdGhpcy52ZXJ0ZXhTcmN8fGIuUGl4aVNoYWRlci5kZWZhdWx0VmVydGV4U3JjLHRoaXMuZnJhZ21lbnRTcmMpO2EudXNlUHJvZ3JhbShjKSx0aGlzLnVTYW1wbGVyPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ1U2FtcGxlclwiKSx0aGlzLnByb2plY3Rpb25WZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInByb2plY3Rpb25WZWN0b3JcIiksdGhpcy5vZmZzZXRWZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcIm9mZnNldFZlY3RvclwiKSx0aGlzLmRpbWVuc2lvbnM9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImRpbWVuc2lvbnNcIiksdGhpcy5hVmVydGV4UG9zaXRpb249YS5nZXRBdHRyaWJMb2NhdGlvbihjLFwiYVZlcnRleFBvc2l0aW9uXCIpLHRoaXMuYVRleHR1cmVDb29yZD1hLmdldEF0dHJpYkxvY2F0aW9uKGMsXCJhVGV4dHVyZUNvb3JkXCIpLHRoaXMuY29sb3JBdHRyaWJ1dGU9YS5nZXRBdHRyaWJMb2NhdGlvbihjLFwiYUNvbG9yXCIpLC0xPT09dGhpcy5jb2xvckF0dHJpYnV0ZSYmKHRoaXMuY29sb3JBdHRyaWJ1dGU9MiksdGhpcy5hdHRyaWJ1dGVzPVt0aGlzLmFWZXJ0ZXhQb3NpdGlvbix0aGlzLmFUZXh0dXJlQ29vcmQsdGhpcy5jb2xvckF0dHJpYnV0ZV07Zm9yKHZhciBkIGluIHRoaXMudW5pZm9ybXMpdGhpcy51bmlmb3Jtc1tkXS51bmlmb3JtTG9jYXRpb249YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxkKTt0aGlzLmluaXRVbmlmb3JtcygpLHRoaXMucHJvZ3JhbT1jfSxiLlBpeGlTaGFkZXIucHJvdG90eXBlLmluaXRVbmlmb3Jtcz1mdW5jdGlvbigpe3RoaXMudGV4dHVyZUNvdW50PTE7dmFyIGEsYj10aGlzLmdsO2Zvcih2YXIgYyBpbiB0aGlzLnVuaWZvcm1zKXthPXRoaXMudW5pZm9ybXNbY107dmFyIGQ9YS50eXBlO1wic2FtcGxlcjJEXCI9PT1kPyhhLl9pbml0PSExLG51bGwhPT1hLnZhbHVlJiZ0aGlzLmluaXRTYW1wbGVyMkQoYSkpOlwibWF0MlwiPT09ZHx8XCJtYXQzXCI9PT1kfHxcIm1hdDRcIj09PWQ/KGEuZ2xNYXRyaXg9ITAsYS5nbFZhbHVlTGVuZ3RoPTEsXCJtYXQyXCI9PT1kP2EuZ2xGdW5jPWIudW5pZm9ybU1hdHJpeDJmdjpcIm1hdDNcIj09PWQ/YS5nbEZ1bmM9Yi51bmlmb3JtTWF0cml4M2Z2OlwibWF0NFwiPT09ZCYmKGEuZ2xGdW5jPWIudW5pZm9ybU1hdHJpeDRmdikpOihhLmdsRnVuYz1iW1widW5pZm9ybVwiK2RdLGEuZ2xWYWx1ZUxlbmd0aD1cIjJmXCI9PT1kfHxcIjJpXCI9PT1kPzI6XCIzZlwiPT09ZHx8XCIzaVwiPT09ZD8zOlwiNGZcIj09PWR8fFwiNGlcIj09PWQ/NDoxKX19LGIuUGl4aVNoYWRlci5wcm90b3R5cGUuaW5pdFNhbXBsZXIyRD1mdW5jdGlvbihhKXtpZihhLnZhbHVlJiZhLnZhbHVlLmJhc2VUZXh0dXJlJiZhLnZhbHVlLmJhc2VUZXh0dXJlLmhhc0xvYWRlZCl7dmFyIGI9dGhpcy5nbDtpZihiLmFjdGl2ZVRleHR1cmUoYltcIlRFWFRVUkVcIit0aGlzLnRleHR1cmVDb3VudF0pLGIuYmluZFRleHR1cmUoYi5URVhUVVJFXzJELGEudmFsdWUuYmFzZVRleHR1cmUuX2dsVGV4dHVyZXNbYi5pZF0pLGEudGV4dHVyZURhdGEpe3ZhciBjPWEudGV4dHVyZURhdGEsZD1jLm1hZ0ZpbHRlcj9jLm1hZ0ZpbHRlcjpiLkxJTkVBUixlPWMubWluRmlsdGVyP2MubWluRmlsdGVyOmIuTElORUFSLGY9Yy53cmFwUz9jLndyYXBTOmIuQ0xBTVBfVE9fRURHRSxnPWMud3JhcFQ/Yy53cmFwVDpiLkNMQU1QX1RPX0VER0UsaD1jLmx1bWluYW5jZT9iLkxVTUlOQU5DRTpiLlJHQkE7aWYoYy5yZXBlYXQmJihmPWIuUkVQRUFULGc9Yi5SRVBFQVQpLGIucGl4ZWxTdG9yZWkoYi5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCEhYy5mbGlwWSksYy53aWR0aCl7dmFyIGk9Yy53aWR0aD9jLndpZHRoOjUxMixqPWMuaGVpZ2h0P2MuaGVpZ2h0OjIsaz1jLmJvcmRlcj9jLmJvcmRlcjowO2IudGV4SW1hZ2UyRChiLlRFWFRVUkVfMkQsMCxoLGksaixrLGgsYi5VTlNJR05FRF9CWVRFLG51bGwpfWVsc2UgYi50ZXhJbWFnZTJEKGIuVEVYVFVSRV8yRCwwLGgsYi5SR0JBLGIuVU5TSUdORURfQllURSxhLnZhbHVlLmJhc2VUZXh0dXJlLnNvdXJjZSk7Yi50ZXhQYXJhbWV0ZXJpKGIuVEVYVFVSRV8yRCxiLlRFWFRVUkVfTUFHX0ZJTFRFUixkKSxiLnRleFBhcmFtZXRlcmkoYi5URVhUVVJFXzJELGIuVEVYVFVSRV9NSU5fRklMVEVSLGUpLGIudGV4UGFyYW1ldGVyaShiLlRFWFRVUkVfMkQsYi5URVhUVVJFX1dSQVBfUyxmKSxiLnRleFBhcmFtZXRlcmkoYi5URVhUVVJFXzJELGIuVEVYVFVSRV9XUkFQX1QsZyl9Yi51bmlmb3JtMWkoYS51bmlmb3JtTG9jYXRpb24sdGhpcy50ZXh0dXJlQ291bnQpLGEuX2luaXQ9ITAsdGhpcy50ZXh0dXJlQ291bnQrK319LGIuUGl4aVNoYWRlci5wcm90b3R5cGUuc3luY1VuaWZvcm1zPWZ1bmN0aW9uKCl7dGhpcy50ZXh0dXJlQ291bnQ9MTt2YXIgYSxjPXRoaXMuZ2w7Zm9yKHZhciBkIGluIHRoaXMudW5pZm9ybXMpYT10aGlzLnVuaWZvcm1zW2RdLDE9PT1hLmdsVmFsdWVMZW5ndGg/YS5nbE1hdHJpeD09PSEwP2EuZ2xGdW5jLmNhbGwoYyxhLnVuaWZvcm1Mb2NhdGlvbixhLnRyYW5zcG9zZSxhLnZhbHVlKTphLmdsRnVuYy5jYWxsKGMsYS51bmlmb3JtTG9jYXRpb24sYS52YWx1ZSk6Mj09PWEuZ2xWYWx1ZUxlbmd0aD9hLmdsRnVuYy5jYWxsKGMsYS51bmlmb3JtTG9jYXRpb24sYS52YWx1ZS54LGEudmFsdWUueSk6Mz09PWEuZ2xWYWx1ZUxlbmd0aD9hLmdsRnVuYy5jYWxsKGMsYS51bmlmb3JtTG9jYXRpb24sYS52YWx1ZS54LGEudmFsdWUueSxhLnZhbHVlLnopOjQ9PT1hLmdsVmFsdWVMZW5ndGg/YS5nbEZ1bmMuY2FsbChjLGEudW5pZm9ybUxvY2F0aW9uLGEudmFsdWUueCxhLnZhbHVlLnksYS52YWx1ZS56LGEudmFsdWUudyk6XCJzYW1wbGVyMkRcIj09PWEudHlwZSYmKGEuX2luaXQ/KGMuYWN0aXZlVGV4dHVyZShjW1wiVEVYVFVSRVwiK3RoaXMudGV4dHVyZUNvdW50XSksYS52YWx1ZS5iYXNlVGV4dHVyZS5fZGlydHlbYy5pZF0/Yi5pbnN0YW5jZXNbYy5pZF0udXBkYXRlVGV4dHVyZShhLnZhbHVlLmJhc2VUZXh0dXJlKTpjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCxhLnZhbHVlLmJhc2VUZXh0dXJlLl9nbFRleHR1cmVzW2MuaWRdKSxjLnVuaWZvcm0xaShhLnVuaWZvcm1Mb2NhdGlvbix0aGlzLnRleHR1cmVDb3VudCksdGhpcy50ZXh0dXJlQ291bnQrKyk6dGhpcy5pbml0U2FtcGxlcjJEKGEpKX0sYi5QaXhpU2hhZGVyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSksdGhpcy51bmlmb3Jtcz1udWxsLHRoaXMuZ2w9bnVsbCx0aGlzLmF0dHJpYnV0ZXM9bnVsbH0sYi5QaXhpU2hhZGVyLmRlZmF1bHRWZXJ0ZXhTcmM9W1wiYXR0cmlidXRlIHZlYzIgYVZlcnRleFBvc2l0aW9uO1wiLFwiYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZDtcIixcImF0dHJpYnV0ZSB2ZWM0IGFDb2xvcjtcIixcInVuaWZvcm0gdmVjMiBwcm9qZWN0aW9uVmVjdG9yO1wiLFwidW5pZm9ybSB2ZWMyIG9mZnNldFZlY3RvcjtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcImNvbnN0IHZlYzIgY2VudGVyID0gdmVjMigtMS4wLCAxLjApO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX1Bvc2l0aW9uID0gdmVjNCggKChhVmVydGV4UG9zaXRpb24gKyBvZmZzZXRWZWN0b3IpIC8gcHJvamVjdGlvblZlY3RvcikgKyBjZW50ZXIgLCAwLjAsIDEuMCk7XCIsXCIgICB2VGV4dHVyZUNvb3JkID0gYVRleHR1cmVDb29yZDtcIixcIiAgIHZlYzMgY29sb3IgPSBtb2QodmVjMyhhQ29sb3IueS82NTUzNi4wLCBhQ29sb3IueS8yNTYuMCwgYUNvbG9yLnkpLCAyNTYuMCkgLyAyNTYuMDtcIixcIiAgIHZDb2xvciA9IHZlYzQoY29sb3IgKiBhQ29sb3IueCwgYUNvbG9yLngpO1wiLFwifVwiXSxiLlBpeGlGYXN0U2hhZGVyPWZ1bmN0aW9uKGEpe3RoaXMuX1VJRD1iLl9VSUQrKyx0aGlzLmdsPWEsdGhpcy5wcm9ncmFtPW51bGwsdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbG93cCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyBmbG9hdCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpICogdkNvbG9yIDtcIixcIn1cIl0sdGhpcy52ZXJ0ZXhTcmM9W1wiYXR0cmlidXRlIHZlYzIgYVZlcnRleFBvc2l0aW9uO1wiLFwiYXR0cmlidXRlIHZlYzIgYVBvc2l0aW9uQ29vcmQ7XCIsXCJhdHRyaWJ1dGUgdmVjMiBhU2NhbGU7XCIsXCJhdHRyaWJ1dGUgZmxvYXQgYVJvdGF0aW9uO1wiLFwiYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZDtcIixcImF0dHJpYnV0ZSBmbG9hdCBhQ29sb3I7XCIsXCJ1bmlmb3JtIHZlYzIgcHJvamVjdGlvblZlY3RvcjtcIixcInVuaWZvcm0gdmVjMiBvZmZzZXRWZWN0b3I7XCIsXCJ1bmlmb3JtIG1hdDMgdU1hdHJpeDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyBmbG9hdCB2Q29sb3I7XCIsXCJjb25zdCB2ZWMyIGNlbnRlciA9IHZlYzIoLTEuMCwgMS4wKTtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICB2ZWMyIHY7XCIsXCIgICB2ZWMyIHN2ID0gYVZlcnRleFBvc2l0aW9uICogYVNjYWxlO1wiLFwiICAgdi54ID0gKHN2LngpICogY29zKGFSb3RhdGlvbikgLSAoc3YueSkgKiBzaW4oYVJvdGF0aW9uKTtcIixcIiAgIHYueSA9IChzdi54KSAqIHNpbihhUm90YXRpb24pICsgKHN2LnkpICogY29zKGFSb3RhdGlvbik7XCIsXCIgICB2ID0gKCB1TWF0cml4ICogdmVjMyh2ICsgYVBvc2l0aW9uQ29vcmQgLCAxLjApICkueHkgO1wiLFwiICAgZ2xfUG9zaXRpb24gPSB2ZWM0KCAoIHYgLyBwcm9qZWN0aW9uVmVjdG9yKSArIGNlbnRlciAsIDAuMCwgMS4wKTtcIixcIiAgIHZUZXh0dXJlQ29vcmQgPSBhVGV4dHVyZUNvb3JkO1wiLFwiICAgdkNvbG9yID0gYUNvbG9yO1wiLFwifVwiXSx0aGlzLnRleHR1cmVDb3VudD0wLHRoaXMuaW5pdCgpfSxiLlBpeGlGYXN0U2hhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlBpeGlGYXN0U2hhZGVyLGIuUGl4aUZhc3RTaGFkZXIucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsLGM9Yi5jb21waWxlUHJvZ3JhbShhLHRoaXMudmVydGV4U3JjLHRoaXMuZnJhZ21lbnRTcmMpO2EudXNlUHJvZ3JhbShjKSx0aGlzLnVTYW1wbGVyPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ1U2FtcGxlclwiKSx0aGlzLnByb2plY3Rpb25WZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInByb2plY3Rpb25WZWN0b3JcIiksdGhpcy5vZmZzZXRWZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcIm9mZnNldFZlY3RvclwiKSx0aGlzLmRpbWVuc2lvbnM9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImRpbWVuc2lvbnNcIiksdGhpcy51TWF0cml4PWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ1TWF0cml4XCIpLHRoaXMuYVZlcnRleFBvc2l0aW9uPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFWZXJ0ZXhQb3NpdGlvblwiKSx0aGlzLmFQb3NpdGlvbkNvb3JkPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFQb3NpdGlvbkNvb3JkXCIpLHRoaXMuYVNjYWxlPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFTY2FsZVwiKSx0aGlzLmFSb3RhdGlvbj1hLmdldEF0dHJpYkxvY2F0aW9uKGMsXCJhUm90YXRpb25cIiksdGhpcy5hVGV4dHVyZUNvb3JkPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFUZXh0dXJlQ29vcmRcIiksdGhpcy5jb2xvckF0dHJpYnV0ZT1hLmdldEF0dHJpYkxvY2F0aW9uKGMsXCJhQ29sb3JcIiksLTE9PT10aGlzLmNvbG9yQXR0cmlidXRlJiYodGhpcy5jb2xvckF0dHJpYnV0ZT0yKSx0aGlzLmF0dHJpYnV0ZXM9W3RoaXMuYVZlcnRleFBvc2l0aW9uLHRoaXMuYVBvc2l0aW9uQ29vcmQsdGhpcy5hU2NhbGUsdGhpcy5hUm90YXRpb24sdGhpcy5hVGV4dHVyZUNvb3JkLHRoaXMuY29sb3JBdHRyaWJ1dGVdLHRoaXMucHJvZ3JhbT1jfSxiLlBpeGlGYXN0U2hhZGVyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSksdGhpcy51bmlmb3Jtcz1udWxsLHRoaXMuZ2w9bnVsbCx0aGlzLmF0dHJpYnV0ZXM9bnVsbH0sYi5TdHJpcFNoYWRlcj1mdW5jdGlvbihhKXt0aGlzLl9VSUQ9Yi5fVUlEKyssdGhpcy5nbD1hLHRoaXMucHJvZ3JhbT1udWxsLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInVuaWZvcm0gZmxvYXQgYWxwaGE7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkpKSAqIGFscGhhO1wiLFwifVwiXSx0aGlzLnZlcnRleFNyYz1bXCJhdHRyaWJ1dGUgdmVjMiBhVmVydGV4UG9zaXRpb247XCIsXCJhdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkO1wiLFwidW5pZm9ybSBtYXQzIHRyYW5zbGF0aW9uTWF0cml4O1wiLFwidW5pZm9ybSB2ZWMyIHByb2plY3Rpb25WZWN0b3I7XCIsXCJ1bmlmb3JtIHZlYzIgb2Zmc2V0VmVjdG9yO1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMyB2ID0gdHJhbnNsYXRpb25NYXRyaXggKiB2ZWMzKGFWZXJ0ZXhQb3NpdGlvbiAsIDEuMCk7XCIsXCIgICB2IC09IG9mZnNldFZlY3Rvci54eXg7XCIsXCIgICBnbF9Qb3NpdGlvbiA9IHZlYzQoIHYueCAvIHByb2plY3Rpb25WZWN0b3IueCAtMS4wLCB2LnkgLyAtcHJvamVjdGlvblZlY3Rvci55ICsgMS4wICwgMC4wLCAxLjApO1wiLFwiICAgdlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7XCIsXCJ9XCJdLHRoaXMuaW5pdCgpfSxiLlN0cmlwU2hhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlN0cmlwU2hhZGVyLGIuU3RyaXBTaGFkZXIucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsLGM9Yi5jb21waWxlUHJvZ3JhbShhLHRoaXMudmVydGV4U3JjLHRoaXMuZnJhZ21lbnRTcmMpO2EudXNlUHJvZ3JhbShjKSx0aGlzLnVTYW1wbGVyPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ1U2FtcGxlclwiKSx0aGlzLnByb2plY3Rpb25WZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInByb2plY3Rpb25WZWN0b3JcIiksdGhpcy5vZmZzZXRWZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcIm9mZnNldFZlY3RvclwiKSx0aGlzLmNvbG9yQXR0cmlidXRlPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFDb2xvclwiKSx0aGlzLmFWZXJ0ZXhQb3NpdGlvbj1hLmdldEF0dHJpYkxvY2F0aW9uKGMsXCJhVmVydGV4UG9zaXRpb25cIiksdGhpcy5hVGV4dHVyZUNvb3JkPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFUZXh0dXJlQ29vcmRcIiksdGhpcy5hdHRyaWJ1dGVzPVt0aGlzLmFWZXJ0ZXhQb3NpdGlvbix0aGlzLmFUZXh0dXJlQ29vcmRdLHRoaXMudHJhbnNsYXRpb25NYXRyaXg9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInRyYW5zbGF0aW9uTWF0cml4XCIpLHRoaXMuYWxwaGE9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImFscGhhXCIpLHRoaXMucHJvZ3JhbT1jfSxiLlN0cmlwU2hhZGVyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSksdGhpcy51bmlmb3Jtcz1udWxsLHRoaXMuZ2w9bnVsbCx0aGlzLmF0dHJpYnV0ZT1udWxsfSxiLlByaW1pdGl2ZVNoYWRlcj1mdW5jdGlvbihhKXt0aGlzLl9VSUQ9Yi5fVUlEKyssdGhpcy5nbD1hLHRoaXMucHJvZ3JhbT1udWxsLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHZDb2xvcjtcIixcIn1cIl0sdGhpcy52ZXJ0ZXhTcmM9W1wiYXR0cmlidXRlIHZlYzIgYVZlcnRleFBvc2l0aW9uO1wiLFwiYXR0cmlidXRlIHZlYzQgYUNvbG9yO1wiLFwidW5pZm9ybSBtYXQzIHRyYW5zbGF0aW9uTWF0cml4O1wiLFwidW5pZm9ybSB2ZWMyIHByb2plY3Rpb25WZWN0b3I7XCIsXCJ1bmlmb3JtIHZlYzIgb2Zmc2V0VmVjdG9yO1wiLFwidW5pZm9ybSBmbG9hdCBhbHBoYTtcIixcInVuaWZvcm0gdmVjMyB0aW50O1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICB2ZWMzIHYgPSB0cmFuc2xhdGlvbk1hdHJpeCAqIHZlYzMoYVZlcnRleFBvc2l0aW9uICwgMS4wKTtcIixcIiAgIHYgLT0gb2Zmc2V0VmVjdG9yLnh5eDtcIixcIiAgIGdsX1Bvc2l0aW9uID0gdmVjNCggdi54IC8gcHJvamVjdGlvblZlY3Rvci54IC0xLjAsIHYueSAvIC1wcm9qZWN0aW9uVmVjdG9yLnkgKyAxLjAgLCAwLjAsIDEuMCk7XCIsXCIgICB2Q29sb3IgPSBhQ29sb3IgKiB2ZWM0KHRpbnQgKiBhbHBoYSwgYWxwaGEpO1wiLFwifVwiXSx0aGlzLmluaXQoKX0sYi5QcmltaXRpdmVTaGFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuUHJpbWl0aXZlU2hhZGVyLGIuUHJpbWl0aXZlU2hhZGVyLnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5nbCxjPWIuY29tcGlsZVByb2dyYW0oYSx0aGlzLnZlcnRleFNyYyx0aGlzLmZyYWdtZW50U3JjKTthLnVzZVByb2dyYW0oYyksdGhpcy5wcm9qZWN0aW9uVmVjdG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJwcm9qZWN0aW9uVmVjdG9yXCIpLHRoaXMub2Zmc2V0VmVjdG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJvZmZzZXRWZWN0b3JcIiksdGhpcy50aW50Q29sb3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInRpbnRcIiksdGhpcy5hVmVydGV4UG9zaXRpb249YS5nZXRBdHRyaWJMb2NhdGlvbihjLFwiYVZlcnRleFBvc2l0aW9uXCIpLHRoaXMuY29sb3JBdHRyaWJ1dGU9YS5nZXRBdHRyaWJMb2NhdGlvbihjLFwiYUNvbG9yXCIpLHRoaXMuYXR0cmlidXRlcz1bdGhpcy5hVmVydGV4UG9zaXRpb24sdGhpcy5jb2xvckF0dHJpYnV0ZV0sdGhpcy50cmFuc2xhdGlvbk1hdHJpeD1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwidHJhbnNsYXRpb25NYXRyaXhcIiksdGhpcy5hbHBoYT1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwiYWxwaGFcIiksdGhpcy5wcm9ncmFtPWN9LGIuUHJpbWl0aXZlU2hhZGVyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSksdGhpcy51bmlmb3Jtcz1udWxsLHRoaXMuZ2w9bnVsbCx0aGlzLmF0dHJpYnV0ZXM9bnVsbH0sYi5Db21wbGV4UHJpbWl0aXZlU2hhZGVyPWZ1bmN0aW9uKGEpe3RoaXMuX1VJRD1iLl9VSUQrKyx0aGlzLmdsPWEsdGhpcy5wcm9ncmFtPW51bGwsdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgZ2xfRnJhZ0NvbG9yID0gdkNvbG9yO1wiLFwifVwiXSx0aGlzLnZlcnRleFNyYz1bXCJhdHRyaWJ1dGUgdmVjMiBhVmVydGV4UG9zaXRpb247XCIsXCJ1bmlmb3JtIG1hdDMgdHJhbnNsYXRpb25NYXRyaXg7XCIsXCJ1bmlmb3JtIHZlYzIgcHJvamVjdGlvblZlY3RvcjtcIixcInVuaWZvcm0gdmVjMiBvZmZzZXRWZWN0b3I7XCIsXCJ1bmlmb3JtIHZlYzMgdGludDtcIixcInVuaWZvcm0gZmxvYXQgYWxwaGE7XCIsXCJ1bmlmb3JtIHZlYzMgY29sb3I7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIHZlYzMgdiA9IHRyYW5zbGF0aW9uTWF0cml4ICogdmVjMyhhVmVydGV4UG9zaXRpb24gLCAxLjApO1wiLFwiICAgdiAtPSBvZmZzZXRWZWN0b3IueHl4O1wiLFwiICAgZ2xfUG9zaXRpb24gPSB2ZWM0KCB2LnggLyBwcm9qZWN0aW9uVmVjdG9yLnggLTEuMCwgdi55IC8gLXByb2plY3Rpb25WZWN0b3IueSArIDEuMCAsIDAuMCwgMS4wKTtcIixcIiAgIHZDb2xvciA9IHZlYzQoY29sb3IgKiBhbHBoYSAqIHRpbnQsIGFscGhhKTtcIixcIn1cIl0sdGhpcy5pbml0KCl9LGIuQ29tcGxleFByaW1pdGl2ZVNoYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Db21wbGV4UHJpbWl0aXZlU2hhZGVyLGIuQ29tcGxleFByaW1pdGl2ZVNoYWRlci5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2wsYz1iLmNvbXBpbGVQcm9ncmFtKGEsdGhpcy52ZXJ0ZXhTcmMsdGhpcy5mcmFnbWVudFNyYyk7YS51c2VQcm9ncmFtKGMpLHRoaXMucHJvamVjdGlvblZlY3Rvcj1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwicHJvamVjdGlvblZlY3RvclwiKSx0aGlzLm9mZnNldFZlY3Rvcj1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwib2Zmc2V0VmVjdG9yXCIpLHRoaXMudGludENvbG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ0aW50XCIpLHRoaXMuY29sb3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImNvbG9yXCIpLHRoaXMuYVZlcnRleFBvc2l0aW9uPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFWZXJ0ZXhQb3NpdGlvblwiKSx0aGlzLmF0dHJpYnV0ZXM9W3RoaXMuYVZlcnRleFBvc2l0aW9uLHRoaXMuY29sb3JBdHRyaWJ1dGVdLHRoaXMudHJhbnNsYXRpb25NYXRyaXg9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInRyYW5zbGF0aW9uTWF0cml4XCIpLHRoaXMuYWxwaGE9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImFscGhhXCIpLHRoaXMucHJvZ3JhbT1jfSxiLkNvbXBsZXhQcmltaXRpdmVTaGFkZXIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmdsLmRlbGV0ZVByb2dyYW0odGhpcy5wcm9ncmFtKSx0aGlzLnVuaWZvcm1zPW51bGwsdGhpcy5nbD1udWxsLHRoaXMuYXR0cmlidXRlPW51bGx9LGIuV2ViR0xHcmFwaGljcz1mdW5jdGlvbigpe30sYi5XZWJHTEdyYXBoaWNzLnJlbmRlckdyYXBoaWNzPWZ1bmN0aW9uKGEsYyl7dmFyIGQsZT1jLmdsLGY9Yy5wcm9qZWN0aW9uLGc9Yy5vZmZzZXQsaD1jLnNoYWRlck1hbmFnZXIucHJpbWl0aXZlU2hhZGVyO2EuZGlydHkmJmIuV2ViR0xHcmFwaGljcy51cGRhdGVHcmFwaGljcyhhLGUpO2Zvcih2YXIgaT1hLl93ZWJHTFtlLmlkXSxqPTA7ajxpLmRhdGEubGVuZ3RoO2orKykxPT09aS5kYXRhW2pdLm1vZGU/KGQ9aS5kYXRhW2pdLGMuc3RlbmNpbE1hbmFnZXIucHVzaFN0ZW5jaWwoYSxkLGMpLGUuZHJhd0VsZW1lbnRzKGUuVFJJQU5HTEVfRkFOLDQsZS5VTlNJR05FRF9TSE9SVCwyKihkLmluZGljZXMubGVuZ3RoLTQpKSxjLnN0ZW5jaWxNYW5hZ2VyLnBvcFN0ZW5jaWwoYSxkLGMpKTooZD1pLmRhdGFbal0sYy5zaGFkZXJNYW5hZ2VyLnNldFNoYWRlcihoKSxoPWMuc2hhZGVyTWFuYWdlci5wcmltaXRpdmVTaGFkZXIsZS51bmlmb3JtTWF0cml4M2Z2KGgudHJhbnNsYXRpb25NYXRyaXgsITEsYS53b3JsZFRyYW5zZm9ybS50b0FycmF5KCEwKSksZS51bmlmb3JtMmYoaC5wcm9qZWN0aW9uVmVjdG9yLGYueCwtZi55KSxlLnVuaWZvcm0yZihoLm9mZnNldFZlY3RvciwtZy54LC1nLnkpLGUudW5pZm9ybTNmdihoLnRpbnRDb2xvcixiLmhleDJyZ2IoYS50aW50KSksZS51bmlmb3JtMWYoaC5hbHBoYSxhLndvcmxkQWxwaGEpLGUuYmluZEJ1ZmZlcihlLkFSUkFZX0JVRkZFUixkLmJ1ZmZlciksZS52ZXJ0ZXhBdHRyaWJQb2ludGVyKGguYVZlcnRleFBvc2l0aW9uLDIsZS5GTE9BVCwhMSwyNCwwKSxlLnZlcnRleEF0dHJpYlBvaW50ZXIoaC5jb2xvckF0dHJpYnV0ZSw0LGUuRkxPQVQsITEsMjQsOCksZS5iaW5kQnVmZmVyKGUuRUxFTUVOVF9BUlJBWV9CVUZGRVIsZC5pbmRleEJ1ZmZlciksZS5kcmF3RWxlbWVudHMoZS5UUklBTkdMRV9TVFJJUCxkLmluZGljZXMubGVuZ3RoLGUuVU5TSUdORURfU0hPUlQsMCkpfSxiLldlYkdMR3JhcGhpY3MudXBkYXRlR3JhcGhpY3M9ZnVuY3Rpb24oYSxjKXt2YXIgZD1hLl93ZWJHTFtjLmlkXTtkfHwoZD1hLl93ZWJHTFtjLmlkXT17bGFzdEluZGV4OjAsZGF0YTpbXSxnbDpjfSksYS5kaXJ0eT0hMTt2YXIgZTtpZihhLmNsZWFyRGlydHkpe2ZvcihhLmNsZWFyRGlydHk9ITEsZT0wO2U8ZC5kYXRhLmxlbmd0aDtlKyspe3ZhciBmPWQuZGF0YVtlXTtmLnJlc2V0KCksYi5XZWJHTEdyYXBoaWNzLmdyYXBoaWNzRGF0YVBvb2wucHVzaChmKX1kLmRhdGE9W10sZC5sYXN0SW5kZXg9MH12YXIgZztmb3IoZT1kLmxhc3RJbmRleDtlPGEuZ3JhcGhpY3NEYXRhLmxlbmd0aDtlKyspe3ZhciBoPWEuZ3JhcGhpY3NEYXRhW2VdO2lmKGgudHlwZT09PWIuR3JhcGhpY3MuUE9MWSl7aWYoaC5wb2ludHM9aC5zaGFwZS5wb2ludHMuc2xpY2UoKSxoLnNoYXBlLmNsb3NlZCYmaC5wb2ludHNbMF0hPT1oLnBvaW50c1toLnBvaW50cy5sZW5ndGgtMl0mJmgucG9pbnRzWzFdIT09aC5wb2ludHNbaC5wb2ludHMubGVuZ3RoLTFdJiZoLnBvaW50cy5wdXNoKGgucG9pbnRzWzBdLGgucG9pbnRzWzFdKSxoLmZpbGwmJmgucG9pbnRzLmxlbmd0aD49NilpZihoLnBvaW50cy5sZW5ndGg8MTIpe2c9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwwKTt2YXIgaT1iLldlYkdMR3JhcGhpY3MuYnVpbGRQb2x5KGgsZyk7aXx8KGc9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwxKSxiLldlYkdMR3JhcGhpY3MuYnVpbGRDb21wbGV4UG9seShoLGcpKX1lbHNlIGc9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwxKSxiLldlYkdMR3JhcGhpY3MuYnVpbGRDb21wbGV4UG9seShoLGcpO2gubGluZVdpZHRoPjAmJihnPWIuV2ViR0xHcmFwaGljcy5zd2l0Y2hNb2RlKGQsMCksYi5XZWJHTEdyYXBoaWNzLmJ1aWxkTGluZShoLGcpKX1lbHNlIGc9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwwKSxoLnR5cGU9PT1iLkdyYXBoaWNzLlJFQ1Q/Yi5XZWJHTEdyYXBoaWNzLmJ1aWxkUmVjdGFuZ2xlKGgsZyk6aC50eXBlPT09Yi5HcmFwaGljcy5DSVJDfHxoLnR5cGU9PT1iLkdyYXBoaWNzLkVMSVA/Yi5XZWJHTEdyYXBoaWNzLmJ1aWxkQ2lyY2xlKGgsZyk6aC50eXBlPT09Yi5HcmFwaGljcy5SUkVDJiZiLldlYkdMR3JhcGhpY3MuYnVpbGRSb3VuZGVkUmVjdGFuZ2xlKGgsZyk7ZC5sYXN0SW5kZXgrK31mb3IoZT0wO2U8ZC5kYXRhLmxlbmd0aDtlKyspZz1kLmRhdGFbZV0sZy5kaXJ0eSYmZy51cGxvYWQoKX0sYi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGU9ZnVuY3Rpb24oYSxjKXt2YXIgZDtyZXR1cm4gYS5kYXRhLmxlbmd0aD8oZD1hLmRhdGFbYS5kYXRhLmxlbmd0aC0xXSwoZC5tb2RlIT09Y3x8MT09PWMpJiYoZD1iLldlYkdMR3JhcGhpY3MuZ3JhcGhpY3NEYXRhUG9vbC5wb3AoKXx8bmV3IGIuV2ViR0xHcmFwaGljc0RhdGEoYS5nbCksZC5tb2RlPWMsYS5kYXRhLnB1c2goZCkpKTooZD1iLldlYkdMR3JhcGhpY3MuZ3JhcGhpY3NEYXRhUG9vbC5wb3AoKXx8bmV3IGIuV2ViR0xHcmFwaGljc0RhdGEoYS5nbCksZC5tb2RlPWMsYS5kYXRhLnB1c2goZCkpLGQuZGlydHk9ITAsZH0sYi5XZWJHTEdyYXBoaWNzLmJ1aWxkUmVjdGFuZ2xlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9YS5zaGFwZSxlPWQueCxmPWQueSxnPWQud2lkdGgsaD1kLmhlaWdodDtpZihhLmZpbGwpe3ZhciBpPWIuaGV4MnJnYihhLmZpbGxDb2xvciksaj1hLmZpbGxBbHBoYSxrPWlbMF0qaixsPWlbMV0qaixtPWlbMl0qaixuPWMucG9pbnRzLG89Yy5pbmRpY2VzLHA9bi5sZW5ndGgvNjtuLnB1c2goZSxmKSxuLnB1c2goayxsLG0saiksbi5wdXNoKGUrZyxmKSxuLnB1c2goayxsLG0saiksbi5wdXNoKGUsZitoKSxuLnB1c2goayxsLG0saiksbi5wdXNoKGUrZyxmK2gpLG4ucHVzaChrLGwsbSxqKSxvLnB1c2gocCxwLHArMSxwKzIscCszLHArMyl9aWYoYS5saW5lV2lkdGgpe3ZhciBxPWEucG9pbnRzO2EucG9pbnRzPVtlLGYsZStnLGYsZStnLGYraCxlLGYraCxlLGZdLGIuV2ViR0xHcmFwaGljcy5idWlsZExpbmUoYSxjKSxhLnBvaW50cz1xfX0sYi5XZWJHTEdyYXBoaWNzLmJ1aWxkUm91bmRlZFJlY3RhbmdsZT1mdW5jdGlvbihhLGMpe3ZhciBkPWEuc2hhcGUsZT1kLngsZj1kLnksZz1kLndpZHRoLGg9ZC5oZWlnaHQsaT1kLnJhZGl1cyxqPVtdO2lmKGoucHVzaChlLGYraSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZSxmK2gtaSxlLGYraCxlK2ksZitoKSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZStnLWksZitoLGUrZyxmK2gsZStnLGYraC1pKSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZStnLGYraSxlK2csZixlK2ctaSxmKSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZStpLGYsZSxmLGUsZitpKSksYS5maWxsKXt2YXIgaz1iLmhleDJyZ2IoYS5maWxsQ29sb3IpLGw9YS5maWxsQWxwaGEsbT1rWzBdKmwsbj1rWzFdKmwsbz1rWzJdKmwscD1jLnBvaW50cyxxPWMuaW5kaWNlcyxyPXAubGVuZ3RoLzYscz1iLlBvbHlLLlRyaWFuZ3VsYXRlKGopLHQ9MDtmb3IodD0wO3Q8cy5sZW5ndGg7dCs9MylxLnB1c2goc1t0XStyKSxxLnB1c2goc1t0XStyKSxxLnB1c2goc1t0KzFdK3IpLHEucHVzaChzW3QrMl0rcikscS5wdXNoKHNbdCsyXStyKTtmb3IodD0wO3Q8ai5sZW5ndGg7dCsrKXAucHVzaChqW3RdLGpbKyt0XSxtLG4sbyxsKX1pZihhLmxpbmVXaWR0aCl7dmFyIHU9YS5wb2ludHM7YS5wb2ludHM9aixiLldlYkdMR3JhcGhpY3MuYnVpbGRMaW5lKGEsYyksYS5wb2ludHM9dX19LGIuV2ViR0xHcmFwaGljcy5xdWFkcmF0aWNCZXppZXJDdXJ2ZT1mdW5jdGlvbihhLGIsYyxkLGUsZil7ZnVuY3Rpb24gZyhhLGIsYyl7dmFyIGQ9Yi1hO3JldHVybiBhK2QqY31mb3IodmFyIGgsaSxqLGssbCxtLG49MjAsbz1bXSxwPTAscT0wO24+PXE7cSsrKXA9cS9uLGg9ZyhhLGMscCksaT1nKGIsZCxwKSxqPWcoYyxlLHApLGs9ZyhkLGYscCksbD1nKGgsaixwKSxtPWcoaSxrLHApLG8ucHVzaChsLG0pO3JldHVybiBvfSxiLldlYkdMR3JhcGhpY3MuYnVpbGRDaXJjbGU9ZnVuY3Rpb24oYSxjKXt2YXIgZCxlLGY9YS5zaGFwZSxnPWYueCxoPWYueTthLnR5cGU9PT1iLkdyYXBoaWNzLkNJUkM/KGQ9Zi5yYWRpdXMsZT1mLnJhZGl1cyk6KGQ9Zi53aWR0aCxlPWYuaGVpZ2h0KTt2YXIgaT00MCxqPTIqTWF0aC5QSS9pLGs9MDtpZihhLmZpbGwpe3ZhciBsPWIuaGV4MnJnYihhLmZpbGxDb2xvciksbT1hLmZpbGxBbHBoYSxuPWxbMF0qbSxvPWxbMV0qbSxwPWxbMl0qbSxxPWMucG9pbnRzLHI9Yy5pbmRpY2VzLHM9cS5sZW5ndGgvNjtmb3Ioci5wdXNoKHMpLGs9MDtpKzE+aztrKyspcS5wdXNoKGcsaCxuLG8scCxtKSxxLnB1c2goZytNYXRoLnNpbihqKmspKmQsaCtNYXRoLmNvcyhqKmspKmUsbixvLHAsbSksci5wdXNoKHMrKyxzKyspO3IucHVzaChzLTEpfWlmKGEubGluZVdpZHRoKXt2YXIgdD1hLnBvaW50cztmb3IoYS5wb2ludHM9W10saz0wO2krMT5rO2srKylhLnBvaW50cy5wdXNoKGcrTWF0aC5zaW4oaiprKSpkLGgrTWF0aC5jb3MoaiprKSplKTtiLldlYkdMR3JhcGhpY3MuYnVpbGRMaW5lKGEsYyksYS5wb2ludHM9dH19LGIuV2ViR0xHcmFwaGljcy5idWlsZExpbmU9ZnVuY3Rpb24oYSxjKXt2YXIgZD0wLGU9YS5wb2ludHM7aWYoMCE9PWUubGVuZ3RoKXtpZihhLmxpbmVXaWR0aCUyKWZvcihkPTA7ZDxlLmxlbmd0aDtkKyspZVtkXSs9LjU7dmFyIGY9bmV3IGIuUG9pbnQoZVswXSxlWzFdKSxnPW5ldyBiLlBvaW50KGVbZS5sZW5ndGgtMl0sZVtlLmxlbmd0aC0xXSk7aWYoZi54PT09Zy54JiZmLnk9PT1nLnkpe2U9ZS5zbGljZSgpLGUucG9wKCksZS5wb3AoKSxnPW5ldyBiLlBvaW50KGVbZS5sZW5ndGgtMl0sZVtlLmxlbmd0aC0xXSk7dmFyIGg9Zy54Ky41KihmLngtZy54KSxpPWcueSsuNSooZi55LWcueSk7ZS51bnNoaWZ0KGgsaSksZS5wdXNoKGgsaSl9dmFyIGosayxsLG0sbixvLHAscSxyLHMsdCx1LHYsdyx4LHkseixBLEIsQyxELEUsRixHPWMucG9pbnRzLEg9Yy5pbmRpY2VzLEk9ZS5sZW5ndGgvMixKPWUubGVuZ3RoLEs9Ry5sZW5ndGgvNixMPWEubGluZVdpZHRoLzIsTT1iLmhleDJyZ2IoYS5saW5lQ29sb3IpLE49YS5saW5lQWxwaGEsTz1NWzBdKk4sUD1NWzFdKk4sUT1NWzJdKk47Zm9yKGw9ZVswXSxtPWVbMV0sbj1lWzJdLG89ZVszXSxyPS0obS1vKSxzPWwtbixGPU1hdGguc3FydChyKnIrcypzKSxyLz1GLHMvPUYscio9TCxzKj1MLEcucHVzaChsLXIsbS1zLE8sUCxRLE4pLEcucHVzaChsK3IsbStzLE8sUCxRLE4pLGQ9MTtJLTE+ZDtkKyspbD1lWzIqKGQtMSldLG09ZVsyKihkLTEpKzFdLG49ZVsyKmRdLG89ZVsyKmQrMV0scD1lWzIqKGQrMSldLHE9ZVsyKihkKzEpKzFdLHI9LShtLW8pLHM9bC1uLEY9TWF0aC5zcXJ0KHIqcitzKnMpLHIvPUYscy89RixyKj1MLHMqPUwsdD0tKG8tcSksdT1uLXAsRj1NYXRoLnNxcnQodCp0K3UqdSksdC89Rix1Lz1GLHQqPUwsdSo9TCx4PS1zK20tKC1zK28pLHk9LXIrbi0oLXIrbCksej0oLXIrbCkqKC1zK28pLSgtcituKSooLXMrbSksQT0tdStxLSgtdStvKSxCPS10K24tKC10K3ApLEM9KC10K3ApKigtdStvKS0oLXQrbikqKC11K3EpLEQ9eCpCLUEqeSxNYXRoLmFicyhEKTwuMT8oRCs9MTAuMSxHLnB1c2gobi1yLG8tcyxPLFAsUSxOKSxHLnB1c2gobityLG8rcyxPLFAsUSxOKSk6KGo9KHkqQy1CKnopL0Qsaz0oQSp6LXgqQykvRCxFPShqLW4pKihqLW4pKyhrLW8pKyhrLW8pLEU+MTk2MDA/KHY9ci10LHc9cy11LEY9TWF0aC5zcXJ0KHYqdit3KncpLHYvPUYsdy89Rix2Kj1MLHcqPUwsRy5wdXNoKG4tdixvLXcpLEcucHVzaChPLFAsUSxOKSxHLnB1c2gobit2LG8rdyksRy5wdXNoKE8sUCxRLE4pLEcucHVzaChuLXYsby13KSxHLnB1c2goTyxQLFEsTiksSisrKTooRy5wdXNoKGosayksRy5wdXNoKE8sUCxRLE4pLEcucHVzaChuLShqLW4pLG8tKGstbykpLEcucHVzaChPLFAsUSxOKSkpO2ZvcihsPWVbMiooSS0yKV0sbT1lWzIqKEktMikrMV0sbj1lWzIqKEktMSldLG89ZVsyKihJLTEpKzFdLHI9LShtLW8pLHM9bC1uLEY9TWF0aC5zcXJ0KHIqcitzKnMpLHIvPUYscy89RixyKj1MLHMqPUwsRy5wdXNoKG4tcixvLXMpLEcucHVzaChPLFAsUSxOKSxHLnB1c2gobityLG8rcyksRy5wdXNoKE8sUCxRLE4pLEgucHVzaChLKSxkPTA7Sj5kO2QrKylILnB1c2goSysrKTtcbkgucHVzaChLLTEpfX0sYi5XZWJHTEdyYXBoaWNzLmJ1aWxkQ29tcGxleFBvbHk9ZnVuY3Rpb24oYSxjKXt2YXIgZD1hLnBvaW50cy5zbGljZSgpO2lmKCEoZC5sZW5ndGg8Nikpe3ZhciBlPWMuaW5kaWNlcztjLnBvaW50cz1kLGMuYWxwaGE9YS5maWxsQWxwaGEsYy5jb2xvcj1iLmhleDJyZ2IoYS5maWxsQ29sb3IpO2Zvcih2YXIgZixnLGg9MS8wLGk9LTEvMCxqPTEvMCxrPS0xLzAsbD0wO2w8ZC5sZW5ndGg7bCs9MilmPWRbbF0sZz1kW2wrMV0saD1oPmY/ZjpoLGk9Zj5pP2Y6aSxqPWo+Zz9nOmosaz1nPms/ZzprO2QucHVzaChoLGosaSxqLGksayxoLGspO3ZhciBtPWQubGVuZ3RoLzI7Zm9yKGw9MDttPmw7bCsrKWUucHVzaChsKX19LGIuV2ViR0xHcmFwaGljcy5idWlsZFBvbHk9ZnVuY3Rpb24oYSxjKXt2YXIgZD1hLnBvaW50cztpZighKGQubGVuZ3RoPDYpKXt2YXIgZT1jLnBvaW50cyxmPWMuaW5kaWNlcyxnPWQubGVuZ3RoLzIsaD1iLmhleDJyZ2IoYS5maWxsQ29sb3IpLGk9YS5maWxsQWxwaGEsaj1oWzBdKmksaz1oWzFdKmksbD1oWzJdKmksbT1iLlBvbHlLLlRyaWFuZ3VsYXRlKGQpO2lmKCFtKXJldHVybiExO3ZhciBuPWUubGVuZ3RoLzYsbz0wO2ZvcihvPTA7bzxtLmxlbmd0aDtvKz0zKWYucHVzaChtW29dK24pLGYucHVzaChtW29dK24pLGYucHVzaChtW28rMV0rbiksZi5wdXNoKG1bbysyXStuKSxmLnB1c2gobVtvKzJdK24pO2ZvcihvPTA7Zz5vO28rKyllLnB1c2goZFsyKm9dLGRbMipvKzFdLGosayxsLGkpO3JldHVybiEwfX0sYi5XZWJHTEdyYXBoaWNzLmdyYXBoaWNzRGF0YVBvb2w9W10sYi5XZWJHTEdyYXBoaWNzRGF0YT1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy5jb2xvcj1bMCwwLDBdLHRoaXMucG9pbnRzPVtdLHRoaXMuaW5kaWNlcz1bXSx0aGlzLmxhc3RJbmRleD0wLHRoaXMuYnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksdGhpcy5pbmRleEJ1ZmZlcj1hLmNyZWF0ZUJ1ZmZlcigpLHRoaXMubW9kZT0xLHRoaXMuYWxwaGE9MSx0aGlzLmRpcnR5PSEwfSxiLldlYkdMR3JhcGhpY3NEYXRhLnByb3RvdHlwZS5yZXNldD1mdW5jdGlvbigpe3RoaXMucG9pbnRzPVtdLHRoaXMuaW5kaWNlcz1bXSx0aGlzLmxhc3RJbmRleD0wfSxiLldlYkdMR3JhcGhpY3NEYXRhLnByb3RvdHlwZS51cGxvYWQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO3RoaXMuZ2xQb2ludHM9bmV3IGIuRmxvYXQzMkFycmF5KHRoaXMucG9pbnRzKSxhLmJpbmRCdWZmZXIoYS5BUlJBWV9CVUZGRVIsdGhpcy5idWZmZXIpLGEuYnVmZmVyRGF0YShhLkFSUkFZX0JVRkZFUix0aGlzLmdsUG9pbnRzLGEuU1RBVElDX0RSQVcpLHRoaXMuZ2xJbmRpY2llcz1uZXcgYi5VaW50MTZBcnJheSh0aGlzLmluZGljZXMpLGEuYmluZEJ1ZmZlcihhLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuaW5kZXhCdWZmZXIpLGEuYnVmZmVyRGF0YShhLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuZ2xJbmRpY2llcyxhLlNUQVRJQ19EUkFXKSx0aGlzLmRpcnR5PSExfSxiLmdsQ29udGV4dHM9W10sYi5pbnN0YW5jZXM9W10sYi5XZWJHTFJlbmRlcmVyPWZ1bmN0aW9uKGEsYyxkKXtpZihkKWZvcih2YXIgZSBpbiBiLmRlZmF1bHRSZW5kZXJPcHRpb25zKVwidW5kZWZpbmVkXCI9PXR5cGVvZiBkW2VdJiYoZFtlXT1iLmRlZmF1bHRSZW5kZXJPcHRpb25zW2VdKTtlbHNlIGQ9Yi5kZWZhdWx0UmVuZGVyT3B0aW9ucztiLmRlZmF1bHRSZW5kZXJlcnx8KGIuc2F5SGVsbG8oXCJ3ZWJHTFwiKSxiLmRlZmF1bHRSZW5kZXJlcj10aGlzKSx0aGlzLnR5cGU9Yi5XRUJHTF9SRU5ERVJFUix0aGlzLnJlc29sdXRpb249ZC5yZXNvbHV0aW9uLHRoaXMudHJhbnNwYXJlbnQ9ZC50cmFuc3BhcmVudCx0aGlzLmF1dG9SZXNpemU9ZC5hdXRvUmVzaXplfHwhMSx0aGlzLnByZXNlcnZlRHJhd2luZ0J1ZmZlcj1kLnByZXNlcnZlRHJhd2luZ0J1ZmZlcix0aGlzLmNsZWFyQmVmb3JlUmVuZGVyPWQuY2xlYXJCZWZvcmVSZW5kZXIsdGhpcy53aWR0aD1hfHw4MDAsdGhpcy5oZWlnaHQ9Y3x8NjAwLHRoaXMudmlldz1kLnZpZXd8fGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksdGhpcy5jb250ZXh0TG9zdEJvdW5kPXRoaXMuaGFuZGxlQ29udGV4dExvc3QuYmluZCh0aGlzKSx0aGlzLmNvbnRleHRSZXN0b3JlZEJvdW5kPXRoaXMuaGFuZGxlQ29udGV4dFJlc3RvcmVkLmJpbmQodGhpcyksdGhpcy52aWV3LmFkZEV2ZW50TGlzdGVuZXIoXCJ3ZWJnbGNvbnRleHRsb3N0XCIsdGhpcy5jb250ZXh0TG9zdEJvdW5kLCExKSx0aGlzLnZpZXcuYWRkRXZlbnRMaXN0ZW5lcihcIndlYmdsY29udGV4dHJlc3RvcmVkXCIsdGhpcy5jb250ZXh0UmVzdG9yZWRCb3VuZCwhMSksdGhpcy5fY29udGV4dE9wdGlvbnM9e2FscGhhOnRoaXMudHJhbnNwYXJlbnQsYW50aWFsaWFzOmQuYW50aWFsaWFzLHByZW11bHRpcGxpZWRBbHBoYTp0aGlzLnRyYW5zcGFyZW50JiZcIm5vdE11bHRpcGxpZWRcIiE9PXRoaXMudHJhbnNwYXJlbnQsc3RlbmNpbDohMCxwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6ZC5wcmVzZXJ2ZURyYXdpbmdCdWZmZXJ9LHRoaXMucHJvamVjdGlvbj1uZXcgYi5Qb2ludCx0aGlzLm9mZnNldD1uZXcgYi5Qb2ludCgwLDApLHRoaXMuc2hhZGVyTWFuYWdlcj1uZXcgYi5XZWJHTFNoYWRlck1hbmFnZXIsdGhpcy5zcHJpdGVCYXRjaD1uZXcgYi5XZWJHTFNwcml0ZUJhdGNoLHRoaXMubWFza01hbmFnZXI9bmV3IGIuV2ViR0xNYXNrTWFuYWdlcix0aGlzLmZpbHRlck1hbmFnZXI9bmV3IGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLHRoaXMuc3RlbmNpbE1hbmFnZXI9bmV3IGIuV2ViR0xTdGVuY2lsTWFuYWdlcix0aGlzLmJsZW5kTW9kZU1hbmFnZXI9bmV3IGIuV2ViR0xCbGVuZE1vZGVNYW5hZ2VyLHRoaXMucmVuZGVyU2Vzc2lvbj17fSx0aGlzLnJlbmRlclNlc3Npb24uZ2w9dGhpcy5nbCx0aGlzLnJlbmRlclNlc3Npb24uZHJhd0NvdW50PTAsdGhpcy5yZW5kZXJTZXNzaW9uLnNoYWRlck1hbmFnZXI9dGhpcy5zaGFkZXJNYW5hZ2VyLHRoaXMucmVuZGVyU2Vzc2lvbi5tYXNrTWFuYWdlcj10aGlzLm1hc2tNYW5hZ2VyLHRoaXMucmVuZGVyU2Vzc2lvbi5maWx0ZXJNYW5hZ2VyPXRoaXMuZmlsdGVyTWFuYWdlcix0aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlcj10aGlzLmJsZW5kTW9kZU1hbmFnZXIsdGhpcy5yZW5kZXJTZXNzaW9uLnNwcml0ZUJhdGNoPXRoaXMuc3ByaXRlQmF0Y2gsdGhpcy5yZW5kZXJTZXNzaW9uLnN0ZW5jaWxNYW5hZ2VyPXRoaXMuc3RlbmNpbE1hbmFnZXIsdGhpcy5yZW5kZXJTZXNzaW9uLnJlbmRlcmVyPXRoaXMsdGhpcy5yZW5kZXJTZXNzaW9uLnJlc29sdXRpb249dGhpcy5yZXNvbHV0aW9uLHRoaXMuaW5pdENvbnRleHQoKSx0aGlzLm1hcEJsZW5kTW9kZXMoKX0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLldlYkdMUmVuZGVyZXIsYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5pbml0Q29udGV4dD1mdW5jdGlvbigpe3ZhciBhPXRoaXMudmlldy5nZXRDb250ZXh0KFwid2ViZ2xcIix0aGlzLl9jb250ZXh0T3B0aW9ucyl8fHRoaXMudmlldy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIsdGhpcy5fY29udGV4dE9wdGlvbnMpO2lmKHRoaXMuZ2w9YSwhYSl0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB3ZWJHTC4gVHJ5IHVzaW5nIHRoZSBjYW52YXMgcmVuZGVyZXJcIik7dGhpcy5nbENvbnRleHRJZD1hLmlkPWIuV2ViR0xSZW5kZXJlci5nbENvbnRleHRJZCsrLGIuZ2xDb250ZXh0c1t0aGlzLmdsQ29udGV4dElkXT1hLGIuaW5zdGFuY2VzW3RoaXMuZ2xDb250ZXh0SWRdPXRoaXMsYS5kaXNhYmxlKGEuREVQVEhfVEVTVCksYS5kaXNhYmxlKGEuQ1VMTF9GQUNFKSxhLmVuYWJsZShhLkJMRU5EKSx0aGlzLnNoYWRlck1hbmFnZXIuc2V0Q29udGV4dChhKSx0aGlzLnNwcml0ZUJhdGNoLnNldENvbnRleHQoYSksdGhpcy5tYXNrTWFuYWdlci5zZXRDb250ZXh0KGEpLHRoaXMuZmlsdGVyTWFuYWdlci5zZXRDb250ZXh0KGEpLHRoaXMuYmxlbmRNb2RlTWFuYWdlci5zZXRDb250ZXh0KGEpLHRoaXMuc3RlbmNpbE1hbmFnZXIuc2V0Q29udGV4dChhKSx0aGlzLnJlbmRlclNlc3Npb24uZ2w9dGhpcy5nbCx0aGlzLnJlc2l6ZSh0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KX0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXI9ZnVuY3Rpb24oYSl7aWYoIXRoaXMuY29udGV4dExvc3Qpe3RoaXMuX19zdGFnZSE9PWEmJihhLmludGVyYWN0aXZlJiZhLmludGVyYWN0aW9uTWFuYWdlci5yZW1vdmVFdmVudHMoKSx0aGlzLl9fc3RhZ2U9YSksYS51cGRhdGVUcmFuc2Zvcm0oKTt2YXIgYj10aGlzLmdsO2EuX2ludGVyYWN0aXZlP2EuX2ludGVyYWN0aXZlRXZlbnRzQWRkZWR8fChhLl9pbnRlcmFjdGl2ZUV2ZW50c0FkZGVkPSEwLGEuaW50ZXJhY3Rpb25NYW5hZ2VyLnNldFRhcmdldCh0aGlzKSk6YS5faW50ZXJhY3RpdmVFdmVudHNBZGRlZCYmKGEuX2ludGVyYWN0aXZlRXZlbnRzQWRkZWQ9ITEsYS5pbnRlcmFjdGlvbk1hbmFnZXIuc2V0VGFyZ2V0KHRoaXMpKSxiLnZpZXdwb3J0KDAsMCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSxiLmJpbmRGcmFtZWJ1ZmZlcihiLkZSQU1FQlVGRkVSLG51bGwpLHRoaXMuY2xlYXJCZWZvcmVSZW5kZXImJih0aGlzLnRyYW5zcGFyZW50P2IuY2xlYXJDb2xvcigwLDAsMCwwKTpiLmNsZWFyQ29sb3IoYS5iYWNrZ3JvdW5kQ29sb3JTcGxpdFswXSxhLmJhY2tncm91bmRDb2xvclNwbGl0WzFdLGEuYmFja2dyb3VuZENvbG9yU3BsaXRbMl0sMSksYi5jbGVhcihiLkNPTE9SX0JVRkZFUl9CSVQpKSx0aGlzLnJlbmRlckRpc3BsYXlPYmplY3QoYSx0aGlzLnByb2plY3Rpb24pfX0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJEaXNwbGF5T2JqZWN0PWZ1bmN0aW9uKGEsYyxkKXt0aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5zZXRCbGVuZE1vZGUoYi5ibGVuZE1vZGVzLk5PUk1BTCksdGhpcy5yZW5kZXJTZXNzaW9uLmRyYXdDb3VudD0wLHRoaXMucmVuZGVyU2Vzc2lvbi5wcm9qZWN0aW9uPWMsdGhpcy5yZW5kZXJTZXNzaW9uLm9mZnNldD10aGlzLm9mZnNldCx0aGlzLnNwcml0ZUJhdGNoLmJlZ2luKHRoaXMucmVuZGVyU2Vzc2lvbiksdGhpcy5maWx0ZXJNYW5hZ2VyLmJlZ2luKHRoaXMucmVuZGVyU2Vzc2lvbixkKSxhLl9yZW5kZXJXZWJHTCh0aGlzLnJlbmRlclNlc3Npb24pLHRoaXMuc3ByaXRlQmF0Y2guZW5kKCl9LGIuV2ViR0xSZW5kZXJlci5wcm90b3R5cGUucmVzaXplPWZ1bmN0aW9uKGEsYil7dGhpcy53aWR0aD1hKnRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodD1iKnRoaXMucmVzb2x1dGlvbix0aGlzLnZpZXcud2lkdGg9dGhpcy53aWR0aCx0aGlzLnZpZXcuaGVpZ2h0PXRoaXMuaGVpZ2h0LHRoaXMuYXV0b1Jlc2l6ZSYmKHRoaXMudmlldy5zdHlsZS53aWR0aD10aGlzLndpZHRoL3RoaXMucmVzb2x1dGlvbitcInB4XCIsdGhpcy52aWV3LnN0eWxlLmhlaWdodD10aGlzLmhlaWdodC90aGlzLnJlc29sdXRpb24rXCJweFwiKSx0aGlzLmdsLnZpZXdwb3J0KDAsMCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSx0aGlzLnByb2plY3Rpb24ueD10aGlzLndpZHRoLzIvdGhpcy5yZXNvbHV0aW9uLHRoaXMucHJvamVjdGlvbi55PS10aGlzLmhlaWdodC8yL3RoaXMucmVzb2x1dGlvbn0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS51cGRhdGVUZXh0dXJlPWZ1bmN0aW9uKGEpe2lmKGEuaGFzTG9hZGVkKXt2YXIgYz10aGlzLmdsO3JldHVybiBhLl9nbFRleHR1cmVzW2MuaWRdfHwoYS5fZ2xUZXh0dXJlc1tjLmlkXT1jLmNyZWF0ZVRleHR1cmUoKSksYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsYS5fZ2xUZXh0dXJlc1tjLmlkXSksYy5waXhlbFN0b3JlaShjLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCxhLnByZW11bHRpcGxpZWRBbHBoYSksYy50ZXhJbWFnZTJEKGMuVEVYVFVSRV8yRCwwLGMuUkdCQSxjLlJHQkEsYy5VTlNJR05FRF9CWVRFLGEuc291cmNlKSxjLnRleFBhcmFtZXRlcmkoYy5URVhUVVJFXzJELGMuVEVYVFVSRV9NQUdfRklMVEVSLGEuc2NhbGVNb2RlPT09Yi5zY2FsZU1vZGVzLkxJTkVBUj9jLkxJTkVBUjpjLk5FQVJFU1QpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX01JTl9GSUxURVIsYS5zY2FsZU1vZGU9PT1iLnNjYWxlTW9kZXMuTElORUFSP2MuTElORUFSOmMuTkVBUkVTVCksYS5fcG93ZXJPZjI/KGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfUyxjLlJFUEVBVCksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV8yRCxjLlRFWFRVUkVfV1JBUF9ULGMuUkVQRUFUKSk6KGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfUyxjLkNMQU1QX1RPX0VER0UpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfVCxjLkNMQU1QX1RPX0VER0UpKSxhLl9kaXJ0eVtjLmlkXT0hMSxhLl9nbFRleHR1cmVzW2MuaWRdfX0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5oYW5kbGVDb250ZXh0TG9zdD1mdW5jdGlvbihhKXthLnByZXZlbnREZWZhdWx0KCksdGhpcy5jb250ZXh0TG9zdD0hMH0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5oYW5kbGVDb250ZXh0UmVzdG9yZWQ9ZnVuY3Rpb24oKXt0aGlzLmluaXRDb250ZXh0KCk7Zm9yKHZhciBhIGluIGIuVGV4dHVyZUNhY2hlKXt2YXIgYz1iLlRleHR1cmVDYWNoZVthXS5iYXNlVGV4dHVyZTtjLl9nbFRleHR1cmVzPVtdfXRoaXMuY29udGV4dExvc3Q9ITF9LGIuV2ViR0xSZW5kZXJlci5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMudmlldy5yZW1vdmVFdmVudExpc3RlbmVyKFwid2ViZ2xjb250ZXh0bG9zdFwiLHRoaXMuY29udGV4dExvc3RCb3VuZCksdGhpcy52aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ3ZWJnbGNvbnRleHRyZXN0b3JlZFwiLHRoaXMuY29udGV4dFJlc3RvcmVkQm91bmQpLGIuZ2xDb250ZXh0c1t0aGlzLmdsQ29udGV4dElkXT1udWxsLHRoaXMucHJvamVjdGlvbj1udWxsLHRoaXMub2Zmc2V0PW51bGwsdGhpcy5zaGFkZXJNYW5hZ2VyLmRlc3Ryb3koKSx0aGlzLnNwcml0ZUJhdGNoLmRlc3Ryb3koKSx0aGlzLm1hc2tNYW5hZ2VyLmRlc3Ryb3koKSx0aGlzLmZpbHRlck1hbmFnZXIuZGVzdHJveSgpLHRoaXMuc2hhZGVyTWFuYWdlcj1udWxsLHRoaXMuc3ByaXRlQmF0Y2g9bnVsbCx0aGlzLm1hc2tNYW5hZ2VyPW51bGwsdGhpcy5maWx0ZXJNYW5hZ2VyPW51bGwsdGhpcy5nbD1udWxsLHRoaXMucmVuZGVyU2Vzc2lvbj1udWxsfSxiLldlYkdMUmVuZGVyZXIucHJvdG90eXBlLm1hcEJsZW5kTW9kZXM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO2IuYmxlbmRNb2Rlc1dlYkdMfHwoYi5ibGVuZE1vZGVzV2ViR0w9W10sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLk5PUk1BTF09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLkFERF09W2EuU1JDX0FMUEhBLGEuRFNUX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuTVVMVElQTFldPVthLkRTVF9DT0xPUixhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5TQ1JFRU5dPVthLlNSQ19BTFBIQSxhLk9ORV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLk9WRVJMQVldPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5EQVJLRU5dPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5MSUdIVEVOXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuQ09MT1JfRE9ER0VdPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5DT0xPUl9CVVJOXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuSEFSRF9MSUdIVF09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLlNPRlRfTElHSFRdPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5ESUZGRVJFTkNFXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuRVhDTFVTSU9OXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuSFVFXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuU0FUVVJBVElPTl09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLkNPTE9SXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuTFVNSU5PU0lUWV09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0pfSxiLldlYkdMUmVuZGVyZXIuZ2xDb250ZXh0SWQ9MCxiLldlYkdMQmxlbmRNb2RlTWFuYWdlcj1mdW5jdGlvbigpe3RoaXMuY3VycmVudEJsZW5kTW9kZT05OTk5OX0sYi5XZWJHTEJsZW5kTW9kZU1hbmFnZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuV2ViR0xCbGVuZE1vZGVNYW5hZ2VyLGIuV2ViR0xCbGVuZE1vZGVNYW5hZ2VyLnByb3RvdHlwZS5zZXRDb250ZXh0PWZ1bmN0aW9uKGEpe3RoaXMuZ2w9YX0sYi5XZWJHTEJsZW5kTW9kZU1hbmFnZXIucHJvdG90eXBlLnNldEJsZW5kTW9kZT1mdW5jdGlvbihhKXtpZih0aGlzLmN1cnJlbnRCbGVuZE1vZGU9PT1hKXJldHVybiExO3RoaXMuY3VycmVudEJsZW5kTW9kZT1hO3ZhciBjPWIuYmxlbmRNb2Rlc1dlYkdMW3RoaXMuY3VycmVudEJsZW5kTW9kZV07cmV0dXJuIHRoaXMuZ2wuYmxlbmRGdW5jKGNbMF0sY1sxXSksITB9LGIuV2ViR0xCbGVuZE1vZGVNYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbD1udWxsfSxiLldlYkdMTWFza01hbmFnZXI9ZnVuY3Rpb24oKXt9LGIuV2ViR0xNYXNrTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5XZWJHTE1hc2tNYW5hZ2VyLGIuV2ViR0xNYXNrTWFuYWdlci5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWF9LGIuV2ViR0xNYXNrTWFuYWdlci5wcm90b3R5cGUucHVzaE1hc2s9ZnVuY3Rpb24oYSxjKXt2YXIgZD1jLmdsO2EuZGlydHkmJmIuV2ViR0xHcmFwaGljcy51cGRhdGVHcmFwaGljcyhhLGQpLGEuX3dlYkdMW2QuaWRdLmRhdGEubGVuZ3RoJiZjLnN0ZW5jaWxNYW5hZ2VyLnB1c2hTdGVuY2lsKGEsYS5fd2ViR0xbZC5pZF0uZGF0YVswXSxjKX0sYi5XZWJHTE1hc2tNYW5hZ2VyLnByb3RvdHlwZS5wb3BNYXNrPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5nbDtiLnN0ZW5jaWxNYW5hZ2VyLnBvcFN0ZW5jaWwoYSxhLl93ZWJHTFtjLmlkXS5kYXRhWzBdLGIpfSxiLldlYkdMTWFza01hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmdsPW51bGx9LGIuV2ViR0xTdGVuY2lsTWFuYWdlcj1mdW5jdGlvbigpe3RoaXMuc3RlbmNpbFN0YWNrPVtdLHRoaXMucmV2ZXJzZT0hMCx0aGlzLmNvdW50PTB9LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWF9LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUucHVzaFN0ZW5jaWw9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMuZ2w7dGhpcy5iaW5kR3JhcGhpY3MoYSxiLGMpLDA9PT10aGlzLnN0ZW5jaWxTdGFjay5sZW5ndGgmJihkLmVuYWJsZShkLlNURU5DSUxfVEVTVCksZC5jbGVhcihkLlNURU5DSUxfQlVGRkVSX0JJVCksdGhpcy5yZXZlcnNlPSEwLHRoaXMuY291bnQ9MCksdGhpcy5zdGVuY2lsU3RhY2sucHVzaChiKTt2YXIgZT10aGlzLmNvdW50O2QuY29sb3JNYXNrKCExLCExLCExLCExKSxkLnN0ZW5jaWxGdW5jKGQuQUxXQVlTLDAsMjU1KSxkLnN0ZW5jaWxPcChkLktFRVAsZC5LRUVQLGQuSU5WRVJUKSwxPT09Yi5tb2RlPyhkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX0ZBTixiLmluZGljZXMubGVuZ3RoLTQsZC5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLnJldmVyc2U/KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtZSwyNTUpLGQuc3RlbmNpbE9wKGQuS0VFUCxkLktFRVAsZC5ERUNSKSk6KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCxlLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLklOQ1IpKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX0ZBTiw0LGQuVU5TSUdORURfU0hPUlQsMiooYi5pbmRpY2VzLmxlbmd0aC00KSksdGhpcy5yZXZlcnNlP2Quc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtKGUrMSksMjU1KTpkLnN0ZW5jaWxGdW5jKGQuRVFVQUwsZSsxLDI1NSksdGhpcy5yZXZlcnNlPSF0aGlzLnJldmVyc2UpOih0aGlzLnJldmVyc2U/KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCxlLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLklOQ1IpKTooZC5zdGVuY2lsRnVuYyhkLkVRVUFMLDI1NS1lLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLkRFQ1IpKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX1NUUklQLGIuaW5kaWNlcy5sZW5ndGgsZC5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLnJldmVyc2U/ZC5zdGVuY2lsRnVuYyhkLkVRVUFMLGUrMSwyNTUpOmQuc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtKGUrMSksMjU1KSksZC5jb2xvck1hc2soITAsITAsITAsITApLGQuc3RlbmNpbE9wKGQuS0VFUCxkLktFRVAsZC5LRUVQKSx0aGlzLmNvdW50Kyt9LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUuYmluZEdyYXBoaWNzPWZ1bmN0aW9uKGEsYyxkKXt0aGlzLl9jdXJyZW50R3JhcGhpY3M9YTt2YXIgZSxmPXRoaXMuZ2wsZz1kLnByb2plY3Rpb24saD1kLm9mZnNldDsxPT09Yy5tb2RlPyhlPWQuc2hhZGVyTWFuYWdlci5jb21wbGV4UHJpbWl0aXZlU2hhZGVyLGQuc2hhZGVyTWFuYWdlci5zZXRTaGFkZXIoZSksZi51bmlmb3JtTWF0cml4M2Z2KGUudHJhbnNsYXRpb25NYXRyaXgsITEsYS53b3JsZFRyYW5zZm9ybS50b0FycmF5KCEwKSksZi51bmlmb3JtMmYoZS5wcm9qZWN0aW9uVmVjdG9yLGcueCwtZy55KSxmLnVuaWZvcm0yZihlLm9mZnNldFZlY3RvciwtaC54LC1oLnkpLGYudW5pZm9ybTNmdihlLnRpbnRDb2xvcixiLmhleDJyZ2IoYS50aW50KSksZi51bmlmb3JtM2Z2KGUuY29sb3IsYy5jb2xvciksZi51bmlmb3JtMWYoZS5hbHBoYSxhLndvcmxkQWxwaGEqYy5hbHBoYSksZi5iaW5kQnVmZmVyKGYuQVJSQVlfQlVGRkVSLGMuYnVmZmVyKSxmLnZlcnRleEF0dHJpYlBvaW50ZXIoZS5hVmVydGV4UG9zaXRpb24sMixmLkZMT0FULCExLDgsMCksZi5iaW5kQnVmZmVyKGYuRUxFTUVOVF9BUlJBWV9CVUZGRVIsYy5pbmRleEJ1ZmZlcikpOihlPWQuc2hhZGVyTWFuYWdlci5wcmltaXRpdmVTaGFkZXIsZC5zaGFkZXJNYW5hZ2VyLnNldFNoYWRlcihlKSxmLnVuaWZvcm1NYXRyaXgzZnYoZS50cmFuc2xhdGlvbk1hdHJpeCwhMSxhLndvcmxkVHJhbnNmb3JtLnRvQXJyYXkoITApKSxmLnVuaWZvcm0yZihlLnByb2plY3Rpb25WZWN0b3IsZy54LC1nLnkpLGYudW5pZm9ybTJmKGUub2Zmc2V0VmVjdG9yLC1oLngsLWgueSksZi51bmlmb3JtM2Z2KGUudGludENvbG9yLGIuaGV4MnJnYihhLnRpbnQpKSxmLnVuaWZvcm0xZihlLmFscGhhLGEud29ybGRBbHBoYSksZi5iaW5kQnVmZmVyKGYuQVJSQVlfQlVGRkVSLGMuYnVmZmVyKSxmLnZlcnRleEF0dHJpYlBvaW50ZXIoZS5hVmVydGV4UG9zaXRpb24sMixmLkZMT0FULCExLDI0LDApLGYudmVydGV4QXR0cmliUG9pbnRlcihlLmNvbG9yQXR0cmlidXRlLDQsZi5GTE9BVCwhMSwyNCw4KSxmLmJpbmRCdWZmZXIoZi5FTEVNRU5UX0FSUkFZX0JVRkZFUixjLmluZGV4QnVmZmVyKSl9LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUucG9wU3RlbmNpbD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcy5nbDtpZih0aGlzLnN0ZW5jaWxTdGFjay5wb3AoKSx0aGlzLmNvdW50LS0sMD09PXRoaXMuc3RlbmNpbFN0YWNrLmxlbmd0aClkLmRpc2FibGUoZC5TVEVOQ0lMX1RFU1QpO2Vsc2V7dmFyIGU9dGhpcy5jb3VudDt0aGlzLmJpbmRHcmFwaGljcyhhLGIsYyksZC5jb2xvck1hc2soITEsITEsITEsITEpLDE9PT1iLm1vZGU/KHRoaXMucmV2ZXJzZT0hdGhpcy5yZXZlcnNlLHRoaXMucmV2ZXJzZT8oZC5zdGVuY2lsRnVuYyhkLkVRVUFMLDI1NS0oZSsxKSwyNTUpLGQuc3RlbmNpbE9wKGQuS0VFUCxkLktFRVAsZC5JTkNSKSk6KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCxlKzEsMjU1KSxkLnN0ZW5jaWxPcChkLktFRVAsZC5LRUVQLGQuREVDUikpLGQuZHJhd0VsZW1lbnRzKGQuVFJJQU5HTEVfRkFOLDQsZC5VTlNJR05FRF9TSE9SVCwyKihiLmluZGljZXMubGVuZ3RoLTQpKSxkLnN0ZW5jaWxGdW5jKGQuQUxXQVlTLDAsMjU1KSxkLnN0ZW5jaWxPcChkLktFRVAsZC5LRUVQLGQuSU5WRVJUKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX0ZBTixiLmluZGljZXMubGVuZ3RoLTQsZC5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLnJldmVyc2U/ZC5zdGVuY2lsRnVuYyhkLkVRVUFMLGUsMjU1KTpkLnN0ZW5jaWxGdW5jKGQuRVFVQUwsMjU1LWUsMjU1KSk6KHRoaXMucmV2ZXJzZT8oZC5zdGVuY2lsRnVuYyhkLkVRVUFMLGUrMSwyNTUpLGQuc3RlbmNpbE9wKGQuS0VFUCxkLktFRVAsZC5ERUNSKSk6KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtKGUrMSksMjU1KSxkLnN0ZW5jaWxPcChkLktFRVAsZC5LRUVQLGQuSU5DUikpLGQuZHJhd0VsZW1lbnRzKGQuVFJJQU5HTEVfU1RSSVAsYi5pbmRpY2VzLmxlbmd0aCxkLlVOU0lHTkVEX1NIT1JULDApLHRoaXMucmV2ZXJzZT9kLnN0ZW5jaWxGdW5jKGQuRVFVQUwsZSwyNTUpOmQuc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtZSwyNTUpKSxkLmNvbG9yTWFzayghMCwhMCwhMCwhMCksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLktFRVApfX0sYi5XZWJHTFN0ZW5jaWxNYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5zdGVuY2lsU3RhY2s9bnVsbCx0aGlzLmdsPW51bGx9LGIuV2ViR0xTaGFkZXJNYW5hZ2VyPWZ1bmN0aW9uKCl7dGhpcy5tYXhBdHRpYnM9MTAsdGhpcy5hdHRyaWJTdGF0ZT1bXSx0aGlzLnRlbXBBdHRyaWJTdGF0ZT1bXTtmb3IodmFyIGE9MDthPHRoaXMubWF4QXR0aWJzO2ErKyl0aGlzLmF0dHJpYlN0YXRlW2FdPSExO3RoaXMuc3RhY2s9W119LGIuV2ViR0xTaGFkZXJNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLldlYkdMU2hhZGVyTWFuYWdlcixiLldlYkdMU2hhZGVyTWFuYWdlci5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy5wcmltaXRpdmVTaGFkZXI9bmV3IGIuUHJpbWl0aXZlU2hhZGVyKGEpLHRoaXMuY29tcGxleFByaW1pdGl2ZVNoYWRlcj1uZXcgYi5Db21wbGV4UHJpbWl0aXZlU2hhZGVyKGEpLHRoaXMuZGVmYXVsdFNoYWRlcj1uZXcgYi5QaXhpU2hhZGVyKGEpLHRoaXMuZmFzdFNoYWRlcj1uZXcgYi5QaXhpRmFzdFNoYWRlcihhKSx0aGlzLnN0cmlwU2hhZGVyPW5ldyBiLlN0cmlwU2hhZGVyKGEpLHRoaXMuc2V0U2hhZGVyKHRoaXMuZGVmYXVsdFNoYWRlcil9LGIuV2ViR0xTaGFkZXJNYW5hZ2VyLnByb3RvdHlwZS5zZXRBdHRyaWJzPWZ1bmN0aW9uKGEpe3ZhciBiO2ZvcihiPTA7Yjx0aGlzLnRlbXBBdHRyaWJTdGF0ZS5sZW5ndGg7YisrKXRoaXMudGVtcEF0dHJpYlN0YXRlW2JdPSExO2ZvcihiPTA7YjxhLmxlbmd0aDtiKyspe3ZhciBjPWFbYl07dGhpcy50ZW1wQXR0cmliU3RhdGVbY109ITB9dmFyIGQ9dGhpcy5nbDtmb3IoYj0wO2I8dGhpcy5hdHRyaWJTdGF0ZS5sZW5ndGg7YisrKXRoaXMuYXR0cmliU3RhdGVbYl0hPT10aGlzLnRlbXBBdHRyaWJTdGF0ZVtiXSYmKHRoaXMuYXR0cmliU3RhdGVbYl09dGhpcy50ZW1wQXR0cmliU3RhdGVbYl0sdGhpcy50ZW1wQXR0cmliU3RhdGVbYl0/ZC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShiKTpkLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShiKSl9LGIuV2ViR0xTaGFkZXJNYW5hZ2VyLnByb3RvdHlwZS5zZXRTaGFkZXI9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX2N1cnJlbnRJZD09PWEuX1VJRD8hMToodGhpcy5fY3VycmVudElkPWEuX1VJRCx0aGlzLmN1cnJlbnRTaGFkZXI9YSx0aGlzLmdsLnVzZVByb2dyYW0oYS5wcm9ncmFtKSx0aGlzLnNldEF0dHJpYnMoYS5hdHRyaWJ1dGVzKSwhMCl9LGIuV2ViR0xTaGFkZXJNYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5hdHRyaWJTdGF0ZT1udWxsLHRoaXMudGVtcEF0dHJpYlN0YXRlPW51bGwsdGhpcy5wcmltaXRpdmVTaGFkZXIuZGVzdHJveSgpLHRoaXMuY29tcGxleFByaW1pdGl2ZVNoYWRlci5kZXN0cm95KCksdGhpcy5kZWZhdWx0U2hhZGVyLmRlc3Ryb3koKSx0aGlzLmZhc3RTaGFkZXIuZGVzdHJveSgpLHRoaXMuc3RyaXBTaGFkZXIuZGVzdHJveSgpLHRoaXMuZ2w9bnVsbH0sYi5XZWJHTFNwcml0ZUJhdGNoPWZ1bmN0aW9uKCl7dGhpcy52ZXJ0U2l6ZT02LHRoaXMuc2l6ZT0yZTM7dmFyIGE9NCp0aGlzLnNpemUqdGhpcy52ZXJ0U2l6ZSxjPTYqdGhpcy5zaXplO3RoaXMudmVydGljZXM9bmV3IGIuRmxvYXQzMkFycmF5KGEpLHRoaXMuaW5kaWNlcz1uZXcgYi5VaW50MTZBcnJheShjKSx0aGlzLmxhc3RJbmRleENvdW50PTA7Zm9yKHZhciBkPTAsZT0wO2M+ZDtkKz02LGUrPTQpdGhpcy5pbmRpY2VzW2QrMF09ZSswLHRoaXMuaW5kaWNlc1tkKzFdPWUrMSx0aGlzLmluZGljZXNbZCsyXT1lKzIsdGhpcy5pbmRpY2VzW2QrM109ZSswLHRoaXMuaW5kaWNlc1tkKzRdPWUrMix0aGlzLmluZGljZXNbZCs1XT1lKzM7dGhpcy5kcmF3aW5nPSExLHRoaXMuY3VycmVudEJhdGNoU2l6ZT0wLHRoaXMuY3VycmVudEJhc2VUZXh0dXJlPW51bGwsdGhpcy5kaXJ0eT0hMCx0aGlzLnRleHR1cmVzPVtdLHRoaXMuYmxlbmRNb2Rlcz1bXSx0aGlzLnNoYWRlcnM9W10sdGhpcy5zcHJpdGVzPVtdLHRoaXMuZGVmYXVsdFNoYWRlcj1uZXcgYi5BYnN0cmFjdEZpbHRlcihbXCJwcmVjaXNpb24gbG93cCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCkgKiB2Q29sb3IgO1wiLFwifVwiXSl9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy52ZXJ0ZXhCdWZmZXI9YS5jcmVhdGVCdWZmZXIoKSx0aGlzLmluZGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksYS5iaW5kQnVmZmVyKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRpY2VzLGEuU1RBVElDX0RSQVcpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuQVJSQVlfQlVGRkVSLHRoaXMudmVydGljZXMsYS5EWU5BTUlDX0RSQVcpLHRoaXMuY3VycmVudEJsZW5kTW9kZT05OTk5OTt2YXIgYz1uZXcgYi5QaXhpU2hhZGVyKGEpO2MuZnJhZ21lbnRTcmM9dGhpcy5kZWZhdWx0U2hhZGVyLmZyYWdtZW50U3JjLGMudW5pZm9ybXM9e30sYy5pbml0KCksdGhpcy5kZWZhdWx0U2hhZGVyLnNoYWRlcnNbYS5pZF09Y30sYi5XZWJHTFNwcml0ZUJhdGNoLnByb3RvdHlwZS5iZWdpbj1mdW5jdGlvbihhKXt0aGlzLnJlbmRlclNlc3Npb249YSx0aGlzLnNoYWRlcj10aGlzLnJlbmRlclNlc3Npb24uc2hhZGVyTWFuYWdlci5kZWZhdWx0U2hhZGVyLHRoaXMuc3RhcnQoKX0sYi5XZWJHTFNwcml0ZUJhdGNoLnByb3RvdHlwZS5lbmQ9ZnVuY3Rpb24oKXt0aGlzLmZsdXNoKCl9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGEpe3ZhciBiPWEudGV4dHVyZTt0aGlzLmN1cnJlbnRCYXRjaFNpemU+PXRoaXMuc2l6ZSYmKHRoaXMuZmx1c2goKSx0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZT1iLmJhc2VUZXh0dXJlKTt2YXIgYz1iLl91dnM7aWYoYyl7dmFyIGQsZSxmLGcsaD1hLndvcmxkQWxwaGEsaT1hLnRpbnQsaj10aGlzLnZlcnRpY2VzLGs9YS5hbmNob3IueCxsPWEuYW5jaG9yLnk7aWYoYi50cmltKXt2YXIgbT1iLnRyaW07ZT1tLngtayptLndpZHRoLGQ9ZStiLmNyb3Aud2lkdGgsZz1tLnktbCptLmhlaWdodCxmPWcrYi5jcm9wLmhlaWdodH1lbHNlIGQ9Yi5mcmFtZS53aWR0aCooMS1rKSxlPWIuZnJhbWUud2lkdGgqLWssZj1iLmZyYW1lLmhlaWdodCooMS1sKSxnPWIuZnJhbWUuaGVpZ2h0Ki1sO3ZhciBuPTQqdGhpcy5jdXJyZW50QmF0Y2hTaXplKnRoaXMudmVydFNpemUsbz1iLmJhc2VUZXh0dXJlLnJlc29sdXRpb24scD1hLndvcmxkVHJhbnNmb3JtLHE9cC5hL28scj1wLmIvbyxzPXAuYy9vLHQ9cC5kL28sdT1wLnR4LHY9cC50eTtqW24rK109cSplK3MqZyt1LGpbbisrXT10KmcrciplK3YsaltuKytdPWMueDAsaltuKytdPWMueTAsaltuKytdPWgsaltuKytdPWksaltuKytdPXEqZCtzKmcrdSxqW24rK109dCpnK3IqZCt2LGpbbisrXT1jLngxLGpbbisrXT1jLnkxLGpbbisrXT1oLGpbbisrXT1pLGpbbisrXT1xKmQrcypmK3UsaltuKytdPXQqZityKmQrdixqW24rK109Yy54MixqW24rK109Yy55MixqW24rK109aCxqW24rK109aSxqW24rK109cSplK3MqZit1LGpbbisrXT10KmYrciplK3YsaltuKytdPWMueDMsaltuKytdPWMueTMsaltuKytdPWgsaltuKytdPWksdGhpcy5zcHJpdGVzW3RoaXMuY3VycmVudEJhdGNoU2l6ZSsrXT1hfX0sYi5XZWJHTFNwcml0ZUJhdGNoLnByb3RvdHlwZS5yZW5kZXJUaWxpbmdTcHJpdGU9ZnVuY3Rpb24oYSl7dmFyIGM9YS50aWxpbmdUZXh0dXJlO3RoaXMuY3VycmVudEJhdGNoU2l6ZT49dGhpcy5zaXplJiYodGhpcy5mbHVzaCgpLHRoaXMuY3VycmVudEJhc2VUZXh0dXJlPWMuYmFzZVRleHR1cmUpLGEuX3V2c3x8KGEuX3V2cz1uZXcgYi5UZXh0dXJlVXZzKTt2YXIgZD1hLl91dnM7YS50aWxlUG9zaXRpb24ueCU9Yy5iYXNlVGV4dHVyZS53aWR0aCphLnRpbGVTY2FsZU9mZnNldC54LGEudGlsZVBvc2l0aW9uLnklPWMuYmFzZVRleHR1cmUuaGVpZ2h0KmEudGlsZVNjYWxlT2Zmc2V0Lnk7dmFyIGU9YS50aWxlUG9zaXRpb24ueC8oYy5iYXNlVGV4dHVyZS53aWR0aCphLnRpbGVTY2FsZU9mZnNldC54KSxmPWEudGlsZVBvc2l0aW9uLnkvKGMuYmFzZVRleHR1cmUuaGVpZ2h0KmEudGlsZVNjYWxlT2Zmc2V0LnkpLGc9YS53aWR0aC9jLmJhc2VUZXh0dXJlLndpZHRoLyhhLnRpbGVTY2FsZS54KmEudGlsZVNjYWxlT2Zmc2V0LngpLGg9YS5oZWlnaHQvYy5iYXNlVGV4dHVyZS5oZWlnaHQvKGEudGlsZVNjYWxlLnkqYS50aWxlU2NhbGVPZmZzZXQueSk7ZC54MD0wLWUsZC55MD0wLWYsZC54MT0xKmctZSxkLnkxPTAtZixkLngyPTEqZy1lLGQueTI9MSpoLWYsZC54Mz0wLWUsZC55Mz0xKmgtZjt2YXIgaT1hLndvcmxkQWxwaGEsaj1hLnRpbnQsaz10aGlzLnZlcnRpY2VzLGw9YS53aWR0aCxtPWEuaGVpZ2h0LG49YS5hbmNob3IueCxvPWEuYW5jaG9yLnkscD1sKigxLW4pLHE9bCotbixyPW0qKDEtbykscz1tKi1vLHQ9NCp0aGlzLmN1cnJlbnRCYXRjaFNpemUqdGhpcy52ZXJ0U2l6ZSx1PWMuYmFzZVRleHR1cmUucmVzb2x1dGlvbix2PWEud29ybGRUcmFuc2Zvcm0sdz12LmEvdSx4PXYuYi91LHk9di5jL3Usej12LmQvdSxBPXYudHgsQj12LnR5O2tbdCsrXT13KnEreSpzK0Esa1t0KytdPXoqcyt4KnErQixrW3QrK109ZC54MCxrW3QrK109ZC55MCxrW3QrK109aSxrW3QrK109aixrW3QrK109dypwK3kqcytBLGtbdCsrXT16KnMreCpwK0Isa1t0KytdPWQueDEsa1t0KytdPWQueTEsa1t0KytdPWksa1t0KytdPWosa1t0KytdPXcqcCt5KnIrQSxrW3QrK109eipyK3gqcCtCLGtbdCsrXT1kLngyLGtbdCsrXT1kLnkyLGtbdCsrXT1pLGtbdCsrXT1qLGtbdCsrXT13KnEreSpyK0Esa1t0KytdPXoqcit4KnErQixrW3QrK109ZC54MyxrW3QrK109ZC55MyxrW3QrK109aSxrW3QrK109aix0aGlzLnNwcml0ZXNbdGhpcy5jdXJyZW50QmF0Y2hTaXplKytdPWF9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUuZmx1c2g9ZnVuY3Rpb24oKXtpZigwIT09dGhpcy5jdXJyZW50QmF0Y2hTaXplKXt2YXIgYSxjPXRoaXMuZ2w7aWYodGhpcy5kaXJ0eSl7dGhpcy5kaXJ0eT0hMSxjLmFjdGl2ZVRleHR1cmUoYy5URVhUVVJFMCksYy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLHRoaXMudmVydGV4QnVmZmVyKSxjLmJpbmRCdWZmZXIoYy5FTEVNRU5UX0FSUkFZX0JVRkZFUix0aGlzLmluZGV4QnVmZmVyKSxhPXRoaXMuZGVmYXVsdFNoYWRlci5zaGFkZXJzW2MuaWRdO3ZhciBkPTQqdGhpcy52ZXJ0U2l6ZTtjLnZlcnRleEF0dHJpYlBvaW50ZXIoYS5hVmVydGV4UG9zaXRpb24sMixjLkZMT0FULCExLGQsMCksYy52ZXJ0ZXhBdHRyaWJQb2ludGVyKGEuYVRleHR1cmVDb29yZCwyLGMuRkxPQVQsITEsZCw4KSxjLnZlcnRleEF0dHJpYlBvaW50ZXIoYS5jb2xvckF0dHJpYnV0ZSwyLGMuRkxPQVQsITEsZCwxNil9aWYodGhpcy5jdXJyZW50QmF0Y2hTaXplPi41KnRoaXMuc2l6ZSljLmJ1ZmZlclN1YkRhdGEoYy5BUlJBWV9CVUZGRVIsMCx0aGlzLnZlcnRpY2VzKTtlbHNle3ZhciBlPXRoaXMudmVydGljZXMuc3ViYXJyYXkoMCw0KnRoaXMuY3VycmVudEJhdGNoU2l6ZSp0aGlzLnZlcnRTaXplKTtjLmJ1ZmZlclN1YkRhdGEoYy5BUlJBWV9CVUZGRVIsMCxlKX1mb3IodmFyIGYsZyxoLGksaj0wLGs9MCxsPW51bGwsbT10aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5jdXJyZW50QmxlbmRNb2RlLG49bnVsbCxvPSExLHA9ITEscT0wLHI9dGhpcy5jdXJyZW50QmF0Y2hTaXplO3I+cTtxKyspe2lmKGk9dGhpcy5zcHJpdGVzW3FdLGY9aS50ZXh0dXJlLmJhc2VUZXh0dXJlLGc9aS5ibGVuZE1vZGUsaD1pLnNoYWRlcnx8dGhpcy5kZWZhdWx0U2hhZGVyLG89bSE9PWcscD1uIT09aCwobCE9PWZ8fG98fHApJiYodGhpcy5yZW5kZXJCYXRjaChsLGosayksaz1xLGo9MCxsPWYsbyYmKG09Zyx0aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5zZXRCbGVuZE1vZGUobSkpLHApKXtuPWgsYT1uLnNoYWRlcnNbYy5pZF0sYXx8KGE9bmV3IGIuUGl4aVNoYWRlcihjKSxhLmZyYWdtZW50U3JjPW4uZnJhZ21lbnRTcmMsYS51bmlmb3Jtcz1uLnVuaWZvcm1zLGEuaW5pdCgpLG4uc2hhZGVyc1tjLmlkXT1hKSx0aGlzLnJlbmRlclNlc3Npb24uc2hhZGVyTWFuYWdlci5zZXRTaGFkZXIoYSksYS5kaXJ0eSYmYS5zeW5jVW5pZm9ybXMoKTt2YXIgcz10aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbjtjLnVuaWZvcm0yZihhLnByb2plY3Rpb25WZWN0b3Iscy54LHMueSk7dmFyIHQ9dGhpcy5yZW5kZXJTZXNzaW9uLm9mZnNldDtjLnVuaWZvcm0yZihhLm9mZnNldFZlY3Rvcix0LngsdC55KX1qKyt9dGhpcy5yZW5kZXJCYXRjaChsLGosayksdGhpcy5jdXJyZW50QmF0Y2hTaXplPTB9fSxiLldlYkdMU3ByaXRlQmF0Y2gucHJvdG90eXBlLnJlbmRlckJhdGNoPWZ1bmN0aW9uKGEsYixjKXtpZigwIT09Yil7dmFyIGQ9dGhpcy5nbDthLl9kaXJ0eVtkLmlkXT90aGlzLnJlbmRlclNlc3Npb24ucmVuZGVyZXIudXBkYXRlVGV4dHVyZShhKTpkLmJpbmRUZXh0dXJlKGQuVEVYVFVSRV8yRCxhLl9nbFRleHR1cmVzW2QuaWRdKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFUyw2KmIsZC5VTlNJR05FRF9TSE9SVCw2KmMqMiksdGhpcy5yZW5kZXJTZXNzaW9uLmRyYXdDb3VudCsrfX0sYi5XZWJHTFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5mbHVzaCgpLHRoaXMuZGlydHk9ITB9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUuc3RhcnQ9ZnVuY3Rpb24oKXt0aGlzLmRpcnR5PSEwfSxiLldlYkdMU3ByaXRlQmF0Y2gucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLnZlcnRpY2VzPW51bGwsdGhpcy5pbmRpY2VzPW51bGwsdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy52ZXJ0ZXhCdWZmZXIpLHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuaW5kZXhCdWZmZXIpLHRoaXMuY3VycmVudEJhc2VUZXh0dXJlPW51bGwsdGhpcy5nbD1udWxsfSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoPWZ1bmN0aW9uKGEpe3RoaXMudmVydFNpemU9MTAsdGhpcy5tYXhTaXplPTZlMyx0aGlzLnNpemU9dGhpcy5tYXhTaXplO3ZhciBjPTQqdGhpcy5zaXplKnRoaXMudmVydFNpemUsZD02KnRoaXMubWF4U2l6ZTt0aGlzLnZlcnRpY2VzPW5ldyBiLkZsb2F0MzJBcnJheShjKSx0aGlzLmluZGljZXM9bmV3IGIuVWludDE2QXJyYXkoZCksdGhpcy52ZXJ0ZXhCdWZmZXI9bnVsbCx0aGlzLmluZGV4QnVmZmVyPW51bGwsdGhpcy5sYXN0SW5kZXhDb3VudD0wO2Zvcih2YXIgZT0wLGY9MDtkPmU7ZSs9NixmKz00KXRoaXMuaW5kaWNlc1tlKzBdPWYrMCx0aGlzLmluZGljZXNbZSsxXT1mKzEsdGhpcy5pbmRpY2VzW2UrMl09ZisyLHRoaXMuaW5kaWNlc1tlKzNdPWYrMCx0aGlzLmluZGljZXNbZSs0XT1mKzIsdGhpcy5pbmRpY2VzW2UrNV09ZiszO3RoaXMuZHJhd2luZz0hMSx0aGlzLmN1cnJlbnRCYXRjaFNpemU9MCx0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZT1udWxsLHRoaXMuY3VycmVudEJsZW5kTW9kZT0wLHRoaXMucmVuZGVyU2Vzc2lvbj1udWxsLHRoaXMuc2hhZGVyPW51bGwsdGhpcy5tYXRyaXg9bnVsbCx0aGlzLnNldENvbnRleHQoYSl9LGIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gsYi5XZWJHTEZhc3RTcHJpdGVCYXRjaC5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy52ZXJ0ZXhCdWZmZXI9YS5jcmVhdGVCdWZmZXIoKSx0aGlzLmluZGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksYS5iaW5kQnVmZmVyKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRpY2VzLGEuU1RBVElDX0RSQVcpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuQVJSQVlfQlVGRkVSLHRoaXMudmVydGljZXMsYS5EWU5BTUlDX0RSQVcpfSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5iZWdpbj1mdW5jdGlvbihhLGIpe3RoaXMucmVuZGVyU2Vzc2lvbj1iLHRoaXMuc2hhZGVyPXRoaXMucmVuZGVyU2Vzc2lvbi5zaGFkZXJNYW5hZ2VyLmZhc3RTaGFkZXIsdGhpcy5tYXRyaXg9YS53b3JsZFRyYW5zZm9ybS50b0FycmF5KCEwKSx0aGlzLnN0YXJ0KCl9LGIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmVuZD1mdW5jdGlvbigpe3RoaXMuZmx1c2goKX0sYi5XZWJHTEZhc3RTcHJpdGVCYXRjaC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGEpe3ZhciBiPWEuY2hpbGRyZW4sYz1iWzBdO2lmKGMudGV4dHVyZS5fdXZzKXt0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZT1jLnRleHR1cmUuYmFzZVRleHR1cmUsYy5ibGVuZE1vZGUhPT10aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5jdXJyZW50QmxlbmRNb2RlJiYodGhpcy5mbHVzaCgpLHRoaXMucmVuZGVyU2Vzc2lvbi5ibGVuZE1vZGVNYW5hZ2VyLnNldEJsZW5kTW9kZShjLmJsZW5kTW9kZSkpO2Zvcih2YXIgZD0wLGU9Yi5sZW5ndGg7ZT5kO2QrKyl0aGlzLnJlbmRlclNwcml0ZShiW2RdKTt0aGlzLmZsdXNoKCl9fSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5yZW5kZXJTcHJpdGU9ZnVuY3Rpb24oYSl7aWYoYS52aXNpYmxlJiYoYS50ZXh0dXJlLmJhc2VUZXh0dXJlPT09dGhpcy5jdXJyZW50QmFzZVRleHR1cmV8fCh0aGlzLmZsdXNoKCksdGhpcy5jdXJyZW50QmFzZVRleHR1cmU9YS50ZXh0dXJlLmJhc2VUZXh0dXJlLGEudGV4dHVyZS5fdXZzKSkpe3ZhciBiLGMsZCxlLGYsZyxoLGksaj10aGlzLnZlcnRpY2VzO2lmKGI9YS50ZXh0dXJlLl91dnMsYz1hLnRleHR1cmUuZnJhbWUud2lkdGgsZD1hLnRleHR1cmUuZnJhbWUuaGVpZ2h0LGEudGV4dHVyZS50cmltKXt2YXIgaz1hLnRleHR1cmUudHJpbTtmPWsueC1hLmFuY2hvci54Kmsud2lkdGgsZT1mK2EudGV4dHVyZS5jcm9wLndpZHRoLGg9ay55LWEuYW5jaG9yLnkqay5oZWlnaHQsZz1oK2EudGV4dHVyZS5jcm9wLmhlaWdodH1lbHNlIGU9YS50ZXh0dXJlLmZyYW1lLndpZHRoKigxLWEuYW5jaG9yLngpLGY9YS50ZXh0dXJlLmZyYW1lLndpZHRoKi1hLmFuY2hvci54LGc9YS50ZXh0dXJlLmZyYW1lLmhlaWdodCooMS1hLmFuY2hvci55KSxoPWEudGV4dHVyZS5mcmFtZS5oZWlnaHQqLWEuYW5jaG9yLnk7aT00KnRoaXMuY3VycmVudEJhdGNoU2l6ZSp0aGlzLnZlcnRTaXplLGpbaSsrXT1mLGpbaSsrXT1oLGpbaSsrXT1hLnBvc2l0aW9uLngsaltpKytdPWEucG9zaXRpb24ueSxqW2krK109YS5zY2FsZS54LGpbaSsrXT1hLnNjYWxlLnksaltpKytdPWEucm90YXRpb24saltpKytdPWIueDAsaltpKytdPWIueTEsaltpKytdPWEuYWxwaGEsaltpKytdPWUsaltpKytdPWgsaltpKytdPWEucG9zaXRpb24ueCxqW2krK109YS5wb3NpdGlvbi55LGpbaSsrXT1hLnNjYWxlLngsaltpKytdPWEuc2NhbGUueSxqW2krK109YS5yb3RhdGlvbixqW2krK109Yi54MSxqW2krK109Yi55MSxqW2krK109YS5hbHBoYSxqW2krK109ZSxqW2krK109ZyxqW2krK109YS5wb3NpdGlvbi54LGpbaSsrXT1hLnBvc2l0aW9uLnksaltpKytdPWEuc2NhbGUueCxqW2krK109YS5zY2FsZS55LGpbaSsrXT1hLnJvdGF0aW9uLGpbaSsrXT1iLngyLGpbaSsrXT1iLnkyLGpbaSsrXT1hLmFscGhhLGpbaSsrXT1mLGpbaSsrXT1nLGpbaSsrXT1hLnBvc2l0aW9uLngsaltpKytdPWEucG9zaXRpb24ueSxqW2krK109YS5zY2FsZS54LGpbaSsrXT1hLnNjYWxlLnksaltpKytdPWEucm90YXRpb24saltpKytdPWIueDMsaltpKytdPWIueTMsaltpKytdPWEuYWxwaGEsdGhpcy5jdXJyZW50QmF0Y2hTaXplKyssdGhpcy5jdXJyZW50QmF0Y2hTaXplPj10aGlzLnNpemUmJnRoaXMuZmx1c2goKX19LGIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmZsdXNoPWZ1bmN0aW9uKCl7aWYoMCE9PXRoaXMuY3VycmVudEJhdGNoU2l6ZSl7dmFyIGE9dGhpcy5nbDtpZih0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZS5fZ2xUZXh0dXJlc1thLmlkXXx8dGhpcy5yZW5kZXJTZXNzaW9uLnJlbmRlcmVyLnVwZGF0ZVRleHR1cmUodGhpcy5jdXJyZW50QmFzZVRleHR1cmUsYSksYS5iaW5kVGV4dHVyZShhLlRFWFRVUkVfMkQsdGhpcy5jdXJyZW50QmFzZVRleHR1cmUuX2dsVGV4dHVyZXNbYS5pZF0pLHRoaXMuY3VycmVudEJhdGNoU2l6ZT4uNSp0aGlzLnNpemUpYS5idWZmZXJTdWJEYXRhKGEuQVJSQVlfQlVGRkVSLDAsdGhpcy52ZXJ0aWNlcyk7ZWxzZXt2YXIgYj10aGlzLnZlcnRpY2VzLnN1YmFycmF5KDAsNCp0aGlzLmN1cnJlbnRCYXRjaFNpemUqdGhpcy52ZXJ0U2l6ZSk7YS5idWZmZXJTdWJEYXRhKGEuQVJSQVlfQlVGRkVSLDAsYil9YS5kcmF3RWxlbWVudHMoYS5UUklBTkdMRVMsNip0aGlzLmN1cnJlbnRCYXRjaFNpemUsYS5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLmN1cnJlbnRCYXRjaFNpemU9MCx0aGlzLnJlbmRlclNlc3Npb24uZHJhd0NvdW50Kyt9fSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5mbHVzaCgpfSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zdGFydD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2w7YS5hY3RpdmVUZXh0dXJlKGEuVEVYVFVSRTApLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5iaW5kQnVmZmVyKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRleEJ1ZmZlcik7dmFyIGI9dGhpcy5yZW5kZXJTZXNzaW9uLnByb2plY3Rpb247YS51bmlmb3JtMmYodGhpcy5zaGFkZXIucHJvamVjdGlvblZlY3RvcixiLngsYi55KSxhLnVuaWZvcm1NYXRyaXgzZnYodGhpcy5zaGFkZXIudU1hdHJpeCwhMSx0aGlzLm1hdHJpeCk7dmFyIGM9NCp0aGlzLnZlcnRTaXplO2EudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hVmVydGV4UG9zaXRpb24sMixhLkZMT0FULCExLGMsMCksYS52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuc2hhZGVyLmFQb3NpdGlvbkNvb3JkLDIsYS5GTE9BVCwhMSxjLDgpLGEudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hU2NhbGUsMixhLkZMT0FULCExLGMsMTYpLGEudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hUm90YXRpb24sMSxhLkZMT0FULCExLGMsMjQpLGEudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hVGV4dHVyZUNvb3JkLDIsYS5GTE9BVCwhMSxjLDI4KSxhLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5zaGFkZXIuY29sb3JBdHRyaWJ1dGUsMSxhLkZMT0FULCExLGMsMzYpfSxiLldlYkdMRmlsdGVyTWFuYWdlcj1mdW5jdGlvbigpe3RoaXMuZmlsdGVyU3RhY2s9W10sdGhpcy5vZmZzZXRYPTAsdGhpcy5vZmZzZXRZPTB9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLldlYkdMRmlsdGVyTWFuYWdlcixiLldlYkdMRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy50ZXh0dXJlUG9vbD1bXSx0aGlzLmluaXRTaGFkZXJCdWZmZXJzKCl9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5iZWdpbj1mdW5jdGlvbihhLGIpe3RoaXMucmVuZGVyU2Vzc2lvbj1hLHRoaXMuZGVmYXVsdFNoYWRlcj1hLnNoYWRlck1hbmFnZXIuZGVmYXVsdFNoYWRlcjt2YXIgYz10aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbjt0aGlzLndpZHRoPTIqYy54LHRoaXMuaGVpZ2h0PTIqLWMueSx0aGlzLmJ1ZmZlcj1ifSxiLldlYkdMRmlsdGVyTWFuYWdlci5wcm90b3R5cGUucHVzaEZpbHRlcj1mdW5jdGlvbihhKXt2YXIgYz10aGlzLmdsLGQ9dGhpcy5yZW5kZXJTZXNzaW9uLnByb2plY3Rpb24sZT10aGlzLnJlbmRlclNlc3Npb24ub2Zmc2V0O2EuX2ZpbHRlckFyZWE9YS50YXJnZXQuZmlsdGVyQXJlYXx8YS50YXJnZXQuZ2V0Qm91bmRzKCksdGhpcy5maWx0ZXJTdGFjay5wdXNoKGEpO3ZhciBmPWEuZmlsdGVyUGFzc2VzWzBdO3RoaXMub2Zmc2V0WCs9YS5fZmlsdGVyQXJlYS54LHRoaXMub2Zmc2V0WSs9YS5fZmlsdGVyQXJlYS55O3ZhciBnPXRoaXMudGV4dHVyZVBvb2wucG9wKCk7Zz9nLnJlc2l6ZSh0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KTpnPW5ldyBiLkZpbHRlclRleHR1cmUodGhpcy5nbCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSxjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCxnLnRleHR1cmUpO3ZhciBoPWEuX2ZpbHRlckFyZWEsaT1mLnBhZGRpbmc7aC54LT1pLGgueS09aSxoLndpZHRoKz0yKmksaC5oZWlnaHQrPTIqaSxoLng8MCYmKGgueD0wKSxoLndpZHRoPnRoaXMud2lkdGgmJihoLndpZHRoPXRoaXMud2lkdGgpLGgueTwwJiYoaC55PTApLGguaGVpZ2h0PnRoaXMuaGVpZ2h0JiYoaC5oZWlnaHQ9dGhpcy5oZWlnaHQpLGMuYmluZEZyYW1lYnVmZmVyKGMuRlJBTUVCVUZGRVIsZy5mcmFtZUJ1ZmZlciksYy52aWV3cG9ydCgwLDAsaC53aWR0aCxoLmhlaWdodCksZC54PWgud2lkdGgvMixkLnk9LWguaGVpZ2h0LzIsZS54PS1oLngsZS55PS1oLnksYy5jb2xvck1hc2soITAsITAsITAsITApLGMuY2xlYXJDb2xvcigwLDAsMCwwKSxjLmNsZWFyKGMuQ09MT1JfQlVGRkVSX0JJVCksYS5fZ2xGaWx0ZXJUZXh0dXJlPWd9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5wb3BGaWx0ZXI9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsLGM9dGhpcy5maWx0ZXJTdGFjay5wb3AoKSxkPWMuX2ZpbHRlckFyZWEsZT1jLl9nbEZpbHRlclRleHR1cmUsZj10aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbixnPXRoaXMucmVuZGVyU2Vzc2lvbi5vZmZzZXQ7aWYoYy5maWx0ZXJQYXNzZXMubGVuZ3RoPjEpe2Eudmlld3BvcnQoMCwwLGQud2lkdGgsZC5oZWlnaHQpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksdGhpcy52ZXJ0ZXhBcnJheVswXT0wLHRoaXMudmVydGV4QXJyYXlbMV09ZC5oZWlnaHQsdGhpcy52ZXJ0ZXhBcnJheVsyXT1kLndpZHRoLHRoaXMudmVydGV4QXJyYXlbM109ZC5oZWlnaHQsdGhpcy52ZXJ0ZXhBcnJheVs0XT0wLHRoaXMudmVydGV4QXJyYXlbNV09MCx0aGlzLnZlcnRleEFycmF5WzZdPWQud2lkdGgsdGhpcy52ZXJ0ZXhBcnJheVs3XT0wLGEuYnVmZmVyU3ViRGF0YShhLkFSUkFZX0JVRkZFUiwwLHRoaXMudmVydGV4QXJyYXkpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnV2QnVmZmVyKSx0aGlzLnV2QXJyYXlbMl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs1XT1kLmhlaWdodC90aGlzLmhlaWdodCx0aGlzLnV2QXJyYXlbNl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs3XT1kLmhlaWdodC90aGlzLmhlaWdodCxhLmJ1ZmZlclN1YkRhdGEoYS5BUlJBWV9CVUZGRVIsMCx0aGlzLnV2QXJyYXkpO3ZhciBoPWUsaT10aGlzLnRleHR1cmVQb29sLnBvcCgpO2l8fChpPW5ldyBiLkZpbHRlclRleHR1cmUodGhpcy5nbCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSksaS5yZXNpemUodGhpcy53aWR0aCx0aGlzLmhlaWdodCksYS5iaW5kRnJhbWVidWZmZXIoYS5GUkFNRUJVRkZFUixpLmZyYW1lQnVmZmVyKSxhLmNsZWFyKGEuQ09MT1JfQlVGRkVSX0JJVCksYS5kaXNhYmxlKGEuQkxFTkQpO2Zvcih2YXIgaj0wO2o8Yy5maWx0ZXJQYXNzZXMubGVuZ3RoLTE7aisrKXt2YXIgaz1jLmZpbHRlclBhc3Nlc1tqXTthLmJpbmRGcmFtZWJ1ZmZlcihhLkZSQU1FQlVGRkVSLGkuZnJhbWVCdWZmZXIpLGEuYWN0aXZlVGV4dHVyZShhLlRFWFRVUkUwKSxhLmJpbmRUZXh0dXJlKGEuVEVYVFVSRV8yRCxoLnRleHR1cmUpLHRoaXMuYXBwbHlGaWx0ZXJQYXNzKGssZCxkLndpZHRoLGQuaGVpZ2h0KTt2YXIgbD1oO2g9aSxpPWx9YS5lbmFibGUoYS5CTEVORCksZT1oLHRoaXMudGV4dHVyZVBvb2wucHVzaChpKX12YXIgbT1jLmZpbHRlclBhc3Nlc1tjLmZpbHRlclBhc3Nlcy5sZW5ndGgtMV07dGhpcy5vZmZzZXRYLT1kLngsdGhpcy5vZmZzZXRZLT1kLnk7dmFyIG49dGhpcy53aWR0aCxvPXRoaXMuaGVpZ2h0LHA9MCxxPTAscj10aGlzLmJ1ZmZlcjtpZigwPT09dGhpcy5maWx0ZXJTdGFjay5sZW5ndGgpYS5jb2xvck1hc2soITAsITAsITAsITApO2Vsc2V7dmFyIHM9dGhpcy5maWx0ZXJTdGFja1t0aGlzLmZpbHRlclN0YWNrLmxlbmd0aC0xXTtkPXMuX2ZpbHRlckFyZWEsbj1kLndpZHRoLG89ZC5oZWlnaHQscD1kLngscT1kLnkscj1zLl9nbEZpbHRlclRleHR1cmUuZnJhbWVCdWZmZXJ9Zi54PW4vMixmLnk9LW8vMixnLng9cCxnLnk9cSxkPWMuX2ZpbHRlckFyZWE7dmFyIHQ9ZC54LXAsdT1kLnktcTthLmJpbmRCdWZmZXIoYS5BUlJBWV9CVUZGRVIsdGhpcy52ZXJ0ZXhCdWZmZXIpLHRoaXMudmVydGV4QXJyYXlbMF09dCx0aGlzLnZlcnRleEFycmF5WzFdPXUrZC5oZWlnaHQsdGhpcy52ZXJ0ZXhBcnJheVsyXT10K2Qud2lkdGgsdGhpcy52ZXJ0ZXhBcnJheVszXT11K2QuaGVpZ2h0LHRoaXMudmVydGV4QXJyYXlbNF09dCx0aGlzLnZlcnRleEFycmF5WzVdPXUsdGhpcy52ZXJ0ZXhBcnJheVs2XT10K2Qud2lkdGgsdGhpcy52ZXJ0ZXhBcnJheVs3XT11LGEuYnVmZmVyU3ViRGF0YShhLkFSUkFZX0JVRkZFUiwwLHRoaXMudmVydGV4QXJyYXkpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnV2QnVmZmVyKSx0aGlzLnV2QXJyYXlbMl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs1XT1kLmhlaWdodC90aGlzLmhlaWdodCx0aGlzLnV2QXJyYXlbNl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs3XT1kLmhlaWdodC90aGlzLmhlaWdodCxhLmJ1ZmZlclN1YkRhdGEoYS5BUlJBWV9CVUZGRVIsMCx0aGlzLnV2QXJyYXkpLGEudmlld3BvcnQoMCwwLG4sbyksYS5iaW5kRnJhbWVidWZmZXIoYS5GUkFNRUJVRkZFUixyKSxhLmFjdGl2ZVRleHR1cmUoYS5URVhUVVJFMCksYS5iaW5kVGV4dHVyZShhLlRFWFRVUkVfMkQsZS50ZXh0dXJlKSx0aGlzLmFwcGx5RmlsdGVyUGFzcyhtLGQsbixvKSx0aGlzLnRleHR1cmVQb29sLnB1c2goZSksYy5fZ2xGaWx0ZXJUZXh0dXJlPW51bGx9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5hcHBseUZpbHRlclBhc3M9ZnVuY3Rpb24oYSxjLGQsZSl7dmFyIGY9dGhpcy5nbCxnPWEuc2hhZGVyc1tmLmlkXTtnfHwoZz1uZXcgYi5QaXhpU2hhZGVyKGYpLGcuZnJhZ21lbnRTcmM9YS5mcmFnbWVudFNyYyxnLnVuaWZvcm1zPWEudW5pZm9ybXMsZy5pbml0KCksYS5zaGFkZXJzW2YuaWRdPWcpLHRoaXMucmVuZGVyU2Vzc2lvbi5zaGFkZXJNYW5hZ2VyLnNldFNoYWRlcihnKSxmLnVuaWZvcm0yZihnLnByb2plY3Rpb25WZWN0b3IsZC8yLC1lLzIpLGYudW5pZm9ybTJmKGcub2Zmc2V0VmVjdG9yLDAsMCksYS51bmlmb3Jtcy5kaW1lbnNpb25zJiYoYS51bmlmb3Jtcy5kaW1lbnNpb25zLnZhbHVlWzBdPXRoaXMud2lkdGgsYS51bmlmb3Jtcy5kaW1lbnNpb25zLnZhbHVlWzFdPXRoaXMuaGVpZ2h0LGEudW5pZm9ybXMuZGltZW5zaW9ucy52YWx1ZVsyXT10aGlzLnZlcnRleEFycmF5WzBdLGEudW5pZm9ybXMuZGltZW5zaW9ucy52YWx1ZVszXT10aGlzLnZlcnRleEFycmF5WzVdKSxnLnN5bmNVbmlmb3JtcygpLGYuYmluZEJ1ZmZlcihmLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksZi52ZXJ0ZXhBdHRyaWJQb2ludGVyKGcuYVZlcnRleFBvc2l0aW9uLDIsZi5GTE9BVCwhMSwwLDApLGYuYmluZEJ1ZmZlcihmLkFSUkFZX0JVRkZFUix0aGlzLnV2QnVmZmVyKSxmLnZlcnRleEF0dHJpYlBvaW50ZXIoZy5hVGV4dHVyZUNvb3JkLDIsZi5GTE9BVCwhMSwwLDApLGYuYmluZEJ1ZmZlcihmLkFSUkFZX0JVRkZFUix0aGlzLmNvbG9yQnVmZmVyKSxmLnZlcnRleEF0dHJpYlBvaW50ZXIoZy5jb2xvckF0dHJpYnV0ZSwyLGYuRkxPQVQsITEsMCwwKSxmLmJpbmRCdWZmZXIoZi5FTEVNRU5UX0FSUkFZX0JVRkZFUix0aGlzLmluZGV4QnVmZmVyKSxmLmRyYXdFbGVtZW50cyhmLlRSSUFOR0xFUyw2LGYuVU5TSUdORURfU0hPUlQsMCksdGhpcy5yZW5kZXJTZXNzaW9uLmRyYXdDb3VudCsrfSxiLldlYkdMRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaW5pdFNoYWRlckJ1ZmZlcnM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO3RoaXMudmVydGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksdGhpcy51dkJ1ZmZlcj1hLmNyZWF0ZUJ1ZmZlcigpLHRoaXMuY29sb3JCdWZmZXI9YS5jcmVhdGVCdWZmZXIoKSx0aGlzLmluZGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksdGhpcy52ZXJ0ZXhBcnJheT1uZXcgYi5GbG9hdDMyQXJyYXkoWzAsMCwxLDAsMCwxLDEsMV0pLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuQVJSQVlfQlVGRkVSLHRoaXMudmVydGV4QXJyYXksYS5TVEFUSUNfRFJBVyksdGhpcy51dkFycmF5PW5ldyBiLkZsb2F0MzJBcnJheShbMCwwLDEsMCwwLDEsMSwxXSksYS5iaW5kQnVmZmVyKGEuQVJSQVlfQlVGRkVSLHRoaXMudXZCdWZmZXIpLGEuYnVmZmVyRGF0YShhLkFSUkFZX0JVRkZFUix0aGlzLnV2QXJyYXksYS5TVEFUSUNfRFJBVyksdGhpcy5jb2xvckFycmF5PW5ldyBiLkZsb2F0MzJBcnJheShbMSwxNjc3NzIxNSwxLDE2Nzc3MjE1LDEsMTY3NzcyMTUsMSwxNjc3NzIxNV0pLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLmNvbG9yQnVmZmVyKSxhLmJ1ZmZlckRhdGEoYS5BUlJBWV9CVUZGRVIsdGhpcy5jb2xvckFycmF5LGEuU1RBVElDX0RSQVcpLGEuYmluZEJ1ZmZlcihhLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuaW5kZXhCdWZmZXIpLGEuYnVmZmVyRGF0YShhLkVMRU1FTlRfQVJSQVlfQlVGRkVSLG5ldyBVaW50MTZBcnJheShbMCwxLDIsMSwzLDJdKSxhLlNUQVRJQ19EUkFXKX0sYi5XZWJHTEZpbHRlck1hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO3RoaXMuZmlsdGVyU3RhY2s9bnVsbCx0aGlzLm9mZnNldFg9MCx0aGlzLm9mZnNldFk9MDtmb3IodmFyIGI9MDtiPHRoaXMudGV4dHVyZVBvb2wubGVuZ3RoO2IrKyl0aGlzLnRleHR1cmVQb29sW2JdLmRlc3Ryb3koKTt0aGlzLnRleHR1cmVQb29sPW51bGwsYS5kZWxldGVCdWZmZXIodGhpcy52ZXJ0ZXhCdWZmZXIpLGEuZGVsZXRlQnVmZmVyKHRoaXMudXZCdWZmZXIpLGEuZGVsZXRlQnVmZmVyKHRoaXMuY29sb3JCdWZmZXIpLGEuZGVsZXRlQnVmZmVyKHRoaXMuaW5kZXhCdWZmZXIpfSxiLkZpbHRlclRleHR1cmU9ZnVuY3Rpb24oYSxjLGQsZSl7dGhpcy5nbD1hLHRoaXMuZnJhbWVCdWZmZXI9YS5jcmVhdGVGcmFtZWJ1ZmZlcigpLHRoaXMudGV4dHVyZT1hLmNyZWF0ZVRleHR1cmUoKSxlPWV8fGIuc2NhbGVNb2Rlcy5ERUZBVUxULGEuYmluZFRleHR1cmUoYS5URVhUVVJFXzJELHRoaXMudGV4dHVyZSksYS50ZXhQYXJhbWV0ZXJpKGEuVEVYVFVSRV8yRCxhLlRFWFRVUkVfTUFHX0ZJTFRFUixlPT09Yi5zY2FsZU1vZGVzLkxJTkVBUj9hLkxJTkVBUjphLk5FQVJFU1QpLGEudGV4UGFyYW1ldGVyaShhLlRFWFRVUkVfMkQsYS5URVhUVVJFX01JTl9GSUxURVIsZT09PWIuc2NhbGVNb2Rlcy5MSU5FQVI/YS5MSU5FQVI6YS5ORUFSRVNUKSxhLnRleFBhcmFtZXRlcmkoYS5URVhUVVJFXzJELGEuVEVYVFVSRV9XUkFQX1MsYS5DTEFNUF9UT19FREdFKSxhLnRleFBhcmFtZXRlcmkoYS5URVhUVVJFXzJELGEuVEVYVFVSRV9XUkFQX1QsYS5DTEFNUF9UT19FREdFKSxhLmJpbmRGcmFtZWJ1ZmZlcihhLkZSQU1FQlVGRkVSLHRoaXMuZnJhbWVCdWZmZXIpLGEuYmluZEZyYW1lYnVmZmVyKGEuRlJBTUVCVUZGRVIsdGhpcy5mcmFtZUJ1ZmZlciksYS5mcmFtZWJ1ZmZlclRleHR1cmUyRChhLkZSQU1FQlVGRkVSLGEuQ09MT1JfQVRUQUNITUVOVDAsYS5URVhUVVJFXzJELHRoaXMudGV4dHVyZSwwKSx0aGlzLnJlbmRlckJ1ZmZlcj1hLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpLGEuYmluZFJlbmRlcmJ1ZmZlcihhLlJFTkRFUkJVRkZFUix0aGlzLnJlbmRlckJ1ZmZlciksYS5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihhLkZSQU1FQlVGRkVSLGEuREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5ULGEuUkVOREVSQlVGRkVSLHRoaXMucmVuZGVyQnVmZmVyKSx0aGlzLnJlc2l6ZShjLGQpfSxiLkZpbHRlclRleHR1cmUucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuRmlsdGVyVGV4dHVyZSxiLkZpbHRlclRleHR1cmUucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5nbDthLmNsZWFyQ29sb3IoMCwwLDAsMCksYS5jbGVhcihhLkNPTE9SX0JVRkZFUl9CSVQpfSxiLkZpbHRlclRleHR1cmUucHJvdG90eXBlLnJlc2l6ZT1mdW5jdGlvbihhLGIpe2lmKHRoaXMud2lkdGghPT1hfHx0aGlzLmhlaWdodCE9PWIpe3RoaXMud2lkdGg9YSx0aGlzLmhlaWdodD1iO3ZhciBjPXRoaXMuZ2w7Yy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsdGhpcy50ZXh0dXJlKSxjLnRleEltYWdlMkQoYy5URVhUVVJFXzJELDAsYy5SR0JBLGEsYiwwLGMuUkdCQSxjLlVOU0lHTkVEX0JZVEUsbnVsbCksYy5iaW5kUmVuZGVyYnVmZmVyKGMuUkVOREVSQlVGRkVSLHRoaXMucmVuZGVyQnVmZmVyKSxjLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoYy5SRU5ERVJCVUZGRVIsYy5ERVBUSF9TVEVOQ0lMLGEsYilcbn19LGIuRmlsdGVyVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2w7YS5kZWxldGVGcmFtZWJ1ZmZlcih0aGlzLmZyYW1lQnVmZmVyKSxhLmRlbGV0ZVRleHR1cmUodGhpcy50ZXh0dXJlKSx0aGlzLmZyYW1lQnVmZmVyPW51bGwsdGhpcy50ZXh0dXJlPW51bGx9LGIuQ2FudmFzQnVmZmVyPWZ1bmN0aW9uKGEsYil7dGhpcy53aWR0aD1hLHRoaXMuaGVpZ2h0PWIsdGhpcy5jYW52YXM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSx0aGlzLmNvbnRleHQ9dGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLHRoaXMuY2FudmFzLndpZHRoPWEsdGhpcy5jYW52YXMuaGVpZ2h0PWJ9LGIuQ2FudmFzQnVmZmVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkNhbnZhc0J1ZmZlcixiLkNhbnZhc0J1ZmZlci5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsMCwwLDEsMCwwKSx0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsMCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KX0sYi5DYW52YXNCdWZmZXIucHJvdG90eXBlLnJlc2l6ZT1mdW5jdGlvbihhLGIpe3RoaXMud2lkdGg9dGhpcy5jYW52YXMud2lkdGg9YSx0aGlzLmhlaWdodD10aGlzLmNhbnZhcy5oZWlnaHQ9Yn0sYi5DYW52YXNNYXNrTWFuYWdlcj1mdW5jdGlvbigpe30sYi5DYW52YXNNYXNrTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5DYW52YXNNYXNrTWFuYWdlcixiLkNhbnZhc01hc2tNYW5hZ2VyLnByb3RvdHlwZS5wdXNoTWFzaz1mdW5jdGlvbihhLGMpe3ZhciBkPWMuY29udGV4dDtkLnNhdmUoKTt2YXIgZT1hLmFscGhhLGY9YS53b3JsZFRyYW5zZm9ybSxnPWMucmVzb2x1dGlvbjtkLnNldFRyYW5zZm9ybShmLmEqZyxmLmIqZyxmLmMqZyxmLmQqZyxmLnR4KmcsZi50eSpnKSxiLkNhbnZhc0dyYXBoaWNzLnJlbmRlckdyYXBoaWNzTWFzayhhLGQpLGQuY2xpcCgpLGEud29ybGRBbHBoYT1lfSxiLkNhbnZhc01hc2tNYW5hZ2VyLnByb3RvdHlwZS5wb3BNYXNrPWZ1bmN0aW9uKGEpe2EuY29udGV4dC5yZXN0b3JlKCl9LGIuQ2FudmFzVGludGVyPWZ1bmN0aW9uKCl7fSxiLkNhbnZhc1RpbnRlci5nZXRUaW50ZWRUZXh0dXJlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9YS50ZXh0dXJlO2M9Yi5DYW52YXNUaW50ZXIucm91bmRDb2xvcihjKTt2YXIgZT1cIiNcIisoXCIwMDAwMFwiKygwfGMpLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtpZihkLnRpbnRDYWNoZT1kLnRpbnRDYWNoZXx8e30sZC50aW50Q2FjaGVbZV0pcmV0dXJuIGQudGludENhY2hlW2VdO3ZhciBmPWIuQ2FudmFzVGludGVyLmNhbnZhc3x8ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtpZihiLkNhbnZhc1RpbnRlci50aW50TWV0aG9kKGQsYyxmKSxiLkNhbnZhc1RpbnRlci5jb252ZXJ0VGludFRvSW1hZ2Upe3ZhciBnPW5ldyBJbWFnZTtnLnNyYz1mLnRvRGF0YVVSTCgpLGQudGludENhY2hlW2VdPWd9ZWxzZSBkLnRpbnRDYWNoZVtlXT1mLGIuQ2FudmFzVGludGVyLmNhbnZhcz1udWxsO3JldHVybiBmfSxiLkNhbnZhc1RpbnRlci50aW50V2l0aE11bHRpcGx5PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jLmdldENvbnRleHQoXCIyZFwiKSxlPWEuY3JvcDtjLndpZHRoPWUud2lkdGgsYy5oZWlnaHQ9ZS5oZWlnaHQsZC5maWxsU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxiKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksZC5maWxsUmVjdCgwLDAsZS53aWR0aCxlLmhlaWdodCksZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJtdWx0aXBseVwiLGQuZHJhd0ltYWdlKGEuYmFzZVRleHR1cmUuc291cmNlLGUueCxlLnksZS53aWR0aCxlLmhlaWdodCwwLDAsZS53aWR0aCxlLmhlaWdodCksZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJkZXN0aW5hdGlvbi1hdG9wXCIsZC5kcmF3SW1hZ2UoYS5iYXNlVGV4dHVyZS5zb3VyY2UsZS54LGUueSxlLndpZHRoLGUuaGVpZ2h0LDAsMCxlLndpZHRoLGUuaGVpZ2h0KX0sYi5DYW52YXNUaW50ZXIudGludFdpdGhPdmVybGF5PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jLmdldENvbnRleHQoXCIyZFwiKSxlPWEuY3JvcDtjLndpZHRoPWUud2lkdGgsYy5oZWlnaHQ9ZS5oZWlnaHQsZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJjb3B5XCIsZC5maWxsU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxiKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksZC5maWxsUmVjdCgwLDAsZS53aWR0aCxlLmhlaWdodCksZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJkZXN0aW5hdGlvbi1hdG9wXCIsZC5kcmF3SW1hZ2UoYS5iYXNlVGV4dHVyZS5zb3VyY2UsZS54LGUueSxlLndpZHRoLGUuaGVpZ2h0LDAsMCxlLndpZHRoLGUuaGVpZ2h0KX0sYi5DYW52YXNUaW50ZXIudGludFdpdGhQZXJQaXhlbD1mdW5jdGlvbihhLGMsZCl7dmFyIGU9ZC5nZXRDb250ZXh0KFwiMmRcIiksZj1hLmNyb3A7ZC53aWR0aD1mLndpZHRoLGQuaGVpZ2h0PWYuaGVpZ2h0LGUuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPVwiY29weVwiLGUuZHJhd0ltYWdlKGEuYmFzZVRleHR1cmUuc291cmNlLGYueCxmLnksZi53aWR0aCxmLmhlaWdodCwwLDAsZi53aWR0aCxmLmhlaWdodCk7Zm9yKHZhciBnPWIuaGV4MnJnYihjKSxoPWdbMF0saT1nWzFdLGo9Z1syXSxrPWUuZ2V0SW1hZ2VEYXRhKDAsMCxmLndpZHRoLGYuaGVpZ2h0KSxsPWsuZGF0YSxtPTA7bTxsLmxlbmd0aDttKz00KWxbbSswXSo9aCxsW20rMV0qPWksbFttKzJdKj1qO2UucHV0SW1hZ2VEYXRhKGssMCwwKX0sYi5DYW52YXNUaW50ZXIucm91bmRDb2xvcj1mdW5jdGlvbihhKXt2YXIgYz1iLkNhbnZhc1RpbnRlci5jYWNoZVN0ZXBzUGVyQ29sb3JDaGFubmVsLGQ9Yi5oZXgycmdiKGEpO3JldHVybiBkWzBdPU1hdGgubWluKDI1NSxkWzBdL2MqYyksZFsxXT1NYXRoLm1pbigyNTUsZFsxXS9jKmMpLGRbMl09TWF0aC5taW4oMjU1LGRbMl0vYypjKSxiLnJnYjJoZXgoZCl9LGIuQ2FudmFzVGludGVyLmNhY2hlU3RlcHNQZXJDb2xvckNoYW5uZWw9OCxiLkNhbnZhc1RpbnRlci5jb252ZXJ0VGludFRvSW1hZ2U9ITEsYi5DYW52YXNUaW50ZXIuY2FuVXNlTXVsdGlwbHk9Yi5jYW5Vc2VOZXdDYW52YXNCbGVuZE1vZGVzKCksYi5DYW52YXNUaW50ZXIudGludE1ldGhvZD1iLkNhbnZhc1RpbnRlci5jYW5Vc2VNdWx0aXBseT9iLkNhbnZhc1RpbnRlci50aW50V2l0aE11bHRpcGx5OmIuQ2FudmFzVGludGVyLnRpbnRXaXRoUGVyUGl4ZWwsYi5DYW52YXNSZW5kZXJlcj1mdW5jdGlvbihhLGMsZCl7aWYoZClmb3IodmFyIGUgaW4gYi5kZWZhdWx0UmVuZGVyT3B0aW9ucylcInVuZGVmaW5lZFwiPT10eXBlb2YgZFtlXSYmKGRbZV09Yi5kZWZhdWx0UmVuZGVyT3B0aW9uc1tlXSk7ZWxzZSBkPWIuZGVmYXVsdFJlbmRlck9wdGlvbnM7Yi5kZWZhdWx0UmVuZGVyZXJ8fChiLnNheUhlbGxvKFwiQ2FudmFzXCIpLGIuZGVmYXVsdFJlbmRlcmVyPXRoaXMpLHRoaXMudHlwZT1iLkNBTlZBU19SRU5ERVJFUix0aGlzLnJlc29sdXRpb249ZC5yZXNvbHV0aW9uLHRoaXMuY2xlYXJCZWZvcmVSZW5kZXI9ZC5jbGVhckJlZm9yZVJlbmRlcix0aGlzLnRyYW5zcGFyZW50PWQudHJhbnNwYXJlbnQsdGhpcy5hdXRvUmVzaXplPWQuYXV0b1Jlc2l6ZXx8ITEsdGhpcy53aWR0aD1hfHw4MDAsdGhpcy5oZWlnaHQ9Y3x8NjAwLHRoaXMud2lkdGgqPXRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCo9dGhpcy5yZXNvbHV0aW9uLHRoaXMudmlldz1kLnZpZXd8fGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksdGhpcy5jb250ZXh0PXRoaXMudmlldy5nZXRDb250ZXh0KFwiMmRcIix7YWxwaGE6dGhpcy50cmFuc3BhcmVudH0pLHRoaXMucmVmcmVzaD0hMCx0aGlzLnZpZXcud2lkdGg9dGhpcy53aWR0aCp0aGlzLnJlc29sdXRpb24sdGhpcy52aWV3LmhlaWdodD10aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24sdGhpcy5jb3VudD0wLHRoaXMubWFza01hbmFnZXI9bmV3IGIuQ2FudmFzTWFza01hbmFnZXIsdGhpcy5yZW5kZXJTZXNzaW9uPXtjb250ZXh0OnRoaXMuY29udGV4dCxtYXNrTWFuYWdlcjp0aGlzLm1hc2tNYW5hZ2VyLHNjYWxlTW9kZTpudWxsLHNtb290aFByb3BlcnR5Om51bGwscm91bmRQaXhlbHM6ITF9LHRoaXMubWFwQmxlbmRNb2RlcygpLHRoaXMucmVzaXplKGEsYyksXCJpbWFnZVNtb290aGluZ0VuYWJsZWRcImluIHRoaXMuY29udGV4dD90aGlzLnJlbmRlclNlc3Npb24uc21vb3RoUHJvcGVydHk9XCJpbWFnZVNtb290aGluZ0VuYWJsZWRcIjpcIndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZFwiaW4gdGhpcy5jb250ZXh0P3RoaXMucmVuZGVyU2Vzc2lvbi5zbW9vdGhQcm9wZXJ0eT1cIndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZFwiOlwibW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkXCJpbiB0aGlzLmNvbnRleHQ/dGhpcy5yZW5kZXJTZXNzaW9uLnNtb290aFByb3BlcnR5PVwibW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkXCI6XCJvSW1hZ2VTbW9vdGhpbmdFbmFibGVkXCJpbiB0aGlzLmNvbnRleHQ/dGhpcy5yZW5kZXJTZXNzaW9uLnNtb290aFByb3BlcnR5PVwib0ltYWdlU21vb3RoaW5nRW5hYmxlZFwiOlwibXNJbWFnZVNtb290aGluZ0VuYWJsZWRcImluIHRoaXMuY29udGV4dCYmKHRoaXMucmVuZGVyU2Vzc2lvbi5zbW9vdGhQcm9wZXJ0eT1cIm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkXCIpfSxiLkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkNhbnZhc1JlbmRlcmVyLGIuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihhKXthLnVwZGF0ZVRyYW5zZm9ybSgpLHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwwLDAsMSwwLDApLHRoaXMuY29udGV4dC5nbG9iYWxBbHBoYT0xLHRoaXMucmVuZGVyU2Vzc2lvbi5jdXJyZW50QmxlbmRNb2RlPWIuYmxlbmRNb2Rlcy5OT1JNQUwsdGhpcy5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj1iLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLk5PUk1BTF0sbmF2aWdhdG9yLmlzQ29jb29uSlMmJnRoaXMudmlldy5zY3JlZW5jYW52YXMmJih0aGlzLmNvbnRleHQuZmlsbFN0eWxlPVwiYmxhY2tcIix0aGlzLmNvbnRleHQuY2xlYXIoKSksdGhpcy5jbGVhckJlZm9yZVJlbmRlciYmKHRoaXMudHJhbnNwYXJlbnQ/dGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLDAsdGhpcy53aWR0aCx0aGlzLmhlaWdodCk6KHRoaXMuY29udGV4dC5maWxsU3R5bGU9YS5iYWNrZ3JvdW5kQ29sb3JTdHJpbmcsdGhpcy5jb250ZXh0LmZpbGxSZWN0KDAsMCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSkpLHRoaXMucmVuZGVyRGlzcGxheU9iamVjdChhKSxhLmludGVyYWN0aXZlJiYoYS5faW50ZXJhY3RpdmVFdmVudHNBZGRlZHx8KGEuX2ludGVyYWN0aXZlRXZlbnRzQWRkZWQ9ITAsYS5pbnRlcmFjdGlvbk1hbmFnZXIuc2V0VGFyZ2V0KHRoaXMpKSl9LGIuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oYSl7XCJ1bmRlZmluZWRcIj09dHlwZW9mIGEmJihhPSEwKSxhJiZ0aGlzLnZpZXcucGFyZW50JiZ0aGlzLnZpZXcucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMudmlldyksdGhpcy52aWV3PW51bGwsdGhpcy5jb250ZXh0PW51bGwsdGhpcy5tYXNrTWFuYWdlcj1udWxsLHRoaXMucmVuZGVyU2Vzc2lvbj1udWxsfSxiLkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZXNpemU9ZnVuY3Rpb24oYSxiKXt0aGlzLndpZHRoPWEqdGhpcy5yZXNvbHV0aW9uLHRoaXMuaGVpZ2h0PWIqdGhpcy5yZXNvbHV0aW9uLHRoaXMudmlldy53aWR0aD10aGlzLndpZHRoLHRoaXMudmlldy5oZWlnaHQ9dGhpcy5oZWlnaHQsdGhpcy5hdXRvUmVzaXplJiYodGhpcy52aWV3LnN0eWxlLndpZHRoPXRoaXMud2lkdGgvdGhpcy5yZXNvbHV0aW9uK1wicHhcIix0aGlzLnZpZXcuc3R5bGUuaGVpZ2h0PXRoaXMuaGVpZ2h0L3RoaXMucmVzb2x1dGlvbitcInB4XCIpfSxiLkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJEaXNwbGF5T2JqZWN0PWZ1bmN0aW9uKGEsYil7dGhpcy5yZW5kZXJTZXNzaW9uLmNvbnRleHQ9Ynx8dGhpcy5jb250ZXh0LHRoaXMucmVuZGVyU2Vzc2lvbi5yZXNvbHV0aW9uPXRoaXMucmVzb2x1dGlvbixhLl9yZW5kZXJDYW52YXModGhpcy5yZW5kZXJTZXNzaW9uKX0sYi5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUubWFwQmxlbmRNb2Rlcz1mdW5jdGlvbigpe2IuYmxlbmRNb2Rlc0NhbnZhc3x8KGIuYmxlbmRNb2Rlc0NhbnZhcz1bXSxiLmNhblVzZU5ld0NhbnZhc0JsZW5kTW9kZXMoKT8oYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5OT1JNQUxdPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkFERF09XCJsaWdodGVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5NVUxUSVBMWV09XCJtdWx0aXBseVwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU0NSRUVOXT1cInNjcmVlblwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuT1ZFUkxBWV09XCJvdmVybGF5XCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5EQVJLRU5dPVwiZGFya2VuXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5MSUdIVEVOXT1cImxpZ2h0ZW5cIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkNPTE9SX0RPREdFXT1cImNvbG9yLWRvZGdlXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5DT0xPUl9CVVJOXT1cImNvbG9yLWJ1cm5cIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkhBUkRfTElHSFRdPVwiaGFyZC1saWdodFwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU09GVF9MSUdIVF09XCJzb2Z0LWxpZ2h0XCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5ESUZGRVJFTkNFXT1cImRpZmZlcmVuY2VcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkVYQ0xVU0lPTl09XCJleGNsdXNpb25cIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkhVRV09XCJodWVcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLlNBVFVSQVRJT05dPVwic2F0dXJhdGlvblwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuQ09MT1JdPVwiY29sb3JcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkxVTUlOT1NJVFldPVwibHVtaW5vc2l0eVwiKTooYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5OT1JNQUxdPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkFERF09XCJsaWdodGVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5NVUxUSVBMWV09XCJzb3VyY2Utb3ZlclwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU0NSRUVOXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5PVkVSTEFZXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5EQVJLRU5dPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkxJR0hURU5dPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkNPTE9SX0RPREdFXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5DT0xPUl9CVVJOXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5IQVJEX0xJR0hUXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5TT0ZUX0xJR0hUXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5ESUZGRVJFTkNFXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5FWENMVVNJT05dPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkhVRV09XCJzb3VyY2Utb3ZlclwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU0FUVVJBVElPTl09XCJzb3VyY2Utb3ZlclwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuQ09MT1JdPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkxVTUlOT1NJVFldPVwic291cmNlLW92ZXJcIikpfSxiLkNhbnZhc0dyYXBoaWNzPWZ1bmN0aW9uKCl7fSxiLkNhbnZhc0dyYXBoaWNzLnJlbmRlckdyYXBoaWNzPWZ1bmN0aW9uKGEsYyl7Zm9yKHZhciBkPWEud29ybGRBbHBoYSxlPVwiXCIsZj0wO2Y8YS5ncmFwaGljc0RhdGEubGVuZ3RoO2YrKyl7dmFyIGc9YS5ncmFwaGljc0RhdGFbZl0saD1nLnNoYXBlO2lmKGMuc3Ryb2tlU3R5bGU9ZT1cIiNcIisoXCIwMDAwMFwiKygwfGcubGluZUNvbG9yKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksYy5saW5lV2lkdGg9Zy5saW5lV2lkdGgsZy50eXBlPT09Yi5HcmFwaGljcy5QT0xZKXtjLmJlZ2luUGF0aCgpO3ZhciBpPWgucG9pbnRzO2MubW92ZVRvKGlbMF0saVsxXSk7Zm9yKHZhciBqPTE7ajxpLmxlbmd0aC8yO2orKyljLmxpbmVUbyhpWzIqal0saVsyKmorMV0pO2guY2xvc2VkJiZjLmxpbmVUbyhpWzBdLGlbMV0pLGlbMF09PT1pW2kubGVuZ3RoLTJdJiZpWzFdPT09aVtpLmxlbmd0aC0xXSYmYy5jbG9zZVBhdGgoKSxnLmZpbGwmJihjLmdsb2JhbEFscGhhPWcuZmlsbEFscGhhKmQsYy5maWxsU3R5bGU9ZT1cIiNcIisoXCIwMDAwMFwiKygwfGcuZmlsbENvbG9yKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksYy5maWxsKCkpLGcubGluZVdpZHRoJiYoYy5nbG9iYWxBbHBoYT1nLmxpbmVBbHBoYSpkLGMuc3Ryb2tlKCkpfWVsc2UgaWYoZy50eXBlPT09Yi5HcmFwaGljcy5SRUNUKShnLmZpbGxDb2xvcnx8MD09PWcuZmlsbENvbG9yKSYmKGMuZ2xvYmFsQWxwaGE9Zy5maWxsQWxwaGEqZCxjLmZpbGxTdHlsZT1lPVwiI1wiKyhcIjAwMDAwXCIrKDB8Zy5maWxsQ29sb3IpLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KSxjLmZpbGxSZWN0KGgueCxoLnksaC53aWR0aCxoLmhlaWdodCkpLGcubGluZVdpZHRoJiYoYy5nbG9iYWxBbHBoYT1nLmxpbmVBbHBoYSpkLGMuc3Ryb2tlUmVjdChoLngsaC55LGgud2lkdGgsaC5oZWlnaHQpKTtlbHNlIGlmKGcudHlwZT09PWIuR3JhcGhpY3MuQ0lSQyljLmJlZ2luUGF0aCgpLGMuYXJjKGgueCxoLnksaC5yYWRpdXMsMCwyKk1hdGguUEkpLGMuY2xvc2VQYXRoKCksZy5maWxsJiYoYy5nbG9iYWxBbHBoYT1nLmZpbGxBbHBoYSpkLGMuZmlsbFN0eWxlPWU9XCIjXCIrKFwiMDAwMDBcIisoMHxnLmZpbGxDb2xvcikudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpLGMuZmlsbCgpKSxnLmxpbmVXaWR0aCYmKGMuZ2xvYmFsQWxwaGE9Zy5saW5lQWxwaGEqZCxjLnN0cm9rZSgpKTtlbHNlIGlmKGcudHlwZT09PWIuR3JhcGhpY3MuRUxJUCl7dmFyIGs9MipoLndpZHRoLGw9MipoLmhlaWdodCxtPWgueC1rLzIsbj1oLnktbC8yO2MuYmVnaW5QYXRoKCk7dmFyIG89LjU1MjI4NDgscD1rLzIqbyxxPWwvMipvLHI9bStrLHM9bitsLHQ9bStrLzIsdT1uK2wvMjtjLm1vdmVUbyhtLHUpLGMuYmV6aWVyQ3VydmVUbyhtLHUtcSx0LXAsbix0LG4pLGMuYmV6aWVyQ3VydmVUbyh0K3AsbixyLHUtcSxyLHUpLGMuYmV6aWVyQ3VydmVUbyhyLHUrcSx0K3Ascyx0LHMpLGMuYmV6aWVyQ3VydmVUbyh0LXAscyxtLHUrcSxtLHUpLGMuY2xvc2VQYXRoKCksZy5maWxsJiYoYy5nbG9iYWxBbHBoYT1nLmZpbGxBbHBoYSpkLGMuZmlsbFN0eWxlPWU9XCIjXCIrKFwiMDAwMDBcIisoMHxnLmZpbGxDb2xvcikudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpLGMuZmlsbCgpKSxnLmxpbmVXaWR0aCYmKGMuZ2xvYmFsQWxwaGE9Zy5saW5lQWxwaGEqZCxjLnN0cm9rZSgpKX1lbHNlIGlmKGcudHlwZT09PWIuR3JhcGhpY3MuUlJFQyl7dmFyIHY9aC54LHc9aC55LHg9aC53aWR0aCx5PWguaGVpZ2h0LHo9aC5yYWRpdXMsQT1NYXRoLm1pbih4LHkpLzJ8MDt6PXo+QT9BOnosYy5iZWdpblBhdGgoKSxjLm1vdmVUbyh2LHcreiksYy5saW5lVG8odix3K3kteiksYy5xdWFkcmF0aWNDdXJ2ZVRvKHYsdyt5LHYreix3K3kpLGMubGluZVRvKHYreC16LHcreSksYy5xdWFkcmF0aWNDdXJ2ZVRvKHYreCx3K3ksdit4LHcreS16KSxjLmxpbmVUbyh2K3gsdyt6KSxjLnF1YWRyYXRpY0N1cnZlVG8odit4LHcsdit4LXosdyksYy5saW5lVG8odit6LHcpLGMucXVhZHJhdGljQ3VydmVUbyh2LHcsdix3K3opLGMuY2xvc2VQYXRoKCksKGcuZmlsbENvbG9yfHwwPT09Zy5maWxsQ29sb3IpJiYoYy5nbG9iYWxBbHBoYT1nLmZpbGxBbHBoYSpkLGMuZmlsbFN0eWxlPWU9XCIjXCIrKFwiMDAwMDBcIisoMHxnLmZpbGxDb2xvcikudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpLGMuZmlsbCgpKSxnLmxpbmVXaWR0aCYmKGMuZ2xvYmFsQWxwaGE9Zy5saW5lQWxwaGEqZCxjLnN0cm9rZSgpKX19fSxiLkNhbnZhc0dyYXBoaWNzLnJlbmRlckdyYXBoaWNzTWFzaz1mdW5jdGlvbihhLGMpe3ZhciBkPWEuZ3JhcGhpY3NEYXRhLmxlbmd0aDtpZigwIT09ZCl7ZD4xJiYoZD0xLHdpbmRvdy5jb25zb2xlLmxvZyhcIlBpeGkuanMgd2FybmluZzogbWFza3MgaW4gY2FudmFzIGNhbiBvbmx5IG1hc2sgdXNpbmcgdGhlIGZpcnN0IHBhdGggaW4gdGhlIGdyYXBoaWNzIG9iamVjdFwiKSk7Zm9yKHZhciBlPTA7MT5lO2UrKyl7dmFyIGY9YS5ncmFwaGljc0RhdGFbZV0sZz1mLnNoYXBlO2lmKGYudHlwZT09PWIuR3JhcGhpY3MuUE9MWSl7Yy5iZWdpblBhdGgoKTt2YXIgaD1nLnBvaW50cztjLm1vdmVUbyhoWzBdLGhbMV0pO2Zvcih2YXIgaT0xO2k8aC5sZW5ndGgvMjtpKyspYy5saW5lVG8oaFsyKmldLGhbMippKzFdKTtoWzBdPT09aFtoLmxlbmd0aC0yXSYmaFsxXT09PWhbaC5sZW5ndGgtMV0mJmMuY2xvc2VQYXRoKCl9ZWxzZSBpZihmLnR5cGU9PT1iLkdyYXBoaWNzLlJFQ1QpYy5iZWdpblBhdGgoKSxjLnJlY3QoZy54LGcueSxnLndpZHRoLGcuaGVpZ2h0KSxjLmNsb3NlUGF0aCgpO2Vsc2UgaWYoZi50eXBlPT09Yi5HcmFwaGljcy5DSVJDKWMuYmVnaW5QYXRoKCksYy5hcmMoZy54LGcueSxnLnJhZGl1cywwLDIqTWF0aC5QSSksYy5jbG9zZVBhdGgoKTtlbHNlIGlmKGYudHlwZT09PWIuR3JhcGhpY3MuRUxJUCl7dmFyIGo9MipnLndpZHRoLGs9MipnLmhlaWdodCxsPWcueC1qLzIsbT1nLnktay8yO2MuYmVnaW5QYXRoKCk7dmFyIG49LjU1MjI4NDgsbz1qLzIqbixwPWsvMipuLHE9bCtqLHI9bStrLHM9bCtqLzIsdD1tK2svMjtjLm1vdmVUbyhsLHQpLGMuYmV6aWVyQ3VydmVUbyhsLHQtcCxzLW8sbSxzLG0pLGMuYmV6aWVyQ3VydmVUbyhzK28sbSxxLHQtcCxxLHQpLGMuYmV6aWVyQ3VydmVUbyhxLHQrcCxzK28scixzLHIpLGMuYmV6aWVyQ3VydmVUbyhzLW8scixsLHQrcCxsLHQpLGMuY2xvc2VQYXRoKCl9ZWxzZSBpZihmLnR5cGU9PT1iLkdyYXBoaWNzLlJSRUMpe3ZhciB1PWcucG9pbnRzLHY9dVswXSx3PXVbMV0seD11WzJdLHk9dVszXSx6PXVbNF0sQT1NYXRoLm1pbih4LHkpLzJ8MDt6PXo+QT9BOnosYy5iZWdpblBhdGgoKSxjLm1vdmVUbyh2LHcreiksYy5saW5lVG8odix3K3kteiksYy5xdWFkcmF0aWNDdXJ2ZVRvKHYsdyt5LHYreix3K3kpLGMubGluZVRvKHYreC16LHcreSksYy5xdWFkcmF0aWNDdXJ2ZVRvKHYreCx3K3ksdit4LHcreS16KSxjLmxpbmVUbyh2K3gsdyt6KSxjLnF1YWRyYXRpY0N1cnZlVG8odit4LHcsdit4LXosdyksYy5saW5lVG8odit6LHcpLGMucXVhZHJhdGljQ3VydmVUbyh2LHcsdix3K3opLGMuY2xvc2VQYXRoKCl9fX19LGIuR3JhcGhpY3M9ZnVuY3Rpb24oKXtiLkRpc3BsYXlPYmplY3RDb250YWluZXIuY2FsbCh0aGlzKSx0aGlzLnJlbmRlcmFibGU9ITAsdGhpcy5maWxsQWxwaGE9MSx0aGlzLmxpbmVXaWR0aD0wLHRoaXMubGluZUNvbG9yPTAsdGhpcy5ncmFwaGljc0RhdGE9W10sdGhpcy50aW50PTE2Nzc3MjE1LHRoaXMuYmxlbmRNb2RlPWIuYmxlbmRNb2Rlcy5OT1JNQUwsdGhpcy5jdXJyZW50UGF0aD1udWxsLHRoaXMuX3dlYkdMPVtdLHRoaXMuaXNNYXNrPSExLHRoaXMuYm91bmRzUGFkZGluZz0wLHRoaXMuX2xvY2FsQm91bmRzPW5ldyBiLlJlY3RhbmdsZSgwLDAsMSwxKSx0aGlzLmRpcnR5PSEwLHRoaXMud2ViR0xEaXJ0eT0hMSx0aGlzLmNhY2hlZFNwcml0ZURpcnR5PSExfSxiLkdyYXBoaWNzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpLGIuR3JhcGhpY3MucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuR3JhcGhpY3MsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuR3JhcGhpY3MucHJvdG90eXBlLFwiY2FjaGVBc0JpdG1hcFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY2FjaGVBc0JpdG1hcH0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuX2NhY2hlQXNCaXRtYXA9YSx0aGlzLl9jYWNoZUFzQml0bWFwP3RoaXMuX2dlbmVyYXRlQ2FjaGVkU3ByaXRlKCk6KHRoaXMuZGVzdHJveUNhY2hlZFNwcml0ZSgpLHRoaXMuZGlydHk9ITApfX0pLGIuR3JhcGhpY3MucHJvdG90eXBlLmxpbmVTdHlsZT1mdW5jdGlvbihhLGMsZCl7aWYodGhpcy5saW5lV2lkdGg9YXx8MCx0aGlzLmxpbmVDb2xvcj1jfHwwLHRoaXMubGluZUFscGhhPWFyZ3VtZW50cy5sZW5ndGg8Mz8xOmQsdGhpcy5jdXJyZW50UGF0aCl7aWYodGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoKXJldHVybiB0aGlzLmRyYXdTaGFwZShuZXcgYi5Qb2x5Z29uKHRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLnNsaWNlKC0yKSkpLHRoaXM7dGhpcy5jdXJyZW50UGF0aC5saW5lV2lkdGg9dGhpcy5saW5lV2lkdGgsdGhpcy5jdXJyZW50UGF0aC5saW5lQ29sb3I9dGhpcy5saW5lQ29sb3IsdGhpcy5jdXJyZW50UGF0aC5saW5lQWxwaGE9dGhpcy5saW5lQWxwaGF9cmV0dXJuIHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLm1vdmVUbz1mdW5jdGlvbihhLGMpe3JldHVybiB0aGlzLmRyYXdTaGFwZShuZXcgYi5Qb2x5Z29uKFthLGNdKSksdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUubGluZVRvPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLnB1c2goYSxiKSx0aGlzLmRpcnR5PSEwLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLnF1YWRyYXRpY0N1cnZlVG89ZnVuY3Rpb24oYSxiLGMsZCl7dGhpcy5jdXJyZW50UGF0aD8wPT09dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoJiYodGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHM9WzAsMF0pOnRoaXMubW92ZVRvKDAsMCk7dmFyIGUsZixnPTIwLGg9dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHM7MD09PWgubGVuZ3RoJiZ0aGlzLm1vdmVUbygwLDApO2Zvcih2YXIgaT1oW2gubGVuZ3RoLTJdLGo9aFtoLmxlbmd0aC0xXSxrPTAsbD0xO2c+PWw7bCsrKWs9bC9nLGU9aSsoYS1pKSprLGY9aisoYi1qKSprLGgucHVzaChlKyhhKyhjLWEpKmstZSkqayxmKyhiKyhkLWIpKmstZikqayk7cmV0dXJuIHRoaXMuZGlydHk9ITAsdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuYmV6aWVyQ3VydmVUbz1mdW5jdGlvbihhLGIsYyxkLGUsZil7dGhpcy5jdXJyZW50UGF0aD8wPT09dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoJiYodGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHM9WzAsMF0pOnRoaXMubW92ZVRvKDAsMCk7Zm9yKHZhciBnLGgsaSxqLGssbD0yMCxtPXRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLG49bVttLmxlbmd0aC0yXSxvPW1bbS5sZW5ndGgtMV0scD0wLHE9MTtsPj1xO3ErKylwPXEvbCxnPTEtcCxoPWcqZyxpPWgqZyxqPXAqcCxrPWoqcCxtLnB1c2goaSpuKzMqaCpwKmErMypnKmoqYytrKmUsaSpvKzMqaCpwKmIrMypnKmoqZCtrKmYpO3JldHVybiB0aGlzLmRpcnR5PSEwLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLmFyY1RvPWZ1bmN0aW9uKGEsYixjLGQsZSl7dGhpcy5jdXJyZW50UGF0aD8wPT09dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoJiZ0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5wdXNoKGEsYik6dGhpcy5tb3ZlVG8oYSxiKTt2YXIgZj10aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cyxnPWZbZi5sZW5ndGgtMl0saD1mW2YubGVuZ3RoLTFdLGk9aC1iLGo9Zy1hLGs9ZC1iLGw9Yy1hLG09TWF0aC5hYnMoaSpsLWoqayk7aWYoMWUtOD5tfHwwPT09ZSkoZltmLmxlbmd0aC0yXSE9PWF8fGZbZi5sZW5ndGgtMV0hPT1iKSYmZi5wdXNoKGEsYik7ZWxzZXt2YXIgbj1pKmkraipqLG89ayprK2wqbCxwPWkqaytqKmwscT1lKk1hdGguc3FydChuKS9tLHI9ZSpNYXRoLnNxcnQobykvbSxzPXEqcC9uLHQ9cipwL28sdT1xKmwrcipqLHY9cSprK3IqaSx3PWoqKHIrcykseD1pKihyK3MpLHk9bCoocSt0KSx6PWsqKHErdCksQT1NYXRoLmF0YW4yKHgtdix3LXUpLEI9TWF0aC5hdGFuMih6LXYseS11KTt0aGlzLmFyYyh1K2EsditiLGUsQSxCLGoqaz5sKmkpfXJldHVybiB0aGlzLmRpcnR5PSEwLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLmFyYz1mdW5jdGlvbihhLGIsYyxkLGUsZil7dmFyIGc9YStNYXRoLmNvcyhkKSpjLGg9YitNYXRoLnNpbihkKSpjLGk9dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHM7aWYoMD09PWkubGVuZ3RoPyh0aGlzLm1vdmVUbyhnLGgpLGk9dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMpOihpW2kubGVuZ3RoLTJdIT09Z3x8aVtpLmxlbmd0aC0xXSE9PWgpJiZpLnB1c2goZyxoKSxkPT09ZSlyZXR1cm4gdGhpczshZiYmZD49ZT9lKz0yKk1hdGguUEk6ZiYmZT49ZCYmKGQrPTIqTWF0aC5QSSk7dmFyIGo9Zj8tMSooZC1lKTplLWQsaz1NYXRoLmFicyhqKS8oMipNYXRoLlBJKSo0MDtpZigwPT09ailyZXR1cm4gdGhpcztmb3IodmFyIGw9ai8oMiprKSxtPTIqbCxuPU1hdGguY29zKGwpLG89TWF0aC5zaW4obCkscD1rLTEscT1wJTEvcCxyPTA7cD49cjtyKyspe3ZhciBzPXIrcSpyLHQ9bCtkK20qcyx1PU1hdGguY29zKHQpLHY9LU1hdGguc2luKHQpO2kucHVzaCgobip1K28qdikqYythLChuKi12K28qdSkqYytiKX1yZXR1cm4gdGhpcy5kaXJ0eT0hMCx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5iZWdpbkZpbGw9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5maWxsaW5nPSEwLHRoaXMuZmlsbENvbG9yPWF8fDAsdGhpcy5maWxsQWxwaGE9dm9pZCAwPT09Yj8xOmIsdGhpcy5jdXJyZW50UGF0aCYmdGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMubGVuZ3RoPD0yJiYodGhpcy5jdXJyZW50UGF0aC5maWxsPXRoaXMuZmlsbGluZyx0aGlzLmN1cnJlbnRQYXRoLmZpbGxDb2xvcj10aGlzLmZpbGxDb2xvcix0aGlzLmN1cnJlbnRQYXRoLmZpbGxBbHBoYT10aGlzLmZpbGxBbHBoYSksdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuZW5kRmlsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmZpbGxpbmc9ITEsdGhpcy5maWxsQ29sb3I9bnVsbCx0aGlzLmZpbGxBbHBoYT0xLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLmRyYXdSZWN0PWZ1bmN0aW9uKGEsYyxkLGUpe3JldHVybiB0aGlzLmRyYXdTaGFwZShuZXcgYi5SZWN0YW5nbGUoYSxjLGQsZSkpLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLmRyYXdSb3VuZGVkUmVjdD1mdW5jdGlvbihhLGMsZCxlLGYpe3JldHVybiB0aGlzLmRyYXdTaGFwZShuZXcgYi5Sb3VuZGVkUmVjdGFuZ2xlKGEsYyxkLGUsZikpLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLmRyYXdDaXJjbGU9ZnVuY3Rpb24oYSxjLGQpe3JldHVybiB0aGlzLmRyYXdTaGFwZShuZXcgYi5DaXJjbGUoYSxjLGQpKSx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5kcmF3RWxsaXBzZT1mdW5jdGlvbihhLGMsZCxlKXtyZXR1cm4gdGhpcy5kcmF3U2hhcGUobmV3IGIuRWxsaXBzZShhLGMsZCxlKSksdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuZHJhd1BvbHlnb249ZnVuY3Rpb24oYSl7cmV0dXJuIGEgaW5zdGFuY2VvZiBBcnJheXx8KGE9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSksdGhpcy5kcmF3U2hhcGUobmV3IGIuUG9seWdvbihhKSksdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5saW5lV2lkdGg9MCx0aGlzLmZpbGxpbmc9ITEsdGhpcy5kaXJ0eT0hMCx0aGlzLmNsZWFyRGlydHk9ITAsdGhpcy5ncmFwaGljc0RhdGE9W10sdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuZ2VuZXJhdGVUZXh0dXJlPWZ1bmN0aW9uKGEsYyl7YT1hfHwxO3ZhciBkPXRoaXMuZ2V0Qm91bmRzKCksZT1uZXcgYi5DYW52YXNCdWZmZXIoZC53aWR0aCphLGQuaGVpZ2h0KmEpLGY9Yi5UZXh0dXJlLmZyb21DYW52YXMoZS5jYW52YXMsYyk7cmV0dXJuIGYuYmFzZVRleHR1cmUucmVzb2x1dGlvbj1hLGUuY29udGV4dC5zY2FsZShhLGEpLGUuY29udGV4dC50cmFuc2xhdGUoLWQueCwtZC55KSxiLkNhbnZhc0dyYXBoaWNzLnJlbmRlckdyYXBoaWNzKHRoaXMsZS5jb250ZXh0KSxmfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5fcmVuZGVyV2ViR0w9ZnVuY3Rpb24oYSl7aWYodGhpcy52aXNpYmxlIT09ITEmJjAhPT10aGlzLmFscGhhJiZ0aGlzLmlzTWFzayE9PSEwKXtpZih0aGlzLl9jYWNoZUFzQml0bWFwKXJldHVybih0aGlzLmRpcnR5fHx0aGlzLmNhY2hlZFNwcml0ZURpcnR5KSYmKHRoaXMuX2dlbmVyYXRlQ2FjaGVkU3ByaXRlKCksdGhpcy51cGRhdGVDYWNoZWRTcHJpdGVUZXh0dXJlKCksdGhpcy5jYWNoZWRTcHJpdGVEaXJ0eT0hMSx0aGlzLmRpcnR5PSExKSx0aGlzLl9jYWNoZWRTcHJpdGUud29ybGRBbHBoYT10aGlzLndvcmxkQWxwaGEsYi5TcHJpdGUucHJvdG90eXBlLl9yZW5kZXJXZWJHTC5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSxhKSx2b2lkIDA7aWYoYS5zcHJpdGVCYXRjaC5zdG9wKCksYS5ibGVuZE1vZGVNYW5hZ2VyLnNldEJsZW5kTW9kZSh0aGlzLmJsZW5kTW9kZSksdGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wdXNoTWFzayh0aGlzLl9tYXNrLGEpLHRoaXMuX2ZpbHRlcnMmJmEuZmlsdGVyTWFuYWdlci5wdXNoRmlsdGVyKHRoaXMuX2ZpbHRlckJsb2NrKSx0aGlzLmJsZW5kTW9kZSE9PWEuc3ByaXRlQmF0Y2guY3VycmVudEJsZW5kTW9kZSl7YS5zcHJpdGVCYXRjaC5jdXJyZW50QmxlbmRNb2RlPXRoaXMuYmxlbmRNb2RlO3ZhciBjPWIuYmxlbmRNb2Rlc1dlYkdMW2Euc3ByaXRlQmF0Y2guY3VycmVudEJsZW5kTW9kZV07YS5zcHJpdGVCYXRjaC5nbC5ibGVuZEZ1bmMoY1swXSxjWzFdKX1pZih0aGlzLndlYkdMRGlydHkmJih0aGlzLmRpcnR5PSEwLHRoaXMud2ViR0xEaXJ0eT0hMSksYi5XZWJHTEdyYXBoaWNzLnJlbmRlckdyYXBoaWNzKHRoaXMsYSksdGhpcy5jaGlsZHJlbi5sZW5ndGgpe2Euc3ByaXRlQmF0Y2guc3RhcnQoKTtmb3IodmFyIGQ9MCxlPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2U+ZDtkKyspdGhpcy5jaGlsZHJlbltkXS5fcmVuZGVyV2ViR0woYSk7YS5zcHJpdGVCYXRjaC5zdG9wKCl9dGhpcy5fZmlsdGVycyYmYS5maWx0ZXJNYW5hZ2VyLnBvcEZpbHRlcigpLHRoaXMuX21hc2smJmEubWFza01hbmFnZXIucG9wTWFzayh0aGlzLm1hc2ssYSksYS5kcmF3Q291bnQrKyxhLnNwcml0ZUJhdGNoLnN0YXJ0KCl9fSxiLkdyYXBoaWNzLnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzPWZ1bmN0aW9uKGEpe2lmKHRoaXMudmlzaWJsZSE9PSExJiYwIT09dGhpcy5hbHBoYSYmdGhpcy5pc01hc2shPT0hMCl7aWYodGhpcy5fY2FjaGVBc0JpdG1hcClyZXR1cm4odGhpcy5kaXJ0eXx8dGhpcy5jYWNoZWRTcHJpdGVEaXJ0eSkmJih0aGlzLl9nZW5lcmF0ZUNhY2hlZFNwcml0ZSgpLHRoaXMudXBkYXRlQ2FjaGVkU3ByaXRlVGV4dHVyZSgpLHRoaXMuY2FjaGVkU3ByaXRlRGlydHk9ITEsdGhpcy5kaXJ0eT0hMSksdGhpcy5fY2FjaGVkU3ByaXRlLmFscGhhPXRoaXMuYWxwaGEsYi5TcHJpdGUucHJvdG90eXBlLl9yZW5kZXJDYW52YXMuY2FsbCh0aGlzLl9jYWNoZWRTcHJpdGUsYSksdm9pZCAwO3ZhciBjPWEuY29udGV4dCxkPXRoaXMud29ybGRUcmFuc2Zvcm07dGhpcy5ibGVuZE1vZGUhPT1hLmN1cnJlbnRCbGVuZE1vZGUmJihhLmN1cnJlbnRCbGVuZE1vZGU9dGhpcy5ibGVuZE1vZGUsYy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249Yi5ibGVuZE1vZGVzQ2FudmFzW2EuY3VycmVudEJsZW5kTW9kZV0pLHRoaXMuX21hc2smJmEubWFza01hbmFnZXIucHVzaE1hc2sodGhpcy5fbWFzayxhKTt2YXIgZT1hLnJlc29sdXRpb247Yy5zZXRUcmFuc2Zvcm0oZC5hKmUsZC5iKmUsZC5jKmUsZC5kKmUsZC50eCplLGQudHkqZSksYi5DYW52YXNHcmFwaGljcy5yZW5kZXJHcmFwaGljcyh0aGlzLGMpO2Zvcih2YXIgZj0wLGc9dGhpcy5jaGlsZHJlbi5sZW5ndGg7Zz5mO2YrKyl0aGlzLmNoaWxkcmVuW2ZdLl9yZW5kZXJDYW52YXMoYSk7dGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKGEpfX0sYi5HcmFwaGljcy5wcm90b3R5cGUuZ2V0Qm91bmRzPWZ1bmN0aW9uKGEpe2lmKHRoaXMuaXNNYXNrKXJldHVybiBiLkVtcHR5UmVjdGFuZ2xlO3RoaXMuZGlydHkmJih0aGlzLnVwZGF0ZUxvY2FsQm91bmRzKCksdGhpcy53ZWJHTERpcnR5PSEwLHRoaXMuY2FjaGVkU3ByaXRlRGlydHk9ITAsdGhpcy5kaXJ0eT0hMSk7dmFyIGM9dGhpcy5fbG9jYWxCb3VuZHMsZD1jLngsZT1jLndpZHRoK2MueCxmPWMueSxnPWMuaGVpZ2h0K2MueSxoPWF8fHRoaXMud29ybGRUcmFuc2Zvcm0saT1oLmEsaj1oLmIsaz1oLmMsbD1oLmQsbT1oLnR4LG49aC50eSxvPWkqZStrKmcrbSxwPWwqZytqKmUrbixxPWkqZCtrKmcrbSxyPWwqZytqKmQrbixzPWkqZCtrKmYrbSx0PWwqZitqKmQrbix1PWkqZStrKmYrbSx2PWwqZitqKmUrbix3PW8seD1wLHk9byx6PXA7cmV0dXJuIHk9eT5xP3E6eSx5PXk+cz9zOnkseT15PnU/dTp5LHo9ej5yP3I6eix6PXo+dD90Onosej16PnY/djp6LHc9cT53P3E6dyx3PXM+dz9zOncsdz11Pnc/dTp3LHg9cj54P3I6eCx4PXQ+eD90OngseD12Png/djp4LHRoaXMuX2JvdW5kcy54PXksdGhpcy5fYm91bmRzLndpZHRoPXcteSx0aGlzLl9ib3VuZHMueT16LHRoaXMuX2JvdW5kcy5oZWlnaHQ9eC16LHRoaXMuX2JvdW5kc30sYi5HcmFwaGljcy5wcm90b3R5cGUudXBkYXRlTG9jYWxCb3VuZHM9ZnVuY3Rpb24oKXt2YXIgYT0xLzAsYz0tMS8wLGQ9MS8wLGU9LTEvMDtpZih0aGlzLmdyYXBoaWNzRGF0YS5sZW5ndGgpZm9yKHZhciBmLGcsaCxpLGosayxsPTA7bDx0aGlzLmdyYXBoaWNzRGF0YS5sZW5ndGg7bCsrKXt2YXIgbT10aGlzLmdyYXBoaWNzRGF0YVtsXSxuPW0udHlwZSxvPW0ubGluZVdpZHRoO2lmKGY9bS5zaGFwZSxuPT09Yi5HcmFwaGljcy5SRUNUfHxuPT09Yi5HcmFwaGljcy5SUkVDKWg9Zi54LW8vMixpPWYueS1vLzIsaj1mLndpZHRoK28saz1mLmhlaWdodCtvLGE9YT5oP2g6YSxjPWgraj5jP2grajpjLGQ9ZD5pP2k6ZCxlPWkraz5lP2krazplO2Vsc2UgaWYobj09PWIuR3JhcGhpY3MuQ0lSQyloPWYueCxpPWYueSxqPWYucmFkaXVzK28vMixrPWYucmFkaXVzK28vMixhPWE+aC1qP2gtajphLGM9aCtqPmM/aCtqOmMsZD1kPmktaz9pLWs6ZCxlPWkraz5lP2krazplO2Vsc2UgaWYobj09PWIuR3JhcGhpY3MuRUxJUCloPWYueCxpPWYueSxqPWYud2lkdGgrby8yLGs9Zi5oZWlnaHQrby8yLGE9YT5oLWo/aC1qOmEsYz1oK2o+Yz9oK2o6YyxkPWQ+aS1rP2ktazpkLGU9aStrPmU/aStrOmU7ZWxzZXtnPWYucG9pbnRzO2Zvcih2YXIgcD0wO3A8Zy5sZW5ndGg7cCs9MiloPWdbcF0saT1nW3ArMV0sYT1hPmgtbz9oLW86YSxjPWgrbz5jP2grbzpjLGQ9ZD5pLW8/aS1vOmQsZT1pK28+ZT9pK286ZX19ZWxzZSBhPTAsYz0wLGQ9MCxlPTA7dmFyIHE9dGhpcy5ib3VuZHNQYWRkaW5nO3RoaXMuX2xvY2FsQm91bmRzLng9YS1xLHRoaXMuX2xvY2FsQm91bmRzLndpZHRoPWMtYSsyKnEsdGhpcy5fbG9jYWxCb3VuZHMueT1kLXEsdGhpcy5fbG9jYWxCb3VuZHMuaGVpZ2h0PWUtZCsyKnF9LGIuR3JhcGhpY3MucHJvdG90eXBlLl9nZW5lcmF0ZUNhY2hlZFNwcml0ZT1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2V0TG9jYWxCb3VuZHMoKTtpZih0aGlzLl9jYWNoZWRTcHJpdGUpdGhpcy5fY2FjaGVkU3ByaXRlLmJ1ZmZlci5yZXNpemUoYS53aWR0aCxhLmhlaWdodCk7ZWxzZXt2YXIgYz1uZXcgYi5DYW52YXNCdWZmZXIoYS53aWR0aCxhLmhlaWdodCksZD1iLlRleHR1cmUuZnJvbUNhbnZhcyhjLmNhbnZhcyk7dGhpcy5fY2FjaGVkU3ByaXRlPW5ldyBiLlNwcml0ZShkKSx0aGlzLl9jYWNoZWRTcHJpdGUuYnVmZmVyPWMsdGhpcy5fY2FjaGVkU3ByaXRlLndvcmxkVHJhbnNmb3JtPXRoaXMud29ybGRUcmFuc2Zvcm19dGhpcy5fY2FjaGVkU3ByaXRlLmFuY2hvci54PS0oYS54L2Eud2lkdGgpLHRoaXMuX2NhY2hlZFNwcml0ZS5hbmNob3IueT0tKGEueS9hLmhlaWdodCksdGhpcy5fY2FjaGVkU3ByaXRlLmJ1ZmZlci5jb250ZXh0LnRyYW5zbGF0ZSgtYS54LC1hLnkpLHRoaXMud29ybGRBbHBoYT0xLGIuQ2FudmFzR3JhcGhpY3MucmVuZGVyR3JhcGhpY3ModGhpcyx0aGlzLl9jYWNoZWRTcHJpdGUuYnVmZmVyLmNvbnRleHQpLHRoaXMuX2NhY2hlZFNwcml0ZS5hbHBoYT10aGlzLmFscGhhfSxiLkdyYXBoaWNzLnByb3RvdHlwZS51cGRhdGVDYWNoZWRTcHJpdGVUZXh0dXJlPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fY2FjaGVkU3ByaXRlLGI9YS50ZXh0dXJlLGM9YS5idWZmZXIuY2FudmFzO2IuYmFzZVRleHR1cmUud2lkdGg9Yy53aWR0aCxiLmJhc2VUZXh0dXJlLmhlaWdodD1jLmhlaWdodCxiLmNyb3Aud2lkdGg9Yi5mcmFtZS53aWR0aD1jLndpZHRoLGIuY3JvcC5oZWlnaHQ9Yi5mcmFtZS5oZWlnaHQ9Yy5oZWlnaHQsYS5fd2lkdGg9Yy53aWR0aCxhLl9oZWlnaHQ9Yy5oZWlnaHQsYi5iYXNlVGV4dHVyZS5kaXJ0eSgpfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5kZXN0cm95Q2FjaGVkU3ByaXRlPWZ1bmN0aW9uKCl7dGhpcy5fY2FjaGVkU3ByaXRlLnRleHR1cmUuZGVzdHJveSghMCksdGhpcy5fY2FjaGVkU3ByaXRlPW51bGx9LGIuR3JhcGhpY3MucHJvdG90eXBlLmRyYXdTaGFwZT1mdW5jdGlvbihhKXt0aGlzLmN1cnJlbnRQYXRoJiZ0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGg8PTImJnRoaXMuZ3JhcGhpY3NEYXRhLnBvcCgpLHRoaXMuY3VycmVudFBhdGg9bnVsbDt2YXIgYz1uZXcgYi5HcmFwaGljc0RhdGEodGhpcy5saW5lV2lkdGgsdGhpcy5saW5lQ29sb3IsdGhpcy5saW5lQWxwaGEsdGhpcy5maWxsQ29sb3IsdGhpcy5maWxsQWxwaGEsdGhpcy5maWxsaW5nLGEpO3JldHVybiB0aGlzLmdyYXBoaWNzRGF0YS5wdXNoKGMpLGMudHlwZT09PWIuR3JhcGhpY3MuUE9MWSYmKGMuc2hhcGUuY2xvc2VkPXRoaXMuZmlsbGluZyx0aGlzLmN1cnJlbnRQYXRoPWMpLHRoaXMuZGlydHk9ITAsY30sYi5HcmFwaGljc0RhdGE9ZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyl7dGhpcy5saW5lV2lkdGg9YSx0aGlzLmxpbmVDb2xvcj1iLHRoaXMubGluZUFscGhhPWMsdGhpcy5maWxsQ29sb3I9ZCx0aGlzLmZpbGxBbHBoYT1lLHRoaXMuZmlsbD1mLHRoaXMuc2hhcGU9Zyx0aGlzLnR5cGU9Zy50eXBlfSxiLkdyYXBoaWNzLlBPTFk9MCxiLkdyYXBoaWNzLlJFQ1Q9MSxiLkdyYXBoaWNzLkNJUkM9MixiLkdyYXBoaWNzLkVMSVA9MyxiLkdyYXBoaWNzLlJSRUM9NCxiLlBvbHlnb24ucHJvdG90eXBlLnR5cGU9Yi5HcmFwaGljcy5QT0xZLGIuUmVjdGFuZ2xlLnByb3RvdHlwZS50eXBlPWIuR3JhcGhpY3MuUkVDVCxiLkNpcmNsZS5wcm90b3R5cGUudHlwZT1iLkdyYXBoaWNzLkNJUkMsYi5FbGxpcHNlLnByb3RvdHlwZS50eXBlPWIuR3JhcGhpY3MuRUxJUCxiLlJvdW5kZWRSZWN0YW5nbGUucHJvdG90eXBlLnR5cGU9Yi5HcmFwaGljcy5SUkVDLGIuU3RyaXA9ZnVuY3Rpb24oYSl7Yi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLmNhbGwodGhpcyksdGhpcy50ZXh0dXJlPWEsdGhpcy51dnM9bmV3IGIuRmxvYXQzMkFycmF5KFswLDEsMSwxLDEsMCwwLDFdKSx0aGlzLnZlcnRpY2llcz1uZXcgYi5GbG9hdDMyQXJyYXkoWzAsMCwxMDAsMCwxMDAsMTAwLDAsMTAwXSksdGhpcy5jb2xvcnM9bmV3IGIuRmxvYXQzMkFycmF5KFsxLDEsMSwxXSksdGhpcy5pbmRpY2VzPW5ldyBiLlVpbnQxNkFycmF5KFswLDEsMiwzXSksdGhpcy5kaXJ0eT0hMCx0aGlzLmJsZW5kTW9kZT1iLmJsZW5kTW9kZXMuTk9STUFMLHRoaXMucGFkZGluZz0wfSxiLlN0cmlwLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpLGIuU3RyaXAucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuU3RyaXAsYi5TdHJpcC5wcm90b3R5cGUuX3JlbmRlcldlYkdMPWZ1bmN0aW9uKGEpeyF0aGlzLnZpc2libGV8fHRoaXMuYWxwaGE8PTB8fChhLnNwcml0ZUJhdGNoLnN0b3AoKSx0aGlzLl92ZXJ0ZXhCdWZmZXJ8fHRoaXMuX2luaXRXZWJHTChhKSxhLnNoYWRlck1hbmFnZXIuc2V0U2hhZGVyKGEuc2hhZGVyTWFuYWdlci5zdHJpcFNoYWRlciksdGhpcy5fcmVuZGVyU3RyaXAoYSksYS5zcHJpdGVCYXRjaC5zdGFydCgpKX0sYi5TdHJpcC5wcm90b3R5cGUuX2luaXRXZWJHTD1mdW5jdGlvbihhKXt2YXIgYj1hLmdsO3RoaXMuX3ZlcnRleEJ1ZmZlcj1iLmNyZWF0ZUJ1ZmZlcigpLHRoaXMuX2luZGV4QnVmZmVyPWIuY3JlYXRlQnVmZmVyKCksdGhpcy5fdXZCdWZmZXI9Yi5jcmVhdGVCdWZmZXIoKSx0aGlzLl9jb2xvckJ1ZmZlcj1iLmNyZWF0ZUJ1ZmZlcigpLGIuYmluZEJ1ZmZlcihiLkFSUkFZX0JVRkZFUix0aGlzLl92ZXJ0ZXhCdWZmZXIpLGIuYnVmZmVyRGF0YShiLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRpY2llcyxiLkRZTkFNSUNfRFJBVyksYi5iaW5kQnVmZmVyKGIuQVJSQVlfQlVGRkVSLHRoaXMuX3V2QnVmZmVyKSxiLmJ1ZmZlckRhdGEoYi5BUlJBWV9CVUZGRVIsdGhpcy51dnMsYi5TVEFUSUNfRFJBVyksYi5iaW5kQnVmZmVyKGIuQVJSQVlfQlVGRkVSLHRoaXMuX2NvbG9yQnVmZmVyKSxiLmJ1ZmZlckRhdGEoYi5BUlJBWV9CVUZGRVIsdGhpcy5jb2xvcnMsYi5TVEFUSUNfRFJBVyksYi5iaW5kQnVmZmVyKGIuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5faW5kZXhCdWZmZXIpLGIuYnVmZmVyRGF0YShiLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuaW5kaWNlcyxiLlNUQVRJQ19EUkFXKX0sYi5TdHJpcC5wcm90b3R5cGUuX3JlbmRlclN0cmlwPWZ1bmN0aW9uKGEpe3ZhciBiPWEuZ2wsYz1hLnByb2plY3Rpb24sZD1hLm9mZnNldCxlPWEuc2hhZGVyTWFuYWdlci5zdHJpcFNoYWRlcjthLmJsZW5kTW9kZU1hbmFnZXIuc2V0QmxlbmRNb2RlKHRoaXMuYmxlbmRNb2RlKSxiLnVuaWZvcm1NYXRyaXgzZnYoZS50cmFuc2xhdGlvbk1hdHJpeCwhMSx0aGlzLndvcmxkVHJhbnNmb3JtLnRvQXJyYXkoITApKSxiLnVuaWZvcm0yZihlLnByb2plY3Rpb25WZWN0b3IsYy54LC1jLnkpLGIudW5pZm9ybTJmKGUub2Zmc2V0VmVjdG9yLC1kLngsLWQueSksYi51bmlmb3JtMWYoZS5hbHBoYSx0aGlzLndvcmxkQWxwaGEpLHRoaXMuZGlydHk/KHRoaXMuZGlydHk9ITEsYi5iaW5kQnVmZmVyKGIuQVJSQVlfQlVGRkVSLHRoaXMuX3ZlcnRleEJ1ZmZlciksYi5idWZmZXJEYXRhKGIuQVJSQVlfQlVGRkVSLHRoaXMudmVydGljaWVzLGIuU1RBVElDX0RSQVcpLGIudmVydGV4QXR0cmliUG9pbnRlcihlLmFWZXJ0ZXhQb3NpdGlvbiwyLGIuRkxPQVQsITEsMCwwKSxiLmJpbmRCdWZmZXIoYi5BUlJBWV9CVUZGRVIsdGhpcy5fdXZCdWZmZXIpLGIuYnVmZmVyRGF0YShiLkFSUkFZX0JVRkZFUix0aGlzLnV2cyxiLlNUQVRJQ19EUkFXKSxiLnZlcnRleEF0dHJpYlBvaW50ZXIoZS5hVGV4dHVyZUNvb3JkLDIsYi5GTE9BVCwhMSwwLDApLGIuYWN0aXZlVGV4dHVyZShiLlRFWFRVUkUwKSx0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuX2RpcnR5W2IuaWRdP2EucmVuZGVyZXIudXBkYXRlVGV4dHVyZSh0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUpOmIuYmluZFRleHR1cmUoYi5URVhUVVJFXzJELHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5fZ2xUZXh0dXJlc1tiLmlkXSksYi5iaW5kQnVmZmVyKGIuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5faW5kZXhCdWZmZXIpLGIuYnVmZmVyRGF0YShiLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuaW5kaWNlcyxiLlNUQVRJQ19EUkFXKSk6KGIuYmluZEJ1ZmZlcihiLkFSUkFZX0JVRkZFUix0aGlzLl92ZXJ0ZXhCdWZmZXIpLGIuYnVmZmVyU3ViRGF0YShiLkFSUkFZX0JVRkZFUiwwLHRoaXMudmVydGljaWVzKSxiLnZlcnRleEF0dHJpYlBvaW50ZXIoZS5hVmVydGV4UG9zaXRpb24sMixiLkZMT0FULCExLDAsMCksYi5iaW5kQnVmZmVyKGIuQVJSQVlfQlVGRkVSLHRoaXMuX3V2QnVmZmVyKSxiLnZlcnRleEF0dHJpYlBvaW50ZXIoZS5hVGV4dHVyZUNvb3JkLDIsYi5GTE9BVCwhMSwwLDApLGIuYWN0aXZlVGV4dHVyZShiLlRFWFRVUkUwKSx0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuX2RpcnR5W2IuaWRdP2EucmVuZGVyZXIudXBkYXRlVGV4dHVyZSh0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUpOmIuYmluZFRleHR1cmUoYi5URVhUVVJFXzJELHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5fZ2xUZXh0dXJlc1tiLmlkXSksYi5iaW5kQnVmZmVyKGIuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5faW5kZXhCdWZmZXIpKSxiLmRyYXdFbGVtZW50cyhiLlRSSUFOR0xFX1NUUklQLHRoaXMuaW5kaWNlcy5sZW5ndGgsYi5VTlNJR05FRF9TSE9SVCwwKX0sYi5TdHJpcC5wcm90b3R5cGUuX3JlbmRlckNhbnZhcz1mdW5jdGlvbihhKXt2YXIgYj1hLmNvbnRleHQsYz10aGlzLndvcmxkVHJhbnNmb3JtO2Eucm91bmRQaXhlbHM/Yi5zZXRUcmFuc2Zvcm0oYy5hLGMuYixjLmMsYy5kLDB8Yy50eCwwfGMudHkpOmIuc2V0VHJhbnNmb3JtKGMuYSxjLmIsYy5jLGMuZCxjLnR4LGMudHkpO3ZhciBkPXRoaXMsZT1kLnZlcnRpY2llcyxmPWQudXZzLGc9ZS5sZW5ndGgvMjt0aGlzLmNvdW50Kys7Zm9yKHZhciBoPTA7Zy0yPmg7aCsrKXt2YXIgaT0yKmgsaj1lW2ldLGs9ZVtpKzJdLGw9ZVtpKzRdLG09ZVtpKzFdLG49ZVtpKzNdLG89ZVtpKzVdO2lmKHRoaXMucGFkZGluZz4wKXt2YXIgcD0oaitrK2wpLzMscT0obStuK28pLzMscj1qLXAscz1tLXEsdD1NYXRoLnNxcnQocipyK3Mqcyk7aj1wK3IvdCoodCszKSxtPXErcy90Kih0KzMpLHI9ay1wLHM9bi1xLHQ9TWF0aC5zcXJ0KHIqcitzKnMpLGs9cCtyL3QqKHQrMyksbj1xK3MvdCoodCszKSxyPWwtcCxzPW8tcSx0PU1hdGguc3FydChyKnIrcypzKSxsPXArci90Kih0KzMpLG89cStzL3QqKHQrMyl9dmFyIHU9ZltpXSpkLnRleHR1cmUud2lkdGgsdj1mW2krMl0qZC50ZXh0dXJlLndpZHRoLHc9ZltpKzRdKmQudGV4dHVyZS53aWR0aCx4PWZbaSsxXSpkLnRleHR1cmUuaGVpZ2h0LHk9ZltpKzNdKmQudGV4dHVyZS5oZWlnaHQsej1mW2krNV0qZC50ZXh0dXJlLmhlaWdodDtiLnNhdmUoKSxiLmJlZ2luUGF0aCgpLGIubW92ZVRvKGosbSksYi5saW5lVG8oayxuKSxiLmxpbmVUbyhsLG8pLGIuY2xvc2VQYXRoKCksYi5jbGlwKCk7dmFyIEE9dSp5K3gqdyt2KnoteSp3LXgqdi11KnosQj1qKnkreCpsK2sqei15KmwteCprLWoqeixDPXUqaytqKncrdipsLWsqdy1qKnYtdSpsLEQ9dSp5KmwreCprKncraip2Knotaip5KncteCp2KmwtdSprKnosRT1tKnkreCpvK24qei15Km8teCpuLW0qeixGPXUqbittKncrdipvLW4qdy1tKnYtdSpvLEc9dSp5Km8reCpuKncrbSp2KnotbSp5KncteCp2Km8tdSpuKno7Yi50cmFuc2Zvcm0oQi9BLEUvQSxDL0EsRi9BLEQvQSxHL0EpLGIuZHJhd0ltYWdlKGQudGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2UsMCwwKSxiLnJlc3RvcmUoKX19LGIuU3RyaXAucHJvdG90eXBlLnJlbmRlclN0cmlwRmxhdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLmNvbnRleHQsYz1hLnZlcnRpY2llcyxkPWMubGVuZ3RoLzI7dGhpcy5jb3VudCsrLGIuYmVnaW5QYXRoKCk7Zm9yKHZhciBlPTE7ZC0yPmU7ZSsrKXt2YXIgZj0yKmUsZz1jW2ZdLGg9Y1tmKzJdLGk9Y1tmKzRdLGo9Y1tmKzFdLGs9Y1tmKzNdLGw9Y1tmKzVdO2IubW92ZVRvKGcsaiksYi5saW5lVG8oaCxrKSxiLmxpbmVUbyhpLGwpfWIuZmlsbFN0eWxlPVwiI0ZGMDAwMFwiLGIuZmlsbCgpLGIuY2xvc2VQYXRoKCl9LGIuU3RyaXAucHJvdG90eXBlLm9uVGV4dHVyZVVwZGF0ZT1mdW5jdGlvbigpe3RoaXMudXBkYXRlRnJhbWU9ITB9LGIuUm9wZT1mdW5jdGlvbihhLGMpe2IuU3RyaXAuY2FsbCh0aGlzLGEpLHRoaXMucG9pbnRzPWMsdGhpcy52ZXJ0aWNpZXM9bmV3IGIuRmxvYXQzMkFycmF5KDQqYy5sZW5ndGgpLHRoaXMudXZzPW5ldyBiLkZsb2F0MzJBcnJheSg0KmMubGVuZ3RoKSx0aGlzLmNvbG9ycz1uZXcgYi5GbG9hdDMyQXJyYXkoMipjLmxlbmd0aCksdGhpcy5pbmRpY2VzPW5ldyBiLlVpbnQxNkFycmF5KDIqYy5sZW5ndGgpLHRoaXMucmVmcmVzaCgpfSxiLlJvcGUucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5TdHJpcC5wcm90b3R5cGUpLGIuUm9wZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Sb3BlLGIuUm9wZS5wcm90b3R5cGUucmVmcmVzaD1mdW5jdGlvbigpe3ZhciBhPXRoaXMucG9pbnRzO2lmKCEoYS5sZW5ndGg8MSkpe3ZhciBiPXRoaXMudXZzLGM9YVswXSxkPXRoaXMuaW5kaWNlcyxlPXRoaXMuY29sb3JzO3RoaXMuY291bnQtPS4yLGJbMF09MCxiWzFdPTAsYlsyXT0wLGJbM109MSxlWzBdPTEsZVsxXT0xLGRbMF09MCxkWzFdPTE7Zm9yKHZhciBmLGcsaCxpPWEubGVuZ3RoLGo9MTtpPmo7aisrKWY9YVtqXSxnPTQqaixoPWovKGktMSksaiUyPyhiW2ddPWgsYltnKzFdPTAsYltnKzJdPWgsYltnKzNdPTEpOihiW2ddPWgsYltnKzFdPTAsYltnKzJdPWgsYltnKzNdPTEpLGc9MipqLGVbZ109MSxlW2crMV09MSxnPTIqaixkW2ddPWcsZFtnKzFdPWcrMSxjPWZ9fSxiLlJvcGUucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybT1mdW5jdGlvbigpe3ZhciBhPXRoaXMucG9pbnRzO2lmKCEoYS5sZW5ndGg8MSkpe3ZhciBjLGQ9YVswXSxlPXt4OjAseTowfTt0aGlzLmNvdW50LT0uMjtmb3IodmFyIGYsZyxoLGksaixrPXRoaXMudmVydGljaWVzLGw9YS5sZW5ndGgsbT0wO2w+bTttKyspZj1hW21dLGc9NCptLGM9bTxhLmxlbmd0aC0xP2FbbSsxXTpmLGUueT0tKGMueC1kLngpLGUueD1jLnktZC55LGg9MTAqKDEtbS8obC0xKSksaD4xJiYoaD0xKSxpPU1hdGguc3FydChlLngqZS54K2UueSplLnkpLGo9dGhpcy50ZXh0dXJlLmhlaWdodC8yLGUueC89aSxlLnkvPWksZS54Kj1qLGUueSo9aixrW2ddPWYueCtlLngsa1tnKzFdPWYueStlLnksa1tnKzJdPWYueC1lLngsa1tnKzNdPWYueS1lLnksZD1mO2IuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtLmNhbGwodGhpcyl9fSxiLlJvcGUucHJvdG90eXBlLnNldFRleHR1cmU9ZnVuY3Rpb24oYSl7dGhpcy50ZXh0dXJlPWF9LGIuVGlsaW5nU3ByaXRlPWZ1bmN0aW9uKGEsYyxkKXtiLlNwcml0ZS5jYWxsKHRoaXMsYSksdGhpcy5fd2lkdGg9Y3x8MTAwLHRoaXMuX2hlaWdodD1kfHwxMDAsdGhpcy50aWxlU2NhbGU9bmV3IGIuUG9pbnQoMSwxKSx0aGlzLnRpbGVTY2FsZU9mZnNldD1uZXcgYi5Qb2ludCgxLDEpLHRoaXMudGlsZVBvc2l0aW9uPW5ldyBiLlBvaW50KDAsMCksdGhpcy5yZW5kZXJhYmxlPSEwLHRoaXMudGludD0xNjc3NzIxNSx0aGlzLmJsZW5kTW9kZT1iLmJsZW5kTW9kZXMuTk9STUFMfSxiLlRpbGluZ1Nwcml0ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLlNwcml0ZS5wcm90b3R5cGUpLGIuVGlsaW5nU3ByaXRlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlRpbGluZ1Nwcml0ZSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLFwid2lkdGhcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dpZHRofSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5fd2lkdGg9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLFwiaGVpZ2h0XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9oZWlnaHR9LHNldDpmdW5jdGlvbihhKXt0aGlzLl9oZWlnaHQ9YX19KSxiLlRpbGluZ1Nwcml0ZS5wcm90b3R5cGUuc2V0VGV4dHVyZT1mdW5jdGlvbihhKXt0aGlzLnRleHR1cmUhPT1hJiYodGhpcy50ZXh0dXJlPWEsdGhpcy5yZWZyZXNoVGV4dHVyZT0hMCx0aGlzLmNhY2hlZFRpbnQ9MTY3NzcyMTUpfSxiLlRpbGluZ1Nwcml0ZS5wcm90b3R5cGUuX3JlbmRlcldlYkdMPWZ1bmN0aW9uKGEpe2lmKHRoaXMudmlzaWJsZSE9PSExJiYwIT09dGhpcy5hbHBoYSl7dmFyIGMsZDtmb3IodGhpcy5fbWFzayYmKGEuc3ByaXRlQmF0Y2guc3RvcCgpLGEubWFza01hbmFnZXIucHVzaE1hc2sodGhpcy5tYXNrLGEpLGEuc3ByaXRlQmF0Y2guc3RhcnQoKSksdGhpcy5fZmlsdGVycyYmKGEuc3ByaXRlQmF0Y2guZmx1c2goKSxhLmZpbHRlck1hbmFnZXIucHVzaEZpbHRlcih0aGlzLl9maWx0ZXJCbG9jaykpLCF0aGlzLnRpbGluZ1RleHR1cmV8fHRoaXMucmVmcmVzaFRleHR1cmU/KHRoaXMuZ2VuZXJhdGVUaWxpbmdUZXh0dXJlKCEwKSx0aGlzLnRpbGluZ1RleHR1cmUmJnRoaXMudGlsaW5nVGV4dHVyZS5uZWVkc1VwZGF0ZSYmKGIudXBkYXRlV2ViR0xUZXh0dXJlKHRoaXMudGlsaW5nVGV4dHVyZS5iYXNlVGV4dHVyZSxhLmdsKSx0aGlzLnRpbGluZ1RleHR1cmUubmVlZHNVcGRhdGU9ITEpKTphLnNwcml0ZUJhdGNoLnJlbmRlclRpbGluZ1Nwcml0ZSh0aGlzKSxjPTAsZD10aGlzLmNoaWxkcmVuLmxlbmd0aDtkPmM7YysrKXRoaXMuY2hpbGRyZW5bY10uX3JlbmRlcldlYkdMKGEpO2Euc3ByaXRlQmF0Y2guc3RvcCgpLHRoaXMuX2ZpbHRlcnMmJmEuZmlsdGVyTWFuYWdlci5wb3BGaWx0ZXIoKSx0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnBvcE1hc2sodGhpcy5fbWFzayxhKSxhLnNwcml0ZUJhdGNoLnN0YXJ0KCl9fSxiLlRpbGluZ1Nwcml0ZS5wcm90b3R5cGUuX3JlbmRlckNhbnZhcz1mdW5jdGlvbihhKXtpZih0aGlzLnZpc2libGUhPT0hMSYmMCE9PXRoaXMuYWxwaGEpe3ZhciBjPWEuY29udGV4dDt0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMuX21hc2ssYyksYy5nbG9iYWxBbHBoYT10aGlzLndvcmxkQWxwaGE7dmFyIGQsZSxmPXRoaXMud29ybGRUcmFuc2Zvcm0sZz1hLnJlc29sdXRpb247aWYoYy5zZXRUcmFuc2Zvcm0oZi5hKmcsZi5jKmcsZi5iKmcsZi5kKmcsZi50eCpnLGYudHkqZyksIXRoaXMuX190aWxlUGF0dGVybnx8dGhpcy5yZWZyZXNoVGV4dHVyZSl7aWYodGhpcy5nZW5lcmF0ZVRpbGluZ1RleHR1cmUoITEpLCF0aGlzLnRpbGluZ1RleHR1cmUpcmV0dXJuO3RoaXMuX190aWxlUGF0dGVybj1jLmNyZWF0ZVBhdHRlcm4odGhpcy50aWxpbmdUZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZSxcInJlcGVhdFwiKX10aGlzLmJsZW5kTW9kZSE9PWEuY3VycmVudEJsZW5kTW9kZSYmKGEuY3VycmVudEJsZW5kTW9kZT10aGlzLmJsZW5kTW9kZSxjLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj1iLmJsZW5kTW9kZXNDYW52YXNbYS5jdXJyZW50QmxlbmRNb2RlXSk7dmFyIGg9dGhpcy50aWxlUG9zaXRpb24saT10aGlzLnRpbGVTY2FsZTtmb3IoaC54JT10aGlzLnRpbGluZ1RleHR1cmUuYmFzZVRleHR1cmUud2lkdGgsaC55JT10aGlzLnRpbGluZ1RleHR1cmUuYmFzZVRleHR1cmUuaGVpZ2h0LGMuc2NhbGUoaS54LGkueSksYy50cmFuc2xhdGUoaC54K3RoaXMuYW5jaG9yLngqLXRoaXMuX3dpZHRoLGgueSt0aGlzLmFuY2hvci55Ki10aGlzLl9oZWlnaHQpLGMuZmlsbFN0eWxlPXRoaXMuX190aWxlUGF0dGVybixjLmZpbGxSZWN0KC1oLngsLWgueSx0aGlzLl93aWR0aC9pLngsdGhpcy5faGVpZ2h0L2kueSksYy5zY2FsZSgxL2kueCwxL2kueSksYy50cmFuc2xhdGUoLWgueCt0aGlzLmFuY2hvci54KnRoaXMuX3dpZHRoLC1oLnkrdGhpcy5hbmNob3IueSp0aGlzLl9oZWlnaHQpLHRoaXMuX21hc2smJmEubWFza01hbmFnZXIucG9wTWFzayhhLmNvbnRleHQpLGQ9MCxlPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2U+ZDtkKyspdGhpcy5jaGlsZHJlbltkXS5fcmVuZGVyQ2FudmFzKGEpfX0sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbigpe3ZhciBhPXRoaXMuX3dpZHRoLGI9dGhpcy5faGVpZ2h0LGM9YSooMS10aGlzLmFuY2hvci54KSxkPWEqLXRoaXMuYW5jaG9yLngsZT1iKigxLXRoaXMuYW5jaG9yLnkpLGY9YiotdGhpcy5hbmNob3IueSxnPXRoaXMud29ybGRUcmFuc2Zvcm0saD1nLmEsaT1nLmIsaj1nLmMsaz1nLmQsbD1nLnR4LG09Zy50eSxuPWgqZCtqKmYrbCxvPWsqZitpKmQrbSxwPWgqYytqKmYrbCxxPWsqZitpKmMrbSxyPWgqYytqKmUrbCxzPWsqZStpKmMrbSx0PWgqZCtqKmUrbCx1PWsqZStpKmQrbSx2PS0xLzAsdz0tMS8wLHg9MS8wLHk9MS8wO3g9eD5uP246eCx4PXg+cD9wOngseD14PnI/cjp4LHg9eD50P3Q6eCx5PXk+bz9vOnkseT15PnE/cTp5LHk9eT5zP3M6eSx5PXk+dT91Onksdj1uPnY/bjp2LHY9cD52P3A6dix2PXI+dj9yOnYsdj10PnY/dDp2LHc9bz53P286dyx3PXE+dz9xOncsdz1zPnc/czp3LHc9dT53P3U6dzt2YXIgej10aGlzLl9ib3VuZHM7cmV0dXJuIHoueD14LHoud2lkdGg9di14LHoueT15LHouaGVpZ2h0PXcteSx0aGlzLl9jdXJyZW50Qm91bmRzPXosen0sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLm9uVGV4dHVyZVVwZGF0ZT1mdW5jdGlvbigpe30sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLmdlbmVyYXRlVGlsaW5nVGV4dHVyZT1mdW5jdGlvbihhKXtpZih0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuaGFzTG9hZGVkKXt2YXIgYyxkLGU9dGhpcy5vcmlnaW5hbFRleHR1cmV8fHRoaXMudGV4dHVyZSxmPWUuZnJhbWUsZz1mLndpZHRoIT09ZS5iYXNlVGV4dHVyZS53aWR0aHx8Zi5oZWlnaHQhPT1lLmJhc2VUZXh0dXJlLmhlaWdodCxoPSExO2lmKGE/KGM9Yi5nZXROZXh0UG93ZXJPZlR3byhmLndpZHRoKSxkPWIuZ2V0TmV4dFBvd2VyT2ZUd28oZi5oZWlnaHQpLChmLndpZHRoIT09Y3x8Zi5oZWlnaHQhPT1kKSYmKGg9ITApKTpnJiYoYz1mLndpZHRoLGQ9Zi5oZWlnaHQsaD0hMCksaCl7dmFyIGk7dGhpcy50aWxpbmdUZXh0dXJlJiZ0aGlzLnRpbGluZ1RleHR1cmUuaXNUaWxpbmc/KGk9dGhpcy50aWxpbmdUZXh0dXJlLmNhbnZhc0J1ZmZlcixpLnJlc2l6ZShjLGQpLHRoaXMudGlsaW5nVGV4dHVyZS5iYXNlVGV4dHVyZS53aWR0aD1jLHRoaXMudGlsaW5nVGV4dHVyZS5iYXNlVGV4dHVyZS5oZWlnaHQ9ZCx0aGlzLnRpbGluZ1RleHR1cmUubmVlZHNVcGRhdGU9ITApOihpPW5ldyBiLkNhbnZhc0J1ZmZlcihjLGQpLHRoaXMudGlsaW5nVGV4dHVyZT1iLlRleHR1cmUuZnJvbUNhbnZhcyhpLmNhbnZhcyksdGhpcy50aWxpbmdUZXh0dXJlLmNhbnZhc0J1ZmZlcj1pLHRoaXMudGlsaW5nVGV4dHVyZS5pc1RpbGluZz0hMCksaS5jb250ZXh0LmRyYXdJbWFnZShlLmJhc2VUZXh0dXJlLnNvdXJjZSxlLmNyb3AueCxlLmNyb3AueSxlLmNyb3Aud2lkdGgsZS5jcm9wLmhlaWdodCwwLDAsYyxkKSx0aGlzLnRpbGVTY2FsZU9mZnNldC54PWYud2lkdGgvYyx0aGlzLnRpbGVTY2FsZU9mZnNldC55PWYuaGVpZ2h0L2R9ZWxzZSB0aGlzLnRpbGluZ1RleHR1cmUmJnRoaXMudGlsaW5nVGV4dHVyZS5pc1RpbGluZyYmdGhpcy50aWxpbmdUZXh0dXJlLmRlc3Ryb3koITApLHRoaXMudGlsZVNjYWxlT2Zmc2V0Lng9MSx0aGlzLnRpbGVTY2FsZU9mZnNldC55PTEsdGhpcy50aWxpbmdUZXh0dXJlPWU7dGhpcy5yZWZyZXNoVGV4dHVyZT0hMSx0aGlzLm9yaWdpbmFsVGV4dHVyZT10aGlzLnRleHR1cmUsdGhpcy50ZXh0dXJlPXRoaXMudGlsaW5nVGV4dHVyZSx0aGlzLnRpbGluZ1RleHR1cmUuYmFzZVRleHR1cmUuX3Bvd2VyT2YyPSEwfX07dmFyIGM9e307Yy5Cb25lRGF0YT1mdW5jdGlvbihhLGIpe3RoaXMubmFtZT1hLHRoaXMucGFyZW50PWJ9LGMuQm9uZURhdGEucHJvdG90eXBlPXtsZW5ndGg6MCx4OjAseTowLHJvdGF0aW9uOjAsc2NhbGVYOjEsc2NhbGVZOjF9LGMuU2xvdERhdGE9ZnVuY3Rpb24oYSxiKXt0aGlzLm5hbWU9YSx0aGlzLmJvbmVEYXRhPWJ9LGMuU2xvdERhdGEucHJvdG90eXBlPXtyOjEsZzoxLGI6MSxhOjEsYXR0YWNobWVudE5hbWU6bnVsbH0sYy5Cb25lPWZ1bmN0aW9uKGEsYil7dGhpcy5kYXRhPWEsdGhpcy5wYXJlbnQ9Yix0aGlzLnNldFRvU2V0dXBQb3NlKClcbn0sYy5Cb25lLnlEb3duPSExLGMuQm9uZS5wcm90b3R5cGU9e3g6MCx5OjAscm90YXRpb246MCxzY2FsZVg6MSxzY2FsZVk6MSxtMDA6MCxtMDE6MCx3b3JsZFg6MCxtMTA6MCxtMTE6MCx3b3JsZFk6MCx3b3JsZFJvdGF0aW9uOjAsd29ybGRTY2FsZVg6MSx3b3JsZFNjYWxlWToxLHVwZGF0ZVdvcmxkVHJhbnNmb3JtOmZ1bmN0aW9uKGEsYil7dmFyIGQ9dGhpcy5wYXJlbnQ7bnVsbCE9ZD8odGhpcy53b3JsZFg9dGhpcy54KmQubTAwK3RoaXMueSpkLm0wMStkLndvcmxkWCx0aGlzLndvcmxkWT10aGlzLngqZC5tMTArdGhpcy55KmQubTExK2Qud29ybGRZLHRoaXMud29ybGRTY2FsZVg9ZC53b3JsZFNjYWxlWCp0aGlzLnNjYWxlWCx0aGlzLndvcmxkU2NhbGVZPWQud29ybGRTY2FsZVkqdGhpcy5zY2FsZVksdGhpcy53b3JsZFJvdGF0aW9uPWQud29ybGRSb3RhdGlvbit0aGlzLnJvdGF0aW9uKToodGhpcy53b3JsZFg9dGhpcy54LHRoaXMud29ybGRZPXRoaXMueSx0aGlzLndvcmxkU2NhbGVYPXRoaXMuc2NhbGVYLHRoaXMud29ybGRTY2FsZVk9dGhpcy5zY2FsZVksdGhpcy53b3JsZFJvdGF0aW9uPXRoaXMucm90YXRpb24pO3ZhciBlPXRoaXMud29ybGRSb3RhdGlvbipNYXRoLlBJLzE4MCxmPU1hdGguY29zKGUpLGc9TWF0aC5zaW4oZSk7dGhpcy5tMDA9Zip0aGlzLndvcmxkU2NhbGVYLHRoaXMubTEwPWcqdGhpcy53b3JsZFNjYWxlWCx0aGlzLm0wMT0tZyp0aGlzLndvcmxkU2NhbGVZLHRoaXMubTExPWYqdGhpcy53b3JsZFNjYWxlWSxhJiYodGhpcy5tMDA9LXRoaXMubTAwLHRoaXMubTAxPS10aGlzLm0wMSksYiYmKHRoaXMubTEwPS10aGlzLm0xMCx0aGlzLm0xMT0tdGhpcy5tMTEpLGMuQm9uZS55RG93biYmKHRoaXMubTEwPS10aGlzLm0xMCx0aGlzLm0xMT0tdGhpcy5tMTEpfSxzZXRUb1NldHVwUG9zZTpmdW5jdGlvbigpe3ZhciBhPXRoaXMuZGF0YTt0aGlzLng9YS54LHRoaXMueT1hLnksdGhpcy5yb3RhdGlvbj1hLnJvdGF0aW9uLHRoaXMuc2NhbGVYPWEuc2NhbGVYLHRoaXMuc2NhbGVZPWEuc2NhbGVZfX0sYy5TbG90PWZ1bmN0aW9uKGEsYixjKXt0aGlzLmRhdGE9YSx0aGlzLnNrZWxldG9uPWIsdGhpcy5ib25lPWMsdGhpcy5zZXRUb1NldHVwUG9zZSgpfSxjLlNsb3QucHJvdG90eXBlPXtyOjEsZzoxLGI6MSxhOjEsX2F0dGFjaG1lbnRUaW1lOjAsYXR0YWNobWVudDpudWxsLHNldEF0dGFjaG1lbnQ6ZnVuY3Rpb24oYSl7dGhpcy5hdHRhY2htZW50PWEsdGhpcy5fYXR0YWNobWVudFRpbWU9dGhpcy5za2VsZXRvbi50aW1lfSxzZXRBdHRhY2htZW50VGltZTpmdW5jdGlvbihhKXt0aGlzLl9hdHRhY2htZW50VGltZT10aGlzLnNrZWxldG9uLnRpbWUtYX0sZ2V0QXR0YWNobWVudFRpbWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5za2VsZXRvbi50aW1lLXRoaXMuX2F0dGFjaG1lbnRUaW1lfSxzZXRUb1NldHVwUG9zZTpmdW5jdGlvbigpe3ZhciBhPXRoaXMuZGF0YTt0aGlzLnI9YS5yLHRoaXMuZz1hLmcsdGhpcy5iPWEuYix0aGlzLmE9YS5hO2Zvcih2YXIgYj10aGlzLnNrZWxldG9uLmRhdGEuc2xvdHMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdPT1hKXt0aGlzLnNldEF0dGFjaG1lbnQoYS5hdHRhY2htZW50TmFtZT90aGlzLnNrZWxldG9uLmdldEF0dGFjaG1lbnRCeVNsb3RJbmRleChjLGEuYXR0YWNobWVudE5hbWUpOm51bGwpO2JyZWFrfX19LGMuU2tpbj1mdW5jdGlvbihhKXt0aGlzLm5hbWU9YSx0aGlzLmF0dGFjaG1lbnRzPXt9fSxjLlNraW4ucHJvdG90eXBlPXthZGRBdHRhY2htZW50OmZ1bmN0aW9uKGEsYixjKXt0aGlzLmF0dGFjaG1lbnRzW2ErXCI6XCIrYl09Y30sZ2V0QXR0YWNobWVudDpmdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLmF0dGFjaG1lbnRzW2ErXCI6XCIrYl19LF9hdHRhY2hBbGw6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGMgaW4gYi5hdHRhY2htZW50cyl7dmFyIGQ9Yy5pbmRleE9mKFwiOlwiKSxlPXBhcnNlSW50KGMuc3Vic3RyaW5nKDAsZCksMTApLGY9Yy5zdWJzdHJpbmcoZCsxKSxnPWEuc2xvdHNbZV07aWYoZy5hdHRhY2htZW50JiZnLmF0dGFjaG1lbnQubmFtZT09Zil7dmFyIGg9dGhpcy5nZXRBdHRhY2htZW50KGUsZik7aCYmZy5zZXRBdHRhY2htZW50KGgpfX19fSxjLkFuaW1hdGlvbj1mdW5jdGlvbihhLGIsYyl7dGhpcy5uYW1lPWEsdGhpcy50aW1lbGluZXM9Yix0aGlzLmR1cmF0aW9uPWN9LGMuQW5pbWF0aW9uLnByb3RvdHlwZT17YXBwbHk6ZnVuY3Rpb24oYSxiLGMpe2MmJnRoaXMuZHVyYXRpb24mJihiJT10aGlzLmR1cmF0aW9uKTtmb3IodmFyIGQ9dGhpcy50aW1lbGluZXMsZT0wLGY9ZC5sZW5ndGg7Zj5lO2UrKylkW2VdLmFwcGx5KGEsYiwxKX0sbWl4OmZ1bmN0aW9uKGEsYixjLGQpe2MmJnRoaXMuZHVyYXRpb24mJihiJT10aGlzLmR1cmF0aW9uKTtmb3IodmFyIGU9dGhpcy50aW1lbGluZXMsZj0wLGc9ZS5sZW5ndGg7Zz5mO2YrKyllW2ZdLmFwcGx5KGEsYixkKX19LGMuYmluYXJ5U2VhcmNoPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD0wLGU9TWF0aC5mbG9vcihhLmxlbmd0aC9jKS0yO2lmKCFlKXJldHVybiBjO2Zvcih2YXIgZj1lPj4+MTs7KXtpZihhWyhmKzEpKmNdPD1iP2Q9ZisxOmU9ZixkPT1lKXJldHVybihkKzEpKmM7Zj1kK2U+Pj4xfX0sYy5saW5lYXJTZWFyY2g9ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD0wLGU9YS5sZW5ndGgtYztlPj1kO2QrPWMpaWYoYVtkXT5iKXJldHVybiBkO3JldHVybi0xfSxjLkN1cnZlcz1mdW5jdGlvbihhKXt0aGlzLmN1cnZlcz1bXSx0aGlzLmN1cnZlcy5sZW5ndGg9NiooYS0xKX0sYy5DdXJ2ZXMucHJvdG90eXBlPXtzZXRMaW5lYXI6ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXNbNiphXT0wfSxzZXRTdGVwcGVkOmZ1bmN0aW9uKGEpe3RoaXMuY3VydmVzWzYqYV09LTF9LHNldEN1cnZlOmZ1bmN0aW9uKGEsYixjLGQsZSl7dmFyIGY9LjEsZz1mKmYsaD1nKmYsaT0zKmYsaj0zKmcsaz02KmcsbD02KmgsbT0yKi1iK2Qsbj0yKi1jK2Usbz0zKihiLWQpKzEscD0zKihjLWUpKzEscT02KmEscj10aGlzLmN1cnZlcztyW3FdPWIqaSttKmorbypoLHJbcSsxXT1jKmkrbipqK3AqaCxyW3ErMl09bSprK28qbCxyW3ErM109biprK3AqbCxyW3ErNF09bypsLHJbcSs1XT1wKmx9LGdldEN1cnZlUGVyY2VudDpmdW5jdGlvbihhLGIpe2I9MD5iPzA6Yj4xPzE6Yjt2YXIgYz02KmEsZD10aGlzLmN1cnZlcyxlPWRbY107aWYoIWUpcmV0dXJuIGI7aWYoLTE9PWUpcmV0dXJuIDA7Zm9yKHZhciBmPWRbYysxXSxnPWRbYysyXSxoPWRbYyszXSxpPWRbYys0XSxqPWRbYys1XSxrPWUsbD1mLG09ODs7KXtpZihrPj1iKXt2YXIgbj1rLWUsbz1sLWY7cmV0dXJuIG8rKGwtbykqKGItbikvKGstbil9aWYoIW0pYnJlYWs7bS0tLGUrPWcsZis9aCxnKz1pLGgrPWosays9ZSxsKz1mfXJldHVybiBsKygxLWwpKihiLWspLygxLWspfX0sYy5Sb3RhdGVUaW1lbGluZT1mdW5jdGlvbihhKXt0aGlzLmN1cnZlcz1uZXcgYy5DdXJ2ZXMoYSksdGhpcy5mcmFtZXM9W10sdGhpcy5mcmFtZXMubGVuZ3RoPTIqYX0sYy5Sb3RhdGVUaW1lbGluZS5wcm90b3R5cGU9e2JvbmVJbmRleDowLGdldEZyYW1lQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RoLzJ9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjKXthKj0yLHRoaXMuZnJhbWVzW2FdPWIsdGhpcy5mcmFtZXNbYSsxXT1jfSxhcHBseTpmdW5jdGlvbihhLGIsZCl7dmFyIGUsZj10aGlzLmZyYW1lcztpZighKGI8ZlswXSkpe3ZhciBnPWEuYm9uZXNbdGhpcy5ib25lSW5kZXhdO2lmKGI+PWZbZi5sZW5ndGgtMl0pe2ZvcihlPWcuZGF0YS5yb3RhdGlvbitmW2YubGVuZ3RoLTFdLWcucm90YXRpb247ZT4xODA7KWUtPTM2MDtmb3IoOy0xODA+ZTspZSs9MzYwO3JldHVybiBnLnJvdGF0aW9uKz1lKmQsdm9pZCAwfXZhciBoPWMuYmluYXJ5U2VhcmNoKGYsYiwyKSxpPWZbaC0xXSxqPWZbaF0saz0xLShiLWopLyhmW2gtMl0taik7Zm9yKGs9dGhpcy5jdXJ2ZXMuZ2V0Q3VydmVQZXJjZW50KGgvMi0xLGspLGU9ZltoKzFdLWk7ZT4xODA7KWUtPTM2MDtmb3IoOy0xODA+ZTspZSs9MzYwO2ZvcihlPWcuZGF0YS5yb3RhdGlvbisoaStlKmspLWcucm90YXRpb247ZT4xODA7KWUtPTM2MDtmb3IoOy0xODA+ZTspZSs9MzYwO2cucm90YXRpb24rPWUqZH19fSxjLlRyYW5zbGF0ZVRpbWVsaW5lPWZ1bmN0aW9uKGEpe3RoaXMuY3VydmVzPW5ldyBjLkN1cnZlcyhhKSx0aGlzLmZyYW1lcz1bXSx0aGlzLmZyYW1lcy5sZW5ndGg9MyphfSxjLlRyYW5zbGF0ZVRpbWVsaW5lLnByb3RvdHlwZT17Ym9uZUluZGV4OjAsZ2V0RnJhbWVDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZyYW1lcy5sZW5ndGgvM30sc2V0RnJhbWU6ZnVuY3Rpb24oYSxiLGMsZCl7YSo9Myx0aGlzLmZyYW1lc1thXT1iLHRoaXMuZnJhbWVzW2ErMV09Yyx0aGlzLmZyYW1lc1thKzJdPWR9LGFwcGx5OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT10aGlzLmZyYW1lcztpZighKGI8ZVswXSkpe3ZhciBmPWEuYm9uZXNbdGhpcy5ib25lSW5kZXhdO2lmKGI+PWVbZS5sZW5ndGgtM10pcmV0dXJuIGYueCs9KGYuZGF0YS54K2VbZS5sZW5ndGgtMl0tZi54KSpkLGYueSs9KGYuZGF0YS55K2VbZS5sZW5ndGgtMV0tZi55KSpkLHZvaWQgMDt2YXIgZz1jLmJpbmFyeVNlYXJjaChlLGIsMyksaD1lW2ctMl0saT1lW2ctMV0saj1lW2ddLGs9MS0oYi1qKS8oZVtnKy0zXS1qKTtrPXRoaXMuY3VydmVzLmdldEN1cnZlUGVyY2VudChnLzMtMSxrKSxmLngrPShmLmRhdGEueCtoKyhlW2crMV0taCkqay1mLngpKmQsZi55Kz0oZi5kYXRhLnkraSsoZVtnKzJdLWkpKmstZi55KSpkfX19LGMuU2NhbGVUaW1lbGluZT1mdW5jdGlvbihhKXt0aGlzLmN1cnZlcz1uZXcgYy5DdXJ2ZXMoYSksdGhpcy5mcmFtZXM9W10sdGhpcy5mcmFtZXMubGVuZ3RoPTMqYX0sYy5TY2FsZVRpbWVsaW5lLnByb3RvdHlwZT17Ym9uZUluZGV4OjAsZ2V0RnJhbWVDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZyYW1lcy5sZW5ndGgvM30sc2V0RnJhbWU6ZnVuY3Rpb24oYSxiLGMsZCl7YSo9Myx0aGlzLmZyYW1lc1thXT1iLHRoaXMuZnJhbWVzW2ErMV09Yyx0aGlzLmZyYW1lc1thKzJdPWR9LGFwcGx5OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT10aGlzLmZyYW1lcztpZighKGI8ZVswXSkpe3ZhciBmPWEuYm9uZXNbdGhpcy5ib25lSW5kZXhdO2lmKGI+PWVbZS5sZW5ndGgtM10pcmV0dXJuIGYuc2NhbGVYKz0oZi5kYXRhLnNjYWxlWC0xK2VbZS5sZW5ndGgtMl0tZi5zY2FsZVgpKmQsZi5zY2FsZVkrPShmLmRhdGEuc2NhbGVZLTErZVtlLmxlbmd0aC0xXS1mLnNjYWxlWSkqZCx2b2lkIDA7dmFyIGc9Yy5iaW5hcnlTZWFyY2goZSxiLDMpLGg9ZVtnLTJdLGk9ZVtnLTFdLGo9ZVtnXSxrPTEtKGItaikvKGVbZystM10taik7az10aGlzLmN1cnZlcy5nZXRDdXJ2ZVBlcmNlbnQoZy8zLTEsayksZi5zY2FsZVgrPShmLmRhdGEuc2NhbGVYLTEraCsoZVtnKzFdLWgpKmstZi5zY2FsZVgpKmQsZi5zY2FsZVkrPShmLmRhdGEuc2NhbGVZLTEraSsoZVtnKzJdLWkpKmstZi5zY2FsZVkpKmR9fX0sYy5Db2xvclRpbWVsaW5lPWZ1bmN0aW9uKGEpe3RoaXMuY3VydmVzPW5ldyBjLkN1cnZlcyhhKSx0aGlzLmZyYW1lcz1bXSx0aGlzLmZyYW1lcy5sZW5ndGg9NSphfSxjLkNvbG9yVGltZWxpbmUucHJvdG90eXBlPXtzbG90SW5kZXg6MCxnZXRGcmFtZUNvdW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZnJhbWVzLmxlbmd0aC81fSxzZXRGcmFtZTpmdW5jdGlvbihhLGIsYyxkLGUsZil7YSo9NSx0aGlzLmZyYW1lc1thXT1iLHRoaXMuZnJhbWVzW2ErMV09Yyx0aGlzLmZyYW1lc1thKzJdPWQsdGhpcy5mcmFtZXNbYSszXT1lLHRoaXMuZnJhbWVzW2ErNF09Zn0sYXBwbHk6ZnVuY3Rpb24oYSxiLGQpe3ZhciBlPXRoaXMuZnJhbWVzO2lmKCEoYjxlWzBdKSl7dmFyIGY9YS5zbG90c1t0aGlzLnNsb3RJbmRleF07aWYoYj49ZVtlLmxlbmd0aC01XSl7dmFyIGc9ZS5sZW5ndGgtMTtyZXR1cm4gZi5yPWVbZy0zXSxmLmc9ZVtnLTJdLGYuYj1lW2ctMV0sZi5hPWVbZ10sdm9pZCAwfXZhciBoPWMuYmluYXJ5U2VhcmNoKGUsYiw1KSxpPWVbaC00XSxqPWVbaC0zXSxrPWVbaC0yXSxsPWVbaC0xXSxtPWVbaF0sbj0xLShiLW0pLyhlW2gtNV0tbSk7bj10aGlzLmN1cnZlcy5nZXRDdXJ2ZVBlcmNlbnQoaC81LTEsbik7dmFyIG89aSsoZVtoKzFdLWkpKm4scD1qKyhlW2grMl0taikqbixxPWsrKGVbaCszXS1rKSpuLHI9bCsoZVtoKzRdLWwpKm47MT5kPyhmLnIrPShvLWYucikqZCxmLmcrPShwLWYuZykqZCxmLmIrPShxLWYuYikqZCxmLmErPShyLWYuYSkqZCk6KGYucj1vLGYuZz1wLGYuYj1xLGYuYT1yKX19fSxjLkF0dGFjaG1lbnRUaW1lbGluZT1mdW5jdGlvbihhKXt0aGlzLmN1cnZlcz1uZXcgYy5DdXJ2ZXMoYSksdGhpcy5mcmFtZXM9W10sdGhpcy5mcmFtZXMubGVuZ3RoPWEsdGhpcy5hdHRhY2htZW50TmFtZXM9W10sdGhpcy5hdHRhY2htZW50TmFtZXMubGVuZ3RoPWF9LGMuQXR0YWNobWVudFRpbWVsaW5lLnByb3RvdHlwZT17c2xvdEluZGV4OjAsZ2V0RnJhbWVDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZyYW1lcy5sZW5ndGh9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjKXt0aGlzLmZyYW1lc1thXT1iLHRoaXMuYXR0YWNobWVudE5hbWVzW2FdPWN9LGFwcGx5OmZ1bmN0aW9uKGEsYil7dmFyIGQ9dGhpcy5mcmFtZXM7aWYoIShiPGRbMF0pKXt2YXIgZTtlPWI+PWRbZC5sZW5ndGgtMV0/ZC5sZW5ndGgtMTpjLmJpbmFyeVNlYXJjaChkLGIsMSktMTt2YXIgZj10aGlzLmF0dGFjaG1lbnROYW1lc1tlXTthLnNsb3RzW3RoaXMuc2xvdEluZGV4XS5zZXRBdHRhY2htZW50KGY/YS5nZXRBdHRhY2htZW50QnlTbG90SW5kZXgodGhpcy5zbG90SW5kZXgsZik6bnVsbCl9fX0sYy5Ta2VsZXRvbkRhdGE9ZnVuY3Rpb24oKXt0aGlzLmJvbmVzPVtdLHRoaXMuc2xvdHM9W10sdGhpcy5za2lucz1bXSx0aGlzLmFuaW1hdGlvbnM9W119LGMuU2tlbGV0b25EYXRhLnByb3RvdHlwZT17ZGVmYXVsdFNraW46bnVsbCxmaW5kQm9uZTpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5ib25lcyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY10ubmFtZT09YSlyZXR1cm4gYltjXTtyZXR1cm4gbnVsbH0sZmluZEJvbmVJbmRleDpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5ib25lcyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY10ubmFtZT09YSlyZXR1cm4gYztyZXR1cm4tMX0sZmluZFNsb3Q6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuc2xvdHMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLm5hbWU9PWEpcmV0dXJuIHNsb3RbY107cmV0dXJuIG51bGx9LGZpbmRTbG90SW5kZXg6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuc2xvdHMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLm5hbWU9PWEpcmV0dXJuIGM7cmV0dXJuLTF9LGZpbmRTa2luOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzLnNraW5zLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5uYW1lPT1hKXJldHVybiBiW2NdO3JldHVybiBudWxsfSxmaW5kQW5pbWF0aW9uOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzLmFuaW1hdGlvbnMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLm5hbWU9PWEpcmV0dXJuIGJbY107cmV0dXJuIG51bGx9fSxjLlNrZWxldG9uPWZ1bmN0aW9uKGEpe3RoaXMuZGF0YT1hLHRoaXMuYm9uZXM9W107Zm9yKHZhciBiPTAsZD1hLmJvbmVzLmxlbmd0aDtkPmI7YisrKXt2YXIgZT1hLmJvbmVzW2JdLGY9ZS5wYXJlbnQ/dGhpcy5ib25lc1thLmJvbmVzLmluZGV4T2YoZS5wYXJlbnQpXTpudWxsO3RoaXMuYm9uZXMucHVzaChuZXcgYy5Cb25lKGUsZikpfWZvcih0aGlzLnNsb3RzPVtdLHRoaXMuZHJhd09yZGVyPVtdLGI9MCxkPWEuc2xvdHMubGVuZ3RoO2Q+YjtiKyspe3ZhciBnPWEuc2xvdHNbYl0saD10aGlzLmJvbmVzW2EuYm9uZXMuaW5kZXhPZihnLmJvbmVEYXRhKV0saT1uZXcgYy5TbG90KGcsdGhpcyxoKTt0aGlzLnNsb3RzLnB1c2goaSksdGhpcy5kcmF3T3JkZXIucHVzaChpKX19LGMuU2tlbGV0b24ucHJvdG90eXBlPXt4OjAseTowLHNraW46bnVsbCxyOjEsZzoxLGI6MSxhOjEsdGltZTowLGZsaXBYOiExLGZsaXBZOiExLHVwZGF0ZVdvcmxkVHJhbnNmb3JtOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXMuZmxpcFgsYj10aGlzLmZsaXBZLGM9dGhpcy5ib25lcyxkPTAsZT1jLmxlbmd0aDtlPmQ7ZCsrKWNbZF0udXBkYXRlV29ybGRUcmFuc2Zvcm0oYSxiKX0sc2V0VG9TZXR1cFBvc2U6ZnVuY3Rpb24oKXt0aGlzLnNldEJvbmVzVG9TZXR1cFBvc2UoKSx0aGlzLnNldFNsb3RzVG9TZXR1cFBvc2UoKX0sc2V0Qm9uZXNUb1NldHVwUG9zZTpmdW5jdGlvbigpe2Zvcih2YXIgYT10aGlzLmJvbmVzLGI9MCxjPWEubGVuZ3RoO2M+YjtiKyspYVtiXS5zZXRUb1NldHVwUG9zZSgpfSxzZXRTbG90c1RvU2V0dXBQb3NlOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXMuc2xvdHMsYj0wLGM9YS5sZW5ndGg7Yz5iO2IrKylhW2JdLnNldFRvU2V0dXBQb3NlKGIpfSxnZXRSb290Qm9uZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmJvbmVzLmxlbmd0aD90aGlzLmJvbmVzWzBdOm51bGx9LGZpbmRCb25lOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzLmJvbmVzLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5kYXRhLm5hbWU9PWEpcmV0dXJuIGJbY107cmV0dXJuIG51bGx9LGZpbmRCb25lSW5kZXg6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuYm9uZXMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLmRhdGEubmFtZT09YSlyZXR1cm4gYztyZXR1cm4tMX0sZmluZFNsb3Q6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuc2xvdHMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLmRhdGEubmFtZT09YSlyZXR1cm4gYltjXTtyZXR1cm4gbnVsbH0sZmluZFNsb3RJbmRleDpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5zbG90cyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY10uZGF0YS5uYW1lPT1hKXJldHVybiBjO3JldHVybi0xfSxzZXRTa2luQnlOYW1lOmZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuZGF0YS5maW5kU2tpbihhKTtpZighYil0aHJvd1wiU2tpbiBub3QgZm91bmQ6IFwiK2E7dGhpcy5zZXRTa2luKGIpfSxzZXRTa2luOmZ1bmN0aW9uKGEpe3RoaXMuc2tpbiYmYSYmYS5fYXR0YWNoQWxsKHRoaXMsdGhpcy5za2luKSx0aGlzLnNraW49YX0sZ2V0QXR0YWNobWVudEJ5U2xvdE5hbWU6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5nZXRBdHRhY2htZW50QnlTbG90SW5kZXgodGhpcy5kYXRhLmZpbmRTbG90SW5kZXgoYSksYil9LGdldEF0dGFjaG1lbnRCeVNsb3RJbmRleDpmdW5jdGlvbihhLGIpe2lmKHRoaXMuc2tpbil7dmFyIGM9dGhpcy5za2luLmdldEF0dGFjaG1lbnQoYSxiKTtpZihjKXJldHVybiBjfXJldHVybiB0aGlzLmRhdGEuZGVmYXVsdFNraW4/dGhpcy5kYXRhLmRlZmF1bHRTa2luLmdldEF0dGFjaG1lbnQoYSxiKTpudWxsfSxzZXRBdHRhY2htZW50OmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPXRoaXMuc2xvdHMsZD0wLGU9Yy5zaXplO2U+ZDtkKyspe3ZhciBmPWNbZF07aWYoZi5kYXRhLm5hbWU9PWEpe3ZhciBnPW51bGw7aWYoYiYmKGc9dGhpcy5nZXRBdHRhY2htZW50KGQsYiksbnVsbD09ZykpdGhyb3dcIkF0dGFjaG1lbnQgbm90IGZvdW5kOiBcIitiK1wiLCBmb3Igc2xvdDogXCIrYTtyZXR1cm4gZi5zZXRBdHRhY2htZW50KGcpLHZvaWQgMH19dGhyb3dcIlNsb3Qgbm90IGZvdW5kOiBcIithfSx1cGRhdGU6ZnVuY3Rpb24oYSl7dGltZSs9YX19LGMuQXR0YWNobWVudFR5cGU9e3JlZ2lvbjowfSxjLlJlZ2lvbkF0dGFjaG1lbnQ9ZnVuY3Rpb24oKXt0aGlzLm9mZnNldD1bXSx0aGlzLm9mZnNldC5sZW5ndGg9OCx0aGlzLnV2cz1bXSx0aGlzLnV2cy5sZW5ndGg9OH0sYy5SZWdpb25BdHRhY2htZW50LnByb3RvdHlwZT17eDowLHk6MCxyb3RhdGlvbjowLHNjYWxlWDoxLHNjYWxlWToxLHdpZHRoOjAsaGVpZ2h0OjAscmVuZGVyZXJPYmplY3Q6bnVsbCxyZWdpb25PZmZzZXRYOjAscmVnaW9uT2Zmc2V0WTowLHJlZ2lvbldpZHRoOjAscmVnaW9uSGVpZ2h0OjAscmVnaW9uT3JpZ2luYWxXaWR0aDowLHJlZ2lvbk9yaWdpbmFsSGVpZ2h0OjAsc2V0VVZzOmZ1bmN0aW9uKGEsYixjLGQsZSl7dmFyIGY9dGhpcy51dnM7ZT8oZlsyXT1hLGZbM109ZCxmWzRdPWEsZls1XT1iLGZbNl09YyxmWzddPWIsZlswXT1jLGZbMV09ZCk6KGZbMF09YSxmWzFdPWQsZlsyXT1hLGZbM109YixmWzRdPWMsZls1XT1iLGZbNl09YyxmWzddPWQpfSx1cGRhdGVPZmZzZXQ6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLndpZHRoL3RoaXMucmVnaW9uT3JpZ2luYWxXaWR0aCp0aGlzLnNjYWxlWCxiPXRoaXMuaGVpZ2h0L3RoaXMucmVnaW9uT3JpZ2luYWxIZWlnaHQqdGhpcy5zY2FsZVksYz0tdGhpcy53aWR0aC8yKnRoaXMuc2NhbGVYK3RoaXMucmVnaW9uT2Zmc2V0WCphLGQ9LXRoaXMuaGVpZ2h0LzIqdGhpcy5zY2FsZVkrdGhpcy5yZWdpb25PZmZzZXRZKmIsZT1jK3RoaXMucmVnaW9uV2lkdGgqYSxmPWQrdGhpcy5yZWdpb25IZWlnaHQqYixnPXRoaXMucm90YXRpb24qTWF0aC5QSS8xODAsaD1NYXRoLmNvcyhnKSxpPU1hdGguc2luKGcpLGo9YypoK3RoaXMueCxrPWMqaSxsPWQqaCt0aGlzLnksbT1kKmksbj1lKmgrdGhpcy54LG89ZSppLHA9ZipoK3RoaXMueSxxPWYqaSxyPXRoaXMub2Zmc2V0O3JbMF09ai1tLHJbMV09bCtrLHJbMl09ai1xLHJbM109cCtrLHJbNF09bi1xLHJbNV09cCtvLHJbNl09bi1tLHJbN109bCtvfSxjb21wdXRlVmVydGljZXM6ZnVuY3Rpb24oYSxiLGMsZCl7YSs9Yy53b3JsZFgsYis9Yy53b3JsZFk7dmFyIGU9Yy5tMDAsZj1jLm0wMSxnPWMubTEwLGg9Yy5tMTEsaT10aGlzLm9mZnNldDtkWzBdPWlbMF0qZStpWzFdKmYrYSxkWzFdPWlbMF0qZytpWzFdKmgrYixkWzJdPWlbMl0qZStpWzNdKmYrYSxkWzNdPWlbMl0qZytpWzNdKmgrYixkWzRdPWlbNF0qZStpWzVdKmYrYSxkWzVdPWlbNF0qZytpWzVdKmgrYixkWzZdPWlbNl0qZStpWzddKmYrYSxkWzddPWlbNl0qZytpWzddKmgrYn19LGMuQW5pbWF0aW9uU3RhdGVEYXRhPWZ1bmN0aW9uKGEpe3RoaXMuc2tlbGV0b25EYXRhPWEsdGhpcy5hbmltYXRpb25Ub01peFRpbWU9e319LGMuQW5pbWF0aW9uU3RhdGVEYXRhLnByb3RvdHlwZT17ZGVmYXVsdE1peDowLHNldE1peEJ5TmFtZTpmdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcy5za2VsZXRvbkRhdGEuZmluZEFuaW1hdGlvbihhKTtpZighZCl0aHJvd1wiQW5pbWF0aW9uIG5vdCBmb3VuZDogXCIrYTt2YXIgZT10aGlzLnNrZWxldG9uRGF0YS5maW5kQW5pbWF0aW9uKGIpO2lmKCFlKXRocm93XCJBbmltYXRpb24gbm90IGZvdW5kOiBcIitiO3RoaXMuc2V0TWl4KGQsZSxjKX0sc2V0TWl4OmZ1bmN0aW9uKGEsYixjKXt0aGlzLmFuaW1hdGlvblRvTWl4VGltZVthLm5hbWUrXCI6XCIrYi5uYW1lXT1jfSxnZXRNaXg6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLmFuaW1hdGlvblRvTWl4VGltZVthLm5hbWUrXCI6XCIrYi5uYW1lXTtyZXR1cm4gYz9jOnRoaXMuZGVmYXVsdE1peH19LGMuQW5pbWF0aW9uU3RhdGU9ZnVuY3Rpb24oYSl7dGhpcy5kYXRhPWEsdGhpcy5xdWV1ZT1bXX0sYy5BbmltYXRpb25TdGF0ZS5wcm90b3R5cGU9e2FuaW1hdGlvblNwZWVkOjEsY3VycmVudDpudWxsLHByZXZpb3VzOm51bGwsY3VycmVudFRpbWU6MCxwcmV2aW91c1RpbWU6MCxjdXJyZW50TG9vcDohMSxwcmV2aW91c0xvb3A6ITEsbWl4VGltZTowLG1peER1cmF0aW9uOjAsdXBkYXRlOmZ1bmN0aW9uKGEpe2lmKHRoaXMuY3VycmVudFRpbWUrPWEqdGhpcy5hbmltYXRpb25TcGVlZCx0aGlzLnByZXZpb3VzVGltZSs9YSx0aGlzLm1peFRpbWUrPWEsdGhpcy5xdWV1ZS5sZW5ndGg+MCl7dmFyIGI9dGhpcy5xdWV1ZVswXTt0aGlzLmN1cnJlbnRUaW1lPj1iLmRlbGF5JiYodGhpcy5fc2V0QW5pbWF0aW9uKGIuYW5pbWF0aW9uLGIubG9vcCksdGhpcy5xdWV1ZS5zaGlmdCgpKX19LGFwcGx5OmZ1bmN0aW9uKGEpe2lmKHRoaXMuY3VycmVudClpZih0aGlzLnByZXZpb3VzKXt0aGlzLnByZXZpb3VzLmFwcGx5KGEsdGhpcy5wcmV2aW91c1RpbWUsdGhpcy5wcmV2aW91c0xvb3ApO3ZhciBiPXRoaXMubWl4VGltZS90aGlzLm1peER1cmF0aW9uO2I+PTEmJihiPTEsdGhpcy5wcmV2aW91cz1udWxsKSx0aGlzLmN1cnJlbnQubWl4KGEsdGhpcy5jdXJyZW50VGltZSx0aGlzLmN1cnJlbnRMb29wLGIpfWVsc2UgdGhpcy5jdXJyZW50LmFwcGx5KGEsdGhpcy5jdXJyZW50VGltZSx0aGlzLmN1cnJlbnRMb29wKX0sY2xlYXJBbmltYXRpb246ZnVuY3Rpb24oKXt0aGlzLnByZXZpb3VzPW51bGwsdGhpcy5jdXJyZW50PW51bGwsdGhpcy5xdWV1ZS5sZW5ndGg9MH0sX3NldEFuaW1hdGlvbjpmdW5jdGlvbihhLGIpe3RoaXMucHJldmlvdXM9bnVsbCxhJiZ0aGlzLmN1cnJlbnQmJih0aGlzLm1peER1cmF0aW9uPXRoaXMuZGF0YS5nZXRNaXgodGhpcy5jdXJyZW50LGEpLHRoaXMubWl4RHVyYXRpb24+MCYmKHRoaXMubWl4VGltZT0wLHRoaXMucHJldmlvdXM9dGhpcy5jdXJyZW50LHRoaXMucHJldmlvdXNUaW1lPXRoaXMuY3VycmVudFRpbWUsdGhpcy5wcmV2aW91c0xvb3A9dGhpcy5jdXJyZW50TG9vcCkpLHRoaXMuY3VycmVudD1hLHRoaXMuY3VycmVudExvb3A9Yix0aGlzLmN1cnJlbnRUaW1lPTB9LHNldEFuaW1hdGlvbkJ5TmFtZTpmdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuZGF0YS5za2VsZXRvbkRhdGEuZmluZEFuaW1hdGlvbihhKTtpZighYyl0aHJvd1wiQW5pbWF0aW9uIG5vdCBmb3VuZDogXCIrYTt0aGlzLnNldEFuaW1hdGlvbihjLGIpfSxzZXRBbmltYXRpb246ZnVuY3Rpb24oYSxiKXt0aGlzLnF1ZXVlLmxlbmd0aD0wLHRoaXMuX3NldEFuaW1hdGlvbihhLGIpfSxhZGRBbmltYXRpb25CeU5hbWU6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMuZGF0YS5za2VsZXRvbkRhdGEuZmluZEFuaW1hdGlvbihhKTtpZighZCl0aHJvd1wiQW5pbWF0aW9uIG5vdCBmb3VuZDogXCIrYTt0aGlzLmFkZEFuaW1hdGlvbihkLGIsYyl9LGFkZEFuaW1hdGlvbjpmdW5jdGlvbihhLGIsYyl7dmFyIGQ9e307aWYoZC5hbmltYXRpb249YSxkLmxvb3A9YiwhY3x8MD49Yyl7dmFyIGU9dGhpcy5xdWV1ZS5sZW5ndGg/dGhpcy5xdWV1ZVt0aGlzLnF1ZXVlLmxlbmd0aC0xXS5hbmltYXRpb246dGhpcy5jdXJyZW50O2M9bnVsbCE9ZT9lLmR1cmF0aW9uLXRoaXMuZGF0YS5nZXRNaXgoZSxhKSsoY3x8MCk6MH1kLmRlbGF5PWMsdGhpcy5xdWV1ZS5wdXNoKGQpfSxpc0NvbXBsZXRlOmZ1bmN0aW9uKCl7cmV0dXJuIXRoaXMuY3VycmVudHx8dGhpcy5jdXJyZW50VGltZT49dGhpcy5jdXJyZW50LmR1cmF0aW9ufX0sYy5Ta2VsZXRvbkpzb249ZnVuY3Rpb24oYSl7dGhpcy5hdHRhY2htZW50TG9hZGVyPWF9LGMuU2tlbGV0b25Kc29uLnByb3RvdHlwZT17c2NhbGU6MSxyZWFkU2tlbGV0b25EYXRhOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYixkPW5ldyBjLlNrZWxldG9uRGF0YSxlPWEuYm9uZXMsZj0wLGc9ZS5sZW5ndGg7Zz5mO2YrKyl7dmFyIGg9ZVtmXSxpPW51bGw7aWYoaC5wYXJlbnQmJihpPWQuZmluZEJvbmUoaC5wYXJlbnQpLCFpKSl0aHJvd1wiUGFyZW50IGJvbmUgbm90IGZvdW5kOiBcIitoLnBhcmVudDtiPW5ldyBjLkJvbmVEYXRhKGgubmFtZSxpKSxiLmxlbmd0aD0oaC5sZW5ndGh8fDApKnRoaXMuc2NhbGUsYi54PShoLnh8fDApKnRoaXMuc2NhbGUsYi55PShoLnl8fDApKnRoaXMuc2NhbGUsYi5yb3RhdGlvbj1oLnJvdGF0aW9ufHwwLGIuc2NhbGVYPWguc2NhbGVYfHwxLGIuc2NhbGVZPWguc2NhbGVZfHwxLGQuYm9uZXMucHVzaChiKX12YXIgaj1hLnNsb3RzO2ZvcihmPTAsZz1qLmxlbmd0aDtnPmY7ZisrKXt2YXIgaz1qW2ZdO2lmKGI9ZC5maW5kQm9uZShrLmJvbmUpLCFiKXRocm93XCJTbG90IGJvbmUgbm90IGZvdW5kOiBcIitrLmJvbmU7dmFyIGw9bmV3IGMuU2xvdERhdGEoay5uYW1lLGIpLG09ay5jb2xvcjttJiYobC5yPWMuU2tlbGV0b25Kc29uLnRvQ29sb3IobSwwKSxsLmc9Yy5Ta2VsZXRvbkpzb24udG9Db2xvcihtLDEpLGwuYj1jLlNrZWxldG9uSnNvbi50b0NvbG9yKG0sMiksbC5hPWMuU2tlbGV0b25Kc29uLnRvQ29sb3IobSwzKSksbC5hdHRhY2htZW50TmFtZT1rLmF0dGFjaG1lbnQsZC5zbG90cy5wdXNoKGwpfXZhciBuPWEuc2tpbnM7Zm9yKHZhciBvIGluIG4paWYobi5oYXNPd25Qcm9wZXJ0eShvKSl7dmFyIHA9bltvXSxxPW5ldyBjLlNraW4obyk7Zm9yKHZhciByIGluIHApaWYocC5oYXNPd25Qcm9wZXJ0eShyKSl7dmFyIHM9ZC5maW5kU2xvdEluZGV4KHIpLHQ9cFtyXTtmb3IodmFyIHUgaW4gdClpZih0Lmhhc093blByb3BlcnR5KHUpKXt2YXIgdj10aGlzLnJlYWRBdHRhY2htZW50KHEsdSx0W3VdKTtudWxsIT12JiZxLmFkZEF0dGFjaG1lbnQocyx1LHYpfX1kLnNraW5zLnB1c2gocSksXCJkZWZhdWx0XCI9PXEubmFtZSYmKGQuZGVmYXVsdFNraW49cSl9dmFyIHc9YS5hbmltYXRpb25zO2Zvcih2YXIgeCBpbiB3KXcuaGFzT3duUHJvcGVydHkoeCkmJnRoaXMucmVhZEFuaW1hdGlvbih4LHdbeF0sZCk7cmV0dXJuIGR9LHJlYWRBdHRhY2htZW50OmZ1bmN0aW9uKGEsYixkKXtiPWQubmFtZXx8Yjt2YXIgZT1jLkF0dGFjaG1lbnRUeXBlW2QudHlwZXx8XCJyZWdpb25cIl07aWYoZT09Yy5BdHRhY2htZW50VHlwZS5yZWdpb24pe3ZhciBmPW5ldyBjLlJlZ2lvbkF0dGFjaG1lbnQ7cmV0dXJuIGYueD0oZC54fHwwKSp0aGlzLnNjYWxlLGYueT0oZC55fHwwKSp0aGlzLnNjYWxlLGYuc2NhbGVYPWQuc2NhbGVYfHwxLGYuc2NhbGVZPWQuc2NhbGVZfHwxLGYucm90YXRpb249ZC5yb3RhdGlvbnx8MCxmLndpZHRoPShkLndpZHRofHwzMikqdGhpcy5zY2FsZSxmLmhlaWdodD0oZC5oZWlnaHR8fDMyKSp0aGlzLnNjYWxlLGYudXBkYXRlT2Zmc2V0KCksZi5yZW5kZXJlck9iamVjdD17fSxmLnJlbmRlcmVyT2JqZWN0Lm5hbWU9YixmLnJlbmRlcmVyT2JqZWN0LnNjYWxlPXt9LGYucmVuZGVyZXJPYmplY3Quc2NhbGUueD1mLnNjYWxlWCxmLnJlbmRlcmVyT2JqZWN0LnNjYWxlLnk9Zi5zY2FsZVksZi5yZW5kZXJlck9iamVjdC5yb3RhdGlvbj0tZi5yb3RhdGlvbipNYXRoLlBJLzE4MCxmfXRocm93XCJVbmtub3duIGF0dGFjaG1lbnQgdHlwZTogXCIrZX0scmVhZEFuaW1hdGlvbjpmdW5jdGlvbihhLGIsZCl7dmFyIGUsZixnLGgsaSxqLGssbD1bXSxtPTAsbj1iLmJvbmVzO2Zvcih2YXIgbyBpbiBuKWlmKG4uaGFzT3duUHJvcGVydHkobykpe3ZhciBwPWQuZmluZEJvbmVJbmRleChvKTtpZigtMT09cCl0aHJvd1wiQm9uZSBub3QgZm91bmQ6IFwiK287dmFyIHE9bltvXTtmb3IoZyBpbiBxKWlmKHEuaGFzT3duUHJvcGVydHkoZykpaWYoaT1xW2ddLFwicm90YXRlXCI9PWcpe2ZvcihmPW5ldyBjLlJvdGF0ZVRpbWVsaW5lKGkubGVuZ3RoKSxmLmJvbmVJbmRleD1wLGU9MCxqPTAsaz1pLmxlbmd0aDtrPmo7aisrKWg9aVtqXSxmLnNldEZyYW1lKGUsaC50aW1lLGguYW5nbGUpLGMuU2tlbGV0b25Kc29uLnJlYWRDdXJ2ZShmLGUsaCksZSsrO2wucHVzaChmKSxtPU1hdGgubWF4KG0sZi5mcmFtZXNbMipmLmdldEZyYW1lQ291bnQoKS0yXSl9ZWxzZXtpZihcInRyYW5zbGF0ZVwiIT1nJiZcInNjYWxlXCIhPWcpdGhyb3dcIkludmFsaWQgdGltZWxpbmUgdHlwZSBmb3IgYSBib25lOiBcIitnK1wiIChcIitvK1wiKVwiO3ZhciByPTE7Zm9yKFwic2NhbGVcIj09Zz9mPW5ldyBjLlNjYWxlVGltZWxpbmUoaS5sZW5ndGgpOihmPW5ldyBjLlRyYW5zbGF0ZVRpbWVsaW5lKGkubGVuZ3RoKSxyPXRoaXMuc2NhbGUpLGYuYm9uZUluZGV4PXAsZT0wLGo9MCxrPWkubGVuZ3RoO2s+ajtqKyspe2g9aVtqXTt2YXIgcz0oaC54fHwwKSpyLHQ9KGgueXx8MCkqcjtmLnNldEZyYW1lKGUsaC50aW1lLHMsdCksYy5Ta2VsZXRvbkpzb24ucmVhZEN1cnZlKGYsZSxoKSxlKyt9bC5wdXNoKGYpLG09TWF0aC5tYXgobSxmLmZyYW1lc1szKmYuZ2V0RnJhbWVDb3VudCgpLTNdKX19dmFyIHU9Yi5zbG90cztmb3IodmFyIHYgaW4gdSlpZih1Lmhhc093blByb3BlcnR5KHYpKXt2YXIgdz11W3ZdLHg9ZC5maW5kU2xvdEluZGV4KHYpO2ZvcihnIGluIHcpaWYody5oYXNPd25Qcm9wZXJ0eShnKSlpZihpPXdbZ10sXCJjb2xvclwiPT1nKXtmb3IoZj1uZXcgYy5Db2xvclRpbWVsaW5lKGkubGVuZ3RoKSxmLnNsb3RJbmRleD14LGU9MCxqPTAsaz1pLmxlbmd0aDtrPmo7aisrKXtoPWlbal07dmFyIHk9aC5jb2xvcix6PWMuU2tlbGV0b25Kc29uLnRvQ29sb3IoeSwwKSxBPWMuU2tlbGV0b25Kc29uLnRvQ29sb3IoeSwxKSxCPWMuU2tlbGV0b25Kc29uLnRvQ29sb3IoeSwyKSxDPWMuU2tlbGV0b25Kc29uLnRvQ29sb3IoeSwzKTtmLnNldEZyYW1lKGUsaC50aW1lLHosQSxCLEMpLGMuU2tlbGV0b25Kc29uLnJlYWRDdXJ2ZShmLGUsaCksZSsrfWwucHVzaChmKSxtPU1hdGgubWF4KG0sZi5mcmFtZXNbNSpmLmdldEZyYW1lQ291bnQoKS01XSl9ZWxzZXtpZihcImF0dGFjaG1lbnRcIiE9Zyl0aHJvd1wiSW52YWxpZCB0aW1lbGluZSB0eXBlIGZvciBhIHNsb3Q6IFwiK2crXCIgKFwiK3YrXCIpXCI7Zm9yKGY9bmV3IGMuQXR0YWNobWVudFRpbWVsaW5lKGkubGVuZ3RoKSxmLnNsb3RJbmRleD14LGU9MCxqPTAsaz1pLmxlbmd0aDtrPmo7aisrKWg9aVtqXSxmLnNldEZyYW1lKGUrKyxoLnRpbWUsaC5uYW1lKTtsLnB1c2goZiksbT1NYXRoLm1heChtLGYuZnJhbWVzW2YuZ2V0RnJhbWVDb3VudCgpLTFdKX19ZC5hbmltYXRpb25zLnB1c2gobmV3IGMuQW5pbWF0aW9uKGEsbCxtKSl9fSxjLlNrZWxldG9uSnNvbi5yZWFkQ3VydmU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWMuY3VydmU7ZCYmKFwic3RlcHBlZFwiPT1kP2EuY3VydmVzLnNldFN0ZXBwZWQoYik6ZCBpbnN0YW5jZW9mIEFycmF5JiZhLmN1cnZlcy5zZXRDdXJ2ZShiLGRbMF0sZFsxXSxkWzJdLGRbM10pKX0sYy5Ta2VsZXRvbkpzb24udG9Db2xvcj1mdW5jdGlvbihhLGIpe2lmKDghPWEubGVuZ3RoKXRocm93XCJDb2xvciBoZXhpZGVjaW1hbCBsZW5ndGggbXVzdCBiZSA4LCByZWNpZXZlZDogXCIrYTtyZXR1cm4gcGFyc2VJbnQoYS5zdWJzdHIoMipiLDIpLDE2KS8yNTV9LGMuQXRsYXM9ZnVuY3Rpb24oYSxiKXt0aGlzLnRleHR1cmVMb2FkZXI9Yix0aGlzLnBhZ2VzPVtdLHRoaXMucmVnaW9ucz1bXTt2YXIgZD1uZXcgYy5BdGxhc1JlYWRlcihhKSxlPVtdO2UubGVuZ3RoPTQ7Zm9yKHZhciBmPW51bGw7Oyl7dmFyIGc9ZC5yZWFkTGluZSgpO2lmKG51bGw9PWcpYnJlYWs7aWYoZz1kLnRyaW0oZyksZy5sZW5ndGgpaWYoZil7dmFyIGg9bmV3IGMuQXRsYXNSZWdpb247aC5uYW1lPWcsaC5wYWdlPWYsaC5yb3RhdGU9XCJ0cnVlXCI9PWQucmVhZFZhbHVlKCksZC5yZWFkVHVwbGUoZSk7dmFyIGk9cGFyc2VJbnQoZVswXSwxMCksaj1wYXJzZUludChlWzFdLDEwKTtkLnJlYWRUdXBsZShlKTt2YXIgaz1wYXJzZUludChlWzBdLDEwKSxsPXBhcnNlSW50KGVbMV0sMTApO2gudT1pL2Yud2lkdGgsaC52PWovZi5oZWlnaHQsaC5yb3RhdGU/KGgudTI9KGkrbCkvZi53aWR0aCxoLnYyPShqK2spL2YuaGVpZ2h0KTooaC51Mj0oaStrKS9mLndpZHRoLGgudjI9KGorbCkvZi5oZWlnaHQpLGgueD1pLGgueT1qLGgud2lkdGg9TWF0aC5hYnMoayksaC5oZWlnaHQ9TWF0aC5hYnMobCksND09ZC5yZWFkVHVwbGUoZSkmJihoLnNwbGl0cz1bcGFyc2VJbnQoZVswXSwxMCkscGFyc2VJbnQoZVsxXSwxMCkscGFyc2VJbnQoZVsyXSwxMCkscGFyc2VJbnQoZVszXSwxMCldLDQ9PWQucmVhZFR1cGxlKGUpJiYoaC5wYWRzPVtwYXJzZUludChlWzBdLDEwKSxwYXJzZUludChlWzFdLDEwKSxwYXJzZUludChlWzJdLDEwKSxwYXJzZUludChlWzNdLDEwKV0sZC5yZWFkVHVwbGUoZSkpKSxoLm9yaWdpbmFsV2lkdGg9cGFyc2VJbnQoZVswXSwxMCksaC5vcmlnaW5hbEhlaWdodD1wYXJzZUludChlWzFdLDEwKSxkLnJlYWRUdXBsZShlKSxoLm9mZnNldFg9cGFyc2VJbnQoZVswXSwxMCksaC5vZmZzZXRZPXBhcnNlSW50KGVbMV0sMTApLGguaW5kZXg9cGFyc2VJbnQoZC5yZWFkVmFsdWUoKSwxMCksdGhpcy5yZWdpb25zLnB1c2goaCl9ZWxzZXtmPW5ldyBjLkF0bGFzUGFnZSxmLm5hbWU9ZyxmLmZvcm1hdD1jLkF0bGFzLkZvcm1hdFtkLnJlYWRWYWx1ZSgpXSxkLnJlYWRUdXBsZShlKSxmLm1pbkZpbHRlcj1jLkF0bGFzLlRleHR1cmVGaWx0ZXJbZVswXV0sZi5tYWdGaWx0ZXI9Yy5BdGxhcy5UZXh0dXJlRmlsdGVyW2VbMV1dO3ZhciBtPWQucmVhZFZhbHVlKCk7Zi51V3JhcD1jLkF0bGFzLlRleHR1cmVXcmFwLmNsYW1wVG9FZGdlLGYudldyYXA9Yy5BdGxhcy5UZXh0dXJlV3JhcC5jbGFtcFRvRWRnZSxcInhcIj09bT9mLnVXcmFwPWMuQXRsYXMuVGV4dHVyZVdyYXAucmVwZWF0OlwieVwiPT1tP2YudldyYXA9Yy5BdGxhcy5UZXh0dXJlV3JhcC5yZXBlYXQ6XCJ4eVwiPT1tJiYoZi51V3JhcD1mLnZXcmFwPWMuQXRsYXMuVGV4dHVyZVdyYXAucmVwZWF0KSxiLmxvYWQoZixnKSx0aGlzLnBhZ2VzLnB1c2goZil9ZWxzZSBmPW51bGx9fSxjLkF0bGFzLnByb3RvdHlwZT17ZmluZFJlZ2lvbjpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5yZWdpb25zLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5uYW1lPT1hKXJldHVybiBiW2NdO3JldHVybiBudWxsfSxkaXNwb3NlOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXMucGFnZXMsYj0wLGM9YS5sZW5ndGg7Yz5iO2IrKyl0aGlzLnRleHR1cmVMb2FkZXIudW5sb2FkKGFbYl0ucmVuZGVyZXJPYmplY3QpfSx1cGRhdGVVVnM6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMucmVnaW9ucyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKXt2YXIgZT1iW2NdO2UucGFnZT09YSYmKGUudT1lLngvYS53aWR0aCxlLnY9ZS55L2EuaGVpZ2h0LGUucm90YXRlPyhlLnUyPShlLngrZS5oZWlnaHQpL2Eud2lkdGgsZS52Mj0oZS55K2Uud2lkdGgpL2EuaGVpZ2h0KTooZS51Mj0oZS54K2Uud2lkdGgpL2Eud2lkdGgsZS52Mj0oZS55K2UuaGVpZ2h0KS9hLmhlaWdodCkpfX19LGMuQXRsYXMuRm9ybWF0PXthbHBoYTowLGludGVuc2l0eToxLGx1bWluYW5jZUFscGhhOjIscmdiNTY1OjMscmdiYTQ0NDQ6NCxyZ2I4ODg6NSxyZ2JhODg4ODo2fSxjLkF0bGFzLlRleHR1cmVGaWx0ZXI9e25lYXJlc3Q6MCxsaW5lYXI6MSxtaXBNYXA6MixtaXBNYXBOZWFyZXN0TmVhcmVzdDozLG1pcE1hcExpbmVhck5lYXJlc3Q6NCxtaXBNYXBOZWFyZXN0TGluZWFyOjUsbWlwTWFwTGluZWFyTGluZWFyOjZ9LGMuQXRsYXMuVGV4dHVyZVdyYXA9e21pcnJvcmVkUmVwZWF0OjAsY2xhbXBUb0VkZ2U6MSxyZXBlYXQ6Mn0sYy5BdGxhc1BhZ2U9ZnVuY3Rpb24oKXt9LGMuQXRsYXNQYWdlLnByb3RvdHlwZT17bmFtZTpudWxsLGZvcm1hdDpudWxsLG1pbkZpbHRlcjpudWxsLG1hZ0ZpbHRlcjpudWxsLHVXcmFwOm51bGwsdldyYXA6bnVsbCxyZW5kZXJlck9iamVjdDpudWxsLHdpZHRoOjAsaGVpZ2h0OjB9LGMuQXRsYXNSZWdpb249ZnVuY3Rpb24oKXt9LGMuQXRsYXNSZWdpb24ucHJvdG90eXBlPXtwYWdlOm51bGwsbmFtZTpudWxsLHg6MCx5OjAsd2lkdGg6MCxoZWlnaHQ6MCx1OjAsdjowLHUyOjAsdjI6MCxvZmZzZXRYOjAsb2Zmc2V0WTowLG9yaWdpbmFsV2lkdGg6MCxvcmlnaW5hbEhlaWdodDowLGluZGV4OjAscm90YXRlOiExLHNwbGl0czpudWxsLHBhZHM6bnVsbH0sYy5BdGxhc1JlYWRlcj1mdW5jdGlvbihhKXt0aGlzLmxpbmVzPWEuc3BsaXQoL1xcclxcbnxcXHJ8XFxuLyl9LGMuQXRsYXNSZWFkZXIucHJvdG90eXBlPXtpbmRleDowLHRyaW06ZnVuY3Rpb24oYSl7cmV0dXJuIGEucmVwbGFjZSgvXlxccyt8XFxzKyQvZyxcIlwiKX0scmVhZExpbmU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbmRleD49dGhpcy5saW5lcy5sZW5ndGg/bnVsbDp0aGlzLmxpbmVzW3RoaXMuaW5kZXgrK119LHJlYWRWYWx1ZTpmdW5jdGlvbigpe3ZhciBhPXRoaXMucmVhZExpbmUoKSxiPWEuaW5kZXhPZihcIjpcIik7aWYoLTE9PWIpdGhyb3dcIkludmFsaWQgbGluZTogXCIrYTtyZXR1cm4gdGhpcy50cmltKGEuc3Vic3RyaW5nKGIrMSkpfSxyZWFkVHVwbGU6ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5yZWFkTGluZSgpLGM9Yi5pbmRleE9mKFwiOlwiKTtpZigtMT09Yyl0aHJvd1wiSW52YWxpZCBsaW5lOiBcIitiO2Zvcih2YXIgZD0wLGU9YysxOzM+ZDtkKyspe3ZhciBmPWIuaW5kZXhPZihcIixcIixlKTtpZigtMT09Zil7aWYoIWQpdGhyb3dcIkludmFsaWQgbGluZTogXCIrYjticmVha31hW2RdPXRoaXMudHJpbShiLnN1YnN0cihlLGYtZSkpLGU9ZisxfXJldHVybiBhW2RdPXRoaXMudHJpbShiLnN1YnN0cmluZyhlKSksZCsxfX0sYy5BdGxhc0F0dGFjaG1lbnRMb2FkZXI9ZnVuY3Rpb24oYSl7dGhpcy5hdGxhcz1hfSxjLkF0bGFzQXR0YWNobWVudExvYWRlci5wcm90b3R5cGU9e25ld0F0dGFjaG1lbnQ6ZnVuY3Rpb24oYSxiLGQpe3N3aXRjaChiKXtjYXNlIGMuQXR0YWNobWVudFR5cGUucmVnaW9uOnZhciBlPXRoaXMuYXRsYXMuZmluZFJlZ2lvbihkKTtpZighZSl0aHJvd1wiUmVnaW9uIG5vdCBmb3VuZCBpbiBhdGxhczogXCIrZCtcIiAoXCIrYitcIilcIjt2YXIgZj1uZXcgYy5SZWdpb25BdHRhY2htZW50KGQpO3JldHVybiBmLnJlbmRlcmVyT2JqZWN0PWUsZi5zZXRVVnMoZS51LGUudixlLnUyLGUudjIsZS5yb3RhdGUpLGYucmVnaW9uT2Zmc2V0WD1lLm9mZnNldFgsZi5yZWdpb25PZmZzZXRZPWUub2Zmc2V0WSxmLnJlZ2lvbldpZHRoPWUud2lkdGgsZi5yZWdpb25IZWlnaHQ9ZS5oZWlnaHQsZi5yZWdpb25PcmlnaW5hbFdpZHRoPWUub3JpZ2luYWxXaWR0aCxmLnJlZ2lvbk9yaWdpbmFsSGVpZ2h0PWUub3JpZ2luYWxIZWlnaHQsZn10aHJvd1wiVW5rbm93biBhdHRhY2htZW50IHR5cGU6IFwiK2J9fSxjLkJvbmUueURvd249ITAsYi5BbmltQ2FjaGU9e30sYi5TcGluZT1mdW5jdGlvbihhKXtpZihiLkRpc3BsYXlPYmplY3RDb250YWluZXIuY2FsbCh0aGlzKSx0aGlzLnNwaW5lRGF0YT1iLkFuaW1DYWNoZVthXSwhdGhpcy5zcGluZURhdGEpdGhyb3cgbmV3IEVycm9yKFwiU3BpbmUgZGF0YSBtdXN0IGJlIHByZWxvYWRlZCB1c2luZyBQSVhJLlNwaW5lTG9hZGVyIG9yIFBJWEkuQXNzZXRMb2FkZXI6IFwiK2EpO3RoaXMuc2tlbGV0b249bmV3IGMuU2tlbGV0b24odGhpcy5zcGluZURhdGEpLHRoaXMuc2tlbGV0b24udXBkYXRlV29ybGRUcmFuc2Zvcm0oKSx0aGlzLnN0YXRlRGF0YT1uZXcgYy5BbmltYXRpb25TdGF0ZURhdGEodGhpcy5zcGluZURhdGEpLHRoaXMuc3RhdGU9bmV3IGMuQW5pbWF0aW9uU3RhdGUodGhpcy5zdGF0ZURhdGEpLHRoaXMuc2xvdENvbnRhaW5lcnM9W107Zm9yKHZhciBkPTAsZT10aGlzLnNrZWxldG9uLmRyYXdPcmRlci5sZW5ndGg7ZT5kO2QrKyl7dmFyIGY9dGhpcy5za2VsZXRvbi5kcmF3T3JkZXJbZF0sZz1mLmF0dGFjaG1lbnQsaD1uZXcgYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyO2lmKHRoaXMuc2xvdENvbnRhaW5lcnMucHVzaChoKSx0aGlzLmFkZENoaWxkKGgpLGcgaW5zdGFuY2VvZiBjLlJlZ2lvbkF0dGFjaG1lbnQpe3ZhciBpPWcucmVuZGVyZXJPYmplY3QubmFtZSxqPXRoaXMuY3JlYXRlU3ByaXRlKGYsZy5yZW5kZXJlck9iamVjdCk7Zi5jdXJyZW50U3ByaXRlPWosZi5jdXJyZW50U3ByaXRlTmFtZT1pLGguYWRkQ2hpbGQoail9fX0sYi5TcGluZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlKSxiLlNwaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlNwaW5lLGIuU3BpbmUucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybT1mdW5jdGlvbigpe3RoaXMubGFzdFRpbWU9dGhpcy5sYXN0VGltZXx8RGF0ZS5ub3coKTt2YXIgYT0uMDAxKihEYXRlLm5vdygpLXRoaXMubGFzdFRpbWUpO3RoaXMubGFzdFRpbWU9RGF0ZS5ub3coKSx0aGlzLnN0YXRlLnVwZGF0ZShhKSx0aGlzLnN0YXRlLmFwcGx5KHRoaXMuc2tlbGV0b24pLHRoaXMuc2tlbGV0b24udXBkYXRlV29ybGRUcmFuc2Zvcm0oKTtmb3IodmFyIGQ9dGhpcy5za2VsZXRvbi5kcmF3T3JkZXIsZT0wLGY9ZC5sZW5ndGg7Zj5lO2UrKyl7dmFyIGc9ZFtlXSxoPWcuYXR0YWNobWVudCxpPXRoaXMuc2xvdENvbnRhaW5lcnNbZV07aWYoaCBpbnN0YW5jZW9mIGMuUmVnaW9uQXR0YWNobWVudCl7aWYoaC5yZW5kZXJlck9iamVjdCYmKCFnLmN1cnJlbnRTcHJpdGVOYW1lfHxnLmN1cnJlbnRTcHJpdGVOYW1lIT1oLm5hbWUpKXt2YXIgaj1oLnJlbmRlcmVyT2JqZWN0Lm5hbWU7aWYodm9pZCAwIT09Zy5jdXJyZW50U3ByaXRlJiYoZy5jdXJyZW50U3ByaXRlLnZpc2libGU9ITEpLGcuc3ByaXRlcz1nLnNwcml0ZXN8fHt9LHZvaWQgMCE9PWcuc3ByaXRlc1tqXSlnLnNwcml0ZXNbal0udmlzaWJsZT0hMDtlbHNle3ZhciBrPXRoaXMuY3JlYXRlU3ByaXRlKGcsaC5yZW5kZXJlck9iamVjdCk7aS5hZGRDaGlsZChrKX1nLmN1cnJlbnRTcHJpdGU9Zy5zcHJpdGVzW2pdLGcuY3VycmVudFNwcml0ZU5hbWU9an1pLnZpc2libGU9ITA7dmFyIGw9Zy5ib25lO2kucG9zaXRpb24ueD1sLndvcmxkWCtoLngqbC5tMDAraC55KmwubTAxLGkucG9zaXRpb24ueT1sLndvcmxkWStoLngqbC5tMTAraC55KmwubTExLGkuc2NhbGUueD1sLndvcmxkU2NhbGVYLGkuc2NhbGUueT1sLndvcmxkU2NhbGVZLGkucm90YXRpb249LShnLmJvbmUud29ybGRSb3RhdGlvbipNYXRoLlBJLzE4MCksaS5hbHBoYT1nLmEsZy5jdXJyZW50U3ByaXRlLnRpbnQ9Yi5yZ2IyaGV4KFtnLnIsZy5nLGcuYl0pfWVsc2UgaS52aXNpYmxlPSExfWIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtLmNhbGwodGhpcyl9LGIuU3BpbmUucHJvdG90eXBlLmNyZWF0ZVNwcml0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPWIuVGV4dHVyZUNhY2hlW2MubmFtZV0/Yy5uYW1lOmMubmFtZStcIi5wbmdcIixlPW5ldyBiLlNwcml0ZShiLlRleHR1cmUuZnJvbUZyYW1lKGQpKTtyZXR1cm4gZS5zY2FsZT1jLnNjYWxlLGUucm90YXRpb249Yy5yb3RhdGlvbixlLmFuY2hvci54PWUuYW5jaG9yLnk9LjUsYS5zcHJpdGVzPWEuc3ByaXRlc3x8e30sYS5zcHJpdGVzW2MubmFtZV09ZSxlfSxiLkJhc2VUZXh0dXJlQ2FjaGU9e30sYi5CYXNlVGV4dHVyZUNhY2hlSWRHZW5lcmF0b3I9MCxiLkJhc2VUZXh0dXJlPWZ1bmN0aW9uKGEsYyl7aWYodGhpcy5yZXNvbHV0aW9uPTEsdGhpcy53aWR0aD0xMDAsdGhpcy5oZWlnaHQ9MTAwLHRoaXMuc2NhbGVNb2RlPWN8fGIuc2NhbGVNb2Rlcy5ERUZBVUxULHRoaXMuaGFzTG9hZGVkPSExLHRoaXMuc291cmNlPWEsdGhpcy5fVUlEPWIuX1VJRCsrLHRoaXMucHJlbXVsdGlwbGllZEFscGhhPSEwLHRoaXMuX2dsVGV4dHVyZXM9W10sdGhpcy5fZGlydHk9WyEwLCEwLCEwLCEwXSxhKXtpZigodGhpcy5zb3VyY2UuY29tcGxldGV8fHRoaXMuc291cmNlLmdldENvbnRleHQpJiZ0aGlzLnNvdXJjZS53aWR0aCYmdGhpcy5zb3VyY2UuaGVpZ2h0KXRoaXMuaGFzTG9hZGVkPSEwLHRoaXMud2lkdGg9dGhpcy5zb3VyY2UubmF0dXJhbFdpZHRofHx0aGlzLnNvdXJjZS53aWR0aCx0aGlzLmhlaWdodD10aGlzLnNvdXJjZS5uYXR1cmFsSGVpZ2h0fHx0aGlzLnNvdXJjZS5oZWlnaHQsdGhpcy5kaXJ0eSgpO2Vsc2V7dmFyIGQ9dGhpczt0aGlzLnNvdXJjZS5vbmxvYWQ9ZnVuY3Rpb24oKXtkLmhhc0xvYWRlZD0hMCxkLndpZHRoPWQuc291cmNlLm5hdHVyYWxXaWR0aHx8ZC5zb3VyY2Uud2lkdGgsZC5oZWlnaHQ9ZC5zb3VyY2UubmF0dXJhbEhlaWdodHx8ZC5zb3VyY2UuaGVpZ2h0LGQuZGlydHkoKSxkLmRpc3BhdGNoRXZlbnQoe3R5cGU6XCJsb2FkZWRcIixjb250ZW50OmR9KX0sdGhpcy5zb3VyY2Uub25lcnJvcj1mdW5jdGlvbigpe2QuZGlzcGF0Y2hFdmVudCh7dHlwZTpcImVycm9yXCIsY29udGVudDpkfSl9fXRoaXMuaW1hZ2VVcmw9bnVsbCx0aGlzLl9wb3dlck9mMj0hMX19LGIuQmFzZVRleHR1cmUucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQmFzZVRleHR1cmUsYi5FdmVudFRhcmdldC5taXhpbihiLkJhc2VUZXh0dXJlLnByb3RvdHlwZSksYi5CYXNlVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuaW1hZ2VVcmw/KGRlbGV0ZSBiLkJhc2VUZXh0dXJlQ2FjaGVbdGhpcy5pbWFnZVVybF0sZGVsZXRlIGIuVGV4dHVyZUNhY2hlW3RoaXMuaW1hZ2VVcmxdLHRoaXMuaW1hZ2VVcmw9bnVsbCxuYXZpZ2F0b3IuaXNDb2Nvb25KU3x8KHRoaXMuc291cmNlLnNyYz1cIlwiKSk6dGhpcy5zb3VyY2UmJnRoaXMuc291cmNlLl9waXhpSWQmJmRlbGV0ZSBiLkJhc2VUZXh0dXJlQ2FjaGVbdGhpcy5zb3VyY2UuX3BpeGlJZF0sdGhpcy5zb3VyY2U9bnVsbCx0aGlzLnVubG9hZEZyb21HUFUoKX0sYi5CYXNlVGV4dHVyZS5wcm90b3R5cGUudXBkYXRlU291cmNlSW1hZ2U9ZnVuY3Rpb24oYSl7dGhpcy5oYXNMb2FkZWQ9ITEsdGhpcy5zb3VyY2Uuc3JjPW51bGwsdGhpcy5zb3VyY2Uuc3JjPWF9LGIuQmFzZVRleHR1cmUucHJvdG90eXBlLmRpcnR5PWZ1bmN0aW9uKCl7Zm9yKHZhciBhPTA7YTx0aGlzLl9nbFRleHR1cmVzLmxlbmd0aDthKyspdGhpcy5fZGlydHlbYV09ITB9LGIuQmFzZVRleHR1cmUucHJvdG90eXBlLnVubG9hZEZyb21HUFU9ZnVuY3Rpb24oKXt0aGlzLmRpcnR5KCk7Zm9yKHZhciBhPXRoaXMuX2dsVGV4dHVyZXMubGVuZ3RoLTE7YT49MDthLS0pe3ZhciBjPXRoaXMuX2dsVGV4dHVyZXNbYV0sZD1iLmdsQ29udGV4dHNbYV07ZCYmYyYmZC5kZWxldGVUZXh0dXJlKGMpfXRoaXMuX2dsVGV4dHVyZXMubGVuZ3RoPTAsdGhpcy5kaXJ0eSgpfSxiLkJhc2VUZXh0dXJlLmZyb21JbWFnZT1mdW5jdGlvbihhLGMsZCl7dmFyIGU9Yi5CYXNlVGV4dHVyZUNhY2hlW2FdO2lmKHZvaWQgMD09PWMmJi0xPT09YS5pbmRleE9mKFwiZGF0YTpcIikmJihjPSEwKSwhZSl7dmFyIGY9bmV3IEltYWdlO2MmJihmLmNyb3NzT3JpZ2luPVwiXCIpLGYuc3JjPWEsZT1uZXcgYi5CYXNlVGV4dHVyZShmLGQpLGUuaW1hZ2VVcmw9YSxiLkJhc2VUZXh0dXJlQ2FjaGVbYV09ZSwtMSE9PWEuaW5kZXhPZihiLlJFVElOQV9QUkVGSVgrXCIuXCIpJiYoZS5yZXNvbHV0aW9uPTIpfXJldHVybiBlfSxiLkJhc2VUZXh0dXJlLmZyb21DYW52YXM9ZnVuY3Rpb24oYSxjKXthLl9waXhpSWR8fChhLl9waXhpSWQ9XCJjYW52YXNfXCIrYi5UZXh0dXJlQ2FjaGVJZEdlbmVyYXRvcisrKTt2YXIgZD1iLkJhc2VUZXh0dXJlQ2FjaGVbYS5fcGl4aUlkXTtyZXR1cm4gZHx8KGQ9bmV3IGIuQmFzZVRleHR1cmUoYSxjKSxiLkJhc2VUZXh0dXJlQ2FjaGVbYS5fcGl4aUlkXT1kKSxkfSxiLlRleHR1cmVDYWNoZT17fSxiLkZyYW1lQ2FjaGU9e30sYi5UZXh0dXJlQ2FjaGVJZEdlbmVyYXRvcj0wLGIuVGV4dHVyZT1mdW5jdGlvbihhLGMsZCxlKXt0aGlzLm5vRnJhbWU9ITEsY3x8KHRoaXMubm9GcmFtZT0hMCxjPW5ldyBiLlJlY3RhbmdsZSgwLDAsMSwxKSksYSBpbnN0YW5jZW9mIGIuVGV4dHVyZSYmKGE9YS5iYXNlVGV4dHVyZSksdGhpcy5iYXNlVGV4dHVyZT1hLHRoaXMuZnJhbWU9Yyx0aGlzLnRyaW09ZSx0aGlzLnZhbGlkPSExLHRoaXMucmVxdWlyZXNVcGRhdGU9ITEsdGhpcy5fdXZzPW51bGwsdGhpcy53aWR0aD0wLHRoaXMuaGVpZ2h0PTAsdGhpcy5jcm9wPWR8fG5ldyBiLlJlY3RhbmdsZSgwLDAsMSwxKSxhLmhhc0xvYWRlZD8odGhpcy5ub0ZyYW1lJiYoYz1uZXcgYi5SZWN0YW5nbGUoMCwwLGEud2lkdGgsYS5oZWlnaHQpKSx0aGlzLnNldEZyYW1lKGMpKTphLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkZWRcIix0aGlzLm9uQmFzZVRleHR1cmVMb2FkZWQuYmluZCh0aGlzKSl9LGIuVGV4dHVyZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5UZXh0dXJlLGIuRXZlbnRUYXJnZXQubWl4aW4oYi5UZXh0dXJlLnByb3RvdHlwZSksYi5UZXh0dXJlLnByb3RvdHlwZS5vbkJhc2VUZXh0dXJlTG9hZGVkPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5iYXNlVGV4dHVyZTthLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkZWRcIix0aGlzLm9uTG9hZGVkKSx0aGlzLm5vRnJhbWUmJih0aGlzLmZyYW1lPW5ldyBiLlJlY3RhbmdsZSgwLDAsYS53aWR0aCxhLmhlaWdodCkpLHRoaXMuc2V0RnJhbWUodGhpcy5mcmFtZSksdGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOlwidXBkYXRlXCIsY29udGVudDp0aGlzfSl9LGIuVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbihhKXthJiZ0aGlzLmJhc2VUZXh0dXJlLmRlc3Ryb3koKSx0aGlzLnZhbGlkPSExfSxiLlRleHR1cmUucHJvdG90eXBlLnNldEZyYW1lPWZ1bmN0aW9uKGEpe2lmKHRoaXMubm9GcmFtZT0hMSx0aGlzLmZyYW1lPWEsdGhpcy53aWR0aD1hLndpZHRoLHRoaXMuaGVpZ2h0PWEuaGVpZ2h0LHRoaXMuY3JvcC54PWEueCx0aGlzLmNyb3AueT1hLnksdGhpcy5jcm9wLndpZHRoPWEud2lkdGgsdGhpcy5jcm9wLmhlaWdodD1hLmhlaWdodCwhdGhpcy50cmltJiYoYS54K2Eud2lkdGg+dGhpcy5iYXNlVGV4dHVyZS53aWR0aHx8YS55K2EuaGVpZ2h0PnRoaXMuYmFzZVRleHR1cmUuaGVpZ2h0KSl0aHJvdyBuZXcgRXJyb3IoXCJUZXh0dXJlIEVycm9yOiBmcmFtZSBkb2VzIG5vdCBmaXQgaW5zaWRlIHRoZSBiYXNlIFRleHR1cmUgZGltZW5zaW9ucyBcIit0aGlzKTt0aGlzLnZhbGlkPWEmJmEud2lkdGgmJmEuaGVpZ2h0JiZ0aGlzLmJhc2VUZXh0dXJlLnNvdXJjZSYmdGhpcy5iYXNlVGV4dHVyZS5oYXNMb2FkZWQsdGhpcy50cmltJiYodGhpcy53aWR0aD10aGlzLnRyaW0ud2lkdGgsdGhpcy5oZWlnaHQ9dGhpcy50cmltLmhlaWdodCx0aGlzLmZyYW1lLndpZHRoPXRoaXMudHJpbS53aWR0aCx0aGlzLmZyYW1lLmhlaWdodD10aGlzLnRyaW0uaGVpZ2h0KSx0aGlzLnZhbGlkJiZ0aGlzLl91cGRhdGVVdnMoKX0sYi5UZXh0dXJlLnByb3RvdHlwZS5fdXBkYXRlVXZzPWZ1bmN0aW9uKCl7dGhpcy5fdXZzfHwodGhpcy5fdXZzPW5ldyBiLlRleHR1cmVVdnMpO3ZhciBhPXRoaXMuY3JvcCxjPXRoaXMuYmFzZVRleHR1cmUud2lkdGgsZD10aGlzLmJhc2VUZXh0dXJlLmhlaWdodDt0aGlzLl91dnMueDA9YS54L2MsdGhpcy5fdXZzLnkwPWEueS9kLHRoaXMuX3V2cy54MT0oYS54K2Eud2lkdGgpL2MsdGhpcy5fdXZzLnkxPWEueS9kLHRoaXMuX3V2cy54Mj0oYS54K2Eud2lkdGgpL2MsdGhpcy5fdXZzLnkyPShhLnkrYS5oZWlnaHQpL2QsdGhpcy5fdXZzLngzPWEueC9jLHRoaXMuX3V2cy55Mz0oYS55K2EuaGVpZ2h0KS9kfSxiLlRleHR1cmUuZnJvbUltYWdlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZT1iLlRleHR1cmVDYWNoZVthXTtyZXR1cm4gZXx8KGU9bmV3IGIuVGV4dHVyZShiLkJhc2VUZXh0dXJlLmZyb21JbWFnZShhLGMsZCkpLGIuVGV4dHVyZUNhY2hlW2FdPWUpLGV9LGIuVGV4dHVyZS5mcm9tRnJhbWU9ZnVuY3Rpb24oYSl7dmFyIGM9Yi5UZXh0dXJlQ2FjaGVbYV07aWYoIWMpdGhyb3cgbmV3IEVycm9yKCdUaGUgZnJhbWVJZCBcIicrYSsnXCIgZG9lcyBub3QgZXhpc3QgaW4gdGhlIHRleHR1cmUgY2FjaGUgJyk7cmV0dXJuIGN9LGIuVGV4dHVyZS5mcm9tQ2FudmFzPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9Yi5CYXNlVGV4dHVyZS5mcm9tQ2FudmFzKGEsYyk7cmV0dXJuIG5ldyBiLlRleHR1cmUoZCl9LGIuVGV4dHVyZS5hZGRUZXh0dXJlVG9DYWNoZT1mdW5jdGlvbihhLGMpe2IuVGV4dHVyZUNhY2hlW2NdPWF9LGIuVGV4dHVyZS5yZW1vdmVUZXh0dXJlRnJvbUNhY2hlPWZ1bmN0aW9uKGEpe3ZhciBjPWIuVGV4dHVyZUNhY2hlW2FdO3JldHVybiBkZWxldGUgYi5UZXh0dXJlQ2FjaGVbYV0sZGVsZXRlIGIuQmFzZVRleHR1cmVDYWNoZVthXSxjfSxiLlRleHR1cmVVdnM9ZnVuY3Rpb24oKXt0aGlzLngwPTAsdGhpcy55MD0wLHRoaXMueDE9MCx0aGlzLnkxPTAsdGhpcy54Mj0wLHRoaXMueTI9MCx0aGlzLngzPTAsdGhpcy55Mz0wfSxiLlRleHR1cmUuZW1wdHlUZXh0dXJlPW5ldyBiLlRleHR1cmUobmV3IGIuQmFzZVRleHR1cmUpLGIuUmVuZGVyVGV4dHVyZT1mdW5jdGlvbihhLGMsZCxlLGYpe2lmKHRoaXMud2lkdGg9YXx8MTAwLHRoaXMuaGVpZ2h0PWN8fDEwMCx0aGlzLnJlc29sdXRpb249Znx8MSx0aGlzLmZyYW1lPW5ldyBiLlJlY3RhbmdsZSgwLDAsdGhpcy53aWR0aCp0aGlzLnJlc29sdXRpb24sdGhpcy5oZWlnaHQqdGhpcy5yZXNvbHV0aW9uKSx0aGlzLmNyb3A9bmV3IGIuUmVjdGFuZ2xlKDAsMCx0aGlzLndpZHRoKnRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24pLHRoaXMuYmFzZVRleHR1cmU9bmV3IGIuQmFzZVRleHR1cmUsdGhpcy5iYXNlVGV4dHVyZS53aWR0aD10aGlzLndpZHRoKnRoaXMucmVzb2x1dGlvbix0aGlzLmJhc2VUZXh0dXJlLmhlaWdodD10aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24sdGhpcy5iYXNlVGV4dHVyZS5fZ2xUZXh0dXJlcz1bXSx0aGlzLmJhc2VUZXh0dXJlLnJlc29sdXRpb249dGhpcy5yZXNvbHV0aW9uLHRoaXMuYmFzZVRleHR1cmUuc2NhbGVNb2RlPWV8fGIuc2NhbGVNb2Rlcy5ERUZBVUxULHRoaXMuYmFzZVRleHR1cmUuaGFzTG9hZGVkPSEwLGIuVGV4dHVyZS5jYWxsKHRoaXMsdGhpcy5iYXNlVGV4dHVyZSxuZXcgYi5SZWN0YW5nbGUoMCwwLHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpKSx0aGlzLnJlbmRlcmVyPWR8fGIuZGVmYXVsdFJlbmRlcmVyLHRoaXMucmVuZGVyZXIudHlwZT09PWIuV0VCR0xfUkVOREVSRVIpe3ZhciBnPXRoaXMucmVuZGVyZXIuZ2w7dGhpcy5iYXNlVGV4dHVyZS5fZGlydHlbZy5pZF09ITEsdGhpcy50ZXh0dXJlQnVmZmVyPW5ldyBiLkZpbHRlclRleHR1cmUoZyx0aGlzLndpZHRoKnRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24sdGhpcy5iYXNlVGV4dHVyZS5zY2FsZU1vZGUpLHRoaXMuYmFzZVRleHR1cmUuX2dsVGV4dHVyZXNbZy5pZF09dGhpcy50ZXh0dXJlQnVmZmVyLnRleHR1cmUsdGhpcy5yZW5kZXI9dGhpcy5yZW5kZXJXZWJHTCx0aGlzLnByb2plY3Rpb249bmV3IGIuUG9pbnQoLjUqdGhpcy53aWR0aCwuNSotdGhpcy5oZWlnaHQpfWVsc2UgdGhpcy5yZW5kZXI9dGhpcy5yZW5kZXJDYW52YXMsdGhpcy50ZXh0dXJlQnVmZmVyPW5ldyBiLkNhbnZhc0J1ZmZlcih0aGlzLndpZHRoKnRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24pLHRoaXMuYmFzZVRleHR1cmUuc291cmNlPXRoaXMudGV4dHVyZUJ1ZmZlci5jYW52YXM7dGhpcy52YWxpZD0hMCx0aGlzLl91cGRhdGVVdnMoKX0sYi5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuVGV4dHVyZS5wcm90b3R5cGUpLGIuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5SZW5kZXJUZXh0dXJlLGIuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUucmVzaXplPWZ1bmN0aW9uKGEsYyxkKXsoYSE9PXRoaXMud2lkdGh8fGMhPT10aGlzLmhlaWdodCkmJih0aGlzLnZhbGlkPWE+MCYmYz4wLHRoaXMud2lkdGg9dGhpcy5mcmFtZS53aWR0aD10aGlzLmNyb3Aud2lkdGg9YSx0aGlzLmhlaWdodD10aGlzLmZyYW1lLmhlaWdodD10aGlzLmNyb3AuaGVpZ2h0PWMsZCYmKHRoaXMuYmFzZVRleHR1cmUud2lkdGg9dGhpcy53aWR0aCx0aGlzLmJhc2VUZXh0dXJlLmhlaWdodD10aGlzLmhlaWdodCksdGhpcy5yZW5kZXJlci50eXBlPT09Yi5XRUJHTF9SRU5ERVJFUiYmKHRoaXMucHJvamVjdGlvbi54PXRoaXMud2lkdGgvMix0aGlzLnByb2plY3Rpb24ueT0tdGhpcy5oZWlnaHQvMiksdGhpcy52YWxpZCYmdGhpcy50ZXh0dXJlQnVmZmVyLnJlc2l6ZSh0aGlzLndpZHRoKnRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24pKX0sYi5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMudmFsaWQmJih0aGlzLnJlbmRlcmVyLnR5cGU9PT1iLldFQkdMX1JFTkRFUkVSJiZ0aGlzLnJlbmRlcmVyLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLnJlbmRlcmVyLmdsLkZSQU1FQlVGRkVSLHRoaXMudGV4dHVyZUJ1ZmZlci5mcmFtZUJ1ZmZlciksdGhpcy50ZXh0dXJlQnVmZmVyLmNsZWFyKCkpfSxiLlJlbmRlclRleHR1cmUucHJvdG90eXBlLnJlbmRlcldlYkdMPWZ1bmN0aW9uKGEsYixjKXtpZih0aGlzLnZhbGlkKXt2YXIgZD1hLndvcmxkVHJhbnNmb3JtO2QuaWRlbnRpdHkoKSxkLnRyYW5zbGF0ZSgwLDIqdGhpcy5wcm9qZWN0aW9uLnkpLGImJmQuYXBwZW5kKGIpLGQuc2NhbGUoMSwtMSksYS53b3JsZEFscGhhPTE7Zm9yKHZhciBlPWEuY2hpbGRyZW4sZj0wLGc9ZS5sZW5ndGg7Zz5mO2YrKyllW2ZdLnVwZGF0ZVRyYW5zZm9ybSgpO3ZhciBoPXRoaXMucmVuZGVyZXIuZ2w7aC52aWV3cG9ydCgwLDAsdGhpcy53aWR0aCp0aGlzLnJlc29sdXRpb24sdGhpcy5oZWlnaHQqdGhpcy5yZXNvbHV0aW9uKSxoLmJpbmRGcmFtZWJ1ZmZlcihoLkZSQU1FQlVGRkVSLHRoaXMudGV4dHVyZUJ1ZmZlci5mcmFtZUJ1ZmZlciksYyYmdGhpcy50ZXh0dXJlQnVmZmVyLmNsZWFyKCksdGhpcy5yZW5kZXJlci5zcHJpdGVCYXRjaC5kaXJ0eT0hMCx0aGlzLnJlbmRlcmVyLnJlbmRlckRpc3BsYXlPYmplY3QoYSx0aGlzLnByb2plY3Rpb24sdGhpcy50ZXh0dXJlQnVmZmVyLmZyYW1lQnVmZmVyKSx0aGlzLnJlbmRlcmVyLnNwcml0ZUJhdGNoLmRpcnR5PSEwfX0sYi5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5yZW5kZXJDYW52YXM9ZnVuY3Rpb24oYSxiLGMpe2lmKHRoaXMudmFsaWQpe3ZhciBkPWEud29ybGRUcmFuc2Zvcm07ZC5pZGVudGl0eSgpLGImJmQuYXBwZW5kKGIpLGEud29ybGRBbHBoYT0xO2Zvcih2YXIgZT1hLmNoaWxkcmVuLGY9MCxnPWUubGVuZ3RoO2c+ZjtmKyspZVtmXS51cGRhdGVUcmFuc2Zvcm0oKTtjJiZ0aGlzLnRleHR1cmVCdWZmZXIuY2xlYXIoKTt2YXIgaD10aGlzLnRleHR1cmVCdWZmZXIuY29udGV4dCxpPXRoaXMucmVuZGVyZXIucmVzb2x1dGlvbjt0aGlzLnJlbmRlcmVyLnJlc29sdXRpb249dGhpcy5yZXNvbHV0aW9uLHRoaXMucmVuZGVyZXIucmVuZGVyRGlzcGxheU9iamVjdChhLGgpLHRoaXMucmVuZGVyZXIucmVzb2x1dGlvbj1pfX0sYi5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5nZXRJbWFnZT1mdW5jdGlvbigpe3ZhciBhPW5ldyBJbWFnZTtyZXR1cm4gYS5zcmM9dGhpcy5nZXRCYXNlNjQoKSxhfSxiLlJlbmRlclRleHR1cmUucHJvdG90eXBlLmdldEJhc2U2ND1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdldENhbnZhcygpLnRvRGF0YVVSTCgpfSxiLlJlbmRlclRleHR1cmUucHJvdG90eXBlLmdldENhbnZhcz1mdW5jdGlvbigpe2lmKHRoaXMucmVuZGVyZXIudHlwZT09PWIuV0VCR0xfUkVOREVSRVIpe3ZhciBhPXRoaXMucmVuZGVyZXIuZ2wsYz10aGlzLnRleHR1cmVCdWZmZXIud2lkdGgsZD10aGlzLnRleHR1cmVCdWZmZXIuaGVpZ2h0LGU9bmV3IFVpbnQ4QXJyYXkoNCpjKmQpO2EuYmluZEZyYW1lYnVmZmVyKGEuRlJBTUVCVUZGRVIsdGhpcy50ZXh0dXJlQnVmZmVyLmZyYW1lQnVmZmVyKSxhLnJlYWRQaXhlbHMoMCwwLGMsZCxhLlJHQkEsYS5VTlNJR05FRF9CWVRFLGUpLGEuYmluZEZyYW1lYnVmZmVyKGEuRlJBTUVCVUZGRVIsbnVsbCk7dmFyIGY9bmV3IGIuQ2FudmFzQnVmZmVyKGMsZCksZz1mLmNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsMCxjLGQpO3JldHVybiBnLmRhdGEuc2V0KGUpLGYuY29udGV4dC5wdXRJbWFnZURhdGEoZywwLDApLGYuY2FudmFzfXJldHVybiB0aGlzLnRleHR1cmVCdWZmZXIuY2FudmFzfSxiLlJlbmRlclRleHR1cmUudGVtcE1hdHJpeD1uZXcgYi5NYXRyaXgsYi5WaWRlb1RleHR1cmU9ZnVuY3Rpb24oYSxjKXtpZighYSl0aHJvdyBuZXcgRXJyb3IoXCJObyB2aWRlbyBzb3VyY2UgZWxlbWVudCBzcGVjaWZpZWQuXCIpOyhhLnJlYWR5U3RhdGU9PT1hLkhBVkVfRU5PVUdIX0RBVEF8fGEucmVhZHlTdGF0ZT09PWEuSEFWRV9GVVRVUkVfREFUQSkmJmEud2lkdGgmJmEuaGVpZ2h0JiYoYS5jb21wbGV0ZT0hMCksYi5CYXNlVGV4dHVyZS5jYWxsKHRoaXMsYSxjKSx0aGlzLmF1dG9VcGRhdGU9ITEsdGhpcy51cGRhdGVCb3VuZD10aGlzLl9vblVwZGF0ZS5iaW5kKHRoaXMpLGEuY29tcGxldGV8fCh0aGlzLl9vbkNhblBsYXk9dGhpcy5vbkNhblBsYXkuYmluZCh0aGlzKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5wbGF5XCIsdGhpcy5fb25DYW5QbGF5KSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5wbGF5dGhyb3VnaFwiLHRoaXMuX29uQ2FuUGxheSksYS5hZGRFdmVudExpc3RlbmVyKFwicGxheVwiLHRoaXMub25QbGF5U3RhcnQuYmluZCh0aGlzKSksYS5hZGRFdmVudExpc3RlbmVyKFwicGF1c2VcIix0aGlzLm9uUGxheVN0b3AuYmluZCh0aGlzKSkpXG59LGIuVmlkZW9UZXh0dXJlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQmFzZVRleHR1cmUucHJvdG90eXBlKSxiLlZpZGVvVGV4dHVyZS5jb25zdHJ1Y3Rvcj1iLlZpZGVvVGV4dHVyZSxiLlZpZGVvVGV4dHVyZS5wcm90b3R5cGUuX29uVXBkYXRlPWZ1bmN0aW9uKCl7dGhpcy5hdXRvVXBkYXRlJiYod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZUJvdW5kKSx0aGlzLmRpcnR5KCkpfSxiLlZpZGVvVGV4dHVyZS5wcm90b3R5cGUub25QbGF5U3RhcnQ9ZnVuY3Rpb24oKXt0aGlzLmF1dG9VcGRhdGV8fCh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlQm91bmQpLHRoaXMuYXV0b1VwZGF0ZT0hMCl9LGIuVmlkZW9UZXh0dXJlLnByb3RvdHlwZS5vblBsYXlTdG9wPWZ1bmN0aW9uKCl7dGhpcy5hdXRvVXBkYXRlPSExfSxiLlZpZGVvVGV4dHVyZS5wcm90b3R5cGUub25DYW5QbGF5PWZ1bmN0aW9uKCl7XCJjYW5wbGF5dGhyb3VnaFwiPT09ZXZlbnQudHlwZSYmKHRoaXMuaGFzTG9hZGVkPSEwLHRoaXMuc291cmNlJiYodGhpcy5zb3VyY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNhbnBsYXlcIix0aGlzLl9vbkNhblBsYXkpLHRoaXMuc291cmNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjYW5wbGF5dGhyb3VnaFwiLHRoaXMuX29uQ2FuUGxheSksdGhpcy53aWR0aD10aGlzLnNvdXJjZS52aWRlb1dpZHRoLHRoaXMuaGVpZ2h0PXRoaXMuc291cmNlLnZpZGVvSGVpZ2h0LHRoaXMuX19sb2FkZWR8fCh0aGlzLl9fbG9hZGVkPSEwLHRoaXMuZGlzcGF0Y2hFdmVudCh7dHlwZTpcImxvYWRlZFwiLGNvbnRlbnQ6dGhpc30pKSkpfSxiLlZpZGVvVGV4dHVyZS5iYXNlVGV4dHVyZUZyb21WaWRlbz1mdW5jdGlvbihhLGMpe2EuX3BpeGlJZHx8KGEuX3BpeGlJZD1cInZpZGVvX1wiK2IuVGV4dHVyZUNhY2hlSWRHZW5lcmF0b3IrKyk7dmFyIGQ9Yi5CYXNlVGV4dHVyZUNhY2hlW2EuX3BpeGlJZF07cmV0dXJuIGR8fChkPW5ldyBiLlZpZGVvVGV4dHVyZShhLGMpLGIuQmFzZVRleHR1cmVDYWNoZVthLl9waXhpSWRdPWQpLGR9LGIuVmlkZW9UZXh0dXJlLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5zb3VyY2UmJnRoaXMuc291cmNlLl9waXhpSWQmJihiLkJhc2VUZXh0dXJlQ2FjaGVbdGhpcy5zb3VyY2UuX3BpeGlJZF09bnVsbCxkZWxldGUgYi5CYXNlVGV4dHVyZUNhY2hlW3RoaXMuc291cmNlLl9waXhpSWRdLHRoaXMuc291cmNlLl9waXhpSWQ9bnVsbCxkZWxldGUgdGhpcy5zb3VyY2UuX3BpeGlJZCksYi5CYXNlVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpfSxiLlZpZGVvVGV4dHVyZS50ZXh0dXJlRnJvbVZpZGVvPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9Yi5WaWRlb1RleHR1cmUuYmFzZVRleHR1cmVGcm9tVmlkZW8oYSxjKTtyZXR1cm4gbmV3IGIuVGV4dHVyZShkKX0sYi5WaWRlb1RleHR1cmUuZnJvbVVybD1mdW5jdGlvbihhLGMpe3ZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ2aWRlb1wiKTtyZXR1cm4gZC5zcmM9YSxkLmF1dG9QbGF5PSEwLGQucGxheSgpLGIuVmlkZW9UZXh0dXJlLnRleHR1cmVGcm9tVmlkZW8oZCxjKX0sYi5Bc3NldExvYWRlcj1mdW5jdGlvbihhLGMpe3RoaXMuYXNzZXRVUkxzPWEsdGhpcy5jcm9zc29yaWdpbj1jLHRoaXMubG9hZGVyc0J5VHlwZT17anBnOmIuSW1hZ2VMb2FkZXIsanBlZzpiLkltYWdlTG9hZGVyLHBuZzpiLkltYWdlTG9hZGVyLGdpZjpiLkltYWdlTG9hZGVyLHdlYnA6Yi5JbWFnZUxvYWRlcixqc29uOmIuSnNvbkxvYWRlcixhdGxhczpiLkF0bGFzTG9hZGVyLGFuaW06Yi5TcGluZUxvYWRlcix4bWw6Yi5CaXRtYXBGb250TG9hZGVyLGZudDpiLkJpdG1hcEZvbnRMb2FkZXJ9fSxiLkV2ZW50VGFyZ2V0Lm1peGluKGIuQXNzZXRMb2FkZXIucHJvdG90eXBlKSxiLkFzc2V0TG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkFzc2V0TG9hZGVyLGIuQXNzZXRMb2FkZXIucHJvdG90eXBlLl9nZXREYXRhVHlwZT1mdW5jdGlvbihhKXt2YXIgYj1cImRhdGE6XCIsYz1hLnNsaWNlKDAsYi5sZW5ndGgpLnRvTG93ZXJDYXNlKCk7aWYoYz09PWIpe3ZhciBkPWEuc2xpY2UoYi5sZW5ndGgpLGU9ZC5pbmRleE9mKFwiLFwiKTtpZigtMT09PWUpcmV0dXJuIG51bGw7dmFyIGY9ZC5zbGljZSgwLGUpLnNwbGl0KFwiO1wiKVswXTtyZXR1cm4gZiYmXCJ0ZXh0L3BsYWluXCIhPT1mLnRvTG93ZXJDYXNlKCk/Zi5zcGxpdChcIi9cIikucG9wKCkudG9Mb3dlckNhc2UoKTpcInR4dFwifXJldHVybiBudWxsfSxiLkFzc2V0TG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhKXtiLm9uQXNzZXRMb2FkZWQoYS5kYXRhLmNvbnRlbnQpfXZhciBiPXRoaXM7dGhpcy5sb2FkQ291bnQ9dGhpcy5hc3NldFVSTHMubGVuZ3RoO2Zvcih2YXIgYz0wO2M8dGhpcy5hc3NldFVSTHMubGVuZ3RoO2MrKyl7dmFyIGQ9dGhpcy5hc3NldFVSTHNbY10sZT10aGlzLl9nZXREYXRhVHlwZShkKTtlfHwoZT1kLnNwbGl0KFwiP1wiKS5zaGlmdCgpLnNwbGl0KFwiLlwiKS5wb3AoKS50b0xvd2VyQ2FzZSgpKTt2YXIgZj10aGlzLmxvYWRlcnNCeVR5cGVbZV07aWYoIWYpdGhyb3cgbmV3IEVycm9yKGUrXCIgaXMgYW4gdW5zdXBwb3J0ZWQgZmlsZSB0eXBlXCIpO3ZhciBnPW5ldyBmKGQsdGhpcy5jcm9zc29yaWdpbik7Zy5vbihcImxvYWRlZFwiLGEpLGcubG9hZCgpfX0sYi5Bc3NldExvYWRlci5wcm90b3R5cGUub25Bc3NldExvYWRlZD1mdW5jdGlvbihhKXt0aGlzLmxvYWRDb3VudC0tLHRoaXMuZW1pdChcIm9uUHJvZ3Jlc3NcIix7Y29udGVudDp0aGlzLGxvYWRlcjphfSksdGhpcy5vblByb2dyZXNzJiZ0aGlzLm9uUHJvZ3Jlc3MoYSksdGhpcy5sb2FkQ291bnR8fCh0aGlzLmVtaXQoXCJvbkNvbXBsZXRlXCIse2NvbnRlbnQ6dGhpc30pLHRoaXMub25Db21wbGV0ZSYmdGhpcy5vbkNvbXBsZXRlKCkpfSxiLkpzb25Mb2FkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLnVybD1hLHRoaXMuY3Jvc3NvcmlnaW49Yix0aGlzLmJhc2VVcmw9YS5yZXBsYWNlKC9bXlxcL10qJC8sXCJcIiksdGhpcy5sb2FkZWQ9ITF9LGIuSnNvbkxvYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Kc29uTG9hZGVyLGIuRXZlbnRUYXJnZXQubWl4aW4oYi5Kc29uTG9hZGVyLnByb3RvdHlwZSksYi5Kc29uTG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7d2luZG93LlhEb21haW5SZXF1ZXN0JiZ0aGlzLmNyb3Nzb3JpZ2luPyh0aGlzLmFqYXhSZXF1ZXN0PW5ldyB3aW5kb3cuWERvbWFpblJlcXVlc3QsdGhpcy5hamF4UmVxdWVzdC50aW1lb3V0PTNlMyx0aGlzLmFqYXhSZXF1ZXN0Lm9uZXJyb3I9dGhpcy5vbkVycm9yLmJpbmQodGhpcyksdGhpcy5hamF4UmVxdWVzdC5vbnRpbWVvdXQ9dGhpcy5vbkVycm9yLmJpbmQodGhpcyksdGhpcy5hamF4UmVxdWVzdC5vbnByb2dyZXNzPWZ1bmN0aW9uKCl7fSk6dGhpcy5hamF4UmVxdWVzdD13aW5kb3cuWE1MSHR0cFJlcXVlc3Q/bmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdDpuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKSx0aGlzLmFqYXhSZXF1ZXN0Lm9ubG9hZD10aGlzLm9uSlNPTkxvYWRlZC5iaW5kKHRoaXMpLHRoaXMuYWpheFJlcXVlc3Qub3BlbihcIkdFVFwiLHRoaXMudXJsLCEwKSx0aGlzLmFqYXhSZXF1ZXN0LnNlbmQoKX0sYi5Kc29uTG9hZGVyLnByb3RvdHlwZS5vbkpTT05Mb2FkZWQ9ZnVuY3Rpb24oKXtpZighdGhpcy5hamF4UmVxdWVzdC5yZXNwb25zZVRleHQpcmV0dXJuIHRoaXMub25FcnJvcigpLHZvaWQgMDtpZih0aGlzLmpzb249SlNPTi5wYXJzZSh0aGlzLmFqYXhSZXF1ZXN0LnJlc3BvbnNlVGV4dCksdGhpcy5qc29uLmZyYW1lcyl7dmFyIGE9dGhpcy5iYXNlVXJsK3RoaXMuanNvbi5tZXRhLmltYWdlLGQ9bmV3IGIuSW1hZ2VMb2FkZXIoYSx0aGlzLmNyb3Nzb3JpZ2luKSxlPXRoaXMuanNvbi5mcmFtZXM7dGhpcy50ZXh0dXJlPWQudGV4dHVyZS5iYXNlVGV4dHVyZSxkLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkZWRcIix0aGlzLm9uTG9hZGVkLmJpbmQodGhpcykpO2Zvcih2YXIgZiBpbiBlKXt2YXIgZz1lW2ZdLmZyYW1lO2lmKGcpe3ZhciBoPW5ldyBiLlJlY3RhbmdsZShnLngsZy55LGcudyxnLmgpLGk9aC5jbG9uZSgpLGo9bnVsbDtpZihlW2ZdLnRyaW1tZWQpe3ZhciBrPWVbZl0uc291cmNlU2l6ZSxsPWVbZl0uc3ByaXRlU291cmNlU2l6ZTtqPW5ldyBiLlJlY3RhbmdsZShsLngsbC55LGsudyxrLmgpfWIuVGV4dHVyZUNhY2hlW2ZdPW5ldyBiLlRleHR1cmUodGhpcy50ZXh0dXJlLGgsaSxqKX19ZC5sb2FkKCl9ZWxzZSBpZih0aGlzLmpzb24uYm9uZXMpe3ZhciBtPW5ldyBjLlNrZWxldG9uSnNvbixuPW0ucmVhZFNrZWxldG9uRGF0YSh0aGlzLmpzb24pO2IuQW5pbUNhY2hlW3RoaXMudXJsXT1uLHRoaXMub25Mb2FkZWQoKX1lbHNlIHRoaXMub25Mb2FkZWQoKX0sYi5Kc29uTG9hZGVyLnByb3RvdHlwZS5vbkxvYWRlZD1mdW5jdGlvbigpe3RoaXMubG9hZGVkPSEwLHRoaXMuZGlzcGF0Y2hFdmVudCh7dHlwZTpcImxvYWRlZFwiLGNvbnRlbnQ6dGhpc30pfSxiLkpzb25Mb2FkZXIucHJvdG90eXBlLm9uRXJyb3I9ZnVuY3Rpb24oKXt0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6XCJlcnJvclwiLGNvbnRlbnQ6dGhpc30pfSxiLkF0bGFzTG9hZGVyPWZ1bmN0aW9uKGEsYil7dGhpcy51cmw9YSx0aGlzLmJhc2VVcmw9YS5yZXBsYWNlKC9bXlxcL10qJC8sXCJcIiksdGhpcy5jcm9zc29yaWdpbj1iLHRoaXMubG9hZGVkPSExfSxiLkF0bGFzTG9hZGVyLmNvbnN0cnVjdG9yPWIuQXRsYXNMb2FkZXIsYi5FdmVudFRhcmdldC5taXhpbihiLkF0bGFzTG9hZGVyLnByb3RvdHlwZSksYi5BdGxhc0xvYWRlci5wcm90b3R5cGUubG9hZD1mdW5jdGlvbigpe3RoaXMuYWpheFJlcXVlc3Q9bmV3IGIuQWpheFJlcXVlc3QsdGhpcy5hamF4UmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2U9dGhpcy5vbkF0bGFzTG9hZGVkLmJpbmQodGhpcyksdGhpcy5hamF4UmVxdWVzdC5vcGVuKFwiR0VUXCIsdGhpcy51cmwsITApLHRoaXMuYWpheFJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZSYmdGhpcy5hamF4UmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlKFwiYXBwbGljYXRpb24vanNvblwiKSx0aGlzLmFqYXhSZXF1ZXN0LnNlbmQobnVsbCl9LGIuQXRsYXNMb2FkZXIucHJvdG90eXBlLm9uQXRsYXNMb2FkZWQ9ZnVuY3Rpb24oKXtpZig0PT09dGhpcy5hamF4UmVxdWVzdC5yZWFkeVN0YXRlKWlmKDIwMD09PXRoaXMuYWpheFJlcXVlc3Quc3RhdHVzfHwtMT09PXdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoXCJodHRwXCIpKXt0aGlzLmF0bGFzPXttZXRhOntpbWFnZTpbXX0sZnJhbWVzOltdfTt2YXIgYT10aGlzLmFqYXhSZXF1ZXN0LnJlc3BvbnNlVGV4dC5zcGxpdCgvXFxyP1xcbi8pLGM9LTMsZD0wLGU9bnVsbCxmPSExLGc9MCxoPTAsaT10aGlzLm9uTG9hZGVkLmJpbmQodGhpcyk7Zm9yKGc9MDtnPGEubGVuZ3RoO2crKylpZihhW2ddPWFbZ10ucmVwbGFjZSgvXlxccyt8XFxzKyQvZyxcIlwiKSxcIlwiPT09YVtnXSYmKGY9ZysxKSxhW2ddLmxlbmd0aD4wKXtpZihmPT09Zyl0aGlzLmF0bGFzLm1ldGEuaW1hZ2UucHVzaChhW2ddKSxkPXRoaXMuYXRsYXMubWV0YS5pbWFnZS5sZW5ndGgtMSx0aGlzLmF0bGFzLmZyYW1lcy5wdXNoKHt9KSxjPS0zO2Vsc2UgaWYoYz4wKWlmKGMlNz09PTEpbnVsbCE9ZSYmKHRoaXMuYXRsYXMuZnJhbWVzW2RdW2UubmFtZV09ZSksZT17bmFtZTphW2ddLGZyYW1lOnt9fTtlbHNle3ZhciBqPWFbZ10uc3BsaXQoXCIgXCIpO2lmKGMlNz09PTMpZS5mcmFtZS54PU51bWJlcihqWzFdLnJlcGxhY2UoXCIsXCIsXCJcIikpLGUuZnJhbWUueT1OdW1iZXIoalsyXSk7ZWxzZSBpZihjJTc9PT00KWUuZnJhbWUudz1OdW1iZXIoalsxXS5yZXBsYWNlKFwiLFwiLFwiXCIpKSxlLmZyYW1lLmg9TnVtYmVyKGpbMl0pO2Vsc2UgaWYoYyU3PT09NSl7dmFyIGs9e3g6MCx5OjAsdzpOdW1iZXIoalsxXS5yZXBsYWNlKFwiLFwiLFwiXCIpKSxoOk51bWJlcihqWzJdKX07ay53PmUuZnJhbWUud3x8ay5oPmUuZnJhbWUuaD8oZS50cmltbWVkPSEwLGUucmVhbFNpemU9ayk6ZS50cmltbWVkPSExfX1jKyt9aWYobnVsbCE9ZSYmKHRoaXMuYXRsYXMuZnJhbWVzW2RdW2UubmFtZV09ZSksdGhpcy5hdGxhcy5tZXRhLmltYWdlLmxlbmd0aD4wKXtmb3IodGhpcy5pbWFnZXM9W10saD0wO2g8dGhpcy5hdGxhcy5tZXRhLmltYWdlLmxlbmd0aDtoKyspe3ZhciBsPXRoaXMuYmFzZVVybCt0aGlzLmF0bGFzLm1ldGEuaW1hZ2VbaF0sbT10aGlzLmF0bGFzLmZyYW1lc1toXTt0aGlzLmltYWdlcy5wdXNoKG5ldyBiLkltYWdlTG9hZGVyKGwsdGhpcy5jcm9zc29yaWdpbikpO2ZvcihnIGluIG0pe3ZhciBuPW1bZ10uZnJhbWU7biYmKGIuVGV4dHVyZUNhY2hlW2ddPW5ldyBiLlRleHR1cmUodGhpcy5pbWFnZXNbaF0udGV4dHVyZS5iYXNlVGV4dHVyZSx7eDpuLngseTpuLnksd2lkdGg6bi53LGhlaWdodDpuLmh9KSxtW2ddLnRyaW1tZWQmJihiLlRleHR1cmVDYWNoZVtnXS5yZWFsU2l6ZT1tW2ddLnJlYWxTaXplLGIuVGV4dHVyZUNhY2hlW2ddLnRyaW0ueD0wLGIuVGV4dHVyZUNhY2hlW2ddLnRyaW0ueT0wKSl9fWZvcih0aGlzLmN1cnJlbnRJbWFnZUlkPTAsaD0wO2g8dGhpcy5pbWFnZXMubGVuZ3RoO2grKyl0aGlzLmltYWdlc1toXS5vbihcImxvYWRlZFwiLGkpO3RoaXMuaW1hZ2VzW3RoaXMuY3VycmVudEltYWdlSWRdLmxvYWQoKX1lbHNlIHRoaXMub25Mb2FkZWQoKX1lbHNlIHRoaXMub25FcnJvcigpfSxiLkF0bGFzTG9hZGVyLnByb3RvdHlwZS5vbkxvYWRlZD1mdW5jdGlvbigpe3RoaXMuaW1hZ2VzLmxlbmd0aC0xPnRoaXMuY3VycmVudEltYWdlSWQ/KHRoaXMuY3VycmVudEltYWdlSWQrKyx0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJbWFnZUlkXS5sb2FkKCkpOih0aGlzLmxvYWRlZD0hMCx0aGlzLmVtaXQoXCJsb2FkZWRcIix7Y29udGVudDp0aGlzfSkpfSxiLkF0bGFzTG9hZGVyLnByb3RvdHlwZS5vbkVycm9yPWZ1bmN0aW9uKCl7dGhpcy5lbWl0KFwiZXJyb3JcIix7Y29udGVudDp0aGlzfSl9LGIuU3ByaXRlU2hlZXRMb2FkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLnVybD1hLHRoaXMuY3Jvc3NvcmlnaW49Yix0aGlzLmJhc2VVcmw9YS5yZXBsYWNlKC9bXlxcL10qJC8sXCJcIiksdGhpcy50ZXh0dXJlPW51bGwsdGhpcy5mcmFtZXM9e319LGIuU3ByaXRlU2hlZXRMb2FkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuU3ByaXRlU2hlZXRMb2FkZXIsYi5FdmVudFRhcmdldC5taXhpbihiLlNwcml0ZVNoZWV0TG9hZGVyLnByb3RvdHlwZSksYi5TcHJpdGVTaGVldExvYWRlci5wcm90b3R5cGUubG9hZD1mdW5jdGlvbigpe3ZhciBhPXRoaXMsYz1uZXcgYi5Kc29uTG9hZGVyKHRoaXMudXJsLHRoaXMuY3Jvc3NvcmlnaW4pO2Mub24oXCJsb2FkZWRcIixmdW5jdGlvbihiKXthLmpzb249Yi5kYXRhLmNvbnRlbnQuanNvbixhLm9uTG9hZGVkKCl9KSxjLmxvYWQoKX0sYi5TcHJpdGVTaGVldExvYWRlci5wcm90b3R5cGUub25Mb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLmVtaXQoXCJsb2FkZWRcIix7Y29udGVudDp0aGlzfSl9LGIuSW1hZ2VMb2FkZXI9ZnVuY3Rpb24oYSxjKXt0aGlzLnRleHR1cmU9Yi5UZXh0dXJlLmZyb21JbWFnZShhLGMpLHRoaXMuZnJhbWVzPVtdfSxiLkltYWdlTG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkltYWdlTG9hZGVyLGIuRXZlbnRUYXJnZXQubWl4aW4oYi5JbWFnZUxvYWRlci5wcm90b3R5cGUpLGIuSW1hZ2VMb2FkZXIucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuaGFzTG9hZGVkP3RoaXMub25Mb2FkZWQoKTp0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUub24oXCJsb2FkZWRcIix0aGlzLm9uTG9hZGVkLmJpbmQodGhpcykpfSxiLkltYWdlTG9hZGVyLnByb3RvdHlwZS5vbkxvYWRlZD1mdW5jdGlvbigpe3RoaXMuZW1pdChcImxvYWRlZFwiLHtjb250ZW50OnRoaXN9KX0sYi5JbWFnZUxvYWRlci5wcm90b3R5cGUubG9hZEZyYW1lZFNwcml0ZVNoZWV0PWZ1bmN0aW9uKGEsYyxkKXt0aGlzLmZyYW1lcz1bXTtmb3IodmFyIGU9TWF0aC5mbG9vcih0aGlzLnRleHR1cmUud2lkdGgvYSksZj1NYXRoLmZsb29yKHRoaXMudGV4dHVyZS5oZWlnaHQvYyksZz0wLGg9MDtmPmg7aCsrKWZvcih2YXIgaT0wO2U+aTtpKyssZysrKXt2YXIgaj1uZXcgYi5UZXh0dXJlKHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZSx7eDppKmEseTpoKmMsd2lkdGg6YSxoZWlnaHQ6Y30pO3RoaXMuZnJhbWVzLnB1c2goaiksZCYmKGIuVGV4dHVyZUNhY2hlW2QrXCItXCIrZ109ail9dGhpcy5sb2FkKCl9LGIuQml0bWFwRm9udExvYWRlcj1mdW5jdGlvbihhLGIpe3RoaXMudXJsPWEsdGhpcy5jcm9zc29yaWdpbj1iLHRoaXMuYmFzZVVybD1hLnJlcGxhY2UoL1teXFwvXSokLyxcIlwiKSx0aGlzLnRleHR1cmU9bnVsbH0sYi5CaXRtYXBGb250TG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkJpdG1hcEZvbnRMb2FkZXIsYi5FdmVudFRhcmdldC5taXhpbihiLkJpdG1hcEZvbnRMb2FkZXIucHJvdG90eXBlKSxiLkJpdG1hcEZvbnRMb2FkZXIucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmFqYXhSZXF1ZXN0PW5ldyBiLkFqYXhSZXF1ZXN0LHRoaXMuYWpheFJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlPXRoaXMub25YTUxMb2FkZWQuYmluZCh0aGlzKSx0aGlzLmFqYXhSZXF1ZXN0Lm9wZW4oXCJHRVRcIix0aGlzLnVybCwhMCksdGhpcy5hamF4UmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlJiZ0aGlzLmFqYXhSZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoXCJhcHBsaWNhdGlvbi94bWxcIiksdGhpcy5hamF4UmVxdWVzdC5zZW5kKG51bGwpfSxiLkJpdG1hcEZvbnRMb2FkZXIucHJvdG90eXBlLm9uWE1MTG9hZGVkPWZ1bmN0aW9uKCl7aWYoND09PXRoaXMuYWpheFJlcXVlc3QucmVhZHlTdGF0ZSYmKDIwMD09PXRoaXMuYWpheFJlcXVlc3Quc3RhdHVzfHwtMT09PXdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbC5pbmRleE9mKFwiaHR0cFwiKSkpe3ZhciBhPXRoaXMuYWpheFJlcXVlc3QucmVzcG9uc2VYTUw7aWYoIWF8fC9NU0lFIDkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpfHxuYXZpZ2F0b3IuaXNDb2Nvb25KUylpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiB3aW5kb3cuRE9NUGFyc2VyKXt2YXIgYz1uZXcgRE9NUGFyc2VyO2E9Yy5wYXJzZUZyb21TdHJpbmcodGhpcy5hamF4UmVxdWVzdC5yZXNwb25zZVRleHQsXCJ0ZXh0L3htbFwiKX1lbHNle3ZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZC5pbm5lckhUTUw9dGhpcy5hamF4UmVxdWVzdC5yZXNwb25zZVRleHQsYT1kfXZhciBlPXRoaXMuYmFzZVVybCthLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGFnZVwiKVswXS5nZXRBdHRyaWJ1dGUoXCJmaWxlXCIpLGY9bmV3IGIuSW1hZ2VMb2FkZXIoZSx0aGlzLmNyb3Nzb3JpZ2luKTt0aGlzLnRleHR1cmU9Zi50ZXh0dXJlLmJhc2VUZXh0dXJlO3ZhciBnPXt9LGg9YS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImluZm9cIilbMF0saT1hLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY29tbW9uXCIpWzBdO2cuZm9udD1oLmdldEF0dHJpYnV0ZShcImZhY2VcIiksZy5zaXplPXBhcnNlSW50KGguZ2V0QXR0cmlidXRlKFwic2l6ZVwiKSwxMCksZy5saW5lSGVpZ2h0PXBhcnNlSW50KGkuZ2V0QXR0cmlidXRlKFwibGluZUhlaWdodFwiKSwxMCksZy5jaGFycz17fTtmb3IodmFyIGo9YS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNoYXJcIiksaz0wO2s8ai5sZW5ndGg7aysrKXt2YXIgbD1wYXJzZUludChqW2tdLmdldEF0dHJpYnV0ZShcImlkXCIpLDEwKSxtPW5ldyBiLlJlY3RhbmdsZShwYXJzZUludChqW2tdLmdldEF0dHJpYnV0ZShcInhcIiksMTApLHBhcnNlSW50KGpba10uZ2V0QXR0cmlidXRlKFwieVwiKSwxMCkscGFyc2VJbnQoaltrXS5nZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiKSwxMCkscGFyc2VJbnQoaltrXS5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiksMTApKTtnLmNoYXJzW2xdPXt4T2Zmc2V0OnBhcnNlSW50KGpba10uZ2V0QXR0cmlidXRlKFwieG9mZnNldFwiKSwxMCkseU9mZnNldDpwYXJzZUludChqW2tdLmdldEF0dHJpYnV0ZShcInlvZmZzZXRcIiksMTApLHhBZHZhbmNlOnBhcnNlSW50KGpba10uZ2V0QXR0cmlidXRlKFwieGFkdmFuY2VcIiksMTApLGtlcm5pbmc6e30sdGV4dHVyZTpiLlRleHR1cmVDYWNoZVtsXT1uZXcgYi5UZXh0dXJlKHRoaXMudGV4dHVyZSxtKX19dmFyIG49YS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImtlcm5pbmdcIik7Zm9yKGs9MDtrPG4ubGVuZ3RoO2srKyl7dmFyIG89cGFyc2VJbnQobltrXS5nZXRBdHRyaWJ1dGUoXCJmaXJzdFwiKSwxMCkscD1wYXJzZUludChuW2tdLmdldEF0dHJpYnV0ZShcInNlY29uZFwiKSwxMCkscT1wYXJzZUludChuW2tdLmdldEF0dHJpYnV0ZShcImFtb3VudFwiKSwxMCk7Zy5jaGFyc1twXS5rZXJuaW5nW29dPXF9Yi5CaXRtYXBUZXh0LmZvbnRzW2cuZm9udF09ZyxmLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkZWRcIix0aGlzLm9uTG9hZGVkLmJpbmQodGhpcykpLGYubG9hZCgpfX0sYi5CaXRtYXBGb250TG9hZGVyLnByb3RvdHlwZS5vbkxvYWRlZD1mdW5jdGlvbigpe3RoaXMuZW1pdChcImxvYWRlZFwiLHtjb250ZW50OnRoaXN9KX0sYi5TcGluZUxvYWRlcj1mdW5jdGlvbihhLGIpe3RoaXMudXJsPWEsdGhpcy5jcm9zc29yaWdpbj1iLHRoaXMubG9hZGVkPSExfSxiLlNwaW5lTG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlNwaW5lTG9hZGVyLGIuRXZlbnRUYXJnZXQubWl4aW4oYi5TcGluZUxvYWRlci5wcm90b3R5cGUpLGIuU3BpbmVMb2FkZXIucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLGM9bmV3IGIuSnNvbkxvYWRlcih0aGlzLnVybCx0aGlzLmNyb3Nzb3JpZ2luKTtjLm9uKFwibG9hZGVkXCIsZnVuY3Rpb24oYil7YS5qc29uPWIuZGF0YS5jb250ZW50Lmpzb24sYS5vbkxvYWRlZCgpfSksYy5sb2FkKCl9LGIuU3BpbmVMb2FkZXIucHJvdG90eXBlLm9uTG9hZGVkPWZ1bmN0aW9uKCl7dGhpcy5sb2FkZWQ9ITAsdGhpcy5lbWl0KFwibG9hZGVkXCIse2NvbnRlbnQ6dGhpc30pfSxiLkFic3RyYWN0RmlsdGVyPWZ1bmN0aW9uKGEsYil7dGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMuc2hhZGVycz1bXSx0aGlzLmRpcnR5PSEwLHRoaXMucGFkZGluZz0wLHRoaXMudW5pZm9ybXM9Ynx8e30sdGhpcy5mcmFnbWVudFNyYz1hfHxbXX0sYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5BYnN0cmFjdEZpbHRlcixiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZS5zeW5jVW5pZm9ybXM9ZnVuY3Rpb24oKXtmb3IodmFyIGE9MCxiPXRoaXMuc2hhZGVycy5sZW5ndGg7Yj5hO2ErKyl0aGlzLnNoYWRlcnNbYV0uZGlydHk9ITB9LGIuQWxwaGFNYXNrRmlsdGVyPWZ1bmN0aW9uKGEpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sYS5iYXNlVGV4dHVyZS5fcG93ZXJPZjI9ITAsdGhpcy51bmlmb3Jtcz17bWFzazp7dHlwZTpcInNhbXBsZXIyRFwiLHZhbHVlOmF9LG1hcERpbWVuc2lvbnM6e3R5cGU6XCIyZlwiLHZhbHVlOnt4OjEseTo1MTEyfX0sZGltZW5zaW9uczp7dHlwZTpcIjRmdlwiLHZhbHVlOlswLDAsMCwwXX19LGEuYmFzZVRleHR1cmUuaGFzTG9hZGVkPyh0aGlzLnVuaWZvcm1zLm1hc2sudmFsdWUueD1hLndpZHRoLHRoaXMudW5pZm9ybXMubWFzay52YWx1ZS55PWEuaGVpZ2h0KToodGhpcy5ib3VuZExvYWRlZEZ1bmN0aW9uPXRoaXMub25UZXh0dXJlTG9hZGVkLmJpbmQodGhpcyksYS5iYXNlVGV4dHVyZS5vbihcImxvYWRlZFwiLHRoaXMuYm91bmRMb2FkZWRGdW5jdGlvbikpLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCBtYXNrO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ1bmlmb3JtIHZlYzIgb2Zmc2V0O1wiLFwidW5pZm9ybSB2ZWM0IGRpbWVuc2lvbnM7XCIsXCJ1bmlmb3JtIHZlYzIgbWFwRGltZW5zaW9ucztcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICB2ZWMyIG1hcENvcmRzID0gdlRleHR1cmVDb29yZC54eTtcIixcIiAgIG1hcENvcmRzICs9IChkaW1lbnNpb25zLnp3ICsgb2Zmc2V0KS8gZGltZW5zaW9ucy54eSA7XCIsXCIgICBtYXBDb3Jkcy55ICo9IC0xLjA7XCIsXCIgICBtYXBDb3Jkcy55ICs9IDEuMDtcIixcIiAgIG1hcENvcmRzICo9IGRpbWVuc2lvbnMueHkgLyBtYXBEaW1lbnNpb25zO1wiLFwiICAgdmVjNCBvcmlnaW5hbCA9ICB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpO1wiLFwiICAgZmxvYXQgbWFza0FscGhhID0gIHRleHR1cmUyRChtYXNrLCBtYXBDb3JkcykucjtcIixcIiAgIG9yaWdpbmFsICo9IG1hc2tBbHBoYTtcIixcIiAgIGdsX0ZyYWdDb2xvciA9ICBvcmlnaW5hbDtcIixcIn1cIl19LGIuQWxwaGFNYXNrRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkFscGhhTWFza0ZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5BbHBoYU1hc2tGaWx0ZXIsYi5BbHBoYU1hc2tGaWx0ZXIucHJvdG90eXBlLm9uVGV4dHVyZUxvYWRlZD1mdW5jdGlvbigpe3RoaXMudW5pZm9ybXMubWFwRGltZW5zaW9ucy52YWx1ZS54PXRoaXMudW5pZm9ybXMubWFzay52YWx1ZS53aWR0aCx0aGlzLnVuaWZvcm1zLm1hcERpbWVuc2lvbnMudmFsdWUueT10aGlzLnVuaWZvcm1zLm1hc2sudmFsdWUuaGVpZ2h0LHRoaXMudW5pZm9ybXMubWFzay52YWx1ZS5iYXNlVGV4dHVyZS5vZmYoXCJsb2FkZWRcIix0aGlzLmJvdW5kTG9hZGVkRnVuY3Rpb24pfSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5BbHBoYU1hc2tGaWx0ZXIucHJvdG90eXBlLFwibWFwXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLm1hc2sudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLm1hc2sudmFsdWU9YX19KSxiLkNvbG9yTWF0cml4RmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXttYXRyaXg6e3R5cGU6XCJtYXQ0XCIsdmFsdWU6WzEsMCwwLDAsMCwxLDAsMCwwLDAsMSwwLDAsMCwwLDFdfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gZmxvYXQgaW52ZXJ0O1wiLFwidW5pZm9ybSBtYXQ0IG1hdHJpeDtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCkgKiBtYXRyaXg7XCIsXCJ9XCJdfSxiLkNvbG9yTWF0cml4RmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkNvbG9yTWF0cml4RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkNvbG9yTWF0cml4RmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkNvbG9yTWF0cml4RmlsdGVyLnByb3RvdHlwZSxcIm1hdHJpeFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5tYXRyaXgudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLm1hdHJpeC52YWx1ZT1hfX0pLGIuR3JheUZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17Z3JheTp7dHlwZTpcIjFmXCIsdmFsdWU6MX19LHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInVuaWZvcm0gZmxvYXQgZ3JheTtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpO1wiLFwiICAgZ2xfRnJhZ0NvbG9yLnJnYiA9IG1peChnbF9GcmFnQ29sb3IucmdiLCB2ZWMzKDAuMjEyNipnbF9GcmFnQ29sb3IuciArIDAuNzE1MipnbF9GcmFnQ29sb3IuZyArIDAuMDcyMipnbF9GcmFnQ29sb3IuYiksIGdyYXkpO1wiLFwifVwiXX0sYi5HcmF5RmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkdyYXlGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuR3JheUZpbHRlcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5HcmF5RmlsdGVyLnByb3RvdHlwZSxcImdyYXlcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuZ3JheS52YWx1ZX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMudW5pZm9ybXMuZ3JheS52YWx1ZT1hfX0pLGIuRGlzcGxhY2VtZW50RmlsdGVyPWZ1bmN0aW9uKGEpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sYS5iYXNlVGV4dHVyZS5fcG93ZXJPZjI9ITAsdGhpcy51bmlmb3Jtcz17ZGlzcGxhY2VtZW50TWFwOnt0eXBlOlwic2FtcGxlcjJEXCIsdmFsdWU6YX0sc2NhbGU6e3R5cGU6XCIyZlwiLHZhbHVlOnt4OjMwLHk6MzB9fSxvZmZzZXQ6e3R5cGU6XCIyZlwiLHZhbHVlOnt4OjAseTowfX0sbWFwRGltZW5zaW9uczp7dHlwZTpcIjJmXCIsdmFsdWU6e3g6MSx5OjUxMTJ9fSxkaW1lbnNpb25zOnt0eXBlOlwiNGZ2XCIsdmFsdWU6WzAsMCwwLDBdfX0sYS5iYXNlVGV4dHVyZS5oYXNMb2FkZWQ/KHRoaXMudW5pZm9ybXMubWFwRGltZW5zaW9ucy52YWx1ZS54PWEud2lkdGgsdGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLnk9YS5oZWlnaHQpOih0aGlzLmJvdW5kTG9hZGVkRnVuY3Rpb249dGhpcy5vblRleHR1cmVMb2FkZWQuYmluZCh0aGlzKSxhLmJhc2VUZXh0dXJlLm9uKFwibG9hZGVkXCIsdGhpcy5ib3VuZExvYWRlZEZ1bmN0aW9uKSksdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gc2FtcGxlcjJEIGRpc3BsYWNlbWVudE1hcDtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidW5pZm9ybSB2ZWMyIHNjYWxlO1wiLFwidW5pZm9ybSB2ZWMyIG9mZnNldDtcIixcInVuaWZvcm0gdmVjNCBkaW1lbnNpb25zO1wiLFwidW5pZm9ybSB2ZWMyIG1hcERpbWVuc2lvbnM7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMiBtYXBDb3JkcyA9IHZUZXh0dXJlQ29vcmQueHk7XCIsXCIgICBtYXBDb3JkcyArPSAoZGltZW5zaW9ucy56dyArIG9mZnNldCkvIGRpbWVuc2lvbnMueHkgO1wiLFwiICAgbWFwQ29yZHMueSAqPSAtMS4wO1wiLFwiICAgbWFwQ29yZHMueSArPSAxLjA7XCIsXCIgICB2ZWMyIG1hdFNhbXBsZSA9IHRleHR1cmUyRChkaXNwbGFjZW1lbnRNYXAsIG1hcENvcmRzKS54eTtcIixcIiAgIG1hdFNhbXBsZSAtPSAwLjU7XCIsXCIgICBtYXRTYW1wbGUgKj0gc2NhbGU7XCIsXCIgICBtYXRTYW1wbGUgLz0gbWFwRGltZW5zaW9ucztcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLnggKyBtYXRTYW1wbGUueCwgdlRleHR1cmVDb29yZC55ICsgbWF0U2FtcGxlLnkpKTtcIixcIiAgIGdsX0ZyYWdDb2xvci5yZ2IgPSBtaXgoIGdsX0ZyYWdDb2xvci5yZ2IsIGdsX0ZyYWdDb2xvci5yZ2IsIDEuMCk7XCIsXCIgICB2ZWMyIGNvcmQgPSB2VGV4dHVyZUNvb3JkO1wiLFwifVwiXX0sYi5EaXNwbGFjZW1lbnRGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuRGlzcGxhY2VtZW50RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkRpc3BsYWNlbWVudEZpbHRlcixiLkRpc3BsYWNlbWVudEZpbHRlci5wcm90b3R5cGUub25UZXh0dXJlTG9hZGVkPWZ1bmN0aW9uKCl7dGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLng9dGhpcy51bmlmb3Jtcy5kaXNwbGFjZW1lbnRNYXAudmFsdWUud2lkdGgsdGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLnk9dGhpcy51bmlmb3Jtcy5kaXNwbGFjZW1lbnRNYXAudmFsdWUuaGVpZ2h0LHRoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlLmJhc2VUZXh0dXJlLm9mZihcImxvYWRlZFwiLHRoaXMuYm91bmRMb2FkZWRGdW5jdGlvbil9LE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYWNlbWVudEZpbHRlci5wcm90b3R5cGUsXCJtYXBcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5kaXNwbGFjZW1lbnRNYXAudmFsdWU9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGFjZW1lbnRGaWx0ZXIucHJvdG90eXBlLFwic2NhbGVcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuc2NhbGUudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLnNjYWxlLnZhbHVlPWF9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRGlzcGxhY2VtZW50RmlsdGVyLnByb3RvdHlwZSxcIm9mZnNldFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5vZmZzZXQudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLm9mZnNldC52YWx1ZT1hfX0pLGIuUGl4ZWxhdGVGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e2ludmVydDp7dHlwZTpcIjFmXCIsdmFsdWU6MH0sZGltZW5zaW9uczp7dHlwZTpcIjRmdlwiLHZhbHVlOm5ldyBiLkZsb2F0MzJBcnJheShbMWU0LDEwMCwxMCwxMF0pfSxwaXhlbFNpemU6e3R5cGU6XCIyZlwiLHZhbHVlOnt4OjEwLHk6MTB9fX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gdmVjMiB0ZXN0RGltO1wiLFwidW5pZm9ybSB2ZWM0IGRpbWVuc2lvbnM7XCIsXCJ1bmlmb3JtIHZlYzIgcGl4ZWxTaXplO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMiBjb29yZCA9IHZUZXh0dXJlQ29vcmQ7XCIsXCIgICB2ZWMyIHNpemUgPSBkaW1lbnNpb25zLnh5L3BpeGVsU2l6ZTtcIixcIiAgIHZlYzIgY29sb3IgPSBmbG9vciggKCB2VGV4dHVyZUNvb3JkICogc2l6ZSApICkgLyBzaXplICsgcGl4ZWxTaXplL2RpbWVuc2lvbnMueHkgKiAwLjU7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIGNvbG9yKTtcIixcIn1cIl19LGIuUGl4ZWxhdGVGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuUGl4ZWxhdGVGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuUGl4ZWxhdGVGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuUGl4ZWxhdGVGaWx0ZXIucHJvdG90eXBlLFwic2l6ZVwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5waXhlbFNpemUudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLmRpcnR5PSEwLHRoaXMudW5pZm9ybXMucGl4ZWxTaXplLnZhbHVlPWF9fSksYi5CbHVyWEZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17Ymx1cjp7dHlwZTpcIjFmXCIsdmFsdWU6MS81MTJ9fSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSBmbG9hdCBibHVyO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjNCBzdW0gPSB2ZWM0KDAuMCk7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCAtIDQuMCpibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMDU7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCAtIDMuMCpibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMDk7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCAtIDIuMCpibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMTI7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCAtIGJsdXIsIHZUZXh0dXJlQ29vcmQueSkpICogMC4xNTtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMTY7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCArIGJsdXIsIHZUZXh0dXJlQ29vcmQueSkpICogMC4xNTtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54ICsgMi4wKmJsdXIsIHZUZXh0dXJlQ29vcmQueSkpICogMC4xMjtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54ICsgMy4wKmJsdXIsIHZUZXh0dXJlQ29vcmQueSkpICogMC4wOTtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54ICsgNC4wKmJsdXIsIHZUZXh0dXJlQ29vcmQueSkpICogMC4wNTtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHN1bTtcIixcIn1cIl19LGIuQmx1clhGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuQmx1clhGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQmx1clhGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuQmx1clhGaWx0ZXIucHJvdG90eXBlLFwiYmx1clwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5ibHVyLnZhbHVlLygxLzdlMyl9LHNldDpmdW5jdGlvbihhKXt0aGlzLmRpcnR5PSEwLHRoaXMudW5pZm9ybXMuYmx1ci52YWx1ZT0xLzdlMyphfX0pLGIuQmx1cllGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e2JsdXI6e3R5cGU6XCIxZlwiLHZhbHVlOjEvNTEyfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gZmxvYXQgYmx1cjtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIHZlYzQgc3VtID0gdmVjNCgwLjApO1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSAtIDQuMCpibHVyKSkgKiAwLjA1O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSAtIDMuMCpibHVyKSkgKiAwLjA5O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSAtIDIuMCpibHVyKSkgKiAwLjEyO1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSAtIGJsdXIpKSAqIDAuMTU7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCwgdlRleHR1cmVDb29yZC55KSkgKiAwLjE2O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSArIGJsdXIpKSAqIDAuMTU7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCwgdlRleHR1cmVDb29yZC55ICsgMi4wKmJsdXIpKSAqIDAuMTI7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCwgdlRleHR1cmVDb29yZC55ICsgMy4wKmJsdXIpKSAqIDAuMDk7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCwgdlRleHR1cmVDb29yZC55ICsgNC4wKmJsdXIpKSAqIDAuMDU7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSBzdW07XCIsXCJ9XCJdfSxiLkJsdXJZRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkJsdXJZRmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkJsdXJZRmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkJsdXJZRmlsdGVyLnByb3RvdHlwZSxcImJsdXJcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuYmx1ci52YWx1ZS8oMS83ZTMpfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5ibHVyLnZhbHVlPTEvN2UzKmF9fSksYi5CbHVyRmlsdGVyPWZ1bmN0aW9uKCl7dGhpcy5ibHVyWEZpbHRlcj1uZXcgYi5CbHVyWEZpbHRlcix0aGlzLmJsdXJZRmlsdGVyPW5ldyBiLkJsdXJZRmlsdGVyLHRoaXMucGFzc2VzPVt0aGlzLmJsdXJYRmlsdGVyLHRoaXMuYmx1cllGaWx0ZXJdfSxiLkJsdXJGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuQmx1ckZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5CbHVyRmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkJsdXJGaWx0ZXIucHJvdG90eXBlLFwiYmx1clwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ibHVyWEZpbHRlci5ibHVyfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5ibHVyWEZpbHRlci5ibHVyPXRoaXMuYmx1cllGaWx0ZXIuYmx1cj1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkJsdXJGaWx0ZXIucHJvdG90eXBlLFwiYmx1clhcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYmx1clhGaWx0ZXIuYmx1cn0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuYmx1clhGaWx0ZXIuYmx1cj1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkJsdXJGaWx0ZXIucHJvdG90eXBlLFwiYmx1cllcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYmx1cllGaWx0ZXIuYmx1cn0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuYmx1cllGaWx0ZXIuYmx1cj1hfX0pLGIuSW52ZXJ0RmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXtpbnZlcnQ6e3R5cGU6XCIxZlwiLHZhbHVlOjF9fSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSBmbG9hdCBpbnZlcnQ7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpO1wiLFwiICAgZ2xfRnJhZ0NvbG9yLnJnYiA9IG1peCggKHZlYzMoMSktZ2xfRnJhZ0NvbG9yLnJnYikgKiBnbF9GcmFnQ29sb3IuYSwgZ2xfRnJhZ0NvbG9yLnJnYiwgMS4wIC0gaW52ZXJ0KTtcIixcIn1cIl19LGIuSW52ZXJ0RmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkludmVydEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5JbnZlcnRGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuSW52ZXJ0RmlsdGVyLnByb3RvdHlwZSxcImludmVydFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5pbnZlcnQudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLmludmVydC52YWx1ZT1hfX0pLGIuU2VwaWFGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e3NlcGlhOnt0eXBlOlwiMWZcIix2YWx1ZToxfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gZmxvYXQgc2VwaWE7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcImNvbnN0IG1hdDMgc2VwaWFNYXRyaXggPSBtYXQzKDAuMzU4OCwgMC43MDQ0LCAwLjEzNjgsIDAuMjk5MCwgMC41ODcwLCAwLjExNDAsIDAuMjM5MiwgMC40Njk2LCAwLjA5MTIpO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCk7XCIsXCIgICBnbF9GcmFnQ29sb3IucmdiID0gbWl4KCBnbF9GcmFnQ29sb3IucmdiLCBnbF9GcmFnQ29sb3IucmdiICogc2VwaWFNYXRyaXgsIHNlcGlhKTtcIixcIn1cIl19LGIuU2VwaWFGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuU2VwaWFGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuU2VwaWFGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuU2VwaWFGaWx0ZXIucHJvdG90eXBlLFwic2VwaWFcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuc2VwaWEudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLnNlcGlhLnZhbHVlPWF9fSksYi5Ud2lzdEZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17cmFkaXVzOnt0eXBlOlwiMWZcIix2YWx1ZTouNX0sYW5nbGU6e3R5cGU6XCIxZlwiLHZhbHVlOjV9LG9mZnNldDp7dHlwZTpcIjJmXCIsdmFsdWU6e3g6LjUseTouNX19fSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSB2ZWM0IGRpbWVuc2lvbnM7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInVuaWZvcm0gZmxvYXQgcmFkaXVzO1wiLFwidW5pZm9ybSBmbG9hdCBhbmdsZTtcIixcInVuaWZvcm0gdmVjMiBvZmZzZXQ7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMiBjb29yZCA9IHZUZXh0dXJlQ29vcmQgLSBvZmZzZXQ7XCIsXCIgICBmbG9hdCBkaXN0YW5jZSA9IGxlbmd0aChjb29yZCk7XCIsXCIgICBpZiAoZGlzdGFuY2UgPCByYWRpdXMpIHtcIixcIiAgICAgICBmbG9hdCByYXRpbyA9IChyYWRpdXMgLSBkaXN0YW5jZSkgLyByYWRpdXM7XCIsXCIgICAgICAgZmxvYXQgYW5nbGVNb2QgPSByYXRpbyAqIHJhdGlvICogYW5nbGU7XCIsXCIgICAgICAgZmxvYXQgcyA9IHNpbihhbmdsZU1vZCk7XCIsXCIgICAgICAgZmxvYXQgYyA9IGNvcyhhbmdsZU1vZCk7XCIsXCIgICAgICAgY29vcmQgPSB2ZWMyKGNvb3JkLnggKiBjIC0gY29vcmQueSAqIHMsIGNvb3JkLnggKiBzICsgY29vcmQueSAqIGMpO1wiLFwiICAgfVwiLFwiICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCBjb29yZCtvZmZzZXQpO1wiLFwifVwiXX0sYi5Ud2lzdEZpbHRlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSksYi5Ud2lzdEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Ud2lzdEZpbHRlcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5Ud2lzdEZpbHRlci5wcm90b3R5cGUsXCJvZmZzZXRcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMub2Zmc2V0LnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eT0hMCx0aGlzLnVuaWZvcm1zLm9mZnNldC52YWx1ZT1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlR3aXN0RmlsdGVyLnByb3RvdHlwZSxcInJhZGl1c1wiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5yYWRpdXMudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLmRpcnR5PSEwLHRoaXMudW5pZm9ybXMucmFkaXVzLnZhbHVlPWF9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuVHdpc3RGaWx0ZXIucHJvdG90eXBlLFwiYW5nbGVcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuYW5nbGUudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLmRpcnR5PSEwLHRoaXMudW5pZm9ybXMuYW5nbGUudmFsdWU9YX19KSxiLkNvbG9yU3RlcEZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17c3RlcDp7dHlwZTpcIjFmXCIsdmFsdWU6NX19LHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInVuaWZvcm0gZmxvYXQgc3RlcDtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkKTtcIixcIiAgIGNvbG9yID0gZmxvb3IoY29sb3IgKiBzdGVwKSAvIHN0ZXA7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSBjb2xvcjtcIixcIn1cIl19LGIuQ29sb3JTdGVwRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkNvbG9yU3RlcEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Db2xvclN0ZXBGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuQ29sb3JTdGVwRmlsdGVyLnByb3RvdHlwZSxcInN0ZXBcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuc3RlcC52YWx1ZX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMudW5pZm9ybXMuc3RlcC52YWx1ZT1hfX0pLGIuRG90U2NyZWVuRmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXtzY2FsZTp7dHlwZTpcIjFmXCIsdmFsdWU6MX0sYW5nbGU6e3R5cGU6XCIxZlwiLHZhbHVlOjV9LGRpbWVuc2lvbnM6e3R5cGU6XCI0ZnZcIix2YWx1ZTpbMCwwLDAsMF19fSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSB2ZWM0IGRpbWVuc2lvbnM7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInVuaWZvcm0gZmxvYXQgYW5nbGU7XCIsXCJ1bmlmb3JtIGZsb2F0IHNjYWxlO1wiLFwiZmxvYXQgcGF0dGVybigpIHtcIixcIiAgIGZsb2F0IHMgPSBzaW4oYW5nbGUpLCBjID0gY29zKGFuZ2xlKTtcIixcIiAgIHZlYzIgdGV4ID0gdlRleHR1cmVDb29yZCAqIGRpbWVuc2lvbnMueHk7XCIsXCIgICB2ZWMyIHBvaW50ID0gdmVjMihcIixcIiAgICAgICBjICogdGV4LnggLSBzICogdGV4LnksXCIsXCIgICAgICAgcyAqIHRleC54ICsgYyAqIHRleC55XCIsXCIgICApICogc2NhbGU7XCIsXCIgICByZXR1cm4gKHNpbihwb2ludC54KSAqIHNpbihwb2ludC55KSkgKiA0LjA7XCIsXCJ9XCIsXCJ2b2lkIG1haW4oKSB7XCIsXCIgICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkKTtcIixcIiAgIGZsb2F0IGF2ZXJhZ2UgPSAoY29sb3IuciArIGNvbG9yLmcgKyBjb2xvci5iKSAvIDMuMDtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHZlYzQodmVjMyhhdmVyYWdlICogMTAuMCAtIDUuMCArIHBhdHRlcm4oKSksIGNvbG9yLmEpO1wiLFwifVwiXX0sYi5Eb3RTY3JlZW5GaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuRG90U2NyZWVuRmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkRvdFNjcmVlbkZpbHRlcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5Eb3RTY3JlZW5GaWx0ZXIucHJvdG90eXBlLFwic2NhbGVcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuc2NhbGUudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLmRpcnR5PSEwLHRoaXMudW5pZm9ybXMuc2NhbGUudmFsdWU9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5Eb3RTY3JlZW5GaWx0ZXIucHJvdG90eXBlLFwiYW5nbGVcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuYW5nbGUudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLmRpcnR5PSEwLHRoaXMudW5pZm9ybXMuYW5nbGUudmFsdWU9YX19KSxiLkNyb3NzSGF0Y2hGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e2JsdXI6e3R5cGU6XCIxZlwiLHZhbHVlOjEvNTEyfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gZmxvYXQgYmx1cjtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgICBmbG9hdCBsdW0gPSBsZW5ndGgodGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkLnh5KS5yZ2IpO1wiLFwiICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoMS4wLCAxLjAsIDEuMCwgMS4wKTtcIixcIiAgICBpZiAobHVtIDwgMS4wMCkge1wiLFwiICAgICAgICBpZiAobW9kKGdsX0ZyYWdDb29yZC54ICsgZ2xfRnJhZ0Nvb3JkLnksIDEwLjApID09IDAuMCkge1wiLFwiICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1wiLFwiICAgICAgICB9XCIsXCIgICAgfVwiLFwiICAgIGlmIChsdW0gPCAwLjc1KSB7XCIsXCIgICAgICAgIGlmIChtb2QoZ2xfRnJhZ0Nvb3JkLnggLSBnbF9GcmFnQ29vcmQueSwgMTAuMCkgPT0gMC4wKSB7XCIsXCIgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7XCIsXCIgICAgICAgIH1cIixcIiAgICB9XCIsXCIgICAgaWYgKGx1bSA8IDAuNTApIHtcIixcIiAgICAgICAgaWYgKG1vZChnbF9GcmFnQ29vcmQueCArIGdsX0ZyYWdDb29yZC55IC0gNS4wLCAxMC4wKSA9PSAwLjApIHtcIixcIiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoMC4wLCAwLjAsIDAuMCwgMS4wKTtcIixcIiAgICAgICAgfVwiLFwiICAgIH1cIixcIiAgICBpZiAobHVtIDwgMC4zKSB7XCIsXCIgICAgICAgIGlmIChtb2QoZ2xfRnJhZ0Nvb3JkLnggLSBnbF9GcmFnQ29vcmQueSAtIDUuMCwgMTAuMCkgPT0gMC4wKSB7XCIsXCIgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7XCIsXCIgICAgICAgIH1cIixcIiAgICB9XCIsXCJ9XCJdfSxiLkNyb3NzSGF0Y2hGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuQ3Jvc3NIYXRjaEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Dcm9zc0hhdGNoRmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkNyb3NzSGF0Y2hGaWx0ZXIucHJvdG90eXBlLFwiYmx1clwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5ibHVyLnZhbHVlLygxLzdlMyl9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLmJsdXIudmFsdWU9MS83ZTMqYX19KSxiLlJHQlNwbGl0RmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXtyZWQ6e3R5cGU6XCIyZlwiLHZhbHVlOnt4OjIwLHk6MjB9fSxncmVlbjp7dHlwZTpcIjJmXCIsdmFsdWU6e3g6LTIwLHk6MjB9fSxibHVlOnt0eXBlOlwiMmZcIix2YWx1ZTp7eDoyMCx5Oi0yMH19LGRpbWVuc2lvbnM6e3R5cGU6XCI0ZnZcIix2YWx1ZTpbMCwwLDAsMF19fSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSB2ZWMyIHJlZDtcIixcInVuaWZvcm0gdmVjMiBncmVlbjtcIixcInVuaWZvcm0gdmVjMiBibHVlO1wiLFwidW5pZm9ybSB2ZWM0IGRpbWVuc2lvbnM7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IuciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCArIHJlZC9kaW1lbnNpb25zLnh5KS5yO1wiLFwiICAgZ2xfRnJhZ0NvbG9yLmcgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQgKyBncmVlbi9kaW1lbnNpb25zLnh5KS5nO1wiLFwiICAgZ2xfRnJhZ0NvbG9yLmIgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQgKyBibHVlL2RpbWVuc2lvbnMueHkpLmI7XCIsXCIgICBnbF9GcmFnQ29sb3IuYSA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCkuYTtcIixcIn1cIl19LGIuUkdCU3BsaXRGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuUkdCU3BsaXRGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuUkdCU3BsaXRGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuUkdCU3BsaXRGaWx0ZXIucHJvdG90eXBlLFwicmVkXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLnJlZC52YWx1ZX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMudW5pZm9ybXMucmVkLnZhbHVlPWF9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuUkdCU3BsaXRGaWx0ZXIucHJvdG90eXBlLFwiZ3JlZW5cIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuZ3JlZW4udmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLmdyZWVuLnZhbHVlPWF9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuUkdCU3BsaXRGaWx0ZXIucHJvdG90eXBlLFwiYmx1ZVwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5ibHVlLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5ibHVlLnZhbHVlPWF9fSksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGV4cG9ydHM/KFwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzJiYoZXhwb3J0cz1tb2R1bGUuZXhwb3J0cz1iKSxleHBvcnRzLlBJWEk9Yik6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoYik6YS5QSVhJPWJ9KS5jYWxsKHRoaXMpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvcm90Jyk7XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8qXG5cdFRoaXMgaXMgcm90LmpzLCB0aGUgUk9ndWVsaWtlIFRvb2xraXQgaW4gSmF2YVNjcmlwdC5cblx0VmVyc2lvbiAwLjV+ZGV2LCBnZW5lcmF0ZWQgb24gV2VkIEp1bCAzMCAyMDE0IDIxOjMzOjE4IEdNVC0wNTAwIChDRFQpLlxuKi9cbi8qKlxuICogQG5hbWVzcGFjZSBBZGQgb2JqZWN0cyBmb3IgTm9kZS5qcyBlbnZpcm9tZW50XG4gKi9cbmlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCA/IHByb2Nlc3MuZW52IDogdm9pZCAwKSAhPSBudWxsKSB7XG5cdHdpbmRvdyA9IGdsb2JhbDtcblx0ZG9jdW1lbnQgPSB7XG5cdFx0Ym9keToge1xuXHRcdFx0YXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7fSxcblx0XHRcdHNjcm9sbExlZnQ6IDAsXG5cdFx0XHRzY3JvbGxUb3A6IDBcblx0XHR9LFxuXHRcdGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uKHR5cGUpIHtcblx0XHRcdHZhciBjYW52YXM7XG5cdFx0XHRyZXR1cm4gY2FudmFzID0ge1xuXHRcdFx0XHRnZXRCb3VuZGluZ0NsaWVudFJlY3Q6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciByZWN0O1xuXHRcdFx0XHRcdHJldHVybiByZWN0ID0ge1xuXHRcdFx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0XHRcdHRvcDogMFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldENvbnRleHQ6IGZ1bmN0aW9uKHR5cGUpIHtcblx0XHRcdFx0XHR2YXIgY29udGV4dDtcblx0XHRcdFx0XHRyZXR1cm4gY29udGV4dCA9IHtcblx0XHRcdFx0XHRcdF90ZXJtY29sb3I6IG51bGwsXG5cdFx0XHRcdFx0XHRiZWdpblBhdGg6IGZ1bmN0aW9uKCkge30sXG5cdFx0XHRcdFx0XHRjYW52YXM6IGNhbnZhcyxcblx0XHRcdFx0XHRcdGRyYXdJbWFnZTogZnVuY3Rpb24oYSwgYiwgYywgZCwgZSwgZiwgZywgaCwgaSkge30sXG5cdFx0XHRcdFx0XHRmaWxsOiBmdW5jdGlvbigpIHt9LFxuXHRcdFx0XHRcdFx0ZmlsbFJlY3Q6IGZ1bmN0aW9uKHgsIHksIHcsIGgpIHtcblx0XHRcdFx0XHRcdFx0aWYodGhpcy5fdGVybWNvbG9yICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGNsZWFyQ21kID0gdGhpcy5fdGVybWNvbG9yLmNsZWFyVG9BbnNpKHRoaXMuZmlsbFN0eWxlKTtcblx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzLnN0ZG91dC53cml0ZShjbGVhckNtZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRmaWxsU3R5bGU6IFwiIzAwMFwiLFxuXHRcdFx0XHRcdFx0ZmlsbFRleHQ6IGZ1bmN0aW9uKGNocywgeCwgeSkge30sXG5cdFx0XHRcdFx0XHRmb250OiBcIm1vbm9zcGFjZVwiLFxuXHRcdFx0XHRcdFx0bGluZVRvOiBmdW5jdGlvbih4LCB5KSB7fSxcblx0XHRcdFx0XHRcdG1lYXN1cmVUZXh0OiBmdW5jdGlvbihjaCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0ID0ge1xuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOiAxMlxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG1vdmVUbzogZnVuY3Rpb24oeCwgeSkge30sXG5cdFx0XHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0XHR0ZXh0QmFzZWxpbmU6IFwibWlkZGxlXCJcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0bGVmdDogXCIxMDBweFwiLFxuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRcdFx0dG9wOiBcIjEwMHB4XCIsXG5cdFx0XHRcdFx0dmlzaWJpbGl0eTogXCJoaWRkZW5cIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR3aWR0aDogMFxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGRvY3VtZW50RWxlbWVudDoge1xuXHRcdFx0c2Nyb2xsTGVmdDogMCxcblx0XHRcdHNjcm9sbFRvcDogMFxuXHRcdH1cblx0fTtcbn1cbi8qKlxuICogQG5hbWVzcGFjZSBUb3AtbGV2ZWwgUk9UIG5hbWVzcGFjZVxuICovXG52YXIgUk9UID0ge1xuXHQvKipcblx0ICogQHJldHVybnMge2Jvb2x9IElzIHJvdC5qcyBzdXBwb3J0ZWQgYnkgdGhpcyBicm93c2VyP1xuXHQgKi9cblx0aXNTdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAhIShkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLmdldENvbnRleHQgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpO1xuXHR9LFxuXG5cdC8qKiBEZWZhdWx0IHdpdGggZm9yIGRpc3BsYXkgYW5kIG1hcCBnZW5lcmF0b3JzICovXG5cdERFRkFVTFRfV0lEVEg6IDgwLFxuXHQvKiogRGVmYXVsdCBoZWlnaHQgZm9yIGRpc3BsYXkgYW5kIG1hcCBnZW5lcmF0b3JzICovXG5cdERFRkFVTFRfSEVJR0hUOiAyNSxcblxuXHQvKiogRGlyZWN0aW9uYWwgY29uc3RhbnRzLiBPcmRlcmluZyBpcyBpbXBvcnRhbnQhICovXG5cdERJUlM6IHtcblx0XHRcIjRcIjogW1xuXHRcdFx0WyAwLCAtMV0sXG5cdFx0XHRbIDEsICAwXSxcblx0XHRcdFsgMCwgIDFdLFxuXHRcdFx0Wy0xLCAgMF1cblx0XHRdLFxuXHRcdFwiOFwiOiBbXG5cdFx0XHRbIDAsIC0xXSxcblx0XHRcdFsgMSwgLTFdLFxuXHRcdFx0WyAxLCAgMF0sXG5cdFx0XHRbIDEsICAxXSxcblx0XHRcdFsgMCwgIDFdLFxuXHRcdFx0Wy0xLCAgMV0sXG5cdFx0XHRbLTEsICAwXSxcblx0XHRcdFstMSwgLTFdXG5cdFx0XSxcblx0XHRcIjZcIjogW1xuXHRcdFx0Wy0xLCAtMV0sXG5cdFx0XHRbIDEsIC0xXSxcblx0XHRcdFsgMiwgIDBdLFxuXHRcdFx0WyAxLCAgMV0sXG5cdFx0XHRbLTEsICAxXSxcblx0XHRcdFstMiwgIDBdXG5cdFx0XVxuXHR9LFxuXG5cdC8qKiBDYW5jZWwga2V5LiAqL1xuXHRWS19DQU5DRUw6IDMsIFxuXHQvKiogSGVscCBrZXkuICovXG5cdFZLX0hFTFA6IDYsIFxuXHQvKiogQmFja3NwYWNlIGtleS4gKi9cblx0VktfQkFDS19TUEFDRTogOCwgXG5cdC8qKiBUYWIga2V5LiAqL1xuXHRWS19UQUI6IDksIFxuXHQvKiogNSBrZXkgb24gTnVtcGFkIHdoZW4gTnVtTG9jayBpcyB1bmxvY2tlZC4gT3Igb24gTWFjLCBjbGVhciBrZXkgd2hpY2ggaXMgcG9zaXRpb25lZCBhdCBOdW1Mb2NrIGtleS4gKi9cblx0VktfQ0xFQVI6IDEyLCBcblx0LyoqIFJldHVybi9lbnRlciBrZXkgb24gdGhlIG1haW4ga2V5Ym9hcmQuICovXG5cdFZLX1JFVFVSTjogMTMsIFxuXHQvKiogUmVzZXJ2ZWQsIGJ1dCBub3QgdXNlZC4gKi9cblx0VktfRU5URVI6IDE0LCBcblx0LyoqIFNoaWZ0IGtleS4gKi9cblx0VktfU0hJRlQ6IDE2LCBcblx0LyoqIENvbnRyb2wga2V5LiAqL1xuXHRWS19DT05UUk9MOiAxNywgXG5cdC8qKiBBbHQgKE9wdGlvbiBvbiBNYWMpIGtleS4gKi9cblx0VktfQUxUOiAxOCwgXG5cdC8qKiBQYXVzZSBrZXkuICovXG5cdFZLX1BBVVNFOiAxOSwgXG5cdC8qKiBDYXBzIGxvY2suICovXG5cdFZLX0NBUFNfTE9DSzogMjAsIFxuXHQvKiogRXNjYXBlIGtleS4gKi9cblx0VktfRVNDQVBFOiAyNywgXG5cdC8qKiBTcGFjZSBiYXIuICovXG5cdFZLX1NQQUNFOiAzMiwgXG5cdC8qKiBQYWdlIFVwIGtleS4gKi9cblx0VktfUEFHRV9VUDogMzMsIFxuXHQvKiogUGFnZSBEb3duIGtleS4gKi9cblx0VktfUEFHRV9ET1dOOiAzNCwgXG5cdC8qKiBFbmQga2V5LiAqL1xuXHRWS19FTkQ6IDM1LCBcblx0LyoqIEhvbWUga2V5LiAqL1xuXHRWS19IT01FOiAzNiwgXG5cdC8qKiBMZWZ0IGFycm93LiAqL1xuXHRWS19MRUZUOiAzNywgXG5cdC8qKiBVcCBhcnJvdy4gKi9cblx0VktfVVA6IDM4LCBcblx0LyoqIFJpZ2h0IGFycm93LiAqL1xuXHRWS19SSUdIVDogMzksIFxuXHQvKiogRG93biBhcnJvdy4gKi9cblx0VktfRE9XTjogNDAsIFxuXHQvKiogUHJpbnQgU2NyZWVuIGtleS4gKi9cblx0VktfUFJJTlRTQ1JFRU46IDQ0LCBcblx0LyoqIElucyhlcnQpIGtleS4gKi9cblx0VktfSU5TRVJUOiA0NSwgXG5cdC8qKiBEZWwoZXRlKSBrZXkuICovXG5cdFZLX0RFTEVURTogNDYsIFxuXHQvKioqL1xuXHRWS18wOiA0OCxcblx0LyoqKi9cblx0VktfMTogNDksXG5cdC8qKiovXG5cdFZLXzI6IDUwLFxuXHQvKioqL1xuXHRWS18zOiA1MSxcblx0LyoqKi9cblx0VktfNDogNTIsXG5cdC8qKiovXG5cdFZLXzU6IDUzLFxuXHQvKioqL1xuXHRWS182OiA1NCxcblx0LyoqKi9cblx0VktfNzogNTUsXG5cdC8qKiovXG5cdFZLXzg6IDU2LFxuXHQvKioqL1xuXHRWS185OiA1Nyxcblx0LyoqIENvbG9uICg6KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQ09MT046IDU4LCBcblx0LyoqIFNlbWljb2xvbiAoOykga2V5LiAqL1xuXHRWS19TRU1JQ09MT046IDU5LCBcblx0LyoqIExlc3MtdGhhbiAoPCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0xFU1NfVEhBTjogNjAsIFxuXHQvKiogRXF1YWxzICg9KSBrZXkuICovXG5cdFZLX0VRVUFMUzogNjEsIFxuXHQvKiogR3JlYXRlci10aGFuICg+KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfR1JFQVRFUl9USEFOOiA2MiwgXG5cdC8qKiBRdWVzdGlvbiBtYXJrICg/KSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfUVVFU1RJT05fTUFSSzogNjMsIFxuXHQvKiogQXRtYXJrIChAKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQVQ6IDY0LCBcblx0LyoqKi9cblx0VktfQTogNjUsXG5cdC8qKiovXG5cdFZLX0I6IDY2LFxuXHQvKioqL1xuXHRWS19DOiA2Nyxcblx0LyoqKi9cblx0VktfRDogNjgsXG5cdC8qKiovXG5cdFZLX0U6IDY5LFxuXHQvKioqL1xuXHRWS19GOiA3MCxcblx0LyoqKi9cblx0VktfRzogNzEsXG5cdC8qKiovXG5cdFZLX0g6IDcyLFxuXHQvKioqL1xuXHRWS19JOiA3Myxcblx0LyoqKi9cblx0VktfSjogNzQsXG5cdC8qKiovXG5cdFZLX0s6IDc1LFxuXHQvKioqL1xuXHRWS19MOiA3Nixcblx0LyoqKi9cblx0VktfTTogNzcsXG5cdC8qKiovXG5cdFZLX046IDc4LFxuXHQvKioqL1xuXHRWS19POiA3OSxcblx0LyoqKi9cblx0VktfUDogODAsXG5cdC8qKiovXG5cdFZLX1E6IDgxLFxuXHQvKioqL1xuXHRWS19SOiA4Mixcblx0LyoqKi9cblx0VktfUzogODMsXG5cdC8qKiovXG5cdFZLX1Q6IDg0LFxuXHQvKioqL1xuXHRWS19VOiA4NSxcblx0LyoqKi9cblx0VktfVjogODYsXG5cdC8qKiovXG5cdFZLX1c6IDg3LFxuXHQvKioqL1xuXHRWS19YOiA4OCxcblx0LyoqKi9cblx0VktfWTogODksXG5cdC8qKiovXG5cdFZLX1o6IDkwLFxuXHQvKioqL1xuXHRWS19DT05URVhUX01FTlU6IDkzLFxuXHQvKiogMCBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDA6IDk2LCBcblx0LyoqIDEgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQxOiA5NywgXG5cdC8qKiAyIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEMjogOTgsIFxuXHQvKiogMyBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDM6IDk5LCBcblx0LyoqIDQgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ0OiAxMDAsIFxuXHQvKiogNSBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDU6IDEwMSwgXG5cdC8qKiA2IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFENjogMTAyLCBcblx0LyoqIDcgb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19OVU1QQUQ3OiAxMDMsIFxuXHQvKiogOCBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX05VTVBBRDg6IDEwNCwgXG5cdC8qKiA5IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfTlVNUEFEOTogMTA1LCBcblx0LyoqICogb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19NVUxUSVBMWTogMTA2LFxuXHQvKiogKyBvbiB0aGUgbnVtZXJpYyBrZXlwYWQuICovXG5cdFZLX0FERDogMTA3LCBcblx0LyoqKi9cblx0VktfU0VQQVJBVE9SOiAxMDgsXG5cdC8qKiAtIG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfU1VCVFJBQ1Q6IDEwOSwgXG5cdC8qKiBEZWNpbWFsIHBvaW50IG9uIHRoZSBudW1lcmljIGtleXBhZC4gKi9cblx0VktfREVDSU1BTDogMTEwLCBcblx0LyoqIC8gb24gdGhlIG51bWVyaWMga2V5cGFkLiAqL1xuXHRWS19ESVZJREU6IDExMSwgXG5cdC8qKiBGMSBrZXkuICovXG5cdFZLX0YxOiAxMTIsIFxuXHQvKiogRjIga2V5LiAqL1xuXHRWS19GMjogMTEzLCBcblx0LyoqIEYzIGtleS4gKi9cblx0VktfRjM6IDExNCwgXG5cdC8qKiBGNCBrZXkuICovXG5cdFZLX0Y0OiAxMTUsIFxuXHQvKiogRjUga2V5LiAqL1xuXHRWS19GNTogMTE2LCBcblx0LyoqIEY2IGtleS4gKi9cblx0VktfRjY6IDExNywgXG5cdC8qKiBGNyBrZXkuICovXG5cdFZLX0Y3OiAxMTgsIFxuXHQvKiogRjgga2V5LiAqL1xuXHRWS19GODogMTE5LCBcblx0LyoqIEY5IGtleS4gKi9cblx0VktfRjk6IDEyMCwgXG5cdC8qKiBGMTAga2V5LiAqL1xuXHRWS19GMTA6IDEyMSwgXG5cdC8qKiBGMTEga2V5LiAqL1xuXHRWS19GMTE6IDEyMiwgXG5cdC8qKiBGMTIga2V5LiAqL1xuXHRWS19GMTI6IDEyMywgXG5cdC8qKiBGMTMga2V5LiAqL1xuXHRWS19GMTM6IDEyNCwgXG5cdC8qKiBGMTQga2V5LiAqL1xuXHRWS19GMTQ6IDEyNSwgXG5cdC8qKiBGMTUga2V5LiAqL1xuXHRWS19GMTU6IDEyNiwgXG5cdC8qKiBGMTYga2V5LiAqL1xuXHRWS19GMTY6IDEyNywgXG5cdC8qKiBGMTcga2V5LiAqL1xuXHRWS19GMTc6IDEyOCwgXG5cdC8qKiBGMTgga2V5LiAqL1xuXHRWS19GMTg6IDEyOSwgXG5cdC8qKiBGMTkga2V5LiAqL1xuXHRWS19GMTk6IDEzMCwgXG5cdC8qKiBGMjAga2V5LiAqL1xuXHRWS19GMjA6IDEzMSwgXG5cdC8qKiBGMjEga2V5LiAqL1xuXHRWS19GMjE6IDEzMiwgXG5cdC8qKiBGMjIga2V5LiAqL1xuXHRWS19GMjI6IDEzMywgXG5cdC8qKiBGMjMga2V5LiAqL1xuXHRWS19GMjM6IDEzNCwgXG5cdC8qKiBGMjQga2V5LiAqL1xuXHRWS19GMjQ6IDEzNSwgXG5cdC8qKiBOdW0gTG9jayBrZXkuICovXG5cdFZLX05VTV9MT0NLOiAxNDQsIFxuXHQvKiogU2Nyb2xsIExvY2sga2V5LiAqL1xuXHRWS19TQ1JPTExfTE9DSzogMTQ1LCBcblx0LyoqIENpcmN1bWZsZXggKF4pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19DSVJDVU1GTEVYOiAxNjAsIFxuXHQvKiogRXhjbGFtYXRpb24gKCEpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19FWENMQU1BVElPTjogMTYxLCBcblx0LyoqIERvdWJsZSBxdW90ZSAoKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfRE9VQkxFX1FVT1RFOiAxNjIsIFxuXHQvKiogSGFzaCAoIykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0hBU0g6IDE2MywgXG5cdC8qKiBEb2xsYXIgc2lnbiAoJCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0RPTExBUjogMTY0LCBcblx0LyoqIFBlcmNlbnQgKCUpIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19QRVJDRU5UOiAxNjUsIFxuXHQvKiogQW1wZXJzYW5kICgmKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQU1QRVJTQU5EOiAxNjYsIFxuXHQvKiogVW5kZXJzY29yZSAoXykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1VOREVSU0NPUkU6IDE2NywgXG5cdC8qKiBPcGVuIHBhcmVudGhlc2lzICgoKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfT1BFTl9QQVJFTjogMTY4LCBcblx0LyoqIENsb3NlIHBhcmVudGhlc2lzICgpKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQ0xPU0VfUEFSRU46IDE2OSwgXG5cdC8qIEFzdGVyaXNrICgqKSBrZXkuIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQVNURVJJU0s6IDE3MCxcblx0LyoqIFBsdXMgKCspIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19QTFVTOiAxNzEsIFxuXHQvKiogUGlwZSAofCkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX1BJUEU6IDE3MiwgXG5cdC8qKiBIeXBoZW4tVVMvZG9jcy9NaW51cyAoLSkga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX0hZUEhFTl9NSU5VUzogMTczLCBcblx0LyoqIE9wZW4gY3VybHkgYnJhY2tldCAoeykga2V5LiBSZXF1aXJlcyBHZWNrbyAxNS4wICovXG5cdFZLX09QRU5fQ1VSTFlfQlJBQ0tFVDogMTc0LCBcblx0LyoqIENsb3NlIGN1cmx5IGJyYWNrZXQgKH0pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19DTE9TRV9DVVJMWV9CUkFDS0VUOiAxNzUsIFxuXHQvKiogVGlsZGUgKH4pIGtleS4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19USUxERTogMTc2LCBcblx0LyoqIENvbW1hICgsKSBrZXkuICovXG5cdFZLX0NPTU1BOiAxODgsIFxuXHQvKiogUGVyaW9kICguKSBrZXkuICovXG5cdFZLX1BFUklPRDogMTkwLCBcblx0LyoqIFNsYXNoICgvKSBrZXkuICovXG5cdFZLX1NMQVNIOiAxOTEsIFxuXHQvKiogQmFjayB0aWNrIChgKSBrZXkuICovXG5cdFZLX0JBQ0tfUVVPVEU6IDE5MiwgXG5cdC8qKiBPcGVuIHNxdWFyZSBicmFja2V0IChbKSBrZXkuICovXG5cdFZLX09QRU5fQlJBQ0tFVDogMjE5LCBcblx0LyoqIEJhY2sgc2xhc2ggKFxcKSBrZXkuICovXG5cdFZLX0JBQ0tfU0xBU0g6IDIyMCwgXG5cdC8qKiBDbG9zZSBzcXVhcmUgYnJhY2tldCAoXSkga2V5LiAqL1xuXHRWS19DTE9TRV9CUkFDS0VUOiAyMjEsIFxuXHQvKiogUXVvdGUgKCcnJykga2V5LiAqL1xuXHRWS19RVU9URTogMjIyLCBcblx0LyoqIE1ldGEga2V5IG9uIExpbnV4LCBDb21tYW5kIGtleSBvbiBNYWMuICovXG5cdFZLX01FVEE6IDIyNCwgXG5cdC8qKiBBbHRHciBrZXkgb24gTGludXguIFJlcXVpcmVzIEdlY2tvIDE1LjAgKi9cblx0VktfQUxUR1I6IDIyNSwgXG5cdC8qKiBXaW5kb3dzIGxvZ28ga2V5IG9uIFdpbmRvd3MuIE9yIFN1cGVyIG9yIEh5cGVyIGtleSBvbiBMaW51eC4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19XSU46IDkxLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19LQU5BOiAyMSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfSEFOR1VMOiAyMSwgXG5cdC8qKiDoi7HmlbAga2V5IG9uIEphcGFuZXNlIE1hYyBrZXlib2FyZC4gUmVxdWlyZXMgR2Vja28gMTUuMCAqL1xuXHRWS19FSVNVOiAyMiwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfSlVOSkE6IDIzLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19GSU5BTDogMjQsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0hBTkpBOiAyNSwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfS0FOSkk6IDI1LCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19DT05WRVJUOiAyOCwgXG5cdC8qKiBMaW51eCBzdXBwb3J0IGZvciB0aGlzIGtleWNvZGUgd2FzIGFkZGVkIGluIEdlY2tvIDQuMC4gKi9cblx0VktfTk9OQ09OVkVSVDogMjksIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0FDQ0VQVDogMzAsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX01PREVDSEFOR0U6IDMxLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19TRUxFQ1Q6IDQxLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLiAqL1xuXHRWS19QUklOVDogNDIsIFxuXHQvKiogTGludXggc3VwcG9ydCBmb3IgdGhpcyBrZXljb2RlIHdhcyBhZGRlZCBpbiBHZWNrbyA0LjAuICovXG5cdFZLX0VYRUNVVEU6IDQzLCBcblx0LyoqIExpbnV4IHN1cHBvcnQgZm9yIHRoaXMga2V5Y29kZSB3YXMgYWRkZWQgaW4gR2Vja28gNC4wLlx0ICovXG5cdFZLX1NMRUVQOiA5NSBcbn07XG4vKipcbiAqIEBuYW1lc3BhY2VcbiAqIENvbnRhaW5zIHRleHQgdG9rZW5pemF0aW9uIGFuZCBicmVha2luZyByb3V0aW5lc1xuICovXG5ST1QuVGV4dCA9IHtcblx0UkVfQ09MT1JTOiAvJShbYmNdKXsoW159XSopfS9nLFxuXG5cdC8qIHRva2VuIHR5cGVzICovXG5cdFRZUEVfVEVYVDpcdFx0MCxcblx0VFlQRV9ORVdMSU5FOlx0MSxcblx0VFlQRV9GRzpcdFx0Mixcblx0VFlQRV9CRzpcdFx0MyxcblxuXHQvKipcblx0ICogTWVhc3VyZSBzaXplIG9mIGEgcmVzdWx0aW5nIHRleHQgYmxvY2tcblx0ICovXG5cdG1lYXN1cmU6IGZ1bmN0aW9uKHN0ciwgbWF4V2lkdGgpIHtcblx0XHR2YXIgcmVzdWx0ID0ge3dpZHRoOjAsIGhlaWdodDoxfTtcblx0XHR2YXIgdG9rZW5zID0gdGhpcy50b2tlbml6ZShzdHIsIG1heFdpZHRoKTtcblx0XHR2YXIgbGluZVdpZHRoID0gMDtcblxuXHRcdGZvciAodmFyIGk9MDtpPHRva2Vucy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgdG9rZW4gPSB0b2tlbnNbaV07XG5cdFx0XHRzd2l0Y2ggKHRva2VuLnR5cGUpIHtcblx0XHRcdFx0Y2FzZSB0aGlzLlRZUEVfVEVYVDpcblx0XHRcdFx0XHRsaW5lV2lkdGggKz0gdG9rZW4udmFsdWUubGVuZ3RoO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIHRoaXMuVFlQRV9ORVdMSU5FOlxuXHRcdFx0XHRcdHJlc3VsdC5oZWlnaHQrKztcblx0XHRcdFx0XHRyZXN1bHQud2lkdGggPSBNYXRoLm1heChyZXN1bHQud2lkdGgsIGxpbmVXaWR0aCk7XG5cdFx0XHRcdFx0bGluZVdpZHRoID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJlc3VsdC53aWR0aCA9IE1hdGgubWF4KHJlc3VsdC53aWR0aCwgbGluZVdpZHRoKTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnZlcnQgc3RyaW5nIHRvIGEgc2VyaWVzIG9mIGEgZm9ybWF0dGluZyBjb21tYW5kc1xuXHQgKi9cblx0dG9rZW5pemU6IGZ1bmN0aW9uKHN0ciwgbWF4V2lkdGgpIHtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cblx0XHQvKiBmaXJzdCB0b2tlbml6YXRpb24gcGFzcyAtIHNwbGl0IHRleHRzIGFuZCBjb2xvciBmb3JtYXR0aW5nIGNvbW1hbmRzICovXG5cdFx0dmFyIG9mZnNldCA9IDA7XG5cdFx0c3RyLnJlcGxhY2UodGhpcy5SRV9DT0xPUlMsIGZ1bmN0aW9uKG1hdGNoLCB0eXBlLCBuYW1lLCBpbmRleCkge1xuXHRcdFx0Lyogc3RyaW5nIGJlZm9yZSAqL1xuXHRcdFx0dmFyIHBhcnQgPSBzdHIuc3Vic3RyaW5nKG9mZnNldCwgaW5kZXgpO1xuXHRcdFx0aWYgKHBhcnQubGVuZ3RoKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKHtcblx0XHRcdFx0XHR0eXBlOiBST1QuVGV4dC5UWVBFX1RFWFQsXG5cdFx0XHRcdFx0dmFsdWU6IHBhcnRcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qIGNvbG9yIGNvbW1hbmQgKi9cblx0XHRcdHJlc3VsdC5wdXNoKHtcblx0XHRcdFx0dHlwZTogKHR5cGUgPT0gXCJjXCIgPyBST1QuVGV4dC5UWVBFX0ZHIDogUk9ULlRleHQuVFlQRV9CRyksXG5cdFx0XHRcdHZhbHVlOiBuYW1lLnRyaW0oKVxuXHRcdFx0fSk7XG5cblx0XHRcdG9mZnNldCA9IGluZGV4ICsgbWF0Y2gubGVuZ3RoO1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fSk7XG5cblx0XHQvKiBsYXN0IHJlbWFpbmluZyBwYXJ0ICovXG5cdFx0dmFyIHBhcnQgPSBzdHIuc3Vic3RyaW5nKG9mZnNldCk7XG5cdFx0aWYgKHBhcnQubGVuZ3RoKSB7XG5cdFx0XHRyZXN1bHQucHVzaCh7XG5cdFx0XHRcdHR5cGU6IFJPVC5UZXh0LlRZUEVfVEVYVCxcblx0XHRcdFx0dmFsdWU6IHBhcnRcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9icmVha0xpbmVzKHJlc3VsdCwgbWF4V2lkdGgpO1xuXHR9LFxuXG5cdC8qIGluc2VydCBsaW5lIGJyZWFrcyBpbnRvIGZpcnN0LXBhc3MgdG9rZW5pemVkIGRhdGEgKi9cblx0X2JyZWFrTGluZXM6IGZ1bmN0aW9uKHRva2VucywgbWF4V2lkdGgpIHtcblx0XHRpZiAoIW1heFdpZHRoKSB7IG1heFdpZHRoID0gSW5maW5pdHk7IH07XG5cblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIGxpbmVMZW5ndGggPSAwO1xuXHRcdHZhciBsYXN0VG9rZW5XaXRoU3BhY2UgPSAtMTtcblxuXHRcdHdoaWxlIChpIDwgdG9rZW5zLmxlbmd0aCkgeyAvKiB0YWtlIGFsbCB0ZXh0IHRva2VucywgcmVtb3ZlIHNwYWNlLCBhcHBseSBsaW5lYnJlYWtzICovXG5cdFx0XHR2YXIgdG9rZW4gPSB0b2tlbnNbaV07XG5cdFx0XHRpZiAodG9rZW4udHlwZSA9PSBST1QuVGV4dC5UWVBFX05FV0xJTkUpIHsgLyogcmVzZXQgKi9cblx0XHRcdFx0bGluZUxlbmd0aCA9IDA7IFxuXHRcdFx0XHRsYXN0VG9rZW5XaXRoU3BhY2UgPSAtMTtcblx0XHRcdH1cblx0XHRcdGlmICh0b2tlbi50eXBlICE9IFJPVC5UZXh0LlRZUEVfVEVYVCkgeyAvKiBza2lwIG5vbi10ZXh0IHRva2VucyAqL1xuXHRcdFx0XHRpKys7XG5cdFx0XHRcdGNvbnRpbnVlOyBcblx0XHRcdH1cblxuXHRcdFx0LyogcmVtb3ZlIHNwYWNlcyBhdCB0aGUgYmVnaW5uaW5nIG9mIGxpbmUgKi9cblx0XHRcdHdoaWxlIChsaW5lTGVuZ3RoID09IDAgJiYgdG9rZW4udmFsdWUuY2hhckF0KDApID09IFwiIFwiKSB7IHRva2VuLnZhbHVlID0gdG9rZW4udmFsdWUuc3Vic3RyaW5nKDEpOyB9XG5cblx0XHRcdC8qIGZvcmNlZCBuZXdsaW5lPyBpbnNlcnQgdHdvIG5ldyB0b2tlbnMgYWZ0ZXIgdGhpcyBvbmUgKi9cblx0XHRcdHZhciBpbmRleCA9IHRva2VuLnZhbHVlLmluZGV4T2YoXCJcXG5cIik7XG5cdFx0XHRpZiAoaW5kZXggIT0gLTEpIHsgXG5cdFx0XHRcdHRva2VuLnZhbHVlID0gdGhpcy5fYnJlYWtJbnNpZGVUb2tlbih0b2tlbnMsIGksIGluZGV4LCB0cnVlKTsgXG5cblx0XHRcdFx0LyogaWYgdGhlcmUgYXJlIHNwYWNlcyBhdCB0aGUgZW5kLCB3ZSBtdXN0IHJlbW92ZSB0aGVtICh3ZSBkbyBub3Qgd2FudCB0aGUgbGluZSB0b28gbG9uZykgKi9cblx0XHRcdFx0dmFyIGFyciA9IHRva2VuLnZhbHVlLnNwbGl0KFwiXCIpO1xuXHRcdFx0XHR3aGlsZSAoYXJyW2Fyci5sZW5ndGgtMV0gPT0gXCIgXCIpIHsgYXJyLnBvcCgpOyB9XG5cdFx0XHRcdHRva2VuLnZhbHVlID0gYXJyLmpvaW4oXCJcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8qIHRva2VuIGRlZ2VuZXJhdGVkPyAqL1xuXHRcdFx0aWYgKCF0b2tlbi52YWx1ZS5sZW5ndGgpIHtcblx0XHRcdFx0dG9rZW5zLnNwbGljZShpLCAxKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChsaW5lTGVuZ3RoICsgdG9rZW4udmFsdWUubGVuZ3RoID4gbWF4V2lkdGgpIHsgLyogbGluZSB0b28gbG9uZywgZmluZCBhIHN1aXRhYmxlIGJyZWFraW5nIHNwb3QgKi9cblxuXHRcdFx0XHQvKiBpcyBpdCBwb3NzaWJsZSB0byBicmVhayB3aXRoaW4gdGhpcyB0b2tlbj8gKi9cblx0XHRcdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0XHRcdHdoaWxlICgxKSB7XG5cdFx0XHRcdFx0dmFyIG5leHRJbmRleCA9IHRva2VuLnZhbHVlLmluZGV4T2YoXCIgXCIsIGluZGV4KzEpO1xuXHRcdFx0XHRcdGlmIChuZXh0SW5kZXggPT0gLTEpIHsgYnJlYWs7IH1cblx0XHRcdFx0XHRpZiAobGluZUxlbmd0aCArIG5leHRJbmRleCA+IG1heFdpZHRoKSB7IGJyZWFrOyB9XG5cdFx0XHRcdFx0aW5kZXggPSBuZXh0SW5kZXg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaW5kZXggIT0gLTEpIHsgLyogYnJlYWsgYXQgc3BhY2Ugd2l0aGluIHRoaXMgb25lICovXG5cdFx0XHRcdFx0dG9rZW4udmFsdWUgPSB0aGlzLl9icmVha0luc2lkZVRva2VuKHRva2VucywgaSwgaW5kZXgsIHRydWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGxhc3RUb2tlbldpdGhTcGFjZSAhPSAtMSkgeyAvKiBpcyB0aGVyZSBhIHByZXZpb3VzIHRva2VuIHdoZXJlIGEgYnJlYWsgY2FuIG9jY3VyPyAqL1xuXHRcdFx0XHRcdHZhciB0b2tlbiA9IHRva2Vuc1tsYXN0VG9rZW5XaXRoU3BhY2VdO1xuXHRcdFx0XHRcdHZhciBicmVha0luZGV4ID0gdG9rZW4udmFsdWUubGFzdEluZGV4T2YoXCIgXCIpO1xuXHRcdFx0XHRcdHRva2VuLnZhbHVlID0gdGhpcy5fYnJlYWtJbnNpZGVUb2tlbih0b2tlbnMsIGxhc3RUb2tlbldpdGhTcGFjZSwgYnJlYWtJbmRleCwgdHJ1ZSk7XG5cdFx0XHRcdFx0aSA9IGxhc3RUb2tlbldpdGhTcGFjZTtcblx0XHRcdFx0fSBlbHNlIHsgLyogZm9yY2UgYnJlYWsgaW4gdGhpcyB0b2tlbiAqL1xuXHRcdFx0XHRcdHRva2VuLnZhbHVlID0gdGhpcy5fYnJlYWtJbnNpZGVUb2tlbih0b2tlbnMsIGksIG1heFdpZHRoLWxpbmVMZW5ndGgsIGZhbHNlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2UgeyAvKiBsaW5lIG5vdCBsb25nLCBjb250aW51ZSAqL1xuXHRcdFx0XHRsaW5lTGVuZ3RoICs9IHRva2VuLnZhbHVlLmxlbmd0aDtcblx0XHRcdFx0aWYgKHRva2VuLnZhbHVlLmluZGV4T2YoXCIgXCIpICE9IC0xKSB7IGxhc3RUb2tlbldpdGhTcGFjZSA9IGk7IH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aSsrOyAvKiBhZHZhbmNlIHRvIG5leHQgdG9rZW4gKi9cblx0XHR9XG5cblxuXHRcdHRva2Vucy5wdXNoKHt0eXBlOiBST1QuVGV4dC5UWVBFX05FV0xJTkV9KTsgLyogaW5zZXJ0IGZha2UgbmV3bGluZSB0byBmaXggdGhlIGxhc3QgdGV4dCBsaW5lICovXG5cblx0XHQvKiByZW1vdmUgdHJhaWxpbmcgc3BhY2UgZnJvbSB0ZXh0IHRva2VucyBiZWZvcmUgbmV3bGluZXMgKi9cblx0XHR2YXIgbGFzdFRleHRUb2tlbiA9IG51bGw7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dG9rZW5zLmxlbmd0aDtpKyspIHtcblx0XHRcdHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcblx0XHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xuXHRcdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfVEVYVDogbGFzdFRleHRUb2tlbiA9IHRva2VuOyBicmVhaztcblx0XHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX05FV0xJTkU6IFxuXHRcdFx0XHRcdGlmIChsYXN0VGV4dFRva2VuKSB7IC8qIHJlbW92ZSB0cmFpbGluZyBzcGFjZSAqL1xuXHRcdFx0XHRcdFx0dmFyIGFyciA9IGxhc3RUZXh0VG9rZW4udmFsdWUuc3BsaXQoXCJcIik7XG5cdFx0XHRcdFx0XHR3aGlsZSAoYXJyW2Fyci5sZW5ndGgtMV0gPT0gXCIgXCIpIHsgYXJyLnBvcCgpOyB9XG5cdFx0XHRcdFx0XHRsYXN0VGV4dFRva2VuLnZhbHVlID0gYXJyLmpvaW4oXCJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGxhc3RUZXh0VG9rZW4gPSBudWxsO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0b2tlbnMucG9wKCk7IC8qIHJlbW92ZSBmYWtlIHRva2VuICovXG5cblx0XHRyZXR1cm4gdG9rZW5zO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgbmV3IHRva2VucyBhbmQgaW5zZXJ0IHRoZW0gaW50byB0aGUgc3RyZWFtXG5cdCAqIEBwYXJhbSB7b2JqZWN0W119IHRva2Vuc1xuXHQgKiBAcGFyYW0ge2ludH0gdG9rZW5JbmRleCBUb2tlbiBiZWluZyBwcm9jZXNzZWRcblx0ICogQHBhcmFtIHtpbnR9IGJyZWFrSW5kZXggSW5kZXggd2l0aGluIGN1cnJlbnQgdG9rZW4ncyB2YWx1ZVxuXHQgKiBAcGFyYW0ge2Jvb2x9IHJlbW92ZUJyZWFrQ2hhciBEbyB3ZSB3YW50IHRvIHJlbW92ZSB0aGUgYnJlYWtpbmcgY2hhcmFjdGVyP1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSByZW1haW5pbmcgdW5icm9rZW4gdG9rZW4gdmFsdWVcblx0ICovXG5cdF9icmVha0luc2lkZVRva2VuOiBmdW5jdGlvbih0b2tlbnMsIHRva2VuSW5kZXgsIGJyZWFrSW5kZXgsIHJlbW92ZUJyZWFrQ2hhcikge1xuXHRcdHZhciBuZXdCcmVha1Rva2VuID0ge1xuXHRcdFx0dHlwZTogUk9ULlRleHQuVFlQRV9ORVdMSU5FXG5cdFx0fVxuXHRcdHZhciBuZXdUZXh0VG9rZW4gPSB7XG5cdFx0XHR0eXBlOiBST1QuVGV4dC5UWVBFX1RFWFQsXG5cdFx0XHR2YWx1ZTogdG9rZW5zW3Rva2VuSW5kZXhdLnZhbHVlLnN1YnN0cmluZyhicmVha0luZGV4ICsgKHJlbW92ZUJyZWFrQ2hhciA/IDEgOiAwKSlcblx0XHR9XG5cdFx0dG9rZW5zLnNwbGljZSh0b2tlbkluZGV4KzEsIDAsIG5ld0JyZWFrVG9rZW4sIG5ld1RleHRUb2tlbik7XG5cdFx0cmV0dXJuIHRva2Vuc1t0b2tlbkluZGV4XS52YWx1ZS5zdWJzdHJpbmcoMCwgYnJlYWtJbmRleCk7XG5cdH1cbn1cbi8qKlxuICogQHJldHVybnMge2FueX0gUmFuZG9tbHkgcGlja2VkIGl0ZW0sIG51bGwgd2hlbiBsZW5ndGg9MFxuICovXG5BcnJheS5wcm90b3R5cGUucmFuZG9tID0gZnVuY3Rpb24oKSB7XG5cdGlmICghdGhpcy5sZW5ndGgpIHsgcmV0dXJuIG51bGw7IH1cblx0cmV0dXJuIHRoaXNbTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIHRoaXMubGVuZ3RoKV07XG59XG5cbi8qKlxuICogQHJldHVybnMge2FycmF5fSBOZXcgYXJyYXkgd2l0aCByYW5kb21pemVkIGl0ZW1zXG4gKiBGSVhNRSBkZXN0cm95cyB0aGlzIVxuICovXG5BcnJheS5wcm90b3R5cGUucmFuZG9taXplID0gZnVuY3Rpb24oKSB7XG5cdHZhciByZXN1bHQgPSBbXTtcblx0d2hpbGUgKHRoaXMubGVuZ3RoKSB7XG5cdFx0dmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKHRoaXMucmFuZG9tKCkpO1xuXHRcdHJlc3VsdC5wdXNoKHRoaXMuc3BsaWNlKGluZGV4LCAxKVswXSk7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogQWx3YXlzIHBvc2l0aXZlIG1vZHVsdXNcbiAqIEBwYXJhbSB7aW50fSBuIE1vZHVsdXNcbiAqIEByZXR1cm5zIHtpbnR9IHRoaXMgbW9kdWxvIG5cbiAqL1xuTnVtYmVyLnByb3RvdHlwZS5tb2QgPSBmdW5jdGlvbihuKSB7XG5cdHJldHVybiAoKHRoaXMlbikrbiklbjtcbn1cbi8qKlxuICogQHJldHVybnMge3N0cmluZ30gRmlyc3QgbGV0dGVyIGNhcGl0YWxpemVkXG4gKi9cblN0cmluZy5wcm90b3R5cGUuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuc3Vic3RyaW5nKDEpO1xufVxuXG4vKiogXG4gKiBMZWZ0IHBhZFxuICogQHBhcmFtIHtzdHJpbmd9IFtjaGFyYWN0ZXI9XCIwXCJdXG4gKiBAcGFyYW0ge2ludH0gW2NvdW50PTJdXG4gKi9cblN0cmluZy5wcm90b3R5cGUubHBhZCA9IGZ1bmN0aW9uKGNoYXJhY3RlciwgY291bnQpIHtcblx0dmFyIGNoID0gY2hhcmFjdGVyIHx8IFwiMFwiO1xuXHR2YXIgY250ID0gY291bnQgfHwgMjtcblxuXHR2YXIgcyA9IFwiXCI7XG5cdHdoaWxlIChzLmxlbmd0aCA8IChjbnQgLSB0aGlzLmxlbmd0aCkpIHsgcyArPSBjaDsgfVxuXHRzID0gcy5zdWJzdHJpbmcoMCwgY250LXRoaXMubGVuZ3RoKTtcblx0cmV0dXJuIHMrdGhpcztcbn1cblxuLyoqIFxuICogUmlnaHQgcGFkXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NoYXJhY3Rlcj1cIjBcIl1cbiAqIEBwYXJhbSB7aW50fSBbY291bnQ9Ml1cbiAqL1xuU3RyaW5nLnByb3RvdHlwZS5ycGFkID0gZnVuY3Rpb24oY2hhcmFjdGVyLCBjb3VudCkge1xuXHR2YXIgY2ggPSBjaGFyYWN0ZXIgfHwgXCIwXCI7XG5cdHZhciBjbnQgPSBjb3VudCB8fCAyO1xuXG5cdHZhciBzID0gXCJcIjtcblx0d2hpbGUgKHMubGVuZ3RoIDwgKGNudCAtIHRoaXMubGVuZ3RoKSkgeyBzICs9IGNoOyB9XG5cdHMgPSBzLnN1YnN0cmluZygwLCBjbnQtdGhpcy5sZW5ndGgpO1xuXHRyZXR1cm4gdGhpcytzO1xufVxuXG4vKipcbiAqIEZvcm1hdCBhIHN0cmluZyBpbiBhIGZsZXhpYmxlIHdheS4gU2NhbnMgZm9yICVzIHN0cmluZ3MgYW5kIHJlcGxhY2VzIHRoZW0gd2l0aCBhcmd1bWVudHMuIExpc3Qgb2YgcGF0dGVybnMgaXMgbW9kaWZpYWJsZSB2aWEgU3RyaW5nLmZvcm1hdC5tYXAuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGVtcGxhdGVcbiAqIEBwYXJhbSB7YW55fSBbYXJndl1cbiAqL1xuU3RyaW5nLmZvcm1hdCA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG5cdHZhciBtYXAgPSBTdHJpbmcuZm9ybWF0Lm1hcDtcblx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG5cdHZhciByZXBsYWNlciA9IGZ1bmN0aW9uKG1hdGNoLCBncm91cDEsIGdyb3VwMiwgaW5kZXgpIHtcblx0XHRpZiAodGVtcGxhdGUuY2hhckF0KGluZGV4LTEpID09IFwiJVwiKSB7IHJldHVybiBtYXRjaC5zdWJzdHJpbmcoMSk7IH1cblx0XHRpZiAoIWFyZ3MubGVuZ3RoKSB7IHJldHVybiBtYXRjaDsgfVxuXHRcdHZhciBvYmogPSBhcmdzWzBdO1xuXG5cdFx0dmFyIGdyb3VwID0gZ3JvdXAxIHx8IGdyb3VwMjtcblx0XHR2YXIgcGFydHMgPSBncm91cC5zcGxpdChcIixcIik7XG5cdFx0dmFyIG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuXHRcdHZhciBtZXRob2QgPSBtYXBbbmFtZS50b0xvd2VyQ2FzZSgpXTtcblx0XHRpZiAoIW1ldGhvZCkgeyByZXR1cm4gbWF0Y2g7IH1cblxuXHRcdHZhciBvYmogPSBhcmdzLnNoaWZ0KCk7XG5cdFx0dmFyIHJlcGxhY2VkID0gb2JqW21ldGhvZF0uYXBwbHkob2JqLCBwYXJ0cyk7XG5cblx0XHR2YXIgZmlyc3QgPSBuYW1lLmNoYXJBdCgwKTtcblx0XHRpZiAoZmlyc3QgIT0gZmlyc3QudG9Mb3dlckNhc2UoKSkgeyByZXBsYWNlZCA9IHJlcGxhY2VkLmNhcGl0YWxpemUoKTsgfVxuXG5cdFx0cmV0dXJuIHJlcGxhY2VkO1xuXHR9XG5cdHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKC8lKD86KFthLXpdKyl8KD86eyhbXn1dKyl9KSkvZ2ksIHJlcGxhY2VyKTtcbn1cblxuU3RyaW5nLmZvcm1hdC5tYXAgPSB7XG5cdFwic1wiOiBcInRvU3RyaW5nXCJcbn1cblxuLyoqXG4gKiBDb252ZW5pZW5jZSBzaG9ydGN1dCB0byBTdHJpbmcuZm9ybWF0KHRoaXMpXG4gKi9cblN0cmluZy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0YXJncy51bnNoaWZ0KHRoaXMpO1xuXHRyZXR1cm4gU3RyaW5nLmZvcm1hdC5hcHBseShTdHJpbmcsIGFyZ3MpO1xufVxuXG5pZiAoIU9iamVjdC5jcmVhdGUpIHsgIFxuXHQvKipcblx0ICogRVM1IE9iamVjdC5jcmVhdGVcblx0ICovXG5cdE9iamVjdC5jcmVhdGUgPSBmdW5jdGlvbihvKSB7ICBcblx0XHR2YXIgdG1wID0gZnVuY3Rpb24oKSB7fTtcblx0XHR0bXAucHJvdG90eXBlID0gbztcblx0XHRyZXR1cm4gbmV3IHRtcCgpO1xuXHR9OyAgXG59ICBcbi8qKlxuICogU2V0cyBwcm90b3R5cGUgb2YgdGhpcyBmdW5jdGlvbiB0byBhbiBpbnN0YW5jZSBvZiBwYXJlbnQgZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmVudFxuICovXG5GdW5jdGlvbi5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24ocGFyZW50KSB7XG5cdHRoaXMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcblx0dGhpcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB0aGlzO1xuXHRyZXR1cm4gdGhpcztcbn1cbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPVxuXHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0fHwgZnVuY3Rpb24oY2IpIHsgcmV0dXJuIHNldFRpbWVvdXQoY2IsIDEwMDAvNjApOyB9O1xuXG53aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPVxuXHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWVcblx0fHwgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuXHR8fCB3aW5kb3cub0NhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lXG5cdHx8IGZ1bmN0aW9uKGlkKSB7IHJldHVybiBjbGVhclRpbWVvdXQoaWQpOyB9O1xuLyoqXG4gKiBAY2xhc3MgVmlzdWFsIG1hcCBkaXNwbGF5XG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMud2lkdGg9Uk9ULkRFRkFVTFRfV0lEVEhdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMuaGVpZ2h0PVJPVC5ERUZBVUxUX0hFSUdIVF1cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5mb250U2l6ZT0xNV1cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5mb250RmFtaWx5PVwibW9ub3NwYWNlXCJdXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZm9udFN0eWxlPVwiXCJdIGJvbGQvaXRhbGljL25vbmUvYm90aFxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmZnPVwiI2NjY1wiXVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmJnPVwiIzAwMFwiXVxuICogQHBhcmFtIHtmbG9hdH0gW29wdGlvbnMuc3BhY2luZz0xXVxuICogQHBhcmFtIHtmbG9hdH0gW29wdGlvbnMuYm9yZGVyPTBdXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubGF5b3V0PVwicmVjdFwiXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRpbGVXaWR0aD0zMl1cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy50aWxlSGVpZ2h0PTMyXVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnRpbGVNYXA9e31dXG4gKiBAcGFyYW0ge2ltYWdlfSBbb3B0aW9ucy50aWxlU2V0PW51bGxdXG4gKi9cblJPVC5EaXNwbGF5ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcblx0dGhpcy5fY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdHRoaXMuX2RhdGEgPSB7fTtcblx0dGhpcy5fZGlydHkgPSBmYWxzZTsgLyogZmFsc2UgPSBub3RoaW5nLCB0cnVlID0gYWxsLCBvYmplY3QgPSBkaXJ0eSBjZWxscyAqL1xuXHR0aGlzLl9vcHRpb25zID0ge307XG5cdHRoaXMuX2JhY2tlbmQgPSBudWxsO1xuXHRcblx0dmFyIGRlZmF1bHRPcHRpb25zID0ge1xuXHRcdHdpZHRoOiBST1QuREVGQVVMVF9XSURUSCxcblx0XHRoZWlnaHQ6IFJPVC5ERUZBVUxUX0hFSUdIVCxcblx0XHRsYXlvdXQ6IFwicmVjdFwiLFxuXHRcdGZvbnRTaXplOiAxNSxcblx0XHRzcGFjaW5nOiAxLFxuXHRcdGJvcmRlcjogMCxcblx0XHRmb250RmFtaWx5OiBcIm1vbm9zcGFjZVwiLFxuXHRcdGZvbnRTdHlsZTogXCJcIixcblx0XHRmZzogXCIjY2NjXCIsXG5cdFx0Ymc6IFwiIzAwMFwiLFxuXHRcdHRpbGVXaWR0aDogMzIsXG5cdFx0dGlsZUhlaWdodDogMzIsXG5cdFx0dGlsZU1hcDoge30sXG5cdFx0dGlsZVNldDogbnVsbCxcblx0XHR0ZXJtQ29sb3I6IFwieHRlcm1cIlxuXHR9O1xuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgZGVmYXVsdE9wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cdHRoaXMuc2V0T3B0aW9ucyhkZWZhdWx0T3B0aW9ucyk7XG5cdHRoaXMuREVCVUcgPSB0aGlzLkRFQlVHLmJpbmQodGhpcyk7XG5cblx0dGhpcy5fdGljayA9IHRoaXMuX3RpY2suYmluZCh0aGlzKTtcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3RpY2spO1xufVxuXG4vKipcbiAqIERlYnVnIGhlbHBlciwgaWRlYWwgYXMgYSBtYXAgZ2VuZXJhdG9yIGNhbGxiYWNrLiBBbHdheXMgYm91bmQgdG8gdGhpcy5cbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IHdoYXRcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLkRFQlVHID0gZnVuY3Rpb24oeCwgeSwgd2hhdCkge1xuXHR2YXIgY29sb3JzID0gW3RoaXMuX29wdGlvbnMuYmcsIHRoaXMuX29wdGlvbnMuZmddO1xuXHR0aGlzLmRyYXcoeCwgeSwgbnVsbCwgbnVsbCwgY29sb3JzW3doYXQgJSBjb2xvcnMubGVuZ3RoXSk7XG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHdob2xlIGRpc3BsYXkgKGNvdmVyIGl0IHdpdGggYmFja2dyb3VuZCBjb2xvcilcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2RhdGEgPSB7fTtcblx0dGhpcy5fZGlydHkgPSB0cnVlO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULkRpc3BsYXlcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXHRpZiAob3B0aW9ucy53aWR0aCB8fCBvcHRpb25zLmhlaWdodCB8fCBvcHRpb25zLmZvbnRTaXplIHx8IG9wdGlvbnMuZm9udEZhbWlseSB8fCBvcHRpb25zLnNwYWNpbmcgfHwgb3B0aW9ucy5sYXlvdXQpIHtcblx0XHRpZiAob3B0aW9ucy5sYXlvdXQpIHsgXG5cdFx0XHR0aGlzLl9iYWNrZW5kID0gbmV3IFJPVC5EaXNwbGF5W29wdGlvbnMubGF5b3V0LmNhcGl0YWxpemUoKV0odGhpcy5fY29udGV4dCk7XG5cdFx0fVxuXG5cdFx0dmFyIGZvbnQgPSAodGhpcy5fb3B0aW9ucy5mb250U3R5bGUgPyB0aGlzLl9vcHRpb25zLmZvbnRTdHlsZSArIFwiIFwiIDogXCJcIikgKyB0aGlzLl9vcHRpb25zLmZvbnRTaXplICsgXCJweCBcIiArIHRoaXMuX29wdGlvbnMuZm9udEZhbWlseTtcblx0XHR0aGlzLl9jb250ZXh0LmZvbnQgPSBmb250O1xuXHRcdHRoaXMuX2JhY2tlbmQuY29tcHV0ZSh0aGlzLl9vcHRpb25zKTtcblx0XHR0aGlzLl9jb250ZXh0LmZvbnQgPSBmb250O1xuXHRcdHRoaXMuX2NvbnRleHQudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcblx0XHR0aGlzLl9jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG5cdFx0dGhpcy5fZGlydHkgPSB0cnVlO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJldHVybnMgY3VycmVudGx5IHNldCBvcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBDdXJyZW50IG9wdGlvbnMgb2JqZWN0IFxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fb3B0aW9ucztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBET00gbm9kZSBvZiB0aGlzIGRpc3BsYXlcbiAqIEByZXR1cm5zIHtub2RlfSBET00gbm9kZVxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZ2V0Q29udGFpbmVyID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl9jb250ZXh0LmNhbnZhcztcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBtYXhpbXVtIHdpZHRoL2hlaWdodCB0byBmaXQgaW50byBhIHNldCBvZiBnaXZlbiBjb25zdHJhaW50c1xuICogQHBhcmFtIHtpbnR9IGF2YWlsV2lkdGggTWF4aW11bSBhbGxvd2VkIHBpeGVsIHdpZHRoXG4gKiBAcGFyYW0ge2ludH0gYXZhaWxIZWlnaHQgTWF4aW11bSBhbGxvd2VkIHBpeGVsIGhlaWdodFxuICogQHJldHVybnMge2ludFsyXX0gY2VsbFdpZHRoLGNlbGxIZWlnaHRcbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmNvbXB1dGVTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0cmV0dXJuIHRoaXMuX2JhY2tlbmQuY29tcHV0ZVNpemUoYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQsIHRoaXMuX29wdGlvbnMpO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIG1heGltdW0gZm9udCBzaXplIHRvIGZpdCBpbnRvIGEgc2V0IG9mIGdpdmVuIGNvbnN0cmFpbnRzXG4gKiBAcGFyYW0ge2ludH0gYXZhaWxXaWR0aCBNYXhpbXVtIGFsbG93ZWQgcGl4ZWwgd2lkdGhcbiAqIEBwYXJhbSB7aW50fSBhdmFpbEhlaWdodCBNYXhpbXVtIGFsbG93ZWQgcGl4ZWwgaGVpZ2h0XG4gKiBAcmV0dXJucyB7aW50fSBmb250U2l6ZVxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuY29tcHV0ZUZvbnRTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0cmV0dXJuIHRoaXMuX2JhY2tlbmQuY29tcHV0ZUZvbnRTaXplKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0LCB0aGlzLl9vcHRpb25zKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgRE9NIGV2ZW50IChtb3VzZSBvciB0b3VjaCkgdG8gbWFwIGNvb3JkaW5hdGVzLiBVc2VzIGZpcnN0IHRvdWNoIGZvciBtdWx0aS10b3VjaC5cbiAqIEBwYXJhbSB7RXZlbnR9IGUgZXZlbnRcbiAqIEByZXR1cm5zIHtpbnRbMl19IC0xIGZvciB2YWx1ZXMgb3V0c2lkZSBvZiB0aGUgY2FudmFzXG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbihlKSB7XG5cdGlmIChlLnRvdWNoZXMpIHtcblx0XHR2YXIgeCA9IGUudG91Y2hlc1swXS5jbGllbnRYO1xuXHRcdHZhciB5ID0gZS50b3VjaGVzWzBdLmNsaWVudFk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIHggPSBlLmNsaWVudFg7XG5cdFx0dmFyIHkgPSBlLmNsaWVudFk7XG5cdH1cblxuXHR2YXIgcmVjdCA9IHRoaXMuX2NvbnRleHQuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHR4IC09IHJlY3QubGVmdDtcblx0eSAtPSByZWN0LnRvcDtcblx0XG5cdGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoIHx8IHkgPj0gdGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0KSB7IHJldHVybiBbLTEsIC0xXTsgfVxuXG5cdHJldHVybiB0aGlzLl9iYWNrZW5kLmV2ZW50VG9Qb3NpdGlvbih4LCB5KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7c3RyaW5nIHx8IHN0cmluZ1tdfSBjaCBPbmUgb3IgbW9yZSBjaGFycyAod2lsbCBiZSBvdmVybGFwcGluZyB0aGVtc2VsdmVzKVxuICogQHBhcmFtIHtzdHJpbmd9IFtmZ10gZm9yZWdyb3VuZCBjb2xvclxuICogQHBhcmFtIHtzdHJpbmd9IFtiZ10gYmFja2dyb3VuZCBjb2xvclxuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHgsIHksIGNoLCBmZywgYmcpIHtcblx0aWYgKCFmZykgeyBmZyA9IHRoaXMuX29wdGlvbnMuZmc7IH1cblx0aWYgKCFiZykgeyBiZyA9IHRoaXMuX29wdGlvbnMuYmc7IH1cblx0dGhpcy5fZGF0YVt4K1wiLFwiK3ldID0gW3gsIHksIGNoLCBmZywgYmddO1xuXHRcblx0aWYgKHRoaXMuX2RpcnR5ID09PSB0cnVlKSB7IHJldHVybjsgfSAvKiB3aWxsIGFscmVhZHkgcmVkcmF3IGV2ZXJ5dGhpbmcgKi9cblx0aWYgKCF0aGlzLl9kaXJ0eSkgeyB0aGlzLl9kaXJ0eSA9IHt9OyB9IC8qIGZpcnN0ISAqL1xuXHR0aGlzLl9kaXJ0eVt4K1wiLFwiK3ldID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEcmF3cyBhIHRleHQgYXQgZ2l2ZW4gcG9zaXRpb24uIE9wdGlvbmFsbHkgd3JhcHMgYXQgYSBtYXhpbXVtIGxlbmd0aC4gQ3VycmVudGx5IGRvZXMgbm90IHdvcmsgd2l0aCBoZXggbGF5b3V0LlxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBNYXkgY29udGFpbiBjb2xvci9iYWNrZ3JvdW5kIGZvcm1hdCBzcGVjaWZpZXJzLCAlY3tuYW1lfS8lYntuYW1lfSwgYm90aCBvcHRpb25hbC4gJWN7fS8lYnt9IHJlc2V0cyB0byBkZWZhdWx0LlxuICogQHBhcmFtIHtpbnR9IFttYXhXaWR0aF0gd3JhcCBhdCB3aGF0IHdpZHRoP1xuICogQHJldHVybnMge2ludH0gbGluZXMgZHJhd25cbiAqL1xuUk9ULkRpc3BsYXkucHJvdG90eXBlLmRyYXdUZXh0ID0gZnVuY3Rpb24oeCwgeSwgdGV4dCwgbWF4V2lkdGgpIHtcblx0dmFyIGZnID0gbnVsbDtcblx0dmFyIGJnID0gbnVsbDtcblx0dmFyIGN4ID0geDtcblx0dmFyIGN5ID0geTtcblx0dmFyIGxpbmVzID0gMTtcblx0aWYgKCFtYXhXaWR0aCkgeyBtYXhXaWR0aCA9IHRoaXMuX29wdGlvbnMud2lkdGgteDsgfVxuXG5cdHZhciB0b2tlbnMgPSBST1QuVGV4dC50b2tlbml6ZSh0ZXh0LCBtYXhXaWR0aCk7XG5cblx0d2hpbGUgKHRva2Vucy5sZW5ndGgpIHsgLyogaW50ZXJwcmV0IHRva2VuaXplZCBvcGNvZGUgc3RyZWFtICovXG5cdFx0dmFyIHRva2VuID0gdG9rZW5zLnNoaWZ0KCk7XG5cdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XG5cdFx0XHRjYXNlIFJPVC5UZXh0LlRZUEVfVEVYVDpcblx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8dG9rZW4udmFsdWUubGVuZ3RoO2krKykge1xuXHRcdFx0XHRcdHRoaXMuZHJhdyhjeCsrLCBjeSwgdG9rZW4udmFsdWUuY2hhckF0KGkpLCBmZywgYmcpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX0ZHOlxuXHRcdFx0XHRmZyA9IHRva2VuLnZhbHVlIHx8IG51bGw7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX0JHOlxuXHRcdFx0XHRiZyA9IHRva2VuLnZhbHVlIHx8IG51bGw7XG5cdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBST1QuVGV4dC5UWVBFX05FV0xJTkU6XG5cdFx0XHRcdGN4ID0geDtcblx0XHRcdFx0Y3krKztcblx0XHRcdFx0bGluZXMrK1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGxpbmVzO1xufVxuXG4vKipcbiAqIFRpbWVyIHRpY2s6IHVwZGF0ZSBkaXJ0eSBwYXJ0c1xuICovXG5ST1QuRGlzcGxheS5wcm90b3R5cGUuX3RpY2sgPSBmdW5jdGlvbigpIHtcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3RpY2spO1xuXG5cdGlmICghdGhpcy5fZGlydHkpIHsgcmV0dXJuOyB9XG5cblx0aWYgKHRoaXMuX2RpcnR5ID09PSB0cnVlKSB7IC8qIGRyYXcgYWxsICovXG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLl9vcHRpb25zLmJnO1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5fY29udGV4dC5jYW52YXMud2lkdGgsIHRoaXMuX2NvbnRleHQuY2FudmFzLmhlaWdodCk7XG5cblx0XHRmb3IgKHZhciBpZCBpbiB0aGlzLl9kYXRhKSB7IC8qIHJlZHJhdyBjYWNoZWQgZGF0YSAqL1xuXHRcdFx0dGhpcy5fZHJhdyhpZCwgZmFsc2UpO1xuXHRcdH1cblxuXHR9IGVsc2UgeyAvKiBkcmF3IG9ubHkgZGlydHkgKi9cblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fZGlydHkpIHtcblx0XHRcdHRoaXMuX2RyYXcoa2V5LCB0cnVlKTtcblx0XHR9XG5cdH1cblxuXHR0aGlzLl9kaXJ0eSA9IGZhbHNlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgV2hhdCB0byBkcmF3XG4gKiBAcGFyYW0ge2Jvb2x9IGNsZWFyQmVmb3JlIElzIGl0IG5lY2Vzc2FyeSB0byBjbGVhbiBiZWZvcmU/XG4gKi9cblJPVC5EaXNwbGF5LnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uKGtleSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIGRhdGEgPSB0aGlzLl9kYXRhW2tleV07XG5cdGlmIChkYXRhWzRdICE9IHRoaXMuX29wdGlvbnMuYmcpIHsgY2xlYXJCZWZvcmUgPSB0cnVlOyB9XG5cblx0dGhpcy5fYmFja2VuZC5kcmF3KGRhdGEsIGNsZWFyQmVmb3JlKTtcbn1cbi8qKlxuICogQGNsYXNzIEFic3RyYWN0IGRpc3BsYXkgYmFja2VuZCBtb2R1bGVcbiAqIEBwcml2YXRlXG4gKi9cblJPVC5EaXNwbGF5LkJhY2tlbmQgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcbn1cblxuUk9ULkRpc3BsYXkuQmFja2VuZC5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5jb21wdXRlRm9udFNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xufVxuXG5ST1QuRGlzcGxheS5CYWNrZW5kLnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XG59XG4vKipcbiAqIEBjbGFzcyBSZWN0YW5ndWxhciBiYWNrZW5kXG4gKiBAcHJpdmF0ZVxuICovXG5ST1QuRGlzcGxheS5SZWN0ID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRST1QuRGlzcGxheS5CYWNrZW5kLmNhbGwodGhpcywgY29udGV4dCk7XG5cdFxuXHR0aGlzLl9zcGFjaW5nWCA9IDA7XG5cdHRoaXMuX3NwYWNpbmdZID0gMDtcblx0dGhpcy5fY2FudmFzQ2FjaGUgPSB7fTtcblx0dGhpcy5fb3B0aW9ucyA9IHt9O1xufVxuUk9ULkRpc3BsYXkuUmVjdC5leHRlbmQoUk9ULkRpc3BsYXkuQmFja2VuZCk7XG5cblJPVC5EaXNwbGF5LlJlY3QuY2FjaGUgPSBmYWxzZTtcblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0dGhpcy5fY2FudmFzQ2FjaGUgPSB7fTtcblx0dGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0dmFyIGNoYXJXaWR0aCA9IE1hdGguY2VpbCh0aGlzLl9jb250ZXh0Lm1lYXN1cmVUZXh0KFwiV1wiKS53aWR0aCk7XG5cdHRoaXMuX3NwYWNpbmdYID0gTWF0aC5jZWlsKG9wdGlvbnMuc3BhY2luZyAqIGNoYXJXaWR0aCk7XG5cdHRoaXMuX3NwYWNpbmdZID0gTWF0aC5jZWlsKG9wdGlvbnMuc3BhY2luZyAqIG9wdGlvbnMuZm9udFNpemUpO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy53aWR0aCA9IG9wdGlvbnMud2lkdGggKiB0aGlzLl9zcGFjaW5nWDtcblx0dGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgKiB0aGlzLl9zcGFjaW5nWTtcbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG5cdGlmICh0aGlzLmNvbnN0cnVjdG9yLmNhY2hlKSB7XG5cdFx0dGhpcy5fZHJhd1dpdGhDYWNoZShkYXRhLCBjbGVhckJlZm9yZSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5fZHJhd05vQ2FjaGUoZGF0YSwgY2xlYXJCZWZvcmUpO1xuXHR9XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLl9kcmF3V2l0aENhY2hlID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIHggPSBkYXRhWzBdO1xuXHR2YXIgeSA9IGRhdGFbMV07XG5cdHZhciBjaCA9IGRhdGFbMl07XG5cdHZhciBmZyA9IGRhdGFbM107XG5cdHZhciBiZyA9IGRhdGFbNF07XG5cblx0dmFyIGhhc2ggPSBcIlwiK2NoK2ZnK2JnO1xuXHRpZiAoaGFzaCBpbiB0aGlzLl9jYW52YXNDYWNoZSkge1xuXHRcdHZhciBjYW52YXMgPSB0aGlzLl9jYW52YXNDYWNoZVtoYXNoXTtcblx0fSBlbHNlIHtcblx0XHR2YXIgYiA9IHRoaXMuX29wdGlvbnMuYm9yZGVyO1xuXHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXHRcdGNhbnZhcy53aWR0aCA9IHRoaXMuX3NwYWNpbmdYO1xuXHRcdGNhbnZhcy5oZWlnaHQgPSB0aGlzLl9zcGFjaW5nWTtcblx0XHRjdHguZmlsbFN0eWxlID0gYmc7XG5cdFx0Y3R4LmZpbGxSZWN0KGIsIGIsIGNhbnZhcy53aWR0aC1iLCBjYW52YXMuaGVpZ2h0LWIpO1xuXHRcdFxuXHRcdGlmIChjaCkge1xuXHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGZnO1xuXHRcdFx0Y3R4LmZvbnQgPSB0aGlzLl9jb250ZXh0LmZvbnQ7XG5cdFx0XHRjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcblx0XHRcdGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuXG5cdFx0XHR2YXIgY2hhcnMgPSBbXS5jb25jYXQoY2gpO1xuXHRcdFx0Zm9yICh2YXIgaT0wO2k8Y2hhcnMubGVuZ3RoO2krKykge1xuXHRcdFx0XHRjdHguZmlsbFRleHQoY2hhcnNbaV0sIHRoaXMuX3NwYWNpbmdYLzIsIHRoaXMuX3NwYWNpbmdZLzIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLl9jYW52YXNDYWNoZVtoYXNoXSA9IGNhbnZhcztcblx0fVxuXHRcblx0dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UoY2FudmFzLCB4KnRoaXMuX3NwYWNpbmdYLCB5KnRoaXMuX3NwYWNpbmdZKTtcbn1cblxuUk9ULkRpc3BsYXkuUmVjdC5wcm90b3R5cGUuX2RyYXdOb0NhY2hlID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIHggPSBkYXRhWzBdO1xuXHR2YXIgeSA9IGRhdGFbMV07XG5cdHZhciBjaCA9IGRhdGFbMl07XG5cdHZhciBmZyA9IGRhdGFbM107XG5cdHZhciBiZyA9IGRhdGFbNF07XG5cblx0aWYgKGNsZWFyQmVmb3JlKSB7IFxuXHRcdHZhciBiID0gdGhpcy5fb3B0aW9ucy5ib3JkZXI7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBiZztcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxSZWN0KHgqdGhpcy5fc3BhY2luZ1ggKyBiLCB5KnRoaXMuX3NwYWNpbmdZICsgYiwgdGhpcy5fc3BhY2luZ1ggLSBiLCB0aGlzLl9zcGFjaW5nWSAtIGIpO1xuXHR9XG5cdFxuXHRpZiAoIWNoKSB7IHJldHVybjsgfVxuXG5cdHRoaXMuX2NvbnRleHQuZmlsbFN0eWxlID0gZmc7XG5cblx0dmFyIGNoYXJzID0gW10uY29uY2F0KGNoKTtcblx0Zm9yICh2YXIgaT0wO2k8Y2hhcnMubGVuZ3RoO2krKykge1xuXHRcdHRoaXMuX2NvbnRleHQuZmlsbFRleHQoY2hhcnNbaV0sICh4KzAuNSkgKiB0aGlzLl9zcGFjaW5nWCwgKHkrMC41KSAqIHRoaXMuX3NwYWNpbmdZKTtcblx0fVxufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5jb21wdXRlU2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciB3aWR0aCA9IE1hdGguZmxvb3IoYXZhaWxXaWR0aCAvIHRoaXMuX3NwYWNpbmdYKTtcblx0dmFyIGhlaWdodCA9IE1hdGguZmxvb3IoYXZhaWxIZWlnaHQgLyB0aGlzLl9zcGFjaW5nWSk7XG5cdHJldHVybiBbd2lkdGgsIGhlaWdodF07XG59XG5cblJPVC5EaXNwbGF5LlJlY3QucHJvdG90eXBlLmNvbXB1dGVGb250U2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHZhciBib3hXaWR0aCA9IE1hdGguZmxvb3IoYXZhaWxXaWR0aCAvIHRoaXMuX29wdGlvbnMud2lkdGgpO1xuXHR2YXIgYm94SGVpZ2h0ID0gTWF0aC5mbG9vcihhdmFpbEhlaWdodCAvIHRoaXMuX29wdGlvbnMuaGVpZ2h0KTtcblxuXHQvKiBjb21wdXRlIGNoYXIgcmF0aW8gKi9cblx0dmFyIG9sZEZvbnQgPSB0aGlzLl9jb250ZXh0LmZvbnQ7XG5cdHRoaXMuX2NvbnRleHQuZm9udCA9IFwiMTAwcHggXCIgKyB0aGlzLl9vcHRpb25zLmZvbnRGYW1pbHk7XG5cdHZhciB3aWR0aCA9IE1hdGguY2VpbCh0aGlzLl9jb250ZXh0Lm1lYXN1cmVUZXh0KFwiV1wiKS53aWR0aCk7XG5cdHRoaXMuX2NvbnRleHQuZm9udCA9IG9sZEZvbnQ7XG5cdHZhciByYXRpbyA9IHdpZHRoIC8gMTAwO1xuXHRcdFxuXHR2YXIgd2lkdGhGcmFjdGlvbiA9IHJhdGlvICogYm94SGVpZ2h0IC8gYm94V2lkdGg7XG5cdGlmICh3aWR0aEZyYWN0aW9uID4gMSkgeyAvKiB0b28gd2lkZSB3aXRoIGN1cnJlbnQgYXNwZWN0IHJhdGlvICovXG5cdFx0Ym94SGVpZ2h0ID0gTWF0aC5mbG9vcihib3hIZWlnaHQgLyB3aWR0aEZyYWN0aW9uKTtcblx0fVxuXHRyZXR1cm4gTWF0aC5mbG9vcihib3hIZWlnaHQgLyB0aGlzLl9vcHRpb25zLnNwYWNpbmcpO1xufVxuXG5ST1QuRGlzcGxheS5SZWN0LnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XG5cdHJldHVybiBbTWF0aC5mbG9vcih4L3RoaXMuX3NwYWNpbmdYKSwgTWF0aC5mbG9vcih5L3RoaXMuX3NwYWNpbmdZKV07XG59XG4vKipcbiAqIEBjbGFzcyBIZXhhZ29uYWwgYmFja2VuZFxuICogQHByaXZhdGVcbiAqL1xuUk9ULkRpc3BsYXkuSGV4ID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRST1QuRGlzcGxheS5CYWNrZW5kLmNhbGwodGhpcywgY29udGV4dCk7XG5cblx0dGhpcy5fc3BhY2luZ1ggPSAwO1xuXHR0aGlzLl9zcGFjaW5nWSA9IDA7XG5cdHRoaXMuX2hleFNpemUgPSAwO1xuXHR0aGlzLl9vcHRpb25zID0ge307XG59XG5ST1QuRGlzcGxheS5IZXguZXh0ZW5kKFJPVC5EaXNwbGF5LkJhY2tlbmQpO1xuXG5ST1QuRGlzcGxheS5IZXgucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXG5cdHZhciBjaGFyV2lkdGggPSBNYXRoLmNlaWwodGhpcy5fY29udGV4dC5tZWFzdXJlVGV4dChcIldcIikud2lkdGgpO1xuXHR0aGlzLl9oZXhTaXplID0gTWF0aC5mbG9vcihvcHRpb25zLnNwYWNpbmcgKiAob3B0aW9ucy5mb250U2l6ZSArIGNoYXJXaWR0aC9NYXRoLnNxcnQoMykpIC8gMik7XG5cdHRoaXMuX3NwYWNpbmdYID0gdGhpcy5faGV4U2l6ZSAqIE1hdGguc3FydCgzKSAvIDI7XG5cdHRoaXMuX3NwYWNpbmdZID0gdGhpcy5faGV4U2l6ZSAqIDEuNTtcblx0dGhpcy5fY29udGV4dC5jYW52YXMud2lkdGggPSBNYXRoLmNlaWwoIChvcHRpb25zLndpZHRoICsgMSkgKiB0aGlzLl9zcGFjaW5nWCApO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQgPSBNYXRoLmNlaWwoIChvcHRpb25zLmhlaWdodCAtIDEpICogdGhpcy5fc3BhY2luZ1kgKyAyKnRoaXMuX2hleFNpemUgKTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oZGF0YSwgY2xlYXJCZWZvcmUpIHtcblx0dmFyIHggPSBkYXRhWzBdO1xuXHR2YXIgeSA9IGRhdGFbMV07XG5cdHZhciBjaCA9IGRhdGFbMl07XG5cdHZhciBmZyA9IGRhdGFbM107XG5cdHZhciBiZyA9IGRhdGFbNF07XG5cblx0dmFyIGN4ID0gKHgrMSkgKiB0aGlzLl9zcGFjaW5nWDtcblx0dmFyIGN5ID0geSAqIHRoaXMuX3NwYWNpbmdZICsgdGhpcy5faGV4U2l6ZTtcblxuXHRpZiAoY2xlYXJCZWZvcmUpIHsgXG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBiZztcblx0XHR0aGlzLl9maWxsKGN4LCBjeSk7XG5cdH1cblx0XG5cdGlmICghY2gpIHsgcmV0dXJuOyB9XG5cblx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBmZztcblxuXHR2YXIgY2hhcnMgPSBbXS5jb25jYXQoY2gpO1xuXHRmb3IgKHZhciBpPTA7aTxjaGFycy5sZW5ndGg7aSsrKSB7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsVGV4dChjaGFyc1tpXSwgY3gsIGN5KTtcblx0fVxufVxuXG5cblJPVC5EaXNwbGF5LkhleC5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgd2lkdGggPSBNYXRoLmZsb29yKGF2YWlsV2lkdGggLyB0aGlzLl9zcGFjaW5nWCkgLSAxO1xuXHR2YXIgaGVpZ2h0ID0gTWF0aC5mbG9vcigoYXZhaWxIZWlnaHQgLSAyKnRoaXMuX2hleFNpemUpIC8gdGhpcy5fc3BhY2luZ1kgKyAxKTtcblx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5jb21wdXRlRm9udFNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgaGV4U2l6ZVdpZHRoID0gMiphdmFpbFdpZHRoIC8gKCh0aGlzLl9vcHRpb25zLndpZHRoKzEpICogTWF0aC5zcXJ0KDMpKSAtIDE7XG5cdHZhciBoZXhTaXplSGVpZ2h0ID0gYXZhaWxIZWlnaHQgLyAoMiArIDEuNSoodGhpcy5fb3B0aW9ucy5oZWlnaHQtMSkpO1xuXHR2YXIgaGV4U2l6ZSA9IE1hdGgubWluKGhleFNpemVXaWR0aCwgaGV4U2l6ZUhlaWdodCk7XG5cblx0LyogY29tcHV0ZSBjaGFyIHJhdGlvICovXG5cdHZhciBvbGRGb250ID0gdGhpcy5fY29udGV4dC5mb250O1xuXHR0aGlzLl9jb250ZXh0LmZvbnQgPSBcIjEwMHB4IFwiICsgdGhpcy5fb3B0aW9ucy5mb250RmFtaWx5O1xuXHR2YXIgd2lkdGggPSBNYXRoLmNlaWwodGhpcy5fY29udGV4dC5tZWFzdXJlVGV4dChcIldcIikud2lkdGgpO1xuXHR0aGlzLl9jb250ZXh0LmZvbnQgPSBvbGRGb250O1xuXHR2YXIgcmF0aW8gPSB3aWR0aCAvIDEwMDtcblxuXHRoZXhTaXplID0gTWF0aC5mbG9vcihoZXhTaXplKSsxOyAvKiBjbG9zZXN0IGxhcmdlciBoZXhTaXplICovXG5cblx0dmFyIGZvbnRTaXplID0gMipoZXhTaXplIC8gKHRoaXMuX29wdGlvbnMuc3BhY2luZyAqICgxICsgcmF0aW8gLyBNYXRoLnNxcnQoMykpKTtcblxuXHQvKiBjbG9zZXN0IHNtYWxsZXIgZm9udFNpemUgKi9cblx0cmV0dXJuIE1hdGguY2VpbChmb250U2l6ZSktMTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5ldmVudFRvUG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XG5cdHZhciBoZWlnaHQgPSB0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQgLyB0aGlzLl9vcHRpb25zLmhlaWdodDtcblx0eSA9IE1hdGguZmxvb3IoeS9oZWlnaHQpO1xuXHRcblx0aWYgKHkubW9kKDIpKSB7IC8qIG9kZCByb3cgKi9cblx0XHR4IC09IHRoaXMuX3NwYWNpbmdYO1xuXHRcdHggPSAxICsgMipNYXRoLmZsb29yKHgvKDIqdGhpcy5fc3BhY2luZ1gpKTtcblx0fSBlbHNlIHtcblx0XHR4ID0gMipNYXRoLmZsb29yKHgvKDIqdGhpcy5fc3BhY2luZ1gpKTtcblx0fVxuXHRcblx0cmV0dXJuIFt4LCB5XTtcbn1cblxuUk9ULkRpc3BsYXkuSGV4LnByb3RvdHlwZS5fZmlsbCA9IGZ1bmN0aW9uKGN4LCBjeSkge1xuXHR2YXIgYSA9IHRoaXMuX2hleFNpemU7XG5cdHZhciBiID0gdGhpcy5fb3B0aW9ucy5ib3JkZXI7XG5cdFxuXHR0aGlzLl9jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHR0aGlzLl9jb250ZXh0Lm1vdmVUbyhjeCwgY3ktYStiKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3ggKyB0aGlzLl9zcGFjaW5nWCAtIGIsIGN5LWEvMitiKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3ggKyB0aGlzLl9zcGFjaW5nWCAtIGIsIGN5K2EvMi1iKTtcblx0dGhpcy5fY29udGV4dC5saW5lVG8oY3gsIGN5K2EtYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4IC0gdGhpcy5fc3BhY2luZ1ggKyBiLCBjeSthLzItYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4IC0gdGhpcy5fc3BhY2luZ1ggKyBiLCBjeS1hLzIrYik7XG5cdHRoaXMuX2NvbnRleHQubGluZVRvKGN4LCBjeS1hK2IpO1xuXHR0aGlzLl9jb250ZXh0LmZpbGwoKTtcbn1cbi8qKlxuICogQGNsYXNzIFRpbGUgYmFja2VuZFxuICogQHByaXZhdGVcbiAqL1xuUk9ULkRpc3BsYXkuVGlsZSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0Uk9ULkRpc3BsYXkuUmVjdC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuXHRcblx0dGhpcy5fb3B0aW9ucyA9IHt9O1xufVxuUk9ULkRpc3BsYXkuVGlsZS5leHRlbmQoUk9ULkRpc3BsYXkuUmVjdCk7XG5cblJPVC5EaXNwbGF5LlRpbGUucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXHR0aGlzLl9jb250ZXh0LmNhbnZhcy53aWR0aCA9IG9wdGlvbnMud2lkdGggKiBvcHRpb25zLnRpbGVXaWR0aDtcblx0dGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgKiBvcHRpb25zLnRpbGVIZWlnaHQ7XG59XG5cblJPVC5EaXNwbGF5LlRpbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihkYXRhLCBjbGVhckJlZm9yZSkge1xuXHR2YXIgeCA9IGRhdGFbMF07XG5cdHZhciB5ID0gZGF0YVsxXTtcblx0dmFyIGNoID0gZGF0YVsyXTtcblx0dmFyIGZnID0gZGF0YVszXTtcblx0dmFyIGJnID0gZGF0YVs0XTtcblxuXHR2YXIgdGlsZVdpZHRoID0gdGhpcy5fb3B0aW9ucy50aWxlV2lkdGg7XG5cdHZhciB0aWxlSGVpZ2h0ID0gdGhpcy5fb3B0aW9ucy50aWxlSGVpZ2h0O1xuXG5cdGlmIChjbGVhckJlZm9yZSkge1xuXHRcdHZhciBiID0gdGhpcy5fb3B0aW9ucy5ib3JkZXI7XG5cdFx0dGhpcy5fY29udGV4dC5maWxsU3R5bGUgPSBiZztcblx0XHR0aGlzLl9jb250ZXh0LmZpbGxSZWN0KHgqdGlsZVdpZHRoLCB5KnRpbGVIZWlnaHQsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCk7XG5cdH1cblxuXHRpZiAoIWNoKSB7IHJldHVybjsgfVxuXG5cdHZhciBjaGFycyA9IFtdLmNvbmNhdChjaCk7XG5cdGZvciAodmFyIGk9MDtpPGNoYXJzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgdGlsZSA9IHRoaXMuX29wdGlvbnMudGlsZU1hcFtjaGFyc1tpXV07XG5cdFx0aWYgKCF0aWxlKSB7IHRocm93IG5ldyBFcnJvcihcIkNoYXIgJ1wiICsgY2hhcnNbaV0gKyBcIicgbm90IGZvdW5kIGluIHRpbGVNYXBcIik7IH1cblx0XHRcblx0XHR0aGlzLl9jb250ZXh0LmRyYXdJbWFnZShcblx0XHRcdHRoaXMuX29wdGlvbnMudGlsZVNldCxcblx0XHRcdHRpbGVbMF0sIHRpbGVbMV0sIHRpbGVXaWR0aCwgdGlsZUhlaWdodCxcblx0XHRcdHgqdGlsZVdpZHRoLCB5KnRpbGVIZWlnaHQsIHRpbGVXaWR0aCwgdGlsZUhlaWdodFxuXHRcdCk7XG5cdH1cbn1cblxuUk9ULkRpc3BsYXkuVGlsZS5wcm90b3R5cGUuY29tcHV0ZVNpemUgPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCkge1xuXHR2YXIgd2lkdGggPSBNYXRoLmZsb29yKGF2YWlsV2lkdGggLyB0aGlzLl9vcHRpb25zLnRpbGVXaWR0aCk7XG5cdHZhciBoZWlnaHQgPSBNYXRoLmZsb29yKGF2YWlsSGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy50aWxlSGVpZ2h0KTtcblx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbn1cblxuUk9ULkRpc3BsYXkuVGlsZS5wcm90b3R5cGUuY29tcHV0ZUZvbnRTaXplID0gZnVuY3Rpb24oYXZhaWxXaWR0aCwgYXZhaWxIZWlnaHQpIHtcblx0dmFyIHdpZHRoID0gTWF0aC5mbG9vcihhdmFpbFdpZHRoIC8gdGhpcy5fb3B0aW9ucy53aWR0aCk7XG5cdHZhciBoZWlnaHQgPSBNYXRoLmZsb29yKGF2YWlsSGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy5oZWlnaHQpO1xuXHRyZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xufVxuLyoqXG4gKiBAY2xhc3MgVGVybWluYWwgYmFja2VuZFxuICogQHByaXZhdGVcbiAqL1xuUk9ULkRpc3BsYXkuVGVybSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0Uk9ULkRpc3BsYXkuQmFja2VuZC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuXHR0aGlzLl9jeCA9IC0xO1xuXHR0aGlzLl9jeSA9IC0xO1xuXHR0aGlzLl9sYXN0Q29sb3IgPSBcIlwiO1xuXHR0aGlzLl9vcHRpb25zID0ge307XG5cdHRoaXMuX294ID0gMDtcblx0dGhpcy5fb3kgPSAwO1xuXHR0aGlzLl90ZXJtY29sb3IgPSB7fTtcbn1cblJPVC5EaXNwbGF5LlRlcm0uZXh0ZW5kKFJPVC5EaXNwbGF5LkJhY2tlbmQpO1xuXG5ST1QuRGlzcGxheS5UZXJtLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHR0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcblx0dGhpcy5fb3ggPSBNYXRoLmZsb29yKChwcm9jZXNzLnN0ZG91dC5jb2x1bW5zIC0gb3B0aW9ucy53aWR0aCkgLyAyKTtcblx0dGhpcy5fb3kgPSBNYXRoLmZsb29yKChwcm9jZXNzLnN0ZG91dC5yb3dzIC0gb3B0aW9ucy5oZWlnaHQpIC8gMik7XG5cdHRoaXMuX3Rlcm1jb2xvciA9IG5ldyBST1QuRGlzcGxheS5UZXJtW29wdGlvbnMudGVybUNvbG9yLmNhcGl0YWxpemUoKV0odGhpcy5fY29udGV4dCk7XG5cdHRoaXMuX2NvbnRleHQuX3Rlcm1jb2xvciA9IHRoaXMuX3Rlcm1jb2xvcjtcbn1cblxuUk9ULkRpc3BsYXkuVGVybS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGRhdGEsIGNsZWFyQmVmb3JlKSB7XG5cdC8vIGRldGVybWluZSB3aGVyZSB0byBkcmF3IHdoYXQgd2l0aCB3aGF0IGNvbG9yc1xuXHR2YXIgeCA9IGRhdGFbMF07XG5cdHZhciB5ID0gZGF0YVsxXTtcblx0dmFyIGNoID0gZGF0YVsyXTtcblx0dmFyIGZnID0gZGF0YVszXTtcblx0dmFyIGJnID0gZGF0YVs0XTtcblxuXHQvLyBkZXRlcm1pbmUgaWYgd2UgbmVlZCB0byBtb3ZlIHRoZSB0ZXJtaW5hbCBjdXJzb3Jcblx0dmFyIGR4ID0gdGhpcy5fb3ggKyB4O1xuXHR2YXIgZHkgPSB0aGlzLl9veSArIHk7XG5cdGlmIChkeCA8IDAgfHwgZHggPj0gcHJvY2Vzcy5zdGRvdXQuY29sdW1ucykgeyByZXR1cm47IH1cblx0aWYgKGR5IDwgMCB8fCBkeSA+PSBwcm9jZXNzLnN0ZG91dC5yb3dzKSB7IHJldHVybjsgfVxuXHRpZiAoZHggIT09IHRoaXMuX2N4IHx8IGR5ICE9PSB0aGlzLl9jeSkge1xuXHRcdHByb2Nlc3Muc3Rkb3V0LndyaXRlKHRoaXMuX3Rlcm1jb2xvci5wb3NpdGlvblRvQW5zaShkeCxkeSkpO1xuXHRcdHRoaXMuX2N4ID0gZHg7XG5cdFx0dGhpcy5fY3kgPSBkeTtcblx0fVxuXG5cdC8vIHRlcm1pbmFscyBhdXRvbWF0aWNhbGx5IGNsZWFyLCBidXQgaWYgd2UncmUgY2xlYXJpbmcgd2hlbiB3ZSdyZVxuXHQvLyBub3Qgb3RoZXJ3aXNlIHByb3ZpZGVkIHdpdGggYSBjaGFyYWN0ZXIsIGp1c3QgdXNlIGEgc3BhY2UgaW5zdGVhZFxuXHRpZiAoY2xlYXJCZWZvcmUpIHtcblx0XHRpZiAoIWNoKSB7XG5cdFx0XHRjaCA9IFwiIFwiO1xuXHRcdH1cblx0fVxuXHRcdFxuXHQvLyBpZiB3ZSdyZSBub3QgY2xlYXJpbmcgYW5kIG5vdCBwcm92aWRlZCB3aXRoIGEgY2hhcmFjdGVyLCBkbyBub3RoaW5nXG5cdGlmICghY2gpIHsgcmV0dXJuOyB9XG5cblx0Ly8gZGV0ZXJtaW5lIGlmIHdlIG5lZWQgdG8gY2hhbmdlIGNvbG9yc1xuXHR2YXIgbmV3Q29sb3IgPSB0aGlzLl90ZXJtY29sb3IuY29sb3JUb0Fuc2koZmcsYmcpO1xuXHRpZiAobmV3Q29sb3IgIT09IHRoaXMuX2xhc3RDb2xvcikge1xuXHRcdHByb2Nlc3Muc3Rkb3V0LndyaXRlKG5ld0NvbG9yKTtcblx0XHR0aGlzLl9sYXN0Q29sb3IgPSBuZXdDb2xvcjtcblx0fVxuXG5cdC8vIHdyaXRlIHRoZSBwcm92aWRlZCBzeW1ib2wgdG8gdGhlIGRpc3BsYXlcblx0dmFyIGNoYXJzID0gW10uY29uY2F0KGNoKTtcblx0cHJvY2Vzcy5zdGRvdXQud3JpdGUoY2hhcnNbMF0pO1xuXG5cdC8vIHVwZGF0ZSBvdXIgcG9zaXRpb24sIGdpdmVuIHRoYXQgd2Ugd3JvdGUgYSBjaGFyYWN0ZXJcblx0dGhpcy5fY3grKztcblx0aWYgKHRoaXMuX2N4ID49IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMpIHtcblx0XHR0aGlzLl9jeCA9IDA7XG5cdFx0dGhpcy5fY3krKztcblx0fVxufVxuXG5ST1QuRGlzcGxheS5UZXJtLnByb3RvdHlwZS5jb21wdXRlU2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHJldHVybiBbcHJvY2Vzcy5zdGRvdXQuY29sdW1ucywgcHJvY2Vzcy5zdGRvdXQucm93c107XG59XG5cblJPVC5EaXNwbGF5LlRlcm0ucHJvdG90eXBlLmNvbXB1dGVGb250U2l6ZSA9IGZ1bmN0aW9uKGF2YWlsV2lkdGgsIGF2YWlsSGVpZ2h0KSB7XG5cdHJldHVybiAxMjtcbn1cblxuUk9ULkRpc3BsYXkuVGVybS5wcm90b3R5cGUuZXZlbnRUb1Bvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xuXHRyZXR1cm4gW3gseV1cbn1cbi8qKlxuICogQGNsYXNzIEFic3RyYWN0IHRlcm1pbmFsIGNvZGUgbW9kdWxlXG4gKiBAcHJpdmF0ZVxuICovXG5ST1QuRGlzcGxheS5UZXJtLkNvbG9yID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHR0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuUk9ULkRpc3BsYXkuVGVybS5Db2xvci5wcm90b3R5cGUuY2xlYXJUb0Fuc2kgPSBmdW5jdGlvbihiZykge1xufVxuXG5ST1QuRGlzcGxheS5UZXJtLkNvbG9yLnByb3RvdHlwZS5jb2xvclRvQW5zaSA9IGZ1bmN0aW9uKGZnLCBiZykge1xufVxuXG5ST1QuRGlzcGxheS5UZXJtLkNvbG9yLnByb3RvdHlwZS5wb3NpdGlvblRvQW5zaSA9IGZ1bmN0aW9uKHgsIHkpIHtcbn1cbi8qKlxuICogQGNsYXNzIHh0ZXJtIHRlcm1pbmFsIGNvZGUgbW9kdWxlXG4gKiBAcHJpdmF0ZVxuICovXG5ST1QuRGlzcGxheS5UZXJtLlh0ZXJtID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRST1QuRGlzcGxheS5UZXJtLkNvbG9yLmNhbGwodGhpcywgY29udGV4dCk7XG59XG5ST1QuRGlzcGxheS5UZXJtLlh0ZXJtLmV4dGVuZChST1QuRGlzcGxheS5UZXJtLkNvbG9yKTtcblxuUk9ULkRpc3BsYXkuVGVybS5YdGVybS5wcm90b3R5cGUuY2xlYXJUb0Fuc2kgPSBmdW5jdGlvbihiZykge1xuXHRyZXR1cm4gXCJcXHgxYlswOzQ4OzU7XCJcblx0XHQrIHRoaXMuX3Rlcm1jb2xvcihiZylcblx0XHQrIFwibVxceDFiWzJKXCI7XG59XG5cblJPVC5EaXNwbGF5LlRlcm0uWHRlcm0ucHJvdG90eXBlLmNvbG9yVG9BbnNpID0gZnVuY3Rpb24oZmcsIGJnKSB7XG5cdHJldHVybiBcIlxceDFiWzA7Mzg7NTtcIlxuXHRcdCsgdGhpcy5fdGVybWNvbG9yKGZnKVxuXHRcdCsgXCI7NDg7NTtcIlxuXHRcdCsgdGhpcy5fdGVybWNvbG9yKGJnKVxuXHRcdCsgXCJtXCI7XG59XG5cblJPVC5EaXNwbGF5LlRlcm0uWHRlcm0ucHJvdG90eXBlLnBvc2l0aW9uVG9BbnNpID0gZnVuY3Rpb24oeCwgeSkge1xuXHRyZXR1cm4gXCJcXHgxYltcIiArICh5KzEpICsgXCI7XCIgKyAoeCsxKSArIFwiSFwiO1xufVxuXG5ST1QuRGlzcGxheS5UZXJtLlh0ZXJtLnByb3RvdHlwZS5fdGVybWNvbG9yID0gZnVuY3Rpb24oY29sb3IpIHtcblx0dmFyIFNSQ19DT0xPUlMgPSAyNTYuMDtcblx0dmFyIERTVF9DT0xPUlMgPSA2LjA7XG5cdHZhciBDT0xPUl9SQVRJTyA9IERTVF9DT0xPUlMgLyBTUkNfQ09MT1JTO1xuXHR2YXIgcmdiID0gUk9ULkNvbG9yLmZyb21TdHJpbmcoY29sb3IpO1xuXHR2YXIgciA9IE1hdGguZmxvb3IocmdiWzBdICogQ09MT1JfUkFUSU8pO1xuXHR2YXIgZyA9IE1hdGguZmxvb3IocmdiWzFdICogQ09MT1JfUkFUSU8pO1xuXHR2YXIgYiA9IE1hdGguZmxvb3IocmdiWzJdICogQ09MT1JfUkFUSU8pO1xuXHRyZXR1cm4gciozNiArIGcqNiArIGIqMSArIDE2O1xufVxuLyoqXG4gKiBAbmFtZXNwYWNlXG4gKiBUaGlzIGNvZGUgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgQWxlYSBhbGdvcml0aG07IChDKSAyMDEwIEpvaGFubmVzIEJhYWfDuGUuXG4gKiBBbGVhIGlzIGxpY2Vuc2VkIGFjY29yZGluZyB0byB0aGUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSVRfTGljZW5zZS5cbiAqL1xuUk9ULlJORyA9IHtcblx0LyoqXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9IFxuXHQgKi9cblx0Z2V0U2VlZDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3NlZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBzZWVkIFNlZWQgdGhlIG51bWJlciBnZW5lcmF0b3Jcblx0ICovXG5cdHNldFNlZWQ6IGZ1bmN0aW9uKHNlZWQpIHtcblx0XHRzZWVkID0gKHNlZWQgPCAxID8gMS9zZWVkIDogc2VlZCk7XG5cblx0XHR0aGlzLl9zZWVkID0gc2VlZDtcblx0XHR0aGlzLl9zMCA9IChzZWVkID4+PiAwKSAqIHRoaXMuX2ZyYWM7XG5cblx0XHRzZWVkID0gKHNlZWQqNjkwNjkgKyAxKSA+Pj4gMDtcblx0XHR0aGlzLl9zMSA9IHNlZWQgKiB0aGlzLl9mcmFjO1xuXG5cdFx0c2VlZCA9IChzZWVkKjY5MDY5ICsgMSkgPj4+IDA7XG5cdFx0dGhpcy5fczIgPSBzZWVkICogdGhpcy5fZnJhYztcblxuXHRcdHRoaXMuX2MgPSAxO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7ZmxvYXR9IFBzZXVkb3JhbmRvbSB2YWx1ZSBbMCwxKSwgdW5pZm9ybWx5IGRpc3RyaWJ1dGVkXG5cdCAqL1xuXHRnZXRVbmlmb3JtOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdCA9IDIwOTE2MzkgKiB0aGlzLl9zMCArIHRoaXMuX2MgKiB0aGlzLl9mcmFjO1xuXHRcdHRoaXMuX3MwID0gdGhpcy5fczE7XG5cdFx0dGhpcy5fczEgPSB0aGlzLl9zMjtcblx0XHR0aGlzLl9jID0gdCB8IDA7XG5cdFx0dGhpcy5fczIgPSB0IC0gdGhpcy5fYztcblx0XHRyZXR1cm4gdGhpcy5fczI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7aW50fSBsb3dlckJvdW5kIFRoZSBsb3dlciBlbmQgb2YgdGhlIHJhbmdlIHRvIHJldHVybiBhIHZhbHVlIGZyb20sIGluY2x1c2l2ZVxuXHQgKiBAcGFyYW0ge2ludH0gdXBwZXJCb3VuZCBUaGUgdXBwZXIgZW5kIG9mIHRoZSByYW5nZSB0byByZXR1cm4gYSB2YWx1ZSBmcm9tLCBpbmNsdXNpdmVcblx0ICogQHJldHVybnMge2ludH0gUHNldWRvcmFuZG9tIHZhbHVlIFtsb3dlckJvdW5kLCB1cHBlckJvdW5kXSwgdXNpbmcgUk9ULlJORy5nZXRVbmlmb3JtKCkgdG8gZGlzdHJpYnV0ZSB0aGUgdmFsdWVcblx0ICovXG5cdGdldFVuaWZvcm1JbnQ6IGZ1bmN0aW9uKGxvd2VyQm91bmQsIHVwcGVyQm91bmQpIHtcblx0XHR2YXIgbWF4ID0gTWF0aC5tYXgobG93ZXJCb3VuZCwgdXBwZXJCb3VuZCk7XG5cdFx0dmFyIG1pbiA9IE1hdGgubWluKGxvd2VyQm91bmQsIHVwcGVyQm91bmQpO1xuXHRcdHJldHVybiBNYXRoLmZsb29yKHRoaXMuZ2V0VW5pZm9ybSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtmbG9hdH0gW21lYW49MF0gTWVhbiB2YWx1ZVxuXHQgKiBAcGFyYW0ge2Zsb2F0fSBbc3RkZGV2PTFdIFN0YW5kYXJkIGRldmlhdGlvbi4gfjk1JSBvZiB0aGUgYWJzb2x1dGUgdmFsdWVzIHdpbGwgYmUgbG93ZXIgdGhhbiAyKnN0ZGRldi5cblx0ICogQHJldHVybnMge2Zsb2F0fSBBIG5vcm1hbGx5IGRpc3RyaWJ1dGVkIHBzZXVkb3JhbmRvbSB2YWx1ZVxuXHQgKi9cblx0Z2V0Tm9ybWFsOiBmdW5jdGlvbihtZWFuLCBzdGRkZXYpIHtcblx0XHRkbyB7XG5cdFx0XHR2YXIgdSA9IDIqdGhpcy5nZXRVbmlmb3JtKCktMTtcblx0XHRcdHZhciB2ID0gMip0aGlzLmdldFVuaWZvcm0oKS0xO1xuXHRcdFx0dmFyIHIgPSB1KnUgKyB2KnY7XG5cdFx0fSB3aGlsZSAociA+IDEgfHwgciA9PSAwKTtcblxuXHRcdHZhciBnYXVzcyA9IHUgKiBNYXRoLnNxcnQoLTIqTWF0aC5sb2cocikvcik7XG5cdFx0cmV0dXJuIChtZWFuIHx8IDApICsgZ2F1c3MqKHN0ZGRldiB8fCAxKTtcblx0fSxcblxuXHQvKipcblx0ICogQHJldHVybnMge2ludH0gUHNldWRvcmFuZG9tIHZhbHVlIFsxLDEwMF0gaW5jbHVzaXZlLCB1bmlmb3JtbHkgZGlzdHJpYnV0ZWRcblx0ICovXG5cdGdldFBlcmNlbnRhZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAxICsgTWF0aC5mbG9vcih0aGlzLmdldFVuaWZvcm0oKSoxMDApO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIGtleT13aGF0ZXZlciwgdmFsdWU9d2VpZ2h0IChyZWxhdGl2ZSBwcm9iYWJpbGl0eSlcblx0ICogQHJldHVybnMge3N0cmluZ30gd2hhdGV2ZXJcblx0ICovXG5cdGdldFdlaWdodGVkVmFsdWU6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR2YXIgYXZhaWwgPSBbXTtcblx0XHR2YXIgdG90YWwgPSAwO1xuXHRcdFxuXHRcdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHRcdHRvdGFsICs9IGRhdGFbaWRdO1xuXHRcdH1cblx0XHR2YXIgcmFuZG9tID0gTWF0aC5mbG9vcih0aGlzLmdldFVuaWZvcm0oKSp0b3RhbCk7XG5cdFx0XG5cdFx0dmFyIHBhcnQgPSAwO1xuXHRcdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHRcdHBhcnQgKz0gZGF0YVtpZF07XG5cdFx0XHRpZiAocmFuZG9tIDwgcGFydCkgeyByZXR1cm4gaWQ7IH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBSTkcgc3RhdGUuIFVzZWZ1bCBmb3Igc3RvcmluZyB0aGUgc3RhdGUgYW5kIHJlLXNldHRpbmcgaXQgdmlhIHNldFN0YXRlLlxuXHQgKiBAcmV0dXJucyB7P30gSW50ZXJuYWwgc3RhdGVcblx0ICovXG5cdGdldFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gW3RoaXMuX3MwLCB0aGlzLl9zMSwgdGhpcy5fczIsIHRoaXMuX2NdO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgYSBwcmV2aW91c2x5IHJldHJpZXZlZCBzdGF0ZS5cblx0ICogQHBhcmFtIHs/fSBzdGF0ZVxuXHQgKi9cblx0c2V0U3RhdGU6IGZ1bmN0aW9uKHN0YXRlKSB7XG5cdFx0dGhpcy5fczAgPSBzdGF0ZVswXTtcblx0XHR0aGlzLl9zMSA9IHN0YXRlWzFdO1xuXHRcdHRoaXMuX3MyID0gc3RhdGVbMl07XG5cdFx0dGhpcy5fYyAgPSBzdGF0ZVszXTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfczA6IDAsXG5cdF9zMTogMCxcblx0X3MyOiAwLFxuXHRfYzogMCxcblx0X2ZyYWM6IDIuMzI4MzA2NDM2NTM4Njk2M2UtMTAgLyogMl4tMzIgKi9cbn1cblxuUk9ULlJORy5zZXRTZWVkKERhdGUubm93KCkpO1xuLyoqXG4gKiBAY2xhc3MgKE1hcmtvdiBwcm9jZXNzKS1iYXNlZCBzdHJpbmcgZ2VuZXJhdG9yLiBcbiAqIENvcGllZCBmcm9tIGEgPGEgaHJlZj1cImh0dHA6Ly93d3cucm9ndWViYXNpbi5yb2d1ZWxpa2VkZXZlbG9wbWVudC5vcmcvaW5kZXgucGhwP3RpdGxlPU5hbWVzX2Zyb21fYV9oaWdoX29yZGVyX01hcmtvdl9Qcm9jZXNzX2FuZF9hX3NpbXBsaWZpZWRfS2F0el9iYWNrLW9mZl9zY2hlbWVcIj5Sb2d1ZUJhc2luIGFydGljbGU8L2E+LiBcbiAqIE9mZmVycyBjb25maWd1cmFibGUgb3JkZXIgYW5kIHByaW9yLlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtib29sfSBbb3B0aW9ucy53b3Jkcz1mYWxzZV0gVXNlIHdvcmQgbW9kZT9cbiAqIEBwYXJhbSB7aW50fSBbb3B0aW9ucy5vcmRlcj0zXVxuICogQHBhcmFtIHtmbG9hdH0gW29wdGlvbnMucHJpb3I9MC4wMDFdXG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0d29yZHM6IGZhbHNlLFxuXHRcdG9yZGVyOiAzLFxuXHRcdHByaW9yOiAwLjAwMVxuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXG5cdHRoaXMuX2JvdW5kYXJ5ID0gU3RyaW5nLmZyb21DaGFyQ29kZSgwKTtcblx0dGhpcy5fc3VmZml4ID0gdGhpcy5fYm91bmRhcnk7XG5cdHRoaXMuX3ByZWZpeCA9IFtdO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9vcHRpb25zLm9yZGVyO2krKykgeyB0aGlzLl9wcmVmaXgucHVzaCh0aGlzLl9ib3VuZGFyeSk7IH1cblxuXHR0aGlzLl9wcmlvclZhbHVlcyA9IHt9O1xuXHR0aGlzLl9wcmlvclZhbHVlc1t0aGlzLl9ib3VuZGFyeV0gPSB0aGlzLl9vcHRpb25zLnByaW9yO1xuXG5cdHRoaXMuX2RhdGEgPSB7fTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxlYXJuaW5nIGRhdGFcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZGF0YSA9IHt9O1xuXHR0aGlzLl9wcmlvclZhbHVlcyA9IHt9O1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEdlbmVyYXRlZCBzdHJpbmdcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbigpIHtcblx0dmFyIHJlc3VsdCA9IFt0aGlzLl9zYW1wbGUodGhpcy5fcHJlZml4KV07XG5cdHdoaWxlIChyZXN1bHRbcmVzdWx0Lmxlbmd0aC0xXSAhPSB0aGlzLl9ib3VuZGFyeSkge1xuXHRcdHJlc3VsdC5wdXNoKHRoaXMuX3NhbXBsZShyZXN1bHQpKTtcblx0fVxuXHRyZXR1cm4gdGhpcy5fam9pbihyZXN1bHQuc2xpY2UoMCwgLTEpKTtcbn1cblxuLyoqXG4gKiBPYnNlcnZlIChsZWFybikgYSBzdHJpbmcgZnJvbSBhIHRyYWluaW5nIHNldFxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG5cdHZhciB0b2tlbnMgPSB0aGlzLl9zcGxpdChzdHJpbmcpO1xuXG5cdGZvciAodmFyIGk9MDsgaTx0b2tlbnMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLl9wcmlvclZhbHVlc1t0b2tlbnNbaV1dID0gdGhpcy5fb3B0aW9ucy5wcmlvcjtcblx0fVxuXG5cdHRva2VucyA9IHRoaXMuX3ByZWZpeC5jb25jYXQodG9rZW5zKS5jb25jYXQodGhpcy5fc3VmZml4KTsgLyogYWRkIGJvdW5kYXJ5IHN5bWJvbHMgKi9cblxuXHRmb3IgKHZhciBpPXRoaXMuX29wdGlvbnMub3JkZXI7IGk8dG9rZW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGNvbnRleHQgPSB0b2tlbnMuc2xpY2UoaS10aGlzLl9vcHRpb25zLm9yZGVyLCBpKTtcblx0XHR2YXIgZXZlbnQgPSB0b2tlbnNbaV07XG5cdFx0Zm9yICh2YXIgaj0wOyBqPGNvbnRleHQubGVuZ3RoOyBqKyspIHtcblx0XHRcdHZhciBzdWJjb250ZXh0ID0gY29udGV4dC5zbGljZShqKTtcblx0XHRcdHRoaXMuX29ic2VydmVFdmVudChzdWJjb250ZXh0LCBldmVudCk7XG5cdFx0fVxuXHR9XG59XG5cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwYXJ0cyA9IFtdO1xuXG5cdHZhciBwcmlvckNvdW50ID0gMDtcblx0Zm9yICh2YXIgcCBpbiB0aGlzLl9wcmlvclZhbHVlcykgeyBwcmlvckNvdW50Kys7IH1cblx0cHJpb3JDb3VudC0tOyAvKiBib3VuZGFyeSAqL1xuXHRwYXJ0cy5wdXNoKFwiZGlzdGluY3Qgc2FtcGxlczogXCIgKyBwcmlvckNvdW50KTtcblxuXHR2YXIgZGF0YUNvdW50ID0gMDtcblx0dmFyIGV2ZW50Q291bnQgPSAwO1xuXHRmb3IgKHZhciBwIGluIHRoaXMuX2RhdGEpIHsgXG5cdFx0ZGF0YUNvdW50Kys7IFxuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9kYXRhW3BdKSB7XG5cdFx0XHRldmVudENvdW50Kys7XG5cdFx0fVxuXHR9XG5cdHBhcnRzLnB1c2goXCJkaWN0aW9uYXJ5IHNpemUgKGNvbnRleHRzKTogXCIgKyBkYXRhQ291bnQpO1xuXHRwYXJ0cy5wdXNoKFwiZGljdGlvbmFyeSBzaXplIChldmVudHMpOiBcIiArIGV2ZW50Q291bnQpO1xuXG5cdHJldHVybiBwYXJ0cy5qb2luKFwiLCBcIik7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9XG4gKiBAcmV0dXJucyB7c3RyaW5nW119XG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9zcGxpdCA9IGZ1bmN0aW9uKHN0cikge1xuXHRyZXR1cm4gc3RyLnNwbGl0KHRoaXMuX29wdGlvbnMud29yZHMgPyAvXFxzKy8gOiBcIlwiKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfVxuICogQHJldHVybnMge3N0cmluZ30gXG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9qb2luID0gZnVuY3Rpb24oYXJyKSB7XG5cdHJldHVybiBhcnIuam9pbih0aGlzLl9vcHRpb25zLndvcmRzID8gXCIgXCIgOiBcIlwiKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBjb250ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAqL1xuUk9ULlN0cmluZ0dlbmVyYXRvci5wcm90b3R5cGUuX29ic2VydmVFdmVudCA9IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50KSB7XG5cdHZhciBrZXkgPSB0aGlzLl9qb2luKGNvbnRleHQpO1xuXHRpZiAoIShrZXkgaW4gdGhpcy5fZGF0YSkpIHsgdGhpcy5fZGF0YVtrZXldID0ge307IH1cblx0dmFyIGRhdGEgPSB0aGlzLl9kYXRhW2tleV07XG5cblx0aWYgKCEoZXZlbnQgaW4gZGF0YSkpIHsgZGF0YVtldmVudF0gPSAwOyB9XG5cdGRhdGFbZXZlbnRdKys7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmdbXX1cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cblJPVC5TdHJpbmdHZW5lcmF0b3IucHJvdG90eXBlLl9zYW1wbGUgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdGNvbnRleHQgPSB0aGlzLl9iYWNrb2ZmKGNvbnRleHQpO1xuXHR2YXIga2V5ID0gdGhpcy5fam9pbihjb250ZXh0KTtcblx0dmFyIGRhdGEgPSB0aGlzLl9kYXRhW2tleV07XG5cblx0dmFyIGF2YWlsYWJsZSA9IHt9O1xuXG5cdGlmICh0aGlzLl9vcHRpb25zLnByaW9yKSB7XG5cdFx0Zm9yICh2YXIgZXZlbnQgaW4gdGhpcy5fcHJpb3JWYWx1ZXMpIHsgYXZhaWxhYmxlW2V2ZW50XSA9IHRoaXMuX3ByaW9yVmFsdWVzW2V2ZW50XTsgfVxuXHRcdGZvciAodmFyIGV2ZW50IGluIGRhdGEpIHsgYXZhaWxhYmxlW2V2ZW50XSArPSBkYXRhW2V2ZW50XTsgfVxuXHR9IGVsc2UgeyBcblx0XHRhdmFpbGFibGUgPSBkYXRhO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuX3BpY2tSYW5kb20oYXZhaWxhYmxlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfVxuICogQHJldHVybnMge3N0cmluZ1tdfVxuICovXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fYmFja29mZiA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0aWYgKGNvbnRleHQubGVuZ3RoID4gdGhpcy5fb3B0aW9ucy5vcmRlcikge1xuXHRcdGNvbnRleHQgPSBjb250ZXh0LnNsaWNlKC10aGlzLl9vcHRpb25zLm9yZGVyKTtcblx0fSBlbHNlIGlmIChjb250ZXh0Lmxlbmd0aCA8IHRoaXMuX29wdGlvbnMub3JkZXIpIHtcblx0XHRjb250ZXh0ID0gdGhpcy5fcHJlZml4LnNsaWNlKDAsIHRoaXMuX29wdGlvbnMub3JkZXIgLSBjb250ZXh0Lmxlbmd0aCkuY29uY2F0KGNvbnRleHQpO1xuXHR9XG5cblx0d2hpbGUgKCEodGhpcy5fam9pbihjb250ZXh0KSBpbiB0aGlzLl9kYXRhKSAmJiBjb250ZXh0Lmxlbmd0aCA+IDApIHsgY29udGV4dCA9IGNvbnRleHQuc2xpY2UoMSk7IH1cblxuXHRyZXR1cm4gY29udGV4dDtcbn1cblxuXG5ST1QuU3RyaW5nR2VuZXJhdG9yLnByb3RvdHlwZS5fcGlja1JhbmRvbSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0dmFyIHRvdGFsID0gMDtcblx0XG5cdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHR0b3RhbCArPSBkYXRhW2lkXTtcblx0fVxuXHR2YXIgcmFuZG9tID0gUk9ULlJORy5nZXRVbmlmb3JtKCkqdG90YWw7XG5cdFxuXHR2YXIgcGFydCA9IDA7XG5cdGZvciAodmFyIGlkIGluIGRhdGEpIHtcblx0XHRwYXJ0ICs9IGRhdGFbaWRdO1xuXHRcdGlmIChyYW5kb20gPCBwYXJ0KSB7IHJldHVybiBpZDsgfVxuXHR9XG59XG4vKipcbiAqIEBjbGFzcyBHZW5lcmljIGV2ZW50IHF1ZXVlOiBzdG9yZXMgZXZlbnRzIGFuZCByZXRyaWV2ZXMgdGhlbSBiYXNlZCBvbiB0aGVpciB0aW1lXG4gKi9cblJPVC5FdmVudFF1ZXVlID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX3RpbWUgPSAwO1xuXHR0aGlzLl9ldmVudHMgPSBbXTtcblx0dGhpcy5fZXZlbnRUaW1lcyA9IFtdO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHtudW1iZXJ9IEVsYXBzZWQgdGltZVxuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuZ2V0VGltZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fdGltZTtcbn1cblxuLyoqXG4gKiBDbGVhciBhbGwgc2NoZWR1bGVkIGV2ZW50c1xuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZXZlbnRzID0gW107XG5cdHRoaXMuX2V2ZW50VGltZXMgPSBbXTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogQHBhcmFtIHs/fSBldmVudFxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWVcbiAqL1xuUk9ULkV2ZW50UXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGV2ZW50LCB0aW1lKSB7XG5cdHZhciBpbmRleCA9IHRoaXMuX2V2ZW50cy5sZW5ndGg7XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX2V2ZW50VGltZXMubGVuZ3RoO2krKykge1xuXHRcdGlmICh0aGlzLl9ldmVudFRpbWVzW2ldID4gdGltZSkge1xuXHRcdFx0aW5kZXggPSBpO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dGhpcy5fZXZlbnRzLnNwbGljZShpbmRleCwgMCwgZXZlbnQpO1xuXHR0aGlzLl9ldmVudFRpbWVzLnNwbGljZShpbmRleCwgMCwgdGltZSk7XG59XG5cbi8qKlxuICogTG9jYXRlcyB0aGUgbmVhcmVzdCBldmVudCwgYWR2YW5jZXMgdGltZSBpZiBuZWNlc3NhcnkuIFJldHVybnMgdGhhdCBldmVudCBhbmQgcmVtb3ZlcyBpdCBmcm9tIHRoZSBxdWV1ZS5cbiAqIEByZXR1cm5zIHs/IHx8IG51bGx9IFRoZSBldmVudCBwcmV2aW91c2x5IGFkZGVkIGJ5IGFkZEV2ZW50LCBudWxsIGlmIG5vIGV2ZW50IGF2YWlsYWJsZVxuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XG5cdGlmICghdGhpcy5fZXZlbnRzLmxlbmd0aCkgeyByZXR1cm4gbnVsbDsgfVxuXG5cdHZhciB0aW1lID0gdGhpcy5fZXZlbnRUaW1lcy5zcGxpY2UoMCwgMSlbMF07XG5cdGlmICh0aW1lID4gMCkgeyAvKiBhZHZhbmNlICovXG5cdFx0dGhpcy5fdGltZSArPSB0aW1lO1xuXHRcdGZvciAodmFyIGk9MDtpPHRoaXMuX2V2ZW50VGltZXMubGVuZ3RoO2krKykgeyB0aGlzLl9ldmVudFRpbWVzW2ldIC09IHRpbWU7IH1cblx0fVxuXG5cdHJldHVybiB0aGlzLl9ldmVudHMuc3BsaWNlKDAsIDEpWzBdO1xufVxuXG4vKipcbiAqIFJlbW92ZSBhbiBldmVudCBmcm9tIHRoZSBxdWV1ZVxuICogQHBhcmFtIHs/fSBldmVudFxuICogQHJldHVybnMge2Jvb2x9IHN1Y2Nlc3M/XG4gKi9cblJPVC5FdmVudFF1ZXVlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuXHR2YXIgaW5kZXggPSB0aGlzLl9ldmVudHMuaW5kZXhPZihldmVudCk7XG5cdGlmIChpbmRleCA9PSAtMSkgeyByZXR1cm4gZmFsc2UgfVxuXHR0aGlzLl9yZW1vdmUoaW5kZXgpO1xuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYW4gZXZlbnQgZnJvbSB0aGUgcXVldWVcbiAqIEBwYXJhbSB7aW50fSBpbmRleFxuICovXG5ST1QuRXZlbnRRdWV1ZS5wcm90b3R5cGUuX3JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdHRoaXMuX2V2ZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuXHR0aGlzLl9ldmVudFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG59XG4vKipcbiAqIEBjbGFzcyBBYnN0cmFjdCBzY2hlZHVsZXJcbiAqL1xuUk9ULlNjaGVkdWxlciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9xdWV1ZSA9IG5ldyBST1QuRXZlbnRRdWV1ZSgpO1xuXHR0aGlzLl9yZXBlYXQgPSBbXTtcblx0dGhpcy5fY3VycmVudCA9IG51bGw7XG59XG5cbi8qKlxuICogQHNlZSBST1QuRXZlbnRRdWV1ZSNnZXRUaW1lXG4gKi9cblJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmdldFRpbWUgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3F1ZXVlLmdldFRpbWUoKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gez99IGl0ZW1cbiAqIEBwYXJhbSB7Ym9vbH0gcmVwZWF0XG4gKi9cblJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGl0ZW0sIHJlcGVhdCkge1xuXHRpZiAocmVwZWF0KSB7IHRoaXMuX3JlcGVhdC5wdXNoKGl0ZW0pOyB9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENsZWFyIGFsbCBpdGVtc1xuICovXG5ST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9xdWV1ZS5jbGVhcigpO1xuXHR0aGlzLl9yZXBlYXQgPSBbXTtcblx0dGhpcy5fY3VycmVudCA9IG51bGw7XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJlbW92ZSBhIHByZXZpb3VzbHkgYWRkZWQgaXRlbVxuICogQHBhcmFtIHs/fSBpdGVtXG4gKiBAcmV0dXJucyB7Ym9vbH0gc3VjY2Vzc2Z1bD9cbiAqL1xuUk9ULlNjaGVkdWxlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaXRlbSkge1xuXHR2YXIgcmVzdWx0ID0gdGhpcy5fcXVldWUucmVtb3ZlKGl0ZW0pO1xuXG5cdHZhciBpbmRleCA9IHRoaXMuX3JlcGVhdC5pbmRleE9mKGl0ZW0pO1xuXHRpZiAoaW5kZXggIT0gLTEpIHsgdGhpcy5fcmVwZWF0LnNwbGljZShpbmRleCwgMSk7IH1cblxuXHRpZiAodGhpcy5fY3VycmVudCA9PSBpdGVtKSB7IHRoaXMuX2N1cnJlbnQgPSBudWxsOyB9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBuZXh0IGl0ZW1cbiAqIEByZXR1cm5zIHs/fVxuICovXG5ST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX2N1cnJlbnQgPSB0aGlzLl9xdWV1ZS5nZXQoKTtcblx0cmV0dXJuIHRoaXMuX2N1cnJlbnQ7XG59XG4vKipcbiAqIEBjbGFzcyBTaW1wbGUgZmFpciBzY2hlZHVsZXIgKHJvdW5kLXJvYmluIHN0eWxlKVxuICogQGF1Z21lbnRzIFJPVC5TY2hlZHVsZXJcbiAqL1xuUk9ULlNjaGVkdWxlci5TaW1wbGUgPSBmdW5jdGlvbigpIHtcblx0Uk9ULlNjaGVkdWxlci5jYWxsKHRoaXMpO1xufVxuUk9ULlNjaGVkdWxlci5TaW1wbGUuZXh0ZW5kKFJPVC5TY2hlZHVsZXIpO1xuXG4vKipcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNhZGRcbiAqL1xuUk9ULlNjaGVkdWxlci5TaW1wbGUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGl0ZW0sIHJlcGVhdCkge1xuXHR0aGlzLl9xdWV1ZS5hZGQoaXRlbSwgMCk7XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5hZGQuY2FsbCh0aGlzLCBpdGVtLCByZXBlYXQpO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNuZXh0XG4gKi9cblJPVC5TY2hlZHVsZXIuU2ltcGxlLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX3JlcGVhdC5pbmRleE9mKHRoaXMuX2N1cnJlbnQpICE9IC0xKSB7XG5cdFx0dGhpcy5fcXVldWUuYWRkKHRoaXMuX2N1cnJlbnQsIDApO1xuXHR9XG5cdHJldHVybiBST1QuU2NoZWR1bGVyLnByb3RvdHlwZS5uZXh0LmNhbGwodGhpcyk7XG59XG4vKipcbiAqIEBjbGFzcyBTcGVlZC1iYXNlZCBzY2hlZHVsZXJcbiAqIEBhdWdtZW50cyBST1QuU2NoZWR1bGVyXG4gKi9cblJPVC5TY2hlZHVsZXIuU3BlZWQgPSBmdW5jdGlvbigpIHtcblx0Uk9ULlNjaGVkdWxlci5jYWxsKHRoaXMpO1xufVxuUk9ULlNjaGVkdWxlci5TcGVlZC5leHRlbmQoUk9ULlNjaGVkdWxlcik7XG5cbi8qKlxuICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gYW55dGhpbmcgd2l0aCBcImdldFNwZWVkXCIgbWV0aG9kXG4gKiBAcGFyYW0ge2Jvb2x9IHJlcGVhdFxuICogQHNlZSBST1QuU2NoZWR1bGVyI2FkZFxuICovXG5ST1QuU2NoZWR1bGVyLlNwZWVkLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpdGVtLCByZXBlYXQpIHtcblx0dGhpcy5fcXVldWUuYWRkKGl0ZW0sIDEvaXRlbS5nZXRTcGVlZCgpKTtcblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmFkZC5jYWxsKHRoaXMsIGl0ZW0sIHJlcGVhdCk7XG59XG5cbi8qKlxuICogQHNlZSBST1QuU2NoZWR1bGVyI25leHRcbiAqL1xuUk9ULlNjaGVkdWxlci5TcGVlZC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuXHRpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9yZXBlYXQuaW5kZXhPZih0aGlzLl9jdXJyZW50KSAhPSAtMSkge1xuXHRcdHRoaXMuX3F1ZXVlLmFkZCh0aGlzLl9jdXJyZW50LCAxL3RoaXMuX2N1cnJlbnQuZ2V0U3BlZWQoKSk7XG5cdH1cblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLm5leHQuY2FsbCh0aGlzKTtcbn1cbi8qKlxuICogQGNsYXNzIEFjdGlvbi1iYXNlZCBzY2hlZHVsZXJcbiAqIEBhdWdtZW50cyBST1QuU2NoZWR1bGVyXG4gKi9cblJPVC5TY2hlZHVsZXIuQWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cdFJPVC5TY2hlZHVsZXIuY2FsbCh0aGlzKTtcblx0dGhpcy5fZGVmYXVsdER1cmF0aW9uID0gMTsgLyogZm9yIG5ld2x5IGFkZGVkICovXG5cdHRoaXMuX2R1cmF0aW9uID0gdGhpcy5fZGVmYXVsdER1cmF0aW9uOyAvKiBmb3IgdGhpcy5fY3VycmVudCAqL1xufVxuUk9ULlNjaGVkdWxlci5BY3Rpb24uZXh0ZW5kKFJPVC5TY2hlZHVsZXIpO1xuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtXG4gKiBAcGFyYW0ge2Jvb2x9IHJlcGVhdFxuICogQHBhcmFtIHtudW1iZXJ9IFt0aW1lPTFdXG4gKiBAc2VlIFJPVC5TY2hlZHVsZXIjYWRkXG4gKi9cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpdGVtLCByZXBlYXQsIHRpbWUpIHtcblx0dGhpcy5fcXVldWUuYWRkKGl0ZW0sIHRpbWUgfHwgdGhpcy5fZGVmYXVsdER1cmF0aW9uKTtcblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmFkZC5jYWxsKHRoaXMsIGl0ZW0sIHJlcGVhdCk7XG59XG5cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9kdXJhdGlvbiA9IHRoaXMuX2RlZmF1bHREdXJhdGlvbjtcblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLmNsZWFyLmNhbGwodGhpcyk7XG59XG5cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihpdGVtKSB7XG5cdGlmIChpdGVtID09IHRoaXMuX2N1cnJlbnQpIHsgdGhpcy5fZHVyYXRpb24gPSB0aGlzLl9kZWZhdWx0RHVyYXRpb247IH1cblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLnJlbW92ZS5jYWxsKHRoaXMsIGl0ZW0pO1xufVxuXG4vKipcbiAqIEBzZWUgUk9ULlNjaGVkdWxlciNuZXh0XG4gKi9cblJPVC5TY2hlZHVsZXIuQWN0aW9uLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG5cdGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX3JlcGVhdC5pbmRleE9mKHRoaXMuX2N1cnJlbnQpICE9IC0xKSB7XG5cdFx0dGhpcy5fcXVldWUuYWRkKHRoaXMuX2N1cnJlbnQsIHRoaXMuX2R1cmF0aW9uIHx8IHRoaXMuX2RlZmF1bHREdXJhdGlvbik7XG5cdFx0dGhpcy5fZHVyYXRpb24gPSB0aGlzLl9kZWZhdWx0RHVyYXRpb247XG5cdH1cblx0cmV0dXJuIFJPVC5TY2hlZHVsZXIucHJvdG90eXBlLm5leHQuY2FsbCh0aGlzKTtcbn1cblxuLyoqXG4gKiBTZXQgZHVyYXRpb24gZm9yIHRoZSBhY3RpdmUgaXRlbVxuICovXG5ST1QuU2NoZWR1bGVyLkFjdGlvbi5wcm90b3R5cGUuc2V0RHVyYXRpb24gPSBmdW5jdGlvbih0aW1lKSB7XG5cdGlmICh0aGlzLl9jdXJyZW50KSB7IHRoaXMuX2R1cmF0aW9uID0gdGltZTsgfVxuXHRyZXR1cm4gdGhpcztcbn1cbi8qKlxuICogQGNsYXNzIEFzeW5jaHJvbm91cyBtYWluIGxvb3BcbiAqIEBwYXJhbSB7Uk9ULlNjaGVkdWxlcn0gc2NoZWR1bGVyXG4gKi9cblJPVC5FbmdpbmUgPSBmdW5jdGlvbihzY2hlZHVsZXIpIHtcblx0dGhpcy5fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuXHR0aGlzLl9sb2NrID0gMTtcbn1cblxuLyoqXG4gKiBTdGFydCB0aGUgbWFpbiBsb29wLiBXaGVuIHRoaXMgY2FsbCByZXR1cm5zLCB0aGUgbG9vcCBpcyBsb2NrZWQuXG4gKi9cblJPVC5FbmdpbmUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLnVubG9jaygpO1xufVxuXG4vKipcbiAqIEludGVycnVwdCB0aGUgZW5naW5lIGJ5IGFuIGFzeW5jaHJvbm91cyBhY3Rpb25cbiAqL1xuUk9ULkVuZ2luZS5wcm90b3R5cGUubG9jayA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9sb2NrKys7XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJlc3VtZSBleGVjdXRpb24gKHBhdXNlZCBieSBhIHByZXZpb3VzIGxvY2spXG4gKi9cblJPVC5FbmdpbmUucHJvdG90eXBlLnVubG9jayA9IGZ1bmN0aW9uKCkge1xuXHRpZiAoIXRoaXMuX2xvY2spIHsgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHVubG9jayB1bmxvY2tlZCBlbmdpbmVcIik7IH1cblx0dGhpcy5fbG9jay0tO1xuXG5cdHdoaWxlICghdGhpcy5fbG9jaykge1xuXHRcdHZhciBhY3RvciA9IHRoaXMuX3NjaGVkdWxlci5uZXh0KCk7XG5cdFx0aWYgKCFhY3RvcikgeyByZXR1cm4gdGhpcy5sb2NrKCk7IH0gLyogbm8gYWN0b3JzICovXG5cdFx0dmFyIHJlc3VsdCA9IGFjdG9yLmFjdCgpO1xuXHRcdGlmIChyZXN1bHQgJiYgcmVzdWx0LnRoZW4pIHsgLyogYWN0b3IgcmV0dXJuZWQgYSBcInRoZW5hYmxlXCIsIGxvb2tzIGxpa2UgYSBQcm9taXNlICovXG5cdFx0XHR0aGlzLmxvY2soKTtcblx0XHRcdHJlc3VsdC50aGVuKHRoaXMudW5sb2NrLmJpbmQodGhpcykpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuLyoqXG4gKiBAY2xhc3MgQmFzZSBtYXAgZ2VuZXJhdG9yXG4gKiBAcGFyYW0ge2ludH0gW3dpZHRoPVJPVC5ERUZBVUxUX1dJRFRIXVxuICogQHBhcmFtIHtpbnR9IFtoZWlnaHQ9Uk9ULkRFRkFVTFRfSEVJR0hUXVxuICovXG5ST1QuTWFwID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHR0aGlzLl93aWR0aCA9IHdpZHRoIHx8IFJPVC5ERUZBVUxUX1dJRFRIO1xuXHR0aGlzLl9oZWlnaHQgPSBoZWlnaHQgfHwgUk9ULkRFRkFVTFRfSEVJR0hUO1xufTtcblxuUk9ULk1hcC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHt9XG5cblJPVC5NYXAucHJvdG90eXBlLl9maWxsTWFwID0gZnVuY3Rpb24odmFsdWUpIHtcblx0dmFyIG1hcCA9IFtdO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRtYXAucHVzaChbXSk7XG5cdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykgeyBtYXBbaV0ucHVzaCh2YWx1ZSk7IH1cblx0fVxuXHRyZXR1cm4gbWFwO1xufVxuLyoqXG4gKiBAY2xhc3MgU2ltcGxlIGVtcHR5IHJlY3Rhbmd1bGFyIHJvb21cbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKi9cblJPVC5NYXAuQXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcbn1cblJPVC5NYXAuQXJlbmEuZXh0ZW5kKFJPVC5NYXApO1xuXG5ST1QuTWFwLkFyZW5hLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgdyA9IHRoaXMuX3dpZHRoLTE7XG5cdHZhciBoID0gdGhpcy5faGVpZ2h0LTE7XG5cdGZvciAodmFyIGk9MDtpPD13O2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPD1oO2orKykge1xuXHRcdFx0dmFyIGVtcHR5ID0gKGkgJiYgaiAmJiBpPHcgJiYgajxoKTtcblx0XHRcdGNhbGxiYWNrKGksIGosIGVtcHR5ID8gMCA6IDEpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cbi8qKlxuICogQGNsYXNzIFJlY3Vyc2l2ZWx5IGRpdmlkZWQgbWF6ZSwgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYXplX2dlbmVyYXRpb25fYWxnb3JpdGhtI1JlY3Vyc2l2ZV9kaXZpc2lvbl9tZXRob2RcbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKi9cblJPVC5NYXAuRGl2aWRlZE1hemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0dGhpcy5fc3RhY2sgPSBbXTtcbn1cblJPVC5NYXAuRGl2aWRlZE1hemUuZXh0ZW5kKFJPVC5NYXApO1xuXG5ST1QuTWFwLkRpdmlkZWRNYXplLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgdyA9IHRoaXMuX3dpZHRoO1xuXHR2YXIgaCA9IHRoaXMuX2hlaWdodDtcblx0XG5cdHRoaXMuX21hcCA9IFtdO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHR0aGlzLl9tYXAucHVzaChbXSk7XG5cdFx0Zm9yICh2YXIgaj0wO2o8aDtqKyspIHtcblx0XHRcdHZhciBib3JkZXIgPSAoaSA9PSAwIHx8IGogPT0gMCB8fCBpKzEgPT0gdyB8fCBqKzEgPT0gaCk7XG5cdFx0XHR0aGlzLl9tYXBbaV0ucHVzaChib3JkZXIgPyAxIDogMCk7XG5cdFx0fVxuXHR9XG5cdFxuXHR0aGlzLl9zdGFjayA9IFtcblx0XHRbMSwgMSwgdy0yLCBoLTJdXG5cdF07XG5cdHRoaXMuX3Byb2Nlc3MoKTtcblx0XG5cdGZvciAodmFyIGk9MDtpPHc7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8aDtqKyspIHtcblx0XHRcdGNhbGxiYWNrKGksIGosIHRoaXMuX21hcFtpXVtqXSk7XG5cdFx0fVxuXHR9XG5cdHRoaXMuX21hcCA9IG51bGw7XG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkRpdmlkZWRNYXplLnByb3RvdHlwZS5fcHJvY2VzcyA9IGZ1bmN0aW9uKCkge1xuXHR3aGlsZSAodGhpcy5fc3RhY2subGVuZ3RoKSB7XG5cdFx0dmFyIHJvb20gPSB0aGlzLl9zdGFjay5zaGlmdCgpOyAvKiBbbGVmdCwgdG9wLCByaWdodCwgYm90dG9tXSAqL1xuXHRcdHRoaXMuX3BhcnRpdGlvblJvb20ocm9vbSk7XG5cdH1cbn1cblxuUk9ULk1hcC5EaXZpZGVkTWF6ZS5wcm90b3R5cGUuX3BhcnRpdGlvblJvb20gPSBmdW5jdGlvbihyb29tKSB7XG5cdHZhciBhdmFpbFggPSBbXTtcblx0dmFyIGF2YWlsWSA9IFtdO1xuXHRcblx0Zm9yICh2YXIgaT1yb29tWzBdKzE7aTxyb29tWzJdO2krKykge1xuXHRcdHZhciB0b3AgPSB0aGlzLl9tYXBbaV1bcm9vbVsxXS0xXTtcblx0XHR2YXIgYm90dG9tID0gdGhpcy5fbWFwW2ldW3Jvb21bM10rMV07XG5cdFx0aWYgKHRvcCAmJiBib3R0b20gJiYgIShpICUgMikpIHsgYXZhaWxYLnB1c2goaSk7IH1cblx0fVxuXHRcblx0Zm9yICh2YXIgaj1yb29tWzFdKzE7ajxyb29tWzNdO2orKykge1xuXHRcdHZhciBsZWZ0ID0gdGhpcy5fbWFwW3Jvb21bMF0tMV1bal07XG5cdFx0dmFyIHJpZ2h0ID0gdGhpcy5fbWFwW3Jvb21bMl0rMV1bal07XG5cdFx0aWYgKGxlZnQgJiYgcmlnaHQgJiYgIShqICUgMikpIHsgYXZhaWxZLnB1c2goaik7IH1cblx0fVxuXG5cdGlmICghYXZhaWxYLmxlbmd0aCB8fCAhYXZhaWxZLmxlbmd0aCkgeyByZXR1cm47IH1cblxuXHR2YXIgeCA9IGF2YWlsWC5yYW5kb20oKTtcblx0dmFyIHkgPSBhdmFpbFkucmFuZG9tKCk7XG5cdFxuXHR0aGlzLl9tYXBbeF1beV0gPSAxO1xuXHRcblx0dmFyIHdhbGxzID0gW107XG5cdFxuXHR2YXIgdyA9IFtdOyB3YWxscy5wdXNoKHcpOyAvKiBsZWZ0IHBhcnQgKi9cblx0Zm9yICh2YXIgaT1yb29tWzBdOyBpPHg7IGkrKykgeyBcblx0XHR0aGlzLl9tYXBbaV1beV0gPSAxO1xuXHRcdHcucHVzaChbaSwgeV0pOyBcblx0fVxuXHRcblx0dmFyIHcgPSBbXTsgd2FsbHMucHVzaCh3KTsgLyogcmlnaHQgcGFydCAqL1xuXHRmb3IgKHZhciBpPXgrMTsgaTw9cm9vbVsyXTsgaSsrKSB7IFxuXHRcdHRoaXMuX21hcFtpXVt5XSA9IDE7XG5cdFx0dy5wdXNoKFtpLCB5XSk7IFxuXHR9XG5cblx0dmFyIHcgPSBbXTsgd2FsbHMucHVzaCh3KTsgLyogdG9wIHBhcnQgKi9cblx0Zm9yICh2YXIgaj1yb29tWzFdOyBqPHk7IGorKykgeyBcblx0XHR0aGlzLl9tYXBbeF1bal0gPSAxO1xuXHRcdHcucHVzaChbeCwgal0pOyBcblx0fVxuXHRcblx0dmFyIHcgPSBbXTsgd2FsbHMucHVzaCh3KTsgLyogYm90dG9tIHBhcnQgKi9cblx0Zm9yICh2YXIgaj15KzE7IGo8PXJvb21bM107IGorKykgeyBcblx0XHR0aGlzLl9tYXBbeF1bal0gPSAxO1xuXHRcdHcucHVzaChbeCwgal0pOyBcblx0fVxuXHRcdFxuXHR2YXIgc29saWQgPSB3YWxscy5yYW5kb20oKTtcblx0Zm9yICh2YXIgaT0wO2k8d2FsbHMubGVuZ3RoO2krKykge1xuXHRcdHZhciB3ID0gd2FsbHNbaV07XG5cdFx0aWYgKHcgPT0gc29saWQpIHsgY29udGludWU7IH1cblx0XHRcblx0XHR2YXIgaG9sZSA9IHcucmFuZG9tKCk7XG5cdFx0dGhpcy5fbWFwW2hvbGVbMF1dW2hvbGVbMV1dID0gMDtcblx0fVxuXG5cdHRoaXMuX3N0YWNrLnB1c2goW3Jvb21bMF0sIHJvb21bMV0sIHgtMSwgeS0xXSk7IC8qIGxlZnQgdG9wICovXG5cdHRoaXMuX3N0YWNrLnB1c2goW3grMSwgcm9vbVsxXSwgcm9vbVsyXSwgeS0xXSk7IC8qIHJpZ2h0IHRvcCAqL1xuXHR0aGlzLl9zdGFjay5wdXNoKFtyb29tWzBdLCB5KzEsIHgtMSwgcm9vbVszXV0pOyAvKiBsZWZ0IGJvdHRvbSAqL1xuXHR0aGlzLl9zdGFjay5wdXNoKFt4KzEsIHkrMSwgcm9vbVsyXSwgcm9vbVszXV0pOyAvKiByaWdodCBib3R0b20gKi9cbn1cbi8qKlxuICogQGNsYXNzIEljZXkncyBNYXplIGdlbmVyYXRvclxuICogU2VlIGh0dHA6Ly93d3cucm9ndWViYXNpbi5yb2d1ZWxpa2VkZXZlbG9wbWVudC5vcmcvaW5kZXgucGhwP3RpdGxlPVNpbXBsZV9tYXplIGZvciBleHBsYW5hdGlvblxuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqL1xuUk9ULk1hcC5JY2V5TWF6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIHJlZ3VsYXJpdHkpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXHR0aGlzLl9yZWd1bGFyaXR5ID0gcmVndWxhcml0eSB8fCAwO1xufVxuUk9ULk1hcC5JY2V5TWF6ZS5leHRlbmQoUk9ULk1hcCk7XG5cblJPVC5NYXAuSWNleU1hemUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciB3aWR0aCA9IHRoaXMuX3dpZHRoO1xuXHR2YXIgaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuXHRcblx0dmFyIG1hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdFxuXHR3aWR0aCAtPSAod2lkdGggJSAyID8gMSA6IDIpO1xuXHRoZWlnaHQgLT0gKGhlaWdodCAlIDIgPyAxIDogMik7XG5cblx0dmFyIGN4ID0gMDtcblx0dmFyIGN5ID0gMDtcblx0dmFyIG54ID0gMDtcblx0dmFyIG55ID0gMDtcblxuXHR2YXIgZG9uZSA9IDA7XG5cdHZhciBibG9ja2VkID0gZmFsc2U7XG5cdHZhciBkaXJzID0gW1xuXHRcdFswLCAwXSxcblx0XHRbMCwgMF0sXG5cdFx0WzAsIDBdLFxuXHRcdFswLCAwXVxuXHRdO1xuXHRkbyB7XG5cdFx0Y3ggPSAxICsgMipNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKih3aWR0aC0xKSAvIDIpO1xuXHRcdGN5ID0gMSArIDIqTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSooaGVpZ2h0LTEpIC8gMik7XG5cblx0XHRpZiAoIWRvbmUpIHsgbWFwW2N4XVtjeV0gPSAwOyB9XG5cdFx0XG5cdFx0aWYgKCFtYXBbY3hdW2N5XSkge1xuXHRcdFx0dGhpcy5fcmFuZG9taXplKGRpcnMpO1xuXHRcdFx0ZG8ge1xuXHRcdFx0XHRpZiAoTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoodGhpcy5fcmVndWxhcml0eSsxKSkgPT0gMCkgeyB0aGlzLl9yYW5kb21pemUoZGlycyk7IH1cblx0XHRcdFx0YmxvY2tlZCA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGk9MDtpPDQ7aSsrKSB7XG5cdFx0XHRcdFx0bnggPSBjeCArIGRpcnNbaV1bMF0qMjtcblx0XHRcdFx0XHRueSA9IGN5ICsgZGlyc1tpXVsxXSoyO1xuXHRcdFx0XHRcdGlmICh0aGlzLl9pc0ZyZWUobWFwLCBueCwgbnksIHdpZHRoLCBoZWlnaHQpKSB7XG5cdFx0XHRcdFx0XHRtYXBbbnhdW255XSA9IDA7XG5cdFx0XHRcdFx0XHRtYXBbY3ggKyBkaXJzW2ldWzBdXVtjeSArIGRpcnNbaV1bMV1dID0gMDtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Y3ggPSBueDtcblx0XHRcdFx0XHRcdGN5ID0gbnk7XG5cdFx0XHRcdFx0XHRibG9ja2VkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRkb25lKys7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gd2hpbGUgKCFibG9ja2VkKTtcblx0XHR9XG5cdH0gd2hpbGUgKGRvbmUrMSA8IHdpZHRoKmhlaWdodC80KTtcblx0XG5cdGZvciAodmFyIGk9MDtpPHRoaXMuX3dpZHRoO2krKykge1xuXHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHRcdGNhbGxiYWNrKGksIGosIG1hcFtpXVtqXSk7XG5cdFx0fVxuXHR9XG5cdHRoaXMuX21hcCA9IG51bGw7XG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkljZXlNYXplLnByb3RvdHlwZS5fcmFuZG9taXplID0gZnVuY3Rpb24oZGlycykge1xuXHRmb3IgKHZhciBpPTA7aTw0O2krKykge1xuXHRcdGRpcnNbaV1bMF0gPSAwO1xuXHRcdGRpcnNbaV1bMV0gPSAwO1xuXHR9XG5cdFxuXHRzd2l0Y2ggKE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqNCkpIHtcblx0XHRjYXNlIDA6XG5cdFx0XHRkaXJzWzBdWzBdID0gLTE7IGRpcnNbMV1bMF0gPSAxO1xuXHRcdFx0ZGlyc1syXVsxXSA9IC0xOyBkaXJzWzNdWzFdID0gMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDE6XG5cdFx0XHRkaXJzWzNdWzBdID0gLTE7IGRpcnNbMl1bMF0gPSAxO1xuXHRcdFx0ZGlyc1sxXVsxXSA9IC0xOyBkaXJzWzBdWzFdID0gMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRkaXJzWzJdWzBdID0gLTE7IGRpcnNbM11bMF0gPSAxO1xuXHRcdFx0ZGlyc1swXVsxXSA9IC0xOyBkaXJzWzFdWzFdID0gMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHRkaXJzWzFdWzBdID0gLTE7IGRpcnNbMF1bMF0gPSAxO1xuXHRcdFx0ZGlyc1szXVsxXSA9IC0xOyBkaXJzWzJdWzFdID0gMTtcblx0XHRicmVhaztcblx0fVxufVxuXG5ST1QuTWFwLkljZXlNYXplLnByb3RvdHlwZS5faXNGcmVlID0gZnVuY3Rpb24obWFwLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG5cdGlmICh4IDwgMSB8fCB5IDwgMSB8fCB4ID49IHdpZHRoIHx8IHkgPj0gaGVpZ2h0KSB7IHJldHVybiBmYWxzZTsgfVxuXHRyZXR1cm4gbWFwW3hdW3ldO1xufVxuLyoqXG4gKiBAY2xhc3MgTWF6ZSBnZW5lcmF0b3IgLSBFbGxlcidzIGFsZ29yaXRobVxuICogU2VlIGh0dHA6Ly9ob21lcGFnZXMuY3dpLm5sL350cm9tcC9tYXplLmh0bWwgZm9yIGV4cGxhbmF0aW9uXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICovXG5ST1QuTWFwLkVsbGVyTWF6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblx0Uk9ULk1hcC5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xufVxuUk9ULk1hcC5FbGxlck1hemUuZXh0ZW5kKFJPVC5NYXApO1xuXG5ST1QuTWFwLkVsbGVyTWF6ZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIG1hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdHZhciB3ID0gTWF0aC5jZWlsKCh0aGlzLl93aWR0aC0yKS8yKTtcblx0XG5cdHZhciByYW5kID0gOS8yNDtcblx0XG5cdHZhciBMID0gW107XG5cdHZhciBSID0gW107XG5cdFxuXHRmb3IgKHZhciBpPTA7aTx3O2krKykge1xuXHRcdEwucHVzaChpKTtcblx0XHRSLnB1c2goaSk7XG5cdH1cblx0TC5wdXNoKHctMSk7IC8qIGZha2Ugc3RvcC1ibG9jayBhdCB0aGUgcmlnaHQgc2lkZSAqL1xuXG5cdGZvciAodmFyIGo9MTtqKzM8dGhpcy5faGVpZ2h0O2orPTIpIHtcblx0XHQvKiBvbmUgcm93ICovXG5cdFx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHRcdC8qIGNlbGwgY29vcmRzICh3aWxsIGJlIGFsd2F5cyBlbXB0eSkgKi9cblx0XHRcdHZhciB4ID0gMippKzE7XG5cdFx0XHR2YXIgeSA9IGo7XG5cdFx0XHRtYXBbeF1beV0gPSAwO1xuXHRcdFx0XG5cdFx0XHQvKiByaWdodCBjb25uZWN0aW9uICovXG5cdFx0XHRpZiAoaSAhPSBMW2krMV0gJiYgUk9ULlJORy5nZXRVbmlmb3JtKCkgPiByYW5kKSB7XG5cdFx0XHRcdHRoaXMuX2FkZFRvTGlzdChpLCBMLCBSKTtcblx0XHRcdFx0bWFwW3grMV1beV0gPSAwO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvKiBib3R0b20gY29ubmVjdGlvbiAqL1xuXHRcdFx0aWYgKGkgIT0gTFtpXSAmJiBST1QuUk5HLmdldFVuaWZvcm0oKSA+IHJhbmQpIHtcblx0XHRcdFx0LyogcmVtb3ZlIGNvbm5lY3Rpb24gKi9cblx0XHRcdFx0dGhpcy5fcmVtb3ZlRnJvbUxpc3QoaSwgTCwgUik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvKiBjcmVhdGUgY29ubmVjdGlvbiAqL1xuXHRcdFx0XHRtYXBbeF1beSsxXSA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyogbGFzdCByb3cgKi9cblx0Zm9yICh2YXIgaT0wO2k8dztpKyspIHtcblx0XHQvKiBjZWxsIGNvb3JkcyAod2lsbCBiZSBhbHdheXMgZW1wdHkpICovXG5cdFx0dmFyIHggPSAyKmkrMTtcblx0XHR2YXIgeSA9IGo7XG5cdFx0bWFwW3hdW3ldID0gMDtcblx0XHRcblx0XHQvKiByaWdodCBjb25uZWN0aW9uICovXG5cdFx0aWYgKGkgIT0gTFtpKzFdICYmIChpID09IExbaV0gfHwgUk9ULlJORy5nZXRVbmlmb3JtKCkgPiByYW5kKSkge1xuXHRcdFx0LyogZGlnIHJpZ2h0IGFsc28gaWYgdGhlIGNlbGwgaXMgc2VwYXJhdGVkLCBzbyBpdCBnZXRzIGNvbm5lY3RlZCB0byB0aGUgcmVzdCBvZiBtYXplICovXG5cdFx0XHR0aGlzLl9hZGRUb0xpc3QoaSwgTCwgUik7XG5cdFx0XHRtYXBbeCsxXVt5XSA9IDA7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuX3JlbW92ZUZyb21MaXN0KGksIEwsIFIpO1xuXHR9XG5cdFxuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0XHRjYWxsYmFjayhpLCBqLCBtYXBbaV1bal0pO1xuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogUmVtb3ZlIFwiaVwiIGZyb20gaXRzIGxpc3RcbiAqL1xuUk9ULk1hcC5FbGxlck1hemUucHJvdG90eXBlLl9yZW1vdmVGcm9tTGlzdCA9IGZ1bmN0aW9uKGksIEwsIFIpIHtcblx0UltMW2ldXSA9IFJbaV07XG5cdExbUltpXV0gPSBMW2ldO1xuXHRSW2ldID0gaTtcblx0TFtpXSA9IGk7XG59XG5cbi8qKlxuICogSm9pbiBsaXN0cyB3aXRoIFwiaVwiIGFuZCBcImkrMVwiXG4gKi9cblJPVC5NYXAuRWxsZXJNYXplLnByb3RvdHlwZS5fYWRkVG9MaXN0ID0gZnVuY3Rpb24oaSwgTCwgUikge1xuXHRSW0xbaSsxXV0gPSBSW2ldO1xuXHRMW1JbaV1dID0gTFtpKzFdO1xuXHRSW2ldID0gaSsxO1xuXHRMW2krMV0gPSBpO1xufVxuLyoqXG4gKiBAY2xhc3MgQ2VsbHVsYXIgYXV0b21hdG9uIG1hcCBnZW5lcmF0b3JcbiAqIEBhdWdtZW50cyBST1QuTWFwXG4gKiBAcGFyYW0ge2ludH0gW3dpZHRoPVJPVC5ERUZBVUxUX1dJRFRIXVxuICogQHBhcmFtIHtpbnR9IFtoZWlnaHQ9Uk9ULkRFRkFVTFRfSEVJR0hUXVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zXG4gKiBAcGFyYW0ge2ludFtdfSBbb3B0aW9ucy5ib3JuXSBMaXN0IG9mIG5laWdoYm9yIGNvdW50cyBmb3IgYSBuZXcgY2VsbCB0byBiZSBib3JuIGluIGVtcHR5IHNwYWNlXG4gKiBAcGFyYW0ge2ludFtdfSBbb3B0aW9ucy5zdXJ2aXZlXSBMaXN0IG9mIG5laWdoYm9yIGNvdW50cyBmb3IgYW4gZXhpc3RpbmcgIGNlbGwgdG8gc3Vydml2ZVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRvcG9sb2d5XSBUb3BvbG9neSA0IG9yIDYgb3IgOFxuICovXG5ST1QuTWFwLkNlbGx1bGFyID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucykge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0Ym9ybjogWzUsIDYsIDcsIDhdLFxuXHRcdHN1cnZpdmU6IFs0LCA1LCA2LCA3LCA4XSxcblx0XHR0b3BvbG9neTogOCxcblx0XHRjb25uZWN0ZWQ6IGZhbHNlXG5cdH07XG5cdHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcblx0XG5cdHRoaXMuX2RpcnMgPSBST1QuRElSU1t0aGlzLl9vcHRpb25zLnRvcG9sb2d5XTtcblx0dGhpcy5fbWFwID0gdGhpcy5fZmlsbE1hcCgwKTtcbn1cblJPVC5NYXAuQ2VsbHVsYXIuZXh0ZW5kKFJPVC5NYXApO1xuXG4vKipcbiAqIEZpbGwgdGhlIG1hcCB3aXRoIHJhbmRvbSB2YWx1ZXNcbiAqIEBwYXJhbSB7ZmxvYXR9IHByb2JhYmlsaXR5IFByb2JhYmlsaXR5IGZvciBhIGNlbGwgdG8gYmVjb21lIGFsaXZlOyAwID0gYWxsIGVtcHR5LCAxID0gYWxsIGZ1bGxcbiAqL1xuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUucmFuZG9taXplID0gZnVuY3Rpb24ocHJvYmFiaWxpdHkpIHtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0Zm9yICh2YXIgaj0wO2o8dGhpcy5faGVpZ2h0O2orKykge1xuXHRcdFx0dGhpcy5fbWFwW2ldW2pdID0gKFJPVC5STkcuZ2V0VW5pZm9ybSgpIDwgcHJvYmFiaWxpdHkgPyAxIDogMCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENoYW5nZSBvcHRpb25zLlxuICogQHNlZSBST1QuTWFwLkNlbGx1bGFyXG4gKi9cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxufVxuXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbih4LCB5LCB2YWx1ZSkge1xuXHR0aGlzLl9tYXBbeF1beV0gPSB2YWx1ZTtcbn1cblxuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIG5ld01hcCA9IHRoaXMuX2ZpbGxNYXAoMCk7XG5cdHZhciBib3JuID0gdGhpcy5fb3B0aW9ucy5ib3JuO1xuXHR2YXIgc3Vydml2ZSA9IHRoaXMuX29wdGlvbnMuc3Vydml2ZTtcblxuXG5cdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHR2YXIgd2lkdGhTdGVwID0gMTtcblx0XHR2YXIgd2lkdGhTdGFydCA9IDA7XG5cdFx0aWYgKHRoaXMuX29wdGlvbnMudG9wb2xvZ3kgPT0gNikgeyBcblx0XHRcdHdpZHRoU3RlcCA9IDI7XG5cdFx0XHR3aWR0aFN0YXJ0ID0gaiUyO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGk9d2lkdGhTdGFydDsgaTx0aGlzLl93aWR0aDsgaSs9d2lkdGhTdGVwKSB7XG5cblx0XHRcdHZhciBjdXIgPSB0aGlzLl9tYXBbaV1bal07XG5cdFx0XHR2YXIgbmNvdW50ID0gdGhpcy5fZ2V0TmVpZ2hib3JzKGksIGopO1xuXHRcdFx0XG5cdFx0XHRpZiAoY3VyICYmIHN1cnZpdmUuaW5kZXhPZihuY291bnQpICE9IC0xKSB7IC8qIHN1cnZpdmUgKi9cblx0XHRcdFx0bmV3TWFwW2ldW2pdID0gMTtcblx0XHRcdH0gZWxzZSBpZiAoIWN1ciAmJiBib3JuLmluZGV4T2YobmNvdW50KSAhPSAtMSkgeyAvKiBib3JuICovXG5cdFx0XHRcdG5ld01hcFtpXVtqXSA9IDE7XG5cdFx0XHR9XHRcdFx0XG5cdFx0fVxuXHR9XG5cdFxuXHR0aGlzLl9tYXAgPSBuZXdNYXA7XG5cblx0Ly8gb3B0aW5pYWxseSBjb25uZWN0IGV2ZXJ5IHNwYWNlXG5cdGlmICh0aGlzLl9vcHRpb25zLmNvbm5lY3RlZCkge1xuXHRcdHRoaXMuX2NvbXBsZXRlTWF6ZSgpO1x0XG5cdH1cblxuXHRpZiAoY2FsbGJhY2spIHsgXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl93aWR0aDsgaSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuX2hlaWdodDsgaisrKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGksIGosIG5ld01hcFtpXVtqXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogR2V0IG5laWdoYm9yIGNvdW50IGF0IFtpLGpdIGluIHRoaXMuX21hcFxuICovXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5fZ2V0TmVpZ2hib3JzID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciByZXN1bHQgPSAwO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9kaXJzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgZGlyID0gdGhpcy5fZGlyc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGlyWzBdO1xuXHRcdHZhciB5ID0gY3kgKyBkaXJbMV07XG5cdFx0XG5cdFx0aWYgKHggPCAwIHx8IHggPj0gdGhpcy5fd2lkdGggfHwgeCA8IDAgfHwgeSA+PSB0aGlzLl93aWR0aCkgeyBjb250aW51ZTsgfVxuXHRcdHJlc3VsdCArPSAodGhpcy5fbWFwW3hdW3ldID09IDEgPyAxIDogMCk7XG5cdH1cblx0XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogTWFrZSBzdXJlIGV2ZXJ5IG5vbi13YWxsIHNwYWNlIGlzIGFjY2Vzc2libGUuXG4gKi9cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLl9jb21wbGV0ZU1hemUgPSBmdW5jdGlvbigpIHtcblx0dmFyIGFsbEZyZWVTcGFjZSA9IFtdO1xuXHR2YXIgbm90Q29ubmVjdGVkID0ge307XG5cdC8vIGZpbmQgYWxsIGZyZWUgc3BhY2Vcblx0Zm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLl93aWR0aDsgeCsrKSB7XG5cdFx0Zm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLl9oZWlnaHQ7IHkrKykge1xuXHRcdFx0aWYgKHRoaXMuX2ZyZWVTcGFjZSh4LCB5KSkge1xuXHRcdFx0XHR2YXIgcCA9IFt4LCB5XTtcblx0XHRcdFx0bm90Q29ubmVjdGVkW3RoaXMuX3BvaW50S2V5KHApXSA9IHA7XG5cdFx0XHRcdGFsbEZyZWVTcGFjZS5wdXNoKFt4LCB5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHZhciBzdGFydCA9IGFsbEZyZWVTcGFjZVtST1QuUk5HLmdldFVuaWZvcm1JbnQoMCwgYWxsRnJlZVNwYWNlLmxlbmd0aCAtIDEpXTtcblxuXHR2YXIga2V5ID0gdGhpcy5fcG9pbnRLZXkoc3RhcnQpO1xuXHR2YXIgY29ubmVjdGVkID0ge307XG5cdGNvbm5lY3RlZFtrZXldID0gc3RhcnQ7XG5cdGRlbGV0ZSBub3RDb25uZWN0ZWRba2V5XVxuXG5cdC8vIGZpbmQgd2hhdCdzIGNvbm5lY3RlZCB0byB0aGUgc3RhcnRpbmcgcG9pbnRcblx0dGhpcy5fZmluZENvbm5lY3RlZChjb25uZWN0ZWQsIG5vdENvbm5lY3RlZCwgW3N0YXJ0XSk7XG5cblx0d2hpbGUoT2JqZWN0LmtleXMobm90Q29ubmVjdGVkKS5sZW5ndGggPiAwKSB7XG5cblx0XHQvLyBmaW5kIHR3byBwb2ludHMgZnJvbSBub3RDb25uZWN0ZWQgdG8gY29ubmVjdGVkXG5cdFx0dmFyIHAgPSB0aGlzLl9nZXRGcm9tVG8oY29ubmVjdGVkLCBub3RDb25uZWN0ZWQpO1xuXHRcdHZhciBmcm9tID0gcFswXTsgLy8gbm90Q29ubmVjdGVkXG5cdFx0dmFyIHRvID0gcFsxXTsgLy8gY29ubmVjdGVkXG5cblx0XHQvLyBmaW5kIGV2ZXJ5dGhpbmcgY29ubmVjdGVkIHRvIHRoZSBzdGFydGluZyBwb2ludFxuXHRcdHZhciBsb2NhbCA9IHt9O1xuXHRcdGxvY2FsW3RoaXMuX3BvaW50S2V5KGZyb20pXSA9IGZyb207XG5cdFx0dGhpcy5fZmluZENvbm5lY3RlZChsb2NhbCwgbm90Q29ubmVjdGVkLCBbZnJvbV0sIHRydWUpO1xuXG5cdFx0Ly8gY29ubmVjdCB0byBhIGNvbm5lY3RlZCBzcXVhcmVcblx0XHR0aGlzLl90dW5uZWxUb0Nvbm5lY3RlZCh0bywgZnJvbSwgY29ubmVjdGVkLCBub3RDb25uZWN0ZWQpO1xuXG5cdFx0Ly8gbm93IGFsbCBvZiBsb2NhbCBpcyBjb25uZWN0ZWRcblx0XHRmb3IgKHZhciBrIGluIGxvY2FsKSB7XG5cdFx0XHR2YXIgcHAgPSBsb2NhbFtrXTtcblx0XHRcdHRoaXMuX21hcFtwcFswXV1bcHBbMV1dID0gMDtcblx0XHRcdGNvbm5lY3RlZFtrXSA9IHBwO1xuXHRcdFx0ZGVsZXRlIG5vdENvbm5lY3RlZFtrXTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBGaW5kIHJhbmRvbSBwb2ludHMgdG8gY29ubmVjdC4gU2VhcmNoIGZvciB0aGUgY2xvc2VzdCBwb2ludCBpbiB0aGUgbGFyZ2VyIHNwYWNlLiBcbiAqIFRoaXMgaXMgdG8gbWluaW1pemUgdGhlIGxlbmd0aCBvZiB0aGUgcGFzc2FnZSB3aGlsZSBtYWludGFpbmluZyBnb29kIHBlcmZvcm1hbmNlLlxuICovXG5ST1QuTWFwLkNlbGx1bGFyLnByb3RvdHlwZS5fZ2V0RnJvbVRvID0gZnVuY3Rpb24oY29ubmVjdGVkLCBub3RDb25uZWN0ZWQpIHtcblx0dmFyIGZyb20sIHRvLCBkO1xuXHR2YXIgY29ubmVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGNvbm5lY3RlZCk7XG5cdHZhciBub3RDb25uZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMobm90Q29ubmVjdGVkKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcblx0XHRpZiAoY29ubmVjdGVkS2V5cy5sZW5ndGggPCBub3RDb25uZWN0ZWRLZXlzLmxlbmd0aCkge1xuXHRcdFx0dmFyIGtleXMgPSBjb25uZWN0ZWRLZXlzO1xuXHRcdFx0dG8gPSBjb25uZWN0ZWRba2V5c1tST1QuUk5HLmdldFVuaWZvcm1JbnQoMCwga2V5cy5sZW5ndGggLSAxKV1dXG5cdFx0XHRmcm9tID0gdGhpcy5fZ2V0Q2xvc2VzdCh0bywgbm90Q29ubmVjdGVkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGtleXMgPSBub3RDb25uZWN0ZWRLZXlzO1xuXHRcdFx0ZnJvbSA9IG5vdENvbm5lY3RlZFtrZXlzW1JPVC5STkcuZ2V0VW5pZm9ybUludCgwLCBrZXlzLmxlbmd0aCAtIDEpXV1cblx0XHRcdHRvID0gdGhpcy5fZ2V0Q2xvc2VzdChmcm9tLCBjb25uZWN0ZWQpO1xuXHRcdH1cblx0XHRkID0gKGZyb21bMF0gLSB0b1swXSkgKiAoZnJvbVswXSAtIHRvWzBdKSArIChmcm9tWzFdIC0gdG9bMV0pICogKGZyb21bMV0gLSB0b1sxXSk7XG5cdFx0aWYgKGQgPCA2NCkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cdC8vIGNvbnNvbGUubG9nKFwiPj4+IGNvbm5lY3RlZD1cIiArIHRvICsgXCIgbm90Q29ubmVjdGVkPVwiICsgZnJvbSArIFwiIGRpc3Q9XCIgKyBkKTtcblx0cmV0dXJuIFtmcm9tLCB0b107XG59XG5cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLl9nZXRDbG9zZXN0ID0gZnVuY3Rpb24ocG9pbnQsIHNwYWNlKSB7XG5cdHZhciBtaW5Qb2ludCA9IG51bGw7XG5cdHZhciBtaW5EaXN0ID0gbnVsbDtcblx0Zm9yIChrIGluIHNwYWNlKSB7XG5cdFx0dmFyIHAgPSBzcGFjZVtrXTtcblx0XHR2YXIgZCA9IChwWzBdIC0gcG9pbnRbMF0pICogKHBbMF0gLSBwb2ludFswXSkgKyAocFsxXSAtIHBvaW50WzFdKSAqIChwWzFdIC0gcG9pbnRbMV0pO1xuXHRcdGlmIChtaW5EaXN0ID09IG51bGwgfHwgZCA8IG1pbkRpc3QpIHtcblx0XHRcdG1pbkRpc3QgPSBkO1xuXHRcdFx0bWluUG9pbnQgPSBwO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbWluUG9pbnQ7XG59XG5cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLl9maW5kQ29ubmVjdGVkID0gZnVuY3Rpb24oY29ubmVjdGVkLCBub3RDb25uZWN0ZWQsIHN0YWNrLCBrZWVwTm90Q29ubmVjdGVkKSB7XG5cdHdoaWxlKHN0YWNrLmxlbmd0aCA+IDApIHtcblx0XHR2YXIgcCA9IHN0YWNrLnNwbGljZSgwLCAxKVswXTtcblx0XHR2YXIgdGVzdHMgPSBbXG5cdFx0XHRbcFswXSArIDEsIHBbMV1dLFxuXHRcdFx0W3BbMF0gLSAxLCBwWzFdXSxcblx0XHRcdFtwWzBdLCAgICAgcFsxXSArIDFdLFxuXHRcdFx0W3BbMF0sICAgICBwWzFdIC0gMV1cblx0XHRdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGVzdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBrZXkgPSB0aGlzLl9wb2ludEtleSh0ZXN0c1tpXSk7XG5cdFx0XHRpZiAoY29ubmVjdGVkW2tleV0gPT0gbnVsbCAmJiB0aGlzLl9mcmVlU3BhY2UodGVzdHNbaV1bMF0sIHRlc3RzW2ldWzFdKSkge1xuXHRcdFx0XHRjb25uZWN0ZWRba2V5XSA9IHRlc3RzW2ldO1xuXHRcdFx0XHRpZiAoIWtlZXBOb3RDb25uZWN0ZWQpIHtcblx0XHRcdFx0XHRkZWxldGUgbm90Q29ubmVjdGVkW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdFx0c3RhY2sucHVzaCh0ZXN0c1tpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLl90dW5uZWxUb0Nvbm5lY3RlZCA9IGZ1bmN0aW9uKHRvLCBmcm9tLCBjb25uZWN0ZWQsIG5vdENvbm5lY3RlZCkge1xuXHR2YXIga2V5ID0gdGhpcy5fcG9pbnRLZXkoZnJvbSk7XG5cdHZhciBhLCBiO1xuXHRpZiAoZnJvbVswXSA8IHRvWzBdKSB7XG5cdFx0YSA9IGZyb207XG5cdFx0YiA9IHRvO1xuXHR9IGVsc2Uge1xuXHRcdGEgPSB0bztcblx0XHRiID0gZnJvbTtcblx0fVxuXHRmb3IgKHZhciB4eCA9IGFbMF07IHh4IDw9IGJbMF07IHh4KyspIHtcblx0XHR0aGlzLl9tYXBbeHhdW2FbMV1dID0gMDtcblx0XHR2YXIgcCA9IFt4eCwgYVsxXV07XG5cdFx0dmFyIHBrZXkgPSB0aGlzLl9wb2ludEtleShwKTtcblx0XHRjb25uZWN0ZWRbcGtleV0gPSBwO1xuXHRcdGRlbGV0ZSBub3RDb25uZWN0ZWRbcGtleV07XG5cdH1cblxuXHQvLyB4IGlzIG5vdyBmaXhlZFxuXHR2YXIgeCA9IGJbMF07XG5cblx0aWYgKGZyb21bMV0gPCB0b1sxXSkge1xuXHRcdGEgPSBmcm9tO1xuXHRcdGIgPSB0bztcblx0fSBlbHNlIHtcblx0XHRhID0gdG87XG5cdFx0YiA9IGZyb207XG5cdH1cblx0Zm9yICh2YXIgeXkgPSBhWzFdOyB5eSA8IGJbMV07IHl5KyspIHtcblx0XHR0aGlzLl9tYXBbeF1beXldID0gMDtcblx0XHR2YXIgcCA9IFt4LCB5eV07XG5cdFx0dmFyIHBrZXkgPSB0aGlzLl9wb2ludEtleShwKTtcblx0XHRjb25uZWN0ZWRbcGtleV0gPSBwO1xuXHRcdGRlbGV0ZSBub3RDb25uZWN0ZWRbcGtleV07XG5cdH1cbn1cblxuUk9ULk1hcC5DZWxsdWxhci5wcm90b3R5cGUuX2ZyZWVTcGFjZSA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0cmV0dXJuIHggPj0gMCAmJiB4IDwgdGhpcy5fd2lkdGggJiYgeSA+PSAwICYmIHkgPCB0aGlzLl9oZWlnaHQgJiYgdGhpcy5fbWFwW3hdW3ldICE9IDE7XG59XG5cblJPVC5NYXAuQ2VsbHVsYXIucHJvdG90eXBlLl9wb2ludEtleSA9IGZ1bmN0aW9uKHApIHtcblx0cmV0dXJuIHBbMF0gKyBcIi5cIiArIHBbMV07XG59XG5cbi8qKlxuICogQGNsYXNzIER1bmdlb24gbWFwOiBoYXMgcm9vbXMgYW5kIGNvcnJpZG9yc1xuICogQGF1Z21lbnRzIFJPVC5NYXBcbiAqL1xuUk9ULk1hcC5EdW5nZW9uID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXHRST1QuTWFwLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG5cdHRoaXMuX3Jvb21zID0gW107IC8qIGxpc3Qgb2YgYWxsIHJvb21zICovXG5cdHRoaXMuX2NvcnJpZG9ycyA9IFtdO1xufVxuUk9ULk1hcC5EdW5nZW9uLmV4dGVuZChST1QuTWFwKTtcblxuLyoqXG4gKiBHZXQgYWxsIGdlbmVyYXRlZCByb29tc1xuICogQHJldHVybnMge1JPVC5NYXAuRmVhdHVyZS5Sb29tW119XG4gKi9cblJPVC5NYXAuRHVuZ2Vvbi5wcm90b3R5cGUuZ2V0Um9vbXMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3Jvb21zO1xufVxuXG4vKipcbiAqIEdldCBhbGwgZ2VuZXJhdGVkIGNvcnJpZG9yc1xuICogQHJldHVybnMge1JPVC5NYXAuRmVhdHVyZS5Db3JyaWRvcltdfVxuICovXG5ST1QuTWFwLkR1bmdlb24ucHJvdG90eXBlLmdldENvcnJpZG9ycyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fY29ycmlkb3JzO1xufVxuLyoqXG4gKiBAY2xhc3MgUmFuZG9tIGR1bmdlb24gZ2VuZXJhdG9yIHVzaW5nIGh1bWFuLWxpa2UgZGlnZ2luZyBwYXR0ZXJucy5cbiAqIEhlYXZpbHkgYmFzZWQgb24gTWlrZSBBbmRlcnNvbidzIGlkZWFzIGZyb20gdGhlIFwiVHlyYW50XCIgYWxnbywgbWVudGlvbmVkIGF0IFxuICogaHR0cDovL3d3dy5yb2d1ZWJhc2luLnJvZ3VlbGlrZWRldmVsb3BtZW50Lm9yZy9pbmRleC5waHA/dGl0bGU9RHVuZ2Vvbi1CdWlsZGluZ19BbGdvcml0aG0uXG4gKiBAYXVnbWVudHMgUk9ULk1hcC5EdW5nZW9uXG4gKi9cblJPVC5NYXAuRGlnZ2VyID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucykge1xuXHRST1QuTWFwLkR1bmdlb24uY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0cm9vbVdpZHRoOiBbMywgOV0sIC8qIHJvb20gbWluaW11bSBhbmQgbWF4aW11bSB3aWR0aCAqL1xuXHRcdHJvb21IZWlnaHQ6IFszLCA1XSwgLyogcm9vbSBtaW5pbXVtIGFuZCBtYXhpbXVtIGhlaWdodCAqL1xuXHRcdGNvcnJpZG9yTGVuZ3RoOiBbMywgMTBdLCAvKiBjb3JyaWRvciBtaW5pbXVtIGFuZCBtYXhpbXVtIGxlbmd0aCAqL1xuXHRcdGR1Z1BlcmNlbnRhZ2U6IDAuMiwgLyogd2Ugc3RvcCBhZnRlciB0aGlzIHBlcmNlbnRhZ2Ugb2YgbGV2ZWwgYXJlYSBoYXMgYmVlbiBkdWcgb3V0ICovXG5cdFx0dGltZUxpbWl0OiAxMDAwIC8qIHdlIHN0b3AgYWZ0ZXIgdGhpcyBtdWNoIHRpbWUgaGFzIHBhc3NlZCAobXNlYykgKi9cblx0fVxuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblx0XG5cdHRoaXMuX2ZlYXR1cmVzID0ge1xuXHRcdFwiUm9vbVwiOiA0LFxuXHRcdFwiQ29ycmlkb3JcIjogNFxuXHR9XG5cdHRoaXMuX2ZlYXR1cmVBdHRlbXB0cyA9IDIwOyAvKiBob3cgbWFueSB0aW1lcyBkbyB3ZSB0cnkgdG8gY3JlYXRlIGEgZmVhdHVyZSBvbiBhIHN1aXRhYmxlIHdhbGwgKi9cblx0dGhpcy5fd2FsbHMgPSB7fTsgLyogdGhlc2UgYXJlIGF2YWlsYWJsZSBmb3IgZGlnZ2luZyAqL1xuXHRcblx0dGhpcy5fZGlnQ2FsbGJhY2sgPSB0aGlzLl9kaWdDYWxsYmFjay5iaW5kKHRoaXMpO1xuXHR0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrID0gdGhpcy5fY2FuQmVEdWdDYWxsYmFjay5iaW5kKHRoaXMpO1xuXHR0aGlzLl9pc1dhbGxDYWxsYmFjayA9IHRoaXMuX2lzV2FsbENhbGxiYWNrLmJpbmQodGhpcyk7XG5cdHRoaXMuX3ByaW9yaXR5V2FsbENhbGxiYWNrID0gdGhpcy5fcHJpb3JpdHlXYWxsQ2FsbGJhY2suYmluZCh0aGlzKTtcbn1cblJPVC5NYXAuRGlnZ2VyLmV4dGVuZChST1QuTWFwLkR1bmdlb24pO1xuXG4vKipcbiAqIENyZWF0ZSBhIG1hcFxuICogQHNlZSBST1QuTWFwI2NyZWF0ZVxuICovXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dGhpcy5fcm9vbXMgPSBbXTtcblx0dGhpcy5fY29ycmlkb3JzID0gW107XG5cdHRoaXMuX21hcCA9IHRoaXMuX2ZpbGxNYXAoMSk7XG5cdHRoaXMuX3dhbGxzID0ge307XG5cdHRoaXMuX2R1ZyA9IDA7XG5cdHZhciBhcmVhID0gKHRoaXMuX3dpZHRoLTIpICogKHRoaXMuX2hlaWdodC0yKTtcblxuXHR0aGlzLl9maXJzdFJvb20oKTtcblx0XG5cdHZhciB0MSA9IERhdGUubm93KCk7XG5cblx0ZG8ge1xuXHRcdHZhciB0MiA9IERhdGUubm93KCk7XG5cdFx0aWYgKHQyIC0gdDEgPiB0aGlzLl9vcHRpb25zLnRpbWVMaW1pdCkgeyBicmVhazsgfVxuXG5cdFx0LyogZmluZCBhIGdvb2Qgd2FsbCAqL1xuXHRcdHZhciB3YWxsID0gdGhpcy5fZmluZFdhbGwoKTtcblx0XHRpZiAoIXdhbGwpIHsgYnJlYWs7IH0gLyogbm8gbW9yZSB3YWxscyAqL1xuXHRcdFxuXHRcdHZhciBwYXJ0cyA9IHdhbGwuc3BsaXQoXCIsXCIpO1xuXHRcdHZhciB4ID0gcGFyc2VJbnQocGFydHNbMF0pO1xuXHRcdHZhciB5ID0gcGFyc2VJbnQocGFydHNbMV0pO1xuXHRcdHZhciBkaXIgPSB0aGlzLl9nZXREaWdnaW5nRGlyZWN0aW9uKHgsIHkpO1xuXHRcdGlmICghZGlyKSB7IGNvbnRpbnVlOyB9IC8qIHRoaXMgd2FsbCBpcyBub3Qgc3VpdGFibGUgKi9cblx0XHRcbi8vXHRcdGNvbnNvbGUubG9nKFwid2FsbFwiLCB4LCB5KTtcblxuXHRcdC8qIHRyeSBhZGRpbmcgYSBmZWF0dXJlICovXG5cdFx0dmFyIGZlYXR1cmVBdHRlbXB0cyA9IDA7XG5cdFx0ZG8ge1xuXHRcdFx0ZmVhdHVyZUF0dGVtcHRzKys7XG5cdFx0XHRpZiAodGhpcy5fdHJ5RmVhdHVyZSh4LCB5LCBkaXJbMF0sIGRpclsxXSkpIHsgLyogZmVhdHVyZSBhZGRlZCAqL1xuXHRcdFx0XHQvL2lmICh0aGlzLl9yb29tcy5sZW5ndGggKyB0aGlzLl9jb3JyaWRvcnMubGVuZ3RoID09IDIpIHsgdGhpcy5fcm9vbXNbMF0uYWRkRG9vcih4LCB5KTsgfSAvKiBmaXJzdCByb29tIG9maWNpYWxseSBoYXMgZG9vcnMgKi9cblx0XHRcdFx0dGhpcy5fcmVtb3ZlU3Vycm91bmRpbmdXYWxscyh4LCB5KTtcblx0XHRcdFx0dGhpcy5fcmVtb3ZlU3Vycm91bmRpbmdXYWxscyh4LWRpclswXSwgeS1kaXJbMV0pO1xuXHRcdFx0XHRicmVhazsgXG5cdFx0XHR9XG5cdFx0fSB3aGlsZSAoZmVhdHVyZUF0dGVtcHRzIDwgdGhpcy5fZmVhdHVyZUF0dGVtcHRzKTtcblx0XHRcblx0XHR2YXIgcHJpb3JpdHlXYWxscyA9IDA7XG5cdFx0Zm9yICh2YXIgaWQgaW4gdGhpcy5fd2FsbHMpIHsgXG5cdFx0XHRpZiAodGhpcy5fd2FsbHNbaWRdID4gMSkgeyBwcmlvcml0eVdhbGxzKys7IH1cblx0XHR9XG5cblx0fSB3aGlsZSAodGhpcy5fZHVnL2FyZWEgPCB0aGlzLl9vcHRpb25zLmR1Z1BlcmNlbnRhZ2UgfHwgcHJpb3JpdHlXYWxscyk7IC8qIGZpeG1lIG51bWJlciBvZiBwcmlvcml0eSB3YWxscyAqL1xuXG5cdHRoaXMuX2FkZERvb3JzKCk7XG5cblx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fd2lkdGg7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTA7ajx0aGlzLl9oZWlnaHQ7aisrKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGksIGosIHRoaXMuX21hcFtpXVtqXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHR0aGlzLl93YWxscyA9IHt9O1xuXHR0aGlzLl9tYXAgPSBudWxsO1xuXG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2RpZ0NhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSwgdmFsdWUpIHtcblx0aWYgKHZhbHVlID09IDAgfHwgdmFsdWUgPT0gMikgeyAvKiBlbXB0eSAqL1xuXHRcdHRoaXMuX21hcFt4XVt5XSA9IDA7XG5cdFx0dGhpcy5fZHVnKys7XG5cdH0gZWxzZSB7IC8qIHdhbGwgKi9cblx0XHR0aGlzLl93YWxsc1t4K1wiLFwiK3ldID0gMTtcblx0fVxufVxuXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2lzV2FsbENhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHRpZiAoeCA8IDAgfHwgeSA8IDAgfHwgeCA+PSB0aGlzLl93aWR0aCB8fCB5ID49IHRoaXMuX2hlaWdodCkgeyByZXR1cm4gZmFsc2U7IH1cblx0cmV0dXJuICh0aGlzLl9tYXBbeF1beV0gPT0gMSk7XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fY2FuQmVEdWdDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0aWYgKHggPCAxIHx8IHkgPCAxIHx8IHgrMSA+PSB0aGlzLl93aWR0aCB8fCB5KzEgPj0gdGhpcy5faGVpZ2h0KSB7IHJldHVybiBmYWxzZTsgfVxuXHRyZXR1cm4gKHRoaXMuX21hcFt4XVt5XSA9PSAxKTtcbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9wcmlvcml0eVdhbGxDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0dGhpcy5fd2FsbHNbeCtcIixcIit5XSA9IDI7XG59XG5cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fZmlyc3RSb29tID0gZnVuY3Rpb24oKSB7XG5cdHZhciBjeCA9IE1hdGguZmxvb3IodGhpcy5fd2lkdGgvMik7XG5cdHZhciBjeSA9IE1hdGguZmxvb3IodGhpcy5faGVpZ2h0LzIpO1xuXHR2YXIgcm9vbSA9IFJPVC5NYXAuRmVhdHVyZS5Sb29tLmNyZWF0ZVJhbmRvbUNlbnRlcihjeCwgY3ksIHRoaXMuX29wdGlvbnMpO1xuXHR0aGlzLl9yb29tcy5wdXNoKHJvb20pO1xuXHRyb29tLmNyZWF0ZSh0aGlzLl9kaWdDYWxsYmFjayk7XG59XG5cbi8qKlxuICogR2V0IGEgc3VpdGFibGUgd2FsbFxuICovXG5ST1QuTWFwLkRpZ2dlci5wcm90b3R5cGUuX2ZpbmRXYWxsID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwcmlvMSA9IFtdO1xuXHR2YXIgcHJpbzIgPSBbXTtcblx0Zm9yICh2YXIgaWQgaW4gdGhpcy5fd2FsbHMpIHtcblx0XHR2YXIgcHJpbyA9IHRoaXMuX3dhbGxzW2lkXTtcblx0XHRpZiAocHJpbyA9PSAyKSB7IFxuXHRcdFx0cHJpbzIucHVzaChpZCk7IFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcmlvMS5wdXNoKGlkKTtcblx0XHR9XG5cdH1cblx0XG5cdHZhciBhcnIgPSAocHJpbzIubGVuZ3RoID8gcHJpbzIgOiBwcmlvMSk7XG5cdGlmICghYXJyLmxlbmd0aCkgeyByZXR1cm4gbnVsbDsgfSAvKiBubyB3YWxscyA6LyAqL1xuXHRcblx0dmFyIGlkID0gYXJyLnJhbmRvbSgpO1xuXHRkZWxldGUgdGhpcy5fd2FsbHNbaWRdO1xuXG5cdHJldHVybiBpZDtcbn1cblxuLyoqXG4gKiBUcmllcyBhZGRpbmcgYSBmZWF0dXJlXG4gKiBAcmV0dXJucyB7Ym9vbH0gd2FzIHRoaXMgYSBzdWNjZXNzZnVsIHRyeT9cbiAqL1xuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl90cnlGZWF0dXJlID0gZnVuY3Rpb24oeCwgeSwgZHgsIGR5KSB7XG5cdHZhciBmZWF0dXJlID0gUk9ULlJORy5nZXRXZWlnaHRlZFZhbHVlKHRoaXMuX2ZlYXR1cmVzKTtcblx0ZmVhdHVyZSA9IFJPVC5NYXAuRmVhdHVyZVtmZWF0dXJlXS5jcmVhdGVSYW5kb21BdCh4LCB5LCBkeCwgZHksIHRoaXMuX29wdGlvbnMpO1xuXHRcblx0aWYgKCFmZWF0dXJlLmlzVmFsaWQodGhpcy5faXNXYWxsQ2FsbGJhY2ssIHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2spKSB7XG4vL1x0XHRjb25zb2xlLmxvZyhcIm5vdCB2YWxpZFwiKTtcbi8vXHRcdGZlYXR1cmUuZGVidWcoKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdGZlYXR1cmUuY3JlYXRlKHRoaXMuX2RpZ0NhbGxiYWNrKTtcbi8vXHRmZWF0dXJlLmRlYnVnKCk7XG5cblx0aWYgKGZlYXR1cmUgaW5zdGFuY2VvZiBST1QuTWFwLkZlYXR1cmUuUm9vbSkgeyB0aGlzLl9yb29tcy5wdXNoKGZlYXR1cmUpOyB9XG5cdGlmIChmZWF0dXJlIGluc3RhbmNlb2YgUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yKSB7IFxuXHRcdGZlYXR1cmUuY3JlYXRlUHJpb3JpdHlXYWxscyh0aGlzLl9wcmlvcml0eVdhbGxDYWxsYmFjayk7XG5cdFx0dGhpcy5fY29ycmlkb3JzLnB1c2goZmVhdHVyZSk7IFxuXHR9XG5cdFxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9yZW1vdmVTdXJyb3VuZGluZ1dhbGxzID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciBkZWx0YXMgPSBST1QuRElSU1s0XTtcblxuXHRmb3IgKHZhciBpPTA7aTxkZWx0YXMubGVuZ3RoO2krKykge1xuXHRcdHZhciBkZWx0YSA9IGRlbHRhc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGVsdGFbMF07XG5cdFx0dmFyIHkgPSBjeSArIGRlbHRhWzFdO1xuXHRcdGRlbGV0ZSB0aGlzLl93YWxsc1t4K1wiLFwiK3ldO1xuXHRcdHZhciB4ID0gY3ggKyAyKmRlbHRhWzBdO1xuXHRcdHZhciB5ID0gY3kgKyAyKmRlbHRhWzFdO1xuXHRcdGRlbGV0ZSB0aGlzLl93YWxsc1t4K1wiLFwiK3ldO1xuXHR9XG59XG5cbi8qKlxuICogUmV0dXJucyB2ZWN0b3IgaW4gXCJkaWdnaW5nXCIgZGlyZWN0aW9uLCBvciBmYWxzZSwgaWYgdGhpcyBkb2VzIG5vdCBleGlzdCAob3IgaXMgbm90IHVuaXF1ZSlcbiAqL1xuUk9ULk1hcC5EaWdnZXIucHJvdG90eXBlLl9nZXREaWdnaW5nRGlyZWN0aW9uID0gZnVuY3Rpb24oY3gsIGN5KSB7XG5cdHZhciByZXN1bHQgPSBudWxsO1xuXHR2YXIgZGVsdGFzID0gUk9ULkRJUlNbNF07XG5cdFxuXHRmb3IgKHZhciBpPTA7aTxkZWx0YXMubGVuZ3RoO2krKykge1xuXHRcdHZhciBkZWx0YSA9IGRlbHRhc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGVsdGFbMF07XG5cdFx0dmFyIHkgPSBjeSArIGRlbHRhWzFdO1xuXHRcdFxuXHRcdGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMuX3dpZHRoIHx8IHkgPj0gdGhpcy5fd2lkdGgpIHsgcmV0dXJuIG51bGw7IH1cblx0XHRcblx0XHRpZiAoIXRoaXMuX21hcFt4XVt5XSkgeyAvKiB0aGVyZSBhbHJlYWR5IGlzIGFub3RoZXIgZW1wdHkgbmVpZ2hib3IhICovXG5cdFx0XHRpZiAocmVzdWx0KSB7IHJldHVybiBudWxsOyB9XG5cdFx0XHRyZXN1bHQgPSBkZWx0YTtcblx0XHR9XG5cdH1cblx0XG5cdC8qIG5vIGVtcHR5IG5laWdoYm9yICovXG5cdGlmICghcmVzdWx0KSB7IHJldHVybiBudWxsOyB9XG5cdFxuXHRyZXR1cm4gWy1yZXN1bHRbMF0sIC1yZXN1bHRbMV1dO1xufVxuXG4vKipcbiAqIEZpbmQgZW1wdHkgc3BhY2VzIHN1cnJvdW5kaW5nIHJvb21zLCBhbmQgYXBwbHkgZG9vcnMuXG4gKi9cblJPVC5NYXAuRGlnZ2VyLnByb3RvdHlwZS5fYWRkRG9vcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRhdGEgPSB0aGlzLl9tYXA7XG5cdHZhciBpc1dhbGxDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0XHRyZXR1cm4gKGRhdGFbeF1beV0gPT0gMSk7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9yb29tcy5sZW5ndGg7IGkrKyApIHtcblx0XHR2YXIgcm9vbSA9IHRoaXMuX3Jvb21zW2ldO1xuXHRcdHJvb20uY2xlYXJEb29ycygpO1xuXHRcdHJvb20uYWRkRG9vcnMoaXNXYWxsQ2FsbGJhY2spO1xuXHR9XG59XG4vKipcbiAqIEBjbGFzcyBEdW5nZW9uIGdlbmVyYXRvciB3aGljaCB0cmllcyB0byBmaWxsIHRoZSBzcGFjZSBldmVubHkuIEdlbmVyYXRlcyBpbmRlcGVuZGVudCByb29tcyBhbmQgdHJpZXMgdG8gY29ubmVjdCB0aGVtLlxuICogQGF1Z21lbnRzIFJPVC5NYXAuRHVuZ2VvblxuICovXG5ST1QuTWFwLlVuaWZvcm0gPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cdFJPVC5NYXAuRHVuZ2Vvbi5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuXG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0cm9vbVdpZHRoOiBbMywgOV0sIC8qIHJvb20gbWluaW11bSBhbmQgbWF4aW11bSB3aWR0aCAqL1xuXHRcdHJvb21IZWlnaHQ6IFszLCA1XSwgLyogcm9vbSBtaW5pbXVtIGFuZCBtYXhpbXVtIGhlaWdodCAqL1xuXHRcdHJvb21EdWdQZXJjZW50YWdlOiAwLjEsIC8qIHdlIHN0b3AgYWZ0ZXIgdGhpcyBwZXJjZW50YWdlIG9mIGxldmVsIGFyZWEgaGFzIGJlZW4gZHVnIG91dCBieSByb29tcyAqL1xuXHRcdHRpbWVMaW1pdDogMTAwMCAvKiB3ZSBzdG9wIGFmdGVyIHRoaXMgbXVjaCB0aW1lIGhhcyBwYXNzZWQgKG1zZWMpICovXG5cdH1cblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cblx0dGhpcy5fcm9vbUF0dGVtcHRzID0gMjA7IC8qIG5ldyByb29tIGlzIGNyZWF0ZWQgTi10aW1lcyB1bnRpbCBpcyBjb25zaWRlcmVkIGFzIGltcG9zc2libGUgdG8gZ2VuZXJhdGUgKi9cblx0dGhpcy5fY29ycmlkb3JBdHRlbXB0cyA9IDIwOyAvKiBjb3JyaWRvcnMgYXJlIHRyaWVkIE4tdGltZXMgdW50aWwgdGhlIGxldmVsIGlzIGNvbnNpZGVyZWQgYXMgaW1wb3NzaWJsZSB0byBjb25uZWN0ICovXG5cblx0dGhpcy5fY29ubmVjdGVkID0gW107IC8qIGxpc3Qgb2YgYWxyZWFkeSBjb25uZWN0ZWQgcm9vbXMgKi9cblx0dGhpcy5fdW5jb25uZWN0ZWQgPSBbXTsgLyogbGlzdCBvZiByZW1haW5pbmcgdW5jb25uZWN0ZWQgcm9vbXMgKi9cblx0XG5cdHRoaXMuX2RpZ0NhbGxiYWNrID0gdGhpcy5fZGlnQ2FsbGJhY2suYmluZCh0aGlzKTtcblx0dGhpcy5fY2FuQmVEdWdDYWxsYmFjayA9IHRoaXMuX2NhbkJlRHVnQ2FsbGJhY2suYmluZCh0aGlzKTtcblx0dGhpcy5faXNXYWxsQ2FsbGJhY2sgPSB0aGlzLl9pc1dhbGxDYWxsYmFjay5iaW5kKHRoaXMpO1xufVxuUk9ULk1hcC5Vbmlmb3JtLmV4dGVuZChST1QuTWFwLkR1bmdlb24pO1xuXG4vKipcbiAqIENyZWF0ZSBhIG1hcC4gSWYgdGhlIHRpbWUgbGltaXQgaGFzIGJlZW4gaGl0LCByZXR1cm5zIG51bGwuXG4gKiBAc2VlIFJPVC5NYXAjY3JlYXRlXG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0dmFyIHQxID0gRGF0ZS5ub3coKTtcblx0d2hpbGUgKDEpIHtcblx0XHR2YXIgdDIgPSBEYXRlLm5vdygpO1xuXHRcdGlmICh0MiAtIHQxID4gdGhpcy5fb3B0aW9ucy50aW1lTGltaXQpIHsgcmV0dXJuIG51bGw7IH0gLyogdGltZSBsaW1pdCEgKi9cblx0XG5cdFx0dGhpcy5fbWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0XHR0aGlzLl9kdWcgPSAwO1xuXHRcdHRoaXMuX3Jvb21zID0gW107XG5cdFx0dGhpcy5fdW5jb25uZWN0ZWQgPSBbXTtcblx0XHR0aGlzLl9nZW5lcmF0ZVJvb21zKCk7XG5cdFx0aWYgKHRoaXMuX3Jvb21zLmxlbmd0aCA8IDIpIHsgY29udGludWU7IH1cblx0XHRpZiAodGhpcy5fZ2VuZXJhdGVDb3JyaWRvcnMoKSkgeyBicmVhazsgfVxuXHR9XG5cdFxuXHRpZiAoY2FsbGJhY2spIHtcblx0XHRmb3IgKHZhciBpPTA7aTx0aGlzLl93aWR0aDtpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MDtqPHRoaXMuX2hlaWdodDtqKyspIHtcblx0XHRcdFx0Y2FsbGJhY2soaSwgaiwgdGhpcy5fbWFwW2ldW2pdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHN1aXRhYmxlIGFtb3VudCBvZiByb29tc1xuICovXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9nZW5lcmF0ZVJvb21zID0gZnVuY3Rpb24oKSB7XG5cdHZhciB3ID0gdGhpcy5fd2lkdGgtMjtcblx0dmFyIGggPSB0aGlzLl9oZWlnaHQtMjtcblxuXHRkbyB7XG5cdFx0dmFyIHJvb20gPSB0aGlzLl9nZW5lcmF0ZVJvb20oKTtcblx0XHRpZiAodGhpcy5fZHVnLyh3KmgpID4gdGhpcy5fb3B0aW9ucy5yb29tRHVnUGVyY2VudGFnZSkgeyBicmVhazsgfSAvKiBhY2hpZXZlZCByZXF1ZXN0ZWQgYW1vdW50IG9mIGZyZWUgc3BhY2UgKi9cblx0fSB3aGlsZSAocm9vbSk7XG5cblx0LyogZWl0aGVyIGVub3VnaCByb29tcywgb3Igbm90IGFibGUgdG8gZ2VuZXJhdGUgbW9yZSBvZiB0aGVtIDopICovXG59XG5cbi8qKlxuICogVHJ5IHRvIGdlbmVyYXRlIG9uZSByb29tXG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2dlbmVyYXRlUm9vbSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgY291bnQgPSAwO1xuXHR3aGlsZSAoY291bnQgPCB0aGlzLl9yb29tQXR0ZW1wdHMpIHtcblx0XHRjb3VudCsrO1xuXHRcdFxuXHRcdHZhciByb29tID0gUk9ULk1hcC5GZWF0dXJlLlJvb20uY3JlYXRlUmFuZG9tKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQsIHRoaXMuX29wdGlvbnMpO1xuXHRcdGlmICghcm9vbS5pc1ZhbGlkKHRoaXMuX2lzV2FsbENhbGxiYWNrLCB0aGlzLl9jYW5CZUR1Z0NhbGxiYWNrKSkgeyBjb250aW51ZTsgfVxuXHRcdFxuXHRcdHJvb20uY3JlYXRlKHRoaXMuX2RpZ0NhbGxiYWNrKTtcblx0XHR0aGlzLl9yb29tcy5wdXNoKHJvb20pO1xuXHRcdHJldHVybiByb29tO1xuXHR9IFxuXG5cdC8qIG5vIHJvb20gd2FzIGdlbmVyYXRlZCBpbiBhIGdpdmVuIG51bWJlciBvZiBhdHRlbXB0cyAqL1xuXHRyZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgY29ubmVjdG9ycyBiZXdlZW4gcm9vbXNcbiAqIEByZXR1cm5zIHtib29sfSBzdWNjZXNzIFdhcyB0aGlzIGF0dGVtcHQgc3VjY2Vzc2Z1bGw/XG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2dlbmVyYXRlQ29ycmlkb3JzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBjbnQgPSAwO1xuXHR3aGlsZSAoY250IDwgdGhpcy5fY29ycmlkb3JBdHRlbXB0cykge1xuXHRcdGNudCsrO1xuXHRcdHRoaXMuX2NvcnJpZG9ycyA9IFtdO1xuXG5cdFx0LyogZGlnIHJvb21zIGludG8gYSBjbGVhciBtYXAgKi9cblx0XHR0aGlzLl9tYXAgPSB0aGlzLl9maWxsTWFwKDEpO1xuXHRcdGZvciAodmFyIGk9MDtpPHRoaXMuX3Jvb21zLmxlbmd0aDtpKyspIHsgXG5cdFx0XHR2YXIgcm9vbSA9IHRoaXMuX3Jvb21zW2ldO1xuXHRcdFx0cm9vbS5jbGVhckRvb3JzKCk7XG5cdFx0XHRyb29tLmNyZWF0ZSh0aGlzLl9kaWdDYWxsYmFjayk7IFxuXHRcdH1cblxuXHRcdHRoaXMuX3VuY29ubmVjdGVkID0gdGhpcy5fcm9vbXMuc2xpY2UoKS5yYW5kb21pemUoKTtcblx0XHR0aGlzLl9jb25uZWN0ZWQgPSBbXTtcblx0XHRpZiAodGhpcy5fdW5jb25uZWN0ZWQubGVuZ3RoKSB7IHRoaXMuX2Nvbm5lY3RlZC5wdXNoKHRoaXMuX3VuY29ubmVjdGVkLnBvcCgpKTsgfSAvKiBmaXJzdCBvbmUgaXMgYWx3YXlzIGNvbm5lY3RlZCAqL1xuXHRcdFxuXHRcdHdoaWxlICgxKSB7XG5cdFx0XHQvKiAxLiBwaWNrIHJhbmRvbSBjb25uZWN0ZWQgcm9vbSAqL1xuXHRcdFx0dmFyIGNvbm5lY3RlZCA9IHRoaXMuX2Nvbm5lY3RlZC5yYW5kb20oKTtcblx0XHRcdFxuXHRcdFx0LyogMi4gZmluZCBjbG9zZXN0IHVuY29ubmVjdGVkICovXG5cdFx0XHR2YXIgcm9vbTEgPSB0aGlzLl9jbG9zZXN0Um9vbSh0aGlzLl91bmNvbm5lY3RlZCwgY29ubmVjdGVkKTtcblx0XHRcdFxuXHRcdFx0LyogMy4gY29ubmVjdCBpdCB0byBjbG9zZXN0IGNvbm5lY3RlZCAqL1xuXHRcdFx0dmFyIHJvb20yID0gdGhpcy5fY2xvc2VzdFJvb20odGhpcy5fY29ubmVjdGVkLCByb29tMSk7XG5cdFx0XHRcblx0XHRcdHZhciBvayA9IHRoaXMuX2Nvbm5lY3RSb29tcyhyb29tMSwgcm9vbTIpO1xuXHRcdFx0aWYgKCFvaykgeyBicmVhazsgfSAvKiBzdG9wIGNvbm5lY3RpbmcsIHJlLXNodWZmbGUgKi9cblx0XHRcdFxuXHRcdFx0aWYgKCF0aGlzLl91bmNvbm5lY3RlZC5sZW5ndGgpIHsgcmV0dXJuIHRydWU7IH0gLyogZG9uZTsgbm8gcm9vbXMgcmVtYWluICovXG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBGb3IgYSBnaXZlbiByb29tLCBmaW5kIHRoZSBjbG9zZXN0IG9uZSBmcm9tIHRoZSBsaXN0XG4gKi9cblJPVC5NYXAuVW5pZm9ybS5wcm90b3R5cGUuX2Nsb3Nlc3RSb29tID0gZnVuY3Rpb24ocm9vbXMsIHJvb20pIHtcblx0dmFyIGRpc3QgPSBJbmZpbml0eTtcblx0dmFyIGNlbnRlciA9IHJvb20uZ2V0Q2VudGVyKCk7XG5cdHZhciByZXN1bHQgPSBudWxsO1xuXHRcblx0Zm9yICh2YXIgaT0wO2k8cm9vbXMubGVuZ3RoO2krKykge1xuXHRcdHZhciByID0gcm9vbXNbaV07XG5cdFx0dmFyIGMgPSByLmdldENlbnRlcigpO1xuXHRcdHZhciBkeCA9IGNbMF0tY2VudGVyWzBdO1xuXHRcdHZhciBkeSA9IGNbMV0tY2VudGVyWzFdO1xuXHRcdHZhciBkID0gZHgqZHgrZHkqZHk7XG5cdFx0XG5cdFx0aWYgKGQgPCBkaXN0KSB7XG5cdFx0XHRkaXN0ID0gZDtcblx0XHRcdHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9jb25uZWN0Um9vbXMgPSBmdW5jdGlvbihyb29tMSwgcm9vbTIpIHtcblx0Lypcblx0XHRyb29tMS5kZWJ1ZygpO1xuXHRcdHJvb20yLmRlYnVnKCk7XG5cdCovXG5cblx0dmFyIGNlbnRlcjEgPSByb29tMS5nZXRDZW50ZXIoKTtcblx0dmFyIGNlbnRlcjIgPSByb29tMi5nZXRDZW50ZXIoKTtcblxuXHR2YXIgZGlmZlggPSBjZW50ZXIyWzBdIC0gY2VudGVyMVswXTtcblx0dmFyIGRpZmZZID0gY2VudGVyMlsxXSAtIGNlbnRlcjFbMV07XG5cblx0aWYgKE1hdGguYWJzKGRpZmZYKSA8IE1hdGguYWJzKGRpZmZZKSkgeyAvKiBmaXJzdCB0cnkgY29ubmVjdGluZyBub3J0aC1zb3V0aCB3YWxscyAqL1xuXHRcdHZhciBkaXJJbmRleDEgPSAoZGlmZlkgPiAwID8gMiA6IDApO1xuXHRcdHZhciBkaXJJbmRleDIgPSAoZGlySW5kZXgxICsgMikgJSA0O1xuXHRcdHZhciBtaW4gPSByb29tMi5nZXRMZWZ0KCk7XG5cdFx0dmFyIG1heCA9IHJvb20yLmdldFJpZ2h0KCk7XG5cdFx0dmFyIGluZGV4ID0gMDtcblx0fSBlbHNlIHsgLyogZmlyc3QgdHJ5IGNvbm5lY3RpbmcgZWFzdC13ZXN0IHdhbGxzICovXG5cdFx0dmFyIGRpckluZGV4MSA9IChkaWZmWCA+IDAgPyAxIDogMyk7XG5cdFx0dmFyIGRpckluZGV4MiA9IChkaXJJbmRleDEgKyAyKSAlIDQ7XG5cdFx0dmFyIG1pbiA9IHJvb20yLmdldFRvcCgpO1xuXHRcdHZhciBtYXggPSByb29tMi5nZXRCb3R0b20oKTtcblx0XHR2YXIgaW5kZXggPSAxO1xuXHR9XG5cblx0dmFyIHN0YXJ0ID0gdGhpcy5fcGxhY2VJbldhbGwocm9vbTEsIGRpckluZGV4MSk7IC8qIGNvcnJpZG9yIHdpbGwgc3RhcnQgaGVyZSAqL1xuXHRpZiAoIXN0YXJ0KSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmIChzdGFydFtpbmRleF0gPj0gbWluICYmIHN0YXJ0W2luZGV4XSA8PSBtYXgpIHsgLyogcG9zc2libGUgdG8gY29ubmVjdCB3aXRoIHN0cmFpZ2h0IGxpbmUgKEktbGlrZSkgKi9cblx0XHR2YXIgZW5kID0gc3RhcnQuc2xpY2UoKTtcblx0XHR2YXIgdmFsdWUgPSBudWxsO1xuXHRcdHN3aXRjaCAoZGlySW5kZXgyKSB7XG5cdFx0XHRjYXNlIDA6IHZhbHVlID0gcm9vbTIuZ2V0VG9wKCktMTsgYnJlYWs7XG5cdFx0XHRjYXNlIDE6IHZhbHVlID0gcm9vbTIuZ2V0UmlnaHQoKSsxOyBicmVhaztcblx0XHRcdGNhc2UgMjogdmFsdWUgPSByb29tMi5nZXRCb3R0b20oKSsxOyBicmVhaztcblx0XHRcdGNhc2UgMzogdmFsdWUgPSByb29tMi5nZXRMZWZ0KCktMTsgYnJlYWs7XG5cdFx0fVxuXHRcdGVuZFsoaW5kZXgrMSklMl0gPSB2YWx1ZTtcblx0XHR0aGlzLl9kaWdMaW5lKFtzdGFydCwgZW5kXSk7XG5cdFx0XG5cdH0gZWxzZSBpZiAoc3RhcnRbaW5kZXhdIDwgbWluLTEgfHwgc3RhcnRbaW5kZXhdID4gbWF4KzEpIHsgLyogbmVlZCB0byBzd2l0Y2ggdGFyZ2V0IHdhbGwgKEwtbGlrZSkgKi9cblxuXHRcdHZhciBkaWZmID0gc3RhcnRbaW5kZXhdIC0gY2VudGVyMltpbmRleF07XG5cdFx0c3dpdGNoIChkaXJJbmRleDIpIHtcblx0XHRcdGNhc2UgMDpcblx0XHRcdGNhc2UgMTpcdHZhciByb3RhdGlvbiA9IChkaWZmIDwgMCA/IDMgOiAxKTsgYnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRjYXNlIDM6XHR2YXIgcm90YXRpb24gPSAoZGlmZiA8IDAgPyAxIDogMyk7IGJyZWFrO1xuXHRcdH1cblx0XHRkaXJJbmRleDIgPSAoZGlySW5kZXgyICsgcm90YXRpb24pICUgNDtcblx0XHRcblx0XHR2YXIgZW5kID0gdGhpcy5fcGxhY2VJbldhbGwocm9vbTIsIGRpckluZGV4Mik7XG5cdFx0aWYgKCFlbmQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0XHR2YXIgbWlkID0gWzAsIDBdO1xuXHRcdG1pZFtpbmRleF0gPSBzdGFydFtpbmRleF07XG5cdFx0dmFyIGluZGV4MiA9IChpbmRleCsxKSUyO1xuXHRcdG1pZFtpbmRleDJdID0gZW5kW2luZGV4Ml07XG5cdFx0dGhpcy5fZGlnTGluZShbc3RhcnQsIG1pZCwgZW5kXSk7XG5cdFx0XG5cdH0gZWxzZSB7IC8qIHVzZSBjdXJyZW50IHdhbGwgcGFpciwgYnV0IGFkanVzdCB0aGUgbGluZSBpbiB0aGUgbWlkZGxlIChTLWxpa2UpICovXG5cdFxuXHRcdHZhciBpbmRleDIgPSAoaW5kZXgrMSklMjtcblx0XHR2YXIgZW5kID0gdGhpcy5fcGxhY2VJbldhbGwocm9vbTIsIGRpckluZGV4Mik7XG5cdFx0aWYgKCFlbmQpIHsgcmV0dXJuOyB9XG5cdFx0dmFyIG1pZCA9IE1hdGgucm91bmQoKGVuZFtpbmRleDJdICsgc3RhcnRbaW5kZXgyXSkvMik7XG5cblx0XHR2YXIgbWlkMSA9IFswLCAwXTtcblx0XHR2YXIgbWlkMiA9IFswLCAwXTtcblx0XHRtaWQxW2luZGV4XSA9IHN0YXJ0W2luZGV4XTtcblx0XHRtaWQxW2luZGV4Ml0gPSBtaWQ7XG5cdFx0bWlkMltpbmRleF0gPSBlbmRbaW5kZXhdO1xuXHRcdG1pZDJbaW5kZXgyXSA9IG1pZDtcblx0XHR0aGlzLl9kaWdMaW5lKFtzdGFydCwgbWlkMSwgbWlkMiwgZW5kXSk7XG5cdH1cblxuXHRyb29tMS5hZGREb29yKHN0YXJ0WzBdLCBzdGFydFsxXSk7XG5cdHJvb20yLmFkZERvb3IoZW5kWzBdLCBlbmRbMV0pO1xuXHRcblx0dmFyIGluZGV4ID0gdGhpcy5fdW5jb25uZWN0ZWQuaW5kZXhPZihyb29tMSk7XG5cdGlmIChpbmRleCAhPSAtMSkge1xuXHRcdHRoaXMuX3VuY29ubmVjdGVkLnNwbGljZShpbmRleCwgMSk7XG5cdFx0dGhpcy5fY29ubmVjdGVkLnB1c2gocm9vbTEpO1xuXHR9XG5cblx0dmFyIGluZGV4ID0gdGhpcy5fdW5jb25uZWN0ZWQuaW5kZXhPZihyb29tMik7XG5cdGlmIChpbmRleCAhPSAtMSkge1xuXHRcdHRoaXMuX3VuY29ubmVjdGVkLnNwbGljZShpbmRleCwgMSk7XG5cdFx0dGhpcy5fY29ubmVjdGVkLnB1c2gocm9vbTIpO1xuXHR9XG5cdFxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fcGxhY2VJbldhbGwgPSBmdW5jdGlvbihyb29tLCBkaXJJbmRleCkge1xuXHR2YXIgc3RhcnQgPSBbMCwgMF07XG5cdHZhciBkaXIgPSBbMCwgMF07XG5cdHZhciBsZW5ndGggPSAwO1xuXHRcblx0c3dpdGNoIChkaXJJbmRleCkge1xuXHRcdGNhc2UgMDpcblx0XHRcdGRpciA9IFsxLCAwXTtcblx0XHRcdHN0YXJ0ID0gW3Jvb20uZ2V0TGVmdCgpLCByb29tLmdldFRvcCgpLTFdO1xuXHRcdFx0bGVuZ3RoID0gcm9vbS5nZXRSaWdodCgpLXJvb20uZ2V0TGVmdCgpKzE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0ZGlyID0gWzAsIDFdO1xuXHRcdFx0c3RhcnQgPSBbcm9vbS5nZXRSaWdodCgpKzEsIHJvb20uZ2V0VG9wKCldO1xuXHRcdFx0bGVuZ3RoID0gcm9vbS5nZXRCb3R0b20oKS1yb29tLmdldFRvcCgpKzE7XG5cdFx0YnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0ZGlyID0gWzEsIDBdO1xuXHRcdFx0c3RhcnQgPSBbcm9vbS5nZXRMZWZ0KCksIHJvb20uZ2V0Qm90dG9tKCkrMV07XG5cdFx0XHRsZW5ndGggPSByb29tLmdldFJpZ2h0KCktcm9vbS5nZXRMZWZ0KCkrMTtcblx0XHRicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHRkaXIgPSBbMCwgMV07XG5cdFx0XHRzdGFydCA9IFtyb29tLmdldExlZnQoKS0xLCByb29tLmdldFRvcCgpXTtcblx0XHRcdGxlbmd0aCA9IHJvb20uZ2V0Qm90dG9tKCktcm9vbS5nZXRUb3AoKSsxO1xuXHRcdGJyZWFrO1xuXHR9XG5cdFxuXHR2YXIgYXZhaWwgPSBbXTtcblx0dmFyIGxhc3RCYWRJbmRleCA9IC0yO1xuXG5cdGZvciAodmFyIGk9MDtpPGxlbmd0aDtpKyspIHtcblx0XHR2YXIgeCA9IHN0YXJ0WzBdICsgaSpkaXJbMF07XG5cdFx0dmFyIHkgPSBzdGFydFsxXSArIGkqZGlyWzFdO1xuXHRcdGF2YWlsLnB1c2gobnVsbCk7XG5cdFx0XG5cdFx0dmFyIGlzV2FsbCA9ICh0aGlzLl9tYXBbeF1beV0gPT0gMSk7XG5cdFx0aWYgKGlzV2FsbCkge1xuXHRcdFx0aWYgKGxhc3RCYWRJbmRleCAhPSBpLTEpIHsgYXZhaWxbaV0gPSBbeCwgeV07IH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bGFzdEJhZEluZGV4ID0gaTtcblx0XHRcdGlmIChpKSB7IGF2YWlsW2ktMV0gPSBudWxsOyB9XG5cdFx0fVxuXHR9XG5cdFxuXHRmb3IgKHZhciBpPWF2YWlsLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRpZiAoIWF2YWlsW2ldKSB7IGF2YWlsLnNwbGljZShpLCAxKTsgfVxuXHR9XG5cdHJldHVybiAoYXZhaWwubGVuZ3RoID8gYXZhaWwucmFuZG9tKCkgOiBudWxsKTtcbn1cblxuLyoqXG4gKiBEaWcgYSBwb2x5bGluZS5cbiAqL1xuUk9ULk1hcC5Vbmlmb3JtLnByb3RvdHlwZS5fZGlnTGluZSA9IGZ1bmN0aW9uKHBvaW50cykge1xuXHRmb3IgKHZhciBpPTE7aTxwb2ludHMubGVuZ3RoO2krKykge1xuXHRcdHZhciBzdGFydCA9IHBvaW50c1tpLTFdO1xuXHRcdHZhciBlbmQgPSBwb2ludHNbaV07XG5cdFx0dmFyIGNvcnJpZG9yID0gbmV3IFJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvcihzdGFydFswXSwgc3RhcnRbMV0sIGVuZFswXSwgZW5kWzFdKTtcblx0XHRjb3JyaWRvci5jcmVhdGUodGhpcy5fZGlnQ2FsbGJhY2spO1xuXHRcdHRoaXMuX2NvcnJpZG9ycy5wdXNoKGNvcnJpZG9yKTtcblx0fVxufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9kaWdDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHksIHZhbHVlKSB7XG5cdHRoaXMuX21hcFt4XVt5XSA9IHZhbHVlO1xuXHRpZiAodmFsdWUgPT0gMCkgeyB0aGlzLl9kdWcrKzsgfVxufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9pc1dhbGxDYWxsYmFjayA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0aWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy5fd2lkdGggfHwgeSA+PSB0aGlzLl9oZWlnaHQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHJldHVybiAodGhpcy5fbWFwW3hdW3ldID09IDEpO1xufVxuXG5ST1QuTWFwLlVuaWZvcm0ucHJvdG90eXBlLl9jYW5CZUR1Z0NhbGxiYWNrID0gZnVuY3Rpb24oeCwgeSkge1xuXHRpZiAoeCA8IDEgfHwgeSA8IDEgfHwgeCsxID49IHRoaXMuX3dpZHRoIHx8IHkrMSA+PSB0aGlzLl9oZWlnaHQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHJldHVybiAodGhpcy5fbWFwW3hdW3ldID09IDEpO1xufVxuXG4vKipcbiAqIEBhdXRob3IgaHlha3VnZWlcbiAqIEBjbGFzcyBEdW5nZW9uIGdlbmVyYXRvciB3aGljaCB1c2VzIHRoZSBcIm9yZ2luYWxcIiBSb2d1ZSBkdW5nZW9uIGdlbmVyYXRpb24gYWxnb3JpdGhtLiBTZWUgaHR0cDovL2t1b2kuY29tL35rYW1pa2F6ZS9HYW1lRGVzaWduL2FydDA3X3JvZ3VlX2R1bmdlb24ucGhwXG4gKiBAYXVnbWVudHMgUk9ULk1hcFxuICogQHBhcmFtIHtpbnR9IFt3aWR0aD1ST1QuREVGQVVMVF9XSURUSF1cbiAqIEBwYXJhbSB7aW50fSBbaGVpZ2h0PVJPVC5ERUZBVUxUX0hFSUdIVF1cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uc1xuICogQHBhcmFtIHtpbnRbXX0gW29wdGlvbnMuY2VsbFdpZHRoPTNdIE51bWJlciBvZiBjZWxscyB0byBjcmVhdGUgb24gdGhlIGhvcml6b250YWwgKG51bWJlciBvZiByb29tcyBob3Jpem9udGFsbHkpXG4gKiBAcGFyYW0ge2ludFtdfSBbb3B0aW9ucy5jZWxsSGVpZ2h0PTNdIE51bWJlciBvZiBjZWxscyB0byBjcmVhdGUgb24gdGhlIHZlcnRpY2FsIChudW1iZXIgb2Ygcm9vbXMgdmVydGljYWxseSkgXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMucm9vbVdpZHRoXSBSb29tIG1pbiBhbmQgbWF4IHdpZHRoIC0gbm9ybWFsbHkgc2V0IGF1dG8tbWFnaWNhbGx5IHZpYSB0aGUgY29uc3RydWN0b3IuXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMucm9vbUhlaWdodF0gUm9vbSBtaW4gYW5kIG1heCBoZWlnaHQgLSBub3JtYWxseSBzZXQgYXV0by1tYWdpY2FsbHkgdmlhIHRoZSBjb25zdHJ1Y3Rvci4gXG4gKi9cblJPVC5NYXAuUm9ndWUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cdFJPVC5NYXAuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcblx0XG5cdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0Y2VsbFdpZHRoOiAzLCAgLy8gTk9URSB0byBzZWxmLCB0aGVzZSBjb3VsZCBwcm9iYWJseSB3b3JrIHRoZSBzYW1lIGFzIHRoZSByb29tV2lkdGgvcm9vbSBIZWlnaHQgdmFsdWVzXG5cdFx0Y2VsbEhlaWdodDogMyAgLy8gICAgIGllLiBhcyBhbiBhcnJheSB3aXRoIG1pbi1tYXggdmFsdWVzIGZvciBlYWNoIGRpcmVjdGlvbi4uLi5cblx0fVxuXHRcblx0Zm9yICh2YXIgcCBpbiBvcHRpb25zKSB7IHRoaXMuX29wdGlvbnNbcF0gPSBvcHRpb25zW3BdOyB9XG5cdFxuXHQvKlxuXHRTZXQgdGhlIHJvb20gc2l6ZXMgYWNjb3JkaW5nIHRvIHRoZSBvdmVyLWFsbCB3aWR0aCBvZiB0aGUgbWFwLCBcblx0YW5kIHRoZSBjZWxsIHNpemVzLiBcblx0Ki9cblx0XG5cdGlmICghdGhpcy5fb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcInJvb21XaWR0aFwiKSkge1xuXHRcdHRoaXMuX29wdGlvbnNbXCJyb29tV2lkdGhcIl0gPSB0aGlzLl9jYWxjdWxhdGVSb29tU2l6ZSh3aWR0aCwgdGhpcy5fb3B0aW9uc1tcImNlbGxXaWR0aFwiXSk7XG5cdH1cblx0aWYgKCF0aGlzLl9vcHRpb25zLmhhc093blByb3BlcnR5W1wicm9vbUhlaWdodFwiXSkge1xuXHRcdHRoaXMuX29wdGlvbnNbXCJyb29tSGVpZ2h0XCJdID0gdGhpcy5fY2FsY3VsYXRlUm9vbVNpemUoaGVpZ2h0LCB0aGlzLl9vcHRpb25zW1wiY2VsbEhlaWdodFwiXSk7XG5cdH1cblx0XG59XG5cblJPVC5NYXAuUm9ndWUuZXh0ZW5kKFJPVC5NYXApOyBcblxuLyoqXG4gKiBAc2VlIFJPVC5NYXAjY3JlYXRlXG4gKi9cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHRoaXMubWFwID0gdGhpcy5fZmlsbE1hcCgxKTtcblx0dGhpcy5yb29tcyA9IFtdO1xuXHR0aGlzLmNvbm5lY3RlZENlbGxzID0gW107XG5cdFxuXHR0aGlzLl9pbml0Um9vbXMoKTtcblx0dGhpcy5fY29ubmVjdFJvb21zKCk7XG5cdHRoaXMuX2Nvbm5lY3RVbmNvbm5lY3RlZFJvb21zKCk7XG5cdHRoaXMuX2NyZWF0ZVJhbmRvbVJvb21Db25uZWN0aW9ucygpO1xuXHR0aGlzLl9jcmVhdGVSb29tcygpO1xuXHR0aGlzLl9jcmVhdGVDb3JyaWRvcnMoKTtcblx0XG5cdGlmIChjYWxsYmFjaykge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fd2lkdGg7IGkrKykge1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9oZWlnaHQ7IGorKykge1xuXHRcdFx0XHRjYWxsYmFjayhpLCBqLCB0aGlzLm1hcFtpXVtqXSk7ICAgXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2dldFJhbmRvbUludCA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdHJldHVybiBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbn1cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2NhbGN1bGF0ZVJvb21TaXplID0gZnVuY3Rpb24oc2l6ZSwgY2VsbCkge1xuXHR2YXIgbWF4ID0gTWF0aC5mbG9vcigoc2l6ZS9jZWxsKSAqIDAuOCk7XG5cdHZhciBtaW4gPSBNYXRoLmZsb29yKChzaXplL2NlbGwpICogMC4yNSk7XG5cdGlmIChtaW4gPCAyKSBtaW4gPSAyO1xuXHRpZiAobWF4IDwgMikgbWF4ID0gMjtcblx0cmV0dXJuIFttaW4sIG1heF07XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9pbml0Um9vbXMgPSBmdW5jdGlvbiAoKSB7IFxuXHQvLyBjcmVhdGUgcm9vbXMgYXJyYXkuIFRoaXMgaXMgdGhlIFwiZ3JpZFwiIGxpc3QgZnJvbSB0aGUgYWxnby4gIFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX29wdGlvbnMuY2VsbFdpZHRoOyBpKyspIHsgIFxuXHRcdHRoaXMucm9vbXMucHVzaChbXSk7XG5cdFx0Zm9yKHZhciBqID0gMDsgaiA8IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDsgaisrKSB7XG5cdFx0XHR0aGlzLnJvb21zW2ldLnB1c2goe1wieFwiOjAsIFwieVwiOjAsIFwid2lkdGhcIjowLCBcImhlaWdodFwiOjAsIFwiY29ubmVjdGlvbnNcIjpbXSwgXCJjZWxseFwiOmksIFwiY2VsbHlcIjpqfSk7XG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9jb25uZWN0Um9vbXMgPSBmdW5jdGlvbigpIHtcblx0Ly9waWNrIHJhbmRvbSBzdGFydGluZyBncmlkXG5cdHZhciBjZ3ggPSB0aGlzLl9nZXRSYW5kb21JbnQoMCwgdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGgtMSk7XG5cdHZhciBjZ3kgPSB0aGlzLl9nZXRSYW5kb21JbnQoMCwgdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0LTEpO1xuXHRcblx0dmFyIGlkeDtcblx0dmFyIG5jZ3g7XG5cdHZhciBuY2d5O1xuXHRcblx0dmFyIGZvdW5kID0gZmFsc2U7XG5cdHZhciByb29tO1xuXHR2YXIgb3RoZXJSb29tO1xuXHRcblx0Ly8gZmluZCAgdW5jb25uZWN0ZWQgbmVpZ2hib3VyIGNlbGxzXG5cdGRvIHtcblx0XG5cdFx0Ly92YXIgZGlyVG9DaGVjayA9IFswLDEsMiwzLDQsNSw2LDddO1xuXHRcdHZhciBkaXJUb0NoZWNrID0gWzAsMiw0LDZdO1xuXHRcdGRpclRvQ2hlY2sgPSBkaXJUb0NoZWNrLnJhbmRvbWl6ZSgpO1xuXHRcdFxuXHRcdGRvIHtcblx0XHRcdGZvdW5kID0gZmFsc2U7XG5cdFx0XHRpZHggPSBkaXJUb0NoZWNrLnBvcCgpO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdG5jZ3ggPSBjZ3ggKyBST1QuRElSU1s4XVtpZHhdWzBdO1xuXHRcdFx0bmNneSA9IGNneSArIFJPVC5ESVJTWzhdW2lkeF1bMV07XG5cdFx0XHRcblx0XHRcdGlmKG5jZ3ggPCAwIHx8IG5jZ3ggPj0gdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGgpIGNvbnRpbnVlO1xuXHRcdFx0aWYobmNneSA8IDAgfHwgbmNneSA+PSB0aGlzLl9vcHRpb25zLmNlbGxIZWlnaHQpIGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRyb29tID0gdGhpcy5yb29tc1tjZ3hdW2NneV07XG5cdFx0XHRcblx0XHRcdGlmKHJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGggPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBhcyBsb25nIGFzIHRoaXMgcm9vbSBkb2Vzbid0IGFscmVhZHkgY29vbmVjdCB0byBtZSwgd2UgYXJlIG9rIHdpdGggaXQuIFxuXHRcdFx0XHRpZihyb29tW1wiY29ubmVjdGlvbnNcIl1bMF1bMF0gPT0gbmNneCAmJlxuXHRcdFx0XHRyb29tW1wiY29ubmVjdGlvbnNcIl1bMF1bMV0gPT0gbmNneSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdG90aGVyUm9vbSA9IHRoaXMucm9vbXNbbmNneF1bbmNneV07XG5cdFx0XHRcblx0XHRcdGlmIChvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGggPT0gMCkgeyBcblx0XHRcdFx0b3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl0ucHVzaChbY2d4LGNneV0pO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5jb25uZWN0ZWRDZWxscy5wdXNoKFtuY2d4LCBuY2d5XSk7XG5cdFx0XHRcdGNneCA9IG5jZ3g7XG5cdFx0XHRcdGNneSA9IG5jZ3k7XG5cdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHR9IHdoaWxlIChkaXJUb0NoZWNrLmxlbmd0aCA+IDAgJiYgZm91bmQgPT0gZmFsc2UpXG5cdFx0XG5cdH0gd2hpbGUgKGRpclRvQ2hlY2subGVuZ3RoID4gMClcblxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY29ubmVjdFVuY29ubmVjdGVkUm9vbXMgPSBmdW5jdGlvbigpIHtcblx0Ly9XaGlsZSB0aGVyZSBhcmUgdW5jb25uZWN0ZWQgcm9vbXMsIHRyeSB0byBjb25uZWN0IHRoZW0gdG8gYSByYW5kb20gY29ubmVjdGVkIG5laWdoYm9yIFxuXHQvLyhpZiBhIHJvb20gaGFzIG5vIGNvbm5lY3RlZCBuZWlnaGJvcnMgeWV0LCBqdXN0IGtlZXAgY3ljbGluZywgeW91J2xsIGZpbGwgb3V0IHRvIGl0IGV2ZW50dWFsbHkpLlxuXHR2YXIgY3cgPSB0aGlzLl9vcHRpb25zLmNlbGxXaWR0aDtcblx0dmFyIGNoID0gdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0O1xuXHRcblx0dmFyIHJhbmRvbUNvbm5lY3RlZENlbGw7XG5cdHRoaXMuY29ubmVjdGVkQ2VsbHMgPSB0aGlzLmNvbm5lY3RlZENlbGxzLnJhbmRvbWl6ZSgpO1xuXHR2YXIgcm9vbTtcblx0dmFyIG90aGVyUm9vbTtcblx0dmFyIHZhbGlkUm9vbTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7IGkrKykge1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5fb3B0aW9ucy5jZWxsSGVpZ2h0OyBqKyspICB7XG5cdFx0XHRcdFxuXHRcdFx0cm9vbSA9IHRoaXMucm9vbXNbaV1bal07XG5cdFx0XHRcblx0XHRcdGlmIChyb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoID09IDApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbnMgPSBbMCwyLDQsNl07XG5cdFx0XHRcdGRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zLnJhbmRvbWl6ZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIHZhbGlkUm9vbSA9IGZhbHNlO1xuXHRcdFx0XHRcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhciBkaXJJZHggPSBkaXJlY3Rpb25zLnBvcCgpO1xuXHRcdFx0XHRcdHZhciBuZXdJID0gaSArIFJPVC5ESVJTWzhdW2RpcklkeF1bMF07XG5cdFx0XHRcdFx0dmFyIG5ld0ogPSBqICsgUk9ULkRJUlNbOF1bZGlySWR4XVsxXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAobmV3SSA8IDAgfHwgbmV3SSA+PSBjdyB8fCBcblx0XHRcdFx0XHRuZXdKIDwgMCB8fCBuZXdKID49IGNoKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tuZXdJXVtuZXdKXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR2YWxpZFJvb20gPSB0cnVlO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIChvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXS5sZW5ndGggPT0gMCkge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgb3RoZXJSb29tW1wiY29ubmVjdGlvbnNcIl0ubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcdGlmKG90aGVyUm9vbVtcImNvbm5lY3Rpb25zXCJdW2tdWzBdID09IGkgJiYgXG5cdFx0XHRcdFx0XHRvdGhlclJvb21bXCJjb25uZWN0aW9uc1wiXVtrXVsxXSA9PSBqKSB7XG5cdFx0XHRcdFx0XHRcdHZhbGlkUm9vbSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHZhbGlkUm9vbSkgYnJlYWs7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0gd2hpbGUgKGRpcmVjdGlvbnMubGVuZ3RoKVxuXHRcdFx0XHRcblx0XHRcdFx0aWYodmFsaWRSb29tKSB7IFxuXHRcdFx0XHRcdHJvb21bXCJjb25uZWN0aW9uc1wiXS5wdXNoKCBbb3RoZXJSb29tW1wiY2VsbHhcIl0sIG90aGVyUm9vbVtcImNlbGx5XCJdXSApOyAgXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCItLSBVbmFibGUgdG8gY29ubmVjdCByb29tLlwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY3JlYXRlUmFuZG9tUm9vbUNvbm5lY3Rpb25zID0gZnVuY3Rpb24oY29ubmVjdGlvbnMpIHtcblx0Ly8gRW1wdHkgZm9yIG5vdy4gXG59XG5cblxuUk9ULk1hcC5Sb2d1ZS5wcm90b3R5cGUuX2NyZWF0ZVJvb21zID0gZnVuY3Rpb24oKSB7XG5cdC8vIENyZWF0ZSBSb29tcyBcblx0XG5cdHZhciB3ID0gdGhpcy5fd2lkdGg7XG5cdHZhciBoID0gdGhpcy5faGVpZ2h0O1xuXHRcblx0dmFyIGN3ID0gdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7XG5cdHZhciBjaCA9IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDtcblx0XG5cdHZhciBjd3AgPSBNYXRoLmZsb29yKHRoaXMuX3dpZHRoIC8gY3cpO1xuXHR2YXIgY2hwID0gTWF0aC5mbG9vcih0aGlzLl9oZWlnaHQgLyBjaCk7XG5cdFxuXHR2YXIgcm9vbXc7XG5cdHZhciByb29taDtcblx0dmFyIHJvb21XaWR0aCA9IHRoaXMuX29wdGlvbnNbXCJyb29tV2lkdGhcIl07XG5cdHZhciByb29tSGVpZ2h0ID0gdGhpcy5fb3B0aW9uc1tcInJvb21IZWlnaHRcIl07XG5cdHZhciBzeDtcblx0dmFyIHN5O1xuXHR2YXIgdHg7XG5cdHZhciB0eTtcblx0dmFyIG90aGVyUm9vbTtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY3c7IGkrKykge1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2g7IGorKykge1xuXHRcdFx0c3ggPSBjd3AgKiBpO1xuXHRcdFx0c3kgPSBjaHAgKiBqO1xuXHRcdFx0XG5cdFx0XHRpZiAoc3ggPT0gMCkgc3ggPSAxO1xuXHRcdFx0aWYgKHN5ID09IDApIHN5ID0gMTtcblx0XHRcdFxuXHRcdFx0cm9vbXcgPSB0aGlzLl9nZXRSYW5kb21JbnQocm9vbVdpZHRoWzBdLCByb29tV2lkdGhbMV0pO1xuXHRcdFx0cm9vbWggPSB0aGlzLl9nZXRSYW5kb21JbnQocm9vbUhlaWdodFswXSwgcm9vbUhlaWdodFsxXSk7XG5cdFx0XHRcblx0XHRcdGlmIChqID4gMCkge1xuXHRcdFx0XHRvdGhlclJvb20gPSB0aGlzLnJvb21zW2ldW2otMV07XG5cdFx0XHRcdHdoaWxlIChzeSAtIChvdGhlclJvb21bXCJ5XCJdICsgb3RoZXJSb29tW1wiaGVpZ2h0XCJdICkgPCAzKSB7XG5cdFx0XHRcdFx0c3krKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoaSA+IDApIHtcblx0XHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tpLTFdW2pdO1xuXHRcdFx0XHR3aGlsZShzeCAtIChvdGhlclJvb21bXCJ4XCJdICsgb3RoZXJSb29tW1wid2lkdGhcIl0pIDwgMykge1xuXHRcdFx0XHRcdHN4Kys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0dmFyIHN4T2Zmc2V0ID0gTWF0aC5yb3VuZCh0aGlzLl9nZXRSYW5kb21JbnQoMCwgY3dwLXJvb213KS8yKTtcblx0XHRcdHZhciBzeU9mZnNldCA9IE1hdGgucm91bmQodGhpcy5fZ2V0UmFuZG9tSW50KDAsIGNocC1yb29taCkvMik7XG5cdFx0XHRcblx0XHRcdHdoaWxlIChzeCArIHN4T2Zmc2V0ICsgcm9vbXcgPj0gdykge1xuXHRcdFx0XHRpZihzeE9mZnNldCkge1xuXHRcdFx0XHRcdHN4T2Zmc2V0LS07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cm9vbXctLTsgXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0d2hpbGUgKHN5ICsgc3lPZmZzZXQgKyByb29taCA+PSBoKSB7IFxuXHRcdFx0XHRpZihzeU9mZnNldCkge1xuXHRcdFx0XHRcdHN5T2Zmc2V0LS07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cm9vbWgtLTsgXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0c3ggPSBzeCArIHN4T2Zmc2V0O1xuXHRcdFx0c3kgPSBzeSArIHN5T2Zmc2V0O1xuXHRcdFx0XG5cdFx0XHR0aGlzLnJvb21zW2ldW2pdW1wieFwiXSA9IHN4O1xuXHRcdFx0dGhpcy5yb29tc1tpXVtqXVtcInlcIl0gPSBzeTtcblx0XHRcdHRoaXMucm9vbXNbaV1bal1bXCJ3aWR0aFwiXSA9IHJvb213O1xuXHRcdFx0dGhpcy5yb29tc1tpXVtqXVtcImhlaWdodFwiXSA9IHJvb21oOyAgXG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGlpID0gc3g7IGlpIDwgc3ggKyByb29tdzsgaWkrKykge1xuXHRcdFx0XHRmb3IgKHZhciBqaiA9IHN5OyBqaiA8IHN5ICsgcm9vbWg7IGpqKyspIHtcblx0XHRcdFx0XHR0aGlzLm1hcFtpaV1bampdID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fSAgXG5cdFx0fVxuXHR9XG59XG5cblJPVC5NYXAuUm9ndWUucHJvdG90eXBlLl9nZXRXYWxsUG9zaXRpb24gPSBmdW5jdGlvbihhUm9vbSwgYURpcmVjdGlvbikge1xuXHR2YXIgcng7XG5cdHZhciByeTtcblx0dmFyIGRvb3I7XG5cdFxuXHRpZiAoYURpcmVjdGlvbiA9PSAxIHx8IGFEaXJlY3Rpb24gPT0gMykge1xuXHRcdHJ4ID0gdGhpcy5fZ2V0UmFuZG9tSW50KGFSb29tW1wieFwiXSArIDEsIGFSb29tW1wieFwiXSArIGFSb29tW1wid2lkdGhcIl0gLSAyKTtcblx0XHRpZiAoYURpcmVjdGlvbiA9PSAxKSB7XG5cdFx0XHRyeSA9IGFSb29tW1wieVwiXSAtIDI7XG5cdFx0XHRkb29yID0gcnkgKyAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyeSA9IGFSb29tW1wieVwiXSArIGFSb29tW1wiaGVpZ2h0XCJdICsgMTtcblx0XHRcdGRvb3IgPSByeSAtMTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5tYXBbcnhdW2Rvb3JdID0gMDsgLy8gaSdtIG5vdCBzZXR0aW5nIGEgc3BlY2lmaWMgJ2Rvb3InIHRpbGUgdmFsdWUgcmlnaHQgbm93LCBqdXN0IGVtcHR5IHNwYWNlLiBcblx0XHRcblx0fSBlbHNlIGlmIChhRGlyZWN0aW9uID09IDIgfHwgYURpcmVjdGlvbiA9PSA0KSB7XG5cdFx0cnkgPSB0aGlzLl9nZXRSYW5kb21JbnQoYVJvb21bXCJ5XCJdICsgMSwgYVJvb21bXCJ5XCJdICsgYVJvb21bXCJoZWlnaHRcIl0gLSAyKTtcblx0XHRpZihhRGlyZWN0aW9uID09IDIpIHtcblx0XHRcdHJ4ID0gYVJvb21bXCJ4XCJdICsgYVJvb21bXCJ3aWR0aFwiXSArIDE7XG5cdFx0XHRkb29yID0gcnggLSAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyeCA9IGFSb29tW1wieFwiXSAtIDI7XG5cdFx0XHRkb29yID0gcnggKyAxO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLm1hcFtkb29yXVtyeV0gPSAwOyAvLyBpJ20gbm90IHNldHRpbmcgYSBzcGVjaWZpYyAnZG9vcicgdGlsZSB2YWx1ZSByaWdodCBub3csIGp1c3QgZW1wdHkgc3BhY2UuIFxuXHRcdFxuXHR9XG5cdHJldHVybiBbcngsIHJ5XTtcbn1cblxuLyoqKlxuKiBAcGFyYW0gc3RhcnRQb3NpdGlvbiBhIDIgZWxlbWVudCBhcnJheVxuKiBAcGFyYW0gZW5kUG9zaXRpb24gYSAyIGVsZW1lbnQgYXJyYXlcbiovXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fZHJhd0NvcnJpZG9yZSA9IGZ1bmN0aW9uIChzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbikge1xuXHR2YXIgeE9mZnNldCA9IGVuZFBvc2l0aW9uWzBdIC0gc3RhcnRQb3NpdGlvblswXTtcblx0dmFyIHlPZmZzZXQgPSBlbmRQb3NpdGlvblsxXSAtIHN0YXJ0UG9zaXRpb25bMV07XG5cdFxuXHR2YXIgeHBvcyA9IHN0YXJ0UG9zaXRpb25bMF07XG5cdHZhciB5cG9zID0gc3RhcnRQb3NpdGlvblsxXTtcblx0XG5cdHZhciB0ZW1wRGlzdDtcblx0dmFyIHhEaXI7XG5cdHZhciB5RGlyO1xuXHRcblx0dmFyIG1vdmU7IC8vIDIgZWxlbWVudCBhcnJheSwgZWxlbWVudCAwIGlzIHRoZSBkaXJlY3Rpb24sIGVsZW1lbnQgMSBpcyB0aGUgdG90YWwgdmFsdWUgdG8gbW92ZS4gXG5cdHZhciBtb3ZlcyA9IFtdOyAvLyBhIGxpc3Qgb2YgMiBlbGVtZW50IGFycmF5c1xuXHRcblx0dmFyIHhBYnMgPSBNYXRoLmFicyh4T2Zmc2V0KTtcblx0dmFyIHlBYnMgPSBNYXRoLmFicyh5T2Zmc2V0KTtcblx0XG5cdHZhciBwZXJjZW50ID0gUk9ULlJORy5nZXRVbmlmb3JtKCk7IC8vIHVzZWQgdG8gc3BsaXQgdGhlIG1vdmUgYXQgZGlmZmVyZW50IHBsYWNlcyBhbG9uZyB0aGUgbG9uZyBheGlzXG5cdHZhciBmaXJzdEhhbGYgPSBwZXJjZW50O1xuXHR2YXIgc2Vjb25kSGFsZiA9IDEgLSBwZXJjZW50O1xuXHRcblx0eERpciA9IHhPZmZzZXQgPiAwID8gMiA6IDY7XG5cdHlEaXIgPSB5T2Zmc2V0ID4gMCA/IDQgOiAwO1xuXHRcblx0aWYgKHhBYnMgPCB5QWJzKSB7XG5cdFx0Ly8gbW92ZSBmaXJzdEhhbGYgb2YgdGhlIHkgb2Zmc2V0XG5cdFx0dGVtcERpc3QgPSBNYXRoLmNlaWwoeUFicyAqIGZpcnN0SGFsZik7XG5cdFx0bW92ZXMucHVzaChbeURpciwgdGVtcERpc3RdKTtcblx0XHQvLyBtb3ZlIGFsbCB0aGUgeCBvZmZzZXRcblx0XHRtb3Zlcy5wdXNoKFt4RGlyLCB4QWJzXSk7XG5cdFx0Ly8gbW92ZSBzZW5kSGFsZiBvZiB0aGUgIHkgb2Zmc2V0XG5cdFx0dGVtcERpc3QgPSBNYXRoLmZsb29yKHlBYnMgKiBzZWNvbmRIYWxmKTtcblx0XHRtb3Zlcy5wdXNoKFt5RGlyLCB0ZW1wRGlzdF0pO1xuXHR9IGVsc2Uge1xuXHRcdC8vICBtb3ZlIGZpcnN0SGFsZiBvZiB0aGUgeCBvZmZzZXRcblx0XHR0ZW1wRGlzdCA9IE1hdGguY2VpbCh4QWJzICogZmlyc3RIYWxmKTtcblx0XHRtb3Zlcy5wdXNoKFt4RGlyLCB0ZW1wRGlzdF0pO1xuXHRcdC8vIG1vdmUgYWxsIHRoZSB5IG9mZnNldFxuXHRcdG1vdmVzLnB1c2goW3lEaXIsIHlBYnNdKTtcblx0XHQvLyBtb3ZlIHNlY29uZEhhbGYgb2YgdGhlIHggb2Zmc2V0LlxuXHRcdHRlbXBEaXN0ID0gTWF0aC5mbG9vcih4QWJzICogc2Vjb25kSGFsZik7XG5cdFx0bW92ZXMucHVzaChbeERpciwgdGVtcERpc3RdKTsgIFxuXHR9XG5cdFxuXHR0aGlzLm1hcFt4cG9zXVt5cG9zXSA9IDA7XG5cdFxuXHR3aGlsZSAobW92ZXMubGVuZ3RoID4gMCkge1xuXHRcdG1vdmUgPSBtb3Zlcy5wb3AoKTtcblx0XHR3aGlsZSAobW92ZVsxXSA+IDApIHtcblx0XHRcdHhwb3MgKz0gUk9ULkRJUlNbOF1bbW92ZVswXV1bMF07XG5cdFx0XHR5cG9zICs9IFJPVC5ESVJTWzhdW21vdmVbMF1dWzFdO1xuXHRcdFx0dGhpcy5tYXBbeHBvc11beXBvc10gPSAwO1xuXHRcdFx0bW92ZVsxXSA9IG1vdmVbMV0gLSAxO1xuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLlJvZ3VlLnByb3RvdHlwZS5fY3JlYXRlQ29ycmlkb3JzID0gZnVuY3Rpb24gKCkge1xuXHQvLyBEcmF3IENvcnJpZG9ycyBiZXR3ZWVuIGNvbm5lY3RlZCByb29tc1xuXHRcblx0dmFyIGN3ID0gdGhpcy5fb3B0aW9ucy5jZWxsV2lkdGg7XG5cdHZhciBjaCA9IHRoaXMuX29wdGlvbnMuY2VsbEhlaWdodDtcblx0dmFyIHJvb207XG5cdHZhciBjb25uZWN0aW9uO1xuXHR2YXIgb3RoZXJSb29tO1xuXHR2YXIgd2FsbDtcblx0dmFyIG90aGVyV2FsbDtcblx0XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY3c7IGkrKykge1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2g7IGorKykge1xuXHRcdFx0cm9vbSA9IHRoaXMucm9vbXNbaV1bal07XG5cdFx0XHRcblx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgcm9vbVtcImNvbm5lY3Rpb25zXCJdLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdGNvbm5lY3Rpb24gPSByb29tW1wiY29ubmVjdGlvbnNcIl1ba107IFxuXHRcdFx0XHRcblx0XHRcdFx0b3RoZXJSb29tID0gdGhpcy5yb29tc1tjb25uZWN0aW9uWzBdXVtjb25uZWN0aW9uWzFdXTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIGZpZ3VyZSBvdXQgd2hhdCB3YWxsIG91ciBjb3JyaWRvciB3aWxsIHN0YXJ0IG9uZS5cblx0XHRcdFx0Ly8gZmlndXJlIG91dCB3aGF0IHdhbGwgb3VyIGNvcnJpZG9yIHdpbGwgZW5kIG9uLiBcblx0XHRcdFx0aWYgKG90aGVyUm9vbVtcImNlbGx4XCJdID4gcm9vbVtcImNlbGx4XCJdICkge1xuXHRcdFx0XHRcdHdhbGwgPSAyO1xuXHRcdFx0XHRcdG90aGVyV2FsbCA9IDQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAob3RoZXJSb29tW1wiY2VsbHhcIl0gPCByb29tW1wiY2VsbHhcIl0gKSB7XG5cdFx0XHRcdFx0d2FsbCA9IDQ7XG5cdFx0XHRcdFx0b3RoZXJXYWxsID0gMjtcblx0XHRcdFx0fSBlbHNlIGlmKG90aGVyUm9vbVtcImNlbGx5XCJdID4gcm9vbVtcImNlbGx5XCJdKSB7XG5cdFx0XHRcdFx0d2FsbCA9IDM7XG5cdFx0XHRcdFx0b3RoZXJXYWxsID0gMTtcblx0XHRcdFx0fSBlbHNlIGlmKG90aGVyUm9vbVtcImNlbGx5XCJdIDwgcm9vbVtcImNlbGx5XCJdKSB7XG5cdFx0XHRcdFx0d2FsbCA9IDE7XG5cdFx0XHRcdFx0b3RoZXJXYWxsID0gMztcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5fZHJhd0NvcnJpZG9yZSh0aGlzLl9nZXRXYWxsUG9zaXRpb24ocm9vbSwgd2FsbCksIHRoaXMuX2dldFdhbGxQb3NpdGlvbihvdGhlclJvb20sIG90aGVyV2FsbCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuLyoqXG4gKiBAY2xhc3MgRHVuZ2VvbiBmZWF0dXJlOyBoYXMgb3duIC5jcmVhdGUoKSBtZXRob2RcbiAqL1xuUk9ULk1hcC5GZWF0dXJlID0gZnVuY3Rpb24oKSB7fVxuUk9ULk1hcC5GZWF0dXJlLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24oY2FuQmVEdWdDYWxsYmFjaykge31cblJPVC5NYXAuRmVhdHVyZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oZGlnQ2FsbGJhY2spIHt9XG5ST1QuTWFwLkZlYXR1cmUucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24oKSB7fVxuUk9ULk1hcC5GZWF0dXJlLmNyZWF0ZVJhbmRvbUF0ID0gZnVuY3Rpb24oeCwgeSwgZHgsIGR5LCBvcHRpb25zKSB7fVxuXG4vKipcbiAqIEBjbGFzcyBSb29tXG4gKiBAYXVnbWVudHMgUk9ULk1hcC5GZWF0dXJlXG4gKiBAcGFyYW0ge2ludH0geDFcbiAqIEBwYXJhbSB7aW50fSB5MVxuICogQHBhcmFtIHtpbnR9IHgyXG4gKiBAcGFyYW0ge2ludH0geTJcbiAqIEBwYXJhbSB7aW50fSBbZG9vclhdXG4gKiBAcGFyYW0ge2ludH0gW2Rvb3JZXVxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbSA9IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyLCBkb29yWCwgZG9vclkpIHtcblx0dGhpcy5feDEgPSB4MTtcblx0dGhpcy5feTEgPSB5MTtcblx0dGhpcy5feDIgPSB4Mjtcblx0dGhpcy5feTIgPSB5Mjtcblx0dGhpcy5fZG9vcnMgPSB7fTtcblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiA0KSB7IHRoaXMuYWRkRG9vcihkb29yWCwgZG9vclkpOyB9XG59XG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5leHRlbmQoUk9ULk1hcC5GZWF0dXJlKTtcblxuLyoqXG4gKiBSb29tIG9mIHJhbmRvbSBzaXplLCB3aXRoIGEgZ2l2ZW4gZG9vcnMgYW5kIGRpcmVjdGlvblxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5jcmVhdGVSYW5kb21BdCA9IGZ1bmN0aW9uKHgsIHksIGR4LCBkeSwgb3B0aW9ucykge1xuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tV2lkdGhbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21XaWR0aFsxXTtcblx0dmFyIHdpZHRoID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tSGVpZ2h0WzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tSGVpZ2h0WzFdO1xuXHR2YXIgaGVpZ2h0ID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHRpZiAoZHggPT0gMSkgeyAvKiB0byB0aGUgcmlnaHQgKi9cblx0XHR2YXIgeTIgPSB5IC0gTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSAqIGhlaWdodCk7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKHgrMSwgeTIsIHgrd2lkdGgsIHkyK2hlaWdodC0xLCB4LCB5KTtcblx0fVxuXHRcblx0aWYgKGR4ID09IC0xKSB7IC8qIHRvIHRoZSBsZWZ0ICovXG5cdFx0dmFyIHkyID0geSAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiBoZWlnaHQpO1xuXHRcdHJldHVybiBuZXcgdGhpcyh4LXdpZHRoLCB5MiwgeC0xLCB5MitoZWlnaHQtMSwgeCwgeSk7XG5cdH1cblxuXHRpZiAoZHkgPT0gMSkgeyAvKiB0byB0aGUgYm90dG9tICovXG5cdFx0dmFyIHgyID0geCAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiB3aWR0aCk7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKHgyLCB5KzEsIHgyK3dpZHRoLTEsIHkraGVpZ2h0LCB4LCB5KTtcblx0fVxuXG5cdGlmIChkeSA9PSAtMSkgeyAvKiB0byB0aGUgdG9wICovXG5cdFx0dmFyIHgyID0geCAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkgKiB3aWR0aCk7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKHgyLCB5LWhlaWdodCwgeDIrd2lkdGgtMSwgeS0xLCB4LCB5KTtcblx0fVxufVxuXG4vKipcbiAqIFJvb20gb2YgcmFuZG9tIHNpemUsIHBvc2l0aW9uZWQgYXJvdW5kIGNlbnRlciBjb29yZHNcbiAqL1xuUk9ULk1hcC5GZWF0dXJlLlJvb20uY3JlYXRlUmFuZG9tQ2VudGVyID0gZnVuY3Rpb24oY3gsIGN5LCBvcHRpb25zKSB7XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21XaWR0aFswXTtcblx0dmFyIG1heCA9IG9wdGlvbnMucm9vbVdpZHRoWzFdO1xuXHR2YXIgd2lkdGggPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblx0XG5cdHZhciBtaW4gPSBvcHRpb25zLnJvb21IZWlnaHRbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21IZWlnaHRbMV07XG5cdHZhciBoZWlnaHQgPSBtaW4gKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKihtYXgtbWluKzEpKTtcblxuXHR2YXIgeDEgPSBjeCAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqd2lkdGgpO1xuXHR2YXIgeTEgPSBjeSAtIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqaGVpZ2h0KTtcblx0dmFyIHgyID0geDEgKyB3aWR0aCAtIDE7XG5cdHZhciB5MiA9IHkxICsgaGVpZ2h0IC0gMTtcblxuXHRyZXR1cm4gbmV3IHRoaXMoeDEsIHkxLCB4MiwgeTIpO1xufVxuXG4vKipcbiAqIFJvb20gb2YgcmFuZG9tIHNpemUgd2l0aGluIGEgZ2l2ZW4gZGltZW5zaW9uc1xuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5jcmVhdGVSYW5kb20gPSBmdW5jdGlvbihhdmFpbFdpZHRoLCBhdmFpbEhlaWdodCwgb3B0aW9ucykge1xuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tV2lkdGhbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLnJvb21XaWR0aFsxXTtcblx0dmFyIHdpZHRoID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHR2YXIgbWluID0gb3B0aW9ucy5yb29tSGVpZ2h0WzBdO1xuXHR2YXIgbWF4ID0gb3B0aW9ucy5yb29tSGVpZ2h0WzFdO1xuXHR2YXIgaGVpZ2h0ID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHR2YXIgbGVmdCA9IGF2YWlsV2lkdGggLSB3aWR0aCAtIDE7XG5cdHZhciB0b3AgPSBhdmFpbEhlaWdodCAtIGhlaWdodCAtIDE7XG5cblx0dmFyIHgxID0gMSArIE1hdGguZmxvb3IoUk9ULlJORy5nZXRVbmlmb3JtKCkqbGVmdCk7XG5cdHZhciB5MSA9IDEgKyBNYXRoLmZsb29yKFJPVC5STkcuZ2V0VW5pZm9ybSgpKnRvcCk7XG5cdHZhciB4MiA9IHgxICsgd2lkdGggLSAxO1xuXHR2YXIgeTIgPSB5MSArIGhlaWdodCAtIDE7XG5cblx0cmV0dXJuIG5ldyB0aGlzKHgxLCB5MSwgeDIsIHkyKTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmFkZERvb3IgPSBmdW5jdGlvbih4LCB5KSB7XG5cdHRoaXMuX2Rvb3JzW3grXCIsXCIreV0gPSAxO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufVxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0RG9vcnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5fZG9vcnMpIHtcblx0XHR2YXIgcGFydHMgPSBrZXkuc3BsaXQoXCIsXCIpO1xuXHRcdGNhbGxiYWNrKHBhcnNlSW50KHBhcnRzWzBdKSwgcGFyc2VJbnQocGFydHNbMV0pKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmNsZWFyRG9vcnMgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fZG9vcnMgPSB7fTtcblx0cmV0dXJuIHRoaXM7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Sb29tLnByb3RvdHlwZS5hZGREb29ycyA9IGZ1bmN0aW9uKGlzV2FsbENhbGxiYWNrKSB7XG5cdHZhciBsZWZ0ID0gdGhpcy5feDEtMTtcblx0dmFyIHJpZ2h0ID0gdGhpcy5feDIrMTtcblx0dmFyIHRvcCA9IHRoaXMuX3kxLTE7XG5cdHZhciBib3R0b20gPSB0aGlzLl95MisxO1xuXG5cdGZvciAodmFyIHg9bGVmdDsgeDw9cmlnaHQ7IHgrKykge1xuXHRcdGZvciAodmFyIHk9dG9wOyB5PD1ib3R0b207IHkrKykge1xuXHRcdFx0aWYgKHggIT0gbGVmdCAmJiB4ICE9IHJpZ2h0ICYmIHkgIT0gdG9wICYmIHkgIT0gYm90dG9tKSB7IGNvbnRpbnVlOyB9XG5cdFx0XHRpZiAoaXNXYWxsQ2FsbGJhY2soeCwgeSkpIHsgY29udGludWU7IH1cblxuXHRcdFx0dGhpcy5hZGREb29yKHgsIHkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coXCJyb29tXCIsIHRoaXMuX3gxLCB0aGlzLl95MSwgdGhpcy5feDIsIHRoaXMuX3kyKTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbihpc1dhbGxDYWxsYmFjaywgY2FuQmVEdWdDYWxsYmFjaykgeyBcblx0dmFyIGxlZnQgPSB0aGlzLl94MS0xO1xuXHR2YXIgcmlnaHQgPSB0aGlzLl94MisxO1xuXHR2YXIgdG9wID0gdGhpcy5feTEtMTtcblx0dmFyIGJvdHRvbSA9IHRoaXMuX3kyKzE7XG5cdFxuXHRmb3IgKHZhciB4PWxlZnQ7IHg8PXJpZ2h0OyB4KyspIHtcblx0XHRmb3IgKHZhciB5PXRvcDsgeTw9Ym90dG9tOyB5KyspIHtcblx0XHRcdGlmICh4ID09IGxlZnQgfHwgeCA9PSByaWdodCB8fCB5ID09IHRvcCB8fCB5ID09IGJvdHRvbSkge1xuXHRcdFx0XHRpZiAoIWlzV2FsbENhbGxiYWNrKHgsIHkpKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCFjYW5CZUR1Z0NhbGxiYWNrKHgsIHkpKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGRpZ0NhbGxiYWNrIERpZyBjYWxsYmFjayB3aXRoIGEgc2lnbmF0dXJlICh4LCB5LCB2YWx1ZSkuIFZhbHVlczogMCA9IGVtcHR5LCAxID0gd2FsbCwgMiA9IGRvb3IuIE11bHRpcGxlIGRvb3JzIGFyZSBhbGxvd2VkLlxuICovXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oZGlnQ2FsbGJhY2spIHsgXG5cdHZhciBsZWZ0ID0gdGhpcy5feDEtMTtcblx0dmFyIHJpZ2h0ID0gdGhpcy5feDIrMTtcblx0dmFyIHRvcCA9IHRoaXMuX3kxLTE7XG5cdHZhciBib3R0b20gPSB0aGlzLl95MisxO1xuXHRcblx0dmFyIHZhbHVlID0gMDtcblx0Zm9yICh2YXIgeD1sZWZ0OyB4PD1yaWdodDsgeCsrKSB7XG5cdFx0Zm9yICh2YXIgeT10b3A7IHk8PWJvdHRvbTsgeSsrKSB7XG5cdFx0XHRpZiAoeCtcIixcIit5IGluIHRoaXMuX2Rvb3JzKSB7XG5cdFx0XHRcdHZhbHVlID0gMjtcblx0XHRcdH0gZWxzZSBpZiAoeCA9PSBsZWZ0IHx8IHggPT0gcmlnaHQgfHwgeSA9PSB0b3AgfHwgeSA9PSBib3R0b20pIHtcblx0XHRcdFx0dmFsdWUgPSAxO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWUgPSAwO1xuXHRcdFx0fVxuXHRcdFx0ZGlnQ2FsbGJhY2soeCwgeSwgdmFsdWUpO1xuXHRcdH1cblx0fVxufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBbTWF0aC5yb3VuZCgodGhpcy5feDEgKyB0aGlzLl94MikvMiksIE1hdGgucm91bmQoKHRoaXMuX3kxICsgdGhpcy5feTIpLzIpXTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldExlZnQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3gxO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0UmlnaHQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3gyO1xufVxuXG5ST1QuTWFwLkZlYXR1cmUuUm9vbS5wcm90b3R5cGUuZ2V0VG9wID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzLl95MTtcbn1cblxuUk9ULk1hcC5GZWF0dXJlLlJvb20ucHJvdG90eXBlLmdldEJvdHRvbSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5feTI7XG59XG5cbi8qKlxuICogQGNsYXNzIENvcnJpZG9yXG4gKiBAYXVnbWVudHMgUk9ULk1hcC5GZWF0dXJlXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRYXG4gKiBAcGFyYW0ge2ludH0gc3RhcnRZXG4gKiBAcGFyYW0ge2ludH0gZW5kWFxuICogQHBhcmFtIHtpbnR9IGVuZFlcbiAqL1xuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yID0gZnVuY3Rpb24oc3RhcnRYLCBzdGFydFksIGVuZFgsIGVuZFkpIHtcblx0dGhpcy5fc3RhcnRYID0gc3RhcnRYO1xuXHR0aGlzLl9zdGFydFkgPSBzdGFydFk7XG5cdHRoaXMuX2VuZFggPSBlbmRYOyBcblx0dGhpcy5fZW5kWSA9IGVuZFk7XG5cdHRoaXMuX2VuZHNXaXRoQVdhbGwgPSB0cnVlO1xufVxuUk9ULk1hcC5GZWF0dXJlLkNvcnJpZG9yLmV4dGVuZChST1QuTWFwLkZlYXR1cmUpO1xuXG5ST1QuTWFwLkZlYXR1cmUuQ29ycmlkb3IuY3JlYXRlUmFuZG9tQXQgPSBmdW5jdGlvbih4LCB5LCBkeCwgZHksIG9wdGlvbnMpIHtcblx0dmFyIG1pbiA9IG9wdGlvbnMuY29ycmlkb3JMZW5ndGhbMF07XG5cdHZhciBtYXggPSBvcHRpb25zLmNvcnJpZG9yTGVuZ3RoWzFdO1xuXHR2YXIgbGVuZ3RoID0gbWluICsgTWF0aC5mbG9vcihST1QuUk5HLmdldFVuaWZvcm0oKSoobWF4LW1pbisxKSk7XG5cdFxuXHRyZXR1cm4gbmV3IHRoaXMoeCwgeSwgeCArIGR4Kmxlbmd0aCwgeSArIGR5Kmxlbmd0aCk7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coXCJjb3JyaWRvclwiLCB0aGlzLl9zdGFydFgsIHRoaXMuX3N0YXJ0WSwgdGhpcy5fZW5kWCwgdGhpcy5fZW5kWSk7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGlzV2FsbENhbGxiYWNrLCBjYW5CZUR1Z0NhbGxiYWNrKXsgXG5cdHZhciBzeCA9IHRoaXMuX3N0YXJ0WDtcblx0dmFyIHN5ID0gdGhpcy5fc3RhcnRZO1xuXHR2YXIgZHggPSB0aGlzLl9lbmRYLXN4O1xuXHR2YXIgZHkgPSB0aGlzLl9lbmRZLXN5O1xuXHR2YXIgbGVuZ3RoID0gMSArIE1hdGgubWF4KE1hdGguYWJzKGR4KSwgTWF0aC5hYnMoZHkpKTtcblx0XG5cdGlmIChkeCkgeyBkeCA9IGR4L01hdGguYWJzKGR4KTsgfVxuXHRpZiAoZHkpIHsgZHkgPSBkeS9NYXRoLmFicyhkeSk7IH1cblx0dmFyIG54ID0gZHk7XG5cdHZhciBueSA9IC1keDtcblx0XG5cdHZhciBvayA9IHRydWU7XG5cdGZvciAodmFyIGk9MDsgaTxsZW5ndGg7IGkrKykge1xuXHRcdHZhciB4ID0gc3ggKyBpKmR4O1xuXHRcdHZhciB5ID0gc3kgKyBpKmR5O1xuXG5cdFx0aWYgKCFjYW5CZUR1Z0NhbGxiYWNrKCAgICAgeCwgICAgICB5KSkgeyBvayA9IGZhbHNlOyB9XG5cdFx0aWYgKCFpc1dhbGxDYWxsYmFjayAgKHggKyBueCwgeSArIG55KSkgeyBvayA9IGZhbHNlOyB9XG5cdFx0aWYgKCFpc1dhbGxDYWxsYmFjayAgKHggLSBueCwgeSAtIG55KSkgeyBvayA9IGZhbHNlOyB9XG5cdFx0XG5cdFx0aWYgKCFvaykge1xuXHRcdFx0bGVuZ3RoID0gaTtcblx0XHRcdHRoaXMuX2VuZFggPSB4LWR4O1xuXHRcdFx0dGhpcy5fZW5kWSA9IHktZHk7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBJZiB0aGUgbGVuZ3RoIGRlZ2VuZXJhdGVkLCB0aGlzIGNvcnJpZG9yIG1pZ2h0IGJlIGludmFsaWRcblx0ICovXG5cdCBcblx0Lyogbm90IHN1cHBvcnRlZCAqL1xuXHRpZiAobGVuZ3RoID09IDApIHsgcmV0dXJuIGZhbHNlOyB9IFxuXHRcblx0IC8qIGxlbmd0aCAxIGFsbG93ZWQgb25seSBpZiB0aGUgbmV4dCBzcGFjZSBpcyBlbXB0eSAqL1xuXHRpZiAobGVuZ3RoID09IDEgJiYgaXNXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4LCB0aGlzLl9lbmRZICsgZHkpKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcblx0LyoqXG5cdCAqIFdlIGRvIG5vdCB3YW50IHRoZSBjb3JyaWRvciB0byBjcmFzaCBpbnRvIGEgY29ybmVyIG9mIGEgcm9vbTtcblx0ICogaWYgYW55IG9mIHRoZSBlbmRpbmcgY29ybmVycyBpcyBlbXB0eSwgdGhlIE4rMXRoIGNlbGwgb2YgdGhpcyBjb3JyaWRvciBtdXN0IGJlIGVtcHR5IHRvby5cblx0ICogXG5cdCAqIFNpdHVhdGlvbjpcblx0ICogIyMjIyMjIzFcblx0ICogLi4uLi4uLj9cblx0ICogIyMjIyMjIzJcblx0ICogXG5cdCAqIFRoZSBjb3JyaWRvciB3YXMgZHVnIGZyb20gbGVmdCB0byByaWdodC5cblx0ICogMSwgMiAtIHByb2JsZW1hdGljIGNvcm5lcnMsID8gPSBOKzF0aCBjZWxsIChub3QgZHVnKVxuXHQgKi9cblx0dmFyIGZpcnN0Q29ybmVyQmFkID0gIWlzV2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBkeCArIG54LCB0aGlzLl9lbmRZICsgZHkgKyBueSk7XG5cdHZhciBzZWNvbmRDb3JuZXJCYWQgPSAhaXNXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4IC0gbngsIHRoaXMuX2VuZFkgKyBkeSAtIG55KTtcblx0dGhpcy5fZW5kc1dpdGhBV2FsbCA9IGlzV2FsbENhbGxiYWNrKHRoaXMuX2VuZFggKyBkeCwgdGhpcy5fZW5kWSArIGR5KTtcblx0aWYgKChmaXJzdENvcm5lckJhZCB8fCBzZWNvbmRDb3JuZXJCYWQpICYmIHRoaXMuX2VuZHNXaXRoQVdhbGwpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0cmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gZGlnQ2FsbGJhY2sgRGlnIGNhbGxiYWNrIHdpdGggYSBzaWduYXR1cmUgKHgsIHksIHZhbHVlKS4gVmFsdWVzOiAwID0gZW1wdHkuXG4gKi9cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oZGlnQ2FsbGJhY2spIHsgXG5cdHZhciBzeCA9IHRoaXMuX3N0YXJ0WDtcblx0dmFyIHN5ID0gdGhpcy5fc3RhcnRZO1xuXHR2YXIgZHggPSB0aGlzLl9lbmRYLXN4O1xuXHR2YXIgZHkgPSB0aGlzLl9lbmRZLXN5O1xuXHR2YXIgbGVuZ3RoID0gMStNYXRoLm1heChNYXRoLmFicyhkeCksIE1hdGguYWJzKGR5KSk7XG5cdFxuXHRpZiAoZHgpIHsgZHggPSBkeC9NYXRoLmFicyhkeCk7IH1cblx0aWYgKGR5KSB7IGR5ID0gZHkvTWF0aC5hYnMoZHkpOyB9XG5cdHZhciBueCA9IGR5O1xuXHR2YXIgbnkgPSAtZHg7XG5cdFxuXHRmb3IgKHZhciBpPTA7IGk8bGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgeCA9IHN4ICsgaSpkeDtcblx0XHR2YXIgeSA9IHN5ICsgaSpkeTtcblx0XHRkaWdDYWxsYmFjayh4LCB5LCAwKTtcblx0fVxuXHRcblx0cmV0dXJuIHRydWU7XG59XG5cblJPVC5NYXAuRmVhdHVyZS5Db3JyaWRvci5wcm90b3R5cGUuY3JlYXRlUHJpb3JpdHlXYWxscyA9IGZ1bmN0aW9uKHByaW9yaXR5V2FsbENhbGxiYWNrKSB7XG5cdGlmICghdGhpcy5fZW5kc1dpdGhBV2FsbCkgeyByZXR1cm47IH1cblxuXHR2YXIgc3ggPSB0aGlzLl9zdGFydFg7XG5cdHZhciBzeSA9IHRoaXMuX3N0YXJ0WTtcblxuXHR2YXIgZHggPSB0aGlzLl9lbmRYLXN4O1xuXHR2YXIgZHkgPSB0aGlzLl9lbmRZLXN5O1xuXHRpZiAoZHgpIHsgZHggPSBkeC9NYXRoLmFicyhkeCk7IH1cblx0aWYgKGR5KSB7IGR5ID0gZHkvTWF0aC5hYnMoZHkpOyB9XG5cdHZhciBueCA9IGR5O1xuXHR2YXIgbnkgPSAtZHg7XG5cblx0cHJpb3JpdHlXYWxsQ2FsbGJhY2sodGhpcy5fZW5kWCArIGR4LCB0aGlzLl9lbmRZICsgZHkpO1xuXHRwcmlvcml0eVdhbGxDYWxsYmFjayh0aGlzLl9lbmRYICsgbngsIHRoaXMuX2VuZFkgKyBueSk7XG5cdHByaW9yaXR5V2FsbENhbGxiYWNrKHRoaXMuX2VuZFggLSBueCwgdGhpcy5fZW5kWSAtIG55KTtcbn0vKipcbiAqIEBjbGFzcyBCYXNlIG5vaXNlIGdlbmVyYXRvclxuICovXG5ST1QuTm9pc2UgPSBmdW5jdGlvbigpIHtcbn07XG5cblJPVC5Ob2lzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oeCwgeSkge31cbi8qKlxuICogQSBzaW1wbGUgMmQgaW1wbGVtZW50YXRpb24gb2Ygc2ltcGxleCBub2lzZSBieSBPbmRyZWogWmFyYVxuICpcbiAqIEJhc2VkIG9uIGEgc3BlZWQtaW1wcm92ZWQgc2ltcGxleCBub2lzZSBhbGdvcml0aG0gZm9yIDJELCAzRCBhbmQgNEQgaW4gSmF2YS5cbiAqIFdoaWNoIGlzIGJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIFdpdGggT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG4gKiBCZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuICovXG5cbi8qKlxuICogQGNsYXNzIDJEIHNpbXBsZXggbm9pc2UgZ2VuZXJhdG9yXG4gKiBAcGFyYW0ge2ludH0gW2dyYWRpZW50cz0yNTZdIFJhbmRvbSBncmFkaWVudHNcbiAqL1xuUk9ULk5vaXNlLlNpbXBsZXggPSBmdW5jdGlvbihncmFkaWVudHMpIHtcblx0Uk9ULk5vaXNlLmNhbGwodGhpcyk7XG5cblx0dGhpcy5fRjIgPSAwLjUgKiAoTWF0aC5zcXJ0KDMpIC0gMSk7XG4gICAgdGhpcy5fRzIgPSAoMyAtIE1hdGguc3FydCgzKSkgLyA2O1xuXG5cdHRoaXMuX2dyYWRpZW50cyA9IFtcblx0XHRbIDAsIC0xXSxcblx0XHRbIDEsIC0xXSxcblx0XHRbIDEsICAwXSxcblx0XHRbIDEsICAxXSxcblx0XHRbIDAsICAxXSxcblx0XHRbLTEsICAxXSxcblx0XHRbLTEsICAwXSxcblx0XHRbLTEsIC0xXVxuXHRdO1xuXG5cdHZhciBwZXJtdXRhdGlvbnMgPSBbXTtcblx0dmFyIGNvdW50ID0gZ3JhZGllbnRzIHx8IDI1Njtcblx0Zm9yICh2YXIgaT0wO2k8Y291bnQ7aSsrKSB7IHBlcm11dGF0aW9ucy5wdXNoKGkpOyB9XG5cdHBlcm11dGF0aW9ucyA9IHBlcm11dGF0aW9ucy5yYW5kb21pemUoKTtcblxuXHR0aGlzLl9wZXJtcyA9IFtdO1xuXHR0aGlzLl9pbmRleGVzID0gW107XG5cblx0Zm9yICh2YXIgaT0wO2k8Mipjb3VudDtpKyspIHtcblx0XHR0aGlzLl9wZXJtcy5wdXNoKHBlcm11dGF0aW9uc1tpICUgY291bnRdKTtcblx0XHR0aGlzLl9pbmRleGVzLnB1c2godGhpcy5fcGVybXNbaV0gJSB0aGlzLl9ncmFkaWVudHMubGVuZ3RoKTtcblx0fVxuXG59O1xuUk9ULk5vaXNlLlNpbXBsZXguZXh0ZW5kKFJPVC5Ob2lzZSk7XG5cblJPVC5Ob2lzZS5TaW1wbGV4LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih4aW4sIHlpbikge1xuXHR2YXIgcGVybXMgPSB0aGlzLl9wZXJtcztcblx0dmFyIGluZGV4ZXMgPSB0aGlzLl9pbmRleGVzO1xuXHR2YXIgY291bnQgPSBwZXJtcy5sZW5ndGgvMjtcblx0dmFyIEcyID0gdGhpcy5fRzI7XG5cblx0dmFyIG4wID0wLCBuMSA9IDAsIG4yID0gMCwgZ2k7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuXG5cdC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cblx0dmFyIHMgPSAoeGluICsgeWluKSAqIHRoaXMuX0YyOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEXG5cdHZhciBpID0gTWF0aC5mbG9vcih4aW4gKyBzKTtcblx0dmFyIGogPSBNYXRoLmZsb29yKHlpbiArIHMpO1xuXHR2YXIgdCA9IChpICsgaikgKiBHMjtcblx0dmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZVxuXHR2YXIgWTAgPSBqIC0gdDtcblx0dmFyIHgwID0geGluIC0gWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG5cdHZhciB5MCA9IHlpbiAtIFkwO1xuXG5cdC8vIEZvciB0aGUgMkQgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuXG5cdC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cblx0dmFyIGkxLCBqMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIChtaWRkbGUpIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGopIGNvb3Jkc1xuXHRpZiAoeDAgPiB5MCkge1xuXHRcdGkxID0gMTtcblx0XHRqMSA9IDA7XG5cdH0gZWxzZSB7IC8vIGxvd2VyIHRyaWFuZ2xlLCBYWSBvcmRlcjogKDAsMCktPigxLDApLT4oMSwxKVxuXHRcdGkxID0gMDtcblx0XHRqMSA9IDE7XG5cdH0gLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpXG5cblx0Ly8gQSBzdGVwIG9mICgxLDApIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jKSBpbiAoeCx5KSwgYW5kXG5cdC8vIGEgc3RlcCBvZiAoMCwxKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYykgaW4gKHgseSksIHdoZXJlXG5cdC8vIGMgPSAoMy1zcXJ0KDMpKS82XG5cdHZhciB4MSA9IHgwIC0gaTEgKyBHMjsgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcblx0dmFyIHkxID0geTAgLSBqMSArIEcyO1xuXHR2YXIgeDIgPSB4MCAtIDEgKyAyKkcyOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcblx0dmFyIHkyID0geTAgLSAxICsgMipHMjtcblxuXHQvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIHRocmVlIHNpbXBsZXggY29ybmVyc1xuXHR2YXIgaWkgPSBpLm1vZChjb3VudCk7XG5cdHZhciBqaiA9IGoubW9kKGNvdW50KTtcblxuXHQvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG5cdHZhciB0MCA9IDAuNSAtIHgwKngwIC0geTAqeTA7XG5cdGlmICh0MCA+PSAwKSB7XG5cdFx0dDAgKj0gdDA7XG5cdFx0Z2kgPSBpbmRleGVzW2lpK3Blcm1zW2pqXV07XG5cdFx0dmFyIGdyYWQgPSB0aGlzLl9ncmFkaWVudHNbZ2ldO1xuXHRcdG4wID0gdDAgKiB0MCAqIChncmFkWzBdICogeDAgKyBncmFkWzFdICogeTApO1xuXHR9XG5cdFxuXHR2YXIgdDEgPSAwLjUgLSB4MSp4MSAtIHkxKnkxO1xuXHRpZiAodDEgPj0gMCkge1xuXHRcdHQxICo9IHQxO1xuXHRcdGdpID0gaW5kZXhlc1tpaStpMStwZXJtc1tqaitqMV1dO1xuXHRcdHZhciBncmFkID0gdGhpcy5fZ3JhZGllbnRzW2dpXTtcblx0XHRuMSA9IHQxICogdDEgKiAoZ3JhZFswXSAqIHgxICsgZ3JhZFsxXSAqIHkxKTtcblx0fVxuXHRcblx0dmFyIHQyID0gMC41IC0geDIqeDIgLSB5Mip5Mjtcblx0aWYgKHQyID49IDApIHtcblx0XHR0MiAqPSB0Mjtcblx0XHRnaSA9IGluZGV4ZXNbaWkrMStwZXJtc1tqaisxXV07XG5cdFx0dmFyIGdyYWQgPSB0aGlzLl9ncmFkaWVudHNbZ2ldO1xuXHRcdG4yID0gdDIgKiB0MiAqIChncmFkWzBdICogeDIgKyBncmFkWzFdICogeTIpO1xuXHR9XG5cblx0Ly8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuXHQvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsMV0uXG5cdHJldHVybiA3MCAqIChuMCArIG4xICsgbjIpO1xufVxuLyoqXG4gKiBAY2xhc3MgQWJzdHJhY3QgRk9WIGFsZ29yaXRobVxuICogQHBhcmFtIHtmdW5jdGlvbn0gbGlnaHRQYXNzZXNDYWxsYmFjayBEb2VzIHRoZSBsaWdodCBwYXNzIHRocm91Z2ggeCx5P1xuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRvcG9sb2d5PThdIDQvNi84XG4gKi9cblJPVC5GT1YgPSBmdW5jdGlvbihsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKSB7XG5cdHRoaXMuX2xpZ2h0UGFzc2VzID0gbGlnaHRQYXNzZXNDYWxsYmFjaztcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHR0b3BvbG9neTogOFxuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxufTtcblxuLyoqXG4gKiBDb21wdXRlIHZpc2liaWxpdHkgZm9yIGEgMzYwLWRlZ3JlZSBjaXJjbGVcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuUk9ULkZPVi5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKHgsIHksIFIsIGNhbGxiYWNrKSB7fVxuXG4vKipcbiAqIFJldHVybiBhbGwgbmVpZ2hib3JzIGluIGEgY29uY2VudHJpYyByaW5nXG4gKiBAcGFyYW0ge2ludH0gY3ggY2VudGVyLXhcbiAqIEBwYXJhbSB7aW50fSBjeSBjZW50ZXIteVxuICogQHBhcmFtIHtpbnR9IHIgcmFuZ2VcbiAqL1xuUk9ULkZPVi5wcm90b3R5cGUuX2dldENpcmNsZSA9IGZ1bmN0aW9uKGN4LCBjeSwgcikge1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdHZhciBkaXJzLCBjb3VudEZhY3Rvciwgc3RhcnRPZmZzZXQ7XG5cblx0c3dpdGNoICh0aGlzLl9vcHRpb25zLnRvcG9sb2d5KSB7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0Y291bnRGYWN0b3IgPSAxO1xuXHRcdFx0c3RhcnRPZmZzZXQgPSBbMCwgMV07XG5cdFx0XHRkaXJzID0gW1xuXHRcdFx0XHRST1QuRElSU1s4XVs3XSxcblx0XHRcdFx0Uk9ULkRJUlNbOF1bMV0sXG5cdFx0XHRcdFJPVC5ESVJTWzhdWzNdLFxuXHRcdFx0XHRST1QuRElSU1s4XVs1XVxuXHRcdFx0XVxuXHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA2OlxuXHRcdFx0ZGlycyA9IFJPVC5ESVJTWzZdO1xuXHRcdFx0Y291bnRGYWN0b3IgPSAxO1xuXHRcdFx0c3RhcnRPZmZzZXQgPSBbLTEsIDFdO1xuXHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA4OlxuXHRcdFx0ZGlycyA9IFJPVC5ESVJTWzRdO1xuXHRcdFx0Y291bnRGYWN0b3IgPSAyO1xuXHRcdFx0c3RhcnRPZmZzZXQgPSBbLTEsIDFdO1xuXHRcdGJyZWFrO1xuXHR9XG5cblx0Lyogc3RhcnRpbmcgbmVpZ2hib3IgKi9cblx0dmFyIHggPSBjeCArIHN0YXJ0T2Zmc2V0WzBdKnI7XG5cdHZhciB5ID0gY3kgKyBzdGFydE9mZnNldFsxXSpyO1xuXG5cdC8qIGNpcmNsZSAqL1xuXHRmb3IgKHZhciBpPTA7aTxkaXJzLmxlbmd0aDtpKyspIHtcblx0XHRmb3IgKHZhciBqPTA7ajxyKmNvdW50RmFjdG9yO2orKykge1xuXHRcdFx0cmVzdWx0LnB1c2goW3gsIHldKTtcblx0XHRcdHggKz0gZGlyc1tpXVswXTtcblx0XHRcdHkgKz0gZGlyc1tpXVsxXTtcblxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIEBjbGFzcyBEaXNjcmV0ZSBzaGFkb3djYXN0aW5nIGFsZ29yaXRobS4gT2Jzb2xldGVkIGJ5IFByZWNpc2Ugc2hhZG93Y2FzdGluZy5cbiAqIEBhdWdtZW50cyBST1QuRk9WXG4gKi9cblJPVC5GT1YuRGlzY3JldGVTaGFkb3djYXN0aW5nID0gZnVuY3Rpb24obGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucykge1xuXHRST1QuRk9WLmNhbGwodGhpcywgbGlnaHRQYXNzZXNDYWxsYmFjaywgb3B0aW9ucyk7XG59XG5ST1QuRk9WLkRpc2NyZXRlU2hhZG93Y2FzdGluZy5leHRlbmQoUk9ULkZPVik7XG5cbi8qKlxuICogQHNlZSBST1QuRk9WI2NvbXB1dGVcbiAqL1xuUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbih4LCB5LCBSLCBjYWxsYmFjaykge1xuXHR2YXIgY2VudGVyID0gdGhpcy5fY29vcmRzO1xuXHR2YXIgbWFwID0gdGhpcy5fbWFwO1xuXG5cdC8qIHRoaXMgcGxhY2UgaXMgYWx3YXlzIHZpc2libGUgKi9cblx0Y2FsbGJhY2soeCwgeSwgMCk7XG5cblx0Lyogc3RhbmRpbmcgaW4gYSBkYXJrIHBsYWNlLiBGSVhNRSBpcyB0aGlzIGEgZ29vZCBpZGVhPyAgKi9cblx0aWYgKCF0aGlzLl9saWdodFBhc3Nlcyh4LCB5KSkgeyByZXR1cm47IH1cblx0XG5cdC8qIHN0YXJ0IGFuZCBlbmQgYW5nbGVzICovXG5cdHZhciBEQVRBID0gW107XG5cdFxuXHR2YXIgQSwgQiwgY3gsIGN5LCBibG9ja3M7XG5cblx0LyogYW5hbHl6ZSBzdXJyb3VuZGluZyBjZWxscyBpbiBjb25jZW50cmljIHJpbmdzLCBzdGFydGluZyBmcm9tIHRoZSBjZW50ZXIgKi9cblx0Zm9yICh2YXIgcj0xOyByPD1SOyByKyspIHtcblx0XHR2YXIgbmVpZ2hib3JzID0gdGhpcy5fZ2V0Q2lyY2xlKHgsIHksIHIpO1xuXHRcdHZhciBhbmdsZSA9IDM2MCAvIG5laWdoYm9ycy5sZW5ndGg7XG5cblx0XHRmb3IgKHZhciBpPTA7aTxuZWlnaGJvcnMubGVuZ3RoO2krKykge1xuXHRcdFx0Y3ggPSBuZWlnaGJvcnNbaV1bMF07XG5cdFx0XHRjeSA9IG5laWdoYm9yc1tpXVsxXTtcblx0XHRcdEEgPSBhbmdsZSAqIChpIC0gMC41KTtcblx0XHRcdEIgPSBBICsgYW5nbGU7XG5cdFx0XHRcblx0XHRcdGJsb2NrcyA9ICF0aGlzLl9saWdodFBhc3NlcyhjeCwgY3kpO1xuXHRcdFx0aWYgKHRoaXMuX3Zpc2libGVDb29yZHMoTWF0aC5mbG9vcihBKSwgTWF0aC5jZWlsKEIpLCBibG9ja3MsIERBVEEpKSB7IGNhbGxiYWNrKGN4LCBjeSwgciwgMSk7IH1cblx0XHRcdFxuXHRcdFx0aWYgKERBVEEubGVuZ3RoID09IDIgJiYgREFUQVswXSA9PSAwICYmIERBVEFbMV0gPT0gMzYwKSB7IHJldHVybjsgfSAvKiBjdXRvZmY/ICovXG5cblx0XHR9IC8qIGZvciBhbGwgY2VsbHMgaW4gdGhpcyByaW5nICovXG5cdH0gLyogZm9yIGFsbCByaW5ncyAqL1xufVxuXG4vKipcbiAqIEBwYXJhbSB7aW50fSBBIHN0YXJ0IGFuZ2xlXG4gKiBAcGFyYW0ge2ludH0gQiBlbmQgYW5nbGVcbiAqIEBwYXJhbSB7Ym9vbH0gYmxvY2tzIERvZXMgY3VycmVudCBjZWxsIGJsb2NrIHZpc2liaWxpdHk/XG4gKiBAcGFyYW0ge2ludFtdW119IERBVEEgc2hhZG93ZWQgYW5nbGUgcGFpcnNcbiAqL1xuUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLl92aXNpYmxlQ29vcmRzID0gZnVuY3Rpb24oQSwgQiwgYmxvY2tzLCBEQVRBKSB7XG5cdGlmIChBIDwgMCkgeyBcblx0XHR2YXIgdjEgPSBhcmd1bWVudHMuY2FsbGVlKDAsIEIsIGJsb2NrcywgREFUQSk7XG5cdFx0dmFyIHYyID0gYXJndW1lbnRzLmNhbGxlZSgzNjArQSwgMzYwLCBibG9ja3MsIERBVEEpO1xuXHRcdHJldHVybiB2MSB8fCB2Mjtcblx0fVxuXHRcblx0dmFyIGluZGV4ID0gMDtcblx0d2hpbGUgKGluZGV4IDwgREFUQS5sZW5ndGggJiYgREFUQVtpbmRleF0gPCBBKSB7IGluZGV4Kys7IH1cblx0XG5cdGlmIChpbmRleCA9PSBEQVRBLmxlbmd0aCkgeyAvKiBjb21wbGV0ZWx5IG5ldyBzaGFkb3cgKi9cblx0XHRpZiAoYmxvY2tzKSB7IERBVEEucHVzaChBLCBCKTsgfSBcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRcblx0dmFyIGNvdW50ID0gMDtcblx0XG5cdGlmIChpbmRleCAlIDIpIHsgLyogdGhpcyBzaGFkb3cgc3RhcnRzIGluIGFuIGV4aXN0aW5nIHNoYWRvdywgb3Igd2l0aGluIGl0cyBlbmRpbmcgYm91bmRhcnkgKi9cblx0XHR3aGlsZSAoaW5kZXggPCBEQVRBLmxlbmd0aCAmJiBEQVRBW2luZGV4XSA8IEIpIHtcblx0XHRcdGluZGV4Kys7XG5cdFx0XHRjb3VudCsrO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoY291bnQgPT0gMCkgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRcblx0XHRpZiAoYmxvY2tzKSB7IFxuXHRcdFx0aWYgKGNvdW50ICUgMikge1xuXHRcdFx0XHREQVRBLnNwbGljZShpbmRleC1jb3VudCwgY291bnQsIEIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0REFUQS5zcGxpY2UoaW5kZXgtY291bnQsIGNvdW50KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fSBlbHNlIHsgLyogdGhpcyBzaGFkb3cgc3RhcnRzIG91dHNpZGUgYW4gZXhpc3Rpbmcgc2hhZG93LCBvciB3aXRoaW4gYSBzdGFydGluZyBib3VuZGFyeSAqL1xuXHRcdHdoaWxlIChpbmRleCA8IERBVEEubGVuZ3RoICYmIERBVEFbaW5kZXhdIDwgQikge1xuXHRcdFx0aW5kZXgrKztcblx0XHRcdGNvdW50Kys7XG5cdFx0fVxuXHRcdFxuXHRcdC8qIHZpc2libGUgd2hlbiBvdXRzaWRlIGFuIGV4aXN0aW5nIHNoYWRvdywgb3Igd2hlbiBvdmVybGFwcGluZyAqL1xuXHRcdGlmIChBID09IERBVEFbaW5kZXgtY291bnRdICYmIGNvdW50ID09IDEpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0XG5cdFx0aWYgKGJsb2NrcykgeyBcblx0XHRcdGlmIChjb3VudCAlIDIpIHtcblx0XHRcdFx0REFUQS5zcGxpY2UoaW5kZXgtY291bnQsIGNvdW50LCBBKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdERBVEEuc3BsaWNlKGluZGV4LWNvdW50LCBjb3VudCwgQSwgQik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn1cbi8qKlxuICogQGNsYXNzIFByZWNpc2Ugc2hhZG93Y2FzdGluZyBhbGdvcml0aG1cbiAqIEBhdWdtZW50cyBST1QuRk9WXG4gKi9cblJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcgPSBmdW5jdGlvbihsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5GT1YuY2FsbCh0aGlzLCBsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKTtcbn1cblJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcuZXh0ZW5kKFJPVC5GT1YpO1xuXG4vKipcbiAqIEBzZWUgUk9ULkZPViNjb21wdXRlXG4gKi9cblJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbih4LCB5LCBSLCBjYWxsYmFjaykge1xuXHQvKiB0aGlzIHBsYWNlIGlzIGFsd2F5cyB2aXNpYmxlICovXG5cdGNhbGxiYWNrKHgsIHksIDAsIDEpO1xuXG5cdC8qIHN0YW5kaW5nIGluIGEgZGFyayBwbGFjZS4gRklYTUUgaXMgdGhpcyBhIGdvb2QgaWRlYT8gICovXG5cdGlmICghdGhpcy5fbGlnaHRQYXNzZXMoeCwgeSkpIHsgcmV0dXJuOyB9XG5cdFxuXHQvKiBsaXN0IG9mIGFsbCBzaGFkb3dzICovXG5cdHZhciBTSEFET1dTID0gW107XG5cdFxuXHR2YXIgY3gsIGN5LCBibG9ja3MsIEExLCBBMiwgdmlzaWJpbGl0eTtcblxuXHQvKiBhbmFseXplIHN1cnJvdW5kaW5nIGNlbGxzIGluIGNvbmNlbnRyaWMgcmluZ3MsIHN0YXJ0aW5nIGZyb20gdGhlIGNlbnRlciAqL1xuXHRmb3IgKHZhciByPTE7IHI8PVI7IHIrKykge1xuXHRcdHZhciBuZWlnaGJvcnMgPSB0aGlzLl9nZXRDaXJjbGUoeCwgeSwgcik7XG5cdFx0dmFyIG5laWdoYm9yQ291bnQgPSBuZWlnaGJvcnMubGVuZ3RoO1xuXG5cdFx0Zm9yICh2YXIgaT0wO2k8bmVpZ2hib3JDb3VudDtpKyspIHtcblx0XHRcdGN4ID0gbmVpZ2hib3JzW2ldWzBdO1xuXHRcdFx0Y3kgPSBuZWlnaGJvcnNbaV1bMV07XG5cdFx0XHQvKiBzaGlmdCBoYWxmLWFuLWFuZ2xlIGJhY2t3YXJkcyB0byBtYWludGFpbiBjb25zaXN0ZW5jeSBvZiAwLXRoIGNlbGxzICovXG5cdFx0XHRBMSA9IFtpID8gMippLTEgOiAyKm5laWdoYm9yQ291bnQtMSwgMipuZWlnaGJvckNvdW50XTtcblx0XHRcdEEyID0gWzIqaSsxLCAyKm5laWdoYm9yQ291bnRdOyBcblx0XHRcdFxuXHRcdFx0YmxvY2tzID0gIXRoaXMuX2xpZ2h0UGFzc2VzKGN4LCBjeSk7XG5cdFx0XHR2aXNpYmlsaXR5ID0gdGhpcy5fY2hlY2tWaXNpYmlsaXR5KEExLCBBMiwgYmxvY2tzLCBTSEFET1dTKTtcblx0XHRcdGlmICh2aXNpYmlsaXR5KSB7IGNhbGxiYWNrKGN4LCBjeSwgciwgdmlzaWJpbGl0eSk7IH1cblxuXHRcdFx0aWYgKFNIQURPV1MubGVuZ3RoID09IDIgJiYgU0hBRE9XU1swXVswXSA9PSAwICYmIFNIQURPV1NbMV1bMF0gPT0gU0hBRE9XU1sxXVsxXSkgeyByZXR1cm47IH0gLyogY3V0b2ZmPyAqL1xuXG5cdFx0fSAvKiBmb3IgYWxsIGNlbGxzIGluIHRoaXMgcmluZyAqL1xuXHR9IC8qIGZvciBhbGwgcmluZ3MgKi9cbn1cblxuLyoqXG4gKiBAcGFyYW0ge2ludFsyXX0gQTEgYXJjIHN0YXJ0XG4gKiBAcGFyYW0ge2ludFsyXX0gQTIgYXJjIGVuZFxuICogQHBhcmFtIHtib29sfSBibG9ja3MgRG9lcyBjdXJyZW50IGFyYyBibG9jayB2aXNpYmlsaXR5P1xuICogQHBhcmFtIHtpbnRbXVtdfSBTSEFET1dTIGxpc3Qgb2YgYWN0aXZlIHNoYWRvd3NcbiAqL1xuUk9ULkZPVi5QcmVjaXNlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuX2NoZWNrVmlzaWJpbGl0eSA9IGZ1bmN0aW9uKEExLCBBMiwgYmxvY2tzLCBTSEFET1dTKSB7XG5cdGlmIChBMVswXSA+IEEyWzBdKSB7IC8qIHNwbGl0IGludG8gdHdvIHN1Yi1hcmNzICovXG5cdFx0dmFyIHYxID0gdGhpcy5fY2hlY2tWaXNpYmlsaXR5KEExLCBbQTFbMV0sIEExWzFdXSwgYmxvY2tzLCBTSEFET1dTKTtcblx0XHR2YXIgdjIgPSB0aGlzLl9jaGVja1Zpc2liaWxpdHkoWzAsIDFdLCBBMiwgYmxvY2tzLCBTSEFET1dTKTtcblx0XHRyZXR1cm4gKHYxK3YyKS8yO1xuXHR9XG5cblx0LyogaW5kZXgxOiBmaXJzdCBzaGFkb3cgPj0gQTEgKi9cblx0dmFyIGluZGV4MSA9IDAsIGVkZ2UxID0gZmFsc2U7XG5cdHdoaWxlIChpbmRleDEgPCBTSEFET1dTLmxlbmd0aCkge1xuXHRcdHZhciBvbGQgPSBTSEFET1dTW2luZGV4MV07XG5cdFx0dmFyIGRpZmYgPSBvbGRbMF0qQTFbMV0gLSBBMVswXSpvbGRbMV07XG5cdFx0aWYgKGRpZmYgPj0gMCkgeyAvKiBvbGQgPj0gQTEgKi9cblx0XHRcdGlmIChkaWZmID09IDAgJiYgIShpbmRleDEgJSAyKSkgeyBlZGdlMSA9IHRydWU7IH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpbmRleDErKztcblx0fVxuXG5cdC8qIGluZGV4MjogbGFzdCBzaGFkb3cgPD0gQTIgKi9cblx0dmFyIGluZGV4MiA9IFNIQURPV1MubGVuZ3RoLCBlZGdlMiA9IGZhbHNlO1xuXHR3aGlsZSAoaW5kZXgyLS0pIHtcblx0XHR2YXIgb2xkID0gU0hBRE9XU1tpbmRleDJdO1xuXHRcdHZhciBkaWZmID0gQTJbMF0qb2xkWzFdIC0gb2xkWzBdKkEyWzFdO1xuXHRcdGlmIChkaWZmID49IDApIHsgLyogb2xkIDw9IEEyICovXG5cdFx0XHRpZiAoZGlmZiA9PSAwICYmIChpbmRleDIgJSAyKSkgeyBlZGdlMiA9IHRydWU7IH1cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHZhciB2aXNpYmxlID0gdHJ1ZTtcblx0aWYgKGluZGV4MSA9PSBpbmRleDIgJiYgKGVkZ2UxIHx8IGVkZ2UyKSkgeyAgLyogc3Vic2V0IG9mIGV4aXN0aW5nIHNoYWRvdywgb25lIG9mIHRoZSBlZGdlcyBtYXRjaCAqL1xuXHRcdHZpc2libGUgPSBmYWxzZTsgXG5cdH0gZWxzZSBpZiAoZWRnZTEgJiYgZWRnZTIgJiYgaW5kZXgxKzE9PWluZGV4MiAmJiAoaW5kZXgyICUgMikpIHsgLyogY29tcGxldGVseSBlcXVpdmFsZW50IHdpdGggZXhpc3Rpbmcgc2hhZG93ICovXG5cdFx0dmlzaWJsZSA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKGluZGV4MSA+IGluZGV4MiAmJiAoaW5kZXgxICUgMikpIHsgLyogc3Vic2V0IG9mIGV4aXN0aW5nIHNoYWRvdywgbm90IHRvdWNoaW5nICovXG5cdFx0dmlzaWJsZSA9IGZhbHNlO1xuXHR9XG5cdFxuXHRpZiAoIXZpc2libGUpIHsgcmV0dXJuIDA7IH0gLyogZmFzdCBjYXNlOiBub3QgdmlzaWJsZSAqL1xuXHRcblx0dmFyIHZpc2libGVMZW5ndGgsIFA7XG5cblx0LyogY29tcHV0ZSB0aGUgbGVuZ3RoIG9mIHZpc2libGUgYXJjLCBhZGp1c3QgbGlzdCBvZiBzaGFkb3dzIChpZiBibG9ja2luZykgKi9cblx0dmFyIHJlbW92ZSA9IGluZGV4Mi1pbmRleDErMTtcblx0aWYgKHJlbW92ZSAlIDIpIHtcblx0XHRpZiAoaW5kZXgxICUgMikgeyAvKiBmaXJzdCBlZGdlIHdpdGhpbiBleGlzdGluZyBzaGFkb3csIHNlY29uZCBvdXRzaWRlICovXG5cdFx0XHR2YXIgUCA9IFNIQURPV1NbaW5kZXgxXTtcblx0XHRcdHZpc2libGVMZW5ndGggPSAoQTJbMF0qUFsxXSAtIFBbMF0qQTJbMV0pIC8gKFBbMV0gKiBBMlsxXSk7XG5cdFx0XHRpZiAoYmxvY2tzKSB7IFNIQURPV1Muc3BsaWNlKGluZGV4MSwgcmVtb3ZlLCBBMik7IH1cblx0XHR9IGVsc2UgeyAvKiBzZWNvbmQgZWRnZSB3aXRoaW4gZXhpc3Rpbmcgc2hhZG93LCBmaXJzdCBvdXRzaWRlICovXG5cdFx0XHR2YXIgUCA9IFNIQURPV1NbaW5kZXgyXTtcblx0XHRcdHZpc2libGVMZW5ndGggPSAoUFswXSpBMVsxXSAtIEExWzBdKlBbMV0pIC8gKEExWzFdICogUFsxXSk7XG5cdFx0XHRpZiAoYmxvY2tzKSB7IFNIQURPV1Muc3BsaWNlKGluZGV4MSwgcmVtb3ZlLCBBMSk7IH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGluZGV4MSAlIDIpIHsgLyogYm90aCBlZGdlcyB3aXRoaW4gZXhpc3Rpbmcgc2hhZG93cyAqL1xuXHRcdFx0dmFyIFAxID0gU0hBRE9XU1tpbmRleDFdO1xuXHRcdFx0dmFyIFAyID0gU0hBRE9XU1tpbmRleDJdO1xuXHRcdFx0dmlzaWJsZUxlbmd0aCA9IChQMlswXSpQMVsxXSAtIFAxWzBdKlAyWzFdKSAvIChQMVsxXSAqIFAyWzFdKTtcblx0XHRcdGlmIChibG9ja3MpIHsgU0hBRE9XUy5zcGxpY2UoaW5kZXgxLCByZW1vdmUpOyB9XG5cdFx0fSBlbHNlIHsgLyogYm90aCBlZGdlcyBvdXRzaWRlIGV4aXN0aW5nIHNoYWRvd3MgKi9cblx0XHRcdGlmIChibG9ja3MpIHsgU0hBRE9XUy5zcGxpY2UoaW5kZXgxLCByZW1vdmUsIEExLCBBMik7IH1cblx0XHRcdHJldHVybiAxOyAvKiB3aG9sZSBhcmMgdmlzaWJsZSEgKi9cblx0XHR9XG5cdH1cblxuXHR2YXIgYXJjTGVuZ3RoID0gKEEyWzBdKkExWzFdIC0gQTFbMF0qQTJbMV0pIC8gKEExWzFdICogQTJbMV0pO1xuXG5cdHJldHVybiB2aXNpYmxlTGVuZ3RoL2FyY0xlbmd0aDtcbn1cbi8qKlxuICogQGNsYXNzIFJlY3Vyc2l2ZSBzaGFkb3djYXN0aW5nIGFsZ29yaXRobVxuICogQ3VycmVudGx5IG9ubHkgc3VwcG9ydHMgNC84IHRvcG9sb2dpZXMsIG5vdCBoZXhhZ29uYWwuXG4gKiBCYXNlZCBvbiBQZXRlciBIYXJraW5zJyBpbXBsZW1lbnRhdGlvbiBvZiBCasO2cm4gQmVyZ3N0csO2bSdzIGFsZ29yaXRobSBkZXNjcmliZWQgaGVyZTogaHR0cDovL3d3dy5yb2d1ZWJhc2luLmNvbS9pbmRleC5waHA/dGl0bGU9Rk9WX3VzaW5nX3JlY3Vyc2l2ZV9zaGFkb3djYXN0aW5nXG4gKiBAYXVnbWVudHMgUk9ULkZPVlxuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcgPSBmdW5jdGlvbihsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5GT1YuY2FsbCh0aGlzLCBsaWdodFBhc3Nlc0NhbGxiYWNrLCBvcHRpb25zKTtcbn1cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5leHRlbmQoUk9ULkZPVik7XG5cbi8qKiBPY3RhbnRzIHVzZWQgZm9yIHRyYW5zbGF0aW5nIHJlY3Vyc2l2ZSBzaGFkb3djYXN0aW5nIG9mZnNldHMgKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTID0gW1xuXHRbLTEsICAwLCAgMCwgIDFdLFxuXHRbIDAsIC0xLCAgMSwgIDBdLFxuXHRbIDAsIC0xLCAtMSwgIDBdLFxuXHRbLTEsICAwLCAgMCwgLTFdLFxuXHRbIDEsICAwLCAgMCwgLTFdLFxuXHRbIDAsICAxLCAtMSwgIDBdLFxuXHRbIDAsICAxLCAgMSwgIDBdLFxuXHRbIDEsICAwLCAgMCwgIDFdXG5dO1xuXG4vKipcbiAqIENvbXB1dGUgdmlzaWJpbGl0eSBmb3IgYSAzNjAtZGVncmVlIGNpcmNsZVxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gUiBNYXhpbXVtIHZpc2liaWxpdHkgcmFkaXVzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbih4LCB5LCBSLCBjYWxsYmFjaykge1xuXHQvL1lvdSBjYW4gYWx3YXlzIHNlZSB5b3VyIG93biB0aWxlXG5cdGNhbGxiYWNrKHgsIHksIDAsIHRydWUpO1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbaV0sIFIsIGNhbGxiYWNrKTtcblx0fVxufVxuXG4vKipcbiAqIENvbXB1dGUgdmlzaWJpbGl0eSBmb3IgYSAxODAtZGVncmVlIGFyY1xuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gUiBNYXhpbXVtIHZpc2liaWxpdHkgcmFkaXVzXG4gKiBAcGFyYW0ge2ludH0gZGlyIERpcmVjdGlvbiB0byBsb29rIGluIChleHByZXNzZWQgaW4gYSBST1QuRElSIHZhbHVlKTtcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cblJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5wcm90b3R5cGUuY29tcHV0ZTE4MCA9IGZ1bmN0aW9uKHgsIHksIFIsIGRpciwgY2FsbGJhY2spIHtcblx0Ly9Zb3UgY2FuIGFsd2F5cyBzZWUgeW91ciBvd24gdGlsZVxuXHRjYWxsYmFjayh4LCB5LCAwLCB0cnVlKTtcblx0dmFyIHByZXZpb3VzT2N0YW50ID0gKGRpciAtIDEgKyA4KSAlIDg7IC8vTmVlZCB0byByZXRyaWV2ZSB0aGUgcHJldmlvdXMgb2N0YW50IHRvIHJlbmRlciBhIGZ1bGwgMTgwIGRlZ3JlZXNcblx0dmFyIG5leHRQcmV2aW91c09jdGFudCA9IChkaXIgLSAyICsgOCkgJSA4OyAvL05lZWQgdG8gcmV0cmlldmUgdGhlIHByZXZpb3VzIHR3byBvY3RhbnRzIHRvIHJlbmRlciBhIGZ1bGwgMTgwIGRlZ3JlZXNcblx0dmFyIG5leHRPY3RhbnQgPSAoZGlyKyAxICsgOCkgJSA4OyAvL05lZWQgdG8gZ3JhYiB0byBuZXh0IG9jdGFudCB0byByZW5kZXIgYSBmdWxsIDE4MCBkZWdyZWVzXG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1tuZXh0UHJldmlvdXNPY3RhbnRdLCBSLCBjYWxsYmFjayk7XG5cdHRoaXMuX3JlbmRlck9jdGFudCh4LCB5LCBST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcuT0NUQU5UU1twcmV2aW91c09jdGFudF0sIFIsIGNhbGxiYWNrKTtcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW2Rpcl0sIFIsIGNhbGxiYWNrKTtcblx0dGhpcy5fcmVuZGVyT2N0YW50KHgsIHksIFJPVC5GT1YuUmVjdXJzaXZlU2hhZG93Y2FzdGluZy5PQ1RBTlRTW25leHRPY3RhbnRdLCBSLCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB2aXNpYmlsaXR5IGZvciBhIDkwLWRlZ3JlZSBhcmNcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtpbnR9IGRpciBEaXJlY3Rpb24gdG8gbG9vayBpbiAoZXhwcmVzc2VkIGluIGEgUk9ULkRJUiB2YWx1ZSk7XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5ST1QuRk9WLlJlY3Vyc2l2ZVNoYWRvd2Nhc3RpbmcucHJvdG90eXBlLmNvbXB1dGU5MCA9IGZ1bmN0aW9uKHgsIHksIFIsIGRpciwgY2FsbGJhY2spIHtcblx0Ly9Zb3UgY2FuIGFsd2F5cyBzZWUgeW91ciBvd24gdGlsZVxuXHRjYWxsYmFjayh4LCB5LCAwLCB0cnVlKTtcblx0dmFyIHByZXZpb3VzT2N0YW50ID0gKGRpciAtIDEgKyA4KSAlIDg7IC8vTmVlZCB0byByZXRyaWV2ZSB0aGUgcHJldmlvdXMgb2N0YW50IHRvIHJlbmRlciBhIGZ1bGwgOTAgZGVncmVlc1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbZGlyXSwgUiwgY2FsbGJhY2spO1xuXHR0aGlzLl9yZW5kZXJPY3RhbnQoeCwgeSwgUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLk9DVEFOVFNbcHJldmlvdXNPY3RhbnRdLCBSLCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogUmVuZGVyIG9uZSBvY3RhbnQgKDQ1LWRlZ3JlZSBhcmMpIG9mIHRoZSB2aWV3c2hlZFxuICogQHBhcmFtIHtpbnR9IHhcbiAqIEBwYXJhbSB7aW50fSB5XG4gKiBAcGFyYW0ge2ludH0gb2N0YW50IE9jdGFudCB0byBiZSByZW5kZXJlZFxuICogQHBhcmFtIHtpbnR9IFIgTWF4aW11bSB2aXNpYmlsaXR5IHJhZGl1c1xuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5fcmVuZGVyT2N0YW50ID0gZnVuY3Rpb24oeCwgeSwgb2N0YW50LCBSLCBjYWxsYmFjaykge1xuXHQvL1JhZGl1cyBpbmNyZW1lbnRlZCBieSAxIHRvIHByb3ZpZGUgc2FtZSBjb3ZlcmFnZSBhcmVhIGFzIG90aGVyIHNoYWRvd2Nhc3RpbmcgcmFkaXVzZXNcblx0dGhpcy5fY2FzdFZpc2liaWxpdHkoeCwgeSwgMSwgMS4wLCAwLjAsIFIgKyAxLCBvY3RhbnRbMF0sIG9jdGFudFsxXSwgb2N0YW50WzJdLCBvY3RhbnRbM10sIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBBY3R1YWxseSBjYWxjdWxhdGVzIHRoZSB2aXNpYmlsaXR5XG4gKiBAcGFyYW0ge2ludH0gc3RhcnRYIFRoZSBzdGFydGluZyBYIGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7aW50fSBzdGFydFkgVGhlIHN0YXJ0aW5nIFkgY29vcmRpbmF0ZVxuICogQHBhcmFtIHtpbnR9IHJvdyBUaGUgcm93IHRvIHJlbmRlclxuICogQHBhcmFtIHtmbG9hdH0gdmlzU2xvcGVTdGFydCBUaGUgc2xvcGUgdG8gc3RhcnQgYXRcbiAqIEBwYXJhbSB7ZmxvYXR9IHZpc1Nsb3BlRW5kIFRoZSBzbG9wZSB0byBlbmQgYXRcbiAqIEBwYXJhbSB7aW50fSByYWRpdXMgVGhlIHJhZGl1cyB0byByZWFjaCBvdXQgdG9cbiAqIEBwYXJhbSB7aW50fSB4eCBcbiAqIEBwYXJhbSB7aW50fSB4eSBcbiAqIEBwYXJhbSB7aW50fSB5eCBcbiAqIEBwYXJhbSB7aW50fSB5eSBcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBjYWxsYmFjayB0byB1c2Ugd2hlbiB3ZSBoaXQgYSBibG9jayB0aGF0IGlzIHZpc2libGVcbiAqL1xuUk9ULkZPVi5SZWN1cnNpdmVTaGFkb3djYXN0aW5nLnByb3RvdHlwZS5fY2FzdFZpc2liaWxpdHkgPSBmdW5jdGlvbihzdGFydFgsIHN0YXJ0WSwgcm93LCB2aXNTbG9wZVN0YXJ0LCB2aXNTbG9wZUVuZCwgcmFkaXVzLCB4eCwgeHksIHl4LCB5eSwgY2FsbGJhY2spIHtcblx0aWYodmlzU2xvcGVTdGFydCA8IHZpc1Nsb3BlRW5kKSB7IHJldHVybjsgfVxuXHRmb3IodmFyIGkgPSByb3c7IGkgPD0gcmFkaXVzOyBpKyspIHtcblx0XHR2YXIgZHggPSAtaSAtIDE7XG5cdFx0dmFyIGR5ID0gLWk7XG5cdFx0dmFyIGJsb2NrZWQgPSBmYWxzZTtcblx0XHR2YXIgbmV3U3RhcnQgPSAwO1xuXG5cdFx0Ly8nUm93JyBjb3VsZCBiZSBjb2x1bW4sIG5hbWVzIGhlcmUgYXNzdW1lIG9jdGFudCAwIGFuZCB3b3VsZCBiZSBmbGlwcGVkIGZvciBoYWxmIHRoZSBvY3RhbnRzXG5cdFx0d2hpbGUoZHggPD0gMCkge1xuXHRcdFx0ZHggKz0gMTtcblxuXHRcdFx0Ly9UcmFuc2xhdGUgZnJvbSByZWxhdGl2ZSBjb29yZGluYXRlcyB0byBtYXAgY29vcmRpbmF0ZXNcblx0XHRcdHZhciBtYXBYID0gc3RhcnRYICsgZHggKiB4eCArIGR5ICogeHk7XG5cdFx0XHR2YXIgbWFwWSA9IHN0YXJ0WSArIGR4ICogeXggKyBkeSAqIHl5O1xuXG5cdFx0XHQvL1JhbmdlIG9mIHRoZSByb3dcblx0XHRcdHZhciBzbG9wZVN0YXJ0ID0gKGR4IC0gMC41KSAvIChkeSArIDAuNSk7XG5cdFx0XHR2YXIgc2xvcGVFbmQgPSAoZHggKyAwLjUpIC8gKGR5IC0gMC41KTtcblx0XHRcblx0XHRcdC8vSWdub3JlIGlmIG5vdCB5ZXQgYXQgbGVmdCBlZGdlIG9mIE9jdGFudFxuXHRcdFx0aWYoc2xvcGVFbmQgPiB2aXNTbG9wZVN0YXJ0KSB7IGNvbnRpbnVlOyB9XG5cdFx0XHRcblx0XHRcdC8vRG9uZSBpZiBwYXN0IHJpZ2h0IGVkZ2Vcblx0XHRcdGlmKHNsb3BlU3RhcnQgPCB2aXNTbG9wZUVuZCkgeyBicmVhazsgfVxuXHRcdFx0XHRcblx0XHRcdC8vSWYgaXQncyBpbiByYW5nZSwgaXQncyB2aXNpYmxlXG5cdFx0XHRpZigoZHggKiBkeCArIGR5ICogZHkpIDwgKHJhZGl1cyAqIHJhZGl1cykpIHtcblx0XHRcdFx0Y2FsbGJhY2sobWFwWCwgbWFwWSwgaSwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFxuXHRcdFx0aWYoIWJsb2NrZWQpIHtcblx0XHRcdFx0Ly9JZiB0aWxlIGlzIGEgYmxvY2tpbmcgdGlsZSwgY2FzdCBhcm91bmQgaXRcblx0XHRcdFx0aWYoIXRoaXMuX2xpZ2h0UGFzc2VzKG1hcFgsIG1hcFkpICYmIGkgPCByYWRpdXMpIHtcblx0XHRcdFx0XHRibG9ja2VkID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLl9jYXN0VmlzaWJpbGl0eShzdGFydFgsIHN0YXJ0WSwgaSArIDEsIHZpc1Nsb3BlU3RhcnQsIHNsb3BlU3RhcnQsIHJhZGl1cywgeHgsIHh5LCB5eCwgeXksIGNhbGxiYWNrKTtcblx0XHRcdFx0XHRuZXdTdGFydCA9IHNsb3BlRW5kO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL0tlZXAgbmFycm93aW5nIGlmIHNjYW5uaW5nIGFjcm9zcyBhIGJsb2NrXG5cdFx0XHRcdGlmKCF0aGlzLl9saWdodFBhc3NlcyhtYXBYLCBtYXBZKSkge1xuXHRcdFx0XHRcdG5ld1N0YXJ0ID0gc2xvcGVFbmQ7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0XHQvL0Jsb2NrIGhhcyBlbmRlZFxuXHRcdFx0XHRibG9ja2VkID0gZmFsc2U7XG5cdFx0XHRcdHZpc1Nsb3BlU3RhcnQgPSBuZXdTdGFydDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoYmxvY2tlZCkgeyBicmVhazsgfVxuXHR9XG59XG4vKipcbiAqIEBuYW1lc3BhY2UgQ29sb3Igb3BlcmF0aW9uc1xuICovXG5ST1QuQ29sb3IgPSB7XG5cdGZyb21TdHJpbmc6IGZ1bmN0aW9uKHN0cikge1xuXHRcdHZhciBjYWNoZWQsIHI7XG5cdFx0aWYgKHN0ciBpbiB0aGlzLl9jYWNoZSkge1xuXHRcdFx0Y2FjaGVkID0gdGhpcy5fY2FjaGVbc3RyXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHN0ci5jaGFyQXQoMCkgPT0gXCIjXCIpIHsgLyogaGV4IHJnYiAqL1xuXG5cdFx0XHRcdHZhciB2YWx1ZXMgPSBzdHIubWF0Y2goL1swLTlhLWZdL2dpKS5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4gcGFyc2VJbnQoeCwgMTYpOyB9KTtcblx0XHRcdFx0aWYgKHZhbHVlcy5sZW5ndGggPT0gMykge1xuXHRcdFx0XHRcdGNhY2hlZCA9IHZhbHVlcy5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geCoxNzsgfSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdFx0XHRcdHZhbHVlc1tpKzFdICs9IDE2KnZhbHVlc1tpXTtcblx0XHRcdFx0XHRcdHZhbHVlcy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhY2hlZCA9IHZhbHVlcztcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2UgaWYgKHIgPSBzdHIubWF0Y2goL3JnYlxcKChbMC05LCBdKylcXCkvaSkpIHsgLyogZGVjaW1hbCByZ2IgKi9cblx0XHRcdFx0Y2FjaGVkID0gclsxXS5zcGxpdCgvXFxzKixcXHMqLykubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHBhcnNlSW50KHgpOyB9KTtcblx0XHRcdH0gZWxzZSB7IC8qIGh0bWwgbmFtZSAqL1xuXHRcdFx0XHRjYWNoZWQgPSBbMCwgMCwgMF07XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2NhY2hlW3N0cl0gPSBjYWNoZWQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhY2hlZC5zbGljZSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgdHdvIG9yIG1vcmUgY29sb3JzXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0YWRkOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMikge1xuXHRcdHZhciByZXN1bHQgPSBjb2xvcjEuc2xpY2UoKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0Zm9yICh2YXIgaj0xO2o8YXJndW1lbnRzLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0cmVzdWx0W2ldICs9IGFyZ3VtZW50c1tqXVtpXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQWRkIHR3byBvciBtb3JlIGNvbG9ycywgTU9ESUZJRVMgRklSU1QgQVJHVU1FTlRcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRhZGRfOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMikge1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqPTE7ajxhcmd1bWVudHMubGVuZ3RoO2orKykge1xuXHRcdFx0XHRjb2xvcjFbaV0gKz0gYXJndW1lbnRzW2pdW2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY29sb3IxO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNdWx0aXBseSAobWl4KSB0d28gb3IgbW9yZSBjb2xvcnNcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRtdWx0aXBseTogZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIpIHtcblx0XHR2YXIgcmVzdWx0ID0gY29sb3IxLnNsaWNlKCk7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MTtqPGFyZ3VtZW50cy5sZW5ndGg7aisrKSB7XG5cdFx0XHRcdHJlc3VsdFtpXSAqPSBhcmd1bWVudHNbal1baV0gLyAyNTU7XG5cdFx0XHR9XG5cdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE11bHRpcGx5IChtaXgpIHR3byBvciBtb3JlIGNvbG9ycywgTU9ESUZJRVMgRklSU1QgQVJHVU1FTlRcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IxXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRtdWx0aXBseV86IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdGZvciAodmFyIGo9MTtqPGFyZ3VtZW50cy5sZW5ndGg7aisrKSB7XG5cdFx0XHRcdGNvbG9yMVtpXSAqPSBhcmd1bWVudHNbal1baV0gLyAyNTU7XG5cdFx0XHR9XG5cdFx0XHRjb2xvcjFbaV0gPSBNYXRoLnJvdW5kKGNvbG9yMVtpXSk7XG5cdFx0fVxuXHRcdHJldHVybiBjb2xvcjE7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEludGVycG9sYXRlIChibGVuZCkgdHdvIGNvbG9ycyB3aXRoIGEgZ2l2ZW4gZmFjdG9yXG5cdCAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yMVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjJcblx0ICogQHBhcmFtIHtmbG9hdH0gW2ZhY3Rvcj0wLjVdIDAuLjFcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0aW50ZXJwb2xhdGU6IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyLCBmYWN0b3IpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHsgZmFjdG9yID0gMC41OyB9XG5cdFx0dmFyIHJlc3VsdCA9IGNvbG9yMS5zbGljZSgpO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSArIGZhY3RvciooY29sb3IyW2ldLWNvbG9yMVtpXSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbnRlcnBvbGF0ZSAoYmxlbmQpIHR3byBjb2xvcnMgd2l0aCBhIGdpdmVuIGZhY3RvciBpbiBIU0wgbW9kZVxuXHQgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvcjFcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3IyXG5cdCAqIEBwYXJhbSB7ZmxvYXR9IFtmYWN0b3I9MC41XSAwLi4xXG5cdCAqIEByZXR1cm5zIHtudW1iZXJbXX1cblx0ICovXG5cdGludGVycG9sYXRlSFNMOiBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMiwgZmFjdG9yKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7IGZhY3RvciA9IDAuNTsgfVxuXHRcdHZhciBoc2wxID0gdGhpcy5yZ2IyaHNsKGNvbG9yMSk7XG5cdFx0dmFyIGhzbDIgPSB0aGlzLnJnYjJoc2woY29sb3IyKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0aHNsMVtpXSArPSBmYWN0b3IqKGhzbDJbaV0taHNsMVtpXSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmhzbDJyZ2IoaHNsMSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG5ldyByYW5kb20gY29sb3IgYmFzZWQgb24gdGhpcyBvbmVcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3Jcblx0ICogQHBhcmFtIHtudW1iZXJbXX0gZGlmZiBTZXQgb2Ygc3RhbmRhcmQgZGV2aWF0aW9uc1xuXHQgKiBAcmV0dXJucyB7bnVtYmVyW119XG5cdCAqL1xuXHRyYW5kb21pemU6IGZ1bmN0aW9uKGNvbG9yLCBkaWZmKSB7XG5cdFx0aWYgKCEoZGlmZiBpbnN0YW5jZW9mIEFycmF5KSkgeyBkaWZmID0gUk9ULlJORy5nZXROb3JtYWwoMCwgZGlmZik7IH1cblx0XHR2YXIgcmVzdWx0ID0gY29sb3Iuc2xpY2UoKTtcblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykge1xuXHRcdFx0cmVzdWx0W2ldICs9IChkaWZmIGluc3RhbmNlb2YgQXJyYXkgPyBNYXRoLnJvdW5kKFJPVC5STkcuZ2V0Tm9ybWFsKDAsIGRpZmZbaV0pKSA6IGRpZmYpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiBSR0IgY29sb3IgdmFsdWUgdG8gSFNMLiBFeHBlY3RzIDAuLjI1NSBpbnB1dHMsIHByb2R1Y2VzIDAuLjEgb3V0cHV0cy5cblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3Jcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0cmdiMmhzbDogZnVuY3Rpb24oY29sb3IpIHtcblx0XHR2YXIgciA9IGNvbG9yWzBdLzI1NTtcblx0XHR2YXIgZyA9IGNvbG9yWzFdLzI1NTtcblx0XHR2YXIgYiA9IGNvbG9yWzJdLzI1NTtcblxuXHRcdHZhciBtYXggPSBNYXRoLm1heChyLCBnLCBiKSwgbWluID0gTWF0aC5taW4ociwgZywgYik7XG5cdFx0dmFyIGgsIHMsIGwgPSAobWF4ICsgbWluKSAvIDI7XG5cblx0XHRpZiAobWF4ID09IG1pbikge1xuXHRcdFx0aCA9IHMgPSAwOyAvLyBhY2hyb21hdGljXG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBkID0gbWF4IC0gbWluO1xuXHRcdFx0cyA9IChsID4gMC41ID8gZCAvICgyIC0gbWF4IC0gbWluKSA6IGQgLyAobWF4ICsgbWluKSk7XG5cdFx0XHRzd2l0Y2gobWF4KSB7XG5cdFx0XHRcdGNhc2UgcjogaCA9IChnIC0gYikgLyBkICsgKGcgPCBiID8gNiA6IDApOyBicmVhaztcblx0XHRcdFx0Y2FzZSBnOiBoID0gKGIgLSByKSAvIGQgKyAyOyBicmVhaztcblx0XHRcdFx0Y2FzZSBiOiBoID0gKHIgLSBnKSAvIGQgKyA0OyBicmVhaztcblx0XHRcdH1cblx0XHRcdGggLz0gNjtcblx0XHR9XG5cblx0XHRyZXR1cm4gW2gsIHMsIGxdO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiBIU0wgY29sb3IgdmFsdWUgdG8gUkdCLiBFeHBlY3RzIDAuLjEgaW5wdXRzLCBwcm9kdWNlcyAwLi4yNTUgb3V0cHV0cy5cblx0ICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3Jcblx0ICogQHJldHVybnMge251bWJlcltdfVxuXHQgKi9cblx0aHNsMnJnYjogZnVuY3Rpb24oY29sb3IpIHtcblx0XHR2YXIgbCA9IGNvbG9yWzJdO1xuXG5cdFx0aWYgKGNvbG9yWzFdID09IDApIHtcblx0XHRcdGwgPSBNYXRoLnJvdW5kKGwqMjU1KTtcblx0XHRcdHJldHVybiBbbCwgbCwgbF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZ1bmN0aW9uIGh1ZTJyZ2IocCwgcSwgdCkge1xuXHRcdFx0XHRpZiAodCA8IDApIHQgKz0gMTtcblx0XHRcdFx0aWYgKHQgPiAxKSB0IC09IDE7XG5cdFx0XHRcdGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcblx0XHRcdFx0aWYgKHQgPCAxLzIpIHJldHVybiBxO1xuXHRcdFx0XHRpZiAodCA8IDIvMykgcmV0dXJuIHAgKyAocSAtIHApICogKDIvMyAtIHQpICogNjtcblx0XHRcdFx0cmV0dXJuIHA7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzID0gY29sb3JbMV07XG5cdFx0XHR2YXIgcSA9IChsIDwgMC41ID8gbCAqICgxICsgcykgOiBsICsgcyAtIGwgKiBzKTtcblx0XHRcdHZhciBwID0gMiAqIGwgLSBxO1xuXHRcdFx0dmFyIHIgPSBodWUycmdiKHAsIHEsIGNvbG9yWzBdICsgMS8zKTtcblx0XHRcdHZhciBnID0gaHVlMnJnYihwLCBxLCBjb2xvclswXSk7XG5cdFx0XHR2YXIgYiA9IGh1ZTJyZ2IocCwgcSwgY29sb3JbMF0gLSAxLzMpO1xuXHRcdFx0cmV0dXJuIFtNYXRoLnJvdW5kKHIqMjU1KSwgTWF0aC5yb3VuZChnKjI1NSksIE1hdGgucm91bmQoYioyNTUpXTtcblx0XHR9XG5cdH0sXG5cblx0dG9SR0I6IGZ1bmN0aW9uKGNvbG9yKSB7XG5cdFx0cmV0dXJuIFwicmdiKFwiICsgdGhpcy5fY2xhbXAoY29sb3JbMF0pICsgXCIsXCIgKyB0aGlzLl9jbGFtcChjb2xvclsxXSkgKyBcIixcIiArIHRoaXMuX2NsYW1wKGNvbG9yWzJdKSArIFwiKVwiO1xuXHR9LFxuXG5cdHRvSGV4OiBmdW5jdGlvbihjb2xvcikge1xuXHRcdHZhciBwYXJ0cyA9IFtdO1xuXHRcdGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG5cdFx0XHRwYXJ0cy5wdXNoKHRoaXMuX2NsYW1wKGNvbG9yW2ldKS50b1N0cmluZygxNikubHBhZChcIjBcIiwgMikpO1xuXHRcdH1cblx0XHRyZXR1cm4gXCIjXCIgKyBwYXJ0cy5qb2luKFwiXCIpO1xuXHR9LFxuXG5cdF9jbGFtcDogZnVuY3Rpb24obnVtKSB7XG5cdFx0aWYgKG51bSA8IDApIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAobnVtID4gMjU1KSB7XG5cdFx0XHRyZXR1cm4gMjU1O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVtO1xuXHRcdH1cblx0fSxcblxuXHRfY2FjaGU6IHtcblx0XHRcImJsYWNrXCI6IFswLDAsMF0sXG5cdFx0XCJuYXZ5XCI6IFswLDAsMTI4XSxcblx0XHRcImRhcmtibHVlXCI6IFswLDAsMTM5XSxcblx0XHRcIm1lZGl1bWJsdWVcIjogWzAsMCwyMDVdLFxuXHRcdFwiYmx1ZVwiOiBbMCwwLDI1NV0sXG5cdFx0XCJkYXJrZ3JlZW5cIjogWzAsMTAwLDBdLFxuXHRcdFwiZ3JlZW5cIjogWzAsMTI4LDBdLFxuXHRcdFwidGVhbFwiOiBbMCwxMjgsMTI4XSxcblx0XHRcImRhcmtjeWFuXCI6IFswLDEzOSwxMzldLFxuXHRcdFwiZGVlcHNreWJsdWVcIjogWzAsMTkxLDI1NV0sXG5cdFx0XCJkYXJrdHVycXVvaXNlXCI6IFswLDIwNiwyMDldLFxuXHRcdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsMjUwLDE1NF0sXG5cdFx0XCJsaW1lXCI6IFswLDI1NSwwXSxcblx0XHRcInNwcmluZ2dyZWVuXCI6IFswLDI1NSwxMjddLFxuXHRcdFwiYXF1YVwiOiBbMCwyNTUsMjU1XSxcblx0XHRcImN5YW5cIjogWzAsMjU1LDI1NV0sXG5cdFx0XCJtaWRuaWdodGJsdWVcIjogWzI1LDI1LDExMl0sXG5cdFx0XCJkb2RnZXJibHVlXCI6IFszMCwxNDQsMjU1XSxcblx0XHRcImZvcmVzdGdyZWVuXCI6IFszNCwxMzksMzRdLFxuXHRcdFwic2VhZ3JlZW5cIjogWzQ2LDEzOSw4N10sXG5cdFx0XCJkYXJrc2xhdGVncmF5XCI6IFs0Nyw3OSw3OV0sXG5cdFx0XCJkYXJrc2xhdGVncmV5XCI6IFs0Nyw3OSw3OV0sXG5cdFx0XCJsaW1lZ3JlZW5cIjogWzUwLDIwNSw1MF0sXG5cdFx0XCJtZWRpdW1zZWFncmVlblwiOiBbNjAsMTc5LDExM10sXG5cdFx0XCJ0dXJxdW9pc2VcIjogWzY0LDIyNCwyMDhdLFxuXHRcdFwicm95YWxibHVlXCI6IFs2NSwxMDUsMjI1XSxcblx0XHRcInN0ZWVsYmx1ZVwiOiBbNzAsMTMwLDE4MF0sXG5cdFx0XCJkYXJrc2xhdGVibHVlXCI6IFs3Miw2MSwxMzldLFxuXHRcdFwibWVkaXVtdHVycXVvaXNlXCI6IFs3MiwyMDksMjA0XSxcblx0XHRcImluZGlnb1wiOiBbNzUsMCwxMzBdLFxuXHRcdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LDEwNyw0N10sXG5cdFx0XCJjYWRldGJsdWVcIjogWzk1LDE1OCwxNjBdLFxuXHRcdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwxNDksMjM3XSxcblx0XHRcIm1lZGl1bWFxdWFtYXJpbmVcIjogWzEwMiwyMDUsMTcwXSxcblx0XHRcImRpbWdyYXlcIjogWzEwNSwxMDUsMTA1XSxcblx0XHRcImRpbWdyZXlcIjogWzEwNSwxMDUsMTA1XSxcblx0XHRcInNsYXRlYmx1ZVwiOiBbMTA2LDkwLDIwNV0sXG5cdFx0XCJvbGl2ZWRyYWJcIjogWzEwNywxNDIsMzVdLFxuXHRcdFwic2xhdGVncmF5XCI6IFsxMTIsMTI4LDE0NF0sXG5cdFx0XCJzbGF0ZWdyZXlcIjogWzExMiwxMjgsMTQ0XSxcblx0XHRcImxpZ2h0c2xhdGVncmF5XCI6IFsxMTksMTM2LDE1M10sXG5cdFx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LDEzNiwxNTNdLFxuXHRcdFwibWVkaXVtc2xhdGVibHVlXCI6IFsxMjMsMTA0LDIzOF0sXG5cdFx0XCJsYXduZ3JlZW5cIjogWzEyNCwyNTIsMF0sXG5cdFx0XCJjaGFydHJldXNlXCI6IFsxMjcsMjU1LDBdLFxuXHRcdFwiYXF1YW1hcmluZVwiOiBbMTI3LDI1NSwyMTJdLFxuXHRcdFwibWFyb29uXCI6IFsxMjgsMCwwXSxcblx0XHRcInB1cnBsZVwiOiBbMTI4LDAsMTI4XSxcblx0XHRcIm9saXZlXCI6IFsxMjgsMTI4LDBdLFxuXHRcdFwiZ3JheVwiOiBbMTI4LDEyOCwxMjhdLFxuXHRcdFwiZ3JleVwiOiBbMTI4LDEyOCwxMjhdLFxuXHRcdFwic2t5Ymx1ZVwiOiBbMTM1LDIwNiwyMzVdLFxuXHRcdFwibGlnaHRza3libHVlXCI6IFsxMzUsMjA2LDI1MF0sXG5cdFx0XCJibHVldmlvbGV0XCI6IFsxMzgsNDMsMjI2XSxcblx0XHRcImRhcmtyZWRcIjogWzEzOSwwLDBdLFxuXHRcdFwiZGFya21hZ2VudGFcIjogWzEzOSwwLDEzOV0sXG5cdFx0XCJzYWRkbGVicm93blwiOiBbMTM5LDY5LDE5XSxcblx0XHRcImRhcmtzZWFncmVlblwiOiBbMTQzLDE4OCwxNDNdLFxuXHRcdFwibGlnaHRncmVlblwiOiBbMTQ0LDIzOCwxNDRdLFxuXHRcdFwibWVkaXVtcHVycGxlXCI6IFsxNDcsMTEyLDIxNl0sXG5cdFx0XCJkYXJrdmlvbGV0XCI6IFsxNDgsMCwyMTFdLFxuXHRcdFwicGFsZWdyZWVuXCI6IFsxNTIsMjUxLDE1Ml0sXG5cdFx0XCJkYXJrb3JjaGlkXCI6IFsxNTMsNTAsMjA0XSxcblx0XHRcInllbGxvd2dyZWVuXCI6IFsxNTQsMjA1LDUwXSxcblx0XHRcInNpZW5uYVwiOiBbMTYwLDgyLDQ1XSxcblx0XHRcImJyb3duXCI6IFsxNjUsNDIsNDJdLFxuXHRcdFwiZGFya2dyYXlcIjogWzE2OSwxNjksMTY5XSxcblx0XHRcImRhcmtncmV5XCI6IFsxNjksMTY5LDE2OV0sXG5cdFx0XCJsaWdodGJsdWVcIjogWzE3MywyMTYsMjMwXSxcblx0XHRcImdyZWVueWVsbG93XCI6IFsxNzMsMjU1LDQ3XSxcblx0XHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwyMzgsMjM4XSxcblx0XHRcImxpZ2h0c3RlZWxibHVlXCI6IFsxNzYsMTk2LDIyMl0sXG5cdFx0XCJwb3dkZXJibHVlXCI6IFsxNzYsMjI0LDIzMF0sXG5cdFx0XCJmaXJlYnJpY2tcIjogWzE3OCwzNCwzNF0sXG5cdFx0XCJkYXJrZ29sZGVucm9kXCI6IFsxODQsMTM0LDExXSxcblx0XHRcIm1lZGl1bW9yY2hpZFwiOiBbMTg2LDg1LDIxMV0sXG5cdFx0XCJyb3N5YnJvd25cIjogWzE4OCwxNDMsMTQzXSxcblx0XHRcImRhcmtraGFraVwiOiBbMTg5LDE4MywxMDddLFxuXHRcdFwic2lsdmVyXCI6IFsxOTIsMTkyLDE5Ml0sXG5cdFx0XCJtZWRpdW12aW9sZXRyZWRcIjogWzE5OSwyMSwxMzNdLFxuXHRcdFwiaW5kaWFucmVkXCI6IFsyMDUsOTIsOTJdLFxuXHRcdFwicGVydVwiOiBbMjA1LDEzMyw2M10sXG5cdFx0XCJjaG9jb2xhdGVcIjogWzIxMCwxMDUsMzBdLFxuXHRcdFwidGFuXCI6IFsyMTAsMTgwLDE0MF0sXG5cdFx0XCJsaWdodGdyYXlcIjogWzIxMSwyMTEsMjExXSxcblx0XHRcImxpZ2h0Z3JleVwiOiBbMjExLDIxMSwyMTFdLFxuXHRcdFwicGFsZXZpb2xldHJlZFwiOiBbMjE2LDExMiwxNDddLFxuXHRcdFwidGhpc3RsZVwiOiBbMjE2LDE5MSwyMTZdLFxuXHRcdFwib3JjaGlkXCI6IFsyMTgsMTEyLDIxNF0sXG5cdFx0XCJnb2xkZW5yb2RcIjogWzIxOCwxNjUsMzJdLFxuXHRcdFwiY3JpbXNvblwiOiBbMjIwLDIwLDYwXSxcblx0XHRcImdhaW5zYm9yb1wiOiBbMjIwLDIyMCwyMjBdLFxuXHRcdFwicGx1bVwiOiBbMjIxLDE2MCwyMjFdLFxuXHRcdFwiYnVybHl3b29kXCI6IFsyMjIsMTg0LDEzNV0sXG5cdFx0XCJsaWdodGN5YW5cIjogWzIyNCwyNTUsMjU1XSxcblx0XHRcImxhdmVuZGVyXCI6IFsyMzAsMjMwLDI1MF0sXG5cdFx0XCJkYXJrc2FsbW9uXCI6IFsyMzMsMTUwLDEyMl0sXG5cdFx0XCJ2aW9sZXRcIjogWzIzOCwxMzAsMjM4XSxcblx0XHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwyMzIsMTcwXSxcblx0XHRcImxpZ2h0Y29yYWxcIjogWzI0MCwxMjgsMTI4XSxcblx0XHRcImtoYWtpXCI6IFsyNDAsMjMwLDE0MF0sXG5cdFx0XCJhbGljZWJsdWVcIjogWzI0MCwyNDgsMjU1XSxcblx0XHRcImhvbmV5ZGV3XCI6IFsyNDAsMjU1LDI0MF0sXG5cdFx0XCJhenVyZVwiOiBbMjQwLDI1NSwyNTVdLFxuXHRcdFwic2FuZHlicm93blwiOiBbMjQ0LDE2NCw5Nl0sXG5cdFx0XCJ3aGVhdFwiOiBbMjQ1LDIyMiwxNzldLFxuXHRcdFwiYmVpZ2VcIjogWzI0NSwyNDUsMjIwXSxcblx0XHRcIndoaXRlc21va2VcIjogWzI0NSwyNDUsMjQ1XSxcblx0XHRcIm1pbnRjcmVhbVwiOiBbMjQ1LDI1NSwyNTBdLFxuXHRcdFwiZ2hvc3R3aGl0ZVwiOiBbMjQ4LDI0OCwyNTVdLFxuXHRcdFwic2FsbW9uXCI6IFsyNTAsMTI4LDExNF0sXG5cdFx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwyMzUsMjE1XSxcblx0XHRcImxpbmVuXCI6IFsyNTAsMjQwLDIzMF0sXG5cdFx0XCJsaWdodGdvbGRlbnJvZHllbGxvd1wiOiBbMjUwLDI1MCwyMTBdLFxuXHRcdFwib2xkbGFjZVwiOiBbMjUzLDI0NSwyMzBdLFxuXHRcdFwicmVkXCI6IFsyNTUsMCwwXSxcblx0XHRcImZ1Y2hzaWFcIjogWzI1NSwwLDI1NV0sXG5cdFx0XCJtYWdlbnRhXCI6IFsyNTUsMCwyNTVdLFxuXHRcdFwiZGVlcHBpbmtcIjogWzI1NSwyMCwxNDddLFxuXHRcdFwib3JhbmdlcmVkXCI6IFsyNTUsNjksMF0sXG5cdFx0XCJ0b21hdG9cIjogWzI1NSw5OSw3MV0sXG5cdFx0XCJob3RwaW5rXCI6IFsyNTUsMTA1LDE4MF0sXG5cdFx0XCJjb3JhbFwiOiBbMjU1LDEyNyw4MF0sXG5cdFx0XCJkYXJrb3JhbmdlXCI6IFsyNTUsMTQwLDBdLFxuXHRcdFwibGlnaHRzYWxtb25cIjogWzI1NSwxNjAsMTIyXSxcblx0XHRcIm9yYW5nZVwiOiBbMjU1LDE2NSwwXSxcblx0XHRcImxpZ2h0cGlua1wiOiBbMjU1LDE4MiwxOTNdLFxuXHRcdFwicGlua1wiOiBbMjU1LDE5MiwyMDNdLFxuXHRcdFwiZ29sZFwiOiBbMjU1LDIxNSwwXSxcblx0XHRcInBlYWNocHVmZlwiOiBbMjU1LDIxOCwxODVdLFxuXHRcdFwibmF2YWpvd2hpdGVcIjogWzI1NSwyMjIsMTczXSxcblx0XHRcIm1vY2Nhc2luXCI6IFsyNTUsMjI4LDE4MV0sXG5cdFx0XCJiaXNxdWVcIjogWzI1NSwyMjgsMTk2XSxcblx0XHRcIm1pc3R5cm9zZVwiOiBbMjU1LDIyOCwyMjVdLFxuXHRcdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwyMzUsMjA1XSxcblx0XHRcInBhcGF5YXdoaXBcIjogWzI1NSwyMzksMjEzXSxcblx0XHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwyNDAsMjQ1XSxcblx0XHRcInNlYXNoZWxsXCI6IFsyNTUsMjQ1LDIzOF0sXG5cdFx0XCJjb3Juc2lsa1wiOiBbMjU1LDI0OCwyMjBdLFxuXHRcdFwibGVtb25jaGlmZm9uXCI6IFsyNTUsMjUwLDIwNV0sXG5cdFx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LDI1MCwyNDBdLFxuXHRcdFwic25vd1wiOiBbMjU1LDI1MCwyNTBdLFxuXHRcdFwieWVsbG93XCI6IFsyNTUsMjU1LDBdLFxuXHRcdFwibGlnaHR5ZWxsb3dcIjogWzI1NSwyNTUsMjI0XSxcblx0XHRcIml2b3J5XCI6IFsyNTUsMjU1LDI0MF0sXG5cdFx0XCJ3aGl0ZVwiOiBbMjU1LDI1NSwyNTVdXG5cdH1cbn1cbi8qKlxuICogQGNsYXNzIExpZ2h0aW5nIGNvbXB1dGF0aW9uLCBiYXNlZCBvbiBhIHRyYWRpdGlvbmFsIEZPViBmb3IgbXVsdGlwbGUgbGlnaHQgc291cmNlcyBhbmQgbXVsdGlwbGUgcGFzc2VzLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gcmVmbGVjdGl2aXR5Q2FsbGJhY2sgQ2FsbGJhY2sgdG8gcmV0cmlldmUgY2VsbCByZWZsZWN0aXZpdHkgKDAuLjEpXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMucGFzc2VzPTFdIE51bWJlciBvZiBwYXNzZXMuIDEgZXF1YWxzIHRvIHNpbXBsZSBGT1Ygb2YgYWxsIGxpZ2h0IHNvdXJjZXMsID4xIG1lYW5zIGEgKmhpZ2hseSBzaW1wbGlmaWVkKiByYWRpb3NpdHktbGlrZSBhbGdvcml0aG0uXG4gKiBAcGFyYW0ge2ludH0gW29wdGlvbnMuZW1pc3Npb25UaHJlc2hvbGQ9MTAwXSBDZWxscyB3aXRoIGVtaXNzaXZpdHkgPiB0aHJlc2hvbGQgd2lsbCBiZSB0cmVhdGVkIGFzIGxpZ2h0IHNvdXJjZSBpbiB0aGUgbmV4dCBwYXNzLlxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnJhbmdlPTEwXSBNYXggbGlnaHQgcmFuZ2VcbiAqL1xuUk9ULkxpZ2h0aW5nID0gZnVuY3Rpb24ocmVmbGVjdGl2aXR5Q2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0dGhpcy5fcmVmbGVjdGl2aXR5Q2FsbGJhY2sgPSByZWZsZWN0aXZpdHlDYWxsYmFjaztcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHRwYXNzZXM6IDEsXG5cdFx0ZW1pc3Npb25UaHJlc2hvbGQ6IDEwMCxcblx0XHRyYW5nZTogMTBcblx0fTtcblx0dGhpcy5fZm92ID0gbnVsbDtcblxuXHR0aGlzLl9saWdodHMgPSB7fTtcblx0dGhpcy5fcmVmbGVjdGl2aXR5Q2FjaGUgPSB7fTtcblx0dGhpcy5fZm92Q2FjaGUgPSB7fTtcblxuXHR0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG59XG5cbi8qKlxuICogQWRqdXN0IG9wdGlvbnMgYXQgcnVudGltZVxuICogQHNlZSBST1QuTGlnaHRpbmdcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXHRmb3IgKHZhciBwIGluIG9wdGlvbnMpIHsgdGhpcy5fb3B0aW9uc1twXSA9IG9wdGlvbnNbcF07IH1cblx0aWYgKG9wdGlvbnMucmFuZ2UpIHsgdGhpcy5yZXNldCgpOyB9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aGUgdXNlZCBGaWVsZC1PZi1WaWV3IGFsZ29cbiAqIEBwYXJhbSB7Uk9ULkZPVn0gZm92XG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuc2V0Rk9WID0gZnVuY3Rpb24oZm92KSB7XG5cdHRoaXMuX2ZvdiA9IGZvdjtcblx0dGhpcy5fZm92Q2FjaGUgPSB7fTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IChvciByZW1vdmUpIGEgbGlnaHQgc291cmNlXG4gKiBAcGFyYW0ge2ludH0geFxuICogQHBhcmFtIHtpbnR9IHlcbiAqIEBwYXJhbSB7bnVsbCB8fCBzdHJpbmcgfHwgbnVtYmVyWzNdfSBjb2xvclxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLnNldExpZ2h0ID0gZnVuY3Rpb24oeCwgeSwgY29sb3IpIHtcblx0dmFyIGtleSA9IHgrXCIsXCIreTtcblxuXHRpZiAoY29sb3IpIHtcblx0XHR0aGlzLl9saWdodHNba2V5XSA9ICh0eXBlb2YoY29sb3IpID09IFwic3RyaW5nXCIgPyBST1QuQ29sb3IuZnJvbVN0cmluZyhjb2xvcikgOiBjb2xvcik7XG5cdH0gZWxzZSB7XG5cdFx0ZGVsZXRlIHRoaXMuX2xpZ2h0c1trZXldO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFJlc2V0IHRoZSBwcmUtY29tcHV0ZWQgdG9wb2xvZ3kgdmFsdWVzLiBDYWxsIHdoZW5ldmVyIHRoZSB1bmRlcmx5aW5nIG1hcCBjaGFuZ2VzIGl0cyBsaWdodC1wYXNzYWJpbGl0eS5cbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9yZWZsZWN0aXZpdHlDYWNoZSA9IHt9O1xuXHR0aGlzLl9mb3ZDYWNoZSA9IHt9O1xuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGxpZ2h0aW5nXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaWdodGluZ0NhbGxiYWNrIFdpbGwgYmUgY2FsbGVkIHdpdGggKHgsIHksIGNvbG9yKSBmb3IgZXZlcnkgbGl0IGNlbGxcbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5jb21wdXRlID0gZnVuY3Rpb24obGlnaHRpbmdDYWxsYmFjaykge1xuXHR2YXIgZG9uZUNlbGxzID0ge307XG5cdHZhciBlbWl0dGluZ0NlbGxzID0ge307XG5cdHZhciBsaXRDZWxscyA9IHt9O1xuXG5cdGZvciAodmFyIGtleSBpbiB0aGlzLl9saWdodHMpIHsgLyogcHJlcGFyZSBlbWl0dGVycyBmb3IgZmlyc3QgcGFzcyAqL1xuXHRcdHZhciBsaWdodCA9IHRoaXMuX2xpZ2h0c1trZXldO1xuXHRcdGlmICghKGtleSBpbiBlbWl0dGluZ0NlbGxzKSkgeyBlbWl0dGluZ0NlbGxzW2tleV0gPSBbMCwgMCwgMF07IH1cblxuXHRcdFJPVC5Db2xvci5hZGRfKGVtaXR0aW5nQ2VsbHNba2V5XSwgbGlnaHQpO1xuXHR9XG5cblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fb3B0aW9ucy5wYXNzZXM7aSsrKSB7IC8qIG1haW4gbG9vcCAqL1xuXHRcdHRoaXMuX2VtaXRMaWdodChlbWl0dGluZ0NlbGxzLCBsaXRDZWxscywgZG9uZUNlbGxzKTtcblx0XHRpZiAoaSsxID09IHRoaXMuX29wdGlvbnMucGFzc2VzKSB7IGNvbnRpbnVlOyB9IC8qIG5vdCBmb3IgdGhlIGxhc3QgcGFzcyAqL1xuXHRcdGVtaXR0aW5nQ2VsbHMgPSB0aGlzLl9jb21wdXRlRW1pdHRlcnMobGl0Q2VsbHMsIGRvbmVDZWxscyk7XG5cdH1cblxuXHRmb3IgKHZhciBsaXRLZXkgaW4gbGl0Q2VsbHMpIHsgLyogbGV0IHRoZSB1c2VyIGtub3cgd2hhdCBhbmQgaG93IGlzIGxpdCAqL1xuXHRcdHZhciBwYXJ0cyA9IGxpdEtleS5zcGxpdChcIixcIik7XG5cdFx0dmFyIHggPSBwYXJzZUludChwYXJ0c1swXSk7XG5cdFx0dmFyIHkgPSBwYXJzZUludChwYXJ0c1sxXSk7XG5cdFx0bGlnaHRpbmdDYWxsYmFjayh4LCB5LCBsaXRDZWxsc1tsaXRLZXldKTtcblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENvbXB1dGUgb25lIGl0ZXJhdGlvbiBmcm9tIGFsbCBlbWl0dGluZyBjZWxsc1xuICogQHBhcmFtIHtvYmplY3R9IGVtaXR0aW5nQ2VsbHMgVGhlc2UgZW1pdCBsaWdodFxuICogQHBhcmFtIHtvYmplY3R9IGxpdENlbGxzIEFkZCBwcm9qZWN0ZWQgbGlnaHQgdG8gdGhlc2VcbiAqIEBwYXJhbSB7b2JqZWN0fSBkb25lQ2VsbHMgVGhlc2UgYWxyZWFkeSBlbWl0dGVkLCBmb3JiaWQgdGhlbSBmcm9tIGZ1cnRoZXIgY2FsY3VsYXRpb25zXG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuX2VtaXRMaWdodCA9IGZ1bmN0aW9uKGVtaXR0aW5nQ2VsbHMsIGxpdENlbGxzLCBkb25lQ2VsbHMpIHtcblx0Zm9yICh2YXIga2V5IGluIGVtaXR0aW5nQ2VsbHMpIHtcblx0XHR2YXIgcGFydHMgPSBrZXkuc3BsaXQoXCIsXCIpO1xuXHRcdHZhciB4ID0gcGFyc2VJbnQocGFydHNbMF0pO1xuXHRcdHZhciB5ID0gcGFyc2VJbnQocGFydHNbMV0pO1xuXHRcdHRoaXMuX2VtaXRMaWdodEZyb21DZWxsKHgsIHksIGVtaXR0aW5nQ2VsbHNba2V5XSwgbGl0Q2VsbHMpO1xuXHRcdGRvbmVDZWxsc1trZXldID0gMTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBQcmVwYXJlIGEgbGlzdCBvZiBlbWl0dGVycyBmb3IgbmV4dCBwYXNzXG4gKiBAcGFyYW0ge29iamVjdH0gbGl0Q2VsbHNcbiAqIEBwYXJhbSB7b2JqZWN0fSBkb25lQ2VsbHNcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cblJPVC5MaWdodGluZy5wcm90b3R5cGUuX2NvbXB1dGVFbWl0dGVycyA9IGZ1bmN0aW9uKGxpdENlbGxzLCBkb25lQ2VsbHMpIHtcblx0dmFyIHJlc3VsdCA9IHt9O1xuXG5cdGZvciAodmFyIGtleSBpbiBsaXRDZWxscykge1xuXHRcdGlmIChrZXkgaW4gZG9uZUNlbGxzKSB7IGNvbnRpbnVlOyB9IC8qIGFscmVhZHkgZW1pdHRlZCAqL1xuXG5cdFx0dmFyIGNvbG9yID0gbGl0Q2VsbHNba2V5XTtcblxuXHRcdGlmIChrZXkgaW4gdGhpcy5fcmVmbGVjdGl2aXR5Q2FjaGUpIHtcblx0XHRcdHZhciByZWZsZWN0aXZpdHkgPSB0aGlzLl9yZWZsZWN0aXZpdHlDYWNoZVtrZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBrZXkuc3BsaXQoXCIsXCIpO1xuXHRcdFx0dmFyIHggPSBwYXJzZUludChwYXJ0c1swXSk7XG5cdFx0XHR2YXIgeSA9IHBhcnNlSW50KHBhcnRzWzFdKTtcblx0XHRcdHZhciByZWZsZWN0aXZpdHkgPSB0aGlzLl9yZWZsZWN0aXZpdHlDYWxsYmFjayh4LCB5KTtcblx0XHRcdHRoaXMuX3JlZmxlY3Rpdml0eUNhY2hlW2tleV0gPSByZWZsZWN0aXZpdHk7XG5cdFx0fVxuXG5cdFx0aWYgKHJlZmxlY3Rpdml0eSA9PSAwKSB7IGNvbnRpbnVlOyB9IC8qIHdpbGwgbm90IHJlZmxlY3QgYXQgYWxsICovXG5cblx0XHQvKiBjb21wdXRlIGVtaXNzaW9uIGNvbG9yICovXG5cdFx0dmFyIGVtaXNzaW9uID0gW107XG5cdFx0dmFyIGludGVuc2l0eSA9IDA7XG5cdFx0Zm9yICh2YXIgaT0wO2k8MztpKyspIHtcblx0XHRcdHZhciBwYXJ0ID0gTWF0aC5yb3VuZChjb2xvcltpXSpyZWZsZWN0aXZpdHkpO1xuXHRcdFx0ZW1pc3Npb25baV0gPSBwYXJ0O1xuXHRcdFx0aW50ZW5zaXR5ICs9IHBhcnQ7XG5cdFx0fVxuXHRcdGlmIChpbnRlbnNpdHkgPiB0aGlzLl9vcHRpb25zLmVtaXNzaW9uVGhyZXNob2xkKSB7IHJlc3VsdFtrZXldID0gZW1pc3Npb247IH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29tcHV0ZSBvbmUgaXRlcmF0aW9uIGZyb20gb25lIGNlbGxcbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHBhcmFtIHtudW1iZXJbXX0gY29sb3JcbiAqIEBwYXJhbSB7b2JqZWN0fSBsaXRDZWxscyBDZWxsIGRhdGEgdG8gYnkgdXBkYXRlZFxuICovXG5ST1QuTGlnaHRpbmcucHJvdG90eXBlLl9lbWl0TGlnaHRGcm9tQ2VsbCA9IGZ1bmN0aW9uKHgsIHksIGNvbG9yLCBsaXRDZWxscykge1xuXHR2YXIga2V5ID0geCtcIixcIit5O1xuXHRpZiAoa2V5IGluIHRoaXMuX2ZvdkNhY2hlKSB7XG5cdFx0dmFyIGZvdiA9IHRoaXMuX2ZvdkNhY2hlW2tleV07XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGZvdiA9IHRoaXMuX3VwZGF0ZUZPVih4LCB5KTtcblx0fVxuXG5cdGZvciAodmFyIGZvdktleSBpbiBmb3YpIHtcblx0XHR2YXIgZm9ybUZhY3RvciA9IGZvdltmb3ZLZXldO1xuXG5cdFx0aWYgKGZvdktleSBpbiBsaXRDZWxscykgeyAvKiBhbHJlYWR5IGxpdCAqL1xuXHRcdFx0dmFyIHJlc3VsdCA9IGxpdENlbGxzW2ZvdktleV07XG5cdFx0fSBlbHNlIHsgLyogbmV3bHkgbGl0ICovXG5cdFx0XHR2YXIgcmVzdWx0ID0gWzAsIDAsIDBdO1xuXHRcdFx0bGl0Q2VsbHNbZm92S2V5XSA9IHJlc3VsdDtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpPTA7aTwzO2krKykgeyByZXN1bHRbaV0gKz0gTWF0aC5yb3VuZChjb2xvcltpXSpmb3JtRmFjdG9yKTsgfSAvKiBhZGQgbGlnaHQgY29sb3IgKi9cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENvbXB1dGUgRk9WIChcImZvcm0gZmFjdG9yXCIpIGZvciBhIHBvdGVudGlhbCBsaWdodCBzb3VyY2UgYXQgW3gseV1cbiAqIEBwYXJhbSB7aW50fSB4XG4gKiBAcGFyYW0ge2ludH0geVxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuUk9ULkxpZ2h0aW5nLnByb3RvdHlwZS5fdXBkYXRlRk9WID0gZnVuY3Rpb24oeCwgeSkge1xuXHR2YXIga2V5MSA9IHgrXCIsXCIreTtcblx0dmFyIGNhY2hlID0ge307XG5cdHRoaXMuX2ZvdkNhY2hlW2tleTFdID0gY2FjaGU7XG5cdHZhciByYW5nZSA9IHRoaXMuX29wdGlvbnMucmFuZ2U7XG5cdHZhciBjYiA9IGZ1bmN0aW9uKHgsIHksIHIsIHZpcykge1xuXHRcdHZhciBrZXkyID0geCtcIixcIit5O1xuXHRcdHZhciBmb3JtRmFjdG9yID0gdmlzICogKDEtci9yYW5nZSk7XG5cdFx0aWYgKGZvcm1GYWN0b3IgPT0gMCkgeyByZXR1cm47IH1cblx0XHRjYWNoZVtrZXkyXSA9IGZvcm1GYWN0b3I7XG5cdH1cblx0dGhpcy5fZm92LmNvbXB1dGUoeCwgeSwgcmFuZ2UsIGNiLmJpbmQodGhpcykpO1xuXG5cdHJldHVybiBjYWNoZTtcbn1cbi8qKlxuICogQGNsYXNzIEFic3RyYWN0IHBhdGhmaW5kZXJcbiAqIEBwYXJhbSB7aW50fSB0b1ggVGFyZ2V0IFggY29vcmRcbiAqIEBwYXJhbSB7aW50fSB0b1kgVGFyZ2V0IFkgY29vcmRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHBhc3NhYmxlQ2FsbGJhY2sgQ2FsbGJhY2sgdG8gZGV0ZXJtaW5lIG1hcCBwYXNzYWJpbGl0eVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtpbnR9IFtvcHRpb25zLnRvcG9sb2d5PThdXG4gKi9cblJPVC5QYXRoID0gZnVuY3Rpb24odG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0dGhpcy5fdG9YID0gdG9YO1xuXHR0aGlzLl90b1kgPSB0b1k7XG5cdHRoaXMuX2Zyb21YID0gbnVsbDtcblx0dGhpcy5fZnJvbVkgPSBudWxsO1xuXHR0aGlzLl9wYXNzYWJsZUNhbGxiYWNrID0gcGFzc2FibGVDYWxsYmFjaztcblx0dGhpcy5fb3B0aW9ucyA9IHtcblx0XHR0b3BvbG9neTogOFxuXHR9XG5cdGZvciAodmFyIHAgaW4gb3B0aW9ucykgeyB0aGlzLl9vcHRpb25zW3BdID0gb3B0aW9uc1twXTsgfVxuXG5cdHRoaXMuX2RpcnMgPSBST1QuRElSU1t0aGlzLl9vcHRpb25zLnRvcG9sb2d5XTtcblx0aWYgKHRoaXMuX29wdGlvbnMudG9wb2xvZ3kgPT0gOCkgeyAvKiByZW9yZGVyIGRpcnMgZm9yIG1vcmUgYWVzdGhldGljIHJlc3VsdCAodmVydGljYWwvaG9yaXpvbnRhbCBmaXJzdCkgKi9cblx0XHR0aGlzLl9kaXJzID0gW1xuXHRcdFx0dGhpcy5fZGlyc1swXSxcblx0XHRcdHRoaXMuX2RpcnNbMl0sXG5cdFx0XHR0aGlzLl9kaXJzWzRdLFxuXHRcdFx0dGhpcy5fZGlyc1s2XSxcblx0XHRcdHRoaXMuX2RpcnNbMV0sXG5cdFx0XHR0aGlzLl9kaXJzWzNdLFxuXHRcdFx0dGhpcy5fZGlyc1s1XSxcblx0XHRcdHRoaXMuX2RpcnNbN11cblx0XHRdXG5cdH1cbn1cblxuLyoqXG4gKiBDb21wdXRlIGEgcGF0aCBmcm9tIGEgZ2l2ZW4gcG9pbnRcbiAqIEBwYXJhbSB7aW50fSBmcm9tWFxuICogQHBhcmFtIHtpbnR9IGZyb21ZXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBXaWxsIGJlIGNhbGxlZCBmb3IgZXZlcnkgcGF0aCBpdGVtIHdpdGggYXJndW1lbnRzIFwieFwiIGFuZCBcInlcIlxuICovXG5ST1QuUGF0aC5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKGZyb21YLCBmcm9tWSwgY2FsbGJhY2spIHtcbn1cblxuUk9ULlBhdGgucHJvdG90eXBlLl9nZXROZWlnaGJvcnMgPSBmdW5jdGlvbihjeCwgY3kpIHtcblx0dmFyIHJlc3VsdCA9IFtdO1xuXHRmb3IgKHZhciBpPTA7aTx0aGlzLl9kaXJzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgZGlyID0gdGhpcy5fZGlyc1tpXTtcblx0XHR2YXIgeCA9IGN4ICsgZGlyWzBdO1xuXHRcdHZhciB5ID0gY3kgKyBkaXJbMV07XG5cdFx0XG5cdFx0aWYgKCF0aGlzLl9wYXNzYWJsZUNhbGxiYWNrKHgsIHkpKSB7IGNvbnRpbnVlOyB9XG5cdFx0cmVzdWx0LnB1c2goW3gsIHldKTtcblx0fVxuXHRcblx0cmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogQGNsYXNzIFNpbXBsaWZpZWQgRGlqa3N0cmEncyBhbGdvcml0aG06IGFsbCBlZGdlcyBoYXZlIGEgdmFsdWUgb2YgMVxuICogQGF1Z21lbnRzIFJPVC5QYXRoXG4gKiBAc2VlIFJPVC5QYXRoXG4gKi9cblJPVC5QYXRoLkRpamtzdHJhID0gZnVuY3Rpb24odG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0Uk9ULlBhdGguY2FsbCh0aGlzLCB0b1gsIHRvWSwgcGFzc2FibGVDYWxsYmFjaywgb3B0aW9ucyk7XG5cblx0dGhpcy5fY29tcHV0ZWQgPSB7fTtcblx0dGhpcy5fdG9kbyA9IFtdO1xuXHR0aGlzLl9hZGQodG9YLCB0b1ksIG51bGwpO1xufVxuUk9ULlBhdGguRGlqa3N0cmEuZXh0ZW5kKFJPVC5QYXRoKTtcblxuLyoqXG4gKiBDb21wdXRlIGEgcGF0aCBmcm9tIGEgZ2l2ZW4gcG9pbnRcbiAqIEBzZWUgUk9ULlBhdGgjY29tcHV0ZVxuICovXG5ST1QuUGF0aC5EaWprc3RyYS5wcm90b3R5cGUuY29tcHV0ZSA9IGZ1bmN0aW9uKGZyb21YLCBmcm9tWSwgY2FsbGJhY2spIHtcblx0dmFyIGtleSA9IGZyb21YK1wiLFwiK2Zyb21ZO1xuXHRpZiAoIShrZXkgaW4gdGhpcy5fY29tcHV0ZWQpKSB7IHRoaXMuX2NvbXB1dGUoZnJvbVgsIGZyb21ZKTsgfVxuXHRpZiAoIShrZXkgaW4gdGhpcy5fY29tcHV0ZWQpKSB7IHJldHVybjsgfVxuXHRcblx0dmFyIGl0ZW0gPSB0aGlzLl9jb21wdXRlZFtrZXldO1xuXHR3aGlsZSAoaXRlbSkge1xuXHRcdGNhbGxiYWNrKGl0ZW0ueCwgaXRlbS55KTtcblx0XHRpdGVtID0gaXRlbS5wcmV2O1xuXHR9XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhIG5vbi1jYWNoZWQgdmFsdWVcbiAqL1xuUk9ULlBhdGguRGlqa3N0cmEucHJvdG90eXBlLl9jb21wdXRlID0gZnVuY3Rpb24oZnJvbVgsIGZyb21ZKSB7XG5cdHdoaWxlICh0aGlzLl90b2RvLmxlbmd0aCkge1xuXHRcdHZhciBpdGVtID0gdGhpcy5fdG9kby5zaGlmdCgpO1xuXHRcdGlmIChpdGVtLnggPT0gZnJvbVggJiYgaXRlbS55ID09IGZyb21ZKSB7IHJldHVybjsgfVxuXHRcdFxuXHRcdHZhciBuZWlnaGJvcnMgPSB0aGlzLl9nZXROZWlnaGJvcnMoaXRlbS54LCBpdGVtLnkpO1xuXHRcdFxuXHRcdGZvciAodmFyIGk9MDtpPG5laWdoYm9ycy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgbmVpZ2hib3IgPSBuZWlnaGJvcnNbaV07XG5cdFx0XHR2YXIgeCA9IG5laWdoYm9yWzBdO1xuXHRcdFx0dmFyIHkgPSBuZWlnaGJvclsxXTtcblx0XHRcdHZhciBpZCA9IHgrXCIsXCIreTtcblx0XHRcdGlmIChpZCBpbiB0aGlzLl9jb21wdXRlZCkgeyBjb250aW51ZTsgfSAvKiBhbHJlYWR5IGRvbmUgKi9cdFxuXHRcdFx0dGhpcy5fYWRkKHgsIHksIGl0ZW0pOyBcblx0XHR9XG5cdH1cbn1cblxuUk9ULlBhdGguRGlqa3N0cmEucHJvdG90eXBlLl9hZGQgPSBmdW5jdGlvbih4LCB5LCBwcmV2KSB7XG5cdHZhciBvYmogPSB7XG5cdFx0eDogeCxcblx0XHR5OiB5LFxuXHRcdHByZXY6IHByZXZcblx0fVxuXHR0aGlzLl9jb21wdXRlZFt4K1wiLFwiK3ldID0gb2JqO1xuXHR0aGlzLl90b2RvLnB1c2gob2JqKTtcbn1cbi8qKlxuICogQGNsYXNzIFNpbXBsaWZpZWQgQSogYWxnb3JpdGhtOiBhbGwgZWRnZXMgaGF2ZSBhIHZhbHVlIG9mIDFcbiAqIEBhdWdtZW50cyBST1QuUGF0aFxuICogQHNlZSBST1QuUGF0aFxuICovXG5ST1QuUGF0aC5BU3RhciA9IGZ1bmN0aW9uKHRvWCwgdG9ZLCBwYXNzYWJsZUNhbGxiYWNrLCBvcHRpb25zKSB7XG5cdFJPVC5QYXRoLmNhbGwodGhpcywgdG9YLCB0b1ksIHBhc3NhYmxlQ2FsbGJhY2ssIG9wdGlvbnMpO1xuXG5cdHRoaXMuX3RvZG8gPSBbXTtcblx0dGhpcy5fZG9uZSA9IHt9O1xuXHR0aGlzLl9mcm9tWCA9IG51bGw7XG5cdHRoaXMuX2Zyb21ZID0gbnVsbDtcbn1cblJPVC5QYXRoLkFTdGFyLmV4dGVuZChST1QuUGF0aCk7XG5cbi8qKlxuICogQ29tcHV0ZSBhIHBhdGggZnJvbSBhIGdpdmVuIHBvaW50XG4gKiBAc2VlIFJPVC5QYXRoI2NvbXB1dGVcbiAqL1xuUk9ULlBhdGguQVN0YXIucHJvdG90eXBlLmNvbXB1dGUgPSBmdW5jdGlvbihmcm9tWCwgZnJvbVksIGNhbGxiYWNrKSB7XG5cdHRoaXMuX3RvZG8gPSBbXTtcblx0dGhpcy5fZG9uZSA9IHt9O1xuXHR0aGlzLl9mcm9tWCA9IGZyb21YO1xuXHR0aGlzLl9mcm9tWSA9IGZyb21ZO1xuXHR0aGlzLl9hZGQodGhpcy5fdG9YLCB0aGlzLl90b1ksIG51bGwpO1xuXG5cdHdoaWxlICh0aGlzLl90b2RvLmxlbmd0aCkge1xuXHRcdHZhciBpdGVtID0gdGhpcy5fdG9kby5zaGlmdCgpO1xuXHRcdGlmIChpdGVtLnggPT0gZnJvbVggJiYgaXRlbS55ID09IGZyb21ZKSB7IGJyZWFrOyB9XG5cdFx0dmFyIG5laWdoYm9ycyA9IHRoaXMuX2dldE5laWdoYm9ycyhpdGVtLngsIGl0ZW0ueSk7XG5cblx0XHRmb3IgKHZhciBpPTA7aTxuZWlnaGJvcnMubGVuZ3RoO2krKykge1xuXHRcdFx0dmFyIG5laWdoYm9yID0gbmVpZ2hib3JzW2ldO1xuXHRcdFx0dmFyIHggPSBuZWlnaGJvclswXTtcblx0XHRcdHZhciB5ID0gbmVpZ2hib3JbMV07XG5cdFx0XHR2YXIgaWQgPSB4K1wiLFwiK3k7XG5cdFx0XHRpZiAoaWQgaW4gdGhpcy5fZG9uZSkgeyBjb250aW51ZTsgfVxuXHRcdFx0dGhpcy5fYWRkKHgsIHksIGl0ZW0pOyBcblx0XHR9XG5cdH1cblx0XG5cdHZhciBpdGVtID0gdGhpcy5fZG9uZVtmcm9tWCtcIixcIitmcm9tWV07XG5cdGlmICghaXRlbSkgeyByZXR1cm47IH1cblx0XG5cdHdoaWxlIChpdGVtKSB7XG5cdFx0Y2FsbGJhY2soaXRlbS54LCBpdGVtLnkpO1xuXHRcdGl0ZW0gPSBpdGVtLnByZXY7XG5cdH1cbn1cblxuUk9ULlBhdGguQVN0YXIucHJvdG90eXBlLl9hZGQgPSBmdW5jdGlvbih4LCB5LCBwcmV2KSB7XG5cdHZhciBvYmogPSB7XG5cdFx0eDogeCxcblx0XHR5OiB5LFxuXHRcdHByZXY6IHByZXYsXG5cdFx0ZzogKHByZXYgPyBwcmV2LmcrMSA6IDApLFxuXHRcdGg6IHRoaXMuX2Rpc3RhbmNlKHgsIHkpXG5cdH1cblx0dGhpcy5fZG9uZVt4K1wiLFwiK3ldID0gb2JqO1xuXHRcblx0LyogaW5zZXJ0IGludG8gcHJpb3JpdHkgcXVldWUgKi9cblx0XG5cdHZhciBmID0gb2JqLmcgKyBvYmouaDtcblx0Zm9yICh2YXIgaT0wO2k8dGhpcy5fdG9kby5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSB0aGlzLl90b2RvW2ldO1xuXHRcdGlmIChmIDwgaXRlbS5nICsgaXRlbS5oKSB7XG5cdFx0XHR0aGlzLl90b2RvLnNwbGljZShpLCAwLCBvYmopO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRcblx0dGhpcy5fdG9kby5wdXNoKG9iaik7XG59XG5cblJPVC5QYXRoLkFTdGFyLnByb3RvdHlwZS5fZGlzdGFuY2UgPSBmdW5jdGlvbih4LCB5KSB7XG5cdHN3aXRjaCAodGhpcy5fb3B0aW9ucy50b3BvbG9neSkge1xuXHRcdGNhc2UgNDpcblx0XHRcdHJldHVybiAoTWF0aC5hYnMoeC10aGlzLl9mcm9tWCkgKyBNYXRoLmFicyh5LXRoaXMuX2Zyb21ZKSk7XG5cdFx0YnJlYWs7XG5cblx0XHRjYXNlIDY6XG5cdFx0XHR2YXIgZHggPSBNYXRoLmFicyh4IC0gdGhpcy5fZnJvbVgpO1xuXHRcdFx0dmFyIGR5ID0gTWF0aC5hYnMoeSAtIHRoaXMuX2Zyb21ZKTtcblx0XHRcdHJldHVybiBkeSArIE1hdGgubWF4KDAsIChkeC1keSkvMik7XG5cdFx0YnJlYWs7XG5cblx0XHRjYXNlIDg6IFxuXHRcdFx0cmV0dXJuIE1hdGgubWF4KE1hdGguYWJzKHgtdGhpcy5fZnJvbVgpLCBNYXRoLmFicyh5LXRoaXMuX2Zyb21ZKSk7XG5cdFx0YnJlYWs7XG5cdH1cbn1cbi8qKlxuICogQG5hbWVzcGFjZSBFeHBvcnQgdG8gTm9kZS5qcyBtb2R1bGVcbiAqL1xuZXhwb3J0cy5ST1QgPSBST1Q7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiV2I4R2VqXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJST1QgPSByZXF1aXJlKCdyb3QtanMnKS5ST1RcblxuV0FMTCA9IDFcbkZMT09SID0gMFxuXG5pZENvdW50ZXIgPSAwXG5cbmNsYXNzIExldmVsXG4gIGNvbnN0cnVjdG9yOiAoeyBAd2lkdGgsIEBoZWlnaHQgfSkgLT5cbiAgICBAaWQgPSBpZENvdW50ZXIrK1xuICAgIEBmcmVlVGlsZXMgPSBbXVxuICAgIEB0aWxlcyA9IGNyZWF0ZTJEQXJyYXkoQHdpZHRoLCBAaGVpZ2h0KVxuXG4gIGdlbmVyYXRlOiAtPlxuICAgIHRpbGVzID0gY3JlYXRlMkRBcnJheShAd2lkdGgsIEBoZWlnaHQpXG4gICAgY2FsbGJhY2sgPSAoeCwgeSwgd2FsbCkgPT5cbiAgICAgIHRpbGVzW3hdW3ldID89IFtdXG4gICAgICB0aWxlc1t4XVt5XSA9IHdhbGwgI2lmIHdhbGwgdGhlbiBXQUxMIGVsc2UgRkxPT1JcbiAgICAgIEBmcmVlVGlsZXMucHVzaChbeCx5XSkgdW5sZXNzIHdhbGwgPT0gMVxuICAgIEBtYXAgPSBuZXcgUk9ULk1hcC5EaWdnZXIoQHdpZHRoLCBAaGVpZ2h0KVxuICAgIEBtYXAuY3JlYXRlKGNhbGxiYWNrKVxuICAgIEBwcm9jZXNzR2VuZXJhdGVkTWFwKEBtYXAsIHRpbGVzKVxuXG4gIHByb2Nlc3NHZW5lcmF0ZWRNYXA6IChtYXAsIHJhd1RpbGVzKSAtPlxuICAgIGZvciB4IGluIFswLi5Ad2lkdGhdXG4gICAgICBmb3IgeSBpbiBbMC4uQGhlaWdodF1cbiAgICAgICAgQHRpbGVzW3hdW3ldID0gQGNyZWF0ZVRpbGUocmF3VGlsZXMsIHgsIHkpXG5cbiAgY3JlYXRlVGlsZTogKHJhd1RpbGVzLCB4LCB5KSAtPlxuICAgIGlmIHJhd1RpbGVzW3hdW3ldID09IDEgIyBXYWxsXG4gICAgICBAY3JlYXRlV2FsbFRpbGUocmF3VGlsZXMsIHgsIHkpXG4gICAgZWxzZVxuICAgICAgQGNyZWF0ZUZsb29yVGlsZShyYXdUaWxlcywgeCwgeSlcblxuICBjcmVhdGVGbG9vclRpbGU6IChyYXdUaWxlcywgeCwgeSkgLT5cbiAgICB0aWxlID0gbmV3IFRpbGUoJ2Zsb29yJylcbiAgICB0aWxlLm5vcnRoID0gaWYgQGhhc05vcnRoV2FsbChyYXdUaWxlcyx4LHkpIHRoZW4gJ3dhbGwnIGVsc2UgJ25vbmUnXG4gICAgdGlsZS5lYXN0ID0gaWYgQGhhc0Vhc3RXYWxsKHJhd1RpbGVzLHgseSkgdGhlbiAnd2FsbCcgZWxzZSAnbm9uZSdcbiAgICB0aWxlLnNvdXRoID0gaWYgQGhhc1NvdXRoV2FsbChyYXdUaWxlcyx4LHkpIHRoZW4gJ3dhbGwnIGVsc2UgJ25vbmUnXG4gICAgdGlsZS53ZXN0ID0gaWYgQGhhc1dlc3RXYWxsKHJhd1RpbGVzLHgseSkgdGhlbiAnd2FsbCcgZWxzZSAnbm9uZSdcbiAgICB0aWxlXG5cbiAgY3JlYXRlV2FsbFRpbGU6IChyYXdUaWxlcywgeCwgeSkgLT5cbiAgICBpZiBAYWRqYWNlbnRGbG9vclRpbGUocmF3VGlsZXMsIHgsIHkpXG4gICAgICB0aWxlID0gbmV3IFRpbGUoJ3dhbGwnKVxuICAgICAgdGlsZS5ub3J0aCA9IGlmIEB3YWxsQ29udGludWVzTm9ydGgocmF3VGlsZXMseCx5KSB0aGVuICd3YWxsJyBlbHNlICdub25lJ1xuICAgICAgdGlsZS5lYXN0ID0gaWYgQHdhbGxDb250aW51ZXNFYXN0KHJhd1RpbGVzLHgseSkgdGhlbiAnd2FsbCcgZWxzZSAnbm9uZSdcbiAgICAgIHRpbGUuc291dGggPSBpZiBAd2FsbENvbnRpbnVlc1NvdXRoKHJhd1RpbGVzLHgseSkgdGhlbiAnd2FsbCcgZWxzZSAnbm9uZSdcbiAgICAgIHRpbGUud2VzdCA9IGlmIEB3YWxsQ29udGludWVzV2VzdChyYXdUaWxlcyx4LHkpIHRoZW4gJ3dhbGwnIGVsc2UgJ25vbmUnXG4gICAgICB0aWxlXG5cbiAgYWRqYWNlbnRGbG9vclRpbGU6IChyYXdUaWxlcywgeCwgeSkgLT5cbiAgICBAYWRqYWNlbnRUaWxlcyhyYXdUaWxlcywgeCwgeSkuaW5kZXhPZihGTE9PUikgIT0gLTFcblxuICBhZGphY2VudFRpbGVzOiAocmF3VGlsZXMsIHgsIHkpIC0+XG4gICAgcmVzdWx0ID0gW11cbiAgICByZXN1bHQucHVzaChyYXdUaWxlc1t4XVt5LTFdKSBpZiB5ID4gMFxuICAgIHJlc3VsdC5wdXNoKHJhd1RpbGVzW3grMV1beS0xXSkgaWYgeSA+IDAgJiYgeCA8IEB3aWR0aFxuICAgIHJlc3VsdC5wdXNoKHJhd1RpbGVzW3grMV1beV0pIGlmIHggPCBAd2lkdGhcbiAgICByZXN1bHQucHVzaChyYXdUaWxlc1t4KzFdW3krMV0pIGlmIHggPCBAd2lkdGggJiYgeSA8IEBoZWlnaHRcbiAgICByZXN1bHQucHVzaChyYXdUaWxlc1t4XVt5KzFdKSBpZiB5IDwgQGhlaWdodFxuICAgIHJlc3VsdC5wdXNoKHJhd1RpbGVzW3gtMV1beSsxXSkgaWYgeCA+IDAgJiYgeSA8IEBoZWlnaHRcbiAgICByZXN1bHQucHVzaChyYXdUaWxlc1t4LTFdW3ldKSBpZiB4ID4gMFxuICAgIHJlc3VsdC5wdXNoKHJhd1RpbGVzW3gtMV1beS0xXSkgaWYgeCA+IDAgJiYgeSA+IDBcbiAgICByZXN1bHRcblxuICBoYXNOb3J0aFdhbGw6ICh0aWxlcywgeCwgeSkgLT5cbiAgICByZXR1cm4gdHJ1ZSBpZiB5ID09IDBcbiAgICB0aWxlc1t4XVt5LTFdID09IDFcblxuICBoYXNTb3V0aFdhbGw6ICh0aWxlcywgeCwgeSkgLT5cbiAgICByZXR1cm4gdHJ1ZSBpZiB5ID09IEBoZWlnaHRcbiAgICB0aWxlc1t4XVt5KzFdID09IDFcblxuICBoYXNXZXN0V2FsbDogKHRpbGVzLCB4LCB5KSAtPlxuICAgIHJldHVybiB0cnVlIGlmIHggPT0gMFxuICAgIHRpbGVzW3gtMV1beV0gPT0gMVxuXG4gIGhhc0Vhc3RXYWxsOiAodGlsZXMsIHgsIHkpIC0+XG4gICAgcmV0dXJuIHRydWUgaWYgeCA9PSBAd2lkdGhcbiAgICB0aWxlc1t4KzFdW3ldID09IDFcblxuICB3YWxsQ29udGludWVzTm9ydGg6ICh0aWxlcywgeCwgeSkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgeSA9PSAwXG4gICAgdGlsZXNbeF1beS0xXSA9PSAxICYmIEBhZGphY2VudEZsb29yVGlsZSh0aWxlcywgeCwgeS0xKVxuXG4gIHdhbGxDb250aW51ZXNTb3V0aDogKHRpbGVzLCB4LCB5KSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiB5ID09IEBoZWlnaHRcbiAgICB0aWxlc1t4XVt5KzFdID09IDEgJiYgQGFkamFjZW50Rmxvb3JUaWxlKHRpbGVzLCB4LCB5KzEpXG5cbiAgd2FsbENvbnRpbnVlc1dlc3Q6ICh0aWxlcywgeCwgeSkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgeCA9PSAwXG4gICAgdGlsZXNbeC0xXVt5XSA9PSAxICYmIEBhZGphY2VudEZsb29yVGlsZSh0aWxlcywgeC0xLCB5KVxuXG4gIHdhbGxDb250aW51ZXNFYXN0OiAodGlsZXMsIHgsIHkpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIHggPT0gQHdpZHRoXG4gICAgdGlsZXNbeCsxXVt5XSA9PSAxICYmIEBhZGphY2VudEZsb29yVGlsZSh0aWxlcywgeCsxLCB5KVxuXG5cbmNsYXNzIFRpbGVcbiAgY29uc3RydWN0b3I6IChAdHlwZSkgLT5cblxuY3JlYXRlMkRBcnJheSA9ICh3aWR0aCwgaGVpZ2h0KSAtPlxuICB0aWxlcyA9IFtdXG4gIGZvciBpIGluIFswLi53aWR0aF1cbiAgICB0aWxlc1tpXSA9IG5ldyBBcnJheShoZWlnaHQpXG4gIHRpbGVzXG5cbm1vZHVsZS5leHBvcnRzLkxldmVsID0gTGV2ZWxcbiIsImNsYXNzIFBsYXllclxuICBjb25zdHJ1Y3RvcjogKHsgQHgsIEB5IH0pLT5cblxuICBtb3ZlOiAoeyB4LCB5IH0pIC0+XG4gICAgQHggKz0geFxuICAgIEB5ICs9IHlcblxuICBvYnNlcnZlZE1hcHM6IHt9XG5cbm1vZHVsZS5leHBvcnRzLlBsYXllciA9IFBsYXllclxuIiwicGl4aSA9IHJlcXVpcmUgJ3BpeGkuanMnXG5ST1QgPSByZXF1aXJlKCdyb3QtanMnKS5ST1RcbkxldmVsID0gcmVxdWlyZSgnLi9MZXZlbCcpLkxldmVsXG5QbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpLlBsYXllclxuUHJvbWlzZSA9IHJlcXVpcmUoJ2VzNi1wcm9taXNlJykuUHJvbWlzZVxuRmxvb3JUZXh0dXJlcyA9IHJlcXVpcmUoJy4vdGlsZXMvZGF3bmxpa2UvRmxvb3InKS5GbG9vclRleHR1cmVzXG5XYWxsVGV4dHVyZXMgPSByZXF1aXJlKCcuL3RpbGVzL2Rhd25saWtlL1dhbGwnKS5XYWxsVGV4dHVyZXNcblxuY2xhc3MgR2FtZVxuICBzY2FsZTogbmV3IHBpeGkuUG9pbnQoMSwxKVxuXG4gIGNvbnN0cnVjdG9yOiAoeyBAc3RhZ2UsIEByZW5kZXJlciB9KSAtPlxuICAgIEBzY2hlZHVsZXIgPSBuZXcgUk9ULlNjaGVkdWxlci5TaW1wbGUoKVxuICAgIEBlbmdpbmUgPSBuZXcgUk9ULkVuZ2luZShAc2NoZWR1bGVyKVxuXG4gICAgQGxldmVsID0gbmV3IExldmVsKHdpZHRoOiA4MCwgaGVpZ2h0OiA0MClcbiAgICBAbGV2ZWwuZ2VuZXJhdGUoKVxuXG4gICAgQHRoaW5nc0hhdmVDaGFuZ2VkID0gdHJ1ZVxuICAgIEBydWxlc0VuZ2luZSA9IG5ldyBSdWxlc0VuZ2luZShAbGV2ZWwsID0+XG4gICAgICBAdGhpbmdzSGF2ZUNoYW5nZWQgPSB0cnVlXG4gICAgICBAdXBkYXRlTGF5ZXJzKClcbiAgICApXG5cbiAgICBmcmVlVGlsZSA9IEBsZXZlbC5mcmVlVGlsZXNbMF1cbiAgICBAcGxheWVyID0gbmV3IFBsYXllcih4OiBmcmVlVGlsZVswXSwgeTogZnJlZVRpbGVbMV0pXG5cbiAgICBAbGF5ZXJzID0ge1xuICAgICAgbGV2ZWw6IG5ldyBwaXhpLkRpc3BsYXlPYmplY3RDb250YWluZXIoKVxuICAgICAgZW50aXRpZXM6IG5ldyBwaXhpLkRpc3BsYXlPYmplY3RDb250YWluZXIoKVxuICAgIH1cbiAgICBAcm9vdERpc3BsYXlPYmplY3RDb250YWluZXIgPSBuZXcgcGl4aS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKClcbiAgICBAcm9vdERpc3BsYXlPYmplY3RDb250YWluZXIuYWRkQ2hpbGQoQGxheWVycy5sZXZlbClcbiAgICBAcm9vdERpc3BsYXlPYmplY3RDb250YWluZXIuYWRkQ2hpbGQoQGxheWVycy5lbnRpdGllcylcbiAgICBAcm9vdERpc3BsYXlPYmplY3RDb250YWluZXIuc2NhbGUgPSBAc2NhbGVcbiAgICBAc3RhZ2UuYWRkQ2hpbGQoQHJvb3REaXNwbGF5T2JqZWN0Q29udGFpbmVyKVxuXG4gIGxvYWQ6IC0+XG4gICAgQGxvYWRUZXh0dXJlcygpLnRoZW4gPT5cbiAgICAgIEBzY2hlZHVsZXIuYWRkIG5ldyBXYWl0Rm9yUGxheWVySW5wdXQoQHJ1bGVzRW5naW5lLCBAcGxheWVyKSwgdHJ1ZVxuICAgICAgQGVuZ2luZS5zdGFydCgpXG4gICAgICBAZHJhd0xldmVsKEBsZXZlbClcbiAgICAgIEBkcmF3Q3JlYXR1cmVzKClcbiAgICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcblxuICBsb2FkVGV4dHVyZXM6IC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEZsb29yVGV4dHVyZXMubG9hZCgpXG5cbiAgICAgIFdhbGxUZXh0dXJlcy5sb2FkKCdicmljay9saWdodCcpLnRoZW4oICh3YWxsVGV4dHVyZSkgPT5cbiAgICAgICAgQHdhbGxUZXh0dXJlID0gd2FsbFRleHR1cmVcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAsIHJlamVjdClcblxuICAgICAgQGZsb29yVGV4dHVyZU1hcCA9IEZsb29yVGV4dHVyZXMuZmxvb3JUeXBlcy5icmlja3MuZ3JleVxuICAgICAgaHVtYW5vaWRUZXh0dXJlID0gcGl4aS5UZXh0dXJlLmZyb21JbWFnZShcImltYWdlcy9kYXdubGlrZS9DaGFyYWN0ZXJzL0h1bWFub2lkMC5wbmdcIilcbiAgICAgIEBwbGF5ZXJUZXh0dXJlID0gbmV3IHBpeGkuVGV4dHVyZShcbiAgICAgICAgaHVtYW5vaWRUZXh0dXJlLFxuICAgICAgICBuZXcgcGl4aS5SZWN0YW5nbGUoMTYgKiAwLCAxNiAqIDcsIDE2LCAxNilcbiAgICAgIClcblxuICB1cGRhdGVMYXllcnM6IC0+XG4gICAgQGNsZWFyTGF5ZXJzKClcbiAgICBAZHJhd0NyZWF0dXJlcygpXG4gICAgQGRyYXdMZXZlbCgpXG5cbiAgY2xlYXJMYXllcnM6IC0+XG4gICAgZm9yIG5hbWUsIGxheWVyIG9mIEBsYXllcnNcbiAgICAgIGxheWVyLnJlbW92ZUNoaWxkcmVuKClcblxuICBkcmF3OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRoaW5nc0hhdmVDaGFuZ2VkXG4gICAgQHJlbmRlcmVyLnJlbmRlciBAc3RhZ2VcbiAgICBAdGhpbmdzSGF2ZUNoYW5nZWQgPSBmYWxzZVxuICAgIHJldHVyblxuXG4gIGZsb29yU3ByaXRlOiAoeCwgeSkgLT5cbiAgICB0aWxlID0gQGxldmVsLnRpbGVzW3hdW3ldXG4gICAgc3ByaXRlID0gbmV3IHBpeGkuU3ByaXRlKFxuICAgICAgQGZsb29yVGV4dHVyZU1hcFsgdGlsZS5ub3J0aCBdWyB0aWxlLmVhc3QgXVsgdGlsZS5zb3V0aCBdWyB0aWxlLndlc3QgXVxuICAgIClcblxuICAgIHNwcml0ZS54ID0geCAqIDE2XG4gICAgc3ByaXRlLnkgPSB5ICogMTZcbiAgICBzcHJpdGVcblxuICB3YWxsU3ByaXRlOiAoeCwgeSkgLT5cbiAgICB0aWxlID0gQGxldmVsLnRpbGVzW3hdW3ldXG4gICAgdGV4dHVyZU5hbWUgPSBcIiN7aWYgdGlsZS5ub3J0aCA9PSAnd2FsbCcgdGhlbiAnTicgZWxzZSAnXyd9I3tpZiB0aWxlLmVhc3QgaXMgXCJ3YWxsXCIgdGhlbiBcIkVcIiBlbHNlIFwiX1wifSN7aWYgdGlsZS5zb3V0aCBpcyBcIndhbGxcIiB0aGVuIFwiU1wiIGVsc2UgXCJfXCJ9I3tpZiB0aWxlLndlc3QgaXMgXCJ3YWxsXCIgdGhlbiBcIldcIiBlbHNlIFwiX1wifVwiXG4gICAgc3ByaXRlID0gbmV3IHBpeGkuU3ByaXRlKFxuICAgICAgQHdhbGxUZXh0dXJlW3RleHR1cmVOYW1lXVxuICAgIClcblxuICAgIHNwcml0ZS54ID0geCAqIDE2XG4gICAgc3ByaXRlLnkgPSB5ICogMTZcbiAgICBzcHJpdGVcblxuICBkcmF3VGlsZTogKHgsIHkpIC0+XG4gICAgc3dpdGNoIEBsZXZlbC50aWxlc1t4XVt5XT8udHlwZVxuICAgICAgd2hlbiAnZmxvb3InXG4gICAgICAgIEBsYXllcnMubGV2ZWwuYWRkQ2hpbGQgQGZsb29yU3ByaXRlKHgsIHkpXG4gICAgICB3aGVuICd3YWxsJ1xuICAgICAgICB3YWxsU3ByaXRlID0gQHdhbGxTcHJpdGUoeCwgeSlcbiAgICAgICAgQGxheWVycy5sZXZlbC5hZGRDaGlsZCB3YWxsU3ByaXRlIGlmIHdhbGxTcHJpdGU/XG5cbiAgZHJhd0xldmVsOiAobGV2ZWwpIC0+XG4gICAgZm92ID0gbmV3IFJPVC5GT1YuUHJlY2lzZVNoYWRvd2Nhc3RpbmcoKHgsIHkpID0+IEBydWxlc0VuZ2luZS5saWdodFBhc3Nlcyh4LCB5KSlcbiAgICBmb3YuY29tcHV0ZSggQHBsYXllci54LCBAcGxheWVyLnksIDE1LCAoeCwgeSwgciwgdmlzaWJpbGl0eSkgPT5cbiAgICAgIEBkcmF3VGlsZSh4LCB5KVxuICAgIClcbiAgICAjIGZvciB4IGluIFswLi5AbGV2ZWwud2lkdGhdXG4gICAgIyAgIGZvciB5IGluIFswLi5AbGV2ZWwuaGVpZ2h0XVxuICAgICMgICAgIEBkcmF3VGlsZSh4LCB5KVxuXG4gIGRyYXdDcmVhdHVyZXM6IC0+XG4gICAgQHBsYXllci5zcHJpdGUgPSBuZXcgcGl4aS5TcHJpdGUoQHBsYXllclRleHR1cmUpXG4gICAgQHBsYXllci5zcHJpdGUueCA9IDE2ICogQHBsYXllci54XG4gICAgQHBsYXllci5zcHJpdGUueSA9IDE2ICogQHBsYXllci55XG4gICAgQGxheWVycy5lbnRpdGllcy5hZGRDaGlsZChAcGxheWVyLnNwcml0ZSlcblxuY2xhc3MgUnVsZXNFbmdpbmVcbiAgY29uc3RydWN0b3I6IChAbGV2ZWwsIEB0aGluZ3NDaGFuZ2VkQ2FsbGJhY2spIC0+XG4gIHN0ZXA6ICh7IGFjdG9yLCBkaXJlY3Rpb24gfSkgLT5cbiAgICBtb3ZlbWVudERpZmYgPSBST1QuRElSU1s4XVtkaXJlY3Rpb25dXG4gICAgW3hEaWZmLCB5RGlmZl0gPSBtb3ZlbWVudERpZmZcbiAgICBbZGVzdFgsIGRlc3RZXSA9IFthY3Rvci54ICsgeERpZmYsIGFjdG9yLnkgKyB5RGlmZl1cbiAgICBkZXN0aW5hdGlvblRpbGUgPSBAbGV2ZWwudGlsZXNbZGVzdFhdW2Rlc3RZXVxuICAgIGlmIGRlc3RpbmF0aW9uVGlsZT8udHlwZSA9PSAnZmxvb3InXG4gICAgICBhY3Rvci54ID0gZGVzdFhcbiAgICAgIGFjdG9yLnkgPSBkZXN0WVxuICAgICAgQHRoaW5nc0NoYW5nZWRDYWxsYmFjaygpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcbiAgbGlnaHRQYXNzZXM6ICh4LCB5KSAtPlxuICAgIEBsZXZlbC50aWxlc1t4XT9beV0/LnR5cGUgPT0gJ2Zsb29yJ1xuXG5jbGFzcyBTY2hlZHVsYWJsZVxuICBhY3Q6IC0+IFByb21pc2UucmVzb2x2ZSgpXG5cbmNsYXNzIFdhaXRGb3JQbGF5ZXJJbnB1dCBleHRlbmRzIFNjaGVkdWxhYmxlXG4gIEtFWU1BUDoge1xuICAgICMgRGlyZWN0aW9uIGtleXMgLT4gZGlyZWN0aW9uIGNvbnN0YW50c1xuICAgIDM4OiAwXG4gICAgMzM6IDFcbiAgICAzOTogMlxuICAgIDM0OiAzXG4gICAgNDA6IDRcbiAgICAzNTogNVxuICAgIDM3OiA2XG4gICAgMzY6IDdcbiAgfVxuXG4gIGNvbnN0cnVjdG9yOiAoQHJ1bGVzRW5naW5lLCBAcGxheWVyKSAtPlxuXG4gIGFjdDogLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAga2V5ZG93bkhhbmRsZXIgPSAoZXZlbnQpID0+XG4gICAgICAgIGNvZGUgPSBldmVudC5rZXlDb2RlXG4gICAgICAgIHJldHVybiB1bmxlc3MgY29kZSBvZiBAS0VZTUFQXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgICBkaXJlY3Rpb24gPSBAS0VZTUFQW2NvZGVdXG4gICAgICAgIGlmIEBydWxlc0VuZ2luZS5zdGVwKCBhY3RvcjogQHBsYXllciwgZGlyZWN0aW9uOiBkaXJlY3Rpb24gKVxuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bkhhbmRsZXIpXG4gICAgICAgICAgcmVzb2x2ZSgpXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5ZG93bkhhbmRsZXIpXG5cbm1vZHVsZS5leHBvcnRzLkdhbWUgPSBHYW1lXG4iLCIjIFlvdSBjYW4gdXNlIGVpdGhlciBXZWJHTFJlbmRlcmVyIG9yIENhbnZhc1JlbmRlcmVyXG5waXhpID0gcmVxdWlyZShcInBpeGkuanNcIilcbkdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKS5HYW1lXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJET01Db250ZW50TG9hZGVkXCIsIC0+XG4gIHJlbmRlcmVyID0gbmV3IHBpeGkuV2ViR0xSZW5kZXJlcig4MCAqIDE2LCA0MCAqIDE2KVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIHJlbmRlcmVyLnZpZXdcbiAgc3RhZ2UgPSBuZXcgcGl4aS5TdGFnZVxuXG4gIGdhbWUgPSBuZXcgR2FtZShcbiAgICByZW5kZXJlcjogcmVuZGVyZXIsXG4gICAgc3RhZ2U6IHN0YWdlXG4gIClcblxuICBnYW1lLmxvYWQoKS50aGVuIC0+XG4gICAgZHJhd0xvb3AgPSAtPlxuICAgICAgZ2FtZS5kcmF3KClcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3TG9vcClcbiAgICBkcmF3TG9vcCgpXG4iLCJwaXhpID0gcmVxdWlyZSAncGl4aS5qcydcblxudGV4dHVyZUF0ID0gKG9yaWdpblgsIG9yaWdpblksIHgsIHksIHcsIGgsIGJhc2VUZXh0dXJlKSAtPlxuICBuZXcgcGl4aS5UZXh0dXJlKGJhc2VUZXh0dXJlLFxuICAgIG5ldyBwaXhpLlJlY3RhbmdsZShvcmlnaW5YICsgeCAqIHcsIG9yaWdpblkgKyB5ICogaCwgdywgaClcbiAgKVxuXG5mbG9vck1hcCA9IChvcmlnaW5YLCBvcmlnaW5ZLCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQsIGJhc2VUZXh0dXJlKSAtPlxuICAjIFNob3J0aGFuZFxuICBvWCA9IG9yaWdpblhcbiAgb1kgPSBvcmlnaW5ZXG4gIHR3ID0gdGlsZVdpZHRoXG4gIHRoID0gdGlsZUhlaWdodFxuXG4gIHtcbiAgICB3YWxsOiB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE4tLS1cbiAgICAgIHdhbGw6IHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE5FLS1cbiAgICAgICAgd2FsbDogeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE5FUy1cbiAgICAgICAgICB3YWxsOiB0ZXh0dXJlQXQob1gsIG9ZLCA1LCAwLCB0dywgdGgsIGJhc2VUZXh0dXJlKSAjIE5FU1dcbiAgICAgICAgICBub25lOiB0ZXh0dXJlQXQob1gsIG9ZLCA2LCAxLCB0dywgdGgsIGJhc2VUZXh0dXJlKSAjIE5FU19cbiAgICAgICAgfVxuICAgICAgICBub25lOiB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTkVfLVxuICAgICAgICAgIHdhbGw6IHRleHR1cmVBdChvWCwgb1ksIDMsIDAsIHR3LCB0aCwgYmFzZVRleHR1cmUpICMgTkVfV1xuICAgICAgICAgIG5vbmU6IHRleHR1cmVBdChvWCwgb1ksIDIsIDAsIHR3LCB0aCwgYmFzZVRleHR1cmUpICMgTkVfX1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub25lOiB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBOXy0tXG4gICAgICAgIHdhbGw6IHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBOX1MtXG4gICAgICAgICAgd2FsbDogdGV4dHVyZUF0KG9YLCBvWSwgNCwgMSwgdHcsIHRoLCBiYXNlVGV4dHVyZSkgIyBOX1NXXG4gICAgICAgICAgbm9uZTogdGV4dHVyZUF0KG9YLCBvWSwgNSwgMSwgdHcsIHRoLCBiYXNlVGV4dHVyZSkgIyBOX1NfXG4gICAgICAgIH1cbiAgICAgICAgbm9uZTogeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE5fXy1cbiAgICAgICAgICB3YWxsOiB0ZXh0dXJlQXQob1gsIG9ZLCAwLCAwLCB0dywgdGgsIGJhc2VUZXh0dXJlKSAjIE5fX1dcbiAgICAgICAgICBub25lOiB0ZXh0dXJlQXQob1gsIG9ZLCAxLCAwLCB0dywgdGgsIGJhc2VUZXh0dXJlKSAjIE5fX19cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBub25lOiB7XG4gICAgICB3YWxsOiB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBfRS0tXG4gICAgICAgIHdhbGw6IHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBfRVMtXG4gICAgICAgICAgd2FsbDogdGV4dHVyZUF0KG9YLCBvWSwgMywgMiwgdHcsIHRoLCBiYXNlVGV4dHVyZSkgIyBfRVNXXG4gICAgICAgICAgbm9uZTogdGV4dHVyZUF0KG9YLCBvWSwgMiwgMiwgdHcsIHRoLCBiYXNlVGV4dHVyZSkgIyBfRVNfXG4gICAgICAgIH1cbiAgICAgICAgbm9uZTogeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIF9FXy1cbiAgICAgICAgICB3YWxsOiB0ZXh0dXJlQXQob1gsIG9ZLCAzLCAxLCB0dywgdGgsIGJhc2VUZXh0dXJlKSAjIF9FX1dcbiAgICAgICAgICBub25lOiB0ZXh0dXJlQXQob1gsIG9ZLCAyLCAxLCB0dywgdGgsIGJhc2VUZXh0dXJlKSAjIF9FX19cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9uZTogeyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgX18tLVxuICAgICAgICB3YWxsOiB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgX19TLVxuICAgICAgICAgIHdhbGw6IHRleHR1cmVBdChvWCwgb1ksIDAsIDIsIHR3LCB0aCwgYmFzZVRleHR1cmUpICMgX19TV1xuICAgICAgICAgIG5vbmU6IHRleHR1cmVBdChvWCwgb1ksIDEsIDIsIHR3LCB0aCwgYmFzZVRleHR1cmUpICMgX19TX1xuICAgICAgICB9XG4gICAgICAgIG5vbmU6IHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBfX18tXG4gICAgICAgICAgd2FsbDogdGV4dHVyZUF0KG9YLCBvWSwgMCwgMSwgdHcsIHRoLCBiYXNlVGV4dHVyZSkgIyBfX19XXG4gICAgICAgICAgbm9uZTogdGV4dHVyZUF0KG9YLCBvWSwgMSwgMSwgdHcsIHRoLCBiYXNlVGV4dHVyZSkgIyBfX19fXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuZmxvb3JNYXBBdCA9IChjb2x1bW4sIHJvdywgdGlsZVdpZHRoLCB0aWxlSGVpZ2h0LCBiYXNlVGV4dHVyZSkgLT5cbiAgZmxvb3JNYXBXaWR0aCA9IDdcbiAgZmxvb3JNYXBIZWlnaHQgPSAzXG4gIGZsb29yTWFwKFxuICAgIGNvbHVtbiAqIGZsb29yTWFwV2lkdGggKiB0aWxlV2lkdGgsXG4gICAgcm93ICogZmxvb3JNYXBIZWlnaHQgKiB0aWxlSGVpZ2h0LCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQsIGJhc2VUZXh0dXJlXG4gIClcblxuZmxvb3JNYXBHcm91cEF0ID0gKGNvbHVtbiwgcm93LCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQsIGJhc2VUZXh0dXJlLCBuYW1lcy4uLikgLT5cbiAgcmVzdWx0ID0ge31cbiAgZm9yIG5hbWUsIGkgaW4gbmFtZXNcbiAgICByZXN1bHRbbmFtZXNbaV1dID0gZmxvb3JNYXBBdChjb2x1bW4sIHJvdyArIGksIHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgYmFzZVRleHR1cmUpXG4gIHJlc3VsdFxuXG5jbGFzcyBGbG9vclRleHR1cmVzXG4gIEBsb2FkOiAtPlxuICAgIEBiYXNlVGV4dHVyZSA9IHBpeGkuVGV4dHVyZS5mcm9tSW1hZ2UoXCJpbWFnZXMvZGF3bmxpa2UvT2JqZWN0cy9GbG9vci5wbmdcIilcblxuICAgIHR3ID0gdGlsZVdpZHRoID0gMTZcbiAgICB0aCA9IHRpbGVIZWlnaHQgPSAxNlxuXG4gICAgQGZsb29yVHlwZXMgPSB7XG4gICAgICBibGFja0FuZFdoaXRlOiBmbG9vck1hcEF0KDAsMCx0dyx0aCwgQGJhc2VUZXh0dXJlKVxuICAgICAgYnJpY2tzOiBmbG9vck1hcEdyb3VwQXQoMCwxLHR3LHRoLCBAYmFzZVRleHR1cmUsICdjeWFuJywgJ2dyZXknLCAnZGFya2dyZXknLCAnYmx1ZScpXG4gICAgICBncmFzczogIGZsb29yTWFwR3JvdXBBdCgxLDEsdHcsdGgsIEBiYXNlVGV4dHVyZSwgJ2N5YW4nLCAnZ3JleScsICdkYXJrZ3JlZW4nLCAnYmx1ZScpXG4gICAgICByb2NrOiAgIGZsb29yTWFwR3JvdXBBdCgyLDEsdHcsdGgsIEBiYXNlVGV4dHVyZSwgJ3llbGxvdycsICdvcmFuZ2UnLCAncmVkJywgJ2JsdWUnKVxuICAgICAgZGlydDogICBmbG9vck1hcEdyb3VwQXQoMCw1LHR3LHRoLCBAYmFzZVRleHR1cmUsICd5ZWxsb3cnLCAnb3JhbmdlJywgJ3JlZCcsICdibHVlJylcbiAgICAgIHBsYW5rczogZmxvb3JNYXBHcm91cEF0KDEsNSx0dyx0aCwgQGJhc2VUZXh0dXJlLCAncGluaycsICdvcmFuZ2UnLCAnZ3JleWdyZWVuJywgJ2Jyb3duJylcbiAgICAgIHN1bmxpdERpcnQ6IGZsb29yTWFwR3JvdXBBdCgyLDUsdHcsdGgsIEBiYXNlVGV4dHVyZSwgJ3llbGxvdycsICdvcmFuZ2UnLCAnYnJvd24nLCAnYmx1ZScpXG4gICAgICBmdXJyb3dzOiBmbG9vck1hcEdyb3VwQXQoMCw5LHR3LHRoLCBAYmFzZVRleHR1cmUsICdvcmFuZ2UnLCAnYnJvd24nLCAnYmx1ZScsICdkYXJrYmx1ZScpXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cy5GbG9vclRleHR1cmVzID0gRmxvb3JUZXh0dXJlc1xuIiwicGl4aSA9IHJlcXVpcmUgJ3BpeGkuanMnXG5Qcm9taXNlID0gcmVxdWlyZSgnZXM2LXByb21pc2UnKS5Qcm9taXNlXG5cbmNsYXNzIFdhbGxUZXh0dXJlc1xuICBAbG9hZDogKHZhcmlhbnQpIC0+XG4gICAgbG9hZGVyID0gbmV3IHBpeGkuSnNvbkxvYWRlcihcImltYWdlcy9kYXdubGlrZS9PYmplY3RzL3RleHR1cmVzL3dhbGwvI3t2YXJpYW50fS5qc29uXCIpXG4gICAgcmVzdWx0ID0gbnVsbFxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICAjIExvYWRpbmcgdGhlIHNwcml0ZXNoZWV0IGhhcHBlbnMgaW4gdHdvIHN0ZXBzLiBGaXJzdCwgdGhlIEpTT05cbiAgICAgICMgZGVzY3JpcHRpb24gaXMgbG9hZGVkIGZyb20gdGhlIGdpdmVuIFVSTCwgdGhlbiB0aGUgc3ByaXRlc2hlZXQgaW1hZ2UgaXNcbiAgICAgICMgbG9hZGVkLlxuICAgICAgI1xuICAgICAgIyBBZnRlciB0aGUgSlNPTiBpcyBsb2FkZWQsIHRoZSBwaXhpLlRpbGVDYWNoZSBpcyBwb3B1bGF0ZWQgd2l0aCB0aGVcbiAgICAgICMgdGV4dHVyZXMgdGhlIEpTT04gZGVzY3JpYmVzIGFuZCB0aGUgYmFzZSBpbWFnZSBpcyByZXF1ZXN0ZWQuIFdoZW4gdGhlXG4gICAgICAjIGJhc2UgaW1hZ2UgcmVxdWVzdCBzdWNjZWVkcywgdGhlIGxvYWRlciByZXBvcnRzIHN1Y2Nlc3MuXG4gICAgICAjXG4gICAgICAjIEJlY2F1c2Ugb2YgdGhpcywgaWYgeW91IGxvYWQgdHdvIFdhbGxUZXh0dXJlcyBhdCB0aGUgc2FtZSB0aW1lLCB0aGVcbiAgICAgICMgbGF0ZXIgb25lIHdpbGwgY2xvYmJlciB0aGUgdGV4dHVyZXMgaW4gdGhlIFRleHR1cmVDYWNoZSBmcm9tIHRoZSBmaXJzdFxuICAgICAgIyBvbmUgaWYgdGhlIEpTT04gZm9yIHRoZSBzZWNvbmQgbG9hZCByZXR1cm5zIGJlZm9yZSB0aGUgaW1hZ2UgZnJvbSB0aGVcbiAgICAgICMgZmlyc3Qgb25lLlxuICAgICAgI1xuICAgICAgIyBUbyBnZXQgYXJvdW5kIHRoaXMsIHdlIGludHJvZHVjZSBvdXIgb3duIFwib25KU09OTG9hZGVkXCIgZXZlbnQgaGFuZGxlclxuICAgICAgIyBpbnRvIHRoZSBTcHJpdGVTaGVldExvYWRlciBpbnN0YW5jZSAtIGEgY2xhc3MgQSBoYWNrIC0gd2hpY2ggaXMgY2FsbGVkXG4gICAgICAjIHdoZW4gdGhlIEpTT04gbG9hZHMsIGJlZm9yZSB0aGUgaW1hZ2UgcmVxdWVzdCBpcyBtYWRlLlxuICAgICAgb3JpZ2luYWxMb2FkZXJKU09OSGFuZGxlciA9IGxvYWRlci5vbkpTT05Mb2FkZWRcbiAgICAgIGxvYWRlci5vbkpTT05Mb2FkZWQgPSAtPlxuICAgICAgICBvcmlnaW5hbExvYWRlckpTT05IYW5kbGVyLmFwcGx5KGxvYWRlcilcbiAgICAgICAgcmVzdWx0ID0gbmV3IFdhbGxUZXh0dXJlVmFyaWFudCh2YXJpYW50KVxuXG4gICAgICBsb2FkZXIub25jZSgnbG9hZGVkJywgLT5cbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpXG4gICAgICApXG4gICAgICBsb2FkZXIub25jZSgnZXJyb3InLCAoYXJncy4uLikgLT4gY29uc29sZS5sb2coYXJncy4uLik7IHJlamVjdChhcmdzLi4uKSlcbiAgICAgIGxvYWRlci5sb2FkKClcblxuY2xhc3MgV2FsbFRleHR1cmVWYXJpYW50XG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUpIC0+XG4gICAgdGV4dHVyZU5hbWVzID0gWyAnTkVTVycsICdORV9XJywgJ05fU1cnLCAnTl9fVycsICdfRVNXJywgJ19FX1cnLFxuICAgICAgJ19fX18nLCAnTkVTXycsICdORV9fJywgJ05fU18nLCAnTl9fXycsICdfRVNfJywgJ19fU1cnIF1cbiAgICBmb3IgdGV4dHVyZU5hbWUgaW4gdGV4dHVyZU5hbWVzXG4gICAgICB0ZXh0dXJlSWQgPSBcIiN7dGV4dHVyZU5hbWV9LnBuZ1wiXG4gICAgICB0aGlzW3RleHR1cmVOYW1lXSA9IHBpeGkuVGV4dHVyZUNhY2hlW3RleHR1cmVJZF1cbiAgICAgIHBpeGkuVGV4dHVyZS5yZW1vdmVUZXh0dXJlRnJvbUNhY2hlKHRleHR1cmVJZClcbiAgICBAX19fVyA9IEBfRV9XXG4gICAgQF9FX18gPSBAX0VfV1xuICAgIEBfX1NfID0gQE5fU19cblxubW9kdWxlLmV4cG9ydHMuV2FsbFRleHR1cmVzID0gV2FsbFRleHR1cmVzXG4iXX0=
