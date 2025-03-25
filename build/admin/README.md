# Places App Admin Panel

This admin panel allows you to manage the Places App data files (`places.json` and `config.json`) through a web interface.

## Features

- Secure login system
- Places management (add, edit, view, delete)
- Configuration editor (form-based and JSON)
- Attribute management
- Image upload functionality
- Backup creation before saving changes

## Installation

1. Upload the `admin` folder to the `public` directory of your Places App
2. Ensure PHP 7.4+ is installed on your server
3. Make sure the following directories are writable by the web server:
   - `public/data/`
   - `public/data/images/`
   - `public/admin/includes/`

## Initial Setup

The first time you access the admin panel, a default admin account will be created:
- Username: `admin`
- Password: `admin123`

It is **strongly recommended** to change the default password after your first login by editing the `admin_config.json` file in the `includes` directory.

To change the password:
1. Generate a new password hash using PHP:
   ```php
   echo password_hash('your_new_password', PASSWORD_DEFAULT);
   ```
2. Replace the `password_hash` value in `includes/admin_config.json` with the new hash

## Usage

### Managing Places

1. Log in to the admin panel
2. Navigate to the Places page
3. Use the "Add New Place" button to create a new place
4. Fill out the required information, including coordinates, description, and image
5. You can filter and search places using the controls at the top of the page
6. Click on the actions buttons to view, edit, or delete places

### Managing Configuration

1. Log in to the admin panel
2. Navigate to the Configuration page
3. Use the form interface to make changes to filters, map settings, and content
4. Toggle "Advanced Mode" to edit the JSON directly if needed
5. Click "Save Configuration" to save your changes

## File Structure

- `/admin/index.php` - Login page
- `/admin/places.php` - Places management
- `/admin/config.php` - Configuration management
- `/admin/logout.php` - Logout handler
- `/admin/includes/` - Helper files and functions
- `/admin/css/` - CSS styles
- `/admin/js/` - JavaScript files
- `/admin/api/` - API endpoints for data operations

## Security Considerations

- Always change the default admin password
- Consider implementing HTTPS for additional security
- Regularly back up your data directory
- Only grant admin access to trusted individuals

## Backup and Recovery

Before making changes to the data files, the system automatically creates backup files with timestamps. These backups are stored in the `public/data/` directory with names like:
- `places_backup_YYYY-MM-DD_HH-II-SS.json`
- `config_backup_YYYY-MM-DD_HH-II-SS.json`

To restore a backup, simply rename the backup file to replace the current file.
