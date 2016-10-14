angular.module("quizModule").controller('createQuizCtrl', function ($http, $mdSidenav, $route, $rootScope, $scope) {

  var _this = this;
  $scope.multiChoiceLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  this.addNewAnswer = function (questionId) {
    _this.createdQuiz.questions[questionId].answers.push("");
  }

  this.addQuestion = function () {
       var newQuestion = {
        'question': "",
        'answers': [
          ""
        ]
      }
    _this.createdQuiz.questions.push(newQuestion);
    _this.createdQuizKey.push([]);
  }

  this.clearAnswer = function (questionId, answerId) {
    _this.createdQuiz.questions[questionId].answers.splice(answerId, 1);
  }

  this.createdQuiz = {
    id: "",
    instructor: "",
    open: false,
    questions: [
      {
        'question': "",
        'answers': [
          ""
        ]
      }
    ],
    quizName: "",
    type: '',
    whiteList: []
  }

  this.createdQuizKey = [[]];
  this.createdQuestionsWorth = [];

  this.submitQuiz = function () {
    if ($scope.userSignedIn()) {
      var data = { 'quiz': _this.createdQuiz }

      $http({
        data,
        method: 'POST',
        url: 'quiz/create/'
      }).then(function success(response) {
      }, function error(response) {
        var errorKey = 'joinQuiz';
        $scope.errors[errorKey] = response.statusText;

        redirectToErrorPage('400');

      });
    } else {
      console.log("User Not Logged In");
      var notSignedInPage = "notSignedIn";
      redirectToErrorPage(notSignedInPage);
    }
  }

});