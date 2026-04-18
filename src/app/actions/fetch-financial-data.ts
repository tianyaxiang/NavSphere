'use client'

export interface FinancialDataResponse {
  id: string
  cell: {
    fund_id: string
    fund_nm: string
    price: string
    volume: string
    amount: string
    index_nm: string
    mt_fee: string
    mt_fee_tips: string
    issuer_nm: string
    urls: string
    est_val_dt: string
    increase_rt: string
    discount_rt: string
  }
}

export interface FinancialData {
  code: string
  name: string
  price: number
  volume: string
  amount: string
  index_nm: string
  mt_fee: string
  mt_fee_tips: string
  issuer_nm: string
  issuer_url: string
  navDate: string
  increase_rt: string
  discount_rt: string
}

export async function fetchFinancialData(): Promise<FinancialData[]> {
  const response = await fetch('/api/financial')
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

