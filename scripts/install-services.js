#!/usr/bin/env node
/**
 * Install dependencies for all services
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const services = [
  'gateway',
  'services/auth-service',
  'services/properties-service',
  'services/plots-service',
  'services/transactions-service',
  'services/users-service',
  'services/notifications-service',
  'shared',
];

console.log('🚀 Installing dependencies for all services...\n');
let hasFailures = false;

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', service);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⏭️  Skipping ${service} (directory not found)`);
    return;
  }

  if (!fs.existsSync(path.join(servicePath, 'package.json'))) {
    console.log(`⏭️  Skipping ${service} (no package.json)`);
    return;
  }

  console.log(`📦 Installing dependencies for ${service}...`);
  
  try {
    execSync('npm install --ignore-scripts --workspaces=false', {
      cwd: servicePath,
      stdio: 'inherit',
    });
    console.log(`✅ ${service} - Done\n`);
  } catch (error) {
    hasFailures = true;
    console.error(`❌ ${service} - Failed`);
    console.error(error.message);
  }
});

if (hasFailures) {
  console.error('\n⚠️  Some services failed to install dependencies.');
  process.exit(1);
}

console.log('✨ All dependencies installed successfully!');

