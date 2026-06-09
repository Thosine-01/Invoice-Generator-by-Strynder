-- Atomic draft invoice update with line_items refresh

CREATE OR REPLACE FUNCTION public.update_invoice_with_line_items(
  p_invoice_id uuid,
  p_invoice jsonb,
  p_line_items jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE invoices
  SET
    due_date = NULLIF(p_invoice->>'due_date', '')::date,
    currency = COALESCE(p_invoice->>'currency', 'NGN'),
    client_name = p_invoice->>'client_name',
    client_address = NULLIF(p_invoice->>'client_address', ''),
    client_email = NULLIF(p_invoice->>'client_email', ''),
    client_phone = NULLIF(p_invoice->>'client_phone', ''),
    payment_details = NULLIF(p_invoice->>'payment_details', ''),
    notes = NULLIF(p_invoice->>'notes', ''),
    vat_enabled = COALESCE((p_invoice->>'vat_enabled')::boolean, false),
    vat_rate = COALESCE((p_invoice->>'vat_rate')::numeric, 7.5),
    subtotal = COALESCE((p_invoice->>'subtotal')::numeric, 0),
    vat_amount = COALESCE((p_invoice->>'vat_amount')::numeric, 0),
    grand_total = COALESCE((p_invoice->>'grand_total')::numeric, 0),
    header_color = COALESCE(p_invoice->>'header_color', '#1e3a5f'),
    profile_snapshot = COALESCE(p_invoice->'profile_snapshot', '{}'::jsonb),
    status = COALESCE(p_invoice->>'status', 'draft')
  WHERE id = p_invoice_id
    AND user_id = v_user_id
    AND status = 'draft';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found or not editable';
  END IF;

  DELETE FROM line_items WHERE invoice_id = p_invoice_id;

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
      p_invoice_id,
      (v_item->>'sort_order')::int,
      v_item->>'description',
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_price')::numeric,
      (v_item->>'line_total')::numeric
    );
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
