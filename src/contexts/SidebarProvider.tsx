import React, { useState } from "react"

import { SIDEBAR_POSITION, SIDEBAR_BEHAVIOR } from "../constants"
import useSettingsState from "../hooks/useSettingsState"

import SidebarContext from "./SidebarContext"

interface SidebarProviderType {
  children: React.ReactNode
}

function SidebarProvider({ children }: SidebarProviderType) {
  const [isOpen, setIsOpen] = useState(true)

  const [position, setPosition] = useSettingsState(
    "sidebarPosition",
    SIDEBAR_POSITION.LEFT
  )
  const [behavior, setBehavior] = useSettingsState(
    "sidebarBehavior",
    SIDEBAR_BEHAVIOR.STICKY
  )

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        position,
        setPosition,
        behavior,
        setBehavior,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export default SidebarProvider
