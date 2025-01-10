import React, { useState, useEffect, useRef } from 'react'

const EditableField = ({
  value,
  onSave,
  isCurrency,
  isHtml = false,
  className = 'justify-start'
}: {
  value: any
  onSave: (value: string) => void
  isCurrency?: boolean
  isHtml?: boolean
  className?: string
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef(null)
  const editorRef = useRef(null)

  // Initialize the content when entering edit mode
  useEffect(() => {
    if (isEditing) {
      if (isHtml && editorRef.current) {
        // Set the initial HTML content
        // @ts-ignore
        editorRef.current.innerHTML = value
        placeCaretAtEnd(editorRef.current)
        // @ts-ignore

        editorRef.current.focus()
      } else if (textareaRef.current) {
        // @ts-ignore

        textareaRef.current.value = value
        adjustTextareaSize()
        // @ts-ignore

        textareaRef.current.focus()
      }
    }
  }, [isEditing, isHtml, value])

  // Function to adjust the textarea height based on content
  const adjustTextareaSize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // @ts-ignore

      textarea.style.height = 'auto'
      // @ts-ignore

      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  // Function to place caret at the end of contentEditable div
  const placeCaretAtEnd = (el: HTMLDivElement | HTMLTextAreaElement) => {
    el.focus()
    if (
      typeof window.getSelection != 'undefined' &&
      typeof document.createRange != 'undefined'
    ) {
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      // @ts-ignore

      sel.removeAllRanges()
      // @ts-ignore

      sel.addRange(range)
    }
  }

  // Handle saving the content
  const handleSave = () => {
    if (isHtml && editorRef.current) {
      // @ts-ignore

      const editedContent = editorRef.current.innerHTML
      onSave(editedContent)
    } else if (textareaRef.current) {
      // @ts-ignore

      const editedText = textareaRef.current.value
      if (isCurrency) {
        const finalValue = parseFloat(editedText.replace(/[^0-9.-]+/g, ''))
        // @ts-ignore

        onSave(finalValue)
      } else {
        onSave(editedText)
      }
    }
    setIsEditing(false)
  }

  // Prevent React from re-rendering the contentEditable div by not tying its content to state
  return (
    <span className={`w-auto flex items-start ${className}`}>
      {isEditing ? (
        isHtml ? (
          <div className='w-full'>
            {/* Editable Div */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleSave}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSave()
                }
              }}
              className='w-full border border-mediumgray p-2 rounded text-sm min-h-[100px] focus:outline-none'
              style={{ overflow: 'auto' }}
            ></div>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            defaultValue={value}
            onChange={adjustTextareaSize}
            onBlur={handleSave}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSave()
              }
            }}
            autoFocus
            className='w-full border border-mediumgray form-input resize-none overflow-hidden text-sm p-2 rounded'
            rows={1}
          />
        )
      ) : isHtml ? (
        <span
          className='inline-block break-words w-auto pr-2'
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <span className='inline-block break-words w-auto pr-2'>
          {isCurrency
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(value)
            : value}
        </span>
      )}
      {!isEditing && (
        <i
          className='mx-2 text-sm fa-solid fa-pencil cursor-pointer'
          onClick={() => setIsEditing(true)}
        ></i>
      )}
    </span>
  )
}

export default EditableField
