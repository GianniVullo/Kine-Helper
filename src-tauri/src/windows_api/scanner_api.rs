use std::{thread::sleep, time::Duration};
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
async fn get_scan(device_name: String) -> Result<Vec<u8>, String> {
    let info = match retrieve_scanner().await {
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
        let scanner = ImageScanner::FromIdAsync(&device_id)
            .unwrap()
            .get()
            .expect("failed to get scanner");

        let cwd = std::env::current_dir()
            .expect("failed to get cwd")
            .to_string_lossy()
            .to_string();

        let folder_hstring = HSTRING::from(&cwd);

        let storage_folder = StorageFolder::GetFolderFromPathAsync(&folder_hstring)
            .expect("bad path")
            .get()
            .unwrap();

        let config = scanner.FlatbedConfiguration().expect("c");

        println!("{:?}", config.MinResolution().expect("msg"));

        let _ = config
            .SetDesiredResolution(ImageScannerResolution {
                DpiX: 100.0,

                DpiY: 100.0,
            })
            .expect("msg");

        let source = scanner
            .DefaultScanSource()
            .expect("failed to get default scan source");

        let task = scanner
            .ScanFilesToFolderAsync(source, &storage_folder)
            .expect("failed to scan");

        sleep(Duration::from_millis(100));

        //std::thread::sleep(std::time::Duration::from_millis(1)); // uncomment this and it will work

        let result = task.get().expect("unexpected async");

        println!("{:?}", result.ScannedFiles().expect("msg"));
        // TODO : il faut envoyer tout ça dans image_compressor
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

    info.into_iter()
        .map(|i| match i.Name() {
            Ok(device_name) => Ok(device_name.to_string_lossy()),
            Err(e) => Err(format!("Failed to get device name: {:?}", e)),
        })
        .collect()
}
