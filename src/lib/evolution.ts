export async function checkWhatsappExists(numero: string): Promise<boolean> {
  const url = `${process.env.EVO_URL}/chat/whatsappNumbers/${process.env.EVO_INSTANCE_NAME}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.EVO_API_KEY ?? "",
    },
    body: JSON.stringify({ numbers: [numero] }),
  });

  if (!res.ok) {
    throw new Error(`Evolution API respondeu ${res.status}`);
  }

  const data = await res.json();
  return Boolean(data?.[0]?.exists);
}
