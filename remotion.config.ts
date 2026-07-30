// Config cho Remotion Studio/CLI của CHÍNH repo engine (chạy example).
// Repo tiêu dùng có file riêng của nó — xem docs/CONFIG.md.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);

// Máy nào bị chặn CDN Chromium thì trỏ Chrome cài sẵn qua biến môi trường CHROME.
if (process.env.CHROME) Config.setBrowserExecutable(process.env.CHROME);
