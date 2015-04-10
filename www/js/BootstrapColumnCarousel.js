(function(root, _) {
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
      }
    };
  }

  //Constructor
  function BCCarousel(options) {
    //Variables from options
    var
      elem =                  options.elem || null,       //The column slider element.
      bootstrapColClasses =   (options.bootstrapColClasses || 'col-md-6').split(' '),     //The bootstrap column classes used on the items in the sliders
      listElem =              options.listElem || elem.getElementsByClassName('bootstrap-column-slider__list')[0],   //The list element
      colItems =              options.colItems || listElem.getElementsByTagName('li'),     //A list of all the column items
      throttleDelay =         options.throttleDelay || 50,      //The throttle delay used by the underscore/lodash throttle method
      displayPageIndicators =     options.displayPageIndicators || true,    //display dots beneath the slider to indicate slider position
      pageIndicatorsContainerElem =   options.pageIndicatorsContainerElem || elem.getElementsByClassName('bootstrap-column-slider__page-indicators')[0];   //The class of the element that should contain the slider dots

    //private variables
    var refElem,
        colItemWidth,
        slideWidth,
        currentX = 0,
        self = this;

    initialize();  

    //*****************Private functions*******************************************
    
    function initialize() {
      //Create 'shadow' reference element with the same bootstrap classes as the list items.
      //This item is unaffected by the increased size of the ul, and is therefore used to measure the width of the column items from.
      refElem = document.createElement('div');
      //add all boostrap column classes to the reference element
      for(var i = 0; i < bootstrapColClasses.length; i++) {
        refElem.classList.add(bootstrapColClasses[i]);  
      }
      refElem.classList.add('bootstrap-column-carousel__ref');
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
    }
    
    function onIndicatorClick() {
      //remove active class from old active element, and add to the clicked item
      pageIndicatorsContainerElem.getElementsByClassName('active')[0].classList.remove('active');
      this.classList.add('active');
      self.slideToPage(getIndex(this));
    }
    
    //gets the index of an li
    function getIndex(node) {
      var childs = node.parentNode.childNodes;
      for (var i = 0; i < childs.length; i++) {
        if (node == childs[i]) break;
      }
      return i;
    }

    //Creates the 'navigation dots'. Calculates how many items are visible pr slide,
    //and then how many navigation dots are necessary and injects them.
    function initializeDots() {
      //Calculate how many pages are necessary
      var pagesCount = colItems.length / (slideWidth / colItemWidth);
      //remove all items from the list add add a new list of items
      while (pageIndicatorsContainerElem.firstChild) {
          pageIndicatorsContainerElem.firstChild.removeEventListener('click', onIndicatorClick);
          pageIndicatorsContainerElem.removeChild(pageIndicatorsContainerElem.firstChild);
      }
      for (var i = 0; i < pagesCount; i++) {
        var indicator = document.createElement('li');
        indicator.classList.add('indicator');
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
      //to keep it simple i will reset the slider to initial position
      self.slide('first');
    }
    
    function getTranslateValue() {
      var value = listElem.style.transform;
      
      if(value === "") {
        return 0;
      }
      
      return value.split('(')[1].split('p')[0];
    }
    
    function setX(x) {
      currentX = x;
      listElem.style.transform = 'translateX('+x+'px)';
    }
    
    //*****************Public functions*******************************************
    
    //Slide the carousel. Takes arguments, 'left', 'right', 'first' and 'last'.
    this.slide = function(direction) {
      console.log('slide the carousel in direction:', direction);

      switch (direction) {
        case 'first':
          setX(0);
          break;
        case 'last':
          setX(0);
          break;
        case 'next':
          setX(currentX -slideWidth);          
          break;
        case 'prev':
          setX(currentX +slideWidth);
          break;
        default:
          setX(0);
          break;
      }
    };
    
    //slides to a specific page in the slider, indicated by and number.
    //first page i index 0, and the nth page is index n.
    this.slideToPage = function(pageNumber) {
      //if slide to the first page, just set translateX to 0.
      if(pageNumber === 0) {
        setX(0);
        return;
      }
      setX(pageNumber * slideWidth * -1);
    };
  }

  root.BCCarousel = BCCarousel;
})(this, (typeof _ === 'undefined' ? null : _));