import { creditReportLinesOptions } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

interface ReportLine {
  id: string;
  category: string;
  description: string;
  amount_cents: number;
  status: "current" | "late" | "closed" | "disputed";
  created_at: string;
}

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

export function ReportPage() {
  const { t, lang } = useI18n();
  const { session, appUser, loading } = useAuth();
  const userId = appUser?.appUserId ?? "";

  const { data } = useQuery({
    ...creditReportLinesOptions(supabase, userId),
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

  const lines = (data ?? []) as unknown as ReportLine[];

  return (
    <section className="page">
      <h2 className="page-title">{t("report.title")}</h2>
      <p className="muted">{t("report.sub")}</p>

      {lines.length === 0 ? (
        <p className="muted empty-block">{t("report.empty")}</p>
      ) : (
        <ul className="report-list">
          {lines.map((line) => (
            <li key={line.id} className="report-row">
              <div className="report-main">
                <div className="report-cat">
                  {t(`report.category.${line.category}`) === `report.category.${line.category}`
                    ? line.category
                    : t(`report.category.${line.category}`)}
                </div>
                <div className="muted small">
                  {line.description || "—"} ·{" "}
                  {new Date(line.created_at).toLocaleDateString(lang)}
                </div>
              </div>
              <div className="report-end">
                <span className="report-amount">{formatCents(line.amount_cents)}</span>
                <span className={`status-chip line-${line.status}`}>
                  {t(`report.line.status.${line.status}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="muted small dispute-note">{t("report.disputeNote")}</p>
    </section>
  );
}
