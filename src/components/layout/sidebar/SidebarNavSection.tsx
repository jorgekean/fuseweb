import React from "react";

import SidebarNavList from "./SidebarNavList";
import { SidebarItemsType } from "../../../types/sidebar";

interface SidebarNavSectionProps {
  className?: Element;
  pages: SidebarItemsType[];
  title?: string;
}

const SidebarNavSection = (props: SidebarNavSectionProps) => {
  const { title, pages, className, ...rest } = props;

  return (
    <React.Fragment {...rest}>
      {title && (
        <li key={title} className="sidebar-header">
          {title}
        </li>
      )}
      <SidebarNavList key={title} pages={pages} depth={0} />
    </React.Fragment>
  );
};

export default SidebarNavSection;
