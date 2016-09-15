var express = require('express');
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
      quizzes[quizId]['users'].push(user);
      _this.writeUserToDB(quizId, user);
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

  this.initQuiz = function(qInstructor, qName, qType, qWhiteList){
    var newQuiz = new multiChoiceQuiz();
    var quizId = generateId();

    newQuiz['id'] = quizId;
    newQuiz['instructor'] = qInstructor;
    newQuiz['quizName'] = qName;
    newQuiz['type'] = qType;
    newQuiz['whiteList'] = qWhiteList;
   
    quizzes[quizId] = newQuiz;
    console.log(quizId);
    _this.writeQuizToDB(quizId, newQuiz);
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

  this.writeAnswersToDB = function(userId, quizId, answers){
    firebase.database().ref('quizzes/' + quizId + /answers/ + userId + '/').set({
        answers
      });
  }

  this.writeUserToDB = function(quizId, user){
    firebase.database().ref('quizzes/' + quizId + /users/ + user['uid']).set({
      user
    });
  }

  this.writeQuizToDB = function(id, quiz){
    firebase.database().ref('quizzes/' + id).set({
      quiz: quiz
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
    var user = req.body.user;

    console.log(quizId);
    console.log(quizzes);
    if((quizId in quizzes)){
      res.send(quizzes[quizId]);
    } else {
      res.send(false);
    }

  });

  /*
    Watching for user joining quiz
   */
  router.post('/quiz/join/', function (req, res) {
    var quizId = req.body.quizId;  
    var user = req.body.user;

    _this.addPlayerToQuiz(quizId, user);

    res.end('success');
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

} 

firebase.initializeApp({
  serviceAccount: "private/clickIt-97f9d21e813e.json",
  databaseURL: "https://clickit-5cb47.firebaseio.com",
});

function demoAddingUserToDB(quizMaster){
  var player =  {'id': '625344652434','name': 'bobb', 'score': 25};
  var id = 'SkKXjqb3';

  quizMaster.writeUserToDB(id, player)
}

function demoInitQuiz(quizMaster){
  quizMaster.initQuiz('Dr. Oc', 'How to beat spiderman', 'multiChoice', ['broabect@ut.utm.edu', 'codethom@ut.utm.edu']);
}

var quizMaster = new Quizzer;
// demoAddingUserToDB(quizMaster);
demoInitQuiz(quizMaster);

module.exports = router;