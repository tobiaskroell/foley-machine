/***************
 ** Main part **
 ***************/
let videoplayer;
let videoIsPlaying = false;
let isYoutube = false;
window.onload = () => {$('.inputYouTube').val("");} // Clear input field on page load

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
                $('.labelYouTube').addClass('invisible');
                $('.inputYouTube').addClass('invisible');
            })
            .on('dragleave dragend drop', function() {
                $dropzone.removeClass('is_dragover');
                $('.labelYouTube').removeClass('invisible');
                $('.inputYouTube').removeClass('invisible');
            })
            // Read dropped file and trigger submit
            .on('drop', function(e) {
                video = e.originalEvent.dataTransfer.files[0]; // returns list of files that where dropped
                if (!fileIsMp4(video, $dropzone)) return;
                $dropzone.trigger('submit');
            });
        // YouTube link input
        const $inputYouTube = $('.inputYouTube');
        $inputYouTube
            .on('paste', function(e) {
                e.preventDefault();
                const pasteData = e.originalEvent.clipboardData.getData('text');
                setTimeout(() => { 
                    $inputYouTube.val(pasteData);
                    if (checkLinkInput($inputYouTube.val())) $dropzone.trigger('submit');
                    else $inputYouTube.css('border-color', 'red');
                    setTimeout(() => { $inputYouTube.css('border-color', 'white'); }, 1000);
                 }, 50);
            })
            .on('focus', function(e) {
                $inputYouTube.val('');
                $('.buttonYouTube').addClass('hidden');
            })
            .on('input', function(e) {
                $('.buttonYouTube').removeClass('hidden');
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
            if ($('.inputYouTube').val()) formData.append('link', $('.inputYouTube').val());
            if (video) {
                formData.append('file', video);
                if (formData.has('link')) formData.delete('link');
            }
            
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
                    $(".is_processing").addClass('hidden'); 
                },
                success: function(data) {
                    // TODO: Receive JSON response from server and call audio.js function for appending audio elements
                    $dropzone.addClass('hidden');           // Hide dropzone
                    $('.subline').addClass('hidden');       // Hide subline
                    $('.output').removeClass('hidden');     // Show video area
                    // Show MP4 or YouTube
                    if (formData.has('file')) { 
                        loadAudioElements(data);
                        createMp4Player(data.filename); // Takes response from server! filename needs to be present!
                    } else { 
                        loadAudioElements(data);
                        createYouTubePlayer(formData.get('link')); 
                    }

                },
                error: function(jqxhr, error, exc) {
                    $dropzone.removeClass('is_uploading');
                    $('.dropzone_input').removeClass('hidden');
                    $('.is_processing').addClass('hidden');
                    if (exc == 'Payload Too Large') {
                        alert("File size is too large! Please try again.");    
                    } else {
                        alert(jqxhr.responseText);
                    }
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
        video = $input[0].files[0];
        if (!fileIsMp4(video, $dropzone)) return;
        $dropzone.trigger('submit');
    });
}

// Checks file type and returns true if it is an mp4 file
function fileIsMp4(file, form) {
    if (file.type != 'video/mp4' || file.size > 1024*1024*40) {
        form.removeClass('is_uploading');
        /* $('.inputYouTube').removeClass('invisible'); */
        form.addClass('is_error');
        alert("Please make sure you have uploaded a video file (mp4) under 40MB.");
        return false;
    }
    return true;
}

// Check input for valid youtube link and trigger post request
function checkLinkInput(value) {
    const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
    let link = value;
    if (regex.test(link)) {
        return true;
    }
    return false;
}

// Creates YouTube player with handed video ID
function createYouTubePlayer(videolink) {
    let videoID = extractYouTubeId(videolink);

    $('.youtube-video').removeClass('hidden');
    videoplayer = new YT.Player('youtube-video', {
        height: '390',
        width: '640',
        videoId: videoID,
        playerVars: {
            enablejsapi: 1,
            controls: 0,        // no video controls
            origin: 'localhost:3000',
            playsinline: 1,     // play inline on iOS
            disablekb: 1,       // disable keyboard controls
            modestbranding: 1,  // hide youtube logo
            rel: 0,             // hide related videos
            showinfo: 0,        // hide video title
            fs: 0,              // hide fullscreen button
            autoplay: 1,
            mute: 1,
        },
        events: {
            'onReady': onYouTubePlayerReady,
            'onStateChange': onYouTubeStateChange
          }

    });
    isYoutube = true;
}

function onYouTubePlayerReady(event) {
   // Implement if neccessary
}

// Is called when YouTube player state changes
function onYouTubeStateChange(e) { // YouTube player state change
    if (videoplayer.playerInfo.playerState == 1) {
        videoIsPlaying = true;
        getTimecode(videoplayer.playerInfo);
    } else {
        videoIsPlaying = false;
    }
}

/**
* @author J W & Sobral
* @url https://stackoverflow.com/a/27728417
* @date visited: 2022-12-03
* @description: Extracts the video ID from a YouTube link
* @param {string} url - YouTube link
*/
function extractYouTubeId(url) {
    const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(rx);
    return match[1];
}


function createMp4Player(filename) {
    isYoutube = false;
    videoplayer = $('.mp4-video');
    $('.mp4-video')
        .on('play', function() {
            console.log('Playing');
            videoIsPlaying = true;
            getTimecode(videoplayer[0]);
        })
        .on('pause ended', function() {
            videoIsPlaying = false;
        });
    $('.mp4-video').removeClass('hidden');
    const source = '/video/' + filename;
    $('.mp4-video source').attr('src', source);
    $('.mp4-video')[0].load();
}

// Reads and returns current timecode of video
function getTimecode(player) {
    const vidplayer = player;
    let currentTime;
    if (videoIsPlaying) {
        currentTime = player.currentTime;
        $('.timecode').text(currentTime);
        setTimeout(() => {
            getTimecode(vidplayer);
        }, 250);            // Timeinterval for updating timecode
        return currentTime; // Needed? Or check $('.timecode').text() instead?
    }
}

function reloadAndDelete() {
    const fileSource = $('.mp4-video source').attr('src');
    const file = fileSource != "" ? fileSource.split('/video/')[1] : null;
    if (file != null) {
        $.ajax({
            url: '/',
            type: 'POST',
            data: {file: file},
            success: function(data) {
                location.reload();
            },
            error: function(error) {
                console.log(error);
            }
        });
    } else {
        location.reload();
    }
}