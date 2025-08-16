import React, { useState, useRef, useEffect } from 'react';
import { FaCloudDownloadAlt, FaCloudUploadAlt, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { FaBug, FaQuestionCircle } from 'react-icons/fa';
import themes, { ThemeKey } from '../../../theme.config';
import { useTheme } from '../../context/ThemeContext';
import ProfileImage from '../shared/ProfileImage';
import DexieUtils from '../../utils/dexie-utils';
import { TimesheetData } from '../../models/Timesheet';
import { useMsal } from '@azure/msal-react';
import { BillingManagerModel } from '../../models/BillingManager';
import toast from 'react-hot-toast';
import { FaBullhorn, FaGear, FaShield } from 'react-icons/fa6';

import UsersManual from '../../assets/FuseWebUserManual.pdf';
import FuseTooltip from '../shared/FuseTooltip';
import { adminEmails, apiUrl } from '../../utils/constants';
import FuseInput from '../shared/forms/FuseInput';
import { SettingModel } from '../../models/SettingModel';
import ChangelogsTitle from '../shared/changelogs/ChangelogsTitle';
import Changelog from '../shared/changelogs/Changelogs';
import { changelogs } from "../../../changelogs.json";
import { useGlobalContext } from '../../context/GlobalContext';
import { getItemWithExpiration } from '../../utils/util';

const Header: React.FC = () => {
    const db = DexieUtils<TimesheetData>({ tableName: "timesheet" });
    const dbBilling = DexieUtils<BillingManagerModel>({ tableName: "billingManager" });
    const dbSetting = DexieUtils<SettingModel>({ tableName: "settings" });

    const { modalState, setModalState, showAnnouncementBadge, setShowAnnouncementBadge } = useGlobalContext()

    const { accounts } = useMsal();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(localStorage.getItem("fuse-firsttimeuser") !== "false");
    const { theme, setTheme } = useTheme();
    const [userEmail, setUserEmail] = useState<string>('');
    const popoverRef = useRef<HTMLDivElement | null>(null);

    const togglePopover = () => {
        setIsPopoverOpen(!isPopoverOpen);
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTheme(e.target.value as keyof typeof themes);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setIsPopoverOpen(false);
        }
    };

    // run every 5 mins
    useEffect(() => {
        checkIfHasNewAnnouncementBadge();

        const interval = setInterval(async () => {
            // announcement check badge
            checkIfHasNewAnnouncementBadge();

            console.log("Running scheduled backup...", new Date().toLocaleTimeString());

            // push unsynced data to cosmos db
            const username = accounts[0]?.username || "";

            await syncTimesheetData(username);
            await syncBillingData(username);
            await syncSettingsData(username);
        }, 5 * 60 * 1000); // 5 minutes in milliseconds
        return () => clearInterval(interval);
    }, []);

    // // run every 15 mins - sync to cosmosdb
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         console.log("Running scheduled backup... 15mins", new Date().toLocaleTimeString());
    //     }, 15 * 60 * 1000); // 15 minutes in milliseconds
    //     return () => clearInterval(interval);
    // }, []);

    const pushFromDexieToCosmos = async (data: any) => {
        // call api to save in cosmos db
        // https://localhost:7045/
        // https://fuse-qa.bdaout-test.ehr.com/api/cosmos/backup
        const response = await fetch(`${apiUrl()}/cosmos/backup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        // const jsonData = await responses.json();
        //   console.log("Data from API:", jsonData);

        return response;
    };

    const pushFromDexieToCosmosBillingData = async (data: any) => {
        // call api to save in cosmos db       
        const response = await fetch(`${apiUrl()}/cosmos/billingdata/backup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response;
    };

    const pushFromDexieToCosmosSettingData = async (data: any) => {
        // call api to save in cosmos db       
        const response = await fetch(`${apiUrl()}/cosmos/usersettings/backup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response;
    };
    // latest timesheet(by createddate) that is running, check updatedDate
    const syncTimesheetData = async (username: string): Promise<boolean> => {
        try {
            const dataToSync = await db.getFilteredPaginated("isSynced", "equals", 0, "timesheetDate", "desc", 0, 1000);
            const dataToPush = dataToSync.map(data => ({
                ...data,
                taskDescription: data.taskDescription ?? "",
                employeeId: username,
                isSynced: 1
            }));

            if (dataToPush.length > 0) {
                const res = await pushFromDexieToCosmos(dataToPush);
                if (res.status === 200) {
                    await db.bulkUpdateToTaggedSynced(dataToPush);
                    return true;
                }
                return false;
            }

            // sync for removal timesheets
            const forRemoval = JSON.parse(localStorage.getItem("fusetimesheets-deletedIds") || "[]");
            if (forRemoval.length > 0) {
                const res = await fetch(`${apiUrl()}/cosmos/delete?email=${accounts[0].username}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(forRemoval),
                });

                if (res.status === 200) {
                    localStorage.removeItem("fusetimesheets-deletedIds");
                    return true;
                }
                return false;
            }

            return true; // No data to sync is treated as success
        } catch (error) {
            console.error("Timesheet sync error:", error);
            return false;
        }
    };

    const syncBillingData = async (username: string): Promise<boolean> => {
        try {
            const billingDataToSync = (await dbBilling.getAll()).filter(b => b.isSynced !== 1);
            const billingDataToPush = billingDataToSync.map(data => ({
                ...data,
                employeeId: username,
                isSynced: 1
            }));

            if (billingDataToPush.length > 0) {
                const res = await pushFromDexieToCosmosBillingData(billingDataToPush);
                if (res.status === 200) {
                    await dbBilling.bulkUpdateToTaggedSynced(billingDataToPush);
                    return true;
                }
                return false;
            }

            // sync for removal billins
            const forRemoval = JSON.parse(localStorage.getItem("fusebilling-deletedIds") || "[]");
            if (forRemoval.length > 0) {
                const res = await fetch(`${apiUrl()}/cosmos/billingdata/delete?email=${accounts[0].username}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(forRemoval),
                });

                if (res.status === 200) {
                    localStorage.removeItem("fusebilling-deletedIds");
                    return true;
                }
                return false;
            }

            return true;
        } catch (error) {
            console.error("Billing sync error:", error);
            return false;
        }
    };

    const syncSettingsData = async (username: string): Promise<boolean> => {
        try {
            const settingsDataToSync = (await dbSetting.getAll()).filter(s => s.isSynced !== 1);
            const settingsDataToPush = settingsDataToSync.map(data => ({
                ...data,
                employeeId: username,
                isSynced: 1
            }));

            if (settingsDataToPush.length > 0) {
                const res = await pushFromDexieToCosmosSettingData(settingsDataToPush);
                if (res.status === 200) {
                    await dbSetting.bulkUpdateToTaggedSynced(settingsDataToPush);
                    return true;
                }
                return false;
            }

            return true;
        } catch (error) {
            console.error("Settings sync error:", error);
            return false;
        }
    };

    const handlePushData = async () => {
        setIsBackingUp(true);

        const syncResults: Record<"timesheet" | "billing" | "settings", boolean | null> = {
            timesheet: null,
            billing: null,
            settings: null
        };

        try {
            const username = accounts[0]?.username || "";

            syncResults.timesheet = await syncTimesheetData(username);
            syncResults.billing = await syncBillingData(username);
            syncResults.settings = await syncSettingsData(username);

            const results = Object.values(syncResults);
            const allSuccess = results.every(r => r === true);
            const allFailed = results.every(r => r === false);

            if (allSuccess) {
                toast.success("✅ All data successfully synced to Cosmos DB!", { position: "top-right" });
            } else if (allFailed) {
                toast.error("❌ All sync operations failed. Please try again.", { position: "top-right" });
            } else {
                toast.error("⚠️ Some data failed to sync. Check logs for details.", { position: "top-right" });
            }

        } catch (error) {
            console.error("Unexpected error during sync:", error);
            toast.error("❌ Unexpected error occurred while syncing data.", { position: "top-right" });
        } finally {
            setIsBackingUp(false);
        }
    };


    const viewUsersData = async () => {
        const getres = await fetch(`${apiUrl()}/cosmos/restore/${userEmail}`)
        const dataget = await getres.json()

        // 2. Convert the JSON data to a string and create a Blob
        // Using JSON.stringify with null, 2 for pretty-printing, which is good for readability
        const jsonString = JSON.stringify(dataget, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // 3. Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        // 4. Create a temporary anchor (<a>) element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users_data.json'; // Set the desired filename with .json extension
        document.body.appendChild(a); // Append to body (required for Firefox)
        a.click(); // Programmatically click the link to trigger download

        // 5. Clean up: remove the temporary link and revoke the object URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    }

    const restoreFromCosmos = async () => {
        setIsRestoring(true);
        try {
            const getres = await fetch(`${apiUrl()}/cosmos/restore/${accounts[0].username}`)
            const dataget = await getres.json()
            console.log('Data from CosmosDB:', dataget);
            await db.bulkAdd(dataget);
            toast.success("Data successfully restored from Cosmos DB!", { position: "top-right" });
            // check if there is running then get the most recent one and add localStorage starTime
            const runningTimesheet = dataget.filter((item: TimesheetData) => item.running === true && item.startTime).sort((a: TimesheetData, b: TimesheetData) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime())[0];
            if (runningTimesheet) {
                localStorage.setItem("fuse-startTime", JSON.stringify(runningTimesheet.startTime));
                localStorage.setItem("fuse-runningTimesheet", JSON.stringify(runningTimesheet));
            }

            const getresBilling = await fetch(`${apiUrl()}/cosmos/billingdata/restore/${accounts[0].username}`)
            const datagetBilling = await getresBilling.json()
            console.log("API Data:", datagetBilling)
            await dbBilling.bulkAdd(datagetBilling);
            toast.success("Billing Data successfully restored from Cosmos DB!", { position: "top-right" });

            const getresSetting = await fetch(`${apiUrl()}/cosmos/usersettings/restore/${accounts[0].username}`)
            const datagetSetting = await getresSetting.json()
            console.log("API Data:", datagetSetting)

            dbSetting.clear(); // Clear existing settings before restoring
            await dbSetting.bulkAdd(datagetSetting);
            toast.success("Settings Data successfully restored from Cosmos DB!", { position: "top-right" });

            // refresh the page after 1.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error restoring data from Cosmos DB:', error);
            toast.error("Failed to restore data from Cosmos DB!", { position: "top-right" });
        } finally {
            setIsRestoring(false);
        }
    };

    useEffect(() => {
        // For now let's set isFirstTimeUser to true, if there is no record on BillingManager
        // This is a temporary solution, we will need to implement a better way to check if the user is first time user
        const checkFirstTimeUser = async () => {
            const billingData = await dbBilling.getAll();
            if (billingData.length === 0 && localStorage.getItem("fuse-firsttimeuser") !== "false") {
                setIsFirstTimeUser(true);
            } else {
                setIsFirstTimeUser(false);
            }
            console.log("isFirstTimeUser:", isFirstTimeUser);
        }
        checkFirstTimeUser()


        document.documentElement.classList.add(theme);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, [theme]);

    const handleOpenPDF = async () => {
        try {
            const response = await fetch(UsersManual);
            const blob = await response.blob();

            // Ensure it's treated as a PDF
            const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(blobUrl, '_blank');

            // Optional: revoke the object URL later if you want
            // setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        } catch (err) {
            console.error("Failed to open PDF:", err);
        }
    };

    const handleShowAnnouncement = () => {
        setModalState({
            title: <ChangelogsTitle />,
            showModal: true,
            size: "lg",
            body: (
                <Changelog changelogs={changelogs} />
            ),
            footer: (
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={async () => {
                            setModalState({ ...modalState, showModal: false });
                        }}
                        className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Close
                    </button>
                </div>
            ),
        });
    }

    const checkIfHasNewAnnouncementBadge = () => {
        const lastNotificationDate = getItemWithExpiration("fuse-announcement-effect-date");
        if (!setShowAnnouncementBadge) {
            return; // If setShowAnnouncementBadge is not defined, do nothing
        }

        if (lastNotificationDate) {
            setShowAnnouncementBadge(true);
        } else {
            setShowAnnouncementBadge(false);
        }
    }

    return (
        <header
            className={`bg-white shadow-md p-2 flex justify-between items-center transition-colors duration-300 ${themes[theme].primary}`}
        >
            <div className="flex items-center space-x-4">
                {/* You can add a logo or title here */}
                <h1 className="text-2xl font-bold text-gray-800"></h1>
            </div>
            <div className="flex items-center space-x-4 relative">
                {/* Announcement Button */}
                <FuseTooltip
                    content="Announcement"
                >
                    <div className="relative mt-1">
                        {showAnnouncementBadge && (
                            <span className="absolute top-0 left-0 -mt-1 -ml-3 h-3 w-3 rounded-full bg-red-500 animate-pulse">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            </span>
                        )}
                        <button
                            onClick={handleShowAnnouncement}
                            aria-label="Announcement"
                            className="hover:text-primary transition-colors duration-200 group"
                        >
                            <FaBullhorn size={22} />
                        </button>
                    </div>
                </FuseTooltip>

                {/* Help Button */}
                <FuseTooltip
                    content="Help"
                >
                    <button
                        onClick={() => { handleOpenPDF(); localStorage.setItem("fuse-firsttimeuser", "false"); setIsFirstTimeUser(false); }}
                        aria-label="Help"
                        className="hover:text-primary transition-colors duration-200 group "
                    >
                        <FaQuestionCircle size={22} />
                    </button>
                    {
                        isFirstTimeUser && (<div className="absolute top-2 -left-28 bg-orange-600 text-white font-bold text-sm px-2 py-1 rounded shadow-lg animate-bounce">
                            Help here! 👉
                        </div>)
                    }

                </FuseTooltip>
                {/* Report a Bug Button */}
                <FuseTooltip
                    content="Report a bug"
                >
                    <button
                        onClick={() => window.open("https://willistowerswatson.service-now.com/servicecentral?id=sc_cat_item&sys_id=9fab39e2d7532100a9ad1e173e24d484", "_blank")}
                        aria-label="Report a bug"
                        className="hover:text-primary transition-colors duration-200 group"
                    >
                        <FaBug size={22} />
                    </button>
                </FuseTooltip>
                <FuseTooltip
                    content="Suggestions or enhancements"
                >
                    <button
                        onClick={() => window.open("https://forms.office.com/Pages/ResponsePage.aspx?id=H5LjdptIfkuVR56il63ZtUWIa2sK6wZClo3gUWSICcZURUNJT0lPVjBKVVIwT0xMMEVTNDkyTENSOS4u", "_blank")}
                        aria-label="Suggestions"
                        className="hover:text-primary transition-colors duration-200 group"
                    >
                        <FaLightbulb size={22} />
                    </button>
                </FuseTooltip>
                {/* Settings Button */}
                <button
                    onClick={togglePopover}
                    aria-label="Settings"
                    className="hover:text-primary transition-colors duration-200"
                >
                    <FaGear size={22} />
                </button>
                <ProfileImage className="w-8 h-8 rounded-full border border-gray-200" alt="User Profile" />
                {isPopoverOpen && (
                    <div
                        ref={popoverRef}
                        className={`absolute right-0 top-14 w-56 bg-white rounded-lg shadow-xl p-4 z-50 transition-transform duration-300 ease-out backdrop-blur-sm border border-gray-200 ${themes[theme].secondary}`}
                        style={{
                            transform: isPopoverOpen ? 'scale(1)' : 'scale(0.95)',
                            opacity: isPopoverOpen ? 1 : 0,
                        }}
                    >
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Settings</h2>
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="themeSelect" className="text-sm text-gray-600">Theme</label>
                            <select
                                id="themeSelect"
                                value={theme}
                                onChange={handleThemeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                            >
                                {Object.keys(themes).map((themeKey) => (
                                    <option key={themeKey} value={themeKey}>
                                        {themes[themeKey as ThemeKey].name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4 space-y-2">
                            <button
                                onClick={handlePushData}
                                disabled={isBackingUp}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium bg-primary hover:bg-primary2 transition-colors duration-200 shadow disabled:opacity-50"
                            >
                                {isBackingUp ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Backing up...
                                    </>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt />
                                        Backup Data
                                    </>
                                )}
                            </button>
                            <button
                                onClick={restoreFromCosmos}
                                disabled={isRestoring}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium bg-secondary hover:bg-secondary2 transition-colors duration-200 shadow disabled:opacity-50"
                            >
                                {isRestoring ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Restoring...
                                    </>
                                ) : (
                                    <>
                                        <FaCloudDownloadAlt />
                                        Restore Data
                                    </>
                                )}
                            </button>
                            {accounts.length > 0 && adminEmails.indexOf(accounts[0].username) >= -1 && (
                                <>
                                    <FuseInput
                                        name="userEmail"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        type="text"
                                    // className="px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        onClick={viewUsersData}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium bg-secondary hover:bg-secondary2 transition-colors duration-200 shadow"
                                    >
                                        <>
                                            <FaShield />
                                            View Users Data
                                        </>
                                    </button>
                                </>)}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
