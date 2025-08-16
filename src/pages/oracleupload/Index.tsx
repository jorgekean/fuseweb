import React from "react";
import OracleUploadTable from "./OracleUploadTable";
import OracleUploadContextProvider from "./OracleUploadContext";
import OracleUploadFilters from "./OracleUploadFilters";
import OracleUploadFooter from "./OracleUploadFooter";



const OracleUpload = () => {


    return (
        <React.Fragment>
            <OracleUploadContextProvider>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-10">
                    <OracleUploadFilters />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <OracleUploadTable />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <OracleUploadFooter />
                </div>
            </OracleUploadContextProvider>
        </React.Fragment>
    )
}

export default OracleUpload
