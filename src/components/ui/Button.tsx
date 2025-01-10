// components/Button.js
import React from 'react'

export default function Button ({
  children,
  onClick,
  className = '',
  type = 'button',
  loading = false,
  ...props
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  [key: string]: any
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${loading ? 'opacity-80' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <i className='fa-solid fa-spinner animate-spin'></i>
      ) : (
        children
      )}
    </button>
  )
}
