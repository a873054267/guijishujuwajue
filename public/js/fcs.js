 var exec = require('child_process').exec;
 function  execute(){
     var cmd='cd /d "E:/postsql/bin>" && shp2pgsql -W "GBK" C:/tcc/beijing_points.shp  viwpt >C:/tcc/viwpt.sql && psql -d spatial -f C:/tcc/viwpt.sql postgres';
     exec(cmd, function(error, stdout, stderr) {
         if(error){
             console.log(error);
         }
         else{
             console.log("成功");
         }
     });
 }
 execute();