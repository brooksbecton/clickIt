angular.module("quizModule").config(function ($routeProvider) {
    $routeProvider
        .when("/400", {
            templateUrl: '/public/quiz/400.html',
            title: "Quiz Not Found",
            controller: 'quizCtrl'
        })
        .when("/contactUs", {
            templateUrl: '/public/quiz/contactUs.html',
            title: "Contact Us",
            controller: 'quizCtrl'
        })
        .when("/create", {
            templateUrl: '/public/quiz/createQuiz.html',
            title: "Create",
            controller: 'quizCtrl'
        })
        .when("/edit", {
            templateUrl: '/public/quiz/editQuiz.html',
            title: "Edit",
            controller: 'quizCtrl'
        })
        .when("/join", {
            templateUrl: '/public/quiz/takeQuiz.html',
            title: "Take",
            controller: 'quizCtrl'
        })
        .when("/take", {
            templateUrl: '/public/quiz/takeQuiz.html',
            title: "Take",
            controller: 'quizCtrl'
        })
        .when("/welcome", {
            templateUrl: '/public/quiz/welcome.html',
            title: "Home",
        })
        .when("/", {
            templateUrl: '/public/quiz/welcome.html',
            title: "Home",
        })
        .otherwise({
            templateUrl: '/public/quiz/404.html',
            title: "Page Not Found",
        });
});
