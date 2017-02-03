import autobind from 'autobind-decorator';

import Metrics from '../../Metrics';

/**
 * Used to Define a custom aligment for the chars in the textfield
 *
 * @class
 * @memberof type.text
 *
 * @example
 * var typeAlign = new type.text.TypeAlign();
 * typeAlign.startingX = 50;
 * typeAlign.startingY = 250;
 *typeAlign.steps = [{
 *     "x": 20,
 *     "y": 70,
 *     "rotation": 90
 *}, {
 *     "x": 15,
 *     "y": -20
 *}, {
 *     "x": 15,
 *     "y": +20,
 *     "rotation": 45
 *}, {
 *     "x": 15,
 *     "y": -70
 *},
 *{
 *     "x": 20,
 *     "y": -70,
 *     "rotation": 45
 *}, {
 *     "x": 15,
 *     "y": +20
 *}, {
 *     "x": 15,
 *     "y": -20
 *}, {
 *     "x": 15,
 *     "y": +70
 * }];
 *
 *
 *txField.typeAlign = typeAlign;
 *
 *txField.customAlign = true;
 */

@autobind
class TypeAlign {

    constructor() {}

    /*
     * Starting x point of the chars
     *
     * @member {number}
     * @memberof type.text.TypeAlign#
     */
    @Private _startingX = 0;
    /*
     * Starting y point of the chars
     *
     * @member {number}
     * @memberof type.text.TypeAlign#
     */
    @Private  _startingY = false;
    /*
     * steps to follow after the starting point to align the chars each object inside must contain x, y and rotation
     *
     * @member {Array}
     * @memberof type.text.TypeAlign#
     */
    @Private  _steps = [];

    /**
     * Starting x point of the chars
     *
     * @member {number}
     * @memberof type.text.TypeAlign#
     */
    get startingX() {
        return this._startingX;
    }

    set startingX(value) {
        this._startingX = value;
    }

    /**
     * Starting y point of the chars
     *
     * @member {number}
     * @memberof type.text.TypeAlign#
     */

    get startingY() {
        return this._startingY;
    }
    set startingY(value) {
        this._startingY = value;
    }
    /**
     * steps to follow after the starting point to align the chars each object inside must contain x, y and rotation
     *
     * @member {Array}
     * @memberof type.text.TypeAlign#
     */

    get steps() {
        return this._steps;
    }
    set steps(value) {
        this._steps = value;
    }


}
export default TypeAlign;
