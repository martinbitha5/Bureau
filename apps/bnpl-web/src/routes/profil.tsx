import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";
import {
  AppContainer,
  Badge,
  Card,
  IconGlobe,
  IconLock,
  IconPlane,
  PageHeader,
  cx,
} from "../components";
import { useI18n } from "../i18n";
import { RequireAuth } from "../components/RequireAuth";

// ── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/profil")({
  component: () => (
    <RequireAuth>
      <ProfilPage />
    </RequireAuth>
  ),
});

// ── Sous-composants utilitaires ───────────────────────────────────────────────

/** En-tête de section à l'intérieur d'une Card. */
function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-4">
      {children}
    </p>
  );
}

/** Ligne label / valeur (lecture seule). */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-sensei-line last:border-b-0">
      <dt className="text-sm text-sensei-muted shrink-0 w-32">{label}</dt>
      <dd className="text-sm font-medium text-sensei-ink text-right break-all">{value}</dd>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

function ProfilPage() {
  const { t, lang, setLang } = useI18n();
  const { session, appUser, signOut } = useAuth();
  const navigate = useNavigate();

  const email = session?.user?.email ?? "—";
  const fullName = appUser?.fullName ?? "—";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <AppContainer>
      {/* En-tête ── */}
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <div className="flex flex-col gap-5">

        {/* ── Informations personnelles ── */}
        <Card as="section" className="p-6">
          <SectionTitle>{t("profile.personal")}</SectionTitle>
          <dl>
            <InfoRow label={t("profile.fullName")} value={fullName} />
            <InfoRow label={t("profile.email")} value={email} />
            <InfoRow label={t("profile.phone")} value="—" />
          </dl>
        </Card>

        {/* ── Langue ── */}
        <Card as="section" className="p-6">
          <SectionTitle>{t("profile.language")}</SectionTitle>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={cx(
                "px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                lang === "fr"
                  ? "bg-sensei-bright text-white border-sensei-bright shadow-sm"
                  : "bg-white text-sensei-muted border-sensei-line hover:border-sensei-bright hover:text-sensei-bright",
              )}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cx(
                "px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                lang === "en"
                  ? "bg-sensei-bright text-white border-sensei-bright shadow-sm"
                  : "bg-white text-sensei-muted border-sensei-line hover:border-sensei-bright hover:text-sensei-bright",
              )}
            >
              EN
            </button>
          </div>
        </Card>

        {/* ── KYC ── */}
        <Card as="section" className="p-6">
          <SectionTitle>{t("profile.kyc")}</SectionTitle>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-sensei-muted">{t("profile.kycStatus")}</span>
            <Badge tone="warn">{t("profile.kyc.unverified")}</Badge>
          </div>
          <p className="text-sm text-sensei-muted mb-5 leading-relaxed max-w-prose">
            {t("profile.kycBody")}
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-5 py-3 bg-sensei-bright text-white text-sm font-bold rounded-xl hover:bg-sensei-blue transition-all shadow-sm"
          >
            {t("profile.kycVerify")}
          </a>
        </Card>

        {/* ── Écosystème ── */}
        <Card as="section" className="p-6">
          <SectionTitle>{t("profile.ecosystem")}</SectionTitle>
          <p className="text-sm text-sensei-muted mb-5 leading-relaxed max-w-prose">
            {t("profile.ecosystemBody")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-3 border border-sensei-line bg-white text-sensei-ink text-sm font-semibold rounded-xl hover:border-sensei-bright hover:text-sensei-bright transition-all"
            >
              <IconGlobe className="w-4 h-4 flex-shrink-0" />
              {t("profile.creditLink")}
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-3 border border-sensei-line bg-white text-sensei-ink text-sm font-semibold rounded-xl hover:border-sensei-bright hover:text-sensei-bright transition-all"
            >
              <IconPlane className="w-4 h-4 flex-shrink-0" />
              {t("profile.flightsLink")}
            </a>
          </div>
        </Card>

        {/* ── Sécurité ── */}
        <Card as="section" className="p-6">
          <SectionTitle>{t("profile.security")}</SectionTitle>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-5 py-3 border border-sensei-line bg-white text-sensei-ink text-sm font-semibold rounded-xl hover:border-sensei-bright hover:text-sensei-bright transition-all"
          >
            <IconLock className="w-4 h-4 flex-shrink-0" />
            {t("profile.changePassword")}
          </a>
        </Card>

        {/* ── Déconnexion ── */}
        <div className="pt-2 pb-8">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-5 py-3 border border-sensei-danger/40 text-sensei-danger bg-white text-sm font-semibold rounded-xl hover:bg-sensei-danger/5 hover:border-sensei-danger transition-all"
          >
            {t("profile.signOut")}
          </button>
        </div>

      </div>
    </AppContainer>
  );
}
