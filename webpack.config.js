module.exports = {
  entry: "./js/client.js",
  output: {
    filename: "./js/build.js"
  },
  loaders: [
    { test: /\.json$/, loader: "json" }
  ]
};
