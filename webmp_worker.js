var sendMessage = function(type, content) {
  postMessage({
    type:    type,
    content: content
  });
};

var generateContext = function(base) {
  base.getWorkerID    = function() { return self.id; };
  base.getWorkerCount = function() { return self.count; };

  base.callback = function(response) {
    sendMessage('response', response);
  };

  return base;
};

self.addEventListener('message', function(event) {
  switch (event.data.type) {
    case 'init':
      self.id    = event.data.content.id;
      self.count = event.data.content.count;
      break;

    case 'script':
      self.script = event.data.content;
      break;

    case 'eval':
      new Function(['webMP'], self.script)(generateContext(event.data.content));
      break;
  }
});
