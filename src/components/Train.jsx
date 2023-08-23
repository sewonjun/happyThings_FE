import * as tf from "@tensorflow/tfjs";
import * as dfd from "danfojs";
import * as tfvis from "@tensorflow/tfjs-vis";

export default function Train() {
  dfd.readCSV("../datasetCSV/emotionData.csv").then(function (data) {
    const lastIndex = data.shape[0] - 1;
    const newData = data.drop({ index: [lastIndex] });

    const independentValue = newData.loc({
      columns: [
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
      ],
    });

    const dependentValue = newData.loc({ columns: ["emotion"] });
    const dependentValueInt32 = dependentValue.tensor.cast("int32");
    const dependentValueOneHot = tf.oneHot(dependentValueInt32.squeeze(), 2);

    const X = tf.input({ shape: [14] });
    const H = tf.layers.dense({ units: 14, activation: "relu" }).apply(X);
    const Y = tf.layers.dense({ units: 2, activation: "softmax" }).apply(H);
    const model = tf.model({ inputs: X, outputs: Y });

    const compileParam = {
      optimizer: tf.train.adam(),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    };

    model.compile(compileParam);

    tfvis.show.modelSummary({ name: "summary", tab: "model" }, model);
    const _history = [];
    const fitParam = {
      epochs: 100,
      callbacks: {
        onEpochEnd: function (epochs, logs) {
          _history.push(logs);
          tfvis.show.history({ name: "loss", tab: "history" }, _history, [
            "loss",
          ]);
          tfvis.show.history({ name: "accuracy", tab: "history" }, _history, [
            "acc",
          ]);
        },
      },
    };

    async function fitSaveModel() {
      const predictedResult = await model.fit(
        independentValue.tensor,
        dependentValueOneHot,
        fitParam
      );

      if (predictedResult) {
        await model.save("downloads://emotion-model");
      }
    }

    fitSaveModel();
  });

  return <div>Train</div>;
}
