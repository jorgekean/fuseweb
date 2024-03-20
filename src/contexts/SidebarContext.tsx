import React from "react";

import { SIDEBAR_POSITION, SIDEBAR_BEHAVIOR } from "../constants";

const initialState = {
  isOpen: true,
  setIsOpen: (open: boolean) => {},
  setPosition: (position: string) => {},
  setBehavior: (behavior: string) => {},
  position: SIDEBAR_POSITION.LEFT,
  behavior: SIDEBAR_BEHAVIOR.STICKY,
};

const SidebarContext = React.createContext(initialState);

export default SidebarContext;
