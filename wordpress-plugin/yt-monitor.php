<?php
/**
 * Plugin Name: YouTube Monitor
 * Plugin URI: https://github.com/catsontv/yt-filter
 * Description: Monitor YouTube watch history and manage content blocks across multiple devices via Chrome extension
 * Version: 1.0.0
 * Author: catsontv
 * Author URI: https://github.com/catsontv
 * License: MIT
 * Text Domain: yt-monitor
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('YT_MONITOR_VERSION', '1.0.0');
define('YT_MONITOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('YT_MONITOR_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once YT_MONITOR_PLUGIN_DIR . 'includes/class-database.php';
require_once YT_MONITOR_PLUGIN_DIR . 'includes/class-api.php';
require_once YT_MONITOR_PLUGIN_DIR . 'includes/class-notifications.php';
require_once YT_MONITOR_PLUGIN_DIR . 'includes/class-device-manager.php';

/**
 * Activation hook - create database tables
 */
function yt_monitor_activate() {
    $database = new YT_Monitor_Database();
    $database->create_tables();
    
    // Set default options
    add_option('yt_monitor_api_url', get_site_url());
    add_option('yt_monitor_retention_days', 30);
    add_option('yt_monitor_notifications_enabled', false);
    add_option('yt_monitor_notification_email', get_option('admin_email'));
    add_option('yt_monitor_notification_settings', json_encode([
        'device_offline' => false,
        'block_attempts' => false,
        'daily_digest' => false,
        'weekly_report' => false
    ]));
    
    // Schedule data cleanup cron
    if (!wp_next_scheduled('yt_monitor_cleanup_old_data')) {
        wp_schedule_event(time(), 'daily', 'yt_monitor_cleanup_old_data');
    }
}
register_activation_hook(__FILE__, 'yt_monitor_activate');

/**
 * Deactivation hook - clean up scheduled tasks
 */
function yt_monitor_deactivate() {
    wp_clear_scheduled_hook('yt_monitor_cleanup_old_data');
}
register_deactivation_hook(__FILE__, 'yt_monitor_deactivate');

/**
 * Initialize the plugin
 */
function yt_monitor_init() {
    // Register REST API endpoints
    $api = new YT_Monitor_API();
    $api->register_routes();
    
    // Add admin menu
    add_action('admin_menu', 'yt_monitor_admin_menu');
    
    // Enqueue admin assets
    add_action('admin_enqueue_scripts', 'yt_monitor_enqueue_admin_assets');
}
add_action('init', 'yt_monitor_init');

/**
 * Add admin menu pages
 */
function yt_monitor_admin_menu() {
    add_menu_page(
        'YouTube Monitor',
        'YT Monitor',
        'manage_options',
        'yt-monitor',
        'yt_monitor_dashboard_page',
        'dashicons-video-alt3',
        30
    );
    
    add_submenu_page(
        'yt-monitor',
        'Dashboard',
        'Dashboard',
        'manage_options',
        'yt-monitor',
        'yt_monitor_dashboard_page'
    );
    
    add_submenu_page(
        'yt-monitor',
        'Watch History',
        'Watch History',
        'manage_options',
        'yt-monitor-history',
        'yt_monitor_history_page'
    );
    
    add_submenu_page(
        'yt-monitor',
        'Blocks',
        'Blocks',
        'manage_options',
        'yt-monitor-blocks',
        'yt_monitor_blocks_page'
    );
    
    add_submenu_page(
        'yt-monitor',
        'Devices',
        'Devices',
        'manage_options',
        'yt-monitor-devices',
        'yt_monitor_devices_page'
    );
    
    add_submenu_page(
        'yt-monitor',
        'Settings',
        'Settings',
        'manage_options',
        'yt-monitor-settings',
        'yt_monitor_settings_page'
    );
}

/**
 * Enqueue admin assets
 */
function yt_monitor_enqueue_admin_assets($hook) {
    if (strpos($hook, 'yt-monitor') === false) {
        return;
    }
    
    wp_enqueue_style(
        'yt-monitor-admin',
        YT_MONITOR_PLUGIN_URL . 'assets/css/admin.css',
        [],
        YT_MONITOR_VERSION
    );
    
    wp_enqueue_script(
        'yt-monitor-admin',
        YT_MONITOR_PLUGIN_URL . 'assets/js/admin.js',
        ['jquery'],
        YT_MONITOR_VERSION,
        true
    );
    
    wp_localize_script('yt-monitor-admin', 'ytMonitor', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('yt-monitor-nonce')
    ]);
}

/**
 * Include admin page templates
 */
function yt_monitor_dashboard_page() {
    require_once YT_MONITOR_PLUGIN_DIR . 'admin/dashboard.php';
}

function yt_monitor_history_page() {
    require_once YT_MONITOR_PLUGIN_DIR . 'admin/watch-history.php';
}

function yt_monitor_blocks_page() {
    require_once YT_MONITOR_PLUGIN_DIR . 'admin/blocks.php';
}

function yt_monitor_devices_page() {
    require_once YT_MONITOR_PLUGIN_DIR . 'admin/devices.php';
}

function yt_monitor_settings_page() {
    require_once YT_MONITOR_PLUGIN_DIR . 'admin/settings.php';
}

/**
 * Scheduled cleanup of old watch history data
 */
function yt_monitor_cleanup_old_data() {
    global $wpdb;
    $retention_days = get_option('yt_monitor_retention_days', 30);
    
    $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->prefix}yt_watch_history WHERE watch_date < DATE_SUB(NOW(), INTERVAL %d DAY)",
        $retention_days
    ));
}
add_action('yt_monitor_cleanup_old_data', 'yt_monitor_cleanup_old_data');