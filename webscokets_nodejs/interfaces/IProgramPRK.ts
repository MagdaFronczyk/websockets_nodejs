export interface IProgramPRK {
    id: number,
    title: string,
    lead: string,
    startTime: string,
    stopTime: string,
    fullStartTime: string,
    fullStopTime: string,
    photo: string,
    isOnAir: boolean,
    categoryId: number,
    hosts: Array<any>,
    subPrograms: Array<any>,
    currentDescription: string
}