import { formatPrice } from '../utils/price'

export default function LoyaltyTier({ data, compact = false }) {
  if (!data) return null
  const { current_tier, next_tier, progress_pct, total_spent, cashback_balance } = data

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
        style={{ borderColor: current_tier.color, color: current_tier.color, background: current_tier.color + '18' }}
      >
        <span>{tierEmoji(current_tier.key)}</span>
        {current_tier.name}
        {current_tier.rate > 0 && <span className="opacity-70">· {Math.round(current_tier.rate * 100)}%</span>}
      </div>
    )
  }

  return (
    <div className="card p-5 border-2" style={{ borderColor: current_tier.color + '44' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tierEmoji(current_tier.key)}</span>
          <div>
            <p className="font-bold text-gray-900 text-lg" style={{ color: current_tier.color }}>{current_tier.name}</p>
            <p className="text-xs text-gray-500">
              {current_tier.rate > 0
                ? `Кэшбэк ${Math.round(current_tier.rate * 100)}% при оплате картой`
                : 'Совершите первую покупку для получения кэшбэка'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Потрачено</p>
          <p className="font-bold text-gray-800">{formatPrice(total_spent)}</p>
        </div>
      </div>

      {next_tier && (
        <>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${progress_pct}%`, backgroundColor: current_tier.color }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{current_tier.name}</span>
            <span>До {next_tier.name}: {formatPrice(next_tier.min_spent - total_spent)}</span>
          </div>
        </>
      )}

      {!next_tier && (
        <p className="text-xs text-center font-semibold mt-2" style={{ color: current_tier.color }}>
          🏆 Максимальный уровень достигнут!
        </p>
      )}
    </div>
  )
}

function tierEmoji(key) {
  const map = { new: '👤', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠', elite: '👑', vip: '🌟', legend: '🔥' }
  return map[key] || '👤'
}
