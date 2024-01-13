module.exports = api => {
  api.cache(true)
  return {
    ignore: [/@babel[/\\]runtime/], // 忽略 @babel/runtime
    presets: ['gmfe'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ]
  }
}
