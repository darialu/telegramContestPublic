const DRAG_MODE_NONE = 0;
const DRAG_MODE_LEFT = 1;
const DRAG_MODE_RIGHT = 2;
const DRAG_MODE_MIDDLE = 3;

export default class RangeSlider {

    constructor (divHeight, divWidth, graphData, callback, canvasStyleLeft, canvasStyleTop) {
      this.callback = callback;
      this.graphData = graphData;
      this.indentX = canvasStyleLeft;
      this.canvasStyleTop = canvasStyleTop;
      this.divContainer = document.getElementById('content');
      this.divHeight = divHeight * 0.1;
      this.top = divHeight * 0.7 + 30 + 150;
      this.divWidth = divWidth;
      this.count = 0;

      this.drugOffset = 0;
      this.dragMode = DRAG_MODE_NONE;
      this.sliderWidth = 0;
      this.sliderMin = 0;
      this.sliderMax = 0;
      this.indexMin = 0;
      this.indexMax = 0;
      this.countIndex = Math.round((this.sliderMin) / this.xStep);
      this.createDiv(); // TODO: rename to createDiv
      this.setSlider(0, 450);

      var mousemove = ('ontouchstart' in window ? 'touchmove' : 'mousemove');
      var mouseup = ('ontouchstart' in window ? 'touchend' : 'mouseup');
      var mousedown = ('ontouchstart' in window ? 'touchstart' : 'mousedown');

      window.addEventListener(mousemove , (e) => this.onMouseMove(e), { passive: true });
      window.addEventListener(mouseup, (e) => this.onMouseUp(e), { passive: true });

      this.handleRightTapArea.addEventListener(mousedown, (e) => this.onDragStart(e, DRAG_MODE_RIGHT), { passive: true });
      this.handleLeftTapArea.addEventListener(mousedown, (e) => this.onDragStart(e, DRAG_MODE_LEFT), { passive: true });
      this.handleSlider.addEventListener(mousedown, (e) => this.onDragStart(e, DRAG_MODE_MIDDLE), { passive: true });
    }

    setGraphData (graphData) {
      this.graphData = graphData;
      this.setSlider(0, 450);
    }

    get xStep () {
      return this.divWidth / (this.graphData.xAxis.length - 1);
    }

    createDiv = () => {
      let div = document.createElement('div');
      this.div = div;
      div.setAttribute('id', 'sliderContainer');
      this.divContainer.appendChild(div);
      div.style.left = this.indentX + 'px';
      div.style.width = this.divWidth + 'px';
      // this.divWidth = this.divWidth - 22 ;//
      div.style.height = this.divHeight + 'px';
      div.classList.add("sliderContainer");
      div.style.top = this.top + 'px';

      this.createSlider();
    }

    resizeSlider (width, height, canvasStyleLeft, canvasStyleTop) {
      this.divWidth = width;
      this.divHeight = height * 0.1;
      this.top = (height * 0.7 + 30 + canvasStyleTop);

      let div = document.getElementById('sliderContainer');
      div.style.width = this.divWidth + 'px';
      div.style.top = this.top + 'px';
      div.style.height = this.divHeight + 'px';

      let slider = document.getElementById('slider');
      slider.style.height = this.divHeight + 'px';//

      let handleLeft = document.getElementById('handleLeft');
      handleLeft.style.height = this.divHeight + 'px';

      let handleRight = document.getElementById('handleRight');
      handleRight.style.height = this.divHeight + 'px';

      let handleSlider = document.getElementById('handleSlider');
      handleSlider.style.height = this.divHeight - 4 + 'px';
    }

    createSlider = () => {
      let sliderLeftArea = document.createElement('div');
      this.div.appendChild(sliderLeftArea);
      this.sliderLeftArea = sliderLeftArea;
      sliderLeftArea.classList.add("sliderLeftArea");
      sliderLeftArea.classList.add("sliderSideArea");

      let slider = document.createElement('div');
      this.div.appendChild(slider);
      this.slider = slider;
      slider.setAttribute('id', 'slider');
      slider.classList.add("slider");
      slider.style.height = this.divHeight + 'px';

      let handleLeft = document.createElement('div');
      slider.appendChild(handleLeft);
      this.handleLeft = handleLeft;
      handleLeft.setAttribute('id', 'handleLeft');
      handleLeft.classList.add("handleLeft");
      handleLeft.style.height = this.divHeight + 'px';

      this.handleLeftTapArea = document.createElement('div');
      handleLeft.appendChild(this.handleLeftTapArea);
      // handleLeftTapArea.style.height = this.divHeight + 'px';

      let handleRight = document.createElement('div');
      slider.appendChild(handleRight);
      this.handleRight = handleRight;
      handleRight.setAttribute('id', 'handleRight');
      handleRight.classList.add("handleRight");
      handleRight.style.height = this.divHeight + 'px';

      this.handleRightTapArea = document.createElement('div');
      handleRight.appendChild(this.handleRightTapArea);
      // handleRightTapArea.style.height = this.divHeight + 'px';

      let handleSlider = document.createElement('div');
      slider.appendChild(handleSlider);
      this.handleSlider = handleSlider;
      handleSlider.setAttribute('id', 'handleSlider');
      handleSlider.classList.add("handleSlider");
      handleSlider.style.height = this.divHeight - 4 + 'px';

      let sliderRightArea = document.createElement('div');
      this.div.appendChild(sliderRightArea);
      this.sliderRightArea = sliderRightArea;
      sliderRightArea.classList.add("sliderRightArea");
      sliderRightArea.classList.add("sliderSideArea");

      this.resize();
      this.dragNDrop();
    }

    onMouseMove (e) {
      let min = this.sliderMin;
      let max = this.sliderMax;

      let clientX;
      if (e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
      } else {
        e.preventDefault();
        clientX = e.clientX;
      }

      switch (this.dragMode) {

        case DRAG_MODE_LEFT:

          min = Math.min(clientX - this.drugOffset, max - this.xStep * 8);
          min = Math.max(min, 0);
          break;

        case DRAG_MODE_RIGHT:

          max = Math.max(clientX - this.drugOffset, min + this.xStep * 8);
          max = Math.min(max, this.divWidth);
          break;

        case DRAG_MODE_MIDDLE:

          min = Math.max(clientX - this.drugOffset, 0);
          min = Math.min(min, this.divWidth - this.sliderWidth);
          max = min + this.sliderWidth;
          break;

        case DRAG_MODE_NONE:
          // Do nothing
          return;

        default:
          throw new Error('Invalid drag mode');
      }

      this.setSlider(min, max);

    }

    onMouseUp (e) {
      // e.preventDefault();
      this.dragMode = DRAG_MODE_NONE;
    }

    onDragStart (e, dragMode) {
      this.dragMode = dragMode;
      let clientX;
      if (e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchstart'){
        clientX = e.touches[0].clientX;
      } else {
        e.preventDefault();
        clientX = e.clientX;
      }

      switch (dragMode) {
        case DRAG_MODE_LEFT:

          this.drugOffset = clientX - this.sliderMin;
          break;

        case DRAG_MODE_RIGHT:

          this.drugOffset = clientX - this.sliderMax;
          break;

        case DRAG_MODE_MIDDLE:

          this.drugOffset = clientX - this.sliderMin;
          break;

        default:
          throw new Error('Invalid drag mode on start');
      }

    }

    resize () {

    }

    dragNDrop () {
      // var mousemove = ('ontouchstart' in window ? 'touchmove' : 'mousemove');
      // var mouseup = ('ontouchstart' in window ? 'touchend' : 'mouseup');
      // var mousedown = ('ontouchstart' in window ? 'touchstart' : 'mousedown');

      // window.addEventListener(mousemove, (e) => this.onMouseMove(e));
      // window.addEventListener(mouseup, (e) => this.onMouseUp(e));


    }

    setSlider (min, max) {
      this.indexMin = Math.round((min) / this.xStep);
      this.indexMax = Math.round((max) / this.xStep);
      this.sliderMin = this.indexMin * this.xStep;
      this.sliderMax = this.indexMax * this.xStep;
      this.sliderWidth = (this.indexMax - this.indexMin) * this.xStep;
      this.count = this.indexMax - this.indexMin + 1;

      this.updateElements();
      this.callback(this.indexMin, this.count);
    }

    updateElements () {
      this.slider.style.width = (this.sliderMax - this.sliderMin) + 'px';
      this.slider.style.left = this.sliderMin + 'px';
      this.sliderLeftArea.style.width = this.sliderMin + 'px';
      this.sliderRightArea.style.left = this.sliderMax + 'px';
      this.sliderRightArea.style.width = this.divWidth - this.sliderMax + 'px';
    }

}