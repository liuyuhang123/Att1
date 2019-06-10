const mysql = require('mysql');
//连接数据库
let connectio = mysql.createConnection({
  host: '127.0.0.1', //服务器名字
  user: 'root', //账户名
  password: 'root', //密码
  database: 'att', //链接数据库名
});

connectio.connect(err=>{
  if(err){
      console.error(`链接数据库失败:${err.message}`)
      process.exit(0)
  }
});
module.exports = connectio
