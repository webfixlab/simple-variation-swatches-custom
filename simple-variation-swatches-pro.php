<?php
/*
Plugin Name: Simple Variation Swatches for WooCommerce PRO
Description: A truly lightweight EASY to use and super FAST WooCommerce variation swatches solution to replace default variation dropdown with button, color, image & radio button fields.
Author: WebFix Lab
Author URI: https://webfixlab.com/
Version: 1.2.2
Requires at least: 4.9
Tested up to: 6.4.1
Requires PHP: 7.0
WC requires at least: 3.6
WC tested up to: 8.2.2
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: simple-variation-swatches
*/
defined( 'ABSPATH' ) || exit;

// plugin path
define( 'SVSWP', __FILE__ ); // single product total
define( 'SVSWP_PATH', plugin_dir_path( SVSWP ) );

include( SVSWP_PATH . 'includes/core-data.php');
include( SVSWP_PATH . 'includes/class/admin/class-svswpro-admin-loader.php');
