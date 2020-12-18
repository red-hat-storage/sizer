import * as webpack from "webpack";
import * as path from "path";
import * as os from "os";
import CopyPlugin from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

const mode = process.env.MODE || "development";

const Configuration: webpack.Configuration = {
  entry: ["./src/main.ts"],
  output: {
    path: path.resolve(__dirname, "lib/"),
    publicPath: "assets/",
    filename: "[name]-bundle.js",
  },
  resolve: {
    extensions: [".ts", ".js", ".json", ".html"],
    symlinks: false,
  },
  mode: mode === "development" ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: "cache-loader" },
          {
            loader: "thread-loader",
            options: {
              workers: os.cpus().length - 1,
              poolTimeout: mode === "development" ? Infinity : 1000,
            },
          },
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json"),
              happyPackMode: true,
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "assets", "css"),
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/i,
        include: path.resolve(__dirname, "assets"),
        use: [
          {
            loader: "file-loader",
          },
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./test.html", to: "index.html" },
        { from: "./faq.html", to: "faq.html" },
        { from: "assets", to: "assets" },
      ],
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
};

export default Configuration;
