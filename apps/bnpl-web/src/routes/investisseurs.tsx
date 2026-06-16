import { createFileRoute } from "@tanstack/react-router";
import { ContactCard, InfoPage } from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/investisseurs")({
  component: InvestisseursPage,
});

function InvestisseursPage() {
  const { t } = useI18n();
  return (
    <InfoPage kicker={t("inv.kicker")} title={t("inv.title")} subtitle={t("inv.subtitle")}>
      <section className="py-16 px-6 bg-white">
        <p className="max-w-2xl mx-auto text-center text-sensei-muted text-lg leading-relaxed">{t("inv.body")}</p>
      </section>
      <section className="py-16 px-6 bg-sensei-paper border-t border-sensei-line">
        <ContactCard
          title={t("inv.contact.title")}
          body={t("inv.contact.body")}
          email="investisseurs@sensei.cd"
          cta={t("inv.contact.cta")}
        />
      </section>
    </InfoPage>
  );
}
