angular.module('starter.controllers', [])

.controller('ChatDetailCtrl', function($scope, $stateParams, Restangular, User) {
  Restangular.addFullRequestInterceptor(User.tokenInterceptor);
  Order = Restangular.one('Orders', $stateParams.orderId);
  $scope._ = _;
  
  Order.get({context: 'transported'}).then(function(order){
    $scope.order = order;
  })
})

