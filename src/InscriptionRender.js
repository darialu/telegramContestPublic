///////////////////////////////////////////////////////////////////////////////////////////////////////
// LabelSequence
///////////////////////////////////////////////////////////////////////////////////////////////////////

class LabelSequence {

  constructor (shift, mode) {
    this.mode = mode;
    this.opacity = 0;
    this.start = 0;
    this.shift = shift;
    this.action = LabelSequence.ACTION_NONE;
    this.isLive = false;
  }

  show () {
    if (this.isLive && this.action !== LabelSequence.ACTION_HIDE) {
      return;
    }

    this.isLive = true;
    this.action = LabelSequence.ACTION_SHOW;
  }

  hide () {
    if (!this.isLive) {
      return;
    }

    this.action = LabelSequence.ACTION_HIDE;
  }

  update (dt) {
    switch (this.action) {
      case LabelSequence.ACTION_SHOW:
        this.opacity += 3 * dt;
        if (this.opacity >= 1) {
          this.opacity = 1;
          this.action = LabelSequence.ACTION_NONE;
        }
        break;

      case LabelSequence.ACTION_HIDE:
        this.opacity -= 3 * dt;
        if (this.opacity <= 0) {
          this.opacity = 0;
          this.action = LabelSequence.ACTION_NONE;
          this.isLive = false;
        }
        break;
    }
  }

}

LabelSequence.MODE_X = 0;
LabelSequence.MODE_Y = 1;
LabelSequence.ACTION_NONE = 0;
LabelSequence.ACTION_HIDE = 1;
LabelSequence.ACTION_SHOW = 2;

///////////////////////////////////////////////////////////////////////////////////////////////////////
// InscriptionRender
///////////////////////////////////////////////////////////////////////////////////////////////////////

const LABEL_COUNT_Y = 5;
const LABEL_SPACING_X = 150;
const MONTH_LIST = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default class InscriptionRender {

  constructor (graphData, ctx) {
    this.graphData = graphData;
    this.ctx = ctx;

    this.indexMin = 0;
    this.indexMax = 0;
    this.step = 0;
    this.targetIndexMin = 0;
    this.targetIndexMax = 0;
    this.targetMultiplier = 1;
    this.currentMultiplier = 1;
    this.currentMaxY = 0;
    this.x = 0;
    this.width = 0;
    this.height = 0;

    this.needsRepaint = false;

    this.activeSequencesY = [];
    this.sequences = [{}, {}];
    this.currentSequenceY = null;
  }

  setGraphData (graphData) {
    this.graphData = graphData;
    this.needsRepaint = true;
  }

  getSequence (sequenceShift, mode) {
    var sequence = this.sequences[mode][sequenceShift];
    if (sequence) {
      return sequence;
    } else {
      sequence = new LabelSequence(sequenceShift, mode);
      this.sequences[mode][sequenceShift] = sequence;
      return sequence;
    }
  }

  activateSequence (shift, mode) {
    var sequenceFound = false;

    for (var i = 0; i < this.activeSequencesY.length; i++) {
      if (this.activeSequencesY[i].mode !== mode) { continue; }

      if (this.activeSequencesY[i].shift !== shift) {
        this.activeSequencesY[i].hide();
      } else {
        sequenceFound = true;
      }
    }

    var sequence = this.getSequence(shift, mode);
    sequence.show();
    if (!sequenceFound) {
      this.activeSequencesY.push(sequence);
    }
  }

  setCurrentSequenceY (maxY) {
    var sequenceShift = Math.floor(maxY / LABEL_COUNT_Y);
    this.activateSequence(sequenceShift, LabelSequence.MODE_Y);
  }

  setCurrentSequenceX (indexMin, indexMax) {
    var dateDiff = indexMax - indexMin + 1;
    var dateCount = Math.floor(this.width / LABEL_SPACING_X);
    var sequenceShift = Math.max(Math.floor(dateDiff / dateCount), 1);
    sequenceShift = Math.log2(sequenceShift);
    sequenceShift = Math.pow(2, Math.ceil(sequenceShift));
    this.activateSequence(sequenceShift, LabelSequence.MODE_X);
    this.currentSequenceX = sequenceShift;
  }

  drawLabelY (y, width, text) {
    this.ctx.font = "28px Arial";
    this.ctx.fillStyle = "#a9abac";
    this.ctx.fillText(text, 0, y - 10);

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#dcdcdc';
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(width, y);
    this.ctx.stroke();
  }

  drawLabelX (x, y, text) {
    this.ctx.font = "28px Arial";
    this.ctx.fillStyle = "#a9abac";
    this.ctx.fillText(text, x, y);
  }

  renderSequencesY () {
    var width = this.width;
    var height = this.height;
    for (var i = 0; i < this.activeSequencesY.length; i++) {
      var sequence = this.activeSequencesY[i];
      if (sequence.mode !== LabelSequence.MODE_Y) { continue; }

      this.ctx.globalAlpha = sequence.opacity;

      for (var j = 1; j <= LABEL_COUNT_Y; j++) {
        var labelY = j * sequence.shift;
        var y = Math.round(height - height * labelY * this.currentMultiplier / this.graphData.maxY);
        this.drawLabelY(y, width, labelY);
      }
    }

    this.ctx.globalAlpha = 1;
    this.drawLabelY(height, width, 0);
  }

  renderSequencesX () {
    var indexMin = this.indexMin;
    var indexMax = this.indexMax;
    let count = indexMax - indexMin + 1
    let pointStepX = this.step;

    for (var i = 0; i < this.activeSequencesY.length; i++) {
      var sequence = this.activeSequencesY[i];
      if (sequence.mode !== LabelSequence.MODE_X) { continue; }

      let daysStepX = sequence.shift;
      let dateStepX = daysStepX * pointStepX;

      this.ctx.globalAlpha = sequence.opacity;

      let indentXStart = 0;
      if (indexMin !== 0) {
        indentXStart = indexMin - 1 + daysStepX - (indexMin - 1) % daysStepX;
      }
      let offsetX = (indentXStart - indexMin) * pointStepX;

      if (indexMin !== 0) {
        indentXStart = indexMin - 1 + daysStepX - (indexMin - 1) % daysStepX;
      }

      if (this.step < 0.0000001 || daysStepX <= 0) {
        return;
      }

      this.ctx.globalAlpha = sequence.opacity;

      for(let i = -1; i < count / daysStepX; i++) {
        let xNameIndex = indentXStart + daysStepX * i;
        if (xNameIndex < 0) { continue; }
        let startX = this.x + i * dateStepX + offsetX;
        let xName = new Date(this.graphData.xAxis[xNameIndex]);
        let day = xName.getUTCDate();
        let month = xName.getUTCMonth();
        this.drawLabelX(startX, this.height + 22,  MONTH_LIST[month] + ' ' + day);
      }

      this.ctx.globalAlpha = 1;
    }

  }

  getCountOfDigits (number) {
    return (number === 0) ? 1 : Math.ceil(Math.log10(Math.abs(number) + 0.5));
  }

  setData (data) {
    this.indexMin = data.indexMin;
    this.indexMax = data.indexMax;
    this.step = data.step;
    this.targetIndexMin = data.targetIndexMin;
    this.targetIndexMax = data.targetIndexMax;
    this.targetMultiplier = data.targetMultiplier;
    this.currentMultiplier = data.currentMultiplier;
    this.x = data.x;
    this.width = data.width;
    this.height = data.height;
    this.currentMaxY = Math.round(this.graphData.maxY / this.targetMultiplier);

    // console.info('CURRENT MAX', this.currentMaxY, this.getCountOfDigits(this.currentMaxY));

    this.setCurrentSequenceY(this.currentMaxY);
    this.setCurrentSequenceX(this.targetIndexMin, this.targetIndexMax);

    this.needsRepaint = true;
  }

  animationTick (dt) {
    for (var i = this.activeSequencesY.length - 1; i >= 0; i--) {
      var sequence = this.activeSequencesY[i];
      if (sequence.action === LabelSequence.ACTION_NONE && sequence.isLive) {
        continue;
      }

      this.needsRepaint = true;
      sequence.update(dt);
      if (!sequence.isLive) {
        this.activeSequencesY[i] = this.activeSequencesY[this.activeSequencesY.length - 1];
        this.activeSequencesY.pop();
      }
    }
  }

  repaint () {
    if (!this.needsRepaint) {
      return;
    }

    this.ctx.save();
    this.renderSequencesY();
    this.renderSequencesX();
    this.ctx.restore();
    this.ctx.globalAlpha = 1;

    this.needsRepaint = false;
  }

}