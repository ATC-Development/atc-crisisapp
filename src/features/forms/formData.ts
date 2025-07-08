export type FormSubItem = {
    id: string;
    label: string;
    value: string;
};

export type FormDataItem = {
    id: string;
    label: string;
    value: string | number;
    subItems?: FormSubItem[];
};

export const FormData: Record<string, { title: string; items: FormDataItem[] }> = {
    witness: {
        title: "Witness Information",
        items: [
            { id: "witnessName", label: "Witness Name", value: "" },
            { id: "date", label: "Date", value: "" },
            { id: "location", label: "Location", value: "" },
            { id: "question1", label: "Who was injured (both Employee and others)?", value: "" },
            { id: "question2", label: "How many injured?", value: "" },
            { id: "question3", label: "Name(s) of injured:", value: "" },
            { id: "question4", label: "What happened?", value: "" },
            { id: "question5", label: "Did anyone witness the event?  If so, who??", value: "" },
            { id: "question6", label: "When did it happen?", value: "" },
            { id: "question7", label: "Weahter conditions?", value: "" },
            { id: "question8", label: "Preliminary opinion of why accident happened?", value: "" },
            { id: "question9", label: "Evacuation plan needed / implemented?", value: "" },
            { id: "question10", label: "ATC employee (supervisor level) to accompany injured worker(s) to local hospital?", value: "",
                subItems: [
                    { id: "atcEmployeeName", label: "ATC Empolyee Name:", value: "" },
                    { id: "injuredName", label: "Injured names(s):", value: "" },
                    { id: "hospitalName", label: "Hospital Name:", value: "" },
                ]
             }
        ]
    }
}