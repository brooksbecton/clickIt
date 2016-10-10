var express = require('express');
var cookieParser = require('cookie-parser');
var firebase = require("firebase");
var shortid = require('shortid');
var path = require('path');

var router = express.Router();

function Quizzer() {

  var _this = this;

  this.__init__ = function () {
    getQuizzesFromDB(function(dbQuizzes){
      _this.quizzes = dbQuizzes;
    });
  }

  this.addPlayerToQuiz = function (ownerId, quizId, user) {
    console.log(ownerId + ' ' + quizId  + ' ' + user);
    _this.writeUserOnQuizToDB(ownerId, quizId, user);
  }

  this.quizExists = function (id) {
    for (key in _this.quizzes) {
      if (id == key) {
        return true;
      }
    }
    return false;
  }

  function generateId() {
    return shortid.generate();
  }

  this.initQuiz = function (qOwner, qInstructor, qName, qType, qWhiteList) {
    var newQuiz = new multiChoiceQuiz();
    var quizId = generateId();
    newQuiz['id'] = quizId;
    newQuiz['instructor'] = qInstructor;
    newQuiz['quizName'] = qName;
    newQuiz['type'] = qType;
    newQuiz['whiteList'] = qWhiteList;

    _this.writeQuizToDB(qOwner['uid'], newQuiz, ['red', 'blue'], [10, 10]);
    return newQuiz;
  };

  var multiChoiceQuiz = function () {
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
      'whiteList': []
    }
    return newQuiz;
  }

  var multiChoiceTaker = function () {
    var newTaker = {
      'id': "",
      'name': "",
      'score': 0
    }
  }

  this.userWhiteListed = function (quizId, user) {
    console.log(_this.quizzes[id]);
    if (quizzes[id].whiteList.indexOf(user.email) >= 0) {
      console.log("userWhiteListed!");
      return true;
    } else {
      console.log("user not white listed!");
      return false;
    }
  }

  function getQuizzesFromDB(callback) {
    var dbQuizzesRef = firebase.database().ref('Quizzes/');

    dbQuizzesRef.on('value', function (snapshot) {
      callback(snapshot.val())
    });
  }

  this.getOwnerIdFromQuizId = function (quizId, callback) {
    var ownerId = "";
    var userQuizRef = firebase.database().ref('Quizzes/' + quizId + "/");

    userQuizRef.on('value', function (snapshot) {
      ownerId = snapshot.val().ownerId;
      // console.log("getOwnerIdFromQuizId " + "with " + quizId);
      // console.log("found: " + ownerId);
      callback(ownerId);
    });

  }

  this.getAnswersFromQuiz = function (quizId, callback) {
    _this.getOwnerIdFromQuizId(quizId, function (ownerId) {
      var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/');
      userQuizRef.on('value', function (snapshot) {
        answerKey = snapshot.val().answerKey;
        callback(answerKey);
      });
    });
  }

  this.getUserAnswersFromQuiz = function (quizId, userId, callback) {
    _this.getOwnerIdFromQuizId(quizId, function (ownerId) {
      var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/answers/' + userId + '/');
      userQuizRef.on('value', function (snapshot) {
        answers = snapshot.val().answers;
        callback(answers);
      });
    });
  }

  this.getQuestionsWorthFromQuiz = function (quizId, callback) {
    _this.getOwnerIdFromQuizId(quizId, function (ownerId) {
      var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/');
      userQuizRef.on('value', function (snapshot) {
        questionsWorth = snapshot.val().questionsWorth;
        callback(questionsWorth);
      });
    });
  }

  // Adding grade quiz here.
  this.writeAnswersToDB = function (ownerId, userId, quizId, answers) {
    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + "/answers/" + userId + '/').set({
      answers
    });
  }

  this.writeUserOnQuizToDB = function (ownerId, quizId, user) {
    firebase.database().ref('Users/' + ownerId + /quizzes/ + quizId + /users/ + user['uid']).set({
      user
    });
  }

  // Added answerKey and questionsWorth to this. questionsWorth is an array of numbers that determine how much a question is worth.
  this.writeQuizToDB = function (ownerId, quiz, answerKey, questionsWorth) {
    //Writing to Users Tree
    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quiz['id'] + '/').set({
      quiz: quiz
    });
    //Writing to Quizzes Composite Tree
    firebase.database().ref('Quizzes/' + quiz['id']).set({
      ownerId
    });

    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quiz['id'] + '/').update({
      answerKey
    });

    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quiz['id'] + '/').update({
      questionsWorth
    });
  }

  this.openQuiz = function (quizId, ownerId, open) {
    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + '/quiz').update({
      open: open
    });
  }

  this.gradeQuiz = function (ownerId, quizId, userId) {
    var answerKey = [];
    var questionsWorth = [];
    var userAnswers = [];

    _this.getAnswersFromQuiz(quizId, function(aKey){
      answerKey = aKey;
    });

    _this.getQuestionsWorthFromQuiz(quizId, function(worth){
      questionsWorth = worth;
    });

    _this.getUserAnswersFromQuiz(quizId, userId, function(answers){
      userAnswers = answers;
    })

    keyLength = answerKey.length;
    var score = 0;
    for (i = 0; i < keyLength; i++){
      if (answerKey[i] == userAnswers[i]){
        score += questionsWorth[i];
      }
    }

    firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + "/answers/" + userId + '/').update({
      score
    });

  }

  /**
   * 
   * 
   * Routers
   * 
   * 
   */
  router.get('/', function (req, res) {
    res.sendFile("main.html", { root: path.join(__dirname, '../public/quiz') });
  });
  router.post('/quiz/get/', function (req, res) {
    var quizId = req.body.quizId;
    if (_this.quizExists(quizId)){
      var ownerId = _this.getOwnerIdFromQuizId(quizId, function (ownerId) {

        var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + "/quiz/");

        userQuizRef.on('value', function (snapshot) {
          res.send(snapshot.val());
        });
      });
    } else {
      res.status(400);
      res.send('fail');
    }
  });
  router.post('/quiz/close/', function (req, res) {
    var quizId = req.body.quizId;
    var userId = req.body.userId;
    var open = req.body.open;

    _this.openQuiz(quizId, userId, open);

    res.send('success');
  });
  router.post('/quiz/join/', function (req, res) {
    var user = req.body.user;
    var quizId = req.body.quizId;
    if (_this.quizExists(quizId)) {
      var ownerId = "";
      _this.getOwnerIdFromQuizId(quizId, function(oId){
        ownerId = oId;
      });

      _this.addPlayerToQuiz(ownerId, quizId, user);

      res.send('success');
    } else {
      res.status(400);
      res.send('fail');
    }
  });
  router.post('/quiz/submit/', function (req, res) {
    var answers = req.body.answers;
    var quizId = req.body.quizId;
    var userId = req.body.userId;
    if (_this.quizExists(quizId)) {
      var ownerId = "";
      _this.getOwnerIdFromQuizId(quizId, function(oId){
        ownerId = oId;
      });
      
      _this.writeAnswersToDB(ownerId, userId, quizId, answers);
      _this.gradeQuiz(ownerId, quizId, userId);

      res.send('success');
    } else {
      res.status(400);
      res.send('fail');
    }
  });
  router.post('/quiz/start/', function (req, res) {
    var quizId = req.body.quizId;
    var userId = req.body.userId;
    var open = req.body.open;

    _this.openQuiz(quizId, userId, open);

    res.send('success');
  });
}

firebase.initializeApp({
  serviceAccount: "private/clickIt.json",
  databaseURL: "https://clickit-5cb47.firebaseio.com",
});



function demoAddingUserToDB(user, quizMaster) {
  quizMaster.writeUserOnQuizToDB(user)
}
function demoInitQuiz(quizMaster) {
  var quiz = quizMaster.initQuiz(user, 'Dr. Oc', 'How to beat spiderman', 'multiChoice', ['broabect@ut.utm.edu', 'codethom@ut.utm.edu']);
  quizMaster.openQuiz(quiz['id'], user['uid'], true);
}
function demoGetOwnerIdFromQuizId(quizMaster) {
  var quizId = 'fatcat';
  quizMaster.getOwnerIdFromQuizId(quizId, function (ownerId) {
    console.log('here');
    console.log('ownerID: ' + ownerId);
  });

}
function demoGetAnswersFromQuiz(quizMaster) {
  var quizId = 'fatcat';
  quizMaster.getAnswersFromQuiz(quizId, function (answerKey) {
    console.log('answerKey: ' + answerKey);
  });
}

function demoGetQuestionsWorthFromQuiz(quizMaster) {
  var quizId = 'Skcq9zFA';
  quizMaster.getQuestionsWorthFromQuiz(quizId, function (worth) {
    console.log('Worth: ' + worth);
  });
}

var quizMaster = new Quizzer;

var user = { 'uid': 'URjfA80pOucgPReXYpjJo70t8Dh2', 'email': 'test@test.test', 'provider': 'google' };

quizMaster.__init__();

// demoAddingUserToDB(user, quizMaster);
demoInitQuiz(quizMaster);
//demoGetOwnerIdFromQuizId(quizMaster);
//demoGetAnswersFromQuiz(quizMaster);
//demoGetQuestionsWorthFromQuiz(quizMaster);
module.exports = router;