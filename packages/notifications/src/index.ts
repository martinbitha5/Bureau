/**
 * Point d'envoi unique SMS / push / email (docs/INTEGRATIONS.md §6).
 * Le reste de l'écosystème ne connaît que `Notifier`. V1 = `MockNotifier`.
 */

export interface SmsMessage {
  to: string; // E.164
  body: string;
}

export interface Notifier {
  readonly name: string;
  sendSms(msg: SmsMessage): Promise<{ status: "sent" | "failed"; providerRef?: string }>;
}

export class MockNotifier implements Notifier {
  readonly name = "mock";
  public readonly outbox: SmsMessage[] = [];

  async sendSms(msg: SmsMessage): Promise<{ status: "sent"; providerRef: string }> {
    this.outbox.push(msg);
    return { status: "sent", providerRef: `mock_sms_${this.outbox.length}` };
  }
}
