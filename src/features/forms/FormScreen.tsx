import { useParams } from "react-router-dom";
import { FormData } from "./formData";
import { useEffect, useState, useRef } from "react";
import { produce } from "immer";
import type { FormDataItem, FormSubItem } from "./formData";
import BackButton from "../components/BackButton";
import { loadLocalStorage, saveLocalStorage } from "../utils/localStorageHelpers";

type FormDefinition = {
  title: string;
  items: FormDataItem[];
};

export default function FormScreen() {
  const { formId } = useParams<{ formId: string }>();
  const initialForm: FormDefinition | undefined = FormData[formId ?? ""];

const [form, setForm] = useState<FormDefinition | null>(null);

const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

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

  if (!form) {
    return (<div><BackButton /><div className="p-4">Form not found</div></div>)
  }

  const handleChange = (id: string, value: string) => {
    setForm(current =>
      produce(current as FormDefinition, draft => {
        const item: FormDataItem | undefined = draft.items.find(i => i.id === id);
        if (item) {
          item.value = value;
          return;
        }

        for (const parent of draft.items) {
          if (parent.subItems) {
            const sub: FormSubItem | undefined = parent.subItems.find(s => s.id === id);
            if (sub) {
              sub.value = value;
              return;
            }
          }
        }
      })
    );
  };

return (
  <div className="p-4 max-w-md mx-auto">
    <BackButton />
    <h1 className="text-2xl font-bold mb-6 text-center">{form.title}</h1>

    <form className="space-y-4">
      {form.items.map(item => (
        <div key={item.id} className="bg-gray-100 shadow rounded-lg p-4">
          <label className="block text-gray-800 font-medium mb-2">
            {item.label}
          </label>
          <textarea
            ref={(el: HTMLTextAreaElement | null) => {
                    textareaRefs.current[item.id] = el;
                    }}
            rows={1}
            value={item.value.toString()}
            onChange={e => {
                        handleChange(item.id, e.target.value);
                        autoResize(e.target);
                      }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {item.subItems?.map(sub => (
            <div key={sub.id} className="mt-4 pl-4 border-l-2 border-gray-200">
              <label className="block text-sm text-gray-700 mb-1">{sub.label}</label>
              <textarea
                  ref={(el: HTMLTextAreaElement | null) => {
                    textareaRefs.current[item.id] = el;
                    }}
                rows={1}  
                value={sub.value}
                onChange={e => {
                            handleChange(sub.id, e.target.value);
                            autoResize(e.target);
                          }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y overflow-hidden focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
      ))}
    </form>
  </div>
);

}
