import * as SQLite from 'expo-sqlite';

type Bill = {
    id: string;
    billName: string;
    amount: number;
    date: string;
    status?: string;
    payer?: string;
    description?: string;
};

let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export async function initDB() {
    if (!db) {
        db = await SQLite.openDatabaseAsync('MybillsDB');
        await createTableIfNotExists();
    }
    return db;
}

// Create bills table
async function createTableIfNotExists() {
    if (!db) return;
    try {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        billName TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        status TEXT,
        payer TEXT,
        description TEXT
      );
    `);
    } catch (err) {
        console.error('Error creating table:', err);
    }
}

// Get all bills
export async function getAllBills(): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const result = await db!.getAllAsync<Bill>('SELECT * FROM bills ORDER BY date DESC;');
        return result || [];
    } catch (err) {
        console.error('Error fetching bills:', err);
        return [];
    }
}

// Get bill by ID
export async function getBillById(id: string): Promise<Bill | null> {
    if (!db) await initDB();
    try {
        const result = await db!.getFirstAsync<Bill>('SELECT * FROM bills WHERE id = ?;', [id]);
        return result || null;
    } catch (err) {
        console.error('Error fetching bill:', err);
        return null;
    }
}

// Add bill
export async function addBill(bill: Bill): Promise<boolean> {
    if (!db) await initDB();
    try {
        await db!.runAsync(
            `INSERT INTO bills (id, billName, amount, date, status, payer, description) VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [bill.id, bill.billName, bill.amount, bill.date, bill.status || '', bill.payer || '', bill.description || '']
        );
        return true;
    } catch (err) {
        console.error('Error adding bill:', err);
        return false;
    }
}

// Update bill
export async function updateBill(bill: Bill): Promise<boolean> {
    if (!db) await initDB();
    try {
        await db!.runAsync(
            `UPDATE bills SET billName = ?, amount = ?, date = ?, status = ?, payer = ?, description = ? WHERE id = ?;`,
            [bill.billName, bill.amount, bill.date, bill.status || '', bill.payer || '', bill.description || '', bill.id]
        );
        return true;
    } catch (err) {
        console.error('Error updating bill:', err);
        return false;
    }
}

// Delete bill
export async function deleteBill(id: string): Promise<boolean> {
    if (!db) await initDB();
    try {
        await db!.runAsync(`DELETE FROM bills WHERE id = ?;`, [id]);
        return true;
    } catch (err) {
        console.error('Error deleting bill:', err);
        return false;
    }
}

// Sync bills from JSON to database
export async function syncBillsFromJSON(billsData: Bill[]): Promise<void> {
    if (!db) await initDB();
    try {
        // Clear existing bills
        await db!.execAsync(`DELETE FROM bills;`);
        // Insert new bills
        for (const bill of billsData) {
            await addBill(bill);
        }
        console.log(`Synced ${billsData.length} bills to database`);
    } catch (err) {
        console.error('Error syncing bills:', err);
    }
}

// Get bills by date range
export async function getBillsByDateRange(startDate: string, endDate: string): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const result = await db!.getAllAsync<Bill>(
            `SELECT * FROM bills WHERE date >= ? AND date <= ? ORDER BY date DESC;`,
            [startDate, endDate]
        );
        return result || [];
    } catch (err) {
        console.error('Error fetching bills by date range:', err);
        return [];
    }
}

// Get bills by status
export async function getBillsByStatus(status: string): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const result = await db!.getAllAsync<Bill>(
            `SELECT * FROM bills WHERE status = ? ORDER BY date DESC;`,
            [status]
        );
        return result || [];
    } catch (err) {
        console.error('Error fetching bills by status:', err);
        return [];
    }
}

// Get total spending
export async function getTotalSpending(): Promise<number> {
    if (!db) await initDB();
    try {
        const result = await db!.getFirstAsync<{ total: number }>(
            `SELECT SUM(amount) as total FROM bills;`
        );
        return result?.total || 0;
    } catch (err) {
        console.error('Error calculating total:', err);
        return 0;
    }
}

// Search bills
export async function searchBills(query: string): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const searchTerm = `%${query}%`;
        const result = await db!.getAllAsync<Bill>(
            `SELECT * FROM bills WHERE billName LIKE ? OR payer LIKE ? OR description LIKE ? OR status LIKE ? ORDER BY date DESC;`,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );
        return result || [];
    } catch (err) {
        console.error('Error searching bills:', err);
        return [];
    }
}
