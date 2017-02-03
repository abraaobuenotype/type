import autobind from 'autobind-decorator';

import Metrics from '../../Metrics';

@autobind
class CustomModule {

    constructor() {}

    /*
     * Type Align Object, object that have the properties of aligment
     *
     * @member {Object | TypeALign}
     * @memberof type.text.CustomModule#
     */
    @Private _typeAlign = null;
    /*
     * define the use of rotation or not on the custom align
     *
     * @member {Boolean}
     * @default false
     */
    @Private _useRotation = false;

    /**
     * Type Align Object, object that have the properties of aligment
     *
     * @member {Object | TypeALign}
     * @memberof type.text.CustomModule#
     */

    get typeAlign() {
        return this._typeAlign;
    }
    set typeAlign(value) {
        this._typeAlign = value;
    }

    /**
 *  position the Chars on the screen
 *
 *  @param chars [chars to be positioned] {Array}
 */
    align(chars) {
        chars[0].x = this._typeAlign.startingX;
        chars[0].y = this._typeAlign.startingY;
        var stepCount = 0;
        for (var i = 1; i < chars.length; i++) {
            if (stepCount == this._typeAlign.steps.length) {
                stepCount = 0;
            }
            chars[i].x = chars[i - 1].x + this._typeAlign.steps[stepCount].x;
            chars[i].y = chars[i - 1].y + this._typeAlign.steps[stepCount].y;
            if (this._typeAlign.steps[stepCount].rotation !== undefined)
                chars[i].rotation = Math.PI / 180 * this._typeAlign.steps[stepCount].rotation;
            stepCount++;
        }
    }

}
export default CustomModule;
