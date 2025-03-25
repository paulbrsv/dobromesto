<?php
// Include authentication and functions
require_once '../includes/auth.php';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
}

// Get JSON data
$config_data = json_decode(file_get_contents('php://input'), true);

// Validate JSON data
if ($config_data === null) {
    json_response(false, 'Invalid JSON data');
}

// Validate essential config structure
if (!isset($config_data['filters']) ||
    !isset($config_data['mapSettings']) ||
    !isset($config_data['content'])) {
    json_response(false, 'Configuration data is missing required sections');
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

// Save configuration data
if (save_config($config_data)) {
    json_response(true, 'Configuration saved successfully');
} else {
    json_response(false, 'Failed to save configuration data');
}
