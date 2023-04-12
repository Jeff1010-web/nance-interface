import React from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const DEFAULT_STYLE = "w-fit m-2 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-2 py-1 text-sm font-medium disabled:text-black text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"

export default function GenericButton({ children = null, className = "", onClick = undefined }) {
  return (
    <button
      type="button"
      className={classNames(DEFAULT_STYLE, className)}
      onClick={onClick}>
      {children}
    </button>
  )
}
