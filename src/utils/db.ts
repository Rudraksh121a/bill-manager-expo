import * as SQLite from 'expo-sqlite';

export type Bill = {
    id: string;
    billName: string;
    amount: number;
    date: string;
    status?: string;
    payer?: string;
    description?: string;
    sessionId: string;
};

export type Session = {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    isActive: boolean;
};

let db: SQLite.SQLiteDatabase | null = null;

let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Initialize database (singleton pattern with promise)
export async function initDB() {
    if (!db && !initPromise) {
        initPromise = (async () => {
            try {
                console.log('Opening database: MybillsDB');
                db = await SQLite.openDatabaseAsync('MybillsDB');
                console.log('Database opened successfully');
                await createTableIfNotExists();
                console.log('Database initialization completed');
                return db;
            } catch (error) {
                console.error('Failed to initialize database:', error);
                db = null;
                initPromise = null;
                throw error;
            }
        })();
    }
    
    if (initPromise) {
        await initPromise;
    }
    
    return db!;
}

// Database version for migrations
const DB_VERSION = 2;

// Create bills and sessions tables with migration support
async function createTableIfNotExists() {
    if (!db) return;
    try {
        console.log('Starting database initialization...');
        
        // First, always create sessions table (if not exists)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                createdAt TEXT NOT NULL,
                isActive INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('Sessions table ensured');
        
        // Check if bills table exists (for existing installations)
        const tableExists = await db.getFirstAsync(`SELECT name FROM sqlite_master WHERE type='table' AND name='bills';`);
        console.log('Bills table exists:', !!tableExists);
        
        if (tableExists) {
            // Check if sessionId column exists
            const tableInfo = await db.getAllAsync(`PRAGMA table_info(bills);`);
            const hasSessionId = tableInfo.some((column: any) => column.name === 'sessionId');
            console.log('Bills table has sessionId column:', hasSessionId);
            
            if (!hasSessionId) {
                console.log('Existing database detected, running migration...');
                await migrateToVersion2();
            } else {
                console.log('Database already migrated');
            }
        } else {
            console.log('New installation detected, creating bills table...');
            await db.execAsync(`
                CREATE TABLE bills (
                    id TEXT PRIMARY KEY,
                    billName TEXT NOT NULL,
                    amount REAL NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT,
                    payer TEXT,
                    description TEXT,
                    sessionId TEXT NOT NULL,
                    FOREIGN KEY (sessionId) REFERENCES sessions (id)
                );
            `);
            console.log('Bills table created');
        }
        
        // Create default session if no sessions exist
        await createDefaultSessionIfNeeded();
        
        console.log('Database initialization completed successfully!');
    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
}

// Create tables for new installations
async function createTables() {
    if (!db) return;
    
    // Create sessions table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            createdAt TEXT NOT NULL,
            isActive INTEGER NOT NULL DEFAULT 0
        );
    `);

    // Create bills table with sessionId
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS bills (
            id TEXT PRIMARY KEY,
            billName TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            status TEXT,
            payer TEXT,
            description TEXT,
            sessionId TEXT NOT NULL,
            FOREIGN KEY (sessionId) REFERENCES sessions (id)
        );
    `);
}

// Migration to version 2 (adds sessions and sessionId to bills)
async function migrateToVersion2() {
    if (!db) return;
    
    try {
        console.log('Starting migration to version 2...');
        
        // Sessions table should already exist from createTableIfNotExists
        
        // Create default session first (if not exists)
        const existingSessions = await db.getAllAsync<Session>('SELECT * FROM sessions LIMIT 1;');
        let defaultSessionId: string;
        
        if (existingSessions.length === 0) {
            defaultSessionId = 'default-session-migration-' + Date.now();
            console.log('Creating default session for migration:', defaultSessionId);
            
            await db.runAsync(
                `INSERT INTO sessions (id, name, description, createdAt, isActive) VALUES (?, ?, ?, ?, ?);`,
                [defaultSessionId, 'Personal Bills', 'Default session for personal bill management', new Date().toISOString(), 1]
            );
        } else {
            defaultSessionId = existingSessions[0].id;
            console.log('Using existing session for migration:', defaultSessionId);
        }
        
        // Add sessionId column to bills table
        console.log('Adding sessionId column to bills table...');
        try {
            await db.execAsync(`ALTER TABLE bills ADD COLUMN sessionId TEXT;`);
            console.log('SessionId column added successfully');
        } catch (alterError: any) {
            if (alterError.message?.includes('duplicate column name')) {
                console.log('SessionId column already exists, continuing...');
            } else {
                throw alterError;
            }
        }
        
        // Update all existing bills to use the default session
        console.log('Updating existing bills with default session ID...');
        const updateResult = await db.runAsync(`UPDATE bills SET sessionId = ? WHERE sessionId IS NULL OR sessionId = '';`, [defaultSessionId]);
        console.log('Updated bills count:', updateResult.changes);
        
        console.log('Migration to version 2 completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

// Create default session if none exists (for new installations only)
async function createDefaultSessionIfNeeded() {
    if (!db) return;
    try {
        const sessionCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sessions;');
        if (sessionCount?.count === 0) {
            console.log('Creating default session for new installation...');
            const defaultSession: Session = {
                id: 'default-session-' + Date.now(),
                name: 'Personal Bills',
                description: 'Default session for personal bill management',
                createdAt: new Date().toISOString(),
                isActive: true
            };
            await db.runAsync(
                `INSERT INTO sessions (id, name, description, createdAt, isActive) VALUES (?, ?, ?, ?, ?);`,
                [defaultSession.id, defaultSession.name, defaultSession.description || '', defaultSession.createdAt, defaultSession.isActive ? 1 : 0]
            );
        }
    } catch (err) {
        console.error('Error creating default session:', err);
    }
}

// Session Management Functions

// Add session
export async function addSession(session: Session): Promise<boolean> {
    if (!db) await initDB();
    try {
        await db!.runAsync(
            `INSERT INTO sessions (id, name, description, createdAt, isActive) VALUES (?, ?, ?, ?, ?);`,
            [session.id, session.name, session.description || '', session.createdAt, session.isActive ? 1 : 0]
        );
        
        // Emit session change event
        const { sessionEvents } = await import('./sessionEvents');
        sessionEvents.emit();
        
        return true;
    } catch (err) {
        console.error('Error adding session:', err);
        return false;
    }
}

// Get all sessions
export async function getAllSessions(): Promise<Session[]> {
    if (!db) await initDB();
    try {
        const result = await db!.getAllAsync<{
            id: string;
            name: string;
            description?: string;
            createdAt: string;
            isActive: number;
        }>('SELECT * FROM sessions ORDER BY createdAt DESC;');
        return result?.map(session => ({
            id: session.id,
            name: session.name,
            description: session.description,
            createdAt: session.createdAt,
            isActive: session.isActive === 1
        })) || [];
    } catch (err) {
        console.error('Error fetching sessions:', err);
        return [];
    }
}

// Get active session
export async function getActiveSession(): Promise<Session | null> {
    if (!db) await initDB();
    try {
        const result = await db!.getFirstAsync<{
            id: string;
            name: string;
            description?: string;
            createdAt: string;
            isActive: number;
        }>('SELECT * FROM sessions WHERE isActive = 1;');
        if (result) {
            return {
                id: result.id,
                name: result.name,
                description: result.description,
                createdAt: result.createdAt,
                isActive: result.isActive === 1
            };
        }
        return null;
    } catch (err) {
        console.error('Error fetching active session:', err);
        return null;
    }
}

// Set active session
export async function setActiveSession(sessionId: string): Promise<boolean> {
    if (!db) await initDB();
    try {
        // Deactivate all sessions
        await db!.runAsync('UPDATE sessions SET isActive = 0;');
        // Activate selected session
        await db!.runAsync('UPDATE sessions SET isActive = 1 WHERE id = ?;', [sessionId]);
        
        // Emit session change event
        const { sessionEvents } = await import('./sessionEvents');
        sessionEvents.emit();
        
        return true;
    } catch (err) {
        console.error('Error setting active session:', err);
        return false;
    }
}

// Delete session and all its bills
export async function deleteSession(sessionId: string): Promise<boolean> {
    if (!db) await initDB();
    try {
        // Delete all bills in this session
        await db!.runAsync('DELETE FROM bills WHERE sessionId = ?;', [sessionId]);
        // Delete the session
        await db!.runAsync('DELETE FROM sessions WHERE id = ?;', [sessionId]);
        
        // Emit session change event
        const { sessionEvents } = await import('./sessionEvents');
        sessionEvents.emit();
        
        return true;
    } catch (err) {
        console.error('Error deleting session:', err);
        return false;
    }
}

// Bill Management Functions (Updated for Sessions)

// Get all bills for active session
export async function getAllBills(): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        console.log('Getting all bills...');
        
        // First check if the sessionId column exists
        const tableInfo = await db!.getAllAsync(`PRAGMA table_info(bills);`);
        const hasSessionId = tableInfo.some((column: any) => column.name === 'sessionId');
        console.log('Bills table columns:', tableInfo.map((col: any) => col.name));
        console.log('Has sessionId column:', hasSessionId);
        
        if (!hasSessionId) {
            console.log('SessionId column missing, running migration...');
            await migrateToVersion2();
            
            // After migration, get the active session and query again
            const activeSession = await getActiveSession();
            console.log('Active session after migration:', activeSession);
            
            if (!activeSession) {
                console.log('No active session found after migration, returning empty array');
                return [];
            }
            
            console.log('Querying bills for session after migration:', activeSession.id);
            const result = await db!.getAllAsync<Bill>('SELECT * FROM bills WHERE sessionId = ? ORDER BY date DESC;', [activeSession.id]);
            console.log('Found bills after migration:', result?.length || 0);
            return result || [];
        }
        
        const activeSession = await getActiveSession();
        console.log('Active session:', activeSession);
        
        if (!activeSession) {
            console.log('No active session found, returning empty array');
            return [];
        }
        
        console.log('Querying bills for session:', activeSession.id);
        const result = await db!.getAllAsync<Bill>('SELECT * FROM bills WHERE sessionId = ? ORDER BY date DESC;', [activeSession.id]);
        console.log('Found bills:', result?.length || 0);
        return result || [];
    } catch (err) {
        console.error('Error fetching bills:', err);
        // If there's still an error, try to get bills without sessionId filter (for old databases)
        try {
            console.log('Falling back to getting all bills without session filter...');
            const result = await db!.getAllAsync<any>('SELECT * FROM bills ORDER BY date DESC;');
            console.log('Found bills without session filter:', result?.length || 0);
            // Add a default sessionId to the results
            return result?.map(bill => ({
                ...bill,
                sessionId: 'legacy-session'
            })) || [];
        } catch (fallbackErr) {
            console.error('Fallback query also failed:', fallbackErr);
            return [];
        }
    }
}

// Get bills by session ID
export async function getBillsBySession(sessionId: string): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const result = await db!.getAllAsync<Bill>('SELECT * FROM bills WHERE sessionId = ? ORDER BY date DESC;', [sessionId]);
        return result || [];
    } catch (err) {
        console.error('Error fetching bills by session:', err);
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
export async function addBill(bill: Omit<Bill, 'sessionId'>): Promise<boolean> {
    if (!db) await initDB();
    try {
        let activeSession = await getActiveSession();
        
        // If no active session, try to get any session or create one
        if (!activeSession) {
            console.log('No active session found, looking for any available session...');
            const allSessions = await getAllSessions();
            if (allSessions.length > 0) {
                // Set first session as active
                await setActiveSession(allSessions[0].id);
                activeSession = allSessions[0];
            } else {
                // Create a default session
                console.log('No sessions found, creating default session...');
                const defaultSession: Session = {
                    id: 'emergency-session-' + Date.now(),
                    name: 'Personal Bills',
                    description: 'Default session created automatically',
                    createdAt: new Date().toISOString(),
                    isActive: true
                };
                await db!.runAsync(
                    `INSERT INTO sessions (id, name, description, createdAt, isActive) VALUES (?, ?, ?, ?, ?);`,
                    [defaultSession.id, defaultSession.name, defaultSession.description || '', defaultSession.createdAt, 1]
                );
                activeSession = defaultSession;
            }
        }

        await db!.runAsync(
            `INSERT INTO bills (id, billName, amount, date, status, payer, description, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [bill.id, bill.billName, bill.amount, bill.date, bill.status || '', bill.payer || '', bill.description || '', activeSession.id]
        );
        
        // Emit session change event to update bill counts
        const { sessionEvents } = await import('./sessionEvents');
        sessionEvents.emit();
        
        return true;
    } catch (err) {
        console.error('Error adding bill:', err);
        return false;
    }
}

// Update bill
export async function updateBill(bill: Omit<Bill, 'sessionId'>): Promise<boolean> {
    if (!db) await initDB();
    try {
        await db!.runAsync(
            `UPDATE bills SET billName = ?, amount = ?, date = ?, status = ?, payer = ?, description = ? WHERE id = ?;`,
            [bill.billName, bill.amount, bill.date, bill.status || '', bill.payer || '', bill.description || '', bill.id]
        );
        
        // Emit session change event to update bill data
        const { sessionEvents } = await import('./sessionEvents');
        sessionEvents.emit();
        
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
        
        // Emit session change event to update bill counts
        const { sessionEvents } = await import('./sessionEvents');
        sessionEvents.emit();
        
        return true;
    } catch (err) {
        console.error('Error deleting bill:', err);
        return false;
    }
}

// Sync bills from JSON to database (for active session)
export async function syncBillsFromJSON(billsData: Omit<Bill, 'sessionId'>[]): Promise<void> {
    if (!db) await initDB();
    try {
        const activeSession = await getActiveSession();
        if (!activeSession) return;
        
        // Clear existing bills for current session
        await db!.runAsync(`DELETE FROM bills WHERE sessionId = ?;`, [activeSession.id]);
        // Insert new bills
        for (const bill of billsData) {
            await addBill(bill);
        }
        console.log(`Synced ${billsData.length} bills to database for session ${activeSession.name}`);
    } catch (err) {
        console.error('Error syncing bills:', err);
    }
}

// Get bills by date range (for active session)
export async function getBillsByDateRange(startDate: string, endDate: string): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const activeSession = await getActiveSession();
        if (!activeSession) return [];
        
        const result = await db!.getAllAsync<Bill>(
            `SELECT * FROM bills WHERE sessionId = ? AND date >= ? AND date <= ? ORDER BY date DESC;`,
            [activeSession.id, startDate, endDate]
        );
        return result || [];
    } catch (err) {
        console.error('Error fetching bills by date range:', err);
        return [];
    }
}

// Get bills by status (for active session)
export async function getBillsByStatus(status: string): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const activeSession = await getActiveSession();
        if (!activeSession) return [];
        
        const result = await db!.getAllAsync<Bill>(
            `SELECT * FROM bills WHERE sessionId = ? AND status = ? ORDER BY date DESC;`,
            [activeSession.id, status]
        );
        return result || [];
    } catch (err) {
        console.error('Error fetching bills by status:', err);
        return [];
    }
}

// Get total spending (for active session)
export async function getTotalSpending(): Promise<number> {
    if (!db) await initDB();
    try {
        const activeSession = await getActiveSession();
        if (!activeSession) return 0;
        
        const result = await db!.getFirstAsync<{ total: number }>(
            `SELECT SUM(amount) as total FROM bills WHERE sessionId = ?;`,
            [activeSession.id]
        );
        return result?.total || 0;
    } catch (err) {
        console.error('Error calculating total:', err);
        return 0;
    }
}

// Search bills (for active session)
export async function searchBills(query: string): Promise<Bill[]> {
    if (!db) await initDB();
    try {
        const activeSession = await getActiveSession();
        if (!activeSession) return [];
        
        const searchTerm = `%${query}%`;
        const result = await db!.getAllAsync<Bill>(
            `SELECT * FROM bills WHERE sessionId = ? AND (billName LIKE ? OR payer LIKE ? OR description LIKE ? OR status LIKE ?) ORDER BY date DESC;`,
            [activeSession.id, searchTerm, searchTerm, searchTerm, searchTerm]
        );
        return result || [];
    } catch (err) {
        console.error('Error searching bills:', err);
        return [];
    }
}
