//optimization: sort gen before adding to newgen in evolve?
//populations divisible by 3
//console.log(JSON.stringify(newFit));

(function() {
    var topCanvas;
    var bottomCanvas;
    var popCanvas;
    var topContext;
    var bottomContext;
    var popContext;
    var width;
    var height;
    var pop;
    var gen;
    var orig;
    var i;
    var j;
    var k;
    var mutNum;
    var debugVar=false;
    var evoTimer;
    var genNum=0;
    var genField;
    var topField;
    var avgField;
    var origData;
    var maxRadius;
    var pop;
    var circNum;
    var maxRadius;
    var mutNum;
    var speedField;
    var t0;
    var t1;
    var bestFitArr=[];
    var avgFitArr=[];
    var offset=0;
    var yAx;


    
    document.addEventListener('DOMContentLoaded', init, false);

    function init() {
        topCanvas = document.getElementById('topCanvas')
        topContext = topCanvas.getContext('2d');
        botContext = document.getElementById('bottomCanvas').getContext('2d');
        popContext = document.getElementById('popCanvas').getContext('2d');
        perfContext = document.getElementById('perfCanvas').getContext('2d');

        var popField=document.querySelector('.popField');
        var mutField=document.querySelector('.mutField');
        var circNumField=document.querySelector('.circNumField');
        var radField=document.querySelector('.radField');
        genField=document.querySelector('.genField');
        avgField=document.querySelector('.avgField');
        topField=document.querySelector('.topField');
        posField=document.querySelector('.posField');
        maxField=document.querySelector('.maxField');
        speedField=document.querySelector('.speedField');

        base_image = new Image();
        base_image.src = 'lisabw.png';
        base_image.onload = function(){
            topContext.drawImage(base_image, 0, 0);
        }

       

        width = topCanvas.width;
        height = topCanvas.height;
        perfWidth=perfCanvas.width;
        perfHeight=perfCanvas.height;
        yAx = perfHeight/40000;  



        var startBut=document.querySelector('.startBut');
        startBut.addEventListener('click', startFun);
        var resetBut=document.querySelector('.resetBut');
        resetBut.addEventListener('click', resetFun);

        function startFun(){
            pop=Number(popField.value);
            circNum=Number(circNumField.value);
            maxRadius=Number(radField.value);
            [gen,orig]=firstGen(pop,circNum);
            genNum=1;
            fitnessCalc(gen)
            var speedVal=Number(speedField.value);
            mutNum=Number(mutField.value);
            evoTimer = window.setInterval(function () {       
                gen=evolve(gen,orig,mutNum)}, speedVal);    
        }


        function resetFun(){
            bestFitArr=[];
            avgFitArr=[];
            genNum=0;
            clearInterval(evoTimer);     
            botContext.clearRect(0,0,width,height);

        }



    }

    
    function firstGen(pop,squareNum) {

        var imgData;
        var popVals=[];


        orig=[];
        gen=[];

        imgData = topContext.getImageData(0,0,width,height);
        origData = imgData.data;

        for(var i=0; i<origData.length; i+=4) {
                orig.push(origData[i]);
        }

        
        for (var indiv=0;indiv<pop;indiv++){
            [popVals,coords]=popValsCalc(gen,orig,circNum,0);
            gen=assembleGen(gen,coords,popVals,orig,circNum);
        }

        return [gen,orig];
        
    }

    function popValsCalc(gen,orig,circNum,genId){
        popContext.fillStyle = "black";
        popContext.clearRect(0,0,width,height);
        var coords=[];
        for (i=0;i<circNum;i++){
            if(genId===0){
                var y = getRandomNumber(0, height);
                var x = getRandomNumber(0, width);
                var r = getRandomNumber(1, maxRadius);
            }
            else{
                var y = gen[i][0] 
                var x = gen[i][1]
                var r = gen[i][2]
            }
            coords.push([y,x,r]);
            popContext.beginPath();
            popContext.arc(x,y,r,0,2*Math.PI);
            popContext.fill();
        }
        //coords.push([y,x,r]);
        


        imgData = popContext.getImageData(0,0,width,height);
        popData = imgData.data;
        popVals=[]
        
        var testBool=false;
        var pixCount=0;
        for(var i=3; i<popData.length; i+=4) {
            popVals.push(popData[i]);
            if(popData[i]===255){
                pixCount++;
            }
        }  
        
        return [popVals,coords];
    }



    function assembleGen(newGenAss,coords,popVals,orig,circNum){
        var fitness=0;
        var maxFit=0;
        i=popVals.length;
        while (i--){
            //if ((popVals[i]===255 && orig[i]>100)||(popVals[i]===0 && orig[i]<100)){
            if(popVals[i]===255){
                maxFit+=1
                if(orig[i]<100){
                    fitness++
                }
            }
            if (popVals[i]===0 && orig[i]>100){
                fitness++
            }
        }
        var thisInd={};
        thisInd.coords=coords;
        thisInd.fitness=fitness;
        thisInd.maxFit=maxFit;
        newGenAss.push(thisInd);
        return newGenAss;
    }


    function fitnessCalc(generation){
        var avgFit=0;
        var bestFit=0;
        var bestFitInd=0;
        for (i=0;i<generation.length;i++){
            avgFit+=generation[i].fitness;
            if(generation[i].fitness>bestFit){
                bestFit=generation[i].fitness;
                bestFitInd=i;
            }
        }
        circCoords=generation[bestFitInd].coords
        botContext.clearRect(0,0,width,height);
        botContext.fillStyle='black';
        for(i=0;i<circCoords.length;i++){
            x=generation[bestFitInd].coords[i][1]
            y=generation[bestFitInd].coords[i][0]
            r=generation[bestFitInd].coords[i][2]
            botContext.beginPath();
            botContext.arc(x,y,r,0,2*Math.PI);
            botContext.fill();
        }
        avgFit=avgFit/generation.length;
        genField.textContent=('Generation:   '+String(genNum))
        avgField.textContent=('avgFitness:   '+String(avgFit));
        topField.textContent=('topFitness:   '+String(bestFit));
        bestFitArr.push(bestFit);
        avgFitArr.push(avgFit);
        var xAx = perfWidth/bestFitArr.length;
        
        if(avgFitArr.length===1){
            offset=avgFitArr[0];
            yAx=perfHeight/(40000-avgFitArr[0]);
        }

        perfContext.clearRect(0,0,perfWidth,perfHeight)
        perfContext.beginPath();
        perfContext.moveTo(0,perfHeight);
        for(var bi=0;bi<bestFitArr.length;bi++){
            perfContext.lineTo(bi*xAx,perfHeight-((bestFitArr[bi]-offset)*yAx));
        }
        perfContext.strokeStyle = '#00ff00';
        perfContext.stroke();

        perfContext.beginPath();
        perfContext.moveTo(0,perfHeight);
        for(var ai=0;ai<avgFitArr.length;ai++){
            perfContext.lineTo(ai*xAx,perfHeight-((avgFitArr[ai]-offset)*yAx));
        }
        perfContext.strokeStyle = '#ff0000';
        perfContext.stroke();



    }








    function evolve(gen,orig,mutNum){
        t0e=performance.now();
        genNum++;
        OP('Gen number')
        OP(genNum)
        var fitArr=[];
        var newFit;
        var takenFit=[];
        var repeat;
        var newGenFin=[];
        for (i=0;i<gen.length;i++){
            fitArr.push(gen[i].fitness);
        }
        fitArr.sort(function (a, b) {  return a - b;  });
        fitArr.reverse();
        newFit=fitArr.slice(0,Math.round(fitArr.length/3));
        while (newFit.length<fitArr.length/2){
            repeat=false;
            var newInd=getRandomNumber(Math.round(fitArr.length/3), 2*Math.round(fitArr.length/3)-1);
            takenInd=takenFit.length;
            var exitCon=0;                      //QUICKFIX
            while (takenInd--){
                if (takenFit[takenInd]===newInd){
                    repeat=true
                    break
                }
                exitCon++
                if (exitCon>20){
                    break;
                }
            }
            if(!repeat){
                newFit.push(fitArr[newInd]);
                takenFit.push(newInd);
            }
        }
        //at this point we have enough fitness values
        //newFit.reverse();
        var newGen=[];
        for(i=0;i<newFit.length;i++){
                for(j=0;j<gen.length;j++){
                    if (gen[j].fitness===newFit[i]){
                        newGen.push(gen[j].coords);
                        gen[j].fitness=-1;
                        break;
                    }
                }
            }

        if(newGen.length!==pop/2){
            var needed=pop/2-newGen.length; 
            for(i=0;i<needed;i++){
                newGen.push(newGen[i])
            }                        //QUICKFIX  when we're short, add in strong ones from start
        }
        newGenLength=newGen.length;

        newGenCross=[]
        t1p=performance.now();
        OP('Start -> Before crossover');
        OP((t1p-t0e)/1000);
        t0c=performance.now();
        for (i=0;i<2;i++){
            for (var iCross=0;iCross<newGenLength;iCross++){
                while (true){
                    var jCross=getRandomNumber(0, newGenLength-1);
                    if (jCross!==iCross){
                        break;
                    }
                }
                child=crossover(newGen[iCross],newGen[jCross],mutNum);
                newGenCross.push(child);
                
                
            }
        }
        newGen=newGenCross;
        t1c=performance.now();
        OP('Before Crossover -> After crossover')
        OP((t1c-t0c)/1000)

        t0f=performance.now();
        for (var indiv=0;indiv<pop;indiv++){

            [popVals,coords]=popValsCalc(newGen[indiv],orig,circNum,1);
            newGenFin=assembleGen(newGenFin,coords,popVals,orig,circNum);
        }
        t1f=performance.now();
        OP('fitness')
        OP((t1f-t0f)/1000)

        fitnessCalc(newGenFin)

        t1e=performance.now();
        OP('This gen took')
        OP(t1e-t0e)

        return newGenFin;
    }


    function crossover(p1,p2,mutNum){
        var switchVar;
        var child=[];
        for (k=0;k<p1.length;k++){
            switchVar=getRandomNumber(0, 1);
            if (switchVar===0){
                child.push(p1[k]);
            }
            else{
                child.push(p2[k]);
            }
        }
        for (k=0;k<mutNum;k++){
            child[getRandomNumber(0, child.length-1)]=[getRandomNumber(0, height),getRandomNumber(0, width),getRandomNumber(0, maxRadius)];
        }
        return child;


    }


    


    function getRandomNumber(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }

    function OP(a){
        console.log(JSON.stringify(a));

    }
    
   
    
})();