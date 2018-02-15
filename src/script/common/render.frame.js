/*
#根据Key获取url参数#
    var key=Frame.getUrlParam('key');
#获取所有url参数#
    var parObj=Frame.getUrlAllParam();
#setAjax#
#加载data-htmlfile#
    Frame.loadHtml.start('body', function () {
        console.log('加载完成');
    });
    <div data-htmlfile="components/header.html"></div>
#模拟观察#
    //注册
    Frame.eventWatch.on('windowClick',function(e){
        console.log(e.target);
    });
    //触发
    $(window).bind('click', function(e){ Frame.eventWatch.emit('windowClick',e) });
*/
define('frame', function () {
    var Frame={};
    Frame.getUrlParam=function (_key) {
        var reg = new RegExp('(^|&)' + _key + '=([^&]*)(&|$)');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };
    Frame.getUrlAllParam=function () {
        var obj = new Object();
        if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
            var strs = unescape(window.location.search).substring(1, window.location.search.length).split('&');
            for (var i = 0; i < strs.length; i++) {
                obj[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return obj;
    }
    Frame.setAjax = function (parameter) {
        var type = parameter.type || 'GET';
        var dataType = parameter.dataType || 'html';
        var url = parameter.url || null;
        var data = parameter.data || null;
        var success = parameter.success || null;
        var error = parameter.error || null;
        if (!parameter.url || parameter.url == '') { setTimeout(function () { if (success) success(parameter.test, parameter); }, 500); return false; }
        $.ajax({
            type: type, dataType: dataType, url: url + '?r=' + new Date().getTime(), data: data,
            success: function (msg) { if (success) success(msg, parameter); },
            error: function (msg) { if (error) error(msg, parameter); }
        });
    };
    Frame.loadHtml = {
        start: function (dom, callback) {
            var count = 0, total = 0, self = this;
            var content = $(dom).find('[data-htmlfile]');
            total = content.length;
            if (total == 0) { if (callback) callback(); return; }
            content.each(function () {
                Frame.setAjax({
                    el: $(this), url: $(this).attr('data-htmlfile'), success: function (data, parameter) {
                        parameter.el.replaceWith(data);
                        count++;
                        if (count == total) { self.start(dom, callback); };
                    }, error: function () {
                        count++;
                        if (count == total) { self.start(dom, callback); };
                    }
                });
            });
        }
    };
    Frame.eventWatch = {
        init:function(){
            Object.defineProperty(this, "handles", {
                value: {},
                enumerable: false,
                configurable: true,
                writable: true
            })
        },
        //注册收听
        on: function (eventName, callback) {
            if (!this.handles)this.init();
            this.off(eventName);
            this.handles[eventName].push(callback);
        },
        //取关
        off: function (eventName) {
            if (!this.handles)this.init();
            this.handles[eventName]=[];
        },
        //发送广播
        emit: function (eventName, data) {
            if (!this.handles)this.init();
            if (this.handles[arguments[0]]) {
                for (var i = 0; i < this.handles[arguments[0]].length; i++) {
                    this.handles[arguments[0]][i](arguments[1]);
                }
            }
        }
    }
    return Frame;
});