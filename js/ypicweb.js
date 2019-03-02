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

    var ConfiguredProductTypes = $.cookies.get('epcconfig[yamaha]');
    ConfiguredProductTypes += '';
    var arrCfg = ConfiguredProductTypes.split(",");
    if (arrCfg.length > 1) {
        $('#TypeSelect option').remove();
	    $('<option value="-1">Please select a Type</option>')
            .appendTo('#TypeSelect');

        if (contains(arrCfg, "MA")) {
            $('<option value="1">Marine</option>')
                .appendTo('#TypeSelect');
        }

        if (contains(arrCfg, "MB")) {
            $('<option value="0">Motorcycle</option>')
                .appendTo('#TypeSelect');
        }
    }
    else {
        $('#TypeSelect').remove();
        var selectedType = '0';
        switch (arrCfg[0]) {
            case 'MB': selectedType = '0'; break;
            case 'MA': selectedType = '1'; break;
        };
        $('<input id="TypeSelect" type="hidden" />')
            .val(selectedType)
            .appendTo('#TypeSelection');


        $('#TypeSelect').hide();

        getYears(selectedType);
    }


    $('#TypeSelect').change(function () {
        var selectedType = $(this).val();
        getYears(selectedType);

    });

    $(document).on('click', 'input.btnAdd', function () {
        var partNo = $(this).parent().parent().attr('data-partid');
        var partid = jQuery(this).attr('data-partid');
        var partinfo = jQuery(this).parent().parent().attr('data-partno');
        var quantity = jQuery(this).parent().parent().attr('data-orderqty');
        var weight =  jQuery(this).parent().parent().attr('data-weight');
        var volume =  jQuery(this).parent().parent().attr('data-volume');
        var length =  jQuery(this).parent().parent().attr('data-length');
        var height =  jQuery(this).parent().parent().attr('data-height');
        var width =  jQuery(this).parent().parent().attr('data-width');
        var dangerousgoodsclass =  jQuery(this).parent().parent().attr('data-dangerousgoodsclass');
        var dangerousgoodscode =  jQuery(this).parent().parent().attr('data-dangerousgoodscode');
        var detail=jQuery(this).parent().parent().attr('data-descrp');
        var listprice=jQuery(this).parent().parent().attr('data-price');
        var title=partinfo+'-'+detail;

        var price = (listprice*1.1).toFixed(2);


        // NOTE: You probably will need to change this code to suit your shopping cart
        javascript: jQuery.ajax({
            url: _yourdomain + '/result',
            data:{post_title:title, post_content:detail,price:price,quantity:quantity,weight:weight,volume:volume,length:length,width:width,height:height,dangerousgoodsclass:dangerousgoodsclass,dangerousgoodscode:dangerousgoodscode},
            success:function (data_rdx) {
                jQuery(".fr-loading").hide();

                if(data_rdx=='fail') {
                    alert("Error, Please Try Again");
                } else {
                    jQuery(".orb_custom").html(data_rdx);
                }
            }});

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

    $(document).on('keyup', '#PartNumber', function () {
        if ($('#PartNumber').val().length < 8) {
            $("#btnSearch").attr("disabled", "disabled");
        } else {
            $("#btnSearch").removeAttr("disabled");
        }
    });

    $(document).on('click', '#btnSearch', function () {
        var searchString = $('#PartNumber').val();
        $.getJSON(
            'http://' + _domain + '/Part/Search/' + searchString + '/' + DealerID + '?callback=?',
            function (data) {
                $('#SearchPartsList tbody tr').remove();

                $.each(data, function (i, item) {
                    var partId = item.PartID;

                    // put the item in the hotspot array
                    _hotspots.push(item);
                    // handle supersessioned parts - Display Supersession part no and Price
                    var PartNoCell;
                    var itemPrice = 0.00;
                    var itemPartID = "";

                    if (item.SsPartNo != null) {
                        PartNoCell = "<td class=\"supersession\">" + item.SsPartNo + "</td>";
                        itemPrice = item.SsPrice;
                        itemPartID = item.SsPartNo;
                    } else {
                        PartNoCell = "<td>" + item.PartNo + "</td>";
                        itemPrice = item.Price;
                        itemPartID = item.PartNo;
                    }

                    if (itemPrice) {
                        clm = '<td><input type="button" id="btnAdd_' + item.PartID + '" data-partid="' + item.PartID + '" data-partno="' + itemPartID + '" class="productContentfooterLeft btnAddToCart" value="Add to Cart"/></td>';
                    } else {
                        /*clm ='<td><input type="button" value="Contact store" rel="facebox" class="contactstore" id="btn_' + item.PartID + '_'+item.Description+'" /></td>';*/
                        clm = '<td><a href="contact_store.php?desc=' + item.Description + '&product_id=' + item.PartID + ' " class="contactstore" rel="facebox">Contact Store</a></td>';
                    }

//                    itemPrice = 'xxx';

                    $('<tr id="part_' + item.PartID + '" class="partrow"></tr>')
                        .append('<td class="refCol"><input  id="chk_' + item.PartID + '" type="hidden"/>' + item.Model + '</td><td>' + item.AssemblyName + '</td><td>' + item.RefNo + '</td><td class="text descCol">' + item.Desc + '</td><td class="text remarkCol">' + item.Remark + '</td>' + PartNoCell + '<td class="numberCol">' + item.Quantity + '</td><td><input name="qty_' + item.PartID + '" id="qty_' + item.PartID + '" type="text" class="qtyTextbox"  value="1"/></td><td>' + itemPrice + '</td>')
                        .append(clm)
                        .attr('data-partid', item.PartID)
                        .attr('data-partno', itemPartID)
                        .attr('data-quantity', item.Quantity)
                        .attr('data-orderqty', 1)
                        .attr('data-price', itemPrice)
                        .attr('data-refno', item.RefNo)
                        //.attr('data-sspartno', item.SsPartNo)
                        .attr('data-descrp', item.Desc)
                        .attr('data-remark', item.Remark)
                        .attr('data-notforsale', item.Discontinued)
                        .attr('data-weight', item.Weight)
                        .attr('data-volume', item.Volume)
                        .attr('data-dangerousgoodsclass', item.DangerousGoodsClass)
                        .attr('data-dangerousgoodscode', item.DangerousGoodsCode)
                        .attr('data-length', item.Length)
                        .attr('data-width', item.Width)
                        .attr('data-height', item.Height)

                        .appendTo('#SearchPartsList tbody');
                });

                $('#SearchPartsList tr:odd').addClass('odd');
                $('#PartSearchResultsContainer').fadeIn();
            });
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

// contains function
function contains(arr, findValue) {
    var i = arr.length;

    while (i--) {
        if (arr[i] === findValue) return true;
    }
    return false;
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
        .html('<h4>' + partdata.Number + '</h4><p>'+partdata.Desc+'</p><p>'+partdata.Remark+'</p>')
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
    'https://' + _domain + '/Products/Vin/' + vin + '/' + DealerID,
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
        'https://' + _domain + '/Products/Years/' + type + '/'+ DealerID + '?callback=?',
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
        'https://' + _domain + '/Products/' + type + '/Year/' + year + '/' + DealerID + '?callback=?',
        function (data) {
            $('#ModelSelect option').remove();
            $('#ModelSelect')
                .unbind()
                .change(function () {
                    var productId = $(this).children(":selected").attr("data-prodid");
                    if (type == 0) {
                        getAssembliesForModel(productId);
                    }
                    else {
                        getContentForModel(productId);
                    }
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
            'https://' + _domain + '/Content/Product/' + productId + '/' + DealerID + '?callback=?',
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
            'https://' + _domain + '/Assembly/Content/' + contentId + '/' + DealerID + '?callback=?',
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

function getAssembliesForModel(productId) {
    //alert('getting assemblies for content ' + contentId);
    if (typeof productId != 'undefined') {
        $.getJSON(
            'https://' + _domain + '/Assembly/Product/' + productId + '/' + DealerID + '?callback=?',
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
            'https://' + _domain + '/Part/Assembly/' + productId + '/' + assemblyId + '/' + DealerID + '?callback=?',
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
                        clm ='<td><input type="button" id="btnAdd_' + item.PartID + '" data-partid="'+ item.PartID +'" data-partno="'+ itemPartID +'" class="productContentfooterLeft btnAddToCart" value="Add to Cart"/></td>';
                    }
                    else{
                        /*clm ='<td><input type="button" value="Contact store" rel="facebox" class="contactstore" id="btn_' + item.PartID + '_'+item.Description+'" /></td>';*/
                        clm ='<td><a href="contact_store.php?desc='+item.Description+'&product_id='+item.PartID+' " class="contactstore" rel="facebox">Contact Store</a></td>';
                    }

                    itemPrice = 'xxx';


                    var class_Partnotforsale = item.Discontinued ? "partnotforsale" : "";

                    $('<tr id="part_' + item.PartID + '" class="partrow"></tr>')
                        .append('<td class="refCol"><input  id="chk_' + item.PartID + '" type="hidden"/>' + item.RefNo + '</td><td class="text descCol">' + item.Description + '</td>' + PartNoCell + '<td class="numberCol">' + item.Quantity + '</td><td><input name="qty_' + item.PartID + '" id="qty_' + item.PartID + '" type="text" class="qtyTextbox"  value="1"/></td><td><span class="' + class_Partnotforsale + '">' + itemPrice + '</span></td>')
                        .append(clm)

                        .attr('data-partid', item.PartID)
                        .attr('data-partno', itemPartID)
                        .attr('data-quantity', item.Quantity)
                        .attr('data-orderqty', 1)
                        .attr('data-price', itemPrice)
                        .attr('data-refno', item.RefNo)
                        //.attr('data-sspartno', item.SsPartNo)
                        .attr('data-descrp', item.Description)
                        .attr('data-notforsale', item.Discontinued)
                        .attr('data-weight', item.Weight)
                        .attr('data-volume', item.Volume)

                        .appendTo('#PartsList tbody');

                })
                $('#PartsListContainer').fadeIn();

            });
    }
}


function getAssemblyImage(assemblyId) {
    $.getJSON(
        'https://' + _domain + '/Assembly/Image/' + assemblyId + '/' + DealerID + '?callback=?',
        function (data) {
            $('#status').html('Image Received');
            gCanvas.width = gCanvas.width;
            _offsetX, _offsetY = 0;
            gImage.onload = function () {
                $('#status').html('Image Loaded');
                paint();
            }
            gImage.src = 'https://' + _domain + '/Image/getImage/' + data.Key + '/type/' + data.Value;
        });
}


function getAssemblyThumbnails() {

}
