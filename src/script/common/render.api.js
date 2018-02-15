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