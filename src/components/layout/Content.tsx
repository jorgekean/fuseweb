import { ReactNode } from "react"
import "react-bootstrap-typeahead/css/Typeahead.css"

interface ContentProps {
  children?: ReactNode
}

const Content: React.FC<ContentProps> = ({ children }) => (
  <div
    className="content"
    style={{ backgroundColor: "#F7F9FC", padding: "20px", width: "100%" }}
  >
    {children}
  </div>
)

export default Content
