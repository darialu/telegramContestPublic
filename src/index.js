import * as data from './chart_data.json';
import GraphRender from './GraphRender';
import RangeSlider from './RangeSlider';
import GraphData from './GraphData';
import DayNightModeSwitch from './DayNightModeSwitch';
import startAnimationLoop from './startAnimationLoop';

let canvas = document.getElementById('canvas');
// divContainer.appendChild(canvas);
let ctx = canvas.getContext("2d");
// let ctxWidth = 900;
// let ctxHeight = 800;
let canvasStyleLeft = 15;
let intehtHeightY = 30;
let ctxWidth = window.screen.availWidth;
let ctxPaddigRight = 0;
let ctxHeight = window.innerHeight * 0.7;
// let canvasPosition = canvas.getBoundingClientRect();
let canvasStyleTop = window.innerHeight * 0.1;
canvas.setAttribute("width", ctxWidth - ctxPaddigRight);
canvas.setAttribute("height", ctxHeight + intehtHeightY);

let selectDiv = document.getElementById('selectDiv');
selectDiv.style.top = 0.8 * ctxHeight + 19 + canvasStyleTop + 'px';

let selectList = document.createElement("select");
selectList.id = "selectList";
selectDiv.appendChild(selectList);

let graphDataList = [];
let dataKeys = Object.keys(data);
for (let i = 0; i < dataKeys.length; i++) {
  if (dataKeys[i] === 'default') { continue; }
  //Create and append the options
  let option = document.createElement("option");
  option.value = i;
  option.text = 'Data set ' + (i + 1);
  selectList.appendChild(option);
  graphDataList.push(new GraphData(data[dataKeys[i]], ctxHeight));
}

selectList.onchange = () => setActiveDataSet(selectList.selectedIndex);

let json = data[0];

document.getElementById('graphTitle').innerHTML = 'Data set ' + 1;


let render = new GraphRender(graphDataList[0], ctx, canvasStyleTop);
let callback = (index, count) => {
  // console.info('callback index count', index, count);
  render.reRenderGraph(index, count);
};

let slider = new RangeSlider(ctxHeight, ctxWidth, graphDataList[0], callback, canvasStyleLeft, canvasStyleTop);

let dayNightModeSwitch = new DayNightModeSwitch(ctx, ctxWidth, ctxHeight);

var lastTime = Date.now();
startAnimationLoop(() => {
  var now = Date.now();
  var dt = (now - lastTime) / 1000;
  lastTime = now;

  render.animationTick(dt);
  render.repaint();
});

onResize();

function setActiveDataSet (index) {
  var graphData = graphDataList[index];
  document.getElementById('graphTitle').innerHTML = 'Data set ' + (index + 1);
  render.setGraphData(graphData);
  slider.setGraphData(graphData);
  render.resize(canvas.width, canvas.height, canvasStyleTop);
}

function onResize (e) {
  let canvasStyleLeft = 15;
  canvas.style.left = canvasStyleLeft + 'px';
  canvas.style.top = canvasStyleTop + 'px';
  var width = window.innerWidth - 30;
  var height = window.innerHeight * 0.7;
  // canvas.style.width = width + 'px';
  // canvas.style.height = height + 'px';
  canvas.width = width;
  canvas.height = height;
  let selectDiv = document.getElementById('selectDiv');
  selectDiv.style.top = 0.8 * canvas.height + 19 + canvasStyleTop + 'px';
  render.resize(canvas.width, height, canvasStyleTop);
  slider.resizeSlider(canvas.width, canvas.height, canvasStyleLeft, canvasStyleTop);
}

window.addEventListener('resize', e => onResize(e));

setActiveDataSet(0);


// checkbox
