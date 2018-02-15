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