"use client";

import React from "react";

export const UnicsiLoader = ({ size = 200, fullScreen = false }) => {
  const id = `loader-${size}`;

  const wrapStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh", // 🔥 force full viewport height
    position: fullScreen ? "fixed" : "relative",
    inset: fullScreen ? 0 : "auto",
    background: fullScreen ? "#0d0d0d" : "transparent",
    zIndex: fullScreen ? 9999 : "auto",
  };

  return (
    <div style={wrapStyle} aria-label="Loading" role="status">
      <style>{`
        @keyframes ringSpin {
          0% { transform: rotate(-90deg); }
          100% { transform: rotate(270deg); }
        }

        @keyframes drawTop {
          0% {
            stroke-dashoffset: 220;
            opacity: 1;
          }
          70% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }

        @keyframes drawBottom {
          0% {
            stroke-dashoffset: 220;
            opacity: 0;
          }
          30% { opacity: 0; }
          90% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes dotPulse {
          0%,100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.6);
            opacity: 1;
          }
        }

        .ln-ring {
          stroke-dasharray: 314;
          transform-origin: 100px 100px;
          animation: ringSpin 3s linear infinite;
        }

        .ln-path-top {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: drawTop 4s ease-in-out infinite;
        }

        .ln-path-bottom {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: drawBottom 4s ease-in-out infinite;
        }

        .ln-group circle {
          transform-origin: center;
          animation: dotPulse 2s ease-in-out infinite;
        }
      `}</style>

      <svg width={size} height={size} viewBox="0 0 200 200">
        <defs>
          <linearGradient
            id={`grad-${id}`}
            x1="30"
            y1="18"
            x2="68"
            y2="78"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="100%" stopColor="#0097b2" />
            <stop offset="70%" stopColor="#7ed957" />
          </linearGradient>

          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* background */}
        <circle cx="100" cy="100" r="75" fill="#161d1a" />

        {/* ring track */}
        <circle
          cx="100"
          cy="100"
          r="75"
          stroke="#1c2b23"
          strokeWidth="6"
          fill="none"
        />

        {/* animated ring */}
        <circle
          cx="100"
          cy="100"
          r="75"
          stroke={`url(#grad-${id})`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="ln-ring"
        />

        {/* animated paths */}
        <g className="ln-group" filter={`url(#glow-${id})`}>
          {/* TOP PATH */}
          <path
            className="ln-path-top"
            stroke={`url(#grad-${id})`}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            d="
              M80 50
              L80 145
              C80 145 88 159 98 145
              L98 110
              C98 105 108 95 116 108
              L116 150
            "
          />

          {/* dots */}
          <circle cx="80" cy="50" r="3" fill={`url(#grad-${id})`} />
          <circle cx="116" cy="150" r="3" fill={`url(#grad-${id})`} />
        </g>
      </svg>
    </div>
  );
};
