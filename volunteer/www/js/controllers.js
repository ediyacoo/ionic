var app={
    consumerKey:"KPm1qydJ3r410snXWT33SOOL4",
    consumerSecret:"zoV54ZlSi48MejCNG7uaKUXAWpXeHCjlCbJ5RV80YowA16OQyE",
    googleClientID:"641378541028-har1addb5dmfa0o2hkgnfoj0d0f63aae.apps.googleusercontent.com",
    isMobile: mobileAndTabletcheck()
}
//check mobile
function mobileAndTabletcheck() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}


//starter.controller module
angular.module('starter.controllers', ['ngCordovaOauth', 'ngStorage', 'ngResource', 'ngTwitter'])

//create shared service functions
.factory('mySharedService', function() {
  return {
    //oauth login
    oauth_login: function(type, callback){
        //type
        type=type || "twitter"

        var callback_path='//localhost'+location.pathname+'%23/app/callback',
            width=600,
            height=300,
            left=(screen.width/2)-(width/2),
            top=(screen.height/2)-(height/2),
            oauth_window = window.open('http://vision.sdsu.edu/hdma/auth/'+type+'?returnTo='+callback_path, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes,width='+width+',height='+height+',left='+left+',top='+top);

        if(app.interval){clearInterval(app.interval)}
        app.interval=setInterval(function(){
            if(oauth_window.closed){
              clearInterval(app.interval);

              if(callback){callback()}
            }
        }, 500)
    }
  };
})

//twitter service
.factory("TwitterService", function($cordovaOauth, $cordovaOauthUtility, $localStorage, $http, $resource, $q, $twitterApi){
  var oauth=$localStorage.oauth;

  function storeUserToken(data) {
    $localStorage.oauth=data
  }

  function getStoredToken() {
    return $localStorage.oauth
  }


  function createTwitterSignature(method, url, msg){

    var twitterOauth=oauth.twitter;

    if(oauth && twitterOauth && twitterOauth.token && twitterOauth.tokenSecret){
      var oauthObj={
            oauth_consumer_key: app.consumerKey,
            oauth_nonce: $cordovaOauthUtility.createNonce(32),
            oauth_signature_method: "HMAC-SHA1",
            oauth_token:twitterOauth.token,
            oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
            oauth_version: "1.0",
            status:msg
          },
          signatureObj=$cordovaOauthUtility.createSignature(method, url, oauthObj, {}, app.consumerSecret, twitterOauth.tokenSecret);

      $http.defaults.headers.common.Authorization=signatureObj.authorization_header;
    }
  }


  return {
    initialize: function() {
      var deferred = $q.defer();
      var token = getStoredToken();

      if (token !== null) {
          deferred.resolve(true);
      } else {
          $cordovaOauth.twitter(clientId, clientSecret).then(function(result) {
              storeUserToken(result);
              deferred.resolve(true);
          }, function(error) {
              deferred.reject(false);
          });
      }
      return deferred.promise;
    },

    isAuthenticated: function(){
      return oauth.token !== null;
    },

    retweet: function(){
      var url="https://api.twitter.com/1.1/statuses/update.json",
          msg="test",
          twitterOauth=oauth.twitter;


      /**
      //ngTwitter
      $twitterApi.configure(app.clientId, app.clientSecret, {oauth_token:twitterOauth.token, oauth_token_secret:twitterOauth.tokenSecret})
      console.log($http.defaults.headers.common.Authorization)
      $twitterApi.postStatusUpdate(msg).then(function(data){
        console.log(data)
      })
      */



      //$resource
      createTwitterSignature("POST", url, msg);
      console.log($http.defaults.headers.common.Authorization)
      return $resource(url, {'status':msg}).save();

    }

  } //end return

})


//login controller
.controller("LoginController", function($scope, $cordovaOauth){
  $scope.login=function(){
    console.log("login!!")
    mySharedService.oauth_login("twitter", function(){
      //console.log("login callback")
    })
  }
})



//login controller
.controller("TweetListCtrl", function($scope, $localStorage, $http, $location, $ionicModal, $ionicLoading, mySharedService, TwitterService){
  $scope.moment=moment;

  //show loading icon
  $ionicLoading.show();

  $http.jsonp("http://vision.sdsu.edu/hdma/volunteer/tweets?callback=JSON_CALLBACK")
    .success(function(json){
      console.log(json)
      $scope.tweetList=json;

      //hide loading icon
      $ionicLoading.hide();
    })

  // Create the share modal that we will use later
  $ionicModal.fromTemplateUrl('templates/share.html', {scope: $scope}).then(function(modal) {
    $scope.modal_share = modal;
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {scope: $scope}).then(function(modal) {
    $scope.modal_login = modal;
  });


  //click each tweet to open modal for share or login
  $scope.click=function(t){
    console.log(t)
    $scope.t=t

    //check if a user is logged in
    var oauth=$localStorage.oauth;
    console.log(oauth)
    if(oauth&&oauth.twitter){
      $scope.modal=$scope.modal_share;
    }else{
      $scope.modal=$scope.modal_login;
    }
    $scope.modal.show();
  }


  //close modal
  $scope.closeModal=function(){
    $scope.modal.hide();
  }


  //login
  $scope.login=function(){
    mySharedService.oauth_login("twitter", function(){
      console.log("login callback----------------------------")
      console.log($localStorage)
      if($localStorage.oauth&&$localStorage.oauth.twitter){
        $scope.modal.hide();
        $scope.modal=$scope.modal_share;
        $scope.modal.show();
      }
    });
  }


  //retweet
  $scope.retweet=function(){
    console.log("start retweet.........................")
    console.log($scope.t)

    var t=$scope.t,
        oauth=$localStorage.oauth.twitter;

    if(t&&oauth&&oauth.user_id){
      //retweet
      TwitterService.retweet();


      /**
      $http.jsonp("http://vision.sdsu.edu/hdma/volunteer/retweet?user_id="+oauth.user_id+"&tweet_id="+t.id_str+"&callback=JSON_CALLBACK")
        .success(function(json){
          console.log(json)
        })
      */

    }
  }


})


//setting controller
.controller("SettingCtrl", function($scope, $localStorage, $http, mySharedService){
  $scope.socialmedia={
    twitter:false,
    facebook:false,
    instagram:false
  }


  $scope.toggleChange=function(type){
    var value=$scope.socialmedia[type],
        oauth=$localStorage.oauth;

    //if user checked
    if(value){
      //if we don't have oauth id
      if(!oauth[type]){
        mySharedService.oauth_login(type)
      }
    }
  }


})


//callback controller
.controller("CallbackCtrl", function($scope, $localStorage, $location, $http){
  var params=$location.search();

  if(params){
    $localStorage.oauth=$localStorage.oauth || {};
    if(params["type"]&&params["type"]!=""){
      $localStorage.oauth[params["type"]]=params;
    }
  }

  //If we immediately close the window, it may not be ready to finish saving the oauth info in the localStorage
  //it seems need to wait a little bit.....
  setTimeout(function(){
    window.close();
  },300)
})


.controller('HomeCtrl', function($scope, $localStorage, mySharedService){
  $scope.login=function(){
    mySharedService.oauth_login("twitter", function(){
      console.log("login callback")
    })
  }
})




.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
/**
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  */
})
