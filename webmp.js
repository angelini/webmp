(function(global) {

  var fnRegex = new RegExp('^function.*?{([\\s\\S]*)}$');

  var extractFunction = function(fn) {
    return fnRegex.exec(fn.toString())[1];
  };

  var sendMessage = function(worker, type, content) {
    worker.postMessage({
      type:    type,
      content: content
    });
  };

  var runFunction = function(worker, context, fn, responseHandler) {
    var eventHandler = function(event) {
      switch (event.data.type) {
        case 'response':
          responseHandler(event.data.content, stop);
          break;

        case 'log':
          console.log(event.data.content);
          break;
      }
    };

    var stop = function() {
      worker.removeEventListener('message', eventHandler);
    };

    sendMessage(worker, 'script', fn);
    worker.addEventListener('message', eventHandler);
    sendMessage(worker, 'eval', context);
  };

  var splitList = function(list, count) {
    var splits = [];
    var size   = Math.ceil(list.length / count);

    for (i = 0; i < count; i++) {
      splits[i] = list.slice(i * size, (i + 1) * size);
    }

    return splits;
  };

  var WebMP = function(count, options) {
    this.count = count;
    this.pool  = [];

    this.name      = options.name;
    this.libURL    = options.libURL || 'webmp.js';
    this.workerURL = options.workerURL || 'webmp_worker.js';

    for (i = 0; i < count; i++) {
      this.pool[i] = new Worker(this.workerURL);

      sendMessage(this.pool[i], 'init', {
        id:     i,
        name:   this.name,
        count:  this.count,
        libURL: this.libURL
      });
    }
  };

  WebMP.prototype.forEach = function() {
    var self = this;

    var args    = Array.prototype.slice.call(arguments);
    var cb      = args.pop();
    var fn      = args.pop();
    var list    = args.pop();
    var context = args.pop() || {};

    var iterFn = ['webMP._list.forEach(function(_listElem) {',
                  '  webMP.elem = _listElem;',
                     extractFunction(fn),
                  '});'
                 ].join('\n');

    var splits    = splitList(list, this.count);
    var returned  = 0;
    var responses = [];

    this.pool.forEach(function(worker, id) {
      var iterReturned  = splits[id].length;
      var iterResponses = [];

      context._list = splits[id];
      runFunction(worker, context, iterFn, function(response, stop) {
        iterReturned--;
        iterResponses.push(response);

        if (iterReturned === 0) {
          stop();

          returned++;
          responses[id] = iterResponses;

          if (returned == self.count) cb([].concat.apply([], responses));
        }
      });
    });
  };

  WebMP.prototype.parallel = function() {
    var self = this;

    var args    = Array.prototype.slice.call(arguments);
    var cb      = args.pop();
    var fn      = args.pop();
    var context = args.pop() || {};

    var returned  = 0;
    var responses = [];

    this.pool.forEach(function(worker, id) {
      runFunction(worker, context, extractFunction(fn), function(response, stop) {
        stop();

        returned++;
        responses[id] = response;

        if (returned == self.count) cb(responses);
      });
    });
  };

  global.WebMP = WebMP;

})(this);
