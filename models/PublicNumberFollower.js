'use strict';

module.exports = function(sequelize, DataTypes) {
  var PublicNumberFollower = sequelize.define('PublicNumberFollower', {
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },

    tableName: 'public_number_follower' // table rename

  });
  return PublicNumberFollower;
};

// 微推员信息表