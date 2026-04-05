import Twilio from "twilio";

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// ─── Regulations ────────────────────────────────────────────
export async function listRegulations(params: {
  isoCountry?: string;
  numberType?: string;
  endUserType?: string;
}) {
  const filters: any = {};
  if (params.isoCountry) filters.isoCountry = params.isoCountry;
  if (params.numberType) filters.numberType = params.numberType;
  if (params.endUserType) filters.endUserType = params.endUserType;
  return client.numbers.v2.regulatoryCompliance.regulations.list(filters);
}

export async function getRegulation(sid: string) {
  return client.numbers.v2.regulatoryCompliance.regulations(sid).fetch();
}

// ─── End-User Types ─────────────────────────────────────────
export async function listEndUserTypes() {
  return client.numbers.v2.regulatoryCompliance.endUserTypes.list();
}

// ─── Supporting Document Types ──────────────────────────────
export async function listSupportingDocumentTypes() {
  return client.numbers.v2.regulatoryCompliance.supportingDocumentTypes.list();
}

// ─── End-Users ──────────────────────────────────────────────
export async function createEndUser(params: {
  friendlyName: string;
  type: string;
  attributes: Record<string, string>;
}) {
  return client.numbers.v2.regulatoryCompliance.endUsers.create({
    friendlyName: params.friendlyName,
    type: params.type as any,
    attributes: params.attributes,
  });
}

export async function listEndUsers() {
  return client.numbers.v2.regulatoryCompliance.endUsers.list();
}

export async function getEndUser(sid: string) {
  return client.numbers.v2.regulatoryCompliance.endUsers(sid).fetch();
}

export async function updateEndUser(
  sid: string,
  params: { friendlyName?: string; attributes?: Record<string, string> }
) {
  return client.numbers.v2.regulatoryCompliance.endUsers(sid).update(params);
}

export async function deleteEndUser(sid: string) {
  return client.numbers.v2.regulatoryCompliance.endUsers(sid).remove();
}

// ─── Supporting Documents ───────────────────────────────────
export async function createSupportingDocument(params: {
  friendlyName: string;
  type: string;
  attributes: Record<string, string>;
}) {
  return client.numbers.v2.regulatoryCompliance.supportingDocuments.create({
    friendlyName: params.friendlyName,
    type: params.type,
    attributes: params.attributes,
  });
}

export async function listSupportingDocuments() {
  return client.numbers.v2.regulatoryCompliance.supportingDocuments.list();
}

export async function getSupportingDocument(sid: string) {
  return client.numbers.v2.regulatoryCompliance.supportingDocuments(sid).fetch();
}

export async function updateSupportingDocument(
  sid: string,
  params: { friendlyName?: string; attributes?: Record<string, string> }
) {
  return client.numbers.v2.regulatoryCompliance
    .supportingDocuments(sid)
    .update(params);
}

// Upload file to a supporting document via Twilio REST API (multipart)
export async function uploadFileToDocument(
  sid: string,
  filePath: string,
  attributes?: Record<string, string>
) {
  const fs = await import("fs");
  const FormData = (await import("form-data")).default;

  const form = new FormData();
  form.append("File", fs.createReadStream(filePath));
  if (attributes) {
    form.append("Attributes", JSON.stringify(attributes));
  }

  const url = `https://numbers.twilio.com/v2/RegulatoryCompliance/SupportingDocuments/${sid}`;
  const auth = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  ).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      ...form.getHeaders(),
    },
    body: form as any,
  });

  return response.json();
}

export async function deleteSupportingDocument(sid: string) {
  return client.numbers.v2.regulatoryCompliance.supportingDocuments(sid).remove();
}

// ─── Bundles ────────────────────────────────────────────────
export async function createBundle(params: {
  friendlyName: string;
  email: string;
  isoCountry: string;
  numberType?: string;
  endUserType?: string;
  regulationSid?: string;
}) {
  return client.numbers.v2.regulatoryCompliance.bundles.create({
    friendlyName: params.friendlyName,
    email: params.email,
    isoCountry: params.isoCountry,
    numberType: params.numberType,
    endUserType: params.endUserType as any,
    regulationSid: params.regulationSid,
    statusCallback: undefined,
  });
}

export async function listBundles() {
  return client.numbers.v2.regulatoryCompliance.bundles.list();
}

export async function getBundle(sid: string) {
  return client.numbers.v2.regulatoryCompliance.bundles(sid).fetch();
}

export async function submitBundle(sid: string) {
  return client.numbers.v2.regulatoryCompliance.bundles(sid).update({
    status: "pending-review",
  });
}

export async function deleteBundle(sid: string) {
  return client.numbers.v2.regulatoryCompliance.bundles(sid).remove();
}

// ─── Item Assignments ───────────────────────────────────────
export async function assignItemToBundle(
  bundleSid: string,
  objectSid: string
) {
  return client.numbers.v2.regulatoryCompliance
    .bundles(bundleSid)
    .itemAssignments.create({ objectSid });
}

export async function listBundleItemAssignments(bundleSid: string) {
  return client.numbers.v2.regulatoryCompliance
    .bundles(bundleSid)
    .itemAssignments.list();
}

export async function removeBundleItemAssignment(
  bundleSid: string,
  assignmentSid: string
) {
  return client.numbers.v2.regulatoryCompliance
    .bundles(bundleSid)
    .itemAssignments(assignmentSid)
    .remove();
}

// ─── Evaluations ────────────────────────────────────────────
export async function createEvaluation(bundleSid: string) {
  return client.numbers.v2.regulatoryCompliance
    .bundles(bundleSid)
    .evaluations.create();
}

export async function listEvaluations(bundleSid: string) {
  return client.numbers.v2.regulatoryCompliance
    .bundles(bundleSid)
    .evaluations.list();
}
