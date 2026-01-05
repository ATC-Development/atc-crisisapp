import { useParams } from "react-router-dom";
import { FormData } from "./formData";
import { useEffect, useState, useRef } from "react";
import { produce } from "immer";
import type { FormDataItem } from "./formData";
import BackButton from "../components/BackButton";
import {
  loadLocalStorage,
  saveLocalStorage,
} from "../utils/localStorageHelpers";
import { PhotosField } from "./fields/photosField";
import type { PhotoPayload } from "./fields/photosField";
import { useMsal } from "@azure/msal-react";

type FieldValue = string | number | boolean | PhotoPayload[];

type IdTokenClaims = {
  preferred_username?: string;
};

type FormDefinition = {
  title: string;
  submitUrl: string;
  items: FormDataItem[];
};

type FlowPhoto = {
  name: string;
  contentType: string;
  contentBase64: string;
};

type SubmitValue = string | FlowPhoto[];

type SubmitPayload = Record<string, SubmitValue> & {
  formTitle: string;
  submittedByName: string;
  submittedByEmail: string;
};

export default function FormScreen() {
  const { formId } = useParams<{ formId: string }>();
  const initialForm: FormDefinition | undefined = FormData[formId ?? ""];

  const [form, setForm] = useState<FormDefinition | null>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const [invalidIds, setInvalidIds] = useState<Set<string>>(new Set());

  const { accounts } = useMsal();
  const account = accounts[0];
  const isSignedIn = !!account;

  const submittedByName = account?.name ?? "";
  const claims = account?.idTokenClaims as IdTokenClaims | undefined;
  const submittedByEmail =
    account?.username || claims?.preferred_username || "";

  const isEmptyValue = (val: unknown, type?: string) => {
    if (type === "files") return !Array.isArray(val) || val.length === 0;
    if (typeof val === "string") return val.trim() === "";
    if (typeof val === "number") return Number.isNaN(val);
    // boolean is "filled" once chosen; in your UI, "boolean" is actually a select returning string
    if (typeof val === "boolean") return false;
    return val === null || val === undefined || val === "";
  };

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (!formId || !initialForm) return;

    const fallback = structuredClone(initialForm);
    const loaded = loadLocalStorage<FormDefinition>(`form-${formId}`, fallback);

    const merged: FormDefinition = {
      ...fallback,
      ...loaded,
      items: fallback.items.map((freshItem) => {
        const existing = loaded.items?.find((i) => i.id === freshItem.id);
        return existing ? { ...freshItem, ...existing } : freshItem;
      }),
    };

    setForm(merged);
  }, [formId, initialForm]);

  useEffect(() => {
    if (!form) return;
    for (const id in textareaRefs.current) {
      autoResize(textareaRefs.current[id]);
    }
  }, [form]);

  useEffect(() => {
    if (form) {
      saveLocalStorage<FormDefinition>(`form-${formId}`, form);
    }
  }, [form, formId]);

  useEffect(() => {
    if (submitSuccess !== null) {
      const timeout = setTimeout(() => {
        setSubmitSuccess(null);
        setSubmitMessage("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [submitSuccess]);

  if (!form) {
    return (
      <div>
        <BackButton />
        <div className="p-4">Form not found</div>
      </div>
    );
  }

  const handleChange = (id: string, value: FieldValue) => {
    // Clear invalid marker as user fixes fields
    setInvalidIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setForm((current) =>
      produce(current as FormDefinition, (draft) => {
        const item = draft.items.find((i) => i.id === id);
        if (item) {
          item.value = value;
          return;
        }

        for (const parent of draft.items) {
          if (parent.subItems) {
            const sub = parent.subItems.find((s) => s.id === id);
            if (sub) {
              sub.value = value;
              return;
            }
          }
        }
      })
    );
  };

  const handleSubmit = async () => {
    if (!form) return;

    // Ensure template exists (TypeScript + safety)
    if (!initialForm) {
      setSubmitSuccess(false);
      setSubmitMessage("Form configuration missing.");
      return;
    }

    // Must be signed in to submit
    if (!isSignedIn) {
      setSubmitSuccess(false);
      setSubmitMessage("Please sign in with Microsoft to submit this form.");
      return;
    }

    // Validate required fields
    setInvalidIds(new Set());
    const missing: { id: string; label: string }[] = [];

    for (const item of form.items) {
      if (item.required && isEmptyValue(item.value, item.type)) {
        missing.push({ id: item.id, label: item.label });
      }

      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.required && isEmptyValue(sub.value, sub.type)) {
            missing.push({ id: sub.id, label: sub.label });
          }
        }
      }
    }

    if (missing.length > 0) {
      setInvalidIds(new Set(missing.map((m) => m.id)));
      setSubmitSuccess(false);
      setSubmitMessage(
        `Please fill out required fields: ${missing
          .map((m) => m.label)
          .join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitMessage("");

    const payload: SubmitPayload = {
      formTitle: form.title,
      submittedByName,
      submittedByEmail,
    };

    for (const item of form.items) {
      if (item.type === "files") {
        const photos = (item.value as PhotoPayload[]) ?? [];
        payload[item.id] = photos.map((p) => ({
          name: p.name,
          contentType: p.contentType,
          contentBase64: p.dataUrl.split(",")[1] ?? "",
        }));
      } else {
        payload[item.id] = String(item.value ?? "");
      }

      if (item.subItems) {
        for (const sub of item.subItems) {
          payload[sub.id] = String(sub.value ?? "");
        }
      }
    }

    try {
      console.log(
        "🚀 Incident Form Payload:",
        JSON.stringify(payload, null, 2)
      );

      const res = await fetch(initialForm.submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setSubmitMessage("Form submitted successfully.");
        localStorage.removeItem(`form-${formId}`);
        setForm(structuredClone(initialForm));
      } else {
        setSubmitSuccess(false);
        setSubmitMessage("Submission failed. Please try again.");
      }
    } catch {
      setSubmitSuccess(false);
      setSubmitMessage("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6 text-center">{form.title}</h1>

      <form className="space-y-4">
        {form.items.map((item) => {
          const isInvalid = invalidIds.has(item.id);
          const fieldClass = `w-full border rounded-md px-3 py-2 text-sm ${
            isInvalid ? "border-red-500" : "border-gray-300"
          }`;

          return (
            <div key={item.id} className="bg-gray-100 shadow rounded-lg p-4">
              <label className="block text-gray-800 font-medium mb-2">
                {item.label}
                {item.required ? (
                  <span className="text-red-500"> *</span>
                ) : null}
              </label>

              {(() => {
                switch (item.type) {
                  case "files":
                    return (
                      <PhotosField
                        storageKey={`form-${formId}-${item.id}`}
                        value={(item.value as PhotoPayload[]) ?? []}
                        onChange={(next) => handleChange(item.id, next)}
                      />
                    );

                  case "date":
                  case "datetime":
                    return (
                      <input
                        type={
                          item.type === "datetime" ? "datetime-local" : "date"
                        }
                        value={String(item.value ?? "")}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        className={fieldClass}
                      />
                    );

                  case "integer":
                    return (
                      <input
                        type="number"
                        value={String(item.value ?? "")}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        className={fieldClass}
                      />
                    );

                  case "boolean":
                    return (
                      <select
                        value={String(item.value ?? "")}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Select Yes or No</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    );

                  case "select":
                    return (
                      <select
                        value={String(item.value ?? "")}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">-- Select --</option>
                        {item.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );

                  default:
                    return (
                      <textarea
                        ref={(el) => {
                          textareaRefs.current[item.id] = el;
                        }}
                        rows={1}
                        value={String(item.value ?? "")}
                        onChange={(e) => {
                          handleChange(item.id, e.target.value);
                          autoResize(e.target);
                        }}
                        className={`${fieldClass} resize-y overflow-hidden`}
                      />
                    );
                }
              })()}
            </div>
          );
        })}
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !isSignedIn}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition ${
            isSubmitting || !isSignedIn
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-700"
          }`}
        >
          {!isSignedIn
            ? "Sign in to submit"
            : isSubmitting
            ? "Submitting..."
            : "Submit"}
        </button>
      </div>

      {submitSuccess !== null && (
        <div className="fixed top-6 right-6 z-50 bg-white shadow-lg border border-gray-300 px-4 py-3 rounded-lg">
          <p
            className={`text-sm font-medium ${
              submitSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {submitMessage}
          </p>
        </div>
      )}
    </div>
  );
}
