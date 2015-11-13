// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'restangular',
  'ionic', 
  'services.Modal',
  'services.Acl',
  'services.User',
  'LocalStorageModule',
  'oc.lazyLoad',
  'starter.services',
  'controllers.SideMenuCtrl',
  'ngCordova'
  ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})


.constant('baseUrl', 'http://app.jingyan56.com')
// .constant('baseUrl', 'http://192.168.2.99:8201')
.config(['$compileProvider', 'RestangularProvider', 'baseUrl', function($compileProvider, RestangularProvider,baseUrl) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content):|data:image\//);

    console.debug(baseUrl)
    RestangularProvider.setBaseUrl(baseUrl);
    var tranEmbedList = function(data){
      if (_.isArray(data))
        return _.forEach(data, tranEmbedList);
      _.forEach(data, function(value, key){
        if (key.substr(0,1) === '#' && value.data){
          tranEmbedList(value.data);
          data[key] = value.data;
          data[key].meta = value.meta;
        }
      })
    }
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      var extractedData;
      if (operation === "getList") {
        extractedData = data.data;
        if (data.meta)
          extractedData.meta = data.meta;
      } else {
        extractedData = data;
      }
      tranEmbedList(extractedData)
      return extractedData;
    });
  }])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {

  $ionicConfigProvider.views.transition('ios');
  $ionicConfigProvider.tabs.style('standard').position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center').positionPrimaryButtons('left');

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content):|data:image\//);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sideMenu.html',
    controller: 'SideMenuCtrl',
    resolve: {
      login: function(User){
        return User.loginPromise();
      }
    }
  })

  .state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/app-account.html',
        controller: 'AccountCtrl'
      }
    },
    resolve: {
      loadMyFiles:function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name:'starter.controllers',
          files:[
          'js/controllers.AccountCtrl.js',
          ]
        })
      }
    }
  })
  .state('app.me', {
    url: '/me',
    views: {
      'menuContent': {
        templateUrl: 'templates/me.html',
        controller: 'MeCtrl'
      }
    },
    resolve: {
      loadMyFiles:function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name:'starter.controllers',
          files:[
          'js/controllers.MeCtrl.js',
          ]
        })
      }
    }
  })
  .state('app.setting', {
      url: '/setting',
      views: {
        'menuContent': {
          templateUrl: 'templates/setting.html',
          controller: 'SettingCtrl'
        }
      },
      resolve: {
        loadMyFiles:function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'starter.controllers',
            files:[
            'js/controllers.SettingCtrl.js',
            ]
          })
        }
      }
    })
  .state('app.orders', {
      url: '/orders',
      views: {
        'menuContent': {
          templateUrl: 'templates/app-orders.html',
          controller: 'OrdersCtrl',
        }
      },      
      resolve: {
        loadServices:function($ocLazyLoad) {
          return $ocLazyLoad.load(
          {
            name:'starter.services',
            files:[
              'js/services.Api.js',
              'js/services.Acl.js'
            ]
          })
        },
        loadMyFiles:['$ocLazyLoad', 'loadServices', function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'starter',
            files:[
            'js/controllers.MainCtrl.js',
            ]
          })
        }]
      }
    })
    .state('app.orderDetail', {
      url: '/orders/:orderId',
      views: {
        'menuContent': {
          templateUrl: 'templates/order-detail.html',
          controller: 'ChatDetailCtrl'
        }   
      },
      resolve: {
        loadExternal:function($ocLazyLoad) {
          return $ocLazyLoad.load(
          {
            name:'ngCordova',
            files:[
              'lib/async/dist/async.min.js'
            ]
          })
        },
        loadServices:function($ocLazyLoad) {
          return $ocLazyLoad.load(
          {
            name:'starter.services',
            files:[
              'js/services.Api.js',
              'js/services.Acl.js'
            ]
          })
        },
        loadMyFiles:function($ocLazyLoad) {
          return $ocLazyLoad.load({
            name:'starter.controllers',
            files:[
            'js/controllers.OrderDetailCtrl.js',
            ]
          })
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/orders');

});
