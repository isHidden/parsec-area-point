/**
 * Created by Miku on 16/3/1.
 */
var MyHint = AV.Object.extend("MyHint");
$(function(){
    loadPoint();
    // loaddata();
    // loadIndex();
});
// 百度地图API功能
var opts = {
    width : 180,     // 信息窗口宽度
    height: 100,     // 信息窗口高度
    title : "" , // 信息窗口标题
}





var mk;
var point;
function getGeolocation(){
    var geolocation=new BMap.Geolocation();
    geolocation.getCurrentPosition(function(r){
        if(this.getStatus()==BMAP_STATUS_SUCCESS){
            map.removeOverlay(mk);
            var myIcon=new BMap.Icon("./images/location_icon.png",new BMap.Size(30,30));
            mk=new BMap.Marker(r.point,{icon:myIcon});//创建标注
            map.addOverlay(mk);
            point = r.point;
            //alert('您的位置：'+r.point.lng+','+r.point.lat);
            console.log("Positioningsuccess"+r.point.lng+','+r.point.lat);
        }
        else{
            //alert('failed'+this.getStatus());
        }
    },{enableHighAccuracy:true});
}

function panTo(){
    map.panTo(point);
}


/*
 * 加载出已有的数据  界面展示
 */
function loaddata() {
    var query = new AV.Query(MyHint);
    query.get(appObjectIds.areaPointSet_objectId, {
        success: function (obj) {
            var myHtml = obj.get("content");
            $('.fu-content').html(myHtml);
        },
        error: function (object, error) {
            alert("错误:" + error.message);
        }
    });
}

function loadIndex(){
    AV.Cloud.run("mobile_areaPoint_index",{},{
        success:function(data){
            var html = "<ul class=\"flex-box\">";
            for(var i = 0;i<data.list.length;i++){
                if(i>0&&i%3==0){
                    html+="</ul><ul class=\"flex-box\">";
                }
                html+="<li class=\"flex-1\" onclick=\"loadPoint('"+data.list[i].item.join(",")+"')\"><img src=\""+data.list[i].icon+"\" class=\"icon\"><p>"+data.list[i].name+"</p></li>";
            }
            if(data.list.length%3!=0){
                for(var n = 0;n<3-(data.list.length%3);n++){
                    html+="<li class=\"flex-1\"></li>";
                }
            }
            html+="</ul>";
            $(".menu-lst").html(html);
        },
        error:function(error){
            console.log(JSON.stringify(error));
        }
    });
}

function loadPoint(ids) {
    AV.Cloud.run("mobile_areaPoint",{ids:ids},{
        success:function(data){
            getGeolocation();
            setInterval(function(){
                getGeolocation();
            },10000);

            $("#page1").hide();
            map.clearOverlays();
            var setList = data.setList;
            var areaList = data.areaList;

            setList.forEach(function(obj){
                var tmplist = new Array();
                areaList.forEach(function(data){
                    if(data.timesId==obj.objectId){
                        tmplist.push(new BMap.Point(data.lng, data.lat));
                    }
                });
                var polygon = new BMap.Polygon(tmplist, {strokeColor:obj.color, strokeWeight:2, strokeOpacity:0.5});  //创建图形
                map.addOverlay(polygon);

                var len = 0;
                if(obj.title){
                    len = obj.title.length;
                }

                var point = polygon.getBounds().getCenter();
                map.panTo(point);
                opts.position = point;
                opts.title = obj.title;
                opts.offset = new BMap.Size((-Number(len/2))*12, 0)    //设置文本偏移量
                var label = new BMap.Label(obj.title, opts);  // 创建文本标注对象
                label.setStyle({
                    color : "red",
                    fontSize : "12px",
                    height : "20px",
                    lineHeight : "20px",
                    fontFamily:"微软雅黑"
                });
                map.addOverlay(label);

                // var myCompOverlay = new ComplexCustomOverlay(point, obj.title,mouseoverTxt);
                // map.addOverlay(myCompOverlay);

                var infoWindow = new BMap.InfoWindow(obj.content, opts);  // 创建信息窗口对象
                label.addEventListener("click", function(){
                    map.openInfoWindow(infoWindow,point); //开启信息窗口
                });
            });
        },
        error:function(error){
            console.log(JSON.stringify(error));
        }
    });
}