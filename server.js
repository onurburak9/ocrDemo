const Vision = require('@google-cloud/vision');
const path = require('path');
var http = require('http');
//require the express nodejs module
var express = require('express');
//set an instance of exress
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Creates a client
const vision = new Vision();

/*
 *   Server Creation
 */
var server = app.listen(8001, function() {
  var host = server.address().address
  var port = server.address().port
  console.log("Node Js app listening at http://" + host + port);
});

//-- serves static files
app.use('/', express.static("static"));


app.post('/ocr', function(req, res) {
  const fileName = path.resolve(req.body.name);
  console.log(fileName);
  // Performs text detection on the local file
  vision.textDetection({
      source: {
        filename: fileName
      }
    })
    .then((results) => {
      const detections = results[0].textAnnotations;
      console.log('Text:');
      detections.forEach((text) => console.log(text));
      res.send({
        code: 200,
        message: 'SUCCESS',
        data: detections
      })
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });

})



/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
