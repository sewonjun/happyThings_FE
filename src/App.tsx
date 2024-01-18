import { Routes, Route } from "react-router-dom";

import FaceDetect from "./components/FaceDetection";
import Header from "./components/Header";
import Polaroid from "./components/Polaroid";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<FaceDetect />} />
        <Route path="/polaroid" element={<Polaroid />} />
      </Routes>
    </>
  );
}
export default App;
