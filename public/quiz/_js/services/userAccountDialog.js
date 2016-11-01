
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBSEnJUtmbHxuS9p0E2BO5e6eF6NkwvCHE",
    authDomain: "clickit-5cb47.firebaseapp.com",
    databaseURL: "https://clickit-5cb47.firebaseio.com",
    storageBucket: "clickit-5cb47.appspot.com",
};
firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();

app.service('userAccountDialog', ['$mdDialog', function ($mdDialog) {

    console.log("userAccountDialog");

    this.showUserDialog = function (ev) {
        $mdDialog.show({
            templateUrl: '../public/quiz/signInDialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: this.customFullscreen // Only for -xs, -sm breakpoints.
        })
    }

    this.googleSignIn = function (callback) {
        var user = {};
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            this.googleToken = result.credential.accessToken;
            // The signed-in user info.
            user = result.user;
            $mdDialog.hide();
            callback(user);
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            var credential = error.credential;
            return null;
        });
    }

    this.userSignedIn = function () {
        var user = firebase.auth().currentUser;

        if (user) {
            if (this.user == undefined) {
                this.user = user;
                this.$apply;
            }
            return true;
        } else {
            return false;
        }
    }

    this.signUserOut = function () {
        firebase.auth().signOut().then(function () {
            $mdDialog.hide();
        }, function (error) {
            console.log("ERROR: sign out error\n" + error);
        });
        this.user = undefined;
    }

}])