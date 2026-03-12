module.exports = {
  apps: [
    {
      name: "glp-notification-worker",
      cwd: "/var/www/glp",
      script: "/root/.bun/bin/bun",
      args: "run --env-file .env.worker notifications:deliver",
      interpreter: "none",
      autorestart: false,
      cron_restart: "*/5 * * * *",
      time: true,
      log_file: "/var/log/pm2/glp-worker.log",
      error_file: "/var/log/pm2/glp-worker-error.log",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
