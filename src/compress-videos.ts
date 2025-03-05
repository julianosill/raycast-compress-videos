import { getSelectedFinderItems, showToast, Toast } from "@raycast/api"
import { spawn } from "child_process"

async function getVideoDuration(filePath: string): Promise<number> {
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

    ffprobe.stdout.on("data", (data) => stdout += data.toString())
    ffprobe.stderr.on("data", (data) => (stderr += data.toString()))

    ffprobe.on("close", (code) => {
      if (code === 0) return resolve(parseFloat(stdout.trim()))
      reject(new Error(`ffprobe failed: ${stderr}`))
    })

    ffprobe.on("error", (err) => reject(err))
  })
}

export default async function Command() {
  let filePaths: string[]

  try {
    filePaths = (await getSelectedFinderItems()).map((f) => f.path)

    if (filePaths.length <= 0) {
      return await showToast({
        style: Toast.Style.Failure,
        title: "No videos selected in Finder",
      })
    }

    for (const filePath of filePaths) {
      const fileName = filePath.split("/").pop()
      const outputPath = filePath.replace(/(\.\w+)$/, "_compressed$1")

      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Compressing video",
        message: `0%: ${fileName}`,
      })

      const duration = await getVideoDuration(filePath)

      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("/opt/homebrew/bin/ffmpeg", [
          "-i",
          filePath,
          "-c:v",
          "libx264",
          "-crf",
          "25",
          "-preset",
          "medium",
          "-c:a",
          "copy",
          outputPath,
        ])

        ffmpeg.stderr.on("data", (data) => {
          const output = data.toString()
          const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/)
          if (timeMatch) {
            const hours = parseFloat(timeMatch[1])
            const minutes = parseFloat(timeMatch[2])
            const seconds = parseFloat(timeMatch[3])
            const totalSeconds = hours * 3600 + minutes * 60 + seconds

            const progress = Math.round((totalSeconds / duration) * 100)

            toast.message = `${progress}%: ${fileName}`
          }
        })

        ffmpeg.on("close", async (code) => {
          if (code === 0) {
            toast.style = Toast.Style.Success
            toast.title = "Compression complete"
            toast.message = `Compressed ${fileName}`
            return resolve()
          }

          toast.style = Toast.Style.Failure,
          toast.title = "Compression failed"
          toast.message = `Failed to compress ${fileName}`
          reject(new Error(`FFmpeg process exited with code ${code}`))
        })

        ffmpeg.on("error", (err) => reject(err))
      })
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: error instanceof Error ? error.message : "Could not get the selected Finder videos",
    })
  }
}
