// Lấy BẢN QUAY GỐC từ OpenVid (openvid.dev, chạy local) mà không phải Xuất lại video.
// OpenVid lưu bản quay trong IndexedDB `openvid-videos-library` › kho `uploaded-videos`, trường `blob`.
// Cách dùng: mở tab OpenVid → F12 → Console → (gõ `allow pasting` nếu bị chặn) → dán đoạn dưới → Enter.
// Chỉ đọc; tải mọi bản quay về thư mục Downloads, tên có số giây + độ phân giải.
(async () => {
    const db = await new Promise((ok, err) => { const r = indexedDB.open('openvid-videos-library'); r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error) })
    const rows = await new Promise((ok, err) => { const r = db.transaction('uploaded-videos').objectStore('uploaded-videos').getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error) })
    rows.sort((a, b) => a.uploadedAt - b.uploadedAt)
    for (const [i, v] of rows.entries()) {
        const ext = (v.blob.type.split('/')[1] || 'webm').split(';')[0]
        const name = `openvid-raw-${i + 1}-${Math.round(v.duration)}s-${v.width}x${v.height}.${ext}`
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(v.blob), download: name })
        document.body.appendChild(a); a.click(); a.remove()
        console.log('tải', name, (v.blob.size / 1e6).toFixed(1) + ' MB')
        await new Promise(r => setTimeout(r, 800))
    }
})()
