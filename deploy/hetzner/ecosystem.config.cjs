module.exports = {
  apps: [
    {
      name: "glp-notification-worker",
      cwd: "/var/www/glp",
      script: "/root/.bun/bin/bun",
      args: "run notifications:deliver",
      interpreter: "none",
      autorestart: false,
      cron_restart: "*/5 * * * *",
      time: true,
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
