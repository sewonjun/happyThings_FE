import { Routes, Route } from "react-router-dom";

import FaceDetect from "./components/FaceDetection";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<FaceDetect />} />
      </Routes>
    </>
  );
}
export default App;
