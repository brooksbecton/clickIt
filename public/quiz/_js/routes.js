angular.module("quizModule").config(function($routeProvider) {
  $routeProvider
  .when("/create", {
      templateUrl : '/public/quiz/createQuiz.html',
      title: "Create",
      controller: 'quizCtrl'
  })
  .when("/join", {
      templateUrl : '/public/quiz/joinQuiz.html',
      title: "Join",
      controller: 'quizCtrl'
  })
  .when("/take", {
      templateUrl : '/public/quiz/takeQuiz.html',
      title: "Take",
      controller: 'quizCtrl'
  })
  .when("/welcome", {
      templateUrl : '/public/quiz/welcome.html',
      title: "Welcome",
  })
  .otherwise({
      templateUrl : '/public/quiz/welcome.html',
      title: "Welcome",
  });
});
