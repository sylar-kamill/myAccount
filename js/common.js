var $common={};
jQuery(function(){
	$common.createNew=new jQuery.createNew();
	$common.createNew.init();
});
var myData=[
	["Flying Blue", "", "cc7811bcc1642bfb03cf81df998f31ce37dc02d451ef", "932448e09c310418b9fc"],
	["个人税务", "http://www.tax.sh.gov.cn", "cf7740a3cc7d28f307c9a98fc5de0413f917", "c37e1bb0c8322ff102cba482c5d875cc188061b017737521023a934d","d6c2c9f6759c8f960fdfa2672ebb4f6e0061a62c"],
	["P站-pixiv", "http://www.pixiv.net", "cc7811bcc1642bfb03cf8189c6d876c176d23ceb0300d469","c76009b8d77b2cf405c09e69"],
	["高德地图", "", "972642eb95307cae5e99f005f2eafb", "c76009b8d77b2cf40193392c"],
	["NGA", "", "cc7811bcc1642bfb03cf81df998f31ce37dc00e06347", "c76009b8d77b2cf40586f721"],
	["百度", "", "83564ffc9c4c60db588b84da8efb5b88198176c30c355b7a5cb76798e01a520c01ea166203da0154", "cc7811bcc1642bfb03cff0db9d05317177"],
	["大众点评", "", "972642eb95307cae5e99f003984f73", "c76009b8d77b2cf402b5d434"],
	["Tweitter", "", "cc7811bcc1642bfb03cf8189c6d876c176d23ceb01a8068c", "d1d481af7596879a0fdd00729a1d"],
	["Facebook", "", "cc9ddd2ccad87f52b4721e6198131a7e07c168f3000a09d4", "d17208eacf6928f305c201d622a5"],
	["Gmail", "", "cc7811bcc1642bfb03cf8189c6d876c176d23ceb04aa99c0", "d17208eacf6928f305c2015f1c41"],
	["github.com", "", "cc7811bcc1642bfb03cf81df998f31ce37dc00bd6fda", "c76009b8d77b2cf4589bf703e248e6"],
	["AppleID", "", "cc7811bcc1642bfb03cf81df998f31ce37dc04cfa539", "e7534beb973c26f402302ba6"],
	["QQ分身", "", "942a49ed943e7daa599d04fa20b2", "d17208eacf6928f305c2009cb6f8"],
	["TF/BN", "", "ef171007d6501802f372230e8ee7e04b51d52f7d8cd2000f5a71", "d1d481af7596879a0fdd006aaccb","f2422e9cf55f1cad2c9de4dc9bfc4a886a8162b209233f7e49c76a8b9d0a450505fd1b1505212ab2"],
	["GF/BN", "", "cc7811bcc1642bfb03cf81df998f31ce37dc02fa7f47", "d17208eacf6928f305c20387065b","e323348de73f0bc051e0e4dc9bfa51886a8162b209293f7e49c56c88940a450507fb1c1000f0ac24"],
	["支付宝", "", "ccde98f97b9b849209d0833c7dbc543bc140006f09c8", "a0394d478a085322df362652c4d1cf0f0181245bd69acf1805f5961e48e9567d7e79659c9a64798f57dc5e9ff800198b15","83f0c4b927cecfb1219486346ab3437d961b11f449d60c6349ddbc2603d1d88d21b3239fcb81b957abd76367277bb8002d44b7"],
	["YY", "", "cc7811bcc1642bfb03cff0db9d051608a5", "d1d481af7596879a0fdd003ec628"],
	["DELL外星人服务码", "", "9e272393e85074031aa811"],
	["Airbnb爱彼迎", "https://zh.airbnb.com/", "cc7811bcc1642bfb03cf81df998f31ce37dc044708f7", "d17208eacf6928f305c20350d017"],
	["booking", "", "cc7811bcc1642bfb03cf81df998f31ce37dc04a919dd", "c76009b8d77b2cf404e1922d"],
	["Adobe", "", "cc7811bcc1642bfb03cf81df998f31ce37dc03d5f9d9", "e7534beb973c26f4036b915f"]
];
(function($){
    $.createNew=function() {
        var $createNew={};
        $createNew.init=function(){
			//$createNew.showAccount("war3kamill");
			$(".inputPW").change(function(){
				$(".pwContenter").hide();
				$createNew.showAccount($(this).val());
			});
		};
		$createNew.showAccount=function(pwd){
			$.each(myData,function(_index, _value){
				var _htmlLi=$('<li><p>'+_value[0]+'</p></li>');
				if(_value[1].length>0)_htmlLi.append('<p>'+_value[1]+'</p>');
				for(var i=2; i<_value.length; i++){
					_value[i]=$createNew.decrypt(_value[i], pwd);
					_htmlLi.append('<p>'+_value[i]+'</p>');
				}
				$(".main").append(_htmlLi);
			});
		};
		$createNew.decrypt=function(str, pwd) { 
			if(str == null || str.length < 8) { 
				alert("A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted."); 
				return; 
			} 
			if(pwd == null || pwd.length <= 0) { 
				alert("Please enter a password with which to decrypt the message."); 
				return; 
			} 
			var prand = ""; 
			for(var i=0; i<pwd.length; i++) { 
				prand += pwd.charCodeAt(i).toString(); 
			} 
			var sPos = Math.floor(prand.length / 5); 
			var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5)); 
			var incr = Math.round(pwd.length / 2); 
			var modu = Math.pow(2, 31) - 1; 
			var salt = parseInt(str.substring(str.length - 8, str.length), 16); 
			str = str.substring(0, str.length - 8); 
			prand += salt; 
			while(prand.length > 10) { 
				prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString(); 
			} 
			prand = (mult * prand + incr) % modu; 
			var enc_chr = ""; 
			var enc_str = ""; 
			for(var i=0; i<str.length; i+=2) { 
				enc_chr = parseInt(parseInt(str.substring(i, i+2), 16) ^ Math.floor((prand / modu) * 255)); 
				enc_str += String.fromCharCode(enc_chr); 
				prand = (mult * prand + incr) % modu; 
			} 
			enc_str=decodeURI(enc_str);
			return enc_str; 
		} 
		return $createNew;
    };
})(jQuery);