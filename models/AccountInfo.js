'use strict';

module.exports = function(sequelize, DataTypes) {
  var AccountInfo = sequelize.define('AccountInfo', {

  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    tableName: 'account_info'

  });
  return AccountInfo;
};

// 用户注册信息表