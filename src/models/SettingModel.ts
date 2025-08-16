import { ITimezone } from "react-timezone-select"

export interface SettingModel {
  id?: string
  type: "timezone" | "copytimesheet" | "decimalmark" | "worklocation" | "oracleentity" | "isContractual" | "showcomments" 
  | "includecommentsonupload" | "autoSubmitTimesheet" | "billableGoal"
  value: string | boolean | number | undefined | Date | ITimezone | any
  isSynced?: number // 0 for not synced, 1 for synced
}
