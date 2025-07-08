import { ArrowLeftCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="text-sm text-blue-600 underline mb-4 float-right"
    >
      <ArrowLeftCircleIcon size={40} />
    </button>
  );
}