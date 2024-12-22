export interface IProgramMapped {
    Description: null | string;
    StartHour: { _seconds: number; }
    StopHour: { _seconds: number; }
    AntenaId: number;
    Id: number;
    Category: {
        "Name": string | null,
        "Id": number | null
    };
    Leaders: Array<any>;
    ArticleLink: null | string;
    Photo: string;
    Sounds: null | string;
    Title: string;
}