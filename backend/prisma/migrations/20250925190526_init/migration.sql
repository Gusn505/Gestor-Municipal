-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ciudadano', 'director', 'presidente', 'admin');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('pendiente', 'en_proceso', 'cumplido');

-- CreateTable
CREATE TABLE "public"."Departamento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "whatsapp_phone" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "public"."Role" NOT NULL DEFAULT 'ciudadano',
    "telefono" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departamento_id" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tarea" (
    "id" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_asignada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite" TIMESTAMP(3),
    "fecha_cumplido" TIMESTAMP(3),
    "estado" "public"."TaskStatus" NOT NULL DEFAULT 'pendiente',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "departamentoId" TEXT NOT NULL,
    "ciudadano_id" TEXT,
    "nombre_solicitante" TEXT,
    "direccion_solicitante" TEXT,
    "telefono_solicitante" TEXT,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Evidencia" (
    "id" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "subido_por" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HistorialTarea" (
    "id" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,
    "estadoAnterior" "public"."TaskStatus",
    "estadoNuevo" "public"."TaskStatus" NOT NULL,
    "cambiado_por" TEXT,
    "nota" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialTarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificacionWhatsApp" (
    "id" TEXT NOT NULL,
    "tareaId" TEXT,
    "departamentoId" TEXT,
    "telefono_envio" TEXT,
    "payload" JSONB,
    "respuesta" JSONB,
    "estado_envio" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificacionWhatsApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tarea_referencia_key" ON "public"."Tarea"("referencia");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "public"."Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tarea" ADD CONSTRAINT "Tarea_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tarea" ADD CONSTRAINT "Tarea_ciudadano_id_fkey" FOREIGN KEY ("ciudadano_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidencia" ADD CONSTRAINT "Evidencia_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "public"."Tarea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidencia" ADD CONSTRAINT "Evidencia_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorialTarea" ADD CONSTRAINT "HistorialTarea_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "public"."Tarea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorialTarea" ADD CONSTRAINT "HistorialTarea_cambiado_por_fkey" FOREIGN KEY ("cambiado_por") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificacionWhatsApp" ADD CONSTRAINT "NotificacionWhatsApp_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "public"."Tarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificacionWhatsApp" ADD CONSTRAINT "NotificacionWhatsApp_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
