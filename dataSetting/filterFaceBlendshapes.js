import fs from "fs";

const emotion = "angry";
const chunkNumber = "2";

const inputPath = `../emotion_landmarkDetected/detected${emotion}Result${chunkNumber}.json`;
const outputPath = `../dataset/${emotion}${chunkNumber}.json`;

const desiredCategories = [
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

fs.readFile(inputPath, "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  const filteredData = JSON.parse(data).map(el => {
    const number = emotion === "happy" ? 1 : 0;

    const filteredPoint = el.faceBlendshapes.filter(faceBlendpoint =>
      desiredCategories.includes(faceBlendpoint.categoryName)
    );

    return {
      number,
      faceBlendshapes: filteredPoint,
    };
  });

  fs.writeFile(outputPath, JSON.stringify(filteredData), err => {
    if (err) {
      console.log("Error writing the file", err);
    }
    console.log("New file has been created");
  });
});
