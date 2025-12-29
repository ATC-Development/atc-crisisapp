import { useNavigate } from "react-router-dom";

export default function FormSelector() {
  const navigate = useNavigate();

  const forms = [{ id: "incident", title: "Incident Report Form" }];

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Select Form</h1>
      <div className="space-y-1">
        {forms.map((form) => (
          <button
            key={form.id}
            className="bg-blue-600 text-white py-2 px-2 rounded-lg w-3/4 mx-auto block"
            onClick={() => navigate(`/form/${form.id}`)}
          >
            {form.title}
          </button>
        ))}
      </div>
    </div>
  );
}
