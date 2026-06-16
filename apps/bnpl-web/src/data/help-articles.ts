// Données statiques du centre d'aide Sensei Pay.
// Toutes les clés de traduction vivent ici (titre, paragraphes, tag).

export type HelpLang = "fr" | "en";

export interface HelpArticle {
  slug: string;
  category: string;
  tag: { fr: string; en: string };
  related: string[];
  fr: { title: string; paras: string[] };
  en: { title: string; paras: string[] };
}

export interface HelpSection {
  fr: string;
  en: string;
  articles: string[]; // slugs
}

export interface HelpCategory {
  slug: string;
  fr: string;
  en: string;
  sections: HelpSection[];
}

// ── Catégories ────────────────────────────────────────────────────────────────

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: "a-propos",
    fr: "À propos de Sensei Pay",
    en: "About Sensei Pay",
    sections: [
      {
        fr: "Comment ça fonctionne",
        en: "How it works",
        articles: ["comment-ca-marche", "prequalification", "conditions-utilisation"],
      },
      {
        fr: "Pour commencer",
        en: "Get started",
        articles: ["creer-compte", "nous-joindre"],
      },
    ],
  },
  {
    slug: "compte-paiements",
    fr: "Compte et paiements",
    en: "Account & payments",
    sections: [
      {
        fr: "Gérer vos paiements",
        en: "Manage your payments",
        articles: ["payer-echeance", "dates-echeance", "paiement-auto"],
      },
      {
        fr: "Demandes",
        en: "Requests",
        articles: ["demander-financement", "si-refuse"],
      },
    ],
  },
  {
    slug: "litiges-remboursements",
    fr: "Litiges et remboursements",
    en: "Disputes & refunds",
    sections: [
      {
        fr: "Litiges",
        en: "Disputes",
        articles: ["litige-paiement", "commande-non-recue"],
      },
      {
        fr: "Remboursements",
        en: "Refunds",
        articles: ["remboursement"],
      },
    ],
  },
  {
    slug: "securite-confidentialite",
    fr: "Sécurité et confidentialité",
    en: "Security & privacy",
    sections: [
      {
        fr: "Protéger votre compte",
        en: "Protect your account",
        articles: ["protection-donnees", "changer-mdp", "signaler-fraude"],
      },
    ],
  },
  {
    slug: "eligibilite-score",
    fr: "Éligibilité et score",
    en: "Eligibility & score",
    sections: [
      {
        fr: "Votre score Sensei",
        en: "Your Sensei score",
        articles: ["comment-score-calcule", "ameliorer-score"],
      },
      {
        fr: "Éligibilité",
        en: "Eligibility",
        articles: ["demander-financement", "si-refuse"],
      },
    ],
  },
  {
    slug: "marchands-partenaires",
    fr: "Marchands partenaires",
    en: "Partner merchants",
    sections: [
      {
        fr: "Utiliser Sensei Pay",
        en: "Use Sensei Pay",
        articles: ["ou-utiliser", "devenir-marchand"],
      },
      {
        fr: "Accéder au portail",
        en: "Access the portal",
        articles: ["acceder-portail-marchand"],
      },
    ],
  },
  {
    slug: "carte-bancaire",
    fr: "Carte et compte bancaire",
    en: "Card & bank account",
    sections: [
      {
        fr: "Vos moyens de paiement",
        en: "Your payment methods",
        articles: ["ajouter-carte", "compte-bancaire", "securite-paiement-carte"],
      },
    ],
  },
];

// ── Articles ──────────────────────────────────────────────────────────────────

export const HELP_ARTICLES: HelpArticle[] = [
  // ── À propos ──────────────────────────────────────────────────────
  {
    slug: "comment-ca-marche",
    category: "a-propos",
    tag: { fr: "Comment ça marche", en: "How it works" },
    related: ["prequalification", "nous-joindre", "conditions-utilisation"],
    fr: {
      title: "Comment fonctionne Sensei Pay",
      paras: [
        "Avec Sensei Pay, vous pouvez acheter maintenant et payer en plusieurs fois chez nos marchands partenaires. Il vous suffit de sélectionner Sensei Pay au moment du paiement et de choisir l'échéancier qui vous convient — 3 ou 4 versements mensuels. Vous ne paierez jamais plus que ce que vous avez accepté à l'avance.",
        "Frais et intérêts : en V1, Sensei Pay ne facture aucun intérêt ni aucun frais caché. Le montant total affiché est exactement ce que vous payez, réparti sur les échéances choisies.",
        "Score Sensei : votre éligibilité et votre plafond de financement sont déterminés par votre score Sensei Credit. La décision est instantanée, sans paperasse ni attente.",
        "Commencez par créer un compte ou vérifiez si vous êtes éligible grâce à notre estimateur gratuit.",
      ],
    },
    en: {
      title: "How Sensei Pay works",
      paras: [
        "With Sensei Pay, you can buy now and pay in installments at our partner merchants. Just select Sensei Pay at checkout and choose the schedule that suits you — 3 or 4 monthly payments. You will never pay more than what you agreed to upfront.",
        "Fees and interest: in V1, Sensei Pay charges no interest and no hidden fees. The total shown is exactly what you pay, split over the chosen installments.",
        "Sensei score: your eligibility and financing limit are set by your Sensei Credit score. The decision is instant, no paperwork or waiting.",
        "Get started by creating an account or check your eligibility with our free estimator.",
      ],
    },
  },
  {
    slug: "prequalification",
    category: "a-propos",
    tag: { fr: "Comment ça marche", en: "How it works" },
    related: ["comment-ca-marche", "nous-joindre", "si-refuse"],
    fr: {
      title: "À propos de la préqualification",
      paras: [
        "La préqualification Sensei Pay vous permet de connaître votre plafond de financement avant même de finaliser un achat. Cette vérification n'a aucun impact sur votre score Sensei.",
        "Pour vous préqualifier, Sensei effectue une consultation douce de votre profil de crédit interne. Même si elle apparaît dans votre historique Sensei, elle ne modifie pas votre score.",
        "Si vous avez un doute sur une consultation ou pensez être victime d'une fraude, contactez notre équipe immédiatement via aide@sensei.cd.",
      ],
    },
    en: {
      title: "About prequalification",
      paras: [
        "Sensei Pay prequalification lets you know your financing limit before finalizing a purchase. This check has no impact on your Sensei score.",
        "To prequalify you, Sensei performs a soft inquiry on your internal credit profile. Even if it appears in your Sensei history, it does not change your score.",
        "If you have concerns about a check or think you may be a victim of fraud, contact our team immediately at aide@sensei.cd.",
      ],
    },
  },
  {
    slug: "conditions-utilisation",
    category: "a-propos",
    tag: { fr: "Légal", en: "Legal" },
    related: ["comment-ca-marche", "protection-donnees"],
    fr: {
      title: "Conditions d'utilisation Sensei Pay",
      paras: [
        "En utilisant Sensei Pay, vous acceptez nos conditions d'utilisation et notre politique de confidentialité. Ces documents régissent votre relation avec Sensei et définissent vos droits et obligations.",
        "Sensei Pay est un service de paiement échelonné sans intérêt ni frais caché en V1. Toute modification de nos conditions vous sera communiquée par e-mail avec un préavis de 30 jours.",
        "Pour toute question sur nos conditions, écrivez-nous à aide@sensei.cd.",
      ],
    },
    en: {
      title: "Sensei Pay terms of use",
      paras: [
        "By using Sensei Pay, you agree to our terms of use and privacy policy. These documents govern your relationship with Sensei and define your rights and obligations.",
        "Sensei Pay is a zero-interest, no-hidden-fee installment service in V1. Any changes to our terms will be communicated by email with 30 days' notice.",
        "For any questions about our terms, write to us at aide@sensei.cd.",
      ],
    },
  },
  {
    slug: "creer-compte",
    category: "a-propos",
    tag: { fr: "Pour commencer", en: "Get started" },
    related: ["comment-ca-marche", "prequalification", "nous-joindre"],
    fr: {
      title: "Créer un compte Sensei Pay",
      paras: [
        "Créer un compte Sensei Pay est gratuit et rapide. Rendez-vous sur sensei.cd, cliquez sur « Créer un compte » et renseignez votre nom, votre adresse e-mail et un mot de passe.",
        "Une fois inscrit, vous aurez accès à votre tableau de bord, à votre score Sensei Credit et à l'estimateur de financement. Un même compte vous donne également accès à Sensei Flights.",
        "Si vous ne recevez pas l'e-mail de confirmation dans les 5 minutes, vérifiez votre dossier de courriers indésirables ou contactez-nous.",
      ],
    },
    en: {
      title: "Create a Sensei Pay account",
      paras: [
        "Creating a Sensei Pay account is free and fast. Go to sensei.cd, click \"Create account\" and enter your name, email address, and a password.",
        "Once registered, you'll have access to your dashboard, your Sensei Credit score, and the financing estimator. The same account also gives you access to Sensei Flights.",
        "If you don't receive the confirmation email within 5 minutes, check your spam folder or contact us.",
      ],
    },
  },
  {
    slug: "nous-joindre",
    category: "a-propos",
    tag: { fr: "Support", en: "Support" },
    related: ["comment-ca-marche", "conditions-utilisation"],
    fr: {
      title: "Nous joindre",
      paras: [
        "Notre équipe est disponible pour répondre à toutes vos questions sur Sensei Pay.",
        "Par e-mail : aide@sensei.cd — nous répondons en français, du lundi au vendredi, de 8h à 18h (heure de Kinshasa).",
        "Pour les marchands partenaires, contactez marchands@sensei.cd pour toute question relative à l'intégration ou aux règlements.",
      ],
    },
    en: {
      title: "Contact us",
      paras: [
        "Our team is available to answer all your questions about Sensei Pay.",
        "By email: aide@sensei.cd — we reply in French (and English), Monday to Friday, 8am to 6pm (Kinshasa time).",
        "For partner merchants, contact marchands@sensei.cd for integration or settlement questions.",
      ],
    },
  },

  // ── Compte et paiements ────────────────────────────────────────────
  {
    slug: "payer-echeance",
    category: "compte-paiements",
    tag: { fr: "Paiements", en: "Payments" },
    related: ["dates-echeance", "paiement-auto", "ajouter-carte"],
    fr: {
      title: "Payer une échéance",
      paras: [
        "Pour régler une échéance, connectez-vous à votre compte Sensei Pay et accédez à « Mes paiements ». Sélectionnez le plan concerné et cliquez sur « Payer cette échéance ».",
        "Le paiement est débité sur votre carte Visa ou votre compte bancaire enregistré. La transaction est confirmée instantanément et votre score Sensei est mis à jour.",
        "Vous pouvez également activer le prélèvement automatique pour ne jamais manquer une échéance.",
      ],
    },
    en: {
      title: "Pay an installment",
      paras: [
        "To pay an installment, sign in to your Sensei Pay account and go to \"My payments\". Select the plan and click \"Pay this installment\".",
        "The payment is charged to your registered Visa card or bank account. The transaction is confirmed instantly and your Sensei score is updated.",
        "You can also enable automatic debit to never miss a due date.",
      ],
    },
  },
  {
    slug: "dates-echeance",
    category: "compte-paiements",
    tag: { fr: "Paiements", en: "Payments" },
    related: ["payer-echeance", "paiement-auto", "si-refuse"],
    fr: {
      title: "Dates d'échéance du paiement",
      paras: [
        "Vos dates d'échéance sont fixées au moment de la validation de votre plan de paiement. Elles sont affichées clairement dans votre tableau de bord.",
        "Vous recevez un rappel par e-mail 3 jours avant chaque échéance. Si vous avez activé le prélèvement automatique, le montant est prélevé le jour J.",
        "En cas de difficulté à honorer une échéance, contactez-nous avant la date limite à aide@sensei.cd.",
      ],
    },
    en: {
      title: "Payment due dates",
      paras: [
        "Your due dates are set when your payment plan is confirmed. They are clearly displayed in your dashboard.",
        "You receive an email reminder 3 days before each due date. If you enabled automatic debit, the amount is charged on the due date.",
        "If you have trouble meeting a due date, contact us before the deadline at aide@sensei.cd.",
      ],
    },
  },
  {
    slug: "paiement-auto",
    category: "compte-paiements",
    tag: { fr: "Paiements", en: "Payments" },
    related: ["payer-echeance", "dates-echeance", "ajouter-carte"],
    fr: {
      title: "Paiement automatique",
      paras: [
        "Le prélèvement automatique débite votre moyen de paiement par défaut à chaque date d'échéance, sans action de votre part.",
        "Pour l'activer, rendez-vous sur la page détail d'un plan de paiement et activez l'option « Prélèvement automatique ». Vous recevrez toujours un rappel 3 jours avant.",
        "Vous pouvez désactiver le prélèvement automatique à tout moment depuis votre tableau de bord.",
      ],
    },
    en: {
      title: "Automatic payment",
      paras: [
        "Automatic debit charges your default payment method on each due date, without any action from you.",
        "To enable it, go to the detail page of a payment plan and turn on \"Automatic payment\". You will still receive a reminder 3 days before.",
        "You can disable automatic debit at any time from your dashboard.",
      ],
    },
  },
  {
    slug: "demander-financement",
    category: "compte-paiements",
    tag: { fr: "Demandes", en: "Requests" },
    related: ["prequalification", "si-refuse", "comment-ca-marche"],
    fr: {
      title: "Demander un financement",
      paras: [
        "Pour demander un financement Sensei Pay, rendez-vous chez un marchand partenaire (par exemple Sensei Flights) et sélectionnez Sensei Pay au moment du paiement.",
        "Une décision instantanée est rendue en fonction de votre score Sensei Credit. Si votre demande est approuvée, l'échéancier s'affiche et vous pouvez valider.",
        "Si votre demande n'est pas approuvée, consultez notre article « Si votre demande n'est pas approuvée » pour comprendre les raisons et les étapes suivantes.",
      ],
    },
    en: {
      title: "Request financing",
      paras: [
        "To request Sensei Pay financing, go to a partner merchant (e.g. Sensei Flights) and select Sensei Pay at checkout.",
        "An instant decision is made based on your Sensei Credit score. If approved, your schedule is shown and you can confirm.",
        "If your request is not approved, see our article \"If your request is not approved\" for reasons and next steps.",
      ],
    },
  },
  {
    slug: "si-refuse",
    category: "compte-paiements",
    tag: { fr: "Demandes", en: "Requests" },
    related: ["demander-financement", "ameliorer-score", "prequalification"],
    fr: {
      title: "Si votre demande n'est pas approuvée",
      paras: [
        "Un refus ne signifie pas que vous ne pourrez jamais utiliser Sensei Pay. Plusieurs raisons peuvent expliquer un refus : score insuffisant, montant demandé supérieur à votre plafond, ou informations incomplètes.",
        "Pour améliorer vos chances : complétez votre profil, vérifiez votre identité (KYC), et réglez vos échéances en cours à l'heure pour faire monter votre score.",
        "Votre score Sensei est réévalué à chaque paiement effectué. Revenez dans quelques semaines pour retenter une demande.",
      ],
    },
    en: {
      title: "If your request is not approved",
      paras: [
        "A rejection doesn't mean you can never use Sensei Pay. Possible reasons: insufficient score, requested amount above your limit, or incomplete information.",
        "To improve your chances: complete your profile, verify your identity (KYC), and pay your current installments on time to raise your score.",
        "Your Sensei score is reassessed with every payment made. Come back in a few weeks to try again.",
      ],
    },
  },

  // ── Litiges et remboursements ──────────────────────────────────────
  {
    slug: "litige-paiement",
    category: "litiges-remboursements",
    tag: { fr: "Litiges", en: "Disputes" },
    related: ["remboursement", "nous-joindre", "commande-non-recue"],
    fr: {
      title: "Contester un paiement",
      paras: [
        "Si vous constatez un paiement que vous ne reconnaissez pas sur votre compte Sensei Pay, contactez-nous immédiatement à aide@sensei.cd.",
        "Précisez dans votre message : la date du paiement, le montant, et le motif de la contestation. Nous enquêterons dans les 5 jours ouvrables.",
        "Pendant l'enquête, l'échéance contestée est suspendue et n'affecte pas votre score Sensei.",
      ],
    },
    en: {
      title: "Dispute a payment",
      paras: [
        "If you notice a payment on your Sensei Pay account that you don't recognize, contact us immediately at aide@sensei.cd.",
        "Include in your message: the payment date, amount, and reason for the dispute. We will investigate within 5 business days.",
        "During the investigation, the disputed installment is suspended and does not affect your Sensei score.",
      ],
    },
  },
  {
    slug: "commande-non-recue",
    category: "litiges-remboursements",
    tag: { fr: "Litiges", en: "Disputes" },
    related: ["litige-paiement", "remboursement", "nous-joindre"],
    fr: {
      title: "Commande non reçue",
      paras: [
        "Si vous n'avez pas reçu votre commande, commencez par contacter le marchand partenaire directement pour signaler le problème.",
        "Si le marchand ne vous répond pas dans les 48 heures ou refuse de résoudre le problème, contactez Sensei à aide@sensei.cd en joignant votre confirmation de commande.",
        "Nous interviendrons pour bloquer les échéances restantes jusqu'à résolution du litige.",
      ],
    },
    en: {
      title: "Order not received",
      paras: [
        "If you haven't received your order, start by contacting the partner merchant directly to report the issue.",
        "If the merchant doesn't respond within 48 hours or refuses to resolve the problem, contact Sensei at aide@sensei.cd and include your order confirmation.",
        "We will intervene to suspend the remaining installments until the dispute is resolved.",
      ],
    },
  },
  {
    slug: "remboursement",
    category: "litiges-remboursements",
    tag: { fr: "Remboursements", en: "Refunds" },
    related: ["litige-paiement", "nous-joindre", "commande-non-recue"],
    fr: {
      title: "Demander un remboursement",
      paras: [
        "Un remboursement Sensei Pay est possible si le marchand accepte le retour de votre commande. Le montant remboursé est déduit des échéances restantes, dans l'ordre inverse.",
        "Pour initier un remboursement, contactez d'abord le marchand partenaire pour obtenir un accord de retour. Transmettez-nous ensuite la confirmation du marchand à aide@sensei.cd.",
        "Le remboursement est traité dans les 3 à 5 jours ouvrables. Si des échéances ont déjà été prélevées, le remboursement est effectué sur votre carte ou compte bancaire enregistré.",
      ],
    },
    en: {
      title: "Request a refund",
      paras: [
        "A Sensei Pay refund is possible if the merchant accepts your return. The refunded amount is deducted from the remaining installments in reverse order.",
        "To initiate a refund, contact the partner merchant first to get a return agreement. Then send us the merchant's confirmation at aide@sensei.cd.",
        "Refunds are processed within 3 to 5 business days. If installments have already been charged, the refund goes to your registered card or bank account.",
      ],
    },
  },

  // ── Sécurité ───────────────────────────────────────────────────────
  {
    slug: "protection-donnees",
    category: "securite-confidentialite",
    tag: { fr: "Sécurité", en: "Security" },
    related: ["changer-mdp", "signaler-fraude", "conditions-utilisation"],
    fr: {
      title: "Protection de vos données",
      paras: [
        "Sensei chiffre toutes vos données sensibles au repos et en transit. Vos informations de paiement ne sont jamais stockées en clair.",
        "L'accès à votre score et à votre rapport de crédit exige toujours votre consentement explicite, tracé dans votre historique.",
        "Nous ne partageons jamais vos données personnelles avec des tiers à des fins commerciales sans votre accord.",
      ],
    },
    en: {
      title: "Protecting your data",
      paras: [
        "Sensei encrypts all sensitive data at rest and in transit. Your payment information is never stored in clear text.",
        "Access to your score and credit report always requires your explicit consent, tracked in your history.",
        "We never share your personal data with third parties for commercial purposes without your agreement.",
      ],
    },
  },
  {
    slug: "changer-mdp",
    category: "securite-confidentialite",
    tag: { fr: "Sécurité", en: "Security" },
    related: ["protection-donnees", "signaler-fraude"],
    fr: {
      title: "Changer de mot de passe",
      paras: [
        "Pour modifier votre mot de passe, accédez à votre profil depuis le menu de navigation, puis cliquez sur « Sécurité » > « Changer de mot de passe ».",
        "Choisissez un mot de passe d'au moins 8 caractères, combinant lettres, chiffres et caractères spéciaux.",
        "Si vous avez oublié votre mot de passe, utilisez le lien « Mot de passe oublié » sur la page de connexion.",
      ],
    },
    en: {
      title: "Change your password",
      paras: [
        "To change your password, go to your profile from the navigation menu, then click \"Security\" > \"Change password\".",
        "Choose a password of at least 8 characters, combining letters, numbers, and special characters.",
        "If you've forgotten your password, use the \"Forgot password\" link on the sign-in page.",
      ],
    },
  },
  {
    slug: "signaler-fraude",
    category: "securite-confidentialite",
    tag: { fr: "Sécurité", en: "Security" },
    related: ["protection-donnees", "nous-joindre", "litige-paiement"],
    fr: {
      title: "Signaler une fraude",
      paras: [
        "Si vous pensez que votre compte Sensei Pay a été compromis ou que vous êtes victime d'une fraude, contactez-nous immédiatement à securite@sensei.cd.",
        "Nous suspendrons votre compte dans les 2 heures suivant votre signalement et enquêterons en priorité.",
        "Ne communiquez jamais votre mot de passe ou vos informations bancaires par e-mail ou téléphone. Sensei ne vous demandera jamais ces informations.",
      ],
    },
    en: {
      title: "Report fraud",
      paras: [
        "If you believe your Sensei Pay account has been compromised or you are a victim of fraud, contact us immediately at securite@sensei.cd.",
        "We will suspend your account within 2 hours of your report and investigate as a priority.",
        "Never share your password or banking details by email or phone. Sensei will never ask for this information.",
      ],
    },
  },

  // ── Éligibilité et score ───────────────────────────────────────────
  {
    slug: "comment-score-calcule",
    category: "eligibilite-score",
    tag: { fr: "Score Sensei", en: "Sensei score" },
    related: ["ameliorer-score", "prequalification", "si-refuse"],
    fr: {
      title: "Comment votre score est calculé",
      paras: [
        "Votre score Sensei (de 300 à 850) reflète votre comportement de paiement au sein de l'écosystème Sensei. Il est recalculé après chaque événement significatif.",
        "Les principaux facteurs : ponctualité des paiements (facteur le plus important), utilisation de votre plafond, et ancienneté de votre historique.",
        "Chaque variation de score est tracée et expliquée dans votre historique, avec la date, le motif et l'impact en points. Aucun événement n'est effacé.",
      ],
    },
    en: {
      title: "How your score is calculated",
      paras: [
        "Your Sensei score (300 to 850) reflects your payment behavior within the Sensei ecosystem. It is recalculated after each significant event.",
        "Key factors: payment punctuality (most important), limit utilization, and history length.",
        "Every score change is tracked and explained in your history, with the date, reason, and point impact. No event is ever erased.",
      ],
    },
  },
  {
    slug: "ameliorer-score",
    category: "eligibilite-score",
    tag: { fr: "Score Sensei", en: "Sensei score" },
    related: ["comment-score-calcule", "prequalification", "payer-echeance"],
    fr: {
      title: "Améliorer votre score Sensei",
      paras: [
        "Le moyen le plus efficace d'améliorer votre score est de régler chaque échéance avant la date affichée. Chaque paiement à l'heure ajoute des points.",
        "Soldez vos plans en cours jusqu'au bout sans défaut. Un plan entièrement remboursé renforce significativement votre score.",
        "N'engagez que des montants que vous pouvez rembourser. Utiliser votre plafond de façon responsable est un signal positif pour votre score.",
      ],
    },
    en: {
      title: "Improve your Sensei score",
      paras: [
        "The most effective way to improve your score is to pay each installment before the shown date. Every on-time payment adds points.",
        "Pay off your active plans all the way through without default. A fully repaid plan significantly boosts your score.",
        "Only finance amounts you can repay. Using your limit responsibly is a positive signal for your score.",
      ],
    },
  },

  // ── Marchands ──────────────────────────────────────────────────────
  {
    slug: "ou-utiliser",
    category: "marchands-partenaires",
    tag: { fr: "Où utiliser", en: "Where to use" },
    related: ["devenir-marchand", "comment-ca-marche"],
    fr: {
      title: "Où utiliser Sensei Pay",
      paras: [
        "Sensei Pay est actuellement disponible sur Sensei Flights pour l'achat de billets d'avion. Vous pouvez payer vos billets en 3 ou 4 versements mensuels.",
        "D'autres marchands partenaires rejoindront l'écosystème Sensei prochainement : électronique, électroménager, mode, services, éducation.",
        "Tous nos marchands partenaires affichent le logo Sensei Pay à leur caisse. Recherchez-le pour payer en plusieurs fois.",
      ],
    },
    en: {
      title: "Where to use Sensei Pay",
      paras: [
        "Sensei Pay is currently available on Sensei Flights for purchasing flight tickets. You can pay in 3 or 4 monthly installments.",
        "More partner merchants will join the Sensei ecosystem soon: electronics, home appliances, fashion, services, education.",
        "All our partner merchants display the Sensei Pay logo at checkout. Look for it to pay in installments.",
      ],
    },
  },
  {
    slug: "devenir-marchand",
    category: "marchands-partenaires",
    tag: { fr: "Marchands", en: "Merchants" },
    related: ["acceder-portail-marchand", "ou-utiliser", "nous-joindre"],
    fr: {
      title: "Devenir marchand partenaire",
      paras: [
        "Proposez Sensei Pay à vos clients et augmentez votre chiffre d'affaires. Vous êtes réglé d'avance — Sensei gère les échéances et le risque.",
        "Pour rejoindre le réseau de marchands partenaires, créez un compte marchand sur sensei.cd et complétez votre dossier d'entreprise.",
        "Notre équipe technique vous accompagne pour l'intégration de Sensei Pay à votre caisse, en ligne ou en agence. Contactez marchands@sensei.cd pour démarrer.",
      ],
    },
    en: {
      title: "Become a partner merchant",
      paras: [
        "Offer Sensei Pay to your customers and grow your revenue. You're paid upfront — Sensei manages the installments and the risk.",
        "To join the partner merchant network, create a merchant account on sensei.cd and complete your business profile.",
        "Our technical team guides you through integrating Sensei Pay at your checkout, online or in store. Contact marchands@sensei.cd to get started.",
      ],
    },
  },
  {
    slug: "acceder-portail-marchand",
    category: "marchands-partenaires",
    tag: { fr: "Portail marchand", en: "Merchant portal" },
    related: ["devenir-marchand", "ou-utiliser", "changer-mdp"],
    fr: {
      title: "Accéder au portail marchand",
      paras: [
        "Le portail marchand vous donne accès à vos sessions de paiement, vos versements et vos clés d'intégration Sensei Pay. Si vous travaillez pour une entreprise déjà inscrite et avez besoin d'un accès, contactez directement la personne qui a créé le compte — Sensei ne gère pas encore plusieurs utilisateurs par compte marchand. En cas de blocage, écrivez-nous à marchands@sensei.cd.",
        "Pour créer votre compte : sur sensei.cd, basculez le sélecteur « Acheteurs / Marchands » en haut de page sur Marchands, puis cliquez sur Créer un compte. Vous arrivez sur la page « Devenez marchand partenaire ». Renseignez le nom de votre entreprise, votre secteur d'activité, votre nom complet, votre numéro de téléphone, votre adresse e-mail et un mot de passe d'au moins 6 caractères, puis validez.",
        "Un e-mail de confirmation vous est envoyé. Ouvrez-le et confirmez votre adresse pour activer le compte — sans cette étape, la connexion restera impossible.",
        "Pour vous connecter : revenez sur sensei.cd avec le sélecteur sur Marchands et cliquez sur Se connecter. Sur l'écran « Espace marchand », saisissez votre e-mail et votre mot de passe puis validez. Si vous n'avez pas encore de compte, un lien en bas de l'écran vous renvoie vers l'inscription.",
        "Première connexion — configurez votre compte marchand : un formulaire s'affiche pour renseigner le nom de votre entreprise, votre site web (facultatif) et votre compte de règlement mobile money — c'est là que vous recevrez le montant net de chaque vente. Validez avec Créer mon compte marchand.",
        "Vos clés d'intégration (clé publique, clé secrète, secret webhook) s'affichent à cet instant, une seule fois. Copiez-les et conservez-les en lieu sûr immédiatement : elles ne seront plus jamais réaffichées dans le portail.",
        "Vous êtes ensuite redirigé vers votre tableau de bord. La barre latérale donne accès à Vue d'ensemble, Transactions, Versements, Clés API et Webhooks ; un lien en bas de la barre permet de revenir à tout moment vers l'espace acheteur.",
        "Sécurité du compte : l'authentification à deux facteurs n'est pas encore disponible sur le portail marchand — protégez votre compte avec un mot de passe unique et robuste. Ne partagez jamais votre clé secrète ni votre secret webhook, y compris avec Sensei : nous ne vous les demanderons jamais par e-mail ou téléphone. Tout accès suspect doit être signalé immédiatement à marchands@sensei.cd.",
      ],
    },
    en: {
      title: "Accessing the merchant portal",
      paras: [
        "The merchant portal gives you access to your payment sessions, payouts, and Sensei Pay integration keys. If you work for a business that's already registered and need access, contact whoever created the account directly — Sensei doesn't yet support multiple users per merchant account. If you're stuck, write to us at marchands@sensei.cd.",
        "To create your account: on sensei.cd, switch the \"Buyers / Merchants\" toggle at the top of the page to Merchants, then click Create account. You'll land on the \"Become a partner merchant\" page. Enter your business name, industry, full name, phone number, email address, and a password of at least 6 characters, then submit.",
        "A confirmation email is sent to you. Open it and confirm your address to activate the account — without this step, signing in won't be possible.",
        "To sign in: return to sensei.cd with the toggle set to Merchants and click Sign in. On the \"Merchant space\" screen, enter your email and password and submit. If you don't have an account yet, a link at the bottom of the screen takes you to sign-up.",
        "First sign-in — set up your merchant account: a form appears asking for your business name, your website (optional), and your mobile money settlement account — this is where you'll receive the net amount of each sale. Submit with Create my merchant account.",
        "Your integration keys (public key, secret key, webhook secret) are shown at this point, once only. Copy and store them somewhere safe immediately: they will never be displayed again in the portal.",
        "You're then redirected to your dashboard. The sidebar gives access to Overview, Transactions, Payouts, API Keys, and Webhooks; a link at the bottom of the sidebar lets you switch back to the buyer space at any time.",
        "Account security: two-factor authentication isn't available on the merchant portal yet — protect your account with a strong, unique password. Never share your secret key or webhook secret, including with Sensei: we will never ask for them by email or phone. Report any suspicious access immediately to marchands@sensei.cd.",
      ],
    },
  },

  // ── Carte et compte bancaire ───────────────────────────────────────
  {
    slug: "ajouter-carte",
    category: "carte-bancaire",
    tag: { fr: "Paiement", en: "Payment" },
    related: ["compte-bancaire", "securite-paiement-carte", "payer-echeance"],
    fr: {
      title: "Ajouter une carte Visa",
      paras: [
        "Pour ajouter une carte Visa à votre compte Sensei Pay, accédez à « Moyens de paiement » depuis votre tableau de bord et cliquez sur « Ajouter une carte ».",
        "Saisissez le numéro de carte, la date d'expiration et le code CVV. Vos données sont chiffrées et nous ne stockons jamais votre numéro de carte en clair.",
        "Une fois ajoutée, vous pouvez définir cette carte comme moyen de paiement par défaut pour régler vos échéances automatiquement.",
      ],
    },
    en: {
      title: "Add a Visa card",
      paras: [
        "To add a Visa card to your Sensei Pay account, go to \"Payment methods\" from your dashboard and click \"Add a card\".",
        "Enter the card number, expiry date, and CVV. Your data is encrypted and we never store your card number in plain text.",
        "Once added, you can set this card as your default payment method to settle installments automatically.",
      ],
    },
  },
  {
    slug: "compte-bancaire",
    category: "carte-bancaire",
    tag: { fr: "Paiement", en: "Payment" },
    related: ["ajouter-carte", "securite-paiement-carte", "payer-echeance"],
    fr: {
      title: "Lier un compte bancaire",
      paras: [
        "Vous pouvez lier votre compte bancaire congolais pour régler vos échéances Sensei Pay par virement direct.",
        "Pour lier un compte, accédez à « Moyens de paiement » et sélectionnez « Ajouter un compte bancaire ». Vous aurez besoin de votre code RIB ou IBAN.",
        "La liaison est vérifiée par un micro-dépôt de confirmation dans les 24 heures. Une fois confirmé, votre compte est prêt à l'emploi.",
      ],
    },
    en: {
      title: "Link a bank account",
      paras: [
        "You can link your Congolese bank account to pay your Sensei Pay installments by direct transfer.",
        "To link an account, go to \"Payment methods\" and select \"Add a bank account\". You'll need your bank's routing code or IBAN.",
        "The link is verified by a confirmation micro-deposit within 24 hours. Once confirmed, your account is ready to use.",
      ],
    },
  },
  {
    slug: "securite-paiement-carte",
    category: "carte-bancaire",
    tag: { fr: "Sécurité", en: "Security" },
    related: ["ajouter-carte", "protection-donnees", "signaler-fraude"],
    fr: {
      title: "Sécurité des paiements par carte",
      paras: [
        "Tous les paiements par carte sur Sensei Pay sont sécurisés par chiffrement TLS et conformes aux normes PCI-DSS. Vos données de carte ne sont jamais stockées sur nos serveurs en clair.",
        "Si vous recevez une notification de paiement que vous n'avez pas effectué, bloquez votre carte auprès de votre banque et signalez-le immédiatement à securite@sensei.cd.",
        "Sensei ne vous demandera jamais votre numéro de carte, CVV ou mot de passe par e-mail ou téléphone.",
      ],
    },
    en: {
      title: "Card payment security",
      paras: [
        "All card payments on Sensei Pay are secured by TLS encryption and comply with PCI-DSS standards. Your card data is never stored in plain text on our servers.",
        "If you receive a payment notification you didn't make, block your card with your bank and report it immediately to securite@sensei.cd.",
        "Sensei will never ask for your card number, CVV, or password by email or phone.",
      ],
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function getCategory(slug: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryArticles(categorySlug: string): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === categorySlug);
}
