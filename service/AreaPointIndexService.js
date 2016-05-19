/**
 * Created by Miku on 16/4/14.
 */
module.exports= function (AV) {
    'use strict';

    // var AV = require('leanengine');
    var AreaPointIndex = AV.Object.extend("AreaPointIndex");

    var AreaPointIndexService = {};

    /**
     * 加载区域首页项
     * @param userId
     * @param type
     * @returns {*|T|{}}
     */
    AreaPointIndexService.list = function (status) {
        var query = new AV.Query(AreaPointIndex);
        if (status) {
            query.equalTo("status",status);
        }
        query.addDescending('createdAt');
        return query.find();
    };


    /**
     * 得到一个区域首页项
     * @param objectId
     */
    AreaPointIndexService.get = function (objectId) {
        var query = new AV.Query(AreaPointIndex);
        return query.get(objectId);
    }

    /**
     * 保存区域首页项
     * @param from
     * @param to
     * @param type
     * @returns {*}
     */
    AreaPointIndexService.save = function (dataMap, objectId) {
        return AreaPointIndex.new({
            name: dataMap["name"],
            icon: dataMap["icon"],
            status: Number(dataMap["status"]),
            item: dataMap["item"],
            objectId: objectId
        }).save();
    };

    /**
     * 删除区域首页项
     * @param objectId
     * @param status
     * @returns {*}
     */
    AreaPointIndexService.delete = function (objectId) {
        var obj = AV.Object.createWithoutData('AreaPointIndex', objectId);
        if (obj) {
            return obj.destroy();
        } else {
            throw {code: -1, message: "删除对象未找到"};
        }
    };

    return AreaPointService;
};