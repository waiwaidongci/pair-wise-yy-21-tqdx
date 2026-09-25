import { faultReportRepository, gridAssetRepository, repairTicketRepository, transaction } from "../repositories/store";
import { createFaultReportDto, type FaultReportDto } from "../constructors/FaultReportDtoFactory";
import { healthOnFault } from "../rules/skillMatrix";
import { BusinessError } from "../utils/businessError";
import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";
import { FaultType } from "../constants/FaultType";
import type { FaultReportPayload } from "../types/FaultReportPayload";

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const faultReportService = {
  list: (): FaultReportDto[] =>
    faultReportRepository.findAll().map((fault) => {
      const asset = gridAssetRepository.findById(fault.asset_id);
      const ticket = repairTicketRepository.findByFaultReportId(fault.id);
      return createFaultReportDto(fault, {
        asset,
        ticketId: ticket?.id ?? null,
        ticketStatus: ticket?.status ?? null
      });
    }),

  /**
   * 登记故障：
   * 1. 必须关联在册资产（asset_id 来自台账选择，不允许手填游离资产）；
   * 2. 同一资产已存在未结故障时拒绝重复登记；
   * 3. 按严重等级联动劣化资产健康状态；
   * 4. 同时生成一张 WAIT_DISPATCH 待派工工单。
   * 故障单 + 工单 + 资产健康在同一事务提交。
   */
  register(payload: FaultReportPayload): FaultReportDto {
    const assetId = Number(payload.asset_id);
    const faultType = String(payload.fault_type ?? "");
    const severity = String(payload.severity ?? "MEDIUM");
    const reporterName = String(payload.reporter_name ?? "").trim();
    const phone = String(payload.phone ?? "").trim();

    if (!assetId || !faultType || !reporterName || !phone) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, { fields: "asset_id,fault_type,reporter_name,phone" }, 422);
    }
    if (!(FaultType as readonly string[]).includes(faultType)) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, { fields: "fault_type" }, 422);
    }
    if (!SEVERITIES.includes(severity)) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, { fields: "severity" }, 422);
    }
    const asset = gridAssetRepository.findById(assetId);
    if (!asset) {
      throw new BusinessError(ERROR_CODES.ASSET_NOT_FOUND, { asset_id: assetId }, 404);
    }
    const duplicated = faultReportRepository
      .findAll()
      .find((fault) => fault.asset_id === assetId && fault.status !== "RESTORED" && fault.status !== "CLOSED");
    if (duplicated) {
      throw new BusinessError(ERROR_CODES.FAULT_DUPLICATED, { asset_id: assetId, fault_id: duplicated.id }, 409);
    }

    const now = new Date().toISOString();
    return transaction(() => {
      const created = faultReportRepository.insert({
        reporter_name: reporterName,
        phone,
        asset_id: assetId,
        fault_type: faultType,
        address_desc: String(payload.address_desc ?? asset.location_desc),
        severity,
        report_channel: String(payload.report_channel ?? "95598"),
        status: "WAIT_DISPATCH",
        created_at: now
      });

      const targetHealth = healthOnFault(severity);
      gridAssetRepository.update(assetId, { health_status: targetHealth });

      repairTicketRepository.insert({
        fault_report_id: created.id,
        team_id: null,
        dispatcher_id: null,
        priority: severity,
        status: "WAIT_DISPATCH",
        assigned_at: null,
        restored_at: null,
        created_at: now
      });

      console.info(renderLog(LOG_TEMPLATES.FaultReport.create, { fault_id: created.id, asset_id: assetId, fault_type: faultType }));
      console.info(renderLog(LOG_TEMPLATES.GridAsset.status, { asset_id: assetId, from: asset.health_status, to: targetHealth }));

      return createFaultReportDto(created, {
        asset: gridAssetRepository.findById(assetId),
        ticketId: repairTicketRepository.findByFaultReportId(created.id)?.id ?? null,
        ticketStatus: "WAIT_DISPATCH"
      });
    });
  }
};
