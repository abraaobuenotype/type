import autobind from 'autobind-decorator';

import Phrase from '../Phrase';
import Word from '../Word';
import Metrics from '../../Metrics';

@autobind
class VerticalModule {

    @Private _width = 0;
    @Private _height = 0;

    _textLeftToRight = true;
    _textTopToBottom = true;

    _spaceBetweenLines = 0;
    _spaceBetweenWords = -1;

    _textAlign = "left";

    @Private _lines = [];

    constructor() {}

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
                ff.push(c.style.fontFamily);
                fs.push(c.style.fontSize);

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

        for (var i = 0; i < chars.length; i++) {
            var line = this._lines[this._lines.length - 1];
            var word = line.words[line.words.length - 1];
            //c é o caracter a ser tratado
            var c = chars[i];

            //se for um /n  organizar a linha atual, criar nova linha e setar a primeira palavra
            if (c.text == "\n") {
                this._lines.push(new Phrase());
                line = this._lines[this._lines.length - 1];
                var w = new Word();
                w.indexWord = 0;
                line.words.push(w);
                if (breakMultiControl) {
                    line.width = c.width;
                    w.width = c.width;
                } else {
                    c.width = 0;
                }
                c.height = 0;
                w.chars.push(c);
                breakMultiControl = true;
                isSpace = false;
                continue;
            }
            breakMultiControl = false;
            //se for espaço adicionar o caracter criar uma nova palavra e adicionar a frase
            if (c.text == " ") {
                isSpace = true;
                if (this._spaceBetweenWords != -1) {
                    if (this._spaceBetweenWords != -1) {
                        c.height = this._spaceBetweenWords;
                    }
                }
            }
            if (isSpace && c.text != " ") {
                isSpace = false;
                var wordAtual = this._arrangeLinesVertical(line, c.height);
                line = this._lines[this._lines.length - 1];
                var w = null;
                if (this._lines[this._lines.length - 1].words[this._lines[this._lines.length - 1].words.length - 1].chars.length !== 0) {
                    //adiciona nova palavra, com a proxima index
                    var index = word.indexWord;
                    w = new Word();
                    w.indexWord = index + 1;
                    line.words.push(w);
                } else {
                    w = wordAtual;
                }
                w.chars.push(c);
                w.width = c.width;
                w.height = c.height;
                line.height += c.height;
                if (c.width > line.width) {
                    line.width = c.width;
                }
                continue;
            }
            var word = this._arrangeLinesVertical(line, c.height);
            line = this._lines[this._lines.length - 1];
            word.height += c.height;
            line.height += c.height;
            if (c.width > word.width) {
                word.width = c.width;
            }
            if (c.width > line.width) {
                line.width = c.width;
            }
            //coloca o caracter no final da palavra
            word.chars.push(c);
        }

        this._alignLines(this._lines);
    }

    /**
 *  Break the line if the phrase is bigger then the field
 *
 *  @param line [line to be analised] {Array}
 */
    @Private _arrangeLinesVertical(line, charHeight) {

        if (line.words.length == 1) {
            if (line.height + charHeight > this._height) {
                this._lines.push(new Phrase());
                novaWord = new Word();
                novaWord.indexWord = 0;
                this._lines[this._lines.length - 1].words.push(novaWord);
            }
        } else {
            if (line.height + charHeight > this._height) {

                this._lines.push(new Phrase());
                var heightTotal = 0;

                for (var i = 0; i < line.words.length; i++) {

                    heightTotal += line.words[i].height;

                    if (this._height < heightTotal + charHeight) {

                        // arruma a largura e altura da linha antiga
                        var wordAntiga = line.words[line.words.length - 1];

                        line.height -= wordAntiga.height;
                        line.words[line.words.length - 2].chars[line.words[line.words.length - 2].chars.length - 1].height = 0;

                        var word = line.words.pop();
                        word.indexWord = 0;

                        this._lines[this._lines.length - 1].words.push(word);

                        //arruma a largura e altura da linha
                        var linhaNova = this._lines[this._lines.length - 1];
                        linhaNova.width = wordAntiga.width;
                        linhaNova.height = wordAntiga.height;

                        break;
                    }
                }
            }
        }
        return this._lines[this._lines.length - 1].words[this._lines[this._lines.length - 1].words.length - 1];
    };
    /**
 *  Responsible for the decision of which direction to write(between all 4 vertical types) and which align to use (4 align types)
 *
 *  @param lines [lines to repositioned] {Array}
 */
    @Private _alignLines(lines) {
        //vertical Priority
        //chooses vertical direction
        if (this._textTopToBottom) {
            //start top
            //chooses horizontal direction
            if (this._textLeftToRight) {
                //left to right start top
                if (this._textAlign == "center") {
                    this._centerAlignUDLR(lines);
                    return;
                }
                if (this._textAlign == "bottom") {
                    this._bottomAlignUDLR(lines);
                    return;
                }
                if (this._textAlign == "justify") {
                    this._justifyAlignUDLR(lines);
                    return;
                }
                this._topAlignUDLR(lines);
                return;
            } else {
                //right to left start top
                if (this._textAlign == "center") {
                    this._centerAlignUDRL(lines);
                    return;
                }
                if (this._textAlign == "bottom") {
                    this._bottomAlignUDRL(lines);
                    return;
                }
                if (this._textAlign == "justify") {
                    this._justifyAlignUDRL(lines);
                    return;
                }
                this._topAlignUDRL(lines);
                return;
            }
        } else {
            //start Bottom
            //chooses horizontal direction
            if (this._textLeftToRight) {
                //left to right start Bottom
                if (this._textAlign == "center") {
                    this._centerAlignDULR(lines);
                    return;
                }
                if (this._textAlign == "bottom") {
                    this._bottomAlignDULR(lines);
                    return;
                }
                if (this._textAlign == "justify") {
                    this._justifyAlignDULR(lines);
                    return;
                }
                this._topAlignDULR(lines);
                return;
            } else {
                //right to left start Bottom
                if (this._textAlign == "center") {
                    this._centerAlignDURL(lines);
                    return;
                }
                if (this._textAlign == "bottom") {
                    this._bottomAlignDURL(lines);
                    return;
                }
                if (this._textAlign == "justify") {
                    this._justifyAlignDURL(lines);
                    return;
                }
                this._topAlignDURL(lines);
                return;
            }
        }
    };
    //////// Iniciando alinhamentos
    /// primeiro UPLR
    /**
 * Align on the top starting from the top left going down then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _topAlignUDLR(lines) {

        var x = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x += lines[i - 1].width;
            }
            line.x = x;

            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].y = 0;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.5);
                        continue;
                    }
                    if (k === 0) {
                        line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.5);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k - 1].y + line.words[j].chars[k - 1].height;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.5);
                    continue;
                }
            }
            x += this._spaceBetweenLines;
        }
    };
    /**
 * Align on the bottom starting from the top left going down then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _bottomAlignUDLR(lines) {

        var x = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x += lines[i - 1].width;
            }
            line.x = x;
            for (var j = line.words.length - 1; j >= 0; j--) {
                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].y = line.words[j + 1].chars[0].y - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k + 1].y - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                }
            }
            x += this._spaceBetweenLines;
        }
    };
    /**
 * Align on the center starting from the top left going down then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _centerAlignUDLR(lines) {

        var x = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x += lines[i - 1].width;
            }
            line.x = x;
            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {
                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].y = this._height / 2 - lines[i].height / 2;
                        lines[i].words[j].chars[k].x = x + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].y = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].y + lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].height;
                        lines[i].words[j].chars[k].x = x + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    lines[i].words[j].chars[k].y = lines[i].words[j].chars[k - 1].y + lines[i].words[j].chars[k - 1].height;
                    lines[i].words[j].chars[k].x = x + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                }
            }
            x += this._spaceBetweenLines;
        }
    };
    /**
 * Align justified starting from the top left going down then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _justifyAlignUDLR(lines) {

        var x = 0;
        if (lines.length > 1) {
            for (var i = 0; i < lines.length - 1; i++) {
                var line = lines[i];
                //soma ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    x += lines[i - 1].width;
                }
                line.x = x;
                var difEspacoLinha = (this._height - line.height) / (line.words.length - 1);
                for (var j = 0; j < line.words.length; j++) {
                    //se for mais de uma palavra e for a ultima palavra alinha na direita
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k == line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                                    continue;
                                }
                                line.words[j].chars[k].y = line.words[j].chars[k + 1].y - line.words[j].chars[k].height;
                                line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                            }
                            break;
                        }
                    }
                    for (var k = 0; k < line.words[j].chars.length; k++) {
                        if (k === 0 && j === 0) {
                            line.words[j].chars[k].y = 0;
                            line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].height + difEspacoLinha;
                            line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        line.words[j].chars[k].y = line.words[j].chars[k - 1].y + line.words[j].chars[k - 1].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                }
                x += this._spaceBetweenLines;
            }
            x += lines[lines.length - 2].height;
        }
        var line = lines[lines.length - 1];
        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].y = 0;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].height;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                line.words[j].chars[k].y = line.words[j].chars[k - 1].y + line.words[j].chars[k - 1].height;
                line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                continue;
            }
        }
    };
    //
    //
    //iniciando DULR  (baixo topo começando da esquerda)
    //
    //
    /**
 * Align on the top starting from the down left going up then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _topAlignDULR(lines) {

        var x = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x += lines[i - 1].width;
            }
            line.x = x;
            for (var j = line.words.length - 1; j >= 0; j--) {
                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].y = 0;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].y = line.words[j + 1].chars[0].y + line.words[j + 1].chars[0].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k + 1].y + line.words[j].chars[k + 1].height;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                }
            }
            x += this._spaceBetweenLines;
        }
    };
    /**
 * Align on the center starting from the down left going up then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _centerAlignDULR(lines) {

        var x = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x += lines[i - 1].width;
            }
            line.x = x;
            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {
                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].y = this._height / 2 + lines[i].height / 2 - lines[i].words[j].chars[k].height;
                        lines[i].words[j].chars[k].x = x + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].y = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].y - lines[i].words[j].chars[k].height;
                        lines[i].words[j].chars[k].x = x + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    lines[i].words[j].chars[k].y = lines[i].words[j].chars[k - 1].y - lines[i].words[j].chars[k].height;
                    lines[i].words[j].chars[k].x = x + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                }
            }
            x += this._spaceBetweenLines;
        }
    };
    /**
 * Align on the bottom starting from the down left going up then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _bottomAlignDULR(lines) {

        var x = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //soma ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x += lines[i - 1].width;
            }
            line.x = x;
            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k === 0) {
                        line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k - 1].y - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
            }
            x += this._spaceBetweenLines;
        }
    };
    /**
 * Align justified starting from the down left going up then right
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _justifyAlignDULR(lines) {

        var x = 0;
        if (lines.length > 1) {
            for (var i = 0; i < lines.length - 1; i++) {
                var line = lines[i];
                //soma ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    x += lines[i - 1].width;
                }
                line.x = x;
                var difEspacoLinha = (this._height - line.height) / (line.words.length - 1);
                for (var j = 0; j < line.words.length; j++) {
                    //se for mais de uma palavra e for a ultima palavra alinha na esquerda
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k === line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].y = 0;
                                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                                    continue;
                                }
                                line.words[j].chars[k].y = line.words[j].chars[k + 1].y + line.words[j].chars[k + 1].height;
                                line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
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
                            line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                            line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y - line.words[j].chars[k].height - difEspacoLinha;
                            line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        line.words[j].chars[k].y = line.words[j].chars[k - 1].y - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                }
                x += this._spaceBetweenLines;
            }
            x += lines[lines.length - 2].height;
        }
        var line = lines[lines.length - 1];
        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                line.words[j].chars[k].y = line.words[j].chars[k - 1].y - line.words[j].chars[k].height;
                line.words[j].chars[k].x = x + ((line.width - line.words[j].chars[k].width) * 0.50);
                continue;
            }
        }
    };
    //FIM do justify
    //
    //
    //iniciando UDRL  (cima baixo começando da direita)
    //
    //
    /**
 * Align on the top starting from the top right going down then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _topAlignUDRL(lines) {

        var x = this._width;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x -= lines[i - 1].width;
            }
            line.x = x;
            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].y = 0;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k === 0) {
                        line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k - 1].y + line.words[j].chars[k - 1].height;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
            }
            x -= this._spaceBetweenLines;
        }
    };
    /**
 * Align on the bottom starting from the top right going down then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _bottomAlignUDRL(lines) {

        var x = this._width;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x -= lines[i - 1].width;
            }
            line.x = x;
            for (var j = line.words.length - 1; j >= 0; j--) {
                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].y = line.words[j + 1].chars[0].y - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k + 1].y - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                }
            }
            x -= this._spaceBetweenLines;
        }
    };
    /**
 * Align on the center starting from the top right going down then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _centerAlignUDRL(lines) {

        var x = this._width;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x -= lines[i - 1].width;
            }
            line.x = x;
            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {
                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].y = this._height / 2 - lines[i].height / 2;
                        lines[i].words[j].chars[k].x = x - line.width + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].y = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].y + lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].height;
                        lines[i].words[j].chars[k].x = x - line.width + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    lines[i].words[j].chars[k].y = lines[i].words[j].chars[k - 1].y + lines[i].words[j].chars[k - 1].height;
                    lines[i].words[j].chars[k].x = x - line.width + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                }
            }
            x -= this._spaceBetweenLines;
        }
    };
    /**
 * Align justified starting from the top right going down then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _justifyAlignUDRL(lines) {

        var x = this._width;
        if (lines.length > 1) {
            for (var i = 0; i < lines.length - 1; i++) {
                var line = lines[i];
                //subtrai ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    x -= lines[i - 1].width;
                }
                line.x = x;
                var difEspacoLinha = (this._height - line.height) / (line.words.length - 1);
                for (var j = 0; j < line.words.length; j++) {
                    //se for mais de uma palavra e for a ultima palavra alinha na direita
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k == line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                                    continue;
                                }
                                line.words[j].chars[k].y = line.words[j].chars[k + 1].y - line.words[j].chars[k].height;
                                line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                            }
                            break;
                        }
                    }
                    for (var k = 0; k < line.words[j].chars.length; k++) {
                        if (k === 0 && j === 0) {
                            line.words[j].chars[k].y = 0;
                            line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].height + difEspacoLinha;
                            line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        line.words[j].chars[k].y = line.words[j].chars[k - 1].y + line.words[j].chars[k - 1].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                }
                x -= this._spaceBetweenLines;
            }
            x -= lines[lines.length - 2].height;
        }
        var line = lines[lines.length - 1];
        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].y = 0;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y + line.words[j - 1].chars[line.words[j - 1].chars.length - 1].height;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                line.words[j].chars[k].y = line.words[j].chars[k - 1].y + line.words[j].chars[k - 1].height;
                line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                continue;
            }
        }
    };
    //FIM justify
    //
    //
    //iniciando DURL  (baixo  cima começando da direita)
    //
    //
    /**
 * Align on the top starting from the bottom right going up then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _topAlignDURL(lines) {

        var x = this._width;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x -= lines[i - 1].width;
            }
            line.x = x;
            for (var j = line.words.length - 1; j >= 0; j--) {
                for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                    if (k == line.words[j].chars.length - 1 && j == line.words.length - 1) {
                        line.words[j].chars[k].y = 0;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k == line.words[j].chars.length - 1) {
                        line.words[j].chars[k].y = line.words[j + 1].chars[0].y + line.words[j + 1].chars[0].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k + 1].y + line.words[j].chars[k + 1].height;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                }
            }
            x -= this._spaceBetweenLines;
        }
    };
    /**
 * Align on the center starting from the bottom right going up then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _centerAlignDURL(lines) {

        var x = this._width;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x -= lines[i - 1].width;
            }
            line.x = x;
            for (var j = 0; j < lines[i].words.length; j++) {
                for (var k = 0; k < lines[i].words[j].chars.length; k++) {
                    if (k === 0 && j === 0) {
                        lines[i].words[j].chars[k].y = this._height / 2 + lines[i].height / 2 - lines[i].words[j].chars[k].height;
                        lines[i].words[j].chars[k].x = x - line.width + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k === 0) {
                        lines[i].words[j].chars[k].y = lines[i].words[j - 1].chars[lines[i].words[j - 1].chars.length - 1].y - lines[i].words[j].chars[k].height;
                        lines[i].words[j].chars[k].x = x - line.width + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    lines[i].words[j].chars[k].y = lines[i].words[j].chars[k - 1].y - lines[i].words[j].chars[k].height;
                    lines[i].words[j].chars[k].x = x - line.width + ((line.width - lines[i].words[j].chars[k].width) * 0.50);
                }
            }
            x -= this._spaceBetweenLines;
        }
    };
    /**
 * Align on the bottom starting from the bottom right going up then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _bottomAlignDURL(lines) {

        var x = this._width;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //subtrai ao y o tamanho das linhas para alinha-las
            if (i !== 0) {
                x -= lines[i - 1].width;
            }
            line.x = x;
            for (var j = 0; j < line.words.length; j++) {
                for (var k = 0; k < line.words[j].chars.length; k++) {
                    if (j === 0 && k === 0) {
                        line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    if (k === 0) {
                        line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                    line.words[j].chars[k].y = line.words[j].chars[k - 1].y - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
            }
            x -= this._spaceBetweenLines;
        }
    };
    /**
 * Align justified starting from the bottom right going up then left
 *
 * @param lines Array of lines to be repositioned {Array}
 */
    @Private _justifyAlignDURL(lines) {

        var x = this._width;
        if (lines.length > 1) {
            for (var i = 0; i < lines.length - 1; i++) {
                var line = lines[i];
                //subtrai ao y o tamanho das linhas para alinha-las
                if (i !== 0) {
                    x -= lines[i - 1].width;
                }
                line.x = x;
                var difEspacoLinha = (this._height - line.height) / (line.words.length - 1);
                for (var j = 0; j < line.words.length; j++) {
                    //se for mais de uma palavra e for a ultima palavra alinha na esquerda
                    if (line.words.length != 1) {
                        if (j == line.words.length - 1) {
                            for (var k = line.words[j].chars.length - 1; k >= 0; k--) {
                                if (k === line.words[j].chars.length - 1) {
                                    line.words[j].chars[k].y = 0;
                                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                                    continue;
                                }
                                line.words[j].chars[k].y = line.words[j].chars[k + 1].y + line.words[j].chars[k + 1].height;
                                line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
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
                            line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                            line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        if (k === 0) {
                            line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y - line.words[j].chars[k].height - difEspacoLinha;
                            line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                            continue;
                        }
                        line.words[j].chars[k].y = line.words[j].chars[k - 1].y - line.words[j].chars[k].height;
                        line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                        continue;
                    }
                }
                x -= this._spaceBetweenLines;
            }
            x -= lines[lines.length - 2].width;
        }
        var line = lines[lines.length - 1];
        for (var j = 0; j < line.words.length; j++) {
            for (var k = 0; k < line.words[j].chars.length; k++) {
                if (j === 0 && k === 0) {
                    line.words[j].chars[k].y = this._height - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                if (k === 0) {
                    line.words[j].chars[k].y = line.words[j - 1].chars[line.words[j - 1].chars.length - 1].y - line.words[j].chars[k].height;
                    line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                    continue;
                }
                line.words[j].chars[k].y = line.words[j].chars[k - 1].y - line.words[j].chars[k].height;
                line.words[j].chars[k].x = x - line.width + ((line.width - line.words[j].chars[k].width) * 0.50);
                continue;
            }
        }
    };
    //FIM do justify
    ////// fim do alinhamento

}
export default VerticalModule;
