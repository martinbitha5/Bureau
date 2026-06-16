import { createFileRoute } from "@tanstack/react-router";
import { ContactCard, InfoPage } from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/presse")({
  component: PressePage,
});

function PressePage() {
  const { t } = useI18n();
  return (
    <InfoPage kicker={t("press.kicker")} title={t("press.title")} subtitle={t("press.subtitle")}>
      <section className="py-16 px-6 bg-white">
        <p className="max-w-2xl mx-auto text-center text-sensei-muted text-lg leading-relaxed">{t("press.body")}</p>
      </section>
      <section className="py-16 px-6 bg-sensei-paper border-t border-sensei-line">
        <ContactCard
          title={t("press.contact.title")}
          body={t("press.contact.body")}
          email="presse@sensei.cd"
          cta={t("press.contact.cta")}
        />
      </section>
    </InfoPage>
  );
}
