'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DownloadModal } from '@/components/DownloadModal';

export const DownloadButtonCompact = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isDownloading) return;
    setIsModalOpen(true);
    setIsDownloading(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsDownloading(false);
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center justify-center rounded-full overflow-hidden
          ${isDownloading 
            ? 'cursor-wait' 
            : 'cursor-pointer'
          }
          bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
          dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600
          shadow-md hover:shadow-lg hover:shadow-emerald-500/25 dark:hover:shadow-emerald-400/20
          transition-shadow duration-300 h-8 w-8`}
        animate={{
          scale: isHovered && !isDownloading ? 1.05 : 1,
        }}
        transition={{ 
          duration: 0.2, 
          ease: [0.4, 0, 0.2, 1],
        }}
        title="Download"
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered && !isDownloading ? '100%' : '-100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Download icon */}
        <motion.svg
          className="w-4 h-4 text-white z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ 
            opacity: isDownloading ? 0 : 1,
            y: isDownloading ? 10 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16"
          />
        </motion.svg>

        {/* Spinner animation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          animate={{ opacity: isDownloading ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-1 h-1 bg-white rounded-full"
            animate={{
              x: [0, 6, 0, -6, 0],
              y: [0, -6, 0, 6, 0],
            }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1],
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.button>

      <DownloadModal isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
};

export default DownloadButtonCompact;
