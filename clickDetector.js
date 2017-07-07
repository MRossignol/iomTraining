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
	fftSize = fftSize || 256;
	var processor = audioContext.createScriptProcessor(fftSize);
	processor.onaudioprocess = computePower;
	processor.lobeSize = lobeSize || 3;

	analyser = new AnalyserNode(audioContext);
	analyser.fftSize = fftSize;
	analyser.connect(processor);
	processor.connect(audioContext.destination);
	analyser.power = 0;
	analyser.buffer = [];
	analyser.clickDetected = 0;
	analyser.computingAverage = .0;
	analyser.computingAverageNumber = 0;
	analyser.sensitivity = 1;
	analyser.average = 1.0;
	analyser.averageNumber = 0;
	processor.shutdown =
	function(){
		this.disconnect();
		this.onaudioprocess = null;
	};
	return analyser;
}

function computePower( event ) {

	//var array = event.inputBuffer.getChannelData(0);
	//var bufLength = array.length;

	var bufLength = analyser.frequencyBinCount;
	var array =  new Float32Array(bufLength);
	analyser.getFloatFrequencyData(array);
	var skipLength = Math.ceil(bufLength/6);

	var sum = 0;
	// Do a root-mean-square on the samples: sum up the squares...
	for (var i=skipLength*2; i<bufLength-skipLength; i++) {
		sum += Math.pow(10, array[i]/20);
	}
	sum /= bufLength-skipLength*3;

	analyser.computingAverage += sum;
	analyser.computingAverageNumber += 1;

	if (analyser.averageNumber == 0 && analyser.computingAverageNumber == 1000) {
			analyser.average = analyser.computingAverage/analyser.computingAverageNumber ;
			analyser.averageNumber == 1;
	}
	if (analyser.computingAverageNumber == 100000) {
			analyser.average = analyser.computingAverage/analyser.computingAverageNumber ;
			analyser.computingAverage = .0;
			analyser.computingAverageNumber = 0;
	}

	if (analyser.buffer.length == this.lobeSize*3) {
		analyser.power = analyser.buffer[this.lobeSize]*(analyser.buffer[this.lobeSize]/(analyser.buffer[0]+analyser.buffer[this.lobeSize*3-1]));
		analyser.buffer.shift();
	}
	analyser.buffer.push(sum);
//	console.log(analyser.power+" "+analyser.average+" "+analyser.sensitivity);
	analyser.power /= analyser.average;
	if (analyser.power>analyser.sensitivity) {
		analyser.clickDetected=1;
	}
}
