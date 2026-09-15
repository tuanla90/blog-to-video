// Kịch bản mẫu quay dashboard (REC_NOCURSOR=1): lọc → rê chuột → "…" → Tạo Insight → Xuất HTML deck.
//
const URL = process.env.DASH_URL || 'https://app.example.com/vi/analysis/dashboards/<dashboard-id>'
export default async ({ page, move, click, clickAt, wait, mark }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await page.getByText('Bộ lọc chung').first().waitFor({ timeout: 90000 })
    await wait(20000)
    await move(900, 500, 500)
    await clickAt(1891, 64, 'menu')
    await wait(900)
    await click(page.getByRole('menuitem', { name: 'Xuất PowerPoint (AI)' }), { label: 'pptItem' })
    await wait(2200)
    mark('dialog')
    await page.screenshot({ path: process.env.REC_OUT + '/dialog.png' })
    await click(page.getByRole('dialog').getByRole('combobox').first(), { label: 'format' })
    await wait(900)
    await click(page.getByRole('option', { name: /HTML deck/ }), { label: 'htmlDeck' })
    await wait(900)
    await page.screenshot({ path: process.env.REC_OUT + '/dialog-html.png' })
    const dl = page.waitForEvent('download', { timeout: 600000 })
    await click(page.getByRole('button', { name: 'Xuất', exact: true }), { label: 'export' })
    mark('exportClicked')
    const d = await dl
    mark('downloaded', { name: d.suggestedFilename() })
    await d.saveAs(process.env.REC_OUT + '/' + d.suggestedFilename())
    await wait(3000)
}
