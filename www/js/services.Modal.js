angular.module('services.Modal', [])

.service('Modal', function ($ionicModal, $ionicPopup, $rootScope) {
  
  var okCancelModal = function(template, options, eventHandles){
    options = options || {};
    var scope = $rootScope.$new();
    eventHandles.init? (function(){
            console.debug('OkCancleModal init');
            eventHandles.init(scope)
          })(): undefined;
    options.scope = scope;
    return Thenjs(function(defer){
      $ionicModal.fromTemplateUrl(template, options).then(function(modal) {
        scope.modal = modal;
        scope.ok = function(form){
          console.debug('OkCancleModal ok');
          if (_.isFunction(eventHandles.onOk)){
            eventHandles.onOk(form, scope);
          }else{
            modal.remove();
          }

        }
        scope.hideModal = function(){
          modal.remove();
        }
        scope.closeModal = function(){
          console.debug('OkCancleModal closeModal');
          if (_.isFunction(eventHandles.onClose)){
            eventHandles.onClose(scope);
          }else{
            modal.remove();
          }
        }
        scope.cancelModal = function(){
          console.debug('OkCancleModal cancelModal');
          if (_.isFunction(eventHandles.onCancel)){
            eventHandles.onCancel(scope);
          }else{
            modal.remove();
          }
        }
        modal.show();
        defer(undefined, scope, modal);
      });
    });
  }

  // var imageModal = function(imageUrl){var scope = $rootScope.$new();
  //   var scope = $rootScope.$new();
  //   scope.imageUrl = imageUrl
  //   return Thenjs(function(defer){
  //     $ionicModal.fromTemplateUrl('templates/modal-image.html').then(function(modal) {
  //       scope.modal = modal;
  //       scope.ok = function(form){
  //         console.debug('OkCancleModal ok');
  //         if (_.isFunction(eventHandles.onOk)){
  //           eventHandles.onOk(form, scope);
  //         }else{
  //           modal.remove();
  //         }

  //       }
  //       scope.closeModal = function(){
  //         console.debug('OkCancleModal closeModal');
  //         if (_.isFunction(eventHandles.onClose)){
  //           eventHandles.onClose(scope);
  //         }else{
  //           modal.remove();
  //         }
  //       }
  //       modal.show();
  //       defer(undefined, scope, modal);
  //     });
  //   });

  // };

  return {
    okCancelModal: okCancelModal,
    prompt: function(params, okCb, cancelCb){
      var scope = $rootScope.$new();
      scope.data = {};
      _.assign(scope, params);
      var myPopup = $ionicPopup.show({
        template: '{{info}}<div><textarea style="width:100%" row="3" id="promptText" name="promptText" ng-model="data.promptText" required"></div>',
        title: params.title,
        scope: scope,
        buttons: [
          { 
            text: 'Cancel' ,
            onTap: function(e){
              return {
                btn: 'cancel'
              }
            }
          }, {
            text: '<b>Ok</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (scope.data.promptText){
                return {
                  btn: 'ok',
                  result: scope.data.promptText
                }
              } else {
                e.preventDefault();
              }
            }
          }
        ]
      });
      myPopup.then(function(res){
        if (res.btn === 'ok'){
          okCb(res.result)
        } else {
          cancelCb();
        }
      })
    },
    promptSelect: function(params, okCb, cancelCb){
      var scope = $rootScope.$new();
      scope.data = {};
      _.assign(scope, params);
      var myPopup = $ionicPopup.show({
        template: '{{info}}<div><select id="promptSelect" ng-options="item.id as item.name for item in options" name="promptSelect" ng-model="data.promptSelect" required"></div>',
        title: params.title,
        scope: scope,
        buttons: [
          { 
            text: 'Cancel' ,
            onTap: function(e){
              return {
                btn: 'cancel'
              }
            }
          }, {
            text: '<b>Ok</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (scope.data.promptSelect){
                return {
                  btn: 'ok',
                  result: scope.data.promptSelect
                }
              } else {
                e.preventDefault();
              }
            }
          }
        ]
      });
      myPopup.then(function(res){
        if (res.btn === 'ok'){
          okCb(res.result)
        } else {
          cancelCb();
        }
      })
    },
    info: function(params){
      var scope = $rootScope.$new();
      scope.data = {};
      _.assign(scope, params);
      var myPopup = $ionicPopup.alert({
        template: '{{info}}',
        title: params.title,
        scope: scope,
        okText: '确定'
      });
      myPopup.then(function(){
      })
    },
    alert: function(params, okCb, cancelCb){
      var scope = $rootScope.$new();
      scope.data = {};
      _.assign(scope, params);
      var myPopup = $ionicPopup.show({
        template: '{{info}}',
        title: params.title,
        scope: scope,
        buttons: [
          { 
            text: 'Cancel' ,
            onTap: function(e){
              return {
                btn: 'cancel'
              }
            }
          }, {
            text: '<b>Ok</b>',
            type: 'button-positive',
            onTap: function(e) {
              return {
                btn: 'ok'
              }
            }
          }
        ]
      });
      myPopup.then(function(res){
        if (res && res.btn === 'ok'){
          okCb()
        } else {
          cancelCb();
        }
      })
    },
    images: function(images, index){
      var scope = $rootScope.$new();
      scope.images = images;
      scope.index = index;
      $ionicModal.fromTemplateUrl('templates/modal-images.html', {scope: scope}).then(function(modal) {
        scope.modal = modal;
        modal.show();

        scope.closeModal = function(){
          modal.remove()
        }
      })
    }

  };
});
