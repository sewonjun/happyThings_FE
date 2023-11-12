/* eslint-disable react/prop-types */
function LoadingBtn({ faceLandmarker, handleWebCamRunning }) {
  return (
    <div className="block text-center my-10 mt-20">
      {faceLandmarker ? (
        <button
          type="button"
          onClick={() => {
            handleWebCamRunning();
          }}
          className="bg-amber-400 hover:bg-white hover:text-amber-400 text-white font-bold py-2 px-4 border rounded text-2xl"
        >
          Show me your Happy Moment
        </button>
      ) : (
        <button
          type="button"
          className="bg-amber-400 hover:bg-white hover:text-amber-400 text-white font-bold py-2 px-4 border rounded text-2xl"
          disabled
        >
          loading...
        </button>
      )}
    </div>
  );
}

export default LoadingBtn;
