import autobind from 'autobind-decorator';
import EventEmiter from 'eventemitter3';

var opentype = require('opentype.js');

@autobind
class Metrics extends EventEmiter {

    static library = {};
    static relativeX = 0;
    static relativeY = 0;

    constructor() {
        super();
    }

    load(name, url) {
        this.opentypeLoad(url, (err, font, data) => {
            if (err !== "null") {
                console.warn("opentype: a font não foi carregada " + err);
            } else {
                Metrics.library[data.name] = font;
                this.emit('metricsLoaded');
            }
        }, {
            name: name,
            url: url
        });
    }

    static getMetrics(text, fontFamilyArr, fontSizeArr, options, callback = ()=>{}){
        Metrics.relativeX = 0;
        Metrics.relativeY = 0;

        var arr = [];

        for(var i = 0; i < text.length; i++){
            var font = Metrics.library[fontFamilyArr[i]];
            var plus = i < text.length - 1 ? text[i + 1] : '';

            Metrics.forEachGlyph(font, text[i] + plus, Metrics.relativeX, Metrics.relativeY, fontSizeArr[i], options, i, callback, (glyph, gx, gy, count, responder)=>{
                responder(i, glyph, gx, gy);
                arr.push({
                    glyph: glyph,
                    x: gx,
                    y: gy
                });
            });
        }

        return arr;
    }

    static forEachGlyph(font, text, x = 0, y = 0, fontSize = 72, options = undefined, count, responder, callback = ()=>{}){
        Metrics.relativeX = x;
        Metrics.relativeY = y;

        options = font.defaultRenderOptions;

        var fontScale = 1 / font.unitsPerEm * fontSize;
        var glyphs = font.stringToGlyphs(text, options);
        for (var i = 0; i < glyphs.length; i += 1) {
            var glyph = glyphs[i];
            callback(glyph, Metrics.relativeX, Metrics.relativeY, count, responder);
            if (glyph.advanceWidth) {
                Metrics.relativeX += glyph.advanceWidth * fontScale;
            }

            if (options.kerning && i < glyphs.length - 1) {
                var kerningValue = font.getKerningValue(glyph, glyphs[i + 1]);
                Metrics.relativeX += kerningValue * fontScale;
            }

            if (options.letterSpacing) {
                Metrics.relativeX += options.letterSpacing * fontSize;
            } else if (options.tracking) {
                Metrics.relativeX += (options.tracking / 1000) * fontSize;
            }

            break;
        }
    }

    opentypeLoad(url, callback, callbackData) {
        this.loadFromUrl(url, (err, arrayBuffer) => {
            if (err !== "null") {
                return callback(err);
            }

            var font;

            try {
                font = opentype.parse(arrayBuffer);
            } catch (e) {
                return callback(e, null);
            }

            return callback("null", font, callbackData);
        }, callbackData);
    }

    loadFromUrl(url, callback) {
        var request = new XMLHttpRequest();
        request.open('get', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            if (request.status !== 200) {
                return callback('Font could not be loaded: ' + request.statusText);
            }

            return callback("null", request.response);
        };

        request.send();
    }

}

export default Metrics;
