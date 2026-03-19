import path from 'path';
import fs from 'fs';
import Link from "next/link";

const DOCS_DOMAIN = "https://john-varghese-eh.github.io/NoxPay/";

const categories = [
  {
    title: "Core Architecture",
    description:
      "Learn the fundamentals of NoxPay architecture, zero-trust security, and how to get everything running.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    accentType: "violet",
    items: [
      {
        title: "Getting Started",
        desc: "Deploy database, API, and worker.",
        href: "/docs/getting-started",
      },
      {
        title: "Security & Compliance",
        desc: "RLS policies & HMAC hashing.",
        href: "/docs/security-compliance",
      },
      {
        title: "Advanced Config",
        desc: "Environment variables & setup.",
        href: "/docs/advanced-config",
      },
    ],
  },
  {
    title: "Integrations & API",
    description:
      "Build secure, real-time payment checkouts directly into your application using our REST APIs.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    accentType: "blue",
    items: [
      {
        title: "API Reference",
        desc: "Create intents, webhooks & REST API.",
        href: "/docs/api-reference",
      },
      {
        title: "Checkout Experience",
        desc: "Hosted checkout, QR codes & widgets.",
        href: "/docs/checkout-experience",
      },
      {
        title: "Webhook Verification",
        desc: "Verify HMAC-SHA256 signatures.",
        href: "/docs/webhook_verification",
      },
    ],
  },
  {
    title: "Verification Workers",
    description:
      "Understand how NoxPay continuously polls for bank emails and blockchain events without human intervention.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    accentType: "emerald",
    items: [
      {
        title: "Worker — UPI (Email)",
        desc: "IMAP bank email detection.",
        href: "/docs/worker-upi",
      },
      {
        title: "Worker — Crypto",
        desc: "Blockchain RPC polling.",
        href: "/docs/worker-crypto",
      },
      {
        title: "Troubleshooting",
        desc: "Logs, debugging, and edge cases.",
        href: "/docs/troubleshooting",
      },
    ],
  },
];

const quickLinks = [
  { title: "API Endpoints", icon: "📡", href: "/docs/api-reference" },
  { title: "Postman Collection", icon: "📝", href: "/docs/getting-started" },
  { title: "Authentication", icon: "🔐", href: "/docs/security-compliance" },
  { title: "Webhooks", icon: "🔗", href: "/docs/webhook_verification" },
];

function getAccentClasses(type: string) {
  switch (type) {
    case "violet":
      return {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/20",
        hoverBorder: "group-hover:border-violet-500/40",
        gradient: "from-violet-500/10 to-transparent",
        hoverGradient: "group-hover:from-violet-500/20",
      };
    case "blue":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
        hoverBorder: "group-hover:border-blue-500/40",
        gradient: "from-blue-500/10 to-transparent",
        hoverGradient: "group-hover:from-blue-500/20",
      };
    case "emerald":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        hoverBorder: "group-hover:border-emerald-500/40",
        gradient: "from-emerald-500/10 to-transparent",
        hoverGradient: "group-hover:from-emerald-500/20",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        border: "border-slate-500/20",
        hoverBorder: "group-hover:border-slate-500/40",
        gradient: "from-slate-500/10 to-transparent",
        hoverGradient: "group-hover:from-slate-500/20",
      };
  }
}

async function getReadmeContent() {
  try {
    const filePath = path.join(process.cwd(), "../README.md");
    let mdContent = fs.readFileSync(filePath, "utf8");
    mdContent = mdContent.replace(
      /dashboard\/src\/app\/icon\.svg/g,
      "https://raw.githubusercontent.com/John-Varghese-EH/NoxPay/main/dashboard/src/app/icon.svg",
    );
    return mdContent;
  } catch (error: any) {
    return "# README tracked failed: " + error.message;
  }
}

export default async function DocsPage() {
  const readmeContent = await getReadmeContent();
  return (
    <div className="min-h-screen bg-[#020617] relative isolate overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-x-0 top-0 h-96 overflow-hidden -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-600/30 to-transparent blur-[100px] rounded-full mix-blend-screen"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-400 mb-8 tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            NoxPay Developer Hub
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Documentation
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            Everything you need to build, scale, and integrate sovereign payment
            infrastructure into your technical stack.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`${DOCS_DOMAIN}/docs/introduction`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)] text-lg"
            >
              Start Reading
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
            <a
              href="https://github.com/John-Varghese-EH/NoxPay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-medium transition-colors hover:border-slate-600 text-lg"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
          {quickLinks.map((link) => (
            <a
              key={link.title}
              href={`${DOCS_DOMAIN}${link.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row items-center sm:justify-start justify-center gap-3 p-5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-violet-500/40 hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(124,58,237,0.05)] transition-all"
            >
              <span className="text-2xl sm:text-xl group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-violet-300 transition-colors text-center sm:text-left">
                {link.title}
              </span>
            </a>
          ))}
        </div>

        {/* Main Categories */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 fill-mode-both">
          {categories.map((category) => {
            const accent = getAccentClasses(category.accentType);
            return (
              <div
                key={category.title}
                className={`group relative bg-[#0B1120] border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 ${accent.hoverBorder} hover:shadow-2xl`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} ${accent.hoverGradient} transition-colors duration-500 opacity-50`}
                ></div>

                <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row gap-10">
                  <div className="lg:w-1/3 flex flex-col justify-center">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border ${accent.bg} ${accent.text} ${accent.border}`}
                    >
                      {category.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">
                      {category.title}
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {category.description}
                    </p>
                  </div>

                  <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.items.map((item) => (
                      <a
                        key={item.title}
                        href={`${DOCS_DOMAIN}${item.href}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col justify-center p-5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-600 hover:bg-slate-800/60 transition-all group/item hover:-translate-y-0.5"
                      >
                        <h3 className="text-base font-semibold text-slate-200 group-hover/item:text-white flex items-center gap-2 mb-2 transition-colors">
                          {item.title}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-violet-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </h3>
                        <p className="text-sm text-slate-500 group-hover/item:text-slate-400 transition-colors line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Project README Markdown Section */}
        <div className="mt-24 mb-10 w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-8 lg:p-14 shadow-2xl animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 fill-mode-both">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800/60">
            <svg
              className="w-8 h-8 text-violet-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Project README
            </h2>
          </div>
          <div className="prose prose-invert prose-violet max-w-none hover:prose-a:text-violet-300 prose-img:rounded-xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {readmeContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-24 text-center border-t border-slate-800/60 pt-10">
          <div className="flex justify-center mb-4">
            <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-500">
              v1.0.0
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Self-hosted documentation powered by{" "}
            <a
              href="https://docusaurus.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-500 hover:text-violet-400 hover:underline transition-colors font-medium"
            >
              Docusaurus
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
