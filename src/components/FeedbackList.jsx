import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../i18n/LanguageContext'

const PAGE_SIZE = 8

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const IconThumbUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
)

const IconThumbDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
)

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconAlertTriangle = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

function parseDateStr(str) {
  const [datePart, timePart] = str.split(' ')
  const [dd, mm, yyyy] = datePart.split('/')
  const [hh, min] = (timePart || '00:00').split(':')
  return new Date(yyyy, mm - 1, dd, hh, min).getTime()
}

function SortableHeader({ label, sortKey, sort, onSort, center }) {
  const active = sort.key === sortKey
  return (
    <th
      className={`fb-th-sortable${active ? ' fb-th-sortable--active' : ''}`}
      style={center ? { textAlign: 'center' } : undefined}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className="fb-sort-icon">
        {!active ? '↕' : sort.dir === 'asc' ? '↑' : '↓'}
      </span>
    </th>
  )
}

function ConfirmDeleteModal({ onConfirm, onCancel, t }) {
  return createPortal(
    <div className="fb-modal-overlay fb-confirm-overlay" onClick={onCancel}>
      <div className="fb-modal fb-confirm" onClick={e => e.stopPropagation()}>
        <div className="fb-confirm__icon">
          <IconAlertTriangle />
        </div>
        <h3 className="fb-confirm__title">{t('feedback.confirmTitle')}</h3>
        <p className="fb-confirm__message">{t('feedback.confirmMessage')}</p>
        <div className="fb-confirm__actions">
          <button className="fb-confirm__btn fb-confirm__btn--cancel" onClick={onCancel}>
            {t('feedback.confirmCancel')}
          </button>
          <button className="fb-confirm__btn fb-confirm__btn--danger" onClick={onConfirm}>
            <IconTrash />
            {t('feedback.confirmOk')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function FeedbackModal({ item, onClose, t }) {
  if (!item) return null
  return createPortal(
    <div className="fb-modal-overlay" onClick={onClose}>
      <div className="fb-modal" onClick={e => e.stopPropagation()}>
        <div className="fb-modal__header">
          <h3 className="fb-modal__title">{t('feedback.modalTitle')}</h3>
          <button className="fb-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="fb-modal__body">
          <div className="fb-modal__meta-row">
            <span className="fb-modal__tag">{item.model}</span>
            <span className="fb-modal__tag">{item.date}</span>
            <span className={`fb-modal__tag fb-modal__tag--${item.liked ? 'liked' : 'disliked'}`}>
              {item.liked ? <><IconThumbUp /> {t('feedback.useful')}</> : <><IconThumbDown /> {t('feedback.notUseful')}</>}
            </span>
          </div>
          <div className="fb-modal__section">
            <span className="fb-modal__label">{t('feedback.modalAiResponse')}</span>
            <p className="fb-modal__text">{item.content}</p>
          </div>
          <div className="fb-modal__section">
            <span className="fb-modal__label">{t('feedback.modalUserComment')}</span>
            <p className="fb-modal__text fb-modal__text--comment">
              {item.comment || <em className="fb-modal__no-comment">{t('feedback.modalNoComment')}</em>}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function FeedbackList({ feedbacks, onRemove }) {
  const { t } = useLanguage()
  const [modalItem, setModalItem] = useState(null)
  const [pendingRemoveId, setPendingRemoveId] = useState(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  function handleSort(key) {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return { key: null, dir: 'asc' }
    })
    setPage(1)
  }

  const sorted = useMemo(() => {
    if (!sort.key) return feedbacks
    return [...feedbacks].sort((a, b) => {
      let v = 0
      if (sort.key === 'date')  v = parseDateStr(a.date) - parseDateStr(b.date)
      if (sort.key === 'model') v = a.model.localeCompare(b.model)
      if (sort.key === 'liked') v = a.liked === b.liked ? 0 : a.liked ? -1 : 1
      return sort.dir === 'asc' ? v : -v
    })
  }, [feedbacks, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const start = sorted.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const end = Math.min(currentPage * PAGE_SIZE, sorted.length)

  return (
    <div className="curadoria-card curadoria-card--full feedback-list-card">
      <h3 className="curadoria-card__title">{t('feedback.title')}</h3>

      {feedbacks.length === 0 ? (
        <p className="curadoria-card__empty">{t('feedback.empty')}</p>
      ) : (
        <>
          <div className="feedback-table-wrap">
            <table className="feedback-table">
              <thead>
                <tr>
                  <SortableHeader label={t('feedback.colDate')}   sortKey="date"  sort={sort} onSort={handleSort} />
                  <SortableHeader label={t('feedback.colModel')}  sortKey="model" sort={sort} onSort={handleSort} />
                  <SortableHeader label={t('feedback.colRating')} sortKey="liked" sort={sort} onSort={handleSort} center />
                  <th>{t('feedback.colText')}</th>
                  <th>{t('feedback.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(item => (
                  <tr key={item.id}>
                    <td className="fb-col-date">{item.date}</td>
                    <td className="fb-col-model">{item.model}</td>
                    <td className="fb-col-thumb">
                      {item.liked
                        ? <span className="fb-thumb fb-thumb--liked"><IconThumbUp /></span>
                        : <span className="fb-thumb fb-thumb--disliked"><IconThumbDown /></span>
                      }
                    </td>
                    <td className="fb-col-text">
                      {item.comment
                        ? (item.comment.length > 80 ? item.comment.slice(0, 80) + '…' : item.comment)
                        : <em style={{ color: '#5a5a5a' }}>{t('feedback.noComment')}</em>}
                    </td>
                    <td className="fb-col-actions">
                      <button className="fb-action-btn" onClick={() => setModalItem(item)} title="Ver">
                        <IconEye />
                      </button>
                      <button className="fb-action-btn fb-action-btn--danger" onClick={() => setPendingRemoveId(item.id)} title="Remover">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="fb-pagination">
            <span className="fb-pagination__info">
              {start}–{end} {t('feedback.of')} {sorted.length} {sorted.length !== 1 ? t('feedback.feedbacks') : t('feedback.feedback')}
            </span>
            <div className="fb-pagination__controls">
              <button
                className="fb-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title={t('feedback.prevPage')}
              >
                <IconChevronLeft />
              </button>
              <span className="fb-pagination__pages">{currentPage} / {totalPages}</span>
              <button
                className="fb-page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title={t('feedback.nextPage')}
              >
                <IconChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      <FeedbackModal item={modalItem} onClose={() => setModalItem(null)} t={t} />
      {pendingRemoveId !== null && (
        <ConfirmDeleteModal
          onConfirm={() => { onRemove(pendingRemoveId); setPendingRemoveId(null) }}
          onCancel={() => setPendingRemoveId(null)}
          t={t}
        />
      )}
    </div>
  )
}
