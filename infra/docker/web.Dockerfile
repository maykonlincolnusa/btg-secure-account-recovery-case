FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build -- --filter=@secure-recovery/web
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@secure-recovery/web"]
