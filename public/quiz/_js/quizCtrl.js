app.controller('quizCtrl', ['$firebaseAuth', '$http', '$location', '$rootScope', '$routeParams', '$scope',
  function ($firebaseAuth, $http, $location, $rootScope, $routeParams, $scope, authService) {
    var auth = $firebaseAuth();
    $scope.errors = {};
    $scope.multiChoiceLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    $scope.changeView = function (view) {
      $location.path('/' + view);
    }

    $scope.editQuizDriver = function (quizId) {
      if ($scope.userSignedIn()) {
        $scope.getQuiz(quizId);
      } else {
      }
    }

    $scope.joinQuiz = function (quizId) {
      if ($scope.userSignedIn()) {
        var data = { "quizId": quizId };

        $http({
          data,
          method: 'POST',
          url: 'quiz/get/'
        }).then(function success(response) {
          var quiz = response.data.quiz.quiz;
          $scope.quizAnswers = initAnswers(quiz);
          $scope.quiz = quiz;
        }, function error(response) {
          var errorKey = 'submitQuiz';
          $scope.errors[errorKey] = response.statusText;
          redirectToErrorPage('400');
        });
      } else {
        console.log("User Not Logged In");
        var notSignedInPage = "notSignedIn";
        redirectToErrorPage(notSignedInPage);
      }
    }

    $scope.getQuizIdFromParam = function () {
      /**
       * If there is a quizId the URL, 
       * then it will take the user directly to the quiz
       */
      $scope.quizId = $routeParams.quizId;
      if ($scope.quizId) {
        $scope.joinQuiz($scope.quizId)
      }
    }

    /*
      Creates an Answer Object that will be 
      sent to the server to be saved for the taker 
    */
    function initAnswers(quiz) {
      var newAnswers = {};

      for (key in quiz['questions']) {
        newAnswers[key] = "";
      }

      return newAnswers;
    }

    function redirectToErrorPage(destination) {
      $location.path('/' + destination);
    }

    $scope.requiredQuestionsMet = function () {
      if (quizForm.$invalid) {
        return false;
      }
      else {
        return false;
      }
    }

    /*
      Sends answer object to back end for saving. 
    */
    $scope.submitQuizAnswers = function (quizId) {
      if ($scope.userSignedIn()) {
        var data = { "answers": $scope.quizAnswers, 'quizId': quizId, "userId": $scope.user.uid }

        $http({
          data,
          method: 'POST',
          url: 'quiz/submit/'
        }).then(function success(response) {
          $scope.changeView('quiz/success');
        }, function error(response) {
          var errorKey = 'submitQuiz';
          $scope.errors[errorKey] = response.statusText;
        });
      } else {
        redirectToErrorPage();
      }
    }

    /*
      Sends answer object to back end for saving. 
    */
    $scope.submitQuizEdits = function (quizId) {
      if ($scope.userSignedIn()) {
        var data = { "answers": $scope.quizAnswers, 'quizId': quizId, "userId": $scope.user.uid }

        $http({
          data,
          method: 'POST',
          url: 'quiz/submit/'
        }).then(function success(response) {

        }, function error(response) {
          var errorKey = 'submitQuiz';
          $scope.errors[errorKey] = response.statusText;
        });
      } else {
        redirectToErrorPage();
      }
    }

    $scope.userSignedIn = function () {
      if (auth.$getAuth()) {
        $scope.user = auth.$getAuth();
        return true;
      }
      else {
        $scope.user = null;
        return false;
      }
    }

  }])

app.factory('notify', ['$window', function (win) {
  var msgs = [];
  return function (msg) {
    msgs.push(msg);
    if (msgs.length === 3) {
      win.alert(msgs.join('\n'));
      msgs = [];
    }
  };
}])
