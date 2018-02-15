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
