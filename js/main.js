/*
 * Author: King County Web Team
 * Date: 2015-08-28 
 * Description: King County JS file
 */
$(function () {
    $('[data-kccomponent]').each(function () {
        var $this = $(this),
        url = $this.data('kccomponent') + '.aspx?a=true';
        $this.html('');

        $.ajax({
            type: 'GET',
            url: url
        }).done(function (data) {
            $this.append(data);
            //for datedlist popovers          
            $('.popoveritem').popover();
        });
    });
});
(function( $ ){
  'use strict';
  $.fn.eventsCalendar = function( options ) {

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend( {
      calNum       : '69gk-ky9a',
      numItems     : 4,
      title        : 'Events',
      titleIcon    : 'fa-calendar',
      allItemsUrl  : '!{httpPrefix}//www.kingcounty.gov/about/news/events',
      allItemsText : 'See all events',
      filter       : ''
    }, options);
    //Set global scope for instance
    var $this = this;
    var allpops = [];

    return this.each(function() {
      $this.append('<i class="fa fa-spinner fa-spin fa-4x"></i>');

      //Build URL String
      var dataURL = '!{httpPrefix}//data.kingcounty.gov/resource/' + settings.calNum +
                    '.json?';
      if(settings.filter){
        dataURL += '&$q=' + settings.filter;
      }
      dataURL += '&$order=start_time&$$app_token=bCoT94x6NcBsw8AGGZudTwOs7';

      $.ajax({
        url: dataURL,
        dataType: 'json',
        jsonp: false
      }).
      success(function(data) {
        parseData(data);
      }).
      error(function () {
        crossDomainAjax(dataURL, parseData);
      });
      function parseData(data) {
        var counter = 0;

        $this.addClass('calendar-events-list');

        var output = '<h2><span class=\"fa-stack\"><i class=\"fa fa-square fa-stack-2x\"></i><i class=\"fa ' + settings.titleIcon + ' fa-stack-1x fa-inverse\"></i> </span> '+ settings.title +'</h2>';

        $.each(data, function (i, item) {
          
          var date = new Date(0);

          date.setUTCSeconds(item.end_time);//Updated this line on 2/17
          var currentDate = new Date();

          if (date >= currentDate && counter < settings.numItems) {
            output+='<div class=\"media\"><div class="media-left">';
            var dateDay = date.getDate();
            output += '<div class=\"date-day\">' + dateDay + '</div> ';
            output += '<div class=\"date-month\">' + monthFormat(date.getMonth()) + '</div>';
            output += '</div>';//end pull left div
            var city;
            var address;
            var location;
            try {
                var itemLocation = $.parseJSON(item.location.human_address);
                city = itemLocation.city;
                address = itemLocation.address;
            } catch (e) {
                city = 'Not available';
                address = 'Not available';
            }
            if (item.location_name !== undefined) {
                location = item.location_name;
            } else {
                location = 'Not available';
            }
            var popoverContent = 'Location: ' + location + '<br /> Address: ' + address + '<br /> City: ' + city;
            var url;
            try {
                url = item.url.url;
            } catch (e) {
                url = '\/about\/news\/events';
            }

            output += '<div class=\"media-body\">';
            var eventName;
            if(item.event_name.search('<') === 0){
                eventName = $(item.event_name).text();
            }
            else {
                eventName = item.event_name;
            }
            output += '<p><a class=\"pop\" id=\"popover' + i + '\"' + 'rel=\"popover\" data-animation=\"true\" data-html=\"true\" data-placement=\"top\" data-trigger=\"hover\" data-delay=\"0\"';
            output += 'data-content="' + popoverContent +'"';
            output += 'title=\"' + item.event_name +'"';
            output += 'href=\"'+ url +'"';
            output += '>' + eventName +'</a></p>';
            output += '</div></div>';//end media div
            allpops.push('#popover' + i);
            counter += 1;
          }
        });
        //If there are no active events output error message
        if (counter === 0) {
          output += '<div class=\"media\"><div class="media-left">';
          output += '<div class=\"date-day\"><i class="fa fa-info-circle"></i></div> ';
          output += '<div class=\"date-month\"></div></div>';
          output += '<div class=\"media-body\">';
          output += '<p>There are no upcoming events in this calendar.</p>';
          output += '</div></div>';
        }

        output += '<p class="all-events"><a href="'+ settings.allItemsUrl +'"><em>'+ settings.allItemsText +'</em></a></p>';

        $this.html(output);
        $(allpops).each(function (index){
          $(allpops).popover();
        });
      }
      function crossDomainAjax(url, successCallback) {
        /* IE8 & 9 only Cross domain JSON GET request */
        if ('XDomainRequest' in window && window.XDomainRequest !== null) {
          var xdr = new XDomainRequest(); /* Use Microsoft XDR */
          /* 
          * XDomainRequest object requires a method for each event handler, 
          * even if anonymous, and to set properties explicitly
          */
          xdr.onload = function () {
            var JSON = $.parseJSON(xdr.responseText);
            if (JSON === null || typeof (JSON) === 'undefined') {
                JSON = $.parseJSON(data.firstChild.textContent);
            }
            successCallback(JSON);
          };
          xdr.onprogress = function () { };
          xdr.ontimeout = function () { };
          xdr.onerror = function () {
              _result = false;
          };
          xdr.timeout = 5000;
          xdr.contenttype = 'text/plain';
          xdr.open('get', url);
          xdr.send();
        }
        /* Normal jQuery AJAX  */
        else {
          $.ajax({
            url: url,
            cache: false,
            dataType: 'json',
            type: 'GET',
            async: false,
            success: function (data, success) {
                successCallback(data);
            },
            error: function () {
                /* regular embed, last resort */
                $this.addClass('calendar-events-list');
                var output = '';
                output += '<h2><span class=\"fa-stack\"><i class=\"fa fa-square fa-stack-2x\"></i><i class=\"fa '+ settings.titleIcon +' fa-stack-1x fa-inverse\"></i> </span> Events</h2>';
                output ='<iframe width=\"100%\" height=\"425px\" src=\"!{httpPrefix}//data.kingcounty.gov/w/' + settings.calNum +'\"frameborder=\"0\" scrolling=\"no\"></iframe>';
                output += '<p class=\"all-events\"><a href=\"'+ settings.allItemsUrl+'\"><em>'+settings.allItemsUrl+'</em></a></p>';
                $this.html(output);
            }
          });
        }
      }
    });
    //Helper function for Events Calendar function
    function monthFormat(monthToFormat) {
      var month = [];
      month[0] = 'JAN';
      month[1] = 'FEB';
      month[2] = 'MAR';
      month[3] = 'APR';
      month[4] = 'MAY';
      month[5] = 'JUN';
      month[6] = 'JUL';
      month[7] = 'AUG';
      month[8] = 'SEP';
      month[9] = 'OCT';
      month[10] = 'NOV';
      month[11] = 'DEC';
      var formatedMonth = month[monthToFormat];
      return formatedMonth;
    }
  };
})( jQuery );
(function( $ ){
  'use strict';
  $.fn.deliciousNewsFeed = function( options ) {

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend( {
      feedURL      : '!{httpPrefix}//feeds.delicious.com/v2/json/kingcounty',
      numItems     : 3,
      title        : 'News',
      titleIcon    : 'fa-file-text-o',
      showSummary  : true,
      allItemsUrl  : '!{httpPrefix}//www.kingcounty.gov/about/news/events',
      allItemsText : 'See all King County news'
    }, options);

    //Set global scope for instance
    var $this = this,
        allpops = [];
      
    function parseData(data) {
      $this.addClass('news-feed');
      $this.addClass('dated-news-feed');

      var output = '<h2><span class=\"fa-stack\"><i class=\"fa fa-square fa-stack-2x\"></i><i class=\"fa ' + settings.titleIcon + ' fa-stack-1x fa-inverse\"></i> </span> '+ settings.title +'</h2>';

      $.each (data, function(i, item) {
        if (item.d.split(': ')[1] === undefined) {
          return;
        }
        var dateWhole = item.d.split(': ');
        var dateStrSub = dateWhole[0];
        var month = dateStrSub.split(' ')[0].toUpperCase();
        month = month.substring(0,3);
        var day = dateStrSub.split(' ')[1];
        //Start HTML string
        output += '<div class="media"><div class="media-left">';
        //Get date in Date format
        //Get day
        output +='<div class="date-day">'+ day + '</div>';
        //Get month
        output +='<div class="date-month">'+ month + '</div>';
        output += '</div>';
        //Set content for popover
        var popoverContent = 'Summary: '+ item.n;
        var titleStr = item.d;
        var titleParts = titleStr.split(': ');
        var titleStrSub = titleParts[1];
        //Get Event name
        output += '<div class="media-body">';
        output +='<a href="'+item.u+'" id="popover'+i+'" rel="popover" data-animation="true" data-html="true" data-placement="right" data-trigger="hover" data-delay="0" data-content="'+ popoverContent +'" title="'+ item.d +'">' + titleStrSub + '</a>';
        if(settings.showSummary) {
          output += '<p>'+item.n+'</p>';
        }
        //Wrap up
        output+='</div></div>';
        allpops.push('#popover'+i);
      });
      output+= '<p><a href="'+settings.allItemsUrl+'"><em>'+settings.allItemsText+'</em></a></p>';
      $this.html(output);
      $(allpops).each(function (){
        $(allpops).popover();
      });
    }
    function parseError() {
      $this.addClass('news-feed');
      $this.addClass('dated-news-feed');
      var output = '<h2><span class=\"fa fa-exclamation-triangle fa-color-danger\"></i> </span> Oops...</h2>';
      output += '<div class="media-body">';
      output += '<p>Sorry, this list is temporarily unavailable.</p>';
      output += '<p>Please go <a href="https://delicious.com/kingcounty">here</a> to see all King County news.</a>';
      output += '</div>';
      $this.html(output);
    }
    return this.each(function() {
      $this.append('<i class="fa fa-spinner fa-spin fa-4x"></i>');
      var dataURL = settings.feedURL + '?count=' + settings.numItems;
      $.ajax({
        url: dataURL,
        dataType: 'jsonp',
        timeout: 5000,
      })
      .success(function(data) {
        parseData(data);
      })
      .error(function(){
        parseError();
      });
    });
  };
})( jQuery );

var fakewaffle = ( function ( $, fakewaffle ) {
    'use strict';

    fakewaffle.responsiveTabs = function ( collapseDisplayed ) {

        fakewaffle.currentPosition = 'tabs';

        var tabGroups = $( '.nav-tabs.responsive, .nav-pills.responsive' );
        var hidden    = '';
        var visible   = '';
        var activeTab = '';

        if ( collapseDisplayed === undefined ) {
            collapseDisplayed = [ 'xs', 'sm' ];
        }

        $.each( collapseDisplayed, function () {
            hidden  += ' hidden-' + this;
            visible += ' visible-' + this;
        } );

        $.each( tabGroups, function () {
            var $tabGroup   = $( this );
            var tabs        = $tabGroup.find( 'li a' );
            var collapseDiv = $( '<div></div>', {
                'class' : 'panel-group responsive' + visible,
                'id'    : 'collapse-' + $tabGroup.attr( 'id' )
            } );



            $.each( tabs, function () {
                var $this          = $( this );
                var oldLinkClass   = $this.attr( 'class' ) === undefined ? '' : $this.attr( 'class' );
                //var newLinkClass   = 'accordion-toggle';
                var newLinkClass   = 'accordion-toggle collapsed';
                var oldParentClass = $this.parent().attr( 'class' ) === undefined ? '' : $this.parent().attr( 'class' );
                //var newParentClass = 'panel panel-default';
                var newParentClass = 'panel panel-accordion-primary';
                var newHash        = $this.get( 0 ).hash.replace( '#', 'collapse-' );

                if ( oldLinkClass.length > 0 ) {
                    newLinkClass += ' ' + oldLinkClass;
                }

                if ( oldParentClass.length > 0 ) {
                    oldParentClass = oldParentClass.replace( /\bactive\b/g, '' );
                    newParentClass += ' ' + oldParentClass;
                    newParentClass = newParentClass.replace( /\s{2,}/g, ' ' );
                    newParentClass = newParentClass.replace( /^\s+|\s+$/g, '' );
                }

                if ( $this.parent().hasClass( 'active' ) ) {
                    activeTab = '#' + newHash;
                }

                collapseDiv.append(
                    $( '<div>' ).attr( 'class', newParentClass ).html(
                        $( '<div>' ).attr( 'class', 'panel-heading' ).html(
                            $( '<h4>' ).attr( 'class', 'panel-title' ).html(
                                $( '<a>', {
                                    'class'       : newLinkClass,
                                    'data-toggle' : 'collapse',
                                    'data-parent' : '#collapse-' + $tabGroup.attr( 'id' ),
                                    'href'        : '#' + newHash,
                                    'html'        : $this.html()
                                } )
                            )
                        )
                    ).append(
                        $( '<div>', {
                            'id'    : newHash,
                            'class' : 'panel-collapse collapse'
                        } )
                    )
                );
            } );

            $tabGroup.next().after( collapseDiv );
            $tabGroup.addClass( hidden );
            $( '.tab-content.responsive' ).addClass( hidden );

            if ( activeTab ) {
                $( activeTab ).collapse( 'show' );
            }
        } );


        fakewaffle.checkResize();
        fakewaffle.bindTabToCollapse();

        
    };

    fakewaffle.checkResize = function () {

        if ( $( '.panel-group.responsive' ).is( ':visible' ) === true && fakewaffle.currentPosition === 'tabs' ) {
            fakewaffle.tabToPanel();
            fakewaffle.currentPosition = 'panel';
        } else if ( $( '.panel-group.responsive' ).is( ':visible' ) === false && fakewaffle.currentPosition === 'panel' ) {
            fakewaffle.panelToTab();
            fakewaffle.currentPosition = 'tabs';
        }

    };

    fakewaffle.tabToPanel = function () {

        var tabGroups = $( '.nav-tabs.responsive, .nav-pills.responsive' );

        $.each( tabGroups, function ( index, tabGroup ) {

            // Find the tab
            var tabContents = $( tabGroup ).next( '.tab-content' ).find( '.tab-pane' );

            $.each( tabContents, function ( index, tabContent ) {
                // Find the id to move the element to
                var destinationId = $( tabContent ).attr( 'id' ).replace ( /^/, '#collapse-' );

                // Convert tab to panel and move to destination
                $( tabContent )
                    .removeClass( 'tab-pane' )
                    .addClass( 'panel-body' )
                    .appendTo( $( destinationId ) );

            } );

        } );

    };

    fakewaffle.panelToTab = function () {

        var panelGroups = $( '.panel-group.responsive' );

        $.each( panelGroups, function ( index, panelGroup ) {

            var destinationId = $( panelGroup ).attr( 'id' ).replace( 'collapse-', '#' );
            var destination   = $( destinationId ).next( '.tab-content' )[ 0 ];

            // Find the panel contents
            var panelContents = $( panelGroup ).find( '.panel-body' );

            // Convert to tab and move to destination
            panelContents
                .removeClass( 'panel-body' )
                .addClass( 'tab-pane' )
                .appendTo( $( destination ) );

        } );

    };

    fakewaffle.bindTabToCollapse = function () {

        var tabs     = $( '.nav-tabs.responsive, .nav-pills.responsive' ).find( 'li a' );
        var collapse = $( '.panel-group.responsive' ).find( '.panel-collapse' );

        // Toggle the panels when the associated tab is toggled
        tabs.on( 'shown.bs.tab', function ( e ) {
        
            var $current  = $( e.currentTarget.hash.replace( /#/, '#collapse-' ) );
            $current.collapse( 'show' );

            if ( e.relatedTarget ) {
                var $previous = $( e.relatedTarget.hash.replace( /#/, '#collapse-' ) );
                $previous.collapse( 'hide' );
            }
        } );

        // Toggle the tab when the associated panel is toggled
        collapse.on( 'shown.bs.collapse', function ( e ) {

            // Activate current tabs
            var current = $( e.target ).context.id.replace( /collapse-/g, '#' );
            $( 'a[href="' + current + '"]' ).tab( 'show' );

            // Update the content with active
            var panelGroup = $( e.currentTarget ).closest( '.panel-group.responsive' );
            $( panelGroup ).find( '.panel-body' ).removeClass( 'active' );
            $( e.currentTarget ).find( '.panel-body' ).addClass( 'active' );

        } );
    };

    $( window ).resize( function () {
        fakewaffle.checkResize();
    } );

    return fakewaffle;
}( window.jQuery, fakewaffle || { } ) );
(function($) {
    fakewaffle.responsiveTabs(['xs']);
})(jQuery);
//<![CDATA[
      var usasearch_config = { siteHandle:'kingcounty' };
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//search.usa.gov/javascripts/remote.loader.js';
      document.getElementsByTagName('head')[0].appendChild(script);
//]]>
//Crazy Egg tracking code
setTimeout(function(){
  var a=document.createElement('script');
  var b=document.getElementsByTagName('script')[0];
  a.src=document.location.protocol+'//script.crazyegg.com/pages/scripts/0013/1306.js?"+Math.floor(new Date().getTime()/3600000);';
  a.async=true;a.type='text/javascript';b.parentNode.insertBefore(a,b);
}, 1);




//Vertical panels
var verticalPanels = function($){
  'use strict';
  function goToByScroll(id){
    // Remove "link" from the ID
    id = id.replace('link', '');
    // Scroll
    $('html,body').animate({
      scrollTop: $('#'+id).offset().top
    },'slow');
  }
  function init(){
    //Get parent .addon-row div that are not attached and remove padding
    $('.addon-row.row .vertical-story-panel')
      .closest('.addon-row')
      .not('.addon-row-attached')
      .css('padding-top', '0')
      .css('padding-bottom', '0');
    //Grab panel divs
    //var $panels = $('.addon-row-attached .row.vertical-story-panel');
    var $panels = $('.row.vertical-story-panel');
    for(var i = 0; i < $panels.length; i++){
      $($panels[i]).closest('.addon-row-attached').css('padding-bottom', '0');
      $($panels[i]).attr('id', 'story-panel-'+ i);
//      if(i < ($panels.length -1)) {
      $($panels[i]).addClass('vertical-story-panel-border');
  //    }
      if($($panels[i]).attr('data-vertical-story-panel') === 'scroll'){
        $($panels[i]).append('<a class="vertical-story-panel-arrow" href="story-panel-'+ (i) +'"><span class="fa-stack fa-2x"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-chevron-down fa-stack-1x fa-inverse"></i></span></a>');
      }
    }
    $('.row.vertical-story-panel > a.vertical-story-panel-arrow').click(function(e) {
      e.preventDefault();
      goToByScroll($(this).attr('href'));
    });
  }
  return {
    init: init
  };
}( jQuery );
(function() {
  'use strict';
  verticalPanels.init();
})();

$(function(){
    //Small scripts or setup for plugins

    /* Prevent click event on empty a href tags */
    $('a[href="#"]').click(function (event) {
        event.preventDefault();
    });

    //Initialize Fitvids
    $('#main-content').fitVids();

    /* Prevent Safari opening links when viewing as a Mobile App */
    (function (a, b, c) {
        if (c in b && b[c]) {
            var d, e = a.location,
                f = /^(a|html)$/i;
            a.addEventListener('click', function (a) {
                d = a.target;
                while (!f.test(d.nodeName)) d = d.parentNode
                "href" in d && (d.href.indexOf("http") || ~d.href.indexOf(e.host)) && (a.preventDefault(), e.href = d.href);
            }, !1);
        }
    })(document, window.navigator, 'standalone');

    //http://getbootstrap.com/getting-started/#support-ie10-width
    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        var msViewportStyle = document.createElement('style');
        msViewportStyle.appendChild(
            document.createTextNode(
            '@-ms-viewport{width:auto!important}'
            )
        );
        document.querySelector('head').appendChild(msViewportStyle);
    }
});
//Funciton to choose Background on body: modified for Internal Apps
(function( $ ){
  'use strict';
  $.fn.chooseBG = function( options ) {
    var $this = this;
    return this.each(function() {
      $this.css('background-image', 'url("' + options.img + '")');
    });
  };
})(jQuery);
/*global jQuery */
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement('div');
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function(){
        var $this = $(this);
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );
