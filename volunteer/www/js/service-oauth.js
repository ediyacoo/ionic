//starter.controller module
angular.module('service-oauth', ['ngCordova', 'ngStorage', 'ngResource', 'ngTwitter'])

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


  function createTwitterSignature(method, url, params){
    params=params || {}

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
          signatureObj=$cordovaOauthUtility.createSignature(method, url, oauthObj, params, clientSecret, twitterOauth.oauth_token_secret);

      $http.defaults.headers.common.Authorization=signatureObj.authorization_header;

      if(method=='POST'){
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      //$http.defaults.headers.common["Content-Type"]="application/x-www-form-urlencoded";

    }
  }


  return {
    initialize: function() {
      var deferred = $q.defer(),
          token = getStoredToken(),
          that=this,
          temp_result=null;

      if (token&&token.twitter) {
          deferred.resolve(token.twitter);
      } else {
          //twitter login
          $cordovaOauth.twitter(clientId, clientSecret, {redirect_uri:"http://vision.sdsu.edu/hdma/volunteer/callback"}).then(function(result) {
              temp_result=result;
              storeUserToken({twitter:temp_result});

              //retrieve user profile
              return that.getUserProfile(result.screen_name)
          }).then(function(userProfile){
              temp_result.userProfile=userProfile;
              storeUserToken({twitter:temp_result});

              deferred.resolve(temp_result);
          }).catch(function(err){
            deferred.reject(err);
          });

      }
      return deferred.promise;
    },

    isAuthenticated: function(){
      return $localStorage.oauth && $localStorage.oauth !== null && $localStorage.oauth.twitter !== null;
    },

    retweet: function(tweet, comment){
      var deferred=$q.defer();

      if(tweet){
        var url="https://api.twitter.com/1.1/statuses/retweet/"+tweet.id_str+".json",
            params=null, data_string=null;

        //if there is any comment, use "quot-tweet" to retweet
        if(comment&&comment!=""){
          url="https://api.twitter.com/1.1/statuses/update.json";
          var permaLink="https://twitter.com/"+tweet.user.screen_name +"/status/"+tweet.id_str;

          params={
            status:comment + " " + permaLink
          }
        }

        //$resource
        createTwitterSignature("POST", url, params);

        //compose data string
        if(params){
          var temp=[];
          for(var k in params){
            temp.push(k+"="+encodeURIComponent(params[k]))
          }
          data_string=temp.join("&")
        }



        $http({
          method:"POST",
          url:url,
          data:data_string
        }).then(function(result){
        //$resource(url).save(null, params, function(result){
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
      if(screen_name && screen_name!=""){
        var defer=$q.defer(),
            url = 'https://api.twitter.com/1.1/users/show.json',
            params={screen_name:screen_name};

        createTwitterSignature('GET', url, params);
        $http.get(url, {params:params}).then(function(result){
          defer.resolve(result.data)
        }, function(err){
          defer.reject(err);
        })

        /**
        $resource(url).query({screen_name:screen_name}, function(result){
          defer.resolve(result);
        }, function(err){
          defer.reject(err);
        });
        */

        return defer.promise;
      }
    }



  } //end return

})
