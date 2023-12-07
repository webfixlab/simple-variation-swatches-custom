<?php
/**
 * Admin functions PRO Class
 *
 * @package    WordPress
 * @subpackage Simple Variation Swatches PRO for WooCommerce
 * @since      1.0
 */

if ( ! class_exists( 'SVSWProAdmin' ) ) {
	class SVSWProAdmin {
        
		public function __construct() {}
		public function init() {

            add_filter( 'woocommerce_product_data_tabs', array( $this, 'wc_data_tab' ) );
			add_action( 'woocommerce_product_data_panels', array( $this, 'wc_tab_content' ) );
			add_action( 'woocommerce_process_product_meta', array( $this, 'save_tab_data' ) );





            // add_action('woocommerce_after_add_to_cart_button', array( $this, 'cart_data' ) );

			// // Display Fields.
			// add_action( 'woocommerce_product_after_variable_attributes', array( $this, 'admin_pack_field' ), 10, 3 );

			// // Save Fields.
			// add_action( 'woocommerce_save_product_variation', array( $this, 'save_pack_field' ), 10, 2 );

			// // Show field.
			// add_action( 'woocommerce_single_product_summary', array( $this, 'display_pack' ), 20 );

        }


        public function wc_data_tab( $tabs ) {
			$tabs['swatch_data_tab'] = array(
				'label'  => __( 'Swatch Data', 'woocommerce' ),
				'target' => 'swatch_data_options',
				'class'  => array( 'show_if_simple', 'show_if_variable' ),
			);
			return $tabs;
		}
		public function wc_tab_content() {
			global $post;
		
			// Get all product attributes
			$attributes = wc_get_attribute_taxonomies();

			// Load existing pairs or a blank one
			$pairs = get_post_meta( $post->ID, '_swatch_attribute_quantity_pairs', true ) ? : '';
			
			?>
			<div id="swatch_data_options" class="panel woocommerce_options_panel">
				<div class="options_group">
					<div id="swatch_attribute_quantity_pairs">
						<?php

						if( ! empty( $pairs ) ){
							foreach ( $pairs as $pair ) {
								if( empty( $pair ) ){
									continue;
								}
	
								?>
								<div class="swatch_pair">
									<?php $this->meta_item( $attributes, $pair ); ?>
								</div>
								<?php

							}
						}
						
						?>
					</div>
					<div class="svsw-demo-item" style="display:none;">
						<div class="swatch_pair">
							<?php $this->meta_item( $attributes, array() ); ?>
						</div>
					</div>
					<button type="button" id="add_swatch_pair" class="button">Add Pair</button>
				</div>
			</div>
			<?php

		}
		public function save_tab_data( $post_id ) {
			
			$pairs = array();

			if ( isset( $_POST['swatch_attribute_name'], $_POST['swatch_min_qty'] ) ) {
				$names = $_POST['swatch_attribute_name'];
				$qtys = $_POST['swatch_min_qty'];
		
				foreach ( $names as $index => $name ) {
					if ( ! empty( $name ) && ! empty( $qtys[ $index ] ) ) {
						$pairs[] = array( 'name' => sanitize_text_field( $name ), 'qty' => sanitize_text_field( $qtys[ $index ] ) );
					}
				}
			}
		
			update_post_meta( $post_id, '_swatch_attribute_quantity_pairs', $pairs );
		}


		
		public function meta_item( $attributes, $pair ){

			$name = isset( $pair['name'] ) ? $pair['name'] : '' ;
			$qty  = isset( $pair['qty'] ) ? $pair['qty'] : '';

			?>
			<select class="swatch_attribute_name" name="swatch_attribute_name[]">
				<option value="">Select an attribute</option>
				<?php

				foreach ( $attributes as $attribute ) {

					$att_name = 'pa_' . $attribute->attribute_name;

					$selected = ( $name == $att_name ) ? ' selected="selected"' : '';
					echo '<option value="' . esc_attr( $att_name ) . '"' . $selected . '>' . esc_html( $attribute->attribute_label ) . '</option>';

				}

				?>
			</select>
			<input type="text" name="swatch_min_qty[]" value="<?php echo esc_attr( $qty ); ?>" step="1" min="1">
			<button type="button" class="remove_swatch_pair button">Remove</button>
			<?php

		}








        public function admin_pack_field( $loop, $variation_data, $variation ) {
			// Text Field
			woocommerce_wp_text_input( 
				array( 
					'id'          => '_minimum_variation_qty[' . $variation->ID . ']', 
					'label'       => __( 'Minimum Quantity', 'woocommerce' ), 
					'placeholder' => '',
					'desc_tip'    => 'true',
					'description' => __( 'Enter the minimum quantity required to purchase this variation.', 'woocommerce' ),
					'value'       => get_post_meta( $variation->ID, '_minimum_variation_qty', true )
				)
			);
		}
		public function save_pack_field( $post_id ) {
			// Text Field
			$text_field = $_POST['_minimum_variation_qty'][ $post_id ];
			if( ! empty( $text_field ) ) {
				update_post_meta( $post_id, '_minimum_variation_qty', esc_attr( $text_field ) );
			}
		}
		public function display_pack() {
			global $product;

			if( ! $product->is_type( 'variable' ) ){
				return;
			}

			$variations = $product->get_available_variations();

			foreach ( $variations as $variation ) {

				$variation_id = $variation['variation_id'];

				$minimum_qty = get_post_meta( $variation_id, '_minimum_variation_qty', true );

				if( empty( $minimum_qty ) ){
					continue;
				}

				echo '<div class="minimum-quantity">Pack (' . esc_html( $minimum_qty ) . ')</div>';
			}
		}
		public function cart_data() {
			echo '<div class="custom-input-field">';
			echo '<input type="text" id="custom_field" name="custom_field" />';
			echo '</div>';
		}
    }
}

$adminCls = new SVSWProAdmin();
$adminCls->init();
