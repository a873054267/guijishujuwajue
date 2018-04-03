var express = require("express");
var app = express();

app.use(express.static('public'));
app.set("view engine","ejs");

var router=require("./controller/router");

app.get("/",function(req,res){
	res.render("index",{
		"datamanage":["道路网查询","上传轨迹数据","微博数据","其它"],
		"datamanageID":["query","upload","loadWeibo","other"],
		"dataAnalysis":["道路网提取","路况分析","道路名称提取","停车场位置提取"],
		"dataAnalysisID":["roadNet","roadSta","roadName","posExtra"]
	});
});

app.get("/queryRoad/:id",router.query);
app.get("/queryPosition",router.queryTra);

app.post("/upload",router.upload);
app.listen(3000);
console.log("正在监听http:\\localhost\:"+3000);
