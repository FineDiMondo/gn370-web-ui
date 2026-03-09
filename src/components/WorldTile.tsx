import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { WorldMetadata } from '../data/mockData';

interface WorldTileProps {
    worldInfo: WorldMetadata;
    worldKey: string;
}

export const WorldTile: React.FC<WorldTileProps> = ({ worldInfo, worldKey }) => {
    const navigate = useNavigate();

    const handlePress = () => {
        navigate(`/world/${worldKey}`);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePress}
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '120px',
                padding: '20px',
                backgroundColor: 'var(--tile-bg)',
                border: 'var(--tile-border)',
                borderRadius: 'var(--border-radius)',
                color: worldInfo.color_var,
                cursor: 'pointer',
                opacity: worldInfo.is_active ? 1 : 0.4,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <span style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                fontSize: '12px',
                color: 'var(--secondary-color)'
            }}>
                {worldInfo.id}
            </span>
            <h2 style={{ fontSize: '1.2rem', marginTop: '10px' }}>
                {worldInfo.name}
            </h2>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.8 }}>
                {worldInfo.is_active ? '[ ATTIVO ]' : '[ INATTIVO ]'}
            </div>
        </motion.button>
    );
};
