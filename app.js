require('dotenv').config();
var express = require('express');
const path = require('path');
const {
  v4: uuidv4
} = require('uuid');

var app = module.exports = express();
var server = "http://localhost:3000";

app.use(express.urlencoded());
app.use(express.json());

// Create new experiment
app.get('/api/experiment/newurl', function (req, res, next) {
  return res.send(server + "/static/criticalspacing.html");
});

// get experiment 
app.get('/criticalspacing/:experientid', function (req, res, next) {
  var experientid = req.params.experientid;
  res.sendFile(path.join(__dirname, './public', 'criticalspacing.html'));
});

// Register New User
app.post('/register', (req, res) => {
  const username = req.body.username;
  var experimentid = uuidv4();

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("criticalspacing");
    var myobj = [{
      username: username,
      experimentid: experimentid
    }, ];
    dbo.collection("experiment").insertMany(myobj, function (err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });

  return res.redirect('/criticalspacing/' + experimentid);
})

// Get experiment JSON from o.json file. This is a JSON/Matlab struct converted to JSON provided by Prof Pelli
app.get('/api/experimentdata', function (req, res, next) {
  var fs = require('fs');

  return res.send(JSON.parse(fs.readFileSync('o.json', 'utf8')));
});

// Get Results of an experiment
app.get('/api/result/:experimentid', function (req, res, next) {
  var experimentid = req.params.experimentid;
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";
  var value;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("criticalspacing");
    var query = {
      experimentid: experimentid
    };
    dbo.collection("experiment").find().toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      return res.send(value);

    });
  });

});

app.get('/api/getAllExperiments', function(req, res, next) {
  var MongoClient = require('mongodb').MongoClient;
  var dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/";
  MongoClient.connect(dbUrl, function (err, db) {
    if(err) {
      console.log("Error during establishing DB connection");
      console.log(err);
      return;
    }
    var dbo = db.db("criticalspacing");
    dbo.collection("questExperiment1").find().toArray(function(err, result) {
      if(err) {
        console.log("Error during getting documents");
        console.log(err);
        return;
      }
      db.close();
      console.log("RESULT: ", result);
      return res.send(result);
    });
  });
});


app.post('/api/addExperiment', function(req, res, next) {
  var MongoClient = require('mongodb').MongoClient;
  var dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/";
  var experiment = req.body;
  var experimentId = experiment['exprerimentId'];
  console.log("Trying to establish DB connection for experimentId: ", experimentId);
  MongoClient.connect(dbUrl, function (err, db) {
    if(err) {
      console.log("Error during establishing DB connection for experimentId: ", experimentId);
      console.log(err);
      return;
    }
    console.log("Successfully established DB connection for experimentId: ", experimentId);
    var dbo = db.db("criticalspacing");
    dbo.collection("questExperiment1").insertOne(experiment, function(err, res) {
      if(err) {
        console.log("Error during inserting experimentId: ", experimentId);
        console.log(err);
        return;
      }
      console.log("Successfully inserted experimentId: ", experimentId);
      console.log("Closing DB connection for experimentId: ", experimentId);
      db.close();
      console.log("Successfully closed DB connection for experimentId: ", experimentId);
    });
  });
})

// Post final results of an experiment
app.post('/api/result/:experimentid', function (req, res, next) {
  var experimentid = req.params.experimentid;

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";
  var experimentdata = req.body;
  console.log(experimentdata);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var dbo = db.db("criticalspacing");
    var query = {
      experimentid: experimentid
    };
    var newvalues = {
      $set: {
        experimentdata: experimentdata,
        experimentid: experimentid
      }
    };
    var newData = {
      experimentdata: experimentdata,
      experimentid: experimentid
    };
    dbo.collection("experiment").insertOne(newData, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });

});


app.use('/static', express.static(path.join(__dirname, '/public')));

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    error: err.message
  });
});

app.use(function (req, res) {
  res.status(404);
  res.send({
    error: "404 not found"
  });
});

if (!module.parent) {
  const port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Express started on port 3000');
}
