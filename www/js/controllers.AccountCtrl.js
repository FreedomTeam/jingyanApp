angular.module('starter.controllers', [])
.controller('AccountCtrl', function($scope, User) {
  var getUserData = function(){
    $scope.user = User.getUser();
  }
    
  $scope.$on("$ionicView.afterEnter", function() {
    getUserData();
  });
})