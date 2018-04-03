function createTable(eleid,rowcount){
    tableNode=document.createElement("table");//获得对象
    tableNode.setAttribute("id","table")
    var row=parseInt(rowcount);//获得行号
    //alert(row);
    if(row<=0 || isNaN(row) ){
        alert("输入的行号错误，不能创建表格，请重新输入：");
        return;
    }
    var cols=2;
    if(isNaN(cols) || cols<=0){
        alert("输入的列号错误，不能创建表格，请重新输入：");
        return;
    }
    //上面确定了 现在开始创建
    for(var x=0;x<row;x++){
        var trNode=tableNode.insertRow();
        for(var y=0;y<cols;y++){
            var tdNode=trNode.insertCell();
            tdNode.id="td"+x+y;
            //tdNode.innerHTML="单元格"+(x+1)+"-"+(y+1);
        }
    }
    eleid.appendChild(tableNode);//添加到那个位置
}
//传入对象
function pointInsideCircle(point, circle, r) {
    if (r===0) return false
    var dx = circle[0] - point[0]
    var dy = circle[1] - point[1]
    return dx * dx + dy * dy <= r * r
}

