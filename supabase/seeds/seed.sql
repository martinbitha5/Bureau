-- Sensei — données de démo (dev local uniquement). Lancé par `supabase db reset`.
-- NOTE : en réel, les `users` sont liés à auth.users. Ici on insère un prêteur et un
-- marchand de démo qui ne dépendent pas de l'auth, pour tester le back-office.

insert into lenders (name, api_key_hash, is_active) values
  ('Banque Demo RDC', 'hash_demo_lender', true);

insert into merchants (name, settlement_account, is_active) values
  ('Sensei Flights (interne)', 'demo-settlement', true);
