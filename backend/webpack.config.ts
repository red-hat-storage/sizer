import * as webpack from "webpack";
import * as path from "path";
import CopyPlugin from "copy-webpack-plugin";

const Configuration: webpack.Configuration = {
  entry: ["./src/main.ts"],
  output: {
    path: path.resolve(__dirname, "lib/"),
    publicPath: "assets/",
    filename: "[name]-bundle.js"
  },
  resolve: {
    extensions: [".ts", ".js", ".json", ".html"]
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json")
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader"
          },
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./test.html", to: "index.html" },
        { from: "assets", to: "assets" }
      ]
    })
  ]
};

export default Configuration;
