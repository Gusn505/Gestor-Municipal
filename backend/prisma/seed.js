// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // departamentos base
  const nombres = ['Obras públicas', 'Alumbrado', 'Vivero', 'Ecologia', 'Limpia','Agua potable'];
  for (const nombre of nombres) {
    await prisma.departamento.upsert({
      where: { nombre },
      update: {},
      create: { nombre, descripcion: `${nombre} del municipio` }
    });
  }

  // crear presidente (cambiar contraseña luego)
  const pwdPres = await bcrypt.hash('Cambio123!', 10);
  await prisma.user.upsert({
    where: { email: 'presidencia@sombrerete.gob.mx' },
    update: {},
    create: {
      nombre: 'Presidente Municipal',
      email: 'presidencia@sombrerete.gob.mx',
      passwordHash: pwdPres,
      rol: 'presidente'
    }
  });

  // crear un director ejemplo
  const dept = await prisma.departamento.findFirst({ where: { nombre: 'Obras públicas' }});
  const pwdDir = await bcrypt.hash('Director123!', 10);
  await prisma.user.upsert({
    where: { email: 'director.obras@sombrerete.gob.mx' },
    update: {},
    create: {
      nombre: 'Director Obras',
      email: 'director.obras@sombrerete.gob.mx',
      passwordHash: pwdDir,
      rol: 'director',
      departamentoId: dept.id,
    }
  });

  console.log('Seed completado');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
  });
