<?php
if (!defined('ABSPATH')) {
    exit;
}

$device_manager = new YT_Monitor_Device_Manager();
$devices = $device_manager->get_all_devices();

global $wpdb;
$history_table = $wpdb->prefix . 'yt_watch_history';
$attempts_table = $wpdb->prefix . 'yt_block_attempts';

// Get today's statistics
$today_stats = $wpdb->get_row(
    "SELECT 
        COUNT(*) as video_count,
        COUNT(DISTINCT channel_id) as channel_count,
        SUM(watch_duration) as total_duration
    FROM $history_table 
    WHERE DATE(watch_date) = CURDATE()"
);

$today_attempts = $wpdb->get_var(
    "SELECT COUNT(*) FROM $attempts_table WHERE DATE(attempt_date) = CURDATE()"
);
?>

<div class="wrap">
    <h1>YouTube Monitor Dashboard</h1>
    
    <div class="yt-monitor-stats">
        <div class="yt-stat-box">
            <h3>Today's Activity</h3>
            <p><strong><?php echo $today_stats->video_count ?? 0; ?></strong> videos watched</p>
            <p><strong><?php echo $today_stats->channel_count ?? 0; ?></strong> unique channels</p>
            <p><strong><?php echo round(($today_stats->total_duration ?? 0) / 60, 1); ?></strong> minutes watched</p>
        </div>
        
        <div class="yt-stat-box">
            <h3>Block Attempts</h3>
            <p><strong><?php echo $today_attempts ?? 0; ?></strong> today</p>
        </div>
    </div>
    
    <h2>Active Devices</h2>
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th>Device Name</th>
                <th>Status</th>
                <th>Last Seen</th>
                <th>Device ID</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($devices)): ?>
                <tr>
                    <td colspan="4">No devices registered yet. Install the Chrome extension to get started.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($devices as $device): ?>
                    <?php $is_online = $device_manager->is_online($device); ?>
                    <tr>
                        <td><strong><?php echo esc_html($device->device_name); ?></strong></td>
                        <td>
                            <?php if ($is_online): ?>
                                <span style="color: green;">● Online</span>
                            <?php else: ?>
                                <span style="color: red;">● Offline</span>
                            <?php endif; ?>
                        </td>
                        <td><?php echo $device->last_heartbeat ? esc_html($device->last_heartbeat) : 'Never'; ?></td>
                        <td><code><?php echo esc_html($device->device_id); ?></code></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
    
    <br>
    
    <h2>Recent Watch History</h2>
    <?php
    $recent_history = $wpdb->get_results(
        "SELECT * FROM $history_table ORDER BY watch_date DESC LIMIT 10"
    );
    ?>
    
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th>Date</th>
                <th>Video</th>
                <th>Channel</th>
                <th>Device</th>
                <th>Duration (min)</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($recent_history)): ?>
                <tr>
                    <td colspan="5">No watch history yet.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($recent_history as $entry): ?>
                    <tr>
                        <td><?php echo esc_html($entry->watch_date); ?></td>
                        <td><?php echo esc_html($entry->video_title ?: $entry->video_id); ?></td>
                        <td><?php echo esc_html($entry->channel_name ?: $entry->channel_id); ?></td>
                        <td><code><?php echo esc_html($entry->device_id); ?></code></td>
                        <td><?php echo round($entry->watch_duration / 60, 1); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<style>
.yt-monitor-stats {
    display: flex;
    gap: 20px;
    margin: 20px 0;
}
.yt-stat-box {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 20px;
    flex: 1;
}
.yt-stat-box h3 {
    margin-top: 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}
.yt-stat-box p {
    margin: 10px 0;
}
</style>