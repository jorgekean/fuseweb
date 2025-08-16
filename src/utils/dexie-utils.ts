import { useEffect, useState } from "react"
import Dexie, { IndexableType, Table, Transaction, WhereClause } from "dexie"
import { v4 as uuidv4 } from "uuid"

interface Entity {
  id?: string
}

interface DexieUtilsProps<T extends Entity> {
  tableName: string
  onCreating?: () => void // Optional callback for "creating" hook
}

function DexieUtils<T extends Entity>({
  tableName,
  onCreating,
}: DexieUtilsProps<T>) {
  const [db] = useState(new Dexie(tableName))

  useEffect(() => {
    if (db.verno < 1) db.version(1).stores({ [tableName]: "id,isSynced" })

    // Add hook for "creating" event
    db.table(tableName).hook("creating", (newEntity, transaction) => {
      onCreating && onCreating() // Call the function if defined
    })
  }, [])

  async function getAll(): Promise<T[]> {
    return db.table<T>(tableName).toArray()
  }

  async function getFiltered(field: keyof T & string, value: IndexableType): Promise<T[]> {
    return db.table<T>(tableName).where(field).equals(value).toArray();
  }

  async function get(id: string): Promise<T | undefined> {
    return db.table<T>(tableName).get(id)
  }

  async function add(entity: T): Promise<string> {
    const id = uuidv4()
    const entityWithId = { ...entity, id, isSynced: 0 }
    await db.table<T>(tableName).add(entityWithId)

    return id
  }

  async function bulkAdd(entities: T[]): Promise<void> {
    const table = db.table<T>(tableName);

    // Get existing keys to check for duplicates
    const existingKeys = new Set<string>(
      (await table.toArray()).map((entity) => entity.id as string)
    );

    // Parse date strings to Date objects
    const parseDates = (obj: T): T => {
      // Format the date in GMT+8 timezone
      const options = {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      } as Intl.DateTimeFormatOptions;

      const parsedObj = { ...obj };
      (Object.keys(parsedObj) as Array<keyof T>).forEach((key) => {
        const value = parsedObj[key];
        if (typeof value === "string" && !isNaN(Date.parse(value))
          // specify specific date fields if needed
          && (key === "timesheetDate" || key === "createdDate" || key === "pausedTime" || key === "startTime") // Adjust these keys as needed
        ) {
          // Ensure the type remains compatible
          const date = new Date(value);
          (parsedObj[key] as unknown) = new Date(new Intl.DateTimeFormat("en-US", options).format(date));//new Date(value);
        }
      });
      return parsedObj;
    };

    // Filter out entities with duplicate keys and parse dates    
    const uniqueEntities = entities
      .filter((entity) => !existingKeys.has(entity.id ?? ""))
      .map((entity) => ({
        ...parseDates(entity),
        id: entity.id || uuidv4(), // Ensure each entity has a unique ID
      }));

    // Bulk add unique entities
    await table.bulkAdd(uniqueEntities);
  }

  async function bulkUpdateToTaggedSynced(entities: T[]): Promise<void> {
    if (!entities || entities.length === 0) return;

    const table = db.table<T>(tableName);

    // Prepare bulk update operations
    await db.transaction('rw', table, async () => {
      for (const entity of entities) {
        if (entity.id) {
          await table.update(entity.id, { ...entity, isSynced: 1 });
        }
      }
    });
  }

  async function update(entity: T): Promise<void> {
    const { id, ...rest } = entity

    if (id) {
      await db.table<T>(tableName).update(id, { ...rest, isSynced: 0 })
    }
  }

  async function deleteEntity(id: string): Promise<void> {
    return db.table<T>(tableName).delete(id)
  }

  async function clear(): Promise<void> {
    return db.table<T>(tableName).clear()
  }

  async function getEntity(): Promise<Table<T, IndexableType>> {
    return db.table<T>(tableName)
  }


  /**
   * Search for entities by a specific field and value
   * @param field The field name to search by
   * @param value The value to search for
   * @returns A promise that resolves to an array of matching entities
   */
  async function searchByField(
    field: keyof T,
    value: IndexableType
  ): Promise<T[]> {
    // Ensure the field is indexed
    const storeDefinition = { [tableName]: `id,${field as string}` }
    if (db.verno < 2) db.version(1).stores(storeDefinition)

    console.log("searchByField", field, value)
    // Search for entities
    return db.table<T>(tableName).where(field as string).equals(value).toArray()
  }

  async function getFilteredPaginated(
    field: keyof T & string, // Field to filter by
    operator: "equals" | "lt" | "lte" | "gt" | "gte" | "notEqual", // Filtering operators
    value: IndexableType, // Value to filter by
    orderBy: keyof T & string, // Field to order by
    order: "asc" | "desc" = "asc", // Sorting order (default: ascending)
    offset: number = 0, // Pagination offset
    limit: number = 10 // Pagination limit
  ): Promise<T[]> {

    console.log(db.table<T>(tableName).schema.indexes.map(index => index.name));

    let whereClause = db.table<T>(tableName).where(field) as WhereClause<T, IndexableType, T>;
    let query: Dexie.Collection<T, IndexableType>;

    // Apply filtering based on the operator
    switch (operator) {
      case "equals":
        query = whereClause.equals(value);
        break;
      case "lt":
        query = whereClause.below(value);
        break;
      case "lte":
        query = whereClause.belowOrEqual(value);
        break;
      case "gt":
        query = whereClause.above(value);
        break;
      case "gte":
        query = whereClause.aboveOrEqual(value);
        break;
      case "notEqual":
        query = whereClause.notEqual(value);
        break;
      default:
        throw new Error("Invalid operator");
    }

    // Convert to a queryable collection
    let resultQuery = await query.sortBy(orderBy); // Use IndexedDB sorting

    if (order === "desc") {
      resultQuery.reverse(); // Reverse for descending order
    }

    return resultQuery.slice(offset, offset + limit); // Apply pagination efficiently
  }


  return {
    getAll,
    get,
    add,
    bulkAdd,
    update,
    deleteEntity,
    getEntity,
    searchByField,
    getFiltered,
    getFilteredPaginated,
    bulkUpdateToTaggedSynced,
    clear
    // getAllSortedTop10
  }
}

export default DexieUtils
