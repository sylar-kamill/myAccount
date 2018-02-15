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