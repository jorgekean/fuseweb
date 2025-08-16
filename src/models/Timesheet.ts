import { BillingManagerModel } from "./BillingManager"

export interface TimesheetData {
  id?: string
  client: BillingManagerModel | null
  taskDescription: string
  comments?: string
  timesheetDate: Date
  duration?: number
  running: boolean
  createdDate: Date
  startTime?: Date // only for running timesheet
  workLocation: { id: number, description: string } | null
  isSynced: number // 1 or 0

  clientStr?: string
  pausedTime?: Date | undefined
  accumulatedPauseTime?: number
  durationStr?: string
}
