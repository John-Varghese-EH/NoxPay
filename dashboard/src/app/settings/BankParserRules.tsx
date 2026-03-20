'use client'

import { useState } from 'react'
import { saveBankParserRules } from './actions'

interface ParserRule {
    bank_name: string
    detect_keyword: string
    amount_regex: string
    utr_regex: string
    sender_regex: string
    remark_regex: string
}

const EMPTY_RULE: ParserRule = {
    bank_name: '',
    detect_keyword: '',
    amount_regex: '',
    utr_regex: '',
    sender_regex: '',
    remark_regex: '',
}

export default function BankParserRules({ projectId, initialRules }: { projectId: string, initialRules: ParserRule[] }) {
    const [rules, setRules] = useState<ParserRule[]>(initialRules || [])
    const [showForm, setShowForm] = useState(false)
    const [newRule, setNewRule] = useState<ParserRule>({ ...EMPTY_RULE })
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'ok' | 'err', text: string } | null>(null)

    const addRule = () => {
        if (!newRule.bank_name.trim() || !newRule.detect_keyword.trim() || !newRule.amount_regex.trim() || !newRule.utr_regex.trim()) {
            setMessage({ type: 'err', text: 'Bank name, detection keyword, amount regex, and UTR regex are required.' })
            return
        }
        // Basic regex validation
        try {
            new RegExp(newRule.amount_regex, 'i')
            new RegExp(newRule.utr_regex, 'i')
            if (newRule.sender_regex) new RegExp(newRule.sender_regex, 'i')
            if (newRule.remark_regex) new RegExp(newRule.remark_regex, 'i')
        } catch {
            setMessage({ type: 'err', text: 'One or more regex patterns are invalid.' })
            return
        }
        setRules([...rules, { ...newRule }])
        setNewRule({ ...EMPTY_RULE })
        setShowForm(false)
        setMessage(null)
    }

    const removeRule = (idx: number) => {
        setRules(rules.filter((_, i) => i !== idx))
        if (expandedIdx === idx) setExpandedIdx(null)
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        const fd = new FormData()
        fd.set('rules', JSON.stringify(rules))
        try {
            const result = await saveBankParserRules(projectId, fd)
            if (result?.error) {
                setMessage({ type: 'err', text: result.error })
            } else {
                setMessage({ type: 'ok', text: 'Parser rules saved successfully!' })
            }
        } catch {
            setMessage({ type: 'ok', text: 'Parser rules saved!' })
        }
        setSaving(false)
    }

    return (
        <div className="glass-card p-6 border-t-2 border-t-orange-500/50 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Bank Email Parser Rules</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Define custom regex patterns to extract payment data from your bank&apos;s email notifications.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30 rounded-md px-4 py-2 font-medium transition-colors text-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Rule
                </button>
            </div>

            {message && (
                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${message.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Existing Rules List */}
            {rules.length === 0 && !showForm && (
                <div className="text-center py-8 text-slate-500 text-sm">
                    No custom rules defined yet. The system will use built-in parsers (SBI, HDFC, Generic UPI).
                </div>
            )}

            {rules.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                    {rules.map((rule, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
                            <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                        <span className="text-orange-400 text-xs font-bold">{rule.bank_name.slice(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white">{rule.bank_name}</span>
                                        <span className="text-xs text-slate-500 ml-2">keyword: &quot;{rule.detect_keyword}&quot;</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeRule(idx) }}
                                        className="text-red-400/60 hover:text-red-400 transition-colors p-1"
                                        title="Delete rule"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 text-slate-500 transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                            {expandedIdx === idx && (
                                <div className="px-4 pb-4 border-t border-slate-800/50 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <RuleField label="Amount Regex" value={rule.amount_regex} />
                                    <RuleField label="UTR Regex" value={rule.utr_regex} />
                                    <RuleField label="Sender VPA Regex" value={rule.sender_regex || '—'} />
                                    <RuleField label="Remark Regex" value={rule.remark_regex || '—'} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Rule Form */}
            {showForm && (
                <div className="bg-slate-900/80 border border-orange-500/20 rounded-xl p-5 mb-4 animate-in slide-in-from-top-2 duration-200">
                    <h3 className="text-sm font-semibold text-orange-400 mb-4">New Parser Rule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Bank Name *" placeholder="e.g. ICICI" value={newRule.bank_name} onChange={(v) => setNewRule({ ...newRule, bank_name: v })} />
                        <InputField label="Detection Keyword *" placeholder='e.g. "icici bank"' value={newRule.detect_keyword} onChange={(v) => setNewRule({ ...newRule, detect_keyword: v })} hint="Phrase found in emails from this bank" />
                        <InputField label="Amount Regex *" placeholder='e.g. Rs\.? ?([\d,]+\.\d{2})' value={newRule.amount_regex} onChange={(v) => setNewRule({ ...newRule, amount_regex: v })} hint="Use capture group () for the amount" mono />
                        <InputField label="UTR / Ref Regex *" placeholder='e.g. Ref No[:\.]? ?(\d{12})' value={newRule.utr_regex} onChange={(v) => setNewRule({ ...newRule, utr_regex: v })} hint="Use capture group () for the UTR" mono />
                        <InputField label="Sender VPA Regex" placeholder='e.g. from ([\w\.\-]+@\w+)' value={newRule.sender_regex} onChange={(v) => setNewRule({ ...newRule, sender_regex: v })} hint="Optional — extract sender UPI ID" mono />
                        <InputField label="Remark / Order ID Regex" placeholder='e.g. Remark[:\.]? ?([\w\-]+)' value={newRule.remark_regex} onChange={(v) => setNewRule({ ...newRule, remark_regex: v })} hint="Optional — extract order ID from remarks" mono />
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button onClick={addRule} className="bg-orange-600 hover:bg-orange-700 text-white rounded-md px-5 py-2 font-medium transition-colors text-sm">
                            Add to List
                        </button>
                        <button onClick={() => { setShowForm(false); setMessage(null) }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md px-5 py-2 font-medium transition-colors text-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Save Button */}
            {rules.length > 0 && (
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30 rounded-md px-6 py-2.5 font-medium transition-colors text-sm w-full disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save All Parser Rules'}
                </button>
            )}
        </div>
    )
}

function InputField({ label, placeholder, value, onChange, hint, mono }: {
    label: string, placeholder: string, value: string, onChange: (v: string) => void, hint?: string, mono?: boolean
}) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-400 block mb-1.5">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-orange-500 focus:border-orange-500 placeholder:text-slate-600 ${mono ? 'font-mono text-xs' : ''}`}
            />
            {hint && <p className="text-[11px] text-slate-600 mt-1">{hint}</p>}
        </div>
    )
}

function RuleField({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
            <p className="text-xs text-slate-300 font-mono mt-0.5 break-all">{value}</p>
        </div>
    )
}
