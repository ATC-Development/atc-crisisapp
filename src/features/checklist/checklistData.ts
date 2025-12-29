type LinkItem = { label: string; link: string };
type ChecklistItem = string | LinkItem | (string | LinkItem)[];


export const checklistData: Record<string, { title: string; items: ChecklistItem[] }> = {
  fire: {
    title: "Fire / Evacuation Checklist",
    items: [
      "Actvate nearest alarm",
      { label: "Call 911 (calls office now)", link: "tel:7067364748" },
      "Evacuate using nearest exit (no elevators)",
      "Assist others if safe to do so",
      "Report to assembly area"
    ]
  },

  shooter: {
    title: "Active Shooter Checklist",
    items: [
      { label: "Call 911 (calls office now)", link: "tel:7067364748" },
      "Run -> Hide -> Fight",
      "RUN: Escape if possible\n--Leave belongings behind\n--Keep hands visible\n--Listen to police\n--Mark yourself safe",
      "HIDE: Get out of shooters view\n--Blockage door with heavy furniture\nLock door\n--Don't restrict your options for movement\n--Silence phone\nStay quiet",
      "FIGHT: Last option\n--Attempt to incapacitate or disrupt shooter\n--Throw objects\n--Yell\n--Commit to your actions"
    ]
  },

  intruder: {
    title: "Intruder / Hostile Threat Checklist",
    items: [
      { label: "Call 911 (calls office now)", link: "tel:7067364748" },
      "Report details (who / what / where / when)",
      "Notify security or supervisor",
      "Submit photo / report via app"
    ]
  },

  weather: {
    title: "Severe Weather / Natural Disaster Checklist",
    items: [ 
      "Move to interior shelter or safe zone",
      "Avoid windows and glass",
      "Stay put until all clear",
      "Monitor company alerts"
    ]
  },

  medical: {
    title: "Medical / Health Emergency Checklist",
    items: [
      [
        "If unresponsive or major injury",
        { label: "--Call 911 (calls office now)", link: "tel:7067364748" },
        "--Start CPR / AED"
      ],
      "If minor injury:\n--Locate First Aid Kit\n--Report incident in app",
      "On the job injury requiring medical attention:\n--Contact Human Resources for treatment instructions\n--Arrange for transport to medical facility"
    ]
  }

};