import { HashRouter, Routes, Route } from "react-router-dom";
import CategoriesScreen from "./features/categories/CategoriesScreen";
import ChecklistScreen from "./features/checklist/ChecklistScreen";
import FormScreen from "./features/forms/FormScreen";
import AppShell from "./features/components/AppShell";

export default function AppRoutes() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<CategoriesScreen />} />
          <Route path="/checklist/:category" element={<ChecklistScreen />} />
          <Route path="/form/:formId" element={<FormScreen />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
