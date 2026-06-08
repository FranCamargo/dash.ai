import { useMemo } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import Sidebar from '../components/sidebar'
import TopBar from '../components/TopBar'
import FeedbackList from '../components/FeedbackList'
import Footer from '../components/Footer'

// Maps every possible first-message (all languages) to an action id
const CONTENT_TO_ACTION = {
  'Quero criar ou analisar uma imagem': 'image',
  'Quero gerar um texto': 'text',
  'Preciso de ajuda com código': 'code',
  'I want to create or analyze an image': 'image',
  'I want to generate a text': 'text',
  'I need help with code': 'code',
  'Quiero crear o analizar una imagen': 'image',
  'Quiero generar un texto': 'text',
  'Necesito ayuda con código': 'code',
}

const ACTION_LABEL_KEYS = {
  image: 'curadoria.qaImage',
  text: 'curadoria.qaText',
  code: 'curadoria.qaCode',
  direct: 'curadoria.qaDirect',
}

function detectQuickActions(history) {
  const counts = { image: 0, text: 0, code: 0, direct: 0 }
  history.forEach(conv => {
    const first = conv.messages.find(m => m.role === 'user')
    if (!first) return
    const actionId = CONTENT_TO_ACTION[first.content]
    if (actionId) counts[actionId]++
    else counts.direct++
  })
  const total = history.length || 1
  return [
    { id: 'image',  count: counts.image,  pct: Math.round((counts.image  / total) * 100) },
    { id: 'text',   count: counts.text,   pct: Math.round((counts.text   / total) * 100) },
    { id: 'code',   count: counts.code,   pct: Math.round((counts.code   / total) * 100) },
    { id: 'direct', count: counts.direct, pct: Math.round((counts.direct / total) * 100) },
  ]
}

function computeStats(history) {
  if (history.length === 0) {
    return { totalConversations: 0, totalMessages: 0, avgMessages: '0.0', engagementRate: 0, acceptanceScore: 0, ratingBased: false, liked: 0, disliked: 0, rated: 0, quickActions: detectQuickActions([]) }
  }

  const details = history.map(conv => {
    const userMsgs = conv.messages.filter(m => m.role === 'user').length
    const botMsgs = conv.messages.filter(m => m.role === 'bot').length
    return { ...conv, userMsgs, botMsgs, total: conv.messages.length }
  })

  const totalMessages = details.reduce((s, c) => s + c.total, 0)
  const avgMessages = (totalMessages / history.length).toFixed(1)
  const multiTurn = details.filter(c => c.userMsgs > 1).length
  const engagementRate = Math.round((multiTurn / history.length) * 100)

  const allBotMsgs = details.flatMap(c => c.messages.filter(m => m.role === 'bot'))
  const ratedMsgs = allBotMsgs.filter(m => m.liked !== null && m.liked !== undefined)
  const likedMsgs = ratedMsgs.filter(m => m.liked === true)
  const dislikedMsgs = ratedMsgs.filter(m => m.liked === false)

  let acceptanceScore, ratingBased
  if (ratedMsgs.length > 0) {
    acceptanceScore = Math.round((likedMsgs.length / ratedMsgs.length) * 100)
    ratingBased = true
  } else {
    const avgNum = parseFloat(avgMessages)
    const lengthScore = Math.max(0, Math.min(100, Math.round(((avgNum - 2) / 6) * 100)))
    acceptanceScore = Math.max(0, Math.min(100, Math.round(engagementRate * 0.5 + lengthScore * 0.5)))
    ratingBased = false
  }

  return {
    totalConversations: history.length,
    totalMessages,
    avgMessages,
    engagementRate,
    acceptanceScore,
    ratingBased,
    liked: likedMsgs.length,
    disliked: dislikedMsgs.length,
    rated: ratedMsgs.length,
    quickActions: detectQuickActions(history),
  }
}

function acceptanceLabel(score, t) {
  if (score >= 70) return { text: t('curadoria.levelHigh'),   color: '#22c55e' }
  if (score >= 35) return { text: t('curadoria.levelMedium'), color: '#f59e0b' }
  return             { text: t('curadoria.levelLow'),          color: '#ef4444' }
}

function LiquidGauge({ score, label, color }) {
  const S = 160, cx = 80, cy = 80, r = 68
  const amp = 5, wl = 90, shift = wl * 2
  const x0 = -shift, x1 = S + shift
  const wy = cy + r - (score / 100) * 2 * r

  const wave = (ph) => {
    let d = ''
    for (let x = x0; x <= x1; x += 4) {
      const y = (wy + amp * Math.sin(2 * Math.PI * (x + ph) / wl)).toFixed(1)
      d += (x === x0 ? `M${x},` : `L${x},`) + y + ' '
    }
    return d + `L${x1},${cy + r + 6} L${x0},${cy + r + 6} Z`
  }

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: 'block' }}>
      <defs>
        <clipPath id="liquid-gauge-clip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.15" />
      <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.03)" />
      <g clipPath="url(#liquid-gauge-clip)">
        <rect x={x0} y={wy + amp} width={x1 - x0} height={S + 10} fill={color} fillOpacity="0.2" />
        <path d={wave(wl * 0.35)} fill={color} fillOpacity="0.18">
          <animateTransform attributeName="transform" type="translate" from="0 0" to={`${-shift} 0`} dur="4s" repeatCount="indefinite" />
        </path>
        <path d={wave(0)} fill={color} fillOpacity="0.5">
          <animateTransform attributeName="transform" type="translate" from="0 0" to={`${-shift} 0`} dur="2.8s" repeatCount="indefinite" />
        </path>
      </g>
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="26" fontWeight="800">
        {score}%
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill={color} fontSize="12" fontWeight="600" opacity="0.9">
        {label}
      </text>
    </svg>
  )
}

const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const IconText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
)

const IconCode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const IconDirect = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const ACTION_ICONS = { image: <IconImage />, text: <IconText />, code: <IconCode />, direct: <IconDirect /> }

const IconMessages = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconTrend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
)

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

function KpiCard({ icon, label, value, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__icon">{icon}</div>
      <div className="kpi-card__body">
        <span className="kpi-card__value">{value}</span>
        <span className="kpi-card__label">{label}</span>
        {sub && <span className="kpi-card__sub">{sub}</span>}
      </div>
    </div>
  )
}

function collectFeedbacks(history) {
  return history.flatMap(conv =>
    conv.messages
      .filter(m => m.role === 'bot' && m.liked !== null && m.liked !== undefined)
      .map(m => ({
        id: m.id,
        convId: conv.id,
        date: (() => {
          const d = new Date(m.id)
          const dd = String(d.getDate()).padStart(2, '0')
          const mo = String(d.getMonth() + 1).padStart(2, '0')
          const hh = String(d.getHours()).padStart(2, '0')
          const mi = String(d.getMinutes()).padStart(2, '0')
          return `${dd}/${mo}/${d.getFullYear()} ${hh}:${mi}`
        })(),
        model: m.model || 'Claude Sonnet',
        liked: m.liked,
        content: m.content,
        comment: m.comment || '',
      }))
  )
}

export default function CuradoriaPage({ user, onLogout, isAdmin, history, activeConvId, onLoadConversation, onGoHome, onOpenCuradoria, onRemoveFeedback }) {
  const { t } = useLanguage()
  const stats = useMemo(() => computeStats(history), [history])
  const feedbacks = useMemo(() => collectFeedbacks(history), [history])
  const acceptance = acceptanceLabel(stats.acceptanceScore, t)

  const levelItems = [
    { labelKey: 'curadoria.levelHigh',   threshold: '≥ 70%', color: '#22c55e', active: stats.acceptanceScore >= 70 },
    { labelKey: 'curadoria.levelMedium', threshold: '≥ 35%', color: '#f59e0b', active: stats.acceptanceScore >= 35 && stats.acceptanceScore < 70 },
    { labelKey: 'curadoria.levelLow',    threshold: '< 35%', color: '#ef4444', active: stats.acceptanceScore < 35 },
  ]

  return (
    <div className="chatbot-layout page-enter">
      <Sidebar
        history={history}
        activeConvId={activeConvId}
        onLoadConversation={onLoadConversation}
        onGoHome={onGoHome}
        onOpenCuradoria={onOpenCuradoria}
        currentView="curadoria"
        isAdmin={isAdmin}
      />
      <main className="chatbot-main">
        <TopBar user={user} onLogout={onLogout} />

        <div className="curadoria-content">
          <div className="curadoria-header">
            <h2 className="curadoria-title">{t('curadoria.title')}</h2>
            <p className="curadoria-subtitle">{t('curadoria.subtitle')}</p>
          </div>

          {history.length === 0 ? (
            <div className="curadoria-empty">
              <IconChart />
              <p>{t('curadoria.empty')}</p>
              <span>{t('curadoria.emptyHint')}</span>
            </div>
          ) : (
            <>
              <div className="kpi-grid">
                <KpiCard icon={<IconUsers />}    label={t('curadoria.kpiConversations')} value={stats.totalConversations} sub={t('curadoria.kpiConversationsSub')} />
                <KpiCard icon={<IconMessages />} label={t('curadoria.kpiMessages')}      value={stats.totalMessages}      sub={t('curadoria.kpiMessagesSub')} />
                <KpiCard icon={<IconTrend />}    label={t('curadoria.kpiAvg')}           value={stats.avgMessages}        sub={t('curadoria.kpiAvgSub')} />
                <KpiCard icon={<IconChart />}    label={t('curadoria.kpiEngagement')}    value={`${stats.engagementRate}%`} sub={t('curadoria.kpiEngagementSub')} />
              </div>

              <div className="curadoria-grid">
                <div className="curadoria-card">
                  <h3 className="curadoria-card__title">{t('curadoria.quickActionsTitle')}</h3>
                  <div className="qa-list">
                    {stats.quickActions.map(a => (
                      <div key={a.id} className="qa-row">
                        <div className="qa-row__icon">{ACTION_ICONS[a.id]}</div>
                        <div className="qa-row__body">
                          <div className="qa-row__top">
                            <span className="qa-row__label">{t(ACTION_LABEL_KEYS[a.id])}</span>
                            <span className="qa-row__count">{a.count}x</span>
                          </div>
                          <div className="qa-row__track">
                            <div className="qa-row__fill" style={{ width: `${a.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="curadoria-card">
                  <h3 className="curadoria-card__title">{t('curadoria.assertiveness')}</h3>
                  <div className="assertividade-body">
                    <LiquidGauge score={stats.acceptanceScore} label={acceptance.text} color={acceptance.color} />
                    <div className="assertividade-stats">
                      {stats.ratingBased ? (
                        <div className="rating-stats">
                          <div className="rating-stat rating-stat--liked">
                            <span className="rating-stat__num">{stats.liked}</span>
                            <span className="rating-stat__lbl">{t('curadoria.usefulReplies')}</span>
                          </div>
                          <div className="rating-stat rating-stat--disliked">
                            <span className="rating-stat__num">{stats.disliked}</span>
                            <span className="rating-stat__lbl">{t('curadoria.notUseful')}</span>
                          </div>
                          <div className="rating-stat">
                            <span className="rating-stat__num">{stats.rated}</span>
                            <span className="rating-stat__lbl">{t('curadoria.totalRatings')}</span>
                          </div>
                          <p className="assertividade-source">{t('curadoria.ratingBased')}</p>
                        </div>
                      ) : (
                        <p className="acceptance-desc">{t('curadoria.engagementBased')}</p>
                      )}
                    </div>
                    <div className="level-legend">
                      {levelItems.map(({ labelKey, threshold, color, active }) => (
                        <span key={labelKey} className={`level-legend__item${active ? ' level-legend__item--active' : ''}`} style={{ color }}>
                          ● {threshold} — {t(labelKey)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <FeedbackList feedbacks={feedbacks} onRemove={onRemoveFeedback} />
            </>
          )}
        </div>
        <Footer />
      </main>
    </div>
  )
}
