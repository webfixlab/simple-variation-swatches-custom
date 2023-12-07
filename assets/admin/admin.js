jQuery(document).ready(function($) {
    // Function to add a new pair
    function addNewPair() {
        var $wrapper = $('#swatch_attribute_quantity_pairs');
        var $template = $( '.svsw-demo-item .swatch_pair' ).clone();

        $template.find( '.swatch_attribute_name' ).val('');
        $template.find( '.swatch_min_qty' ).val('');
        $wrapper.append($template);
    }

    // Add new pair handler
    $('#add_swatch_pair').on('click', function() {
        addNewPair();
    });

    // Remove pair handler
    $(document).on('click', '.remove_swatch_pair', function() {
        $(this).closest('.swatch_pair').remove();
    });

    console.log( 'wrapper length', $('#swatch_attribute_quantity_pairs').children().length );

    // Check if swatch_attribute_quantity_pairs is empty, if so, add one pair
    if ($('#swatch_attribute_quantity_pairs').children().length === 0) {
        addNewPair();
    }

});
