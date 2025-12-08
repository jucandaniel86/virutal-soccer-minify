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

export type GroupData = {
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
  tournamentNo: number;
  knockout: {
    rounds: KnockoutRound[];
  };
  playoff: {
    items: PlayoffItemType[];
  };
  groups?: GroupData;
};

export enum RoundTypesE {
  LEAGUE = "league",
  KNOCKOUT = "knockout",
  GROUP = "group",
}

export type CurrentRoundType = {
  name: string;
  roundType: RoundTypesE;
  matches: RoundMatchesType[];
};

export type OutrightTeamType = {
  team: string;
  odds: number;
};

export type OutrightGroupType = {
  name: string;
  teamOdds: OutrightTeamType[];
};

export type OutrightBettingType = {
  teamOdds: OutrightTeamType[];
  groups?: OutrightGroupType[];
};

export type PublicViewType = {
  lobbyInfo: RoomDataType;
  tournament: TournamentType;
  secsToExtr: number;
  currentRound: CurrentRoundType;
  previousRound: CurrentRoundType;
  canPlaceOutrightBets: boolean;
  outrightBetting?: OutrightBettingType;
};

export type RoundBetsPlayer = {
  betBoost: number;
  id: number;
  matchOutcomes: any[];
  stake: number;
};

export type PlayerOutrightBetType = {
  id: number;
  odds: number;
  stake: number;
  team: string;
  win: number;
};

export type PlayerViewType = {
  name: string;
  playerId: string;
  profit: number;
  returned: number;
  staked: number;
  totalWin: number;
  roundBets?: RoundBetsPlayer[];
  outrightBets?: PlayerOutrightBetType[];
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

export type ErrorType = {
  errorCode: string | number;
  errorMessage: string;
  errorObject?: { operatorCode: number; operatorMessage: string };
  errorType: string;
};

export const LOG_PROXI = true;
export const OUTRIGHT_TEST = false;
