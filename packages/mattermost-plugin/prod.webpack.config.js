const { ModuleFederationPlugin } = require("webpack").container;
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const getProjectRoot = require('../../scripts/webpack/utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const buildPath = path.join(PROJECT_ROOT, 'build')

const clientTransformRules = (projectRoot) => {
  const clientRoot = path.join(projectRoot, 'packages', 'mattermost-plugin')
  console.log('clientRoot', clientRoot)
  return [
    {
      test: /\.tsx?$/,
      // things that need the relay plugin
      include: clientRoot,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: false,
            babelrc: false,
            plugins: [
              [
                'macros',
                {
                  relay: {
                    artifactDirectory: path.join(clientRoot, '__generated__')
                  }
                }
              ],
              //'react-refresh/babel'
            ]
          }
        },
        {
          loader: '@sucrase/webpack-loader',
          options: {
            transforms: ['jsx', 'typescript'],
            jsxRuntime: 'automatic'
          }
        }
      ]
    }
  ]
}
module.exports = (config) => {
  const minimize = config.minimize === 'true'
  return {
    entry: "./index",
    mode: "development",
    devtool: "source-map",
    devServer: {
      allowedHosts: "all",
      //contentBase: path.join(__dirname, "dist"),
      port: 3002,
    },
    output: {
      path: buildPath,
      publicPath: "auto",
      filename: 'mattermost-plugin_[name]_[contenthash].js',
      chunkFilename: 'mattermost-plugin_[name]_[contenthash].js',
      assetModuleFilename: 'mattermost-plugin_[name]_[contenthash][ext]'
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    module: {
      rules: [
        ...clientTransformRules(PROJECT_ROOT),
        {
          test: /\.tsx?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
          options: {
            presets: ["@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      ],
    },
    optimization: {
      minimize,
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.swcMinify,
          parallel: true,
          terserOptions: {
            mangle: true,
            compress: true
          }
        })
      ]
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "parabol",
        filename: "mattermost-plugin-entry.js",
        exposes: {
          "./plugin": "./index",
        },
        /*
        shared: {
          react: {
            singleton: true
          },
          "react-dom": {
            singleton: true
          }
        },
        */
      })
    ],
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      redux: 'Redux',
      'react-redux': 'ReactRedux',
      'prop-types': 'PropTypes',
      'react-bootstrap': 'ReactBootstrap',
      'react-router-dom': 'ReactRouterDom',
    },
  }
}
