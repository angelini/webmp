var sendMessage = function(type, content) {
  postMessage({
    type:    type,
    content: content
  });
};

var logHeader = function() {
  return "[WebMP " + self.name + ":" + self.id + "] ";
};

var generateContext = function(base) {
  base.getName        = function() { return self.name; };
  base.getWorkerID    = function() { return self.id; };
  base.getWorkerCount = function() { return self.count; };

  base.log = function(message) {
    sendMessage('log', logHeader() + message);
  };

  base.callback = function(response) {
    sendMessage('response', response);
  };

  return base;
};

self.addEventListener('message', function(event) {
  switch (event.data.type) {
    case 'init':
      self.id    = event.data.content.id;
      self.name  = event.data.content.name;
      self.count = event.data.content.count;

      importScripts(event.data.content.libURL);
      break;

    case 'script':
      self.script = event.data.content;
      break;

    case 'eval':
      new Function(['webMP'], self.script)(generateContext(event.data.content));
      break;
  }
});
