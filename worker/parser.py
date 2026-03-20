import re
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class ParsedTransaction:
    def __init__(self, amount: float, utr: str, order_id: Optional[str] = None, sender_vpa: Optional[str] = None, bank_source: str = ""):
        self.amount = amount
        self.utr = utr
        self.order_id = order_id  # Extracted from remarks/notes if possible
        self.sender_vpa = sender_vpa
        self.bank_source = bank_source
        
    def __repr__(self):
        return f"<ParsedTransaction UTR:{self.utr} Amt:{self.amount} Bank:{self.bank_source}>"

class BankParser(ABC):
    @property
    @abstractmethod
    def bank_name(self) -> str:
        pass

    @abstractmethod
    def can_parse(self, text: str) -> bool:
        pass

    @abstractmethod
    def parse(self, text: str) -> Optional[ParsedTransaction]:
        pass

# --- Bank Implementations ---

class SBIParser(BankParser):
    @property
    def bank_name(self) -> str: return "SBI"

    def can_parse(self, text: str) -> bool:
        return "state bank of india" in text.lower() or "sbi" in text.lower()

    def parse(self, text: str) -> Optional[ParsedTransaction]:
        # Example dummy regex for SBI UPI alert
        # Needs to be tuned against real emails
        amount_match = re.search(r"Rs\.? ?([\d,]+\.\d{2})", text, re.IGNORECASE)
        utr_match = re.search(r"Ref No[:\.]? ?(\d{12})", text, re.IGNORECASE)
        vpa_match = re.search(r"from ([\w\.\-]+@\w+)", text, re.IGNORECASE)
        remark_match = re.search(r"Remark[:\.]? ?([\w\-]+)", text, re.IGNORECASE)
        
        if amount_match and utr_match:
            amount = float(amount_match.group(1).replace(",", ""))
            utr = utr_match.group(1)
            vpa = vpa_match.group(1) if vpa_match else None
            # The remark often contains our order_id in UPI intent
            order_id = remark_match.group(1) if remark_match else None
            return ParsedTransaction(amount, utr, order_id, vpa, self.bank_name)
        return None

class HDFCParser(BankParser):
    @property
    def bank_name(self) -> str: return "HDFC"

    def can_parse(self, text: str) -> bool:
        return "hdfc bank" in text.lower()

    def parse(self, text: str) -> Optional[ParsedTransaction]:
        amount_match = re.search(r"INR ?([\d,]+\.\d{2})", text, re.IGNORECASE)
        utr_match = re.search(r"UPI Ref No\.? ?(\d{12})", text, re.IGNORECASE)
        remark_match = re.search(r"remarks[:\s]*([\w\-]+)", text, re.IGNORECASE)
        
        if amount_match and utr_match:
            amount = float(amount_match.group(1).replace(",", ""))
            return ParsedTransaction(amount, utr_match.group(1), remark_match.group(1) if remark_match else None, bank_source=self.bank_name)
        return None

# Placeholder for others...
class GenericUPIParser(BankParser):
    @property
    def bank_name(self) -> str: return "Generic"

    def can_parse(self, text: str) -> bool:
        return "upi" in text.lower() and "credited" in text.lower()

    def parse(self, text: str) -> Optional[ParsedTransaction]:
        amount_match = re.search(r"(?:rs|inr)\.? ?([\d,]+\.\d{2})", text, re.IGNORECASE)
        utr_match = re.search(r"(?:ref no|utr)[\s:\.]*(\d{12})", text, re.IGNORECASE)
        
        if amount_match and utr_match:
            amount = float(amount_match.group(1).replace(",", ""))
            return ParsedTransaction(amount, utr_match.group(1), bank_source=self.bank_name)
        return None


# --- Custom Parser (loaded from DB) ---

class CustomParser(BankParser):
    """A parser built dynamically from merchant-defined regex rules stored in the database."""

    def __init__(self, rule: Dict[str, Any]):
        self._bank_name = rule.get("bank_name", "Custom")
        self._detect_keyword = rule.get("detect_keyword", "").lower()
        self._amount_regex = rule.get("amount_regex", "")
        self._utr_regex = rule.get("utr_regex", "")
        self._sender_regex = rule.get("sender_regex", "")
        self._remark_regex = rule.get("remark_regex", "")

    @property
    def bank_name(self) -> str:
        return self._bank_name

    def can_parse(self, text: str) -> bool:
        return self._detect_keyword in text.lower()

    def parse(self, text: str) -> Optional[ParsedTransaction]:
        try:
            amount_match = re.search(self._amount_regex, text, re.IGNORECASE) if self._amount_regex else None
            utr_match = re.search(self._utr_regex, text, re.IGNORECASE) if self._utr_regex else None

            if amount_match and utr_match:
                amount = float(amount_match.group(1).replace(",", ""))
                utr = utr_match.group(1)

                vpa = None
                if self._sender_regex:
                    vpa_match = re.search(self._sender_regex, text, re.IGNORECASE)
                    vpa = vpa_match.group(1) if vpa_match else None

                order_id = None
                if self._remark_regex:
                    remark_match = re.search(self._remark_regex, text, re.IGNORECASE)
                    order_id = remark_match.group(1) if remark_match else None

                return ParsedTransaction(amount, utr, order_id, vpa, self.bank_name)
        except Exception as e:
            logger.warning(f"Custom parser '{self._bank_name}' error: {e}")
        return None


# --- Main Registry ---

class ParserRegistry:
    BUILTIN_PARSERS = [
        SBIParser(),
        HDFCParser(),
        GenericUPIParser() # Fallback
    ]

    @classmethod
    def _build_parsers(cls, custom_rules: Optional[list] = None) -> list:
        """Build the parser chain: custom rules first, then built-in parsers."""
        parsers = []
        if custom_rules:
            for rule in custom_rules:
                try:
                    parsers.append(CustomParser(rule))
                except Exception as e:
                    logger.warning(f"Failed to load custom parser rule: {e}")
        parsers.extend(cls.BUILTIN_PARSERS)
        return parsers

    @classmethod
    def detect(cls, email_body: str, custom_rules: Optional[list] = None) -> Optional[BankParser]:
        for parser in cls._build_parsers(custom_rules):
            if parser.can_parse(email_body):
                return parser
        return None

    @classmethod
    def process(cls, email_body: str, custom_rules: Optional[list] = None) -> Optional[ParsedTransaction]:
        """Iterates through parsers (custom first, then built-in) and returns the first valid ParsedTransaction."""
        for parser in cls._build_parsers(custom_rules):
            if parser.can_parse(email_body):
                result = parser.parse(email_body)
                if result:
                    logger.info(f"Transaction parsed successfully by {parser.bank_name}: {result}")
                    return result
        logger.warning("No parser could extract transaction data from email.")
        return None

