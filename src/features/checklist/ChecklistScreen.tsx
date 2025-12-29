import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { checklistData } from "./checklistData";
import BackButton from "../components/BackButton";
import FormSelector from "../forms/formSelector";
import {
  loadLocalStorage,
  saveLocalStorage,
  clearChecklist,
} from "../utils/localStorageHelpers";

type LinkItem = { label: string; link: string };
type ChecklistPart = string | LinkItem;
type ChecklistItem = string | LinkItem | ChecklistPart[];

export default function ChecklistScreen() {
  const { category } = useParams<{ category: string }>();

  const checklist = (
    checklistData as Record<string, { title: string; items: ChecklistItem[] }>
  )[category || ""] || { title: "Coming Soon", items: [] };

  const storageKey = `checklist-${category}`;

  // 🧠 Use null to avoid premature rendering and storage overwrite
  const [checkedItems, setCheckedItems] = useState<boolean[] | null>(null);

  // ✅ Load from localStorage on mount
  useEffect(() => {
    if (!category) return;

    const fallback = Array(checklist.items.length).fill(false) as boolean[];
    const loaded = loadLocalStorage<boolean[]>(storageKey, fallback);

    // Normalize length in case checklist changed between app versions
    const normalized =
      loaded.length === checklist.items.length
        ? loaded
        : Array.from({ length: checklist.items.length }, (_, i) => !!loaded[i]);

    setCheckedItems(normalized);
  }, [category, checklist.items.length, storageKey]);

  // ✅ Save to localStorage on change
  useEffect(() => {
    if (checkedItems !== null) {
      saveLocalStorage<boolean[]>(storageKey, checkedItems);
    }
  }, [checkedItems, storageKey]);

  // ✅ Toggle handler
  const toggleCheckbox = (index: number) => {
    setCheckedItems((prev) => {
      if (!prev) return null;
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  // ✅ Hooks + derived values must be before any conditional return
  const total = checklist.items.length;
  const safeChecked = checkedItems ?? Array(total).fill(false);

  const done = safeChecked.reduce((acc, v) => acc + (v ? 1 : 0), 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const remaining = total - done;

  // Optional: reorder to show remaining items first
  const orderedIndexes = useMemo(() => {
    const idxs = Array.from({ length: total }, (_, i) => i);
    return idxs.sort((a, b) => Number(safeChecked[a]) - Number(safeChecked[b]));
  }, [total, safeChecked]);

  const renderItemContent = (item: ChecklistItem) => {
    return (
      <div className="whitespace-pre-line space-y-1">
        {Array.isArray(item) ? (
          item.map((part, i) =>
            typeof part === "string" ? (
              <div key={i}>{part}</div>
            ) : (
              <div key={i}>
                <a
                  href={part.link}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-700 underline underline-offset-2"
                >
                  {part.label}
                </a>
              </div>
            )
          )
        ) : typeof item === "string" ? (
          <div>{item}</div>
        ) : (
          <div>
            <a
              href={item.link}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-700 underline underline-offset-2"
            >
              {item.label}
            </a>
          </div>
        )}
      </div>
    );
  };

  // ✅ Avoid rendering until state is loaded
  if (checkedItems === null) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <BackButton />
      </div>
    );
  }

  return (
    <div className="app-page app-shell">
      <div className="app-scroll">
        {/* Sticky header (inside scroll container) */}
        <div className="app-header">
          <div className="app-header-inner">
            <BackButton />

            <div className="mt-2">
              <h1 className="text-xl font-bold">{checklist.title}</h1>

              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span>
                  {done}/{total} complete
                  {remaining > 0 ? ` • ${remaining} remaining` : ""}
                </span>
                <span>{pct}%</span>
              </div>

              <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content column */}
        <div className="app-container">
          {/* Checklist card */}
          <div className="card overflow-hidden">
            <ul className="divide-y divide-slate-300">
              {orderedIndexes.map((index) => {
                const item = checklist.items[index];
                const checked = !!checkedItems[index];

                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => toggleCheckbox(index)}
                      className={`checklist-row ${
                        checked
                          ? "checklist-row-complete"
                          : "checklist-row-active"
                      }`}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={checked}
                        className="w-5 h-5 mt-1 pointer-events-none"
                      />

                      <div className="flex-1 leading-relaxed">
                        <div className={checked ? "line-through" : ""}>
                          {renderItemContent(item)}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Forms card */}
          <div className="card card-section">
            <div className="font-semibold">Forms</div>
            <div className="text-sm text-gray-600 mt-1">
              Use the appropriate form for documentation and follow-up.
            </div>
            <div className="mt-3">
              <FormSelector />
            </div>
          </div>

          {/* Danger zone */}
          <div className="danger-card">
            <div className="text-sm font-semibold text-red-700">
              Danger zone
            </div>
            <div className="text-sm text-red-700/80 mt-1">
              Clears saved progress for this checklist on this device.
            </div>

            <button
              type="button"
              onClick={() => {
                if (category && window.confirm("Clear this checklist?")) {
                  clearChecklist(category);
                  // (optional) setCheckedItems(Array(checklist.items.length).fill(false));
                  window.location.reload();
                }
              }}
              className="mt-3 w-full rounded-xl bg-red-50 border border-red-200 py-2 text-sm text-red-700"
            >
              Clear Checklist Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
