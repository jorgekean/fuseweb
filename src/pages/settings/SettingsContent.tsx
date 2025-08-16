import React, { useEffect, useState } from "react";
import { SettingModel } from "../../models/SettingModel";
import DexieUtils from "../../utils/dexie-utils";
import TimezoneSelect, { type ITimezoneOption, allTimezones } from "react-timezone-select";
import { SettingsService } from "./SettingsService";
import { useGlobalContext } from "../../context/GlobalContext"
import oracleEntityData from "../../oracleEntities.json";
import locationData from "../../worklocations.json";
import { ErrorModel } from "../../models/ErrorModel";
import FuseCombobox from "../../components/shared/forms/FuseCombobox";
import FuseInput from "../../components/shared/forms/FuseInput";

const SettingsContent = () => {
    // const [selectedTimezone, setSelectedTimezone] = useState<ITimezone | undefined>(undefined);
    const [copyTimesheet, setCopyTimesheet] = useState<boolean>(false);
    const [oracleEntity, setOracleEntity] = useState<any>({ id: "3103", description: "3103" });
    const [isPeriodDecimalMark, setIsPeriodDecimalMark] = useState<boolean>(true);
    const [isContractual, setIsContractual] = useState<boolean>(false);
    const [autoSubmitTimesheet, setAutoSubmitTimesheet] = useState<boolean>(true); // New state for Auto Submit Timesheet
    // const [showComments, setShowComments] = useState<boolean>(false);
    const [oracleEntities, setoracleEntities] = useState<string[]>([]);
    const { workLocations, workLocation, timezone, showComments, setWorkLocations, setWorkLocation, setTimezone, setShowComments } = useGlobalContext();

    const [billableGoal, setBillableGoal] = useState<number>(0);
    const db = DexieUtils<SettingModel>({ tableName: "settings" });
    const errorDB = DexieUtils<ErrorModel>({ tableName: "fuse-logs" });

    const settingsService = SettingsService();

    useEffect(() => {
        const getSettingFromDB = async () => {
            try {
                const timezoneSetting = await settingsService.getSettingByType(
                    "timezone"
                )
                if (timezoneSetting) {
                    setTimezone(timezoneSetting.value as string)
                } else {
                    // Use the user's local timezone if no value is found in IndexedDB
                    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
                }

                const workLocationSetting = await settingsService.getSettingByType(
                    "worklocation"
                )
                if (workLocationSetting) {
                    setWorkLocation(workLocationSetting.value as string)
                } else {
                    // Use the user's local timezone if no value is found in IndexedDB
                    // setWorkLocation(Intl.DateTimeFormat().resolvedOptions().timeZone)
                }

                const copyTimesheetSetting = await settingsService.getSettingByType(
                    "copytimesheet"
                )
                if (copyTimesheetSetting) {
                    setCopyTimesheet(copyTimesheetSetting.value as boolean)
                }

                const showCommentsSetting = await settingsService.getSettingByType(
                    "showcomments"
                )
                if (showCommentsSetting) {
                    setShowComments(showCommentsSetting.value as boolean)
                }

                const isPeriodDecimalMarkSetting =
                    await settingsService.getSettingByType("decimalmark")
                if (isPeriodDecimalMarkSetting) {
                    setIsPeriodDecimalMark(isPeriodDecimalMarkSetting.value as boolean)
                }

                const isContractualSetting =
                    await settingsService.getSettingByType("isContractual")
                if (isContractualSetting) {
                    setIsContractual(isContractualSetting.value as boolean)
                }

                const autoSubmitTimesheetSetting =
                    await settingsService.getSettingByType("autoSubmitTimesheet")
                if (autoSubmitTimesheetSetting) {
                    setAutoSubmitTimesheet(autoSubmitTimesheetSetting.value as boolean);
                }


                const oracleEntitySetting = await settingsService.getSettingByType(
                    "oracleentity"
                )
                if (oracleEntitySetting) {
                    setOracleEntity(oracleEntitySetting.value as any)
                }
            } catch (error: any) {
                console.error("Error fetching data:", error)

                errorDB.add({
                    message: error.message,
                    stack: error.stack || String(error), // Use stack or stringify error
                    timestamp: new Date(),
                })
            }
        }

        getSettingFromDB()

        const fetchWorkLocations = async () => {
            setWorkLocations(locationData as any)
        }

        fetchWorkLocations()

        const fetchOracleEntities = async () => {
            setoracleEntities(oracleEntityData as any)
        }

        fetchOracleEntities()
    }, []);

    const handleTimezoneChange = async (timezone: ITimezoneOption) => {
        setTimezone(timezone.value)
        // Update timezone setting in IndexedDB
        const timezoneSetting = (await db.getAll()).find(
            (x) => x.type === "timezone"
        )
        if (timezoneSetting) {
            timezoneSetting.value = timezone.value
            await db.update(timezoneSetting)
        }
    }

    const handleWorkLocationChange = async (value: any) => {
        const selectedItem = value
        setWorkLocation(selectedItem)
        // Update timezone setting in IndexedDB
        const workLocSetting = (await db.getAll()).find(
            (x) => x.type === "worklocation"
        )
        if (workLocSetting) {
            workLocSetting.value = selectedItem
            await db.update(workLocSetting)
        }
    }

    const handleOracleEntityChange = async (value: any) => {
        const selectedItem = value
        setOracleEntity(selectedItem)
        // Update timezone setting in IndexedDB
        const setting = (await db.getAll()).find(
            (x) => x.type === "oracleentity"
        )
        if (setting) {
            setting.value = selectedItem
            await db.update(setting)
        }
    }

    const handleCopyTimesheetChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = e.target.checked
        setCopyTimesheet(newValue)

        const copyTimesheetSetting = (await db.getAll()).find(
            (x) => x.type === "copytimesheet"
        )
        if (copyTimesheetSetting) {
            copyTimesheetSetting.value = newValue
            await db.update(copyTimesheetSetting)
        }
    }

    const handleShowCommentsChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = e.target.checked
        setShowComments(newValue)

        const showCommentsSetting = (await db.getAll()).find(
            (x) => x.type === "showcomments"
        )
        if (showCommentsSetting) {
            showCommentsSetting.value = newValue
            await db.update(showCommentsSetting)
        }


        // if unchecked, set the includeCommentsOnUpload to false
        if (!newValue) {
            const includeCommentsOnUploadSetting = (await db.getAll()).find(
                (x) => x.type === "includecommentsonupload"
            )
            if (includeCommentsOnUploadSetting) {
                includeCommentsOnUploadSetting.value = false
                await db.update(includeCommentsOnUploadSetting)
            }
        }
    }

    const handleDecimalMarkChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = e.target.checked
        setIsPeriodDecimalMark(newValue)

        const setting = (await db.getAll()).find((x) => x.type === "decimalmark")
        if (setting) {
            setting.value = newValue
            await db.update(setting)
        }
    }

    const handleIsContractualChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = e.target.checked
        setIsContractual(newValue)

        const setting = (await db.getAll()).find((x) => x.type === "isContractual")
        if (setting) {
            setting.value = newValue
            await db.update(setting)
        }
    }

    const handleBillableGoalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setBillableGoal(Number(newValue));

        const setting = (await db.getAll()).find((x) => x.type === "billableGoal");
        if (setting) {
            setting.value = newValue;
            await db.update(setting);
        } else {
            // If the setting doesn't exist, add it
            await db.add({
                type: "billableGoal",
                value: newValue,
            });
        }
    }
    const handleAutoSubmitTimesheetChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setAutoSubmitTimesheet(newValue);

        const setting = (await db.getAll()).find((x) => x.type === "autoSubmitTimesheet");
        if (setting) {
            setting.value = newValue;
            await db.update(setting);
        } else {
            // If the setting doesn't exist, add it
            await db.add({
                type: "autoSubmitTimesheet",
                value: newValue,
            });
        }
    }

    return (
        <div>
            <div className="mb-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Timezone:</label>
                {timezone && (
                    <TimezoneSelect
                        value={timezone}
                        onChange={handleTimezoneChange}
                        timezones={{
                            ...allTimezones,
                            "America/Lima": "Pittsburgh",
                            "Europe/Berlin": "Frankfurt",
                        }}
                        className="w-full border border-gray-300 rounded-lg"
                    />
                )}
            </div>

            <div className="mb-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Default Work Location:</label>
                <FuseCombobox
                    placeholder="Select work location"
                    items={workLocations}
                    selectedItem={workLocation}
                    onItemSelect={handleWorkLocationChange}
                    labelKey={"description"}
                    valueKey={"id"}
                />
            </div>

            <div className="flex items-center mb-12">
                {/* The actual checkbox */}
                <input
                    type="checkbox"
                    id="chkCopyTimesheet"
                    className="peer hidden"
                    checked={copyTimesheet}
                    onChange={handleCopyTimesheetChange}
                />

                {/* Label as custom styled checkbox */}
                <label htmlFor="chkCopyTimesheet"
                    className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary2 peer-checked:ring-2 peer-checked:ring-primary cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 20 20"
                    >

                        <path d="m6 10 3 3 6-6" />
                    </svg>
                    {/* Checkmark icon that will appear when checked */}
                    {copyTimesheet && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>
                    }
                </label>
                <label htmlFor="chkCopyTimesheet" className="ml-3 block text-sm font-medium text-gray-700">
                    Copy Timesheets from previous day?
                </label>
            </div>

            <div className="flex items-center mb-12">
                {/* The actual checkbox */}
                <input
                    type="checkbox"
                    id="chkShowComments"
                    className="peer hidden"
                    checked={showComments}
                    onChange={handleShowCommentsChange}
                />

                {/* Label as custom styled checkbox */}
                <label htmlFor="chkShowComments"
                    className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary2 peer-checked:ring-2 peer-checked:ring-primary cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 20 20"
                    >

                        <path d="m6 10 3 3 6-6" />
                    </svg>
                    {/* Checkmark icon that will appear when checked */}
                    {showComments && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>
                    }
                </label>
                <label htmlFor="chkShowComments" className="ml-3 block text-sm font-medium text-gray-700">
                    Show Timesheet Comments?
                </label>
            </div>

            <div className="flex items-center mb-12">
                {/* The actual checkbox */}
                <input
                    type="checkbox"
                    id="chkPeriodDecimalMark"
                    className="peer hidden"
                    checked={isPeriodDecimalMark}
                    onChange={handleDecimalMarkChange}
                />

                {/* Label as custom styled checkbox */}
                <label htmlFor="chkPeriodDecimalMark"
                    className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary2 peer-checked:ring-2 peer-checked:ring-primary cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 20 20"
                    >

                        <path d="m6 10 3 3 6-6" />
                    </svg>
                    {/* Checkmark icon that will appear when checked */}
                    {isPeriodDecimalMark && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>
                    }
                </label>
                <label htmlFor="chkPeriodDecimalMark" className="ml-3 block text-sm font-medium text-gray-700">
                    Decimal Mark: <span className="text-sm text-gray-500">(Check for period (.) or uncheck for comma (,))</span>
                </label>
            </div>

            <div className="flex items-center mb-12">
                {/* The actual checkbox */}
                <input
                    type="checkbox"
                    id="chkIsContractual"
                    className="peer hidden"
                    checked={isContractual}
                    onChange={handleIsContractualChange}
                />

                {/* Label as custom styled checkbox */}
                <label htmlFor="chkIsContractual"
                    className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary2 peer-checked:ring-2 peer-checked:ring-primary cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 20 20"
                    >

                        <path d="m6 10 3 3 6-6" />
                    </svg>
                    {/* Checkmark icon that will appear when checked */}
                    {isContractual && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>
                    }
                </label>
                <label htmlFor="chkIsContractual" className="ml-3 block text-sm font-medium text-gray-700">
                    Contractual? <span className="text-sm text-gray-500">(Are you a contractual employee?)</span>
                </label>
            </div>

            {/* New checkbox for "Auto Submit Timesheet" */}
            <div className="flex items-center mb-12">
                <input
                    type="checkbox"
                    id="chkAutoSubmitTimesheet"
                    className="peer hidden"
                    checked={autoSubmitTimesheet}
                    onChange={handleAutoSubmitTimesheetChange}
                />
                <label htmlFor="chkAutoSubmitTimesheet"
                    className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary2 peer-checked:ring-2 peer-checked:ring-primary cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 20 20"
                    >
                        <path d="m6 10 3 3 6-6" />
                    </svg>
                    {autoSubmitTimesheet && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>}
                </label>
                <label htmlFor="chkAutoSubmitTimesheet" className="ml-3 block text-sm font-medium text-gray-700">
                    Auto Submit Timesheet
                </label>
            </div>

            <div className="mb-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Oracle Entity:</label>
                <FuseCombobox
                    placeholder="Select Oracle Entity"
                    items={oracleEntities}
                    selectedItem={oracleEntity}
                    onItemSelect={handleOracleEntityChange}
                    labelKey={"description"}
                    valueKey={"id"}
                />
            </div>
            <div className="">
                <label className="block text-sm font-medium text-gray-700 mb-2">Billable Goal:</label>
                <FuseInput
                    name="billableGoal"
                    value={String(billableGoal)}
                    onChange={handleBillableGoalChange}
                    type="number"
                />
            </div>
        </div>
    );
};

export default SettingsContent;