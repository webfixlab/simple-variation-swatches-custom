<?php
/*
Plugin Name: Simple Variation Swatches for WooCommerce Custom
Description: A truly lightweight EASY to use and super FAST WooCommerce variation swatches solution to replace default variation dropdown with button, color, image & radio button fields.
Author: WebFix Lab
Author URI: https://webfixlab.com/
Version: 1.0
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
define( 'SVSWP', __FILE__ );
define( 'SVSWP_PATH', plugin_dir_path( SVSWP ) );

include( SVSWP_PATH . 'includes/core-data.php');
include( SVSWP_PATH . 'includes/class/admin/class-svswpro-admin-loader.php');

function disable_quantity_field_on_cart_page( $quantity, $cart_item_key ) {
    $cart = WC()->cart->get_cart();
    $cart_item = $cart[$cart_item_key];
    $product_id = $cart_item['product_id'];

    // Specify the product IDs for which you want to disable the quantity field
    $products_to_disable = array( 1020, 1109 ); // Replace with your product IDs

    if ( in_array( $product_id, $products_to_disable ) ) {
        $quantity = sprintf( '<div class="quantity"><input type="number" class="input-text qty text" step="1" min="1" max="" name="cart[%s][qty]" value="%s" title="Qty" size="4" inputmode="numeric" readonly style="pointer-events: none;"/></div>', $cart_item_key, $cart_item['quantity'] );
    }

    return $quantity;
}
add_filter( 'woocommerce_cart_item_quantity', 'disable_quantity_field_on_cart_page', 10, 2 );
