app.controller('leftNavCtrl', function ($http, $mdSidenav, $route, $rootScope, $scope) {

    var _this = this;
    this.toggleLeft = leftNavToggler('leftNav');

    function leftNavToggler(componentId) {
        return function () {
            $mdSidenav(componentId).toggle();
        }
    }
    this.LeftNavClose = function (componentId) {
        return $mdSidenav(componentId).close();
    }

    //Listening for route change success
    $rootScope.$on("$routeChangeSuccess", function (currentRoute, previousRoute) {
        //Change page title, based on Route information
        $rootScope.title = $route.current.title;
        _this.currentPage = $route.current.title;
        window.onload = function () {
            _this.LeftNavClose('leftNav');
        }
    });
});