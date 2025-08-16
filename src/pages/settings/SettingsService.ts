import { SettingModel } from "../../models/SettingModel"
import DexieUtils from "../../utils/dexie-utils"

export const SettingsService = () => {
    const db = DexieUtils<SettingModel>({
        tableName: "settings",
    })

    const getSettingByType = async (type: string) => {
        const settings = await db.getAll()
        const setting = settings.find((s) => s.type === type)

        return setting
    }

    return {
        getSettingByType: getSettingByType,
    }
}
