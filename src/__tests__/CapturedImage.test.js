import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CapturedImage from "../components/CapturedImage/index";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

describe("CapturedImage component", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it("should render the image correctly", () => {
    const mockImgRefCurrent = "some-image-url";
    const { getByAltText } = render(
      <MemoryRouter>
        <CapturedImage imgRefCurrent={mockImgRefCurrent} faceBlendShape={{}} />
      </MemoryRouter>
    );

    const image = getByAltText("");
    expect(image).toBeInTheDocument();
    expect(image.src.endsWith("some-image-url")).toBe(true);
  });

  it("should display appropriate message based on feedbackSent state", () => {
    const { getByText, rerender } = render(
      <MemoryRouter>
        <CapturedImage imgRefCurrent="some-image-url" faceBlendShape={{}} />
      </MemoryRouter>
    );

    expect(
      getByText("Choose your emotion for our improvement")
    ).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CapturedImage imgRefCurrent="some-image-url" faceBlendShape={{}} />
      </MemoryRouter>
    );

    expect(
      getByText("Choose your emotion for our improvement")
    ).toBeInTheDocument();
  });

  it("should call fetchData when an emotion image is clicked", async () => {
    fetch.mockResponseOnce(JSON.stringify({ status: 201 }));

    const faceBlendShape = { mockData: "someData" };
    const { getByAltText, getByText } = render(
      <MemoryRouter>
        <CapturedImage
          imgRefCurrent="some-image-url"
          faceBlendShape={faceBlendShape}
        />
      </MemoryRouter>
    );

    fireEvent.click(getByAltText("happy"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/data/happy",
        expect.objectContaining({
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(faceBlendShape),
        })
      );
      expect(getByText(/Thanks.*feedback/)).toBeInTheDocument();
    });
  });
});
