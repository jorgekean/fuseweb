export interface TimesheetData {
  id?: string
  client: { client: string; taskCode: string; projectCode: string } | undefined
  taskDescription: string
  timesheetDate: Date
  duration?: number
  running: boolean
  createdDate: Date

  clientStr?: string
}
