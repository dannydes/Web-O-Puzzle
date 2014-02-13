exports.show = function () {
    let widget = require('sdk/widget');
    let gameTab = require('./game_tab');
    let data = require('sdk/self').data;
    
    widget.Widget({
       id: 'web-o-puzzle',
       label: 'Start Web-O-Puzzle!',
       contentURL: data.url('images/icon.png'),
       onClick: function () {
        gameTab.open();
       }
    });
};