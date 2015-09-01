//starter.controller module
angular.module('starter.controllers', ['ngCordova', 'ngStorage', 'ngResource', 'ngTwitter'])

//create shared service functions
.factory('mySharedService', function($location, $http, $q, $localStorage) {
  return {
    //oauth login
    oauth_login: function(type, callback){
        //type
        type=type || "twitter"

        var callback_path='//'+$location.$$host+location.pathname+'%23/app/callback',
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
    },

    //check mobile
    mobileAndTabletcheck: function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    },

    //tweets
    tweets:[],

    //momeont
    moment: moment,

    //get tweet
    getOESTweet: function(){
      var $defer=$q.defer(),
          that=this;

      $http.jsonp("http://vision.sdsu.edu/hdma/volunteer/tweets?callback=JSON_CALLBACK")
        .success(function(json){
          if(json&&json.length>0){
            $defer.resolve(json);
          }else{
            $defer.reject("cannot get OES tweets (length=0)");
          }
        }).error(function(err){
          $defer.reject(err)
        })

      return $defer.promise;
    },


    //store oauth
    storeOauth: function(type, value) {
      type=type || "twitter";
      value=value || null;

      $localStorage.oauth=$localStorage.oauth || {};
      $localStorage.oauth[type]=value;
    },


    //get stored oauth info
    getOauth: function(type) {
      type=type || "twitter"
      return ($localStorage.oauth && $localStorage.oauth[type])?$localStorage.oauth[type]:null
    },


    //find volunteers in the most interest area
    findVolunteer: function(){
      var twitterOauth=this.getOauth("twitter"),
          defer=$q.defer(),
          that=this; //+"?callback=JSON_CALLBACK";

      //check if the user already login and check their screen_name
      if(twitterOauth && twitterOauth.screen_name){
        var url="http://vision.sdsu.edu/hdma/volunteer/findVolunteer/"+twitterOauth.screen_name;

        $http.get(url).then(function(result){
          if(result&&result.data){
            that.volunteers=result.data;
            defer.resolve(result.data)
          }else{
            defer.reject("cannot find any volunteer based on your interested area")
          }
        }, function(err){
          defer.reject(JSON.stringify(err))
        });
      }else{
        defer.reject("no twitter oauth or no screen_name");
      }

      //return promise
      return defer.promise;
    },


    //volunteers array. The data will be retrieved from the findVoluntter function
    volunteers:[],


    //check volunteers
    checkVolunteer: function(screen_name){
      var output=false,
          defer=$q.defer();

      if(screen_name && screen_name!=""){
        $http.get("http://vision.sdsu.edu/hdma/volunteer/checkVolunteer?screen_name="+screen_name).then(function(result){
          if(result&&result.isValidate){
            defer.resolve(true)
          }else{
            defer.reject(result)
          }
        }, function(err){
          defer.reject(err);
        })
      }else{
        defer.reject("no screen_name")
      }

      return defer.promise;
    }


  };
})


//twitter service
.factory("TwitterService", function($cordovaOauth, $cordovaOauthUtility, $localStorage, $http, $resource, $q){
  var clientId="KPm1qydJ3r410snXWT33SOOL4",
      clientSecret="zoV54ZlSi48MejCNG7uaKUXAWpXeHCjlCbJ5RV80YowA16OQyE";

  function storeUserToken(data) {
    $localStorage.oauth=data
  }

  function getStoredToken() {
    return $localStorage.oauth
  }


  function createTwitterSignature(method, url){
    var twitterOauth=getStoredToken().twitter;

    if(twitterOauth && twitterOauth.oauth_token && twitterOauth.oauth_token_secret){
      var oauthObj={
            oauth_consumer_key: clientId,
            oauth_nonce: $cordovaOauthUtility.createNonce(10),
            oauth_signature_method: "HMAC-SHA1",
            oauth_token: twitterOauth.oauth_token,
            oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
            oauth_version: "1.0"
          },
          signatureObj=$cordovaOauthUtility.createSignature(method, url, oauthObj, {}, clientSecret, twitterOauth.oauth_token_secret);

      $http.defaults.headers.common.Authorization=signatureObj.authorization_header;

      if(method=='POST'){
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      //$http.defaults.headers.common["Content-Type"]="application/x-www-form-urlencoded";

    }
  }


  return {
    initialize: function() {
      var deferred = $q.defer();
      var token = getStoredToken();

      if (token !== null) {
          deferred.resolve(token.twitter);
      } else {
          //twitter login
          $cordovaOauth.twitter(clientId, clientSecret).then(function(result) {
              //storeUserToken({twitter:result});
              deferred.resolve(result);
          }, function(error) {
              deferred.reject(false);
          });
      }
      return deferred.promise;
    },

    isAuthenticated: function(){
      return $localStorage.oauth && $localStorage.oauth !== null && $localStorage.oauth.twitter !== null;
    },

    retweet: function(t){
      var deferred=$q.defer();

      if(t&&t.id_str){
        var url="https://api.twitter.com/1.1/statuses/retweet/"+t.id_str+".json";

        //$resource
        createTwitterSignature("POST", url);

        $resource(url).save(null, null, function(result){
          deferred.resolve(result);
        }, function(err){
          deferred.reject(err);
        });

      }else{
        deferred.reject("no tweet obj");
      }

      return deferred.promise;
    },

    //get home time line
    getHomeTimeline: function(){
      var url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
      createTwitterSignature('GET', url);
      return $resource(url).query();
    },

    //get User profile
    getUserProfile: function(screen_name){
      if(user_id && user_id !="" && screen_name && screen_name!=""){
        var url = 'https://api.twitter.com/1.1/users/show.json?screen_name='+screen_name;
        createTwitterSignature('GET', url);
        return $resource(url).query();
      }
    }



  } //end return

})




//*************************************************
//controller
//*************************************************

//login controller
.controller("LoginController", function($scope, $cordovaOauth){
  $scope.login=function(){
    console.log("login!!")
    mySharedService.oauth_login("twitter", function(){
      //console.log("login callback")
    })
  }
})


//tweet list controller
.controller("TweetListCtrl", function($scope, $localStorage, $http,  $ionicModal, $ionicLoading, $ionicPopup, mySharedService, TwitterService,  $ionicPlatform){
  $scope.moment=mySharedService.moment;

  //if there is no existed tweets, manully get tweets
  if(!mySharedService.tweets || mySharedService.tweets.length==0){
    //show loading icon
    $ionicLoading.show();

    mySharedService.getOESTweet().then(function(json){
      $scope.tweetList=json

      //hide loading icon
      $ionicLoading.hide();
    }, function(err){
      $ionicPopup.alert({
        title:"Error",
        template:JSON.stringify(err)
      })
    })
  }


  // Create the share modal that we will use later
  $ionicModal.fromTemplateUrl('templates/share.html', {scope: $scope}).then(function(modal) {
    $scope.modal_share = modal;
  });


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {scope: $scope}).then(function(modal) {
    $scope.modal_login = modal;
  });


  //show popup alert
  function showAlert(title, msg){
    $ionicPopup.alert({
      title:title || "ERROR",
      template:msg || "ERROR"
    });
  }


  //refresh oes tweet
  $scope.refreshOESTweet=function(){
    mySharedService.getOESTweet().then(function(result){
      $scope.tweetList=result;
      $scope.$broadcast('scroll.refreshComplete')
    }, function(err){
      $ionicPopup.alert({
        title:"Error",
        template:JSON.stringify(err)
      })
    })
  }



  //click each tweet to open modal for share or login
  $scope.click=function(t){
    console.log(t)
    $scope.t=t

    //check if a user is logged in
    var oauth=null; //$localStorage.oauth;
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
    $ionicPlatform.ready(function(){

      //twitter auth
      TwitterService.initialize().then(function(result){
        if(result){
          //check if the volunteer
          mySharedService.checkVolunteer(result.screen_name).then(function(output){
            console.log(output)

            //save twitter info in the localStorage.auth.twitter
            TwitterService.storeUserToken({twitter:result});

            $scope.modal.hide();
            $scope.modal=$scope.modal_share;
            $scope.modal.show();


            //get user profile and save back to db
            TwitterService.getUserProfile(resul.screen_name).then(function(userProfile){
              console.log(userProfile)
            }, function(err){
              console.log(err)
            })


          }, function(err){
            $ionicPopup.alert({
              title:"Error",
              template:JSON.stringify(err)
            })
          });




        }
      }, function(err){
        showAlert("ERROR-LOGIN", JSON.stringify(err))
      })
    })

    /**
    mySharedService.oauth_login("twitter", function(){
      console.log("login callback----------------------------")
      console.log($localStorage)
      if($localStorage.oauth&&$localStorage.oauth.twitter){
        $scope.modal.hide();
        $scope.modal=$scope.modal_share;
        $scope.modal.show();
      }
    });
    */
  }


  //retweet
  $scope.retweet=function(){
    var t=$scope.t,
        oauth=mySharedService.getOauth("twitter");

    if(t&&oauth&&oauth.user_id){
      //retweet
      //client side seems not working. There will be CORS (cross-domain issues)
      TwitterService.retweet(t).then(function(result){
        console.log(result)
        showAlert("Succeed", "Retweet Succeed! <br><button class='button icon-left ion-social-twitter button-calm' ng-click=''>Please click here to see the retweet!</button>")
      }, function(err){
        var title='ERROR-RETWEET',
            msg=JSON.stringify(err)

        //check error status==403
        if(err.status&&err.status==403){
          var errors=err.data.errors || null;

          if(errors&&errors.length>0){
            msg='<ul>';
            errors.forEach(function(er, i){
              msg+="<li>["+er.code+"] "+er.message+"</li>";
            })
            msg+="</ul>"
          }
        }

        showAlert(title, msg);
      });



      /**
      //post back to server and let server to retweet
      $http.post("http://vision.sdsu.edu/hdma/volunteer/retweet", {user_id: oauth.user_id, screen_name:oauth.screen_name, tweet_id: t.id_str, token: oauth.token, tokenSecret: oauth.tokenSecret}).then(function(result){
        if(result.status==200 && result.statusText=="OK"){
          console.log(result)
          var data=result.data,
              t=data.data;

          if(t){
            //if there is an error while retweeting
            if(t.errors&&t.errors.length>0){
              showAlert("ERROR-RETWEET", JSON.stringify(t.errors[0].message))
              return;
            }

            showAlert("Succeed", "Retweet Succeed! <br><button class='button icon-left ion-social-twitter button-calm' ng-click=''>Please click here to see the retweet!</button>")
          }else{
            showAlert("ERROR-RETWEET", JSON.stringify(data.error))
          }


        }
      }, function(err){
        showAlert("ERROR-RETWEET", JSON.stringify(err));
      });
      */

    }
  }


})


//volunterr controller
.controller("VolunteerCtrl", function($scope, mySharedService, TwitterService, $ionicModal, $localStorage, $q, $http, $ionicLoading, $ionicPopup){
  //no twitter oauth information, need to login
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {scope: $scope}).then(function(modal) {
    $scope.modal = modal;
  });


  //function findVoluntter
  function findVolunteer(type){
    type=type || "normal"

    if(type=='normal'){$ionicLoading.show();}

    //find volunteer by using mySharedService
    mySharedService.findVolunteer().then(function(result){
      $scope.volunteers=result;

      switch(type){
        case "normal":
          $ionicLoading.hide();
        break;
        case "refresh":
          $scope.$broadcast('scroll.refreshComplete')
        break;
      }
    }, function(err){
      if(type=='normal'){$ionicLoading.hide();}

      $ionicPopup.alert({
        title:"ERROR-FIND VOLUNTEER",
        template:err
      });
    });
  }


  //check when user enter to this view
  $scope.$on('$ionicView.enter', function(e) {
    //check if the user already loing with twitter account first
    if(TwitterService.isAuthenticated()){
      if(mySharedService.volunteers.length==0){
        findVolunteer();
      }else{
        $scope.volunteers=mySharedService.volunteers;
      }
    }else{
      $scope.modal.show();
    }
  });


  //refresh volunteer
  $scope.refreshVolunteer=function(){
    findVolunteer('refresh');
  }


  //login
  $scope.login=function(){
    $ionicPlatform.ready(function(){
      //twitter auth
      TwitterService.initialize().then(function(result){
        if(result){
          $scope.modal.hide();
          findVolunteer();
        }
      }, function(err){
        $ionicPopup.alert({
          title:"ERROR-FIND VOLUNTEERS",
          template:JSON.stringify(err)
        })
      })
    })
  }

  //clse modal
  $scope.closeModal=function(){
    $scope.modal.hide();
  }

})



//setting controller
.controller("SettingCtrl", function($scope, $localStorage, $http, mySharedService){
  $scope.socialmedia={
    twitter:false,
    facebook:false,
    instagram:false
  }

  var oauth=$localStorage.oauth;

  //check if there are already user info in the localstorage
  //if yes, switch the toggle ON
  for(var type in oauth){
    var user=oauth[type]
    if(user.user_id && user.screen_name && user.token && user.tokenSecret){
      $scope.socialmedia[type]=true;
    }
  }


  $scope.toggleChange=function(type){
    var value=$scope.socialmedia[type];

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


//home controller
.controller('HomeCtrl', function($scope, $ionicLoading, $ionicPopup, $state, mySharedService){
  //check cached tweets
  if(!mySharedService.tweets || mySharedService.tweets.lenght==0){
    //show loading icon
    $ionicLoading.show();

    //get oes tweets
    mySharedService.getOESTweet().then(function(json){
      //hide loading icon
      $ionicLoading.hide();

      //switch to tweetlist page
      $state.transitionTo("app.tweet");
    }, function(err){
      $ionicPopup.alert({
        title:"ERROR",
        template:JSON.stringify(err)
      });
    })
  }


  //get started
  $scope.getStarted=function(){
    //switch to tweetlist page
    $state.transitionTo("app.tweet");
  }
})



//app controller
//may need to delete!!!!!!!!!!!!!
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
