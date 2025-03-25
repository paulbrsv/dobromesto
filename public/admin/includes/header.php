<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get current page
$current_page = basename($_SERVER['SCRIPT_NAME']);

// Page titles
$page_titles = [
    'places.php' => 'Places Management',
    'config.php' => 'Configuration Management',
];

// Get current page title
$page_title = isset($page_titles[$current_page]) ? $page_titles[$current_page] : 'Admin Panel';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title; ?> - Places App Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-wrapper">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1>Places Admin</h1>
            </div>

            <nav class="sidebar-nav">
                <ul>
                    <li<?php echo $current_page === 'places.php' ? ' class="active"' : ''; ?>>
                        <a href="places.php"><i class="fas fa-map-marker-alt"></i> Places</a>
                    </li>
                    <li<?php echo $current_page === 'config.php' ? ' class="active"' : ''; ?>>
                        <a href="config.php"><i class="fas fa-cog"></i> Configuration</a>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <p>Logged in as: <strong><?php echo isset($_SESSION['username']) ? htmlspecialchars($_SESSION['username']) : 'Unknown'; ?></strong></p>
                <a href="logout.php" class="btn btn-sm btn-secondary"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </aside>

        <main class="content">
            <header class="content-header">
                <h2><?php echo $page_title; ?></h2>

                <div class="header-actions">
                    <?php if ($current_page === 'places.php'): ?>
                        <button id="add-place-btn" class="btn btn-primary"><i class="fas fa-plus"></i> Add New Place</button>
                    <?php endif; ?>
                </div>
            </header>

            <div class="content-body">
