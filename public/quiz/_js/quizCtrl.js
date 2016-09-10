   
var provider = new firebase.auth.GoogleAuthProvider();

angular.module("quizModule").controller('quizCtrl', function ($scope, $http, $location, $rootScope, $route) {

  $scope.quiz = {
    "id": '123',
    "questions": {
      "laksjdmasdbf,mnabsd": { "text": "What color is the sky?", "answers": ["Blue", "Recursion", "Green", "Red"], "correctAnswers": 0 },
      "m,absdfuicvnbakjsdv": { "text": "If a chicken had lips, would it whistle?", "answers": ["Yes", "No", "Singe Source of Truth Design", "Open/Close Principle"], "correctAnswers": 1 }
    },
    "quizName": "CSCI Final Exam",
  };
  $scope.errors = {};
  $scope.quizAnswers = initAnswers($scope.quiz);
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
  $scope.submitQuiz = function (quizId) {

    var data = {"answers": $scope.quizAnswers, 'quizId': quizId, "userId": $scope.user.uid}

    $http({
      data,
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
  function initAnswers(quiz) {
    var newAnswers = {};

    for (key in $scope.quiz['questions']) {
      newAnswers[key] = "";
    }

    return newAnswers;
  }

  $scope.requiredQuestionsMet = function(){
    if(quizForm.$invalid){
      return false;
    }
    else{
      return false;
    }
  }

  $scope.googleSignIn = function(){
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      $scope.googleToken = result.credential.accessToken;
      // The signed-in user info.
      $scope.user = result.user;
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      var credential = error.credential;
    });
  }

  $scope.userSignedIn = function(){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("true");
        return true;
      } else {
        console.log("false");
        return false;
      }
    });
  }

  $scope.signUserOut = function(){
    firebase.auth().signOut().then(function() {
      $location.path('/welcome');
    }, function(error) {
      var errorKey = 'signUserOut';
      $scope.errors[errorKey] = error;
    });
  }

  //When the page changes in routes, it will update the title of the page
  $rootScope.$on("$routeChangeSuccess", function (currentRoute, previousRoute) {
    //Change page title, based on Route information
    $rootScope.title = $route.current.title;
  });

})