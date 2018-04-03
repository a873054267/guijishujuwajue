/**
 * Created by Administrator on 2018/3/19.
 */
//查询事件
$(function(){
    $("#btnQueryRoad").click(function(){
        $.ajax({
            url: '/queryRoad/:id',
            data: $('#queryForm').serialize(),
            success: function(data){
                var data = formatData(data);
                console.log(JSON.stringify(data));
                var vectorQuery = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(data)
                });
                var JsonQuery = new ol.layer.Vector({
                    source:vectorQuery
                });
                map.addLayer(JsonQuery);
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert('error ' + textStatus + " " + errorThrown);
            }
        });
    });

});
//标准化json数据
function formatData (data) {
    if (data && data['rows']) {
        var features = data['rows'].map(function (item) {
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": ol.proj.transform(JSON.parse(item['st_asgeojson'])['coordinates'],'EPSG:4326','EPSG:3857')
                }
            }
        });
        return {
            "type": "FeatureCollection",
            "features": features
        }
    }
};
//地图操作点击事件
$(function(){
    var i=0;
    var points_layer;
    $(".roadNet").click(function(){
        i++;
        if(i % 2==1) {
            var points_source = new ol.source.ImageWMS({
                    url: 'http://localhost:8080/geoserver/wsf/wms',
                    params: {
                        'FORMAT': 'image/png',
                        'VERSION': '1.1.1',
                        tiled: true,
                        LAYERS: 'wsf:Beijing_Polyline_WGS',
                        tilesOrigin: 116.30184000000008 + "," + 39.86570000000006
                    }
                }
            );
            points_layer = new ol.layer.Image( {source : points_source });
            map.addLayer(points_layer);
        }
        else {
            map.removeLayer(points_layer);
        }

    })
});
$(function(){
    $(".map").click(function(){
        var layers=map.getLayers();
        console.log(layers.getLength());
        if(gaodeLayer){
            map.remove(gaodeLayer);
        }

        if(baidu_layer){
            map.remove(baidu_layer);
        }
        if($(this).attr("id")=="mapGaode") {
        var gaodeLayer=new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
            }),
            name:'高德地图'
        });
        map.addLayer(gaodeLayer);
        }
        else if($(this).attr("id")=="mapGoogle"){
            var googleLayer = new ol.layer.Tile({
                layerName: 'Google',
                isBaseLayer: true,
                source: new ol.source.GOOGLE()
            });
            map.addLayer(googleLayer);
        }
        else if($(this).attr("id")=="mapBaidu"){
            var projection = ol.proj.get("EPSG:3857");
            var resolutions = [];
            for(var i=0; i<19; i++){
                resolutions[i] = Math.pow(2, 18-i);
            }
            var tilegrid  = new ol.tilegrid.TileGrid({
                origin: [0,0],
                resolutions: resolutions
            });
            var baidu_source = new ol.source.TileImage({
                projection: projection,
                tileGrid: tilegrid,
                tileUrlFunction: function(tileCoord, pixelRatio, proj){
                    if(!tileCoord){
                        return "";
                    }
                    var z = tileCoord[0];
                    var x = tileCoord[1];
                    var y = tileCoord[2];

                    if(x<0){
                        x = "M"+(-x);
                    }
                    if(y<0){
                        y = "M"+(-y);
                    }

                    return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x="+x+"&y="+y+"&z="+z+"&styles=pl&udt=20151021&scaler=1&p=1";
                }
            });
            var baidu_layer = new ol.layer.Tile({
                source: baidu_source
            });
            map.addLayer(baidu_layer);
        }
    })
});
$(function(){
    $('.measure').click(function(){
        var interac=map.getInteractions();
        interac.forEach(function(temp,i){
            if( temp instanceof ol.interaction.Draw){
                map.removeInteraction(temp);
            }
        },this)
        var value=$(this).attr("id");
        if(value=='area'){
            measure('Polygon');
        }
        else {
            measure('LineString');
        }
    })
});
//轨迹回放
$(function(){
    $('.taceBack').click(function(){
        $.ajax({
            url: '/queryPosition',
            success: function(data) {
                var data = formatData(data);
                var jsonOb = data.features;
                var arryCoor = [];
                for (var i = 0; i < jsonOb.length; i++) {
                    arryCoor.push(jsonOb[i].geometry.coordinates);
                }
                console.log(arryCoor.join('-'));
                for(var i=0;i<jsonOb.length;i++){
                    console.log(arryCoor[i]);
                }
                startTra(arryCoor);

            }

        });

    })
});
function  startTra(routeCoords){
    var route = new ol.geom.LineString(routeCoords);
    var routeLength = routeCoords.length;
    var routeFeature = new ol.Feature({
        type: 'route',
        geometry: route
    });
    var geoMarker = new ol.Feature({
        type: 'geoMarker',
        geometry: new ol.geom.Point(routeCoords[0])
    });
    var startMarker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(routeCoords[0])
    });
    var endMarker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(routeCoords[routeLength - 1])
    });

    var styles = {
        'route': new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 6, color: [237, 212, 0, 0.8]
            })
        }),
        'icon': new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                scale: 0.3,
                src: 'images/car.png'
            })
        }),
        'geoMarker': new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                scale: 0.2,
                src: 'images/taxi.png'
            })
        })
    };

    var animating = false;
    var speed, now;
    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [routeFeature, geoMarker, startMarker, endMarker]
        }),
        style: function(feature) {
            // hide geoMarker if animation is active
            if (animating && feature.get('type') === 'geoMarker') {
                return null;
            }
            return styles[feature.get('type')];
        }
    });
    map.addLayer(vectorLayer);
    speed=2;
    var  traversed = 0;//走过的路程
    var elapsedTime = 0; //用过的时间
    var  retime = 0; //保存上次运动所用的时间
    function startAnimation() {
        if (animating) {
        } else {
            animating = true;
            now = new Date().getTime();
            // hide geoMarker
            geoMarker.setStyle(null);
            // just in case you pan somewhere else
            map.getView().setCenter(map.getView().getCenter());
            map.on('postcompose', moveFeature);
            map.render();
        }
    }
    var moveFeature = function(event) {
        var frameState = event.frameState;
        if (animating) {
            if (retime == 0) {
                elapsedTime = frameState.time - now;
            } else {

                elapsedTime = frameState.time - retime;
            }
            retime = frameState.time;


            //计算路程
            var index = Math.round(speed * elapsedTime / 1000);
            traversed += index;
            //设置车的位置
            var currentPoint = new ol.geom.Point(routeCoords[traversed]);
            geoMarker.setGeometry(currentPoint);
            startAnimation();
        }
    };

     startAnimation();
}

