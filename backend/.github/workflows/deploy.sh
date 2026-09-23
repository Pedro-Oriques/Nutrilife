#!/bin/bash

set -e # Exit with nonzero exit code if anything fails

# Input Validation
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <branch> <working_dir>"
  exit 1
fi

readonly BRANCH=$1
readonly WORKING_DIR=$2
readonly ROOT_DIR="/var/www/html/01-ambienteQA"

echo "====================================== "
echo "SCRIPT EXECUTION INITIATED... "
echo "RUNNING SCRIPT: '$0' "
echo "BRANCH: '$BRANCH' "
echo "WORKING_DIR: '$WORKING_DIR' "
echo "ROOT_DIR: '$ROOT_DIR' "
echo "====================================== "

echo "Searching for directory matching branch '$BRANCH' in '$ROOT_DIR'... "
branch_dir=$(find "$ROOT_DIR" -maxdepth 1 -type d -name "*$BRANCH" | head -n 1)

if [ -z "$branch_dir" ]; then
  echo "Directory matching '$BRANCH' not found in '$ROOT_DIR'... "
  exit 1
else
  echo "Directory found: '$branch_dir' "
fi

echo "Backing up current 'new-backend' directory... "
mkdir -p "$ROOT_DIR/$BRANCH-backup/"
tar -czf "$ROOT_DIR/$BRANCH-backup/$(date +%F).tar.gz" "$branch_dir"

set +e
echo "Keeping only the latest 3 backups... "
ls -1t "$ROOT_DIR/$BRANCH-backup"/*.tar.gz | tail -n +4 | xargs -r rm -f
set -e

echo "Synchronizing workspace files from '$WORKING_DIR' to '$branch_dir/new-backend'..."
rsync -av --exclude='.env' --delete "$WORKING_DIR"/ "$branch_dir/new-backend"/

echo "Cleaning directory '$WORKING_DIR'..."
rm -rf "$WORKING_DIR/"

echo "Installing npm dependencies... "
npm install --prefix="$branch_dir/new-backend"

echo "Generating Swagger documentation..."
npm run swagger-autogen --prefix="$branch_dir/new-backend"

# for some strange reason PM2 only use the right port if the app is started on the project directory
cd "$branch_dir/new-backend"


if pm2 describe "$BRANCH" > /dev/null 2>&1; then
  echo "PM2 process '$BRANCH' exists. Reloading... "
  pm2 reload --update-env "$BRANCH" \
    && echo "APP: '$BRANCH' reloaded... "
else
  echo "PM2 process '$BRANCH' does not exist. Starting..."
  pm2 start loader.js --name="$BRANCH" \
    && pm2 save --force \
    && echo "APP: '$BRANCH' installed... "
fi

echo "====================================== "
echo "SCRIPT EXECUTED SUCCESSFULLY... "
echo "====================================== "