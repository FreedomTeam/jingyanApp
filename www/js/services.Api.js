angular.module('services.Api', [])

.service('Api', function (User, Restangular, baseUrl) {
  Restangular.addFullRequestInterceptor(User.tokenInterceptor);
  var dataOrders = {
    chat: 'desc',
    news: 'desc',
    list: 'asc'
  }
  return {
    tranUrls: function(urls){
      var rst = [];
      _.forEach(urls, function(url){
        rst.push(baseUrl + url);
      });
      return rst;
    },
    tranUrl: function(url){
      return baseUrl + url;
    },
    bindList: function(api, scope, scopeField, bindType, options){
      var bindStruct = {
        api: api,
        scope: scope,
        scopeField: scopeField,
        bindType: bindType,
        options: options,
        moreData: [],
        dataOrder: dataOrders[bindType],
      };
      options = options?options:{};
      switch(bindStruct.bindType){
        case 'chat':
          options._last = '';
          bindStruct.moreDataMeta = '_prev';
          break;
        case 'news':
          options._last = '';
          bindStruct.moreDataMeta = '_prev';
          break;
        case 'list':
          options._first = '';
          bindStruct.moreDataMeta = '_next';
          break;
      }
      console.debug(options)

      bindStruct.refresh = function(){
        if (!bindStruct.scope[bindStruct.scopeField]) bindStruct.scope[bindStruct.scopeField] = [];
        return bindStruct.api.getList(options).then(function(data){
          console.debug(data.meta[bindStruct.moreDataMeta])
          return Restangular.allUrl(data.meta[bindStruct.moreDataMeta]).getList().then(function(innerData){
            console.debug(_.pluck(innerData, 'title'));
            bindStruct.moreData = innerData;
            var tmpData = _.sortByOrder(data, [options.order?options.order:'id'], bindStruct.dataOrder);
            for(var index = 0; index < tmpData.length; index++){
              if (bindStruct.scope[bindStruct.scopeField][index]){
                _.merge(bindStruct.scope[bindStruct.scopeField][index], tmpData[index])
              } else {
                bindStruct.scope[bindStruct.scopeField].push(tmpData[index]);
              }
            }
            console.debug('data1', data)
            console.debug('list1', bindStruct.scope[bindStruct.scopeField]);
            bindStruct.scope[bindStruct.scopeField].splice(tmpData.length);
            console.debug(bindStruct.scope[bindStruct.scopeField]);
            bindStruct.scope[bindStruct.scopeField].meta = data.meta;
            bindStruct.scope[bindStruct.scopeField].meta[bindStruct.moreDataMeta] = innerData.meta[bindStruct.moreDataMeta];
          }, function(err){
            if (err.status === 404){
              bindStruct.moreData = [];
              var tmpData = _.sortByOrder(data, [options.order?options.order:'id'], bindStruct.dataOrder);
              for(var index = 0; index < tmpData.length; index++){
                if (bindStruct.scope[bindStruct.scopeField][index]){
                  _.merge(bindStruct.scope[bindStruct.scopeField][index], tmpData[index])
                } else {
                  bindStruct.scope[bindStruct.scopeField].push(tmpData[index]);
                }
              }
              console.debug('data2', data)
              console.debug('list2', bindStruct.scope[bindStruct.scopeField]);
              bindStruct.scope[bindStruct.scopeField].splice(tmpData.length)
              bindStruct.scope[bindStruct.scopeField].meta = data.meta;
            }
            console.debug(err);
          });
        }, function(err){
          console.debug(err)
          bindStruct.scope[bindStruct.scopeField] = [];
          bindStruct.moreData = [];
        })
      }
      bindStruct.more = function(){
        return Restangular.allUrl(bindStruct.scope[bindStruct.scopeField].meta[bindStruct.moreDataMeta]).getList().then(function(data){
          bindStruct.scope[bindStruct.scopeField].meta[bindStruct.moreDataMeta] = data.meta[bindStruct.moreDataMeta];
          var tmpDatum;
          while(tmpDatum = bindStruct.moreData.pop()){
            bindStruct.scope[bindStruct.scopeField].push(tmpDatum);
          }
          console.debug('more data1', bindStruct.moreData)
          console.debug('more list1', bindStruct.scope[bindStruct.scopeField]);
          bindStruct.moreData = data;
          bindStruct.scope[bindStruct.scopeField].meta[bindStruct.moreDataMeta] = data.meta[bindStruct.moreDataMeta];
        }, function(err){
          if (err.status === 404){
            console.debug('more data2', bindStruct.moreData)
            console.debug('more list2', bindStruct.scope[bindStruct.scopeField]);
            while(tmpDatum = bindStruct.moreData.pop()){
              bindStruct.scope[bindStruct.scopeField].push(tmpDatum);
            }
            bindStruct.moreData = [];
          }
        })
      }

      return bindStruct;
    }
  }
  
});