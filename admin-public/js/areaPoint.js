/**
 * Created by Miku on 16/2/29.
 */
var setList = [];
var dataList = [];
var chooseId = "";
var objArray = [];
var opts = {
    width: 180,     // 信息窗口宽度
    height: 100,     // 信息窗口高度
    title: "" // 信息窗口标题
}
var areaPoint = {
    saveType: false,
    /**
     * 加载区域点列表
     */
    loadData: function () {
        AV.Cloud.run("admin_areaPoint_list", {}, {
            success: function (list) {
                map.clearOverlays();
                dataList = list;
                areaPoint.loadSet();
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    },
    loadSet: function () {
        $.get("../areaPointTimes", {}, function (data) {
            if (data.status == -2) {
                window.location.href = data.url;
            }
            if (data.status == -1) {
                alert(data.message);
            } else {
                $("#rootHtml").html("");
                setList = data.list;
                if (setList.length > 0 && chooseId == "") {
                    areaPoint.chooseSet(setList[0].objectId)
                }
                data.list.forEach(function (obj) {
                    areaPoint.addRow(obj);
                    areaPoint.addAddressRow(obj);
                });
            }
        });
    },
    addRow: function (obj) {
        var html = "<div class=\"panel panel-default\">";
        html += "<div class='btn-group pull-right' style='margin: 2px 5px 0px 0px;'><button type='button' class='btn btn-info'>操作</button>"
            + "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
            + "<span class='caret'></span></button>"
            + "<ul class='dropdown-menu' role='menu'>";
        html += "<li><a href='javascript:void(0)' onclick=\"areaPoint.chooseSet('" + obj.objectId + "')\">操作</a></li>"
            + "<li><a href='javascript:void(0)' onclick=\"areaPoint.editSet('" + obj.objectId + "')\">修改</a></li>"
            + "<li><a href='javascript:void(0)' onclick=\"areaPoint.editTimes('" + obj.objectId + "')\">时间段</a></li>"
            + "<li><a href='javascript:void(0)' onclick=\"areaPoint.copyObject('" + obj.objectId + "')\">复制地图圈</a></li>"
            + "<li><a href='javascript:void(0)' onclick=\"areaPoint.delSet('" + obj.objectId + "')\">删除</a></li>"
            + "</ul></div>";
        html += "<div class=\"panel-heading\" role=\"tab\">" +
            "           <h4 class=\"panel-title\">" +
            "               <a role=\"button\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#tbl_" + obj.objectId + "\" aria-expanded=\"true\" aria-controls=\"collapseOne\">" + /*numberToTime(obj.startTime)+"-"+numberToTime(obj.endTime)*/obj.name + "</a>" +
            "           </h4>" +
            "           </div>" +
            "           <div id=\"tbl_" + obj.objectId + "\" class=\"panel-collapse collapse " + (obj.objectId == chooseId ? "in" : "") + "\" role=\"tabpanel\" aria-labelledby=\"tbl_" + obj.objectId + "\">" +
            "               <div class=\"panel-body\">" +

            "   <div role=\"tabpanel\">" +
            "   <ul class=\"nav nav-tabs\" role=\"tablist\">" +
            "   <li role=\"presentation\" class=\"active\"><a href=\"#time_" + obj.objectId + "\" aria-controls=\"home\" role=\"tab\" data-toggle=\"tab\">时间段</a></li>" +
            "   <li role=\"presentation\"><a href=\"#point_" + obj.objectId + "\" aria-controls=\"tab_query\" role=\"tab\" data-toggle=\"tab\">定位点</a>" +
            "   </li>" +
            "   </ul>" +
            "   <div class=\"tab-content\">" +
            "   <div role=\"tabpanel\" class=\"tab-pane active\" id=\"time_" + obj.objectId + "\">" +
            "               <table class=\"table users-table table-condensed table-hover\">" +
            "                   <tr>" +
            "                       <th class=\"visible-lg\" width=\"30%\">时间段</th>" +
            "                       <th width=\"65%\">标题</th>" +
            "                       <th width=\"5%\">&nbsp;</th>" +
            "                   </tr>";

        if (obj.timeList) {
            obj.timeList.forEach(function (t) {
                html += "<tr id=\"t_"+t.index+"\" title=\""+t.content+"\"><td>" + numberToTime(t.startTime) + "-" + numberToTime(t.endTime) + "</td><td>" + t.title + "</td><td><button class=\"btn btn-danger\" title=\"删除\" onclick=\"areaPoint.delTimesItem('"+obj.objectId+"','" + t.index + "')\">删除</button></td></tr>";
            });
        }

        html += "               </table>" +
            "   </div>" +

            "   <div role=\"tabpanel\" class=\"tab-pane\" id=\"point_" + obj.objectId + "\">" +
            "               <table class=\"table users-table table-condensed table-hover\" id=\"table_" + obj.objectId + "\">" +
            "                   <tr>" +
            "                       <th class=\"visible-lg\" width=\"70%\">地址</th>" +
            "                       <th style=\"width:250px\" width=\"70%\">&nbsp;</th>" +
            "                   </tr>" +
            "               </table>" +
            "   </div>" +
            "   </div>" +
            "</div>" +

            "</div>" +
            "</div>";
        $("#rootHtml").append(html);
    },
    addAddressRow: function (obj) {
        var tmplist = new Array();
        dataList.forEach(function (data) {
            if (data.timesId == obj.objectId) {
                var html = "<tr><td>" + data.address + "</td>" +
                    "<td nowrap='nowrap'><button class=\"btn btn btn-warning\" title=\"查看\" onclick=\"areaPoint.showPoint('" + data.objectId + "');\">查看</button>&nbsp;" +
                    "<button class=\"btn btn-danger\" title=\"删除\" onclick=\"areaPoint.delPoint('" + data.objectId + "')\">删除</button></td>" +
                    "</tr>";
                $("#table_" + obj.objectId).append(html);
                tmplist.push(new BMap.Point(data.lng, data.lat));
            }
        })

        if (!tmplist.length) {
            return;
        }

        var polygon = new BMap.Polygon(tmplist, {strokeColor: obj.color, strokeWeight: 2, strokeOpacity: 0.5});  //创建图形
        map.addOverlay(polygon);

        var len = 0;
        if (obj.remark) {
            len = obj.remark.length;
        } else {
            return;
        }
        var point = polygon.getBounds().getCenter();
        opts.position = point;
        opts.title = obj.remark;
        opts.offset = new BMap.Size((-Number(len / 2)) * 12, 0);  //设置文本偏移量
        var label = new BMap.Label(obj.remark, opts);  // 创建文本标注对象
        label.setStyle({
            color: "red",
            fontSize: "12px",
            height: "20px",
            lineHeight: "20px",
            fontFamily: "微软雅黑"
        });
        map.addOverlay(label);
    },
    /**
     * 保存区域点
     */
    savePoint: function () {
        var lat = $("#lat").val();
        var lng = $("#lng").val();
        var address = $("#address").val();
        AV.Cloud.run("admin_areaPoint_save", {lat: lat, lng: lng, address: address, timesId: chooseId}, {
            success: function (data) {
                if (data.code == -1) {
                    alert(data.message);
                } else {
                    areaPoint.loadData();
                }
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    },
    showPoint: function (id) {
        dataList.forEach(function (data) {
            if (data.objectId == id) {
                putIconIntoMapForList(data.lng, data.lat, "images/Mario.png", 30, 30, data.address, null);//绘制苗点
            }
        })
    },
    delPoint: function (id) {
        if (confirm("确认删除?")) {
            AV.Cloud.run("admin_areaPoint_delete", {objectId: id}, {
                success: function (data) {
                    if (data.code == -1) {
                        alert(data.message);
                    } else {
                        areaPoint.loadData();
                    }
                },
                error: function (error) {
                    console.log(JSON.stringify(error));
                }
            });
        }
    },
    editSet: function (id) {
        areaPoint.saveType = false;
        $("#color").data('colorpicker', null);
        $("#color").colorpicker().on("changeColor", function (ev) {
            $("#color").val(ev.color.toHex());
        });
        $(".colorpicker").css("z-index", 9999999);
        if (id != "") {
            setList.forEach(function (data) {
                if (data.objectId === id) {
                    $("#objectId").val(data.objectId);
                    // $("#startTime").val(numberToTime(data.startTime));
                    // $("#endTime").val(numberToTime(data.endTime));
                    $("#color").val(data.color);
                    $("#name").val(data.name);
                    $("#remark").val(data.remark);

                    // $("#title").val(data.title);
                    // $("#content").val(data.content);
                    $("#myModal").modal("show");
                }
            });
        } else {
            $("#objectId").val("");
            // $("#startTime").val("");
            // $("#endTime").val("");
            $("#color").val("");
            $("#name").val("");
            $("#remark").val("");
            // $("#title").val("");
            // $("#content").val("");
            $("#myModal").modal("show");
        }
    },
    saveSet: function () {
        var url = "";
        if (areaPoint.saveType) {
            url = "../areaPointTimes/c";
        } else {
            url = "../areaPointTimes";
        }
        var obj = $("form").serialize();
        var array = [];
        $("input[name='week']").each(function () {
            if ($(this).is(":checked")) {
                array.push($(this).val());
            }
        });

        obj.week = array;
        $.post(url, $("form").serialize(), function (data) {
            if (data.status == -2) {
                window.location.href = data.url;
            }
            if (data.status == -1) {
                alert(data.message);
            } else {
                if (areaPoint.saveType) {
                    areaPoint.loadData();
                } else {
                    areaPoint.loadSet();
                }
                $("#myModal").modal("hide");
            }
        });
    },
    delSet: function (id) {
        if (confirm("是否删除!")) {
            $.ajax({
                url: "../areaPointTimes/" + id,
                type: 'delete',
                success: function (data) {
                    if (data.status == -2) {
                        window.location.href = data.url;
                    }
                    if (data.status == -1) {
                        alert(data.message);
                    } else {
                        areaPoint.loadSet();
                    }
                }
            });
        }
    },
    chooseSet: function (id) {
        $("#dataMsg").html("");
        setList.forEach(function (data) {
            if (data.objectId === id) {
                $("#timeTitle").html("(" + data.name + ")");
                $("#chooseSpan").html("当前操作区域:" + data.name);
                $("#chooseSpan").css("color", data.color);
                chooseId = data.objectId;
                objArray = data.timeList || [];
                objArray.forEach(function (o) {
                    areaPoint.addTimesItemSet(o.index, numberToTime(o.startTime), numberToTime(o.endTime), o.title, o.content,o.week);
                })
            }
        });

    },
    editTimes: function (id) {
        $("[name='week']").removeAttr("checked");//取消全选
        areaPoint.chooseSet(id);
        $("#timeModal").modal("show");
    },
    addTimesSet: function () {
        var _index = new Date().getTime();
        var s = $("#startTime").val();
        var e = $("#endTime").val();
        var t = $("#title").val();
        var c = $("#content").val();
        if (!s) {
            alert("开始时间不能为空");
            return;
        }
        if (!e) {
            alert("结束时间不能为空");
            return;
        }
        if (!t) {
            alert("标题不能为空");
            return;
        }
        if (!c) {
            alert("内容不能为空");
            return;
        }

        var week =[];
        $('input[name="week"]:checked').each(function(){
            week.push($(this).val());
        });
        areaPoint.addTimesItemSet(_index, s, e, t, c,week);
        var obj = {};
        obj.index = _index;
        obj.startTime = timeToNumber(s);
        obj.endTime = timeToNumber(e);
        obj.title = t;
        obj.content = c;
        obj.week = week;
        objArray.push(obj);
        $("#startTime").val("");
        $("#endTime").val("");
        $("#title").val("");
        $("#content").val("");
        areaPoint.saveTimesSet();
    },
    addTimesItemSet: function (i, s, e, t, c,w) {
        var htmlString = "<tr id='" + i + "'>";
        htmlString += "<td>" + s + "</td>";
        htmlString += "<td>" + e + "</td>";
        htmlString += "<td>" + t + "</td>";
        htmlString += "<td>" + c + "</td>";
        htmlString += "<td>";
        if(w){
            htmlString += "周(";
            w.forEach(function (o) {
                switch (o) {
                    case "0":
                        htmlString += "日,";
                        break;
                    case "1":
                        htmlString += "一,";
                        break;
                    case "2":
                        htmlString += "二,";
                        break;
                    case "3":
                        htmlString += "三,";
                        break;
                    case "4":
                        htmlString += "四,";
                        break;
                    case "5":
                        htmlString += "五,";
                        break;
                    case "6":
                        htmlString += "六,";
                        break;
                    default:
                        break;
                }
            });
            htmlString = htmlString.substring(0,htmlString.length-1);
            htmlString += ")";
        }
        htmlString += "</td>";
        htmlString += "<td><button class=\"btn btn-primary\" onclick=\"areaPoint.delTimesItemSet(" + i + ")\">删除</button></td>";
        htmlString += "</tr>";
        $("#dataMsg").append(htmlString);

    },
    delTimesItemSet: function (id) {
        if (!confirm("确认删除吗?")) {
            return;
        }
        for (var i = 0; i < objArray.length; i++) {
            if (objArray[i].index === id) {
                objArray.splice(i, 1);
                $("#" + id).hide();
                $("#t_" + id).hide();
            }
        }
        areaPoint.saveTimesSet();
        $("#dataMsg").html("");
        objArray.forEach(function (o) {
            areaPoint.addTimesItemSet(o.index, numberToTime(o.startTime), numberToTime(o.endTime), o.title, o.content);
        });
    },
    delTimesItem:function(id,index){
        areaPoint.chooseSet(id);
        areaPoint.delTimesItemSet(Number(index));
    },
    saveTimesSet: function () {
        $.post("../areaPointTimes/u", {arr: JSON.stringify(objArray), objectId: chooseId}, function (data) {
            if (data.status == -2) {
                window.location.href = data.url;
            }
            if (data.status == -1) {
                alert(data.message);
            } else {
                areaPoint.loadSet();
                //$("#timeModal").modal("hide");
            }
        });
    },
    copyObject: function (id) {
        areaPoint.saveType = true;
        $("#color").data('colorpicker', null);
        $("#color").colorpicker().on("changeColor", function (ev) {
            $("#color").val(ev.color.toHex());
        });
        $(".colorpicker").css("z-index", 9999999);
        $("#objectId").val(id);
        $("#color").val("");
        $("#name").val("");
        $("#myModal").modal("show");
    }
}

var markerShow;
/**
 *
 * @param lng 经度
 * @param lat 维度
 * @param pic 图标路径
 * @param w      图标宽度
 * @param h      图标高度
 * @param func 点击事件
 */
function putIconIntoMapForList(lng, lat, pic, w, h, text, func) {
    map.removeOverlay(markerShow);
    var pt = new BMap.Point(lng, lat);
    var myIcon = new BMap.Icon(pic, new BMap.Size(w, h));
    markerShow = new BMap.Marker(pt, {icon: myIcon});  // 创建标注
    markerShow.addEventListener("click", func);
    map.addOverlay(markerShow);  // 将标注添加到地图中
    var content = text + "<br/><br/>经度：" + lng + "<br/>纬度：" + lat;
    var infoWindow = new BMap.InfoWindow("<p style='font-size:14px;'>" + content + "</p>");
    markerShow.addEventListener("click", function () {
        this.openInfoWindow(infoWindow);
    });
    markerShow.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
    map.panTo(pt);
}

function exportData(){
    $("#exportForm").submit();
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

function timeToNumber(t) {
    var e = t.split(":");
    return Number(e[0]) * 100 + Number(e[1]);
}