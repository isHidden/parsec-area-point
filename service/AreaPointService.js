/**
 * Created by Miku on 16/4/14.
 */
module.exports= function (AV) {
    'use strict';

    // var AV = require('leanengine');
    var AreaPoint = AV.Object.extend("AreaPoint");

    var AreaPointService = {};

    /**
     * 加载区域点
     * @param timesId
     * @returns {*|T|{}}
     */
    AreaPointService.list = function (timesId) {
        var query = new AV.Query(AreaPoint);
        if (timesId instanceof Array) {
            query.containedIn('timesId', timesId);
        } else {
            query.equalTo('timesId', timesId);
        }
        query.addDescending('createdAt');
        return query.find();
    };

    /**
     * 保存区域点
     * @param from
     * @param to
     * @param type
     * @returns {*}
     */
    AreaPointService.save = function (dataMap, objectId) {
        var areaPoint;
        if (objectId) {
            areaPoint = AV.Object.createWithoutData('AreaPoint', objectId);
        } else {
            areaPoint = new AreaPoint();
        }
        ['address', 'lat', 'lng', 'timesId'].forEach(function (field) {
            var value = dataMap[field];
            if (value !== undefined) {
                areaPoint.set(field, value);
            }
        });
        return areaPoint.save();

    };

    /**
     * 删除区域点
     * @param objectId
     * @param status
     * @returns {*}
     */
    AreaPointService.delete = function (objectId) {
        var obj = AV.Object.createWithoutData('PostType', objectId);
        if (obj) {
            return obj.destroy();
        } else {
            throw {code: -1, message: "删除对象未找到"};
        }
    };

    /**
     *保存所有
     *@paramlist
     */
    AreaPointService.copyAll = function (list) {
        if (!list || list.length == 0) {
            throw{code: -1, message: "保存对象为空"};
        } else {
            return AV.Object.saveAll(list)
        }
    }

    return AreaPointService;
};