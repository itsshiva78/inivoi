const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Changes the cache location for Puppeteer.
    cacheDirectory: join(__dirname, ".cache", "puppeteer"),
    // Additional options for Vercel deployment
    ...(process.env.VERCEL ? {
        headless: "shell",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--disable-extensions',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-default-browser-check',
            '--disable-zero-browsers-launch-for-tests'
        ]
    } : {})
};
