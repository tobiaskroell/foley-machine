/******************
 ** Requirements **
 ******************/
let express = require('express');
let app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let fileUpload = require('express-fileupload');
app.use(fileUpload());

const https = require('https')

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