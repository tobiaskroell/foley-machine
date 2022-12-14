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
  debug: true,              // show debug messages
  safeFileNames: true,      // strips non-alphanumeric chars except dashes & underscores
  preserveExtension: true,  // preserves file extension, when using safeFileNames (default 3 chars)
  abortOnLimit: true,       // Returns HTTP 413 when size limit is reached
  useTempFiles: true,       // don't use RAM for uploaded files
}));

let ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static');

const https = require('https');
const http = require('http');
const fs = require("fs");

const { animalList } = require('./animals.js');

const secret = require('./secret.js');

/***********
 ** Hosts **
 ***********/
const pyServer = 'http://127.0.0.1:8000';
const pyPath = "/video"

/*********************
 ** Server listener **
 *********************/
const PORT = process.env.PORT || 3000;
app.listen(3000, function() {
    console.log(`Server started on port ${PORT}`);
});
app.timeout = 120000; // 2 minutes (ms); default is 2 minutes

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
  }).then(async () => {
    // Create JSON object
    const data = { "filepath": filepath };
  
    // Make request to python server
    new Promise(async (resolve, reject) => {
      await post(pyServer + pyPath, data).then((res) => {
        pythonPostResponse = JSON.parse(res);
        console.log(typeof(pythonPostResponse));
        const detections = pythonPostResponse.data.detections;
        resolve(detections);
      });
    }).then(async (detections) => {
      // API Calls
      const promises = [];                        // Array for collecting promises to wait for
      const audioJson = {"soundList":[]};
      for (let detection of detections) {         // for every detection object
        for (let frame in detection) {            // for every frame
          for (let object of detection[frame]) {  // for every animal
            const query = object.object;
            if (animalList.includes(query)) {
              const filter = "duration:%5B1%20TO%206%5D"  // URL encoded: 'duration:[1 TO 6]' (seconds)
              console.log("Frame: " + frame + " | Count: " + object.count + " | Query: " + query);
              await fetch(`https://freesound.org/apiv2/search/text/?query=${query}&filter=${filter}&token=${secret.freesound}`).then((res) => {
                promises.push(new Promise((resolve, reject) => {
                  res.json().then((json) => {
                    // TODO: Check if json response not empty
                    // Collect ids for query-matching sounds
                    for (let i = 0; i < object.count; i++) {
                      // Reset 'i' if there are no more results
                      if (json.results.length < object.count && i + 1 == json.results.length) { i = 0 }
                      audioJson.soundList.push({"id": json.results[i].id, "name": query, "time": frame/fps, "url": null});
                      // TODO: Calculate fps from python response on youtube videos
                    }
                    resolve("success");
                  });
                }));
              });
            }
          }
        }
      }
      // Collect preview mp3 urls, when all promises have been resolved
      Promise.all(promises).then(async () => {
        console.log(audioJson);
        promises.length = 0;
        for (let sound of audioJson.soundList) {
          await fetch(`https://freesound.org/apiv2/sounds/${sound.id}/?token=${secret.freesound}`).then((res) => {
            promises.push(new Promise((resolve, reject) => {
              res.json().then((json) => {
                sound.url = json.previews["preview-lq-mp3"]; // Low quality mp3
                resolve("success");
              });
            }));
          });
        }
        Promise.all(promises).then((resolveValues) => {
          audioJson.filename = filename; // ATTENTION: filename needs to be included in the response!
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
      fs.unlinkSync(__dirname + '/public/video/' + filename);
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