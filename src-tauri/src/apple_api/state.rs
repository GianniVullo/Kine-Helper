use objc2::rc::Retained;

use super::image_capture_core::{browser_delegate::MyBrowserDelegate, scanner_delegate::MyScannerDelegate, ImageCaptureCore::{ICDevice, ICDeviceBrowser}};

#[derive(Default, Debug)]
pub struct ScannerAPI {
    pub device_browser: Option<Retained<ICDeviceBrowser>>,
    pub browser_delegate: Option<Retained<MyBrowserDelegate>>,
    pub scanners: Vec<(Retained<ICDevice>, Option<Retained<MyScannerDelegate>>)>,
}

#[derive(Default, Debug, serde::Deserialize, serde::Serialize)]
pub struct ScanOperation {
    pub scanner_name: String,
    pub document_name: String,
    pub document_path: String,
}