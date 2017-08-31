import autobind from 'autobind-decorator';
import EventEmiter from 'eventemitter3';
var Font = require('Font');

import Metrics from './Metrics';
import TextField from './text/TextField.js'

var opentype = require('opentype.js');

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

    //Workaround URL should be used in conjunction with the method to load fonts in APKs
    load(workAroundURL){
        for(var i in this.library){
            var f = new Font();
            f.fontFamily = i;
            f.onload = this.tempLoad;
            f.src = this.library[i];

            if (!workAroundURL || workAroundURL == undefined) {
                this.metrics.once('metricsLoaded', this.tempLoad);
                this.metrics.load(i, this.library[i]);
            }

        }
    }

    //this method should be called to load fonts from an array buffer ///// USE to work around xmlhttprequest on native APKs
    workAroundLoad(name, fontArayBuffer){

        var font = opentype.parse(fontArayBuffer);

        Metrics.library[name] = font;
        this.tempLoad();
    }



    tempLoad(){
        this.count = this.count + 1;
        if(this.count >= Object.keys(this.library).length * 2){
            this.emit('loadComplete');
        }
    }
}

export default Loader;
