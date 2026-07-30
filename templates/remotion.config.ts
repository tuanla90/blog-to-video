import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);

// Máy nào bị chặn CDN Chromium thì set biến môi trường CHROME trỏ Chrome cài sẵn.
if (process.env.CHROME) Config.setBrowserExecutable(process.env.CHROME);
