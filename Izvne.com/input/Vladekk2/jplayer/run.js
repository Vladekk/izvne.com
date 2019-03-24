if (!vladekkService) {
    var vladekkService = (function () {


        $(function () {

           
            
            
            $('video').css('height', '100%')                
                      .css('width', '100%');
       

            var $allVideos = $("iframe[src*='//player.vimeo.com'], iframe[src*='//www.youtube.com'], object, embed"),

          // The element that is fluid width
          $fluidEl = $(".post-body");

            // Figure out and save aspect ratio for each video
            $allVideos.each(function () {

                $(this)
                  .data('aspectRatio', this.height / this.width)

                  // and remove the hard coded width/height
                  .removeAttr('height')
                  .removeAttr('width');

            });

            // When the window is resized
            $(window).resize(function () {

                var newWidth = $fluidEl.width();

                // Resize all videos according to their own aspect ratio
                $allVideos.each(function () {

                    var $el = $(this);
                    $el
                      .width(newWidth)
                      .height(newWidth * $el.data('aspectRatio'));

                });

                // Kick off one resize to fix all videos on page load
            }).resize();




           
            setupJplayer();
            var zone = $('#widgetzone_be_WIDGET_ZONE2');
            zone.find('.widget').removeClass('widget');
        });

        function setupJplayer() {

            var links = $('a[href*=mp3]').filter(function(e, i) {
                return i.href && i.href.indexOf(".mp3") > 0 && !i.title;;
            });

            $.get("/Custom/Themes/Vladekk2/jplayer/template.html", function(template) {

                var i = 0;
                links.each(function(index) {

                    var containerId = "jPlayer_" + index;
                    var container = template.replace('{0}', containerId);
                    var con = $(container);
                    console.log(this.href);

                    var me = this;
                    var playerDiv = $("<div style='margin-top:10px;'>");
                    $(this).after(playerDiv);
                    $(this).after(con);

                    var player = playerDiv.jPlayer({
                        ready: function() {
                            $(this).jPlayer("setMedia", {
                                title: "Bubble",
                                mp3: me.href
                            });
                        },
                        cssSelectorAncestor: "#" + containerId,
                        swfPath: "/js",
                        supplied: "mp3",
                        useStateClassSkin: true,
                        autoBlur: false,
                        smoothPlayBar: true,
                        keyEnabled: true,
                        remainingDuration: true,
                        toggleDuration: true
                    });

                });
            });


        }

        return {};
    })();
};