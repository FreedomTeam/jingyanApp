angular.module('controllers.SideMenuCtrl', [])

.controller('SideMenuCtrl', function($scope, User) {
  var getUserData = function(){
    $scope.user = User.getUser();
  };

  $scope.$on("$ionicView.afterEnter", function() {
    getUserData();
  });
})