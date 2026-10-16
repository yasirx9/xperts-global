function normalizeBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    var params = new URLSearchParams(req.body);
    return Object.fromEntries(params.entries());
  }

  return {};
}

async function postToErpnext(doctype, data, env) {
  if (!env.ERPNEXT_API_KEY || !env.ERPNEXT_API_SECRET) {
    return null;
  }

  var endpoint = String(env.ERPNEXT_URL || "https://btm.digihoopoe.com").replace(/\/$/, "") + "/api/resource/" + encodeURIComponent(doctype);

  var response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: "token " + env.ERPNEXT_API_KEY + ":" + env.ERPNEXT_API_SECRET,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    var failedBody = await response.text();
    throw new Error("ERPNext " + doctype + " failed: " + response.status + " " + failedBody);
  }

  return response.json();
}

async function sendEmailViaResend(payload, env) {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    return;
  }

  var response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    var failedBody = await response.text();
    throw new Error("Resend email failed: " + response.status + " " + failedBody);
  }
}

function toYesNo(value) {
  return value ? "yes" : "no";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  try {
    var body = normalizeBody(req);

    if (body.website) {
      return res.status(200).send("Thank you for contacting us!");
    }

    var sourcePage = String(body.source_page || "Contact Page").trim();
    var fullName = String(body.full_name || "").trim();
    var firstName = String(body.first_name || "").trim();
    var lastName = String(body.last_name || "").trim();
    var email = String(body.email || "").trim();
    var phone = String(body.phone || "").trim();
    var message = String(body.message || "").trim();
    var zipCode = String(body.zip_code || "").trim();
    var address = String(body.address || "").trim();
    var selectedService = String(body.selected_service || "").trim();
    var selectedPlan = String(body.selected_plan || "").trim();
    var tcpaConsent1 = toYesNo(body.tcpa_consent_1);
    var tcpaConsent2 = toYesNo(body.tcpa_consent_2);
    var tcpaConsent3 = toYesNo(body.tcpa_consent_3);

    if (fullName && !firstName && !lastName) {
      var parts = fullName.split(/\s+/, 2);
      firstName = parts[0] || "";
      lastName = parts[1] || "";
    }

    if (!email || !firstName && !fullName) {
      return res.status(400).send("Please provide your name and email.");
    }

    var broadbandDetails = "";
    if (sourcePage === "Broadband Service Page") {
      broadbandDetails = [
        "",
        "Broadband Lead Details",
        "Source Page: " + sourcePage,
        "Selected Plan: " + selectedPlan,
        "Zip Code: " + zipCode,
        "Address: " + address,
        "Selected Service: " + selectedService,
        "TCPA Consent 1: " + tcpaConsent1,
        "TCPA Consent 2: " + tcpaConsent2,
        "TCPA Consent 3: " + tcpaConsent3
      ].join("\n");
    }

    var combinedMessage = (message + "\n" + broadbandDetails).trim();
    var leadName = (firstName + " " + lastName).trim() || email;

    var leadResponse = await postToErpnext("Lead", {
      lead_name: leadName,
      first_name: firstName,
      last_name: lastName,
      email_id: email,
      mobile_no: phone,
      whatsapp_no: phone,
      phone: phone,
      status: "Lead",
      source: "Website",
      type: "Client",
      request_type: sourcePage === "Broadband Service Page" ? "Product Enquiry" : "Request for Information",
      lead_owner: process.env.ERPNEXT_LEAD_OWNER || "omar@xperts-global.com",
      company_name: "Xperts Global Website Lead"
    }, process.env);

    var leadId = leadResponse && leadResponse.data && leadResponse.data.name ? leadResponse.data.name : "";

    if (leadId && combinedMessage) {
      await postToErpnext("Comment", {
        comment_type: "Comment",
        reference_doctype: "Lead",
        reference_name: leadId,
        comment_email: email,
        comment_by: leadName,
        subject: sourcePage + " Message",
        content: combinedMessage.replace(/\n/g, "<br>")
      }, process.env);
    }

    if (leadId && address) {
      await postToErpnext("Address", {
        address_title: leadName || "Website Lead",
        address_type: "Billing",
        address_line1: address,
        city: zipCode || "Unknown",
        country: "United States",
        pincode: zipCode,
        phone: phone,
        email_id: email,
        links: [
          {
            link_doctype: "Lead",
            link_name: leadId
          }
        ]
      }, process.env);
    }

    await sendEmailViaResend({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: "New Website Lead Submission",
      text: [
        "You have received a new message from your website contact form.",
        "",
        "Source Page: " + sourcePage,
        "Name: " + ((firstName + " " + lastName).trim() || fullName),
        "Email: " + email,
        "Phone: " + phone,
        "Message:",
        message,
        broadbandDetails
      ].join("\n")
    }, process.env);

    return res.status(200).send("Thank you for contacting us!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("There was an error sending the message.");
  }
};