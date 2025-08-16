import { Clock, Folder, Settings, UploadCloud } from "react-feather";
import { SidebarItemsType } from "./types/notused__sidebar";


const pages = [
    {
        href: "/timetracking",
        title: "Time Tracking",
        icon: Clock,
    },
    {
        href: "/billingmanager",
        title: "Billing Manager",
        icon: Folder,
    },
    {
        href: "/oracleupload",
        title: "Oracle Upload",
        icon: UploadCloud,
    },
    {
        href: "/settings",
        title: "Settings",
        icon: Settings,
    },
] as SidebarItemsType[]

const navItems = [
    {
        title: "",
        pages: pages
    }
]


export default navItems