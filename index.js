/**
 * Created by Miku on 16/4/29.
 */
var express = require("express");
var _ = require("underscore");
var context = "node_modules/parsec-area-point/";
module.exports = function (options) {
    options = _.extend({
        AV: null,
        app: null,
        city: null,
        coverId: null,
        adminPath: "/213123716238"
    }, options);

    var app = options.app;
    var area_router = require("./router/areaPoint")(options.AV);
    var area_cloud = require("./cloud/AreaPoint")(options.AV);

    app.use(express.static(context + "public"));
    app.use(options.adminPath, express.static(context + "admin-public"));
    app.use(options.adminPath + '/js', express.static(context + "baidumap/" + options.city));
    app.use('/mobile/js', express.static(context + "baidumap/" + options.city));
    app.use(area_router);
    app.use(area_cloud);
};