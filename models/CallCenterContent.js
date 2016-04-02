"use strict";

module.exports = function(sequelize, DataTypes) {
  var CallCenterContent = sequelize.define("CallCenterContent", {
    speak_time: DataTypes.DATE,              // 发言时间
    speaker   : DataTypes.BOOLEAN,           // 发言人 0-user 1-staff
    content   : DataTypes.STRING(255),       // 内容
    image_file: DataTypes.STRING(100)        // 图片路径
  }, {
    classMethods: {
      associate: function(models) {
        CallCenterContent.belongsTo(models.CallCenterEvent, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    },
    timestamps: false,
    tableName: 'callcenter_content'
  });

  return CallCenterContent;
};
