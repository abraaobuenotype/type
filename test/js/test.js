window.onload = function() {
    var fontLibrary = [{
        name: 'arcena',
        url: 'fonts/arcena.ttf'
    }, {
        name: 'playtime',
        url: 'fonts/playtime-webfont.ttf'
    }, {
        name: 'maria',
        url: 'fonts/maria_lucia.ttf'
    }, {
        name: 'century',
        url: 'fonts/century.ttf'
    }, {
        name: 'escolar',
        url: 'fonts/escolar8.ttf'
    }];

    var loader = new type.Loader();
    loader.add('playtime', 'fonts/playtime-webfont.ttf');
    loader.add('escolar', 'fonts/escolar8.ttf');
    loader.add('century', 'fonts/century.ttf');
    loader.once('loadComplete', init);
    loader.load();

    var Metrics = type.Metrics;

    function init() {
        var renderer = PIXI.autoDetectRenderer(1024, 500, {
            transparent: true
        });
        document.body.appendChild(renderer.view);
        var dom = renderer.view;
        dom.style.border = "1px solid red";

        var stage = new PIXI.Container();

        // var txField = new type.text.Input(800, 400);
    //     var txField = new type.text.Input(800, 400);
    //
    //     txField.addEvents();
    //
    //     var typeAlign = new type.text.TypeAlign();
    //     typeAlign.startingX = 50;
    //     typeAlign.startingY = 250;
    //     typeAlign.steps = [{
    //         "x": 20,
    //         "y": 70,
    //         "rotation": 90
    //     }, {
    //         "x": 15,
    //         "y": -20
    //     }, {
    //         "x": 15,
    //         "y": +20,
    //         "rotation": 45
    //     }, {
    //         "x": 15,
    //         "y": -70
    //     },
    //     {
    //         "x": 20,
    //         "y": -70,
    //         "rotation": 45
    //     }, {
    //         "x": 15,
    //         "y": +20
    //     }, {
    //         "x": 15,
    //         "y": -20
    //     }, {
    //         "x": 15,
    //         "y": +70
    //     }];
    //
    //     txField.typeAlign = typeAlign;
    //
    //
    //     txField.x += 50;
    //     txField.y += 50;
    //     txField.spaceBetweenLines = 20;
    //     //txField.spaceBetweenWords = -1;
    //     txField.align = "justify";
    //     txField.textLeftToRight = true;
    //     txField.textTopToBottom = true;
    //     txField.alignHorizontalPriority = true;
    //
    //     txField.customAlign = false;
    //
    //     txField.showCursor();
    //
    //     txField.setText("Nada d");
    //
    //
    //     var txField2 = new type.text.Input(800, 400);
    //
    //     txField2.addEvents();
    //
    //
    //     txField2.x += 50;
    //     txField2.y += 150;
    //     txField2.spaceBetweenLines = 20;
    //     //txField.spaceBetweenWords = -1;
    //     txField2.align = "center";
    //     txField2.textLeftToRight = true;
    //     txField2.textTopToBottom = true;
    //     txField2.alignHorizontalPriority = true;
    //
    //     txField2.customAlign = false;
    //
    //     txField2.showCursor();
    //
    //     txField2.setText("Nada d");
    //
    //     setInterval(function(){
    //         txField.setText("Nada 2d");
    //     }, 300);
    //     //
    //
    //
    //
    //
    //     //txField.setText("Nada do que é social e humano é mais real que as utopias. Na sua vertente eutópica, as utopias constituíram sempre o fundamento simbólico e mítico sem o qual nenhuma forma o fundamento simbólico e mítico sem o qual nenhuma forma de organização social se sustenta, justifica ou sobrevive. E criam, tanto na vertente eutópica como na distópica, o vocabulário da revolução e da mudança: sem os amanhãs que cantam (ou choram) teríamos, em vez de História, um presente intemporal e eterno - como o dos faraós ou o de Fran\n tres");
    //     // txField.setText("<a>é um animal mais indepedente.</a>", {
    //     //     "a": {
    //     //         fill: "blue"
    //     //     }
    //     // });
    //     // txField.setText("é um animal<a> mais indepedente.</a>", {
    //     //     "a": {
    //     //         fill: "red"
    //     //     }
    //     // });
    //
    //
    //     //txField.setText("WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");
    //
    //
    //
    //     // txField.setStyle({
    //     //     "stroke": "rgba(0,0,0,0)",
    //     //     "fill": "#00bb00"
    //     // });
    //     //
    //     txField.setWordStyle("ais inde", {
    //         "stroke": "rgba(0,0,0,0)",
    //         "fontSize": "30px"
    //     });
    //
    //
        // stage.addChild(txField);
        // stage.addChild(txField2);
        // var palavra = "VATbraão Bueno da Silva";
        // var palavra2 = "Abraão"
        //
        // var teste = new PIXI.Text(palavra, {fontFamily: "century", fontSize: 50});
        // teste.y = 150;
        // stage.addChild(teste);
        //
        // var familis = ['playtime','playtime','playtime','century','playtime','playtime'];
        // var sizes = [30,30,30,30,100,30]
        //
        // var _metrics2 = Metrics.getMetrics(palavra2, familis, sizes);
        // console.log(_metrics2);
        //
        // var word = [];
        //
        // for(var i = 0; i < palavra2.length; i++){
        //     var c = new type.text.Char(palavra2[i], {
        //         fontSize: sizes[i],
        //         fontFamily: familis[i]
        //     });
        //
        //     c.x = Math.round(_metrics2[i].x);
        //     c.y = Math.round(_metrics2[i].y);
        //
        //     if(i > 0){
        //         word[i - 1].vwidth = c.x - word[i - 1].x;
        //     }
        //
        //     if(i == palavra.length - 1){
        //         c.vwidth = "last";
        //     }
        //
        //     word.push(c);
        //     stage.addChild(c);
        // }

        var texto = new type.text.TextField(600, 800);
        texto.setText('<a>Nada do que é social e humano é mais real que as utopias. Na sua vertente eutópica, as utopias constituíram sempre o fundamento simbólico e mítico sem o qual nenhuma forma o fundamento simbólico e mítico sem o qual nenhuma forma de organização social se sustenta, justifica ou sobrevive. E criam, tanto na vertente eutópica como na distópica, o vocabulário da revolução e da mudança: sem os amanhãs que cantam (ou choram) teríamos, em vez de História, um presente intemporal e eterno - como o dos faraós ou o de Fran\n tres</a>', {
            align: 'left',
            leftToRight: false,
            topToBottom: false,
            horizontalPriority: true,
            spaceBetweenLines: 0,
            spaceBetweenWords: -1,
            a: {
                fontFamily: "century",
                fontSize: 50
            }
        });

        stage.addChild(texto);

        var s = new PIXI.Graphics;
        s.lineStyle(1, 0x00ff59);
        s.drawRect(0, 0, 600, 800);
        s.endFill();

        stage.addChild(s);


        //
        // var c = new type.text.TextField(400, 500);
        // c.setText("<a>ApasdtlaTdf<a/>", {a: {fontSize: 100, fontFamily: "Arial"}});
        // g = new PIXI.Graphics();
        // g.lineStyle(3, 0xFF0000, 0.8);
        // g.drawRect(txField.x, txField.y, 800, 400);
        // g.endFill();
        // stage.addChild(g);

        // stage.addChild(c);


        animate();

        function animate() {
            requestAnimationFrame(animate);

            renderer.render(stage);
        }
    }
}
