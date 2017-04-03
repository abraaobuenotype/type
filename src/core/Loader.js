import autobind from 'autobind-decorator';
import EventEmiter from 'eventemitter3';
import Font from '../../lib/Font';

import Metrics from './Metrics';
import TextField from './text/TextField.js'


@autobind
class Loader extends EventEmiter{

    @Private library = {};
    @Private count = 0;

    @Private metrics = new Metrics();

    constructor(){
        super();
    }

    add(name, url){
        this.library[name] = url;

        if (Loader.defaultStyle.fontFamily === undefined) {
            Loader.defaultStyle.fontFamily = name;
        }
    }

    static _defaultStyle = {
        fontSize: 20,
        fill: '#000000'
    };

    static get defaultStyle() {
        return this._defaultStyle;
    }

    static set defaultStyle(value) {
        this.setText(_defaultStyle);
    }

    load(){
        for(var i in this.library){
            var f = new Font();
            f.fontFamily = i;
            f.onload = this.tempLoad;
            f.src = this.library[i];

            this.metrics.once('metricsLoaded', this.tempLoad);
            this.metrics.load(i, this.library[i]);
        }
    }

    tempLoad(){
        this.count = this.count + 1;
        if(this.count >= Object.keys(this.library).length * 2){
            this.emit('loadComplete');
        }
    }
}

export default Loader;
