angular.module("quizModule").controller('quizCtrl', function ($scope, $http, $rootScope, $route) {

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

  /*
    Sends answer object to back end for saving. 
  */
  $scope.submitQuiz = function () {
    $http({
      data: { answers: $scope.quizAnswers },
      method: 'POST',
      url: 'questions/submit/'
    }).then(function success(response) {

    }, function error(response) {
      var errorKey = 'submitQuiz';
      $scope.errors[errorKey] = response.statusText;
    });
  }

  /*
    Creates an Answer Object that will be 
    sent to the server to be saved for the taker 
  */
  function createBlanksAnswers(quiz) {
    var newAnswers = {};

    for (key in $scope.quiz['questions']) {
      newAnswers[key] = "";
    }

    return newAnswers;
  }

  //When the page changes in routes, it will update the title of the page
  $rootScope.$on("$routeChangeSuccess", function (currentRoute, previousRoute) {
    //Change page title, based on Route information
    $rootScope.title = $route.current.title;
  });

})