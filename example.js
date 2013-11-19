var webMP1 = new WebMP(2, {name: 'parallel'});

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
var webMP2 = new WebMP(2, {name: 'forEach'});

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

var webMP3 = new WebMP(2, {name: 'outer_nested'});

webMP3.parallel(
  function(webMP) {
    var nested = new WebMP(2, {name: 'inner_nested'});

    nested.parallel(
      function(webMP)     { webMP.callback(1); },
      function(responses) { webMP.callback(responses); }
    );
  },

  function(responses) {
    console.log('nested', responses);
  }
);
