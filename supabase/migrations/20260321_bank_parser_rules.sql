-- Add custom bank email parser rules column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS bank_parser_rules JSONB DEFAULT '[]';

-- Each element in the array is an object:
-- {
--   "bank_name": "ICICI",
--   "detect_keyword": "icici bank",
--   "amount_regex": "Rs\\.? ?([\\d,]+\\.\\d{2})",
--   "utr_regex": "Ref No[:\\.] ?(\\d{12})",
--   "sender_regex": "from ([\\w\\.\\-]+@\\w+)",       (optional)
--   "remark_regex": "Remark[:\\.] ?([\\w\\-]+)"         (optional)
-- }
