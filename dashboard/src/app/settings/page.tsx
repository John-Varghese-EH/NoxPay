import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function SettingsPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: client } = await supabase
        .from('clients')
        .select('*')
        .limit(1)
        .single()

    // --- Server Actions ---

    const saveVpa = async (formData: FormData) => {
        'use server'
        const vpa = formData.get('upi_vpa') as string
        if (!vpa || !vpa.includes('@')) return redirect('/settings?message=Invalid UPI VPA format')

        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) return redirect('/login')

        const { data: currentClient } = await supabase.from('clients').select('id').limit(1).single()

        if (currentClient) {
            await supabase.from('clients').update({ upi_vpa: vpa.trim() }).eq('id', currentClient.id)
        }

        revalidatePath('/settings')
        return redirect('/settings?message=VPA saved successfully')
    }

    const saveCryptoWallet = async (formData: FormData) => {
        'use server'
        const wallet = formData.get('crypto_wallet') as string
        if (!wallet) return redirect('/settings?message=Wallet address required')

        const supabase = createClient()
        const { data: currentClient } = await supabase.from('clients').select('id').limit(1).single()

        if (currentClient) {
            await supabase.from('clients').update({ crypto_wallet: wallet.trim() }).eq('id', currentClient.id)
        }

        revalidatePath('/settings')
        return redirect('/settings?message=Crypto wallet saved successfully')
    }

    const saveBankDetails = async (formData: FormData) => {
        'use server'
        const account_name = formData.get('account_name') as string
        const account_number = formData.get('account_number') as string
        const ifsc = formData.get('ifsc') as string

        const supabase = createClient()
        const { data: currentClient } = await supabase.from('clients').select('id').limit(1).single()

        if (currentClient) {
            await supabase.from('clients').update({
                bank_account: { account_name, account_number, ifsc }
            }).eq('id', currentClient.id)
        }

        revalidatePath('/settings')
        return redirect('/settings?message=Bank details updated')
    }

    const saveEmails = async (formData: FormData) => {
        'use server'
        const emailsStr = formData.get('emails') as string
        const emails = emailsStr.split(',').map(e => e.trim()).filter(e => e)

        const supabase = createClient()
        const { data: currentClient } = await supabase.from('clients').select('id').limit(1).single()

        if (currentClient) {
            await supabase.from('clients').update({
                notification_emails: emails
            }).eq('id', currentClient.id)
        }

        revalidatePath('/settings')
        return redirect('/settings?message=Notification emails updated')
    }

    const savePaymentMethods = async (formData: FormData) => {
        'use server'
        const upi = formData.get('method_upi') === 'on'
        const usdt = formData.get('method_usdt') === 'on'
        const bank_transfer = formData.get('method_bank') === 'on'

        const supabase = createClient()
        const { data: currentClient } = await supabase.from('clients').select('id').limit(1).single()

        if (currentClient) {
            await supabase.from('clients').update({
                payment_methods: { upi, usdt, bank_transfer }
            }).eq('id', currentClient.id)
        }

        revalidatePath('/settings')
        return redirect('/settings?message=Payment methods updated')
    }

    const saveCheckoutBranding = async (formData: FormData) => {
        'use server'
        const theme_color = formData.get('theme_color') as string
        const logo_url = formData.get('logo_url') as string
        const return_url = formData.get('return_url') as string

        const supabase = createClient()
        const { data: currentClient } = await supabase.from('clients').select('id').limit(1).single()

        if (currentClient) {
            await supabase.from('clients').update({
                theme_color,
                logo_url,
                return_url
            }).eq('id', currentClient.id)
        }

        revalidatePath('/settings')
        return redirect('/settings?message=Checkout branding updated')
    }


    const bankAccount = client?.bank_account || {}
    const emails = client?.notification_emails ? client.notification_emails.join(', ') : ''
    const methods = client?.payment_methods || { upi: true, usdt: false, bank_transfer: false }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-slate-400 mt-2">Manage your NoxPay account, bank details, and integration preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Profile Settings */}
                <div className="glass-card p-6 border-t-2 border-t-slate-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Merchant Profile</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Merchant Name</label>
                            <input
                                type="text"
                                defaultValue={client?.name || ''}
                                readOnly
                                className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Account Email</label>
                            <input
                                type="email"
                                defaultValue={user.email || ''}
                                disabled
                                className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Client ID</label>
                            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-md font-mono text-xs text-slate-400">
                                {client?.client_id || 'Not registered'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Branding */}
                <div className="glass-card p-6 border-t-2 border-t-pink-500/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Hosted Checkout UI</h2>
                    <form action={saveCheckoutBranding} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Theme Color (Hex)</label>
                            <div className="flex gap-3">
                                <input type="color" name="theme_color_picker" defaultValue={client?.theme_color || '#7c3aed'} className="w-10 h-10 rounded border-none bg-transparent cursor-pointer" onChange={(e) => {
                                    const input = e.target.nextElementSibling as HTMLInputElement;
                                    if (input) input.value = e.target.value;
                                }} />
                                <input type="text" name="theme_color" defaultValue={client?.theme_color || '#7c3aed'} placeholder="#7c3aed" className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500 font-mono" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Brand Logo URL</label>
                            <input type="url" name="logo_url" defaultValue={client?.logo_url || ''} placeholder="https://yourbrand.com/logo.png" className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Return URL (Optional)</label>
                            <input type="url" name="return_url" defaultValue={client?.return_url || ''} placeholder="https://yourbrand.com/success" className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500" />
                            <p className="text-xs text-slate-500 mt-1">Users will be redirected here after payment</p>
                        </div>

                        <button type="submit" className="bg-pink-600/20 text-pink-400 border border-pink-500/30 hover:bg-pink-600/30 rounded-md px-4 py-2 font-medium transition-colors text-sm w-full mt-2">
                            Save Branding
                        </button>
                    </form>
                </div>

                {/* Multiple Payment Methods Configuration */}
                <div className="glass-card p-6 border-t-2 border-t-sky-500/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Payment Methods</h2>
                    <form action={savePaymentMethods} className="flex flex-col gap-4">
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
                    <form action={saveBankDetails} className="flex flex-col gap-4">
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
                        <form action={saveVpa} className="flex flex-col gap-3 mb-6">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Default UPI ID (VPA)</label>
                                <input
                                    type="text"
                                    name="upi_vpa"
                                    defaultValue={client?.upi_vpa || ''}
                                    placeholder="merchant@upi"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-md px-4 py-2 font-medium transition-colors text-sm w-full">
                                Save VPA
                            </button>
                        </form>

                        {/* Crypto Form */}
                        <form action={saveCryptoWallet} className="flex flex-col gap-3 pt-6 border-t border-slate-800/50">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Crypto Wallet (USDT TRC20)</label>
                                <input
                                    type="text"
                                    name="crypto_wallet"
                                    defaultValue={client?.crypto_wallet || ''}
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
                        <form action={saveEmails} className="flex flex-col gap-4">
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

            </div>
        </div>
    )
}
