//starter.controller module
angular.module('starter.controllers', ['ngCordova', 'ngStorage', 'ngResource', 'ngTwitter', 'service-oauth'])

//create shared service functions
.factory('mySharedService', function($location, $http, $q, $localStorage, TwitterService, $ionicPlatform, $ionicPopup, $ionicUser, $ionicPush, $rootScope, $cordovaDialogs, $state, $cordovaDevice, $cordovaAppAvailability) {
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
            that=this,
            temp_result=null;

        //mobile version
        if(isMobile){
          $ionicPlatform.ready(function(){
            if(type=='twitter'){
              //twitter auth
              TwitterService.initialize().then(function(result){
                if(result){
                  temp_result=result;
                  //check if the volunteer
                  return that.checkVolunteer(result.screen_name)
                }
              }).then(function(output){
                defer.resolve(temp_result)

                //save userProfile
                var userProfile=temp_result.userProfile;
                that.userProfile=userProfile;

                //save user actitvites
                return $http.post("http://vision.sdsu.edu/hdma/volunteer/post/userActivity", {type:"userProfile", userProfile:userProfile}, {headers:{"Authorization":null, "Content-Type":"application/json"}})
              }).then(function(success){
                if(success.data&&success.data.status!='success'){
                  defer.reject({code:"userActivity-error", error:success.data})
                }
              }).catch(function(err){
                defer.reject({code:"getUserProfile-error", error:err})
              });

              /**
              //twitter auth
              TwitterService.initialize().then(function(result){
                if(result){
                  //check if the volunteer
                  that.checkVolunteer(result.screen_name).then(function(output){
                    defer.resolve(result)

                    //get user profile and save back to db
                    TwitterService.getUserProfile(result.screen_name).then(function(userProfile){
                      //save user actitvites
                      $http.post("http://vision.sdsu.edu/hdma/volunteer/post/userActivity", {type:"userProfile", userProfile:userProfile}, {headers:{"Authorization":null, "Content-Type":"application/json"}}).then(function(success){
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
              **/

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


    //logout
    logout: function(){
      this.userProfile=null;
      this.volunteers=null;
      $localStorage.oauth["twitter"]=null;
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

    //userProfile
    userProfile:(function(){
      return ($localStorage.oauth && $localStorage.oauth["twitter"])?$localStorage.oauth["twitter"].userProfile:null
    })(),

    //get tweet
    getOESTweet: function(){
      var $defer=$q.defer(),
          that=this;

      $http.jsonp("http://vision.sdsu.edu/hdma/volunteer/tweets?callback=JSON_CALLBACK")
        .success(function(json){
          if(json&&json.length>0){
            var result={top:[], today:[], historical:[], all:json},
                m_timestamp, m_today=moment(), dateFormat="MM-DD-YYYY";

            //parse by date
            json.forEach(function(t, i){
              m_timestamp=moment(t.created_at);

              //most recent 5 tweets
              if(i<5){
                result.top.push(t)
              }

              //today and historical tweets
              if(m_timestamp.format(dateFormat)==m_today.format(dateFormat)){
                result.today.push(t)
              }else{
                result.historical.push(t)
              }
            })

            if(result.today.length==0){
              result.today=[{text:"no SD emergency tweets on " +m_today.format(dateFormat) , user:{screen_name:"ReadySanDiego"}}];
            }

            $defer.resolve(result);
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
            that.interestedArea=result.data.interestedArea || "";
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


    //identify ionic user
    identifyIonicUser: function(){
      var user=$ionicUser.get(),
          q=$q.defer(),
          twitterOauth=this.getOauth("twitter"),
          screen_name=(twitterOauth&&twitterOauth.screen_name)?twitterOauth.screen_name:null,
          that=this;

      //console.log(twitterOauth)

      if(!user.user_id){
        // Set your user_id here, or generate a random one.
        user.user_id = $ionicUser.generateGUID();
      }

      //twitter obj
      user.twitter={
        screen_name:screen_name
      };

      // Add some metadata to your user object.
      angular.extend(user, {
        name: (screen_name)?screen_name:"HDMA-"+user.user_id
      });

      // Identify your user with the Ionic User Service
      $ionicUser.identify(user).then(function(){
        q.resolve(user)

        //console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
      }, function(err){
        q.reject(err);
      });

      return q.promise;
    },


    //pushRegister
    pushRegister: function(){
      // Register with the Ionic Push service.  All parameters are optional.
      $ionicPush.register({
        canShowAlert: true, //Can pushes show an alert on your screen?
        canSetBadge: true, //Can pushes update app icon badges?
        canPlaySound: true, //Can notifications play a sound?
        canRunActionsOnWake: true, //Can run actions outside the app,
        onNotification: function(notification) {
          // Handle new push notifications here
          console.log(notification)
          //console.log(navigator)

          var platform=notification.platform,
              payload=notification.payload;

          //notificationReceived
          function notificationReceived(info){
            //if get the message, broadcast first to get the tweet
            $rootScope.$broadcast("pushNotificationReceived", info)

            $state.go("tab.tweet");
          }


          //chck notification event
          switch(notification.event){
              case 'message':



                  // if this flag is set, this notification happened while we were in the foreground.
                  // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                  if(notification.foreground){
                      //var res=confirm(notification.payload.message);
                      $cordovaDialogs.confirm(notification.payload.message, "Volunteer APP", ["Retweet", "Cancle"]).then(function(buttonIndex){
                        switch(buttonIndex){
                          case 0:
                            //no button
                          break;
                          case 1:
                          case true:
                            //retweet
                            notificationReceived(payload.payload)
                          break;
                          case 2:
                          case false:
                            //cancel
                          break;
                        }
                      });
                  }else{
                      // otherwise we were launched because the user touched a notification in the notification tray.
                      if (notification.coldstart){
                        console.log('--COLDSTART NOTIFICATION--' + '');
                      }else{
                        console.log('--BACKGROUND NOTIFICATION--' + '');
                      }

                      //retweet
                      notificationReceived(payload.payload);
                  }
              break;
              case 'error':
                  console.log('ERROR -&gt; MSG:' + notification.message + '');
              break;
              default:
                  console.log('EVENT -&gt; Unknown, an event was received and we do not know what it is');
              break;
          }

          return;

          return true;
        }
      }).then(function(result){
        console.log("$ionic push: user registered")
        console.log(result);
      });



      //unregister //not finished
      $ionicPush.unregister().then(function(result){
        console.log("unregister!")
        console.log(result)
      })

    },


    //post device info
    postDeviceInfo: function(info){
      $http.post("http://vision.sdsu.edu/hdma/volunteer/post/deviceInfo", {info:info}).then(function(result){
        //console.log(result)
      }, function(err){
        //console.log(err);
      })

    },

    //get external app link
    checkApp: function(app_name){
      var platform=null,
          schemes={
            "twitter":{"android":"com.twitter.android", "ios":"twitter://"},
            "faceboook":{"android":"com.facebook.katana", "ios":"fb://"},
            "whatsapp":{"android":"com.whatapp", "ios":"whatsapp://"}
          },
          defer=$q.defer();

      if(!this.device_user){defer.reject("have not got the device info. please wait a while and try again.")};


      platform=this.device_user.platform || "android";

      if(app_name&&app_name!=""){
        var scheme=(schemes[app_name.toLowerCase()])?schemes[app_name.toLowerCase()][platform]:null;

        if(scheme){
          //check if the app is avaiable
          $cordovaAppAvailability.check(scheme).then(function(){
            //yes
            defer.resolve(true)
          }, function(){
            //no
            defer.reject(app_name.toLowerCase()+" is not avaiable");
          });
        }else{
          defer.reject("no matched scheme");
        }
      }else{
        defer.reject("no app_name");
      }

      return defer.promise;
    },

    //device_user
    device_user:null,

    //interested area
    interestedArea:"",

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


//init run
.run(function($ionicPlatform, $rootScope, mySharedService, $localStorage){
  $ionicPlatform.ready(function(){
    var device_user=null;

    //test clear oauth
    //$localStorage.oauth=null

    // Handles incoming device tokens
    $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
      if(device_user&&data){
        var obj=device_user;
        obj.token=data.token;
        obj.platform=data.platform;
        obj.install=true;

        console.log("Successfully registered token " + data.token);
        console.log(obj)

        mySharedService.postDeviceInfo(obj)
      }
      //$scope.token = data.token;
    });


    mySharedService.identifyIonicUser().then(function(user){
        device_user=user;
        mySharedService.pushRegister()

        //store user into mySharedService
        mySharedService.device_user=user;

        console.log("finished identify ionic user")
        console.log(user)
        console.log("_________________________________________")
    });


  })
})






//*************************************************
//controller
//*************************************************


//tweet list controller
.controller("TweetListCtrl", function($scope, $localStorage, $q, $http,  $ionicModal, $ionicLoading, $ionicPopup, mySharedService, TwitterService,  $ionicPlatform, $stateParams){
  $scope.moment=mySharedService.moment;

  //on pushNotificationReceived
  $scope.$on("pushNotificationReceived", function(e, payload){
    //console.log("pushNotificationReceived...................")
    //console.log(payload)

    if(payload.tweet_id){
      //show loading
      $ionicLoading.show();

      $scope.refreshOESTweet().then(function(){
        if($scope.oesTweet&&$scope.oesTweet.all){
          var tweets=$scope.oesTweet.all, t, tweet;

          //parse all tweets to find out the tweet which id_Str matches payload.tweet_id
          for(var i=0, l=tweets.length; i<l; i++){
              t=tweets[i];
              if(t.id_str==payload.tweet_id){
                tweet=t
                break;
              }
          }

          if(tweet){
            $scope.click(tweet);
          }

          //hide loading
          $ionicLoading.hide();
        }
      });
    }

  })




  //if there is no existed tweets, manully get tweets
  if(!mySharedService.tweets || mySharedService.tweets.length==0){
    //show loading icon
    $ionicLoading.show();

    mySharedService.getOESTweet().then(function(json){
      $scope.oesTweet=json;
      $scope.tweetList=json[$scope.selectedTab];

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


  //oes tweet
  $scope.oesTweet={}

  //selected tab
  $scope.selectedTab="top";


  //change tweetlist
  $scope.changeTweetList=function(type){
    $scope.selectedTab=type;

    var output=$scope.oesTweet[type];
    if(output){
      //change tweetList Source;
      $scope.tweetList=output;
      console.log($scope.tweetList)
    }
  }





  //refresh oes tweet
  $scope.refreshOESTweet=function(){
    var defer=$q.defer();

    mySharedService.getOESTweet().then(function(result){
      $scope.oesTweet=result
      $scope.tweetList=result[$scope.selectedTab];
      $scope.$broadcast('scroll.refreshComplete');

      defer.resolve();
    }, function(err){
      mySharedService.showPopup("alert", {title:err.code, template:mySharedService.error[err.code]}, err.error);
      defer.reject();
    })

    return defer.promise;
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

        //save user actitvites
        $http.post("http://vision.sdsu.edu/hdma/volunteer/post/userActivity", {type:"retweet", retweet:{user_id:oauth.user_id, tweet_id:t.id_str}}, {headers:{"Authorization":null, "Content-Type":"application/json"}}).then(function(success){
          if(success.data&&success.data.status!='success'){
            console.log({code:"userActivity-err", error:success.data})
          }else{
            console.log("user actitvities succeed!!!!")
          }
        }, function(failure){
          console.log({code:"userActivity-error", error:failure})
        });


        //show popup
        mySharedService.showPopup("show", {title:"Retweet Succeed!", template:"Please click on the folowing button to see the retweet", buttons:[
          {text:"Cancel"},
          {text:"See Retweet", type:"button-positive", onTap: function(e){
            //check twitter api
            mySharedService.checkApp("twitter").then(function(){
              window.open("twitter://user?screen_name="+oauth.screen_name, "_system", "location=no");
              $scope.modal.hide();
            }, function(err){
              if(err=="twitter is not avaiable"){
                window.open("https://twitter.com/"+oauth.screen_name, "_system", "location=no");
                $scope.modal.hide();
              }
            });
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

  //interested area
  $scope.interestedArea=mySharedService.interestedArea || "";


  //login
  $scope.login=function(){
    mySharedService.oauth_login("twitter").then(function(result){
      //update mySharedService.interestedArea and mysharedServer.volunteers
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
          //check twitter api
          mySharedService.checkApp("twitter").then(function(){
            window.open("twitter://user?screen_name="+name, "_system", "location=no")
          }, function(err){
            if(err=="twitter is not avaiable"){
              window.open("https://twitter.com/"+name, "_system", "location=no")
            }
          });
        break;
        case "email":

        break;
      }
    }

  }

})



//setting controller
/**
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
*/


//account control
.controller("AccountCtrl", function($scope, $localStorage, $ionicModal, TwitterService, mySharedService){
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {scope: $scope}).then(function(modal) {
    $scope.modal = modal;
  });

  //to check if an user already login
  $scope.isLogin=false;

  $scope.userProfile=null;

  //check when user enter to this view
  $scope.$on('$ionicView.enter', function(e) {
    //check if the user already loing with twitter account first
    if(TwitterService.isAuthenticated()){
      $scope.isLogin=true;
      $scope.userProfile=mySharedService.userProfile;
    }else{
      $scope.isLogin=false;
    }
  });

  //login
  $scope.login=function(){
    mySharedService.oauth_login("twitter").then(function(result){
      $scope.isLogin=true;
      $scope.userProfile=mySharedService.userProfile;
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


  //logout
  $scope.logout=function(){
    //confirm
    mySharedService.showPopup("show", {title:"Are you sure?", template:"", buttons:[
      {text:"Cancel"},
      {text:"Logout", type:"button-positive", onTap: function(e){
        mySharedService.logout();
        $scope.isLogin=false;
      }}
    ]});
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
.controller('HomeCtrl', function($scope, $ionicLoading, $ionicPopup, $state, mySharedService, $rootScope){
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
  }else{
    //switch to tweetlist page
    $state.go("tab.tweet");
  }



  //get started
  $scope.getStarted=function(){
    //switch to tweetlist page
    $state.go("tab.tweet");
  }
})
