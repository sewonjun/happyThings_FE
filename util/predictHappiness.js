import * as tf from "@tensorflow/tfjs";

async function predictHappiness(results, model) {
  const parmasOrder = [
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

  try {
    const orderedResults = parmasOrder.map(categoryName => {
      let returnValue;

      for (let el of results) {
        if (categoryName === el.categoryName) {
          returnValue = el.score;

          break;
        }
      }

      return returnValue;
    });
    const predictionTensor = model.predict(tf.tensor([orderedResults]));
    const predictionArray = await predictionTensor.array();

    if (
      predictionArray[0][0] < Number(0.1) &&
      predictionArray[0][1] >= Number(0.9)
    ) {
      return "happy";
    }

    if (
      predictionArray[0][0] >= Number(0.7) &&
      predictionArray[0][1] < Number(0.3)
    ) {
      return "unhappy";
    }

    return "neutral";
  } catch (error) {
    throw new Error("Emotion Prediction Failed");
  }
}

export default predictHappiness;
