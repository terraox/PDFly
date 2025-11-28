import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function SuccessAnimation({ show, onComplete }) {
    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        if (show) {
            // Generate confetti particles
            const particles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100 - 50,
                y: Math.random() * -100 - 20,
                rotation: Math.random() * 360,
                color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)],
                delay: Math.random() * 0.3,
            }));
            setConfetti(particles);

            // Clear confetti after animation
            const timer = setTimeout(() => {
                setConfetti([]);
                if (onComplete) onComplete();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {/* Checkmark */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
            >
                <motion.div
                    animate={{
                        boxShadow: [
                            '0 0 0 0 rgba(34, 197, 94, 0.7)',
                            '0 0 0 20px rgba(34, 197, 94, 0)',
                            '0 0 0 0 rgba(34, 197, 94, 0)',
                        ],
                    }}
                    transition={{ duration: 1.5, repeat: 2 }}
                    className="rounded-full"
                >
                    <CheckCircle className="h-24 w-24 text-emerald-500" strokeWidth={2.5} />
                </motion.div>
            </motion.div>

            {/* Confetti */}
            {confetti.map((particle) => (
                <motion.div
                    key={particle.id}
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        rotate: 0,
                    }}
                    animate={{
                        x: particle.x * 4,
                        y: particle.y * 4 + 500,
                        opacity: 0,
                        rotate: particle.rotation * 3,
                    }}
                    transition={{
                        duration: 2,
                        delay: particle.delay,
                        ease: 'easeOut',
                    }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                        backgroundColor: particle.color,
                        left: '50%',
                        top: '50%',
                    }}
                />
            ))}
        </div>
    );
}
