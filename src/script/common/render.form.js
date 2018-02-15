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