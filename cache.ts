import { IChannelSong } from "./interfaces/IChannelSong";
import { IProgramMapped } from "./interfaces/IProgramMapped";

const programs = new Map<number, IProgramMapped>();
export const playlists = new Map<number, IChannelSong>();

export const setCurrentForProgram = (programId: number, program: IProgramMapped) => { programs.set(programId, program) };
export const setCurrentForPlaylist = (channelId: number, song: IChannelSong) => playlists.set(channelId, song);

export const currentForProgram = (programId: number) => programs.get(programId);
export const currentForPlaylist = (channelId: number) => playlists.get(channelId);

