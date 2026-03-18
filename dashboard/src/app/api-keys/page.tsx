import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import CopyButton from '@/components/ui/CopyButton'

export default async function ApiKeysPage({
    searchParams
}: {
    searchParams: { new_secret?: string }
}) {
    const supabase = await createClient()

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
    const rotateSecret = async () => {
        'use server'
        const supabase = await createClient()
        const { data: currentClient } = await supabase.from('clients').select('id').limit(1).single()

        if (currentClient) {
            // Generate a secure random 32-byte secret (like Stripe)
            const rawSecret = `sk_test_${crypto.randomBytes(24).toString('hex')}`

            // Hash the secret using bcrypt so it's safely stored like on the Python side
            const salt = await bcrypt.genSalt(10)
            const secretHash = await bcrypt.hash(rawSecret, salt)

            await supabase.from('clients').update({
                secret_hash: secretHash
            }).eq('id', currentClient.id)

            // Pass the plaintext back via URL params so the user can copy it once
            revalidatePath('/api-keys')
            return redirect(`/api-keys?new_secret=${rawSecret}`)
        }
    }

    const newSecret = searchParams?.new_secret

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col mb-4">
                <h1 className="text-3xl font-bold text-white tracking-tight">API Keys</h1>
                <p className="text-slate-400 mt-2">Manage your NoxPay API credentials for intent generation.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-3xl shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6">Client Credentials</h2>

                {newSecret && (
                    <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-pulse-once">
                        <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            New Secret Generated Successfully!
                        </h3>
                        <p className="text-sm text-emerald-500/80 mb-4">
                            Please copy your new Client Secret now. You will not be able to see it again after you leave this page.
                        </p>
                        <div className="bg-slate-950 border border-emerald-500/50 px-4 py-3 rounded-md font-mono text-sm text-emerald-300 flex justify-between items-center break-all">
                            <span>{newSecret}</span>
                            <CopyButton textToCopy={newSecret} className="text-emerald-400 hover:text-white shrink-0 ml-4 font-bold" />
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-slate-400 block mb-2">Client ID</label>
                        <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-md font-mono text-sm text-slate-300 flex justify-between items-center">
                            <span>{client?.client_id || 'No client registered'}</span>
                            <CopyButton textToCopy={client?.client_id || ''} className="text-violet-400 hover:text-violet-300" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 block mb-2">Client Secret</label>
                        <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-md font-mono text-sm text-slate-600 flex justify-between items-center select-none">
                            <span>****************************************************************</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">For security reasons, your Client Secret cannot be viewed after creation. If you lose it, you must rotate it.</p>
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <form action={rotateSecret}>
                            <button className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-5 py-2.5 rounded-md transition-all text-sm font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                                Rotate Secret Key
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 max-w-3xl">
                <h3 className="text-blue-400 font-medium mb-2 text-sm">Integration Note</h3>
                <p className="text-xs text-blue-500/80 leading-relaxed">
                    Always include your Client ID as the <code>x-client-id</code> header and your Client Secret as the <code>x-client-secret</code> header when making backend API calls to create Payment Intents. Never expose your Client Secret in your frontend Javascript code.
                </p>
            </div>
        </div>
    )
}
