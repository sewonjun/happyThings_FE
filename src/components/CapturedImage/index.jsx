/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useState } from "react";
import smileImg from "../../assets/smile.svg";
import neutralImg from "../../assets/neutral.svg";
import unhappy from "../../assets/unhappy.svg";

export default function CapturedImage({ imgRefCurrent, faceBlendShape }) {
  const [feedbackSent, setFeedbackSent] = useState(false);

  async function fetchData(bodyData, label) {
    const emotionData = label;
    const response = await fetch(`http://localhost:3000/data/${emotionData}`, {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    if (response.status !== 201 || !response) {
      throw Error();
    }
    setFeedbackSent(true);
  }

  function handleUserEmotionEvaluation(event) {
    const data = faceBlendShape;
    const label = event.target.alt;

    fetchData(data, label);
  }

  return (
    <>
      <Link
        to={"/polaroid"}
        state={{ image: imgRefCurrent }}
        className="basis-full w-3/12 m-auto"
      >
        <img src={imgRefCurrent} alt="" />
      </Link>
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
    </>
  );
}
