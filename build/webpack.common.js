const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require('webpack');
const { dependencies, federatedModuleName} = require("./package.json");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const yaml = require("js-yaml");
const AssetsPlugin = require('assets-webpack-plugin');
const asciidoctor = require('asciidoctor')();

module.exports = (env, argv, useContentHash) => {

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
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          // only process modules with this loader
          // if they live under a 'fonts' or 'pficon' directory
          include: [
            path.resolve(__dirname, 'node_modules/patternfly/dist/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/pficon')
          ],
          use: {
            loader: 'file-loader',
            options: {
              // Limit at 50k. larger files emited into separate files
              limit: 5000,
              outputPath: 'fonts',
              name: '[name].[ext]'
            }
          }
        },
        {
          test: /\.svg$/,
          include: input => input.indexOf('background-filter.svg') > 1,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'svgs',
                name: '[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/i,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/patternfly'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images')
          ],
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'images',
                name: '[name].[ext]'
              }
            }
          ]
        }
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
            from: '../**/*.quickstart.adoc',
            to: 'generated/guides/[name].html',
            transform(content, absoluteFrom) {
              const base_dir = absoluteFrom.match(/(.*)[\/\\]/)[1]||'';
              const asciidoctorOptions = {
                // https://docs.asciidoctor.org/asciidoc/latest/document/doctypes/
                // article, book, manpage, inline
                doctype: "article",
                // add header/footer when true
                standalone: true,
                safe: "unsafe",
                base_dir,
                sourcemap: true,
                attributes: {
                  "qs": "true"
                }
              };

              return asciidoctor.convert(content, asciidoctorOptions);
            },
            noErrorOnMissing: true
          }
        ]
      }),
      new AssetsPlugin({
        path: './dist',
        keepInMemory: env === "development"
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html')
      }),
      new webpack.container.ModuleFederationPlugin({
        name: federatedModuleName,
        filename: "remoteEntry.js",
        exposes: {
          "./QuickStartDrawer": "./src/app/QuickStartDrawerFederated",
          "./QuickStartCatalog": "./src/app/QuickStartCatalogFederated"
        },
        shared: {
          ...dependencies,
          react: {
            eager: true,
            singleton: true,
            requiredVersion: dependencies["react"],
          },
          "react-dom": {
            eager: true,
            singleton: true,
            requiredVersion: dependencies["react-dom"],
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
