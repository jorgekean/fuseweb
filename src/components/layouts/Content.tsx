import { ReactNode } from "react"

interface ContentProps {
    children?: ReactNode
}

const Content: React.FC<ContentProps> = ({ children }) => (
    <div className="flex flex-col space-y-2 md:space-y-4 text-sm md:text-base dark:text-gray-50">
        {children}
    </div>
)

export default Content
