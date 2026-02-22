import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ApiKeysPage() {
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

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto">
            <div className="flex flex-col mb-4">
                <h1 className="text-3xl font-bold text-white tracking-tight">API Keys</h1>
                <p className="text-slate-400 mt-2">Manage your VoidPay API credentials for intent generation.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-3xl">
                <h2 className="text-xl font-semibold text-white mb-6">Client Credentials</h2>

                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-slate-400 block mb-2">Client ID</label>
                        <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-md font-mono text-sm text-slate-300 flex justify-between items-center">
                            <span>{client?.client_id || 'No client registered'}</span>
                            <button className="text-violet-400 hover:text-violet-300 text-xs uppercase tracking-wider font-semibold">Copy</button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 block mb-2">Client Secret</label>
                        <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-md font-mono text-sm text-slate-500 flex justify-between items-center">
                            <span>********************************</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">For security reasons, your Client Secret cannot be viewed after creation. If you lose it, you must rotate it.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <form action="">
                            <button className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-md transition-colors text-sm font-medium">
                                Rotate Secret
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
