<?php
/**
 * Frontend Swatch PRO Class
 *
 * @package    WordPress
 * @subpackage Simple Variation Swatches PRO for WooCommerce
 * @since      1.0
 */

if ( ! class_exists( 'SVSWPro' ) ) {
	class SVSWPro {

		public function __construct() {}
		public function init() {
			add_filter( 'svsw_data_pack', array( $this, 'pack_data' ), 10, 1 );

			add_action( 'svsw_after_att_name', array( $this, 'att_name' ), 10, 2 );
			add_action( 'svsw_after_atts', array( $this, 'pack_info' ), 10, 2 );
			add_action( 'svsw_after_atts', array( $this, 'variation_data' ), 11, 2 );

			// Cart Setion.
			add_action( 'wp_ajax_svsw_pro_add_to_cart', array( $this, 'add_to_cart' ) );
			add_action( 'wp_ajax_nopriv_svsw_pro_add_to_cart', array( $this, 'add_to_cart' ) ); // For logged out users

			add_action( 'wp_ajax_svsw_clear_cart', array( $this, 'clear_cart' ) );
			add_action( 'wp_ajax_nopriv_svsw_clear_cart', array( $this, 'clear_cart' ) );

			add_action( 'woocommerce_before_cart', array( $this, 'cart_pairs_data' ) );

		}



		public function pack_data( $data ){
			return $this->get_pack_data();
		}
		public function att_name( $att_slug, $data ){

			if( empty( $data ) ){
				return;
			}

			$qty = '';

			foreach( $data as $item ){
				if( $att_slug === $item['name'] ){
					$qty = $item['qty'];
					break;
				}
			}

			if( empty( $qty ) ){
				return;
			}
			
			?>
			<span class="svspro-pack" data-qty="<?php echo esc_attr( $qty ); ?>" data-att="<?php echo esc_attr( $att_slug ); ?>">
				<?php if ( $qty > 1 ) : ?>
					(Pick <strong><?php echo esc_attr( $qty ); ?></strong>)
				<?php endif; ?>
			</span>
			<?php

		}
		public function pack_info( $attributes, $data ){

			global $product;

			if( empty( $data ) ){
				return;
			}

			$str = array();

			// get all attribute names.
			$att_names = array();
			foreach( $attributes as $name => $options ){
				$att_names[] = $name;
			}
			
			foreach( $data as $item ){
				
				if( ! in_array( $item['name'], $att_names, true ) ){
					continue;
				}

				// Skip size | CUSTOM
				if( 'pa_size' === $item['name'] ){
					continue;
				}
				
				$att_name = $item['name'];

				// Get attribute name | taxonomy.
				$tax_obj  = get_taxonomy( $item['name'] );
				
				if( isset( $tax_obj->labels->singular_name ) ){
					$att_name = $tax_obj->labels->singular_name;
				}

				$str[] = sprintf(
					'%s %s',
					esc_attr( $item['qty'] ),
					esc_html( $att_name )
				);

			}

			$info = 'Please choose ' . implode( ', ', $str ) .' before adding it to cart.';
			
			?>
			<div class="svspro-pack-info"><?php echo esc_html( $info ); ?></div>
			<div class="svsw-total">
				Total price:
				<span class="woocommerce-Price-amount amount">
					<bdi>
						<span class="woocommerce-Price-currencySymbol"><?php echo get_woocommerce_currency_symbol(); ?></span>
						<span id="dynamic-price">0.00</span>
					</bdi>
				</span>
			</div>
			<?php

		}
		public function get_pack_data(){

			global $product;

			$data       = array();
			$att_names  = array();
			$attributes = $product->get_variation_attributes();
			
			foreach ( $attributes as $attribute_name => $options ) {
				$att_names[] = $attribute_name;
			}
			
			$pairs = get_post_meta( $product->get_id(), '_swatch_attribute_quantity_pairs', true ) ? : array();

			if( empty( $pairs ) ){
				return array();
			}

			foreach ( $pairs as $pair ) {
				if( empty( $pair ) || ! isset( $pair['name'] ) ){
					continue;
				}
				
				if( in_array( $pair['name'], $att_names, true ) ){
					$data[] = $pair;
				}
			}

			return $data;

		}



		public function variation_data( $attributes, $data ){

			global $product;

			if( ! $product->is_type( 'variable' ) ){
				return;
			}

			$pairs = get_post_meta(  $product->get_id(), '_swatch_attribute_quantity_pairs', true );

			if( empty( $pairs ) ){
				return;
			}

			$variations = $product->get_available_variations();

			// Encode the variations data as JSON
			$variations_json = json_encode($variations);

			// Output the data attribute in your form tag
			?>
			<div id="svsw_variation_data" data-product_variations="<?php echo esc_attr($variations_json); ?>"></div>
			<style>
				.woocommerce-variation-price,.woocommerce-variation-availability{
					display: none;
				}
			</style>
			<?php

		}



		function add_to_cart() {

			if( ! isset( $_POST['svsw_variation_ids'] ) || empty( $_POST['svsw_variation_ids'] ) ){
				wp_send_json(array(
					'error' => true,
					'msg'   => 'Data missing'
				));
			}

			$ids = array_map( 'sanitize_text_field', $_POST['svsw_variation_ids'] );

			$quantity = (int)  isset( $_POST['svsw_qty'] ) ? sanitize_text_field( $_POST['svsw_qty'] ) : 1;

			foreach( $ids as $variation_id ){
				$cart_added = WC()->cart->add_to_cart($variation_id, $quantity);
			}

			wp_send_json(array(
				'request' => $_POST
			));
		}
		public function clear_cart() {

			// Sanitize and validate cart key
			$cart_key = isset($_POST['cart_key']) ? sanitize_key($_POST['cart_key']) : '';
			if (empty($cart_key)) {
				wp_send_json_error(['msg' => 'No key found', 'key' => $cart_key]);
			}
		
			// Check if WC cart is initialized
			if (is_null(WC()->cart)) {
				wp_send_json_error(['msg' => 'Cart not initialized']);
			}
		
			// Get cart items
			$cart_items = WC()->cart->get_cart();
		
			// Find product ID and size for given cart key
			$product_id = '';
			$size = '';
			if (isset($cart_items[$cart_key])) {
				$product_id = $cart_items[$cart_key]['product_id'];
				$size = $cart_items[$cart_key]['variation']['attribute_pa_size'] ?? '';
			}
		
			// Check if product ID and size are valid
			if (empty($product_id) || empty($size)) {
				WC()->cart->remove_cart_item( $cart_key );
				wp_send_json_error(['msg' => 'Invalid product ID or size', 'id' => $product_id, 'size' => $size]);
			}
		
			// Retrieve and check pairs
			$pairs = get_post_meta($product_id, '_swatch_attribute_quantity_pairs', true);
			if (empty($pairs)) {

				WC()->cart->remove_cart_item( $cart_key );
				wp_send_json_error(['msg' => 'Package data not found', 'id' => $product_id, 'pairs' => $pairs, 'size' => $size]);

			}

			$pack_deleted = false;

			foreach( $cart_items as $key => $item ){
				// Match with same cart key as given.
				if( $product_id !== $item['product_id'] ) continue;
				
				if( ! isset( $item['variation'] ) || ! isset( $item['variation']['attribute_pa_size'] ) ) continue;
			
				if( $size === $item['variation']['attribute_pa_size'] ){
					WC()->cart->remove_cart_item($key);
				}
				
				$pack_deleted = true;
			}
			
			if( ! $pack_deleted ){
				WC()->cart->remove_cart_item( $cart_key );
			}

			wp_send_json_success(['msg' => 'Deleted successfully']);
		}
		public function cart_pairs_data() {
			
			// Check if the cart is empty
			if (WC()->cart->is_empty()) {
				return;
			}

			$data      = array();
			$cart_data = array();

			foreach (WC()->cart->get_cart() as $cart_item) {

				// Get product ID
				$product_id = $cart_item['product_id'];

				// Get post meta
				$pairs = get_post_meta($product_id, '_swatch_attribute_quantity_pairs', true);
				if( empty( $pairs ) ) continue;

				$data[ $product_id ] = $pairs;

				$key = $cart_item['key'];

				$cart_data[ $key ] = array(
					'product_id' => $cart_item['product_id'],
				);
				
				if( isset( $cart_item['variation_id'] ) ){
					$cart_data[ $key ]['variation_id'] = $cart_item['variation_id'];
					$cart_data[ $key ]['variation'] = $cart_item['variation'];
				}
			}

			if( empty( $data ) ){
				return;
			}

			// Encode the variations data as JSON
			$data_json      = json_encode($data);
			$cart_data_json = json_encode($cart_data);

			// Output the data attribute in your form tag
			?>
			<div id="svsw_pairs" data-pairs_data="<?php echo esc_attr($data_json); ?>" data-cart_data="<?php echo esc_attr( $cart_data_json ); ?>"></div>
			<?php

		}

	}
}

$svswProFrnt = new SVSWPro();
$svswProFrnt->init();
