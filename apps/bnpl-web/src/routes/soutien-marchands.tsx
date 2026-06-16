import { createFileRoute } from "@tanstack/react-router";
import { ContactCard, IconBolt, IconReceipt, IconShield, InfoCard, InfoPage } from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/soutien-marchands")({
  component: SoutienMarchandsPage,
});

const CARDS = [
  { key: "1", Icon: IconBolt },
  { key: "2", Icon: IconReceipt },
  { key: "3", Icon: IconShield },
] as const;

function SoutienMarchandsPage() {
  const { t } = useI18n();
  return (
    <InfoPage kicker={t("msup.kicker")} title={t("msup.title")} subtitle={t("msup.subtitle")}>
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(({ key, Icon }) => (
            <InfoCard key={key} icon={<Icon className="w-5 h-5" />} title={t(`msup.${key}.title`)} body={t(`msup.${key}.body`)} />
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-sensei-paper border-t border-sensei-line">
        <ContactCard
          title={t("msup.contact.title")}
          body={t("msup.contact.body")}
          email="marchands@sensei.cd"
          cta={t("msup.contact.cta")}
        />
      </section>
    </InfoPage>
  );
}
