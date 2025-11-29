<?php
if (!defined('ABSPATH')) {
    exit;
}

// Handle form submission
if (isset($_POST['yt_monitor_save_settings'])) {
    check_admin_referer('yt_monitor_settings');
    
    update_option('yt_monitor_api_url', sanitize_text_field($_POST['api_url']));
    update_option('yt_monitor_retention_days', intval($_POST['retention_days']));
    update_option('yt_monitor_notifications_enabled', isset($_POST['notifications_enabled']));
    update_option('yt_monitor_notification_email', sanitize_email($_POST['notification_email']));
    
    $notification_settings = [
        'device_offline' => isset($_POST['notify_device_offline']),
        'block_attempts' => isset($_POST['notify_block_attempts']),
        'daily_digest' => isset($_POST['notify_daily_digest']),
        'weekly_report' => isset($_POST['notify_weekly_report'])
    ];
    update_option('yt_monitor_notification_settings', json_encode($notification_settings));
    
    echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
}

// Get current settings
$api_url = get_option('yt_monitor_api_url', get_site_url());
$retention_days = get_option('yt_monitor_retention_days', 30);
$notifications_enabled = get_option('yt_monitor_notifications_enabled', false);
$notification_email = get_option('yt_monitor_notification_email', get_option('admin_email'));
$notification_settings = json_decode(get_option('yt_monitor_notification_settings', '{}'), true);
?>

<div class="wrap">
    <h1>YouTube Monitor Settings</h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('yt_monitor_settings'); ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">Admin / API URL</th>
                <td>
                    <input type="url" name="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" required>
                    <p class="description">The base URL for your WordPress installation (e.g., https://yt.ai15.me). This is where the Chrome extension will connect.</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Data Retention</th>
                <td>
                    <input type="number" name="retention_days" value="<?php echo esc_attr($retention_days); ?>" min="1" max="365" required>
                    <span>days</span>
                    <p class="description">Watch history older than this many days will be automatically deleted.</p>
                </td>
            </tr>
        </table>
        
        <h2>Notifications</h2>
        
        <table class="form-table">
            <tr>
                <th scope="row">Enable Notifications</th>
                <td>
                    <label>
                        <input type="checkbox" name="notifications_enabled" value="1" <?php checked($notifications_enabled, true); ?>>
                        Send email notifications
                    </label>
                    <p class="description">Master toggle for all notification types. When disabled, no emails will be sent.</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Notification Email</th>
                <td>
                    <input type="email" name="notification_email" value="<?php echo esc_attr($notification_email); ?>" class="regular-text" required>
                    <p class="description">Email address where notifications will be sent.</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">Alert Types</th>
                <td>
                    <fieldset>
                        <label>
                            <input type="checkbox" name="notify_device_offline" value="1" <?php checked($notification_settings['device_offline'] ?? false, true); ?>>
                            Device offline (30+ minutes)
                        </label><br>
                        
                        <label>
                            <input type="checkbox" name="notify_block_attempts" value="1" <?php checked($notification_settings['block_attempts'] ?? false, true); ?>>
                            Multiple block attempts
                        </label><br>
                        
                        <label>
                            <input type="checkbox" name="notify_daily_digest" value="1" <?php checked($notification_settings['daily_digest'] ?? false, true); ?>>
                            Daily activity digest
                        </label><br>
                        
                        <label>
                            <input type="checkbox" name="notify_weekly_report" value="1" <?php checked($notification_settings['weekly_report'] ?? false, true); ?>>
                            Weekly summary report
                        </label>
                    </fieldset>
                    <p class="description">Select which types of notifications you want to receive (only when notifications are enabled).</p>
                </td>
            </tr>
        </table>
        
        <p class="submit">
            <input type="submit" name="yt_monitor_save_settings" class="button button-primary" value="Save Settings">
        </p>
    </form>
    
    <hr>
    
    <h2>Extension Setup</h2>
    <p>To connect devices to this WordPress installation:</p>
    <ol>
        <li>Download the Chrome extension from the repository</li>
        <li>Configure the extension with this API URL: <code><?php echo esc_html($api_url); ?></code></li>
        <li>Install the extension in Chrome (chrome://extensions → Load unpacked)</li>
        <li>The device will automatically register and appear in the Devices page</li>
    </ol>
    
    <p><strong>API Endpoint:</strong> <code><?php echo esc_html($api_url); ?>/wp-json/yt-filter/v1/</code></p>
</div>