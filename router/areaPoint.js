/**
 * Created by Miku on 16/4/14.
 */
module.exports= function (AV,adminPath) {
    "use strict";
    // var AV = require('leanengine');
    var util = require("util");
    var express = require('express');
    var iconv = require('iconv-lite');
    var router = express();
    var bodyParser = require('body-parser');
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended: false}));
    var AreaPoint = AV.Object.extend("AreaPoint");
    var AreaPointTimes = AV.Object.extend("AreaPointTimes");
    var AreaPointService = require("../service/AreaPointService")(AV);
    var AreaPointTimesService = require("../service/AreaPointTimesService")(AV);
    
    //var P=require("parsec-toolkit-for-leancloud");


    /**
     * 时间段列表
     */
    router.get("/areaPointTimes", checkLogin);
    router.get("/areaPointTimes", function (req, res) {
        AreaPointTimesService.list(function (query) {
        }).then(function (list) {
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
        if (!req.body.remark) {
            return res.send({status: -1, message: "描述不能为空"});
        }
        // if (!req.body.content) {
        //     return res.send({status:-1, message: "内容不能为空"});
        // }
        if (!req.body.color) {
            return res.send({status: -1, message: "颜色不能为空"});
        }
        //var week = req.body["week"] || req.body["week[]"];
        var obj = {
            /*startTime:start,endTime:end,*/
            name: req.body.name,
            remark: req.body.remark,
            content: req.body.content,
            color: req.body.color
            //week: week
        };
        AreaPointTimesService.save(obj, req.body.objectId).then(function (obj) {
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
                        timeList: obj.get("timeList")
                    });
                }
            }),
            AreaPointService.list(req.body.objectId)
        ).then(function (at, list) {
            var newList = [];
            list.forEach(function (item) {
                var point = new AreaPoint();
                point.set("address", item.get("address"));
                point.set("lng", item.get("lng"));
                point.set("lat", item.get("lat"));
                point.set("timesId", at.id);
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
            return res.send({status: 1, message: "保存成功", obj: at, list: list});
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
        // if (!req.AV.user) {
        //     res.send({status: -2, url: adminPath+'/login.html'});
        // } else {
        //     next();
        // }
        next();
    }


    //导出抽奖列表
    router.post('/exportAreaPoint', function (request, response) {

        var user = request.AV.user;

        if (!user || user.get("username") != "admin") {
            return response.send("没有登录");
        }

        var fileName = "areaPointData.csv";
        response.set({
            'Content-Type': 'application/octet-stream;charset=utf-8',
            'Content-Disposition': "attachment;filename=" + encodeURIComponent(fileName),
            'Pragma': 'no-cache',
            'Expires': 0
        });
        var content = "名称,描述(区域时间段),显示星期(时间段标题),时间段内容\n";
        getAreaPointData(0, content, function (str, error) {
            if (error) {
                return response.send(JSON.stringify(error));
            }
            if (str == "") {
                return response.send("没有查到数据");
            }
            var buffer = new Buffer(str);
            //需要转换字符集
            response.send(iconv.encode(buffer, 'utf-8'));
        });

    });

    function getAreaPointData(n, content, cbFun) {

        var query = new AV.Query(AreaPointTimes);
        query.skip(n * 500);
        query.limit(500);
        query.find({
            success: function (list) {
                var tempStr = "";
                for (var i = 0; i < list.length; i++) {
                    tempStr += list[i].get("name") + "," + list[i].get("remark") + "\n";

                    if(list[i].get("timeList")){
                        list[i].get("timeList").forEach(function (t) {
                            tempStr += " ,"+numberToTime(t.startTime)+"-"+ numberToTime(t.endTime) + "," + t.title + "," + t.content + ",";
                            if (t.week) {
                                t.week.forEach(function (w) {
                                    switch (w) {
                                        case "0":
                                            tempStr += ":星期日";
                                            break;
                                        case "1":
                                            tempStr += ":星期一";
                                            break;
                                        case "2":
                                            tempStr += ":星期二";
                                            break;
                                        case "3":
                                            tempStr += ":星期三";
                                            break;
                                        case "4":
                                            tempStr += ":星期四";
                                            break;
                                        case "5":
                                            tempStr += ":星期五";
                                            break;
                                        case "6":
                                            tempStr += ":星期六";
                                            break;
                                        default:
                                            break;
                                    }
                                });
                                tempStr += "\n";
                            }else{
                                tempStr += " \n";
                            }
                        });
                    }

                }
                content += tempStr;
                if (list.length < 500) {
                    return cbFun(content);
                } else {
                    getAreaPointData(n + 1, content, cbFun);
                }
            },
            error: function (error) {
                return cbFun(content, error);
            }
        });
    }

    function numberToTime(n) {
        var h = parseInt(n / 100);
        var m = n % 100;
        if (h < 10) {
            h = "0" + h;
        }
        if (m < 10) {
            m = "0" + m;
        }
        return h + ":" + m;
    }

    return router;
}