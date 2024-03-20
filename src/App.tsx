import "./App.css"
import AppBar from "./components/layout/NavBar"

import SidebarProvider from "./contexts/SidebarProvider"
import Sidebar from "./components/layout/sidebar/Sidebar"
import navItems from "./components/layout/sidebar/dashboardItems"
import Content from "./components/layout/Content"
import { useRoutes } from "react-router-dom"
import routes from "./routes"

function App() {
  const content = useRoutes(routes)

  return (
    <>
      <AppBar></AppBar>

      <div className="wrapper">
        <SidebarProvider>
          <Sidebar items={navItems}></Sidebar>

          <Content> {content}</Content>
        </SidebarProvider>
        {/* <AppBar></AppBar> */}
        {/* <Sidebar></Sidebar> */}
      </div>
    </>
  )
}

export default App
