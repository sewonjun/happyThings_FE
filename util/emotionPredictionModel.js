import * as tf from "@tensorflow/tfjs";

async function emotionPredictionModel() {
  const layerModel = await fetch(
    `https://app.happythings.today/model/emotion-model.json`,
    {
      method: "GET",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const model = await tf.loadLayersModel(layerModel);

  return model;
}

export default emotionPredictionModel;
