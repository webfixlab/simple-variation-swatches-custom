(function($) {
    $(document).ready(function(){

        freezeDesigns();
        onLoadStuffs();
        
        // Disable cart button.
        function onLoadStuffs(){
            if( ifPackExists() ){
                $( '.single_add_to_cart_button' ).prop( 'disabled', true );

                $( '.svsw-wrap' ).each(function(){
                    var att = $(this).find( '.svsw-attr-wrap' ).data( 'taxonomy' );
                    if( att == 'pa_size' ){
                        return true;
                    }

                    var qty = getPairsData( $(this) );
                    if( qty == 5 ){
                        // remove message and pack sub-title.
                        $(this).find( '.svspro-pack' ).html( '' );
                    }
                });
            }
        }
        function freezeDesigns(){  
            $( '.svsw-wrap' ).each(function(){
                let $pack = $(this).find('.svspro-pack');
                if (!$pack.length) {
                    return true;
                }
        
                let att = $pack.data( 'att' );
                let qty = parseInt($pack.data( 'qty' ), 10);
                if (!qty || !att || att == 'pa_size' ) {
                    return true;
                }
    
                var options = $(this).find( '.svsw-swatch' ).length;

                $(this).find( '.svsw-swatch' ).each(function(){
                    var cls = 'svspro-freeze';
                    
                    // If qty == total options, select all options.
                    if( qty == options ){
                        cls = 'svsw-pro-selected';
                    }

                    cls += ' svspro-freeze';

                    $(this).addClass( cls );
                });
            });
        }
        function ifPackExists(){
            var hasPackData = false;

            $( '.svsw-wrap' ).each(function(){
                let $pack = $(this).find('.svspro-pack');
                if (!$pack.length) {
                    return true;
                }
        
                let att = $pack.data( 'att' );
                let qty = parseInt($pack.data( 'qty' ), 10);
                if (!qty || !att || att == 'pa_size' ) {
                    return true;
                }

                hasPackData = true;
            });

            return hasPackData;
        }


        $( 'input[name="quantity"]' ).on( 'click', function(){
            if( ! ifPackExists() ){
                return;
            }

            setTotal();
        });
        $( 'input[name="quantity"]' ).on( 'input', function(){
            if( ifPackExists() ){
                return;
            }

            setTotal();
        });
        function setTotal(){
            var qty = parseInt($('input[name="quantity"]').val());
            var total = parseFloat($('#dynamic-price').data('price'));

            total = qty * total;

            // Format the total to a fixed-point notation with 2 decimal places
            var formattedTotal = parseFloat(total).toFixed(2);

            $('#dynamic-price').text(formattedTotal);
        }



        $( '.svsw-swatch' ).on( 'click', function(e){
            $(this).closest('.svsw-wrap').find('.svsw-swatch.svsw-selected').removeClass('svsw-selected');

            if( ! $(this).hasClass( 'svspro-freeze' ) && ! $(this).hasClass( 'svsw-stockout' ) ){
                $(this).toggleClass( 'svsw-pro-selected' );
            }
            
            swatchClickEvent( $(this) );
        });
        function swatchClickEvent( swatch ){
            var option    = swatch.data( 'term' );
            var att_name  = swatch.closest( '.svsw-attr-wrap' ).data( 'taxonomy' );
            
            // unselect all other sizes
            if( att_name == 'pa_size' ){
                unselectOtherSizes( swatch );
                attributesAction( 'pa_size', 'enable' );
            }

            $( '.svsw-frontend-wrap' ).each(function(){
                // total wrapper

                var attCounter = {};
                var data = { pa_size: 0, pa_design: 0 };
                var attSelection = {};

                $( '.svsw-wrap' ).each(function(){
                    // attribute wrapper

                    var att = $(this).find( '.svsw-attr-wrap' ).data( 'taxonomy' );
                    attCounter[att] = 0;
                    data[att] = getPairsData( $(this) );
                    attSelection[att] = [];
                    
                    $(this).find( '.svsw-swatch' ).each(function(){
                        // option/swatch item

                        var term   = $(this).data( 'term' );
                        if( $(this).hasClass( 'svsw-pro-selected' ) ){
                            attCounter[att]++;
                            attSelection[att].push( term );
                        }
                    });
                });

                // disable other options
                if( attCounter['pa_size'] == 0 ){
                    attributesAction( 'pa_size', 'disable' );
                }
                
                handleStockandTotal( attSelection, data, attCounter );
                cartValidation( data );
            });
        }
        function getPairsData( wrap ){
            let $pack = wrap.find('.svspro-pack');
            if (!$pack.length) {
                return true;
            }

            return parseInt( $pack.data( 'qty' ) );
        }
        function unselectOtherSizes( swatch ){
            var givenTerm = swatch.data( 'term' );

            swatch.closest( '.svsw-wrap' ).find( '.svsw-swatch' ).each(function(){
                var term = $(this).data( 'term' );
                if( term != givenTerm && $(this).hasClass( 'svsw-pro-selected' ) ){
                    $(this).removeClass( 'svsw-pro-selected' );
                }
            });
        }
        function attributesAction( skipAtt, action ){
            if( action == 'disable' ){
                $( '.svsw-reset' ).trigger( 'click' );
                return;
            }

            $( '.svsw-wrap' ).each(function(){
                var att  = $(this).find( '.svsw-attr-wrap' ).data( 'taxonomy' );                
                if( att == skipAtt ){
                    return true;
                }

                $(this).find( '.svsw-swatch' ).each(function(){
                    if( action == 'enable' ){
                        if( $(this).hasClass( 'svspro-freeze' ) ){
                            $(this).removeClass( 'svspro-freeze' );
                        }
                    }
                });
            });
        }
        function handleStockandTotal( attSelection, data, attCounter ){
            var total = 0.0;
            var attributes = {
                pa_size: attSelection['pa_size'].toString(),
                pa_design: ''
            };

            $( '.svsw-wrap' ).each(function(){
                var att = $(this).find( '.svsw-attr-wrap' ).data( 'taxonomy' );
                if( att == 'pa_size' ){
                    return true;
                }
                
                $(this).find( '.svsw-swatch' ).each(function(){
                    var term   = $(this).data( 'term' );
                    attributes.pa_design = term;

                    var variation = getVariationData( attributes );

                    if( checkIsInStock( variation ) ){
                        if( $(this).hasClass( 'svsw-pro-selected' ) || data.pa_design == 5 ){
                            total += variation.display_price;
                        }
                        attributesStockMaker( $(this), true, data );
                    }else{
                        attributesStockMaker( $(this), false, data );
                    }
                });
            });

            swatchClickedTotal( total );
        }
        function getVariationData( attributes ){
            var data = $('#svsw_variation_data').data('product_variations');

            for (var i = 0; i < data.length; i++) {
                var variation = data[i];
                var found = true;

                for (var key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        var option = variation.attributes[ 'attribute_' + key ];

                        if ( option.length > 0 && option.toString() !== attributes[key].toString()) {
                            found = false;
                            break;
                        }
                    }
                }
        
                if( found ){
                    return variation;
                }

            }

            return false;
        }
        function checkIsInStock( variation ){
            if( variation === false || ! variation.is_in_stock ){
                return false;
            }
            
            var qty = parseInt( $( 'input[name="quantity"]' ).val() );
            
            if( variation.max_qty && qty > variation.max_qty ){
                return false;
            }
            
            return true;
        }
        function attributesStockMaker( swatch, ifInStock, data ){
            if( ifInStock ){
                if( swatch.hasClass( 'svsw-stockout') ){
                    swatch.removeClass( 'svsw-stockout' );
                }
                if( data.pa_design == 5 && ! swatch.hasClass( 'svsw-pro-selected' ) ){
                    swatch.addClass( 'svsw-pro-selected' );
                }
            }else{
                if( ! swatch.hasClass( 'svsw-stockout') ){
                    swatch.addClass( 'svsw-stockout' );
                }
                if( swatch.hasClass( 'svsw-pro-selected') ){
                    swatch.removeClass( 'svsw-pro-selected' );
                }
            }
        }
        function swatchClickedTotal( total ){
            $( '#dynamic-price' ).attr( 'data-price', total.toString() );
            
            var qty = parseInt( $( 'input[name="quantity"]' ).val() );
            var finalTotal = total * qty;

            $( '#dynamic-price' ).text( parseFloat( finalTotal ).toFixed(2) );
        }
        function cartValidation( data ){

            var pa_design = 0;
            $( '.svsw-wrap' ).each(function(){
                var att = $(this).find( '.svsw-attr-wrap' ).data( 'taxonomy' );
                if( att == 'pa_size' ){
                    return true;
                }
                
                $(this).find( '.svsw-swatch' ).each(function(){
                    if( $(this).hasClass( 'svsw-pro-selected' ) ){
                        pa_design++;
                    }
                });
            });
            
            if( data['pa_design'] == pa_design ){
                // allow cart button.
                $('.single_add_to_cart_button').prop('disabled', false);
                $('.single_add_to_cart_button').removeClass( 'disabled' );
                $( '.svspro-pack-info' ).html( '' );
            }else{
                // disable and show notice.
                $('.single_add_to_cart_button').prop('disabled', true);
                $('.single_add_to_cart_button').addClass( 'disabled' );

                if( pa_design > data['pa_design'] ){
                    $( '.svspro-pack-info' ).html( 'You selected more than ' + data['pa_design'] + ' Designs.' );
                }else{
                    $( '.svspro-pack-info' ).html( 'Please choose ' + data['pa_design'] + ' Designs before adding it to cart.' );
                }
            }
        }



        $( 'body' ).on( 'click', '.svsw-reset', function(e){
            // e.preventDefault();
            $('.svsw-swatch.svsw-pro-selected').removeClass('svsw-pro-selected');
            $('.svsw-swatch.svsw-stockout').removeClass('svsw-stockout');

            $( '#dynamic-price' ).text( '0.00' );
            $( '#dynamic-price' ).data( 'price', '0' );

            $( 'input[name="quantity"]').val( 1 );

            $( '.single_add_to_cart_button' ).prop( 'disabled', true );
            $( document ).find( '.svspro-cart-added' ).remove();

            freezeDesigns();
        }); 
        $( '.single_add_to_cart_button' ).on( 'click', function(e){
            if( ifPackExists() ){
                e.preventDefault();

                var ids = []; // get all selected variation ids.
                var attributes = { pa_size: '', pa_design: '' };

                $( '.svsw-wrap' ).each(function(){
                    var att = $(this).find( '.svsw-attr-wrap' ).data( 'taxonomy' );
                    $(this).find( '.svsw-swatch' ).each(function(){
                        var term   = $(this).data( 'term' );
                        if( $(this).hasClass( 'svsw-pro-selected' ) ){
                            attributes[ att ] = term;
                        }
                    });
                });

                $( '.svsw-wrap' ).each(function(){
                    var att = $(this).find( '.svsw-attr-wrap' ).data( 'taxonomy' );
                    if( att == 'pa_size' ){
                        return true;
                    }
                    
                    $(this).find( '.svsw-swatch' ).each(function(){
                        if( ! $(this).hasClass( 'svsw-pro-selected' ) ){
                            return true;
                        }
                        
                        var term = $(this).data( 'term' );
                        attributes[ att ] = term;

                        var variation = getVariationData( attributes );

                        if( variation !== false ){
                            ids.push( variation.variation_id );
                        }
                    });
                });

                add_to_cart( ids );
            }
        });
        function add_to_cart( ids ){
            var qty = $( 'input[name="quantity"]' ).val();

            $( '.single_add_to_cart_button' ).text( 'Adding...' );
            $( '.single_add_to_cart_button' ).prop( 'disabled', true );
            
            if( ! ids ){
                return;
            }
            
            $( '.svspro-cart-added' ).remove();

            $.ajax({
                url: svsw_pro.ajax_url,
                type: 'POST',
                data: {
                    action: 'svsw_pro_add_to_cart',
                    svsw_variation_ids: ids,
                    svsw_qty: qty
                },
                success: function(response) {
                    $( '.single_add_to_cart_button' ).text( 'Add to cart' );
                    $( '.single_add_to_cart_button' ).prop( 'disabled', false );
                    
                    $( '.single_add_to_cart_button' ).after( '<span class="svspro-cart-added"><a href="/cart/">View Cart</a></span>' );
                }
            });
        }



        // Cart section.
        if( ifCartPackExists( '' ) ){
            $( '.quantity input[type="number"]' ).prop( 'disabled', true );
        }
        function ifCartPackExists( item ){
            var productId = '';

            if( item.length ){
                productId = item.data( 'product_id' );
            }

            var data = $( '#svsw_pairs' ).data( 'pairs_data' );

            if( ! data ){
                return false;
            }

            if( productId.length == 0 ){
                return true;
            }

            var found = false;

            $.each(data, function(id, dt ){
                if( id == productId ){
                    found = true;
                }
            });
            
            return found;
        }

        $( '.product-remove a.remove' ).on( 'click', function(e) {
            
            if( ! ifCartPackExists( $(this) ) ){
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var size = getSizeTerm( $(this) );
            // var msg = "It will remove all " + size.toUpperCase() + " size items from the cart. Proceed to delete?";
            var msg = "It will remove all related items from the cart. Proceed to delete?";

            if (confirm(msg)) {

                $( '.woocommerce-notices-wrapper' ).append( '<div calss="svsw-cart-notice"><div class="woocommerce-error" role="alert">Removing all related items...</div></div>' );
                
                $( '.product-remove a.remove' ).each(function(){
                    $(this).prop( 'disabled', true );
                });

                clear_cart_ajax($(this));
            }
        });
        function clear_cart_ajax( item ){
            var key = cart_item_key( item.attr( 'href' ) );

            $.ajax({
                url: svsw_pro.ajax_url, // URL to WordPress AJAX handler
                type: 'POST',
                data: {
                    action: 'svsw_clear_cart',
                    cart_key: key
                },
                success: function(response) {
                    // console.log('Success:', response);
                    if(response.msg) {
                        $(document).find('.svsw-cart-notice').text(response.msg);
                    } else {
                        location.reload();
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Error:', textStatus, errorThrown);
                }
            });

        }
        function cart_item_key( url ){
            var queryString = url.split('?')[1]; // Extract query string
            var params = queryString.split('&'); // Split into key-value pairs
        
            var removeItemKey = '';
            params.forEach(function(param) {
                var pair = param.split('=');
                if (pair[0] === 'remove_item') {
                    removeItemKey = pair[1]; // Get the value of 'remove_item'
                }
            });

            return removeItemKey;
        }
        function getSizeTerm( item ){

            var key = cart_item_key( item.attr( 'href' ) );
            var data = $( '#svsw_pairs' ).data( 'cart_data' );

            var size = '';

            $.each(data, function(ck, dt ){
                if( ck == key ){
                    size = dt['variation']['attribute_pa_size'];
                }
            });

            if( !size ){
                size = '';
            }

            return size;
        }
        
    });

    
})(jQuery);
