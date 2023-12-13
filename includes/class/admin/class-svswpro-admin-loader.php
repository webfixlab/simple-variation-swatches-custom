<?php
/**
 * Admin loader PRO Class
 *
 * @package    WordPress
 * @subpackage Simple Variation Swatches PRO for WooCommerce
 * @since      1.0
 */

if ( ! class_exists( 'SVSWProAdminLoader' ) ) {
	class SVSWProAdminLoader {
		// private $adminSettings;



		public function __construct() {}
		public function init() {

			add_action( 'init', array( $this, 'do_activate' ) );
			register_activation_hook( SVSWP, array( $this, 'activate' ) );
			register_deactivation_hook( SVSWP, array( $this, 'deactivate' ) );

			// WooCommerce High-Performance Order Storage (HPOS) compatibility enable.
			add_action( 'before_woocommerce_init', function() {
				if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
					\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', SVSWP, true );
				}
			} );

		}
		
		

		public function activate(){

			$this->do_activate();
			flush_rewrite_rules();

		}
		public function deactivate(){
			
			flush_rewrite_rules();

		}
		public function do_activate(){

			// check prerequisits
			if( ! $this->pre_activate() ) return;

            add_filter( 'plugin_row_meta', array( $this, 'plugin_desc_meta' ), 10, 2 );
		
			// Enqueue admin script and style
			add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts' ) );

			include( SVSWP_PATH . 'includes/class/admin/class-svswpro-admin.php');
			include( SVSWP_PATH . 'includes/class/class-svswpro.php');


		}
		public function pre_activate(){

			include_once( ABSPATH . 'wp-admin/includes/plugin.php' );

			$plugin = 'simple-variation-swatches-custom/simple-variation-swatches-custom.php';
		
			// check if Base - SVSW is active
			$is_base_active = is_plugin_active( 'simple-variation-swatches/simple-variation-swatches.php' );
			$is_sub_base_active = is_plugin_active( 'woocommerce/woocommerce.php' );
		
			// check if our plugin is active
			$is_svsw_active = is_plugin_active( $plugin );
		
			if( ( ! $is_base_active || ! $is_sub_base_active ) && $is_svsw_active ){
				deactivate_plugins( $plugin );
				add_action( 'admin_notices', array( $this, 'base_inactive_notice' ) );
		
				return false;
			}

			return true;

		}



		public function frontend_scripts(){
			global $svsw__;
			
			wp_enqueue_style( 'svsw-pro-frontend', plugin_dir_url( SVSWP ) . 'assets/frontend.css', array(), $svsw__['plugin']['version'], 'all' );

			wp_register_script( 'svsw-pro-frontend', plugin_dir_url( SVSWP ) . 'assets/frontend.js', array( 'jquery' ), "1.00", true );
			wp_enqueue_script( 'svsw-pro-frontend', plugin_dir_url( SVSWP ) . 'assets/frontend.js', array( 'jquery' ), "1.00", true );
			
			// localize script
			$data = get_option( 'svsw_settings' );
			wp_localize_script( 'svsw-pro-frontend', 'svsw_pro', array(
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'svsw'     => $data,
			) );
			
		}	
		public function admin_scripts() {
			global $svsw__;

			// wp_register_script( 'svsw-pro-admin', plugin_dir_url( SVSWP ) . 'assets/admin/admin.js', array( 'jquery' ), $svsw__['plugin']['version'], true );
			wp_enqueue_script( 'svsw-pro-admin', plugin_dir_url( SVSWP ) . 'assets/admin/admin.js', array( 'jquery' ), $svsw__['plugin']['version'], true );

		}




        public function plugin_desc_meta( $links, $file ) {

			global $svsw__;

            // if it's not mpc plugin, return.
            if ( plugin_basename( SVSWP ) !== $file ) {
                return $links;
            }
        
            $row_meta = array();
        
            $row_meta['docs']    = sprintf( '<a href="%s">Docs</a>', esc_url( $svsw__['plugin']['documentation'] ) );
            $row_meta['apidocs'] = sprintf( '<a href="%s">Support</a>', esc_url( $svsw__['plugin']['request_quote'] ) );
        
            return array_merge( $links, $row_meta );

        }
		public function base_inactive_notice(){
			
			global $svsw__;
			
			?>
			<div class="error">
				<p>
					<a href="<?php echo esc_url( $svsw__['plugin']['wporg_url'] ); ?>" target="_blank">Simple Variatin Swatches PRO</a> plugin has been deactivated due to deactivation of <a href="<?php echo esc_url( $svsw__['plugin']['wc_url'] ); ?>" target="_blank">Simple Variation Swatches</a> plugin
				</p>
			</div>
			<?php

		}
		
    }
}

$adminCls = new SVSWProAdminLoader();
$adminCls->init();