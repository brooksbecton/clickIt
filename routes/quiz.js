var express = require('express');
var cookieParser = require('cookie-parser');
var firebase = require("firebase");
var shortid = require('shortid');
var path = require('path');

var router = express.Router();

function Quizzer(){

  //Holds all instances of quizzes by Id
  var quizzes = {};
  var _this = this;

  this.addPlayerToQuiz = function(quizId, user){

    if(_this.quizExists(quizId)){
      _this.writeUserOnQuizToDB(quizId, user);
    }
    else{
    }
  }

  this.quizExists = function(id) {

    if (id in quizzes) {
      console.log("Quiz Exists");
      return true;
    
    } else {
      console.log("Quiz does not exist");
      return false;
    }
  }

  function generateId() {
    return shortid.generate();
  }

  this.initQuiz = function(qOwner, qInstructor, qName, qType, qWhiteList){
    var newQuiz = new multiChoiceQuiz();
    var quizId = generateId();

    newQuiz['id'] = quizId;
    newQuiz['instructor'] = qInstructor;
    newQuiz['quizName'] = qName;
    newQuiz['type'] = qType;
    newQuiz['whiteList'] = qWhiteList;
   
    quizzes[quizId] = newQuiz;

    _this.writeQuizToDB(qOwner['uid'], newQuiz);
    return newQuiz;
  };

  var multiChoiceQuiz = function(){
    var newQuiz = {
      'answers': {},
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
      'quizName': '',
      'users': [],
      'type': 'multiChoice',
      'whiteList' : []
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

  this.userWhiteListed = function(quizId, user){
    console.log(quizzes[id]);
    if(quizzes[id].whiteList.indexOf(user.email) >= 0){
      console.log("userWhiteListed!");
      return true;
    } else {
      console.log("user not white listed!");
      return false;
    }
  }

  this.getOwnerIdFromDB = function(quizId){
    var userQuizRef = firebase.database().ref('Quizzes/' + quizId);

    userQuizRef.on('value', function(snapshot) {
      return snapshot.val();
    });
  }

  this.writeAnswersToDB = function(ownerId, userId, quizId, answers){
    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + "/answers/" + userId + '/').set({
        answers
      });
  }

  this.writeUserOnQuizToDB = function(ownerId, quizId, user){
    firebase.database().ref('Users/' + ownerId + /quizzes/ + quizId + /users/ + user['uid']).set({
      user
    });
  }

  this.writeQuizToDB = function(ownerId, quiz){
    //Writing to Users Tree
    firebase.database().ref('Users/' + ownerId + "/quizzes/" +  quiz['id'] + '/').set({
      quiz: quiz
    });
    //Writing to Quizzes Composite Tree
    firebase.database().ref('Quizzes/' + quiz['id']).set({
      ownerId
    });
  }

  this.openQuiz = function(quizId, ownerId, open){
    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + '/quiz').update({
        open: open
      });
  }
  /* 
      Any request made to the quiz module will be sent the index.
      The index has AngularJS which is handling the routing. 
  */
  router.get('/', function(req, res) {
    res.sendFile("main.html", { root: path.join(__dirname, '../public/quiz') });
  });

  /*
    Watching for user editing quiz
   */
  router.get('/quiz/exists/', function (req, res) {
    var quizId = req.body.quizId;  
    var user = req.body.user;

    if(_this.quizExists()){
      res.send(true);
    } else {
      res.send(false);
    }

  });

  /*
    Watching for user editing quiz
   */
  router.post('/quiz/get/', function (req, res) {
    var quizId = req.body.quizId;  
    var userId = req.body.userId;

    var userQuizRef = firebase.database().ref('Users/' + userId + '/quizzes/' + quizId + "/quiz/");

    userQuizRef.on('value', function(snapshot) {
      res.send(snapshot.val());
    });

  });

  /*
    Watching for user joining quiz
   */
  router.post('/quiz/join/', function (req, res) {

    var quizId = req.body.quizId;  
    var user = req.body.user;


    var ownerId = _this.getOwnerIdFromDB(quizId);
    _this.addPlayerToQuiz(ownerId, quizId, user);

    res.send('success');
  });

  /* 
    Watching for answers submitted by users
  */
  router.post('/quiz/submit/', function (req, res) {
    var answers = req.body.answers;
    var quizId = req.body.quizId;  
    var userId = req.body.userId;

    quizzes[quizId]['answers'][userId] = answers;
    _this.writeAnswersToDB(userId, quizId, answers);

    res.end('success');
  });

  router.post('/quiz/start/', function (req, res) {
    var quizId = req.body.quizId;
    var userId = req.body.userId;
    var open = req.body.open;

    _this.openQuiz(quizId, userId, open);

    res.send('success');
  });

  router.post('/quiz/close/', function (req, res) {
    var quizId = req.body.quizId;
    var userId = req.body.userId;
    var open = req.body.open;

    _this.openQuiz(quizId, userId, open);

    res.send('success');
  });
} 

firebase.initializeApp({
  serviceAccount: "private/clickIt-97f9d21e813e.json",
  databaseURL: "https://clickit-5cb47.firebaseio.com",
});



function demoAddingUserToDB(user, quizMaster){
  quizMaster.writeUserOnQuizToDB(user)
}

function demoInitQuiz(quizMaster){
  var quiz = quizMaster.initQuiz(user, 'Dr. Oc', 'How to beat spiderman', 'multiChoice', ['broabect@ut.utm.edu', 'codethom@ut.utm.edu']);
  quizMaster.openQuiz(quiz['id'], user['uid'], true);
}

var quizMaster = new Quizzer;

var user = {'uid': 'URjfA80pOucgPReXYpjJo70t8Dh2', 'email': 'test@test.test', 'provider': 'google'};


// demoAddingUserToDB(user, quizMaster);
demoInitQuiz(quizMaster);

module.exports = router;