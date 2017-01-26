import autobind from 'autobind-decorator';

class Phrase{

    words = [];

    @Private _width = 0;
    @Private _height = 0;
    @Private _x = 0;
    @Private _y = 0;

    constructor(){

    }

    get x(){
        return this._x;
    }

    set x(value){
        this._x = value;
    }

    get y(){
        return this._y;
    }

    set y(value){
        this._y = value;
    }

    get width(){
        return this._width;
    }

    set width(value){
        this._width = value;
    }

    get height(){
        return this._height;
    }

    set height(value){
        this._height = value;
    }
}

export default Phrase;
