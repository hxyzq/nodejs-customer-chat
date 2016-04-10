"use strict";

module.exports = function(sequelize, DataTypes) {
  var CallCenterEvent = sequelize.define("CallCenterEvent", {
    id          :{                       //事件id
      type      : DataTypes.INTEGER,
      primaryKey: true
    },
    user_id     : DataTypes.STRING(255), // 用户id
    user_name   : DataTypes.STRING(255), // 用户名
    staff_id    : DataTypes.STRING(255), // 客服id
    staff_name  : DataTypes.STRING(255), // 客服名
    start_time  : DataTypes.DATE,        // 服务开始时间
    end_time    : DataTypes.DATE         // 服务结束时间
  }, {
    classMethods: {
      associate: function(models) {
        CallCenterEvent.hasMany(models.CallCenterContent)
      }
    },
    timestamps: false,
    tableName: 'callcenter_event'
  });

  return CallCenterEvent;
};
