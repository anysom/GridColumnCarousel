; (function (root, gridColumnCarousel) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register fadePager as an anonymous module
        define(gridColumnCarousel);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = gridColumnCarousel();
    } else {
        // Browser globals. Register fadePager on window
        root.GCCarousel = gridColumnCarousel();
    }
})(this, function() {
  'use strict';
  var _ = window._;
  /*if underscore or lodash is not defined. Create fallback object with simple throttle method*/
  if(!_) {
    _ = {
      throttle: function(func, wait) {
        var timer = null;

        return function() {
          var context = this,
              args = arguments;

          if(timer === null) {
            timer = setTimeout(function() {
              func.apply(context, args);
              timer = null;
            }, wait);
          }
        };
      },
    };
  }

  //Constructor
  return function GCCarousel(options) {
    //Variables from options
    var
      elem =                        options.elem || null,       //The column carousel element.
      //gridColClasses =              (options.gridColClasses || '').split(' '),     //The grid column classes used on the items in the carousel
      autoplay =                    options.autoplay || false,        //Dictates wether GCCarousel will loop through the pages automatically
      autoplayDelay =               options.autoplayDelay || 5000,    //Dictates the wait time between automatically changing pages.
      throttleDelay =               options.throttleDelay || 50,      //The throttle delay used by the underscore/lodash throttle method
      displayPageIndicators =       (typeof options.displayPageIndicators !== 'undefined') ? options.displayPageIndicators : true,    //display dots beneath the carousel to indicate carousel position
      pageIndicatorsContainerElem = options.pageIndicatorsContainerElem || elem.getElementsByClassName('grid-column-carousel__page-indicators')[0],   //The class of the element that should contain the carousel dots
      refElem = options.referenceElement || elem.querySelector('grid-column-carousel__ref');

    //private variables
    var colItemWidth,
        delayedSlide = null,
        slideWidth,
        currentX = 0,
        pagesCount = 0,
        currentPage = 0,
        self = this,
        ManualResizeIntervalID,
        listElem = elem.querySelector('.grid-column-carousel__list'),   //The list element
        colItems; //A list of all the column items

    initialize();

    //*****************Private functions*******************************************

    function initialize() {
      colItems = listElem.querySelectorAll('.gcc-cell:not([data-gcc-ignore])');

/*
      //Create 'shadow' reference element with the same grid classes as the list items.
      //This item is unaffected by the increased size of the ul, and is therefore used to measure the width of the column items from.
      refElem = document.createElement('div');
      //add all boostrap column classes to the reference element
      for(var i = 0; i < gridColClasses.length; i++) {
        refElem.classList.add(gridColClasses[i]);
      }
        refElem.classList.add('grid-column-carousel__ref');

        var gridRef = document.createElement('div');
        gridRef.classList.add('grid-x');
        gridRef.classList.add('grid-margin-x');
        gridRef.appendChild(refElem);

        elem.appendChild(gridRef);*/

        if (!refElem) {
          console.warn('Missing reference element - Grid Column Carousel!');
          return;
        }

      initializeSize();

      if (displayPageIndicators) {
        initializeDots();
      }

      listElem.classList.add('initialized');


      var windowWidth = window.innerWidth;
      //When the window resizes recalculate the width of the carousel
      window.addEventListener('resize', _.throttle(function () {
        var newWidth = window.innerWidth;
        // only resize if the width actually changes. Sometimes mobile devices throw the resize event without a horizontal resize;
        if (newWidth !== windowWidth) {
          windowWidth = newWidth;
          recalculateSize();
        }
      }, throttleDelay, {'leading': true}));

      //start automatic slideing if set
      if(autoplay) {
        setAutomaticSlideChange();
      }
    }


    function reinitialize() {
      //Reset state
      self.slide('first');
      refElem.remove();
      clearInterval(ManualResizeIntervalID);

      //if autoplay is set, start automatic slide change. This will cancel any previously
      //set waiting slide change.
      if(autoplay) {
        setAutomaticSlideChange();
      }

      initialize();
    }

    //Gets the size of the reference element and sets it as the size of the col items
    function initializeSize() {
      colItemWidth = refElem.getBoundingClientRect().width;

      //set the width on all the col items
      for(var i = 0; i < colItems.length; i++) {
        colItems[i].style.width = colItemWidth+'px';
      }

      //Get the width of a slide
      slideWidth = elem.getBoundingClientRect().width + 20; // the 20 is to compensate for the margin

      //Calculate how many pages are necessary
      pagesCount = Math.ceil(colItems.length / (slideWidth / colItemWidth));
    }

    //gets the index of an li
    function getIndex(node) {
      var childs = node.parentNode.childNodes;
      for (var i = 0; i < childs.length; i++) {
        if (node === childs[i]) break;
      }
      return i;
    }

    //Creates the 'navigation dots'. Calculates how many items are visible pr slide,
    //and then how many navigation dots are necessary and injects them.
    function initializeDots() {
      //remove all items from the list add add a new list of items
      while (pageIndicatorsContainerElem.firstChild) {
          pageIndicatorsContainerElem.firstChild.removeEventListener('click', onIndicatorClick);
          pageIndicatorsContainerElem.removeChild(pageIndicatorsContainerElem.firstChild);
      }
      for (var i = 0; i < pagesCount; i++) {
        var indicator = document.createElement('li');
        indicator.classList.add('grid-column-carousel__page-indicator');
        if(i === 0) {
          indicator.classList.add('active');
        }
        indicator.addEventListener('click', onIndicatorClick);
        pageIndicatorsContainerElem.appendChild(indicator);
      }
    }

    function recalculateSize() {
      initializeSize();
      if(displayPageIndicators) {
        initializeDots();
      }
      //to keep it simple i will reset the carousel to initial position
      self.slide('first');
    }

    function setAutomaticSlideChange() {
      if(delayedSlide) {
        clearTimeout(delayedSlide);
      }

      delayedSlide = setTimeout(function() {
        self.slide('next');
        delayedSlide = null;
      }, autoplayDelay);
    }

    function setX(x) {
      currentX = x;
      listElem.style.WebkitTransform = 'translateX('+x+'px)';
      listElem.style.msTransform = 'translateX('+x+'px)';
      listElem.style.transform = 'translateX('+x+'px)';
    }

    //slides to a specific page in the carousel, indicated by a number.
    //first page i index 0, and the nth page is index n-1.
    function slideToPage(pageNumber) {
      //ensure that pageNumber is not out of bounds
      if(pageNumber < 0) {
        pageNumber = pagesCount - 1;
      } else if(pageNumber >= pagesCount) {
        pageNumber = 0;
      }

      //toggle active class on page indicators
      if(displayPageIndicators) {
        pageIndicatorsContainerElem.getElementsByClassName('active')[0].classList.remove('active');
        pageIndicatorsContainerElem.getElementsByClassName('grid-column-carousel__page-indicator')[pageNumber].classList.add('active');
      }

      currentPage = pageNumber;

      //if autoplay is set, start automatic slide change. This will cancel any previously
      //set waiting slide change.
      if(autoplay) {
        setAutomaticSlideChange();
      }

      //if slide to the first page, just set translateX to 0.
      if(pageNumber === 0) {
        setX(0);
      } else {
        setX(pageNumber * slideWidth * -1);
      }
    }

    //will slide to the page that currently displays the element indicated by the index
    function slideToElementIndex(index) {
        //find out which page the element is presented on.
        var itemsPrSlide = slideWidth / colItemWidth;
        var pageIndex = Math.floor(index / itemsPrSlide);
        slideToPage(pageIndex);
    }

    function onIndicatorClick(e) {
      slideToPage(getIndex(e.currentTarget));
    }

    //*****************Public functions*******************************************

    //Slide the carousel. Takes arguments, 'left', 'right', 'first' and 'last'.
    //It is also possible to pass a number argument, to indicate which page to scroll to.
    this.slide = function(page) {
      //if argument is number, call slideToPage directly
      if(typeof page === 'number') {
        slideToElementIndex(page);
        return;
      }

      switch (page) {
        case 'first':
          slideToPage(0);
          break;
        case 'last':
          slideToPage(pagesCount - 1);
          break;
        case 'next':
          slideToPage(currentPage + 1);
          break;
        case 'prev':
          slideToPage(currentPage - 1);
          break;
        default:
          slideToPage(0);
          break;
      }
    };


    //This method is used to manually to trigger a periodic resizing of the carousel.
    //The same resizing that happens when a window 'resize' event occurs.
    //This method should be used when the container the carousel lives in changes size based on something else than window resize.
    this.startWatchManualResize = function(duration) {
      ManualResizeIntervalID = setInterval(recalculateSize, throttleDelay);

      if (duration && typeof duration == 'number') {
        setTimeout(function() {
          clearInterval(ManualResizeIntervalID);
        }, duration);
      }
    };

    //Ends the periodic resizing from 'startWatchResize'
    this.endWatchManualResize = function() {
      clearInterval(ManualResizeIntervalID);
    };

    //a single call to the recalculateSize function.
    //This will make sure that the size of pages and columns are recalculated.
    this.recalculateSize = recalculateSize;

    //This will reinstantiate the entire carousel. Remove old state and find
    //list items and calculating item sizes.
    this.reinitialize = reinitialize;
  };
});
