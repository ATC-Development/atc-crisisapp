export type FieldType = "text" | "integer" | "date" | "datetime" | "boolean";

export type FormSubItem = {
  id: string;
  label: string;
  value: string | number;
  type?: FieldType;
  required?: boolean;
};

export type FormDataItem = {
  id: string;
  label: string;
  value: string | number;
  type?: FieldType;
  required?: boolean;
  subItems?: FormSubItem[];
};


export const FormData: Record<
  string,
  {
    title: string;
    submitUrl: string;
    items: FormDataItem[];
  }
> = {
  witness: {
    title: "Witness Information",
    submitUrl: "https://prod-55.westus.logic.azure.com:443/workflows/c056ff16ee884afd96345604a052290a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Amivf9ycqB_YNDkbNVRP1U_hdfoFL3XwS8MQPCEwwc4",
    items: [
      {
        id: "witnessName",
        label: "Witness Name",
        value: "",
        type: "text",
        required: true,
      },
      {
        id: "date",
        label: "Date",
        value: "",
        type: "date",
        required: true,
      },
      {
        id: "location",
        label: "Location",
        value: "",
        type: "text",
        required: true,
      },
      {
        id: "question1",
        label: "Who was injured (both Employee and others)?",
        value: "",
        type: "text",
        required: true,
      },
      {
        id: "question2",
        label: "How many injured?",
        value: "",
        type: "integer",
        required: true,
      },
      {
        id: "question3",
        label: "Name(s) of injured:",
        value: "",
        type: "text",
      },
      {
        id: "question4",
        label: "What happened?",
        value: "",
        type: "text",
        required: true,
      },
      {
        id: "question5",
        label: "Did anyone witness the event? If so, who?",
        value: "",
        type: "text",
      },
      {
        id: "question6",
        label: "When did it happen?",
        value: "",
        type: "datetime",
        required: true,
      },
      {
        id: "question7",
        label: "Weather conditions?",
        value: "",
        type: "text",
      },
      {
        id: "question8",
        label: "Preliminary opinion of why accident happened?",
        value: "",
        type: "text",
      },
      {
        id: "question9",
        label: "Evacuation plan needed / implemented?",
        value: "",
        type: "text",
      },
      {
        id: "question10",
        label: "ATC employee (supervisor level) to accompany injured worker(s) to local hospital?",
        value: "",
        type: "boolean",
        required: true,
        subItems: [
          {
            id: "atcEmployeeName",
            label: "ATC Employee Name:",
            value: "",
            type: "text",
          },
          {
            id: "injuredName",
            label: "Injured name(s):",
            value: "",
            type: "text",
          },
          {
            id: "hospitalName",
            label: "Hospital Name:",
            value: "",
            type: "text",
          },
        ],
      },
    ],
  },
};

