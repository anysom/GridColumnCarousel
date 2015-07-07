;(function(root, _) {
  'use strict';
  
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
  function GCCarousel(options) {
    //Variables from options
    var
      elem =                        options.elem || null,       //The column carousel element.
      gridColClasses =              (options.gridColClasses || '').split(' '),     //The grid column classes used on the items in the carousel
      autoplay =                    options.autoplay || false,        //Dictates wether GCCarousel will loop through the pages automatically
      autoplayDelay =               options.autoplayDelay || 5000,    //Dictates the wait time between automatically changing pages.
      throttleDelay =               options.throttleDelay || 50,      //The throttle delay used by the underscore/lodash throttle method
      displayPageIndicators =       (typeof options.displayPageIndicators !== 'undefined') ? options.displayPageIndicators : true,    //display dots beneath the carousel to indicate carousel position
      pageIndicatorsContainerElem = options.pageIndicatorsContainerElem || elem.getElementsByClassName('grid-column-carousel__page-indicators')[0];   //The class of the element that should contain the carousel dots

    //private variables
    var refElem,
        colItemWidth,
        delayedSlide = null,
        slideWidth,
        currentX = 0,
        pagesCount = 0,
        currentPage = 0,
        self = this,
        listElem = elem.getElementsByClassName('grid-column-carousel__list')[0],   //The list element
        colItems = listElem.getElementsByTagName('li');     //A list of all the column items

    initialize();

    if(autoplay) {
      setAutomaticSlideChange();
    }
    //*****************Private functions*******************************************
    
    function initialize() {
      //Create 'shadow' reference element with the same grid classes as the list items.
      //This item is unaffected by the increased size of the ul, and is therefore used to measure the width of the column items from.
      refElem = document.createElement('div');
      //add all boostrap column classes to the reference element
      for(var i = 0; i < gridColClasses.length; i++) {
        refElem.classList.add(gridColClasses[i]);  
      }
      refElem.classList.add('grid-column-carousel__ref');
      elem.appendChild(refElem);
      
      initializeSize();
      
      if (displayPageIndicators) {
        initializeDots();
      }
      
      listElem.classList.add('initialized');
      
      //When the window resizes recalculate the width of the carousel
      window.addEventListener('resize', _.throttle(reinitialize, throttleDelay, {'leading': true}));
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

    function reinitialize() {
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
    
    function onIndicatorClick(e) {
      slideToPage(getIndex(e.currentTarget));
    }
    
    //*****************Public functions*******************************************
    
    //Slide the carousel. Takes arguments, 'left', 'right', 'first' and 'last'.
    //It is also possible to pass a number argument, to indicate which page to scroll to.
    this.slide = function(page) {
      //if argument is number, call slideToPage directly
      if(typeof page === 'number') {
        slideToPage(page);
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
  }

  root.GCCarousel = GCCarousel;
})(this, (typeof window._ === 'undefined' ? null : window._));