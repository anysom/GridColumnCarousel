(function(root) {
  'use strict';

  //Constructor
  function BCCarousel() {
    console.log('Constructor function og BCCarousel');
  }

  // Public functions
  BCCarousel.prototype.slide = function(direction) {
    console.log('calling slide function, ', direction);
  };


  root.BCCarousel = BCCarousel;
})(this);