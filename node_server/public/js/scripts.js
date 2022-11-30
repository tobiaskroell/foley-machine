/***************
 ** Main part **
 ***************/

// initially check browser for drag and drop support
let hasAdvancedFeatures = function() {
    let div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

// Wait for jQuery to load, then execute the following
$(document).ready(function(){
    let $dropzone = $('.dropzone')
    let $input = $dropzone.find('input[type="file"]');
    
    addAdvancedFeatures($dropzone);
    dropzoneHandler($dropzone, $input);
});

/**********************
 ** Helper functions **
 **********************/

// Change layout of dropzone (form), if advanced features are supported
function addAdvancedFeatures($dropzone) {
    if (hasAdvancedFeatures) {
        $dropzone.addClass('advanced_features');
    }
}

// Adds or removes classes when (stop) dragging over the dropzone
function dropzoneHandler($dropzone, $input) {
    let video = false;
    if (hasAdvancedFeatures) {
        // Add drag listeners
        $dropzone
            .on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
            })
            .on('dragover dragenter', function() {
                $dropzone.addClass('is_dragover');
            })
            .on('dragleave dragend drop', function() {
                $dropzone.removeClass('is_dragover');
            })
            // Read dropped file and trigger submit
            .on('drop', function(e) {
                video = e.originalEvent.dataTransfer.files[0]; // returns list of files that where dropped
                console.log(video);
                if (!fileIsMp4(video, $dropzone)) return;
                $dropzone.trigger('submit');
            });
    }
    // Catch submit event and post via AJAX
    $dropzone.on('submit', function(e) {
        e.preventDefault();
        if ($dropzone.hasClass('is_uploading')) return false;
      
        $dropzone
            .addClass('is_uploading')
            .removeClass('is_error');
        $('.dropzone_input').addClass('hidden');
      
        if (hasAdvancedFeatures) {
            let formData = new FormData();
            if (video) formData.append('file', video);
            console.log(formData);
            
            // ajax request
            $.ajax({
                url: $dropzone.attr('action'),
                method: $dropzone.attr('method'),
                type: $dropzone.attr('method'),
                data: formData,
                dataType: false, 
                cache: false,
                contentType: false, // force jQuery not to set contentType header
                processData: false, // prevent converting data to query string
                complete: function() {
                    $dropzone.removeClass('is_uploading');
                    //$(".is_processing").addClass('hidden'); // TODO: uncomment, when debugging complete 
                },
                success: function(data) {
                    $dropzone.addClass( data.success == true ? 'is_success' : 'is_error' );
                    // TODO: Append correct response, change elements on page
                    // Receive JSON response from server and call audio.js function for appending audio elements
                    $(".dropzone").append(`<p>${data}</p>`); // FOR DEBUGGING
                },
                error: function(error) {
                    $dropzone.removeClass('is_uploading');
                    $(".is_processing").addClass('hidden');
                    alert("An error occured, please try again.");
                }
            });
            // TODO: Do something while waiting for python response
            $(".is_processing").removeClass('hidden');
        } else {
            // TODO: implement (if neccessary?)
        }
    });
    // Listen to input changes and trigger submit
    $input.on('change', function(e) {
        console.log($('.dropzone_input'));
        video = $input[0].files[0];
        if (!fileIsMp4(video, $dropzone)) return;
        $dropzone.trigger('submit');
    });
}

// Checks file type and returns true if it is an mp4 file
function fileIsMp4(file, form) {
    if (file.type != 'video/mp4') {
        form.removeClass('is_uploading');
        form.addClass('is_error');
        alert("Please make sure you have uploaded a video file (mp4).");
        return false;
    }
    return true;
}