//------------------------------------------------------------------------------
// Mailto
//------------------------------------------------------------------------------

export function createMailtoUrl({
  bcc,
  body,
  subject,
}: {
  bcc?: string[];
  body?: string;
  subject?: string;
}) {
  const params = new URLSearchParams();

  if (bcc && bcc.length > 0) params.set("bcc", bcc.join(","));
  if (body) params.set("body", body);
  if (subject) params.set("subject", subject);

  return `mailto:?${params.toString()}`;
}
