/******************
 ** Requirements **
 ******************/
let express = require('express');
let app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let fileUpload = require('express-fileupload');
app.use(fileUpload());

let ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static');

const https = require('https');
const fs = require("fs");

const { animalList } = require('./animals.js');

const secret = require('./secret.js');

/***********
 ** Hosts **
 ***********/
const pyServer = 'localhost:8000';
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

  if (file != false) {
    // Read file and check for mp4
      if (file.mimetype != 'video/mp4') {
          res.status(400).send('Please make sure you have uploaded a video file (mp4).');
          return;
      }
      filename = Date.now() + ".mp4";
      filepath = '../node_server/public/video/' + filename;
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
        });
      });
    } else {
      filepath = link;
      frameCount = null;
      // Talk to YouTube API to receive video duration
      // Video duration needed to calculate fps & audio trigger
      const youtubeId = extractYouTubeId(link);
      await fetch(`https://www.googleapis.com/youtube/v3/videos?id=16Ci_2bN_zc&part=contentDetails&key=${secret.youtube}`).then((res) => {
        const data = res.json().then((data) => {
          duration = YTDurationToSeconds(data.items[0].contentDetails.duration);
          console.log("YouTube Duration: " + duration);
          // TODO: Call Function to handle Freesound API
        });
      });
    }
    
    // Create JSON object
    const data = {
      "filepath": filepath
    };

    // Make request to python server
    // TODO: Activate following line
    // const pythonPostResponse = await post(pyServer + pyPath, data);
    const pythonPostResponse = { // TODO: Exchange with line above
      "status": "SUCCESS",
      "data": {
        "file": filename,
        "total_frames": 700,
        "objects": [
          {
            "1" : [
              {
                "object": "goose",
                "count": "1",
              },
            ],
            "181" : [
              {
                "object": "goose",
                "count": "2",
              },
              {
                "object": "goose",
                "count": "1",
              }
            ],
            "361" : [
              {
                "object": "goose",
                "count": "1",
              },
            ],
            "541" : [
              {
                "object": "goose",
                "count": "3",
              },
            ],
          }
        ]
      }
    };
    const detections = pythonPostResponse.data.objects[0];

    // API Calls
    const promises = [];
    const audioJson = {"soundList":[]};
    for (let frame in detections) { // for every frame
      for (let object of detections[frame]) { // for every animal
        const query = object.object;
        console.log("Frame: " + frame + " | Count: " + object.count + " | Query: " + query);
        await fetch(`https://freesound.org/apiv2/search/text/?query=${query}&token=${secret.freesound}`).then((res) => {
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
    // Collect preview mp3 urls, when all promises have been resolved
    Promise.all(promises).then(async (resolveValues) => {
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
    timeout: 1000, // in ms
  }

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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
* @date visited: 2022-12-03
* @description: Extracts the video ID from a YouTube link
* @param {string} url - YouTube link
*/
function extractYouTubeId(url) {
  const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(rx);
  return match[1];
}