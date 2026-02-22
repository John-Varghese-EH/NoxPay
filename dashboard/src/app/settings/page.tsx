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

    // Server Action: Save VPA
    const saveVpa = async (formData: FormData) => {
        'use server'
        const vpa = formData.get('upi_vpa') as string
        if (!vpa || !vpa.includes('@')) return redirect('/settings?message=Invalid UPI VPA format')

        const supabase = createClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) return redirect('/login')

        const { data: currentClient } = await supabase
            .from('clients')
            .select('id')
            .limit(1)
            .single()

        if (currentClient) {
            await supabase
                .from('clients')
                .update({ upi_vpa: vpa.trim() })
                .eq('id', currentClient.id)
        }

        revalidatePath('/settings')
        return redirect('/settings?message=VPA saved successfully')
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto">
            <div className="flex flex-col mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-slate-400 mt-2">Manage your NoxPay account and integration preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Profile Settings */}
                <div className="glass-card p-6">
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
                            <p className="text-xs text-slate-500 mt-1">Contact support to change your registered business name.</p>
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
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Rate Limit</label>
                            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-md text-sm text-slate-400">
                                {client?.rate_limit || 100} requests/minute
                            </div>
                        </div>
                    </div>
                </div>

                {/* UPI VPA Configuration */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Default Payment VPA</h2>
                    <form action={saveVpa} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">UPI ID (VPA)</label>
                            <input
                                type="text"
                                name="upi_vpa"
                                defaultValue={client?.upi_vpa || ''}
                                placeholder="merchant@upi"
                                className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-md px-4 py-2 mt-2 font-medium transition-colors text-sm w-full"
                        >
                            Save Default VPA
                        </button>
                    </form>
                    <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-md">
                        <h3 className="text-amber-400 font-medium text-sm mb-1">⚠️ Important</h3>
                        <p className="text-amber-400/70 text-xs leading-relaxed">Ensure your VPA is linked to your monitored bank account. Intents generated without an explicit VPA will use this default.</p>
                    </div>
                </div>

            </div>

            {/* Danger Zone */}
            <div className="mt-8 border border-red-500/20 rounded-xl p-6 bg-red-500/5">
                <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
                <p className="text-sm text-slate-400 mb-4">Irreversible actions that affect your account.</p>
                <div className="flex gap-4">
                    <button className="border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-md transition-colors text-sm font-medium">
                        Deactivate Account
                    </button>
                </div>
            </div>
        </div>
    )
}
