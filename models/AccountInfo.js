'use strict';

module.exports = function(sequelize, DataTypes) {
  var AccountInfo = sequelize.define('AccountInfo', {
    user_name       : DataTypes.STRING(20),
    nick_name       : DataTypes.STRING(20),
    bind_mobilephone: DataTypes.STRING(11),
    bind_email      : DataTypes.STRING(100),
    password        : DataTypes.STRING(32)
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    createdAt: 'date_created', // create and update timestamp rename
    updatedAt: 'last_updated',

    tableName: 'account_info' // table rename

  });
  return AccountInfo;
};

// 用户注册信息表