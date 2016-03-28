'use strict';

module.exports = function(sequelize, DataTypes) {
  var UserRole = sequelize.define('UserRole', {

  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    tableName: 'system_user_role'

  });
  return UserRole;
};

// 用户注册信息表