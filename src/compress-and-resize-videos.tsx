import { Action, ActionPanel, Form, getPreferenceValues } from "@raycast/api"

import { useForm } from "@raycast/utils"
import { compressVideo } from "./utils"

interface CompressAndResizeFormValues {
  crfValue: string
  width?: string
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>()
  const crfValue = preferences.crf_value

  const { handleSubmit, itemProps } = useForm<CompressAndResizeFormValues>({
    initialValues: { crfValue },
    validation: {
      crfValue: (input) => {
        const value = Number(input)
        if (value <= 0 || value > 51) {
          return "Please insert a number between 0 and 51."
        }
      },
      width: (input) => {
        const isNumber = Number(input) > 0
        if (input && !isNumber) {
          return "Please insert a number."
        }
      },
    },
    onSubmit(values) {
      compressVideo({ crfValue: values.crfValue, width: values.width })
    },
  })

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="CRF Value"
        placeholder="The CRF value for compression. (default: 25)"
        {...itemProps.crfValue}
      />
      <Form.TextField title="Width" placeholder="Set a width to resize. (default: origin)" {...itemProps.width} />
    </Form>
  )
}
