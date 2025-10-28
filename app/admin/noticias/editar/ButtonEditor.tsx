import React, { FC } from 'react'
import { ToolbarButton } from './[slug]/Editor'




const ButtonEditor: FC<ToolbarButton> = ({
    name,
    command,
    isActive,
    Icon,
    
}) => {
  return (
     <button
    onClick={command}
    title={name}
    className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors
      ${isActive ? "bg-red-500" : "bg-white"}
      hover:bg-gray-100`}
  >
    <Icon />
  </button>
  )
}

export default ButtonEditor