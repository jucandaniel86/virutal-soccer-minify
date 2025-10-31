import { resolve as _resolve, join, dirname } from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

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
];

export default { entry, module, plugins, devServer, output, resolve };
