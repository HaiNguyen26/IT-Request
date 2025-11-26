module.exports = {
  apps: [{
    name: 'it-request-api',
    script: './server/dist/index.js',
    cwd: '/var/www/it-request-tracking',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgres://it_user:your_password@localhost:5432/it_request_tracking'
    },
    error_file: '/var/log/pm2/it-api-error.log',
    out_file: '/var/log/pm2/it-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads']
  }]
}

