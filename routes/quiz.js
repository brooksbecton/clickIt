var express = require('express');
var cookieParser = require('cookie-parser');
var firebase = require("firebase");
var shortid = require('shortid');
var path = require('path');

var router = express.Router();

function Quizzer() {

    var _this = this;

    this.__init__ = function() {
        getQuizzesFromDB(function(dbQuizzes) {
            _this.quizzes = dbQuizzes;
        });
    }

    this.addPlayerToQuiz = function(ownerId, quizId, user) {
        console.log(ownerId + ' ' + quizId + ' ' + user);
        _this.writeUserOnQuizToDB(ownerId, quizId, user);
    }

    this.quizExists = function(id) {
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

    this.initQuiz = function(qOwner, qInstructor, qName, qType, qWhiteList) {
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

    var multiChoiceQuiz = function() {
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

    var multiChoiceTaker = function() {
        var newTaker = {
            'id': "",
            'name': "",
            'score': 0
        }
    }

    this.userWhiteListed = function(quizId, user) {
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

        dbQuizzesRef.on('value', function(snapshot) {
            callback(snapshot.val())
        });
    }

    this.getOwnerIdFromQuizId = function(quizId, callback) {
        var ownerId = "";
        var userQuizRef = firebase.database().ref('Quizzes/' + quizId + "/");

        userQuizRef.once('value', function(snapshot) {
            ownerId = snapshot.val().ownerId;
            callback(ownerId);
        });

    }

    this.getAnswersFromQuiz = function(quizId, callback) {
        _this.getOwnerIdFromQuizId(quizId, function(ownerId) {
            var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/');
            userQuizRef.once('value', function(snapshot) {
                answerKey = snapshot.val().answerKey;
                callback(answerKey);
            });
        });
    }

    this.getQuestionsFromQuiz = function(ownerId, quizId, callback) {
        var questionRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/quiz/');
        questionRef.once('value', function(snapshot) {
            questions = snapshot.val().questions;
            callback(questions);
        });
    }

    this.getAllUserAnswersFromQuiz = function(ownerId, quizId, callback) {
        var answersRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/')
        answersRef.once('value', function(snapshot) {
            answers = snapshot.val().answers;
            callback(answers);
        })

    }

    this.getUserAnswersFromQuiz = function(quizId, userId, callback) {
        _this.getOwnerIdFromQuizId(quizId, function(ownerId) {
            var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/answers/' + userId + '/');
            userQuizRef.once('value', function(snapshot) {
                answers = snapshot.val().answers;
                callback(answers);
            });
        });
    }

    this.getQuestionsWorthFromQuiz = function(quizId, callback) {
        _this.getOwnerIdFromQuizId(quizId, function(ownerId) {
            var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/');

            userQuizRef.once('value', function(snapshot) {
                questionsWorth = snapshot.val().questionsWorth;
                callback(questionsWorth);
            });

        });
    }

    this.getQuizFromDB = function(quizId, callback) {
        _this.getOwnerIdFromQuizId(quizId, function(ownerId) {
            var userQuizRef = firebase.database().ref('Users/' + ownerId + '/quizzes/' + quizId + '/');
            userQuizRef.once('value', function(snapshot) {
                quiz = snapshot.val();
                callback(quiz);
            });
        });
    }

    this.getScoreFromDB = function(quizId, userId, callback) {

        _this.getOwnerIdFromQuizId(quizId, function(ownerId) {
            var userRef = firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + "/answers/");
            userRef.once('value', function(snapshot) {
                if (snapshot.hasChild(userId)) {
                    var userScorRef = firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + "/answers/" + userId + '/');
                    userScorRef.once('value', function(snapshot) {
                        score = snapshot.val().score;
                        callback(score);
                    });
                }
            });
        });

    }

    this.writeAnswersToDB = function(ownerId, userId, quizId, answers, callback) {
        firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + "/answers/" + userId + '/').set({
            answers
        });

        var answerKey = [];
        var questionsWorth = [];
        _this.getAnswersFromQuiz(quizId, function(aKey) {
            answerKey = aKey;
            _this.getQuestionsWorthFromQuiz(quizId, function(worth) {
                questionsWorth = worth;
                callback(ownerId, quizId, userId, answerKey, questionsWorth, answers, _this.writeScoreToDB);
            });
        });
    }

    this.writeUserOnQuizToDB = function(ownerId, quizId, user) {
        firebase.database().ref('Users/' + ownerId + /quizzes/ + quizId + /users/ + user['uid']).set({
            user
        });
    }

    this.writeScoreToDB = function(ownerId, quizId, userId, score) {
        firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + "/answers/" + userId + '/').update({
            score
        });
    }

    // Added answerKey and questionsWorth to this. questionsWorth is an array of numbers that determine how much a question is worth.
    this.writeQuizToDB = function(ownerId, quiz, answerKey, questionsWorth) {

        //Writing quiz to Users Tree
        firebase.database().ref('Users/' + ownerId + "/quizzes/" + quiz['id'] + '/').update({
            quiz: quiz
        });

        //Writing quizId to Quizzes Composite Tree
        firebase.database().ref('Quizzes/' + quiz['id']).update({
            ownerId
        });

        firebase.database().ref('Users/' + ownerId + "/quizzes/" + quiz['id'] + '/').update({
            answerKey
        });

        firebase.database().ref('Users/' + ownerId + "/quizzes/" + quiz['id'] + '/').update({
            questionsWorth
        });
    }

    this.openQuiz = function(quizId, ownerId, open) {
        firebase.database().ref('Users/' + ownerId + "/quizzes/" + quizId + '/quiz').update({
            open: open
        });
    }

    this.gradeQuiz = function(ownerId, quizId, userId, answerKey, questionsWorth, userAnswers, callback) {
        console.log(answerKey);

        //If the quiz is not a poll
        if (answerKey != undefined) {
            var keyLength = answerKey.length;
        }
        else {
            var keyLength = 0;
        }
        var score = 0;

        for (i = 0; i < keyLength; i++) {

            var correct = 0;
            var aKey = [];
            if (typeof answerKey[i] == 'object') {
                aKey = Object.keys(answerKey[i]).map(function(key) { return answerKey[i][key]; });
            }
            else {
                aKey = answerKey[i];
            }

            for (j = 0; j < aKey.length; j++) {
                if (aKey[j] == userAnswers[i]) {
                    correct++;
                }
            }
            if (questionsWorth != undefined) {
                if (correct > 0) {
                    score += questionsWorth[i];
                }
            }

        }
        callback(ownerId, quizId, userId, score)
    }

    this.tallyAnswers = function(ownerId, quizId) {
        graphArray = []
        _this.getQuestionsFromQuiz(ownerId, quizId, function(questions) {
            //console.log("length of object = " + questions.length)
            for (i = 0; i < questions.length; i++) {
                graphArray[i] = { 'question': questions[i].question }
            }
            //console.log(graphArray)
            _this.getAllUserAnswersFromQuiz(ownerId, quizId, function(answers) {
                // Cycle through the different users that have taken the quiz
                for (var key in answers) {
                    if (answers.hasOwnProperty(key)) {
                        var value = answers[key].answers;
                        // Cycle through the current users answers.
                        for (j = 0; j < value.length; j++) {
                            // If the object has the key, ++ the value
                            if (graphArray[j].hasOwnProperty(value[j])) {
                                //graphArray[j].value[j]++
                                var temp = value[j];
                                var tempNum = Number(graphArray[j][temp]);
                                tempNum = tempNum + 1;
                                graphArray[j][temp] = tempNum;
                            }
                            // If the object doesn't have the key, set it to one.
                            else {
                                var temp = value[j];
                                graphArray[j][temp] = 1;
                            }//End else
                        }// End looping through a users answers
                    }// End if answers.hasOwnProperty
                }// End looping through all users
                console.log(graphArray);
                return graphArray;
            });
        });
    }
    /**
     * 
     * 
     * Routers
     * 
     * 
     */
    router.get('/', function(req, res) {
        res.sendFile("main.html", { root: path.join(__dirname, '../public/quiz') });
    });
    router.post('/quiz/close/', function(req, res) {
        var quizId = req.body.quizId;
        var userId = req.body.userId;
        var open = req.body.open;

        _this.openQuiz(quizId, userId, open);

        res.send('success');
    });
    router.post('/quiz/create/', function(req, res) {
        var userId = req.body.userId;
        var answerKey = req.body.answerKey;
        var quiz = req.body.quiz;
        var questionsWorth = req.body.questionsWorth;

        quiz.id = generateId();

        _this.writeQuizToDB(userId, quiz, answerKey, questionsWorth);

        res.send('success');
    });
    router.post('/quiz/get/', function(req, res) {
        var quizId = req.body.quizId;

        //Holds the quiz, answerKey, and questionPoints
        var fullQuiz = {};

        if (_this.quizExists(quizId)) {
            _this.getQuizFromDB(quizId, function(quiz) {
                fullQuiz.quiz = quiz;
                _this.getAnswersFromQuiz(quizId, function(answers) {
                    fullQuiz.answers = answers;
                    _this.getQuestionsWorthFromQuiz(quizId, function(answersWorth) {
                        fullQuiz.answerWorth = answersWorth;
                        res.send(fullQuiz);
                    });
                });
            });

        } else {
            res.send('fail', 400);
        }
    });
    router.post('/quiz/join/', function(req, res) {
        var user = req.body.user;
        var quizId = req.body.quizId;
        if (_this.quizExists(quizId)) {
            var ownerId = "";
            _this.getOwnerIdFromQuizId(quizId, function(oId) {
                ownerId = oId;
            });

            _this.addPlayerToQuiz(ownerId, quizId, user);

            res.send('success');
        } else {
            res.status(400);
            res.send('fail');
        }
    });
    router.post('/quiz/submit/', function(req, res) {
        var answers = req.body.answers;
        var quizId = req.body.quizId;
        var userId = req.body.userId;
        if (_this.quizExists(quizId)) {
            var ownerId = "";
            _this.getOwnerIdFromQuizId(quizId, function(oId) {
                ownerId = oId;
                _this.writeAnswersToDB(ownerId, userId, quizId, answers, _this.gradeQuiz);
            });

            //_this.gradeQuiz(ownerId, quizId, userId, _this.writeScoreToDB);

            res.send('success');
        } else {
            res.status(400);
            res.send('fail');
        }
    });
    router.post('/quiz/start/', function(req, res) {
        var quizId = req.body.quizId;
        var userId = req.body.userId;
        var open = req.body.open;

        _this.openQuiz(quizId, userId, open);

        res.send('success');
    });
    router.post('/quiz/update/', function(req, res) {
        var answerKey = req.body.answerKey;
        var quiz = req.body.quiz;
        var questionsWorth = req.body.questionsWorth;
        var userId = req.body.userId;

        res.send('success');

        _this.writeQuizToDB(userId, quiz, answerKey, questionsWorth);
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
    var quizId = 'H1u5d98yx';
    quizMaster.getOwnerIdFromQuizId(quizId, function(ownerId) {
        console.log('here');
        console.log('ownerID: ' + ownerId);
    });

}
function demoGetAnswersFromQuiz(quizMaster) {
    var quizId = 'HknHpQ21g';
    quizMaster.getAnswersFromQuiz(quizId, function(answerKey) {
        console.log('answerKey: ' + answerKey);
    });
}
function demoGetQuestionsWorthFromQuiz(quizMaster) {
    var quizId = 'H1u5d98yx';
    quizMaster.getQuestionsWorthFromQuiz(quizId, function(worth) {
        console.log('Worth: ' + worth);
    });
}

function demoGetScoreOfUser(quizMaster) {
    var quizId = 'fatcat';
    var userId = '91aPci8asxWp9MyB4pEEGGqUUxu2'
    quizMaster.getScoreFromDB(quizId, userId, function(score) {
        console.log('Score: ' + score)
    });
}

function demoTallyAnswers(quizMaster) {
    var quizId = 'utm';
    var ownerId = 'URjfA80pOucgPReXYpjJo70t8Dh2';

    quizMaster.tallyAnswers(ownerId, quizId);
}

var quizMaster = new Quizzer;

var user = { 'uid': 'URjfA80pOucgPReXYpjJo70t8Dh2', 'email': 'test@test.test', 'provider': 'google' };

quizMaster.__init__();

// demoAddingUserToDB(user, quizMaster);
// demoInitQuiz(quizMaster);
// demoGetOwnerIdFromQuizId(quizMaster);
// demoGetAnswersFromQuiz(quizMaster);
// demoGetQuestionsWorthFromQuiz(quizMaster);
// demoGetScoreOfUser(quizMaster);
// demoTallyAnswers(quizMaster);
module.exports = router;