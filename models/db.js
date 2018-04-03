var pg=require("pg");
var exec = require('child_process').exec;
function conPG(callback){
	var conString = "postgres://postgres:123456@localhost/spatial";
	var client = new pg.Client(conString);
	client.connect(function(err,db) {
		if(err){
			console.log("连接失败");
			callback(err,null);
		}
		else{
			console.log("连接成功");
			callback(err,db)
		}

	})
}

exports.queryPos=function(params,callback){
	var conString = "postgres://postgres:123456@localhost/spatial";
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			console.log("连接失败");
		}
		else{
			var sql;
			if(params["selectNum"]=="全部"){
				sql='SELECT ST_AsGeoJSON(geom),gid FROM beijing_points';
			}
			//"SELECT ST_AsGeoJSON(geom),gid FROM beijing_points where  posdate >"+params["startTime"]+"vehiclenum='"+params["posName"]+"'"
			else{
				sql="SELECT ST_AsGeoJSON(geom),gid FROM beijing_points where posdate <'"+params["endTime"]+"'"+"and posdate >'"+params["startTime"]+"' and vehiclenum='"+params["selectNum"]+"'";
			}
			client.query(sql, function(err, result) {
				if(err) {
					callback("查询失败",null);
					return console.error('error running query', err);
				}
				else{
					client.end();
					callback(null,result);
					return;
				}
			})
		}

	});
};
function  getCurrentime(){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	var hours=date.getHours();
	var min=date.getMinutes();
	var second=date.getSeconds();
	var str=year+""+month+""+strDate+""+hours+""+min+""+second;
	return str;
}
exports.insertToDB=function(name,callback){
	var cmd='cd /d "E:/postsql/bin>" && shp2pgsql -W "GBK" E:/node-work/new/uploads/'+name+'.shp  '+name+' >C:/tcc/viwpt.sql && psql -d spatial -f C:/tcc/viwpt.sql postgres';
	exec(cmd, function(error, stdout, stderr) {
		if(error){
			console.log(error);
			callback("插入失败",null);
		}
		else{
			console.log("插入成功");
			callback(null,stdout);
		}
	});
}
exports.queryTra=function(params,callback){
	var conString = "postgres://postgres:123456@localhost/spatial";
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
			console.log("连接失败");
		}
		else{
			//"SELECT ST_AsGeoJSON(geom),gid FROM beijing_points where  posdate >"+params["startTime"]+"vehiclenum='"+params["posName"]+"'"
			var sql="SELECT ST_AsGeoJSON(geom),postdate FROM postion where vehiclenum='194731' Order By postdate asc";
			client.query(sql, function(err, result) {
				if(err) {
					callback("查询失败",null);
					return
				}
				else{
					callback(null,result);
					client.end();
					return;
				}
			})
		}

	});
};

