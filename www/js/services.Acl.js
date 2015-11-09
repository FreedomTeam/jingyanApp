angular.module('services.Acl', [])
.service('Acl', function($state){
  var nodeAclConfigs = [
    {
      roles: ['A'],
      allows: [
        {resources: ['G'], permissions: ['C', 'L', 'U', 'D']}
      ]
    },{
      roles: ['A', 'G'],
      allows: [
        {resources: ['C', 'S', 'Q', 'P', 'B'], permissions: ['C', 'L', 'U', 'D']}
      ]
    },{
      roles: ['B', 'S'],
      allows: [
        {resources: ['C'], permissions:['C', 'L', 'U']}
      ]
    },{
      roles: ['A', 'G', 'B', 'S', 'Q', 'P', 'C'], 
      allows: [
        {resources: ['News', 'Products'], permissions: ['L', 'R']}
      ]
    },{
      roles: ['A', 'G', 'B', 'S'], 
      allows: [
        {resources: ['News'], permissions: ['C']}
      ]
    },{
      roles: ['A', 'G'], 
      allows: [
        {resources: ['News'], permissions: ['U', 'Release', 'D']}
      ]
    },{
      roles: ['A', 'G', 'B'], 
      allows: [
        {resources: ['Products'], permissions: ['C']}
      ]
    },{
      roles: ['A', 'G'], 
      allows: [
        {resources: ['Products'], permissions: ['U', 'Release', 'Off']}
      ]
    },{
      roles: ['A', 'G', 'B', 'S', 'C'], 
      allows: [
        {resources: ['CartItems'], permissions: ['C', 'L', 'U', 'D']}
      ]
    },{
      roles: ['G', 'D', 'T'], 
      allows: [
        {resources: ['Orders'], permissions: ['L']}
      ]
    },{
      roles: ['G', 'D', 'T'], 
      allows: [
        {resources: ['Orders'], permissions: ['ConfirmPaid']}
      ]
    },{
      roles: ['G', 'D', 'T'], 
      allows: [
        {resources: ['Orders'], permissions: ['ConfirmProd','ScheduleUpdate']}
      ]
    },{
      roles: ['G', 'D', 'T'], 
      allows: [
        {resources: ['Orders'], permissions: ['ConfirmTran']}
      ]
    },{
      roles: ['A', 'G', 'S', 'Q'], 
      allows: [
        {resources: ['Orders'], permissions: ['ProgressUpdate']}
      ]
    },{
      roles: ['A', 'G', 'P'], 
      allows: [
        {resources: ['Orders'], permissions: ['PurchaseUpdate']}
      ]
    },{
      roles: ['A', 'G', 'S'], 
      allows: [
        {resources: ['Orders'], permissions: ['OrderUpdate']}
      ]
    },{
      roles: ['A', 'G'], 
      allows: [
        {resources: ['Orders'], permissions: ['ConfirmFin', 'ApproveUpdate']}
      ]
    },{
      roles: ['C'], 
      allows: [
        {resources: ['Orders'], permissions: ['Comment']}
      ]
    }
  ];

  var allPermissions = [];
  angular.forEach(nodeAclConfigs, function(config){
    angular.forEach(config.roles, function(role){
      angular.forEach(config.allows, function(allow){
        angular.forEach(allow.resources, function(resource){
          angular.forEach(allow.permissions, function(permission){
            allPermissions.push({
              role: role,
              resource: resource,
              permission: permission
            })
          })
        })
      })
    })
  })

  return {
    isAllowed: function(user, resources, permissions){
      return _.some(allPermissions, function(config){
        return user.userRoleId == config.role && _.includes(resources, config.resource) && _.include(permissions, config.permission);
      });
    },
    whatPermitResources: function(user, permission){
      return _.find(allPermissions, {
        role: user.userRoleId,
        permission: permission
      });
    },
    whatPermitResourcesFilter: function(user, permission){
      var roles = _.pluck(_.where(allPermissions, {
        role: user.userRoleId,
        permission: permission
      }), 'resource');
      return function(value){
        return _.includes(roles, value.id);
      }
    }
  }
})