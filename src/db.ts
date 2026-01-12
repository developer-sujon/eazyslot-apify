import { Client } from 'pg';

const connectionString =
    'postgresql://postgres.wxyzjmvugabjvtzewuue:3KCF5OJwgdEaql5l@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

export const db = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

export async function connectDB() {
    try {
        await db.connect();
        console.log('Connected to Supabase PostgreSQL');
    } catch (err) {
        console.error('Failed to connect to DB', err);
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
