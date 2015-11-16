angular.module('starter.controllers', [])

.controller('ChatDetailCtrl', function($scope, $stateParams, $cordovaImagePicker, $ionicLoading,
  $timeout, Restangular, User, Api, Modal) {
  Restangular.addFullRequestInterceptor(User.tokenInterceptor);
  Order = Restangular.one('Orders', $stateParams.orderId);
  $scope._ = _;
  $scope.tranUrl = Api.tranUrl;
  
  var refreshOrder = function(){
    // $ionicLoading.show({
    //   template: '数据刷新中...'
    // })
    Order.get({context: 'transported'}).then(function(order){
      $scope.order = order;
      // $ionicLoading.hide();
    })
  }
  refreshOrder();

  $scope.viewImages = function(index){
    Modal.images(Api.tranUrls($scope.order.images), index);
  }

  $scope.uploadImages = function(){
    var options = {
      maximumImagesCount: 9,
      width: 1600,
      height: 1600,
      quality: 80
    };

    $cordovaImagePicker.getPictures(options)
    .then(function (images) {
      $scope.formData = {
        images: images
      }
      var fd = new FormData();
      async.forEachOf($scope.formData, function(v, k, cb){
        if (k=='images') {
          async.each($scope.formData[k], function(image, icb){
            window.resolveLocalFileSystemURL(image, function(fileEntry){
              fileEntry.file(function(file){
                var fileReader = new FileReader();
                fileReader.onloadend = function(fileReadResult){
                  var data = new Uint8Array(fileReadResult.target.result);
                  fd.append(k+'[]', new Blob([data], {type: file.type}), file.name)
                  icb(undefined);
                }
                fileReader.readAsArrayBuffer(file);
              })
            })
          }, function(err){
            if (err){
              cb("open file error:" + err)
              return;
            }
            cb(undefined);
          });
        }
        else{
          fd.append(k, v);
          cb(undefined)
        }
      }, function(err){
        if (err){
          console.debug(err)
          return;
        }
        $ionicLoading.show({
          template: '图片上传中...'
        })
        $timeout(function(){
          Order
            .withHttpConfig({transformRequest: angular.identity})
            .customPUT(fd, undefined, {context: 'addOwnedImages'}, 
              { withCredentials: true, 'Content-Type': undefined })
            .then(function(response){
              refreshOrder();
              $ionicLoading.hide();
            }, function(err){
              $ionicLoading.hide();
              Modal.info({
                title: '失败',
                info: '上传相片失败，请检查网络或者联系管理员。'
              })
            });
        }, 3000)
        
      });
    }, function(error) {
      console.debug(error);
    });
  }
})

