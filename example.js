var webMP1 = new WebMP('webmp_worker.js', 2, 'parallel');

webMP1.parallel(
  {a: 'b'},

  function(webMP) {
    webMP.log('worker: ' + webMP.getWorkerID());
    webMP.callback(webMP.a);
  },

  function(responses) {
    console.log('parallel', responses);
  }
);

var a = [1, 2, 3, 4, 5, 6];
var webMP2 = new WebMP('webmp_worker.js', 2, 'forEach');

webMP2.forEach(
  a,

  function(webMP) {
    webMP.log('elem: ' + webMP.elem);
    webMP.callback(webMP.elem + 1);
  },

  function(responses) {
    console.log('forEach', responses);
  }
);
