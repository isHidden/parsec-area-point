/**
 * Created by Miku on 16/2/29.
 */
module.exports=function (AV) {

    // var AV = require('leanengine');
    // AV.Promise._isPromisesAPlusCompliant = false;

    var AreaPoint = AV.Object.extend("AreaPoint");

    var AreaPointService = require("../service/AreaPointService")(AV);
    var AreaPointTimesService = require("../service/AreaPointTimesService")(AV);

    /**
     * 区域点列表
     * @param page
     * @param callback
     */
    AV.Cloud.define("admin_areaPoint_list", function (request, response) {
        var user = request.user;
        if (!(user && user.get("username") == "admin")) {
            return response.error("用户错误");
        }

        findAreaPoint(0,[],function(list){
            return response.success(list);
        });
    });

    function findAreaPoint(n,list,cb,timesId){
        var query = new AV.Query(AreaPoint);
        query.addDescending('createdAt');
        if(timesId){
            if (timesId instanceof Array) {
                query.containedIn('timesId', timesId);
            } else {
                query.equalTo('timesId', timesId);
            }
        }
        query.skip(n*1000);
        query.limit(1000);
        query.find({
            success: function (result) {
                list =  list.concat(result);
                if(result.length==1000){
                    findAreaPoint(n+1,list,cb,timesId);
                }else{
                    cb(list);
                }
            },
            error: function (error) {
                cb(list);
            }
        });
    }

    /**
     * 区域点列表(新)
     * @param page
     * @param callback
     */
    AV.Cloud.define("mobile_areaPoint", function (request, response) {

        // var user=request.user;
        // if(!(user&&user.get("username")=="admin")){
        //     return response.error("用户错误");
        // }

        var data = new Date();
        var h = data.getHours();
        var m = data.getMinutes();
        var d = h * 100 + m;
        AreaPointTimesService.list().then(function (list) {
            var areaArr = new Array();
            var areaIdArr = new Array();
            for (var i = 0; i < list.length; i++) {
                var arr = list[i].get("timeList");
                if (arr) {
                    for (var n = 0; n < arr.length; n++) {
                        var o = arr[n];
                        if (Number(o.startTime) <= d && Number(o.endTime) >= d) {
                            areaIdArr.push(list[i].id);
                            list[i].set("title", o.title);
                            list[i].set("content", o.content);
                            areaArr.push(list[i]);
                            break;
                        }
                    }
                }
            }

            findAreaPoint(0,[],function(list){
                return response.success({status: 1, setList: areaArr, areaList: list});
            },areaIdArr);
            // AreaPointService.list(areaIdArr).then(function (areaList) {
            //     return response.success({status: 1, setList: areaArr, areaList: areaList});
            // }).fail(function (e) {
            //     return response.success({status: -1, message: e});
            // });
        }).fail(function (e) {
            return response.success({status: -1, message: e});
        });

    });


    /**
     * 区域点列表v1
     */
    AV.Cloud.define("mobile_areaPointTimes_list", function (request, response) {
        var query = new AV.Query(AreaPoint);
        query.find({
            success: function (result) {
                return response.success(result);
            },
            error: function (error) {
                return response.error({code: -1, msg: error});
            }
        });
    });


    /**
     * 保存区域点
     * @param bigTurntable
     * @param cb
     * @returns {*}
     */
    AV.Cloud.define("admin_areaPoint_save", function (request, response) {
        var user = request.user;
        if (!(user && user.get("username") == "admin")) {
            return response.error("用户错误");
        }

        var lat = request.params.lat;
        var lng = request.params.lng;
        var address = request.params.address;
        var timesId = request.params.timesId;
        var obj = new AreaPoint();
        if (!lat) {
            return response.send({code: -1, message: '经度不可为空'});
        } else {
            obj.set("lat", lat);
        }
        if (!lng) {
            return response.send({code: -1, message: '纬度不可为空'});
        } else {
            obj.set("lng", lng);
        }
        if (!address) {
            return response.send({code: -1, message: '详细地址不可为空'});
        } else {
            obj.set("address", address);
        }
        if (!timesId) {
            return response.send({code: -1, message: 'timesId不可为空'});
        } else {
            obj.set("timesId", timesId);
        }

        obj.save(null, {
            success: function (obj) {
                return response.success({code: 1, msg: "保存成功"});
            },
            error: function (obj, error) {
                return response.error({code: -1, msg: error});
            }
        });
    });


    /**
     * 删除区域点
     * @param page
     * @param callback
     */
    AV.Cloud.define("admin_areaPoint_delete", function (request, response) {
        var user = request.user;
        if (!(user && user.get("username") == "admin")) {
            return response.error("用户错误");
        }

        var objectId = request.params.objectId;
        if (!objectId) {
            return response.success({code: -1, message: '没有要删除的对象'});
        }

        var query = new AV.Query(AreaPoint);
        query.get(objectId, {
            success: function (item) {
                if (!item) {
                    return response.success({code: -1, message: '没有要删除的对象'});
                }
                item.destroy({
                    success: function (obj) {
                        return response.success({code: 1, message: '删除成功'});
                    },
                    error: function (delObj, error) {
                        return response.error({code: -1, message: error.message});
                    }
                });

            },
            error: function (error) {
                return response.error({code: -1, message: error.message});
            }
        });
    });
    
    return AV.Cloud
};