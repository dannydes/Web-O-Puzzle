let {Ci, Cc} = require('chrome');
let chromeWindow = Cc['@mozilla.org/appshell/window-mediator;1']
        .getService(Ci.nsIWindowMediator).getMostRecentWindow('navigator:browser');

function shot(width, height, callback) {
    let canvas = chromeWindow.document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    callback(context);
    return canvas.toDataURL();
}

exports.captureWindow = (x = 0, y = 0,
        width = chromeWindow.document.documentElement.clientWidth,
        height = chromeWindow.document.documentElement.clientHeight) =>
    (shot(width, height, function (context) {
        context.drawWindow(chromeWindow, x, y, width, height, 'rgb(0, 0, 0)');
    }));

let documentWindow = chromeWindow.top.getBrowser().selectedBrowser.contentWindow;

exports.capturePage = (x = 0, y = 0,
        width = documentWindow.document.body.clientWidth,
        height = documentWindow.document.body.clientHeight) =>
    ({
        dataurl: shot(width, height, function (context) {
            context.drawWindow(documentWindow, x, y, width, height, 'rgb(0, 0, 0)');
        }),
        pageWidth: width,
        pageHeight: height,
        pageURL: documentWindow.location.toString()
    });