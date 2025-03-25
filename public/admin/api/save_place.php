<?php
// Include authentication and functions
require_once '../includes/auth.php';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
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
    json_response(false, 'Name, short description, and description are required');
}

// Load existing places
$places = load_places();

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
    $image_path = upload_image($_FILES['image']);

    if ($image_path === false) {
        json_response(false, 'Failed to upload image. Please ensure it is a valid image file (JPG, PNG, GIF) and try again.');
    }

    // Update place data with new image path
    $place_data['image'] = $image_path;
}

// Check if image is required for new places
if ($place_id === null && empty($place_data['image'])) {
    json_response(false, 'Image is required for new places');
}

// Update or add place
if ($place_id !== null) {
    // Check if place exists
    if (!isset($places[$place_id])) {
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
if (save_places($places)) {
    json_response(true, $message, ['image_path' => $image_path]);
} else {
    json_response(false, 'Failed to save places data');
}
