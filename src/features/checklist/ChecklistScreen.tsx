import { useParams } from "react-router-dom";
import { checklistData } from "./checklistData";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircleIcon } from "lucide-react";


export default function ChecklistScreen() {
  const { category } = useParams<{ category: string }>();
  const checklist = checklistData[category || ""] || { title: "Unknown", items: [] };
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-blue-600 underline mb-4 float-right"
      >
        <ArrowLeftCircleIcon size={40} />
      </button>

      <h1 className="text-xl font-bold mb-4">{checklist.title}</h1>
      <ul className="space-y-3">
        {checklist.items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input type="checkbox" className="w-5 h-5" />
            { typeof item === "string" ? (
            <span>{item}</span>
            ) : (
              <a href={item.link} className="text-blue-600 hover:underline">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
