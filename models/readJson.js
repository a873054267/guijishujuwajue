/**
 * Created by Administrator on 2017/12/11.
 */
var fs=require("fs");
var path=require("path");
exports.getAllAlbums=function(){
    fs.readdir("./upload",function(err,files){
        var allAlbums=[];
        console.log("123");
        fs.readdir(__dirname+"./upload",function(err,files){
                    //files是个文件名的数组，并不是文件的数组，表示./album这个文件夹中的所有东西
                     //包括文件、文件夹
                     for(var i = 0 ; i < files.length ;i++){
                            var thefilename = files[i];
                            //又要进行一次检测
                            fs.stat("./album/" + thefilename , function(err,stats){
                                   //如果他是一个文件夹，那么输出它：
                                   if(stats.isDirectory()){
                                          allAlbums.push(thefilename);
                                      }
                                  console.log(allAlbums);
                               });
                       }
             });
        /*(function itrator(i) {
            if (i == files.length) {
                console.log(allAlbums);
                return allAlbums;
            }
            fs.stat("./upload" + files[i],function (err, stats) {
                if (stats.isDirectory()) {
                    allAlbums.push(files[i]);
                }
                itrator(i + 1);
            });
        })(0);*/

    });
}