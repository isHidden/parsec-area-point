/**
 * Created by Miku on 16/4/14.
 */
module.exports= function (AV) {
    "use strict";
    // var AV = require('leanengine');
    var util = require("util");
    var express = require('express');
    var router = express();
    var bodyParser = require('body-parser');
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended: false}));
    var AreaPoint = AV.Object.extend("AreaPoint");
    var AreaPointService = require("../service/AreaPointService")(AV);
    var AreaPointTimesService = require("../service/AreaPointTimesService")(AV);
    
    var P=require("parsec-toolkit-for-leancloud");

    router.get("/test_1",function (req,res) {
        res.send("OK");
    })
    /**
     * 时间段列表
     */
    router.get("/areaPointTimes", checkLogin);
    router.get("/areaPointTimes", function (req, res) {
        AreaPointTimesService.list().then(function (list) {
            return res.send({status: 1, list: list});
        }).fail(function (e) {
            return res.send({status: -1, message: e});
        });
    });

    /**
     * 时间段保存
     */
    router.post("/areaPointTimes", checkLogin);
    router.post("/areaPointTimes", function (req, res) {
        // var startTime = req.body.startTime;
        // var endTime = req.body.endTime;

        // if (!startTime) {
        //     return res.send({status:-1, message: "开始时间不能为空"});
        // }
        // if (!endTime) {
        //     return res.send({status:-1, message: "结束时间不能为空"});
        // }
        // var s = startTime.split(":");
        // var e = endTime.split(":");
        // var start = Number(s[0])*100+Number(s[1]);
        // var end = Number(e[0])*100+Number(e[1]);
        // if(start>=end){
        //     return res.send({status:-1, message: "开始时间不能大于结束时间"});
        // }
        if (!req.body.name) {
            return res.send({status: -1, message: "名称不能为空"});
        }
        // if (!req.body.title) {
        //     return res.send({status:-1, message: "标题不能为空"});
        // }
        // if (!req.body.content) {
        //     return res.send({status:-1, message: "内容不能为空"});
        // }
        if (!req.body.color) {
            return res.send({status: -1, message: "颜色不能为空"});
        }
    
        var obj = {
            /*startTime:start,endTime:end,*/
            name: req.body.name,
            color: req.body.color
        };
  
        AreaPointTimesService.save(obj, req.body.objectId).then(P.debugPromiseChain).then(function (obj) {
            return res.send({status: 1, message: "保存成功", obj: obj});
        }).fail(function (e) {
            return res.send({status: -1, message: e});
        });
    });


    /**
     * 时间段集保存
     */
    router.post("/areaPointTimes/u", checkLogin);
    router.post("/areaPointTimes/u", function (req, res) {

        var arr = req.body.arr;
        if (!req.body.objectId) {
            return res.send({status: -1, message: "objectId不能为空"});
        }
        if (!req.body.arr) {
            return res.send({status: -1, message: "时间段数组不能为空"});
        }
        arr = eval(arr);
        if (!util.isArray(arr)) {
            arr = [arr];
        }
        AreaPointTimesService.updateTimeList(arr, req.body.objectId).then(function (obj) {
            return res.send({status: 1, message: "保存成功", obj: obj});
        }).fail(function (e) {
            return res.send({status: -1, message: e});
        });
    });

    /**
     * 区域复制
     */
    router.post("/areaPointTimes/c", checkLogin);
    router.post("/areaPointTimes/c", function (req, res) {
        if (!req.body.objectId) {
            return res.send({status: -1, message: "objectIdId不能为空"});
        }
        if (!req.body.name) {
            return res.send({status: -1, message: "名称不能为空"});
        }
        if (!req.body.color) {
            return res.send({status: -1, message: "颜色不能为空"});
        }

        AV.Promise.when(
            AreaPointTimesService.get(req.body.objectId).then(function (obj) {
                if (!obj) {
                    throw {status: -1, message: "复制对象查询失败"};
                } else {
                    return AreaPointTimesService.save({
                        color: req.body.color,
                        name: req.body.name,
                        timeList:obj.get("timeList")
                    });
                }
            }),
            AreaPointService.list(req.body.objectId)
        ).then(function (at,list) {
            var newList=[];
            list.forEach(function (item) {
                var point = new AreaPoint();
                point.set("address",item.get("address"));
                point.set("lng",item.get("lng"));
                point.set("lat",item.get("lat"));
                point.set("timesId",at.id);
                newList.push(point);
            });
            return AV.Promise.when(
                AV.Promise.as(at),
                new AV.Promise(function (resolve, reject) {
                    AV.Object.saveAll(newList, {
                        success: function (list) {
                            resolve(list);
                        },
                        error: function (error) {
                            reject(error);
                        }
                    });
                })
            );
        }).then(function (at, list) {
            return res.send({status: 1, message: "保存成功",obj:at,list:list});
        }).fail(function (e) {
            return res.send({status: -1, message: e.message});
        });

    });

    /**
     * 删除时间段设置
     */
    router.delete("/areaPointTimes/*", checkLogin);
    router.delete("/areaPointTimes/*", function (req, res) {
        var objectId = req.params["0"];
        if (!objectId) {
            return res.send({status: -1, message: '参数错误'});
        }
        AreaPointTimesService.delete(objectId).then(function (obj) {
            AreaPointTimesService.get(objectId).then(function (list) {
               AV.Object.destroyAll(list);
            });
            return res.send({status: 1, message: "删除成功", postType: obj});
        }, function (error) {
            return res.send({status: -1, message: error.message});
        });
    });

    function checkLogin(req, res, next) {
        if (!req.AV.user) {
            res.send({status: -2, url: '/213123716238/login.html'});
        } else {
            next();
        }
    }

    return router;
}