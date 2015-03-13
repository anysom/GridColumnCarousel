(function(root) {
  'use strict';

  //Constructor
  function BCCarousel(options) {
    //Variables from options
    var
      elem =                  options.elem || null,       //The column slider element.
      bootstrapColClasses =   (options.bootstrapColClasses || 'col-md-6').split(' '),     //The bootstrap column classes used on the items in the sliders
      listElem =              options.listElem || elem.getElementsByTagName('ul')[0],   //The list element
      colItems =              options.colItems || listElem.getElementsByTagName('li'),     //A list of all the column items
      throttleDelay =         options.throttleDelay || 50;      //The throttle delay used by the underscore/lodash throttle method

    //private variables
    var refElem,
        colItemWidth,
        slideWidth;

    //Wait for the window to finish loading before initialization executes
    window.onload = function() {
      //Create 'shadow' reference element with the same bootstrap classes as the list items.
      //This item is unaffected by the increased size of the ul, and is therefore used to measure the width of the column items from.
      refElem = document.createElement('div');
      //add all boostrap column classes to the reference element
      for(var i = 0; i < bootstrapColClasses.length; i++) {
        refElem.classList.add(bootstrapColClasses[i]);  
      }      
      elem.appendChild(refElem);

      initialize();
    };


    //When the window resizes recalculate the width of the carousel
    if(_) {
      window.on('resize', _.throttle(reinitialize, 50, {'leading': true}));
    } else {
      window.on('resize', reinitialize);
    }

    //Private functions
    function initialize() {
      initializeSize();
      initializeDots();
    }

    //Gets the size of the reference element and sets it as the size of the col items
    function initializeSize() {
      colItemWidth = refElem.getBoundingClientRect().width;

      //set the width on all the col items
      for(var i = 0; i < colItems.length; i++) {
        colItems[i].style.width = colItemWidth+'px';
      }

      //Get the width of a slide
      slideWidth = elem.getBoundingClientRect().width;
    }

    function initializeDots() {
      
    }

    function reinitialize() {
      console.log('reinitialize the carousel');
    }

    //Public functions
    this.slide = function(direction) {
      console.log('slide the carousel in direction:', direction);
    }
  }

  // Initializes the size of the columns in the slider to prevent them from scaling up
  // when the width of the list is set to '9999px'.
  function initializeColumnSize() {
    console.log('indicatorSelector');
  }

  root.BCCarousel = BCCarousel;
})(this);