// initially check browser for drag and drop support
let hasAdvancedFeatures = function() {
    let div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

// Wait for jQuery to load
$(document).ready(function(){
    
    // Change layout of dropzone (form), if advanced features are supported
    let $dropzone = $('.dropzone')
    if (hasAdvancedFeatures) {
        $dropzone.addClass('advanced_features');
        console.log("adding feature class")
    }

    // Add or remove classes when (stop) dragging over the dropzone
    if (hasAdvancedFeatures) {
        let droppedImage = false;

        $dropzone.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
        .on('dragover dragenter', function() {
            $dropzone.addClass('is_dragover');
        })
        .on('dragleave dragend drop', function() {
            $dropzone.removeClass('is_dragover');
        })
        .on('drop', function(e) {
            droppedImage = e.originalEvent.dataTransfer.files; // returns list of files that where dropped
        });
    }


});