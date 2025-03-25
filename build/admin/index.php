<?php
// Start session
session_start();

// Include auth functions
require_once 'includes/functions.php';

// Check if the user is already logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: places.php');
    exit;
}

// Initialize variables
$error = '';
$username = '';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get credentials from POST data
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Validate credentials (using a configuration file for credentials)
    $admin_config = get_admin_config();

    if ($username === $admin_config['username'] && password_verify($password, $admin_config['password_hash'])) {
        // Set session variables
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;

        // Redirect to places management page
        header('Location: places.php');
        exit;
    } else {
        $error = 'Invalid username or password';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Places App</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-header">
            <h1>Places App Admin</h1>
            <p>Enter your credentials to access the admin panel</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="post" action="" class="login-form">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" value="<?php echo htmlspecialchars($username); ?>" required>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Log In</button>
            </div>
        </form>
    </div>

    <script src="js/admin.js"></script>
</body>
</html>
