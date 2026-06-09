-- Atomic invoice + line_items insert (transaction-safe)

CREATE OR REPLACE FUNCTION public.create_invoice_with_line_items(
  p_invoice jsonb,
  p_line_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_item jsonb;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO invoices (
    user_id,
    invoice_number,
    issue_date,
    due_date,
    currency,
    client_name,
    client_address,
    client_email,
    client_phone,
    payment_details,
    notes,
    vat_enabled,
    vat_rate,
    subtotal,
    vat_amount,
    grand_total,
    header_color,
    profile_snapshot,
    status
  )
  VALUES (
    v_user_id,
    p_invoice->>'invoice_number',
    (p_invoice->>'issue_date')::date,
    NULLIF(p_invoice->>'due_date', '')::date,
    COALESCE(p_invoice->>'currency', 'NGN'),
    p_invoice->>'client_name',
    NULLIF(p_invoice->>'client_address', ''),
    NULLIF(p_invoice->>'client_email', ''),
    NULLIF(p_invoice->>'client_phone', ''),
    NULLIF(p_invoice->>'payment_details', ''),
    NULLIF(p_invoice->>'notes', ''),
    COALESCE((p_invoice->>'vat_enabled')::boolean, false),
    COALESCE((p_invoice->>'vat_rate')::numeric, 7.5),
    COALESCE((p_invoice->>'subtotal')::numeric, 0),
    COALESCE((p_invoice->>'vat_amount')::numeric, 0),
    COALESCE((p_invoice->>'grand_total')::numeric, 0),
    COALESCE(p_invoice->>'header_color', '#1e3a5f'),
    COALESCE(p_invoice->'profile_snapshot', '{}'::jsonb),
    COALESCE(p_invoice->>'status', 'finalized')
  )
  RETURNING id INTO v_invoice_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    INSERT INTO line_items (
      invoice_id,
      sort_order,
      description,
      quantity,
      unit_price,
      line_total
    )
    VALUES (
      v_invoice_id,
      (v_item->>'sort_order')::int,
      v_item->>'description',
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_price')::numeric,
      (v_item->>'line_total')::numeric
    );
  END LOOP;

  RETURN v_invoice_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
