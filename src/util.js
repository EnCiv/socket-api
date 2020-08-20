function validateEnvKey(key) {
  if (!process.env[key]) {
    console.error(
      `${key} needed.  On bash use: export ${key}="your-key-here" or add it to your .bashrc file`
    )
    process.exit()
  }
}

module.exports = validateEnvKey
