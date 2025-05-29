use std::{thread::sleep, time::Duration};
use tauri::{AppHandle, Manager};
use windows::{
    core::HSTRING,
    Devices::{
        Enumeration::{DeviceInformation, DeviceInformationCollection},
        Scanners::{
            ImageScanner, ImageScannerFormat, ImageScannerResolution,
        },
    },
    Storage::StorageFolder,
};

#[tauri::command]
pub async fn get_scanners() -> Result<Vec<String>, String> {
    let info = retrieve_scanners()?;
    let scanners_iterator = info.into_iter().map(|i| {
        if let Ok(device_name) = i.Name() {
            device_name.to_string_lossy()
        } else {
            "Unknow device".to_string()
        }
    });

    Ok(scanners_iterator.collect())
}

#[tauri::command]
pub async fn get_scan(app_handle: AppHandle, device_name: String) -> Result<String, String> {
    let info = match retrieve_scanners() {
        Ok(info) => info,
        Err(err) => return Err(format!("Failed to retrieve scanner: {}", err.to_string())),
    };

    let mut id = None;

    for i in info {
        if let Ok(browsed_device_name) = i.Name() {
            if browsed_device_name == device_name {
                match i.Id() {
                    Ok(device_id) => {
                        id = Some(device_id);
                    }

                    Err(err) => {
                        return Err(err.to_string());
                    }
                }
            }
        }
    }

    if let Some(device_id) = id {
        let scanner_future = match ImageScanner::FromIdAsync(&device_id) {
            Ok(future) => future,
            Err(err) => {
                return Err(format!(
                    "Failed to create scanner from ID: {}",
                    err.to_string()
                ))
            }
        };

        let scanner = match scanner_future.get() {
            Ok(scanner) => scanner,
            Err(err) => {
                return Err(format!(
                    "Failed to create scanner from ID: {}",
                    err.to_string()
                ))
            }
        };

        let cwd = app_handle
            .path()
            .document_dir()
            .unwrap()
            .into_os_string()
            .into_string()
            .unwrap();

        let folder_hstring = HSTRING::from(&cwd);

        let storage_folder_future = match StorageFolder::GetFolderFromPathAsync(&folder_hstring) {
            Ok(future) => future,
            Err(err) => {
                return Err(format!(
                    "Failed to get storage folder from path: {}",
                    err.to_string()
                ))
            }
        };

        let storage_folder = match storage_folder_future.get() {
            Ok(folder) => folder,
            Err(err) => {
                return Err(format!(
                    "Failed to get storage folder from path: {}",
                    err.to_string()
                ))
            }
        };

        let config = match scanner.FlatbedConfiguration() {
            Ok(config) => config,
            Err(err) => {
                return Err(format!(
                    "Failed to get flatbed configuration: {}",
                    err.to_string()
                ))
            }
        };

        println!("{:?}", config.MinResolution().expect("msg"));

        let _set_desired_resolution = match config.SetDesiredResolution(ImageScannerResolution {
            DpiX: 100.0,
            DpiY: 100.0,
        }) {
            Ok(_) => {}
            Err(err) => {
                return Err(format!(
                    "Failed to set desired resolution: {}",
                    err.to_string()
                ))
            }
        };

        let _format = match config.IsFormatSupported(ImageScannerFormat::Jpeg) {
            Ok(is_supported) => {
                if is_supported {
                    match config.SetFormat(ImageScannerFormat::Jpeg) {
                        Ok(_) => {}
                        Err(err) => {
                            return Err(format!("Failed to set Jpeg format: {}", err.to_string()))
                        }
                    };
                } else {
                    match config.SetFormat(ImageScannerFormat::Png) {
                        Ok(_) => {}
                        Err(err) => {
                            return Err(format!("Failed to set Png format: {}", err.to_string()))
                        }
                    };
                }
            }
            Err(err) => {
                return Err(format!(
                    "Failed to check if format is supported: {}",
                    err.to_string()
                ))
            }
        };

        let source = match scanner.DefaultScanSource() {
            Ok(source) => source,
            Err(err) => {
                return Err(format!(
                    "Failed to get default scan source: {}",
                    err.to_string()
                ))
            }
        };

        let task = match scanner.ScanFilesToFolderAsync(source, &storage_folder) {
            Ok(task) => task,
            Err(err) => {
                return Err(format!(
                    "Failed to scan files to folder: {}",
                    err.to_string()
                ))
            }
        };

        // Here we wait because of a reported bug in the API on the windows-rs github
        // https://github.com/microsoft/windows-rs/issues/3211
        sleep(Duration::from_millis(10));

        let result = match task.get() {
            Ok(result) => result,
            Err(err) => return Err(format!("Failed to get scan result: {}", err.to_string())),
        };

        let file = match result.ScannedFiles() {
            Ok(files) => {
                println!("The scanned files : {:?}", files);
                match files.GetAt(0) {
                    Ok(file) => file,
                    Err(err) => {
                        return Err(format!(
                            "Failed to get scanned files[0]: {}",
                            err.to_string()
                        ))
                    }
                }
            }
            Err(err) => return Err(format!("Failed to get scanned files: {}", err.to_string())),
        };
        let folder_path = cwd;
        let file_name = match file.Name() {
            Ok(name) => name.to_string_lossy().to_string(),
            Err(err) => return Err(format!("Failed to get file name: {}", err.to_string())),
        };
        Ok(format!("{}\\{}", folder_path, file_name))
    } else {
        Err("Cannot retrieve Scanner".to_string())
    }
}

fn retrieve_scanners() -> Result<DeviceInformationCollection, String> {
    let device_selector = match ImageScanner::GetDeviceSelector() {
        Ok(selector) => selector,
        Err(err) => {
            return Err(format!(
                "Failed to get device selector: {}",
                err.to_string()
            ))
        }
    };

    let info_future = match DeviceInformation::FindAllAsyncAqsFilter(&device_selector) {
        Ok(future) => future,
        Err(err) => {
            return Err(format!(
                "Failed to find all async AQS filter: {}",
                err.to_string()
            ))
        }
    };

    let info = match info_future.get() {
        Ok(info) => info,
        Err(err) => {
            return Err(format!(
                "Failed to get device information: {}",
                err.to_string()
            ))
        }
    };

    Ok(info)
}
