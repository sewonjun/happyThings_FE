import React from "react";
import { render, screen, act } from "@testing-library/react";
import FaceDetection from "../components/FaceDetection/index";

// Mocking modules and hooks
jest.mock("@mediapipe/tasks-vision", () => ({
  FaceLandmarker: jest.fn(),
  DrawingUtils: jest.fn(),
}));
jest.mock("../../mediaPipe/initMediaPipe.js", () => jest.fn());
jest.mock("../../util/emotionPredictionModel", () => jest.fn());
jest.mock("../../util/predictHappiness", () => jest.fn());
jest.mock("../components/CapturedImage", () => () => "CapturedImage");

describe("FaceDetection Component", () => {
  it('should display "loading..." when faceLandmarker is null', async () => {
    render(<FaceDetection />);

    expect(screen.getByRole("button")).toHaveTextContent("loading...");
  });

  it('should display "Show me your Happy Moment" when faceLandmarker is not null', async () => {
    const mockInitMediaPipe = jest.fn().mockResolvedValue("someValue");
    const mockEmotionPredictionModel = jest.fn().mockResolvedValue("someModel");

    React.useEffect = jest.fn().mockImplementation(f => f());

    jest.mock("../../mediaPipe/initMediaPipe", () => mockInitMediaPipe);
    jest.mock(
      "../../util/emotionPredictionModel",
      () => mockEmotionPredictionModel
    );

    render(<FaceDetection />);

    await act(async () => {});

    expect(screen.getByRole("button")).toHaveTextContent(
      "Show me your Happy Moment"
    );
  });
});
