import { createFileRoute } from "@tanstack/react-router";
import { ContactCard, InfoPage } from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/carrieres")({
  component: CarrieresPage,
});

function CarrieresPage() {
  const { t } = useI18n();
  return (
    <InfoPage kicker={t("career.kicker")} title={t("career.title")} subtitle={t("career.subtitle")}>
      <section className="py-16 px-6 bg-white">
        <p className="max-w-2xl mx-auto text-center text-sensei-muted text-lg leading-relaxed">
          {t("career.body")}
        </p>
      </section>
      <section className="py-16 px-6 bg-sensei-paper border-t border-sensei-line">
        <ContactCard
          title={t("career.contact.title")}
          body={t("career.contact.body")}
          email="carrieres@sensei.cd"
          cta={t("career.contact.cta")}
        />
      </section>
    </InfoPage>
  );
}
