export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Secure Account Recovery API",
    version: "0.1.0",
    description:
      "API de referência para recuperação segura de conta, verificação de identidade, avaliação de risco e alteração sensível de contato."
  },
  paths: {
    "/api/recovery/requests": {
      post: {
        summary: "Cria solicitação de recuperação",
        tags: ["Recovery"]
      }
    },
    "/api/recovery/requests/{protocolId}": {
      get: {
        summary: "Consulta solicitação por protocolo",
        tags: ["Recovery"]
      }
    },
    "/api/recovery/requests/{protocolId}/face-match": {
      post: {
        summary: "Executa FaceMatch mockado",
        tags: ["Recovery"]
      }
    },
    "/api/recovery/requests/{protocolId}/liveness": {
      post: {
        summary: "Executa liveness mockado",
        tags: ["Recovery"]
      }
    },
    "/api/recovery/requests/{protocolId}/risk-assessment": {
      post: {
        summary: "Executa motor de risco baseado em regras",
        tags: ["Recovery", "Risk"]
      }
    },
    "/api/recovery/requests/{protocolId}/submit": {
      post: {
        summary: "Submete solicitação para decisão final ou revisão",
        tags: ["Recovery"]
      }
    },
    "/api/recovery/requests/{protocolId}/contact-change": {
      post: {
        summary: "Aplica alteração segura de e-mail e telefone",
        tags: ["Recovery"]
      }
    },
    "/api/admin/recovery/requests": {
      get: {
        summary: "Lista solicitações para operadores",
        tags: ["Admin"]
      }
    },
    "/api/admin/recovery/requests/{protocolId}": {
      get: {
        summary: "Detalha solicitação para operadores",
        tags: ["Admin"]
      }
    },
    "/api/admin/recovery/requests/{protocolId}/audit": {
      get: {
        summary: "Lista eventos de auditoria",
        tags: ["Admin", "Audit"]
      }
    },
    "/api/admin/recovery/requests/{protocolId}/approve": {
      post: {
        summary: "Aprova manualmente uma solicitação",
        tags: ["Admin"]
      }
    },
    "/api/admin/recovery/requests/{protocolId}/reject": {
      post: {
        summary: "Rejeita manualmente uma solicitação",
        tags: ["Admin"]
      }
    },
    "/api/admin/recovery/requests/{protocolId}/note": {
      post: {
        summary: "Adiciona nota operacional append-only",
        tags: ["Admin"]
      }
    }
  }
} as const;
