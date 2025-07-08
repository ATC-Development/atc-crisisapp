import { useParams } from "react-router-dom";
import { FormData } from "./formData";
import { useState } from "react";
import { produce } from "immer";
import type { FormDataItem, FormSubItem } from "./formData";
import BackButton from "../components/BackButton";

type FormDefinition = {
  title: string;
  items: FormDataItem[];
};

export default function FormScreen() {
  const { formId } = useParams<{ formId: string }>();
  const initialForm: FormDefinition | undefined = FormData[formId ?? ""];

  const [form, setForm] = useState<FormDefinition | null>(() =>
    initialForm ? structuredClone(initialForm) : null
  );

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
      <h1 className="text-xl font-bold mb-6">{form.title}</h1>
      <form className="space-y-4">
        {form.items.map(item => (
          <div key={item.id}>
            <label className="block font-semibold mb-1">{item.label}</label>
            <input
              type="text"
              value={item.value.toString()}
              onChange={e => handleChange(item.id, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />

            {item.subItems?.map(sub => (
              <div key={sub.id} className="mt-2 ml-4">
                <label className="block text-sm mb-1">{sub.label}</label>
                <input
                  type="text"
                  value={sub.value}
                  onChange={e => handleChange(sub.id, e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            ))}
          </div>
        ))}
      </form>
    </div>
  );
}
