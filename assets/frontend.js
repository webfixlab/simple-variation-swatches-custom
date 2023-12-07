(function($) {
    $(document).ready(function(){

        $( '.single_add_to_cart_button' ).prop( 'disabled', true );

        function on_load_freeze(){  
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
                // if( qty != options ){
                //     return true;
                // }
    
                $(this).find( '.svsw-swatch' ).each(function(){
                    var cls = 'svspro-freeze';
                    if( qty == options ){
                        cls = 'svsw-pro-selected';
                    }
                    cls += ' svspro-freeze';
                    $(this).addClass( cls );
                });
    
                // $( '.svspro-pack-info' ).text( '' )
            });
        }
        on_load_freeze();


        $( 'input[name="quantity"]' ).on( 'click', function(){
            calculateTotal();
        });
        $( 'input[name="quantity"]' ).on( 'input', function(){
            calculateTotal();
        });
        function calculateTotal(){
            var qty = parseInt($('input[name="quantity"]').val());
            var total = parseFloat($('#dynamic-price').data('price'));

            total = qty * total;

            console.log( 'total', total );
            
            // Format the total to a fixed-point notation with 2 decimal places
            var formattedTotal = parseFloat(total).toFixed(2);
            console.log( 'total formatted', formattedTotal );

            $('#dynamic-price').text(formattedTotal);
        }

        
        function static_size( item ){
            var wrap = item.closest( '.svsw-wrap' );

            let $pack = wrap.find('.svspro-pack');
            if (!$pack.length) {
                return;
            }
    
            let att_name = $pack.data('att');
            if (!att_name || att_name != 'pa_size' ) {
                return;
            }

            wrap.find('.svsw-swatch.svsw-pro-selected').removeClass('svsw-pro-selected');

        }
        function clearFreeze(){
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

                $(this).find( '.svsw-swatch' ).each(function(){
                    $(this).removeClass( 'svspro-freeze' );
                });
            });
        }
        
        $( '.svsw-swatch' ).on( 'click', function(e){
            $(this).closest('.svsw-wrap').find('.svsw-swatch.svsw-selected').removeClass('svsw-selected');

            if( $(this).hasClass( 'svspro-freeze' ) ){
                return;
            }

            preCheckStock( $(this) );
            
            $(this).removeClass( 'svsw-stockout' );
            clearFreeze();
        
            static_size( $(this) );
            $(this).toggleClass( 'svsw-pro-selected' );            
        
            multiswatch();
            allowcart();
        });

        function preCheckStock( swatch ){
            // Runs on focusing single given swatch.
            var term = swatch.data( 'term' );
            var att_name = swatch.closest( '.svsw-attr-wrap' ).data( 'taxonomy' );
            if( ! att_name ){
                return;
            }

            $( '.svsw-wrap' ).each(function(){
                let $pack = $(this).find('.svspro-pack');
                if (!$pack.length) {
                    return true;
                }
        
                let att = $pack.data( 'att' );
                let qty = parseInt($pack.data( 'qty' ), 10);
                if (!qty || !att || att == att_name ) {
                    return true;
                }

                $(this).find( '.svsw-swatch' ).each(function(){
                    var tmpTerm = $(this).data( 'term' );

                    var data = {};
                    data[ att] = tmpTerm;
                    data[ att_name ] = term;

                    var item = isCombinationInStock( data, 'variation_id' );

                    if( ! item || '0' == item ){
                        // Not in stock
                        if( ! $(this).hasClass( 'svsw-stockout' ) ){
                            $(this).addClass( 'svsw-stockout' );
                        }
                    }else{
                        // In stock
                        if( $(this).hasClass( 'svsw-stockout' ) ){
                            $(this).removeClass( 'svsw-stockout' );
                        }
                    }
                });
            });

        }

        

        function multiswatch(){
            var prices = process_data( 'price', false );
            var total = 0.0;

            prices.forEach(function(price) {
                total += price;
            });

            $( '#dynamic-price' ).attr( 'data-price', total.toString() );
            
            var qty = parseInt( $( 'input[name="quantity"]' ).val() );
            var finalTotal = total * qty;

            $( '#dynamic-price' ).text( parseFloat( finalTotal ).toFixed(2) );
        }
        function process_data( focus, onlyStockIn ){

            // get attribute data.
            var data = {};
            $( '.svsw-wrap' ).each(function(){
                var wrap = $(this).find( '.svsw-attr-wrap' );
                var key = wrap.data( 'taxonomy' );

                if( ! key ){
                    return true;
                }

                data[key] = [];

                wrap.find( '.svsw-swatch-content' ).each(function(){
                    var swatch = $(this).find( '.svsw-swatch' );

                    if( ! swatch.hasClass( 'svsw-pro-selected' ) ){
                        return true;
                    }
                    
                    if( onlyStockIn && swatch.hasClass( 'svsw-stockout' ) ){
                        return true;
                    }

                    data[key].push( swatch.data( 'term' ) );
                });
            });

            if( data.length === 0 ){
                return;
            }

            var combinations = generateCombinations(data);

            var items = [];

            combinations.forEach(function(combination) {
                var item = isCombinationInStock( combination, focus );
                items.push( item );
            });

            return items;

        }

        var variationsData = $('#svsw_variation_data').data('product_variations');

        function isCombinationInStock( attributes, focus ) {

            var is_in_stock = false;
            var focusItem = 0.0;

            for (var i = 0; i < variationsData.length; i++) {
                var variation = variationsData[i];
                var match = true;

                // Check if all attributes match
                for (var key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        // Construct the attribute name as it appears in the variation data
                        var attributeKey = 'attribute_' + key;

                        // Check if the attribute value matches
                        if (variation.attributes[attributeKey].toString() !== attributes[key].toString()) {
                            match = false;
                            break;
                        }
                        
                    }
                }
        
                if (match) {
                    is_in_stock = variation.is_in_stock;

                    // quantity check.
                    var qty = parseInt( $( 'input[name="quantity"]' ).val() );

                    if( typeof qty != 'undefined' && typeof variation.max_qty == 'number' ){
                        if( qty > variation.max_qty ){
                            is_in_stock = false;
                        }
                    }

                    if( is_in_stock ){
                        if( focus == 'price' ){
                            focusItem = variation.display_price;
                        }else if( focus == 'variation_id' ){
                            focusItem = variation.variation_id;
                        }
                    }

                    break;
                }
            }

            stockoutmark( attributes, is_in_stock );
        
            return focusItem; // If no match is found
        }
        function stockoutmark( attributues, is_in_stock ){
            $( '.svsw-wrap' ).each(function(){
                var wrap = $(this).find( '.svsw-attr-wrap' );
                var key = wrap.data( 'taxonomy' );

                if( ! key || typeof attributues[ key ] == 'undefined' ){
                    return true;
                }

                wrap.find( '.svsw-swatch-content' ).each(function(){
                    var swatch = $(this).find( '.svsw-swatch' );

                    if( swatch.data( 'term' ) == attributues[ key ] ){

                        if( is_in_stock == false ){

                            if( ! swatch.hasClass( 'svsw-stockout' ) ){
                                swatch.addClass( 'svsw-stockout' );
                            }

                        }else{
                            swatch.removeClass( 'svsw-stockout' );
                        }
                    }
                });
            });
        }
        function generateCombinations(attributes) {
            var keys = Object.keys(attributes);
            var results = [];
            var result = {};
        
            function recurse(index) {
                var key = keys[index];
                var values = attributes[key];
        
                for (var i = 0; i < values.length; i++) {
                    result[key] = values[i];
        
                    if (index + 1 < keys.length) {
                        recurse(index + 1);
                    } else {
                        // Push a copy of result to results
                        results.push(JSON.parse(JSON.stringify(result)));
                    }
                }
            }
        
            recurse(0);
            return results;
        }
        function allowcart() {
            $('.svsw-wrap').each(function() {
                let $pack = $(this).find('.svspro-pack');
                if (!$pack.length) {
                    return true;
                }
        
                let qty = parseInt($pack.data('qty'), 10);
                if (!qty) {
                    return true;
                }

                let $wrap = $(this).find('.svsw-attr-wrap');
                let checked = 0;
        
                $wrap.find('.svsw-swatch-content').each(function() {
                    let $swatch = $(this).find('.svsw-swatch');
                    if ($swatch.hasClass('svsw-pro-selected') && !$swatch.hasClass('svsw-stockout')) {
                        checked++;
                    }
                });
        
                if (checked != qty) {
                    $('.single_add_to_cart_button').prop('disabled', true);

                    var element = $(this).find( '.attr-name' );
                    var span = element.find("span").detach(); // Detach the span element
                    var text = element.text().trim(); // Get the trimmed text of the element without the span
                    element.append(span); // Reattach the span element

                    var msg = '';
                    if( checked < qty ){
                        msg = 'Please choose ' + qty + ' ' + text + ' before adding it to cart.';
                    }else if( checked > qty ){
                        msg = 'You selected more than ' + qty + ' ' + text + '.';
                    }

                    $( '.svspro-pack-info' ).html( msg );
                    return;
                }
                
                $( '.svspro-pack-info' ).html( '' );
                $('.single_add_to_cart_button').prop('disabled', false);
            });
        
        }


        $( 'body' ).on( 'click', '.svsw-reset', function(e){
            // e.preventDefault();
            $('.svsw-swatch.svsw-pro-selected').removeClass('svsw-pro-selected');
            $('.svsw-swatch.svsw-stockout').removeClass('svsw-stockout');

            $( '#dynamic-price' ).text( '0.0' );
            $( '#dynamic-price' ).data( 'price', '0' );

            $( 'input[name="quantity"]').val( 1 );

            $( '.single_add_to_cart_button' ).prop( 'disabled', true );
            $( document ).find( '.svspro-cart-added' ).remove();

            on_load_freeze();
        });



        // Cart section.
        $( '.single_add_to_cart_button' ).on( 'click', function(e){
            e.preventDefault();

            var variation_ids = process_data( 'variation_id', true );
            add_to_cart( variation_ids );
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

        $( '.product-remove a.remove' ).on( 'click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        
            var confirmationMessage = "Removing this may also remove related package items. Proceed to delete?";
            if (confirm(confirmationMessage)) {
                $( '.woocommerce-notices-wrapper' ).append( '<span calss="svsw-cart-notice">Deleting...</span>' );
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
                    console.log( 'response', response );
                    if( response.msg ){
                        $( document ).find( '.svsw-cart-notice' ).text( response.msg );
                    }else{
                        location.reload();
                    }
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
        
    });

    
})(jQuery);
