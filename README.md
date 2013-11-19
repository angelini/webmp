# WebMP

Simple parallel processing in the browser using Web Workers.

## Initialization

To instantiate a webMP object with a pool of 5 web workers.

```
var webMP = new WebMP(5, options);
```

**Options**

```
{
	name:      ''                // Name of the worker, used for debugging and logging
	libURL:    'webmp.js'        // The location of the webmp.js file
	workerURL: 'webmp_worker.js' // The location of the webmp_worker.js file
}
```

## Methods

The following methods are available on an instance of WebMP.

`webMP.parallel([context,] parallelFunction, callback)`

`webMP.forEach([context,] list, parallelFunction, callback)`

forEach will bucket the list items into n lists, where n is the total workers in the webMP pool. This is transparent to the user and the return values will be properly concatonated in the callback. 

The `parallelFunction` will be passed a single argument (`webMP`) which will contain the functions context and communication methods.

```
function (webMP) {
  webMP.a                // Access `a` from the passed context
  webMP.log('Test')      // Send a log message to the main thread
  webMP.getWorkerID()    // Returns the current worker's ID [0..workerCount]
  webMP.getWorkerCount() // Returns the total amount of workers created
  webMP.callback('foo')  // Ends current function and returns it's argument to the main thread
}
```

## Context

The `parallelFunction` will not be wrapped in a typical JS closure and will not have access to values assigned outside of the function's definition. Context variables must be explicitly passed within the `context` object.

## Examples

```
var webMP1 = new WebMP(2, {name: 'parallel'});

webMP1.parallel(
  {a: 1},

  function(webMP) {
    webMP.log('worker: ' + webMP.getWorkerID());
    webMP.callback(webMP.a + webMP.getWorkerID());
  },

  function(responses) {
    console.log('parallel', responses);  // Will log "parallel [1, 2]"
  }
);
```

```
var a = [1, 2, 3, 4, 5, 6];
var webMP2 = new WebMP(2, {name: 'forEach'});

webMP2.forEach(
  a,

  function(webMP) {
    webMP.log('elem: ' + webMP.elem);
    webMP.callback(webMP.elem + 1);
  },

  function(responses) {
    console.log('forEach', responses);  // Will log "forEach [2, 3, 4, 5, 6, 7]"
  }
);
```

## Nesting

Nesting Web Workers is supported in Firefox but not in Chrome. If the browser supports nesting, so will WebMP.

```
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
    console.log('nested', responses);  // Will log "nested [[1, 1], [1, 1]]"
  }
);
```