import { FaultType, isFaultType } from "../constants/FaultType";
import { FaultStatus } from "../constants/FaultStatus";
import { FAULT_HEALTH_RULE } from "../constants/healthRules";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES, renderMessage } from "../constants/errorMessages";
import { BusinessError } from "../utils/BusinessError";
import { nextFaultNo } from "../utils/numbering";
import { transaction } from "../store/dataStore";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { createFaultReportDto } from "../constructors/FaultReportDtoFactory";
import { writeAudit } from "./AuditService";

export interface CreateFaultInput {
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity?: string;
  report_channel?: string;
}

export const faultReportService = {
  list() {
    // 附带资产与工单摘要，页面登记故障后可直接看到关联资产和派工情况
    return faultReportRepository.findAll().map((fault) => {
      const asset = gridAssetRepository.findById(fault.asset_id);
      const openTicket = repairTicketRepository.findOpenByFault(fault.id);
      return createFaultReportDto(fault, asset, openTicket);
    });
  },

  /** 登记故障：关联资产，资产健康按故障类型降级。 */
  create(input: CreateFaultInput, actor = "调度值班员") {
    if (!input.reporter_name || !input.phone) {
      throw new BusinessError(
        ERROR_CODES.VALIDATION_FAILED,
        "报修人姓名与联系电话不能为空",
        400
      );
    }
    if (!isFaultType(input.fault_type)) {
      throw new BusinessError(
        ERROR_CODES.VALIDATION_FAILED,
        `故障类型必须是：${FaultType.join(" / ")}`,
        400
      );
    }
    const asset = gridAssetRepository.findById(Number(input.asset_id));
    if (!asset) {
      throw new BusinessError(
        ERROR_CODES.ASSET_NOT_FOUND,
        renderMessage(ERROR_MESSAGES.ASSET_NOT_FOUND, { id: input.asset_id }),
        404
      );
    }

    return transaction((tx) => {
      const faultNo = nextFaultNo();
      const fault = faultReportRepository.insertIn(tx, {
        fault_no: faultNo,
        reporter_name: input.reporter_name,
        phone: input.phone,
        asset_id: asset.id,
        fault_type: input.fault_type,
        address_desc: input.address_desc ?? "",
        severity: input.severity ?? "MEDIUM",
        report_channel: input.report_channel ?? "电话报修",
        status: FaultStatus[0],
        created_at: new Date().toISOString()
      });

      const healthBefore = asset.health_status;
      const healthAfter = FAULT_HEALTH_RULE[input.fault_type as FaultType];
      gridAssetRepository.updateHealthIn(tx, asset.id, healthAfter);

      writeAudit(tx, actor, "FaultReport", "create", "FaultReport", faultNo, {
        faultNo,
        faultType: input.fault_type,
        assetCode: asset.asset_code,
        severity: fault.severity
      });
      writeAudit(tx, actor, "GridAsset", "healthChange", "GridAsset", asset.asset_code, {
        assetCode: asset.asset_code,
        from: healthBefore,
        to: healthAfter
      });

      return createFaultReportDto(
        fault,
        { ...asset, health_status: healthAfter },
        undefined
      );
    });
  }
};
