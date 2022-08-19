const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require('webpack');
const {dependencies, federatedModuleName} = require("./package.json");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {buildQuickStart} = require('./utils/quickstart-adoc');
const ChunkMapper = require('@redhat-cloud-services/frontend-components-config/chunk-mapper');
const fileRegEx = /\.(png|woff|woff2|eot|ttf|svg|gif|jpe?g|png)(\?[a-z0-9=.]+)?$/;

const quickstartTransform = ({ env, useDir = true }) => ({
  to: ({_context, absoluteFilename}) => {
    // if the quickstart is in the format NAME.quickstart.yml, we use the NAME part for the output 
    const filenameChunks = path.basename(absoluteFilename).split('.');
    // otherwise, the dirname of the quickstart is used as the output key
    const dirName = path.basename(path.dirname(absoluteFilename));
    let outputName = dirName;
    if (!useDir) {
      outputName = filenameChunks[0];
    }
    if (env === "development") {
      return `${outputName}.quickstart.json`
    }
    return `${outputName}.[contenthash].quickstart.json`
  },
  transform: (content, absoluteFilename) => {
    const basePath = path.dirname(absoluteFilename);
    return buildQuickStart(content, absoluteFilename, basePath, {});
  },
  noErrorOnMissing: true
});

const isPatternflyStyles = (stylesheet) => stylesheet.includes('@patternfly/react-styles/css/') || stylesheet.includes('@patternfly/react-core/');

module.exports = (env, argv) => {
  const isProduction = argv && argv.mode === 'production';
  return {
    entry: {
      app: path.resolve(__dirname, 'src', 'index.tsx')
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx)?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
              }
            }
          ]
        },
        {
          test: /\.css|s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
          include: (stylesheet => !isPatternflyStyles(stylesheet)),
          sideEffects: true,
        },
        {
          test: /\.css$/,
          include: isPatternflyStyles,
          use: ['null-loader'],
          sideEffects: true,
        },
        {
          test: fileRegEx,
          type: 'asset/resource',
        },
      ],
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: '../**/quickstart.yml',
            ...quickstartTransform({ env })
          },
          {
            from: './external-documentation/**/*quickstart.yml',
            ...quickstartTransform({ env, useDir: false })
          },
          {
            from: '../**/images/**/*.png',
            to: isProduction ? 'images/[contenthash:8][ext]' : 'images/[name][ext]' ,
            noErrorOnMissing: true
          }
        ]
      }),
      new AssetsPlugin({
        path: './dist',
        keepInMemory: env === "development",
        removeFullPathAutoPrefix: true
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[contenthash:8].css',
        insert: (linkTag) => {
          const preloadLinkTag = document.createElement('link')
          preloadLinkTag.rel = 'preload'
          preloadLinkTag.as = 'style'
          preloadLinkTag.href = linkTag.href
          document.head.appendChild(preloadLinkTag)
          document.head.appendChild(linkTag)
        }
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html')
      }),
      new ChunkMapper({
        modules: [
          federatedModuleName
        ]
      }),
      new webpack.container.ModuleFederationPlugin({
        name: federatedModuleName,
        filename: `${federatedModuleName}${isProduction ? '[chunkhash:8]' : ''}.js`,
        exposes: {
          "./QuickStartCatalog": "./src/app/QuickStartCatalogFederated",
          "./QuickStartLoader": "./src/app/quickstartLoader",
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies["react"],
          },
          "react-dom": {
            singleton: true,
            requiredVersion: dependencies["react-dom"],
          },
          "@rhoas/app-services-ui-shared": {
            singleton: true,
            requiredVersion: dependencies["@rhoas/app-services-ui-shared"]
          },
          "@patternfly/quickstarts": {
            requiredVersion: '*', 
            singleton: true
          },
        },
      })
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, './tsconfig.json')
        })
      ],
      symlinks: false,
      cacheWithContext: false
    }
  };
}
