export type FieldType =
  | "text"
  | "integer"
  | "date"
  | "datetime"
  | "boolean"
  | "select"
  | "files";

export type FilePayload = {
  id: string;           // unique id for UI/removal
  name: string;
  contentType: string;  // image/jpeg
  dataUrl: string;      // "data:image/jpeg;base64,...."
};

export type FormSubItem = {
  id: string;
  label: string;
  value: string | number | boolean | FilePayload[];
  type?: FieldType;
  options?: string[];
  required?: boolean;
};

export type FormDataItem = {
  id: string;
  label: string;
  value: string | number | boolean | FilePayload[];
  type?: FieldType;
  options?: string[];
  required?: boolean;
  subItems?: FormSubItem[];
};



export const LOCATION_OPTIONS = [
  "901", "Augustan", "Barrington", "Forest Hills", "Hamilton Park", "Helena Springs", "MacArthur Park", "McHenry Square", "Sanctuary", "Sterlington", "Sterling Place"];

export const FormData: Record<
  string,
  {
    title: string;
    submitUrl: string;
    items: FormDataItem[];
  }
> = {
  incident: {
    title: "Incident Report Form",
    submitUrl: "https://3094d1355179eae8b957f6027e079f.0f.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c056ff16ee884afd96345604a052290a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=vHwaMDnisXPL1aAXiY1Y-CEutP1NvEzSMEUssBy6NlU",
    items: [
        {
        id: "location",
        label: "Location",
        value: "",
        type: "select",
        options: LOCATION_OPTIONS,
        required: true,
      },
      {
        id: "injuredName",
        label: "Name of Injured Person",
        value: "",
        type: "text",
        required: true,
      },
      {
        id: "injuryNature",
        label: "Nature of Injury",
        value: "",
        type: "text",
        required: true,
      },
      {
        id: "injuryBodyPart",
        label: "Body Part Injured",
        value: "",
        type: "text",
        required: true,
      },
      {
        id: "exposureType",
        label: "Exposure Type (if applicable)",
        value: "",
        type: "text",
      },
      {
        id: "photos",
        label: "Photos",
        value: [],
        type: "files",
        required: false,
      }

    ]
  }
};

