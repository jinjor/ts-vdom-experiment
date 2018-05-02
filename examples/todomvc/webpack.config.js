module.exports = {
  mode: "development",
  entry: `${__dirname}/app.ts`,
  output: {
    path: `${__dirname}/dist`,
    filename: "todo.js"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
