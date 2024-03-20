import { Badge } from "react-bootstrap"
import { SidebarItemsType } from "../../../types/sidebar"

import {
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  Grid,
  Heart,
  Layout,
  List,
  PieChart,
  Sliders,
  Folder,
  Clock,
  Users,
  UploadCloud,
  Settings,
  Share,
} from "react-feather"

const pagesSection = [
  {
    href: "/auth",
    icon: Users,
    title: "Auth",
    children: [
      {
        href: "/auth/sign-in",
        title: "Sign In",
      },
      {
        href: "/auth/sign-up",
        title: "Sign Up",
      },
      {
        href: "/auth/reset-password",
        title: "Reset Password",
      },
      {
        href: "/auth/404",
        title: "404 Page",
      },
      {
        href: "/auth/500",
        title: "500 Page",
      },
    ],
  },
] as SidebarItemsType[]

const customPages = [
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
    pages: customPages,
  },
  // {
  //   title: "Pages",
  //   pages: pagesSection,
  // },
  // {
  //   title: "Tools & Components",
  //   pages: componentsSection,
  // },
  // {
  //   title: "Plugins & Addons",
  //   pages: pluginsSection,
  // },
]

export default navItems
