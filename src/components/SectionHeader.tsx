import { createElement, type ReactNode } from 'react'

export interface SectionHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  headingId?: string
}

export const SectionHeader = ({
  title,
  description,
  actions,
  headingId,
}: SectionHeaderProps) => {
  return (
    <header className="section-header">
      <div className="section-header__text">
        {createElement(
          'h2',
          { className: 'section-header__title', id: headingId },
          title
        )}
        {description ? (
          <p className="section-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="section-header__actions">{actions}</div> : null}
    </header>
  )
}

export default SectionHeader
