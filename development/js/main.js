// Global BEG
function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
      )
    );
  }
  
  document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-expanded', 'false');
  
    if(summary.nextElementSibling.getAttribute('id')) {
      summary.setAttribute('aria-controls', summary.nextElementSibling.id);
    }
  
    summary.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });
  
    if (summary.closest('header-drawer')) return;
    summary.parentElement.addEventListener('keyup', onKeyUpEscape);
  });
  
  const trapFocusHandlers = {};
  
  function trapFocus(container, elementToFocus = container) {
    var elements = getFocusableElements(container);
    var first = elements[0];
    var last = elements[elements.length - 1];
  
    removeTrapFocus();
  
    trapFocusHandlers.focusin = (event) => {
      if (
        event.target !== container &&
        event.target !== last &&
        event.target !== first
      )
        return;
  
      document.addEventListener('keydown', trapFocusHandlers.keydown);
    };
  
    trapFocusHandlers.focusout = function() {
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    };
  
    trapFocusHandlers.keydown = function(event) {
      if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
      // On the last focusable element and tab forward, focus the first element.
      if (event.target === last && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }
  
      //  On the first focusable element and tab backward, focus the last element.
      if (
        (event.target === container || event.target === first) &&
        event.shiftKey
      ) {
        event.preventDefault();
        last.focus();
      }
    };
  
    document.addEventListener('focusout', trapFocusHandlers.focusout);
    document.addEventListener('focusin', trapFocusHandlers.focusin);
  
    elementToFocus.focus();
  }
  
  // Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
  try {
    document.querySelector(":focus-visible");
  } catch(e) {
    focusVisiblePolyfill();
  }
  
  function focusVisiblePolyfill() {
    const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
    let currentFocusedElement = null;
    let mouseClick = null;
  
    window.addEventListener('keydown', (event) => {
      if(navKeys.includes(event.code.toUpperCase())) {
        mouseClick = false;
      }
    });
  
    window.addEventListener('mousedown', (event) => {
      mouseClick = true;
    });
  
    window.addEventListener('focus', () => {
      if (currentFocusedElement) currentFocusedElement.classList.remove('focused');
  
      if (mouseClick) return;
  
      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add('focused');
  
    }, true);
  }
  
  function pauseAllMedia() {
    document.querySelectorAll('.js-youtube').forEach((video) => {
      video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    });
    document.querySelectorAll('.js-vimeo').forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    document.querySelectorAll('video').forEach((video) => video.pause());
    document.querySelectorAll('product-model').forEach((model) => {
      if (model.modelViewerUI) model.modelViewerUI.pause();
    });
  }
  
  function removeTrapFocus(elementToFocus = null) {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  
    if (elementToFocus) elementToFocus.focus();
  }
  
  function onKeyUpEscape(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;
  
    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;
  
    const summaryElement = openDetailsElement.querySelector('summary');
    openDetailsElement.removeAttribute('open');
    summaryElement.setAttribute('aria-expanded', false);
    summaryElement.focus();
  }
  
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input');
      this.changeEvent = new Event('change', { bubbles: true })
  
      this.querySelectorAll('button').forEach(
        (button) => button.addEventListener('click', this.onButtonClick.bind(this))
      );
    }
  
    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;
  
      event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
      if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
    }
  }
  
  customElements.define('quantity-input', QuantityInput);
  
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  
  function fetchConfig(type = 'json') {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
    };
  }
  
  /*
   * Shopify Common JS
   *
   */
  if ((typeof window.Shopify) == 'undefined') {
    window.Shopify = {};
  }
  
  Shopify.bind = function(fn, scope) {
    return function() {
      return fn.apply(scope, arguments);
    }
  };
  
  Shopify.setSelectorByValue = function(selector, value) {
    for (var i = 0, count = selector.options.length; i < count; i++) {
      var option = selector.options[i];
      if (value == option.value || value == option.innerHTML) {
        selector.selectedIndex = i;
        return i;
      }
    }
  };
  
  Shopify.addListener = function(target, eventName, callback) {
    target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
  };
  
  Shopify.postLink = function(path, options) {
    options = options || {};
    var method = options['method'] || 'post';
    var params = options['parameters'] || {};
  
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
  
    for(var key in params) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", params[key]);
      form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };
  
  Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
    this.countryEl         = document.getElementById(country_domid);
    this.provinceEl        = document.getElementById(province_domid);
    this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);
  
    Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));
  
    this.initCountry();
    this.initProvince();
  };
  
  Shopify.CountryProvinceSelector.prototype = {
    initCountry: function() {
      var value = this.countryEl.getAttribute('data-default');
      Shopify.setSelectorByValue(this.countryEl, value);
      this.countryHandler();
    },
  
    initProvince: function() {
      var value = this.provinceEl.getAttribute('data-default');
      if (value && this.provinceEl.options.length > 0) {
        Shopify.setSelectorByValue(this.provinceEl, value);
      }
    },
  
    countryHandler: function(e) {
      var opt       = this.countryEl.options[this.countryEl.selectedIndex];
      var raw       = opt.getAttribute('data-provinces');
      var provinces = JSON.parse(raw);
  
      this.clearOptions(this.provinceEl);
      if (provinces && provinces.length == 0) {
        this.provinceContainer.style.display = 'none';
      } else {
        for (var i = 0; i < provinces.length; i++) {
          var opt = document.createElement('option');
          opt.value = provinces[i][0];
          opt.innerHTML = provinces[i][1];
          this.provinceEl.appendChild(opt);
        }
  
        this.provinceContainer.style.display = "";
      }
    },
  
    clearOptions: function(selector) {
      while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
      }
    },
  
    setOptions: function(selector, values) {
      for (var i = 0, count = values.length; i < values.length; i++) {
        var opt = document.createElement('option');
        opt.value = values[i];
        opt.innerHTML = values[i];
        selector.appendChild(opt);
      }
    }
  };
  
  class MenuDrawer extends HTMLElement {
    constructor() {
      super();
  
      this.mainDetailsToggle = this.querySelector('details');
  
      if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  
      this.addEventListener('keyup', this.onKeyUp.bind(this));
      this.addEventListener('focusout', this.onFocusOut.bind(this));
      this.bindEvents();
    }
  
    bindEvents() {
      this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
      this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
    }
  
    onKeyUp(event) {
      if(event.code.toUpperCase() !== 'ESCAPE') return;
  
      const openDetailsElement = event.target.closest('details[open]');
      if(!openDetailsElement) return;
  
      openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
    }
  
    onSummaryClick(event) {
      const summaryElement = event.currentTarget;
      const detailsElement = summaryElement.parentNode;
      const isOpen = detailsElement.hasAttribute('open');
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  
      function addTrapFocus() {
        trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
        summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
      }
  
      if (detailsElement === this.mainDetailsToggle) {
        if(isOpen) event.preventDefault();
        isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
      } else {
        setTimeout(() => {
          detailsElement.classList.add('menu-opening');
          summaryElement.setAttribute('aria-expanded', true);
          !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
        }, 100);
      }
    }
  
    openMenuDrawer(summaryElement) {
      setTimeout(() => {
        this.mainDetailsToggle.classList.add('menu-opening');
      });
      summaryElement.setAttribute('aria-expanded', true);
      trapFocus(this.mainDetailsToggle, summaryElement);
      document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
    }
  
    closeMenuDrawer(event, elementToFocus = false) {
      if (event === undefined) return;
  
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  
    onFocusOut(event) {
      setTimeout(() => {
        if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
      });
    }
  
    onCloseButtonClick(event) {
      const detailsElement = event.currentTarget.closest('details');
      this.closeSubmenu(detailsElement);
    }
  
    closeSubmenu(detailsElement) {
      detailsElement.classList.remove('menu-opening');
      detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
      removeTrapFocus(detailsElement.querySelector('summary'));
      this.closeAnimation(detailsElement);
    }
  
    closeAnimation(detailsElement) {
      let animationStart;
  
      const handleAnimation = (time) => {
        if (animationStart === undefined) {
          animationStart = time;
        }
  
        const elapsedTime = time - animationStart;
  
        if (elapsedTime < 400) {
          window.requestAnimationFrame(handleAnimation);
        } else {
          detailsElement.removeAttribute('open');
          if (detailsElement.closest('details[open]')) {
            trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
          }
        }
      }
  
      window.requestAnimationFrame(handleAnimation);
    }
  }
  
  customElements.define('menu-drawer', MenuDrawer);
  
  class HeaderDrawer extends MenuDrawer {
    constructor() {
      super();
    }
  
    openMenuDrawer(summaryElement) {
      this.header = this.header || document.getElementById('shopify-section-header');
      this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
      document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
      this.header.classList.add('menu-open');
  
      setTimeout(() => {
        this.mainDetailsToggle.classList.add('menu-opening');
      });
  
      summaryElement.setAttribute('aria-expanded', true);
      trapFocus(this.mainDetailsToggle, summaryElement);
      document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
    }
  
    closeMenuDrawer(event, elementToFocus) {
      super.closeMenuDrawer(event, elementToFocus);
      this.header.classList.remove('menu-open');
    }
  }
  
  customElements.define('header-drawer', HeaderDrawer);
  
  class ModalDialog extends HTMLElement {
    constructor() {
      super();
      this.querySelector('[id^="ModalClose-"]').addEventListener(
        'click',
        this.hide.bind(this)
      );
      this.addEventListener('keyup', (event) => {
        if (event.code.toUpperCase() === 'ESCAPE') this.hide();
      });
      if (this.classList.contains('media-modal')) {
        this.addEventListener('pointerup', (event) => {
          if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
        });
      } else {
        this.addEventListener('click', (event) => {
          if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
        });
      }
    }
  
    connectedCallback() {
      if (this.moved) return;
      this.moved = true;
      document.body.appendChild(this);
    }
  
    show(opener) {
      this.openedBy = opener;
      const popup = this.querySelector('.template-popup');
      document.body.classList.add('overflow-hidden');
      this.setAttribute('open', '');
      if (popup) popup.loadContent();
      trapFocus(this, this.querySelector('[role="dialog"]'));
      window.pauseAllMedia();
    }
  
    hide() {
      document.body.classList.remove('overflow-hidden');
      this.removeAttribute('open');
      removeTrapFocus(this.openedBy);
      window.pauseAllMedia();
    }
  }
  customElements.define('modal-dialog', ModalDialog);
  
  class ModalOpener extends HTMLElement {
    constructor() {
      super();
  
      const button = this.querySelector('button');
  
      if (!button) return;
      button.addEventListener('click', () => {
        const modal = document.querySelector(this.getAttribute('data-modal'));
        if (modal) modal.show(button);
      });
    }
  }
  customElements.define('modal-opener', ModalOpener);
  
  class DeferredMedia extends HTMLElement {
    constructor() {
      super();
      const poster = this.querySelector('[id^="Deferred-Poster-"]');
      if (!poster) return;
      poster.addEventListener('click', this.loadContent.bind(this));
    }
  
    loadContent(focus = true) {
      window.pauseAllMedia();
      if (!this.getAttribute('loaded')) {
        const content = document.createElement('div');
        content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
  
        this.setAttribute('loaded', true);
        const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
        if (focus) deferredElement.focus();
      }
    }
  }
  
  customElements.define('deferred-media', DeferredMedia);
  
  class SliderComponent extends HTMLElement {
    constructor() {
      super();
      this.slider = this.querySelector('[id^="Slider-"]');
      this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
      this.enableSliderLooping = false;
      this.currentPageElement = this.querySelector('.slider-counter--current');
      this.pageTotalElement = this.querySelector('.slider-counter--total');
      this.prevButton = this.querySelector('button[name="previous"]');
      this.nextButton = this.querySelector('button[name="next"]');
  
      if (!this.slider || !this.nextButton) return;
  
      this.initPages();
      const resizeObserver = new ResizeObserver(entries => this.initPages());
      resizeObserver.observe(this.slider);
  
      this.slider.addEventListener('scroll', this.update.bind(this));
      this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
      this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
    }
  
    initPages() {
      this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
      if (this.sliderItemsToShow.length < 2) return;
      this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
      this.slidesPerPage = Math.floor(this.slider.clientWidth / this.sliderItemOffset);
      this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
      this.update();
    }
  
    resetPages() {
      this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
      this.initPages();
    }
  
    update() {
      const previousPage = this.currentPage;
      this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;
  
      if (this.currentPageElement && this.pageTotalElement) {
        this.currentPageElement.textContent = this.currentPage;
        this.pageTotalElement.textContent = this.totalPages;
      }
  
      if (this.currentPage != previousPage) {
        this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
          currentPage: this.currentPage,
          currentElement: this.sliderItemsToShow[this.currentPage - 1]
        }}));
      }
  
      if (this.enableSliderLooping) return;
  
      if (this.isSlideVisible(this.sliderItemsToShow[0])) {
        this.prevButton.setAttribute('disabled', 'disabled');
      } else {
        this.prevButton.removeAttribute('disabled');
      }
  
      if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
        this.nextButton.setAttribute('disabled', 'disabled');
      } else {
        this.nextButton.removeAttribute('disabled');
      }
    }
  
    isSlideVisible(element, offset = 0) {
      const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
      return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
    }
  
    onButtonClick(event) {
      event.preventDefault();
      const step = event.currentTarget.dataset.step || 1;
      this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
      this.slider.scrollTo({
        left: this.slideScrollPosition
      });
    }
  }
  
  customElements.define('slider-component', SliderComponent);
  
  class SlideshowComponent extends SliderComponent {
    constructor() {
      super();
      this.sliderControlWrapper = this.querySelector('.slider-buttons');
      this.enableSliderLooping = true;
  
      if (!this.sliderControlWrapper) return;
  
      this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
      if (this.sliderItemsToShow.length > 0) this.currentPage = 1;
  
      this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
      this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
      this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
      this.setSlideVisibility();
  
      if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
    }
  
    setAutoPlay() {
      this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
      this.autoplaySpeed = this.slider.dataset.speed * 1000;
  
      this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
      this.addEventListener('mouseover', this.focusInHandling.bind(this));
      this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
      this.addEventListener('focusin', this.focusInHandling.bind(this));
      this.addEventListener('focusout', this.focusOutHandling.bind(this));
  
      this.play();
      this.autoplayButtonIsSetToPlay = true;
    }
  
    onButtonClick(event) {
      super.onButtonClick(event);
      const isFirstSlide = this.currentPage === 1;
      const isLastSlide = this.currentPage === this.sliderItemsToShow.length;
  
      if (!isFirstSlide && !isLastSlide) return;
  
      if (isFirstSlide && event.currentTarget.name === 'previous') {
        this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
      } else if (isLastSlide && event.currentTarget.name === 'next') {
        this.slideScrollPosition = 0;
      }
      this.slider.scrollTo({
        left: this.slideScrollPosition
      });
    }
  
    update() {
      super.update();
      this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
      this.prevButton.removeAttribute('disabled');
  
      if (!this.sliderControlButtons.length) return;
  
      this.sliderControlButtons.forEach(link => {
        link.classList.remove('slider-counter__link--active');
        link.removeAttribute('aria-current');
      });
      this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
      this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
    }
  
    autoPlayToggle() {
      this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
      this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
      this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
    }
  
    focusOutHandling(event) {
      const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
      this.play();
    }
  
    focusInHandling(event) {
      const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
        this.play();
      } else if (this.autoplayButtonIsSetToPlay) {
        this.pause();
      }
    }
  
    play() {
      this.slider.setAttribute('aria-live', 'off');
      clearInterval(this.autoplay);
      this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
    }
  
    pause() {
      this.slider.setAttribute('aria-live', 'polite');
      clearInterval(this.autoplay);
    }
  
    togglePlayButtonState(pauseAutoplay) {
      if (pauseAutoplay) {
        this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
        this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
      } else {
        this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
        this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
      }
    }
  
    autoRotateSlides() {
      const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
      this.slider.scrollTo({
        left: slideScrollPosition
      });
    }
  
    setSlideVisibility() {
      this.sliderItemsToShow.forEach((item, index) => {
        const button = item.querySelector('a');
        if (index === this.currentPage - 1) {
          if (button) button.removeAttribute('tabindex');
          item.setAttribute('aria-hidden', 'false');
          item.removeAttribute('tabindex');
        } else {
          if (button) button.setAttribute('tabindex', '-1');
          item.setAttribute('aria-hidden', 'true');
          item.setAttribute('tabindex', '-1');
        }
      });
    }
  
    linkToSlide(event) {
      event.preventDefault();
      const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
      this.slider.scrollTo({
        left: slideScrollPosition
      });
    }
  }
  
  customElements.define('slideshow-component', SlideshowComponent);
  
  class VariantSelects extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('change', this.onVariantChange);
    }
  
    onVariantChange() {
      this.updateOptions();
      this.updateMasterId();
      this.toggleAddButton(true, '', false);
      this.updatePickupAvailability();
      this.removeErrorMessage();
  
      if (!this.currentVariant) {
        this.toggleAddButton(true, '', true);
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();
        this.updateShareUrl();
      }
    }
  
    updateOptions() {
      this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    }
  
    updateMasterId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return this.options[index] === option;
        }).includes(false);
      });
    }
  
    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;
  
      const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
      mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);
  
      const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
      const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
      modalContent.prepend(newMediaModal);
    }
  
    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }
  
    updateShareUrl() {
      const shareButton = document.getElementById(`Share-${this.dataset.section}`);
      if (!shareButton) return;
      shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
    }
  
    updateVariantInput() {
      const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  
    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector('pickup-availability');
      if (!pickUpAvailability) return;
  
      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.fetchAvailability(this.currentVariant.id);
      } else {
        pickUpAvailability.removeAttribute('available');
        pickUpAvailability.innerHTML = '';
      }
    }
  
    removeErrorMessage() {
      const section = this.closest('section');
      if (!section) return;
  
      const productForm = section.querySelector('product-form');
      if (productForm) productForm.handleErrorMessage();
    }
  
    renderProductInfo() {
      fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
        .then((response) => response.text())
        .then((responseText) => {
          const id = `price-${this.dataset.section}`;
          const html = new DOMParser().parseFromString(responseText, 'text/html')
          const destination = document.getElementById(id);
          const source = html.getElementById(id);
  
          if (source && destination) destination.innerHTML = source.innerHTML;
  
          const price = document.getElementById(`price-${this.dataset.section}`);
  
          if (price) price.classList.remove('visibility-hidden');
          this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
        });
    }
  
    toggleAddButton(disable = true, text, modifyClass = true) {
      const productForm = document.getElementById(`product-form-${this.dataset.section}`);
      if (!productForm) return;
      const addButton = productForm.querySelector('[name="add"]');
      const addButtonText = productForm.querySelector('[name="add"] > span');
  
      if (!addButton) return;
  
      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        if (text) addButtonText.textContent = text;
      } else {
        addButton.removeAttribute('disabled');
        addButtonText.textContent = window.variantStrings.addToCart;
      }
  
      if (!modifyClass) return;
    }
  
    setUnavailable() {
      const button = document.getElementById(`product-form-${this.dataset.section}`);
      const addButton = button.querySelector('[name="add"]');
      const addButtonText = button.querySelector('[name="add"] > span');
      const price = document.getElementById(`price-${this.dataset.section}`);
      if (!addButton) return;
      addButtonText.textContent = window.variantStrings.unavailable;
      if (price) price.classList.add('visibility-hidden');
    }
  
    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }
  }
  
  customElements.define('variant-selects', VariantSelects);
  
  class VariantRadios extends VariantSelects {
    constructor() {
      super();
    }
  
    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      this.options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
      });
    }
  }
  
  customElements.define('variant-radios', VariantRadios);
  
// Global END

// window.addEventListener('load', () => {
//     // Loader Fucntion
//     const loader = document.getElementById('loader');

//     loader.classList.add('fade-out');
//     setTimeout(loader.remove(),3888);
// });

/*############ Marking Unavailable Beg*/

var selectedOptionSecondCat = localStorage.getItem('selected_option_second_category');

const markUnavalableVariant = (selectedFirstCat, selectedSecondCat) => {
    const secondCatClasses = document.querySelectorAll(`.${selectedFirstCat}-x`);
    const thirdCatClasses = document.querySelectorAll(`.${selectedFirstCat}-${selectedSecondCat}-x`);
    const optionLabels = document.querySelectorAll('.option-labels');

    if(optionLabels){
        optionLabels.forEach(e => e.classList.remove('unavailable'));
    }

    if(secondCatClasses){
        secondCatClasses.forEach(e => e.classList.add('unavailable'));
    }

    if(thirdCatClasses){
        thirdCatClasses.forEach(e => e.classList.add('unavailable'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    markUnavalableVariant(localStorage.getItem('selected_option_first_category'),localStorage.getItem('selected_option_second_category'));

    const labelsFirstCat = document.querySelectorAll('.option-labels-first-cat');
    const labelsSecondtCat = document.querySelectorAll('.option-labels-second-cat');

    // For products with 3 product options e.g.: Type, Color, Size
    if(labelsSecondtCat){
        labelsSecondtCat.forEach(e => e.addEventListener('click', () => {
            selectedOptionSecondCat = `${e.dataset.selectedoptsecondcat}`;
            localStorage.setItem("selected_option_second_category", selectedOptionSecondCat);
            markUnavalableVariant(localStorage.getItem('selected_option_first_category'),localStorage.getItem('selected_option_second_category'));
        }))
    }

    if(labelsFirstCat){
        labelsFirstCat.forEach(e => e.addEventListener('click',() => {
            localStorage.setItem("selected_option_first_category", `${e.dataset.selectedoptfirstcat}`);
            localStorage.setItem("selected_option_second_category", selectedOptionSecondCat);
            markUnavalableVariant(localStorage.getItem('selected_option_first_category'),localStorage.getItem('selected_option_second_category'));
        }))
    }
})

/*############ Marking Unavailable End*/


// /*############ Video Popup Beg*/
// document.addEventListener('DOMContentLoaded', () => {
//     // Define constant arguments for video popup
//     const videoArgs = {
//         animationStart: function () {
//             // executed immediately before open animation starts
//             document.documentElement.style.overflowY = 'hidden'
//             document.body.style.overflowY = 'scroll'
//         },
//         onClose: function () {
//             // executed immediately after close animation finishes
//             document.documentElement.style.overflowY = 'auto'
//             document.body.style.overflowY = 'auto'
//         }
//     }

//     // Define the classes that represents video popup element
//     const videoPopup = document.querySelectorAll('.video-popup');

//     // Constant existence validation
//     if(videoPopup){
//         videoPopup.forEach(e => e.addEventListener('click', () => {

//             const videoID = e.dataset.video;
//             const videoType = e.dataset.type;

//             if(videoType=='htmlvid'){
//                 videoArgs['vidSrc'] = videoID
//                 delete videoArgs['ytSrc']
//                 delete videoArgs['vimeoSrc']
//             }else if(videoType=='vimeo'){
//                 videoArgs['vimeoSrc'] = videoID
//                 delete videoArgs['ytSrc']
//                 delete videoArgs['vidSrc']
//             }
//             else if(videoType=='youtube'){
//                 videoArgs['ytSrc'] = videoID
//                 delete videoArgs['vimeoSrc']
//                 delete videoArgs['vidSrc']
//             }

//             videoArgs['el'] = e;
            
//             BigPicture(videoArgs)

//         }))

//     }
// })

// /*############ Video Popup End*/


/*############ Trigger Privy Popup Beg*/
const signupPopupButtonTrigger = document.querySelectorAll('.btn--signup-popup');
window.addEventListener('load', () => {
  if(signupPopupButtonTrigger){
    signupPopupButtonTrigger.forEach(e => {
		try{
			e.style.opacity='1';
			e.addEventListener('click', () => {
				// if(!document.querySelector('.privy-bar-tab-inner')){ 
				// 	alert(`You have already signed up!`) ;
				// };
				document.querySelector('.privy-bar-tab-inner').click();

        Privy('show');
			})
		}
		catch(error){
			console.log(error);
		}
    })
  }
})
/*############ Trigger Privy Popup End*/

// document.addEventListener('DOMContentLoaded', () => {
//     const players = Array.from(document.querySelectorAll('.player')).map((p) => new Plyr(p));
// })

// For Custom TY ModalPopup

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.querySelectorAll('.field__button--with-ty');
    if(submitButton){
        submitButton.forEach(e => e.addEventListener('click', () => {
            localStorage.setItem('activated-ty-modalpopup', `${e.dataset.targetopener}`);
            // alert(localStorage.getItem('activated-ty-modalpopup'));
        }))
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const buttonCopy = document.querySelectorAll('.btn--copy');
    if(buttonCopy){
        buttonCopy.forEach(e => e.addEventListener('click', () => {
            const copyText =  document.getElementById(`${e.dataset.targettext}`);
            navigator.clipboard.writeText(copyText.innerText);
            e.classList.add('btn--copy__tooltip');
            
            setInterval(() => {
                e.classList.remove('btn--copy__tooltip');
            }, 3000);

        }))
    }
})
// For Copy to Clipboard
// function myFunction() {
//     /* Get the text field */
//     const copyText = document.getElementById("myInput");
  
//     /* Copy the text inside the text field */
//     navigator.clipboard.writeText(copyText.value);
    
//     /* Alert the copied text */
//     alert("Copied the text: " + copyText.value);
// }

// For Tabs
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelector('.section__tab--buttons');
  const tabButtonClose = document.querySelectorAll('.section__tab--button-close');
  const tabControls = document.querySelector('.section__tab--controls');
  const tabControl = document.querySelectorAll('.section__tab--control');

  if(tabControl){
      tabControl.forEach(e => e.addEventListener('click', () => {
          tabButtons.classList.toggle('section__tab--buttons-show');
          tabControls.classList.toggle('section__tab--controls-show');
      }))
  }

  if(tabButtonClose){
      tabButtonClose.forEach(e => e.addEventListener('click', () => {
          tabButtons.classList.toggle('section__tab--buttons-show');
          tabControls.classList.toggle('section__tab--controls-show');
      }))
  }
})

document.addEventListener('DOMContentLoaded', () => {
  tabularMultiple();
})


const tabularMultiple = () => {
  let counter = 1;
  const tabControlPrev = document.querySelectorAll('.tab-control--prev');
  const tabControlNext = document.querySelectorAll('.tab-control--next');

  if(tabControlNext){
    tabControlNext.forEach(e => e.addEventListener('click', (event) => {
      event.preventDefault();
      const maxBlock = e.dataset.maxblock * 1;

      if( counter < maxBlock ){
        counter++;
      }

      const tabPrev = document.querySelector('.' + e.dataset.tabprev);
      tabPrev.style.visibility = 'visible';
      if( counter == maxBlock ){
        e.style.visibility = 'hidden';
      }

      const targetContent = document.querySelectorAll('.' + e.dataset.tabcontentclass + `-${counter}`);
      const targetContentClass = document.querySelectorAll('.' + e.dataset.tabcontentclass);
      const gcard = document.querySelector('.' + e.dataset.gcard);

      targetContentClass.forEach(e => e.style.display = 'none');
      targetContent.forEach(e => e.style.display = 'block');

      if(gcard){
        gcard.classList.toggle('g-card--has-second-image');
        gcard.classList.toggle('g-card--switch-image');
      }

    }))
  }

  if(tabControlPrev){
    tabControlPrev.forEach(e => e.addEventListener('click', (event) => {
      event.preventDefault();

      if( counter > 1 ){
        counter--;
      }

      const tabNext = document.querySelector('.' + e.dataset.tabnext);
      tabNext.style.visibility = 'visible';

      if( counter == 1 ){
        e.style.visibility = 'hidden';
      }
      
      const targetContent = document.querySelectorAll('.' + e.dataset.tabcontentclass + `-${counter}`);
      const targetContentClass = document.querySelectorAll('.' + e.dataset.tabcontentclass);
      const gcard = document.querySelector('.' + e.dataset.gcard);

      targetContentClass.forEach(e => e.style.display = 'none');
      targetContent.forEach(e => e.style.display = 'block');

      if(gcard){
        gcard.classList.toggle('g-card--has-second-image');
        gcard.classList.toggle('g-card--switch-image');
      }

    }))
  }

   // For Single Tab Targeting
   const tabControlSingle = document.querySelectorAll('.tab-control--single');
   if(tabControlSingle){
    tabControlSingle.forEach(e => e.addEventListener('click', () => {
      
      

      const controlClass = document.querySelectorAll('.' + e.dataset.tabcontrolclass);
      const contentClass = document.querySelectorAll('.' + e.dataset.tabcontentclass);
      const targetContentClass = document.querySelectorAll('.' + e.dataset.tabtargetclass);

      if(controlClass){
        controlClass.forEach(e => e.classList.remove('active'));
      }

      e.classList.add('active');
      
      if(contentClass){
        contentClass.forEach(e => e.style.display = 'none');
      }
      if(targetContentClass){
        targetContentClass.forEach(e => e.style.display = 'block');
      }
      
    }))
   }


}


// // For Adding Lines
// document.addEventListener('DOMContentLoaded', () => {
//     const lineButton = document.querySelector('.btn-lines');
//     const bodyTag = document.querySelector('body');

//     // bodyTag.classList.toggle('lined');
    
//     if(!lineButton) return;
//     lineButton.addEventListener('click', () => {
//         bodyTag.classList.toggle('lined');
//     })
// })


