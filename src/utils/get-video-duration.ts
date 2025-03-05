import { spawn } from "node:child_process"

export async function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("/opt/homebrew/bin/ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ])

    let stdout = ""
    let stderr = ""

    ffprobe.stdout.on("data", (data) => (stdout += data.toString()))
    ffprobe.stderr.on("data", (data) => (stderr += data.toString()))

    ffprobe.on("close", (code) => {
      if (code === 0) return resolve(parseFloat(stdout.trim()))
      reject(new Error(`ffprobe failed: ${stderr}`))
    })

    ffprobe.on("error", (err) => reject(err))
  })
}
