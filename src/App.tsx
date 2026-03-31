import { BrowserRouter, Routes, Route } from "react-router-dom";
import Diarias from "./pages/diarias";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Diarias />} />
      </Routes>
    </BrowserRouter>
  );
}
