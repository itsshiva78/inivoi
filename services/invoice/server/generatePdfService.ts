import { NextRequest, NextResponse } from "next/server";

// Chromium
import chromium from "@sparticuz/chromium";

// Helpers
import { getInvoiceTemplate } from "@/lib/helpers";

// Variables
import { ENV, TAILWIND_CDN } from "@/lib/variables";

// Types
import { InvoiceType } from "@/types";

/**
 * Generate a PDF document of an invoice based on the provided data.
 *
 * @async
 * @param {NextRequest} req - The Next.js request object.
 * @throws {Error} If there is an error during the PDF generation process.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the generated PDF.
 */
export async function generatePdfService(req: NextRequest) {
    const body: InvoiceType = await req.json();
    let browser;
    let page;

    try {
        const ReactDOMServer = (await import("react-dom/server")).default;
        const templateId = body.details.pdfTemplate;
        const InvoiceTemplate = await getInvoiceTemplate(templateId);
        const htmlTemplate = ReactDOMServer.renderToStaticMarkup(
            InvoiceTemplate(body)
        );

        // Use different Puppeteer configurations based on environment
        if (ENV === "production") {
            // For Vercel deployment, use chromium args optimized for serverless
            const puppeteer = (await import("puppeteer-core")).default;
            browser = await puppeteer.launch({
                args: [
                    ...chromium.args,
                    "--disable-dev-shm-usage",
                    "--disable-web-security",
                    "--disable-features=VizDisplayCompositor",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--disable-gpu",
                    "--disable-dev-shm-usage",
                    "--disable-translate",
                    "--disable-extensions",
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding",
                    "--disable-ipc-flooding-protection",
                    "--disable-background-networking",
                    "--enable-features=NetworkService,NetworkServiceInProcess",
                    "--disable-features=VizDisplayCompositor",
                    "--no-default-browser-check",
                    "--disable-zero-browsers-launch-for-tests",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ],
                executablePath: await chromium.executablePath(),
                headless: true, // Use true instead of chromium.headless
            });
        } else {
            // For development
            const puppeteer = (await import("puppeteer")).default;
            browser = await puppeteer.launch({
                args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
                headless: true,
            });
        }

        if (!browser) {
            throw new Error("Failed to launch browser");
        }

        page = await browser.newPage();

        // Set viewport to ensure consistent rendering
        await page.setViewport({ width: 1200, height: 800 });

        await page.setContent(htmlTemplate, {
            waitUntil: ["networkidle0", "load", "domcontentloaded"],
            timeout: 30000,
        });

        // Add Tailwind CSS styles
        await page.addStyleTag({
            url: TAILWIND_CDN,
        });

        const pdf: Uint8Array = await page.pdf({
            format: "a4",
            printBackground: true,
            preferCSSPageSize: true,
        });

        return new NextResponse(new Blob([pdf], { type: "application/pdf" }), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=invoice.pdf",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
            },
            status: 200,
        });
    } catch (error: any) {
        console.error("PDF Generation Error:", error);
        return new NextResponse(
            JSON.stringify({ error: "Failed to generate PDF", details: error.message }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } finally {
        if (page) {
            try {
                await page.close();
            } catch (e) {
                console.error("Error closing page:", e);
            }
        }
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                console.error("Error closing browser:", e);
            }
        }
    }
}
