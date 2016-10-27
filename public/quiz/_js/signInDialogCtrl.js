
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBSEnJUtmbHxuS9p0E2BO5e6eF6NkwvCHE",
  authDomain: "clickit-5cb47.firebaseapp.com",
  databaseURL: "https://clickit-5cb47.firebaseio.com",
  storageBucket: "clickit-5cb47.appspot.com",
};
firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();


angular.module("quizModule").controller('signInDialogCtrl', ['$mdDialog', '$scope', function ($mdDialog, $scope) {

    this.showAdvanced = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: '../public/quiz/signInDialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })


        function DialogController($scope, $mdDialog) {

            $scope.googleSignIn = function () {
                firebase.auth().signInWithPopup(provider).then(function (result) {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    $scope.googleToken = result.credential.accessToken;
                    // The signed-in user info.
                    $scope.user = result.user;
                    console.log($scope.user);
                    $scope.$apply();
                    $mdDialog.hide();
                }).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    var credential = error.credential;
                });
            }

            $scope.userSignedIn = function () {
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
            
            $scope.signUserOut = function () {
                firebase.auth().signOut().then(function () {
                    $mdDialog.hide();
                }, function (error) {
                    var errorKey = 'signUserOut';
                    $scope.errors[errorKey] = error;
                });
                $scope.user = undefined;
            }

        }
    }
}]);

