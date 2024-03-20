export interface BillingManagerModel {
  id?: string
  client: string
  projectCode: string
  taskCode: string
  billingType?: "Billable" | "NonBillable"
  allocatedHours?: number
  actualHours?: number
}
