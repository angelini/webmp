(function() {

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

  var splitList = function(list, count) {
    var splits = [];
    var size   = Math.ceil(list.length / count);

    for (i = 0; i < count; i++) {
      splits[i] = list.slice(i * size, (i + 1) * size);
    }

    return splits;
  };

  var WebMP = function(url, count) {
    this.url   = url;
    this.count = count;
    this.pool  = [];

    for (i = 0; i < count; i++) {
      this.pool[i] = new Worker(url);

      sendMessage(this.pool[i], 'init', {
        id:    i,
        count: count
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

      sendMessage(worker, 'script', iterFn);

      worker.addEventListener('message', function(event) {
        switch(event.data.type) {
          case 'response':
            iterReturned--;
            iterResponses.push(event.data.content);

            if (iterReturned === 0) {
              worker.removeEventListener('message');

              returned++;
              responses[id] = iterResponses;

              if (returned == self.count) cb([].concat.apply([], responses));
              break;
            }
        }
      });

      context._list = splits[id];
      sendMessage(worker, 'eval', context);
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
      sendMessage(worker, 'script', extractFunction(fn));

      worker.addEventListener('message', function(event) {
        switch (event.data.type) {
          case 'response':
            worker.removeEventListener('message');

            returned++;
            responses[id] = event.data.content;

            if (returned == self.count) cb(responses);
            break;
        }
      });

      sendMessage(worker, 'eval', context);
    });
  };

  window.WebMP = WebMP;

})();
