define(['global', 'frame'], function (Global, Frame) {
    return {
        initialize: function () {
            this.run();
        },
        run: function () {
            var that=this;
            var myId, myPw;
            $('.goBtn').bind('click', function () {
                myId = $(this).parent().attr('data-id');
                myPw = $(this).parent().find('.pw').val();
                $('.enterBlock').hide();
                Frame.setAjax({
                    url: 'app/js/data/' + myId + '.json',
                    success: function (obj) {
                        obj=JSON.parse(obj);
                        $.each(obj.data, function (_index, _value) {
                            _value=that.decrypt(_value,myPw);
                            _value=decodeURI(_value);
                            var _arr=_value.split(',');
                            var _htmlLi = $('<li><p>' + _arr[0] + '</p></li>');
                            for(var i=1; i<_arr.length; i++){
                                _htmlLi.append('<p>'+_arr[i]+'</p>');
                            }
                            $(".dataFalls").append(_htmlLi);
                        });
                    }
                });
            });
        },
        //解压缩
        decrypt: function (str, pwd) {
            if (str == null || str.length < 8) {
                //alert("A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted.");
                return "A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted";
            }
            if (pwd == null || pwd.length <= 0) {
                //alert("Please enter a password with which to decrypt the message.");
                return "Please enter a password with which to decrypt the message";
            }
            var prand = "";
            for (var i = 0; i < pwd.length; i++) {
                prand += pwd.charCodeAt(i).toString();
            }
            var sPos = Math.floor(prand.length / 5);
            var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
            var incr = Math.round(pwd.length / 2);
            var modu = Math.pow(2, 31) - 1;
            var salt = parseInt(str.substring(str.length - 8, str.length), 16);
            str = str.substring(0, str.length - 8);
            prand += salt;
            while (prand.length > 10) {
                prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
            }
            prand = (mult * prand + incr) % modu;
            var enc_chr = "";
            var enc_str = "";
            for (var i = 0; i < str.length; i += 2) {
                enc_chr = parseInt(parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255));
                enc_str += String.fromCharCode(enc_chr);
                prand = (mult * prand + incr) % modu;
            }
            //enc_str = decodeURI(enc_str);
            return enc_str;
        }
    };
})