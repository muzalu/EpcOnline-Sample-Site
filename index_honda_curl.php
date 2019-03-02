<?php
/*Copyright (C) 2011 by K & K Computech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Make call to Dealer Admin site to check subscription
	require_once ("inc/config.php");

// Dealer Key first, then product key
// This file setup for Peter Stevens
$ch=curl_init();
 curl_setopt($ch,CURLOPT_URL,"https://adminapi.epconline.com.au/Subscription/AccessKey/{$_dealer_key}/{$_product_key_honda}/");
 curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
 $buffer = curl_exec($ch);
 curl_close($ch);
$accessKey = str_replace('"', '',$buffer);
setcookie("accesskey[honda]", $accessKey);


?>
<!doctype html>
<!--[if lt IE 7 ]> <html class="no-js ie6" lang="en"> <![endif]-->
<!--[if IE 7 ]>    <html class="no-js ie7" lang="en"> <![endif]-->
<!--[if IE 8 ]>    <html class="no-js ie8" lang="en"> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--> <html class="no-js" lang="en"> <!--<![endif]-->

<head>
    <meta charset="utf-8">

    <!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame
Remove this if you use the .htaccess -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <title>Honda EPC Online</title>
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Mobile viewport optimized: j.mp/bplateviewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Place favicon.ico & apple-touch-icon.png in the root of your domain and delete these references -->
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <!-- Link to web font -->
    <link href='http://fonts.googleapis.com/css?family=Chivo:400,900' rel='stylesheet' type='text/css'>

    <!-- All JavaScript at the bottom, except for Modernizr which enables HTML5 elements & feature detects -->
    <script src="js/libs/modernizr-1.7.min.js"></script>
    <!--[if lt IE 9]>
    <script src="js/libs/excanvas.js"></script>
    <![endif]-->

    <!-- CSS: implied media="all" -->
    <link rel="stylesheet" href="css/style.css?v=2">
    <link rel="stylesheet" href="css/honda.css?v=1">

    <!-- Uncomment if you are specifically targeting less enabled mobile browsers
<link rel="stylesheet" media="handheld" href="css/handheld.css?v=2">  -->
</head>
<body>
<div id="container">
    <header>
        <h1>Honda Online Demo Site</h1>
        <div id="logo"></div>
        <div class="contentTop">
            <h2>Honda Online EPC</h2>
        </div>
    </header>

    <div id="main" role="main" class="roundcorners">

        <div id="FilterPanel" class="roundcorners">
            <div id="TypeSelection">
                <div>
                    <select id="TypeSelect" name="TypeSelect">
                    </select>
                </div>
                <div id="YearSelection">
                    <select id="YearSelect" name="YearSelect"></select>
                </div>
                <div id="ModelSelection">
                    <select id="ModelSelect" name="ModelSelect"></select>
                </div>
                <div id="AssemblySelection">
                    <select id="AssemblySelect" name="AssemblySelect"></select>
                </div>
                <div id="AccessorySelection">
                    <select id="AccessorySelect" name="AccessorySelect"></select>
                </div>
                <div id="AdrAssemblySelection">
                    <select id="AdrAssemblySelect" name="AdrAssemblySelect"></select>
                </div>
            </div>

        </div>
        <div id="AssemblyContainer">
            <div id="Diagram">
                <div id="DiagramControls">
                    <input id="zoomIn" type="button" value="+" />
                    <input id="zoomOut" type="button" value="-" />
                </div>
                <canvas id="imageCanvas" width="920" height="500">
                    Your browser doesn't support the canvas element. Please get a new browser
                </canvas>
            </div>
            <div id="PartsListContainer">
                <table id="PartsList">
                    <thead>
                    <tr>
                        <th>Ref No.</th>
                        <th>Desc</th>
                        <th>Number</th>
                        <th>Qty per Assembly</th>
                        <th>Qty to Order</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>


            <div id="status"><textarea id="statuslog" rows="20" cols="20"></textarea></div>
        </div>
        <div id="imageWrap" class="roundcorners">
        </div>
    </div> <!-- main -->
    <footer class="roundcorners">
        <p>This sample site is copyright KnK Computech &copy;2011</p>
    </footer>
</div> <!-- end of #container -->


<!-- JavaScript at the bottom for fast page loading -->

<!-- Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if necessary -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.js"></script>
<script>window.jQuery || document.write("<script src='js/libs/jquery-1.10.1.min.js'>\x3C/script>")</script>

<script src="js/libs/jquery.cookies.2.2.0.min.js"></script>
<!-- scripts concatenated and minified via ant build script-->
<script src="js/plugins.js"></script>
<script src="js/hondaepc.js"></script>
<!-- end scripts-->


<!--[if lt IE 7 ]>
<script src="js/libs/dd_belatedpng.js"></script>
<script>DD_belatedPNG.fix("img, .png_bg"); // Fix any <img> or .png_bg bg-images. Also, please read goo.gl/mZiyb </script>
<![endif]-->


</body>
</html>