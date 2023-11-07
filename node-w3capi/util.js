import { existsSync } from 'node:fs'

export function checkFsGroup (record) {
  return Object.values(record).every(filename => existsSync(filename))
}
