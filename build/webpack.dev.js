const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require('webpack');
const { port } = require("./package.json");
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || port;
const PROTOCOL = process.env.PROTOCOL || "http";

const publicPath = `${PROTOCOL}://${HOST}:${PORT}/`;

module.exports = merge(common('development'), {
  mode: "development",
  devtool: "eval-source-map",
  output: {
    // This must be set explicitly for module federation
    publicPath
  },
  devServer: {
    contentBase: "./dist",
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: true,
    https: PROTOCOL === "https",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/base.css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-catalog-view-extension/dist/css'),
          path.resolve(__dirname, 'node_modules/@cloudmosaic/quickstarts/dist/quickstarts.css')
        ],
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "__BASE_PATH__": JSON.stringify(process.env.BASE_PATH || 'https://api.stage.openshift.com'),
      "__PUBLIC_PATH__": JSON.stringify(publicPath)
    }),
  ]
});
