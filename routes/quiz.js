var express = require('express');
var firebaseConfig = require('./../private/firebaseInfo.json');
var firebase = require("firebase");
var shortid = require('shortid');
var path = require('path');

var router = express.Router();

function Quizzer(){

  //Holds all instances of quizzes by Id
  var quizzes = {};
  var _this = this;

  this.addPlayerToQuiz = function(id, player){
    if(_this.quizExists(id)){
      quizzes[id]['students'].push(player);
      _this.writePlayerToDB(id, player);
    }
    else{
      console.log("Quiz does not exist");
    }
  }

  this.quizExists = function(id) {
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
    var quizId = generateId();

    newQuiz['id'] = quizId;
    newQuiz['instructor'] = qInstructor;
    newQuiz['quizName'] = qName;
    newQuiz['type'] = qType;

    quizzes[quizId] = newQuiz;

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

  this.writeAnswersToDB = function(userId, quizId, answers){
    firebase.database().ref('quizzes/' + quizId + /answers/ + userId + '/').set({
        answers
      });
  }

  this.writePlayerToDB = function(id, player){
    firebase.database().ref('quizzes/' + id + /players/ + player['id']).set({
      player
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
  router.get('*', function(req, res) {
    res.sendFile("main.html", { root: path.join(__dirname, '../public/quiz') });
  });

  /* 
    Watching for answers submitted by users
  */
  router.post('/questions/submit/', function (req, res) {
    var answers = req.body.answers;
    var quizId = req.body.quizId;  
    var userId = req.body.userId;

    quizzes[quizId]['answers'][quizId] 
    _this.writeAnswersToDB(userId, quizId, answers);

    res.send('success');
  });


} 

firebase.initializeApp({
  serviceAccount: "private/clickIt-97f9d21e813e.json",
  databaseURL: "https://clickit-5cb47.firebaseio.com",
});

function demoAddingUserToDB(quizMaster){
  var player =  {'id': '625344652434','name': 'bobb', 'score': 25};
  var id = 'SkKXjqb3';

  quizMaster.writePlayerToDB(id, player)
}

function demoInitQuiz(quizMaster){
  quizMaster.initQuiz('Dr. Oc', 'How to beat spiderman', 'multiChoice');
}

var quizMaster = new Quizzer;
// demoAddingUserToDB(quizMaster);
// demoInitQuiz(quizMaster);

module.exports = router;