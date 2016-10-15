angular.module("quizModule").controller('createQuizCtrl', function ($http, $location, $mdSidenav, $route, $rootScope, $scope) {

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

  /**
   * Changes Booleans in createdQuestionsKey
   * to the answer strings 
   */
  function processCorrectAnswers() {
    _this.createdQuiz.questions.forEach(function (question, i) {
      if (_this.createdQuizKey[i]) {
        _this.createdQuizKey[i] = question.answers[i];
      }
    });
  }

  this.submitQuiz = function () {
    processCorrectAnswers();

    if ($scope.userSignedIn()) {
      var data = {
        'userId': $scope.user.uid,
        'answerKey': _this.createdQuizKey,
        'quiz': _this.createdQuiz,
        'questionsWorth': _this.createdQuestionsWorth
      };

      $http({
        data,
        method: 'POST',
        url: 'quiz/create/'
      }).then(function success(response) {
            $location.path('/create/success');
      }, function error(response) {
        var errorKey = 'createQuiz';
        $scope.errors[errorKey] = response.statusText;

        redirectToErrorPage('400');

      });
    } else {
      console.log("User Not Logged In");
      var notSignedInPage = "notSignedIn";
      redirectToErrorPage(notSignedInPage);
    }
  }

  function userSignedIn() {
    var user = firebase.auth().currentUser;

    if (user) {
      if ($scope.user == undefined) {
        $scope.user = user;
        $scope.$apply;
      }
      return true;
    } else {
      return false;
    }
  }

});