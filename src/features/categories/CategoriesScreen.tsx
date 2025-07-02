import { useNavigate } from "react-router-dom";

const crisisCategories = [
  { name: "Fire", slug: "fire" },
  { name: "Security", slug: "security" },
  { name: "Cyber Attack", slug: "cyber" },
  { name: "Severe Weather", slug: "weather" },
  { name: "Medical Emergency", slug: "medical" },
  { name: "Other", slug: "other" }
];

export default function CategoriesScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Select Crisis Category
      </h1>

      <div className="w-full max-w-sm space-y-4">
        {crisisCategories.map(category => (
          <button
            key={category.slug}
            onClick={() => navigate(`/checklist/${category.slug}`)}
            className="w-full bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl shadow hover:bg-blue-50 transition"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
