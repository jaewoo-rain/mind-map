import { useState } from "react";
import "./App.css";
import CameraCapture from "./component/camera";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CameraCapture></CameraCapture>
    </>
  );
}

export default App;
