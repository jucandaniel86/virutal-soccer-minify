import { resolve as _resolve, join, dirname } from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { fileURLToPath } from "url";
import CopyPlugin from "copy-webpack-plugin";
import { type } from "os";
const __dirname = dirname(fileURLToPath(import.meta.url));
const buildPath = "build";
const resPath = "history";
const logoPath = "logos";
const entry = "./src/index.ts";
const module = {
  rules: [
    {
      test: /\.ts?$/,
      use: "ts-loader",
      exclude: /node_modules/,
    },
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, "css-loader"],
      exclude: /node_modules/,
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif)$/i,
      type: "asset/resource",
      generator: {
        filename: "[name][ext]",
      },
    },
  ],
};
const resolve = {
  extensions: [".tsx", ".ts", ".js"],
};
const output = {
  filename: "[hash].js",
  path: _resolve(__dirname, "build"),
  clean: true,
};
const devServer = {
  static: join(__dirname, "build"),
  compress: true,
  port: 4000,
};

const plugins = [
  new HtmlWebpackPlugin({
    title: "Turbo Footbal",
    template: "src/index.html",
  }),
  new MiniCssExtractPlugin({
    filename: "[hash].css",
  }),
  new CopyPlugin({
    patterns: [
      {
        from: "history/",
        to: _resolve(__dirname, buildPath + "/" + resPath),
        globOptions: {
          ignore: [
            // Ignore all `flp` editor files
            "**/*.flp",
          ],
        },
      },
      {
        from: "logos/",
        to: _resolve(__dirname, buildPath + "/" + logoPath),
        globOptions: {
          ignore: [
            // Ignore all `flp` editor files
            "**/*.flp",
          ],
        },
      },
    ],
  }),
];

export default { entry, module, plugins, devServer, output, resolve };
