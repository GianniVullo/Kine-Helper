use crate::cloud::image_compression::tiff_to_avif;
use std::{thread::sleep, time::Duration};
use tauri::{AppHandle, Manager};
use windows::{
    core::HSTRING,
    Devices::{
        Enumeration::DeviceInformation,
        Scanners::{
            ImageScanner, ImageScannerFormat, ImageScannerResolution, ImageScannerScanSource,
        },
    },
    Storage::StorageFolder,
};

#[tauri::command]
async fn get_scanners() -> Result<Vec<String>, String> {
    retrieve_scanner()
        .await
        .map_err(|e| e.to_string())
        .and_then(|info| {
            info.into_iter()
                .map(|i| {
                    i.map(|device_name| device_name.to_string_lossy().to_string())
                        .map_err(|e| format!("Failed to get device name: {:?}", e))
                })
                .collect()
        })
}

#[tauri::command]
async fn get_scan(aap_handle: AppHandle, device_name: String) -> Result<Vec<u8>, String> {
    let info = match retrieve_scanner() {
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
            .app_local_data_dir()
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

        sleep(Duration::from_millis(10));

        //std::thread::sleep(std::time::Duration::from_millis(1)); // uncomment this and it will work

        let result = match task.get() {
            Ok(result) => result,
            Err(err) => return Err(format!("Failed to get scan result: {}", err.to_string())),
        };
        println!("{:?}", result.ScannedFiles().expect("msg"));

        // TODO : il faut envoyer tout ça dans image_compressor
        Ok(tiff_to_avif(
            result
                .ScannedFiles()
                .expect("msg")
                .into_iter()
                .map(|i| i.GetFileAsync().expect("msg").get().expect("msg").as_raw())
                .collect(),
        ))
    } else {
        Err("Cannot retrieve Scanner".to_string())
    }
}

async fn retrieve_scanner() -> Result<Vec<String>, String> {
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

    let scanners_iterator = info.into_iter().map(|i| {
        if let Ok(device_name) = i.Name() {
            device_name.to_string_lossy()
        } else {
            "Unknow device".to_string()
        }
    });

    Ok(scanners_iterator.collect())
}
