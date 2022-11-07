#!/bin/bash
set -e
directory=docs/.vitepress/dist
branch=gh-pages
build_command() {
  yarn docs:build
}

echo "\033[0;32m删除旧的文章...\033[0m"
rm -rf $directory

echo "\033[0;32m新建分支 $branch...\033[0m"
git worktree add $directory $branch

echo "\033[0;32m生成新的文章...\033[0m"
build_command

echo "\033[0;32m部署到 $branch 分支...\033[0m"
cd $directory && 
git add --all &&
git commit -m "Deploy updates" &&
git push origin $branch

echo "\033[0;32m清理...\033[0m"
git worktree remove $directory
