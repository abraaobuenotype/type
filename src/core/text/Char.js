import autobind from 'autobind-decorator';

class Char extends PIXI.Container{

    @Private _text = null;
    @Private _style = null;
    @Private _underscore = false;

    @Private _underscoreObj = null;
    @Private _textObject = null;

    @Private _debug = false;
    @Private _debugObj = null;
    @Private _debugObjV = null;

    @Private _vwidth = 0;
    @Private _vheight = 0;

    constructor(text = '', style = {}, debug = false){
        super();

        this._text = text;
        if(this._text.length > 1){
            this._text = this._text.charAt(0);
        }

        this._style = new PIXI.TextStyle({
            fill: 'black',
            fontSize: 20,
            fontFamily: 'Arial',
            padding: 0
        });

        this._textObject = new PIXI.Text(this._text, this._style);
        this.setStyle(style);
        this.addChild(this._textObject);

        this.debug = debug;
    }

    get vwidth(){
        return this._vwidth;
    }

    set vwidth(value){
        if(value != "last"){
            this._vwidth = value;
        }
        else{
            this._vwidth = this._textObject.width;
        }

        this.createDebug();
    }

    get vheight(){
        return this._vheight;
    }

    set vheight(value){
        this._vheight = value;
        this.createDebug();
    }

    get debug(){
        return this._debug;
    }

    set debug(value){
        this._debug = value;
        this.createDebug();
    }

    get style(){
        return this._style;
    }

    get text(){
        return this._text;
    }

    setStyle(style){
        for(var p in style){
            if(p == 'underscore'){
                if(style[p] === true){
                    this._underscore = true;
                }
                continue;
            }

            this._style[p] = style[p];
        }

        this._style.padding = this._style.fontSize * 0.1;

        this._textObject.style = {} = this._style;

        if(this._underscore === true){
            this.clearUnderscore();
            this.createUnderscore();
        }
        else{
            this.clearUnderscore();
        }
    }

    @Private createUnderscore(){
        this._underscoreObj = new PIXI.Graphics();
        this._underscoreObj.beginFill(this._style.fill);

        var size = this._style.fontSize < 40 ? 1 : 2;
        if(this._style.underscoreSize){
            size = this._style.underscoreSize;
        }

        this._underscoreObj.drawRect(0, 0, this._textObject.width, size);
        this._underscoreObj.endFill();

        this._underscoreObj.x = this._textObject.x;
        this._underscoreObj.y = this._textObject.y + this._textObject.height - this._underscoreObj.height;

        this.addChild(this._underscoreObj);
    }

    @Private clearUnderscore(){
        if(this._underscoreObj === null) return;

        var p = this._underscoreObj.parent;
        if(p){
            p.removeChild(this._underscoreObj);
        }

        this._underscoreObj.destroy();
        this._underscoreObj = null;
    }

    @Private createDebug(){
        if(!this._debug){
            this.clearDebug();
            return;
        }

        if(this._debugObj){
            this.clearDebug();
        }

        this._debugObj = new PIXI.Graphics();
        this._debugObj.beginFill(0xff0000, 0.5);
        this._debugObj.drawRect(0, 0, this._textObject.width, this._textObject.height);
        this._debugObj.endFill();

        this._debugObjV = new PIXI.Graphics();
        this._debugObjV.beginFill(0x3ae218, 0.3);
        this._debugObjV.drawRect(0, 0, this._vwidth, this._textObject.height);
        this._debugObjV.endFill();

        this.addChildAt(this._debugObj, 0);
        this.addChildAt(this._debugObjV, 0);
    }

    @Private clearDebug(){
        if(this._debugObj === null){
            return;
        }

        var p = this._debugObj.parent;
        var pv = this._debugObjV.parent;

        p.removeChild(this._debugObj);
        pv.removeChild(this._debugObjV);

        this._debugObj.destroy();
        this._debugObjV.destroy();

        this._debugObj = null;
        this._debugObjV = null;
    }
}

export default Char;
