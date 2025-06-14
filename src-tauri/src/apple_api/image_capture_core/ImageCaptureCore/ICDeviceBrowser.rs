//! This file has been automatically generated by `objc2`'s `header-translator`.
//! DO NOT EDIT
use core::ffi::*;
use core::ptr::NonNull;
use objc2::__framework_prelude::*;
use objc2_foundation::*;

use crate::apple_api::image_capture_core::ImageCaptureCore::*;

/// [Apple's documentation](https://developer.apple.com/documentation/imagecapturecore/icauthorizationstatus?language=objc)
// NS_TYPED_ENUM
pub type ICAuthorizationStatus = NSString;

extern "C" {
    /// [Apple's documentation](https://developer.apple.com/documentation/imagecapturecore/icauthorizationstatusnotdetermined?language=objc)
    pub static ICAuthorizationStatusNotDetermined: &'static ICAuthorizationStatus;
}

extern "C" {
    /// [Apple's documentation](https://developer.apple.com/documentation/imagecapturecore/icauthorizationstatusrestricted?language=objc)
    pub static ICAuthorizationStatusRestricted: &'static ICAuthorizationStatus;
}

extern "C" {
    /// [Apple's documentation](https://developer.apple.com/documentation/imagecapturecore/icauthorizationstatusdenied?language=objc)
    pub static ICAuthorizationStatusDenied: &'static ICAuthorizationStatus;
}

extern "C" {
    /// [Apple's documentation](https://developer.apple.com/documentation/imagecapturecore/icauthorizationstatusauthorized?language=objc)
    pub static ICAuthorizationStatusAuthorized: &'static ICAuthorizationStatus;
}

extern_protocol!(
    /// A delegate of ICDeviceBrowser must conform to ICDeviceBrowserDelegate protocol.
    ///
    /// See also [Apple's documentation](https://developer.apple.com/documentation/imagecapturecore/icdevicebrowserdelegate?language=objc)
    pub unsafe trait ICDeviceBrowserDelegate: NSObjectProtocol {
        /// This message is sent to the delegate to inform that a device has been added.
        ///
        /// If several devices are found during the initial search, then this message is sent once for each device with the value of 'moreComing' set to YES in each message except the last one.
        #[unsafe(method(deviceBrowser:didAddDevice:moreComing:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowser_didAddDevice_moreComing(
            &self,
            browser: &ICDeviceBrowser,
            device: &ICDevice,
            more_coming: bool,
        );

        /// This message is sent to the delegate to inform that a device has been removed.
        ///
        /// If several devices are removed at the same time, then this message is sent once for each device with the value of 'moreGoing' set to YES in each message except the last one.
        #[unsafe(method(deviceBrowser:didRemoveDevice:moreGoing:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowser_didRemoveDevice_moreGoing(
            &self,
            browser: &ICDeviceBrowser,
            device: &ICDevice,
            more_going: bool,
        );

        /// This message is sent if the name of a device changes.
        ///
        /// This happens if the device module overrides the default name of the device reported by the device's transport layer, or if the name of the filesystem volume mounted by the device is changed by the user.
        #[optional]
        #[unsafe(method(deviceBrowser:deviceDidChangeName:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowser_deviceDidChangeName(
            &self,
            browser: &ICDeviceBrowser,
            device: &ICDevice,
        );

        /// This message is sent when the sharing state of a device has changes.
        ///
        /// Any Image Capture client application can choose to share the device over the network using the sharing or webSharing facility in Image Capture.
        #[deprecated = "deviceDidChangeSharingState will no longer be called"]
        #[optional]
        #[unsafe(method(deviceBrowser:deviceDidChangeSharingState:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowser_deviceDidChangeSharingState(
            &self,
            browser: &ICDeviceBrowser,
            device: &ICDevice,
        );

        /// This message is sent when an event that occurred on the device may be of interest to the client application.
        ///
        /// In Mac OS X 10.6, this message is sent when a button is pressed on a device and the current application is the target for that button press. In the case of the button-press event, if a session is open on the device, this message will not be sent to the browser delegate, instead the message 'device:didReceiveButtonPress:' is sent to the device delegate.
        #[optional]
        #[unsafe(method(deviceBrowser:requestsSelectDevice:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowser_requestsSelectDevice(
            &self,
            browser: &ICDeviceBrowser,
            device: &ICDevice,
        );

        /// This message is sent after the device browser completes sending 'deviceBrowser:didAddDevice:moreComing:' message for all local devices.
        ///
        /// Detecting locally connected devices (USB and FireWire devices) is faster than detecting devices connected using a network protocol. An Image Capture client application may use this message to update its user interface to let the user know that it has completed looking for locally connected devices and then start looking for network devices.
        #[optional]
        #[unsafe(method(deviceBrowserDidEnumerateLocalDevices:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowserDidEnumerateLocalDevices(&self, browser: &ICDeviceBrowser);

        /// This message is sent to the delegate to inform that operations on devices in the browser will be suspended shortly.
        ///
        /// Attached devices may require time to prepare the device for suspended communication.  This delegate method is called
        /// when the application is switched into the background.
        #[optional]
        #[unsafe(method(deviceBrowserWillSuspendOperations:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowserWillSuspendOperations(&self, browser: &ICDeviceBrowser);

        /// This message is sent to the delegate to inform that operations on devices in the browser have been suspended.
        ///
        /// All communcation with the attached device will remain suspended until the application has entered the foreground.
        /// In no way does this suspension modify the state of the connected device, nor does it issue a close session of any kind.  State should always be
        /// managed by the application.
        #[optional]
        #[unsafe(method(deviceBrowserDidSuspendOperations:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowserDidSuspendOperations(&self, browser: &ICDeviceBrowser);

        /// This message is sent to the delegate to inform that operations on devices in the browser have resumed before the suspension timeout.
        ///
        /// All communcation with the attached device will remain available as the application was switched back to the foreground before the
        /// suspension timeout.
        #[optional]
        #[unsafe(method(deviceBrowserDidCancelSuspendOperations:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowserDidCancelSuspendOperations(&self, browser: &ICDeviceBrowser);

        /// This message is sent to the delegate to inform that operations on devices in the browser have resumed.
        ///
        /// All communcation with the attached device has been resumed as the application has now entered the foreground.
        #[optional]
        #[unsafe(method(deviceBrowserDidResumeOperations:))]
        #[unsafe(method_family = none)]
        unsafe fn deviceBrowserDidResumeOperations(&self, browser: &ICDeviceBrowser);
    }
);

extern_class!(
    /// The ICDeviceBrowser object is used to find devices such as digital cameras and scanners that are supported by Image Capture. These device may be directly attached to the USB or FireWire bus on the host computer, or available over a TCP/IP network. This object communicates with an Image Capture agent process asynchronously to accomplish this.
    ///
    /// See also [Apple's documentation](https://developer.apple.com/documentation/imagecapturecore/icdevicebrowser?language=objc)
    #[unsafe(super(NSObject))]
    #[derive(Debug, PartialEq, Eq, Hash)]
    pub struct ICDeviceBrowser;
);

unsafe impl NSObjectProtocol for ICDeviceBrowser {}

impl ICDeviceBrowser {
    extern_methods!(
        /// The delegate. It must conform to ICDeviceBrowserDelegate protocol. The messages this delegate can expect to receive are described by ICDeviceBrowserDelegate protocol.
        #[unsafe(method(delegate))]
        #[unsafe(method_family = none)]
        pub unsafe fn delegate(
            &self,
        ) -> Option<Retained<ProtocolObject<dyn ICDeviceBrowserDelegate>>>;

        /// Setter for [`delegate`][Self::delegate].
        #[unsafe(method(setDelegate:))]
        #[unsafe(method_family = none)]
        pub unsafe fn setDelegate(
            &self,
            delegate: Option<&ProtocolObject<dyn ICDeviceBrowserDelegate>>,
        );

        /// Indicates whether the device browser is browsing for devices.
        #[unsafe(method(isBrowsing))]
        #[unsafe(method_family = none)]
        pub unsafe fn isBrowsing(&self) -> bool;

        /// Indicates whether the  devices in the browser have suspended communication.
        #[unsafe(method(isSuspended))]
        #[unsafe(method_family = none)]
        pub unsafe fn isSuspended(&self) -> bool;

        /// A mask whose set bits indicate the type of device(s) being browsed after the receiver receives the start message. This property can be changed while the browser is browsing for devices. This property can be constructed by OR'd values of ICDeviceTypeMask with values of ICDeviceLocationTypeMask.
        #[unsafe(method(browsedDeviceTypeMask))]
        #[unsafe(method_family = none)]
        pub unsafe fn browsedDeviceTypeMask(&self) -> ICDeviceTypeMask;

        /// Setter for [`browsedDeviceTypeMask`][Self::browsedDeviceTypeMask].
        #[unsafe(method(setBrowsedDeviceTypeMask:))]
        #[unsafe(method_family = none)]
        pub unsafe fn setBrowsedDeviceTypeMask(&self, browsed_device_type_mask: ICDeviceTypeMask);

        /// All devices found by the browser. This property will change as devices appear and disappear. This array is empty before the first invocation of the delegate method 'deviceBrowser:didAddDevice:moreComing:'.
        #[unsafe(method(devices))]
        #[unsafe(method_family = none)]
        pub unsafe fn devices(&self) -> Option<Retained<NSArray<ICDevice>>>;

        /// This property returns a device object that should be selected by the client application when it is launched.
        ///
        /// If the client application that calls this method is the auto-launch application associated with a device and that device is the last device attached (through USB, FireWire or network), then that device will be the preferred device. The best place to call this method is in the implmentation of the ICDeviceBrowser delegate method "deviceBrowser:didAddDevice:moreComing:", if the "moreComing" parameter passed to the delegate is "NO"; or in the delegate method "deviceBrowserDidEnumerateLocalDevices:".
        #[unsafe(method(preferredDevice))]
        #[unsafe(method_family = none)]
        pub unsafe fn preferredDevice(&self) -> Option<Retained<ICDevice>>;

        /// This is the designated initializer.
        #[unsafe(method(init))]
        #[unsafe(method_family = init)]
        pub unsafe fn init(this: Allocated<Self>) -> Retained<Self>;

        /// This message tells the receiver to start looking for devices.
        ///
        /// Make sure that the receiver's delegate is set prior to sending this message; otherwise this message will be ignored. The messages the delegate can expect to receive are described by ICDeviceBrowserDelegate protocol.
        #[unsafe(method(start))]
        #[unsafe(method_family = none)]
        pub unsafe fn start(&self);

        /// This method tells the receiver to stop looking for devices.
        ///
        /// This will free all device instances that are not in use.
        #[unsafe(method(stop))]
        #[unsafe(method_family = none)]
        pub unsafe fn stop(&self);

        /// This property returns a constant indicating whether the app has permission to acces the contents of an attached media device.
        ///
        /// A constant indicating authorization status.
        #[unsafe(method(contentsAuthorizationStatus))]
        #[unsafe(method_family = none)]
        pub unsafe fn contentsAuthorizationStatus(&self) -> Retained<ICAuthorizationStatus>;

        /// This method requests the user’s permission, if needed, for accessing the conents of an external media device.
        #[unsafe(method(requestContentsAuthorizationWithCompletion:))]
        #[unsafe(method_family = none)]
        pub unsafe fn requestContentsAuthorizationWithCompletion(
            &self,
            completion: &block2::Block<dyn Fn(NonNull<ICAuthorizationStatus>)>,
        );

        /// This property returns a constant indicating whether the app has permission to control the attached camera device.
        #[unsafe(method(controlAuthorizationStatus))]
        #[unsafe(method_family = none)]
        pub unsafe fn controlAuthorizationStatus(&self) -> Retained<ICAuthorizationStatus>;

        /// This method requests the user’s permission, if needed, for controlling the attached camera device.
        #[unsafe(method(requestControlAuthorizationWithCompletion:))]
        #[unsafe(method_family = none)]
        pub unsafe fn requestControlAuthorizationWithCompletion(
            &self,
            completion: &block2::Block<dyn Fn(NonNull<ICAuthorizationStatus>)>,
        );

        /// This method resets the authorization status for the application accessing the conents of an external media device.
        #[unsafe(method(resetContentsAuthorizationWithCompletion:))]
        #[unsafe(method_family = none)]
        pub unsafe fn resetContentsAuthorizationWithCompletion(
            &self,
            completion: &block2::Block<dyn Fn(NonNull<ICAuthorizationStatus>)>,
        );

        /// This method resets the authorization status for the application controlling the attached camera device.
        ///
        /// If the application already has been granted camera access, this will reset only the presentation dialog letting the user know the app has permission, not the camera access itself.
        #[unsafe(method(resetControlAuthorizationWithCompletion:))]
        #[unsafe(method_family = none)]
        pub unsafe fn resetControlAuthorizationWithCompletion(
            &self,
            completion: &block2::Block<dyn Fn(NonNull<ICAuthorizationStatus>)>,
        );
    );
}

/// Methods declared on superclass `NSObject`.
impl ICDeviceBrowser {
    extern_methods!(
        #[unsafe(method(new))]
        #[unsafe(method_family = new)]
        pub unsafe fn new() -> Retained<Self>;
    );
}
