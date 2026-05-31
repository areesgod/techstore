import { Coins } from 'lucide-react'
import { formatPrice } from '../utils/price'

export default function CashbackBadge({ balance }) {
  if (!balance || balance < 1) return null
  return (
    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      <Coins size={13} />
      {formatPrice(balance)} кэшбэк
    </div>
  )
}
