let context = new AudioContext();
var audioBuffers = [];

audioFiles = ["sound1", "sound2", "sound3", "sound4"];


function getAudioData(i) {
  fetch("sound" + (i + 1)+".wav")
      .then(response => response.arrayBuffer())
      .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
      .then(audioBuffer => {
          audioBuffers[i] = audioBuffer;
  })
  .catch(console.error);
}

for (let i = 0; i < 4; i++)
    getAudioData(i);

function playSound(buffer, time) {
  let source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(time);
}

function createAudioNodes(audioFiles) {
  
  for (let i = 0; i < audioFiles.length; i++) {
    let gainNode = context.createGain();
    let sound = new Audio(audioFiles[i]+".wav");
    let source = context.createMediaElementSource(sound);
    gainNode.gain.value = 0.5;
    source.connect(gainNode);
    gainNode.connect(context.destination);
  }

}

function createAudioDiv(audioFiles = []) {
  let parentDiv = document.getElementById("audioElementsFrame");
  let heading = document.createElement("h1")
  heading.textContent = "Audio Mixer"
  parentDiv.appendChild(heading)

  for (let i = 0; i < audioFiles.length; i++) {
    let channel = document.createElement("div")
    channel.setAttribute("class", "channel")
    channel.setAttribute("id", `channel${i}`)
    channel.innerHTML = returnAudioElement(audioFiles[i], i)
    parentDiv.appendChild(channel)
    document.querySelector("#volumeSlider" + i).addEventListener("input", changeParameter);
}
}
function changeParameter() {
  console.log(this.id, "volumeSlider")
  switch (this.id) {
    case "volumeSlider0":
      document.querySelector("#volumeOutput0").innerHTML = (this.value) + " dB";
      console.log('hello world')
      break;
    case "detuneSlider":
      filter.detune.value = (this.value);
      document.querySelector("#detuneOutput").innerHTML = (this.value) + " cents";
      break;
    case "qSlider":
      filter.Q.value = (this.value);
      document.querySelector("#qOutput").innerHTML = (this.value) + " ";
      break;
    case "gainSlider":
      filter.gain.value = (this.value);
      document.querySelector("#gainOutput").innerHTML = (this.value) + " dB";
      break;
  }
}
function returnAudioElement(name, channel) {
  return `
  <div>
  <label for="name">${name}</label>
  </div>
    <div>
    <label for="volume">Volume</label>
    <input class="slider" type="range" id="volumeSlider${channel}" name="volume" min="0" max="100" value="50">
    <span id="volumeOutput${channel}" class="output">- 10 dB</span>
    </div>

  `
}
function playBeat() {
  let tempo = 90; // BPM (beats per minute)
  let eighthNoteTime = (60 / tempo) / 2;
  let startTime = context.currentTime;
  let bassdrum = audioBuffers[0];
  let snaredrum = audioBuffers[1];
  let hihat = audioBuffers[2];

  for (let takt = 0; takt < 2; takt++) {
      let time = startTime + (takt * 8 * eighthNoteTime);

      playSound(bassdrum, time + 0 * eighthNoteTime);
      playSound(bassdrum, time + 1 * eighthNoteTime);
      playSound(bassdrum, time + 4 * eighthNoteTime);

      playSound(snaredrum, time + 2 * eighthNoteTime);
      playSound(snaredrum, time + 3.5 * eighthNoteTime);
      playSound(snaredrum, time + 4.5 * eighthNoteTime);
      playSound(snaredrum, time + 6 * eighthNoteTime);

      for (let j = 0; j < 8; j++) {
          playSound(hihat, time + j * eighthNoteTime);
      }
  }
}
document.querySelector("#playPauseButton").addEventListener("click", function(e) {
  playBeat();
});



createAudioNodes(audioFiles);    
createAudioDiv(audioFiles);

  /*
  var sliders = document.getElementsByClassName("slider");
  for (var i = 0; i < sliders.length; i++)
    sliders[i].addEventListener('mousemove', changeParameter(i), false);
    console.log('hello world2')
    */

    /* for maybe later use

      <div>
    <label for="volume">Pitch</label>
    <input class="slider" type="range" id="detuneOutput" name="volume" min="0" max="100" value="50">
  </div>
  <div>
    <label for="volume">Pan</label>
    <input class="slider" type="range" id="volume" name="volume" min="0" max="100" value="50">
  </div>
  <div>
    <label for="volume">Speed</label>
    <input class="slider" type="range" id="volume" name="volume" min="0" max="100" value="50">
  </div>
  <div>
    <label for="volume">Distortion</label>
    <input class="slider" type="range" id="volume" name="volume" min="0" max="100" value="50">
  </div>
  */