import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CameraCapture from "./component/camera";
import Gemini from "./component/gemini";
import Gpt from "./component/gpt";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <CameraCapture></CameraCapture> */}
      {/* <Gemini></Gemini> */}
      <Gpt></Gpt>
    </>
  );
}

export default App;
