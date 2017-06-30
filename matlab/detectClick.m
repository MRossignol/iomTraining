fileName = '../sounds/clickExamplesSpeech.wav';

c = dlmread('../sounds/click.txt', '%t');
c = c(:, 1);

[a, fs] = audioread(fileName);

frameSize = 128;
A = abs(spectrogram(a, frameSize));

%% detector
ind = mean(log10(A(40:end-20, :)));

lobeSize = 3;

for k=lobeSize+1:length(ind)-lobeSize*2-1
d(k) = ind(k)*2-ind(k-lobeSize)-ind(k+lobeSize*2);
end
    

subplot(311)
imagesc((log10(A)))
subplot(312)
clf
plot(ind, 'linewidth', 2, 'marker', 'x')
hold on
plot(-abs(d), 'linewidth', 2, 'marker', 'd')
hold on
plot(ind(1:length(d)).*d, 'linewidth', 2, 'marker', 's')
stem(c*fs/frameSize*2, ones(1, length(c)))