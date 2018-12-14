var stage;
$(document).ready(function() {
    var hostName = '';

    var maxStageWidth = 787;
    var maxStageHeight = 458;
    var maxPageWidth = 787;
    var maxPageHeight = 458;

    $("#loading").css({
        "top": -(340),
        "margin-bottom": -130
    });

    var loader = $("#loading");
    loader.show();

    stage = new Konva.Stage({
        container: 'visualizer-container',
        width: maxStageWidth,
        height: maxStageHeight
    });

    var konvaObjectLayer = new Konva.Layer();

    var currentRoomId;
    var currentObjectId;

    var imageSources = {};
    var objectSelection = {};

    var currentRoomList = [];
    var currentRoomName;
    var currentRoom;

    var objectList;
    var currentDesignList = [];

    $('ul.products-grid.clearfix').empty();
    // mobile
    $('.tablet-sliderslick .slider-visua').empty();

    $.ajax({
        type: "POST",
        url: hostName + '/Webservices/Services.asmx/Rooms',
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        dataFilter: function(data) {
            // This boils the response string down into a proper JavaScript Object().
            var msg = eval('(' + data + ')');

            // If the response has a ".d" top-level property, return what's below that instead.
            if (msg.hasOwnProperty('d'))
                return msg.d;
            else
                return msg;
        },
        error: function(responseData, textStatus, errorThrown) {
            console.warn(JSON.stringify(responseData), textStatus, errorThrown);
        }
    }).done(function(result) {
        currentRoomList = [];
        currentRoomList = result;
        //empty ul
        $(".visualizer_info .dropdown-selects ul").empty();
        var i;
        for (i = 0; i < result.length; ++i) {
            var name = result[i]["Name"].toLowerCase().replace(/ /g, '-');
            var displayName = result[i]["DisplayName"];
            $(".visualizer_info .dropdown-selects ul").append('<li id="' + name + '"><a href="' + 'http://' + window.location.hostname + window.location.pathname + '?room=' + name + '">' + displayName + '</a></li>');
        }

        currentRoomName = $.urlParam('room');

        for (var i = currentRoomList.length - 1; i >= 0; i--) {
            if (currentRoomList[i]["Name"].toLowerCase().replace(/ /g, '-') == currentRoomName) {
                currentRoom = currentRoomList[i];
                break;
            }
        }

        $(".choose-surfaces .dropdown-selects span").html($('.hidObject').val());
        $('ul.products-grid.clearfix').empty();

        $(".choose-collection .dropdown-selects dt").show();
        $(".choose-hue .dropdown-selects dt").show();

        imageSources = {};
        objectSelection = {};
        currentDesignList = [];

        $(".visualizer_info .dropdown-selects span").html(currentRoom["DisplayName"]);
        $.ajax({
            type: "POST",
            url: hostName + '/Webservices/Services.asmx/RoomDetail',
            data: "{id: '" + currentRoom["Id"] + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            dataFilter: function(data) {
                // This boils the response string down into a proper JavaScript Object().
                var msg = eval('(' + data + ')');

                // If the response has a ".d" top-level property, return what's below that instead.
                if (msg.hasOwnProperty('d'))
                    return msg.d;
                else
                    return msg;
            },
            error: function(responseData, textStatus, errorThrown) {
                console.warn(JSON.stringify(responseData), textStatus, errorThrown);
            }
        }).done(function(result) {
            $(".choose-surfaces .dropdown-selects ul").empty();
            var i;
            objectList = result;
            for (i = 0; i < result.length; ++i) {
                var name = result[i]["Name"].toLowerCase().replace(/ /g, '-');
                $(".choose-surfaces .dropdown-selects ul").append('<li id="' + name + '"><a href="#">' + result[i]["Name"] + '</a></li>');
                $("#" + name).click({
                    name: name,
                    id: result[i]["Id"],
                    isVicoProduct: result[i]["IsVicoProduct"]
                }, onObjectClick);

                imageSources[result[i]["Id"]] = hostName + result[i]["DefaultImage"];
                //match object id with name
                objectSelection[result[i]["Id"]] = result[i]["Name"];

                //needs more info
                // currentDesignList.push({
                //     objectName: result[i]["Name"],
                //     designName: 'Default Design',
                //     collectionName: 'Collection', 
                //     designThumb: 'images/products/product_01.jpg' //default values
                // });
                currentDesignList.push({
                    objectName: result[i]["Name"],
                    designName: result[i]["DefaultDesignName"],
                    collectionName: result[i]["DefaultCollectionName"],
                    designThumb: result[i]["DefaultThumbnail"],
                    productLink: result[i]["DefaultProductLink"]
                })
            }

            imageSources['background'] = currentRoom["Background"];

            loadImages(imageSources, currentRoom["Instruction"], loadImagesCallback);

            $(".info-box .summary_items_scroll .summary_page").empty();
            for (var indx in currentDesignList) {
                if (currentDesignList[indx].collectionName != "") {
                    $(".info-box .summary_items_scroll .summary_page").append('\
                    <a class="summary_element u" href="' + currentDesignList[indx].productLink + '" target="_blank">\
                        <p class="summary_title">' + currentDesignList[indx].objectName + '</p>\
                        <p class="summary_text">' + currentDesignList[indx].collectionName + '</p>\
                        <p class="summary_text">' + currentDesignList[indx].designName + '</p>\
                    </a>');
                } else {
                    $(".info-box .summary_items_scroll .summary_page").append('\
                    <a class="summary_element u" href="' + currentDesignList[indx].productLink + '" target="_blank">\
                        <p class="summary_title">' + currentDesignList[indx].objectName + '</p>\
                        <p class="summary_text">' + currentDesignList[indx].designName + '</p>\
                    </a>');
                }
            }

        });
    });

    var instructLayer = new Konva.Layer();

    function drawInstruction(instructLink) {
        var instruct = new Image();

        instruct.onload = function() {
            var instructKonva = new Konva.Image({
                x: 0,
                y: 0,
                image: instruct,
                width: maxStageWidth,
                height: maxStageHeight,
                id: 'visualizer-instruct'
            });

            instructKonva.on('click tap', function() {
                //console.log('click on intro');
                instructKonva.hide();
                instructLayer.draw();
                instructKonva.remove();
            });

            instructKonva.on('mouseover', function() {
                document.body.style.cursor = 'pointer';
            });

            instructKonva.on('mouseleave', function() {
                document.body.style.cursor = 'default';
            });

            instructLayer.add(instructKonva);

            stage.add(instructLayer);

            loader.hide();
        };
        instruct.src = instructLink;
    }

    var currentCollectionList = [];
    var currentHueList = [];

    var currentCollectionSelect = 'all-collections';
    var currentHueSelect = 'all-hue';

    function onObjectClick(event) {
        objectSelection.selected = event.data.id;

        $('.choose-collection .dropdown-selects span').html($('.hidAllCollections').val());
        $('.choose-hue .dropdown-selects span').html($('.hidAllHue').val());
        $('ul.products-grid.clearfix').empty();

        // mobile
        $('.tablet-sliderslick .slider-visua').empty();
		$('.tablet-sliderslick .slider-visua').removeClass('slick-initialized');
		$('.tablet-sliderslick .slider-visua').removeClass('slick-slider');
        if (event.data.isVicoProduct) {
            $(".choose-collection .dropdown-selects dt").show();
            $(".choose-hue .dropdown-selects dt").show();
        } else {
            $(".choose-collection .dropdown-selects dt").hide();
            $(".choose-hue .dropdown-selects dt").hide();
        }

        displayDesign(objectSelection.selected);
		
        return false;
    }

    var designData = [];

    function displayDesign(id) {
        currentCollectionList = [];
        currentHueList = [];
        currentCollectionSelect = 'all-collections';
        currentHueSelect = 'all-hue';

        $(".choose-surfaces .dropdown-selects span").html(objectSelection[id]);
        $.ajax({
            type: "POST",
            //url: hostName+ '/Webservices/Services.asmx/ObjectDesign',
            url: '/Webservices/Services.asmx/ObjectDesign',
            data: "{id: '" + id + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            dataFilter: function(data) {
                // This boils the response string down into a proper JavaScript Object().
                var msg = eval('(' + data + ')');

                // If the response has a ".d" top-level property, return what's below that instead.
                if (msg.hasOwnProperty('d'))
                    return msg.d;
                else
                    return msg;
            },
            success: function(result) {
                var data = result.Data;
                designData = result.Data;
                populateCollectionAndHue(data);
				$('.scroll-pane').imagesLoaded(function () {
					$('.scroll-pane').jScrollPane();
					$('.slider-visua-tablet').slick({
					    lazyLoad: 'ondemand',
                        infinite: false,
                        speed: 300,
                        slidesToShow: 4,
                        slidesToScroll: 4,
                        responsive: [
                          {
                              breakpoint: 768,
                              settings: {
                                  slidesToShow: 3,
                                  slidesToScroll: 3,
                                  infinite: true

                              }
                          },
                          {
                              breakpoint: 600,
                              settings: {
                                  slidesToShow: 3,
                                  slidesToScroll: 3,
                                  infinite: true
                              }
                          },
                          {
                              breakpoint: 480,
                              settings: {
                                  slidesToShow: 2,
                                  slidesToScroll: 2,
                                  infinite: true
                              }
                          }
                          // You can unslick at a given breakpoint now by adding:
                          // settings: "unslick"
                          // instead of a settings object
                        ]
					});
					window.setTimeout(ShowPic, 300);
				});
            },
            error: function(responseData, textStatus, errorThrown) {
                console.warn(JSON.stringify(responseData), textStatus, errorThrown);
            }
        });
    }

    function ShowPic() {
        $('.hideMenu').each(function (index) {
            $(this).removeClass('hideMenu');
        });
    };
    
    function populateCollectionAndHue(data) {
        var arrayCollection = [];
        var len = data.length;
        var arrayHue = [];
        var i;

        for (i = 0; i < len; i++) {
            var designName = data[i]["Name"].toLowerCase().replace(/ /g, '-');
            var collectionSelectId = data[i]["CollectionName"].toLowerCase().replace(/ /g, '-');
            var hues = data[i]["Hues"];
            var huesString = [];
            var productLink = data[i]["ProductName"];

            arrayCollection.push({
                id: data[i]["CollectionId"],
                name: data[i]["CollectionName"]
            });


            for (var item in hues) {
                arrayHue.push({
                    id: hues[item]["HueId"],
                    name: hues[item]["Name"]
                });

                huesString.push(hues[item]["Name"]);
            }

            var hueSelectIds = normalizeStringArray(huesString).join(' ');

            if (data[i]["CollectionId"] == 0) {

                if ($(window).width() > 800) {
                    $('ul.products-grid.clearfix').append('\
                    <li id="' + designName + '-desktop" class="item col-xs-12 col-sm-4 col-md-4 col-lg-4 design ' + collectionSelectId + ' ' + hueSelectIds + '">\
                        <div class="product-image">\
                            <a href="#">\
                                <img src="' + data[i]["Thumbnail"] + '">\
                            </a>\
                        </div>\
                        <div class="des clearfix">\
                            <h3 class="product-name">' + data[i]["Name"] + '</h3>\
                        </div>\
                    </li>');
                }
                // mobile
                $('.tablet-sliderslick .slider-visua').append('\
                    <div id="' + designName + '-mobile" class="hideMenu item col-xs-6 col-sm-4 col-md-4 col-lg-4 no-padding design ' + collectionSelectId + ' ' + hueSelectIds + '">\
                        <div class="product-image">\
                            <a href="#">\
                            <img data-lazy="' + data[i]["Thumbnail"] + '">\
                            </a>\
                            </div>\
                            <div class="des clearfix">\
                            <h3 class="product-name">'+ data[i]["Name"] +'</h3>\
                        </div>\
                    </div>');
            } else {
                if ($(window).width() > 800) {
                    $('ul.products-grid.clearfix').append('\
                <li id="' + designName + '-desktop" class="item col-xs-12 col-sm-4 col-md-4 col-lg-4 design ' + collectionSelectId + ' ' + hueSelectIds + '">\
                    <div class="product-image">\
                        <a href="#">\
                            <img src="' + data[i]["Thumbnail"] + '">\
                        </a>\
                    </div>\
                    <div class="des clearfix">\
                            <h3 class="product-name">' + data[i]["Name"] + '</h3>\
                        <span>-</span>\
                            <p>' + data[i]["Code"] + '</p>\
                    </div>\
                </li>');
                }
                // mobile
            $('.tablet-sliderslick .slider-visua').append('\
                <div id="' + designName + '-mobile" class="hideMenu item col-xs-6 col-sm-4 col-md-4 col-lg-4 no-padding design ' + collectionSelectId + ' ' + hueSelectIds + '">\
                    <div class="product-image">\
                            <a href="#">\
                        <img data-lazy="' + data[i]["Thumbnail"] + '">\
                        </a>\
                        </div>\
                        <div class="des clearfix">\
                            <h3 class="product-name">'+ data[i]["Name"] +'</h3>\
                    <span>-</span>\
                        <p>' + data[i]["Code"] + '</p>\
                    </div>\
                </div>');
            }
            if ($(window).width() > 800) {
                $("ul.products-grid").off('click', '#' + designName + '-desktop').on('click', '#' + designName + '-desktop', {
                    name: data[i]["Name"],
                    image: data[i]["Image"],
                    collectionName: data[i]["CollectionName"],
                    thumb: data[i]["Thumbnail"],
                    productLink: data[i]["ProductLink"]
                }, onDesignClick);
            }
            $(".slider-visua-tablet.products-grid").off('click', '#' + designName + '-mobile').on('click', '#' + designName + '-mobile', {
                name: data[i]["Name"],
                image: data[i]["Image"],
                collectionName: data[i]["CollectionName"],
                thumb: data[i]["Thumbnail"],
                productLink: data[i]["ProductLink"]
            }, onDesignClick);
        }

        currentCollectionList = removeDupe(arrayCollection, 'id', 'name');
        currentHueList = removeDupe(arrayHue, 'id', 'name');

        $(".choose-collection .dropdown-selects ul").empty();
        $(".choose-collection .dropdown-selects ul").append('<li id="all-collections"><a href="#">' + $('.hidAllCollections').val() + '</a></li>');
        for (var col in currentCollectionList) {
            var collectionName = currentCollectionList[col].name;
            var colIdName = collectionName.toLowerCase().replace(/ /g, '-');
            $(".choose-collection .dropdown-selects ul").append('<li id=' + colIdName + '><a href="#">' + collectionName + '</a></li>');

            $("#" + colIdName).click({
                collectionIdName: colIdName,
                collectionName: collectionName
            }, onCollectionClick);
        }

        $("#all-collections").click(function() {
            $('.choose-collection .dropdown-selects span').html($('.hidAllCollections').val());
            currentCollectionSelect = 'all-collections';
            $(".design").hide();
			$('.emptyli').remove();
            if (currentHueSelect === 'all-hue') {
                $(".design").show();
            } else {
                $("." + currentHueSelect).show();
            }
            var countInvisible = 0;
			$(".design").each(function( index ) {
				if($(this).is(":visible")){
					var sodu = countInvisible%3;
					if(sodu!=0){
						for(var i=0;i<3-sodu;i++){
							$(this).before('<li class="emptyli" style="display:none;"></li>');
						}
					}
					countInvisible=0;
				}else{
					countInvisible++;
				}
			});
			$('.scroll-pane').imagesLoaded(function () {
				$('.scroll-pane').jScrollPane();
			});
            return false;
        });

        $(".choose-hue .dropdown-selects ul").empty();
        $(".choose-hue .dropdown-selects ul").append('<li id="all-hue"><a href="#">' + $('.hidAllHue').val() + '</a></li>');
        for (var hue in currentHueList) {
            var hueName = currentHueList[hue].name;
            var hueIdName = hueName.toLowerCase().replace(/ /g, '-');
            $(".choose-hue .dropdown-selects ul").append('<li id=' + hueIdName + '><a href="#">' + hueName + '</a></li>');
            $("#" + hueIdName).click({
                hueIdName: hueIdName,
                hueName: hueName
            }, onHueClick);
        }

        $("#all-hue").click(function() {
            $('.choose-hue .dropdown-selects span').html($('.hidAllHue').val());
            currentHueSelect = 'all-hue';
            $(".design").hide();
			$('.emptyli').remove();
            if (currentCollectionSelect === 'all-collections') {
                $(".design").show();
            } else {
                $("." + currentCollectionSelect).show();
            }
			var countInvisible = 0;
			$(".design").each(function( index ) {
				if($(this).is(":visible")){
					var sodu = countInvisible%3;
					if(sodu!=0){
						for(var i=0;i<3-sodu;i++){
							$(this).before('<li class="emptyli" style="display:none;"></li>');
						}
					}
					countInvisible=0;
				}else{
					countInvisible++;
				}
			});
			$('.scroll-pane').imagesLoaded(function () {
				$('.scroll-pane').jScrollPane();
			});
            return false;
        });
    }

    function onCollectionClick(event) {
        $('.choose-collection .dropdown-selects span').html(event.data.collectionName);
        var collection = currentCollectionSelect = event.data.collectionIdName;
        $(".design").hide();
		$('.emptyli').remove();
        if (currentHueSelect === 'all-hue') {
            $("." + collection).show();
        } else {
            $("." + collection + "." + currentHueSelect).show();
        }
		
		var countInvisible = 0;
		$(".design").each(function( index ) {
			if($(this).is(":visible")){
				var sodu = countInvisible%3;
				if(sodu!=0){
					for(var i=0;i<3-sodu;i++){
						$(this).before('<li class="emptyli" style="display:none;"></li>');
					}
				}
				countInvisible=0;
			}else{
				countInvisible++;
			}
		});
		$('.scroll-pane').imagesLoaded(function () {
			$('.scroll-pane').jScrollPane();
		});
        return false;
    }

    function onHueClick(event) {
        $('.choose-hue .dropdown-selects span').html(event.data.hueName);
        var hue = currentHueSelect = event.data.hueIdName;
        $(".design").hide();
		$('.emptyli').remove();
        if (currentCollectionSelect === 'all-collections') {
            $("." + hue).show();
        } else {
            $("." + currentCollectionSelect + "." + hue).show();
        }
		var countInvisible = 0;
		$(".design").each(function( index ) {
			if($(this).is(":visible")){
				var sodu = countInvisible%3;
				if(sodu!=0){
					for(var i=0;i<3-sodu;i++){
						$(this).before('<li class="emptyli" style="display:none;"></li>');
					}
				}
				countInvisible=0;
			}else{
				countInvisible++;
			}
		});
		$('.scroll-pane').imagesLoaded(function () {
			$('.scroll-pane').jScrollPane();
		});
        return false;
    }

    function onDesignClick(event) {
        var image = event.data.image;
        var name = event.data.name;
        var objectId = objectSelection.selected;
        var thumb = event.data.thumb;
        var collectionName = event.data.collectionName;
        var productLink = event.data.productLink;
        var objectName = objectSelection[objectId];

        replaceImg(objectId, image);

        for (var i = currentDesignList.length - 1; i >= 0; i--) {
            if (currentDesignList[i].objectName == objectName) {
                currentDesignList[i].designThumb = thumb;
                currentDesignList[i].collectionName = collectionName;
                currentDesignList[i].designName = name;
                currentDesignList[i].productLink = productLink;
                break;
            }
        }

        $(".info-box .summary_items_scroll .summary_page").empty();
        for (var indx in currentDesignList) {
            if (currentDesignList[indx].collectionName != "") {
                $(".info-box .summary_items_scroll .summary_page").append('\
                <a class="summary_element u" href="'+ currentDesignList[indx].productLink +'" target="_blank">\
                    <p class="summary_title">'+ currentDesignList[indx].objectName +'</p>\
                    <p class="summary_text">'+ currentDesignList[indx].collectionName +'</p>\
                    <p class="summary_text">'+ currentDesignList[indx].designName +'</p>\
                </a>');
            } else {
                $(".info-box .summary_items_scroll .summary_page").append('\
                <a class="summary_element u" href="'+ currentDesignList[indx].productLink +'" target="_blank">\
                    <p class="summary_title">'+ currentDesignList[indx].objectName +'</p>\
                    <p class="summary_text">'+ currentDesignList[indx].designName +'</p>\
                </a>');
            }
        }
        
        return false;
    }

    function replaceImg(shapeId, image) {
        var shape = stage.findOne('#' + shapeId);

        loader.show();

        var img = new Image();
        img.onload = function() {
            shape.setImage(img);
            shape.cache();
            shape.drawHitFromCache();
            shape.draw();

            loader.hide();
        };

        img.src = image;
    }

    function loadImages(sources, instructionImg, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;

        for (var src in sources) {
            numImages++;
        }

        for (var src in sources) {
            images[src] = new Image();
            images[src].onload = function() {
                if (++loadedImages >= numImages) {
                    callback(images, instructionImg);
                }
            };
            images[src].src = sources[src];
        }
    }

    var tooltipLayer = new Konva.Layer();
    var objectImgArray = [];

    function loadImagesCallback(images, instructionImg) {

        var tooltip = new Konva.Group();
        var tooltipText = new Konva.Text({
            text: "",
            fontFamily: "Calibri",
            fontSize: 14,
            padding: 5,
            textFill: "white",
            fill: "blue",
            align: "center",
            id: "toolTipText"
        });

        var tooltipBox = new Konva.Rect({
            stroke: "black",
            strokeWidth: 1,
            fill: "white",
            height: tooltipText.getHeight(),
            shadowColor: "black",
            shadowBlur: 6,
            shadowOffset: [5, 5],
            shadowOpacity: 0.8
        });

        //var mousePos = stage.getPointerPosition();

        for (var img in images) {
            var objectImg = new Konva.Image({
                x: 0,
                y: 0,
                image: images[img],
                width: maxStageWidth,
                height: maxStageHeight,
                name: objectSelection[img],
                id: img
            });

            var designName;

            for (var i = currentDesignList.length - 1; i >= 0; i--) {
                if (currentDesignList[i].objectName == objectSelection[objectImg.getAttr("id")]) {
                    designName = currentDesignList[i].designName;
                    break;
                }
            };

            objectImgArray.push(objectImg);
            objectImg.on('click tap', onObjectMouseClick);
            $(objectImg).mousemove({
                designName: designName,
                tooltip: tooltip,
                tooltipText: tooltipText,
                tooltipBox: tooltipBox
            }, onObjectMouseMove);
            objectImg.on('mouseout', function() {
                tooltip.hide();
                tooltipLayer.draw();
            });
            konvaObjectLayer.add(objectImg);
        }

        var backgroundShape = konvaObjectLayer.findOne('#background');
        backgroundShape.off('click');
        backgroundShape.off('tap');
        backgroundShape.off('mousemove');
        backgroundShape.off('mouseout');
        objectImgArray.pop();

        tooltip.add(tooltipBox);
        tooltip.add(tooltipText);

        tooltipLayer.add(tooltip);

        stage.add(konvaObjectLayer);
        stage.add(tooltipLayer);

        var len = objectImgArray.length;
        for (var i = 0; i < len; i++) {
            objectImgArray[i].cache();
            objectImgArray[i].drawHitFromCache();
            objectImgArray[i].drawHit();
        }

        drawInstruction(instructionImg);
        loader.hide();
    }

    function onObjectMouseClick(event) {
        var shape = event.target;
        //console.log('click on object');
        objectSelection.selected = shape.getAttr('id');
        var id = objectSelection.selected;

        $('.choose-surfaces .dropdown-selects span').html(objectSelection[id]);
        for (var i in objectList) {
            if (id == objectList[i]["Id"]) {
                if (objectList[i]["IsVicoProduct"]) {
                    $(".choose-collection .dropdown-selects dt").show();
                    $(".choose-hue .dropdown-selects dt").show();
                } else {
                    $(".choose-collection .dropdown-selects dt").hide();
                    $(".choose-hue .dropdown-selects dt").hide();
                }
                break;
            }
        }

        $('.choose-collection .dropdown-selects span').html($('.hidAllCollections').val());
        $('.choose-hue .dropdown-selects span').html($('.hidAllHue').val());
        $('ul.products-grid.clearfix').empty();
        //mobile
        $('.tablet-sliderslick .slider-visua').empty();
		$('.tablet-sliderslick .slider-visua').removeClass('slick-initialized');
		$('.tablet-sliderslick .slider-visua').removeClass('slick-slider');
        displayDesign(id);
        return false;
    }

    function onObjectMouseMove(event) {
        var shape = event.currentTarget;
        var id = shape.getAttr('id');
        var name = objectSelection[id];
        var tooltip = event.data.tooltip;
        var tooltipText = event.data.tooltipText;
        var tooltipBox = event.data.tooltipBox;
        var designName = event.data.designName;

        var mousePos = stage.getPointerPosition();
        tooltip.position({
            x: mousePos.x + 5,
            y: mousePos.y + 5
        });
        var designName;

        for (var i = currentDesignList.length - 1; i >= 0; i--) {
            if (currentDesignList[i].objectName == name) {
                designName = currentDesignList[i].designName;
                break;
            }
        };        

        tooltipText.text(name+": "+designName);
        var textWidth = tooltipText.text().length * 7 + 9;
        tooltipText.setAttr('width', textWidth);
        tooltipBox.setAttr('width', textWidth);
        tooltip.show();
        tooltipLayer.batchDraw();
    }

    $(".download").click(function() {
        var dataURL = stage.toDataURL();
        if (detectIos()) {
            window.open(dataURL);
        } else {
            download(dataURL, "visualizer.png", "image/png");
        }
    });

    $.urlParam = function(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results == null) {
            return null;
        } else {
            return results[1] || 0;
        }
    };

    function removeDupe(array, keyName, valueName) {
        var outArray = [];
        var arrResult = {};
        var i;
        var len = array.length;
        for (i = 0; i < len; i++) {
            var item = array[i];
            arrResult[item[keyName] + " - " + item[valueName]] = item;
        }

        i = 0;
        for (var item in arrResult) {
            outArray[i++] = arrResult[item];
        }
        return outArray;
    }

    function normalizeStringArray(array) {
        for (var item in array) {
            array[item] = array[item].toLowerCase().replace(/ /g, '-');
        }
        return array;
    }

    // responsive stuffs

    function setStageWidth() {
        var colLeftWidth = $("#visualizer_detail .col-left").width();
        var scalePercentage = colLeftWidth / maxPageWidth;
            resizeStage(scalePercentage);
    }

    function detectIos() {
        if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
            return true;
        } else {
            return false;
        }
    }

    function resizeStage(scalePercentage) {
        $("#loading").css({
            "top": -(340 * scalePercentage),
            "margin-bottom": -130
        });
        stage.setAttr('scaleX', scalePercentage);
        stage.setAttr('scaleY', scalePercentage);
        stage.setAttr('width', maxStageWidth * scalePercentage);
        stage.setAttr('height', maxStageHeight * scalePercentage);
        for (var i = objectImgArray.length - 1; i >= 0; i--) {
            objectImgArray[i].cache();
            objectImgArray[i].drawHitFromCache();
            objectImgArray[i].drawHit();
        }
    }

    function maxStageSize() {
        $("#loading").css({
            "top": -(340),
            "margin-bottom": -130
        });        
        stage.setAttr('scaleX', 1);
        stage.setAttr('scaleY', 1);
        stage.setAttr('width', maxStageWidth);
        stage.setAttr('height', maxStageHeight);
        for (var i = objectImgArray.length - 1; i >= 0; i--) {
            objectImgArray[i].cache();
            objectImgArray[i].drawHitFromCache();
            objectImgArray[i].drawHit();
        }
    }

    setStageWidth();

    window.addEventListener('resize', setStageWidth);
}); 