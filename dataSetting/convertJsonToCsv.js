import fs from "fs";

const emotion = "sad";
const chunkNumber = "2";
const inputPath = `../dataset/${emotion}${chunkNumber}.json`;
const outputPath = `../datasetCSV/${emotion}${chunkNumber}.csv`;

const headers = [
  "emotion",
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

const jsonData = fs.readFileSync(inputPath, "utf8");
const jsonArray = JSON.parse(jsonData);

const csvData = [];
csvData.push(headers.join(","));

jsonArray.forEach(data => {
  const row = [];
  row.push(data.emotion);

  headers.slice(1).forEach(header => {
    const blendshape = data.faceBlendshapes.find(
      item => item.faceBlendName === header
    );
    row.push(blendshape ? blendshape.score : 0);
  });
  csvData.push(row.join(","));
});

fs.writeFileSync(outputPath, csvData.join("\n"));
