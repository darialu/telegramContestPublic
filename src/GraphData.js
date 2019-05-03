export default class GraphData {

    constructor(data, ctxHeight) {
      this.objData = data;
      this.ctxHeight = ctxHeight;
      this.columns = data.columns;
      this.graphsAmount = this.columns.length - 1;
      this.keyNames = Object.keys(this.objData.names);
      this.xAxis = this.columns[0].slice(1);
      this.yAxis = {};
      this.makeObjYAxis();
      this.maxY = 0;
      this.minY = 0;
      this.heightY = 0; //ymax-ymin
      this.minMax();
      this.normalY = {};
      this.getNormalY();
    }

    makeObjYAxis() {
      let yAxisArray = this.columns.slice(1)
      for(let i = 0; i < this.keyNames.length; i++){
        this.yAxis[this.keyNames[i]] = yAxisArray[i];
      }
    }

    minMax() {
      let min = 0;
      let max = min;
      for(let prop in this.yAxis){
        let currentArray = this.yAxis[prop];
        for (let i = 1; i < currentArray.length; i++) {
          if (currentArray[i] < min){
            min = currentArray[i];
          }
          else if (currentArray[i] > max){
            max = currentArray[i];
          }
        }
      }
      let heightY = max - min;
      this.maxY = max;
      this.minY = min;
      this.heightY = heightY;
    }

    getRangeCoef (names, firstIndex, lastIndex) {
      if (!names.length) {
        return 1;
      }

      let max = 0;
      for (let i = 0; i < names.length; i++) {
          let currentArray = this.yAxis[names[i]]
          for (let j = firstIndex; j <= lastIndex; j++) {
              if (currentArray[j + 1] > max){
                  max = currentArray[j + 1];
              }
          }
      }

      return this.maxY / max;
    }

    getNormalY() {
      let currentY;
      for(let prop in this.yAxis){
        let currentArr = this.yAxis[prop];
        let currentNormalY = [];
        for (let i = 1; i < currentArr.length; i++){
          currentY = (currentArr[i] - this.minY) / this.heightY;
          currentNormalY.push(currentY);
        }
        this.normalY[prop] = currentNormalY;
      }
    }


}