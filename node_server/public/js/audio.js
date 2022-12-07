var context = new AudioContext();
var audioBuffers = [];
var bufferSourceNodes = [];
var gainNodes = [];
var panningNodes = [];
var filterNodes = [];

var soundList =`
{
  "soundList":
    [{ "name": "cat", "time": 1, "url": "https://cdn.freesound.org/previews/412/412016_3652520-lq.mp3" }
      , { "name": "dog", "time": 3, "url": "https://cdn.freesound.org/previews/160/160092_2888453-lq.mp3" }
      , { "name": "chicken", "time": 5, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
      , { "name": "bird", "time": 7, "url": "https://cdn.freesound.org/previews/340/340861_6083171-lq.mp3" }]
} 
`

// function that reads soundList and creates audio control elements and WebAudio Nodes
function loadAudioElements(data) {
  let jsonData = JSON.parse(data)
  for (let i = 0; i < Object.keys(jsonData.soundList).length; i++) {

    loadWebSound(jsonData.soundList[i].url, i);
      gainNodes[i] = context.createGain();
      gainNodes[i].gain.value = 0.5;
      panningNodes[i] = context.createStereoPanner();
      panningNodes[i].pan.value = 0;
      filterNodes[i] = context.createBiquadFilter();
      filterNodes[i].type = "notch";
      panningNodes[i].connect(gainNodes[i]);
      gainNodes[i].connect(context.destination);
  }
  
  createAudioDiv(jsonData);
}

// function that loads audio buffer data from web in the audioBuffers array
function loadWebSound(url, i) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function () {
    context.decodeAudioData(request.response, function (buffer) {
      audioBuffers[i] = buffer;
    });
  }
  request.send();
}

// connects an buffer from the audioBuffers array to a gain node and then to the destination, 
// plays the sound at the given time
function playSoundAtTime(i, time) {
  bufferSourceNodes[i] = context.createBufferSource();
  bufferSourceNodes[i].playbackRate.value = document.querySelector("#pitchOutput" + i).innerHTML
  bufferSourceNodes[i].buffer = audioBuffers[i];
  bufferSourceNodes[i].connect(panningNodes[i]);
  bufferSourceNodes[i].start(context.currentTime + time);
}

//create div elements with audio control elements attaches event listeners to sliders
function createAudioDiv(jsonData) {
  let parentDiv = document.getElementById("audioElementsFrame");

  for (let i = 0; i < Object.keys(jsonData.soundList).length; i++) {
    let channel = document.createElement("div")
    channel.setAttribute("class", "channel")
    channel.setAttribute("id", `channel${i}`)
    channel.innerHTML = returnAudioElement(jsonData.soundList[i].name, i)
    parentDiv.appendChild(channel)
    document.querySelector("#volumeSlider" + i).addEventListener("input", function (e) {
      changeParameter(e, i)
    });
    document.querySelector("#panningSlider" + i).addEventListener("input", function (e) {
      changeParameter(e, i)
    });
    document.querySelector("#pitchSlider" + i).addEventListener("input", function (e) {
      changeParameter(e, i)
    });
  }
}
// event handler for all sliders
function changeParameter(e, i) {
  switch (e.target.id) {
    case "volumeSlider" + i:
      document.querySelector("#volumeOutput" + i).innerHTML = (e.target.value);
      gainNodes[i].gain.value = e.target.value / 100;

      break;
    case "panningSlider" + i:
      document.querySelector("#panningOutput"+i).innerHTML = (e.target.value/100) + " ";
      panningNodes[i].pan.value = e.target.value/100;
      break;
    case "pitchSlider" + i:
      console.log("hello")
      document.querySelector("#pitchOutput" + i).innerHTML = (e.target.value/100);
      bufferSourceNodes[i].playbackRate.value = e.target.value/100;
      console.log(bufferSourceNodes[i].playbackRate.value)
      break;
  }
}
// function that returns html for audio control elements
function returnAudioElement(name, channel) {
  return `

  <input type="checkbox" name="power" class="powerswitch" checked>
  <h3 class="channelTitle">${name}</h3>
  <div>
    <label for="volume">Volume</label>
    <input class="slider" type="range" id="volumeSlider${channel}" name="volume" min="0" max="100" value="50">
    <p id="volumeOutput${channel}"> 50 </p>
  </div>
  <div>
    <label for="pan">Pan</label>
    <input class="slider" type="range" id="panningSlider${channel}" name="pan" min="-100" max="100" value="0">
    <p id="panningOutput${channel}"> 0 </p>
  </div>
  <div>
  <label for="pitch">Pitch</label>
  <input class="slider" type="range" id="pitchSlider${channel}" name="pitch" min="0" max="200" value="100">
  <p id="pitchOutput${channel}"> 1 </p>
</div>

  `
}
function testButton(data) {
  console.log('testButton')
  let jsonData = JSON.parse(data)
  for (let i = 0; i < Object.keys(jsonData.soundList).length; i++) {
    playSoundAtTime(i, jsonData.soundList[i].time);
  }
}
// play button for testing
document.querySelector("#playPauseButton").addEventListener("click", function (e) {
  console.log("play")
  testButton(soundList)
});

loadAudioElements(soundList);

