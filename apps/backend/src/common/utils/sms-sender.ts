import "dotenv/config";
import axios from "axios";

type Cfg = { SMS_URL: string; SMS_TOKEN: string; SMS_SENDER: string };
type SendInput = { recipient: string; messageBody: string };
type SendResult = {
  ok: boolean;
  status: number;
  messageId?: string;
  error?: string;
  raw?: any;
};

const cfgFrom = (o?: Partial<Cfg>): Cfg => {
  const g = (global as any)?._CONFIG?._VALS ?? {};
  const cfg: Cfg = {
    SMS_URL: o?.SMS_URL ?? process.env.SMS_URL ?? g.SMS_URL ?? "",
    SMS_TOKEN: o?.SMS_TOKEN ?? process.env.SMS_TOKEN ?? g.SMS_TOKEN ?? "",
    SMS_SENDER: o?.SMS_SENDER ?? process.env.SMS_SENDER ?? g.SMS_SENDER ?? "",
  };
  if (!cfg.SMS_URL || !cfg.SMS_TOKEN)
    throw new Error("Missing SMS_URL/SMS_TOKEN");
  return cfg;
};

export const sendSMS = async (
  p: SendInput,
  override?: Partial<Cfg>,
): Promise<SendResult> => {
  try {
    const c = cfgFrom(override);
    const form = new URLSearchParams();
    form.set("token", c.SMS_TOKEN);
    form.set("phone", p.recipient.replace(/^\+/, ""));
    form.set("msg", p.messageBody);
    if (c.SMS_SENDER) form.set("shortcode_id", c.SMS_SENDER);

    const resp = await axios.post(c.SMS_URL, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = resp.data;
    const ok =
      resp.status >= 200 &&
      resp.status < 300 &&
      (data?.acknowledge === "success" ||
        data?.status === "success" ||
        data?.success === true ||
        data?.code === "success");
    const messageId =
      data?.response?.message_id ?? data?.message_id ?? data?.id;

    if (ok) return { ok: true, status: resp.status, messageId, raw: data };

    const err = data?.response?.errors || data?.error || data?.message || "SMS Not Sent";
    return { ok: false, status: resp.status, error: String(err), raw: data };
  } catch (e: any) {
    console.log("error sms sending error", e?.message || e);
    return {
      ok: false,
      status: 500,
      error: e?.message || "Failed to send SMS",
    };
  }
};
