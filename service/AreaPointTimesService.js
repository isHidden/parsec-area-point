/**
 * Created by Miku on 16/4/14.
 */
module.exports=function (AV) {
    'use strict';

    // var AV = require('leanengine');
    var AreaPointTimes = AV.Object.extend("AreaPointTimes");

    var AreaPointTimesService = {};

    /**
     * 加载区域设置
     * @param userId
     * @param type
     * @returns {*|T|{}}
     */
    AreaPointTimesService.list = function (queryFn) {
        var query = new AV.Query(AreaPointTimes);

        if (typeof (queryFn) === 'function') {
            queryFn.call(this, query);
        }

        return query.find();
    };

    /**
     * 得到一个区域设置
     * @param objectId
     */
    AreaPointTimesService.get = function(objectId){
        var query = new AV.Query(AreaPointTimes);
        return query.get(objectId);
    };

    /**
     * 保存区域设置
     * @param from
     * @param to
     * @param type
     * @returns {*}
     */
    AreaPointTimesService.save = function (dataMap, objectId) {
        // var obj;
        // if (objectId) {
        //     obj = AV.Object.createWithoutData('AreaPointTimes', objectId);
        // } else {
        //     obj = new AreaPointTimes();
        // }
        // ['color', /*'content', 'title',*/'name'/*'startTime','endTime'*/,'timeList'].forEach(function (field) {
        //     var value = dataMap[field];
        //     if (value !== undefined) {
        //         obj.set(field, value);
        //     }
        // });
        // return obj.save();

        return AreaPointTimes.new({
            color:dataMap["color"],
            name:dataMap["name"],
            remark:dataMap["remark"],
            timeList:dataMap["timeList"],
            objectId:objectId
        }).save();
    };


    /**
     * 保存时间集合
     * @param arr
     * @param objectId
     * @returns {*}
     */
    AreaPointTimesService.updateTimeList = function(arr,objectId){
        var obj;
        if (objectId) {
            obj = AV.Object.createWithoutData('AreaPointTimes', objectId);
        }
        if(obj){
            obj.set("timeList",arr);
            return obj.save();
        }else{
            throw {code: -1, message: "删除对象未找到"};
        }
    };


    /**
     * 删除区域设置
     * @param objectId
     * @param status
     * @returns {*}
     */
    AreaPointTimesService.delete = function(objectId){
        var obj = AV.Object.createWithoutData('AreaPointTimes', objectId);
        if (obj) {
            return obj.destroy();
        } else {
            throw {code: -1, message: "删除对象未找到"};
        }
    };

    return AreaPointTimesService;
};