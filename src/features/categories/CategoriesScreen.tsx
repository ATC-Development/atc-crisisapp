import { useNavigate } from "react-router-dom";
import logo from "../../assets/Augustan_Pool.jpg";
import poolPic from "../../assets/Augustan_Pool.jpg";

const crisisCategories = [
  { name: "Fire", slug: "fire", color: "bg-red-600" },
  { name: "Security", slug: "security", color: "bg-yellow-600" },
  { name: "Cyber Attack", slug: "cyber", color: "bg-blue-600" },
  { name: "Severe Weather", slug: "weather", color: "bg-gray-600" },
  { name: "Medical Emergency", slug: "medical", color: "bg-green-600" },
  { name: "Other", slug: "other", color: "bg-purple-600" }
];

export default function CategoriesScreen() {
  const navigate = useNavigate();

return (
  <div className="relative min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6" style={{backgroundImage: `url(${poolPic})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
    {/* Background Image Layer with Opacity */}
    <div
      className="absolute inset-0 bg-no-repeat bg-top bg-contain opacity-90 z-0"
      style={{ backgroundImage: `url(${logo})`, backgroundSize: 'cover' }}
    />

    {/* Foreground Content */}
    <div className="relative z-10 w-full">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Select Crisis Category
      </h1>

      <div className="flex flex-col space-y-4 w-full max-w-xs mx-auto">
        {crisisCategories.map((category) => (
          <button
            key={category.slug}
            className={`text-white py-4 px-6 rounded-lg text-lg ${category.color}`}
            onClick={() => navigate(`/checklist/${category.slug}`)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  </div>
);

}
