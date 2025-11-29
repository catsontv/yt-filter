<?php
/**
 * Notification system for YouTube Monitor
 */

class YT_Monitor_Notifications {
    
    /**
     * Check if notifications are enabled
     */
    public function is_enabled() {
        return (bool) get_option('yt_monitor_notifications_enabled', false);
    }
    
    /**
     * Get notification email address
     */
    public function get_email() {
        return get_option('yt_monitor_notification_email', get_option('admin_email'));
    }
    
    /**
     * Get notification settings
     */
    public function get_settings() {
        $settings = get_option('yt_monitor_notification_settings', '');
        return json_decode($settings, true) ?: [];
    }
    
    /**
     * Send email notification
     */
    public function send($subject, $message, $type = 'info') {
        if (!$this->is_enabled()) {
            return false;
        }
        
        $settings = $this->get_settings();
        
        // Check if this type of notification is enabled
        if (isset($settings[$type]) && !$settings[$type]) {
            return false;
        }
        
        $email = $this->get_email();
        $headers = ['Content-Type: text/html; charset=UTF-8'];
        
        $html_message = $this->get_email_template($subject, $message);
        
        return wp_mail($email, '[YouTube Monitor] ' . $subject, $html_message, $headers);
    }
    
    /**
     * Email template wrapper
     */
    private function get_email_template($subject, $message) {
        $site_name = get_bloginfo('name');
        $site_url = get_site_url();
        
        return "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0073aa; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                a { color: #0073aa; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>YouTube Monitor</h2>
                </div>
                <div class='content'>
                    <h3>{$subject}</h3>
                    {$message}
                </div>
                <div class='footer'>
                    <p>This notification was sent from <a href='{$site_url}'>{$site_name}</a></p>
                    <p><a href='{$site_url}/wp-admin/admin.php?page=yt-monitor-settings'>Manage notification settings</a></p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Send device offline alert
     */
    public function device_offline($device_name, $device_id, $last_seen) {
        $subject = "Device Offline: {$device_name}";
        $message = "<p>The device <strong>{$device_name}</strong> (ID: {$device_id}) has been offline for more than 30 minutes.</p>
                    <p>Last seen: {$last_seen}</p>
                    <p>This may indicate the extension has been disabled or removed.</p>";
        
        return $this->send($subject, $message, 'device_offline');
    }
    
    /**
     * Send block attempt alert
     */
    public function block_attempt($device_name, $block_name, $block_type, $attempts_count) {
        $subject = "Multiple Block Attempts: {$device_name}";
        $message = "<p>The device <strong>{$device_name}</strong> has attempted to access blocked content {$attempts_count} times in the last hour.</p>
                    <p>Blocked {$block_type}: <strong>{$block_name}</strong></p>";
        
        return $this->send($subject, $message, 'block_attempts');
    }
    
    /**
     * Send daily digest
     */
    public function daily_digest($data) {
        $subject = "Daily Activity Digest";
        $message = "<h4>Today's Activity Summary</h4>";
        $message .= "<ul>";
        $message .= "<li>Total watch time: {$data['total_time']} minutes</li>";
        $message .= "<li>Videos watched: {$data['video_count']}</li>";
        $message .= "<li>Unique channels: {$data['channel_count']}</li>";
        $message .= "<li>Block attempts: {$data['block_attempts']}</li>";
        $message .= "</ul>";
        
        if (!empty($data['top_channels'])) {
            $message .= "<h4>Most Watched Channels</h4><ol>";
            foreach ($data['top_channels'] as $channel) {
                $message .= "<li>{$channel}</li>";
            }
            $message .= "</ol>";
        }
        
        return $this->send($subject, $message, 'daily_digest');
    }
}