export enum APP_STATE {
  INIT = "INIT",
  CONNECTED = "CONNECTED",
  LOBBY = "LOBBY",
  JOIN = "JOIN",
  GAME = "GAME",
}

export enum RGS_ACTIONS {
  LOGIN = "login",
  LOBBY = "lobby",
  JOIN = "join",
  GAME = "game",
  BROADCAST = "broadcast",
}

export const GAME_NAME = "Turbo Footbal";
export const APP_LOG = true;

export type RoomDataType = {
  activePlayers: number;
  joinedPlayers: number;
  pot: number;
};

export type RoomType = {
  canJoin: boolean;
  isJoined: boolean;
  drawAt: string;
  id: string;
  data: RoomDataType;
};

export type RoomTypesType = {
  rooms: RoomType[];
  name: string;
  nameResx: string;
  id: string;
  extractionInterval: number;
  bet: number;
  data: any;
};

export type LegueData = {
  gridData: {
    headers: string[];
    rows: any[];
  };
};

export type TournamentType = {
  league: LegueData;
};

export type RoundMatchesType = {
  hm: string;
  id: string;
  odds: number[];
  t1: string;
  t2: string;
  sc?: number[];
  ot?: string;
};

export type CurrentRoundType = {
  name: string;
  roundType: string;
  matches: RoundMatchesType[];
};

export type PublicViewType = {
  lobbyInfo: RoomDataType;
  tournament: TournamentType;
  secsToExtr: number;
  currentRound: CurrentRoundType;
  previousRound: CurrentRoundType;
};

export type BetItemType = {
  stake: number;
  matchId: string;
  outcome: string;
};
