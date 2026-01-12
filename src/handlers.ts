import type { Log } from 'crawlee';
import type { Page } from 'playwright';

import type { File } from './db.js';
import { updateFileStatus } from './db.js';

export async function handleYupsisForm(page: Page, task: File, log: Log) {
    log.info(`Handling form for task ${task.id} (${task.email})`);

    try {
        // 1. Fill Form Fields
        // Mapped from Task fields to Form fields
        const fullName = `${task.first_name} ${task.last_name}`;

        // Try filling Name
        await page
            .fill('input[name="full_name"]', fullName)
            .catch(async () => page.fill('input[placeholder*="Name"]', fullName));

        // Try filling Email
        await page
            .fill('input[name="email"]', task.email)
            .catch(async () => page.fill('input[placeholder*="Email"]', task.email));

        // Try filling Phone
        await page
            .fill('input[name="phone"]', task.phone)
            .catch(async () => page.fill('input[placeholder*="Phone"]', task.phone));

        // Try filling Message
        await page
            .fill('textarea[name="message"]', task.message)
            .catch(async () => page.fill('textarea[placeholder*="Message"]', task.message));

        // 2. Submit
        await Promise.all([page.click('button[type="submit"]')]);

        // 3. Verify Success
        try {
            // Adjust this selector based on actual success message on yupsis.com
            await page.waitForSelector('text=Thank you', { timeout: 5000 });
            log.info(`Form submitted successfully for ${task.email}!`);

            await updateFileStatus(task.id, 'success', 'Form submitted successfully');
        } catch {
            log.warning(`Could not verify success message for ${task.email}, but no error reported.`);
            await updateFileStatus(task.id, 'success', 'Form submitted (verification weak)');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error(`Form submission failed for ${task.email}: ${errorMessage}`);
        await updateFileStatus(task.id, 'failed', errorMessage);
    }
}
