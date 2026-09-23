#!/bin/bash

# Armazena o tempo de início da execução
start_time=$(date +%s) &&
export start_time  &&
cd /var/www/html/actionsdeploy-teste &&
source .env &&

# Salva a string recebida na variável de ambiente "pbi" e "branch_back_end"
export pbi=$pbi &&
export branch_back_end=$branch_back_end &&
export repositorio=$repositorio &&
export real_branch_name=$real_branch_name &&
# # Define o caminho da pasta raiz
subdominio="$pbi-$repositorio" &&
pasta_raiz="/var/www/html/ambienteQA/$subdominio" &&

# Verifica se a pasta já existe
if [ -d "$pasta_raiz" ]; then
    echo "A pasta $subdominio já existe. Desfazendo todas as implementações anteriores..." &&

    nginx_conf="/etc/nginx/sites-enabled/${subdominio}.qacoders-academy.com.br.conf" &&
    pm2_id=$(pm2 id "${subdominio}-ambienteQA") &&

    # Remover a configuração do Nginx (se o arquivo existir)
    if [ -f "$nginx_conf" ]; then
        sudo rm "$nginx_conf" &&
        sudo service nginx restart
    fi

    # Parar e remover o processo do PM2 (se o ID existir)
    if [ -n "$pm2_id" ]; then
        pm2 delete "${subdominio}-ambienteQA" &&
        pm2 save
    fi

    # Parar e remover o contêiner Docker (se o contêiner existir)
    if docker ps -a | grep -q "${subdominio}-mongo"; then
        docker stop "${subdominio}-mongo" &&
        docker rm "${subdominio}-mongo"
    fi

    # Deletar a pasta
    sudo rm -rf "$pasta_raiz"
fi &&

## Cria uma nova pasta com o nome da variável pbi dentro de /var/www/html/ambienteQA
## pasta_raiz="/var/www/html/ambienteQA/$pbi-$repositorio" # #
cd /var/www/html/ambienteQA/ &&
mkdir $subdominio &&
pastaBackEnd="$pasta_raiz/$branch_back_end" &&
export pastaBackEnd &&

# Clona o repositório do GitHub com base na devopsNewBackend-PABLO especificada
git clone -b "$real_branch_name"  git@github.com:Qa-Coders/new-backend.git "$pastaBackEnd" &&

# Substitui a variavel TOKEN_SECRET do arquivo ".env" pelo novo conteúdo
echo "TOKEN_SECRET = 'asdsdfs#\$\$sdfs@\$#%&78*Dasda%*%@!29(asdada'" >  $pastaBackEnd/.env &&
echo "A variavel TOKEN_SECRET foi atualizada." &&

# Substitui a variavel TOKEN_EXPIRATION do arquivo ".env" pelo novo conteúdo
echo "TOKEN_EXPIRATION = '24h'" >>  $pastaBackEnd/.env &&
echo "A variavel TOKEN_EXPIRATION foi atualizada." &&

# Substitui a variavel PORT do arquivo ".env" pelo novo conteúdo
echo "PORT = ${pbi}" >>  $pastaBackEnd/.env &&
echo "A variavel PORT foi atualizada." &&

# Substitui a variavel DATABASE_URL do arquivo ".env" pelo novo conteúdo
echo "DATABASE_URL = mongodb://development:development@127.0.0.1:2${pbi}/admin" >>  $pastaBackEnd/.env &&
echo "A variavel DATABASE_URL foi atualizada." &&

# Substitui a variavel APP_API_HOST do arquivo ".env" pelo novo conteúdo
echo "APP_API_HOST = $subdominio.qacoders-academy.com.br" >>  $pastaBackEnd/.env &&
echo "A variavel APP_API_HOST foi atualizada." &&

# Substitui a variavel NODE_ENV do arquivo ".env" pelo novo conteúdo
echo "NODE_ENV = development" >>  $pastaBackEnd/.env &&
echo "A variavel NODE_ENV foi atualizada." &&

# Cat das variaveis do .env
cat $pastaBackEnd/.env &&

chown -R pipeline:www-data /var/www/html/ambienteQA/$subdominio &&
echo "Permissão de diretório $pastaBackEnd atualizada para chown -R pipeline:www-data" &&

## Gera o arquivo de configuração do Nginx com o nome "<$pbi>-<$repositorio>qacoders-academy.com.br.conf"
nginx_conf="/etc/nginx/sites-enabled/${subdominio}.qacoders-academy.com.br.conf" &&
novo_conteudo_nginx=$(cat <<EOL
server {
  listen 80;
  listen [::]:80;
  server_name ${subdominio}.qacoders-academy.com.br www.${subdominio}.qacoders-academy.com.br;
  return 302 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${subdominio}.qacoders-academy.com.br;

    ssl_certificate /etc/letsencrypt/live/qacoders-academy.com.br-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qacoders-academy.com.br-0001/privkey.pem;
    ssl_certificate /etc/letsencrypt/live/qacoders-academy.com.br-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qacoders-academy.com.br-0001/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    
    ## location geral.
    location / {
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass http://localhost:2${pbi}/;
        proxy_ssl_session_reuse off;
        proxy_set_header Host \$http_host;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
    }

}
EOL
) &&

echo "$novo_conteudo_nginx" | sudo tee "$nginx_conf" > /dev/null &&

# Testa se o novo arquivo de configuração não entra em conflito com as configurações atuais do Nginx
sudo nginx -t &&

# Verifica o retorno do teste
if [ $? -ne 0 ]; then
    echo "O arquivo de configuração do Nginx apresenta erros. Desfazendo modificações anteriores..." &&
    sudo rm -rf "$pastaBackEnd" &&
    sudo rm "$nginx_conf" &&
    exit 1
fi &&

# Reinicia o serviço do Nginx
service nginx restart &&

# Executa o comando npm install --force na nova pasta
cd "$pastaBackEnd" &&
npm install --force &&
chown -R pipeline:www-data /var/www/html/ambienteQA/$subdominio &&

# Executando banco de dados mongo para essa aplicação
docker run --name ${subdominio}-mongo -d -p 3${pbi}:27017 mongo &&

# Executa o pm2 na nova pasta
app_name="${subdominio}-ambienteQA"
pm2 start loader.js --name "$app_name" --watch &&
pm2 save &&

# Calcula e exibe o tempo total de execução
echo "O Deploy foi executado com sucesso." &&
echo "Acesse a aplicação no seguinte link: https://$subdominio.qacoders-academy.com.br " &&
end_time=$(date +%s) # Armazena o tempo de término da execução
export end_time
execution_time=$((end_time - start_time)) # Calcula o tempo total de execução em segundos
export execution_time


echo "Tempo de execução: $execution_time segundos"
