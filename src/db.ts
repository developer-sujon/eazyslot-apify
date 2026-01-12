import { Client } from 'pg';

export let db: Client;

export async function connectDB(connectionString: string) {
    db = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await db.connect();
        console.log('Connected to Supabase PostgreSQL');
    } catch (err) {
        console.error('Failed to connect to DB', err);
        throw err;
    }
}

export interface File {
    id: string; // UUID
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    message: string;
    status: 'created' | 'processing' | 'success' | 'failed';
    attempts?: number;
    reason?: string;
}

// Helper to fetch pending Files
export async function getPendingFiles(limit = 100): Promise<File[]> {
    const res = await db.query(
        `
        SELECT id, first_name, last_name, email, phone, message, status, attempts 
        FROM files 

        LIMIT $1
    `,
        [limit],
    );

    return res.rows;
}

// WHERE status != 'success'
// AND created_at::date = CURRENT_DATE

// Helper to update File status
export async function updateFileStatus(id: string, status: string, reason?: string) {
    await db.query(
        `
        UPDATE files 
        SET status = $1, reason = $2, updated_at = NOW() 
        WHERE id = $3
    `,
        [status, reason, id],
    );
}
