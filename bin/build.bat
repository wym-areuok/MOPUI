@echo off
echo.
echo [信息] 打包Web工程，生成dist文件（生产环境）。
echo.

%~d0
cd %~dp0

cd ..
yarn build:prod

pause