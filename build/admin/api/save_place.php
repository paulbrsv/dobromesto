<?php
// Отключаем вывод ошибок на экран
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Включаем буферизацию вывода, чтобы ничего не попало в ответ до отправки JSON
ob_start();

try {
    // Include authentication and functions
    require_once '../includes/auth.php';

    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ob_end_clean();
        json_response(false, 'Invalid request method');
    }

    // Проверка доступности директорий и прав на запись
    $project_root = get_project_root();
    $data_dir = $project_root . 'data';
    $images_dir = $project_root . 'data/images';

    // Проверяем существование директории data
    if (!is_dir($data_dir)) {
        if (!@mkdir($data_dir, 0755, true)) {
            ob_end_clean();
            json_response(false, "Cannot create directory: $data_dir. Check folder permissions.");
        }
    }

    // Проверяем права на запись в директорию data
    if (!is_writable($data_dir)) {
        ob_end_clean();
        json_response(false, "Directory is not writable: $data_dir. Check folder permissions.");
    }

    // Проверяем существование директории images
    if (!is_dir($images_dir)) {
        if (!@mkdir($images_dir, 0755, true)) {
            ob_end_clean();
            json_response(false, "Cannot create directory: $images_dir. Check folder permissions.");
        }
    }

    // Проверяем права на запись в директорию images
    if (!is_writable($images_dir)) {
        ob_end_clean();
        json_response(false, "Directory is not writable: $images_dir. Check folder permissions.");
    }

    // Get form data
    $place_id = isset($_POST['place_id']) && $_POST['place_id'] !== '' ? (int)$_POST['place_id'] : null;
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $lat = isset($_POST['lat']) ? (float)$_POST['lat'] : 0;
    $lng = isset($_POST['lng']) ? (float)$_POST['lng'] : 0;
    $shirt_description = isset($_POST['shirt_description']) ? trim($_POST['shirt_description']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';
    $link = isset($_POST['link']) ? trim($_POST['link']) : '';
    $instagram = isset($_POST['instagram']) ? trim($_POST['instagram']) : '';
    $maps_url = isset($_POST['maps_url']) ? trim($_POST['maps_url']) : '';
    $verified = isset($_POST['verified']) && $_POST['verified'] === '1';
    $current_image = isset($_POST['current_image']) ? trim($_POST['current_image']) : '';

    // Get attributes
    $attributes = isset($_POST['attributes']) && is_array($_POST['attributes']) ? $_POST['attributes'] : [];

    // Validate required fields
    if (empty($name) || empty($shirt_description) || empty($description)) {
        ob_end_clean();
        json_response(false, 'Name, short description, and description are required');
    }

    // Load existing places
    try {
        $places = load_places();
        if ($places === null) {
            $places = [];
        }
    } catch (Exception $e) {
        ob_end_clean();
        json_response(false, 'Failed to load places data: ' . $e->getMessage());
    }

    // Create place data array
    $place_data = [
        'name' => $name,
        'lat' => $lat,
        'lng' => $lng,
        'shirt_description' => $shirt_description,
        'description' => $description,
        'link' => $link,
        'instagram' => $instagram,
        'maps_url' => $maps_url,
        'verified' => $verified,
        'image' => $current_image, // Will be updated if new image is uploaded
        'attributes' => $attributes
    ];

    // Handle image upload if provided
    $image_path = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        try {
            $image_path = upload_image($_FILES['image']);

            if ($image_path === false) {
                ob_end_clean();
                json_response(false, 'Failed to upload image. Please ensure it is a valid image file (JPG, PNG, GIF, WEBP) and try again.');
            }

            // Update place data with new image path
            $place_data['image'] = $image_path;
        } catch (Exception $e) {
            ob_end_clean();
            json_response(false, 'Error processing image upload: ' . $e->getMessage());
        }
    }

    // Check if image is required for new places
    if ($place_id === null && empty($place_data['image'])) {
        ob_end_clean();
        json_response(false, 'Image is required for new places');
    }

    // Update or add place
    if ($place_id !== null) {
        // Check if place exists
        if (!isset($places[$place_id])) {
            ob_end_clean();
            json_response(false, 'Place not found');
        }

        // Update existing place
        $places[$place_id] = $place_data;
        $message = 'Place updated successfully';
    } else {
        // Add new place
        $places[] = $place_data;
        $message = 'Place added successfully';
    }

    // Save updated places data
    try {
        $save_result = save_places($places);
        if ($save_result) {
            ob_end_clean();
            json_response(true, $message, ['image_path' => $image_path]);
        } else {
            ob_end_clean();
            json_response(false, 'Failed to save places data. Check file permissions.');
        }
    } catch (Exception $e) {
        ob_end_clean();
        json_response(false, 'Error saving places data: ' . $e->getMessage());
    }
} catch (Exception $e) {
    // Очищаем буфер вывода и отправляем ошибку в JSON-формате
    ob_end_clean();
    json_response(false, 'Unexpected error: ' . $e->getMessage());
}

// If we reach here, something unexpected happened
ob_end_clean();
json_response(false, 'An unexpected error occurred');
