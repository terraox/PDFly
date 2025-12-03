# Running PDF Wiz Mobile

This guide explains how to run the PDF Wiz mobile app on your laptop (Simulator/Emulator) and physical devices.

## Prerequisites

1.  **Flutter SDK**: Installed and configured.
2.  **Java JDK 17+**: For the backend.
3.  **PostgreSQL**: Running locally.

## Step 1: Start the Backend

The mobile app needs the backend API to function.

1.  Open a terminal.
2.  Navigate to the project root (where `pom.xml` is).
3.  Run the backend:
    ```bash
    ./mvnw spring-boot:run
    ```
    (On Windows, use `mvnw spring-boot:run`)

Ensure the backend is running on `http://localhost:8080`.

## Step 2: Configure the Mobile App

The mobile app needs to know where the backend is running. This depends on where you are running the app.

1.  Open `lib/core/config/api_config.dart`.
2.  Find the `_host` variable.

### Option A: iOS Simulator
If running on the iOS Simulator on the same Mac:
```dart
static const String _host = 'localhost';
```

### Option B: Android Emulator
If running on the Android Emulator on the same computer:
```dart
static const String _host = '10.0.2.2';
```

### Option C: Physical Device (Phone)
If running on a real phone connected via USB or on the same Wi-Fi:
1.  **Find your Computer's IP Address**:
    *   **Mac**: Open Terminal and run `ipconfig getifaddr en0` (or check System Settings > Wi-Fi > Details).
    *   **Windows**: Open Command Prompt and run `ipconfig`. Look for "IPv4 Address".
    *   Example IP: `192.168.1.5`
2.  **Update Config**:
    ```dart
    static const String _host = '192.168.1.5'; // Replace with YOUR IP
    ```

## Step 3: Run the Mobile App

### On Simulator/Emulator
1.  Open a new terminal.
2.  Navigate to `pdf_wiz_mobile`.
3.  Run:
    ```bash
    flutter run
    ```

### On Physical iPhone (Mac only)
1.  Connect iPhone via USB.
2.  Open `ios/Runner.xcworkspace` in Xcode.
3.  Select your connected iPhone as the destination.
4.  You may need to sign the app with your Apple ID (Signing & Capabilities tab).
5.  Run from Xcode or `flutter run -d <device_id>`.

### On Physical Android
1.  Enable **Developer Options** and **USB Debugging** on your phone.
2.  Connect via USB.
3.  Run `flutter devices` to see your device ID.
4.  Run:
    ```bash
    flutter run
    ```

### Wireless Android Debugging (No USB Cable)

**Method A: Android 11+ (Recommended)**
1.  Ensure phone and laptop are on the **same Wi-Fi**.
2.  Go to **Settings > Developer Options > Wireless Debugging**.
3.  Turn it **ON**.
4.  Select **Pair device with QR code** or **Pair device with pairing code**.
5.  On laptop terminal:
    ```bash
    adb pair <ip_address>:<port> <pairing_code>
    ```
    (Get IP/Port/Code from the phone screen)
6.  Once paired, connect:
    ```bash
    adb connect <ip_address>:<port>
    ```
    (Note: The port for `connect` is usually different from the `pair` port. Look at the main "Wireless Debugging" screen for the connect IP/Port).

**Method B: Older Android (Requires USB once)**
1.  Connect via USB.
2.  Run: `adb tcpip 5555`
3.  Disconnect USB.
4.  Find phone's IP (Settings > About Phone > Status).
5.  Run: `adb connect <phone_ip_address>:5555`

## Troubleshooting

*   **Connection Refused**: 
    *   Make sure the backend is actually running.
    *   Make sure your phone and computer are on the **same Wi-Fi network**.
    *   Check if your computer's firewall is blocking port 8080.
*   **White Screen**: Check the debug console for errors.
