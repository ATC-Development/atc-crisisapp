type ChecklistItem = string | { label: string; link: string };

export const checklistData: Record<string, { title: string; items: ChecklistItem[] }> = {
  fire: {
    title: "Fire Emergency Checklist",
    items: [
      { label: "Call 911", link: "tel:911" },
      "Get to safety",
      "Evacuate residents if able"
    ]
  }
  // Add more categories later like 'security', 'cyber', etc.
};
