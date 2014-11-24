<?PHP
// DEBUG
error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", 1);

//---------------------------------------------------------------------
// FUNCTION: passthruXML
// Description: Reads XML from URL and passes it through localhost
//---------------------------------------------------------------------

function passthruHTTP($url) {	
	global $miner;
	
	if ($url == "") return "";
		
  $old = ini_set('default_socket_timeout', $miner["socket_timeout"]);
	ini_set('error_reporting', NULL);

  if ($fp = fopen($url, "r")) {
  	stream_set_timeout($fp, $miner["stream_timeout"]);
  	
  	ob_start();	
  	fpassthru($fp);
  	$buffer = ob_get_contents();
  	$size = ob_get_length();
  	ob_end_clean();
	// print_r("Buffer", $buffer);
  
  	$info = stream_get_meta_data($fp);
  	
    fclose($fp);
  
    if ($info['timed_out']) {
      $buffer = "<error>%VAR:SERVER_TIMEOUT%</error>";
  		$size = sizeof($buffer);
    };
	} else {	
	   $buffer = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<errors><error>%VAR:SERVER_NO_CONNECTION%</error></errors>";
		 $size = sizeof($buffer);
	}
	
	ini_set('default_socket_timeout', $old);   
  ini_set('error_reporting', 1);
		
	$HTML = $buffer;	
	
	return $HTML;
}


function getURLPost($url, $fields, $raw = 1) {
  	//url-ify the data for the POST
	// print_r($fileds);
	$fields_string = $fields;
    if ($raw == 0) {
		$fields_string = "";
		foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
		$fields_string = rtrim($fields_string, '&');
	}
    // print_r($fileds_string);
    //open connection
    $ch = curl_init();
    
    //set the url, number of POST vars, POST data
    curl_setopt($ch, CURLOPT_URL, $url);
	
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		'Content-Type: application/json'));
	//	'Content-Type: application/x-www-form-urlencoded'));
	
	
	// $fields_string = urlencode($fields_string);
	//  print_r($fields_string);
	// exit();
	
    curl_setopt($ch, CURLOPT_POST, count($fields));
	// curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0); 
	curl_setopt($ch, CURLOPT_TIMEOUT, 45); //timeout in seconds
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 0);	
		
	//execute post
    $html = curl_exec($ch);
    
	if (curl_error($ch)) return -1;
		
    //close connection
    curl_close($ch);
	return $html;
}



// main program ---------------------------------------------------------------
$miner["url1"] = "http://demo3.nrg4cast.org:9080/";
$miner["url2"] = "http://demo3.nrg4cast.org/";
$miner["stream_timeout"] = 200;
$miner["socket_timeout"] = 100;

// main program -------------------------------------------------------

extract($_GET); extract($_POST); extract($_COOKIE);

$pars = str_replace("|", "&", $p);
if (substr($cmd, 0, 3) == "api"){
	$url = $miner["url2"] . $cmd;
}
else {
	$url = $miner["url1"] . $cmd;
}

$url = str_replace("%3D", "=", $url);
$url = str_replace("%26", "&", $url);
$url = str_replace('"', '%22', $url);
$url = str_replace(" ", "%20", $url);

$XML .= passthruHTTP($url);
// }
$size = strlen($XML);

header('Cache-Control: no-store, no-cache, must-revalidate');     // HTTP/1.1 
header('Cache-Control: pre-check=0, post-check=0, max-age=0');    // HTTP/1.1 
header ("Pragma: no-cache"); 
header("Expires: 0"); 
header("Content-Length: " . $size);


echo $XML;
?>