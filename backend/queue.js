let queue = [];

function addToQueue(song)  {
  queue.push(song);
  console.log("Song added", song);
}

addToQueue("Song A");
addtoQueue("Song B");

console.log("Køen:", queue);
