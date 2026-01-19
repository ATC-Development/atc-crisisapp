import propertyLocations from "../../data/propertyLocations.json";

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

type PropertyLocation = {
  code: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
};

type PropertyLocationsFile = {
  defaultRadiusMeters: number;
  properties: PropertyLocation[];
};

const locations = propertyLocations as PropertyLocationsFile;

const postToSharePoint = import.meta.env.VITE_POST_TO_SHAREPOINT;

if (!postToSharePoint) {
  throw new Error("VITE_POST_TO_SHAREPOINT is not defined in environment");
}

export const LOCATION_OPTIONS = locations.properties.map(
  (p) => p.name
);

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
    submitUrl: postToSharePoint,
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

