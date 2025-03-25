<?php
// Include authentication and functions
require_once '../includes/auth.php';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Check if index is provided
if (!isset($data['index']) || !is_numeric($data['index'])) {
    json_response(false, 'Place index is required');
}

$index = (int)$data['index'];

// Load existing places
$places = load_places();

// Check if place exists
if (!isset($places[$index])) {
    json_response(false, 'Place not found');
}

// Get place data for reference
$place = $places[$index];

// Remove place
array_splice($places, $index, 1);

// Save updated places data
if (save_places($places)) {
    // Try to delete the image file if it's not referenced by other places
    if (!empty($place['image']) && strpos($place['image'], '/data/images/') === 0) {
        $image_path = '..' . $place['image'];

        // Check if other places use the same image
        $image_in_use = false;
        foreach ($places as $p) {
            if ($p['image'] === $place['image']) {
                $image_in_use = true;
                break;
            }
        }

        // Delete image if not in use
        if (!$image_in_use && file_exists($image_path)) {
            @unlink($image_path);
        }
    }

    json_response(true, 'Place deleted successfully');
} else {
    json_response(false, 'Failed to save places data');
}
