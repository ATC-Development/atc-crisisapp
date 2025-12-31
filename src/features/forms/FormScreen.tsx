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

type FieldValue = string | number | boolean | PhotoPayload[];

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
};

export default function FormScreen() {
  const { formId } = useParams<{ formId: string }>();
  const initialForm: FormDefinition | undefined = FormData[formId ?? ""];

  const [form, setForm] = useState<FormDefinition | null>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");

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

  // useEffect(() => {
  //   if (!form) return;
  //   for (const id in textareaRefs.current) {
  //     autoResize(textareaRefs.current[id]);
  //   }
  // }, [form]);

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

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitMessage("");

    const payload: SubmitPayload = {
      formTitle: form.title,
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
        payload[item.id] = item.value?.toString() ?? "";
      }

      if (item.subItems) {
        for (const sub of item.subItems) {
          payload[sub.id] = sub.value?.toString() ?? "";
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
        setForm(initialForm);
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
        {form.items.map((item) => (
          <div key={item.id} className="bg-gray-100 shadow rounded-lg p-4">
            <label className="block text-gray-800 font-medium mb-2">
              {item.label}
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
                      value={item.value.toString()}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  );

                case "integer":
                  return (
                    <input
                      type="number"
                      value={item.value.toString()}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  );

                case "boolean":
                  return (
                    <select
                      value={item.value.toString()}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select Yes or No</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  );

                case "select":
                  return (
                    <select
                      value={item.value.toString()}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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
                      value={item.value.toString()}
                      onChange={(e) => {
                        handleChange(item.id, e.target.value);
                        autoResize(e.target);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y overflow-hidden"
                    />
                  );
              }
            })()}
          </div>
        ))}
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
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
