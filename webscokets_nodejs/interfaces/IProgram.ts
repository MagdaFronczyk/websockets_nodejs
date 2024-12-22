export interface IProgram {
  Description: null | string;
  StartHour: string
  StopHour: string
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
