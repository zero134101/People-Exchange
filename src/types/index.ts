export interface IUser {
  _id: string
  discordId: string
  username: string
  avatar: string
  krwBalance: number
  reputation: number
  joinedAt: Date
  isAdmin: boolean
  isListed: boolean
  bankAccount?: {
    bank: string
    number: string
    holder: string
  }
  createdAt: Date
}

export interface IStock {
  _id: string
  userId: string
  status: 'pending' | 'listed' | 'delisted' | 'rejected'
  currentPrice: number
  marketCap: number
  totalShares: number
  grade: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  isPublic: boolean
  listedAt: Date
  activityMetrics: {
    messages: number
    voice: number
    attendance: number
    events: number
    contribution: number
    referrals: number
  }
}

export interface IHolding {
  _id: string
  userId: string
  stockId: string
  quantity: number
  avgPrice: number
  purchasedAt: Date
}

export interface ITransaction {
  _id: string
  type: 'buy' | 'sell' | 'deposit' | 'withdraw' | 'dividend' | 'fee'
  userId: string
  stockId?: string
  amount: number
  price: number
  fee: number
  status: 'pending' | 'completed' | 'cancelled'
  description: string
  createdAt: Date
}

export interface INewsDoc {
  _id: string
  title: string
  content: string
  type: 'activity_surge' | 'inactive' | 'event_win' | 'ipo' | 'general'
  relatedUserIds: string[]
  createdAt: string
}

export type GradeType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export const GRADE_THRESHOLDS: Record<GradeType, number> = {
  bronze: 100000,
  silver: 500000,
  gold: 1000000,
  platinum: 5000000,
  diamond: 10000000,
}
