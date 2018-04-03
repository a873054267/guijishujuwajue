/**
 * Created by Administrator on 2018/3/19.
 */

var scaleLineControl = new ol.control.ScaleLine({
    units: 'metric',
    target: 'scalebar',
    className: 'ol-scale-line'
});
map.addControl(scaleLineControl);
//测量
function  draw(drawType){
    //实例化一个矢量图层Vector作为绘制层
    var vector = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.7)'
            }),
            stroke: new ol.style.Stroke({
                color: '#0099ff',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#0099ff'
                })
            })
        })
    });
    map.addLayer(vector); //将绘制层添加到地图容器中
     var draw = new ol.interaction.Draw({
        source: vector.getSource(), //绘制层数据源
        type: drawType //几何图形类型
    });
    map.addInteraction(draw);
};

function measure(type){
    //定义矢量数据源
    var source = new ol.source.Vector();
    //定义矢量图层
    var vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color:'rgba(255,255,255,0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#e21e0a',
                width:2
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color:'#ffcc33'
                })
            })
        })
    });
    //将矢量图层添加到地图中
    map.addLayer(vector);
    var sketch = new ol.Feature();
    var measureTooltipElement;
    var measureTooltip;
    var draw;
    function addInteraction() {
        draw = new ol.interaction.Draw({
            source: source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color:'rgba(255,255,255,0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0,0,0,0.5)',
                    lineDash: [10, 10],
                    width:2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color:'rgba(0,0,0,0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255,255,255,0.2)'
                    })
                })
            })
        });
        //将交互绘图对象添加到地图中
        map.addInteraction(draw);
        //创建测量提示框
        createMeasureTooltip();
        var listener;
        //定义一个控制鼠标点击次数的变量
        var count = 0;
        //绘制开始事件
        draw.on('drawstart', function (evt) {
            sketch = evt.feature;
            var tooltipCoord ;
            listener = sketch.getGeometry().on('change', function (evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    map.removeEventListener('singleclick');
                    map.removeEventListener('dblclick');
                    //输出多边形的面积
                    output = formatArea(geom);
                    //Return an interior point of the polygon.
                    //获取多变形内部点的坐标
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                    //输出多线段的长度
                    output = formatLength(geom);
                    //Return the last coordinate of the geometry.
                    //获取多线段的最后一个点的坐标
                    tooltipCoord = geom.getLastCoordinate();
                }

                //设置测量提示框的内标签为最终输出结果
                measureTooltipElement.innerHTML = output;
                //设置测量提示信息的位置坐标
                measureTooltip.setPosition(tooltipCoord);
            });

            //地图单击事件
            map.on('singleclick', function (evt) {
                measureTooltip.setPosition(evt.coordinate);

                if (count == 0) {
                    measureTooltipElement.innerHTML = "起点";
                }

                var point = new ol.geom.Point(evt.coordinate);

                source.addFeature(new ol.Feature(point));
                measureTooltipElement.className = 'tooltip tooltip-static';
                createMeasureTooltip();
                count++;
            });

            map.on('dblclick', function (evt) {
                var point = new ol.geom.Point(evt.coordinate);
                source.addFeature(new ol.Feature(point));
            });
        });
        draw.on('drawend', function (evt) {
            count = 0;
            measureTooltipElement.className = 'tooltip tooltip-static';
            measureTooltip.setOffset([0, -7]);
            sketch = null;
            measureTooltipElement = null;
            createMeasureTooltip();
            ol.Observable.unByKey(listener);
            map.removeEventListener('singleclick');
        });
    }
    //创建测量提示框
    function createMeasureTooltip() {
        //创建测量提示框的div
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.setAttribute('id','lengthLabel');
        //设置测量提示要素的样式
        measureTooltipElement.className = 'tooltip tooltip-measure';
        //创建一个测量提示的覆盖标注
        measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning:'bottom-center'
        });
        //将测量提示的覆盖标注添加到地图中
        map.addOverlay(measureTooltip);
    }
    //添加交互绘图对象
    addInteraction();

};
var formatLength = function (line,isGeodesic) {
    var length;
    if (isGeodesic) {
        var coordinates = line.getCoordinates();
        length = 0;
        var sourceProj = map.getView().getProjection();
        for (var i = 0; i < coordinates.length - 1; i++) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
            length += wgs84Sphere.haversineDistance(c1,c2);
        }
    } else {
        length = Math.round(line.getLength() * 100) / 100;
    }
    var output;
    if (length > 1000) {
        output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km'; //换算成KM单位
    } else {
        output = (Math.round(length * 100) / 100) + ' ' + 'm'; //m为单位
    }
    return output;
};

//格式化测量面积
var formatArea = function (polygon,isGeodesic) {
    var area;
    if (isGeodesic) {
        var sourceProj = map.getView().getProjection();
        var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
        var coordinates = geom.getLinearRing(0).getCoordinates();
        area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    } else {
        area = polygon.getArea();
    }
    var output;
    if (area > 10000) {
        output = (Math.round(area/1000000*100)/100) + ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area*100)/100) + ' ' + 'm<sup>2</sup>';
    }
    return output;
};