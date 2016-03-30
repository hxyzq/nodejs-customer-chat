'use strict';

module.exports = function(sequelize, DataTypes) {
  var PlatformStaff = sequelize.define('PlatformStaff', {
    real_name  : DataTypes.STRING(20),
    telephone  : DataTypes.STRING(18),
    mobilephone: DataTypes.STRING(11),
    email      : DataTypes.STRING(100)
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    createdAt: 'date_created', // create and update timestamp rename
    updatedAt: 'last_updated',

    tableName: 'platform_staff_info' // table rename

  });
  return PlatformStaff;
};

// 系统员工信息表