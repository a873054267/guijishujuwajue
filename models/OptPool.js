var mysql  = require('mysql');  //调用MySQL模块 
function OptPool(){ 
    this.flag=true; //是否连接过 
    this.pool = mysql.createPool({     
        host: 'localhost',       //主机 
        user: 'postgres',               //MySQL认证用户名 
        password: '123456',        //MySQL认证用户密码 
        database: 'test', 
        port: '5432'                   //端口号 
    }); 
 
    this.getPool=function(){ 
        if(this.flag){ 
            //监听connection事件 
            this.pool.on('connection', function(connection) {  
                connection.query('SET SESSION auto_increment_increment=1'); 
                this.flag=false; 
            }); 
        } 
        return this.pool; 
    } 
}; 
module.exports = OptPool; 