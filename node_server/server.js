/******************
 ** Requirements **
 ******************/
let express = require('express');
let app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Find available options for express-fileupload here:
 * @url https://www.npmjs.com/package/express-fileupload#user-content-available-options
 */
let fileUpload = require('express-fileupload');
const fileSizeLimit = 1024 * 1024 * 40; // 40MB
app.use(fileUpload({
  limits: {
    fileSize: fileSizeLimit,    // file size limit in bytes
    files: 1                    // file limit in multipart forms
  },
  debug: false,            // show debug messages
  safeFileNames: true,      // strips non-alphanumeric chars except dashes & underscores
  preserveExtension: true,  // preserves file extension, when using safeFileNames (default 3 chars)
  abortOnLimit: true,       // Returns HTTP 413 when size limit is reached
  useTempFiles: true,       // don't use RAM for uploaded files
}));

let ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static');


//Wipe video folder every 10 minutes video is older than 1 hour
const findRemoveSync = require('find-remove');
setInterval(() => {
  findRemoveSync(__dirname + '/public/video', {
    age: { seconds: 3600 },
    extensions: '.mp4',
    //limit: 100
  })
}, 600000);

const https = require('https');
const http = require('http');
const fs = require("fs");

const { animalList } = require('./animals.js');

const secret = require('./secret.js');


/*********************
 ** Server listener **
 *********************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});
app.timeout = 120000; // 2 minutes (ms); default is 2 minutes

/***********
 ** Hosts **
 ***********/
const pyProduction = 'http://3.122.106.66';
const pyLocal = 'http://127.0.0.1:8000';
const pyServer = pyLocal;
const pyPath = "/video"

// Serving static files
app.use(express.static(__dirname + '/public'));

/**********************
 ** Request handlers **
 **********************/
// Get Page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// Upload video file
app.post('/upload', async (req, res) => {
  const link = req.body.link != undefined ? req.body.link : false;
  const file = req.files ? req.files.file : false;
  let filename, filepath, fps, duration, frameCount;
  let detections = [];

  // Check file and get video info
  new Promise(async (resolve, reject) => {
    if (file != false) {
      // Read file and check for mp4
      if (file.mimetype != 'video/mp4') {
          res.status(400).send('Please make sure you have uploaded a video file (mp4).');
          return;
      }
      filename = Date.now() + ".mp4";
      filepath = '../../node_server/public/video/' + filename;
      file.mv(__dirname + '/public/video/' + filename, () => { // Write file, then read metadata
        ffprobe(`./public/video/${filename}`, { path: ffprobeStatic.path }, function(err, info) {
          if (err) {
            console.log(err)
            return;
          }
          fps = parseFloat(info.streams[0].r_frame_rate);
          frameCount = parseInt(info.streams[0].nb_frames); // nb_frames not always accurate or available
          duration = parseFloat(info.streams[0].duration);
          console.log("Video Duration: " + duration);
          if (frameCount == 0) {
            frameCount = Math.round(duration * fps);
          }
          resolve("success");
        });
      });
    } else {
      filepath = link;
      frameCount = null;
      // Talk to YouTube API to receive video duration (needed to calculate fps & audio trigger)
      const youtubeId = extractYouTubeId(link);
      await fetch(`https://www.googleapis.com/youtube/v3/videos?id=16Ci_2bN_zc&part=contentDetails&key=${secret.youtube}`).then((res) => {
        console.log(res);
        res.json().then((data) => {
          duration = YTDurationToSeconds(data.items[0].contentDetails.duration);
          console.log("YouTube Duration: " + duration);
          resolve("success");
        });
      });
    }
  })

  .then(async () => {
    // Create JSON object
    const data = { "filepath": filepath };
  
    // Make request to python server
    new Promise(async (resolve, reject) => {
      try {
        await post(pyServer + pyPath, data).then((res) => {
          pythonPostResponse = JSON.parse(res);
          console.log(typeof(pythonPostResponse));
          detections = pythonPostResponse.data.detections;
          resolve(detections);
        });
      } catch (err) {
        console.log(err);
        return res.status(502).send('Bad Gateway:\nPython-Server not responding. Please try again!');
      }
    })
    
    .then(async () => {
      // API Calls
      const promises = [];                        // Array for collecting promises to wait for
      const audioJson = {"soundList":[]};         // JSON object for audio files
      let apiCallCounter = 0;                     // Keep track of API calls due to limited requests
      const apiCallLimit = 60;                    // Max number of API calls per minute
      const animalSet = new Set();                // Set for unique animals
      const apiCache = {};                        // Cache for API calls to avoid multiple requests for same animal
      let maxDiffSounds = 3;                      // Max number of different sounds per animal


      for (let detection of detections) {         // for every detection object
        for (let frame in detection) {            // for every frame
          for (let object of detection[frame]) {  // for every animal in frame
            const thing = object.object;
            console.log("Frame: " + frame + " | Count: " + object.count + " | Query: " + thing);
            if (animalList.includes(thing)) {
              animalSet.add(thing);               // add animal to set if included in filter list
            }
          }
        }
      }

      for (let animal of animalSet) {
        if (apiCallCounter >= apiCallLimit) { break; }
        apiCache[animal] = [];
        const filter = "duration:%5B1%20TO%206%5D"  // URL encoded: 'duration:[1 TO 6]' (seconds)

        try {
          await fetch(`https://freesound.org/apiv2/search/text/?query=${animal}&filter=${filter}&token=${secret.freesound}`).then((response) => {
            if (response.status == 200) {
              promises.push(new Promise((resolve, reject) => {
                response.json().then((json) => {
                  // Collect ids for query-matching sounds
                  for (let i = 0; i < maxDiffSounds; i++) {
                    // Abort if no more sounds available
                    if (json.results.length < i + 1) { break; }
                    apiCache[animal].push({"id": json.results[i].id, "url": null}); // Add id to apiCache
                  }
                  resolve("success");
                });
              }));
            } else {
              throw response.status;
            }
          });
        } catch (e) {
          console.error(e);
          if (e == 429) {
            console.error("Response Status: " + e);
            return res.status(429).send('Too many requests:\nFreesound-API has limited requests to 60 per minute. Please try again later!');
          } else {
            console.error("Response Status: " + e);
            return res.status(502).send('Bad Gateway:\nFreesound-API not responding. Please try again!');
          }
        }

        apiCallCounter++;
      }

            
      // Collect preview mp3 urls, when all promises have been resolved
      Promise.all(promises).then(async () => {
        promises.length = 0;
        for (let animal in apiCache) {
          if (apiCallCounter >= apiCallLimit) { break; }
          for (let soundObject of apiCache[animal]) {
            if (apiCallCounter >= apiCallLimit) { break; }
            try {
              await fetch(`https://freesound.org/apiv2/sounds/${soundObject.id}/?token=${secret.freesound}`).then((response) => {
                if (response.status == 200) {
                  promises.push(new Promise((resolve, reject) => {
                    response.json().then((json) => {
                      soundObject.url = json.previews["preview-lq-mp3"]; // Low quality mp3
                      resolve(detections);
                    });
                  }));  
                } else {
                  throw response.status;
                }
              });
            } catch (e) {
              console.error(e);
              if (e == 429) {
                console.error("Response Status: " + e);
                return res.status(429).send('Too many requests:\nFreesound-API has limited requests to 60 per minute. Please try again later!');
              } else {
                console.error("Response Status: " + e);
                return res.status(502).send('Bad Gateway:\nFreesound-API not responding. Please try again!');
              }
            }

            apiCallCounter++;
          }
        }
        
        Promise.all(promises).then(() => {
          console.log(apiCache);
          audioJson.filename = filename; // ATTENTION: filename needs to be included in the response!
          // Build audioJson from apiCache
          for (let frameDetection of detections) {         // for every detection object
            for (let frame in frameDetection) {            // for every frame
              console.log("Frame: " + frame);
              let counter = 0;                        // used to count sounds from apiCache
              for (let entry of frameDetection[frame]) {  // for every animal
                const animal = entry.object;
                if (animalList.includes(animal)) {
                  audioJson.soundList.push({"id": apiCache[animal][counter].id, "name": animal, "time": frame/fps, "url": apiCache[animal][counter].url});
                  counter++;
                }
                if (counter >= maxDiffSounds) { counter = 0; }
              }
            }
          }
          console.log(audioJson);
          res.send(audioJson);
        });
      });
    });
  });
});


// Delete specific video file
app.post('/', function(req, res) {
    console.log(req.body.file);
    if (req.body.file != undefined) {
      const filename = req.body.file;
      try {
        fs.unlinkSync(__dirname + '/public/video/' + filename);
      } catch (err) {
        console.error(err)
      }
      res.send({success: true})
    } else {
      res.send({success: false});
    } 
});

/**********************
 ** Helper functions **
 **********************/

// Function for making a POST request to another server
async function post(url, data) {
  const dataString = JSON.stringify(data)

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
    },
    timeout: 1000 * 60 * 15, // in ms
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => { // ! better use https when python is set up
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`))
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        const resString = Buffer.concat(body).toString()
        resolve(resString)
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(dataString)
    req.end()
  })
}

// Converts ISO8601 format to seconds
// https://stackoverflow.com/a/30134889
function YTDurationToSeconds(duration) {
  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  match = match.slice(1).map(function(x) {
    if (x != null) {
        return x.replace(/\D/, '');
    }
  });

  var hours = (parseInt(match[0]) || 0);
  var minutes = (parseInt(match[1]) || 0);
  var seconds = (parseInt(match[2]) || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
* @author J W & Sobral
* @url https://stackoverflow.com/a/27728417
* @date visited 2022-12-03
* @description Extracts the video ID from a YouTube link
* @param {string} url - YouTube link
*/
function extractYouTubeId(url) {
  const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(rx);
  return match[1];
}