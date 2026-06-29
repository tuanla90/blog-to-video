import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);
// Máy này CDN Chromium bị proxy chặn -> nút Render trong Studio + CLI dùng Chrome cài sẵn.
Config.setBrowserExecutable("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");
