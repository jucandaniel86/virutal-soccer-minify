import { APP_LOG } from "../config/app";
import { AppThemeOptions, Themes } from "../config/styles";
import { getQueryParams } from "./core.Utils";

export class ThemeGenerator {
  private siteID: string | number;
  public name = "THEME";

  constructor(siteID: string | number) {
    this.siteID = siteID;
  }

  public getCurrentVars(): AppThemeOptions {
    //@ts-ignore
    const themeID = getQueryParams().theme;

    const currentTheme = Themes.find((theme) => theme.theme === themeID);
    const defaultTheme = Themes.find((theme) => theme.default);

    if (!currentTheme) return defaultTheme;

    return {
      ...defaultTheme,
      ...currentTheme,
    };
  }

  public async generateLogos(themeOptions: AppThemeOptions) {
    const root = document.documentElement;
    const { logo, logoClient } = themeOptions;

    if (logoClient) {
      root.style.setProperty("--client-logo", `url(${logoClient})`);
    }

    if (logo) {
      root.style.setProperty("--global-logo", `url(${logo})`);
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
