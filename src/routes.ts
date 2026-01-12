import { createPlaywrightRouter } from '@crawlee/playwright';

import type { File } from './db.js';
import { handleYupsisForm } from './handlers.js';

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
    log.info(`enqueueing new URLs`);
    await enqueueLinks({
        globs: ['https://yupsis.com/contact'],
        label: 'contact',
    });
});

// Handler for Yupsis Contact Form
router.addHandler('contact', async ({ page, log, request }) => {
    const file = request.userData.file as File;

    if (!file) {
        log.error('No file data found in request');
        return;
    }

    await handleYupsisForm(page, file, log);
});
