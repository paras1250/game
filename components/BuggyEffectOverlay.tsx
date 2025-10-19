
import React, { useState, useEffect } from 'react';
import { BUGGY_MESSAGES } from '../constants';

const BuggyEffectOverlay: React.FC = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Pick a random message when the component mounts
        setMessage(BUGGY_MESSAGES[Math.floor(Math.random() * BUGGY_MESSAGES.length)]);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <style>{`
                @keyframes glitch-in {
                    0% { transform: scale(0.8) skewX(-10deg); opacity: 0; }
                    50% { transform: scale(1.05) skewX(5deg); opacity: 1; }
                    100% { transform: scale(1) skewX(0deg); opacity: 1; }
                }
                .glitch-box {
                    animation: glitch-in 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
                }
                @keyframes scanline-flicker {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                }
                .scanline-overlay {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
                    background-size: 100% 4px;
                    animation: scanline-flicker 0.1s linear infinite;
                }
            `}</style>
            <div className="glitch-box w-full max-w-md bg-gray-900 border-4 border-red-500 rounded-lg shadow-2xl shadow-red-500/50 font-mono text-white relative overflow-hidden">
                <div className="bg-red-600 px-4 py-2 flex justify-between items-center">
                    <h2 className="text-lg font-bold">SYSTEM_FAILURE</h2>
                    <div className="flex space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    </div>
                </div>
                <div className="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mx-auto mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xl text-yellow-300">Your code has bugged out!</p>
                    <p className="text-md text-gray-300 mt-2">&gt; {message}</p>
                </div>
                <div className="scanline-overlay"></div>
            </div>
        </div>
    );
};

export default BuggyEffectOverlay;
