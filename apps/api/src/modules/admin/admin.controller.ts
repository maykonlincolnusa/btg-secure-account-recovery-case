import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { RecoveryService } from "../recovery/recovery.service";
import { AuditService } from "../audit/audit.service";
import { AdminDecisionDto, AdminNoteDto } from "./dto/admin-decision.dto";

@ApiTags("Admin")
@UseGuards(ThrottlerGuard)
@Controller("admin/recovery/requests")
export class AdminController {
  constructor(
    private readonly recovery: RecoveryService,
    private readonly audit: AuditService
  ) {}

  @Get()
  @ApiOperation({ summary: "Lista solicitações" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "risk", required: false })
  @ApiQuery({ name: "protocol", required: false })
  @ApiQuery({ name: "user", required: false })
  list(@Query() query: Record<string, string | undefined>) {
    return this.recovery.listAdmin(query);
  }

  @Get(":protocolId")
  @ApiOperation({ summary: "Detalha solicitação" })
  get(@Param("protocolId") protocolId: string) {
    return this.recovery.getAdmin(protocolId);
  }

  @Get(":protocolId/audit")
  @ApiOperation({ summary: "Lista eventos de auditoria" })
  auditTrail(@Param("protocolId") protocolId: string) {
    return this.audit.listByProtocol(protocolId);
  }

  @Post(":protocolId/approve")
  @ApiOperation({ summary: "Aprova manualmente" })
  approve(@Param("protocolId") protocolId: string, @Body() body: AdminDecisionDto, @Req() req: Request) {
    return this.recovery.approve(protocolId, body.operatorId, body.reason, body.note, req.requestId);
  }

  @Post(":protocolId/reject")
  @ApiOperation({ summary: "Rejeita manualmente" })
  reject(@Param("protocolId") protocolId: string, @Body() body: AdminDecisionDto, @Req() req: Request) {
    return this.recovery.reject(protocolId, body.operatorId, body.reason, body.note, req.requestId);
  }

  @Post(":protocolId/note")
  @ApiOperation({ summary: "Adiciona nota operacional" })
  note(@Param("protocolId") protocolId: string, @Body() body: AdminNoteDto, @Req() req: Request) {
    return this.recovery.addNote(protocolId, body.operatorId, body.note, req.requestId);
  }
}
