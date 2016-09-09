var express = require('express');
var firebaseConfig = require('./../private/firebaseInfo.json');
var firebase = require("firebase");
var shortid = require('shortid');
var path = require('path');

var router = express.Router();

/* 
    Any request made to the quiz module will be sent the index.
    The index has AngularJS which is handling the routing. 
*/
router.get('*', function(req, res) {
  res.sendFile("main.html", { root: path.join(__dirname, '../public/quiz') });
});

/* 
  Watching for answers submitted by takers
*/
router.post('/questions/submit/', function (req, res) {
  var answers = req.body.answers;
  console.log(answers);
  res.send('success');
  //TODO Store answers in DB
});

function writeAnswers(user, id, answers){
  firebase.database().ref('quizzes/' + id + /answers/ + user['answers']).set({
      answers
    });
}

function Quizzer(){

  var _this = this;

  this.addPlayerToQuiz = function(id, player){
    if(_this.quizExists(id)){
      quizzes[id]['students'].push(player);
      writePlayerToDB(id, player);
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
    var quizId = generateId();

    newQuiz['id'] = quizId;
    newQuiz['instructor'] = qInstructor;
    newQuiz['quizName'] = qName;
    newQuiz['type'] = qType;

    quizzes[quizId] = newQuiz;

    writeQuizToDB(quizId, newQuiz);

    var player =  {'id': generateId(),'name': 'brooks', 'score': 10};
    _this.addPlayerToQuiz(quizId, player);
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

  function writePlayerToDB(id, player){
    firebase.database().ref('quizzes/' + id + /players/ + player['id']).set({
      player
    });
  }

  function writeQuizToDB(id, quiz){
    firebase.database().ref('quizzes/' + id).set({
      quiz: quiz
    });
  }

  //Holds all instances of quizzes by Id
  var quizzes = {};
} 

firebase.initializeApp({
  serviceAccount: "private/clickIt-97f9d21e813e.json",
  databaseURL: "https://clickit-5cb47.firebaseio.com",
});

var quizMaster = new Quizzer;
// quizMaster.initQuiz('Dr. Oc', 'How to beat spiderman', 'multiChoice');

module.exports = router;