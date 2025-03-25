<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include functions
require_once __DIR__ . '/functions.php';

// Check authentication
require_auth();
