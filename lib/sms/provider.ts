import { normalizeIndianPhone } from "@/lib/security/phone";

export type SmsDeliveryResult = {
  delivered: boolean;
  provider?: "fast2sms" | "msg91" | "twilio" | "test_adapter";
  messageId?: string;
  error?: string;
};

export interface SmsOtpProviderAdapter {
  name: "fast2sms" | "msg91" | "twilio" | "test_adapter";
  sendOtp(phone10Digit: string, otpCode: string): Promise<SmsDeliveryResult>;
}

const PLACEHOLDER_PATTERNS = [
  "replace-with",
  "your-",
  "example",
  "placeholder",
  "test_key",
  "changeme",
];

function isRealCredential(value?: string | null): value is string {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 8) return false;
  const lower = trimmed.toLowerCase();
  return !PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"
  );
}

let customTestAdapter: SmsOtpProviderAdapter | null = null;

/**
 * Allows automated test suites (non-production only) to inject a controlled mock SMS adapter
 * to test OTP delivery success, provider failure, and concurrency without making live HTTP calls.
 * Strictly forbidden in production environments.
 */
export function setSmsProviderForTesting(adapter: SmsOtpProviderAdapter | null) {
  if (isProductionEnvironment() && adapter !== null) {
    throw new Error("SECURITY ERROR: Cannot inject test SMS adapter in production or preview environments.");
  }
  customTestAdapter = adapter;
}

/**
 * Fast2SMS (Indian DLT / OTP API) Adapter
 * Docs: https://docs.fast2sms.com
 */
class Fast2SmsAdapter implements SmsOtpProviderAdapter {
  name = "fast2sms" as const;
  constructor(
    private apiKey: string,
    private senderId?: string,
    private dltTemplateId?: string
  ) {}

  async sendOtp(phone10Digit: string, otpCode: string): Promise<SmsDeliveryResult> {
    try {
      const payload: Record<string, string> =
        this.senderId && this.dltTemplateId
          ? {
              route: "dlt",
              sender_id: this.senderId,
              message: this.dltTemplateId,
              variables_values: otpCode,
              numbers: phone10Digit,
            }
          : {
              route: "otp",
              variables_values: otpCode,
              numbers: phone10Digit,
            };

      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.return !== true) {
        return {
          delivered: false,
          provider: "fast2sms",
          error: "SMS gateway rejected the dispatch request.",
        };
      }

      return {
        delivered: true,
        provider: "fast2sms",
        messageId: typeof data.request_id === "string" ? data.request_id : undefined,
      };
    } catch {
      return {
        delivered: false,
        provider: "fast2sms",
        error: "SMS gateway network request failed or timed out.",
      };
    }
  }
}

/**
 * MSG91 (Indian DLT-compliant OTP API v5) Adapter
 * Docs: https://docs.msg91.com/reference/send-otp
 */
class Msg91Adapter implements SmsOtpProviderAdapter {
  name = "msg91" as const;
  constructor(
    private authKey: string,
    private templateId: string
  ) {}

  async sendOtp(phone10Digit: string, otpCode: string): Promise<SmsDeliveryResult> {
    try {
      const res = await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          authkey: this.authKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: this.templateId,
          mobile: `91${phone10Digit}`,
          otp: otpCode,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.type !== "success") {
        return {
          delivered: false,
          provider: "msg91",
          error: "MSG91 gateway rejected the dispatch request.",
        };
      }

      return {
        delivered: true,
        provider: "msg91",
        messageId: typeof data.request_id === "string" ? data.request_id : undefined,
      };
    } catch {
      return {
        delivered: false,
        provider: "msg91",
        error: "MSG91 gateway network request failed or timed out.",
      };
    }
  }
}

/**
 * Twilio Programmable Messaging REST Adapter
 */
class TwilioAdapter implements SmsOtpProviderAdapter {
  name = "twilio" as const;
  constructor(
    private accountSid: string,
    private authToken: string,
    private fromNumber: string
  ) {}

  async sendOtp(phone10Digit: string, otpCode: string): Promise<SmsDeliveryResult> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
        this.accountSid
      )}/Messages.json`;
      const body = new URLSearchParams({
        To: `+91${phone10Digit}`,
        From: this.fromNumber,
        Body: `Your Raj Shringaar verification code is ${otpCode}. Valid for 5 minutes. Do not share this code with anyone.`,
      });

      const basicAuth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        signal: AbortSignal.timeout(8000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.sid) {
        return {
          delivered: false,
          provider: "twilio",
          error: "Twilio SMS gateway rejected the dispatch request.",
        };
      }

      return {
        delivered: true,
        provider: "twilio",
        messageId: data.sid,
      };
    } catch {
      return {
        delivered: false,
        provider: "twilio",
        error: "Twilio SMS gateway network request failed or timed out.",
      };
    }
  }
}

/**
 * Resolves the configured real SMS OTP provider based on environment variables.
 * Returns null if no real provider credentials are configured.
 */
export function resolveSmsProvider(): SmsOtpProviderAdapter | null {
  if (customTestAdapter !== null && !isProductionEnvironment()) {
    return customTestAdapter;
  }

  const preferred = (process.env.SMS_OTP_PROVIDER || "").trim().toLowerCase();

  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  const msg91Key = process.env.MSG91_AUTH_KEY;
  const msg91Template = process.env.MSG91_TEMPLATE_ID;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;

  if (preferred === "msg91" || (!preferred && isRealCredential(msg91Key) && isRealCredential(msg91Template))) {
    if (isRealCredential(msg91Key) && isRealCredential(msg91Template)) {
      return new Msg91Adapter(msg91Key.trim(), msg91Template.trim());
    }
  }

  if (preferred === "fast2sms" || (!preferred && isRealCredential(fast2smsKey))) {
    if (isRealCredential(fast2smsKey)) {
      return new Fast2SmsAdapter(
        fast2smsKey.trim(),
        process.env.FAST2SMS_SENDER_ID?.trim(),
        process.env.FAST2SMS_TEMPLATE_ID?.trim()
      );
    }
  }

  if (
    preferred === "twilio" ||
    (!preferred && isRealCredential(twilioSid) && isRealCredential(twilioToken) && isRealCredential(twilioFrom))
  ) {
    if (isRealCredential(twilioSid) && isRealCredential(twilioToken) && isRealCredential(twilioFrom)) {
      return new TwilioAdapter(twilioSid.trim(), twilioToken.trim(), twilioFrom.trim());
    }
  }

  return null;
}

/**
 * Dispatches an OTP via the configured real SMS provider.
 *
 * Security invariants:
 * - Never simulates delivery in production.
 * - Never logs or returns the OTP value in responses or errors.
 * - Fails safely when credentials are absent or the upstream gateway errors.
 */
export async function sendMobileOtpSms(
  rawPhone: string,
  otpCode: string
): Promise<SmsDeliveryResult> {
  const normalizedPhone = normalizeIndianPhone(rawPhone);
  if (!normalizedPhone) {
    return {
      delivered: false,
      error: "Invalid Indian mobile number.",
    };
  }

  if (!/^\d{6}$/.test(otpCode)) {
    return {
      delivered: false,
      error: "Invalid OTP format.",
    };
  }

  const provider = resolveSmsProvider();
  if (!provider) {
    return {
      delivered: false,
      error: "SMS OTP provider credentials are not configured.",
    };
  }

  return await provider.sendOtp(normalizedPhone, otpCode);
}
