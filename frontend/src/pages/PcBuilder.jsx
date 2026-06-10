import { useState, useEffect, useCallback } from 'react'
import { Cpu, Monitor, HardDrive, Zap, Box, Wind, ShoppingCart, CheckCircle, XCircle, ChevronDown, X, Loader2, CircuitBoard, MemoryStick } from 'lucide-react'
import api from '../api/client'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'

const SLOTS = [
  { key: 'cpu',         label: 'Процессор',          category: 'cpu',         Icon: Cpu,          tdpField: 'tdp',     socketField: 'socket' },
  { key: 'motherboard', label: 'Материнская плата',   category: 'motherboard', Icon: CircuitBoard, socketField: 'socket', chipsetField: 'chipset', formFactorField: 'form_factor', ramTypeField: 'ram_type' },
  { key: 'ram',         label: 'Оперативная память',  category: 'ram',         Icon: MemoryStick,  ramTypeField: 'ram_type' },
  { key: 'gpu',         label: 'Видеокарта',          category: 'gpu',         Icon: Monitor,      tdpField: 'tdp' },
  { key: 'storage',     label: 'Накопитель SSD/HDD',  category: 'storage',     Icon: HardDrive },
  { key: 'psu',         label: 'Блок питания',        category: 'psu',         Icon: Zap,          wattageField: 'wattage' },
  { key: 'case',        label: 'Корпус',              category: 'case',        Icon: Box,          formFactorField: 'form_factor' },
  { key: 'cooling',     label: 'Охлаждение',          category: 'cooling',     Icon: Wind },
]

function ProductPickerModal({ slot, onSelect, onClose }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get(`/products?category=${slot.category}&limit=100`)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false))
  }, [slot.category])

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Выбрать: {slot.label}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-gray-100">
          <input
            className="input text-sm"
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">Нет товаров в категории «{slot.label}»</div>
          ) : filtered.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(slot.key, p); onClose() }}
              className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              {p.image_url
                ? <img src={p.image_url} alt={p.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50 shrink-0" />
                : <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                {p.features && Object.keys(p.features).length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {Object.entries(p.features).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </div>
              <span className="font-bold text-primary-700 shrink-0">{p.price.toLocaleString()} ₸</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PcBuilder() {
  const { addItem } = useCart()
  const [selected, setSelected] = useState({})   // { slotKey: product }
  const [modal, setModal] = useState(null)        // slot object or null
  const [compat, setCompat] = useState(null)
  const [psuResult, setPsuResult] = useState(null)
  const [checking, setChecking] = useState(false)

  function selectPart(slotKey, product) {
    setSelected(prev => ({ ...prev, [slotKey]: product }))
  }

  function removePart(slotKey) {
    setSelected(prev => { const n = { ...prev }; delete n[slotKey]; return n })
  }

  const checkBuild = useCallback(async () => {
    const s = selected
    setChecking(true)
    try {
      const cpu = s.cpu?.features || {}
      const mb  = s.motherboard?.features || {}
      const ram = s.ram?.features || {}
      const cas = s.case?.features || {}

      const [compatRes, psuRes] = await Promise.all([
        api.post('/pc-builder/check-compatibility', {
          cpu_socket:              cpu.socket || null,
          motherboard_socket:      mb.socket  || null,
          motherboard_chipset:     mb.chipset || null,
          ram_type:                ram.ram_type || cpu.ram_type || null,
          case_form_factor:        cas.form_factor || null,
          motherboard_form_factor: mb.form_factor || null,
        }),
        api.post('/pc-builder/calc-psu', {
          cpu_tdp:       cpu.tdp       || 65,
          gpu_tdp:       (s.gpu?.features?.tdp) || 0,
          ram_sticks:    2,
          storage_count: s.storage ? 1 : 0,
          extra_fans:    3,
        }),
      ])
      setCompat(compatRes.data)
      setPsuResult(psuRes.data)
    } catch {
      toast.error('Ошибка проверки совместимости')
    } finally {
      setChecking(false)
    }
  }, [selected])

  useEffect(() => {
    if (Object.keys(selected).length > 0) checkBuild()
  }, [selected, checkBuild])

  function addAllToCart() {
    const parts = Object.values(selected)
    if (parts.length === 0) return toast.error('Сборка пуста')
    parts.forEach(p => addItem(p, 1))
    toast.success(`${parts.length} компонентов добавлено в корзину`)
  }

  const totalPrice = Object.values(selected).reduce((s, p) => s + p.price, 0)
  const partCount  = Object.keys(selected).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Конфигуратор ПК</h1>
        <p className="text-gray-500">Выберите совместимые комплектующие и рассчитайте мощность блока питания</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: slots ── */}
        <div className="lg:col-span-2 space-y-3">
          {SLOTS.map(slot => {
            const part = selected[slot.key]
            return (
              <div key={slot.key} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <slot.Icon size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{slot.label}</p>
                  {part ? (
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{part.name}</p>
                      {part.features && Object.keys(part.features).length > 0 && (
                        <span className="text-xs text-gray-400 hidden sm:block truncate">
                          {Object.entries(part.features).slice(0, 2).map(([k,v]) => `${k}: ${v}`).join(' · ')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Не выбрано</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {part && (
                    <>
                      <span className="font-semibold text-primary-700 text-sm">{part.price.toLocaleString()} ₸</span>
                      <button onClick={() => removePart(slot.key)} className="p-1 hover:bg-red-50 hover:text-red-500 text-gray-300 rounded transition-colors">
                        <X size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setModal(slot)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    {part ? 'Заменить' : 'Выбрать'} <ChevronDown size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Right: summary ── */}
        <div className="space-y-4">
          {/* Compatibility */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Совместимость</h3>
            {checking ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Проверяем...
              </div>
            ) : compat ? (
              compat.compatible ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Совместимо</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {compat.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-2">
                      <XCircle size={15} className="mt-0.5 shrink-0" />
                      <span className="text-xs">{issue}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-400">Добавьте компоненты для проверки</p>
            )}
          </div>

          {/* PSU Calculator */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Расчёт блока питания</h3>
            {psuResult ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Потребление системы</span>
                  <span className="font-medium">{psuResult.estimated_load_watts} Вт</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Запас мощности</span>
                  <span className="font-medium text-green-600">+{psuResult.headroom_percent}%</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Рекомендуемый БП</span>
                  <span className="font-bold text-primary-700 text-lg">{psuResult.recommended_psu_watts} Вт</span>
                </div>
                <button
                  onClick={() => setModal(SLOTS.find(s => s.key === 'psu'))}
                  className="btn-secondary w-full text-xs mt-1"
                >
                  Подобрать БП {psuResult.recommended_psu_watts}+ Вт
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Выберите CPU и GPU для расчёта</p>
            )}
          </div>

          {/* Total + Add to cart */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 text-sm">Компонентов</span>
              <span className="font-medium">{partCount} / {SLOTS.length}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-900">Итого</span>
              <span className="font-bold text-primary-700 text-xl">{totalPrice.toLocaleString()} ₸</span>
            </div>
            <button
              onClick={addAllToCart}
              disabled={partCount === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              Добавить всё в корзину
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <ProductPickerModal
          slot={modal}
          onSelect={selectPart}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
