var style = document.querySelector('[data="test"]');    //In this section there are elements and colors and sizes that need to be accessed frequently and by more than one function.
var emitWavelength = 640;                               //By placing them here, they are outside of the other functions and their values also become global.
var padding = 10;                                       //The elements still need to be removed from this code so that they can be updated without editing this code but rather another text document.
var diagramMax = 100+padding;                           //Until then, the wavelengths of the element's spectra have been written out in arrays.
var red, blue, green, alpha, gradient;
var unitCycle = 0;
var unitList = [" km/s"," km/h"," mph"," light years per year"," m/s"," times Earths orbital speed"," times the speed of Parker Solar Probe"];
var unitConversion = [299792,1079251200,670616716.48,3.3334e-6,299792000,10066.89,4370.145];
var fixValue = 1;


var colorMapRed=[0],colorMapGreen=[0],colorMapBlue=[0],colorMapAlpha=[255];
var colorMapERed=[0],colorMapEGreen=[0],colorMapEBlue=[0],colorMapEAlpha=[255];
var selectedColorIndex = [0,0,0,0];
var showSpectrum = false;
var showExtinction = true;
var emitWavelength;
var plotType = 0;
var redShift = 0;
var showUnshift = true;
var spectra = [0]; 
var velocity = 0;
var selectedObject;





function init() {                                                                                           //This function sets up the canvas along with the scale and gradients for coloring.
    var mySelect = $('#elementSelect');                               //Code to automatically set the dropdown options to those found in lines.js
    $.each(elementalLines, function(val, text) {
        mySelect.append(
            $('<option></option>').val(val).html(val)
        );
    });
    var mySelect = $('#knownObjects');                               //Code to automatically set the dropdown options to those found in lines.js
    $.each(redshiftObjects, function(val, text) {
        mySelect.append(
            $('<option></option>').val(val).html(redshiftObjects[val]["name"])
        );
    });
    var canvas = document.getElementById('myCanvas');                                                       //Get the canvas to use from the id
    emitWavelength = document.getElementById('wav').value;                                                  //Get the wavelength from the id wav and make this the emission wavelength 
    if (canvas.getContext) {                                                                                //Code to use the canvas in javascript.  It is always necessary to include.
        var ctx = canvas.getContext('2d');   
    }
    ctx.canvas.width  = window.innerWidth-60;                                                               //Set the width of the canvas to be within the size of the window on refresh.
    document.getElementById("myForm").width = window.innerWidth-60;
    createColorMaps();                                                                                      //Create the arrays of color so that we can use them for drawing.
    ctx.fillStyle = 'black';                                                                                //Draw the black background
    ctx.fillRect(0, padding, canvas.width, diagramMax-padding);             
    drawScale();                                                                                            //Draw the tickmarks and numbers on the canvas
    var convertWav = (emitWavelength-380)/(750-380)*(canvas.width-2*padding)+padding;                       //Convert the wavelength entered into the input into an accurate position for the canvas scale for pixel placement
    
    setColor(convertWav);                                                                                   //Set the color of the given wavelength using the arrays populated from the previous function
    red = selectedColorIndex[0];                                                                            //The color in the previous function places each of the RGBa values into the first four indices of an array...
    green = selectedColorIndex[1];                                                                          //These lines take those indices and place them in simpler variables so they mean a little more.
    blue = selectedColorIndex[2];
    alpha = selectedColorIndex[3];
    ctx.strokeStyle = 'rgba('+red+','+green+','+blue+','+alpha+')';                                         //Set the pen stroke color to the colors we set.

    ctx.lineWidth = document.getElementById("lineWidth").value;                                             //Set the line width from the dropdown menu in the html
    ctx.beginPath();                                                                                        //draw the line.
    ctx.moveTo(convertWav,padding);
    ctx.lineTo(convertWav,diagramMax);
    ctx.stroke();
    ctx.closePath();   
}

function update(){                                                                                                                                  //This function is necessary to separate out the behavior of the inputs in the html
    redShift = parseFloat(document.getElementById('zShift').value);                                                                                 //Slider colors and redshift values are set here. 
    var color = 255-Math.round(255 * Math.abs((parseFloat(redShift)/(11))));
    if(redShift<0){style.innerHTML=".slider::-webkit-slider-thumb { background: rgb("+ color +","+ color +",255) !important;}";}
    else if(redShift>0){style.innerHTML=".slider::-webkit-slider-thumb { background: rgb(255,"+ color +","+ color +") !important;}";}
    else{style.innerHTML=".slider::-webkit-slider-thumb { background: rgb(255,255,255) !important;}";}
    if(plotType == 0){plotSample();}
    else if(plotType == 1){plotElement();}
    document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
    selectedObject = $(":selected", "#knownObjects").val();
    $("#objectReference").attr("href", redshiftObjects[selectedObject]["reference"]);
    $("#objectReference").text(selectedObject);
}

function setGradient(){
    var canvas = document.getElementById('myCanvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');   
    }
    var gradient = ctx.createLinearGradient(0, 0, canvas.width-padding , 0);            //The gradient for color selection can probably be done in other ways, but this way was 
    if(showExtinction==true){                                                           //pretty simple.
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
    else if(showExtinction==false){                                                         //This section removes the fading.  The percentages are kept at 50% for all stops.
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

function drawScale(){
    var counter = 0;
    var scale = 380;                                                                                        //The minimum value of the scale
    var font = 16;                                                                                          //font size
    var canvas = document.getElementById('myCanvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');   
    }
    ctx.font = font + 'px Arial';
    var inc = (canvas.width-2*padding)/37; 
    while (counter<=(canvas.width-padding)){                                                                //Draw tick marks
        ctx.strokeStyle = 'rgb(0,0,0)';                                                                     //they will be black at 2 pixels wide
        ctx.lineWidth = 2;                                                                                  
        ctx.beginPath();
        ctx.moveTo(counter+padding,diagramMax);
        ctx.lineTo(counter+padding,diagramMax+5);
        ctx.stroke();
        ctx.closePath();
        
        ctx.save();                                                                                         //Rotate the canvas and place the rotated numbers on the scale.
        ctx.translate(font-font/2+1, diagramMax+35);
        ctx.rotate(-Math.PI/2);                                                                             //Rotate -90 degrees.
        ctx.fillText(scale, 0, 0+counter+padding/2);
        ctx.restore();
        counter+=inc;
        scale+=10;                                                                                          //Increase by 10 nanometers each time we draw a number.
    }
}

function setColor(wav){                                                                                     //We input a variable that points to a specific index in our color maps.
    wav = Math.round(wav);                                                                                  //This variable is an actual pixel.
    if(showExtinction==true){                                                                               //We pull this pixel's color from the map to use for drawing purposes.
        selectedColorIndex[0] = colorMapRed[wav];                                                           //We store the pixel color data into a global, 4 index array.
        selectedColorIndex[1] = colorMapGreen[wav];
        selectedColorIndex[2] = colorMapBlue[wav];
        selectedColorIndex[3] = 255;                                                                        //I don't know why I include this.  If alpha is always 255, we don't need to use RGBa color schemes and only RGB.
    }
    else if(showExtinction==false){
        selectedColorIndex[0] = colorMapERed[wav];
        selectedColorIndex[1] = colorMapEGreen[wav];
        selectedColorIndex[2] = colorMapEBlue[wav];
        selectedColorIndex[3] = 255;
    }
}

function createColorMaps(){                                                                                 //This function steals a horizontal line of pixels from the canvas after the gradient has been drawn.
    var canvas = document.getElementById('myCanvas');   
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');   
    }
    
    var gradient = setGradient();
    ctx.fillStyle = gradient;                                                                               //Draw the gradient
    ctx.fillRect(0, padding, canvas.width, diagramMax-padding);

    for (var i=padding;i<canvas.width-padding-1;i++){                                                       //Look at every pixel and push the values of RED, GREEN, BLUE and ALPHA to their own unique arrays.
        var imgData = ctx.getImageData(i,50,i+1,51);                                                        //Each index of the new arrays corresponds to the color values at each pixel.
        colorMapRed.push(imgData.data[0]);                                                                  //Since these arrays are now independent of the canvas, the canvas can be redrawn whenever we like.
        colorMapGreen.push(imgData.data[1]);
        colorMapBlue.push(imgData.data[2]);
        colorMapAlpha.push(imgData.data[3]);
    }

    showExtinction = !showExtinction;                                                                       //This variable is global so that we can cycle through showing fading or not.  We manipulate it here to activate 
    var gradient = setGradient();                                                                           //the fading.
    ctx.fillStyle = gradient;                                                                       
    ctx.fillRect(0, padding, canvas.width, diagramMax-padding);

    for (var i=padding;i<canvas.width-padding-1;i++){                                                       //do it again for the gradient without fading.
        var imgData = ctx.getImageData(i,50,i+1,51);
        colorMapERed.push(imgData.data[0]);
        colorMapEGreen.push(imgData.data[1]);
        colorMapEBlue.push(imgData.data[2]);
        colorMapEAlpha.push(imgData.data[3]);
    }
    showExtinction = !showExtinction;                                                                       // set this back to normal for our initial state.
}

function plotSample(){
    var canvas = document.getElementById('myCanvas');
    showUnshift = document.getElementById('showShift').checked;                                             //Take the value from the checkbox so we can use it.
    emitWavelength = parseFloat(document.getElementById('wav').value);                                      //Turn the number in the wavelength box into a number instead of text -- we use float instead of int since the value might be a decimal.
    if(showUnshift==false){emitWavelength = emitWavelength * redShift + emitWavelength;}                    //This option allows us to shift or unshift the single spectral line according to the redshift value selected at the time.
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');   
    }
    var gradient = setGradient();                                                                           //set the gradient for drawing
    var convertWav = (emitWavelength-380)/(750-380)*(canvas.width-2*padding)+padding;                       //create the value of the pixel position for a given wavelength.
    if(showSpectrum==false){
        ctx.fillStyle = 'black';   
        ctx.fillRect(0, padding, canvas.width, diagramMax-padding);                                         //Drawing based on whether or not we decided to show the spectra in the background with black lines
        setColor(convertWav);                                                                               //or show colored lines on a black background.
        
        red = selectedColorIndex[0];
        green = selectedColorIndex[1];
        blue = selectedColorIndex[2];
        alpha = selectedColorIndex[3];
        
        ctx.strokeStyle = 'rgba('+red+','+green+','+blue+','+alpha+')';
    }
    else if(showSpectrum==true){
        ctx.fillStyle = gradient;
        ctx.fillRect(0, padding, canvas.width, diagramMax-padding);
        ctx.strokeStyle = 'rgba(0,0,0,255)';
    }    
    ctx.lineWidth = document.getElementById("lineWidth").value;                                             //draw the line.
    ctx.beginPath();
    ctx.moveTo(convertWav,padding);
    ctx.lineTo(convertWav,diagramMax);
    ctx.stroke();
    ctx.closePath();
    plotType = 0;
    //document.getElementById("rgb").innerText = redShift + "___" + emitWavelength + "_____" + emitWavelength;          //These have been commented out, but I had used these for debugging
    //document.getElementById("rgb").innerText = red + " " + green + " " + blue + " " + alpha;
}

function plotElement(){
    var canvas = document.getElementById('myCanvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');   
    }
    var elementSel = document.getElementById("elementSelect");                            //Take the html element "element" to use in this function.
    var element = elementSel.options[elementSel.selectedIndex].value;               //Set a variable equal to the value of the selected index
    showUnshift = document.getElementById('showShift').checked;                     //Check the state of shifting or not and setting it to a variable
    spectra = elementalLines[element]['spectra'];

    $("#credits").attr("href", elementalLines[element]['credits']);
    $("#credits").text(elementalLines[element]['credits']);
    
    var gradient = setGradient();                                                   
    if(showSpectrum==false){
        ctx.fillStyle = 'black';   
        ctx.fillRect(0, padding, canvas.width, diagramMax-padding);
    }
    else if(showSpectrum==true){
        ctx.fillStyle = gradient;
        ctx.fillRect(0, padding, canvas.width, diagramMax-padding);
    }   
    for(var i=0;i<=spectra.length;i++){
        emitWavelength = spectra[i]/10;                                                             //Grab each spectra of the element's list and draw it.
        if(showUnshift==false){emitWavelength = emitWavelength * redShift + emitWavelength;}        // If you are showing shifted spectra, this line will use the redshift factor
        var convertWav = (emitWavelength-380)/(750-380)*(canvas.width - 2 * padding) + padding;     // else it is bypassed and this line is unaffected.
        
        if(showSpectrum==false){
            setColor(convertWav);
            
            red = selectedColorIndex[0];
            green = selectedColorIndex[1];
            blue = selectedColorIndex[2];
            alpha = selectedColorIndex[3];
            
            ctx.strokeStyle = 'rgba('+red+','+green+','+blue+','+alpha+')';
        }
        else if(showSpectrum==true){
            ctx.strokeStyle = 'rgba(0,0,0,255)';
        }    
        ctx.lineWidth = document.getElementById("lineWidth").value;                                 //
        ctx.beginPath();
        ctx.moveTo(convertWav,padding);
        ctx.lineTo(convertWav,diagramMax);
        ctx.stroke();
        ctx.closePath();
        plotType = 1;
    }
}

function switchState(){                                     //I like using these functions.
    showSpectrum = !showSpectrum;
    update();
}

function switchGradient(){                                  //for check box
    showExtinction = !showExtinction;
    update();
}

function switchUnits(){ 
    switch(unitCycle){
            case 0:
                unitCycle = 1;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
            break;
            case 1:
                unitCycle = 2;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
            break;
            case 2:
                unitCycle = 3;
                fixValue = 10;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
            break;
            case 3:
                unitCycle = 4;
                fixValue = 1;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
            break;
            case 4:
                unitCycle = 5;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
            break;
            case 5:
                unitCycle = 6;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
            break;
            case 6:
                unitCycle = 0;
                document.getElementById("velocity").innerHTML = numberWithCommas((unitConversion[unitCycle]*redShift).toFixed(fixValue)) + unitList[unitCycle];
            break;
        }
}
    
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
    