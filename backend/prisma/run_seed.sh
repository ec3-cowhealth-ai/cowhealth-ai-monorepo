#!/bin/bash

set -e

DB_HOST="localhost"
DB_PORT="33071"
DB_USER="root"
DB_PASSWORD="12345678"
DB_NAME="cowhealth-db"

SQL_FILE="$(dirname "$0")/seed_data.sql"

echo ""
echo "============================================"
echo "  CowHealth AI — Seed Data"
echo "============================================"
echo "  Host:  $DB_HOST:$DB_PORT"
echo "  Banco: $DB_NAME"
echo "  Arquivo: $SQL_FILE"
echo "============================================"
echo ""

if [ ! -f "$SQL_FILE" ]; then
  echo "[ERRO] Arquivo nao encontrado: $SQL_FILE"
  exit 1
fi

read -p "Isso vai APAGAR e recriar todos os dados. Continuar? (s/N) " confirm
if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
  echo "Cancelado."
  exit 0
fi

echo ""
echo "[1/3] Conectando ao banco..."
MYSQL_BIN=$(command -v mysql 2>/dev/null || echo "/usr/local/mysql/bin/mysql")

"$MYSQL_BIN" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1" > /dev/null 2>&1 \
  && echo "      OK — conexao estabelecida." \
  || { echo "[ERRO] Nao foi possivel conectar. Verifique as credenciais e se o MySQL esta rodando."; exit 1; }

echo "[2/3] Executando seed_data.sql..."
echo "      (dados de sensor podem demorar alguns minutos...)"
echo ""
"$MYSQL_BIN" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"

echo ""
echo "[3/3] Concluido!"
echo ""
echo "============================================"
echo "  Acesso (senha placeholder — veja abaixo)"
echo "============================================"
echo "  admin@cowhealth.com      SuperAdmin"
echo "  gerente@cowhealth.com    Administrador"
echo "  vet@cowhealth.com        Veterinario"
echo "  zoot@cowhealth.com       Zootecnista"
echo "  fazenda@cowhealth.com    Gerente de Fazenda"
echo "  operador@cowhealth.com   Operador de Campo"
echo "  financeiro@cowhealth.com Financeiro"
echo "  obs@cowhealth.com        Observador"
echo "============================================"
echo ""
echo "  IMPORTANTE: Para ativar o login, gere o"
echo "  hash de senha e atualize os usuarios:"
echo ""
echo "  node -e \"require('bcrypt').hash('password123', 12).then(h => {"
echo "    console.log('UPDATE users SET password_hash = \\\"' + h + '\\\";');"
echo "  })\""
echo ""
