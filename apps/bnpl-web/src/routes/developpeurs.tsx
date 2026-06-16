import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Badge,
  Card,
  CodeBlock,
  ContactCard,
  IconArrowRight,
  IconBolt,
  IconCard,
  InfoCard,
  InfoNote,
  InfoPage,
  IconStore,
  cx,
} from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/developpeurs")({
  component: DeveloppeursPage,
});

const CARDS = [
  { key: "1", Icon: IconCard },
  { key: "2", Icon: IconBolt },
  { key: "3", Icon: IconStore },
] as const;

const NAV_LINKS = [
  { href: "#start", key: "start" },
  { href: "#api", key: "api" },
  { href: "#webhooks", key: "webhooks" },
  { href: "#examples", key: "examples" },
] as const;

const STEPS = [
  {
    n: 1,
    key: "1",
    code: null,
  },
  {
    n: 2,
    key: "2",
    code: `<script src="https://cdn.sensei.cd/v1/sensei.js"></script>
<script>
  Sensei.init({ publicKey: 'pk_live_xxx' });
</script>`,
  },
  {
    n: 3,
    key: "3",
    code: `document.getElementById('pay-btn').addEventListener('click', () => {
  Sensei.checkout({
    amount: 15000,          // centimes USD
    currency: 'USD',
    orderId: 'ORDER-001',
    returnUrl: 'https://monsite.cd/merci',
    cancelUrl: 'https://monsite.cd/annule',
  });
});`,
  },
  {
    n: 4,
    key: "4",
    code: `curl -X POST https://api.sensei.cd/functions/v1/merchant-authorize \\
  -H "Content-Type: application/json" \\
  -d '{
    "secretKey": "sk_live_xxx",
    "checkoutToken": "a1b2c3...",
    "orderId": "ORDER-001"
  }'`,
  },
] as const;

const ENDPOINTS = [
  {
    key: "checkout",
    method: "POST",
    path: "/merchant-checkout",
    auth: "public" as const,
    request: `{
  "publicKey": "pk_live_xxx",
  "amount": 15000,
  "currency": "USD",
  "orderId": "ORDER-001",
  "returnUrl": "https://monsite.cd/merci",
  "cancelUrl": "https://monsite.cd/annule"
}`,
    response: `{
  "checkoutToken": "a1b2c3...",
  "checkoutUrl": "https://pay.sensei.cd/checkout?token=a1b2c3...",
  "sessionId": "8f0e...",
  "expiresIn": 86400
}`,
  },
  {
    key: "authorize",
    method: "POST",
    path: "/merchant-authorize",
    auth: "secret" as const,
    request: `{
  "secretKey": "sk_live_xxx",
  "checkoutToken": "a1b2c3...",
  "orderId": "ORDER-001"
}`,
    response: `{
  "transactionId": "9c1d...",
  "status": "authorized",
  "amountCents": 15000,
  "currency": "USD",
  "planId": "5e2f..."
}`,
  },
  {
    key: "capture",
    method: "POST",
    path: "/merchant-capture",
    auth: "secret" as const,
    request: `{
  "secretKey": "sk_live_xxx",
  "transactionId": "9c1d..."
}`,
    response: `{
  "transactionId": "9c1d...",
  "status": "captured"
}`,
  },
  {
    key: "void",
    method: "POST",
    path: "/merchant-void",
    auth: "secret" as const,
    request: `{
  "secretKey": "sk_live_xxx",
  "transactionId": "9c1d..."
}`,
    response: `{
  "transactionId": "9c1d...",
  "status": "voided"
}`,
  },
  {
    key: "refund",
    method: "POST",
    path: "/merchant-refund",
    auth: "secret" as const,
    request: `{
  "secretKey": "sk_live_xxx",
  "transactionId": "9c1d...",
  "amountCents": 15000
}`,
    response: `{
  "transactionId": "9c1d...",
  "status": "refunded",
  "amountRefunded": 15000,
  "isPartial": false
}`,
  },
] as const;

const WEBHOOK_EVENTS = [
  { type: "CHECKOUT.AUTHORIZED", key: "checkoutAuthorized" },
  { type: "PAYMENT.CAPTURED", key: "paymentCaptured" },
  { type: "PAYMENT.VOIDED", key: "paymentVoided" },
  { type: "PAYMENT.REFUNDED", key: "paymentRefunded" },
] as const;

const VERIFY_SNIPPET = `import crypto from "node:crypto";

function isValidSignature(rawBody, signatureHeader, webhookSecret) {
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");
  return signatureHeader === \`sha256=\${expected}\`;
}`;

const EXAMPLE_LANGS = [
  { key: "js", label: "JavaScript" },
  { key: "curl", label: "cURL" },
  { key: "python", label: "Python" },
] as const;
type ExampleLang = (typeof EXAMPLE_LANGS)[number]["key"];

const EXAMPLES: Record<ExampleLang, string> = {
  js: `<script src="https://cdn.sensei.cd/v1/sensei.js"></script>
<script>
  Sensei.init({ publicKey: 'pk_live_xxx' });

  document.getElementById('pay-btn').addEventListener('click', () => {
    Sensei.checkout({
      amount: 15000,
      currency: 'USD',
      orderId: 'ORDER-001',
      returnUrl: 'https://monsite.cd/merci',
      cancelUrl: 'https://monsite.cd/annule',
    });
  });
</script>`,
  curl: `curl -X POST https://api.sensei.cd/functions/v1/merchant-checkout \\
  -H "Content-Type: application/json" \\
  -d '{
    "publicKey": "pk_live_xxx",
    "amount": 15000,
    "currency": "USD",
    "orderId": "ORDER-001",
    "returnUrl": "https://monsite.cd/merci",
    "cancelUrl": "https://monsite.cd/annule"
  }'`,
  python: `import requests

resp = requests.post(
    "https://api.sensei.cd/functions/v1/merchant-checkout",
    json={
        "publicKey": "pk_live_xxx",
        "amount": 15000,
        "currency": "USD",
        "orderId": "ORDER-001",
        "returnUrl": "https://monsite.cd/merci",
        "cancelUrl": "https://monsite.cd/annule",
    },
)
checkout_url = resp.json()["checkoutUrl"]`,
};

function StepRow({ n, title, body, code }: { n: number; title: string; body: string; code: string | null }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-sensei-bright text-white font-bold flex items-center justify-center text-sm">
        {n}
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <h3 className="text-lg font-semibold text-sensei-ink mb-1.5">{title}</h3>
        <p className="text-sensei-muted text-[15px] leading-relaxed mb-3 max-w-[60ch]">{body}</p>
        {code && <CodeBlock code={code} />}
      </div>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  authLabel,
  authTone,
  desc,
  request,
  response,
  requestLabel,
  responseLabel,
}: {
  method: string;
  path: string;
  authLabel: string;
  authTone: "bright" | "warn";
  desc: string;
  request: string;
  response: string;
  requestLabel: string;
  responseLabel: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-sensei-trust/10 text-sensei-trust tracking-wide">
          {method}
        </span>
        <code className="text-sm font-mono font-semibold text-sensei-ink">{path}</code>
        <Badge tone={authTone}>{authLabel}</Badge>
      </div>
      <p className="text-sensei-muted text-sm mb-4 max-w-[70ch]">{desc}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-1.5">
            {requestLabel}
          </p>
          <CodeBlock code={request} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-1.5">
            {responseLabel}
          </p>
          <CodeBlock code={response} />
        </div>
      </div>
    </Card>
  );
}

function DeveloppeursPage() {
  const { t } = useI18n();
  const [exampleLang, setExampleLang] = useState<ExampleLang>("js");

  return (
    <InfoPage kicker={t("dev.kicker")} title={t("dev.title")} subtitle={t("dev.subtitle")}>
      {/* CTA + navigation in-page */}
      <section className="pt-2 pb-14 px-6 bg-white text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-9">
          <Link
            to="/merchant"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-sensei-bright text-white font-bold rounded-full hover:bg-sensei-blue transition-all shadow-lg shadow-sensei-bright/25 text-sm"
          >
            {t("dev.cta.primary")} <IconArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#api"
            className="inline-flex items-center gap-2 px-6 py-3.5 border border-sensei-line text-sensei-text font-semibold rounded-full hover:bg-sensei-paper transition-all text-sm"
          >
            {t("dev.cta.secondary")}
          </a>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-2">
          {NAV_LINKS.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="px-4 py-1.5 rounded-full text-sm font-semibold bg-sensei-paper border border-sensei-line text-sensei-muted hover:border-sensei-bright/40 hover:text-sensei-ink transition-all"
            >
              {t(`dev.nav.${key}`)}
            </a>
          ))}
        </nav>
      </section>

      {/* 3 cartes */}
      <section className="pb-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(({ key, Icon }) => (
            <InfoCard
              key={key}
              icon={<Icon className="w-5 h-5" />}
              title={t(`dev.${key}.title`)}
              body={t(`dev.${key}.body`)}
            />
          ))}
        </div>
      </section>

      {/* Démarrage en 4 étapes */}
      <section id="start" className="py-20 px-6 bg-sensei-paper border-y border-sensei-line scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight mb-3">
              {t("dev.start.title")}
            </h2>
            <p className="text-sensei-muted text-lg">{t("dev.start.subtitle")}</p>
          </div>
          <div className="flex flex-col gap-9">
            {STEPS.map((s) => (
              <StepRow
                key={s.key}
                n={s.n}
                title={t(`dev.start.${s.key}.title`)}
                body={t(`dev.start.${s.key}.body`)}
                code={s.code}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Référence API */}
      <section id="api" className="py-20 px-6 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight mb-3">
              {t("dev.api.title")}
            </h2>
            <p className="text-sensei-muted text-lg">{t("dev.api.subtitle")}</p>
          </div>
          <div className="flex flex-col gap-5">
            {ENDPOINTS.map((e) => (
              <EndpointCard
                key={e.key}
                method={e.method}
                path={e.path}
                authLabel={e.auth === "secret" ? t("dev.api.auth.secret") : t("dev.api.auth.public")}
                authTone={e.auth === "secret" ? "warn" : "bright"}
                desc={t(`dev.api.${e.key}.desc`)}
                request={e.request}
                response={e.response}
                requestLabel={t("dev.api.field.request")}
                responseLabel={t("dev.api.field.response")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section id="webhooks" className="py-20 px-6 bg-sensei-paper border-y border-sensei-line scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight mb-3">
              {t("dev.webhooks.title")}
            </h2>
            <p className="text-sensei-muted text-lg">{t("dev.webhooks.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {WEBHOOK_EVENTS.map(({ type, key }) => (
              <div key={type} className="bg-white border border-sensei-line rounded-xl px-4 py-3.5">
                <p className="text-xs font-mono font-bold text-sensei-ink">{type}</p>
                <p className="text-xs text-sensei-muted mt-1">{t(`dev.webhooks.events.${key}`)}</p>
              </div>
            ))}
          </div>

          <Card className="p-6">
            <p className="text-sm font-bold text-sensei-ink mb-1.5">{t("dev.webhooks.verify.title")}</p>
            <p className="text-sensei-muted text-sm mb-4 max-w-[70ch]">{t("dev.webhooks.verify.body")}</p>
            <CodeBlock code={VERIFY_SNIPPET} />
          </Card>
        </div>
      </section>

      {/* Exemples de code */}
      <section id="examples" className="py-20 px-6 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight mb-3">
              {t("dev.examples.title")}
            </h2>
            <p className="text-sensei-muted text-lg">{t("dev.examples.subtitle")}</p>
          </div>

          <div className="flex justify-center gap-2 mb-5">
            {EXAMPLE_LANGS.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setExampleLang(l.key)}
                className={cx(
                  "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                  exampleLang === l.key
                    ? "bg-sensei-bright text-white"
                    : "bg-white border border-sensei-line text-sensei-muted hover:border-sensei-bright/40",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          <CodeBlock code={EXAMPLES[exampleLang]} />
        </div>
      </section>

      {/* Environnement actuel */}
      <section className="py-14 px-6 bg-sensei-paper border-y border-sensei-line">
        <div className="max-w-3xl mx-auto">
          <InfoNote>
            <strong className="text-sensei-ink">{t("dev.env.title")} — </strong>
            {t("dev.env.note")}
          </InfoNote>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 bg-white">
        <ContactCard
          title={t("dev.contact.title")}
          body={t("dev.contact.body")}
          email="dev@sensei.cd"
          cta={t("dev.contact.cta")}
        />
      </section>
    </InfoPage>
  );
}
