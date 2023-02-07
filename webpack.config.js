// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const EslingPlugin = require("eslint-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

// const stylesHandler = "style-loader";
const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";

const config = {
  entry: {
    index: path.resolve(__dirname, "./src/index.ts"), // одна входная точка, единый js файл для всех (в твоем случае для двух) страниц!!!!
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
    filename: "[name].[contenthash].js",
    assetModuleFilename: "assets/[name][ext]",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devServer: {
    open: true,
    host: "localhost",
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"), // шаблон
      filename: "index.html", // название выходного файла
      chunks: ["index"], // здесь от названия страницы, ты добавляешь именно тот js файл, который должен быть к ней привязан можно привязать через js
      inject: "body",
    }),
    new EslingPlugin({ extensions: ["ts", "js"] }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.ts$/i,
        use: "ts-loader",
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          stylesHandler,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [[require("postcss-preset-env")]],
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|ttf|woff|woff2|)$/i,
        type: "asset",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      {
        test: /\.(bmp|svg|png|jpg|webp|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "img/[name][contenthash][ext]",
        },
      },
      {
        test: /\.(mp3|wav)$/i,
        type: "asset/resource",
        generator: {
          filename: "audio/[name][ext]",
        },
      },
      {
        test: /\.(mp4|avi)$/i,
        type: "asset/resource",
        generator: {
          filename: "video/[name][ext]",
        },
      },
      {
        test: /\.(json)$/i,
        type: "asset/resource",
        generator: {
          filename: "json/[name][ext]",
        },
      },
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";

    config.plugins.push(new MiniCssExtractPlugin());
  } else {
    config.mode = "development";
  }
  return config;
};
