import React, { useState, useEffect, useRef } from 'react'
import { CiEdit } from "react-icons/ci";
const LogicalPriceEdit = ({
  value,
  onSave
}: {
  value: string
  onSave: (value: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef(null)

  // Synchronize `inputValue` with `value` when `value` changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const formatPriceRange = (
    lowValue: string,
    highValue: string | null = null
  ) => {
    const low = parseInt(lowValue.replace(/[^0-9]/g, ''), 10)
    if (isNaN(low)) return ''

    // Enforce high price constraints (within 1%-10% of low)
    let high = highValue
      ? parseInt(highValue.replace(/[^0-9]/g, ''), 10)
      : Math.round(low * 1.1)

    if (isNaN(high) || high <= low || high > low * 1.1) {
      high = Math.round(low * 1.1) // Default to 10% addition
    }

    return `$${low.toLocaleString()} - $${high.toLocaleString()}`
  }

  useEffect(() => {
    if (!value.includes('-')) {
      const formattedValue = formatPriceRange(value)
      setInputValue(formattedValue)
    }
  }, [value])

  const handleSave = () => {
    const [lowValue, highValue] = inputValue.split('-').map(v => v.trim())
    const formattedValue = formatPriceRange(lowValue, highValue)
    setInputValue(formattedValue) // Update input to formatted value
    onSave(formattedValue) // Call the parent save function
    setIsEditing(false) // Exit editing mode
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInputValue(input) // Allow free editing without enforcing formatting in real-time
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue(value) // Revert to the original value on cancel
    }
  }

  return (
    <span className='w-auto flex items-center justify-start align-middle'>
      {isEditing ? (
        <input
          ref={inputRef}
          type='text'
          value={inputValue} // Bind the input value
          onChange={handleInputChange} // Update value on change
          onBlur={handleSave} // Save on blur
          onKeyDown={handleKeyDown} // Handle Enter and Escape
          autoFocus
          className='w-full border border-mediumgray form-input resize-none overflow-hidden text-sm p-2 rounded'
        />
      ) : (
        <span className='inline-block break-words w-auto'>
          {inputValue}
        </span>
      )}
      {!isEditing && (
        // <i
        //   className='mx-2 text-sm fa-solid fa-pencil cursor-pointer'
        //   onClick={() => setIsEditing(true)}
        // ></i>
        <CiEdit
          className='mx-2 text-sm cursor-pointer w-5 h-5'
          onClick={() => setIsEditing(true)}
        />
      )}
    </span>
  )
}

export default LogicalPriceEdit
