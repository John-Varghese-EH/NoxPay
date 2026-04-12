import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free UPI Payment Link Generator | Create UPI QR Code | NoxPay',
  description:
    'Create free UPI payment links and QR codes instantly. Share with anyone to receive payments via Google Pay, PhonePe, Paytm, BHIM - no app or account needed. Enter your VPA/UPI ID, set amount & note, and generate a shareable link in seconds.',
  keywords: [
    'UPI payment link',
    'UPI link generator',
    'free UPI payment link',
    'create UPI QR code',
    'UPI payment QR code',
    'share UPI link',
    'UPI ID payment',
    'VPA payment link',
    'Google Pay link',
    'PhonePe payment link',
    'Paytm payment link',
    'BHIM UPI link',
    'UPI payment request',
    'receive UPI payment',
    'UPI deep link',
    'online UPI payment',
    'NoxPay UPI',
    'free payment link generator',
    'UPI QR code generator',
    'send UPI payment link',
    'UPI collect request',
    'digital payment India',
    'cashless payment link',
    'instant UPI payment',
  ],
  applicationName: 'NoxPay',
  authors: [{ name: 'NoxPay', url: 'https://github.com/John-Varghese-EH/NoxPay' }],
  creator: 'NoxPay',
  publisher: 'NoxPay',
  category: 'Finance',
  classification: 'Business/Finance',

  // Open Graph
  openGraph: {
    title: 'Free UPI Payment Link Generator - NoxPay',
    description:
      'Create shareable UPI payment links instantly. No signup needed. Works with Google Pay, PhonePe, Paytm, BHIM & all UPI apps.',
    url: 'https://nox-pay.vercel.app/upi',
    siteName: 'NoxPay',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: 'https://nox-pay.vercel.app/og-upi.png',
        width: 1200,
        height: 630,
        alt: 'NoxPay - Free UPI Payment Link Generator',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Free UPI Payment Link Generator - NoxPay',
    description:
      'Generate shareable UPI payment links & QR codes for free. Works with all UPI apps. No account required.',
    images: ['https://nox-pay.vercel.app/og-upi.png'],
    creator: '@noxpay',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Alternates & Canonical
  alternates: {
    canonical: 'https://nox-pay.vercel.app/upi',
    languages: {
      'en-IN': 'https://nox-pay.vercel.app/upi',
      'en': 'https://nox-pay.vercel.app/upi',
    },
  },

  // Verification (add your codes later)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  other: {
    // GEO targeting - UPI is India specific
    'geo.region': 'IN',
    'geo.country': 'IN',
    'geo.placename': 'India',
    'ICBM': '20.5937, 78.9629',
    'geo.position': '20.5937;78.9629',
    'content-language': 'en-IN',
    'distribution': 'global',
    'rating': 'general',
    'revisit-after': '3 days',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'UPI Link Generator',
    'format-detection': 'telephone=no',
  },
}

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NoxPay UPI Payment Link Generator',
  description:
    'Create free UPI payment links and QR codes. Share with anyone to receive payments via any UPI app - Google Pay, PhonePe, Paytm, BHIM.',
  url: 'https://nox-pay.vercel.app/upi',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  creator: {
    '@type': 'Organization',
    name: 'NoxPay',
    url: 'https://github.com/John-Varghese-EH/NoxPay',
  },
  featureList: [
    'Create UPI payment links',
    'Generate UPI QR codes',
    'No account required',
    'Works with all UPI apps',
    'Custom amount and note support',
    'URL parameter driven',
    'Instant sharing',
  ],
  screenshot: 'https://nox-pay.vercel.app/og-upi.png',
  softwareVersion: '1.0',
  isAccessibleForFree: true,
  inLanguage: 'en-IN',
  countryOfOrigin: {
    '@type': 'Country',
    name: 'India',
  },
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a UPI payment link?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A UPI payment link is a shareable URL that allows anyone to pay you directly to your UPI ID (VPA). When someone clicks the link, it opens their UPI app with pre-filled payment details.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is NoxPay UPI Link Generator free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, it is 100% free. No account, no signup, no fees. Create unlimited UPI payment links and QR codes at no cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which UPI apps are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The generated links work with all UPI apps including Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, MobiKwik, and any other UPI-enabled application.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data saved or stored?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. NoxPay does not save any data. All payment information (VPA, amount, note) is encoded directly in the URL. Nothing is stored on any server.',
      },
    },
    {
      '@type': 'Question',
      name: 'How to create a UPI payment link?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter your UPI ID (e.g., name@upi), optionally set an amount and note, then click Generate. You will get a shareable link and QR code instantly.',
      },
    },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'NoxPay',
      item: 'https://nox-pay.vercel.app',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'UPI Link Generator',
      item: 'https://nox-pay.vercel.app/upi',
    },
  ],
}

export default function UpiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  )
}
