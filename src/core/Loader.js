import autobind from 'autobind-decorator';
import EventEmiter from 'eventemitter3';
import Metrics from './Metrics';

require('../../lib/Font');

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
