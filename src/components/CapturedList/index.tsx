import CapturedImage from "../CapturedImage";
import { v4 as uuidv4 } from "uuid";

interface FaceBlendShape {
  index: number;
  score: number;
  categoryName: string;
  displayName: string;
}

interface ImageRef {
  capturedPicture: string;
  faceBlendShape: FaceBlendShape[];
}

interface CapturedListProp {
  capturedImages: ImageRef[];
  capturedImageCount: React.RefObject<number>;
}

function CapturedList({
  capturedImages,
  capturedImageCount,
}: CapturedListProp) {
  return (
    <>
      <div className="flex justify-center align-middle text-center text-2xl py-5">
        {capturedImageCount.current && capturedImageCount.current > 0
          ? "Select one picture to make a polaroid"
          : ""}
      </div>
      <div className="flex flex-col justify-center align-middle text-center">
        {capturedImages.map(imgData => (
          <CapturedImage
            imgRefCurrent={imgData.capturedPicture}
            faceBlendShape={imgData.faceBlendShape}
            key={uuidv4()}
          />
        ))}
      </div>
    </>
  );
}

export default CapturedList;
