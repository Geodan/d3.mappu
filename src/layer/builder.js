onmessage = function(e) {
  console.log('Message received from main script');
  var workerResult = e.data;
  console.log('Posting message back to main script');
  postMessage(workerResult);
};