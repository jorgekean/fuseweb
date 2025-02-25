import React from "react"

import PerfectScrollbar from "react-perfect-scrollbar"

import useSidebar from "../../../hooks/useSidebar"
import SidebarFooter from "./SidebarFooter"
import SidebarNav from "./SidebarNav"
import Logo from "../../../../public/fuse-logo-2.png"

import { SidebarItemsType } from "../../../types/sidebar"

interface SidebarProps {
  items: {
    title: string
    pages: SidebarItemsType[]
  }[]
  open?: boolean
  showFooter?: boolean
}

const Sidebar = ({ items, showFooter = true }: SidebarProps) => {
  const { isOpen } = useSidebar()

  return (
    <nav className={`sidebar ${!isOpen ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        {/* <img
          alt=""
          src={Logo}
          width="100%"
          height="150"
          className="d-inline-block align-top"
        />{" "} */}
        <PerfectScrollbar>
          <a className="sidebar-brand" href="/">
            {/* <span className="align-middle me-3">Fuse Web</span> */}
          </a>

          <SidebarNav items={items} />
          {/* {!!showFooter && <SidebarFooter />} */}
        </PerfectScrollbar>
      </div>
    </nav>
  )
}

export default Sidebar
