module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Transpile les champs/méthodes privés (#x) que certaines deps shippent en syntaxe
    // moderne, sinon le compilateur Hermes (build de prod) les rejette.
    // `loose: true` pour rester cohérent avec class-properties de babel-preset-expo.
    plugins: [
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
    ],
  };
};
