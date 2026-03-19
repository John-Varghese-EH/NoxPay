import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CheckoutPreview from './CheckoutPreview'
import {
    saveProjectName,
    deleteProject,
    saveVpa,
    saveCryptoWallet,
    saveBankDetails,
    saveEmails,
    savePaymentMethods,
    saveCheckoutBranding
} from './actions'
import DeleteProjectButton from './DeleteProjectButton'

export default async function SettingsPage({
    searchParams
}: {
    searchParams: { project?: string, message?: string, error?: string }
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: true })

    const selectedProjectId = searchParams?.project || (clients && clients.length > 0 ? clients[0].id : null)
    const client = clients?.find((c) => c.id === selectedProjectId)

    if (!client && clients && clients.length > 0) {
        return redirect(`/settings?project=${clients[0].id}`)
    } else if (!client) {
        // No projects at all
        return (
            <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-500">Please create a project first.</div>
            </div>
        )
    }

    const bankAccount = client.bank_account || {}
    const emails = client.notification_emails ? client.notification_emails.join(', ') : ''
    const methods = client.payment_methods || { upi: true, usdt: false, bank_transfer: false }

    const msg = searchParams?.message
    const err = searchParams?.error

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Project Settings</h1>
                    <p className="text-slate-400 mt-2">Manage the configuration for your selected project.</p>
                </div>

                {clients && clients.length > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                            <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-[400px] custom-scrollbar hide-scrollbar">
                                {clients.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={`/settings?project=${c.id}`}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${selectedProjectId === c.id
                                            ? 'bg-violet-600 shadow-md text-white'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                            }`}
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {msg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                    {msg}
                </div>
            )}
            {err && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {err}
                </div>
            )}

            {/* General Settings */}
            <div className="glass-card p-6 border-t-2 border-t-slate-700/50 mb-2">
                <h2 className="text-lg font-semibold text-white mb-6">General Information</h2>
                <form action={saveProjectName.bind(null, client.id)} className="flex items-end gap-4 max-w-xl">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-slate-400 block mb-2">Project Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={client.name || ''}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>
                    <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-md px-6 py-2 font-medium transition-colors text-sm">
                        Rename
                    </button>
                </form>
            </div>

            {/* Hosted Checkout Branding - Moved to top for impact */}
            <div className="glass-card p-6 border-t-2 border-t-pink-500/50 mb-8">
                <h2 className="text-lg font-semibold text-white mb-6">Hosted Checkout Branding</h2>
                <form action={saveCheckoutBranding.bind(null, client.id)}>
                    <CheckoutPreview
                        initialColor={client.theme_color || '#7c3aed'}
                        initialLogo={client.logo_url || ''}
                        initialName={client.name || 'Your Brand'}
                    />

                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <label className="text-sm font-medium text-slate-400 block mb-2">Return URL (Optional)</label>
                        <input type="url" name="return_url" defaultValue={client.return_url || ''} placeholder="https://yourbrand.com/success" className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500" />
                        <p className="text-xs text-slate-500 mt-1">Users will be redirected here after payment is complete.</p>

                        <button type="submit" className="bg-pink-600/20 text-pink-400 border border-pink-500/30 hover:bg-pink-600/30 rounded-md px-6 py-2.5 font-medium transition-colors text-sm mt-4">
                            Save Branding
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Multiple Payment Methods Configuration */}
                <div className="glass-card p-6 border-t-2 border-t-sky-500/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Payment Methods</h2>
                    <form action={savePaymentMethods.bind(null, client.id)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="method_upi" defaultChecked={methods.upi} className="w-4 h-4 rounded border-slate-700 text-violet-600 focus:ring-violet-500 bg-slate-950" />
                                <span className="text-sm font-medium text-slate-200">UPI (Unified Payments Interface)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="method_usdt" defaultChecked={methods.usdt} className="w-4 h-4 rounded border-slate-700 text-violet-600 focus:ring-violet-500 bg-slate-950" />
                                <span className="text-sm font-medium text-slate-200">USDT (Crypto)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="method_bank" defaultChecked={methods.bank_transfer} className="w-4 h-4 rounded border-slate-700 text-violet-600 focus:ring-violet-500 bg-slate-950" />
                                <span className="text-sm font-medium text-slate-200">Manual Bank Transfer</span>
                            </label>
                        </div>

                        <button type="submit" className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-md px-4 py-2 mt-4 font-medium transition-colors text-sm w-full">
                            Save Methods
                        </button>
                    </form>
                </div>

                {/* Bank Account Configuration */}
                <div className="glass-card p-6 border-t-2 border-t-emerald-500/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Bank Account Details</h2>
                    <form action={saveBankDetails.bind(null, client.id)} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Account Holder Name</label>
                            <input type="text" name="account_name" defaultValue={bankAccount.account_name || ''} placeholder="John Doe" className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Account Number</label>
                            <input type="text" name="account_number" defaultValue={bankAccount.account_number || ''} placeholder="00000000000" className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">IFSC Code</label>
                            <input type="text" name="ifsc" defaultValue={bankAccount.ifsc || ''} placeholder="SBIN0000001" className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500" required />
                        </div>

                        <button type="submit" className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-md px-4 py-2 mt-2 font-medium transition-colors text-sm w-full">
                            Save Bank Details
                        </button>
                    </form>
                </div>

                {/* Payment Identifiers (UPI & Crypto) */}
                <div className="glass-card p-6 border-t-2 border-t-amber-500/50 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Payment Identifiers</h2>

                        {/* UPI Form */}
                        <form action={saveVpa.bind(null, client.id)} className="flex flex-col gap-3 mb-6">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Default UPI ID (VPA)</label>
                                <input
                                    type="text"
                                    name="upi_vpa"
                                    defaultValue={client.upi_vpa || ''}
                                    placeholder="merchant@upi"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-md px-4 py-2 font-medium transition-colors text-sm w-full">
                                Save VPA
                            </button>
                        </form>

                        {/* Crypto Form */}
                        <form action={saveCryptoWallet.bind(null, client.id)} className="flex flex-col gap-3 pt-6 border-t border-slate-800/50">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Crypto Wallet (USDT TRC20)</label>
                                <input
                                    type="text"
                                    name="crypto_wallet"
                                    defaultValue={client.crypto_wallet || ''}
                                    placeholder="T..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <button type="submit" className="bg-amber-600/20 text-amber-500 border border-amber-500/30 hover:bg-amber-600/30 rounded-md px-4 py-2 font-medium transition-colors text-sm w-full">
                                Save Crypto Wallet
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <h2 className="text-lg font-semibold text-white mb-4">Email Notifications</h2>
                        <form action={saveEmails.bind(null, client.id)} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Alert Emails (Comma separated)</label>
                                <input type="text" name="emails" defaultValue={emails} placeholder="alerts@domain.com, you@domain.com" className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500" />
                            </div>
                            <button type="submit" className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-md px-4 py-2 font-medium transition-colors text-sm w-full">
                                Save Notification Settings
                            </button>
                        </form>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="glass-card p-6 border-t-2 border-t-red-500/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Danger Zone</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Deleting this project will permanently remove all associated payment intents, webhooks, and transactions. This action cannot be undone.
                    </p>
                    <DeleteProjectButton projectId={client.id} />
                </div>
            </div>
        </div>
    )
}
