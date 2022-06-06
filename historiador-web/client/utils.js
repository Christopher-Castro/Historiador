const moment = require('moment')

export const hashCode = (str) => {
  // java String#hashCode
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash
}
export const intToRGB = (i) => {
  var c = (i & 0x00ffffff).toString(16).toUpperCase()

  return "#" + "00000".substring(0, 6 - c.length) + c
}
export const colorFromName = (name) => {
  return intToRGB(hashCode(name))
}

export const search = (nameKey, myArray) => {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].name === nameKey) {
      return myArray[i]
    }
  }
}

export const initDataset = (label, data, hidden = true) => {
  const generatedColor = colorFromName(label)
  const backgroundColor = generatedColor
  const borderColor = generatedColor
  const fill = false
  const yAxisID = 'normal-axis'

  return {
    label,
    fill,
    hidden,
    backgroundColor,
    borderColor,
    yAxisID,
    data
  }
}

export const convertToCSV = (objArray) => {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
          if (line != '') line += ','

          line += array[i][index];
      }

      str += line + '\r\n';
  }

  return str;
}

export const exportCSVFile = (headers, items, fileTitle) => {
  if (headers) {
      items.unshift(headers);
  }

  // Convert Object to JSON
  var jsonObject = JSON.stringify(items);

  var csv = convertToCSV(jsonObject);

  var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilenmae);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  }
}

export const generateLabels = (dateInit, dateFinish, labelsWeNeed = 20) => {
  const init = moment(dateInit)
  const finish = moment(dateFinish)
  const labels = []
  const format = 'DD-MM-YYYY HH:mm:ss'

  // find out how the difference between the dates
  const diff = finish.diff(init, 'seconds')

  if (diff > labelsWeNeed) {
    // get the difference between dates in miliseconds
    const diffMs = finish.diff(init)
    
    const msPerLabel = Math.floor(diffMs / labelsWeNeed);    
    return Array.from(Array(labelsWeNeed + 1).keys()).map(i => moment(dateInit).add(msPerLabel * i, 'milliseconds').format(format));
  }
  let current = init;
  // generate the labels for every second
  while (current.isSameOrBefore(finish)) {
    labels.push(current.format(format))
    current = current.add(1, 'seconds')
  }

  return labels.slice(0, -1)
}