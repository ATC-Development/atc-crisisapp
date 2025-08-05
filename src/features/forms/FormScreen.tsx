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

type FormDefinition = {
  title: string;
  submitUrl: string;
  items: FormDataItem[];
};

export default function FormScreen() {
  const { formId } = useParams<{ formId: string }>();
  const initialForm: FormDefinition | undefined = FormData[formId ?? ""];

  const [form, setForm] = useState<FormDefinition | null>(null);

  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null); // null = untouched
  const [submitMessage, setSubmitMessage] = useState("");

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto"; // Reset height
      el.style.height = `${el.scrollHeight}px`; // Set to content height
    }
  };

  useEffect(() => {
    if (!formId || !initialForm) return;

    const fallback = structuredClone(initialForm);
    const loaded = loadLocalStorage<FormDefinition>(`form-${formId}`, fallback);

    setForm(loaded);
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

  const handleChange = (id: string, value: string) => {
    setForm((current) =>
      produce(current as FormDefinition, (draft) => {
        const item = draft.items.find((i) => i.id === id);
        if (item) {
          item.value = value;

          // Clear subItems if question10 is "No"
          if (
            item.id === "question10" &&
            value.toLowerCase() === "no" &&
            item.subItems
          ) {
            item.subItems.forEach((sub) => {
              sub.value = "";
            });
          }
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

    const payload: Record<string, string> = {
      formTitle: form.title,
    };

    for (const item of form.items) {
      payload[item.id] = item.value.toString();
      if (item.subItems) {
        for (const sub of item.subItems) {
          payload[sub.id] = sub.value.toString();
        }
      }
    }

    // 🔍 Log payload to console for testing
    console.log("Submitting form payload:", payload);

    try {
      const res = await fetch(initialForm.submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json(); // 👈 Parse JSON response
      console.log("Response from Power Automate:", data); // 👈 Log response

      if (res.ok) {
        setSubmitSuccess(true);
        setSubmitMessage("Form submitted successfully.");
        // Optional: clear local storage or reset form
        localStorage.removeItem(`form-${formId}`);
        setForm(initialForm); // Reset to initial form state
      } else {
        setSubmitSuccess(false);
        setSubmitMessage("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setSubmitSuccess(false);
      setSubmitMessage("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const question10Value = form.items
    .find((item) => item.id === "question10")
    ?.value?.toString()
    .toLowerCase();
  const disableSubItems = question10Value === "no";

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

            {/* Main field rendering by type */}
            {item.type === "date" || item.type === "datetime" ? (
              <input
                type={item.type === "datetime" ? "datetime-local" : "date"}
                value={item.value.toString()}
                onChange={(e) => handleChange(item.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            ) : item.type === "integer" ? (
              <input
                type="number"
                value={item.value.toString()}
                onChange={(e) => handleChange(item.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            ) : item.type === "boolean" ? (
              <select
                value={item.value.toString()}
                onChange={(e) => handleChange(item.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select Yes or No</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            ) : (
              <textarea
                ref={(el: HTMLTextAreaElement | null) => {
                  textareaRefs.current[item.id] = el;
                }}
                rows={1}
                value={item.value.toString()}
                onChange={(e) => {
                  handleChange(item.id, e.target.value);
                  autoResize(e.target);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {/* Sub-item fields */}
            {item.subItems?.map((sub) => (
              <div
                key={sub.id}
                className="mt-4 pl-4 border-l-2 border-gray-200"
              >
                <label className="block text-sm text-gray-700 mb-1">
                  {sub.label}
                </label>

                {sub.type === "date" || sub.type === "datetime" ? (
                  <input
                    type={sub.type === "datetime" ? "datetime-local" : "date"}
                    value={sub.value.toString()}
                    disabled={disableSubItems}
                    onChange={(e) => handleChange(sub.id, e.target.value)}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${
                      disableSubItems ? "bg-gray-100 text-gray-500" : ""
                    }`}
                  />
                ) : sub.type === "integer" ? (
                  <input
                    type="number"
                    value={sub.value.toString()}
                    disabled={disableSubItems}
                    onChange={(e) => handleChange(sub.id, e.target.value)}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${
                      disableSubItems ? "bg-gray-100 text-gray-500" : ""
                    }`}
                  />
                ) : sub.type === "boolean" ? (
                  <select
                    value={sub.value.toString()}
                    disabled={disableSubItems}
                    onChange={(e) => handleChange(sub.id, e.target.value)}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm ${
                      disableSubItems ? "bg-gray-100 text-gray-500" : ""
                    }`}
                  >
                    <option value="">Select Yes or No</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : (
                  <textarea
                    ref={(el: HTMLTextAreaElement | null) => {
                      textareaRefs.current[sub.id] = el;
                    }}
                    rows={1}
                    value={sub.value.toString()}
                    disabled={disableSubItems}
                    onChange={(e) => {
                      handleChange(sub.id, e.target.value);
                      autoResize(e.target);
                    }}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y overflow-hidden ${
                      disableSubItems
                        ? "bg-gray-100 text-gray-500"
                        : "focus:outline-none focus:ring-1 focus:ring-blue-400"
                    }`}
                  />
                )}
              </div>
            ))}
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
