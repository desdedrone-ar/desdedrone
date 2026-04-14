#!/bin/bash
# ============================================================
#  run_odm.sh — Genera ortomosaico con OpenDroneMap (Docker)
#  Optimizado para DJI Air 2S a ~65 m de altura (~1.8 cm/px)
# ============================================================

# ── CONFIGURACIÓN ───────────────────────────────────────────
# Carpeta donde están tus JPGs del drone (ruta Windows con //)
IMAGES_DIR="D:/_FOTOGRAMETRIA/Parque  Muejeres argentinas"

# Nombre del proyecto (se crea una carpeta con este nombre)
PROJECT_NAME="ortomosaico_$(date +%Y%m%d_%H%M%S)"

# Resolución del ortomosaico en cm/px (2 = 2 cm/px, ideal a 65m)
ORTHO_RESOLUTION=2

# Incluir DSM (modelo de superficie digital)? true/false
GENERAR_DSM=true
# ────────────────────────────────────────────────────────────

# Previene que Git Bash en Windows manglee los paths de Docker
export MSYS_NO_PATHCONV=1

# Carpeta de salida: dentro de _FOTOGRAMETRIA/odm_projects/
OUTPUT_DIR="D:/_FOTOGRAMETRIA/odm_projects/${PROJECT_NAME}"
mkdir -p "${OUTPUT_DIR}/images"

echo ""
echo "=========================================="
echo "  DesdeDrone — Pipeline ODM"
echo "=========================================="
echo "  Proyecto : ${PROJECT_NAME}"
echo "  Imágenes : ${IMAGES_DIR}"
echo "  Salida   : ${OUTPUT_DIR}"
echo "  GSD obj. : ${ORTHO_RESOLUTION} cm/px"
echo "=========================================="
echo ""

# Copiar imágenes al proyecto ODM
echo "[1/3] Copiando imágenes al proyecto ODM..."
cp "${IMAGES_DIR}"/*.jpg "${OUTPUT_DIR}/images/" 2>/dev/null || \
cp "${IMAGES_DIR}"/*.JPG "${OUTPUT_DIR}/images/" 2>/dev/null

IMG_COUNT=$(ls "${OUTPUT_DIR}/images/" | wc -l)
echo "      ${IMG_COUNT} imágenes copiadas."

if [ "$IMG_COUNT" -lt 3 ]; then
  echo "ERROR: Se necesitan al menos 3 imágenes. Revisá la ruta IMAGES_DIR."
  exit 1
fi

# Construir flags opcionales
EXTRA_FLAGS=""
if [ "$GENERAR_DSM" = true ]; then
  EXTRA_FLAGS="--dsm"
fi

# Convertir path Windows (D:/...) al formato que Docker Desktop entiende en Git Bash
# Con MSYS_NO_PATHCONV=1 se pasa directo con letra de unidad
DOCKER_VOLUME="${OUTPUT_DIR}"

echo "[2/3] Lanzando OpenDroneMap en Docker..."
echo ""

docker run -ti --rm \
  -v "${DOCKER_VOLUME}:/datasets/code" \
  opendronemap/odm \
  --project-path /datasets \
  --orthophoto-resolution ${ORTHO_RESOLUTION} \
  --feature-quality high \
  --min-num-features 12000 \
  --auto-boundary \
  --optimize-disk-space \
  --skip-3dmodel \
  ${EXTRA_FLAGS}

# Verificar resultado
ORTHO_PATH="${OUTPUT_DIR}/odm_orthophoto/odm_orthophoto.tif"

echo ""
echo "[3/3] Verificando resultado..."

if [ -f "${ORTHO_PATH}" ]; then
  SIZE=$(du -sh "${ORTHO_PATH}" | cut -f1)
  echo ""
  echo "=========================================="
  echo "  ORTOMOSAICO GENERADO EXITOSAMENTE"
  echo "=========================================="
  echo "  Archivo : odm_orthophoto.tif"
  echo "  Tamaño  : ${SIZE}"
  echo "  Ruta    : ${OUTPUT_DIR}/odm_orthophoto/"
  if [ "$GENERAR_DSM" = true ]; then
    echo "  DSM     : ${OUTPUT_DIR}/odm_dem/dsm.tif"
  fi
  echo "=========================================="
else
  echo "  ERROR: No se encontró el ortomosaico. Revisá los logs de ODM."
  exit 1
fi
