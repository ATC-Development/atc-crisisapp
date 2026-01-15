import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { checklistData } from "./checklistData";
import BackButton from "../components/BackButton";
import FormSelector from "../forms/formSelector";
import LeadershipAlertModal from "../components/LeadershipAlertModal";
import { useMsal } from "@azure/msal-react";
import { useProximity } from "../components/ProximityContext";

import {
  loadLocalStorage,
  saveLocalStorage,
  clearChecklist,
} from "../utils/localStorageHelpers";

type LinkItem = {
  label: string;
  link: string;
  meta?: {
    kind?: "call911" | string;
    triggerLeadershipOnComplete?: boolean;
  };
};
type ChecklistPart = string | LinkItem;
type ChecklistItem = string | LinkItem | ChecklistPart[];

type UnknownRecord = Record<string, unknown>;

function isRecord(x: unknown): x is UnknownRecord {
  return typeof x === "object" && x !== null;
}

function isLinkItem(x: unknown): x is LinkItem {
  if (!isRecord(x)) return false;
  const label = x["label"];
  const link = x["link"];
  return typeof label === "string" && typeof link === "string";
}

function itemTriggersLeadership(item: ChecklistItem): boolean {
  if (isLinkItem(item)) return !!item.meta?.triggerLeadershipOnComplete;

  if (Array.isArray(item)) {
    return item.some(
      (part) => isLinkItem(part) && !!part.meta?.triggerLeadershipOnComplete
    );
  }

  return false;
}

export default function ChecklistScreen() {
  const { category } = useParams<{ category: string }>();

  const checklist = (
    checklistData as Record<string, { title: string; items: ChecklistItem[] }>
  )[category || ""] || { title: "Coming Soon", items: [] };

  const storageKey = `checklist-${category}`;

  const [checkedItems, setCheckedItems] = useState<boolean[] | null>(null);
  const [leadershipModalOpen, setLeadershipModalOpen] = useState(false);

  const suppressKey = `${storageKey}-suppress-911-leadership`;
  const [suppressLeadershipPrompt, setSuppressLeadershipPrompt] =
    useState<boolean>(false);

  const { accounts } = useMsal();
  const account = accounts?.[0];

  // ✅ Pull the already-computed proximity text (matches banner exactly)
  const { proximityText } = useProximity();

  useEffect(() => {
    if (!category) return;

    const fallback = Array(checklist.items.length).fill(false) as boolean[];
    const loaded = loadLocalStorage<boolean[]>(storageKey, fallback);

    const normalized =
      loaded.length === checklist.items.length
        ? loaded
        : Array.from({ length: checklist.items.length }, (_, i) => !!loaded[i]);

    setCheckedItems(normalized);
  }, [category, checklist.items.length, storageKey]);

  useEffect(() => {
    if (!category) return;
    const stored = loadLocalStorage<boolean>(suppressKey, false);
    setSuppressLeadershipPrompt(!!stored);
  }, [category, suppressKey]);

  useEffect(() => {
    if (checkedItems !== null) {
      saveLocalStorage<boolean[]>(storageKey, checkedItems);
    }
  }, [checkedItems, storageKey]);

  const toggleCheckbox = (index: number) => {
    setCheckedItems((prev) => {
      if (!prev) return null;

      const updated = [...prev];
      const nextValue = !updated[index];
      updated[index] = nextValue;

      const item = checklist.items[index];
      if (
        nextValue === true &&
        !suppressLeadershipPrompt &&
        itemTriggersLeadership(item)
      ) {
        setLeadershipModalOpen(true);
      }

      return updated;
    });
  };

  const total = checklist.items.length;
  const safeChecked = checkedItems ?? Array(total).fill(false);

  const done = safeChecked.reduce((acc, v) => acc + (v ? 1 : 0), 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const remaining = total - done;

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

  if (checkedItems === null) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <BackButton />
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="app-header">
          <div className="app-header-surface">
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
                      checked ? "checklist-row-complete" : "bg-white"
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

        <div className="card card-section">
          <div className="mt-3">
            <FormSelector />
          </div>
        </div>

        <div className="danger-card">
          <div className="text-sm font-semibold text-red-700">Danger zone</div>
          <div className="text-sm text-red-700/80 mt-1">
            Clears saved progress for this checklist on this device.
          </div>

          <button
            type="button"
            onClick={() => {
              if (category && window.confirm("Clear this checklist?")) {
                clearChecklist(category);
                window.location.reload();
              }
            }}
            className="mt-3 w-full rounded-xl bg-white border border-red-200 py-2 text-sm text-red-700"
          >
            Clear Checklist Progress
          </button>
        </div>
      </div>

      <LeadershipAlertModal
        open={leadershipModalOpen}
        onClose={() => setLeadershipModalOpen(false)}
        onSend={(payload) => {
          console.log("Leadership Alert Payload:", payload);

          if (payload.dontAskAgain) {
            setSuppressLeadershipPrompt(true);
            saveLocalStorage<boolean>(suppressKey, true);
          }

          setLeadershipModalOpen(false);
        }}
        categoryLabel={checklist.title}
        reporterName={account?.name ?? "Unknown"}
        reporterEmail={account?.username}
        locationText={proximityText}
      />
    </div>
  );
}
