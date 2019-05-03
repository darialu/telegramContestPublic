
export default class CheckBoxMaker {

    constructor (parrentDiv, color, name, graphName, callback) {
      this.checked = true;
      this.parrentDiv = document.getElementById(parrentDiv);
      this.color = color;
      this.name = name;
      this.graphName = graphName;
      this.callback = callback;
      this.makeBox(this.color, this.name, this.callback);
    }

    makeBox(color, name, callback) {

      let checkbox = document.createElement('div');
      // let parrentDiv = this.parrentDiv;
      this.parrentDiv.appendChild(checkbox);
      checkbox.classList.add("checkbox");
      checkbox.setAttribute('id', name);

      let circle = document.createElement('div');
      circle.classList.add("circle");
      checkbox.appendChild(circle);
      let idCircle = 'circle' + name;
      circle.setAttribute('id', idCircle);
      circle.style.backgroundColor = color;
      circle.style.borderColor = color;

      let checkedSign = document.createElement('div');
      checkedSign.classList.add("checkedSign");
      circle.appendChild(checkedSign);
      // checkedSign.setAttribute('id', 'checkedSign');

      let titleCheckbox = document.createElement('div');
      titleCheckbox.classList.add("titleCheckbox");
      checkbox.appendChild(titleCheckbox);
      let idTitleCheckbox = 'titleCheckbox' + name
      titleCheckbox.setAttribute('id', idTitleCheckbox);
      document.getElementById(idTitleCheckbox).innerHTML = name;

      let element = document.getElementById(name)

      element.onclick = () => {
        this.checked = !this.checked;
        if(this.checked === false){
          circle.style.backgroundColor = 'white';
          checkedSign.style.display = 'none';
        } else {
          circle.style.backgroundColor = color;
          checkedSign.style.display = 'block';
        }
        callback(this.checked, this.graphName);
      };
    }

}