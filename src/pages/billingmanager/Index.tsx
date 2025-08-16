import React, { useState, useEffect, useRef } from "react"
import BillingManagerForm from "./BillingManagerForm"
import BillingManagerTable from "./BillingManagerTable"
import BillingManagerContextProvider from "./BillingManagerContext"
import { FaArrowCircleUp } from 'react-icons/fa'; // Example icon
import { Button } from "@headlessui/react";


const BillingManager = () => {

	const [visible, setVisible] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
  
	const toggleVisible = () => {
		// Check if scrollContainerRef is defined and has a current property
		if (scrollContainerRef.current) {
		  const scrolled = scrollContainerRef.current.scrollTop;
		  if (scrolled > 300) {
			setVisible(true);
		  } else {
			setVisible(false);
		  }
		}
	  };
	
	  const scrollToTop = () => {
		if (scrollContainerRef.current) {
		  scrollContainerRef.current.scrollTo({
			top: 0,
			behavior: "smooth",
		  });
		}
	  };
	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		console.log("Scroll Container:", scrollContainer?.scroll);
		if (scrollContainer) {
		  scrollContainer.addEventListener("scroll", toggleVisible);
		}
		return () => {
		  if (scrollContainer) {
			scrollContainer.removeEventListener("scroll", toggleVisible);
		  }
		};
	  }, []);

  return (
    <React.Fragment>
      <BillingManagerContextProvider>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-10">
          {/* <form className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-transform 
        duration-300 transform focus-within:scale-105 focus-within:shadow-[0_4px_20px_rgba(0,188,212,0.3)]"> */}
          <BillingManagerForm />
        </div>
        <div ref={scrollContainerRef} className="bg-white dark:bg-gray-800 p-0 rounded-lg shadow-md overflow-y-auto h-screen">
          <BillingManagerTable />
			<Button className={`hover:text-primary transition-colors duration-200 group fixed bottom-10 right-5 z-50 ${visible ? 'inline-block' : 'hidden'}`}>
				<FaArrowCircleUp
					onClick={scrollToTop}
					size={30}
				/>
			</Button>
        </div>
        
      </BillingManagerContextProvider>
    </React.Fragment>
  )
}

export default BillingManager
