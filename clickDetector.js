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

  analyzer = new AnalyserNode(audioContext);
	analyzer.fftSize = fftSize;
	analyzer.connect(processor);
	processor.connect(audioContext.destination);
	analyzer.power = 0;
  analyzer.buffer = [];
	analyzer.clickDetected = 0;
	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};
	return analyzer;
}

function computePower( event ) {

	//var array = event.inputBuffer.getChannelData(0);
	//var bufLength = array.length;

	  var bufLength = analyzer.frequencyBinCount;
	 var array =  new Float32Array(bufLength);
	  analyzer.getFloatFrequencyData(array);
  	var skipLength = Math.ceil(bufLength/6);

    var sum = 0;
    // Do a root-mean-square on the samples: sum up the squares...
    for (var i=skipLength*2; i<bufLength-skipLength; i++) {
    	sum += Math.pow(10, array[i]/20);
    }
		sum /= bufLength-skipLength*3;

    // ... then take the square root of the sum.
    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
//		console.log(bufLength+' '+skipLength+' '+sum);


		if (analyzer.buffer.length == this.lobeSize*3) {
			  analyzer.power = analyzer.buffer[this.lobeSize]*(analyzer.buffer[this.lobeSize]/(analyzer.buffer[0]+analyzer.buffer[this.lobeSize*3-1]));
			analyzer.buffer.shift();
		}
	  analyzer.buffer.push(sum);
analyzer.power *=10000;
 if (analyzer.power >.5) {
	 analyzer.clickDetected=1;
 }

}
