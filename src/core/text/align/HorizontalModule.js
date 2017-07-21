import autobind from 'autobind-decorator';

import Phrase from '../Phrase';
import Word from '../Word';
import Metrics from '../../Metrics';

@autobind
class HorizontalModule {

    @Private _width = 0;
    @Private _height = 0;

    _textLeftToRight = true;
    _textTopToBottom = true;

    _spaceBetweenLines = 0;
    _spaceBetweenWords = -1;

    _textAlign = "left";

    @Private _lines = [];

    constructor() {}

    get lines(){
        return this._lines;
    }

    relocate(defaultText, chars, width, height) {
        this._width = width;
        this._height = height;

        this._lines = [];

        var d_words = defaultText.match(/\S+(?=\s?)/g);
        var d_spaces = defaultText.match(/\s+(?=[^\n])/g);

        var __words = [];
        for (var i = 0; i < d_words.length; i++) {
            var w = '';
            if (d_spaces !== null && d_spaces[i]) {
                w = d_words[i] + d_spaces[i];
            } else {
                w = d_words[i];
            }
            __words.push(w);
        }

        var count = 0;
        var allMetrics = [];
        for (i = 0; i < __words.length; i++) {
            var w = __words[i];
            var ff = [];
            var fs = [];
            var objectChar = [];
            for (var j = 0; j < w.length; j++) {
                var c = chars[count];
                var data = c.style.font.split(" ");
                ff.push(data[1]);
                fs.push(parseFloat(data[0]));

                objectChar.push(c);

                count++;
            }

            Metrics.getMetrics(w, ff, fs, {}, (icount, glyphs, gx, gy) => {
                var c = objectChar[icount];
                c.vx = gx;
                c.vheight = c.height;

                if (icount > 0) {
                    objectChar[icount - 1].vwidth = c.vx - objectChar[icount - 1].vx;
                }

                if (icount == objectChar.length - 1) {
                    c.vwidth = "last";
                }
            });
        }

        this._lines.push(new Phrase());
        this._lines[0].words.push(new Word());
        this._lines[0].words[0].indexWord = 0;
        var isSpace = false;
        var breakMultiControl = false;

        for (i = 0; i < chars.length; i++) {
            var line = this._lines[this._lines.length - 1];
            var word = line.words[line.words.length - 1];

            var c = chars[i];

            if (c.text == '\n') {
                this._lines.push(new Phrase());
                line = this._lines[this._lines.length - 1];
                var w = new Word();
                w.indexWord = 0;
                line.words.push(w);

                if (breakMultiControl) {
                    line.height = c.vheight;
                    w.height = c.vheight;
                } else {
                    c.vheight = 0;
                }

                c.width = 0;
                c.vwidth = 0;

                w.chars.push(c);

                breakMultiControl = true;
                isSpace = false;

                continue;
            }

            breakMultiControl = false;

            if (c.text == " ") {
                isSpace = true;
                if (this._spaceBetweenWords != -1) {
                    c.vwidth += this._spaceBetweenWords;
                }
            }

            if (isSpace && c.text != " ") {
                isSpace = false;

                var wordAtual = this._arrangeLines(line, c.vwidth);
                line = this._lines[this._lines.length - 1];

                var w = null;
                if (this._lines[this._lines.length - 1].words[this._lines[this._lines.length - 1].words.length - 1].chars.length !== 0) {
                    var index = word.indexWord;
                    w = new Word();
                    w.indexWord = index + 1;
                    line.words.push(w);
                } else {
                    w = wordAtual;
                }

                w.chars.push(c);

                w.width = c.vwidth;
                w.height = c.vheight;
                line.width += c.vwidth;

                if (c.vheight > line.height) {
                    line.height = c.vheight;
                }

                continue;
            }

            var word = this._arrangeLines(line, c.vwidth);

            line = this._lines[this._lines.length - 1];

            word.width += c.vwidth;
            line.width += c.vwidth;

            if (c.vheight > word.height) {
                word.height = c.vheight;
            }

            if (c.vheight > line.height) {
                line.height = c.vheight;
            }

            word.chars.push(c);
        }

        this._alignLines(this._lines);
    }

    @Private _arrangeLines(line, charWidth) {
        if (line.words.length == 1) {
            if (line.width + charWidth > this._width) {
                this._lines.push(new Phrase());

                var novaWord = new Word();
                novaWord.indexWord = 0;

                this._lines[this._lines.length - 1].words.push(novaWord);
            }
        } else {
            if (line.width + charWidth > this._width) {
                this._lines.push(new Phrase());

                var widthTotal = 0;
                for (var i = 0; i < line.words.length; i++) {
                    widthTotal += line.words[i].width;

                    if (this._width < widthTotal + charWidth) {
                        var wordAntiga = line.words[line.words.length - 1];

                        line.width -= wordAntiga.width;
                        line.words[line.words.length - 2].chars[line.words[line.words.length - 2].chars.length - 1].width = 0;

                        var word = line.words.pop();
                        word.indexWord = 0;

                        this._lines[this._lines.length - 1].words.push(word);

                        var linhaNova = this._lines[this._lines.length - 1];
                        linhaNova.width = wordAntiga.width;
                        linhaNova.height = wordAntiga.height;

                        break;
                    }
                }
            }
        }

        return this._lines[this._lines.length - 1].words[this._lines[this._lines.length - 1].words.length - 1];
    }

    @Private _alignLines(lines) {
        if (this._textTopToBottom) {
            if (this._textLeftToRight) {
                switch (this._textAlign) {
                    case "center":
                        this._centerAlignLRUD(lines);
                        break;
                    case "right":
                        this._rightAlignLRUD(lines);
                        break;
                    case "justify":
                        this._justifyAlignLRUD(lines);
                        break;
                    default:
                        this._leftAlignLRUD(lines);
                }
            } else {
                switch (this._textAlign) {
                    case "center":
                        this._centerAlignRLUD(lines);
                        break;
                    case "right":
                        this._rightAlignRLUD(lines);
                        break;
                    case "justify":
                        this._justifyAlignRLUD(lines);
                        break;
                    default:
                        this._leftAlignRLUD(lines);
                }
            }
        } else {
            if (this._textLeftToRight) {
                switch (this._textAlign) {
                    case "center":
                        this._centerAlignLRDU(lines);
                        break;
                    case "right":
                        this._rightAlignLRDU(lines);
                        break;
                    case "justify":
                        this._justifyAlignLRDU(lines);
                        break;
                    default:
                        this._leftAlignLRDU(lines);
                }
            }else {
                switch (this._textAlign) {
                    case "center":
                        this._centerAlignRLDU(lines);
                        break;
                    case "right":
                        this._rightAlignRLDU(lines);
                        break;
                    case "justify":
                        this._justifyAlignRLDU(lines);
                        break;
                    default:
                        this._leftAlignRLDU(lines);
                }
            }
        }
    }

    @Private _leftAlignLRUD(lines) {
        var y = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y += lines[i - 1].height;
            }

            line.y = y;

            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].x = 0;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);

                        continue;
                    }

                    if (k === 0) {

                        line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].vwidth;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                        continue;
                    }

                    line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].vwidth;
                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                    continue;
                }
            }
            y += this._spaceBetweenLines;
        }
    }

    @Private _centerAlignLRUD(lines) {
        var y = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y += lines[i - 1].height;
            }

            line.y = y;

            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {

                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].x = this._width / 2 - lines[i].width / 2;
                        lines[i].words[j].chars[k].y = y + ((line.height - lines[i].words[j].chars[k].vheight) * 0.8);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].x = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].x + lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].vwidth;
                        lines[i].words[j].chars[k].y = y + ((line.height - lines[i].words[j].chars[k].vheight) * 0.8);
                        continue;
                    }

                    lines[i].words[j].chars[k].x = lines[i].words[j].chars[k - 1].x + lines[i].words[j].chars[k - 1].vwidth;
                    lines[i].words[j].chars[k].y = y + ((line.height - lines[i].words[j].chars[k].vheight) * 0.8);
                }

            }

            y += this._spaceBetweenLines;
        }
    }

    @Private _rightAlignLRUD(lines) {
        var y = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (i !== 0) {
                y += lines[i - 1].height;
            }

            line.y = y;

            for (var j = line.words.length - 1; j >= 0; j--) {

                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {

                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].x = this._width - line.words[j].chars[k].vwidth;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].x = line.words[j + 1].chars[0].x - line.words[j].chars[k].vwidth;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);
                        continue;
                    }

                    line.words[j].chars[k].x = line.words[j].chars[k + 1].x - line.words[j].chars[k].vwidth;

                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);
                }

            }

            y += this._spaceBetweenLines;

        }
    }

    @Private _justifyAlignLRUD(lines) {
        var y = 0;

        //se for mais de uma linha
        if (lines.length > 1) {

            for (var i = 0; i < lines.length - 1; i++) {

                var line = lines[i];

                //soma ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    y += lines[i - 1].height;
                }

                line.y = y;
                var difEspacoLinha = (this._width - line.width) / (line.words.length - 1);

                for (var j = 0; j < line.words.length; j++) {

                    //se for mais de uma palavra e for a ultima palavra alinha na direita
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k == line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].x = this._width - line.words[j].chars[k].vwidth;
                                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);
                                    continue;
                                }

                                line.words[j].chars[k].x = line.words[j].chars[k + 1].x - line.words[j].chars[k].vwidth;
                                line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);

                            }
                            break;
                        }
                    }

                    for (var k = 0; k < line.words[j].chars.length; k++) {

                        if (k === 0 && j === 0) {
                            line.words[j].chars[k].x = 0;
                            line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].vwidth + difEspacoLinha;
                            line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);
                            continue;
                        }

                        line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].vwidth;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                        continue;

                    }

                }

                y += this._spaceBetweenLines;

            }

            y += lines[lines.length - 2].height;
        }
        var line = lines[lines.length - 1];

        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].x = 0;
                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].vwidth;
                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].vheight) * 0.8);
                    continue;
                }

                line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].vwidth;
                line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                continue;

            }

        }
    }

    //TODO daqui pra baixo

    //
    //
    //iniciando RLUD  (direita esquerda começando do topo)
    //
    //
    //
    /**
     * Align on the left starting from the top right going left then down
     *
     * @param lines Array of lines to be repositioned {Array}
     */
    @Private _leftAlignRLUD(lines) {

        var y = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y += lines[i - 1].height;
            }

            line.y = y;

            for (var j = line.words.length - 1; j >= 0; j--) {
                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {

                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].x = 0;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].x = line.words[j + 1].chars[0].x + line.words[j + 1].chars[0].vwidth;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                        continue;
                    }
                    line.words[j].chars[k].x = line.words[j].chars[k + 1].x + line.words[j].chars[k + 1].vwidth;
                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.8);
                }
            }
            y += this._spaceBetweenLines;
        }
    };
    /**
    * Align on the center starting from the top right going left then down
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _centerAlignRLUD(lines) {
        var y = 0;
        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y += lines[i - 1].height;
            }

            line.y = y;

            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {
                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].x = this._width / 2 + lines[i].width / 2 - lines[i].words[j].chars[k].width;
                        lines[i].words[j].chars[k].y = y + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].x = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].x - lines[i].words[j].chars[k].vwidth;
                        lines[i].words[j].chars[k].y = y + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    lines[i].words[j].chars[k].x = lines[i].words[j].chars[k - 1].x - lines[i].words[j].chars[k].vwidth;
                    lines[i].words[j].chars[k].y = y + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                }
            }
            y += this._spaceBetweenLines;
        }
    };
    /**
    * Align on the right starting from the top right going left then down
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _rightAlignRLUD(lines) {

        var y = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y += lines[i - 1].height;
            }
            line.y = y;
            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k === 0) {
                        line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x - line.words[j].chars[k].vwidth;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    line.words[j].chars[k].x = line.words[j].chars[k - 1].x - line.words[j].chars[k].vwidth;
                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
            }
            y += this._spaceBetweenLines;
        }
    };
    /**
    * Align justified starting from the top right going left then down
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _justifyAlignRLUD(lines) {

        var y = 0;
        if (lines.length > 1) {
            for (var i = 0; i < lines.length - 1; i++) {
                var line = lines[i];
                //soma ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    y += lines[i - 1].height;
                }
                line.y = y;
                var difEspacoLinha = (this._width - line.width) / (line.words.length - 1);
                for (var j = 0; j < line.words.length; j++) {
                    //se for mais de uma palavra e for a ultima palavra alinha na esquerda
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k === line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].x = 0;
                                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                                    continue;
                                }
                                line.words[j].chars[k].x = line.words[j].chars[k + 1].x + line.words[j].chars[k + 1].vwidth;
                                line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                            }
                            break;
                        }
                    }
                    //se n for a ultima palavra alinha da direita
                    // if (k === 0 && j === 0) {
                    //     line.words[j].chars[k].x = 0;
                    //     line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    //     continue;
                    // }
                    // if (k === 0) {
                    //     line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].width + difEspacoLinha;
                    //     line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    //     continue;
                    // }
                    //
                    //
                    // line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].width;
                    // line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    // continue;
                    for (var k = 0; k < line.words[j].chars.length; k++) {
                        if (j === 0 && k === 0) {
                            line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                            line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x - line.words[j].chars[k].vwidth - difEspacoLinha;
                            line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                            continue;
                        }
                        line.words[j].chars[k].x = line.words[j].chars[k - 1].x - line.words[j].chars[k].vwidth;
                        line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                }
                y += this._spaceBetweenLines;
            }
            y += lines[lines.length - 2].height;
        }
        var line = lines[lines.length - 1];
        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x - line.words[j].chars[k].vwidth;
                    line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
                line.words[j].chars[k].x = line.words[j].chars[k - 1].x - line.words[j].chars[k].vwidth;
                line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                continue;
            }
        }
    };
    //FIM do justify
    //
    //
    //iniciando LRDU  (esquerda direita começando da base)
    //
    //
    /**
    * Align on the left starting from the bottom left going right then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _leftAlignLRDU(lines) {

        var y = this._height;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y -= lines[i - 1].height;
            }
            line.y = y;
            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].x = 0;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k === 0) {
                        line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].vwidth;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].vwidth;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
            }
            y -= this._spaceBetweenLines;
        }
    };
    /**
    * Align on the right starting from the bottom left going right then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _rightAlignLRDU(lines) {

        var y = this._height;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y -= lines[i - 1].height;
            }
            line.y = y;
            for (var j = line.words.length - 1; j >= 0; j--) {
                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].x = line.words[j + 1].chars[0].x - line.words[j].chars[k].vwidth;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    line.words[j].chars[k].x = line.words[j].chars[k + 1].x - line.words[j].chars[k].vwidth;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                }
            }
            y -= this._spaceBetweenLines;
        }
    }
    /**
    * Align on the center starting from the bottom left going right then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _centerAlignLRDU(lines) {
        var y = this._height;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y -= lines[i - 1].height;
            }
            line.y = y;
            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {
                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].x = this._width / 2 - lines[i].width / 2;
                        lines[i].words[j].chars[k].y = y - line.height + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].x = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].x + lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].vwidth;
                        lines[i].words[j].chars[k].y = y - line.height + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    lines[i].words[j].chars[k].x = lines[i].words[j].chars[k - 1].x + lines[i].words[j].chars[k - 1].vwidth;
                    lines[i].words[j].chars[k].y = y - line.height + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                }
            }
            y -= this._spaceBetweenLines;
        }
    }
    /**
    * Align justified starting from the bottom left going right then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _justifyAlignLRDU(lines) {

        var y = this._height;
        if (lines.length > 1) {
            for (var i = 0; i < lines.length - 1; i++) {
                var line = lines[i];
                //subtrai ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    y -= lines[i - 1].height;
                }
                line.y = y;
                var difEspacoLinha = (this._width - line.width) / (line.words.length - 1);
                for (var j = 0; j < line.words.length; j++) {
                    //se for mais de uma palavra e for a ultima palavra alinha na direita
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k == line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                                    continue;
                                }
                                line.words[j].chars[k].x = line.words[j].chars[k + 1].x - line.words[j].chars[k].vwidth;
                                line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                            }
                            break;
                        }
                    }
                    for (var k = 0; k < line.words[j].chars.length; k++) {
                        if (k === 0 && j === 0) {
                            line.words[j].chars[k].x = 0;
                            line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].vwidth + difEspacoLinha;
                            line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                            continue;
                        }
                        line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].vwidth;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                }
                y -= this._spaceBetweenLines;
            }
            y -= lines[lines.length - 2].height;
        }
        var line = lines[lines.length - 1];
        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].x = 0;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].vwidth;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
                line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].vwidth;
                line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                continue;
            }
        }
    }
    //FIM justify
    //
    //
    //iniciando RLDU  (direita esquerda começando da base)
    //
    //
    /**
    * Align on the left starting from the bottom right going left then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _leftAlignRLDU(lines) {

        var y = this._height;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y -= lines[i - 1].height;
            }
            line.y = y;
            for (var j = line.words.length - 1; j >= 0; j--) {
                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].x = 0;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].x = line.words[j + 1].chars[0].x + line.words[j + 1].chars[0].vwidth;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    line.words[j].chars[k].x = line.words[j].chars[k + 1].x + line.words[j].chars[k + 1].vwidth;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                }
            }
            y -= this._spaceBetweenLines;
        }
    };
    /**
    * Align on the center starting from the bottom right going left then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */

    @Private _centerAlignRLDU(lines) {

        var y = this._height;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y -= lines[i - 1].height;
            }
            line.y = y;
            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {
                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].x = this._width / 2 + lines[i].width / 2 - lines[i].words[j].chars[k].width;
                        lines[i].words[j].chars[k].y = y - line.height + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].x = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].x - lines[i].words[j].chars[k].vwidth;
                        lines[i].words[j].chars[k].y = y - line.height + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    lines[i].words[j].chars[k].x = lines[i].words[j].chars[k - 1].x - lines[i].words[j].chars[k].vwidth;
                    lines[i].words[j].chars[k].y = y - line.height + ((line.height - lines[i].words[j].chars[k].height) * 0.80);
                }
            }
            y -= this._spaceBetweenLines;
        }
    };
    /**
    * Align on the right starting from the bottom right going left then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _rightAlignRLDU(lines) {

        var y = this._height;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                y -= lines[i - 1].height;
            }
            line.y = y;
            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    if (k === 0) {
                        line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x - line.words[j].chars[k].vwidth;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                    line.words[j].chars[k].x = line.words[j].chars[k - 1].x - line.words[j].chars[k].vwidth;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
            }
            y -= this._spaceBetweenLines;
        }
    };
    /**
    * Align justified starting from the bottom right going left then up
    *
    * @param lines Array of lines to be repositioned {Array}
    */
    @Private _justifyAlignRLDU(lines) {

        var y = this._height;
        if (lines.length > 1) {
            for (var i = 0; i < lines.length - 1; i++) {
                var line = lines[i];
                //subtrai ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    y -= lines[i - 1].height;
                }
                line.y = y;
                var difEspacoLinha = (this._width - line.width) / (line.words.length - 1);
                for (var j = 0; j < line.words.length; j++) {
                    //se for mais de uma palavra e for a ultima palavra alinha na esquerda
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k === line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].x = 0;
                                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                                    continue;
                                }
                                line.words[j].chars[k].x = line.words[j].chars[k + 1].x + line.words[j].chars[k + 1].vwidth;
                                line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                            }
                            break;
                        }
                    }
                    //se n for a ultima palavra alinha da direita
                    // if (k === 0 && j === 0) {
                    //     line.words[j].chars[k].x = 0;
                    //     line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    //     continue;
                    // }
                    // if (k === 0) {
                    //     line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].width + difEspacoLinha;
                    //     line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    //     continue;
                    // }
                    //
                    //
                    // line.words[j].chars[k].x = line.words[j].chars[k - 1].x + line.words[j].chars[k - 1].width;
                    // line.words[j].chars[k].y = y + ((line.height - line.words[j].chars[k].height) * 0.80);
                    // continue;
                    for (var k = 0; k < line.words[j].chars.length; k++) {
                        if (j === 0 && k === 0) {
                            line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                            line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x - line.words[j].chars[k].vwidth - difEspacoLinha;
                            line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                            continue;
                        }
                        line.words[j].chars[k].x = line.words[j].chars[k - 1].x - line.words[j].chars[k].vwidth;
                        line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                        continue;
                    }
                }
                y -= this._spaceBetweenLines;
            }
            y -= lines[lines.length - 2].height;
        }
        var line = lines[lines.length - 1];
        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].x = this._width - line.words[j].chars[k].width;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].x = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].x - line.words[j].chars[k].vwidth;
                    line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                    continue;
                }
                line.words[j].chars[k].x = line.words[j].chars[k - 1].x - line.words[j].chars[k].vwidth;
                line.words[j].chars[k].y = y - line.height + ((line.height - line.words[j].chars[k].height) * 0.80);
                continue;
            }
        }
    };
    //FIM do justify
    ////// fim do alinhamento
}

export default HorizontalModule;
