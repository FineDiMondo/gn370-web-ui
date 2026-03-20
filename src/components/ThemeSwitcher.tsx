import React, { useEffect } from 'react';
import type { ThemeType } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { Settings } from 'lucide-react';

const themes: { id: ThemeType; label: string }[] = [
    { id: '370', label: 'Mainframe 3270' },
    { id: 'risorgimentale', label: 'Risorgimentale' },
    { id: 'palermitano', label: 'Gattopardo' },
    { id: 'veronese', label: 'Veronese' },
];

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const hasUserTheme = localStorage.getItem('gn370-theme') !== null;

    // Keyboard support: ESC to close
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '50px',
                        right: '0',
                        backgroundColor: 'var(--bg-color)',
                        border: 'var(--border-style)',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--box-shadow)',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        minWidth: '200px'
                    }}
                    role="menu"
                    aria-label="Selezione tema"
                >
                    <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--secondary-color)', paddingBottom: '5px', margin: '0' }}>
                        SELEZIONA STILE
                    </h3>

                    {/* Auto-detect option */}
                    <button
                        onClick={() => {
                            localStorage.removeItem('gn370-theme');
                            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                            const autoTheme = darkModeQuery.matches ? '370' : 'palermitano';
                            setTheme(autoTheme);
                            setIsOpen(false);
                        }}
                        style={{
                            textAlign: 'left',
                            padding: '8px',
                            backgroundColor: !hasUserTheme ? 'var(--btn-bg)' : 'transparent',
                            color: !hasUserTheme ? 'var(--btn-text)' : 'var(--text-color)',
                            border: '1px solid var(--secondary-color)',
                            borderRadius: 'var(--border-radius)',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        role="menuitem"
                        aria-label="Usa tema di sistema automatico"
                    >
                        {!hasUserTheme ? '> ' : '  '}🔄 Auto (Sistema)
                    </button>

                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                localStorage.setItem('gn370-theme', t.id);
                                setTheme(t.id);
                                setIsOpen(false);
                            }}
                            style={{
                                textAlign: 'left',
                                padding: '8px',
                                backgroundColor: hasUserTheme && theme === t.id ? 'var(--btn-bg)' : 'transparent',
                                color: hasUserTheme && theme === t.id ? 'var(--btn-text)' : 'var(--text-color)',
                                border: '1px solid var(--secondary-color)',
                                borderRadius: 'var(--border-radius)',
                                fontFamily: 'inherit',
                                cursor: 'pointer'
                            }}
                            role="menuitem"
                            aria-label={`Cambia a tema ${t.label}`}
                        >
                            {hasUserTheme && theme === t.id ? '> ' : '  '}{t.label}
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--btn-text)',
                    border: 'var(--border-style)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--box-shadow)',
                    transition: 'transform 150ms ease'
                }}
                title="Cambia Tema"
                aria-label="Apri menu temi"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <Settings size={24} color={theme === '370' ? 'var(--accent-color)' : 'currentColor'} />
            </button>
        </div>
    );
};
