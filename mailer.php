
<?php

// --- Database credentials ---
$servername = "localhost";
$username   = "u713075984_mhanzala";
$password   = "D*x+xRX6";
$dbname     = "u713075984_contact_form";

// --- ERPNext Lead webhook configuration ---
$erpnext_url = getenv("ERPNEXT_URL") ?: "https://btm.digihoopoe.com";
$erpnext_api_key = getenv("ERPNEXT_API_KEY") ?: "";
$erpnext_api_secret = getenv("ERPNEXT_API_SECRET") ?: "";

$erpnext_config_file = __DIR__ . "/erpnext-config.php";
if (is_file($erpnext_config_file)) {
  require $erpnext_config_file;
}

// --- Connect to database ---
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Database connection failed: " . $conn->connect_error);
}

// --- Basic spam trap ---
if (!empty($_POST['website'])) {
  exit;
}

// --- Get form data ---
$source_page = $_POST['source_page'] ?? 'Contact Page';
$full_name   = trim($_POST['full_name'] ?? '');
$first_name  = trim($_POST['first_name'] ?? '');
$last_name   = trim($_POST['last_name'] ?? '');
$email       = trim($_POST['email'] ?? '');
$phone       = trim($_POST['phone'] ?? '');
$message     = trim($_POST['message'] ?? '');
$zip_code    = trim($_POST['zip_code'] ?? '');
$address     = trim($_POST['address'] ?? '');
$selected_service = trim($_POST['selected_service'] ?? '');
$selected_plan = trim($_POST['selected_plan'] ?? '');
$tcpa_consent_1 = isset($_POST['tcpa_consent_1']) ? 'yes' : 'no';
$tcpa_consent_2 = isset($_POST['tcpa_consent_2']) ? 'yes' : 'no';
$tcpa_consent_3 = isset($_POST['tcpa_consent_3']) ? 'yes' : 'no';
$agree = isset($_POST['agree']) || $tcpa_consent_1 === 'yes' ? 1 : 0;

if ($full_name !== '' && $first_name === '' && $last_name === '') {
  $name_parts = preg_split('/\s+/', $full_name, 2);
  $first_name = $name_parts[0] ?? '';
  $last_name = $name_parts[1] ?? '';
}

$broadband_details = '';
if ($source_page === 'Broadband Service Page') {
  $broadband_details = "\n\nBroadband Lead Details\n"
    . "Source Page: $source_page\n"
    . "Selected Plan: $selected_plan\n"
    . "Zip Code: $zip_code\n"
    . "Address: $address\n"
    . "Selected Service: $selected_service\n"
    . "TCPA Consent 1: $tcpa_consent_1\n"
    . "TCPA Consent 2: $tcpa_consent_2\n"
    . "TCPA Consent 3: $tcpa_consent_3\n";
}

$database_message = trim($message . $broadband_details);

function post_to_erpnext($erpnext_url, $api_key, $api_secret, $doctype, $data) {
  if ($api_key === "" || $api_secret === "") {
    return false;
  }

  $endpoint = rtrim($erpnext_url, "/") . "/api/resource/" . rawurlencode($doctype);
  $payload = json_encode($data);
  $auth_header = "Authorization: token " . $api_key . ":" . $api_secret;

  if (function_exists("curl_init")) {
    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => [
        $auth_header,
        "Content-Type: application/json",
        "Accept: application/json"
      ],
      CURLOPT_POSTFIELDS => $payload,
      CURLOPT_TIMEOUT => 15
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($response === false || $http_code < 200 || $http_code >= 300) {
      error_log("ERPNext " . $doctype . " webhook failed. HTTP: " . $http_code . " Error: " . $curl_error . " Response: " . $response);
      return false;
    }

    return json_decode($response, true);
  }

  $context = stream_context_create([
    "http" => [
      "method" => "POST",
      "header" => $auth_header . "\r\nContent-Type: application/json\r\nAccept: application/json\r\n",
      "content" => $payload,
      "timeout" => 15,
      "ignore_errors" => true
    ]
  ]);

  $response = @file_get_contents($endpoint, false, $context);
  $status = $http_response_header[0] ?? "";
  $success = preg_match("/HTTP\/\S+ 2\d\d/", $status);

  if ($response === false || !$success) {
    error_log("ERPNext " . $doctype . " webhook failed. Status: " . $status . " Response: " . $response);
    return false;
  }

  return json_decode($response, true);
}

$lead_name = trim($first_name . " " . $last_name);
$erpnext_lead_data = [
  "lead_name" => $lead_name !== "" ? $lead_name : $email,
  "first_name" => $first_name,
  "last_name" => $last_name,
  "email_id" => $email,
  "mobile_no" => $phone,
  "whatsapp_no" => $phone,
  "phone" => $phone,
  "status" => "Lead",
  "source" => "Website",
  "type" => "Client",
  "request_type" => $source_page === "Broadband Service Page" ? "Product Enquiry" : "Request for Information",
  "lead_owner" => "omar@xperts-global.com",
  "company_name" => "Xperts Global Website Lead"
];

$erpnext_lead_response = post_to_erpnext($erpnext_url, $erpnext_api_key, $erpnext_api_secret, "Lead", $erpnext_lead_data);
$erpnext_lead_name = $erpnext_lead_response["data"]["name"] ?? "";

if ($erpnext_lead_name !== "" && $database_message !== "") {
  $erpnext_comment_content = nl2br(htmlspecialchars($database_message, ENT_QUOTES, "UTF-8"));
  post_to_erpnext($erpnext_url, $erpnext_api_key, $erpnext_api_secret, "Comment", [
    "comment_type" => "Comment",
    "reference_doctype" => "Lead",
    "reference_name" => $erpnext_lead_name,
    "comment_email" => $email,
    "comment_by" => $lead_name !== "" ? $lead_name : $email,
    "subject" => $source_page . " Message",
    "content" => $erpnext_comment_content
  ]);
}

if ($erpnext_lead_name !== "" && $address !== "") {
  $erpnext_address_data = [
    "address_title" => $lead_name !== "" ? $lead_name : "Website Lead",
    "address_type" => "Billing",
    "address_line1" => $address,
    "city" => $zip_code !== "" ? $zip_code : "Unknown",
    "country" => "United States",
    "pincode" => $zip_code,
    "phone" => $phone,
    "email_id" => $email,
    "links" => [
      [
        "link_doctype" => "Lead",
        "link_name" => $erpnext_lead_name
      ]
    ]
  ];

  post_to_erpnext($erpnext_url, $erpnext_api_key, $erpnext_api_secret, "Address", $erpnext_address_data);
}

$sms_opt_in = isset($_POST['sms_opt_in']) ? 1 : 0;

// --- Save to database ---
$stmt = $conn->prepare("INSERT INTO contacts (first_name, last_name, email, phone, message, agree, sms_opt_in) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssii", $first_name, $last_name, $email, $phone, $database_message, $agree, $sms_opt_in);
$stmt->execute();
$stmt->close();

// --- Send email ---
$to = "omar@xperts-global.com";
$subject = "New Website Lead Submission";
$body = "
You have received a new message from your website contact form.

Source Page: $source_page
Name: $first_name $last_name
Email: $email
Phone: $phone
Message:
$message
$broadband_details
";

$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";

if (mail($to, $subject, $body, $headers)) {
  echo "Thank you for contacting us!";
} else {
  echo "There was an error sending the email.";
}

$conn->close();
?>
