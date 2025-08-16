import React, { useEffect, useState } from "react";
import { FaCog, FaBars, FaCoins } from "react-icons/fa";
import Logo from "../../assets/orig.png";
import WTWPurpleLogo from "../../assets/purple.png";
import WTWGreenLogo from "../../assets/green.png";
import WtwBrandLogo from "../../assets/brand.png";

import { FaChartSimple, FaClockRotateLeft, FaCloudArrowUp } from "react-icons/fa6";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

// Reusable NavigationItem Component
interface NavigationItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  activePath: string;
  isCollapsed?: boolean;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  text,
  to,
  activePath,
  isCollapsed,
}) => {
  return (
    <li
      className={`hover:bg-gray-300 hover:bg-opacity-50 
                    p-2 rounded flex items-center space-x-3                     
                    ${activePath === to ? "bg-gray-300 bg-opacity-50" : ""
        }`}
    >
      <NavLink to={to} className="flex items-center">
        {icon}
        {!isCollapsed ? <span className="ml-2">{text}</span> : null}
      </NavLink>
    </li>
  );
};

const Navigation: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  // Dynamically select logo based on the theme
  let logoSrc;
  switch (theme) {
    case "WTWBrand":
      logoSrc = WtwBrandLogo;
      break;
    case "WTWPurple":
      logoSrc = WTWPurpleLogo;
      break;
    case "WTWGreen":
      logoSrc = WTWGreenLogo;
      break;
    default:
      logoSrc = Logo;
      break;
  }

  const toggleNavigation = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Automatically update navigation collapse state based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Define your breakpoint (e.g., 768px)
      if (window.innerWidth < 1200) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Check initial window size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav
      className={`bg-navigation dark:bg--800 text-gray-800 dark:text-gray-50 ${isCollapsed ? "w-16" : "w-64"
        } h-full ${isCollapsed ? "p-2" : "p-4"} shadow-lg transition-width border-r-4 border-gray-100 dark:border-gray-700 duration-300`}
    >
      {/* Toggle Button (Hamburger Icon) */}
      <div className={`flex ${isCollapsed ? "justify-center" : "justify-end"} items-center`}>
        <button onClick={toggleNavigation} className="text-navigationtext dark:text-gray-50 focus:outline-none">
          <FaBars size={isCollapsed ? 20 : 24} />
        </button>
      </div>

      {/* Logo */}
      {isCollapsed ? null : (<div className="flex items-center justify-center">
        <img src={logoSrc} alt="Logo" />
      </div>)}

      {/* Navigation Items */}
      <ul className={`space-y-4 text-navigationtext ${isCollapsed ? "mt-4" : ""}`}>
        <NavigationItem
          icon={<FaClockRotateLeft size={isCollapsed ? 20 : 30} />}
          text="TIME TRACKING"
          to="/"
          activePath={location.pathname}
          isCollapsed={isCollapsed}
        />
        <NavigationItem
          icon={<FaCoins size={isCollapsed ? 20 : 30} />}
          text="BILLING MANAGER"
          to="/billingmanager"
          activePath={location.pathname}
          isCollapsed={isCollapsed}
        />
        <NavigationItem
          icon={<FaCloudArrowUp size={isCollapsed ? 20 : 30} />}
          text="ORACLE UPLOAD"
          to="/oracleupload"
          activePath={location.pathname}
          isCollapsed={isCollapsed}
        />
        <NavigationItem
          icon={<FaCog size={isCollapsed ? 20 : 30} />}
          text="SETTINGS"
          to="/settings"
          activePath={location.pathname}
          isCollapsed={isCollapsed}
        />
        {/* Uncomment if needed
        <NavigationItem
          icon={<FaChartSimple size={30} />}
          text="DAILY STATUS REPORT"
          to="/dailystatusreport"
          activePath={location.pathname}
          isCollapsed={isCollapsed}
        />
        */}
      </ul>
    </nav>
  );
};

export default Navigation;
