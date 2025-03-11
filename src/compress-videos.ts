import { getPreferenceValues } from "@raycast/api"

import { compressVideo } from "./utils"

interface Preferences {
  crf_value: string
}

export default async function Command() {
  const preferences = getPreferenceValues<Preferences>()
  const crfValue = preferences.crf_value

  await compressVideo({ crfValue })
}
