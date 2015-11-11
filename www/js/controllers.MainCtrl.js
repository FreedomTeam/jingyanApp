angular.module('starter', [])

.controller('OrdersCtrl', function($scope, User, Restangular, Acl, Api,Modal,Chats) {
  Restangular.addFullRequestInterceptor(User.tokenInterceptor);
  $scope.isAllowed = Acl.isAllowed;
  $scope.tranUrl = Api.tranUrl;
  $scope._ = _;
  Orders = Restangular.all('Orders');

  var getUserData = function(){
    if ($scope.user != User.getUser()){
      $scope.curUser = User.getUser();
      if ($scope.doRefresh) $scope.doRefresh();
    }
  }

  var bindStructs = {};
  $scope.hasMore = {};
  $scope.pages = [{
    id: 'All',
    url: 'templates/orders-all.html',
    title: '全部订单',
    field: 'allOrders',
    options: {
      context: 'transported'
    }
  },{
    id: 'D',
    url: 'templates/orders-d.html',
    title: '未完成订单',
    field: 'dOrders',
    options: {
      context: 'transported',
      orderStatusId: 'D'
    }
  },{
    id: 'F',
    url: 'templates/orders-f.html',
    title: '已完成订单',
    field: 'fOrders',
    options: {
      context: 'transported',
      orderStatusId: 'F'
    }
  }]
  $scope.pagesMap = _.indexBy($scope.pages, 'id');
  $scope.curPageId = 'All';
  $scope.changePage = function(page){
    $scope.formData.warehouseLike = '';
    $scope.curPageId = page.id;
    if (!$scope[$scope.pagesMap[$scope.curPageId].field]){
      $scope.doRefresh();
    }
  }
  $scope.formData = {
    warehouseLike: ''
  }
  $scope.search = function(e){
    var keycode = window.event?e.keyCode:e.which;
    if(keycode!==13) return;
    
    if ($scope.formData.warehouseLike===''){
      $scope.changePage($scope.pagesMap['All']);
    } else {
      $scope.curPageId = 'Search';
      bindStructs['Search'] = Api.bindList(Orders, $scope, 'searchOrders', 'news', {context: 'transported', warehouseLike: $scope.formData.warehouseLike});
      $scope.doRefresh();
    }
  }

  Restangular.all('orderStatus').getList().then(function(data){
    $scope.orderStatus = data;
    $scope.orderStatusMap = _.indexBy($scope.orderStatus, 'id');
  })
  _.forEach($scope.pages, function(page){
    bindStructs[page.id] = Api.bindList(Orders, $scope, page.field, 'news', page.options);
  })
  
  $scope.doRefresh = function() {
    $scope.hasMore[$scope.curPageId] = false;
    bindStructs[$scope.curPageId].refresh().then(function(defer){
      console.debug($scope.allOrders)
      console.debug('get data success')
      $scope.$broadcast('scroll.refreshComplete');
      $scope.hasMore[$scope.curPageId] = bindStructs[$scope.curPageId].moreData.length;
    }, function(defer){
      console.debug('get data fail')
      $scope.$broadcast('scroll.refreshComplete');
      $scope.hasMore[$scope.curPageId] = bindStructs[$scope.curPageId].moreData.length;
    })
  };
  $scope.doRefresh();

  $scope.loadMore = function() {
    console.debug("load more")
    bindStructs[$scope.curPageId].more().then(function(defer){
      console.debug('loadMore success')
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.hasMore[$scope.curPageId] = bindStructs[$scope.curPageId].moreData.length;
    }, function(defer){
      console.debug('loadMore error')
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.hasMore[$scope.curPageId] = bindStructs[$scope.curPageId].moreData.length;
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