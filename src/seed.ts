import 'dotenv/config';

import { connectDB, db } from './db.js';

// 1. Connect to DB (using your hardcoded string or env var)
const connectionString = process.env.DB_CONNECTION_STRING;

async function seedData() {
    await connectDB(connectionString);

    console.log('Generating 1000 records...');

    const totalRecords = 1000;
    const batchSize = 100;

    for (let i = 0; i < totalRecords; i += batchSize) {
        const values: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        for (let j = 0; j < batchSize; j++) {
            const idx = i + j + 1;
            const firstName = `User${idx}`;
            const lastName = `Test`;
            const email = `user${idx}@example.com`;
            const phone = `01700000000`;
            const message = `This is a test message number ${idx}`;
            const status = 'created';

            values.push(
                `(gen_random_uuid(), $${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`,
            );
            params.push(firstName, lastName, email, phone, message, status);
            paramIndex += 6;
        }

        const query = `
            INSERT INTO files (id, first_name, last_name, email, phone, message, status)
            VALUES ${values.join(', ')}
        `;

        try {
            await db.query(query, params);
            console.log(`Inserted records ${i + 1} to ${i + batchSize}`);
        } catch (err) {
            console.error('Error inserting batch:', err);
        }
    }

    console.log('Seeding complete!');
    await db.end();
}

seedData();
