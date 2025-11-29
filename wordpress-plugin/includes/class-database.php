<?php
/**
 * Database operations for YouTube Monitor
 */

class YT_Monitor_Database {
    
    /**
     * Create plugin database tables
     */
    public function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Devices table
        $table_devices = $wpdb->prefix . 'yt_devices';
        $sql_devices = "CREATE TABLE $table_devices (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            device_id varchar(255) NOT NULL,
            device_name varchar(255) NOT NULL,
            admin_id bigint(20) NOT NULL,
            api_key varchar(255) NOT NULL,
            last_heartbeat datetime DEFAULT NULL,
            status varchar(20) DEFAULT 'active',
            created_date datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY device_id (device_id),
            KEY admin_id (admin_id)
        ) $charset_collate;";
        dbDelta($sql_devices);
        
        // Watch history table
        $table_history = $wpdb->prefix . 'yt_watch_history';
        $sql_history = "CREATE TABLE $table_history (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            admin_id bigint(20) NOT NULL,
            device_id varchar(255) NOT NULL,
            video_id varchar(255) NOT NULL,
            video_title text DEFAULT NULL,
            channel_id varchar(255) DEFAULT NULL,
            channel_name varchar(255) DEFAULT NULL,
            watch_date datetime DEFAULT CURRENT_TIMESTAMP,
            watch_duration int(11) DEFAULT 0,
            completed tinyint(1) DEFAULT 0,
            PRIMARY KEY  (id),
            KEY admin_id (admin_id),
            KEY device_id (device_id),
            KEY video_id (video_id),
            KEY channel_id (channel_id),
            KEY watch_date (watch_date)
        ) $charset_collate;";
        dbDelta($sql_history);
        
        // Blocks table
        $table_blocks = $wpdb->prefix . 'yt_blocks';
        $sql_blocks = "CREATE TABLE $table_blocks (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            admin_id bigint(20) NOT NULL,
            block_type varchar(20) NOT NULL,
            block_id varchar(255) NOT NULL,
            block_name varchar(255) DEFAULT NULL,
            applies_to_devices text DEFAULT NULL,
            created_date datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY admin_id (admin_id),
            KEY block_type (block_type),
            KEY block_id (block_id)
        ) $charset_collate;";
        dbDelta($sql_blocks);
        
        // Block attempts table
        $table_attempts = $wpdb->prefix . 'yt_block_attempts';
        $sql_attempts = "CREATE TABLE $table_attempts (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            device_id varchar(255) NOT NULL,
            block_type varchar(20) NOT NULL,
            block_id varchar(255) NOT NULL,
            block_name varchar(255) DEFAULT NULL,
            attempt_date datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY device_id (device_id),
            KEY attempt_date (attempt_date)
        ) $charset_collate;";
        dbDelta($sql_attempts);
    }
    
    /**
     * Get device by device_id
     */
    public function get_device($device_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE device_id = %s",
            $device_id
        ));
    }
    
    /**
     * Create new device
     */
    public function create_device($device_id, $device_name, $admin_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        
        $api_key = wp_generate_password(32, false);
        
        $wpdb->insert($table, [
            'device_id' => $device_id,
            'device_name' => $device_name,
            'admin_id' => $admin_id,
            'api_key' => $api_key,
            'status' => 'active'
        ]);
        
        return $api_key;
    }
    
    /**
     * Update device heartbeat
     */
    public function update_heartbeat($device_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        
        $wpdb->update(
            $table,
            ['last_heartbeat' => current_time('mysql')],
            ['device_id' => $device_id]
        );
    }
    
    /**
     * Get all blocks for a device
     */
    public function get_blocks($device_id, $admin_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_blocks';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE admin_id = %d AND (applies_to_devices IS NULL OR applies_to_devices = '' OR applies_to_devices LIKE %s)",
            $admin_id,
            '%' . $wpdb->esc_like($device_id) . '%'
        ));
    }
    
    /**
     * Add watch history entry
     */
    public function add_watch_history($data) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_watch_history';
        
        $wpdb->insert($table, [
            'admin_id' => $data['admin_id'],
            'device_id' => $data['device_id'],
            'video_id' => $data['video_id'],
            'video_title' => $data['video_title'],
            'channel_id' => $data['channel_id'],
            'channel_name' => $data['channel_name'],
            'watch_date' => $data['watch_date'],
            'watch_duration' => $data['watch_duration'],
            'completed' => $data['completed']
        ]);
    }
    
    /**
     * Log block attempt
     */
    public function log_block_attempt($device_id, $block_type, $block_id, $block_name) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_block_attempts';
        
        $wpdb->insert($table, [
            'device_id' => $device_id,
            'block_type' => $block_type,
            'block_id' => $block_id,
            'block_name' => $block_name
        ]);
    }
}