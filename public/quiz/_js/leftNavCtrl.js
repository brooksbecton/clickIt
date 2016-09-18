angular.module("quizModule").controller('leftNavCtrl', function ($http, $mdSidenav, $route, $rootScope, $scope) {

    $scope.toggleLeft = leftNavToggler('leftNav');


    function leftNavToggler(componentId) {
        return function () {
            $mdSidenav(componentId).toggle();
        }
    }
    $scope.LeftNavClose = function(componentId) {
        return $mdSidenav(componentId).close();
    }

  //Listening for route change success
  $rootScope.$on("$routeChangeSuccess", function (currentRoute, previousRoute) {
    //Change page title, based on Route information
    $rootScope.title = $route.current.title;
    $scope.LeftNavClose('leftNav');

  });

});