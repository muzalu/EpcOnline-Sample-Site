/// <reference path="jquery.js"/>
var DealerID; 

var _domain = 'ypicweb.epconline.com.au';

var gImage = null;    // hold the assembly image globally
var gCanvas = null; // the canvas
var gContext = null;    // the context
var canvasMinX = 0, canvasMinY = 0;
var _offsetX = 0, _offsetY = 0, _mouseX, _mouseY, _mouseDownX, _mouseDownY, _mouseMoveX, _mouseMoveY;
var _imagePosX, _imagePosY;
var _scalefactor = 4;
var _hitTolerance = 50;
var zoom, zoomIn, zoomOut, mousePosX, mousePosY, paint;

var _canvasWidth = 400; // gContext.canvas.width;
var _canvasHeight = 600; // gContext.canvas.height;
var _centreX = _canvasWidth / 2;
var _centreY = _canvasHeight / 2;

var _hotspots = Array();

$(document).ready(function () { 

	init();

	init_mouse();

});

function init()
{
	DealerID = $.cookies.get('accesskey[yamaha]');
	
    // hide the parts list
    //$('#PartsListContainer').hide();
	
	$('#TypeSelect option').remove();
	$('<option value="-1">Please select a Type</option>')
	.appendTo('#TypeSelect');
	$('<option value="0">Motorcycle</option>')
	.appendTo('#TypeSelect');
	$('<option value="1">Marine</option>')
	.appendTo('#TypeSelect');


    // handle click from Type Selection
    $('#TypeSelect')
        .unbind()
        .change(function () {
        var selectedType = $(this).val();
        getYears(selectedType);
    });

    $(document).on('click', 'input.btnAdd', function () {
        var partNo = $(this).parent().parent().attr('data-partid');
        alert('Adding part ' + partNo);
    });

    //    $('input', function () {
    //        $(this).css('background-color', '#e7e7e7;');

    //    });

    $('input#sub-vin-search').click(function () {
        var vin = $('input#vin-search-text').val();
        getProductsByVin(vin);
        return false;
    });

    var leftButtonDown = false;
    $(document).mousedown(function (e) {
        // Left mouse button was pressed, set flag
        if (e.which === 1) leftButtonDown = true;
    });

    $(document).mouseup(function (e) {
        // Left mouse button was released, clear flag
        if (e.which === 1) leftButtonDown = false;
    });


    $('#imageCanvas').mousedown(function (e) {
        _mouseDownX = mousePosX(e);
        _mouseDownY = mousePosY(e);

        _mouseMoveX = _mouseDownX;
        _mouseMoveY = _mouseDownY;

        // calculate position on image
        _imagePosX = _mouseMoveX - _offsetX;
        _imagePosY = _mouseMoveY - _offsetY;

        $('#status').html('_mouseDownX:' + _mouseDownX + ', _mouseDownY:' + _mouseDownY);
    });

    $('#imageCanvas').mouseover(function (e) {
        $('#imageCanvas').css('cursor', 'move');
    }).mouseout(function (e) {
        $('#imageCanvas').css('cursor', 'default');
    });

    function tweakMouseMoveEvent(e) {
        //// Check from jQuery UI for IE versions < 9
        //if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
        //    leftButtonDown = false;
        //}

        // If left button is not set, set which to 0
        // This indicates no buttons pressed
        if (e.which === 1 && !leftButtonDown) e.which = 0;
    }



    $('#imageCanvas').mousemove(function (e) {
        // Call the tweak function to check for LMB and set correct e.which
        tweakMouseMoveEvent(e);
        _mouseX = mousePosX(e);
        _mouseY = mousePosY(e);

        if (leftButtonDown) {

            var newOffsetX = _offsetX + ((_mouseX - _mouseMoveX) * _scalefactor);
            var newOffsetY = _offsetY + ((_mouseY - _mouseMoveY) * _scalefactor);

            _mouseMoveX = _mouseX;
            _mouseMoveY = _mouseY;

            _offsetX = newOffsetX;
            _offsetY = newOffsetY;

            paint();
        }
        else {

            // calculate position on image
            _imagePosX = _mouseX * _scalefactor - _offsetX;
            _imagePosY = _mouseY * _scalefactor - _offsetY;

            $('#status').html(_mouseX + ', ' + _mouseY);

            // perform hit test

            var arLen = _hotspots.length;
            var gotone = false;
            for (var i = 0, len = arLen; i < len; ++i) {
                if (((_hotspots[i].ImgX >= _imagePosX - _hitTolerance) && (_hotspots[i].ImgX <= _imagePosX + _hitTolerance))
                    && ((_hotspots[i].ImgY >= _imagePosY - _hitTolerance) && (_hotspots[i].ImgY <= _imagePosY + _hitTolerance))) {
                    // popup part info
                    gotone = true;
                    $('#imageCanvas').css('cursor', 'default');

                    showInfoPopup(_hotspots[i]);
                    highlightPartRow(_hotspots[i]);
                    break;
                }
            }

            if (gotone == false) {
                $('#imageCanvas').css('cursor', 'move');
                hideInfoPopup();
                unhighlightPartRow();
            }
        }
    });


    $(document).on('mouseover', 'tr.partrow td', function () {
        // get partid
        var partid = $(this).parent().attr("data-partid");


        // $('#status').html("PartID : " + partid);
        // hilight this row
        $(this).css('background-color', '#77FF99');
    }).on('mouseout', 'tr.partrow td', function () {
        $(this).css('background-color', 'transparent');
    });

    $("#zoomIn").click(function () {
        zoomIn();
    });

    $("#zoomOut").click(function () {

        zoomOut();
    });


    gImage = new Image();
    gCanvas = document.getElementById("imageCanvas");
    if (gCanvas.getContext) {
        gContext = gCanvas.getContext("2d");

        _canvasWidth = gCanvas.width;
        _canvasHeight = gCanvas.height;
    }

    init_mouse();

}


function init_mouse() {
    canvasMinX = $('#imageCanvas').offset().left;
    canvasMinY = $('#imageCanvas').offset().top;

    _centreX = _canvasWidth / 2;
    _centreY = _canvasHeight / 2;
}

mousePosX = function (event) {
    // Get the mouse position relative to the canvas element.
    var x = 0;

    if (event.pageX || event.pageX === 0) { // Firefox
        x = event.pageX - canvasMinX;
    } else if (event.offsetX || event.offsetX === 0) { // Opera
        x = event.offsetX;
    }

    return x;
};

mousePosY = function (event) {
    var y = 0;

    if (event.pageY || event.pagerY === 0) { // Firefox
        y = event.pageY - canvasMinY;
    } else if (event.offsetY || event.offsetY === 0) { // Opera
        y = event.offsetY;
    }

    return y;
};

function paint() {
    var newWidth = _canvasWidth * (1 / _scalefactor);
    var newHeight = _canvasHeight * (1 / _scalefactor);
    gContext.save();
    //gContext.translate(-((newWidth - _canvasWidth) / 2), -((newHeight - _canvasHeight) / 2));
    gContext.scale(1 / _scalefactor, 1 / _scalefactor);


    gContext.fillStyle = gContext.strokeStyle = "#fff";
    //
    // Clear
    //
    gContext.clearRect(0, 0, _canvasWidth * _scalefactor, _canvasHeight * _scalefactor);
    gContext.drawImage(gImage, _offsetX, _offsetY);
    gContext.restore();

}


function focusHotspot(Xpos, Ypos) {
    // calculate offsets required to position hotspot in centre of canvas
    var newOffsetX = Xpos - (_centreX * _scalefactor);// * (1 / _scalefactor);
    var newOffsetY = Ypos - (_centreY * _scalefactor); // * (1 / _scalefactor);

    _offsetX = - newOffsetX;
    _offsetY = - newOffsetY;

    //alert("_offsetX : " + newOffsetX + "_offsetY : " + newOffsetY);

    $('#status').html("_offsetX : " + newOffsetX + "_offsetY : " + newOffsetY);
    paint();

}

function showInfoPopup(partdata) {
    // get hotspot position relative to page
    // first get relative to canvas
    var hotspotPosX = ((partdata.ImgX + _offsetX) * (1 / _scalefactor)) + canvasMinX;
    var hotspotPosY = ((partdata.ImgY + _offsetY) * (1 / _scalefactor)) + canvasMinY;

    $('#status').html('Got part ' + partdata.ImageRefNo);
    $('<div class="partinfopanel"></div>')
        .html('<h4>' + partdata.Number + '</h4><p>'+partdata.Desc+'</p>')
        .appendTo('body')
        .css('top', (hotspotPosY + 20) + 'px')
        .css('left', (hotspotPosX + 20) + 'px')
        .fadeIn('slow');
}

function hideInfoPopup() {
    $('.partinfopanel').remove();
}

function highlightPartRow(partdata) {
    $('#part_' + partdata.PartID +' td').css('background-color', '#77FF99');
}

function unhighlightPartRow() {
    $('.partrow td').css('background-color', 'transparent');
}

function zoomIn() {
    _scalefactor -= 0.5;
    $('#status').html('Scale factor : ' + _scalefactor);
    paint();
}

function zoomOut() {
    _scalefactor += 0.5;
    $('#status').html('Scale factor : ' + _scalefactor);
    paint();
}

    
function getProductsByVin(vin) {
    $.getJSON(
    'http://' + _domain + '/Products/Vin/' + vin + '/' + DealerID,
    function (data) {
        if (data != null) {
            $.each(data, function (i, item) {
                var productId = item.ProductID;
                var selectedType = item.Type;
                var thisYear = item.Year;
                var model = item.Model;
                setTypeSelector(selectedType);
                getYears(selectedType, thisYear);
                getModelsForYear(selectedType, thisYear, productId);
                getContentForModel(productId);
            });
        }
        else {
            alert('Sorry, that VIN could not be found');
        }
    });
}

function setTypeSelector(selType) {
    $('select#TypeSelect')
        .children()
        .attr('selected', function (i, selected) {
            return $(this).val() == selType;
        });
}

function getYears(type, selectedYear) {
	//alert('getyears');
    $.getJSON(
    'http://' + _domain + '/Products/Years/' + type + '/'+ DealerID + '?callback=?',
    function (data) {
        // first delete any content
        $('#YearSelect option').remove();
        $('#YearSelect')
            .unbind()
            .change(function () {
                var selectedType = $('#TypeSelect').val();
                var thisYear = $(this).val();
                getModelsForYear(selectedType, thisYear);
                return false;
            });
        $('<option value="-1">Please select a year</option>')
            .appendTo('#YearSelect')

        $.each(data, function (i, item) {
            $('<option id="ModelYear_' + item + '">' + item + '</option>')
            .attr('selected', item == selectedYear)
            .appendTo('#YearSelect')
        });
    });
}

function getModelsForYear(type, year, selectedProductID) {
    $.getJSON(
    'http://' + _domain + '/Products/' + type + '/Year/' + year + '/' + DealerID + '?callback=?',
    function (data) {
        $('#ModelSelect option').remove();
        $('#ModelSelect')
            .unbind()
            .change(function () {
                var productId = $(this).children(":selected").attr("data-prodid");
                getContentForModel(productId);
                // Jump to Assemblies page
                return false;
            });
        $('<option value="-1">Please select a Model</option>')
            .appendTo('#ModelSelect')

        $.each(data, function (i, item) {
            $('<option id="model_' + item.ProductID + '">' + item.Model + '</option>')
            .attr('data-prodid', item.ProductID)
            .attr('selected', item.ProductID == selectedProductID)
            .appendTo('#ModelSelect')
        });

    });
}

function getContentForModel(productId) {
//    alert(productId);
    if (typeof productId != 'undefined')  {
        $.getJSON(
        'http://' + _domain + '/Content/Product/' + productId + '/' + DealerID + '?callback=?',
        function (data) {
            $('#ContentSelect option').remove();
            //alert(data);
            $('#ContentSelect')
                .unbind()
                .change(function () {
                    var contentId = $(this).children(":selected").attr("data-contentid");
                    getAssembliesForContent(productId, contentId);
                    return false;
                });
            $('<option value="-1">Please select...</option>')
                .appendTo('#ContentSelect')
            $.each(data, function (i, item) {
                $('<option id="content_' + item.ContentID + '">' + item.Title + '</option>')
                .attr('data-contentid', item.ContentID)
                .appendTo('#ContentSelect')
            });
        });
    }
}

function getAssembliesForContent(productId, contentId) {
    //alert('getting assemblies for content ' + contentId);
    if ((typeof productId != 'undefined') && (typeof contentId != 'undefined')) {
        $.getJSON(
        'http://' + _domain + '/Assembly/Content/' + contentId + '/' + DealerID + '?callback=?',
        function (data) {
            //alert(data);
            $('#AssemblySelect option').remove();
            $('#AssemblySelect')
                .unbind()
                .change(function () {
                    // use substring to remove 'assembly_'
                    var assId = $(this).children(":selected").attr("data-assid");
                    getAssemblyImage(assId);
                    getPartsForAssembly(productId, assId);
                    return false;
                });
            $('<option value="-1">Please select an assembly</option>')
                .appendTo('#AssemblySelect')

            $.each(data, function (i, item) {
                $('<option id="assembly_' + item.AssemblyID + '">' + item.Title + '</option>')
                .attr('data-assid', item.AssemblyID)
                .appendTo('#AssemblySelect')
            });
        });
    }
}

function getPartsForAssembly(productId, assemblyId) {
    //alert('getting parts for assembly ' + assemblyId);
    if ((typeof productId != 'undefined') && (typeof assemblyId != 'undefined')) {
        $.getJSON(
            'http://' + _domain + '/Part/Assembly/' + productId + '/' + assemblyId + '/' + DealerID + '?callback=?',
            function (data) {
                $('#PartsList tbody tr').remove();
                // clear hotspot array
                _hotspots.length = 0;

                $.each(data, function (i, item) {
                    var partId = item.PartID;

                    // put the item in the hotspot array
                    _hotspots.push(item);
                    // handle supersessioned parts - Display Supersession part no and Price
                    var PartNoCell;
                    var itemPrice = 0.00;
                    var  itemPartID="";

                    if (item.SsPartNo != null) {
                        PartNoCell = "<td class=\"supersession\">"+item.SsPartNo+"</td>";
                        itemPrice = item.SsPrice;
                        itemPartID = item.SsPartNo;
                    }

                    else {
                        PartNoCell= "<td>"+item.PartNo+"</td>";
                        itemPrice = item.Price;
                        itemPartID = item.PartNo;
                    }

                    if(itemPrice){
                        clm ='<td><input type="button" id="btnAdd_' + item.PartID + '" data-partid="'+ item.PartID +'" data-partno="'+ itemPartID +'" class="productContentfooterLeft btnAddToCart" value="Add to Cart"></input></td>';
                    }
                    else{
                        /*clm ='<td><input type="button" value="Contact store" rel="facebox" class="contactstore" id="btn_' + item.PartID + '_'+item.Description+'" /></td>';*/
                        clm ='<td><a href="contact_store.php?desc='+item.Description+'&product_id='+item.PartID+' " class="contactstore" rel="facebox">Contact Store</a></td>';
                    }

                    itemPrice = 'xxx';


                    $('<tr id="part_' + item.PartID + '" class="partrow"></tr>')
                        .append('<td class="refCol"><input  id="chk_' + item.PartID + '" type="hidden"></input>' + item.RefNo + '</td><td class="text descCol">' + item.Description + '</td>' + PartNoCell + '<td class="numberCol">' + item.Quantity + '</td><td><input name="qty_'+item.PartID+'" id="qty_'+item.PartID+'" type="text" class="qtyTextbox"  value="1"/></td><td>'+ itemPrice+'</td>')
                        .append(clm)

                        .attr('data-partid', item.PartID)
                        .attr('data-partno', itemPartID)
                        .attr('data-quantity', item.Quantity)
                        .attr('data-orderqty', 1)
                        .attr('data-price', itemPrice)
                        .attr('data-refno', item.RefNo)
                        //.attr('data-sspartno', item.SsPartNo)
                        .attr('data-descrp', item.Description)

                        .appendTo('#PartsList tbody');

                })
                $('#PartsListContainer').fadeIn();

            });
    }
}


function getAssemblyImage(assemblyId) {
    $.getJSON(
    'http://' + _domain + '/Assembly/Image/' + assemblyId + '/' + DealerID + '?callback=?',
    function (data) {
        $('#status').html('Image Received');
        gCanvas.width = gCanvas.width;
        _offsetX, _offsetY = 0;
        gImage.onload = function () {
            $('#status').html('Image Loaded');
            paint();
        }
        gImage.src = 'http://' + _domain + '/Image/getImage/' + data.Key + '/type/' + data.Value;
    });
}
