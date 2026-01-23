import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InlineConfirm = ({ onConfirm, children, message = "Are you sure?", confirmText = "Confirm", confirmColor = "bg-red-600" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {children}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 z-[999] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-4 min-w-[200px]"
                    >
                        <p className="text-sm font-bold text-slate-800 mb-4 whitespace-nowrap">{message}</p>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                                className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm();
                                    setIsOpen(false);
                                }}
                                className={`px-3 py-1.5 text-[11px] font-bold text-white ${confirmColor} rounded-lg shadow-sm hover:opacity-90 transition-all`}
                            >
                                {confirmText}
                            </button>
                        </div>
                        {/* Triangle arrow */}
                        <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InlineConfirm;
