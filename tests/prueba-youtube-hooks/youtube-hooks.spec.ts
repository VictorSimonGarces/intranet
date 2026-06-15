import { test } from '@playwright/test'
import { NavigateTo } from '../../pageobjects/navigate/NavigateTo'
import { pruebaYoutubeHooks } from '../../pageobjects/pruebaYoutubeHooks/pruebaYoutubeHooks'

let sessionSummary: {
    user: string,
    startTime: Date,
    clicks: string[]
} = { user: '', startTime: new Date(), clicks: [] };

test.beforeEach(async () => {
    sessionSummary = {
        user: '',
        startTime: new Date(),
        clicks: []
    };
});

test.afterEach(async ({}, testInfo) => {
    const duration = ((new Date().getTime() - sessionSummary.startTime.getTime()) / 1000).toFixed(2);

    console.log(`
    ========= SESSION SUMMARY =========
    Test:       ${testInfo.title}
    Status:     ${testInfo.status}
    User:       ${sessionSummary.user}
    Start:      ${sessionSummary.startTime.toLocaleTimeString()}
    Duration:   ${duration}s
    Clicks:
    ${'  '.padEnd(4, '  ')} ${' Acción'.padEnd(35, ' ')}  || ${'Referrer'.padEnd(50, ' ')} || ${'Title'}
    ${sessionSummary.clicks.map((c, i) => i === 0 
    ? `  ${String(i + 1).padStart(2, ' ')}. ${c}` 
    : `      ${String(i + 1).padStart(2, ' ')}. ${c}`).join('\n')}
    ===================================
    `);
});

test.describe('Youtube tests', () => {
    for (let i = 1; i <= 1; i++) {
        test(`search video - run ${i}`, async ({ browser }) => {
            const { context, page } = await pruebaYoutubeHooks.abrirEnIncognito(browser)

            await test.step('Navigation to youtube page', async () => {
                const navigateTo = new NavigateTo(page)
                await navigateTo.youtubePage()
            })

            const youtuberName = 'illojuan'

            await test.step('Search a video', async () => {
                const youtubePage = new pruebaYoutubeHooks(page, sessionSummary.clicks)
                await youtubePage.searchVideo(youtuberName)
            })

            await context.close()
        });
    }
});