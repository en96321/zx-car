const excutePath = `${__dirname}/index.mjs`
await $`echo "alias create-car='zx ${excutePath}'" >> ~/.zshrc`
await $`echo "alias create-car='zx ${excutePath}'" >> ~/.bashrc`