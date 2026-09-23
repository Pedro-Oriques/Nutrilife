#!/bin/bash
set -e

echo "Aguardando o Mongo iniciar..."
/usr/local/bin/wait-for-it.sh mongo:27017 -t 60 -- echo "Mongo está disponível!"

echo "Iniciando a aplicação..."
# Inicia a aplicação em background
node dist/main.js &
APP_PID=$!

echo "Aguardando a aplicação ficar saudável..."
# Aguarda até que a aplicação responda em um endpoint de health check
# Altere a URL abaixo para o endpoint que sua aplicação disponibiliza, por exemplo, /health
until curl -s http://localhost:3500/status >/dev/null; do
  echo "Aplicação ainda não está pronta. Aguardando 5 segundos..."
  sleep 5
done

echo "Aplicação está pronta. Executando comandos de inicialização..."
# Execute os comandos de inicialização desejados:
yarn seed-admin
yarn seed-teste
yarn seed-academy

# echo "Instalando agente Zabbix..."
# /usr/local/bin/zabbix-entrypoint.sh

echo "Comandos de inicialização concluídos. Aguardando execução da aplicação..."
# Aguarda o processo da aplicação (foreground)
wait $APP_PID