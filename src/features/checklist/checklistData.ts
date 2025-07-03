type ChecklistItem = string | { label: string; link: string };

export const checklistData: Record<string, { title: string; items: ChecklistItem[] }> = {
  fire: {
    title: "Fire Emergency Checklist",
    items: [
      { label: "Call 911", link: "tel:911" },
      "Get to safety",
      "Evacuate residents if able"
    ]
  },
  // Add more categories later like 'security', 'cyber', etc.
  cyber: {
    title: "Cyber Attack Checklist",
    items: [
      { label: "Contact MSP", link: "tel:3604206344" },
      { label: "Contact Information & Systems Manager", link: "tel:3604206344" },
      { label: "Contact Company President", link: "tel:3604206344" },
      { label: "Contact CEO", link: "tel:3604206344" },
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