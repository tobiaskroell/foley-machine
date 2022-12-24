var context = new AudioContext();
var animalIndices = [];
var audioBuffers = [];
var bufferSourceNodes = [];
var gainNodes = [];
var panningNodes = [];
var filterNodes = [];
var convolverBuffers = [];
var convolverNodes = [];
var masterGain;
var soundList = `
{
  "soundList":
    [{ "name": "cat", "time": 1, "url": "https://cdn.freesound.org/previews/412/412016_3652520-lq.mp3" }
      , { "name": "dog", "time": 0, "url": "https://cdn.freesound.org/previews/160/160092_2888453-lq.mp3" }
      , { "name": "chicken", "time": 5, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
      , { "name": "bird", "time": 7, "url": "https://cdn.freesound.org/previews/340/340861_6083171-lq.mp3" }]
} 
`
let responseFiles = ["room", "church", "cave", "garage","room2"]

//function to load impulsresponse files
function loadImpulseResponse(responseFiles) {
  return new Promise((resolve, reject) => {
    loadReady = false;
    for (let i = 0; i < responseFiles.length; i++) {
      console.log(responseFiles[i]);
      fetch("/impulseResponses/" + responseFiles[i] + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(convolverBuffer => {
          convolverBuffers[i] = convolverBuffer;
          loadReady = true;
        })
        .catch(err => console.log(err));
    };
    setTimeout(() => {
      resolve();
    }, 500);

  })
}

// function that gets soundList and creates audio control elements and WebAudio Nodes
async function loadAudioElements(data) {
  await loadImpulseResponse(responseFiles);
  masterGain = context.createGain();
  masterGain.gain.value = 0.5;
  nodeGroup = 0;
  for (let i = 0; i < Object.keys(data.soundList).length; i++) {
    // check if animal is already in animalIndices array, if not add it
    const index = animalIndices.findIndex(object => object.animal === data.soundList[i].name);
    if (index > -1) {
      animalIndices[index].soundList_indices.push(i);
    } else {
      animalIndices.push({ animal: data.soundList[i].name, node_group: nodeGroup, soundList_indices: [i] });
      nodeGroup += 1;
    }
  }
  createAudioDiv();
  for (const element of animalIndices) {
    console.log(element);
    gainNodes[element.node_group] = context.createGain();
    gainNodes[element.node_group].gain.value = 0.5;
    panningNodes[element.node_group] = context.createStereoPanner();
    panningNodes[element.node_group].pan.value = 0;
    //filterNodes[element.node_group] = context.createBiquadFilter();
    //filterNodes[element.node_group].type = "notch";
    convolverNodes[element.node_group] = context.createConvolver();
    convolverNodes[element.node_group].buffer = convolverBuffers[0];
    convolverNodes[element.node_group].normalize = true;
    convolverNodes[element.node_group].connect(panningNodes[element.node_group]);
    panningNodes[element.node_group].connect(gainNodes[element.node_group]);
    gainNodes[element.node_group].connect(masterGain);
  }
  let promises = [];
  for (let i = 0; i < Object.keys(data.soundList).length; i++) {
    bufferSourceNodes[i] = context.createBufferSource();
    let index = animalIndices.findIndex(object => object.animal === data.soundList[i].name);
    bufferSourceNodes[i].playbackRate.value = document.querySelector("#pitchOutput" + animalIndices[index].node_group).innerHTML;
    loadWebSound(data.soundList[i].url, i);
    bufferSourceNodes[i].connect(convolverNodes[animalIndices[index].node_group]);
  }
  masterGain.connect(context.destination);
  console.log(animalIndices);

  // TODO: Play sounds triggered by video time, not button click
  document.querySelector("#playPauseButton").addEventListener("click", function (e) {
    console.log("play audio");
    document.getElementsByClassName("mp4-video")[0].play();
    for (let i = 0; i < Object.keys(data.soundList).length; i++) {
      bufferSourceNodes[i].start(context.currentTime + data.soundList[i].time);
    }
  }); 
}

// function that loads audio buffer data from web in the audioBuffers array
function loadWebSound(url, i) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = function () {
        context.decodeAudioData(request.response, function (buffer) {
          bufferSourceNodes[i].buffer = buffer;
        });
      }
    request.onerror = function () {
      console.error('An error occurred while loading the audio file');
    };
    request.send();
}

// connects an buffer from the audioBuffers array to a gain node and then to the destination, 
// plays the sound at the given time
function playSoundAtTime(i, time) {
  bufferSourceNodes[i].start(context.currentTime + time);
}

//creates div elements with audio control elements, attaches event listeners to sliders
function createAudioDiv() {
  let parentDiv = document.getElementById("audioElementsFrame");
  let master = document.createElement("div")
  master.setAttribute("class", "master")
  master.setAttribute("id", `master`)
  master.innerHTML = '<div><label for="volume">Master Volume</label><input class="slider" type="range" id="masterSlider" name="master" min="0" max="100" value="50"><p id="masterOutput"> 50 </p></div>'
  parentDiv.appendChild(master)
  document.querySelector("#masterSlider").addEventListener("input", function (e) {
    changeParameter(e, "0")
  });
  for (const object of animalIndices) {
    let channel = document.createElement("div")
    channel.setAttribute("class", "channel")
    channel.setAttribute("id", `channel${object.node_group}`)
    channel.innerHTML = returnAudioElement(object.animal, object.node_group)
    parentDiv.appendChild(channel)

    document.querySelector("#volumeSlider" + object.node_group).addEventListener("input", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#panningSlider" + object.node_group).addEventListener("input", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#pitchSlider" + object.node_group).addEventListener("input", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#selectList" + object.node_group).addEventListener("change", function (event) {
      changeParameter(event, object.node_group)
    });
  }
}

// event handler for all sliders
function changeParameter(e, i) {
  switch (e.target.id) {
    case "masterSlider":
      document.querySelector("#masterOutput").innerHTML = (e.target.value);
      masterGain.gain.value = e.target.value / 100;
      break;
    case "volumeSlider" + i:
      document.querySelector("#volumeOutput" + i).innerHTML = (e.target.value);
      gainNodes[i].gain.value = e.target.value / 100;
      break;
    case "panningSlider" + i:
      document.querySelector("#panningOutput" + i).innerHTML = (e.target.value / 100) + " ";
      panningNodes[i].pan.value = e.target.value / 100;
      break;
    case "pitchSlider" + i:
      document.querySelector("#pitchOutput" + i).innerHTML = (e.target.value / 100);
      bufferSourceNodes[i].playbackRate.value = e.target.value / 100;
      console.log(bufferSourceNodes[i].playbackRate.value)
      break;
    case "selectList" + i:
      convolverNodes[i].buffer = convolverBuffers[e.target.selectedIndex];
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
  <div>
  <label for="pitch">Reverb</label>
  <select id="selectList${channel}">
    <option value="room">Room</option>
    <option value="church">Church</option>
    <option value="cave">Cave</option>
    <option value="garage">Garage</option>
    <option value="room2">Room2</option>
</select>
  </div>
  `
}