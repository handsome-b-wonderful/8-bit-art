# 8 Bit Art

![8bit examples](8bit_examples.jpg)

#### Introduction ####
8-Bit Art generates pixelated and colorized image maps that you can construct with "small squares of sticky paper".
[3M Post-it&reg;](http://www.post-it.com/)


### Demo

A demo is located [here](https://8-bit-art-v2.s3-us-west-2.amazonaws.com/index.html).

![sample screenshot](screenshot.jpg)

### Current features

* Client-side image selection and cropping
* Pixelation using top-left pixel in group or averaging
* Color mapping using shortest distance
* Generate a supply list (number of pixels per color)
* Generate a construction pattern (per row color sequencing)

### Pixel Image Scaling 
![Different sizing examples](bike.jpg)


### Potential Future Improvements

* UI enhancements - styling, input validation, in-browser palette manipulation
* Package up output in a single file, nice print facilities
* Save/Share creations
* Add Features: preserve aspect ratio on crop/sizing, mirror image output (for window constructions)
* Enhancements: better sampling on pixelation and color mapping
* Integrate with available "sticky paper" colors and sizes


### Current Issues/Bugs

* Image caching by the browser if you select a subsequent image with the same name 
* Processing larger images takes a while; looks like the app is frozen

