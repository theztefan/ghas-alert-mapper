// babel.config.cjs
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '20' } }],
    '@babel/preset-typescript'
  ],
  plugins: ['babel-plugin-istanbul']
}
