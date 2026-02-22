import urllib.parse
import base64
import io
import qrcode

def generate_upi_uri(
    pa: str,        # Payee VPA
    pn: str,        # Payee Name 
    am: float,      # Amount
    tr: str,        # Transaction Ref ID (Intent ID / Order ID)
    cu: str = "INR" # Currency
) -> str:
    """
    Generates a UPI intent URI.
    Format: upi://pay?pa=...&pn=...&am=...&cu=INR&tr=...
    The 'tr' or 'tn' parameter is critical for idempotency and matching.
    Here we use 'tn' (transaction note) as well to ensure order_id is visible to user and parser.
    """
    base = "upi://pay"
    tn_value = f"NOXPAY-{tr}-source-website/custom-dev-fixed-note"
    params = {
        "pa": pa,
        "pn": pn,
        "am": f"{am:.2f}",
        "cu": cu,
        "tr": tr,
        "tn": tn_value # Put Custom Note with Order ID in the note
    }
    
    query = urllib.parse.urlencode(params)
    return f"{base}?{query}"

def generate_qr_base64(uri: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")
