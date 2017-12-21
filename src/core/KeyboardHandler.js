import autobind from 'autobind-decorator';
import TextField from './text/TextField';
import EventEmiter from 'eventemitter3';

@autobind
class KeyboardHandler extends EventEmiter{

    constructor() {
        super();

        if (KeyboardHandler.instance !== null) {
            throw "Singleton:: use KeyboardHandler.getInstance()";
        }

        this.instance = this;
    }

    set focusedInput(value) {
        this._focusedInput = value;
    }

    get focusedInput() {
        return this._focusedInput;
    }

    static _instance = null;

    static get instance(){
        return this._instance;
    }

    static set instance(value){
        this._instance = value;
    }

    static
    getInstance() {
        if (KeyboardHandler.instance === null) {
             KeyboardHandler.instance = new KeyboardHandler();
        }

        var instance = KeyboardHandler.instance;

        instance._focusedInput = null;
        instance.startMonitor();

        return instance;
    }

    startMonitor() {

        var self = this;

        window.document.onkeydown = function(e){
            self._hardKeyboard.call(self, e);
        };

    }

    stopMonitor(){
        window.document.onkeydown = null;
        this._focusedInput = null;
    }

    _hardKeyboard(e) {
        if(!this._focusedInput) return;

        this._focusedInput.selectionGraphics.clear();

        if (e.key.match(/backspace/i) !== null) {


            var text = this._focusedInput.text;
            var textSliced = "";


            if (this._focusedInput.initialChar <= this._focusedInput.finalChar){
                if (this._focusedInput.initialChar == this._focusedInput.finalChar){
                    textSliced = text.substring(0, this._focusedInput.initialChar) + text.substring(++this._focusedInput.finalChar);
                }

                else{
                    textSliced = text.substring(0, this._focusedInput.initialChar) + text.substring(++this._focusedInput.finalChar);
                    this._focusedInput.finalChar = this._focusedInput.initialChar;
                }

            }else{
                textSliced = text.substring(0, this._focusedInput.finalChar) + text.substring(++this._focusedInput.initialChar);
                this._focusedInput.initialChar = this._focusedInput.finalChar;
            }


            this._focusedInput.setText(textSliced);
            this._focusedInput.initialChar--;
            if (this._focusedInput.initialChar < 0) this._focusedInput.initialChar = 0;
            this._focusedInput.finalChar = this._focusedInput.initialChar;
            this._focusedInput.positionCursor(this._focusedInput.field.children[this._focusedInput.initialChar]);

            return;
        }


        if (e.key.match(/delete/i) !== null) {
            var text = this._focusedInput.text;
            var textSliced = "";


            if (this._focusedInput.initialChar <= this._focusedInput.finalChar){
                if (this._focusedInput.initialChar == this._focusedInput.finalChar){
                    textSliced = text.substring(0, ++this._focusedInput.initialChar) + text.substring(this._focusedInput.finalChar + 2);
                }

                else{
                    textSliced = text.substring(0, this._focusedInput.initialChar) + text.substring(++this._focusedInput.finalChar);
                    this._focusedInput.finalChar = this._focusedInput.initialChar;
                }

            }else{
                textSliced = text.substring(0, this._focusedInput.finalChar) + text.substring(this._focusedInput.initialChar + 2);
                this._focusedInput.initialChar = this._focusedInput.finalChar;
            }


            this._focusedInput.setText(textSliced);
            this._focusedInput.initialChar--;
            if (this._focusedInput.initialChar < 0) this._focusedInput.initialChar = 0;
            this._focusedInput.finalChar = this._focusedInput.initialChar;
            this._focusedInput.positionCursor(this._focusedInput.field.children[this._focusedInput.initialChar]);

            return;
        }

        if (e.key.match(/arrow/i) !== null) {

            if (e.key.match(/left/i) !== null) {
                if (this._focusedInput.initialChar != 0) this._focusedInput.initialChar--;

                this._focusedInput.positionCursor(this._focusedInput.field.children[this._focusedInput.initialChar]);
                this._focusedInput.finalChar = this._focusedInput.initialChar;
            }

            if (e.key.match(/right/i) !== null) {
                if (this._focusedInput.finalChar < this._focusedInput.text.length) this._focusedInput.finalChar++;
                this._focusedInput.positionCursor(this._focusedInput.field.children[this._focusedInput.finalChar]);
                this._focusedInput.initialChar = this._focusedInput.finalChar;
            }

            return;
        }


        if (e.key.match(/control/i) === null && e.key.match(/shift/i) === null && e.key.match(/dead/i) === null && e.key.match(/alt/i) === null && e.key.match(/meta/i) === null
            && e.key.match(/contextmenu/i) === null && (e.key.length == 1 || e.key.match(/enter/i) !== null)) {
            var value = e.key;
            if (value.match(/enter/i) !== null) {
                value = "\n";
            }



            var text = this._focusedInput.text;

            var textSliced = "";


                if (this._focusedInput.initialChar <= this._focusedInput.finalChar){
                    if (this._focusedInput.initialChar == this._focusedInput.finalChar){
                        textSliced = text.substring(0, ++this._focusedInput.initialChar) + value + text.substring(++this._focusedInput.finalChar);
                    }

                    else{
                        textSliced = text.substring(0, this._focusedInput.initialChar) + value + text.substring(++this._focusedInput.finalChar);
                        this._focusedInput.finalChar = this._focusedInput.initialChar;
                    }

                }else{
                    textSliced = text.substring(0, this._focusedInput.finalChar) + value + text.substring(++this._focusedInput.initialChar);
                    this._focusedInput.initialChar = this._focusedInput.finalChar;
                }


            this._focusedInput.setText(textSliced);

            this._focusedInput.positionCursor(this._focusedInput.field.children[this._focusedInput.initialChar]);

            return;
        }
    }
}
export default KeyboardHandler;
