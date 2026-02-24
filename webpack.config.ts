import * as webpack from "webpack";
import * as path from "path";
import * as os from "os";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HTMLWebpackPlugin from "html-webpack-plugin";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const mode = process.env.MODE || "development";
const publicPath = process.env.PUBLIC_PATH || "/";
const isBeta = publicPath !== "/";
const deploymentMode = process.env.DEPLOYMENT_MODE || "";
const GH_TOKEN = process.env.GH_TOKEN || "";

const Configuration: webpack.Configuration = {
  entry: ["./src/index.tsx"],
  output: {
    path: path.resolve(__dirname, "build/"),
    publicPath,
    filename: "[name]-bundle.js",
  },
  devtool: "cheap-module-source-map",
  resolve: {
    extensions: [".ts", ".js", ".json", ".html", ".tsx", ".css", ".scss"],
  },
  mode: mode === "development" ? "development" : "production",
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx$|ts$/,
        use: [
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
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/patternfly"),
          path.resolve(__dirname, "node_modules/monaco-editor"),
          path.resolve(__dirname, "node_modules/@patternfly/patternfly"),
          path.resolve(__dirname, "node_modules/@patternfly/react-code-editor"),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-code-editor/node_modules/@patternfly"
          ),
          path.resolve(__dirname, "node_modules/@patternfly/react-styles/css"),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/styles/base.css"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css"
          ),
          path.resolve(
            __dirname,
            "node_modules/react-monaco-editor/node_modules/monaco-editor/"
          ),
        ],
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "assets/images"),
          path.resolve(__dirname, "node_modules/patternfly"),
          path.resolve(__dirname, "node_modules/@patternfly/react-code-editor"),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-code-editor/node_modules/@patternfly"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/patternfly/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-styles/css/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/styles/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images"
          ),
        ],
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 5000,
              name: "[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        // only process modules with this loader
        // if they live under a 'fonts' or 'pficon' directory
        include: [
          path.resolve(__dirname, "node_modules/patternfly/dist/fonts"),
          path.resolve(__dirname, "node_modules/monaco-editor"),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/styles/assets/fonts"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/styles/assets/pficon"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/patternfly/assets/fonts"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/patternfly/assets/pficon"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/patternfly/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/react-monaco-editor/node_modules/monaco-editor/esm/vs"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-styles/css/assets/images"
          ),
        ],
        use: {
          loader: "file-loader",
          options: {
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
            outputPath: "fonts",
            name: "[path][name].[ext]",
          },
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new HTMLWebpackPlugin({
      template:
        __dirname +
        (deploymentMode === "lab"
          ? "/lab-index.html"
          : isBeta
          ? "/index-beta.html"
          : "/index.html"),
      favicon: __dirname + "/assets/images/ocs-logo.png",
    }),
    new webpack.EnvironmentPlugin({
      PUBLIC_PATH: "/",
      DEPLOYMENT_MODE: deploymentMode,
      GH_TOKEN,
    }),
    new MonacoWebpackPlugin({
      languages: ["yaml"],
    }),
  ],
};

export default Configuration;
