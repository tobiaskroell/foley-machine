var context = new AudioContext();
var audioBuffers = [];
var bufferSourceNodes = [];
var gainNodes = [];
var panningNodes = [];
var jsonData;

var soundList =`
{
  "soundList":
    [{ "name": "cat", "time": 1, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
      , { "name": "dog", "time": 2, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
      , { "name": "chicken", "time": 3, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
      , { "name": "bird", "time": 3.5, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }]
} 
`

// function that reads soundList and creates audio control elements
function loadAudioElements(data) {
  console.log('loadAudioElements')
  let jsonData = JSON.parse(data)
  console.log(Object.keys(jsonData.soundList).length);

  for (let i = 0; i < Object.keys(jsonData.soundList).length; i++) {

    loadWebSound(jsonData.soundList[i].url, i);
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
  bufferSourceNodes[i].buffer = audioBuffers[i];
  if (typeof gainNodes[i] == 'undefined') {
    gainNodes[i] = context.createGain();
    gainNodes[i].gain.value = 0.5;
  }
  if (typeof panningNodes[i] == 'undefined') {
    panningNodes[i] = context.createStereoPanner();
    panningNodes[i].pan.value = 0;
  }

  bufferSourceNodes[i].connect(panningNodes[i]);
  panningNodes[i].connect(gainNodes[i]);
  gainNodes[i].connect(context.destination);
  bufferSourceNodes[i].start(context.currentTime + time);
}

//create div elements with audio control elements attaches event listeners to sliders
function createAudioDiv(jsonData) {
  let parentDiv = document.getElementById("audioElementsFrame");
  let heading = document.createElement("h1");
  heading.textContent = "Audio Mixer";
  parentDiv.appendChild(heading);

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
  }
}
// function that returns html for audio control elements
function returnAudioElement(name, channel) {
  return `
  <div>
    <label for="name">${name}</label>
  </div>
  <div>
    <label for="volume">Volume</label>
    <input class="slider" type="range" id="volumeSlider${channel}" name="volume" min="0" max="100" value="50">
    <span id="volumeOutput${channel}" class="output"> 50 </span>
  </div>

  <div>
    <label for="pan">Pan</label>
    <input class="slider" type="range" id="panningSlider${channel}" name="pan" min="-100" max="100" value="0">
    <span id="panningOutput${channel}" class="output"> 0 </span>
  </div>

  `
}
// play button for testing
document.querySelector("#playPauseButton").addEventListener("click", function (e) {
  console.log("play")
  playSoundAtTime(0, 0);
  playSoundAtTime(1, 1);
  playSoundAtTime(2, 2);
  playSoundAtTime(3, 3);
  playSoundAtTime(0, 4);

});

loadAudioElements(soundList);

