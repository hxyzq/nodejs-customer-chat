/**
 * config
 */

var path = require('path');

var config = {

  name: '时尚汇', // 网站名字
  description: ' 汇聚时尚元素 解读时尚潮流,以时尚高端采访为核心及特色的大型时尚类节目', // 网站的描述

  // mysql配置
  db: {
    database: 'fashion_development', // 数据库名
    username: 'root_dev', // 用户名
    password: 'fashion123', // 密码
    host    : '139.196.184.225'
  }

}

module.exports = config;