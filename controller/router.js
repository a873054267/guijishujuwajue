var file=require("../models/file.js");
var fs = require("fs");
var db=require("../models/db.js");


//查询定位点
exports.query=function(req,res){
    var params=req.query;
    db.queryPos(params,function(err,result){
        if(err){
            res.end("查询失败");
        }
        else
        {res.json(result);}

    })
};

//上传文件
exports.upload=function(req,res){
    file.uploadFiles(req,res,function(err,fileName){
        if(err){
            res.send("上传失败");
        }
        else{
            var filesName=fileName[0];
            var k=filesName.lastIndexOf(".");
            var filesNameWithoutExt= filesName.substring(0,k);
            var fileurl="E:/node-work/new/uploads";
            db.insertToDB(filesNameWithoutExt,function(err,stdout){
                if(err){
                    res.end("上传成功，插入数据库成功，删除原文件成功");
                }
                else {
                    file.deleteAllFiles(fileurl);
                    res.end("上传成功，插入数据库成功，删除原文件成功");
                }
            });
            res.end("上传成功，插入数据库成功，删除原文件成功");
        }
    });

    res.end();

};

exports.queryTra=function(req,res){
    var params=req.query;
    db.queryTra(params,function(err,result){
        if(err){
            res.end("查询失败");
        }
        else
        {res.json(result);}

    })
};