import autobind from 'autobind-decorator';
import TextField from './text/TextField';
import EventEmiter from 'eventemitter3';

@autobind
class KeyboardHandler extends EventEmiter{

    constructor() {

        super();

        if (this.instance) {
            throw "Singleton:: use KeyboardHandler.getInstance()";
        }

        this.instance = this;

        this._focusedInput = null;

        this.startMonitor();
    }

    set focusedInput(value) {
        this._focusedInput = value;
    }

    get focusedInput() {
        return this._focusedInput;
    }

    _instance = null;

    static get instance(){
        return this._instance;
    }

    static set instance(value){
        this._instance = value;
    }

    static getInstance() {
        console.log("getinstance");
        if (!KeyboardHandler.instance) {
            new KeyboardHandler();
        }

        return KeyboardHandler.instance;
    }

    startMonitor() {

        var self = this;

        window.document.onkeydown = function(e){
            self._hardKeyboard.call(self, e);
        };

    }

    _hardKeyboard(e) {
        if (e.key.match(/arrow/i) === null && e.key.match(/control/i) === null && e.key.match(/shift/i) === null && e.key.match(/dead/i) === null && e.key.match(/alt/i) === null) {
            var value = e.key;
            if (value.match(/enter/i) !== null) {
                value = "\n"
            }
            //this.emit('keyPressed', {value: value});
            console.log(value);
        }
    }
}
export default KeyboardHandler;
