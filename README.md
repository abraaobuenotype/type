Type for PIXI
===================

![Type logo](http://www.studiokori.com.br/Type_logo.png)

Type for PIXI is a powerfull tool to work with texts on HTML 5 canvas.


-------------

#### Current features


- Tag system
- 36 Basic Aligns
- Suports any Font
- Line Spacing
- Word Spacing
- stacked align
- Input with text selection (it's not an html bridge)

-------------

#### Basic Usage Example

> ### **PIXI.js v4+ required**
> official website: [http://www.pixijs.com/](http://www.pixijs.com/)

```
<script src="js/pixi.min.js" ></script>
<script src="js/type.min.js" ></script>
```

### es6+

```
import 'pixi.js';
import 'type-for-pixi';
```


```
<script>
	window.onload = function(){
		//creating loader to load fonts
        var loader = new type.Loader();
        //adding fonts using add method
        //example: .add('century', 'fonts/century.ttf');
        loader.add('century', '../fonts/century.ttf');
		loader.add('playtime', '../fonts/playtime.ttf');
        //adding listener to verify when fonts have been loaded
        loader.once('loadComplete', init);
        //load fonts
        loader.load();

		function init(){
			//creating PIXI
            var app = new PIXI.Application(1024,500, {transparent: true});
            document.body.appendChild(app.view);

            //creating TEXT with area 600x600 px
            var myText = new type.text.TextField(600,600);
            //seting text with tags for style
            //exemple: .setText('text', styleObject)
			myText.setText(
                '<tag>Nada do que é <into>social e humano</into> é mais\nreal que as <anothertag>utopias.</anothertag> Na sua vertente eutópica,\nas utopias constituíram sempre o fundamento <under>simbólico e mítico</under>...</tag>',
                {
                    align: 'justify',

                    tag: {
                        fontFamily: "century",
                        fontSize: 20,
                        fill: "red"
                    },

                    into: {
                        fontFamily: "playtime",
                        fontSize: 50,
                        fill: "green"
                    },

                    anothertag: {
                        fontWeight: "bold",
                        fill: "#198c67"
                    },

                    under: {
                        underscore: true
                    }
                }
            );

			app.stage.addChild(myText);
		}
	}
</script>
```
#### NPM install

```
npm i type-for-pixi -P
```

#### Type is writen using es2015+ features

> compile with webpack and babel with presset env and plugins:
> - babel-plugin-transform-decorators-legacy
> - babel-plugin-transform-class-properties
> - babel-plugin-transform-private-properties

-------------

#### More Examples

For more Examples download the project and open the examples folder or click this links (GitHub Pages):  


[view Simple tag example here](https://abraaobuenotype.github.io/type/examples/simple/)  
[view all Simple Aligns here](https://abraaobuenotype.github.io/type/examples/align/)  
[view Tween example here](https://abraaobuenotype.github.io/type/examples/tween/)  
[view Custom Align example here](https://abraaobuenotype.github.io/type/examples/custom_align/)  
[view Input example here](https://abraaobuenotype.github.io/type/examples/input/)  
[view Stacked Align example here](https://abraaobuenotype.github.io/type/examples/stackedAlign/)  
[view Simple with japanese font example here](https://abraaobuenotype.github.io/type/examples/japanese/)  


-------------

#### How to build

Note that for most users you don't need to build this project. If all you want is to use Type, then
just download one of our [prebuilt releases](https://gitlab.com/lab_de_ideias/Type/tree/master/bin). Really
the only time you should need to build Type is if you are developing it.

If you don't already have Node.js and NPM, go install them. Once you do, you can then install grunt:

    npm i -g grunt-cli

After that you can install the project modules at the project root file:

    npm i

Then, to build the source, run:

    npm run build

-------------

#### Plans

- More customizations
- Softkeyboard
- Cursor
- Box Vertical Align

-------------

#### Special thanks

PIXI.js - goodboy  
font.js - Pomax  
opentype.js - nodebox  
jsdiff - kpdecker  
eventemmiter3 - primus  

> - https://github.com/pixijs/pixi.js
> - https://github.com/Pomax/Font.js
> - https://github.com/nodebox/opentype.js
> - https://github.com/primus/eventemitter3

-------------

#### License

This content is released under the (http://opensource.org/licenses/MIT) MIT License.
