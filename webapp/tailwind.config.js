/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // I. Tổng quan Phong cách & Bảng Màu (Color Palette)
        // Nền (Background)
        'bg-dark': 'var(--bg-dark)', // #080A0D - Deep Dark
        
        // Màu Nhấn (Accent) - Màu công nghệ cao, dùng cho điểm tương tác và trạng thái quan trọng
        'accent-cyan': 'var(--accent-cyan)', // #00FFFF - Vibrant Cyan
        'accent-blue': 'var(--accent-blue)', // #007bff - Electric Blue
        
        // Card & UI Colors
        'card-dark': 'var(--card-dark)',
        'text-light': 'var(--text-light)',
        'text-subtle': 'var(--text-subtle)',
        'border-dark': 'var(--border-dark)',
        
        // Status colors
        'status-pending': 'var(--status-pending)',
        'status-inprogress': 'var(--status-inprogress)',
        'status-completed': 'var(--status-completed)',
        
        // Legacy colors (giữ cho tương thích)
        'primary-blue': 'var(--primary-blue)',
        'accent-indigo': 'var(--accent-indigo)',
        // Legacy colors (giữ lại cho tương thích)
        priority: {
          urgent: '#f97316',
          high: '#ef4444',
          medium: '#facc15',
          low: '#22c55e',
        },
        status: {
          new: '#38bdf8',
          processing: '#6366f1',
          completed: '#22c55e',
          breached: '#ef4444',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.9 },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

