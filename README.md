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

> ###**PIXI.js v4+ required**
> official website: [http://www.pixijs.com/](http://www.pixijs.com/)

```
<script src="js/pixi.min.js" ></script>
<script src="js/type.min.js" ></script>
```

```
<script>
	window.onload = function(){
		//loading fonts
		var loader = new type.Loader();
		//.add(fontFamilyName, url)
		loader.add('century', 'fonts/century.ttf');
		loader.add('playtime', 'fonts/playtime-webfont.ttf');
		loader.once('loadComplete', init);
		loader.load();

		function init(){
			var renderer = PIXI.autodetectRenderer(1024, 500, {transparent: true});
			document.body.appendChild(renderer.view);

			var stage = new PIXI.Container();

			var myText = new type.text.TextField(600, 600);
            myText.setText('<mytag>Nada do que é <tagb>social e humano</tagb> é mais real que as <anothertag>utopias.</anothertag></mytag>', {
                align: 'left',

                mytag: {
                    fontFamily: "century",
                    fontSize: 20,
                    fill: "red"
                },

                tagb: {
                    fontFamily: "playtime",
                    fontSize: 50,
                    fill: "green"
                },

                anothertag: {
                    fontWeight: "bold",
                    underscore: true
                }
            });

			myText.x = 300;
			myText.y = 300;

			stage.addChild(myText);
			animate();

			function animate(){
				requestAnimationFrame(animate);

				renderer.render(stage);
			}
		}
	}
</script>
```
#### NPM install

```
npm install type-for-pixi --save
```

#### Type is writen using es2015+ features

> compile with browserify and babelify with presset es2015 and plugins:
> - babel-plugin-transform-decorators-legacy
> - babel-plugin-transform-class-properties
> - babel-plugin-transform-private-properties

```
require('type-for-pixi');

var type = window.type._instance;
var loader = new type.Loader();

...
```

-------------

#### More Examples

For more Examples download the project and open the examples folder or click this links:  


[view simple tag example here](http://www.studiokori.com.br/typeExample/example1/);  
[view all simple aligns here](http://www.studiokori.com.br/typeExample/example2/);  
[view Tween example here](http://www.studiokori.com.br/typeExample/example3/);  
[view Custom Align example here](http://www.studiokori.com.br/typeExample/example4);  


-------------

#### How to build

Note that for most users you don't need to build this project. If all you want is to use Type, then
just download one of our [prebuilt releases](https://gitlab.com/lab_de_ideias/Type/tree/master/bin). Really
the only time you should need to build Type is if you are developing it.

If you don't already have Node.js and NPM, go install them. Once you do, you can then install grunt:

    npm install -g grunt-cli

After that you can install the project modules at the project root file:

    npm install

Then, to build the source, run:

    grunt build

-------------

#### Plans

- More customizations
- Softkeyboard
- Cursor
- Text Selection

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
