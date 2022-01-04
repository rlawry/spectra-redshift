<html>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta charset="utf-8">
<link rel="stylesheet" href="main.css">
<style type="text/css" id="style"></style>
<script src="lines.js"></script>
<!--This set of scripts is equivalent to including libraries.-->
<script src="redshiftObjects.js"></script>
<script>//These are the global variables - they can be accessed by all other functions in this website.

    var style = document.querySelector('[data="test"]');    //In this section there are elements and colors and sizes that need to be accessed frequently and by more than one function.
    var emitWavelength = 640;                               //By placing them here, they are outside of the other functions and their values also become global.
    var padding = 10;                                       //The elements still need to be removed from this code so that they can be updated without editing this code but rather another text document.
    var diagramMax = 90 + padding;                           //Until then, the wavelengths of the element's spectra have been written out in arrays.
    var alpha, gradient;
    var unitCycle = 0;
    var unitList = [" km/s", " km/h", " mph", " light years per year", " m/s", " times Earths orbital speed", " times the speed of Parker Solar Probe"];
    var unitConversion = [299792, 1079251200, 670616716.48, 3.3334e-6, 299792000, 10066.89, 4370.145];
    var fixValue = 1;

    var red, green, blue;
    var hue, saturation, lightness;
    var colorMapHue = [0], colorMapSat = [0], colorMapLight = [0];
    var colorMapEHue = [0], colorMapESat = [0], colorMapELight = [0];
    var selectedColorIndex = [0, 0, 0];                                     //[0] hue [1] sat [2] light
    var showSpectrum = false;
    var showExtinction = true;
    var emitWavelength;
    var plotType = 0;
    var redShift = 0;
    var showUnshift = true;
    var spectra = [0];
    var velocity = 0;
    var selectedObject;
    var running = false;
    var canvas, ctx;

    function setGradient() {

        var gradient = ctx.createLinearGradient(0, 0, canvas.width - padding, 0);            //The gradient for color selection can probably be done in other ways, but this way was 
        if (showExtinction == true) {                                                           //pretty simple.
            gradient.addColorStop("0", "hsl(270,100%,0%)");         //Black                   The whole canvas, from one edge to the other, is represented by 0 to 1.  Along the way
            gradient.addColorStop("0.15", "hsl(265,100%,50%)");     //Purple                    we set stops to change the color.  Color for the gradient is using hsl color mapping
            gradient.addColorStop("0.16", "hsl(260,100%,50%)");                               //which is a color wheel that rotates 360 degrees through all of the colors of the rainbow
            gradient.addColorStop("0.175", "hsl(240,100%,50%)");     //Blue                     I determined the locations of these stops by comparing the classroom spectroscope to the canvas width scale.
            gradient.addColorStop("0.20", "hsl(230,100%,50%)");
            gradient.addColorStop("0.28", "hsl(190,100%,50%)");     //cyan
            gradient.addColorStop("0.38", "hsl(125,100%,50%)");     //green
            gradient.addColorStop("0.50", "hsl(60,100%,50%)");      //yellow
            gradient.addColorStop("0.58", "hsl(30,100%,50%)");      //orange
            gradient.addColorStop("0.67", "hsl(0,100%,50%)");       //red
            gradient.addColorStop("0.75", "hsl(0,100%,25%)");       //Fade
            gradient.addColorStop("0.9", "hsl(0,100%,5%)");
            gradient.addColorStop("1.0", "hsl(0,100%,0%)");

            // for(var i=0;i<=1;i+=0.1){
            //     gradient.addColorStop(i, "hsl("+Math.round(270-i*270)+",100%,50%)");
            // }
        }
        else if (showExtinction == false) {                                                         //This section removes the fading.  The percentages are kept at 50% for all stops.
            gradient.addColorStop("0", "hsl(270,100%,50%)");         //Black
            gradient.addColorStop("0.15", "hsl(265,100%,50%)");     //Purple
            gradient.addColorStop("0.16", "hsl(260,100%,50%)");
            gradient.addColorStop("0.175", "hsl(240,100%,50%)");     //Blue
            gradient.addColorStop("0.20", "hsl(230,100%,50%)");
            gradient.addColorStop("0.28", "hsl(190,100%,50%)");     //cyan
            gradient.addColorStop("0.38", "hsl(125,100%,50%)");     //green
            gradient.addColorStop("0.50", "hsl(60,100%,50%)");      //yellow
            gradient.addColorStop("0.58", "hsl(30,100%,50%)");      //orange
            gradient.addColorStop("0.67", "hsl(0,100%,50%)");       //red
            gradient.addColorStop("0.75", "hsl(0,100%,50%)");       //Fade
            gradient.addColorStop("0.9", "hsl(0,100%,50%)");
            gradient.addColorStop("1.0", "hsl(0,100%,50%)");
        }
        return gradient;                                                                         //This is now the gradient object that can be continually used.
    }

    function init() {                                                                                           //This function sets up the canvas along with the scale and gradients for coloring.
        canvas = document.getElementById('myCanvas');
        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = "source-atop";
            ctx.globalAlpha = 1;
        }
        var mySelect = $('#elementSelect');                               //Code to automatically set the dropdown options to those found in lines.js
        $.each(elementalLines, function (val, text) {
            mySelect.append(
                $('<option></option>').val(val).html(val)
            );
        });
        //draw();                                                           Part of non-functioning redshift simulation on galaxy image
        var mySelect = $('#knownObjects');                               //Code to automatically set the dropdown options to those found in lines.js
        $.each(redshiftObjects, function (val, text) {
            mySelect.append(
                $('<option></option>').val(val).html(redshiftObjects[val]["name"])
            );
        });

        //Get the canvas to use from the id
        emitWavelength = document.getElementById('wav').value;                                                  //Get the wavelength from the id wav and make this the emission wavelength 

        ctx.canvas.width = window.innerWidth;                                                                   //Set the width of the canvas to be within the size of the window on refresh.
        document.getElementById("myForm").width = window.innerWidth - 100;
        createColorMaps();                                                                                      //Create the arrays of color so that we can use them for drawing.
        ctx.fillStyle = 'black';                                                                                //Draw the black background
        ctx.fillRect(0, padding, canvas.width, diagramMax - padding);
        drawScale();                                                                                            //Draw the tickmarks and numbers on the canvas
        var convertWav = (emitWavelength - 380) / (750 - 380) * (canvas.width - 2 * padding) + padding;         //Convert the wavelength entered into the input into an accurate position for the canvas scale for pixel placement

        setColor(convertWav);                                                                                   //Set the color of the given wavelength using the arrays populated from the previous function
        hue = selectedColorIndex[0];                                                                            //The color in the previous function places each of the RGBa values into the first four indices of an array...
        saturation = selectedColorIndex[1];                                                                     //These lines take those indices and place them in simpler variables so they mean a little more.
        lightness = selectedColorIndex[2];
        ctx.strokeStyle = 'hsl(' + hue + ',' + saturation + '%,' + lightness + '%)';                            //Set the pen stroke color to the colors we set.

        ctx.lineWidth = document.getElementById("lineWidth").value;                                             //Set the line width from the dropdown menu in the html
        ctx.beginPath();                                                                                        //draw the line.
        ctx.moveTo(convertWav, padding);
        ctx.lineTo(convertWav, diagramMax);
        ctx.stroke();
        ctx.closePath();
        document.getElementById("zDisplay").innerHTML = redShift.toFixed(3);
    }

    function drawScale() {
        var counter = 0;
        var counterMinor = 9;
        var long = 8;
        var short = 3;
        var five = 6;
        var scale = 380;                                                                                            //The minimum value of the scale
        var font = 20;
        var textShift = 45;                                                                                         //Offset from the scale that the numbers will display

        ctx.font = font + 'px Arial';
        var inc = (canvas.width - 2 * padding) / 37;
        if (canvas.width > 1000) {
            for (var i = 1; i < counter + padding - 7; i++) {
                ctx.strokeStyle = 'rgb(200,200,200)';                                                                //they will be black at 2 pixels wide
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(i * (inc / 10) - 2, diagramMax);
                ctx.lineTo(i * (inc / 10) - 2, diagramMax + short);
                ctx.stroke();
                ctx.closePath();
            }
        }
        for (var counter = 0; counter <= (canvas.width - padding); counter += inc) {                                  //Draw tick marks
            ctx.strokeStyle = 'rgb(200,200,200)';                                                                     //they will be black at 2 pixels wide
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(counter + padding, diagramMax);
            ctx.lineTo(counter + padding, diagramMax + long);
            ctx.stroke();
            ctx.closePath();

            ctx.save();                                                                                               //Rotate the canvas and place the rotated numbers on the scale.
            ctx.translate(font - font / 2 + 2, diagramMax + textShift);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "white";                                                                                  //Rotate -90 degrees.
            ctx.fillText(scale, 0, 0 + counter + padding / 2);
            ctx.restore();

            for (var minor = 1; minor <= counterMinor; minor++) {
                ctx.strokeStyle = 'rgb(200,200,200)';                                                                 //they will be black at 2 pixels wide
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(counter + padding + minor * (inc / 10), diagramMax);
                if (minor == 5) { ctx.lineTo(counter + padding + minor * (inc / 10), diagramMax + five); }
                else if (canvas.width > 1000) {
                    ctx.lineTo(counter + padding + minor * (inc / 10), diagramMax + short);
                }
                ctx.stroke();
                ctx.closePath();
            }
            scale += 10;
        }

    }                                                                                                 //Increase by 10 nanometers each time we draw a number.

    function setColor(wav) {                                                                                     //We input a variable that points to a specific index in our color maps.
        wav = Math.round(wav);                                                                                  //This variable is an actual pixel.
        if (showExtinction == true) {                                                                               //We pull this pixel's color from the map to use for drawing purposes.
            selectedColorIndex[0] = colorMapHue[wav];                                                           //We store the pixel color data into a global, 4 index array.
            selectedColorIndex[1] = colorMapSat[wav];
            selectedColorIndex[2] = colorMapLight[wav];                                                                        //I don't know why I include this.  If alpha is always 255, we don't need to use RGBa color schemes and only RGB.
        }
        else if (showExtinction == false) {
            selectedColorIndex[0] = colorMapEHue[wav];
            selectedColorIndex[1] = colorMapESat[wav];
            selectedColorIndex[2] = colorMapELight[wav];
        }
        if(wav == 1426){
            console.log("---this is the 1426 line---");
        }
    }

    function createColorMaps() {                                                                                 //This function steals a horizontal line of pixels from the canvas after the gradient has been drawn.

        var gradient = setGradient();
        ctx.fillStyle = gradient;                                                                               //Draw the gradient
        ctx.fillRect(0, padding, canvas.width, diagramMax - padding);

        for (var i = padding; i < canvas.width - padding - 1; i++) {                                                       //Look at every pixel and push the values of RED, GREEN, BLUE and ALPHA to their own unique arrays.
            var imgData = ctx.getImageData(i, 50, i + 1, 51);                                                        //Each index of the new arrays corresponds to the color values at each pixel.
            red = imgData.data[0];
            green = imgData.data[1];
            blue = imgData.data[2];

            var hsl = rgb2Hsl(red,green,blue);

            colorMapHue.push(hsl[0]);                                                                  //Since these arrays are now independent of the canvas, the canvas can be redrawn whenever we like.
            colorMapSat.push(hsl[1]);
            colorMapLight.push(hsl[2]);
        }

        showExtinction = !showExtinction;                                                                       //This variable is global so that we can cycle through showing fading or not.  We manipulate it here to activate 
        var gradient = setGradient();                                                                           //the fading.
        ctx.fillStyle = gradient;
        ctx.fillRect(0, padding, canvas.width, diagramMax - padding);

        for (var i = padding; i < canvas.width - padding - 1; i++) {                                                       //do it again for the gradient without fading.
            var imgData = ctx.getImageData(i, 50, i + 1, 51);
            red = imgData.data[0];
            green = imgData.data[1];
            blue = imgData.data[2];

            var hsl2 = rgb2Hsl(red,green,blue);
            colorMapEHue.push(hsl2[0]);
            colorMapESat.push(hsl2[1]);
            colorMapELight.push(hsl2[2]);
        }
        //console.log(colorMapHue);
        showExtinction = !showExtinction;                                                                       // set this back to normal for our initial state.
    }

    function rgb2Hsl(red, green, blue) {
        red   /= 255;
        green /= 255;
        blue  /= 255;

        var max = Math.max(red, green, blue);
        var min = Math.min(red, green, blue);
        var hue;
        var saturation;
        var lightness = (max + min) / 2;

        if (max == min) {
            hue = saturation = 0; // achromatic
        } else {
            var delta = max - min;
            saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
            switch (max) {
                case red:
                    hue = (green - blue) / delta + (green < blue ? 6 : 0);
                    break;
                case green:
                    hue = (blue - red) / delta + 2;
                    break;
                case blue:
                    hue = (red - green) / delta + 4;
                    break;
            }
            hue /= 6;
        }
        return [(hue * 360), (saturation * 100), (lightness * 100)];
    }

    function plotSample() {

        showUnshift = document.getElementById('showShift').checked;                                             //Take the value from the checkbox so we can use it.
        emitWavelength = parseFloat(document.getElementById('wav').value);                                      //Turn the number in the wavelength box into a number instead of text -- we use float instead of int since the value might be a decimal.
        if (showUnshift == false) { emitWavelength = emitWavelength * redShift + emitWavelength; }                    //This option allows us to shift or unshift the single spectral line according to the redshift value selected at the time.

        var gradient = setGradient();                                                                           //set the gradient for drawing
        var convertWav = (emitWavelength - 380) / (750 - 380) * (canvas.width - 2 * padding) + padding;                       //create the value of the pixel position for a given wavelength.
        if (showSpectrum == false) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, padding, canvas.width, diagramMax - padding);                                         //Drawing based on whether or not we decided to show the spectra in the background with black lines
            setColor(convertWav);                                                                               //or show colored lines on a black background.

            hue = selectedColorIndex[0];                                                                            //The color in the previous function places each of the RGBa values into the first four indices of an array...
            saturation = selectedColorIndex[1];                                                                          //These lines take those indices and place them in simpler variables so they mean a little more.
            lightness = selectedColorIndex[2];
            //console.log(hue+" hue " + saturation + " saturation " + lightness + " lightness");
            ctx.strokeStyle = 'hsl(' + hue + ',' + saturation + '%,' + lightness + '%)';
            //console.log(ctx.strokeStyle);
        }
        else if (showSpectrum == true) {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, padding, canvas.width, diagramMax - padding);
            ctx.strokeStyle = 'rgb(0,0,0)';
        }
        drawLine(convertWav);
        plotType = 0;
    }

    var alpha = 0;
    var currentIntensity, effectiveIntensity;
    var boost = 200;
    var positionTracker = new Array();
    positionTracker = [0];
    var positionBuffer = 0;
    var lineCount = 0;


    function plotElement() {
        //console.log("-----------------new element plotted--------------------");
        positionTracker.splice(0, positionTracker.length)
        var elementSel = document.getElementById("elementSelect");                            //Take the html element "element" to use in this function.
        var element = elementSel.options[elementSel.selectedIndex].value;               //Set a variable equal to the value of the selected index
        showUnshift = document.getElementById('showShift').checked;                     //Check the state of shifting or not and setting it to a variable
        spectra = elementalLines[element]['spectra'];
        var intensityDecimal;
        var brightnessAdd;
        var intensity = new Array();
        intensity = elementalLines[element]['intensity'];                           //create an array of the intensities for the element
        var maxIntensity = 0;
        for(var i = 0; i<intensity.length;i++){
            if(intensity[i]>maxIntensity){maxIntensity = intensity[i];}
        }

        $("#credits").attr("href", elementalLines[element]['credits']);
        $("#credits").text(elementalLines[element]['credits']);

        var gradient = setGradient();                                               //set the gradient maps so you can choose the correct color
        if (showSpectrum == false) {
            ctx.fillStyle = 'black';                                                                //fill the rectangles with the correct base colors
            ctx.fillRect(0, padding, canvas.width, diagramMax - padding);
        }
        else if (showSpectrum == true) {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, padding, canvas.width, diagramMax - padding);
        }
        for (var i = 0; i <= spectra.length; i++) {                                 //go through the element's spectral lines one by one
            emitWavelength = spectra[i] / 10;
            //console.log("+++Line " + i + " has a wavelength of " + emitWavelength + "nm+++");
            
            if(intensity === undefined || intensity.length==0){currentIntensity = 1000;}
            else{ currentIntensity = parseInt(intensity[i]);}
            if(currentIntensity<boost){
                if((currentIntensity+boost)>1000){effectiveIntensity = 1000;}
                else if((currentIntensity+boost)<=1000 && currentIntensity>0){effectiveIntensity = currentIntensity+boost;}
                else if(currentIntensity == 0){effectiveIntensity = 0;}
            }
            else{effectiveIntensity=currentIntensity;}
            
            intensityDecimal = effectiveIntensity/maxIntensity;          

            if (showUnshift == false) { emitWavelength = emitWavelength * redShift + emitWavelength; }          // If you are showing shifted spectra, this line will use the redshift factor
            var convertWav = (emitWavelength - 380) / (750 - 380) * (canvas.width - 2 * padding) + padding;     // else it is bypassed and this line is unaffected.
            var roundedConvert = Math.round(convertWav);
            setColor(convertWav);
            hue = selectedColorIndex[0];                                                                            //The color in the previous function places each of the RGBa values into the first four indices of an array...
            saturation = selectedColorIndex[1];                                                                          //These lines take those indices and place them in simpler variables so they mean a little more.
            var baseLightness = selectedColorIndex[2];
            
            if(elementSel !="Sodium"){
                if((baseLightness+brightnessAdd)*intensityDecimal<70){brightnessAdd = 40;}
                else{brightnessAdd = 0;}
            }
            else if(elementSel == "Sodium"){brightnessAdd = 0;}

            if (showSpectrum == false) {
                ctx.strokeStyle = 'hsl(' + hue + ',' + saturation + '%,' + ((baseLightness+brightnessAdd)*intensityDecimal) + '%)';
            }
            else if (showSpectrum == true) {
                console.log((baseLightness - (baseLightness+10)*intensityDecimal) + " baseLightness - (baseLightness+10)*intensityDecimal and i " + i)
                if((baseLightness - (baseLightness+10)*intensityDecimal) <0){
                    ctx.strokeStyle = 'hsl(' + hue + ',' + saturation + '%,' + 0 + '%)';
                }
                else{
                    ctx.strokeStyle = 'hsl(' + hue + ',' + saturation + '%,' + (baseLightness-(baseLightness+10)*intensityDecimal) + '%)';
                    console.log("hsl(" + hue + ", " + saturation + ", "+ (baseLightness-(baseLightness+10)*intensityDecimal) + "%");
                    console.log("hue: " + hue);
                    console.log("saturation: " + saturation);
                    console.log("lightness: " + baseLightness);
                    
                }
            }
            let included = positionTracker.includes(roundedConvert);
            //if(included===false){
                if(convertWav>0){
                    if(typeof convertWav !== "undefined"){
                        if(isNaN(intensityDecimal)==false){
                            //console.log("current hue is " + hue + " for line # " + i);
                            drawLine(convertWav);
                            lineCount++;
                        }
                    }
                }
            //}
            plotType = 1;
            positionTracker[positionTracker.length] = Math.round(convertWav);
        }
        //console.log(lineCount + " total line count");
        lineCount = 0;
    }

    function drawLine(position) {
        positionBuffer = document.getElementById("lineWidth").value;
        ctx.lineWidth = positionBuffer;                                //

            ctx.beginPath();
            ctx.moveTo(position, padding);
            ctx.lineTo(position, diagramMax);
            ctx.stroke();
            ctx.closePath();
    }

    function update() {                                                                                                                                  //This function is necessary to separate out the behavior of the inputs in the html
        redShift = parseFloat(document.getElementById('zShift').value);                                                                                 //Slider colors and redshift values are set here. 
        var color = Math.round(255 * Math.abs((parseFloat(redShift) / (11))));

        if (redShift < 0) { document.getElementById('shiftSlider').style.background = "rgb(0,0," + color + ") !important;}"; }
        else if (redShift > 0) {document.getElementById('shiftSlider').style.background = "rgb(" + color + ",0,0) !important;}"; }
        else { document.getElementById('shiftSlider').style.background = "rgb(0,0,0) !important;}"; }

        if (plotType == 0) { plotSample(); }
        else if (plotType == 1) { plotElement(); }

        if (redShift != 0) { document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle]; }
        else { document.getElementById("velocity").innerHTML = "Stationary"; }
        selectedObject = $(":selected", "#knownObjects").val();
        $("#objectReference").attr("href", redshiftObjects[selectedObject]["reference"]);
        $("#objectReference").text(selectedObject);

        document.getElementById("zDisplay").innerHTML = redShift.toFixed(3);
    }

    function updateThings(){
        update();
        drawScale();
    }

    function switchState() {                                    
        showSpectrum = !showSpectrum;
        update();
    }
    function switchGradient() {                                 
        showExtinction = !showExtinction;
        update();
    }

    function switchUnits() {

        switch (unitCycle) {
            case 0:
                unitCycle = 1;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle];
                break;
            case 1:
                unitCycle = 2;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle];
                break;
            case 2:
                unitCycle = 3;
                fixValue = 10;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle];
                break;
            case 3:
                unitCycle = 4;
                fixValue = 1;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle];
                break;
            case 4:
                unitCycle = 5;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle];
                break;
            case 5:
                unitCycle = 6;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle];
                break;
            case 6:
                unitCycle = 0;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle] * redShift).toFixed(fixValue)) + unitList[unitCycle];
                break;
        }
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

   
</script>
<title>Spectra & Redshift Demonstration</title>

<body onload="init();">
    <div class="title">
    <h2 style="text-align: center;">Elemental Spectra and Redshift Demonstration</h2>
    <h4 style="text-align: center;">[λf = c]</h4>
    </div>
    <center><canvas id="myCanvas" width="1500" height="150" style="border:1px solid #000000;">
            Your browser does not support the HTML5 canvas tag.
        </canvas>
        <form id="myForm">
            <left>
                
                <div style="text-align: center;" id="scaleTitle">Wavelength (nanometers)</div>
                <div><input type=update value="Plot Element" onclick="plotElement()">
                    <select id="elementSelect" oninput="plotElement()">...Select...</select>
                    <input type="checkbox" name="showSpectra" value="isChecked" onclick="switchState()"> Show absorption
                    spectra&nbsp;&nbsp;<input type="checkbox" name="showExtinction" value="isChecked"
                        onclick="switchGradient()" checked> Show extinction
                    &nbsp;|&nbsp;
                    <select id="lineWidth" oninput="update()">
                        <option value="1">1px</option>
                        <option value="2">2px</option>
                        <option value="3" selected>3px</option>
                        <option value="4">4px</option>
                    </select>
                    Line Width
                </div>
                <div><input type=update value="Plot Wavelength" onclick="plotSample()">&nbsp<input type=text value="520"
                        id="wav"></div>
            </left>
            <div class="slidecontainer">
                <p style="text-align: center;">Red Shift (z = <span id="zDisplay" )></span>) :: <span>Velocity of Light
                        Source Relative to You:&nbsp;&nbsp;<span id="velocity"
                            data-tip="Click to change units.">Stationary</span><span id="units"></span></span></p>

                <input type="range" min="-11000" max="11000" value="0" class="slider" id="shiftSlider"><span
                    data-tip="Type your own redshift here."><input type=text value="0.000" id="zShift"></span>
                <span>&nbsp;&nbsp;<input type="button" name="zero" value="Zero out Redshift" onclick="zeroOut()"
                        style="position: relative;">&nbsp;&nbsp;|</span>
                <span>&nbsp;&nbsp;<select id="knownObjects" style="width: 200px;">...Select Object...</select>
                    Galaxy with Known Redshift</span>
                <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span><input type="checkbox" id="showShift" onclick="update()">
                <span>Show Unshifted</span>
                <script>
                    var slideShift = document.getElementById('shiftSlider');
                    var z = document.getElementById('zShift');

                    slideShift.oninput = function () {
                        z.value = this.value / 1000;
                        redShift = z.value;

                        update();
                    }
                    z.oninput = function () {
                        if (this.value >= 11) {
                            slideShift.value = 11000;
                            this.value = 11;
                        }
                        else if (this.value <= -11) {
                            slideShift.value = -11000;
                            this.value = -11;
                        }
                        else { slideShift.value = this.value * 1000; }
                        redShift = this.value;
                        if (redShift < 0) { document.getElementById('shiftSlider').style.background = "rgb(2,2,255) !important;}"; }
                        else if (redShift > 0) { document.getElementById('shiftSlider').style.background = "rgb(255,2,2) !important;}"; }
                        update();
                    }
                    var units = document.getElementById("velocity");
                    units.onclick = function () {
                        switchUnits();
                    }
                    function zeroOut() {
                        slideShift.value = 0;
                        zShift.value = 0;

                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, padding, canvas.width, diagramMax - padding);
                        document.getElementById('shiftSlider').style.background = "rgb(0,0,0) !important;}";
                        document.getElementById("knownObjects").selectedIndex = 0;
                        update();
                    }
                    knownObjects.oninput = function () {
                        var selectedObject = document.getElementById("knownObjects");
                        var selectedObjectValue = selectedObject.options[selectedObject.selectedIndex].value;
                        selectedObjectValue = redshiftObjects[selectedObjectValue]["redshift"];
                        slideShift.value = selectedObjectValue * 1000;
                        zShift.value = selectedObjectValue;

                        update();
                    }
                    document.getElementById("wav").addEventListener("wheel", function (event) {
                        event.preventDefault();
                        if (event.deltaY < 0) {
                            this.value = parseInt(this.value) + 1;
                            update();
                        }
                        else if (event.deltaY > 0) {
                            this.value = parseInt(this.value) - 1;
                            update();
                        }
                    });
                    document.getElementById("zShift").addEventListener("wheel", function (event) {
                        event.preventDefault();
                        if (event.deltaY < 0) {
                            this.value = (parseFloat(this.value) + 0.001).toFixed(3);
                            slideShift.value = this.value * 1000;
                            update();
                        }
                        else if (event.deltaY > 0) {
                            this.value = (parseFloat(this.value) - 0.001).toFixed(3);
                            slideShift.value = this.value * 1000;
                            update();
                        }
                    });
                </script>
            </div>
            <!--<div><input type="update" value="Update M101 Image" onclick="draw()">
            </div>-->
            <div></div>
            <div></div>
            <div style="font-size: 12px;">Spectral Lines Source: <a href="https://www.nist.gov/"
                    id="credits">https://www.nist.gov/</a></div>
            <div style="font-size: 12px;">Redshift Object Info: <a href="https://stellarium-web.org/"
                    id="objectReference">Stellarium</a></div>
            <div style="font-size: 12px;">Velocities are determined using Flat-Time Relativistic Doppler w/o Lorentz
            </div>
            <!--<div style="background-color: #000000;">Simulated Selected Redshift on M101, The Pinwheel Galaxy</div>
            <img src="m101.png" style="width:600px;height:auto;position:relative;display:none;" id="galaxy">                This is a temporary place for a redshift simulation on pixel data for a galaxy
            <canvas id="simulation" width="600" height="469"></canvas>-->
        </form>

    </center>
    <script>
    //var simulationC = document.getElementById("simulation");
    //var ctxSimulation = simulationC.getContext("2d");                                 Part of the non-functioning redshift simulation
    //var imgKey, imgMessage, imgEncoded, imgDecoded, width, height;

    function handleImage(evt) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                c.width = img.width;
                c.height = img.height;
                resizeImage();
                ctx.drawImage(img, 0, 0, c.width, c.height);
                if (imageType.value == "message") {
                    imgEncoded = ctx.getImageData(0, 0, c.width, c.height);
                    alert("Message Image Loaded");
                    document.getElementById("messageId").innerHTML = "LOADED";
                    document.getElementById("messageId").style = "color: green;";
                } else {
                    imgKey = ctx.getImageData(0, 0, c.width, c.height);
                    alert("Key Image Loaded");
                    document.getElementById("keyId").innerHTML = "LOADED";
                    document.getElementById("keyId").style = "color: green;";
                }
                document.getElementById('theImagePanel').style = "height: " + c.height + ";";
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(evt.target.files[0]);
    }

    function draw() {
        var img = document.getElementById("galaxy");
        ctxSimulation.drawImage(img, 0, 0, simulationC.width, simulationC.height);
        imgKey = ctxSimulation.getImageData(0, 0, simulationC.width, simulationC.height);
    }

    function encodeImage() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, c.width, c.height);
        imgMessage = ctx.getImageData(0, 0, c.width, c.height);
        var text = document.getElementById("secretMessage").value;
        ctx.fillStyle = "black";
        ctx.font = "26px Georgia";
        ctx.fillText(text, 10, 100);
        imgMessage = ctx.getImageData(0, 0, c.width, c.height);
        for (var i = 0; i < imgKey.data.length; i += 4) {
            if (imgMessage.data[i] < 100) {
                imgEncoded.data[i] = 1 + imgEncoded.data[i];
                imgEncoded.data[i + 1] = 1 + imgEncoded.data[i + 1];
                imgEncoded.data[i + 2] = 1 + imgEncoded.data[i + 2];
                imgEncoded.data[i + 3] = 255;
            }
        }
        alert("Message Encoded");
        ctx.putImageData(imgEncoded, 0, 0);
        imgEncoded = ctx.getImageData(0, 0, c.width, c.height);
    }

    function decodeImage() {
        if (document.getElementById("decode").checked == true) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, c.width, c.height);
            imgDecoded = ctx.getImageData(0, 0, c.width, c.height);
            for (var i = 0; i < imgKey.data.length; i += 4) {
                if (imgKey.data[i] != imgEncoded.data[i]) {
                    imgDecoded.data[i] = 0;
                    imgDecoded.data[i + 1] = 0;
                    imgDecoded.data[i + 2] = 0;
                    imgDecoded.data[i + 3] = 255;
                }
            }
            ctx.putImageData(imgDecoded, 0, 0);
        } else if (document.getElementById("decode").checked == false) {
            ctx.putImageData(imgKey, 0, 0);
        }
    }
</script>
</body>

</html>