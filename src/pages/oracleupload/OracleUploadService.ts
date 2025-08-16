

import DexieUtils from "../../utils/dexie-utils"

export const OracleUploadService = () => {

    const formatLabel = (startDate: Date, endDate: Date): string => {
        const options = { month: "long", day: "numeric", year: "numeric" } as const
        return `${startDate.toLocaleDateString(
            "en-US",
            options
        )} - ${endDate.toLocaleDateString("en-US", options)}`
    }

    const formatDate = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}/${month}/${day}`
    }

    return {
        formatLabel,
        formatDate
    }
}
