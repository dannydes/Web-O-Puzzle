(function (dataurl, docWidth, docHeight, url) {
    'use strict';
    
    let image = new Image();
    image.onload = function () {
        let canvas = document.createElement('canvas');
        canvas.width = docWidth;
        canvas.height = docHeight;
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, docWidth, docHeight);
        siteOPuzzle(canvas, url);
    };
    image.src = dataurl;
})(self.options.dataurl, self.options.pageWidth, self.options.pageHeight, self.options.pageURL);