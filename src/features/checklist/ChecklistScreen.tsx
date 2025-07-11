import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { checklistData } from "./checklistData";
import BackButton from "../components/BackButton";
import FormSelector from "../forms/formSelector";
import { loadLocalStorage, saveLocalStorage, clearChecklist } from "../utils/localStorageHelpers";

export default function ChecklistScreen() {
  const { category } = useParams<{ category: string }>();
  const checklist = checklistData[category || ""] || { title: "Coming Soon", items: [] };
  const storageKey = `checklist-${category}`;

  // 🧠 Use null to avoid premature rendering and storage overwrite
  const [checkedItems, setCheckedItems] = useState<boolean[] | null>(null);

  // ✅ Load from localStorage on mount

useEffect(() => {
  if (!category) return;

  const fallback = Array(checklist.items.length).fill(false); // fallback type is boolean[]
  const loaded = loadLocalStorage<boolean[]>(storageKey, fallback);

  setCheckedItems(loaded);
}, [category, checklist.items.length, storageKey]);


  // ✅ Save to localStorage on change
  useEffect(() => {
    if (checkedItems !== null) {
      saveLocalStorage<boolean[]>(storageKey, checkedItems);
    }
  }, [checkedItems, storageKey]);

  // ✅ Toggle handler
  const toggleCheckbox = (index: number) => {
    setCheckedItems(prev => {
      if (!prev) return null;
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  // ✅ Avoid rendering until state is loaded
  if (checkedItems === null) {
    console.log("Loading checklist...");

    return (
      <div className="p-4">
        <BackButton />
      </div>
    );
  }


  return (
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <h1 className="text-xl font-bold mb-4">{checklist.title}</h1>

      <ul className="space-y-3">
        {checklist.items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={checkedItems[index]}
              onChange={() => toggleCheckbox(index)}
            />
            {typeof item === "string" ? (
              <span>{item}</span>
            ) : (
              <a href={item.link} className="text-blue-600 hover:underline">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <FormSelector />
      <button
        onClick={() => {
          if (category && window.confirm("Clear this checklist?")) {
            clearChecklist(category);
            window.location.reload();
          }
        }}
        className="mt-8 w-full text-sm text-red-600 underline"
      >
        Clear This Checklist
      </button>
    </div>
  );
}
