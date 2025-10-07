-- DropForeignKey
ALTER TABLE "public"."Evidencia" DROP CONSTRAINT "Evidencia_tareaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HistorialTarea" DROP CONSTRAINT "HistorialTarea_tareaId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Evidencia" ADD CONSTRAINT "Evidencia_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "public"."Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorialTarea" ADD CONSTRAINT "HistorialTarea_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "public"."Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
