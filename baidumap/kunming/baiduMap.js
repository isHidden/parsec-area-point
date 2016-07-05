/**
 * 百度地图JS封装
 */

var marker;
var map = new BMap.Map("baiduMap");
map.enableScrollWheelZoom();    //启用滚轮放大缩小，默认禁用
map.enableContinuousZoom(true);    //启用地图惯性拖拽，默认禁用
map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
map.addControl(new BMap.OverviewMapControl()); //添加默认缩略地图控件
map.addControl(new BMap.OverviewMapControl({ isOpen: false, anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));   //右下角，打开
map.centerAndZoom("昆明市",11);
map.panBy(305,165);
//map.centerAndZoom("成都市",12);
//map.setCurrentCity("成都市");// 设置地图显示的城市 此项是必须设置的
var localSearch = new BMap.LocalSearch(map);
//localSearch.enableAutoViewport(); //允许自动调节窗体大小
function initMap(){
	map.addEventListener("click",function(e){//手动标注地理信息
		putIconIntoMap(e.point.lng, e.point.lat, "images/curlocation.png", 30, 30, null);
		var gc = new BMap.Geocoder();
		//获取地址的数据地址
		gc.getLocation(e.point, function(rs){
			var addComp = rs.addressComponents;
			var lat=e.point.lat;
			var lng=e.point.lng;
			var address=addComp.province+addComp.city+addComp.district+addComp.street+addComp.streetNumber;
			document.getElementById("address").value =address;
			$("#lat").val(lat);
			$("#lng").val(lng);
			$("#locationName").val(address);
		});
	});
};
function searchByStationName() {
	map.clearOverlays();//清空原来的标注
	var keyword = document.getElementById("address").value;
	if(keyword == "" || keyword == undefined){
		keyword ="昆明市";
	}
	localSearch.setSearchCompleteCallback(function (searchResult) {
		var poi = searchResult.getPoi(0);
		$("#lat").val(poi.point.lat);
		$("#lng").val(poi.point.lng);
		$("#locationName").val(keyword);
		map.centerAndZoom(poi.point, 13);
		putIconIntoMap(poi.point.lng,poi.point.lat, "images/curlocation.png", 30, 30, null);//绘制苗点
	});
	localSearch.search(keyword);
}

/**
 *
 * @param lng 经度
 * @param lat 维度
 * @param pic 图标路径
 * @param w	  图标宽度
 * @param h	  图标高度
 * @param func 点击事件
 */
function putIconIntoMap(lng,lat, pic, w, h, func){
	map.removeOverlay(marker);
	var pt = new BMap.Point(lng, lat);
	var myIcon = new BMap.Icon(pic, new BMap.Size(w, h));
	marker = new BMap.Marker(pt,{icon:myIcon});  // 创建标注
	marker.addEventListener("click", func);
	map.addOverlay(marker);  // 将标注添加到地图中
	var content = document.getElementById("address").value + "<br/><br/>经度：" + lng + "<br/>纬度：" +  lat;
	var infoWindow = new BMap.InfoWindow("<p style='font-size:14px;'>" + content + "</p>");
	marker.addEventListener("click", function () { this.openInfoWindow(infoWindow); });
	marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
}
/*var marker2;
 //百度地图API功能
 var map = new BMap.Map("baiduMap");    // 创建Map实例

 function init(){
 //map.centerAndZoom(new BMap.Point(106.558099,29.569741), 12);  // 初始化地图,设置中心点坐标和地图级别
 map.centerAndZoom(new BMap.Point(104.070354,30.683673), 12);  // 初始化地图,设置中心点坐标和地图级别
 map.panBy(305,165);
 var anchorCtrl = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT});// 右下角，添加比例尺
 map.addControl(anchorCtrl);
 map.addControl(new BMap.NavigationControl()); //左上角，添加默认缩放平移控件
 map.setCurrentCity("成都");          // 设置地图显示的城市 此项是必须设置的

 map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

 map.addEventListener("click",function(e){
 putIconIntoMap(e.point.lng, e.point.lat, "../images/curlocation.png", 30, 30, null);
 var gc = new BMap.Geocoder();
 //获取地址的数据地址
 gc.getLocation(e.point, function(rs){
 var addComp = rs.addressComponents;
 var lat=e.point.lat;
 var lng=e.point.lng;
 var address=addComp.province+addComp.city+addComp.district+addComp.street+addComp.streetNumber;
 //document.getElementById("address").value =address+"("+lat+","+lng+")";
 document.getElementById("address").value =address;
 $("#lat").val(lat);
 $("#lng").val(lng);
 $("#t_lat").val(lat);
 $("#t_lng").val(lng);
 $("#locationName").val(address);
 });
 });

 }


 *//**
 *
 * @param lng 经度
 * @param lat 维度
 * @param pic 图标路径
 * @param w	  图标宽度
 * @param h	  图标高度
 * @param func 点击事件
 */
//function putIconIntoMap(lng,lat, pic, w, h, func){
//	var pt = new BMap.Point(lng, lat);
//	var myIcon = new BMap.Icon(pic, new BMap.Size(w, h));
//	var marker2 = new BMap.Marker(pt,{icon:myIcon});  // 创建标注
//	marker2.addEventListener("click", func);
//	map.addOverlay(marker2);              // 将标注添加到地图中
//}
