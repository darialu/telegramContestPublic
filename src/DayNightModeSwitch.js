
export default class DayNightModeSwitch {

    constructor (ctx, ctxWidth, ctxHeight) {
      this.ctx = ctx;
      this.ctxWidth = ctxWidth;
      this.ctxHeight = ctxHeight;
      this.mode = false;

      this.makeSwitc(this.top);
    }

    changeModeName (mode) {//listLabel
      if (!mode){
        document.getElementById('switcher').innerHTML = "Switch To Night Mode";
        switcher.style.color = '#0088CC';

        let body = document.getElementsByTagName("BODY")[0];
        body.style.backgroundColor = 'white';

        let canvas = document.getElementById('canvas');
        canvas.style.backgroundColor = 'white';

        let listLabel = document.getElementById('listLabel');
        listLabel.style.color = 'black';

        let graphTitle = document.getElementById('graphTitle');
        graphTitle.style.color = 'black';

        let sliderAreas = document.getElementsByClassName('sliderSideArea');
        for(let i = 0; i < sliderAreas.length; i++) {
          sliderAreas[i].style.backgroundColor = '#d2e3edc6';
        }

        let checkBoxes = document.getElementsByClassName('titleCheckbox');
        for(let i = 0; i < checkBoxes.length; i++) {
          checkBoxes[i].style.color = 'black';
        }
      } else {
        document.getElementById('switcher').innerHTML = "Switch To Day Mode";
        switcher.style.color = '#32a2e7';

        let body = document.getElementsByTagName("BODY")[0];
        body.style.backgroundColor = '#1f2b3c';

        let canvas = document.getElementById('canvas');
        canvas.style.backgroundColor = '#1f2b3c';

        let listLabel = document.getElementById('listLabel');
        listLabel.style.color = 'white';

        let graphTitle = document.getElementById('graphTitle');
        graphTitle.style.color = 'white';

        let sliderAreas = document.getElementsByClassName('sliderSideArea');
        for(let i = 0; i < sliderAreas.length; i++) {
          sliderAreas[i].style.backgroundColor = '#101823';
        }

        let checkBoxes = document.getElementsByClassName('titleCheckbox');
        for(let i = 0; i < checkBoxes.length; i++) {
          checkBoxes[i].style.color = 'white';
        }
      }
    }

    makeSwitc() {
      
      let switcher = document.createElement('a');
      let content = document.getElementById('content');
      content.appendChild(switcher);
      switcher.classList.add("dayNightModeSwitch");
      switcher.setAttribute('id', 'switcher');
      this.changeModeName(this.mode);

      switcher.onclick = () => {
        this.mode = !this.mode;
        this.changeModeName(this.mode);//#32a2e7

        
      };
    }

}