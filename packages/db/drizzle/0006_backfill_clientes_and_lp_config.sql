-- Custom SQL migration file, put your code below! --

-- Backfill clientes from freelas' embedded contact fields, deduping by e-mail
-- when present (same e-mail = same client across multiple freela projects),
-- falling back to name when e-mail is blank.
WITH distinct_clientes AS (
  SELECT DISTINCT ON (COALESCE(NULLIF(lower(trim(cliente_email)), ''), lower(trim(cliente_nome))))
    cliente_nome AS nome,
    cliente_email AS email,
    cliente_whatsapp AS whatsapp
  FROM freelas
  ORDER BY COALESCE(NULLIF(lower(trim(cliente_email)), ''), lower(trim(cliente_nome))), created_at ASC
)
INSERT INTO clientes (nome, email, whatsapp)
SELECT nome, email, whatsapp FROM distinct_clientes;

UPDATE freelas f
SET cliente_id = c.id
FROM clientes c
WHERE f.cliente_id IS NULL
  AND COALESCE(NULLIF(lower(trim(f.cliente_email)), ''), lower(trim(f.cliente_nome)))
    = COALESCE(NULLIF(lower(trim(c.email)), ''), lower(trim(c.nome)));

-- Backfill landing_pages.header/footer/whatsapp jsonb from the legacy flat columns.
UPDATE landing_pages
SET
  header = jsonb_build_object(
    'mostrarLogo', true,
    'logoUrl', logo_url,
    'mostrarTitulo', true,
    'titulo', marca,
    'navItems', COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('id', gen_random_uuid()::text, 'label', trim(link), 'secaoId', 'topo'))
        FROM unnest(string_to_array(header_links, ',')) AS link
        WHERE trim(link) <> ''
      ),
      '[]'::jsonb
    )
  ),
  footer = jsonb_build_object(
    'texto', footer_texto,
    'endereco', '',
    'telefone', '',
    'email', footer_contato,
    'redesSociais', '[]'::jsonb
  ),
  whatsapp = jsonb_build_object('ativo', false, 'numero', '', 'mensagem', 'Olá! Vim pelo site.')
WHERE header IS NULL;
