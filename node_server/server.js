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

const { animalList } = require('./animals.js');

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
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/upload', /*async*/ (req, res) => {
  // Read file and check for mp4
  const file = req.files.file;
    if (file.mimetype != 'video/mp4') {
        res.status(400).send('Please make sure you have uploaded a video file (mp4).');
        return;
    }
    let fps;
    let duration;
    const fileName = Date.now() + ".mp4";
    file.mv(__dirname + '/public/video/' + fileName, () => { // Write file, then read metadata
      ffprobe(`./public/video/${fileName}`, { path: ffprobeStatic.path }, function(err, info) {
        if (err) {
          console.log(err)
          return;
        } 
        fps = parseFloat(info.streams[0].r_frame_rate);
      });
    });
    
    // TODO: Create JSON object to send to Python server

    // Make request to python server
    // TODO: Activate following two lines
    // const completeFilePath = '/node_server/public/video/' + fileName;
    // const pythonPostResponse = await post(pyServer + pyPath, JSON);

    // API 


    // JSON with freesound results
    // {
    //  cat: {timestamp: 1234567, audiosource: https://freesound.org/...}}, 
    //  horse: {}, 
    //  ...
    // }
    res.send("Test response");
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