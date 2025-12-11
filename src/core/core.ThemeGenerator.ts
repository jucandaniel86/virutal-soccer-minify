import { APP_LOG } from "../config/app";
import { LOGOS } from "../config/logos";
import { AppThemeOptions, ThemeNames, Themes } from "../config/styles";
import { getQueryParams } from "./core.Utils";

interface ThemeGeneratori {
  siteID: string | number;
  gameID: string | number;
}

export class ThemeGenerator {
  private siteID: string | number;
  private gameID: string | number;
  public name = "THEME";
  private currentTheme: ThemeNames = ThemeNames.DEFAULT;

  constructor({ siteID, gameID }: ThemeGeneratori) {
    this.siteID = siteID;
    this.gameID = gameID;
  }

  public getCurrentVars(): AppThemeOptions {
    //@ts-ignore
    const themeID = getQueryParams().theme;

    const currentTheme = Themes.find((theme) => theme.theme === themeID);
    const defaultTheme = Themes.find((theme) => theme.default);

    if (!currentTheme) {
      this.currentTheme = defaultTheme.theme;
      return defaultTheme;
    }

    this.currentTheme = currentTheme.theme;
    return {
      ...defaultTheme,
      ...currentTheme,
    };
  }

  public async generateLogos(themeOptions: AppThemeOptions) {
    const root = document.documentElement;
    const { logoClient } = themeOptions;

    const currentLogo = LOGOS.find(
      (logo) => logo.gameID === parseInt(this.gameID as string)
    );
    const logoHTMLElement = document.getElementById(
      "app-logo"
    ) as HTMLImageElement;
    const screenLogoHTMLElement = document.getElementById(
      "app-screen-logo"
    ) as HTMLImageElement;

    if (currentLogo && logoHTMLElement && screenLogoHTMLElement) {
      let logoPath = currentLogo.logos.find(
        (logo) => logo.theme === this.currentTheme
      );
      if (logoPath) {
        logoHTMLElement.src = `./logos/${logoPath.path}`;
        screenLogoHTMLElement.src = `./logos/${logoPath.path}`;
      }
    }

    if (logoClient) {
      root.style.setProperty("--client-logo", `url(${logoClient})`);
    }
  }

  public generate() {
    const root = document.documentElement;
    if (!root) return;

    const themeVars = this.getCurrentVars();
    this.log(`Current theme:: ${themeVars.name}`);

    themeVars.vars.forEach((_var) =>
      root.style.setProperty(`--${_var.var}`, _var.value)
    );
    this.generateLogos(themeVars);
  }

  log(message: string) {
    if (!APP_LOG) return false;
    console.groupCollapsed(
      `%c ${this.name} :: INFO `,
      `background: #f85b00; color: white; display: block;`
    );
    console.log(message);
    console.groupEnd();
  }
}
