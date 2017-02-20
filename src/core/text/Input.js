import autobind from 'autobind-decorator';
import TextField from './TextField';
import Char from './Char';

@autobind
class Input extends PIXI.Container{
    constructor(_width, _height, align, maxChars){
        super();
        this._width = _width || 2048;
        this._height = _height || 1152;
        this.hitArea = new PIXI.Rectangle(0,0,this._width, this._height);
        this.debug = false;
        this.maxChars = maxChars || 0;
        this.field = new TextField(_width, _height);
        this.field.align = align;
        this.addChild(this.field);
        this.cursorStyle = {
            fontFamily: 'arial',
            fontSize: 20,
            fill: "#000000"
        };
        //configurando o cursor
        this.cursor = new Char("I", this.cursorStyle);
        this.addChild(this.cursor);
        this.cursor.alpha = 0;
        switch (align) {
            case "center":
                this.cursor.x = (this.x + this._width) / 2;
                break;
            case "right":
                this.cursor.x = (this.x + this._width);
                break;
            case "justify":
                this.cursor.x = (this.x + this._width) / 2;
                break;
            default:
                this.cursor.x = this.x;
        }
        this.selectionGraphics = new PIXI.Graphics();
        this.addChild(this.selectionGraphics);
        this.field.on("textUpdated", function(char) {
            this.positionCursor(char);
        });
    }

    get text(){
        return this.field._text;
    }

    set text(text){
        this.field.setText(text);
    }


    //TODO
    get textStyle(){
        return this.field._text;
    }

    set textStyle(text){
        this.field.setText(text);
    }
    //TODO

    get align(){
        return this.field.align;
    }

    set align(value){
        this.field.align = value;
    }

    get width(){
        return this._width;
    }

    set width(value){
        var width = this.getLocalBounds().width;
        if (width !== 0) {
            this.scale.x = value / width;
        } else {
            this.scale.x = 1;
        }
        this._width = value;
    }

    get textLeftToRight(){
        return this.field.textLeftToRight;
    }

    set textLeftToRight(value){
        this.field.textLeftToRight = value;
    }

    get textTopToBottom(){
        return this.field.textTopToBottom;
    }

    set textTopToBottom(value){
        this.field.textTopToBottom = value;
    }

    get alignHorizontalPriority(){
        return this.field._alignHorizontalPriority;
    }

    set alignHorizontalPriority(value){
        this.field._alignHorizontalPriority = value;
    }

    get customAlign(){
        return this.field._customAlign;
    }

    set customAlign(value){
        this.field._customAlign = value;
    }

    animateCursor(){
        TweenMax.to(this.cursor, 0.5, {
            alpha: 0,
            yoyo: true,
            repeat: -1
        },this);
    }

    setText(text, style){
        this.field.setText(text, style);
    }

    cursorSize(size){
        this.cursor.setStyle({fontSize: size});
    }

    focus(size){
        this.emit("focus");
    }

    hideCursor(size){
        this.interactive = false;
        TweenMax.killTweensOf(this.cursor);
        this.cursor.alpha = 0;
    }

    addEvents(){
        this.interactive = true;
        this.on('mousedown', this.focus, this);
        this.on('touchstart', this.focus, this);
        this.on('mouseup', this.stopSelecting, this);
        this.on('touchend', this.stopSelecting, this);
        this.on('mousemove', this.select, this);
        this.on('touchmove', this.select, this);
        this.on('mouseupoutside', this.stopSelecting, this);
        this.on('touchendoutside', this.stopSelecting, this);
    }

    removeEvents(){
        this.interactive = false;
        this.removeListener('mousedown');
        this.removeListener('touchstart');
        this.removeListener('mouseup');
        this.removeListener('touchend');
        this.removeListener('mousemove');
        this.removeListener('touchmove');
        this.removeListener('mouseupoutside');
        this.removeListener('touchendoutside');
    }

    focus(e){
        this.selectionStarted = true;
        this.initialChar = this.field.getCharAt(e.data.global.x, e.data.global.y);
    }

    select(e){
        if (this.selectionStarted) {
            this.finalChar = this.field.getCharAt(e.data.global.x, e.data.global.y);
            if (this.initialChar !== undefined && this.finalChar !== undefined && this.initialChar != this.finalChar) {
                this.drawSelection(this.field.getSelectionCoordinates(this.initialChar, this.finalChar));
            }
        }
    }

    stopSelecting(e){
        if (this.selectionStarted) {
            this.selectionStarted = false;
            this.finalChar = this.field.getCharAt(e.data.global.x, e.data.global.y);
            if (this.initialChar !== undefined && this.finalChar !== undefined && this.initialChar != this.finalChar) {
                this.drawSelection(this.field.getSelectionCoordinates(this.initialChar, this.finalChar));
            }
        }
        if (this.initialChar == this.finalChar) {
            this.selectionGraphics.clear();
            this.positionCursor(this.field.children[this.finalChar]);
        }
    }

    drawSelection(coords){
        this.selectionGraphics.clear();
        for (var i = 0; i < coords.length; i++) {
            this.selectionGraphics.beginFill(0x0000ff, 0.1);
            this.selectionGraphics.drawRect(coords[i].x, coords[i].y, coords[i].width, coords[i].height);
            this.selectionGraphics.endFill();
        }
    }

    showCursor(){
        this.positionCursor(this.field.children[this.field.children.length - 1]);
        this.cursorDirection = 1;
        this.cursorAnimation();
    }

    cursorAnimation(){
        this.cursor.alpha = 1;
        var cursor = this.cursor;

        this.showCursor = setInterval(function() {
            if (this.cursorDirection == 1) {
                cursor.alpha += 0.3;
            } else{
                cursor.alpha -= 0.3;
            }
            if (cursor.alpha >= 1) {
                this.cursorDirection = 0;
            }
            if (cursor.alpha <= 0) {
                this.cursorDirection = 1;
            }
        }, 130);
    }

    setWordStyle(word, style){
        this.field.setWordStyle(word, style);
    }

    setStyle(style){
        this.field.setStyle(style);
    }

    hideCursor(){
        clearInterval(this.showCursor);
        this.cursor.alpha = 0;
    }

    positionCursor(character){
        if (character === undefined) {
            character = null;
        }
        if (character === null) {
            if (this.field.align == "left" || this.field.align == "justify") {
                this.cursor.x = 2;
                this.cursor.y = 0;
            }
            if (this.field.align == "center") {
                this.cursor.x = this._width / 2;
                this.cursor.y = 0;
            }
            if (this.field.align == "right") {
                this.cursor.x = this.width - 3;
                this.cursor.y = 0;
            }
        }else{
            this.cursor.setStyle({fontSize: character.style.fontSize});
            this.cursor.x = Math.round(character.x + character.vwidth - character.style.fontSize / 10);
            this.cursor.y = character.y;
        }
    }
}

export default Input;
