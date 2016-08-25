var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('quiz/index', { title: '' });
});

/* GET start quiz page */
router.get('/create', function(req, res, next) {
  res.render('quiz/createQuiz', { title: 'Create' });
});

/* GET join quiz page */
router.get('/join', function(req, res, next) {
  res.render('quiz/joinQuiz', { title: 'Join' });
});

/* GET start quiz page */
router.post('/start', function(req, res, next) {
  var id = req.body.id;

  //Need to figure out how to access quizMaster from app.js
  if(quizMaster.quizExists(id)){

    console.log("Good connect for start quiz");
    console.log("ID: " + req.body.id)
    res.render('quiz/startQuiz', { title: 'Start' });
  }
  else {
    console.log("ERROR: Bad connect for start quiz");
    console.log("ID: " + req.body.id)
    res.render('quiz/startQuizFail', { 
        title: 'Start', 
        error: 'Missing Quiz Id' 
    });
  }

});



module.exports = router;
