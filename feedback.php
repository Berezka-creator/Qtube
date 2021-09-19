<?php
// Fetching Values from URL.
$name = $_POST['name1'];
$message = $_POST['message1'];

$subject = $name;
// To send HTML mail, the Content-type header must be set.

mail("wasimsamarah@gmail.com", $subject, $message);
echo "code ran";
?>
