angular.module('starter.controllers', [])
.controller('MeCtrl', function($scope, User, Restangular) {
  var getUserData = function(){
    $scope.user = User.getUser();
  };

  Restangular.all('userRoles').getList().then(function(data){
    $scope.userRoles = data;
    $scope.userRolesMap = _.indexBy($scope.userRoles, 'id');
  })


  $scope.$on("$ionicView.afterEnter", function() {
    getUserData();
  });

})
  // $scope.changeName = function(){
  //   User.changeNameModal();
  // }
