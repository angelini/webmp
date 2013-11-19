var webMP1 = new WebMP('webmp_worker.js', 2);

webMP1.parallel(
  {a: 'b'},

  function(webMP) {
    webMP.callback(webMP.a + " " + webMP.getWorkerID());
  },

  function(responses) {
    console.log('parallel', responses);
  }
);

var a = [1, 2, 3, 4, 5, 6];
var webMP2 = new WebMP('webmp_worker.js', 2);

webMP2.forEach(a,
  function(webMP) {
    webMP.callback(webMP.elem + 1);
  },

  function(responses) {
    console.log('forEach', responses);
  }
);
