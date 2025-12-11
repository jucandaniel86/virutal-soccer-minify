import { ThemeNames } from "./styles";

export type Logos = {
  path: string;
  theme: string;
};

export type TURBO_FOTBAL_LOGOS = {
  gameID: string | number;
  logos: Logos[];
};

/**
 * gameid 20010 - logo Champions
gameid 20011 - logo AFCoN
gameid 20012 - logo World Cup
 */

export const LOGOS: TURBO_FOTBAL_LOGOS[] = [
  {
    gameID: 20010,
    logos: [
      {
        path: "logo_champions_1.png",
        theme: ThemeNames.DEFAULT,
      },
      {
        path: "logo_champions_1.png",
        theme: ThemeNames.VIRGIN,
      },
      {
        path: "logo_champions_2.png",
        theme: ThemeNames.LIVESCORE,
      },
      {
        path: "logo_champions_3.png",
        theme: ThemeNames.LIVESCORE_BET,
      },
    ],
  },
  {
    gameID: 20011,
    logos: [
      {
        path: "logo_afcon_1.png",
        theme: ThemeNames.DEFAULT,
      },
      {
        path: "logo_afcon_1.png",
        theme: ThemeNames.VIRGIN,
      },
      {
        path: "logo_afcon_2.png",
        theme: ThemeNames.LIVESCORE,
      },
      {
        path: "logo_afcon_3.png",
        theme: ThemeNames.LIVESCORE_BET,
      },
    ],
  },
  {
    gameID: 20012,
    logos: [
      {
        path: "logo_worldcup_1.png",
        theme: ThemeNames.DEFAULT,
      },
      {
        path: "logo_worldcup_1.png",
        theme: ThemeNames.VIRGIN,
      },
      {
        path: "logo_worldcup_2.png",
        theme: ThemeNames.LIVESCORE,
      },
      {
        path: "logo_worldcup_3.png",
        theme: ThemeNames.LIVESCORE_BET,
      },
    ],
  },
];
