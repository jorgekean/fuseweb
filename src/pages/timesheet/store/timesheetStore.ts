import { create } from 'zustand';
import { v4 as uuidv4 } from "uuid"
import { TimesheetData } from '../../../models/Timesheet';
import { times } from 'lodash';
import { TimesheetService } from '../TimesheetService';

const timesheetService = TimesheetService();

type TimesheetForm = {

};

type TimesheetFormStore = {
    // form: TimesheetForm;
    // setField: <K extends keyof TimesheetForm>(field: K, value: TimesheetForm[K]) => void;
    // setForm: (newForm: Partial<TimesheetForm>) => void;
    // resetForm: () => void;

    items: TimesheetData[];
    getItems: () => TimesheetData[];
    addItem: (item: TimesheetData[]) => void;
    updateItem: (id: number | string, item: Partial<TimesheetData>) => void;
    removeItem: (id: number | string) => void;
    resetItems: () => void;
};

const initialForm: TimesheetForm = {

};

export const useTimesheetFormStore = create<TimesheetFormStore>((set) => ({
    form: initialForm,
    // setField: (field, value) =>
    //     set((state) => ({
    //         form: {
    //             ...state.form,
    //             [field]: value,
    //         },
    //     })),
    // setForm: (newForm) =>
    //     set((state) => ({
    //         form: {
    //             ...state.form,
    //             ...newForm,
    //         },
    //     })),
    // resetForm: () => set({ form: initialForm }),


    // PR Items slice
    items: [],
    getItems: (): TimesheetData[] => useTimesheetFormStore.getState().items,//.filter((item: TimesheetData) => item.isActive),
    addItem: (newItems) =>
        set((state) => {
            const itemsArray = Array.isArray(newItems) ? newItems : [newItems];
            const computedItems = itemsArray.map((item) => {
                return {
                    ...item,
                    id: uuidv4(), // Ensure each item has a unique id                    
                    // isActive: true, // Default to active
                };
            });
            return {
                items: [...state.items, ...computedItems],
            };
        }),
    updateItem: (id, updated) =>
        set((state) => ({
            items: state.items.map((item) => {
                if (item.id !== id) return item;

                const newItem = { ...item, ...updated };
                console.log("newItem", updated);
                // if ('duration' in updated) {
                //     // const qty = Number(newItem.requestedQuantity) || 0;
                //     // const price = Number(newItem.unitPrice) || 0;
                //     // newItem.amount = qty * price;
                // }


                return newItem;
            }),
        })),

    removeItem: (id) =>
        set((state) => ({
            items: state.items.filter((item) => item.id !== id),
        })),
    resetItems: () => set({ items: [] }),
}));