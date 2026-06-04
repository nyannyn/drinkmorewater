# 喝水同步後端 —— 零 npm 依賴，僅需 Node 22（內建 node:sqlite）。
FROM node:22-slim

WORKDIR /app

# 後端會 require ../shared 的純函式，故一併帶入。
COPY shared/ ./shared/
COPY server/ ./server/

ENV PORT=8787
ENV DB_PATH=/data/data.sqlite
VOLUME /data
EXPOSE 8787

# 簡單健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

WORKDIR /app/server
CMD ["node", "server.js"]
