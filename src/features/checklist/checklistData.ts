type ChecklistItem = string | { label: string; link: string };

export const checklistData: Record<string, { title: string; items: ChecklistItem[] }> = {
  fire: {
    title: "Fire Emergency Checklist",
    items: [
      { label: "Call 911", link: "tel:7067364748" },
      "Get to safety",
      "Evacuate residents if able",
      "Use fire extinguisher if safe to do so",
      "Close doors behind you",
      "Do not use elevators",
      "Notify fire department of any trapped individuals",
      "Gather at designated assembly point",
      "Check for injuries and administer first aid if trained",
      "Do not re-enter the building until cleared by authorities",
    ]
  },
  // Add more categories later like 'security', 'cyber', etc.
  cyber: {
    title: "Cyber Attack Checklist",
    items: [
      { label: "Contact MSP", link: "tel:7067364748" },
      { label: "Contact Information & Systems Manager", link: "tel:7067364748" },
      { label: "Contact Company President", link: "tel:7067364748" },
      { label: "Contact CEO", link: "tel:7067364748" },
      "Log off all systems",
      "Disconnect from network",
      "Notify all employees",
      "Change all passwords",
      "Backup critical data",
      "Document all actions taken",
      "Contact law enforcement if necessary",
      "Review and update cybersecurity policies",
      "Conduct a post-incident review"
    ]}
};