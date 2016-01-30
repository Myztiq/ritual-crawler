<?php
if( preg_match('/iphone|ipad|android|mobile/i', $_SERVER['HTTP_USER_AGENT']) ) {
	include('index-mobile.html');
}
else {
	include('index-desktop.html');
}
?>