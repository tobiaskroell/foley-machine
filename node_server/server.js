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

const { freesoundToken } = require('./secret.js');

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
app.post('/upload', /*async*/ (req, res) => {
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
          if (frameCount == 0) {
            duration = parseFloat(info.format.duration);
            frameCount = Math.round(duration * fps);
          }
        });
      });
    } else {
      filepath = link;
      frameCount = null;
    }
    
    // Create JSON object
    const data = {
      "filepath": filepath,
      "frameCount": frameCount
    };

    // Make request to python server
    // TODO: Activate following line
    // const pythonPostResponse = await post(pyServer + pyPath, data);
    /* {
      "file": {video_name},
      "total_frames": {total_frames},
      "objects":
        {
          "01": [
            {
              "object_": "cat",
              "count": 2,
            },
            {
              "object_": "dog",
              "count": 1,
            },
          ],
          "02": [
            {
              "object_": "horse",
              "count": 3,
            },
          ],
        }
    } */

    // TODO: API call freesound.org

    // JSON with freesound results
    /* {
      "soundList":
        [{ "name": "cat", "time": 1, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
          , { "name": "dog", "time": 2, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
          , { "name": "chicken", "time": 3, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }
          , { "name": "bird", "time": 3.5, "url": "https://cdn.freesound.org/previews/316/316920_4921277-lq.mp3" }]
    }  */
    res.send({filename: filename}); // ATTENTION: filename needs to be included in the response!
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