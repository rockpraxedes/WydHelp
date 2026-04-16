import { useState } from 'react'

// ── DADOS ──────────────────────────────────────────────────────────────────

type ItemType = 'mortal' | 'celestial' | 'reddragon' | 'bahamut'

interface StepConfig {
    label: string
    base: number
    soulBonus?: number
}

const DATA: Record<ItemType, {
    steps: StepConfig[]
    hasSoul: boolean
    soulLabel?: string
    creationRate?: number
    creationLabel?: string
}> = {
    mortal: {
        hasSoul: false,
        steps: [
            { label: '+12', base: 4 },
            { label: '+13', base: 3 },
            { label: '+14', base: 2 },
            { label: '+15', base: 1 },
        ],
    },
    celestial: {
        hasSoul: false,
        creationRate: 100,
        creationLabel: 'Criação do item Celestial',
        steps: [
            { label: '+11 → +12', base: 100 },
            { label: '+12 → +13', base: 96 },
            { label: '+13 → +14', base: 60 },
            { label: '+14 → +15', base: 42 },
        ],
    },
    reddragon: {
        hasSoul: true,
        soulLabel: 'Dragon Soul',
        creationRate: 45,
        creationLabel: 'Composição Red Dragon',
        steps: [
            { label: '+9 → +10', base: 45, soulBonus: 2 },
            { label: '+10 → +11', base: 37.5, soulBonus: 2 },
            { label: '+11 → +12', base: 22.5, soulBonus: 2 },
            { label: '+12 → +13', base: 15, soulBonus: 2 },
            { label: '+13 → +14', base: 10, soulBonus: 1.5 },
            { label: '+14 → +15', base: 5, soulBonus: 1 },
        ],
    },
    bahamut: {
        hasSoul: true,
        soulLabel: 'Bahamut Soul',
        creationRate: 20,
        creationLabel: 'Composição Bahamut',
        steps: [
            { label: '+1 → +5', base: 20, soulBonus: 1 },
            { label: '+5 → +9', base: 15, soulBonus: 1 },
            { label: '+9 → +12', base: 10, soulBonus: 1 },
            { label: '+12 → +13', base: 5, soulBonus: 1 },
            { label: '+13 → +14', base: 5, soulBonus: 0.5 },
            { label: '+14 → +15', base: 5, soulBonus: 0.35 },
        ],
    },
}

// Bônus por pedra abençoada por nível +0 a +9
// Usa-se 4 pedras por tentativa, então bônus total = valor * 4
const BLESSED_BONUS_PER = [ 2, 3, 4, 5, 6, 7, 8, 10, 12, 15 ]

const TYPE_ACCENT: Record<ItemType, string> = {
    mortal: '#16a34a',
    celestial: '#0ea5e9',
    reddragon: '#dc2626',
    bahamut: '#d97706',
}

const TYPE_LABEL: Record<ItemType, string> = {
    mortal: 'Mortal / Arch',
    celestial: 'Celestial',
    reddragon: 'Red Dragon',
    bahamut: 'Bahamut',
}

const TYPE_ORDER: ItemType[] = [ 'mortal', 'celestial', 'reddragon', 'bahamut' ]

// ── COMPONENTE ────────────────────────────────────────────────────────────

export function Craft() {
    const [ itemType, setItemType ] = useState<ItemType>( 'mortal' )
    const [ stepIdx, setStepIdx ] = useState( 0 )
    const [ soulLvl, setSoulLvl ] = useState( 0 )
    const [ blessedLvl, setBlessedLvl ] = useState( 0 )

    const config = DATA[ itemType ]
    const safeStepIdx = Math.min( stepIdx, config.steps.length - 1 )
    const step = config.steps[ safeStepIdx ]
    const accent = TYPE_ACCENT[ itemType ]

    // Cálculo da chance final
    const base = step.base
    let bonus = 0
    let bonusLabel = ''

    if ( config.hasSoul && step.soulBonus ) {
        bonus = parseFloat( ( step.soulBonus * soulLvl ).toFixed( 4 ) )
        bonusLabel = `Bônus ${config.soulLabel} +${soulLvl}`
    } else if ( itemType === 'mortal' ) {
        bonus = BLESSED_BONUS_PER[ blessedLvl ] * 4
        bonusLabel = `4x Ref. Abençoada +${blessedLvl} (${BLESSED_BONUS_PER[ blessedLvl ]}% × 4)`
    }

    const final = Math.min( 100, parseFloat( ( base + bonus ).toFixed( 4 ) ) )

    function handleTypeChange( t: ItemType ) {
        setItemType( t )
        setStepIdx( 0 )
        setSoulLvl( 0 )
        setBlessedLvl( 0 )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">

            {/* Título centralizado */}
            <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Calculadora de Refinação</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Selecione o tipo de item, a etapa e o bônus para ver a chance final.
                </p>
            </div>

            {/* Seletor de tipo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPE_ORDER.map( t => (
                    <button
                        key={t}
                        onClick={() => handleTypeChange( t )}
                        className="py-2.5 px-3 rounded-lg text-sm font-medium border transition-all duration-150"
                        style={itemType === t ? {
                            background: `${TYPE_ACCENT[ t ]}22`,
                            borderColor: TYPE_ACCENT[ t ],
                            color: TYPE_ACCENT[ t ],
                        } : {
                            background: 'transparent',
                            borderColor: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.45)',
                        }}
                    >
                        {TYPE_LABEL[ t ]}
                    </button>
                ) )}
            </div>

            {/* Card principal */}
            <div
                className="rounded-xl border p-5 space-y-5"
                style={{ borderColor: `${accent}30`, background: `${accent}08` }}
            >

                {/* Taxa de criação */}
                {config.creationRate !== undefined && (
                    <div
                        className="flex items-center justify-between rounded-lg px-4 py-2.5 border text-sm"
                        style={{ borderColor: `${accent}30`, background: `${accent}12` }}
                    >
                        <span className="text-muted-foreground">{config.creationLabel}</span>
                        <span className="font-semibold" style={{ color: accent }}>{config.creationRate}%</span>
                    </div>
                )}

                {/* Etapas */}
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Etapa de refinação
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {config.steps.map( ( s, i ) => (
                            <button
                                key={i}
                                onClick={() => setStepIdx( i )}
                                className="px-3 py-1.5 rounded-lg text-sm font-mono transition-all duration-150 border"
                                style={safeStepIdx === i ? {
                                    background: accent,
                                    borderColor: accent,
                                    color: '#fff',
                                } : {
                                    background: 'transparent',
                                    borderColor: 'rgba(255,255,255,0.12)',
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                {s.label}
                            </button>
                        ) )}
                    </div>
                </div>

                {/* Soul selector (RD e Bahamut) */}
                {config.hasSoul && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            {config.soulLabel} nível
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Array.from( { length: 10 }, ( _, i ) => (
                                <button
                                    key={i}
                                    onClick={() => setSoulLvl( i )}
                                    className="w-10 h-10 rounded-lg text-sm font-mono transition-all duration-150 border"
                                    style={soulLvl === i ? {
                                        background: accent,
                                        borderColor: accent,
                                        color: '#fff',
                                    } : {
                                        background: 'transparent',
                                        borderColor: 'rgba(255,255,255,0.12)',
                                        color: 'rgba(255,255,255,0.5)',
                                    }}
                                >
                                    +{i}
                                </button>
                            ) )}
                        </div>
                    </div>
                )}

                {/* Refinação Abençoada (Mortal/Arch) */}
                {itemType === 'mortal' && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Refinação Abençoada nível
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Array.from( { length: 10 }, ( _, i ) => (
                                <button
                                    key={i}
                                    onClick={() => setBlessedLvl( i )}
                                    className="w-10 h-10 rounded-lg text-sm font-mono transition-all duration-150 border"
                                    style={blessedLvl === i ? {
                                        background: accent,
                                        borderColor: accent,
                                        color: '#fff',
                                    } : {
                                        background: 'transparent',
                                        borderColor: 'rgba(255,255,255,0.12)',
                                        color: 'rgba(255,255,255,0.5)',
                                    }}
                                >
                                    +{i}
                                </button>
                            ) )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            4 pedras por tentativa · cada +{blessedLvl} vale {BLESSED_BONUS_PER[ blessedLvl ]}% · total de bônus = {BLESSED_BONUS_PER[ blessedLvl ] * 4}%
                        </p>
                    </div>
                )}

                {/* Resultado */}
                <div
                    className="rounded-lg p-4 border"
                    style={{ borderColor: `${accent}40`, background: `${accent}12` }}
                >
                    <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: accent }}>
                        Resultado — {TYPE_LABEL[ itemType ]}
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Taxa base: <span className="text-foreground font-medium">{base}%</span></p>
                        {bonus > 0 && (
                            <p>{bonusLabel}: <span className="text-foreground font-medium">+{bonus}%</span></p>
                        )}
                    </div>
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: `${accent}30` }}>
                        <p className="text-base font-semibold" style={{ color: accent }}>
                            Chance final: {final}%
                        </p>
                        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${final}%`, background: accent }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Nota Celestial */}
            {itemType === 'celestial' && (
                <p className="text-xs text-muted-foreground text-center">
                    Itens Celestiais não utilizam Soul. A criação do item base tem 100% de sucesso.
                </p>
            )}

        </div>
    )
}