exports.open = function () {
    let tabs = require('sdk/tabs');
    let data = require('sdk/self').data;
    let foxyshot = require('./foxyshot');
    
    tabs.open({
        url: data.url('index.html'),
        onReady: function (tab) {
            let worker = tab.attach({
                contentScriptFile: [
                        data.url('js/game.js'),
                        data.url('js/main.js')
                    ],
                contentScriptOptions: foxyshot.capturePage()
            });
        }
    })
};