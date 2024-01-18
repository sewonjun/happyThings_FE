import { useLocation } from "react-router-dom";
import { useRef } from "react";
import html2canvas from "html2canvas";

export default function Polaroid() {
  const location = useLocation();
  const image = location.state?.image;
  const newDate = new Date().toLocaleDateString();
  const polaroidRef = useRef(null);

  const downloadPolaroid = () => {
    const polaroid = polaroidRef.current;

    if (polaroid) {
      html2canvas(polaroid).then(canvas => {
        const link = document.createElement("a");
        link.download = "polaroid.png";
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  return (
    <div className="mt-20">
      <div
        className="polaroid bg-white p-4 max-w-sm mx-auto h-2/5  mt-30 pt-10 shadow-2xl border-2 border-stone-400"
        ref={polaroidRef}
      >
        <img
          src={image}
          alt="Sample Image"
          className="w-full h-full my-5 object-cover border-3 border-stone-300 shadow-xl"
        />
        <div className="mt-20 mb-16 border-t border-stone-300 ">
          <p className="mt-2 text-center text-gray-600">{newDate}</p>
          <div className="text-center my-5">
            <textarea
              name=""
              id=""
              cols={30}
              rows={1}
              placeholder="record your moment"
              className="text-center font-bold"
            ></textarea>
          </div>
        </div>
      </div>
      <div className="block text-center my-5">
        <button
          id="downloadBtn"
          className="bg-amber-400 hover:bg-white hover:text-amber-400 text-white font-bold py-2 px-4 border rounded text-2xl"
          onClick={downloadPolaroid}
        >
          Download Polaroid
        </button>
      </div>
      <canvas style={{ display: "none" }}></canvas>
    </div>
  );
}
