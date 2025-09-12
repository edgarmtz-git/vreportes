#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Verifies that everything is ready for Vercel deployment
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Verificando preparación para despliegue en Vercel...\n');

const checks = [
  {
    name: 'vercel.json existe',
    check: () => existsSync('vercel.json'),
    fix: 'Crear archivo vercel.json con la configuración de Vercel'
  },
  {
    name: '.vercelignore existe',
    check: () => existsSync('.vercelignore'),
    fix: 'Crear archivo .vercelignore para optimizar el despliegue'
  },
  {
    name: 'Build script funciona',
    check: () => {
      try {
        execSync('npm run build:vercel', { stdio: 'pipe' });
        return true;
      } catch (error) {
        return false;
      }
    },
    fix: 'Ejecutar npm run build:vercel para verificar el build'
  },
  {
    name: 'Package.json tiene scripts necesarios',
    check: () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      return packageJson.scripts && packageJson.scripts['build:vercel'];
    },
    fix: 'Agregar script build:vercel al package.json'
  },
  {
    name: 'Dependencias instaladas',
    check: () => existsSync('node_modules'),
    fix: 'Ejecutar npm install para instalar dependencias'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${check.name}`);
  
  if (!passed) {
    console.log(`   💡 ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 ¡Todo listo para desplegar en Vercel!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Instalar Vercel CLI: npm i -g vercel');
  console.log('2. Login: vercel login');
  console.log('3. Desplegar: vercel --prod');
  console.log('4. Configurar variables de entorno en el dashboard');
} else {
  console.log('⚠️  Algunos checks fallaron. Revisa los problemas antes de desplegar.');
}

console.log('\n📖 Documentación completa: VERCEL_DEPLOYMENT.md');
