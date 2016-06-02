module.exports = {
  plugins: [
    require('babel-plugin-transform-member-expression-literals'),
    require('babel-plugin-transform-merge-sibling-variables'),
    require('babel-plugin-transform-minify-booleans'),
    require('babel-plugin-transform-property-literals'),
    require('babel-plugin-transform-shorten-identifiers'),
    require('babel-plugin-transform-simplify-comparison-operators'),
    require('babel-plugin-transform-undefined-to-void')
  ]
};
