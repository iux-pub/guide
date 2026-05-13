const { rmSync } = require('node:fs')
const { resolve } = require('node:path')

rmSync(resolve(process.cwd(), '_site'), { recursive: true, force: true })
