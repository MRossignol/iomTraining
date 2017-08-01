# iomTraining

TODO
  slider with number of clicks
  
  improve detector by considering a larger array of value (2 sec)
  half of the buffer is for statistic computation half is for detection
  peak detection by peak power over mean power and click detection.

  play start sequence
  play sound at best leg timing of run

  store data (date location weather)

The purpose of this webApp is to allow me to improve my iom skills.

Tuning of detector with two sliders for level and peak level detection
Interface :
 Start / Stop button
 Display of leg duration as bar plots (one for upwind, one for downwind)

Web audio :
  play of start sequence
  detection of tick using microphone to detect leg duration
  play of last and average leg duration (warning sound 3 bips of increasing amplitude, double beep at the end for average)

Procedure :
 user hit start button (or double click)
 launch playback of start Procedure
 147 seconds later start count
 on click reset count and store leg time

 user hit stop (or double click) store race time

Improvements :
  put the mic to sleep for a portion of the leg time
  redo a programmatic start sequence
  embed score ;)

Resources:
 speech synthesis: http://blog.teamtreehouse.com/getting-started-speech-synthesis-api
