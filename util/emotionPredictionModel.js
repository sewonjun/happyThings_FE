import * as tf from "@tensorflow/tfjs";

async function emotionPredictionModel() {
  const model = await tf.loadLayersModel(
    tf.io.http(`${import.meta.env.VITE_URL}/model/emotion-model.json`, {
      requestInit: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    })
  );

  return model;
}

export default emotionPredictionModel;
