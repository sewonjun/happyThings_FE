import * as dfd from "danfojs-node";

dfd.readCSV("../datasetCSV/emotionData.csv").then(df => {
  const numericColumns = [
    "browDownLeft",
    "browDownRight",
    "browInnerUp",
    "cheekSquintLeft",
    "cheekSquintRight",
    "eyeBlinkRight",
    "eyeBlinkLeft",
    "eyeSquintRight",
    "eyeSquintLeft",
    "eyeWideLeft",
    "eyeWideRight",
    "jawOpen",
    "mouthSmileLeft",
    "mouthSmileRight",
  ];

  numericColumns.forEach(column => {
    df[column] = df[column].apply(val => {
      return parseFloat(val).toFixed(10);
    });
  });

  df.head().print();

  const newData = dfd.toCSV(df, {
    filePath: "../datasetCSV/fixedEmotionData.csv",
  });

  console.log(newData);
});
