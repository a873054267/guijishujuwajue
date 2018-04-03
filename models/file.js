/**
 * Created by Administrator on 2017/12/11.
 */
const fs=require("fs");
const path=require("path");
var multiparty=require("multiparty");

var form = new multiparty.Form();




exports.uploadFiles=function(req,res,callback){
    var fileName=[];
    var form = new multiparty.Form({
        uploadDir: './uploads'
    });
    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
        callback(err,null);
    });
    form.on('file', function (name, file) {
        fs.rename(file.path, './uploads/' + file.originalFilename, function(err) {
            if(err){
                callback("上传失败",null);
                console.log('rename error: ' + err);

            } else {
                fileName.push(file.originalFilename);
            }
            callback(null,fileName);
        });
    })
    form.parse(req);

};
exports.deleteAllFiles=function(fileUrl){
    var files = fs.readdirSync(fileUrl);//读取该文件夹
    files.forEach(function(file){
        var stats = fs.statSync(fileUrl+'/'+file);
        if(stats.isFile()){
            fs.unlinkSync(fileUrl+'/'+file);
            console.log("删除文件"+fileUrl+'/'+file+"成功");
            return;
        }
    })
}
