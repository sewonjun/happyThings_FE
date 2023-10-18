/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useState } from "react";
import smileImg from "../../assets/smile.svg";
import neutralImg from "../../assets/neutral.svg";
import unhappy from "../../assets/unhappy.svg";

export default function CapturedImage({ imgRefCurrent, faceBlendShape }) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [error, setError] = useState(null);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  async function fetchData(bodyData, label) {
    try {
      const emotionData = label;
      const response = await fetch(`${SERVER_URL}/data/${emotionData}`, {
        method: "POST",
        mode: "cors",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (response.status !== 201 || !response) {
        throw new Error("Failed to send data");
      }
      setFeedbackSent(true);
      setError(null);
    } catch (error) {
      setError("An error occurred while sending feedback.");
    }
  }

  function handleUserEmotionEvaluation(event) {
    const data = faceBlendShape;
    const label = event.target.alt;

    fetchData(data, label);
  }

  return (
    <div className="border-2 border-stone-900 flex flex-col justify-center align-middle m-auto">
      <Link
        to={"/polaroid"}
        state={{ image: imgRefCurrent }}
        className="basis-full w-full m-auto"
      >
        <img src={imgRefCurrent} alt="" />
      </Link>
      {error && <p className="text-red-500">{error}</p>}
      {!feedbackSent ? (
        <>
          <p>Choose your emotion for our improvement</p>
          <div
            onClick={handleUserEmotionEvaluation}
            className="flex flex-row w-auto h-auto justify-center align-middle"
          >
            <img src={smileImg} alt="happy" className="w-10 h-10" />
            <img src={neutralImg} alt="neutral" className="w-10 h-10" />
            <img src={unhappy} alt="unhappy" className="w-10 h-10 " />
          </div>
        </>
      ) : (
        <p>Thanks for your feedback</p>
      )}
    </div>
  );
}
