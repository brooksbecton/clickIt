var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var quiz = require('./routes/quiz');

var firebaseConfig = require('./private/firebaseInfo.json');
var firebase = require("firebase");
var shortid = require('shortid');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);
app.use('/users', users);
app.use('/quiz', quiz);

function Quizzer(){

  var _this = this;

  this.addPlayerToQuiz = function(id, player){
    if(_this.quizExists(id)){
      quizzes[id]['students'].push(player);
      writePlayersToDB(id, quizzes[id]['students']);
    }
    else{
      console.log("Quiz does not exist");
    }
  }

  this.quizExists = function(id) {
    console.log(quizzes[id]);
    try {
      if (quizzes[id] != undefined) {
        return true;
      }
    } catch (err) {
      return false;
    }
  }

  function generateId() {
    return shortid.generate();
  }

  this.initQuiz = function(qInstructor, qName, qType){
    var newQuiz = new multiChoiceQuiz();
    var id = generateId();

    newQuiz['id'] = id;
    newQuiz['instructor'] = qInstructor;
    newQuiz['quizName'] = qName;
    newQuiz['type'] = qType;

    quizzes[id] = newQuiz;

    firebase.database().ref('quizzes/' + id).set({
      quiz: newQuiz
    });

    var player =  {'name': 'brooks', 'score': 10};
    _this.addPlayerToQuiz(id, player);
  };

  var multiChoiceQuiz = function(){
    var newQuiz = {
      'id': 0,
      'instructor': "Anonymous",
      'questions': [
        {
          'question': 'What color is the sky?',
          'answers': ['red', 'blue', 'green', 'yellow'],
          'questionPoints': 10
        },
        {
          'question': 'What color is the sun?',
          'answers': ['red', 'blue', 'green', 'yellow'],
          'questionPoints': 10
        },
      ],
      'quizName': 'Unnamed Quiz',
      'students': [],
      'type': 'multiChoice'
    }
    return newQuiz;
  }

  var multiChoiceTaker = function(){
    var newTaker = {
      'id': "",
      'name': "",
      'score': 0
    }
  }

  function writePlayersToDB(id, players){
    firebase.database().ref('quizzes/' + id + /players/).set({
      players
    });
  }

  //Holds all instances of quizzes by Id
  var quizzes = {};

} 

//Firebase
var config = {
  apiKey: firebaseConfig['apiKey'],
  authDomain: firebaseConfig['authDomain'],
  databaseURL: firebaseConfig['databaseURL'],
  storageBucket: firebaseConfig['storageBucket']
};
firebase.initializeApp(config);

var quizMaster = new Quizzer;
app.set('quizMaster', quizMaster);
quizMaster.initQuiz('Dr. Oc', 'How to beat Spiderman', 'multiChoice');



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
