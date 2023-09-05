import * as tf from "@tensorflow/tfjs";

async function emotionPredictionModel() {
  const model = await tf.loadLayersModel("./model/emotion-model.json");

  return model;
}

export default emotionPredictionModel;
