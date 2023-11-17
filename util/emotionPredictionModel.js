import * as tf from "@tensorflow/tfjs";

async function emotionPredictionModel() {
  const model = await tf.loadLayersModel(
    "https://app.happythings.today/model/emotion-model.json"
  );

  return model;
}

export default emotionPredictionModel;
