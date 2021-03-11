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
