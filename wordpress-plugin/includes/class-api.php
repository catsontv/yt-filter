<?php
/**
 * REST API endpoints for YouTube Monitor
 */

class YT_Monitor_API {
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route('yt-filter/v1', '/register', [
            'methods' => 'POST',
            'callback' => [$this, 'register_device'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route('yt-filter/v1', '/watch-history', [
            'methods' => 'POST',
            'callback' => [$this, 'receive_watch_history'],
            'permission_callback' => [$this, 'verify_device']
        ]);
        
        register_rest_route('yt-filter/v1', '/blocks/(?P<device_id>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_blocks'],
            'permission_callback' => [$this, 'verify_device']
        ]);
        
        register_rest_route('yt-filter/v1', '/heartbeat/(?P<device_id>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'heartbeat'],
            'permission_callback' => [$this, 'verify_device']
        ]);
        
        register_rest_route('yt-filter/v1', '/block-attempt', [
            'methods' => 'POST',
            'callback' => [$this, 'log_block_attempt'],
            'permission_callback' => [$this, 'verify_device']
        ]);
    }
    
    /**
     * Verify device authentication
     */
    public function verify_device($request) {
        $api_key = $request->get_header('X-YT-Device-Key');
        
        if (empty($api_key)) {
            return false;
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        $device = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE api_key = %s AND status = 'active'",
            $api_key
        ));
        
        return !empty($device);
    }
    
    /**
     * Register new device
     */
    public function register_device($request) {
        $params = $request->get_json_params();
        
        if (empty($params['device_id']) || empty($params['device_name'])) {
            return new WP_Error('missing_params', 'Device ID and name are required', ['status' => 400]);
        }
        
        $db = new YT_Monitor_Database();
        
        // Check if device already exists
        $existing = $db->get_device($params['device_id']);
        if ($existing) {
            return new WP_REST_Response([
                'success' => true,
                'message' => 'Device already registered',
                'device_id' => $params['device_id'],
                'api_key' => $existing->api_key
            ], 200);
        }
        
        // Create new device (admin_id defaults to 1 for now)
        $api_key = $db->create_device($params['device_id'], $params['device_name'], 1);
        
        return new WP_REST_Response([
            'success' => true,
            'device_id' => $params['device_id'],
            'api_key' => $api_key
        ], 201);
    }
    
    /**
     * Receive watch history from device
     */
    public function receive_watch_history($request) {
        $api_key = $request->get_header('X-YT-Device-Key');
        $params = $request->get_json_params();
        
        if (empty($params) || !is_array($params)) {
            return new WP_Error('invalid_data', 'Invalid watch history data', ['status' => 400]);
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        $device = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE api_key = %s",
            $api_key
        ));
        
        if (!$device) {
            return new WP_Error('invalid_device', 'Device not found', ['status' => 404]);
        }
        
        $db = new YT_Monitor_Database();
        
        foreach ($params as $entry) {
            $db->add_watch_history([
                'admin_id' => $device->admin_id,
                'device_id' => $device->device_id,
                'video_id' => $entry['video_id'] ?? '',
                'video_title' => $entry['video_title'] ?? '',
                'channel_id' => $entry['channel_id'] ?? '',
                'channel_name' => $entry['channel_name'] ?? '',
                'watch_date' => $entry['watch_date'] ?? current_time('mysql'),
                'watch_duration' => $entry['watch_duration'] ?? 0,
                'completed' => $entry['completed'] ?? 0
            ]);
        }
        
        // Update heartbeat
        $db->update_heartbeat($device->device_id);
        
        return new WP_REST_Response(['success' => true], 200);
    }
    
    /**
     * Get blocks for device
     */
    public function get_blocks($request) {
        $device_id = $request['device_id'];
        $api_key = $request->get_header('X-YT-Device-Key');
        
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        $device = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE device_id = %s AND api_key = %s",
            $device_id,
            $api_key
        ));
        
        if (!$device) {
            return new WP_Error('invalid_device', 'Device not found', ['status' => 404]);
        }
        
        $db = new YT_Monitor_Database();
        $blocks = $db->get_blocks($device_id, $device->admin_id);
        
        $videos = [];
        $channels = [];
        
        foreach ($blocks as $block) {
            if ($block->block_type === 'video') {
                $videos[] = [
                    'id' => $block->block_id,
                    'name' => $block->block_name
                ];
            } elseif ($block->block_type === 'channel') {
                $channels[] = [
                    'id' => $block->block_id,
                    'name' => $block->block_name
                ];
            }
        }
        
        return new WP_REST_Response([
            'videos' => $videos,
            'channels' => $channels,
            'hash' => md5(json_encode($blocks))
        ], 200);
    }
    
    /**
     * Heartbeat ping from device
     */
    public function heartbeat($request) {
        $device_id = $request['device_id'];
        $api_key = $request->get_header('X-YT-Device-Key');
        
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        $device = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE device_id = %s AND api_key = %s",
            $device_id,
            $api_key
        ));
        
        if (!$device) {
            return new WP_Error('invalid_device', 'Device not found', ['status' => 404]);
        }
        
        $db = new YT_Monitor_Database();
        $db->update_heartbeat($device_id);
        
        return new WP_REST_Response(['success' => true, 'timestamp' => current_time('mysql')], 200);
    }
    
    /**
     * Log block attempt
     */
    public function log_block_attempt($request) {
        $api_key = $request->get_header('X-YT-Device-Key');
        $params = $request->get_json_params();
        
        global $wpdb;
        $table = $wpdb->prefix . 'yt_devices';
        $device = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE api_key = %s",
            $api_key
        ));
        
        if (!$device) {
            return new WP_Error('invalid_device', 'Device not found', ['status' => 404]);
        }
        
        $db = new YT_Monitor_Database();
        $db->log_block_attempt(
            $device->device_id,
            $params['block_type'] ?? 'unknown',
            $params['block_id'] ?? '',
            $params['block_name'] ?? ''
        );
        
        return new WP_REST_Response(['success' => true], 200);
    }
}