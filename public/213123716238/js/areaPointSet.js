/**
 * Created by Miku on 16/5/9.
 */
var MyHint = AV.Object.extend("MyHint");

/*
 * 加载出已有的数据  界面展示
 */
function loaddata() {
    var query = new AV.Query(MyHint);
    query.get(appObjectIds.areaPointSet_objectId, {
        success: function (obj) {
            var myHtml = obj.get("content");
            $('.note-editable').html(myHtml);
        },
        error: function (object, error) {
            alert("错误:" + error.message);
        }
    });
}

function editHint() {
    var user = AV.User.current();
    if (!user) {
        alert("您尚未登陆");
        return;
    }
    // 可以先查询出要修改的那条存储
    var query = new AV.Query(MyHint);
    query.get(appObjectIds.areaPointSet_objectId, {
        success: function (queryResult) {
            queryResult.set('content', $('.note-editable').html());
            queryResult.save(null,
                {
                    success: function (saveResult) {
                        alert("内容已保存");
                    },
                    error: function (saveResult, error) {
                        $("#hintinfo2").html("<font color='red'>" + error.message + "</font>");
                    }
                }
            );
        },
        error: function (object, error) {
        }
    });
}

$(function () {
    loaddata();
    items.loadData();
    items.loadPointTimes();
});

var items = {
    dataList: [],
    loadData: function () {
        $.get("../areaPointIndex", {}, function (data) {
            if (data.status == -2) {
                window.location.href = data.url;
            }
            if (data.status == -1) {
                alert(data.message);
            } else {
                $("#dataMsg").html("");
                items.dataList = data.list;
                data.list.forEach(function (obj) {
                    items.addRow(obj);
                });
            }
        });
    },
    show: function (id) {
        if(id==''){
            $("#objectId").val("");
            $("#name").val("");
            $("#icon").val("");
            $("#status").val(0);
            $("#pic_img").attr("src", "");
            $("[name='ck_item']").removeAttr("checked");//取消全选
            $("#myModal").modal("show");
        }else{
            items.dataList.forEach(function(item){
                if(item.objectId==id){
                    $("#objectId").val(item.objectId);
                    $("#name").val(item.name);
                    $("#pic_hidden").val(item.icon);
                    $("#status").val(item.status);
                    $("#pic_img").attr("src", item.icon);
                    $("[name='ck_item']").removeAttr("checked");//取消全选
                    item.item.forEach(function(obj){
                        document.getElementById("ck_"+obj).checked = true;
                    });
                }
            });
            $("#myModal").modal("show");
        }
    },
    save: function () {
        var obj = {};
        obj.objectId = $("#objectId").val();
        obj.name = $("#name").val();
        obj.icon = $("#pic_hidden").val();
        obj.status = $("#status").val();
        var array = [];
        $("input[name='ck_item']").each(function () {
            if ($(this).is(":checked")) {
                array.push($(this).val());
            }
        });
        if (array.length == 0) {
            alert("请选择服务区域");
            return;
        }
        obj.item = array;
        $.post("../areaPointIndex", obj, function (data) {
            if (data.status == -2) {
                window.location.href = data.url;
            }
            if (data.status == -1) {
                alert(data.message);
            } else {
                items.loadData();
                $("#myModal").modal("hide");
            }
        });
    },
    del: function (id) {
        if(confirm("确认删除?")){
            $.ajax({
                type:"delete",
                url:'../areaPointIndex/'+id,
                success:function(data){
                    if (data.status == -2) {
                        window.location.href = data.url;
                    }
                    if (data.status == -1) {
                        alert(data.message);
                    } else {
                        items.loadData();
                        $("#myModal").modal("hide");
                    }
                }
            });
        }
    },
    loadPointTimes: function () {
        $.get("../areaPointTimes", {}, function (data) {
            if (data.status == -2) {
                window.location.href = data.url;
            }
            if (data.status == -1) {
                alert(data.message);
            } else {
                var html = "";
                data.list.forEach(function (obj) {
                    html += "<input id=\"ck_" + obj.objectId + "\" name=\"ck_item\" type=\"checkbox\" value='" + obj.objectId + "'/>" + obj.name + "(" + obj.remark + ")" + "<br>";
                });
                $("#pointDiv").html(html);
            }
        });
    },
    choisePic: function () {
        var fileArray = $("#pic_file")[0];
        if (fileArray.files.length > 0) {
            var file = fileArray.files[0];
            var name = (new Date().getTime()) + ".jpg";

            var avFile = new AV.File(name, file);
            avFile.save().then(function () {
                var url = avFile.url();
                $("#pic_hidden").val(url);
                $("#pic_img").attr("src", url);
            }, function (error) {
                console.log(JSON.stringify(error));
            });
        }
    },
    addRow: function (obj) {
        var tableHtml = "<tr>" +
            "<td><img style='width:50px;height:50px;' src=\"" + obj.icon + "\"/></td>" +
            "<td>" + obj.name + "</td>" +
            "<td>" + (obj.status == 0 ? "下架" : "上架") + "</td>";
        tableHtml += "<td class='col-md-2'><div class='btn-group'><button type='button' class='btn btn-info'>操作</button>"
            + "<button type='button' class='btn  btn-info dropdown-toggle' data-toggle='dropdown'>"
            + "<span class='caret'></span></button>"
            + "<ul class='dropdown-menu' role='menu'>"
            + "<li><a href='#' onclick='items.show(\"" + obj.objectId + "\")'>修改</a></li>"
            + "<li><a href='#' onclick='items.del(\"" + obj.objectId + "\")'>删除</a></li>"
            + "</ul></td></tr>";
        $("#dataMsg").append(tableHtml);
    }
};