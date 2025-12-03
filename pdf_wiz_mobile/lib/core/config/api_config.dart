class ApiConfig {
  // ---------------------------------------------------------------------------
  // 1. FOR ANDROID EMULATOR: Use '10.0.2.2'
  // 2. FOR iOS SIMULATOR: Use 'localhost'
  // 3. FOR PHYSICAL DEVICE: Use your computer's local IP address (e.g., '192.168.1.5')
  //    - On Mac: Run `ipconfig getifaddr en0` in terminal
  //    - On Windows: Run `ipconfig` and look for IPv4 Address
  // ---------------------------------------------------------------------------
  
  // CHANGE THIS IP ADDRESS to match your setup
  static const String _host = '192.168.1.17'; 
  // static const String _host = '10.0.2.2'; // Android Emulator default
  // static const String _host = '192.168.1.X'; // Your Local IP
  
  static const String _port = '8080';

  static const String baseUrl = 'http://$_host:$_port/api';
  
  static const String authUrl = '$baseUrl/auth';
  static const String toolsUrl = '$baseUrl/tools';
}
