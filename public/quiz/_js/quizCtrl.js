
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBSEnJUtmbHxuS9p0E2BO5e6eF6NkwvCHE",
  authDomain: "clickit-5cb47.firebaseapp.com",
  databaseURL: "https://clickit-5cb47.firebaseio.com",
  storageBucket: "clickit-5cb47.appspot.com",
};
firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();

angular.module("quizModule").controller('quizCtrl', function ($scope, $http, $location, $rootScope, $route) {

  $scope.errors = {};
  $scope.multiChoiceLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  $scope.changeView = function(view){
    $location.path(view);
  }

  $scope.editQuizDriver = function (quizId) {
    if ($scope.userSignedIn()) {
      $scope.getQuiz(quizId);
    } else {
    }
  }

  $scope.getQuiz = function (quizId) {
    var data = { "quizId": quizId};

    $http({
      data,
      method: 'POST',
      url: 'quiz/get/'
    }).then(function success(response) {

        var quiz = response.data;
        $scope.quizAnswers = initAnswers(quiz);
        $scope.quiz = quiz;
    }, function error(response) {
      var errorKey = 'submitQuiz';
      $scope.errors[errorKey] = response.statusText;
      return undefined;
    });

  }

  $scope.googleSignIn = function () {
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      $scope.googleToken = result.credential.accessToken;
      // The signed-in user info.
      $scope.user = result.user;
      $scope.$apply();
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      var credential = error.credential;
    });
  }

  $scope.joinQuiz = function (quizId) {
    if ($scope.userSignedIn) {
      console.log($scope.user);
      var data = { 'quizId': quizId, "user": $scope.user }

      $http({
        data,
        method: 'POST',
        url: 'quiz/join/'
      }).then(function success(response) {
        $scope.getQuiz(quizId);
      }, function error(response) {
        var errorKey = 'joinQuiz';
        $scope.errors[errorKey] = response.statusText;
      });
    } else {
      console.log("User Not Logged In");
      var notSignedInPage = "notSignedIn";
      redirectToErrorPage(notSignedInPage);
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

  /*
    Factory that takes in a page to take a user to and redirects them there
   */
  function redirectToErrorPage(destination, errorMsg) {
    console.log("destination" + destination);
    console.log("errorMsg: " + errorMsg);
    console.log("yeah it be great if someone implemented this function, thanks");
  }

  $scope.requiredQuestionsMet = function () {
    if (quizForm.$invalid) {
      return false;
    }
    else {
      return false;
    }
  }

  $scope.signUserOut = function () {
    firebase.auth().signOut().then(function () {
      $location.path('/welcome');
    }, function (error) {
      var errorKey = 'signUserOut';
      $scope.errors[errorKey] = error;
    });
    $scope.user = undefined;
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
        alert("Answers Submitted!");      }, function error(response) {
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
    var user = firebase.auth().currentUser;

    if (user) {
      if ($scope.user == undefined){
         $scope.user = user; 
         $scope.$apply;
        }
      return true;
    } else {
      // No user is signed in.
      return false;
    }
  }

})