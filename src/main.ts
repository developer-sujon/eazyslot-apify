/**
 * This template is a production ready boilerplate for developing with `PlaywrightCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://crawlee.dev
import { PlaywrightCrawler } from '@crawlee/playwright';
// For more information, see https://docs.apify.com/sdk/js
import { Actor, log } from 'apify';

import { connectDB, getPendingFiles, updateFileStatus } from './db.js';
import { router } from './routes.js';

interface Input {
    startUrls: {
        url: string;
        method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'OPTIONS' | 'CONNECT' | 'PATCH';
        headers?: Record<string, string>;
        userData: Record<string, unknown>;
    }[];
    maxRequestsPerCrawl: number;
}

// Initialize the Apify SDK
await Actor.init();

// Initialize DB Connection
await connectDB();

const { maxRequestsPerCrawl = 100 } = (await Actor.getInput<Input>()) ?? ({} as Input);

const proxyConfiguration = await Actor.createProxyConfiguration({ checkAccess: true });

// 1. Fetch pending tasks from DB (Fetch up to 1000 at a time)
log.info('Fetching pending tasks from DB...');
const files = await getPendingFiles(1000); // Fetch more tasks

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl: files.length > maxRequestsPerCrawl ? files.length : maxRequestsPerCrawl, // Ensure all fetched tasks are processed
    requestHandler: router,
    maxConcurrency: 50, // Run up to 50 browsers in parallel
    minConcurrency: 10, // Always keep at least 10 running if possible
    sameDomainDelaySecs: 0, // IMPORTANT: Don't wait between requests to the same domain
    launchContext: {
        launchOptions: {
            args: ['--disable-gpu'],
        },
    },
});

if (files.length === 0) {
    log.info('No pending tasks found.');
} else {
    log.info(`Found ${files.length} pending files. Starting processing...`);

    // 2. Add files to crawler
    for (const file of files) {
        log.info(`Queueing file ${file.id} for ${file.email}`);

        // Mark as processing
        await updateFileStatus(file.id, 'processing');

        await crawler.addRequests([
            {
                url: 'https://yupsis.com/contact', // Hardcoded as per requirement, or fetch from task if available
                uniqueKey: `${file.id}-${Date.now()}`,
                userData: {
                    label: 'contact', // Force router to use 'contact' handler
                    file, // Pass the whole file object
                },
            },
        ]);
    }

    // 3. Run Crawler with Autoscaling
    // Ensure concurrency scales with files
    // autoscaledPoolOptions allows it to scale up based on CPU/Memory
    await crawler.run();
}

// Exit successfully
await Actor.exit();
