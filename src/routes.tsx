import { BrowserRouter, Routes, Route } from "react-router-dom";
import CategoriesScreen from "./features/categories/CategoriesScreen";
import ChecklistScreen from "./features/checklist/ChecklistScreen";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CategoriesScreen />} />
        <Route path="/checklist/:category" element={<ChecklistScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
