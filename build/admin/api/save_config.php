<?php
// Включаем отображение всех ошибок, но сохраняем их в лог
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Устанавливаем обработчик ошибок для перехвата PHP-ошибок
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $error_message = "Error: $errstr in $errfile on line $errline";
    error_log($error_message);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error occurred. Check server logs for details.'
    ]);
    exit;
});

// Устанавливаем обработчик исключений
set_exception_handler(function($exception) {
    $error_message = "Exception: " . $exception->getMessage() . " in " . $exception->getFile() . " on line " . $exception->getLine();
    error_log($error_message);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Exception occurred: ' . $exception->getMessage()
    ]);
    exit;
});

// Включаем буферизацию вывода
ob_start();

try {
    // Include authentication and functions
    require_once '../includes/auth.php';

    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(false, 'Invalid request method');
    }

    // Get raw input
    $raw_input = file_get_contents('php://input');

    // Check if input is too large (Prevent memory issues)
    if (strlen($raw_input) > 10 * 1024 * 1024) { // 10MB limit
        json_response(false, 'Input data too large');
    }

    // Get JSON data
    $config_data = json_decode($raw_input, true);

    // Validate JSON data
    if ($config_data === null) {
        $error = json_last_error_msg();
        json_response(false, "Invalid JSON data: $error");
    }

    // Log the received data
    error_log("Received config data: " . substr(print_r($config_data, true), 0, 1000) . "...");

    // Validate essential config structure
    if (!isset($config_data['filters'])) {
        json_response(false, 'Configuration data is missing filters section');
    }

    if (!isset($config_data['mapSettings'])) {
        json_response(false, 'Configuration data is missing mapSettings section');
    }

    if (!isset($config_data['content'])) {
        json_response(false, 'Configuration data is missing content section');
    }

    // Basic validation for required fields
    if (!isset($config_data['filters']['leftFilters']) ||
        !isset($config_data['filters']['rightFilters'])) {
        json_response(false, 'Filters section is missing required data');
    }

    if (!isset($config_data['mapSettings']['center']) ||
        !isset($config_data['mapSettings']['initialZoom']) ||
        !isset($config_data['mapSettings']['maxZoom'])) {
        json_response(false, 'Map settings section is missing required data');
    }

    if (!isset($config_data['content']['cities']) ||
        !isset($config_data['content']['navLinks']) ||
        !isset($config_data['content']['buttonLabels']) ||
        !isset($config_data['content']['footerText'])) {
        json_response(false, 'Content section is missing required data');
    }

    // Проверяем права доступа к директории и файлу
    $project_root = get_project_root();
    $data_dir = $project_root . 'data';
    $config_file = $data_dir . '/config.json';

    // Проверяем существование директории data
    if (!is_dir($data_dir)) {
        if (!mkdir($data_dir, 0755, true)) {
            json_response(false, "Failed to create directory: $data_dir");
        }
    }

    // Проверяем права на запись в директорию
    if (!is_writable($data_dir)) {
        json_response(false, "Directory is not writable: $data_dir");
    }

    // Если файл существует, проверяем права на запись
    if (file_exists($config_file) && !is_writable($config_file)) {
        json_response(false, "File is not writable: $config_file");
    }

    // Save configuration data
    $result = save_config($config_data);

    if ($result) {
        // Clear output buffer
        ob_end_clean();
        json_response(true, 'Configuration saved successfully');
    } else {
        json_response(false, 'Failed to save configuration data');
    }
} catch (Exception $e) {
    ob_end_clean();
    error_log('Exception: ' . $e->getMessage());
    json_response(false, 'An error occurred: ' . $e->getMessage());
}

// If we get here, something unexpected happened
ob_end_clean();
json_response(false, 'An unexpected error occurred');
