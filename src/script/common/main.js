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

