FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build -- --filter=@secure-recovery/admin
EXPOSE 3002
CMD ["npm", "run", "start", "-w", "@secure-recovery/admin"]
