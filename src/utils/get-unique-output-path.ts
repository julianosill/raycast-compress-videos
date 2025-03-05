import { existsSync } from "node:fs"

export function getUniqueOutputPath(filePath: string): string {
  const basePath = filePath.replace(/(\.\w+)$/, "_compressed$1")

  let outputPath = basePath
  let counter = 1

  while (existsSync(outputPath)) {
    outputPath = basePath.replace(/(\.\w+)$/, `_${counter}$1`)
    counter++
  }

  return outputPath
}
