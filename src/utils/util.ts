import toast from "react-hot-toast";
import { BillingManagerModel } from "../models/BillingManager";
import { SettingModel } from "../models/SettingModel";
import { TimesheetData } from "../models/Timesheet";
import { apiUrl } from "./constants";
import DexieUtils from "./dexie-utils";

export const restoreFromCosmosDB = async (username: string) => {
    const db = DexieUtils<TimesheetData>({ tableName: "timesheet" });
    const dbBilling = DexieUtils<BillingManagerModel>({ tableName: "billingManager" });
    const dbSetting = DexieUtils<SettingModel>({ tableName: "settings" });

    try {
        // Timesheet restore
        const getres = await fetch(`${apiUrl()}/cosmos/restore/${username}`);
        const dataget = await getres.json();
        await db.bulkAdd(dataget);
        toast.success("Data successfully restored from Cosmos DB!", { position: "top-right" });

        const runningTimesheet = dataget.filter((item: TimesheetData) => item.running === true && item.startTime).sort((a: TimesheetData, b: TimesheetData) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime())[0];
        if (runningTimesheet) {
            localStorage.setItem("fuse-startTime", JSON.stringify(runningTimesheet.startTime));
            localStorage.setItem("fuse-runningTimesheet", JSON.stringify(runningTimesheet));
        }

        // Billing restore
        const getresBilling = await fetch(`${apiUrl()}/cosmos/billingdata/restore/${username}`);
        const datagetBilling = await getresBilling.json();
        await dbBilling.bulkAdd(datagetBilling);
        toast.success("Billing Data successfully restored from Cosmos DB!", { position: "top-right" });

        // Settings restore
        const getresSetting = await fetch(`${apiUrl()}/cosmos/usersettings/restore/${username}`);
        const datagetSetting = await getresSetting.json();
        await dbSetting.clear(); // clear old data
        await dbSetting.bulkAdd(datagetSetting);
        toast.success("Settings Data successfully restored from Cosmos DB!", { position: "top-right" });

        return true;
    } catch (error) {
        console.error("Restore from Cosmos DB error:", error);
        toast.error("❌ Failed to restore data from Cosmos DB!", { position: "top-right" });
        return false;
    }
};


// Function to set an item with an expiration time
export function setItemWithExpiration(key: string, value: any, minutes: number) {
    const now = new Date();

    // Create an object with the value and the expiration time
    const item = {
        value: value,
        expiry: now.getTime() + minutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// Function to get an item and check its expiration
export function getItemWithExpiration(key: string) {
    const itemStr = localStorage.getItem(key);

    // If the item doesn't exist, return null
    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // Compare the expiration time with the current time
    if (now.getTime() > item.expiry) {
        // If expired, remove the item and return null
        localStorage.removeItem(key);
        return null;
    }

    // Otherwise, return the value
    return item.value;
}