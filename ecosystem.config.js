module.exports = {
  apps: [
    {
      name: "zaya-cms-api",
      script: "npm start",
      args: ["--color"],
      env: {
        NODE_ENV: "prod",
        SERVER_ENV: "prod",
        DEBUG: "server:*",
        DEBUG_COLORS: true,
      },
    },
  ],
};
