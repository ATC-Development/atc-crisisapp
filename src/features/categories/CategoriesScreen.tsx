import { useNavigate } from "react-router-dom";
import logo from "../../assets/ATC_Office.jpg";
import poolPic from "../../assets/Augustan_Pool.jpg";
import { clearAppLocalStorage } from "../utils/localStorageHelpers";

const crisisCategories = [
  { name: "Fire / Evacuation", slug: "fire", color: "bg-red-600" },
  { name: "Active Shooter", slug: "shooter", color: "bg-yellow-600" },
  { name: "Intruder / Hostile Threat", slug: "intruder", color: "bg-blue-600" },
  {
    name: "Severe Weather / Natural Disaster",
    slug: "weather",
    color: "bg-gray-600",
  },
  {
    name: "Medical / Health Emergency",
    slug: "medical",
    color: "bg-green-600",
  },
];

export default function CategoriesScreen() {
  const navigate = useNavigate();

  return (
    <main
      className="flex flex-col justify-between min-h-screen bg-gray-100 px-4 page-top-offset relative"
      style={{
        backgroundImage: `url(${poolPic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Image Layer with Opacity */}
      <div
        className="absolute inset-0 bg-no-repeat bg-top bg-contain opacity-90 z-0"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: "cover" }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 w-full flex-grow flex flex-col items-center">
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

      <footer className="w-full px-4 py-4 bg-white bg-opacity-30 border-t z-10 flex items-stretch rounded-lg text-sm text-gray-200 h-[80px]">
        <div className="w-2/5">
          <button
            onClick={() => {
              if (window.confirm("Clear ALL saved checklists and forms?")) {
                clearAppLocalStorage();
                window.location.reload();
              }
            }}
            className="text-xs text-center text-red-600 bg-black rounded-full px-4 py-1 hover:bg-gray-300 transition w-full"
          >
            Reset All Checklists & Forms
          </button>
        </div>

        <div className="text-blue-500 text-xs w-3/5 flex flex-col justify-end text-right">
          <p>© 2025 Crisis Management App</p>
          <p className="text-xs">Developed by ATC Team</p>
          <p className="text-xs">v{__APP_VERSION__}</p> {/* 👈 Add this line */}
        </div>
      </footer>
    </main>
  );
}
