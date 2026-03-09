import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BootSequenceProps {
    onComplete: () => void;
}

const BOOT_LINES = [
    "GN370 V2.0 INITIALIZATION SEQUENCE START...",
    "MEMORY CHECK: OK 640K NORMAL / 32M EXTENDED",
    "LOADING KERNEL: GN370.SYS ... OK",
    "MOUNTING DATABASE VOLUMES:",
    " [ ] VOLUME 1 (ORIGINI.DAT) ... OK",
    " [ ] VOLUME 2 (CICLI.DAT)   ... OK",
    " [ ] VOLUME 3 (OMBRE.DAT)   ... OK",
    "LOADING THEME MANAGER ... OK",
    "",
    "ANNO DOMINI MCMLXX — SYSTEM 3270 READY",
    "VERIFYING INTEGRITY CONSTRAINTS (NVH-01) ... SUCCESS",
    "",
    "                                       ",
    "                        ⚜             ",
    "         A N N O   D O M I N I   M L X I I I ",
    "             R U G G E R O   D'A L T A V I L L A  ",
    "                                       ",
    "",
    "SYSTEM IS UNLOCKED. PROCEDURA AVVIATA."
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let currentLine = 0;

        const interval = setInterval(() => {
            if (currentLine < BOOT_LINES.length) {
                setLines(prev => [...prev, BOOT_LINES[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
                setIsFinished(true);
                // Wait a moment before unmounting
                setTimeout(() => {
                    onComplete();
                }, 1200);
            }
        }, 80); // 80ms delay per line come da Bibbia

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#000000',
                color: '#32CD32', // Green phosphor standard per il boot
                fontFamily: '"Courier New", Courier, monospace',
                padding: '40px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                overflow: 'hidden'
            }}
        >
            {lines.map((line, idx) => (
                <div key={idx} style={{
                    minHeight: '1.2em',
                    whiteSpace: 'pre',
                    textShadow: '0 0 5px rgba(50, 205, 50, 0.7)'
                }}>
                    {line}
                </div>
            ))}

            {!isFinished ? (
                <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '20px',
                        backgroundColor: '#32CD32',
                        marginTop: '10px'
                    }}
                />
            ) : null}
        </motion.div>
    );
};
