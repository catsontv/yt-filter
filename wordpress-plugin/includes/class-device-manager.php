<?php
/**
 * Device management for YouTube Monitor
 */

class YT_Monitor_Device_Manager {
    
    /**
     * Get all devices for current admin
     */
    public function get_all_devices($admin_id = 1) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE admin_id = %d ORDER BY created_date DESC",
            $admin_id
        ));
    }
    
    /**
     * Check device online status
     */
    public function is_online($device) {
        if (empty($device->last_heartbeat)) {
            return false;
        }
        
        $last_heartbeat = strtotime($device->last_heartbeat);
        $threshold = 5 * 60; // 5 minutes
        
        return (time() - $last_heartbeat) < $threshold;
    }
    
    /**
     * Get device statistics
     */
    public function get_device_stats($device_id, $days = 7) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_watch_history';
        
        $stats = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                COUNT(*) as video_count,
                COUNT(DISTINCT channel_id) as channel_count,
                SUM(watch_duration) as total_duration
            FROM $table 
            WHERE device_id = %s 
            AND watch_date >= DATE_SUB(NOW(), INTERVAL %d DAY)",
            $device_id,
            $days
        ));
        
        return [
            'video_count' => $stats->video_count ?? 0,
            'channel_count' => $stats->channel_count ?? 0,
            'total_duration' => round(($stats->total_duration ?? 0) / 60, 1) // Convert to minutes
        ];
    }
    
    /**
     * Delete device and its data
     */
    public function delete_device($device_id) {
        global $wpdb;
        
        // Delete device
        $wpdb->delete(
            $wpdb->prefix . 'yt_devices',
            ['device_id' => $device_id]
        );
        
        // Delete watch history
        $wpdb->delete(
            $wpdb->prefix . 'yt_watch_history',
            ['device_id' => $device_id]
        );
        
        // Delete block attempts
        $wpdb->delete(
            $wpdb->prefix . 'yt_block_attempts',
            ['device_id' => $device_id]
        );
        
        return true;
    }
    
    /**
     * Update device name
     */
    public function update_device_name($device_id, $new_name) {
        global $wpdb;
        
        return $wpdb->update(
            $wpdb->prefix . 'yt_devices',
            ['device_name' => $new_name],
            ['device_id' => $device_id]
        );
    }
    
    /**
     * Toggle device status
     */
    public function toggle_status($device_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        
        $device = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE device_id = %s",
            $device_id
        ));
        
        if (!$device) {
            return false;
        }
        
        $new_status = $device->status === 'active' ? 'inactive' : 'active';
        
        return $wpdb->update(
            $table,
            ['status' => $new_status],
            ['device_id' => $device_id]
        );
    }
}