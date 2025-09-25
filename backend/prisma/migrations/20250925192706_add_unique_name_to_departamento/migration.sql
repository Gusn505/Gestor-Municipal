/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Departamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nombre_key" ON "public"."Departamento"("nombre");
