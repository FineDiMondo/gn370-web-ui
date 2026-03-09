import React from 'react';
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

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {isOpen && (
                <div style={{
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
                }}>
                    <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--secondary-color)', paddingBottom: '5px' }}>
                        SELEZIONA STILE
                    </h3>
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id);
                                setIsOpen(false);
                            }}
                            style={{
                                textAlign: 'left',
                                padding: '8px',
                                backgroundColor: theme === t.id ? 'var(--btn-bg)' : 'transparent',
                                color: theme === t.id ? 'var(--btn-text)' : 'var(--text-color)',
                                border: '1px solid var(--secondary-color)',
                                borderRadius: 'var(--border-radius)',
                                fontFamily: 'inherit',
                                cursor: 'pointer'
                            }}
                        >
                            {theme === t.id ? '> ' : '  '}{t.label}
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
                    boxShadow: 'var(--box-shadow)'
                }}
                title="Cambia Tema"
            >
                <Settings size={24} color={theme === '370' ? 'var(--accent-color)' : 'currentColor'} />
            </button>
        </div>
    );
};
