import { Config } from '@remotion/cli/config'

Config.setVideoImageFormat('jpeg')
Config.setOverwriteOutput(true)
// Mạng chặn tải Chrome Headless Shell của Remotion — dùng Chrome cài sẵn trên máy.
Config.setBrowserExecutable('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
