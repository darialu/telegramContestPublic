import InscriptionRender from './InscriptionRender';
import CheckBoxMaker from './CheckBoxMaker';

export default class GraphRender {

    constructor (graphData, canvas, canvasStyleTop) {
      // this.checkBoxMaker = new CheckBoxMaker;
        this.needsRepaint = false
        this.graphData = graphData;
        this.ctx = canvas;
        // this.canvasStyleTop = canvasStyleTop; 
        this.inscriptionRender = new InscriptionRender(graphData, canvas);
        this.canvasIndent = 30;
        this.xAxis = graphData.xAxis;
        this.yAxis = graphData.yAxis;
        this.yMax = graphData.maxY;
        this.needsRepaint = true;
        this.ctxWidth = 0;
        this.bigCtxHeight = 0;
        this.smallCtxHeight = 0;
        this.x = 0;
        this.y = 0;
        this.smallY = 0;
        this.renderIndex = 0;
        this.visibleNames = [];

        this._selectedIndex = -1;

        this.targetMultiplierBig = 1;
        this.targetMultiplierSmall = 1;
        this._currentMultiplierBig = 1;
        this._currentMultiplierSmall = 1;

        this.targetIndexMin = 0;
        this.targetIndexMax = 0;
        this._currentIndexMin = 0;
        this._currentIndexMax = 0;

        this.checkboxes = [];
        this.renderCount = this.graphData.xAxis.length;
        this.activeGraphs = this.graphData.keyNames;
        this.makeCheckbox();

        var mousemove = ('ontouchstart' in window ? 'touchmove' : 'mousemove');
        var mouseup = ('ontouchstart' in window ? 'touchend' : 'mouseup');
        var mousedown = ('ontouchstart' in window ? 'touchstart' : 'mousedown');

        var canvasElement = document.getElementById('canvas');
        canvasElement.addEventListener(mousemove , (e) => this.onMouseMove(e), { passive: true });
        canvasElement.addEventListener(mouseup, (e) => this.onMouseUp(e), { passive: true });
        canvasElement.addEventListener(mousedown, (e) => this.onMouseDown(e), { passive: true });
      }

      setGraphData (graphData) {
        this.graphData = graphData;
        this.xAxis = graphData.xAxis;
        this.yAxis = graphData.yAxis;
        this.yMax = graphData.maxY;
        this.renderCount = this.graphData.xAxis.length;
        this.activeGraphs = this.graphData.keyNames;
        this.inscriptionRender.setGraphData(graphData);
        this.appendCheckboxes();
        this.visibleNames = this.getVisibleGraphNames();
        this.needsRepaint = true;
      }

      onMouseMove (e) {

      }

      onMouseUp (e) {

      }

      onMouseDown (e) {

      }

      resize (width, height, canvasStyleTop) {
        this.ctxWidth = width;
        this.canvasStyleTop = canvasStyleTop;
        this.bigCtxHeight = 0.7 * height;
        this.smallCtxHeight = 0.1 * height;
        this.smallY = this.bigCtxHeight + 30;
        let checkBoxCont = document.getElementById('checkBoxCont');
        checkBoxCont.style.top = 0.8 * height + 36 + canvasStyleTop + 'px';
        this.needsRepaint = true;

      }

      repaint () {
        if (!this.needsRepaint && !this.inscriptionRender.needsRepaint) {
          return;
        }

        this.renderUI();
        this.needsRepaint = false;
      }

      animateValue (current, target, dt) {
        var delta = target - current;
        var sign = delta > 0 ? 1 : -1;
        var absDelta = Math.abs(delta);
        // if (absDelta < 0.08) {
        //   return target;
        // }
        delta = Math.abs(absDelta) * dt * 8;
        delta = Math.min(absDelta, delta);
        return current + delta * sign;
      }

      animationTick (dt) {
        this.currentMultiplierBig = this.animateValue(this.currentMultiplierBig, this.targetMultiplierBig, dt);
        this.currentIndexMin = this.animateValue(this.currentIndexMin, this.targetIndexMin, dt);
        this.currentIndexMax = this.animateValue(this.currentIndexMax, this.targetIndexMax, dt);
        this.inscriptionRender.animationTick(dt);
      }

      getXStep (width, count) {
        let step = width / (count- 1);
        return step;
      }

      get selectedIndex () { return this._selectedIndex; }
      set selectedIndex (value) {
        if (value !== this._selectedIndex) {
          this._selectedIndex = value;
          this.needsRepaint = true;
        }
      }

      get currentMultiplierBig () { return this._currentMultiplierBig; }
      set currentMultiplierBig (value) {
        if (Math.abs(this._currentMultiplierBig - value) > 0.001) {
          this._currentMultiplierBig = value;
          this.needsRepaint = true;
        }
      }

      get currentIndexMin () { return this._currentIndexMin; }
      set currentIndexMin (value) {
        if (Math.abs(this._currentIndexMin - value) > 0.001) {
          this._currentIndexMin = value;
          this.needsRepaint = true;
        }
      }

      get currentIndexMax () { return this._currentIndexMax; }
      set currentIndexMax (value) {
        if (Math.abs(this._currentIndexMax - value) > 0.001) {
          this._currentIndexMax = value;
          this.needsRepaint = true;
        }
      }

      reRenderGraph = (index, count) => {
        if (index !== this.renderIndex || count !== this.renderCount) {
          this.renderIndex = index;
          this.renderCount = count;
          this.targetIndexMin = this.renderIndex;
          this.targetIndexMax = this.renderIndex + this.renderCount - 1;
          this.targetMultiplierBig = this.graphData.getRangeCoef(this.visibleNames, this.targetIndexMin, this.targetIndexMax);
          this.needsRepaint = true;
        }
      }

      renderAxes() {

      }

      renderGraph (key, indentX, indentY, width, height, indexMin, indexMax, step, lineWidth, multiplier = 1) {
        let x = indentX;
        let currentArrOfNormY = this.graphData.normalY[key];

        this.ctx.beginPath();

        for(let i = indexMin; i <= indexMax; i++) {
          let index = i - indexMin;
          let yEnd = Math.round(height - height * currentArrOfNormY[i] * multiplier) + indentY;
          if (i === indexMin) {
            this.ctx.moveTo(x + step * index, yEnd);
          } else {
            this.ctx.lineTo(x + step * index, yEnd);
          }
        }
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = this.graphData.objData.colors[key];
        this.ctx.stroke();
      }

      renderInscriptionX (indexMin, indexMax, data) {
        indexMin = data.indexMin;
        indexMax = data.indexMax;
        const LABEL_COUNT_X = 5;
        let count = indexMax - indexMin + 1;
        let monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let daysStepX = Math.round((count -  1) / LABEL_COUNT_X); // x
        let pointStepX = data.step; // px
        let dateStepX = daysStepX * pointStepX ; // px
        let indentXStart = 0;
        if (indexMin !== 0) {
          indentXStart = indexMin - 1 + daysStepX - (indexMin - 1) % daysStepX;
        }

        if (data.step < 0.0000001 || daysStepX <= 0) {
          return;
        }

        let offsetX = (indentXStart - data.indexMin) * pointStepX;

        this.ctx.font = "18px Verdana";
        this.ctx.fillStyle = "#3e556b";

        for(let i = -1; i < count / daysStepX; i++) {
          let xNameIndex = indentXStart + daysStepX * i;
          if (xNameIndex < 0) { continue; }
          let startX = data.x + i * dateStepX + offsetX;
          let xName = new Date(this.xAxis[xNameIndex]);
          let day = xName.getUTCDate();
          let month = xName.getUTCMonth();
          this.ctx.fillText(monthArr[month] + ' ' + day, startX, this.bigCtxHeight + 22 );
        }
      }

      renderInscriptionY (startIndex, count) {

      }

      makeCheckbox () {
        let checkBoxCont = document.createElement('div');
        this.checkBoxContainer = checkBoxCont;
        let parrentDiv = document.getElementById('content');
        parrentDiv.appendChild(checkBoxCont);
        checkBoxCont.classList.add("checkBoxCont");
        checkBoxCont.setAttribute('id', 'checkBoxCont');
        checkBoxCont.style.left = this.x + 'px';
        checkBoxCont.style.top = this.graphData.ctxHeight + 30 + this.canvasStyleTop + 'px';
      }

      appendCheckboxes () {
        // Clear children
        while (this.checkBoxContainer.firstChild) {
          this.checkBoxContainer.removeChild(this.checkBoxContainer.firstChild);
        }

        this.checkboxes = [];

        checkBoxCont.style.top = this.graphData.ctxHeight + 30 + 'px';
        for (let i = 0; i < this.activeGraphs.length; i++){
          let color = this.graphData.objData.colors[this.activeGraphs[i]];
          let name = this.graphData.objData.names[this.activeGraphs[i]];
          let graphName = this.activeGraphs[i];
          this.checkboxes.push(new CheckBoxMaker('checkBoxCont', color, name, graphName, this.onChangeCheckbox));
        }
      }

      onChangeCheckbox = () => {
        this.visibleNames = this.getVisibleGraphNames();
        this.targetMultiplierBig = this.graphData.getRangeCoef(this.visibleNames, this.renderIndex, this.renderIndex + this.renderCount);
        this.needsRepaint = true;
      }

      getVisibleGraphNames () {
        var result = [];

        for (var i = 0; i < this.checkboxes.length; i++) {
          var checkbox = this.checkboxes[i];
          if (checkbox.checked) {
            result.push(checkbox.graphName);
          }
        }

        return result;
      }

      renderGraphList (names, x, y, width, height, indexMin, indexMax, lineWidth, multiplier) {
        if (multiplier === undefined) {
          multiplier = this.graphData.getRangeCoef(names, indexMin, indexMax);
        }

        var deltaMin = indexMin - Math.floor(indexMin);
        let step = this.getXStep(width, indexMax - indexMin);
        indexMin = Math.floor(indexMin);
        indexMax = Math.ceil(indexMax);

        let deltaX = x - deltaMin * step;

        this.ctx.save();
        let region = new Path2D();
        region.rect(x, y, width, height);
        this.ctx.clip(region, 'nonzero');

        for(let i = 0; i < names.length; i++) {
          this.renderGraph(names[i], x + deltaX, y, width, height, indexMin, indexMax, step, lineWidth, multiplier);
        }

        this.ctx.restore();

        return { x: x + deltaX, y, width, height, indexMin, indexMax, step };
      }

      // Render large graph, previews and grid
      renderUI () {
        let indexMin = this.currentIndexMin;
        let indexMax = this.currentIndexMax;

        this.ctx.clearRect(0, 0, this.ctxWidth, this.bigCtxHeight + this.smallCtxHeight + this.canvasIndent + 30);
        this.ctx.save();
        this.ctx.lineWidth = 2;
        var data = this.renderGraphList(this.visibleNames, this.x, this.y, this.ctxWidth, this.bigCtxHeight, indexMin, indexMax, 4, this.currentMultiplierBig);
        data.targetIndexMin = this.targetIndexMin;
        data.targetIndexMax = this.targetIndexMax;
        data.currentMultiplier = this.currentMultiplierBig;
        data.targetMultiplier = this.targetMultiplierBig;
        this.inscriptionRender.setData(data);
        this.inscriptionRender.repaint();
        this.ctx.restore();

        this.renderGraphList(this.visibleNames, this.x, this.smallY, this.ctxWidth, this.smallCtxHeight, 0, this.xAxis.length - 1, 2);
      }

}