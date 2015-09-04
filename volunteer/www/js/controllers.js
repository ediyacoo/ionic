//starter.controller module
angular.module('starter.controllers', ['ngCordova', 'ngStorage', 'ngResource', 'ngTwitter', 'service-oauth'])

//create shared service functions
.factory('mySharedService', function($location, $http, $q, $localStorage, TwitterService, $ionicPlatform, $ionicPopup) {
  //***************************************************************
  //test only
  //$localStorage.$reset();
  //console.log("clear localStorage")
  //***************************************************************

  return {
    //oauth login
    oauth_login: function(type){
        //type
        type=type || "twitter"

        var isMobile=this.mobileAndTabletcheck(),
            defer=$q.defer(),
            that=this;

        //mobile version
        if(isMobile){
          $ionicPlatform.ready(function(){
            if(type=='twitter'){
              //twitter auth
              TwitterService.initialize().then(function(result){
                if(result){
                  //check if the volunteer
                  that.checkVolunteer(result.screen_name).then(function(output){
                    defer.resolve(result)


                    //get user profile and save back to db
                    TwitterService.getUserProfile(result.screen_name).then(function(userProfile){
                      //save user actitvites
                      $http.post("http://vision.sdsu.edu/hdma/volunteer/userActivity", {type:"userProfile", userProfile:userProfile}).then(function(success){
                        if(success.data&&success.data.status!='success'){
                          defer.reject({code:"userActivity-error", error:success.data})
                        }
                      }, function(failure){
                        defer.reject({code:"userActivity-error", error:failure})
                      })

                    }, function(err){
                      defer.reject({code:"getUserProfile-error", error:err})
                    })


                  }, function(err){
                    defer.reject(err);
                  });

                }
              }, function(err){
                defer.reject({code:"twitterOauthLogin-login-failure", error:err});
              });
            } //end if twitter


          });



        }else{
          //web version
          var port=$location.$$port,
              callback_path='//'+$location.$$host+((port!=80)?(":"+port):"")+location.pathname+'%23/app/callback',
              width=600,
              height=300,
              left=(screen.width/2)-(width/2),
              top=(screen.height/2)-(height/2),
              oauth_window = window.open('http://vision.sdsu.edu/hdma/auth/'+type+'?returnTo='+callback_path, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes,width='+width+',height='+height+',left='+left+',top='+top);


          if(that.interval_oauthWindowClose){clearInterval(that.interval_oauthWindowClose)}
          that.interval_oauthWindowClose=setInterval(function(){
              if(oauth_window.closed){
                clearInterval(that.interval_oauthWindowClose);

                defer.resolve()
              }
          }, 500)
        }



        return defer.promise;
    },


    //check mobile
    mobileAndTabletcheck: function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    },

    //interval to listen if the oauth callback window is closed
    interval_oauthWindowClose:null,

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
            $defer.reject({code:"getOESTweet-length=0", error:null});
          }
        }).error(function(err){
          $defer.reject({code:"$http-error", error:err})
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

    /**
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
            defer.reject({code:"findVolunteer-no-volunteer", error:null})
          }
        }, function(err){
          defer.reject({code:"$http-error", error:JSON.stringify(err)})
        });
      }else{
        defer.reject({code:"findVolunteer-no-oauth-info", error:null});
      }

      //return promise
      return defer.promise;
    },
    */

    //volunteers array. The data will be retrieved from the findVoluntter function
    volunteers:[],


    //check volunteers
    checkVolunteer: function(screen_name){
      var output=false,
          defer=$q.defer(),
          that=this;

      if(screen_name && screen_name!=""){
        $http.get("http://vision.sdsu.edu/hdma/volunteer/checkVolunteer/"+screen_name).then(function(result){
          if(result&&result.data&&result.data.isValidate){
            defer.resolve(result.data)

            //sort volunteer by twitter account
            var volunteers=result.data.volunteers || [];
            volunteers.sort(function(a,b){return a.twitteraccount > b.twitteraccount})

            that.volunteers=volunteers || [];
          }else{
            defer.reject({code:"CheckVolunteer-not-signup", error:result})
          }
        }, function(err){
          defer.reject({code:"$http-error", error:err});
        })
      }else{
        defer.reject({code:"CheckVolunteer-no-screen_name", error:null})
      }

      return defer.promise;
    },


    //show popup
    showPopup: function(type, options, error){
      options=options || {}

      if(options.buttons===null){
        delete options.buttons;
      }

      if($ionicPopup[type]){
        return $ionicPopup[type](options)
      }

      if(error){
        console.log(error)
      }
    },


    //error code and description
    error:{
      "$http-error":"$http error",
      "CheckVolunteer-not-signup":"It seems you have not signed up as an OES volunteer. Please click on the following button to sign up.",
      "CheckVolunteer-no-screen_name":"no screen_name.",
      "findVolunteer-no-volunteer":"We cannot find any volunteers in your most interested area.",
      "findVolunteer-no-oauth-info":"No oauth or no screen_name info",
      "getUserProfile-error":"getUserProfile-error",
      "twitterOauthLogin-login-failure":"Cannot login with your Twitter account",
      "getOESTweet-length=0":"OES Tweets length==0",
      "userActivity-error":"Error in User Activity"
    }


  };
})







//*************************************************
//controller
//*************************************************


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
      mySharedService.showPopup("alert", {title:mySharedService.error[err.code], template:JSON.stringify(err.error)});
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



  //refresh oes tweet
  $scope.refreshOESTweet=function(){
    mySharedService.getOESTweet().then(function(result){
      $scope.tweetList=result;
      $scope.$broadcast('scroll.refreshComplete')
    }, function(err){
      mySharedService.showPopup("alert", {title:err.code, template:mySharedService.error[err.code]}, err.error);
    })
  }



  //click each tweet to open modal for share or login
  $scope.click=function(t){
    console.log(t)
    $scope.t=t

    //check if a user is logged in
    var oauth=$localStorage.oauth;

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
    mySharedService.oauth_login("twitter").then(function(result){
      $scope.modal.hide();
      $scope.modal=$scope.modal_share;
      $scope.modal.show();
    }, function(err){
      var buttons=null
      if(err.code=="CheckVolunteer-not-signup"){
        buttons=[{
          text:"Please Sign up first",
          type:"button-positive",
          onTap: function(e){
            window.open("http://vision.sdsu.edu/ibss/signup.html");
          }
        }]
      }

      mySharedService.showPopup("alert", {title:err.code, template:mySharedService.error[err.code], buttons:buttons}, err.error);
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

        mySharedService.showPopup("show", {title:"Retweet Succeed!", template:"Please click on the folowing button to see the retweet", buttons:[
          {text:"Cancel"},
          {text:"See Retweet", type:"button-positive", onTap: function(e){
            window.open("https://www.twitter.com/"+oauth.screen_name)
          }}
        ]});
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

        mySharedService.showPopup("alert", {title:title, template:msg}, err);
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
    var oauth_twitter=mySharedService.getOauth("twitter");
    if(oauth_twitter && oauth_twitter.screen_name){
      mySharedService.checkVolunteer(oauth_twitter.screen_name).then(function(result){
        $scope.volunteers=result.volunteers;

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

        mySharedService.showPopup("alert", {title:err.code, template:mySharedService.error[err.code]}, err.error);
      });
    }
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
      //test only
      if(mySharedService.mobileAndTabletcheck()){
        $scope.modal.show();
      }else{
        //test only
        $scope.volunteers=[
          {
            "updated": "2015-08-31T17:27:27.743Z",
            "timestamp": "8/28/2015 17:11:58",
            "name": "hdma sdsu",
            "emailaddress": "hdmasdsu@gmail.com",
            "phonenumber": {
              "$t": ""
            },
            "twitteraccount": "hdmasdsu",
            "twitteraccountaccess": "Yes",
            "gender": "N/A",
            "age": "25 - 34",
            "howlonghaveyouusedtwitter": "4 years",
            "areyouproficientinanyotherlanguages": "Spanish, Tagalog, Vietnamese, Korean, Japanese, Mandarin/Chinese, Arabic",
            "mostimportantareatoyou": "Central:  Central San Diego Neighborhoods  (92101- 92117, 92119- 92124, 92126- 92140, 92142, 92145, 92147, 92149, 92150)",
            "secondarea_3": "North:  Fallbrook  (92028, 92088)",
            "thirdarea_3": "North:  Fallbrook  (92028, 92088)",
            "individualorgrouprepresentative": "Individual"
          },
          {
            "updated": "2015-08-31T17:27:27.743Z",
            "timestamp": "8/30/2015 19:37:57",
            "name": "April Anderson",
            "emailaddress": "april.m.anderson05@gmail.com",
            "phonenumber": "619-490-5750",
            "twitteraccount": "@knowmad05",
            "twitteraccountaccess": "Yes",
            "gender": "Transgender",
            "age": "25 - 34",
            "howlonghaveyouusedtwitter": "3 years",
            "areyouproficientinanyotherlanguages": {
              "$t": ""
            },
            "mostimportantareatoyou": "Central:  Central San Diego Neighborhoods  (92101- 92117, 92119- 92124, 92126- 92140, 92142, 92145, 92147, 92149, 92150)",
            "secondarea_3": "North:  Escondido, Del Dios, Elfin Forest, Harmony Grove  (92023- 92027, 92029, 92030, 92033, 92046)",
            "thirdarea_3": "Central:  Central San Diego Neighborhoods  (92152- 92155, 92158- 92172, 92174- 92177, 92179, 92182, 92184, 92186, 92187, 92190- 92199)",
            "individualorgrouprepresentative": "Individual"
          }
        ].sort(function(a,b){return a.twitteraccount > b.twitteraccount});
      }


    //  $scope.modal.show();
    }
  });


  //refresh volunteer
  $scope.refreshVolunteer=function(){
    findVolunteer('refresh');
  }


  //login
  $scope.login=function(){
    mySharedService.oauth_login("twitter").then(function(result){
      //need to get volunteers obj to show in the view
      $scope.volunteers=mySharedService.volunteers;

      $scope.modal.hide();
    }, function(err){
      var buttons=null
      if(err.code=="CheckVolunteer-not-signup"){
        buttons=[{
          text:"Please Sign up first",
          type:"button-positive",
          onTap: function(e){
            window.open("http://vision.sdsu.edu/ibss/signup.html");
          }
        }]
      }

      mySharedService.showPopup("alert", {title:err.code, template:mySharedService.error[err.code], buttons:buttons}, err.error);
    });
  }

  //clse modal
  $scope.closeModal=function(){
    $scope.modal.hide();
  }

  //link
  $scope.link=function(type, obj){
    type=type || null

    var name=obj.twitteraccount || null,
        email=obj.emailaddress || null;
    name=(name&&name.charAt(0)=='@')?name.replace("@",""):name;

    if(name || email){
      switch(type){
        case "twitter":
          window.open("https://twitter.com/"+name);
        break;
        case "email":

        break;
      }
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
      $state.go("tab.tweet");
    }, function(err){
      mySharedService.showPopup("alert", {title:err.code, template:mySharedService.error[err.code]}, err.error);
    })
  }


  //get started
  $scope.getStarted=function(){
    //switch to tweetlist page
    $state.go("tab.tweet");
  }
})
