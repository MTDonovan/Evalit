module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [
    ["@babel/plugin-proposal-pipeline-operator", { proposal: "minimal" }]
  ],
  env: {
    production: {
      plugins: ["transform-remove-console"]
    }
  }
};
