import { HashRouter, Routes, Route } from "react-router-dom";
import CategoriesScreen from "./features/categories/CategoriesScreen";
import ChecklistScreen from "./features/checklist/ChecklistScreen";
import FormScreen from "./features/forms/FormScreen";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CategoriesScreen />} />
        <Route path="/checklist/:category" element={<ChecklistScreen />} />
        <Route path="/form/:formId" element={<FormScreen />} />
      </Routes>
    </HashRouter>
  );
}
