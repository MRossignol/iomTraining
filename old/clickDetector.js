/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function createDetector(audioContext, fftSize, lobeSize) {
	fftSize = fftSize || 512;
	var processor = audioContext.createScriptProcessor(fftSize);
	processor.onaudioprocess = clickDetect;
	processor.lobeSize = lobeSize || 3;

	analyser = new AnalyserNode(audioContext);
	analyser.fftSize = fftSize;
	analyser.connect(processor);
	processor.connect(audioContext.destination);
	analyser.power = 0;
	analyser.buffer = [];
	analyser.bufferFull = [];
	analyser.clickDetected = 0;
	analyser.computingAverage = .0;
	analyser.computingAverageNumber = 0;
	analyser.sensitivity = 0;
	analyser.average = 0;
	analyser.averageFull = 0;
	analyser.averageNumber = 0;
  analyser.active = true;
	analyser.powerBuffer = [];
	analyser.powerAverage = 0;
	analyser.powerMax = 0;
	analyser.sensitivityBuffer = [];
	analyser.sensitivityAverage = 0;
	analyser.sensitivityMax = 0;

	// analyser.activeDelay = 0;
	processor.shutdown =
	function(){
		this.disconnect();
		this.onaudioprocess = null;
	};
	return analyser;
}

function clickDetect( event ) {

  // retrieve fft data
	var bufLength = analyser.frequencyBinCount;
	var array =  new Float32Array(bufLength);
	analyser.getFloatFrequencyData(array);
	var skipLength = Math.ceil(bufLength/6);
	// get energy in selected bands (mid high)
	var sum = 0;
	var sumFull = 0;
	for (var i=0; i<bufLength; i++) {
		if (i>=skipLength*2&&i<bufLength-skipLength){
			sum += Math.pow(10, array[i]/20);
		}
		sumFull += Math.pow(10, array[i]/20);
	}
	sum /= bufLength-skipLength*3;
	sumFull /= bufLength;
	// if (analyser.active == false) {
	// 	analyser.activeDelay++;
	// 	if (analyser.activeDelay>40) {
	// 		analyser.active = true;
// 		analyser.activeDelay=0;
// 	}
// }
//console.log(analyser.active+" "+analyser.activeDelay);
 // fill buffer
 analyser.buffer.push(sum);
 // maintain average value
 analyser.average += sum;
 if (analyser.buffer.length > 400) {
	 analyser.average -= analyser.buffer.shift();
 }
 analyser.bufferFull.push(sumFull);
 // maintain average value
 analyser.averageFull += sumFull;
 if (analyser.bufferFull.length > 400) {
 	analyser.averageFull -= analyser.bufferFull.shift();
 }

	if (analyser.buffer.length == 400) {
		analyser.sensitivity = 2*analyser.buffer[this.lobeSize+200]/(analyser.buffer[200]+analyser.buffer[this.lobeSize*3+200]);

		analyser.power =  analyser.buffer[200]/(analyser.averageFull/400);

		analyser.powerBuffer.push(analyser.power)
		analyser.sensitivityBuffer.push(analyser.sensitivity);
		analyser.powerAverage += analyser.power;
		analyser.sensitivityAverage += analyser.sensitivity;
		if (analyser.powerBuffer.length > 100) {
			analyser.powerAverage -= analyser.powerBuffer.shift();
			analyser.sensitivityAverage -= analyser.sensitivityBuffer.shift();
		}
		analyser.powerMax = Math.max.apply(null, analyser.powerBuffer);
		analyser.sensitivityMax = Math.max.apply(null, analyser.sensitivityBuffer);

		//console.log(analyser.peakValue+ " "+analyser.power+ " "+analyser.average/400);
		//console.log(analyser.powerThreshold+" "+analyser.sensitivityThreshold);
		if (analyser.power>analyser.powerThreshold && analyser.sensitivity>analyser.sensitivityThreshold) {
			analyser.clickDetected=1;
			// analyser.active = false;
			// console.log(analyser.clickDetected);
		}
	}
}

// function computePower( event ) {
//
// 	//var array = event.inputBuffer.getChannelData(0);
// 	//var bufLength = array.length;
//
// 	var bufLength = analyser.frequencyBinCount;
// 	var array =  new Float32Array(bufLength);
// 	analyser.getFloatFrequencyData(array);
// 	var skipLength = Math.ceil(bufLength/6);
//
// 	var sum = 0;
// 	// Do a root-mean-square on the samples: sum up the squares...
// 	for (var i=skipLength*2; i<bufLength-skipLength; i++) {
// 		sum += Math.pow(10, array[i]/20);
// 	}
// 	sum /= bufLength-skipLength*3;
//
// 	analyser.computingAverage += sum;
// 	analyser.computingAverageNumber += 1;
//
// 	if (analyser.averageNumber == 0 && analyser.computingAverageNumber == 100) {
// 			analyser.average = analyser.computingAverage/analyser.computingAverageNumber ;
// 			analyser.averageNumber == 1;
// 	}
// 	if (analyser.computingAverageNumber == 100000) {
// 			analyser.average = analyser.computingAverage/analyser.computingAverageNumber ;
// 			analyser.computingAverage = .0;
// 			analyser.computingAverageNumber = 0;
// 	}
//
// 	if (analyser.buffer.length == this.lobeSize*3) {
// 		analyser.power = analyser.buffer[this.lobeSize]*(analyser.buffer[this.lobeSize]/(analyser.buffer[0]+analyser.buffer[this.lobeSize*3-1]));
// 		analyser.buffer.shift();
// 	}
// 	analyser.buffer.push(sum);
// //	console.log(analyser.power+" "+analyser.average+" "+analyser.sensitivity);
// 	analyser.power /= analyser.average;
// 	if (analyser.power>analyser.sensitivity) {
// 		analyser.clickDetected=1;
// 	}
// }
