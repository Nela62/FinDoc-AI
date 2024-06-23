--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
INSERT INTO
  "auth"."users" (
    "instance_id",
    "id",
    "aud",
    "role",
    "email",
    "encrypted_password",
    "email_confirmed_at",
    "invited_at",
    "confirmation_token",
    "confirmation_sent_at",
    "recovery_token",
    "recovery_sent_at",
    "email_change_token_new",
    "email_change",
    "email_change_sent_at",
    "last_sign_in_at",
    "raw_app_meta_data",
    "raw_user_meta_data",
    "is_super_admin",
    "created_at",
    "updated_at",
    "phone",
    "phone_confirmed_at",
    "phone_change",
    "phone_change_token",
    "phone_change_sent_at",
    "email_change_token_current",
    "email_change_confirm_status",
    "banned_until",
    "reauthentication_token",
    "reauthentication_sent_at",
    "is_sso_user",
    "deleted_at",
    "is_anonymous"
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '8a84f859-4958-4496-a740-bf0b67707af3',
    'authenticated',
    'authenticated',
    'user@coreline.ai',
    '$2a$10$B0LFqcXJqXnwUPaKhLmAtejx3kuvZ8ifR8Oa.YQFq0xY4kTX9/EUS',
    '2024-04-26 17:27:19.364068+00',
    NULL,
    '',
    '2024-04-26 17:27:10.104807+00',
    '',
    NULL,
    '',
    '',
    NULL,
    '2024-05-07 05:01:44.7407+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"sub": "8a84f859-4958-4496-a740-bf0b67707af3", "email": "user@coreline.ai", "email_verified": false, "phone_verified": false}',
    NULL,
    '2024-04-26 17:23:03.627855+00',
    '2024-05-07 06:06:44.154825+00',
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL,
    false
  );

--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
INSERT INTO
  "auth"."identities" (
    "provider_id",
    "user_id",
    "identity_data",
    "provider",
    "last_sign_in_at",
    "created_at",
    "updated_at",
    "id"
  )
VALUES
  (
    '8a84f859-4958-4496-a740-bf0b67707af3',
    '8a84f859-4958-4496-a740-bf0b67707af3',
    '{"sub": "8a84f859-4958-4496-a740-bf0b67707af3", "email": "user@coreline.ai", "email_verified": false, "phone_verified": false}',
    'email',
    '2024-04-26 17:23:03.635884+00',
    '2024-04-26 17:23:03.63594+00',
    '2024-04-26 17:23:03.63594+00',
    'a96b8bf9-a9fe-4204-abb2-cb99ddbdd1e8'
  );

-- INSERT INTO
--   "public"."settings" (
--     "user_id",
--     "author_name",
--     "company_name"
--   )
-- values
--   (
--     '8a84f859-4958-4496-a740-bf0b67707af3',
--     'Finpanel AI',
--     'Finpanel Inc.'
--   )