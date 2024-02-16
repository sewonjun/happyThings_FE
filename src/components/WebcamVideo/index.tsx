interface WebcamVideoProp {
  isMobile: boolean;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  captureRef: React.RefObject<HTMLCanvasElement>;
  handleFaceMask: () => void;
  videoDetect: boolean;
}

function WebcamVideo({
  isMobile,
  videoContainerRef,
  videoRef,
  canvasRef,
  captureRef,
  handleFaceMask,
  videoDetect,
}: WebcamVideoProp) {
  return (
    <div
      className={`
      flex flex-col justify-center items-center ${
        isMobile ? "w-10/12" : "w-6/12"
      } h-4/5 border-2 max-w-md bg-stone-800`}
    >
      <div className="grid grid-rows-4 w-full h-full m-10">
        <div className="relative block row-span-3" ref={videoContainerRef}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute block w-full h-full"
          ></video>
          <canvas ref={canvasRef} className="absolute block w-full h-full" />
          <canvas ref={captureRef} className="hidden" />
        </div>
        <div className="block cursor-pointer text-center items-center row-span-1 justify-center my-5 py-5">
          <button
            type="button"
            onClick={handleFaceMask}
            className="cursor-pointer z-10 bg-amber-400 hover:bg-white hover:text-amber-400 text-white font-bold py-2 px-4 border rounded text-2xl"
          >
            {videoDetect ? "Stop" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebcamVideo;
