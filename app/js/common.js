/*
全局变量：Global.option
与开发交互：Global.dev
*/
define('global', function () {
    var Global={};
    //全局变量
    Global.option={
        debug:false, //是否打印信息
    };
    //初始化
    function initialize(){
        //判断是否本地环境
        Global.option.isLocal=window.location.href.indexOf('localhost')>-1;
        //判断是否需要在客户端打印错误信息
        Global.option.debug=Global.option.isLocal?true:Global.option.debug;
    }
    //为开发重写设置内部方法
    Global.dev={
        frontendToDevelopmentFunTest:function(){
            try{frontendToDevelopmentFunTest(option,callback)}catch(e){
                console.log('未找到开发设置的-frontendToDevelopmentFunTest-方法', option);
            }
        }
    }
    initialize();
    return Global;
});
define('main', ['global','api','frame'], function (Global,Api,Frame) {
    var $main = {};
    $main.initialize = function () {
        //开始加载'页面'
        $main.methods.loadPage(function(_page){
            //加载'页面'成功
            $main.page=_page;
            //开始加载'data-htmlfile'
            $main.methods.loadHtml();
        });
    };
    $main.methods = {
        //加载'页面'
        loadPage:function(cb){
            var currentPageSrc='app/js/view/'+$('.container').attr('data-view');
            var page=require([currentPageSrc],function(_cp){ cb(_cp) });
        },
        //加载'data-htmlfile'
        loadHtml:function () {
            Frame.loadHtml.start('body', function () {
                //进入'全局'
                $main.methods.run();
                //初始化'页面'
                $main.page.initialize();
            });
        },
        run: function () {
            this.event();
        },
        //注册全局事件
        event: function () {
            //页面点击事件
            $(window).bind('click', function(e){ Frame.eventWatch.emit('windowClick',e) });
        }
    };
    return $main;
});


/*
* params：数据参数，参考data
* option为返回方法：success(data,params),error(data,params),complete(data,params)
Api.set({key:'test'},{
    success: function (data, params) {
        console.log(data);
    }
});
*/ 
define('api',['global'], function ($Global) {
    var Api={};
       
    Api.file={
        code:{
            success:0,//验证成功
            fail:1,//验证失败
            unlogin:2,//未登录
        },
        api:{
            test:'js/data/test.json'//测试
        }
    }
    Api.dev={
        code:{},
        api:{}
    }
    Api.set=function(params,option){
        var data = {
            key:params.key,//对应json配置的可以
            async:params.async||true,//是否异步， 默认异步
            type:params.type||'POST',//请求的类型,默认POST， 如果是GET方式，需要参数设置
            data:params.data||null,//提交参数
            paramsType:params.paramsType||'json',//参数传递的类型，object || json
            locked:params.locked||null,//是否需要锁定当前点击的按钮，屏蔽连续点击，jquery对象
            loading:params.loading||null,//当前按钮是否需要loading，jquery对象
            dataType:params.dataType||'json',//返回的数据格式
            url:params.url||null,//可单独传递url， 不传递默认通过以上key值去获取
            isApiStatus:params.isApiStatus||false//默认处理json返回状态不成功
        };
        Api.request.ajax(data, option);
    };
    //测试参数处理
    Api.getData={
        //获取接口的url
        getApiUrl:function(key){
            return $Global.option.isLocal?Api.file.api[key]:Api.dev.api[key];
        },
        //获取code配置
        getCode:function(){
            return $Global.option.isLocal?Api.file.code:Api.dev.code;
        },
        getType:function (type) {
            return $Global.option.isLocal ? 'GET' :(type || 'POST');
        },
        getAsync:function (async) {
            return $Global.option.isLocal ? true :(async || false);
        },
        getContentType:function(type){
            return !$Global.option.isLocal &&(type=='POST'||type=='PUT')?{contentType:"application/json;"}:null;
        }
    };
    //异步的操作
    Api.request={
        ajax:function(params,option){
            var params = !params ? {} :params;
            //初始化参数
            var locked = params.locked || null;
            var loading = params.loading || null;
            var data = params.data || null;
            var key = params.key || null;
            var dataType = (params && params.dataType) || 'json';
            var url = params.url || Api.getData.getApiUrl(key);
            var type = Api.getData.getType(params.type);
            var async = Api.getData.getAsync(params.async);
            //加锁--屏蔽连续点击
            if (locked && $(locked).hasClass('locked')) { return;};
            if (locked) { $(locked).addClass('locked');}
            //显示loading
            if (loading) {
                if(typeof loading =='boolean'){$.loading.show();}else{$(loading).addClass('loading');}
            };
            //修改data为json格式
            var _data = data ? ((type == 'POST' || type == 'PUT' || type == 'DELETE') && params.paramsType=='json') ? JSON.stringify(data) : data : null;
            //异步操作
            var ajaxConfig={
                type:type, dataType:dataType, url:url, data:_data, async:async,
                //通过header传递language和token
                beforeSend: function(request) {},
                success:function (msg) {
                    if(option.success)option.success(msg, params, 'success');
                    if($Global.option.debug){
                        console.log('#Ajax-Success:::', msg);
                    }
                    Api.request.requestEnd(locked, loading);
                },
                error:function (msg) {
                    if (option.error) option.error(msg, params, 'error');
                    Api.request.requestEnd(locked, loading);
                }
            };
            var contentType=Api.getData.getContentType(type);
            if(contentType&&params.paramsTyp=='json'){ajaxConfig=$.extend(ajaxConfig,contentType);}
            if($Global.option.debug){
                console.log('#Ajax-Request:::', _data, {key:key,type:params.type,contentType:contentType});
            }
            $.ajax(ajaxConfig);
        },
        //ajax结束（success,error,complete）
        requestEnd:function (locked, loading) {
            //解锁
            if (locked) { $(locked).removeClass('locked');}
            //关闭loading
            if (loading) { 
                if(typeof loading =='boolean'){$.loading.hide();}else{$(loading).removeClass('loading');}
            }
        }
    };
    return Api;
});
/*
#selectBox#
    //HTML
    <div class='selectBox'>
        <div class='selectVal'></div>
        <ul class='selectOptions'>
            <li data-code="01">first</li>
            <li data-code="02">second</li>
            <li data-code="03">thirdly</li>
        </ul>
    </div>
    //JS:vueMode,callback可选，如需更多功能将返回对象保存在本地handle(show,hide,select(index))
    Form.selectBox('.selectBox',{
        vueMode:true,
        callback:function(_val,_code){
            $('.selectVal').html(_val);
            $('.selectVal').attr('data-code',_code);
        }
    });
#checkBox#
    //HTML
    <div class="checkBox" data-type="multi">
        <label class='radio'>checkbox1</label>
        <label class='radio'>checkbox2</label>
        <label class='radio'>checkbox3</label>
    </div>
    //JS:
        *callback可选，如需更多功能将返回对象保存在本地handle(selectByIndex(index),removeCall)
        *data-type是否含有multi控制单选/多选(复选)
    Form.checkBox('.checkBox',{
        callback:function(_arr){
            console.log(_arr);
        }
    });
#验证输入#
    var _resultObj=Form.validate(['requied','tel'],'13821894771');
    console.log(_resultObj.key, _resultObj.boo);
*/
define('form', function () {
    var Form={};
    Form.selectBox = function (el, option) {
        var $selectBox = {};
        var option=option||{};
        var el_ul, el_li, el_val,cur;
        $selectBox.init = function () {
            el_val = $(el).find('.selectVal');
            el_ul = $(el).find('.selectOptions');
            el_li = $(el).find('.selectOptions li');
            cur = $(el).find('.selectOptions li.cur').index();
            cur < 0 ? cur = 0 : cur++;
            $selectBox.select(cur);
            el_val.click(function () {
                $(el).hasClass('isOpen') ? $selectBox.hide() : $selectBox.show();
            });
            el_li.click(function () {
                cur = $(this).index();
                $selectBox.select(cur);
            });
        };
        $selectBox.show = function () {
            $(el).addClass('isOpen')
            el_ul.show();
        };
        $selectBox.hide = function () {
            $(el).removeClass('isOpen')
            el_ul.hide();
        };
        $selectBox.select = function (_index) {
            $selectBox.hide();
            el_li.removeClass('cur');
            el_li.eq(_index).addClass('cur');
            var _val = el_li.eq(_index).html();
            var _code = el_li.eq(_index).attr('data-code');
            //返回结果
            if(option.callback)option.callback(_val,_code);
            //VUE模式下不由JQ更新数据
            if(!option.vueMode){
                el_val.html(_val);
                el_val.attr('data-code',_code);
            }
        };
        $selectBox.init();
        return $selectBox;
    };
    Form.checkBox = function (el,option) {
        var $checkBox = {};
        var option=option||{};
        var isMulti, checkBoxArr, checkedArr;
        var element=$(el)
        $checkBox.init = function () {
            isMulti = element.attr('data-type')=='multi';
            checkBoxArr = element.find(".radio");
            checkedArr = [];
            for (var i = 0; i < checkBoxArr.length; i++) {
                $(checkBoxArr[i]).attr({ "data-code": i });
            }
            checkBoxArr.click(function () {
                var _index = $(this).attr("data-code");
                var _this=checkBoxArr.eq(_index);
                if (_this.hasClass("cur")) {
                    unselectByIndex(_this,_index);
                } else {
                    selectByIndex(_this,_index);
                }
                doCallback();
            });
        };
        $checkBox.selectByIndex=function(_index){
            if(_index>=0){
                var _this=checkBoxArr.eq(_index);
                selectByIndex(_this,_index);
                doCallback();
            }
        };
        $checkBox.removeCall = function () {
            for (var i = 0; i < checkBoxArr.length; i++) {
                $(checkBoxArr[i]).removeAttr("data-code");
                $(checkBoxArr[i]).removeClass("cur");
            }
            $(checkBoxArr).unbind();
        };
        function selectByIndex(_this,_index){
            if (!isMulti) {
                element.find(".cur").removeClass("cur");
                checkedArr = [];
            }
            _this.addClass("cur")
            checkedArr.push(_index);
        }
        function unselectByIndex(_this,_index){
            if (isMulti) {
                _this.removeClass("cur");
                $.each(checkedArr, function (i, v) {
                    if (v == _index) checkedArr.splice(i, 1);
                });
            }
        }
        function doCallback(){
            checkedArr.sort(function (a, b) {
                return a - b;
            });
            if (option.callBack)option.callBack.call(this, checkedArr);
        }
        $checkBox.init();
        return $checkBox;
    };
    Form.validate = function (keys, val) {
        var result = { boo: true };
        var types = {
            'requied': /\S/ig,
            'email': /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/ig,
            'password': /^[a-zA-Z0-9]{6,20}$/ig,
            'tel': /^1[34578]\d{9}$/,
            'english': /^[A-Za-z\s]+$/ig,
            'num': /^\d+$/ig
        }
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key in types) {
                result.key = key;
                result.boo = types[key].test(val);
                if (!result.boo) {
                    return result;
                }
            } else {
                console.log('未知的验证类型');
            }
        }
        return result;
    };
    Form.flexText=function(el,option){
        var $flexText={};
        var el_pre,el_tArea;
        $flexText.init=function(){
            el_pre=$(el).find('pre');
            el_tArea=$(el).find('textarea');
            el_tArea.on('input propertychange keyup change', function () {
                mirror();
            });
            mirror();
        };
        function mirror(){
            el_pre.text(el_tArea.val());
        }
        $flexText.init();
        return $flexText;
    };
    return Form;
});
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
/*
#懒加载#
    var lazyHandle=List.lazyloading(window,{content:".lazyTest", startAjax:startAjaxFun});
    lazyHandle.start();//开始
    function startAjaxFun(){
        $('.lazyTest').append('<li>new add</li>');
        lazyHandle.setData();//继续加载
        //lazyHandle.clear();//不再继续加载
    }
#分页器#
    List.pager({
        target: '.paginationTest',
        count:30,
        current: 2,
        pagesize: 5,
        callback: function (current, pagesize, pagecount) {
            console.log('current='+current+'  pagesize='+pagesize+'  pagecount='+pagecount);
        }
    });
*/
define('list', function () {
    var List={};
    List.lazyloading=function(element,parameter){
        var $lazyloading={};
        $lazyloading.methods={
            init:function(){
                $lazyloading.isWorking=false;
                $lazyloading.isAjax=true;
                $lazyloading.startAjax=parameter.startAjax||null;
                $lazyloading.appendComplete=parameter.appendComplete||null;
                $lazyloading.showLoadingComplete=parameter.showLoadingComplete||null;
                $lazyloading.content=$(parameter.content)||null;
                $lazyloading.listHeight=parameter.listHeight||$($lazyloading.list).outerHeight();
                if(!$lazyloading.content)return false;
            },
            scroll:function(){
                if(!$lazyloading.isAjax) return false;
                var height=$lazyloading.content.outerHeight();
                if($(element).scrollTop()+$(window).height()>=height+$lazyloading.content.offset().top&&$lazyloading.isAjax&&$lazyloading.content.height()>0){
                    $lazyloading.isAjax=false;
                    if($lazyloading.startAjax)$lazyloading.startAjax();
                }
            },
            setData:function(data){
                $lazyloading.isAjax=true;
                if($lazyloading.appendComplete)$lazyloading.appendComplete();
            },
            //清除
            clear:function(){
                $(element).unbind("scroll.lazyloading-scroll",this.scroll);
                $lazyloading.isWorking=false;
            },
            //开始
            start:function(){
                if(!$lazyloading.isWorking){
                    $lazyloading.isWorking=true;
                    $(element).bind("scroll.lazyloading-scroll",this.scroll);
                }
            }
        };
        $lazyloading.methods.init();
        return $lazyloading.methods;
    };
    List.pager = function (options) {
        if (!options.target) return;
        var defaults = {
            callback: $.noop,
            pagesize: 10, // 每页显示条数
            pagecount: 0, // 总页数
            count: 0, //数据总条数
            current: 1, // 当前页
            istoolbar: true,
            pageSizeList: [10, 20, 50]
        };
        var Pager = (function () {
            function PagerContext(element, options) {
                this.element = element;
                if (this.element.length > 0) this.element.empty();
                this.options = options;
                this.container = $('<div class="pageControllerWrapper" />');
                $(element).append(this.container);
                this.render();
                if (this.pagecount == 0) return;
                this.format();
                this.init_event();
            }
            PagerContext.prototype.render = function (opt) {
                this.count = (opt && opt.count) || this.options.count;
                this.pagesize = (opt && opt.pagesize) || this.options.pagesize;
                this.current = (opt && opt.current) || this.options.current;
                var _pagecount = ((opt && opt.pagecount) || this.options.pagecount);
                this.pagecount = _pagecount ? _pagecount : Math.ceil(((opt && opt.count) || this.options.count) / ((opt && opt.pagesize) || this.options.pagesize));
            };
            PagerContext.prototype.format = function () {
                var html = '<ul class="pageController visible-md">';
                html += '<li class="prev num" lg="previous-page">上一页</li>';
                if (this.pagecount > 7) { //超过7页
                    html += '<li data-page="1" class="num ">1</li>'
                    if (this.current >= 6) { //当前页数大于6页
                        html += '<li data-page="2" class="num ">2</li>';
                        html += '<li class="short">...</li>';
                        for (var i = this.current - 2; i <= Math.min(this.current + 2, this.pagecount); i++) {
                            html += '<li data-page="' + i + '" class="num">' + i + '</li>';
                        }
                    } else { //当前页数小于6页
                        for (var i = 2; i < 6; i++) {
                            html += '<li data-page="' + i + '" class="num">' + i + '</li>';
                        }
                        if (this.current == 5) {
                            html += '<li data-page="6" class="num">6</li>';
                        }
                    }
                    if (this.current < this.pagecount - 2) html += '<li class="short">...</li>';
                } else {
                    for (var i = 1; i <= this.pagecount; i++) {
                        html += '<li data-page="' + i + '" class="num">' + i + '</li>'
                    }
                }
                html += '<li class="next num"  lg="next-page">下一页</li>';
                html += '</ul>';
                this.container.html(html);
                this.container.find('li[data-page="' + this.current + '"]').addClass('cur');
                if (this.current == 1) {
                    $('.prev', this.container).addClass('ui-page-disabled');
                    // $('.js-page-first', this.container).addClass('ui-page-disabled');
                }
                if (this.current == this.pagecount) {
                    $('.next', this.container).addClass('ui-page-disabled');
                    // $('.js-page-last', this.container).addClass('ui-page-disabled');
                }
            };
            PagerContext.prototype.init_event = function () {
                var _this = this;
                this.container.on('click', 'li.num', function () {
                    var $this = $(this);
                    if ($this.hasClass('ui-page-disabled')) return;
                    if ($this.hasClass('cur')) return;
                    if ($this.hasClass('prev')) {
                        _this.current--;
                    } else if ($this.hasClass('next')) {
                        _this.current = Math.min(_this.pagecount, _this.current + 1);
                    } else if ($(this).data('page')) {
                        _this.current = parseInt($(this).data('page'));
                    }
                    _this.go();
                    return;
                });
            };
            PagerContext.prototype.change_pagesize = function (pagesize) {
                this.render({
                    current: 1,
                    pagesize: pagesize
                });
                this.go(this.current);
            };
            PagerContext.prototype.go = function (index) {
                var _this = this;
                this.current = index || this.current;
                this.current = Math.max(1, _this.current);
                this.current = Math.min(this.current, _this.pagecount);
                if (!this.current) this.current = 1;
                this.format();
                _this.options.callback && _this.options.callback.call(_this, this.current, this.pagesize, this.pagecount);
            }
            return PagerContext;
        })();
        $(options.target).each(function (index, item) {
            new Pager($(item), $.extend({}, defaults, $(this).data(), options, {
                zIndex: 100 - index
            }));
        });
    };
    return List;
});
//require基础配置
require.config({
    baseUrl:'',
    paths: {
        'text':'app/js/plugin/text',
        'vconsole':'app/js/plugin/vconsole.min'
    },
    urlArgs: 'r=' + (new Date()).getTime()
});
//框架启动,完成后进入当前页面的js文件
require(['main'], function (Main) {
    Main.initialize();
});
