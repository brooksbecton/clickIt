angular.module("quizModule").controller('createQuizCtrl', function ($http, $mdSidenav, $route, $rootScope, $scope) {

  var _this = this;
  $scope.multiChoiceLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  this.addNewAnswer = function(questionId){
    _this.createdQuiz.questions[questionId].answers.push("");
  }

  this.addQuestion = function(){
    _this.createdQuiz.questions.push(_this.questionTemplate);
  }

  this.clearAnswer = function(questionId, answerId){
    _this.createdQuiz.questions[questionId].answers.splice(answerId, 1);
  }

  this.createdQuiz = {
    instructorName: "",
    quizName: "",
    public: false,
    quizType: '',
    questions: [
      {
        'text': "",
         'answers': [
         ""
        ]
      }
    ]
  }
});