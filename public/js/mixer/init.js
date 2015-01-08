// Keep track of all loaded buffers.
var BUFFERS = {};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

function loadBuffers(stems) {
  // Array-ify
  var names = [];
  var paths = [];
  for (var i = 0 ; i < stems.length ; i++) {
    // TODO: create url in better way..
    var path = 'https://s3-us-west-2.amazonaws.com/briannewsomsongs/' + stems[i].id + '.mp3';
    names.push(stems[i].name);
    paths.push(path);
  }
  console.log(names);
  console.log(paths);
  bufferLoader = new BufferLoader(context, paths, function(bufferList) {
    for (var i = 0; i < bufferList.length; i++) {
      var buffer = bufferList[i];
      var name = names[i];
      BUFFERS[name] = buffer;
    }
    $('#playBtn').removeAttr('disabled');
  });
  bufferLoader.load();
}

var Mixer = {
    playing:false,
    startOffset:0,
    startTime:0,
};
// Looped playback - probably should be disabled
Mixer.playAll = function(allBuffers) {
    var len = allBuffers.length;
    this.ctls = [];
    // Create sources
    for (var i = 0 ; i < len ; i++){
        this.ctls.push(createSource(allBuffers[i]));
    }
    // Start playback
    if(!this.ctls[0].source.start){
        for (var i = 0 ; i < len ; i++){
            this.ctls[i].source.noteOn(0);
        }
    } else{
        for (var i=0 ; i < len ; i++){
            this.ctls[i].source.start(0,this.startOffset % allBuffers[i].duration );
        }
    }
    function createSource(buffer) {
        var source = context.createBufferSource();
        var gainNode = context.createGain ? context.createGain() : context.createGainNode();
        source.buffer = buffer;
        // Turn on looping
        source.loop = false;
        // Connect source to gain.
        source.connect(gainNode);
        // Connect gain to destination.
        gainNode.connect(context.destination);

        return {
          source: source,
          gainNode: gainNode
        };
    }
}

Mixer.play = function() {
  // Create two sources.
  var buffs = [];
  //var gains = [];
  for (var i = 0 ; i < this.stems.length ; i++){
    buffs.push(BUFFERS[this.stems[i]]);
  }
  // Set time to resume play;
  this.startTime = context.currentTime;
  this.playAll(buffs);
};

Mixer.stopAll = function() {
  var len = this.ctls.length;
  this.startOffset += context.currentTime - this.startTime;
  if (!this.ctls[0]) {
    for (var i = 0 ; i < len ; i++){
        this.ctls[i].source.noteOff(0);
    }
  } else {
    for (var i = 0 ; i < len ; i++){
        this.ctls[i].source.stop(0);
    }
  }
};

Mixer.stop = function() {
  this.stopAll();
};

Mixer.changeVol = function(element, track){
    var x = parseInt(element.value) / parseInt(element.max);
    var gain = Math.cos((1-x) * .5 * Math.PI);
    this.ctls[track].gainNode.gain.value = gain;
};

Mixer.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};

Mixer.init = function(stems) {
    this.stems = stems;
    var len = stems.length;
    var outStr = '';
    if(len == 0){
        outStr = '<p> This track does not exist or has no stems :( </p>';
    } else {
        // Set as disabled until loaded
        outStr = '<p><input type="button" id="playBtn" onclick="Mixer.toggle();" value="Play/Pause" disabled/></p>';
        for (var i = 0 ; i < len ; i++){
            outStr = outStr + '<p>' + this.stems[i] + '<input type="range" min="0" max="100" value="50" oninput="Mixer.changeVol(this,' + String(i) + ');" id="track' + String(i) + '"/> </p>';
        }
    }
    $('#mixer').html(outStr);
}
