app.controller('quizCrudCtrl', function($http, $location, $mdSidenav, $route, $rootScope, $scope) {

    var _this = this;
    $scope.multiChoiceLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    this.addNewAnswer = function(questionId) {
        _this.quiz.questions[questionId].answers.push("");
    }

    this.addQuestion = function() {
        var newQuestion = {
            'question': "",
            'answers': [
                ""
            ]
        }
        _this.quiz.questions.push(newQuestion);
        _this.quizKey.push([]);
    }

    function answersToBool(answerStrings) {
        if (answerStrings != undefined) {
            answerStrings.forEach(function(question, qIndex) {
                if (typeof (question) == "Array" || typeof (question) == "object") {
                    question.forEach(function(correctAnswer, cIndex) {
                        if (answerStrings[qIndex][cIndex]) {
                            answerStrings[qIndex][cIndex] = true;
                        } else {
                            answerStrings[qIndex][cIndex] = null;
                        }
                    });
                }
                if (typeof (question) == "string") {
                    answerStrings[qIndex] = [true];
                }
            });
        }

        return answerStrings;
    }

    this.clearAnswer = function(questionId, answerId) {
        _this.quiz.questions[questionId].answers.splice(answerId, 1);
        _this.quizKey[questionId].splice(answerId, 1);
    }

    this.clearQuestion = function(questionId) {
        _this.quiz.questions.splice(questionId, 1);
        _this.createdQuestionsWorth.splice(questionId, 1);
    }

    this.getQuiz = function(quizId) {
        if ($scope.userSignedIn()) {

            var data = { "quizId": quizId };

            $http({
                data,
                method: 'POST',
                url: 'quiz/get/'
            }).then(function success(response) {
                _this.quiz = response.data.quiz.quiz;
                _this.quizKey = answersToBool(response.data.answers);
                _this.createdQuestionsWorth = response.data.answerWorth;
            }, function error(response) {
                var errorKey = 'submitQuiz';
                $scope.errors[errorKey] = response.statusText;
                redirectToErrorPage('400');
            });
        } else {
            var notSignedInPage = "notSignedIn";
            redirectToErrorPage(notSignedInPage);
        }
    }

    this.quiz = {
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

    this.quizKey = [[]];
    this.createdQuestionsWorth = [];

    /**
     * Changes Booleans in createdQuestionsKey
     * to the answer strings 
     */
    function boolToAnswers(answerStrings) {
        answerStrings.forEach(function(question, qIndex) {
            if (typeof (question) == "Array") {
                question.forEach(function(correctAnswer, cIndex) {
                    if (answerStrings[qIndex][cIndex] == true) {
                        answerStrings[qIndex][cIndex] = _this.quiz.questions[qIndex].answers[cIndex];
                    }
                });
            }
            if (typeof (question) == "object") {
                for (key in question) {
                    if (answerStrings[qIndex][key] == true) {
                        answerStrings[qIndex][key] = _this.quiz.questions[qIndex].answers[key];
                    }
                }
            }
            if (typeof (question) == "string") {
                answerStrings[qIndex] = _this.quiz.questions.answers[qIndex];
            }
        });
        return answerStrings;
    }

    this.submitQuiz = function() {
        _this.quizKey = boolToAnswers(_this.quizKey);

        if ($scope.userSignedIn()) {
            var data = {
                'userId': $scope.user.uid,
                'answerKey': _this.quizKey,
                'quiz': _this.quiz,
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
            var notSignedInPage = "notSignedIn";
            redirectToErrorPage(notSignedInPage);
        }
    }

    this.updateQuiz = function() {
        _this.quizKey = boolToAnswers(_this.quizKey);

        if ($scope.userSignedIn()) {
            var data = {
                'answerKey': _this.quizKey,
                'quiz': _this.quiz,
                'questionsWorth': _this.createdQuestionsWorth,
                'userId': $scope.user.uid
            };

            $http({
                data,
                method: 'POST',
                url: 'quiz/update/'
            }).then(function success(response) {
                $location.path('/create/success');
            }, function error(response) {
                var errorKey = 'createQuiz';
                $scope.errors[errorKey] = response.statusText;

                redirectToErrorPage('400');

            });
        } else {
            var notSignedInPage = "notSignedIn";
            redirectToErrorPage(notSignedInPage);
        }
    }

    // this.quiz = testQuiz.quiz;
    // this.quizKey = answersToBool(testQuiz.answerKey);
    // this.createdQuestionsWorth = testQuiz.questionsWorth;

});