import React from "react"
import OracleUpload from "./pages/OracleUpload"
import Timesheet from "./pages/Timesheet"
import BillingManager from "./pages/BillingManager"
// import { lazy } from "@loadable/component";

// // Layouts
// // import AuthLayout from "./layouts/Auth";
// import DashboardLayout from "./layouts/Dashboard";

// // import LandingLayout from "./layouts/Landing";

// // Guards
// import AuthGuard from "./components/guards/AuthGuard";
// import PatientForm from "./pages/patient/PatientForm";
// import Patients from "./pages/patient/Patients";

// Landing
// const Landing = lazy(() => import("./pages/landing/Landing"));

// // Dashboards
// const Default = lazy(() => import("./pages/dashboards/Default"));
// const Analytics = lazy(() => import("./pages/dashboards/Analytics"));
// const SaaS = lazy(() => import("./pages/dashboards/SaaS"));
// const Social = lazy(() => import("./pages/dashboards/Social"));
// const Crypto = lazy(() => import("./pages/dashboards/Crypto"));

// // Pages
// const Profile = lazy(() => import("./pages/pages/Profile"));
// const Settings = lazy(() => import("./pages/pages/Settings"));
// const Clients = lazy(() => import("./pages/pages/Clients"));
// const Projects = lazy(() => import("./pages/pages/Projects"));
// const Invoice = lazy(() => import("./pages/pages/Invoice"));
// const Pricing = lazy(() => import("./pages/pages/Pricing"));
// const Tasks = lazy(() => import("./pages/pages/Tasks"));
// const Chat = lazy(() => import("./pages/pages/Chat"));
// const Blank = lazy(() => import("./pages/pages/Blank"));

// Auth
// const Page500 = lazy(() => import("./pages/auth/Page500"));
// const Page404 = lazy(() => import("./pages/auth/Page404"));
// const SignIn = lazy(() => import("./pages/auth/SignIn"));
// const SignUp = lazy(() => import("./pages/auth/SignUp"));
// const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// UI components
// const Alerts = lazy(() => import("./pages/ui/Alerts"));
// const Buttons = lazy(() => import("./pages/ui/Buttons"));
// const Cards = lazy(() => import("./pages/ui/Cards"));
// const Carousel = lazy(() => import("./pages/ui/Carousel"));
// const EmbedVideo = lazy(() => import("./pages/ui/EmbedVideo"));
// const General = lazy(() => import("./pages/ui/General"));
// const Grid = lazy(() => import("./pages/ui/Grid"));
// const Modals = lazy(() => import("./pages/ui/Modals"));
// const Offcanvas = lazy(() => import("./pages/ui/Offcanvas"));
// const Tabs = lazy(() => import("./pages/ui/Tabs"));
// const Typography = lazy(() => import("./pages/ui/Typography"));

// Protected routes
// const ProtectedPage = lazy(() => import("./pages/protected/ProtectedPage"));

// const routes = [
//   {
//     path: "/",
//     element: <DashboardLayout />,
//     children: [
//       {
//         path: "",
//         element: <Landing />,
//       },
//       {
//         path: "patients",
//         element: <Patients />,
//       },
//       {
//         path: "patients/:id",
//         element: <PatientForm />,
//       },
//     ],
//   }
// ];

const routes = [
  {
    path: "",
    element: <div />,
  },
  {
    path: "oracleupload",
    element: <OracleUpload />,
  },
  {
    path: "timetracking",
    element: <Timesheet />,
  },
  {
    path: "billingmanager",
    element: <BillingManager />,
  },
]
export default routes
