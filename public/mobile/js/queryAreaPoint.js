/**
 * Created by Miku on 16/3/1.
 */

// 百度地图API功能
var opts = {
    width : 180,     // 信息窗口宽度
    height: 100,     // 信息窗口高度
    title : "" , // 信息窗口标题
}

AV.Cloud.run("mobile_areaPoint",{},{
    success:function(data){
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

getGeolocation();

setInterval(function(){
    getGeolocation();
},10000);

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



// 复杂的自定义覆盖物
// function ComplexCustomOverlay(point, text, mouseoverText){
//     this._point = point;
//     this._text = text;
//     this._overText = mouseoverText;
// }
// ComplexCustomOverlay.prototype = new BMap.Overlay();
// ComplexCustomOverlay.prototype.initialize = function(map){
//     this._map = map;
//     var div = this._div = document.createElement("div");
//     div.style.position = "absolute";
//     div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
//     div.style.backgroundColor = "#EE5D5B";
//     div.style.border = "1px solid #BC3B3A";
//     div.style.color = "white";
//     div.style.padding = "2px";
//     div.style.lineHeight = "18px";
//     div.style.wordBreak = "break-all";
//     div.style.MozUserSelect = "none";
//     div.style.fontSize = "12px";
//     var span = this._span = document.createElement("span");
//     div.appendChild(span);
//     span.appendChild(document.createTextNode(this._text));
//     var that = this;
//
//     var arrow = this._arrow = document.createElement("div");
//     arrow.style.position = "absolute";
//     arrow.style.width = "11px";
//     arrow.style.height = "10px";
//     arrow.style.top = "22px";
//     arrow.style.left = "10px";
//     arrow.style.overflow = "hidden";
//     div.appendChild(arrow);
//
//     div.onmouseover = function(){
//         this.style.backgroundColor = "#6BADCA";
//         this.style.borderColor = "#0000ff";
//         this.getElementsByTagName("span")[0].innerHTML = that._overText;
//         arrow.style.backgroundPosition = "0px -20px";
//     }
//
//     div.onmouseout = function(){
//         this.style.backgroundColor = "#EE5D5B";
//         this.style.borderColor = "#BC3B3A";
//         this.getElementsByTagName("span")[0].innerHTML = that._text;
//         arrow.style.backgroundPosition = "0px 0px";
//     }
//
//     map.getPanes().labelPane.appendChild(div);
//
//     return div;
// }
// ComplexCustomOverlay.prototype.draw = function(){
//     var map = this._map;
//     var pixel = map.pointToOverlayPixel(this._point);
//     this._div.style.left = pixel.x - parseInt(this._arrow.style.left) + "px";
//     this._div.style.top  = pixel.y - 30 + "px";
// }
// var txt = "银湖海岸城", mouseoverTxt = txt + " " + parseInt(Math.random() * 1000,10) + "套" ;
//
// var myCompOverlay = new ComplexCustomOverlay(new BMap.Point(116.407845,39.914101), "银湖海岸城",mouseoverTxt);
//
