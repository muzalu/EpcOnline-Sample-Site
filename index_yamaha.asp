<%@ Language=VBScript %>
<%


'*************************************************************************
' DO NOT MODIFY THIS SCRIPT IF YOU WANT UPDATES TO WORK!
' Function : Use this page to make custom pages for your store
' Product  : CandyPress Store Frontend
' Version  : 6.2
' Modified : May 2007
' Copyright: Copyright (C) 2010 Cavallo Communications, LLC.
'            See "license.txt" for this product for details regarding
'            licensing, usage, disclaimers, distribution and general
'            copyright requirements. If you don't have a copy of this
'            file, you may request one at http://www.candypress.com
'*************************************************************************
Option explicit
Response.Buffer = true
%>
<!--#include file="../scripts/_INCappDBConn_.asp"-->
<!--#include file="../scripts/_INCconfig_.asp"-->
<!--#include file="../scripts/_INCappFunctions_.asp"-->
<%
dim mySQL, connTemp, rsTemp, rsTemp2, idOrder, idCust
call openDB()
if loadConfig() = false then
    call errorDB(LangText("ErrConfig",""),"")
end if
idOrder = sessionCart()
idCust  = sessionCust()

    <!-- #include file="config.asp" -->
	dim xmlHTTP, xmlDoc, arrStatus, strStatus, arrResult
	
	dim access_url : access_url = "http://adminapi.epconline.com.au/Subscription/AccessKey/"&dealer_key&"/"&product_key_yamaha
'response.write (access_url)

	On Error Resume Next
    Err.Clear
	
    Set xmlHTTP = Server.CreateObject("MSXML2.ServerXMLHTTP.4.0")
	 
     If (Err) Then
          Err.Clear
          Set xmlHTTP = Server.CreateObject("MSXML2.ServerXMLHTTP.3.0")
     End If

     If (Err) Then
          Err.Clear
          Set xmlHTTP = Server.CreateObject("MSXML2.ServerXMLHTTP")
     End If

     If (Err) Then
          Err.Clear
          Set xmlHTTP = Server.CreateObject("Microsoft.XMLHttp")
     End If
     On Error Goto 0

dim br				   
br = Request.ServerVariables("HTTP_USER_AGENT") 
dim strServerName: strServerName = lcase(Request.ServerVariables("SERVER_NAME"))

'if strServerName = "localhost" then xmlHTTP.SetProxy 2, "sssssssss:8080" 
xmlHTTP.Open "GET", access_url, False 
xmlhttp.setRequestHeader "User-Agent",br 
xmlHTTP.Send

if err.number <> 0 then 
  response.write "Error: " & xmlHTTP.parseError.URL & _ 
      "<br>" & xmlHTTP.parseError.Reason 
  response.end 
end if 
dim accessKey
'response.write "<br>" & "xmlHTTP.ResponseText " &  xmlHTTP.ResponseText 
accessKey = xmlHTTP.ResponseText
accessKey = replace(accessKey, chr(34) , "")
'response.write "<br>" & accessKey


response.addheader "Set-Cookie", "accesskey[yamaha]="&accessKey&"; path=/;"

%>
<!--#include file="../scripts/_INCimageresize_.asp"-->
<!--#include file="../UserMods/_INCtemplate_.asp"-->
<%
call closeDB()
call cartMain()

sub cartMain() 
%>

<p>&nbsp;</p>
<p>&nbsp;</p>
<div align="center">
        <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse" bordercolor="#2A2A2A">
          <tr>
            <td width="100%" height="22" bgcolor="#2A2A2A">
            <p align="center">
            &nbsp;</td>
          </tr>
          <tr>
            <td width="400" height="22" bordercolor="#2A2A2A" bgcolor="#2A2A2A" align="left">
			                <select id="TypeSelect" name="TypeSelect"><option value="0">Please select a Type</option>
			                </select></td>
          </tr>
          <tr>
            <td width="400" height="22" bordercolor="#2A2A2A" bgcolor="#2A2A2A" align="left">
			                <select id="YearSelect" name="YearSelect"><option value="0">Please select a Year</option></select></td>
          </tr>
          <tr>
            <td width="400" height="22" bordercolor="#2A2A2A" bgcolor="#2A2A2A" align="left">
			                <select id="ModelSelect" name="ModelSelect"><option value="0">Please select a Model</option></select></td>
          </tr>
          <tr>
            <td width="400" height="22" bordercolor="#2A2A2A" bgcolor="#2A2A2A" align="left">
                    <select id="ContentSelect" name="ContentSelect"></select>
                    </td>
          </tr>
          <tr>
            <td width="400" height="22" bordercolor="#2A2A2A" bgcolor="#2A2A2A" align="left">
                    <select id="AssemblySelect" name="AssemblySelect"></select>
            </td>
          </tr>
          <tr>
            <td width="100%" height="16">
				            <input id="zoomIn" type="button" value="+" />
				            <input id="zoomOut" type="button" value="-" />

			        <div id="Diagram0">
				        <canvas id="imageCanvas" width="600" height="400">
				            Your browser doesn't support the canvas element. Please get a new browser
				        </canvas>
			        </div>
			        <div id="status"><textarea id="statuslog" rows="20" cols="20"></textarea></div>
			    <p>&nbsp;</td>
          </tr>
          <tr>
            <td width="600" height="19" bgcolor="#2A2A2A" bordercolor="#2A2A2A">&nbsp;</td>
          </tr>
        </table>
        <table id="PartsList" style="border-collapse: collapse" bordercolor="#111111" cellpadding="0" cellspacing="0">
            <thead>
                <tr>
                    <th bgcolor="#2A2A2A" width="70">
                    <font color="#FFFFFF">&nbsp;Ref No&nbsp;&nbsp;&nbsp;
                    </font></th>
                    <th bgcolor="#2A2A2A" width="110">
                    <font color="#FFFFFF">Description&nbsp;&nbsp;&nbsp;&nbsp;
                    </font></th>
                    <th bgcolor="#2A2A2A" width="110">
                    <font color="#FFFFFF">Part Number&nbsp;&nbsp;&nbsp;&nbsp;
                    </font></th>
                    <th bgcolor="#2A2A2A" width="80">
                    <p align="left"><font color="#FFFFFF">Qty per Assembly&nbsp;&nbsp;&nbsp;&nbsp;
                    </font></th>

                    <th bgcolor="#2A2A2A" width="100">
                    <font color="#FFFFFF">Price</font></th>
                    <th bgcolor="#2A2A2A" width="132">
                    <p align="left"></th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>

    <!-- JavaScript at the bottom for fast page loading -->

  <!-- Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if necessary -->
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.js"></script>
  <script>      window.jQuery || document.write("<script src='js/libs/jquery-1.5.1.min.js'>\x3C/script>")</script>

  <script src="js/libs/jquery.cookies.2.2.0.min.js"></script>
  <!-- scripts concatenated and minified via ant build script-->
  <script src="js/plugins.js"></script>
  <script src="js/ypicweb.js"></script>
  <!-- end scripts-->

<%
end sub
%>