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
  HEARTBEAT = "heartbeat",
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

export type RoundMatchesType = {
  hm: string;
  id: string;
  odds: number[];
  t1: string;
  t2: string;
  sc?: number[];
  ot?: string;
  pt?: number[];
  et?: number[];
};

export type KnockoutRound = {
  index: number;
  name: string;
  isTwoLegged: boolean;
  gridData: {
    headers: string[];
    rows: any[];
  };
};

export type PlayoffItemType = {
  et: number[];
  scleg1: number[];
  scleg2: number[];
  t1: string;
  t2: string;
};

export type TournamentType = {
  league: LegueData;
  isEnded: boolean;
  knockout: {
    rounds: KnockoutRound[];
  };
  playoff: {
    items: PlayoffItemType[];
  };
};

export enum RoundTypesE {
  LEAGUE = "league",
  KNOCKOUT = "knockout",
}

export type CurrentRoundType = {
  name: string;
  roundType: RoundTypesE;
  matches: RoundMatchesType[];
};

export type PublicViewType = {
  lobbyInfo: RoomDataType;
  tournament: TournamentType;
  secsToExtr: number;
  currentRound: CurrentRoundType;
  previousRound: CurrentRoundType;
  canPlaceOutrightBets: boolean;
};

export type RoundBetsPlayer = {
  betBoost: number;
  id: number;
  matchOutcomes: any[];
  stake: number;
};

export type PlayerViewType = {
  name: string;
  playerId: string;
  profit: number;
  returned: number;
  staked: number;
  totalWin: number;
  roundBets?: RoundBetsPlayer[];
};

export type BetItemType = {
  stake: number | string;
  matchId: string;
  outcome: string;
};

export type CreditType = {
  amount: number;
  currency: string;
};
