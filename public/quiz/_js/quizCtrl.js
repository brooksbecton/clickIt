angular.module("quizModule").controller('quizCtrl', function ($scope, $http) {

  $scope.quiz = {
    "questions": {
       "laksjdmasdbf,mnabsd": { "text": "What color is the sky?", "answers": ["Blue", "Recursion", "Green", "Red"], "correctAnswers": 0 },
      "m,absdfuicvnbakjsdv": { "text": "If a chicken had lips, would it whistle?", "answers": ["Yes", "No", "Singe Source of Truth Design", "Open/Close Principle"], "correctAnswers": 1 }
    },
    "quizName": "CSCI Final Exam",
  };
  
  $scope.errors = {};

  $scope.quizAnswers = createBlanksAnswers($scope.quiz);

  $scope.getQuizQuestions = function (id) {
    $http({
      method: 'GET',
      url: '/quiz/questions'
    }).then(function success(response) {
      $scope.questions = response.data;
    }, function error(response) {
      var errorKey = 'getQuizQuestions';
      $scope.errors[errorKey] = response.statusText;
    });
  }

  $scope.submitQuiz = function () {
    console.log($scope.quizAnswers)
    $http({
      data: {answers: $scope.quizAnswers},
      method: 'POST',
      url: '/quiz/questions/answers'
    }).then(function success(response) {
      // $scope.questions = response.data;
    }, function error(response) {
      var errorKey = 'submitQuiz';
      $scope.errors[errorKey] = response.statusText;
      console.log(errorKey + ": " + $scope.errors[errorKey]);
    });
  }

  /*
    Creates an Answer Object that will be 
    sent to the server to be saved for the taker 
  */
  function createBlanksAnswers(quiz) {
    var newAnswers = {};

    for(key in $scope.quiz['questions']){
      newAnswers[key] = "";
    }

    return newAnswers;
  }

})