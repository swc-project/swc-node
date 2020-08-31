import fs from 'fs'

export type Json = Record<
  string,
  string | number | Array<string> | Array<number> | Record<string, string | number | Array<string> | Array<number>>
>

export default function updatePackageJson(path: string, partial: Json) {
  const old = require(path)
  fs.writeFileSync(path, JSON.stringify({ ...old, ...partial }, null, 2))
}
