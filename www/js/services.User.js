angular.module('services.User', ['services.Modal'])
.service('User', function($state, $q, $timeout, baseUrl, Restangular, localStorageService, Modal){
  var Login = Restangular.one('services', 'login');
  var Users = Restangular.all('Users');
  var jwtUrl;
  var jwtToken;
  var jwtUser;
  var jwtExpires;
  if (sessionStorage.getItem('token')){
    jwtUrl = sessionStorage.getItem('url');
    jwtToken = sessionStorage.getItem('token');
    jwtExpires = sessionStorage.getItem('expires');
    jwtUser = JSON.parse(sessionStorage.getItem('user'));
  } else if (localStorageService.get('token')){
    jwtUrl = localStorageService.get('url');
    jwtToken = localStorageService.get('token');
    jwtExpires = localStorageService.get('expires');
    jwtUser = JSON.parse(localStorageService.get('user'));
  }
  var tokenInterceptor = function(element, operation, route, url, headers, params, httpConfig) {
    if (jwtToken) headers['x-access-token'] = jwtToken;
    return {
      element: element,
      params: _.extend(params, {single: true}),
      headers: headers,
      httpConfig: httpConfig
    };
  };
  Restangular.addFullRequestInterceptor(tokenInterceptor);
  var signUpLogin = function(islogin, data, rememberMe){
    return Thenjs((islogin?Login.customPUT:Users.post)(data)).then(function(tcb, datum){
      jwtUrl = baseUrl;
      jwtToken = datum.token;
      jwtUser = datum.user;
      jwtExpires = datum.expires;
      console.debug(datum)
      sessionStorage.setItem('url', jwtUrl);
      sessionStorage.setItem('token', jwtToken);
      sessionStorage.setItem('expires', jwtExpires);
      sessionStorage.setItem('user', JSON.stringify(jwtUser));
      if (rememberMe){
        localStorageService.set('url', jwtUrl);
        localStorageService.set('token', jwtToken);
        localStorageService.set('expires', jwtExpires);
        localStorageService.set('user', JSON.stringify(jwtUser));
      }
      else{
        localStorageService.remove('url');
        localStorageService.remove('token');
        localStorageService.remove('expires');
        localStorageService.remove('user');
      }
      tcb(undefined, jwtUser);
    }, function(tcb, err){
      console.debug(err)
      tcb(err);
    })
  }
  return {
    login: _.bind(signUpLogin, this, true),
    signupModal: function(success, fail){
      var userService = this;
      Modal.okCancelModal('templates/modal-signup.html', {focusFirstInput:true}, {
        init: function(scope){
          scope.formData = {};
          scope.loginErrMsg = undefined;
          scope.clearLoginError = function(){
            scope.loginErrMsg = undefined;
          }
          scope.login = function(){
            userService.loginModal(success, fail);
            scope.hideModal();
          }
          scope.passwordInvalid = false;
          scope.clearPasswordError = function(){
            scope.passwordInvalid = false;
          }
          //校验密码
          scope.$watch('formData', function(newValue, oldValue){
            scope.passwordInvalid = (newValue.password != newValue.passwordAgain);
          }, true)
        },
        onOk:function(form, scope){
          return signUpLogin(false, {
            name: scope.formData.name,
            password: md5(scope.formData.password)
          }, true).then(function(){
            success?success():'';
            scope.hideModal();
          }, function(tcb, err){
            switch(err.status){
              case 400:
                scope.loginErrMsg = 'User Name Exists';
                break;
              case 0:
                scope.loginErrMsg = 'Connect server error';
                break;
              default:
                console.debug(_.keys(err))
            }
          });
        }
      });
    },
    loginModal: function(success, fail){
      var userService = this;
      Modal.okCancelModal('templates/modal-login.html', {focusFirstInput:true}, {
        init: function(scope){
          scope.formData = {};
          scope.loginErrMsg = undefined;
          scope.clearLoginError = function(){
            scope.loginErrMsg = undefined;
          }
          scope.signUp = function(){
            userService.signupModal(success, fail);
            scope.hideModal();
          }
        },
        onOk:function(form, scope){
          return userService.login({
            name: scope.formData.name,
            password: md5(scope.formData.password)
          }, true).then(function(){
            success?success():'';
            scope.hideModal();
          }, function(tcb, err){
            switch(err.status){
              case 401:
                scope.loginErrMsg = 'Wrong User or Password';
                break;
              case 0:
                scope.loginErrMsg = 'Connect server error';
                break;
              default:
                console.debug(_.keys(err))
            }
          });
        }
      });
    },
    loginPromise: function(){
      var userService = this;
      var defer = $q.defer();
      $timeout(function(){
        if (jwtUrl == baseUrl && jwtUser && jwtExpires && Date.now() < jwtExpires){
          defer.resolve("Has Login");
        } else {
          userService.loginModal(defer.resolve)
        }
      }, 100)
      return defer.promise;
    },
    logout: function(success){
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorageService.remove('token');
      localStorageService.remove('user');
      jwtToken = jwtUser = undefined;
      this.loginModal(success);
    },
    hasLogined: function(){
      return !!jwtUser;
    },
    getUser: function(){
      return jwtUser;
    },
    changePasswordModal: function(success){
      Modal.okCancelModal('templates/modal-changePassword.html', {focusFirstInput:true}, {
        init: function(scope){
          scope.formData = {};
          scope.loginErrMsg = undefined;
          scope.clearPasswordError = function(){
            scope.loginErrMsg = undefined;
          }
          //校验密码
          scope.$watch('formData', function(newValue, oldValue){
            scope.passwordInvalid = (newValue.password != newValue.passwordAgain);
          }, true)
        },
        onOk:function(form, scope){
          return Thenjs(Users.one(jwtUser.id).customPUT({
            oldPassword: md5(scope.formData.oldPassword),
            password: md5(scope.formData.password)
          })).then(function(){
            success?success():'';
            scope.hideModal();
          }, function(err){
            switch(err.status){
              case 401:
                scope.loginErrMsg = 'Wrong Password';
                break;
            }

          });
        }
      });
    },
    tokenInterceptor: tokenInterceptor
  }
})
    // changeNameModal: function(success){
    //   Modal.okCancelModal('templates/modal-changeName.html', {focusFirstInput:true}, {
    //     init: function(scope){
    //       scope.formData = {};
    //     },
    //     onOk:function(form, scope){
    //       return Thenjs(Users.one(jwtUser.id).customPUT({
    //         name: scope.formData.name
    //       })).then(function(){
    //         success?success():'';
    //         scope.hideModal();
    //       }, function(err, tcb){
    //         console.debug(err)
    //       });
    //     }
    //   });
    // },
    // Restangular.addFullRequestInterceptor(UserService.tokenInterceptor)