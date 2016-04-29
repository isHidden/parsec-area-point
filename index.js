/**
 * Created by Miku on 16/4/29.
 */
var express=require("express");

var context="node_modules/parsec-area-point/";
module.exports=function (AV,app,city) {
    var area_router=require("./router/areaPoint")(AV);
    var area_cloud=require("./cloud/AreaPoint")(AV);
    
    app.use(express.static(context+"public"));
    app.use('/213123716238/js',express.static(context+"baidumap/"+city));
    app.use('/mobile/js',express.static(context+"baidumap/"+city));
    app.use(area_router);
    app.use(area_cloud);
};