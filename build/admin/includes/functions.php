<?php
/**
 * Helper functions for the admin panel
 */

/**
 * Get project root directory
 *
 * @return string Project root directory with trailing slash
 */
function get_project_root() {
    // This will return the path to the 'public' directory
    return realpath(__DIR__ . '/../../') . '/';
}

/**
 * Get admin configuration
 *
 * @return array Admin config with username and password hash
 */
function get_admin_config() {
    $config_file = __DIR__ . '/admin_config.json';

    // Check if config file exists, if not create it with default credentials
    if (!file_exists($config_file)) {
        $default_config = [
            'username' => 'admin',
            // Default password is 'admin123'
            'password_hash' => password_hash('admin123', PASSWORD_DEFAULT)
        ];

        file_put_contents($config_file, json_encode($default_config, JSON_PRETTY_PRINT));
        return $default_config;
    }

    // Read and return config
    $config = json_decode(file_get_contents($config_file), true);
    return $config;
}

/**
 * Check if user is authenticated
 *
 * @return bool True if authenticated, false otherwise
 */
function is_authenticated() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Require authentication or redirect to login
 */
function require_auth() {
    if (!is_authenticated()) {
        header('Location: index.php');
        exit;
    }
}

/**
 * Load places data
 *
 * @return array Places data
 */
function load_places() {
    $project_root = get_project_root();
    $places_file = $project_root . 'data/places.json';

    if (!file_exists($places_file)) {
        return [];
    }

    return json_decode(file_get_contents($places_file), true);
}

/**
 * Save places data
 *
 * @param array $places Places data to save
 * @return bool True on success, false on failure
 */
function save_places($places) {
    $project_root = get_project_root();
    $places_file = $project_root . 'data/places.json';

    // Create backup before saving
    if (file_exists($places_file)) {
        $backup_file = $project_root . 'data/places_backup_' . date('Y-m-d_H-i-s') . '.json';
        copy($places_file, $backup_file);
    }

    // Ensure the directory exists
    $data_dir = $project_root . 'data';
    if (!is_dir($data_dir)) {
        mkdir($data_dir, 0755, true);
    }

    // Write new data
    $result = file_put_contents($places_file, json_encode($places, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return $result !== false;
}

/**
 * Load app configuration
 *
 * @return array App configuration
 */
function load_config() {
    $project_root = get_project_root();
    $config_file = $project_root . 'data/config.json';

    if (!file_exists($config_file)) {
        return [];
    }

    return json_decode(file_get_contents($config_file), true);
}

/**
 * Save app configuration
 *
 * @param array $config Configuration to save
 * @return bool True on success, false on failure
 */
function save_config($config) {
    $project_root = get_project_root();
    $config_file = $project_root . 'data/config.json';

    // Create backup before saving
    if (file_exists($config_file)) {
        $backup_file = $project_root . 'data/config_backup_' . date('Y-m-d_H-i-s') . '.json';
        copy($config_file, $backup_file);
    }

    // Ensure the directory exists
    $data_dir = $project_root . 'data';
    if (!is_dir($data_dir)) {
        mkdir($data_dir, 0755, true);
    }

    // Write new data
    $result = file_put_contents($config_file, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return $result !== false;
}

/**
 * Check if a string is valid JSON
 *
 * @param string $string String to check
 * @return bool True if valid JSON, false otherwise
 */
function is_valid_json($string) {
    json_decode($string);
    return json_last_error() === JSON_ERROR_NONE;
}

/**
 * Handle JSON API response
 *
 * @param bool $success Success status
 * @param string $message Response message
 * @param array $data Optional data to include
 */
function json_response($success, $message, $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Upload an image file
 *
 * @param array $file $_FILES array element
 * @param string $destination Destination directory (relative to project root)
 * @return string|false File path on success, false on failure
 */
function upload_image($file, $destination = 'data/images/') {
    // Check if file was uploaded without errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }

    // Validate file type
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed_types)) {
        return false;
    }

    $project_root = get_project_root();
    $full_destination = $project_root . $destination;

    // Create destination directory if it doesn't exist
    if (!is_dir($full_destination)) {
        mkdir($full_destination, 0755, true);
    }

    // Generate a unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $filepath = $full_destination . $filename;

    // Move the uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return '/data/images/' . $filename; // Return the path relative to document root
    }

    return false;
}
