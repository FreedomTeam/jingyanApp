angular.module('starter.controllers', [])
.controller('SettingCtrl', function($scope, User, Restangular) {
  var getUser;
  (getUser = function(){
    $scope.user = User.getUser();
  })();

  $scope.logout = function(){
    User.logout(function(){
      getUser();
    });
  }

  $scope.changePassword = function(){
    User.changePasswordModal();
  }

})