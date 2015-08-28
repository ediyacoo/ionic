angular.module('starter', ['ionic', 'ngCordovaOauth'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        //if(window.cordova && window.cordova.plugins.Keyboard) {
          //  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //}
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

.controller("ExampleController", function($scope, $cordovaOauth) {

    $scope.imgurLogin = function() {
        $cordovaOauth.imgur("CLIENT_ID_HERE").then(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log(JSON.stringify(error));
        });
    }

    $scope.twitterLogin = function() {
        $cordovaOauth.twitter("KPm1qydJ3r410snXWT33SOOL4", "zoV54ZlSi48MejCNG7uaKUXAWpXeHCjlCbJ5RV80YowA16OQyE").then(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log("error here!!!!")
            console.log(JSON.stringify(error));
        });
    }

    $scope.facebookLogin = function() {
        $cordovaOauth.facebook("APP_ID_HERE", ["email"], {"auth_type": "rerequest"}).then(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log(JSON.stringify(error));
        });
    }

});
