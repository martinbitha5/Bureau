import { consentsOptions, identitiesOptions } from "@sensei/api-client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

interface Consent {
  id: string;
  scope: string;
  granted_to: string | null;
  is_active: boolean;
  granted_at: string;
  revoked_at: string | null;
}
interface Identity {
  id: string;
  id_type: string;
  id_number: string;
  verified_at: string | null;
  created_at: string;
}

export function ConsentPage() {
  const { t, lang } = useI18n();
  const { session, appUser, loading } = useAuth();
  const userId = appUser?.appUserId ?? "";

  const { data: consentsData } = useQuery({
    ...consentsOptions(supabase, userId),
    enabled: !!userId,
  });
  const { data: identitiesData } = useQuery({
    ...identitiesOptions(supabase, userId),
    enabled: !!userId,
  });

  if (loading) return <p className="muted">{t("common.loading")}</p>;
  if (!session) {
    return (
      <section className="empty-state">
        <p className="muted">{t("auth.required")}</p>
        <Link to="/login" className="btn-primary">
          {t("auth.login")}
        </Link>
      </section>
    );
  }

  const consents = (consentsData ?? []) as unknown as Consent[];
  const identities = (identitiesData ?? []) as unknown as Identity[];
  const verified = identities.find((i) => i.verified_at);
  const pending = identities.find((i) => !i.verified_at);

  return (
    <section className="page">
      <h2 className="page-title">{t("consent.title")}</h2>
      <p className="muted">{t("consent.sub")}</p>

      {/* KYC */}
      <h3 className="section-title">{t("consent.kyc.title")}</h3>
      <div className="kyc-card">
        {verified ? (
          <div className="kyc-status verified">
            <span className="kyc-dot" /> {t("consent.kyc.verified")}
            <span className="muted small">
              · {t(`consent.idtype.${verified.id_type}`)} ••••{verified.id_number.slice(-4)}
            </span>
          </div>
        ) : pending ? (
          <div className="kyc-status pending">
            <span className="kyc-dot" /> {t("consent.kyc.pending")}
            <span className="muted small">· {t(`consent.idtype.${pending.id_type}`)}</span>
          </div>
        ) : (
          <div className="kyc-status none">
            <span className="kyc-dot" /> {t("consent.kyc.none")}
          </div>
        )}
        <p className="muted small">{t("consent.kyc.body")}</p>
      </div>

      {/* Consents */}
      <h3 className="section-title">{t("consent.list.title")}</h3>
      {consents.length === 0 ? (
        <p className="muted empty-block">{t("consent.empty")}</p>
      ) : (
        <ul className="consent-list">
          {consents.map((c) => (
            <li key={c.id} className="consent-row">
              <div>
                <div className="consent-scope">{t(`consent.scope.${c.scope}`)}</div>
                <div className="muted small">
                  {t("consent.grantedOn")} {new Date(c.granted_at).toLocaleDateString(lang)}
                </div>
              </div>
              <div className="consent-end">
                <span className={c.is_active ? "status-chip line-current" : "status-chip line-closed"}>
                  {c.is_active ? t("consent.active") : t("consent.revoked")}
                </span>
                {c.is_active && (
                  <button type="button" className="btn-ghost sm" disabled>
                    {t("consent.revoke")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
