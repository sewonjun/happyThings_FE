import { useEffect, useRef, useState } from "react";
import vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver } = vision;

const emotion = "angry";
const chunkNumber = "2";

function DataDetectLandmark() {
  const imageRef = useRef([]);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  let runningMode = "IMAGE";
  const detectedResult = [];
  useEffect(() => {
    async function createFaceLandmarker() {
      const fileSetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      const faceLandmarkerInstance = await FaceLandmarker.createFromOptions(
        fileSetResolver,
        {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1,
        }
      );
      setFaceLandmarker(faceLandmarkerInstance);
    }
    createFaceLandmarker();
  }, []);

  async function handleDetectAll() {
    if (!faceLandmarker) {
      console.log("wait for model");
      return;
    }

    if (runningMode === "IMAGE") {
      await faceLandmarker.setOptions({ runningMode });
    }

    for (let i = 1; i <= 50; i++) {
      const image = imageRef.current[i];
      const faceLandmarkerResult = faceLandmarker.detect(image);

      const faceBlendshapes =
        faceLandmarkerResult.faceBlendshapes[0]?.categories;

      if (!faceBlendshapes) continue;

      const sortedFaceBlendshapes = faceBlendshapes.sort(
        (a, b) => b.score - a.score
      );
      detectedResult.push({
        number: `${emotion}_chunk_${chunkNumber}_${i}`,
        faceBlendshapes: sortedFaceBlendshapes,
      });
    }

    handleSaveJson();
  }

  function handleSaveJson() {
    const blob = new Blob([JSON.stringify(detectedResult)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `detected${emotion}Result${chunkNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div>hello</div>
      <button onClick={handleDetectAll}>fetch</button>
      <div>
        {Array.from({ length: 50 }, (_, i) => i + 1).map(index => (
          <img
            ref={el => (imageRef.current[index] = el)}
            key={index}
            width="100%"
            src={`../emotion_data_splited50/${emotion}/chunk_${chunkNumber}/${emotion}${index}.jpg`}
            alt={`Image ${index}`}
            crossOrigin="anonymous"
          />
        ))}
      </div>
    </>
  );
}

export default DataDetectLandmark;
