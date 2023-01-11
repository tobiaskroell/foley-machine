var context = new AudioContext();
var animalGroups = [];
var bufferSourceNodes = [];
var gainNodes = [];
var panningNodes = [];
var lowCutNodes = [];
var highCutNodes = [];
var lowShelfNodes = [];
var highShelfNodes = [];
var convolverBuffers = [];
var convolverNodes = [];
var reverbGainNodes = [];
var masterGain;
var data;
let responseFiles = ["room", "church", "cave", "garage", "room2"]
var knobBgColor = "#606060";
var knobFgColor = "#00BB20";
var knobDiameter = 32;

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
async function loadAudioElements(json) {
  data = json;
  await loadImpulseResponse(responseFiles);
  masterGain = context.createGain();
  masterGain.gain.value = 0.5;
  groupDetectedObjects(data);
  createAudioHtml();
  createEffectNodes();
  createBufferSourceNodes(data);
  masterGain.connect(context.destination);
  console.log(animalGroups);

  // TODO: Play sounds triggered by video time, not button click
  document.querySelector("#playPauseButton").addEventListener("click", function (e) {
    console.log("play audio");
    document.getElementsByClassName("mp4-video")[0].play();
    for (let i = 0; i < Object.keys(data.soundList).length; i++) {
      bufferSourceNodes[i].start(context.currentTime + data.soundList[i].time);
    }

    // TODO: Play sounds triggered by audio, or don't...
  });
}

/**
 * In order to create audio controls, which control all sounds of the 
 * same detected objected (independent from the time of appearance),
 * the detected objects are grouped and their original index is saved 
 * in a json object. 
 * {animal: 'animal-name', node_group: #group-nr#, soundList_indices: [original-json-index]}
 * @param {json} data json with detected objects from backend
 * */
function groupDetectedObjects(data) {
  nodeGroup = 0;
  for (let i = 0; i < Object.keys(data.soundList).length; i++) {
    // check if animal is already in animalGroups array, if not add it
    const index = animalGroups.findIndex(object => object.animal === data.soundList[i].name);
    if (index > -1) {
      animalGroups[index].soundList_indices.push(i);
    } else {
      animalGroups.push({ animal: data.soundList[i].name, node_group: nodeGroup, soundList_indices: [i] });
      nodeGroup += 1;
    }
  }
}

/**
 * This function creates effect Web Audio API effect nodes 
 * for every detected node group (same objects are controlled) 
 * by the same node group.
 */
function createEffectNodes() {
  for (const element of animalGroups) {
    // create effect nodes for every node group
    gainNodes[element.node_group] = context.createGain();
    gainNodes[element.node_group].gain.value = 0.5;
    reverbGainNodes[element.node_group] = context.createGain();
    reverbGainNodes[element.node_group].gain.value = 0.5;
    convolverNodes[element.node_group] = context.createConvolver();
    convolverNodes[element.node_group].buffer = convolverBuffers[0];
    convolverNodes[element.node_group].normalize = true;
    highCutNodes[element.node_group] = context.createBiquadFilter();
    highCutNodes[element.node_group].type = "highshelf";
    highCutNodes[element.node_group].frequency.value = 8000;
    highCutNodes[element.node_group].gain.value = 0;
    lowCutNodes[element.node_group] = context.createBiquadFilter();
    lowCutNodes[element.node_group].type = "lowshelf";
    lowCutNodes[element.node_group].frequency.value = 100;
    lowCutNodes[element.node_group].gain.value = 0;
    highShelfNodes[element.node_group] = context.createBiquadFilter();
    highShelfNodes[element.node_group].type = "highshelf";
    highShelfNodes[element.node_group].frequency.value = 8000;
    highShelfNodes[element.node_group].gain.value = 0;
    lowShelfNodes[element.node_group] = context.createBiquadFilter();
    lowShelfNodes[element.node_group].type = "lowshelf";
    lowShelfNodes[element.node_group].frequency.value = 100;
    lowShelfNodes[element.node_group].gain.value = 0;
    panningNodes[element.node_group] = context.createStereoPanner();
    panningNodes[element.node_group].pan.value = 0;
    // connect effect nodes
    gainNodes[element.node_group].connect(highShelfNodes[element.node_group]);
    highShelfNodes[element.node_group].connect(lowShelfNodes[element.node_group]);
    lowShelfNodes[element.node_group].connect(highCutNodes[element.node_group]);
    highCutNodes[element.node_group].connect(lowCutNodes[element.node_group]);
    lowCutNodes[element.node_group].connect(panningNodes[element.node_group]);
    lowCutNodes[element.node_group].connect(reverbGainNodes[element.node_group]);
    reverbGainNodes[element.node_group].connect(convolverNodes[element.node_group]);
    convolverNodes[element.node_group].connect(panningNodes[element.node_group]);
    panningNodes[element.node_group].connect(masterGain);
  }
}

/**
 * This function creates the buffer source nodes, calls 
 * 'loadWebSound' to asynchronously load the audio files 
 * from freesound.org and connects them to the convolver
 * nodes (first effect node).
 * It also sets a 'played' flag in the original data, to 
 * indicate wether a sound has been played or not.
 * This function needs to be called again, if the sounds 
 * need to be played again, since buffer source nodes can 
 * be only played once. Creating new buffer source nodes 
 * is inexpensive.
 * @param {json} data json with detected objects from backend
 */
function createBufferSourceNodes(data) {
  for (let i = 0; i < Object.keys(data.soundList).length; i++) {
    data.soundList[i].played = false;
    bufferSourceNodes[i] = context.createBufferSource();
    let index = animalGroups.findIndex(object => object.animal === data.soundList[i].name);
    bufferSourceNodes[i].playbackRate.value = document.querySelector("#pitchOutput" + animalGroups[index].node_group).innerHTML;
    loadWebSound(data.soundList[i].url, i);
    bufferSourceNodes[i].connect(gainNodes[animalGroups[index].node_group]);
  }
}

/**
 * Sends a XMLHttpRequest to load the sound files from 
 * a given url. Uses the corresponding index of the 
 * original json object coming from the backend to 
 * set the correct buffer attribute of the buffer 
 *  source node.
 * @param {string} url 
 * @param {integer} i 
 */
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

/**
 * Creates and appends the needed HTML elements with audio 
 * controls, then attaches event listeners to the sliders for 
 * effecting the corresponding Web Audio API effect nodes.
 */
function createAudioHtml() {
  let parentDiv = document.getElementById("audioElementsFrame");
  let master = document.createElement("div")
  master.setAttribute("class", "master")
  master.setAttribute("id", `master`)
  master.innerHTML = '<div><label for="volume">Master Volume</label><input class="slider" type="range" id="masterSlider" name="master" min="0" max="100" value="50"><p id="masterOutput"> 50 </p></div>'
  parentDiv.appendChild(master)
  document.querySelector("#masterSlider").addEventListener("input", function (e) {
    changeParameter(e, "0")
  });
  for (const object of animalGroups) {
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
    document.querySelector("#reverbSlider" + object.node_group).addEventListener("input", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#powerSwitch" + object.node_group).addEventListener("click", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#lowCutSwitch" + object.node_group).addEventListener("click", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#highCutSwitch" + object.node_group).addEventListener("click", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#lowShelfSwitch" + object.node_group).addEventListener("click", function (event) {
      changeParameter(event, object.node_group)
    });
    document.querySelector("#highShelfSwitch" + object.node_group).addEventListener("click", function (event) {
      changeParameter(event, object.node_group)
    });
  }
}

/**
 * Changes the corresponding Web Audio API nodes 
 * depending on the given node group identifier.
 * @param {event} e event, that triggered this call. 
 * Needed to identify the target.
 * @param {integer} i node group identifier
 */
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
    case "reverbSlider" + i:
      document.querySelector("#reverbOutput" + i).innerHTML = (e.target.value / 100) + " ";
      reverbGainNodes[i].gain.value = e.target.value / 100;
      break;
    case "powerSwitch" + i:
      document.querySelector("#powerSwitch" + i).checked ?
        gainNodes[i].gain.value = document.querySelector("#volumeSlider" + i).value / 100 :
        gainNodes[i].gain.value = 0;
      break;
    case "lowCutSwitch" + i:
      document.querySelector("#lowCutSwitch" + i).checked ?
        lowCutNodes[i].gain.value = -80 :
        lowCutNodes[i].gain.value = 0;
      break;
    case "highCutSwitch" + i:
      document.querySelector("#highCutSwitch" + i).checked ?
        highCutNodes[i].gain.value = -80 :
        highCutNodes[i].gain.value = 0;
      break;
      case "lowShelfSwitch" + i:
        document.querySelector("#lowShelfSwitch" + i).checked ?
          lowShelfNodes[i].gain.value = 30 :
          lowShelfNodes[i].gain.value = 0;
        break;
      case "highShelfSwitch" + i:
        document.querySelector("#highShelfSwitch" + i).checked ?
          highShelfNodes[i].gain.value = 30 :
          highShelfNodes[i].gain.value = 0;
        break;
  }
}

/**
 * Returns HTML code for audio control elements
 */
function returnAudioElement(name, channel) {
  return `
  <input type="checkbox" name="power" id="powerSwitch${channel}" class="powerswitch" checked>
  <h3 class="channelTitle">${name}</h3>
  <div>
    <label for="volume">Volume</label>
    <input class="input-knob" type="range" knobDiameter:${knobDiameter} data-bgcolor=${knobBgColor} data-fgcolor=${knobFgColor} id="volumeSlider${channel}" name="volume" min="0" max="100" value="50">
    <p id="volumeOutput${channel}"> 50 </p>
  </div>
  <div>
    <label for="pan">Pan</label>
    <input class="input-knob" type="range" knobDiameter:${knobDiameter} data-bgcolor=${knobBgColor} data-fgcolor=${knobFgColor} id="panningSlider${channel}" name="pan" min="-100" max="100" value="0">
    <p id="panningOutput${channel}"> 0 </p>
  </div>
  <div>
  <label for="pitch">Pitch</label>
  <input class="input-knob" type="range" knobDiameter:${knobDiameter} data-bgcolor=${knobBgColor} data-fgcolor=${knobFgColor} id="pitchSlider${channel}" name="pitch" min="0" max="200" value="100">
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
  <div>
  <label for="reverb">Reverb Amount</label>
  <input class="input-knob" type="range" knobDiameter:${knobDiameter} data-bgcolor=${knobBgColor} data-fgcolor=${knobFgColor} id="reverbSlider${channel}" name="reverb" min="0" max="100" value="0">
  <p id="reverbOutput${channel}"> 0 </p>
  </div>
  <div>
  <label for="eq">EQ</label>
  <p>Low Shelf</p>
  <input type="checkbox" name="lowShelf" id="lowShelfSwitch${channel}" class="input-switch" data-src="./img/lowShelf.png" data-diameter="30" unchecked>
  <p>High Shelf</p>
  <input type="checkbox" name="highShelf" id="highShelfSwitch${channel}" class="input-switch" data-src="./img/highShelf.png" data-diameter="30" unchecked>  
  <p>Low Cut</p>
  <input type="checkbox" name="lowCut" id="lowCutSwitch${channel}" class="input-switch" data-src="./img/lowCut.png" data-diameter="30" unchecked>
  <p>High Cut</p>
  <input type="checkbox" name="highCut" id="highCutSwitch${channel}" class="input-switch" data-src="./img/highCut.png" data-diameter="30" unchecked>
  <div>
  `
}

/**
 * This function triggers the start of a sound with depending on 
 * the current time of a video.
 * It only plays sounds, that have not been played yet and therefore 
 * sets a flag to indicate that status.
 * @param {bufferSourceNode} buff_node Web Audio API Buffer Source Node 
 * containing the audio buffer.
 * @param {number} time Float indicating the time in seconds, at which 
 * the sound should be played.
 * @param {boolean} flag Flag indicating wether a sound has been played 
 * or not to prevent repeated triggers.
 * @param {html} video The html video element containing the video 
 * source, that is responsible for triggering the sounds.
 */
function playSound(timecode) {
  for (let i = 0; i <= data.soundList.length; i++) {
    console.log("Timecode: " + timecode)
    console.log("Audio-Time: " + data.soundList[i].time);
    console.log("Was played: " + data.soundList[i].played);
    if (timecode >= data.soundList[i].time && !data.soundList[i].played) {
      console.log("Playing sound on index: " + i);
      bufferSourceNodes[i].start();
      data.soundList[i].played = true;
    }
  }
}

function stopAudioBuffers() {
  for (const node of bufferSourceNodes) {
    // TODO: Check if node is playing/was played to prevent console errors
    node.stop();
  }
}

function playSilentSound() {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  setTimeout(() => oscillator.stop(), 250);
}