angular.module('starter', [])

.controller('OrdersCtrl', function($scope, User, Restangular, Acl, Api,Modal,Chats) {
//替代
  $scope.chats=Chats.all();

  Restangular.addFullRequestInterceptor(User.tokenInterceptor);
  $scope.isAllowed = Acl.isAllowed;
  $scope.tranUrl = Api.tranUrl;
  Orders = Restangular.all('Orders');

  var getUserData = function(){
    if ($scope.user != User.getUser()){
      $scope.curUser = User.getUser();
      if ($scope.doRefresh) $scope.doRefresh();
    }
  }

  Restangular.all('orderStatus').getList().then(function(data){
    $scope.orderStatus = data;
    $scope.orderStatusMap = _.indexBy($scope.orderStatus, 'id');
  })
  var bindStruct = Api.bindList(Orders, $scope, 'orders', 'news', {context: 'transported'});
  $scope.doRefresh = function() {
    $scope.hasMore = false;
    bindStruct.refresh().then(function(defer){
      console.debug($scope.orders)
      // console.debug(bindStruct.moreData)
      console.debug('get data success')
      $scope.$broadcast('scroll.refreshComplete');
      $scope.hasMore = bindStruct.moreData.length;
    }, function(defer){
      console.debug('get data fail')
      $scope.$broadcast('scroll.refreshComplete');
      $scope.hasMore = bindStruct.moreData.length;
    })
  };
  $scope.doRefresh();

  $scope.loadMore = function() {
    console.debug("load more")
    bindStruct.more().then(function(defer){
      console.debug('loadMore success')
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.hasMore = bindStruct.moreData.length;
    }, function(defer){
      console.debug('loadMore error')
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.hasMore = bindStruct.moreData.length;
    })
  };

  //新增订单
  $scope.addOrders = function(){
    // Restangular.all('contentTypes').getList().then(function(data){
    //   $scope.contentTypes = data;
    // }).then(function(){
      Modal.okCancelModal('templates/modal-addOrders.html', {focusFirstInput:true}, {
        init: function(scope){
          // scope.contentTypes = _.filter($scope.contentTypes, function(type){
          //   return _.includes($scope.contentTypes.meta.available.app, type.id)
          // });
          // console.debug(scope.contentTypes)
          // scope.formData = {
          //   contentTypeId: $scope.contentTypes.meta.defaultValue.app,
          // };
        },
        onOk:function(form, scope){
          // switch(scope.formData.contentTypeId){
          //   case 'T': 
          //     scope.formData.content = scope.formData.textContent;
          //     break;
          //   default:
          //     scope.formData.content = '';
          // }
          // Orders.post(scope.formData).then(function(){
          //   $scope.morePopover.hide();
          //   scope.modal.hide();
          // })
        }
      });
    // })
  }

  $scope.isAllowedDetail = function(order){
    return order.customerId == $scope.curUser.id || ['G', 'D', 'T'].indexOf($scope.curUser.userRoleId) >= 0;
  }

  $scope.$on("$ionicView.afterEnter", function() {
    getUserData();
  });
});