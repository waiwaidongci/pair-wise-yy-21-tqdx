-- grid-repair 配网抢修工单系统 数据库结构
-- 注意：当前后端运行态使用 JSON 文件存储（backend/data.json，首启自动生成），
-- 本脚本提供与实体字段一致的 MySQL 规范结构，供容器初始化与后续接入 Prisma/TypeORM 使用。

CREATE TABLE IF NOT EXISTS grid_asset (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_code VARCHAR(64) NOT NULL COMMENT '资产编码',
  asset_type VARCHAR(32) NOT NULL COMMENT '资产类型 LINE/TRANSFORMER/SWITCH',
  feeder_line VARCHAR(128) NOT NULL COMMENT '馈线',
  voltage_level VARCHAR(16) NOT NULL COMMENT '电压等级',
  location_desc VARCHAR(255) COMMENT '位置描述',
  health_status VARCHAR(16) NOT NULL DEFAULT 'NORMAL' COMMENT 'NORMAL/WATCH/DEGRADED/DANGEROUS',
  owner_team_id BIGINT NULL COMMENT '归属班组',
  INDEX idx_asset_feeder (feeder_line),
  INDEX idx_asset_health (health_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配网资产台账';

CREATE TABLE IF NOT EXISTS fault_report (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fault_no VARCHAR(32) NOT NULL UNIQUE COMMENT '故障编号 GZ-yyyyMMdd-xxx',
  reporter_name VARCHAR(64) NOT NULL COMMENT '报修人',
  phone VARCHAR(32) NOT NULL COMMENT '联系电话',
  asset_id BIGINT NOT NULL COMMENT '关联资产',
  fault_type VARCHAR(32) NOT NULL COMMENT 'OUTAGE/VOLTAGE_LOW/TRIP/EQUIPMENT_DAMAGE/SAFETY_RISK',
  address_desc VARCHAR(255) COMMENT '地址/现象',
  severity VARCHAR(16) NOT NULL DEFAULT 'MEDIUM' COMMENT 'LOW/MEDIUM/HIGH/CRITICAL',
  report_channel VARCHAR(32) NOT NULL DEFAULT '95598 热线',
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/PROCESSING/RESOLVED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fault_asset (asset_id),
  INDEX idx_fault_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='故障报修单';

CREATE TABLE IF NOT EXISTS repair_ticket (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_no VARCHAR(32) NOT NULL UNIQUE COMMENT '工单编号 WO-yyyyMMdd-xxx',
  fault_report_id BIGINT NOT NULL COMMENT '来源故障单',
  team_id BIGINT NOT NULL COMMENT '承接班组',
  dispatcher_id BIGINT NOT NULL COMMENT '调度员',
  priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(16) NOT NULL DEFAULT 'ASSIGNED'
    COMMENT 'WAIT_DISPATCH/ASSIGNED/ARRIVED/REPAIRING/RESTORED/CLOSED',
  assigned_at DATETIME NULL COMMENT '派工时间',
  arrived_at DATETIME NULL COMMENT '到场时间',
  restored_at DATETIME NULL COMMENT '复电时间',
  INDEX idx_ticket_fault (fault_report_id),
  INDEX idx_ticket_team (team_id),
  INDEX idx_ticket_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抢修工单';

CREATE TABLE IF NOT EXISTS crew (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL COMMENT '班组名称',
  leader_id BIGINT NULL COMMENT '班组长',
  skill_tags JSON NOT NULL COMMENT '技能标签数组',
  duty_status VARCHAR(16) NOT NULL DEFAULT 'ON_DUTY' COMMENT 'ON_DUTY/OFF_DUTY',
  current_ticket_id BIGINT NULL COMMENT '当前占用的未结工单，NULL 表示空闲',
  contact_phone VARCHAR(32),
  INDEX idx_crew_duty (duty_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抢修班组';

CREATE TABLE IF NOT EXISTS spare_part_usage (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL COMMENT '关联工单',
  part_code VARCHAR(64) NOT NULL,
  part_name VARCHAR(128) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  warehouse_name VARCHAR(128),
  approved_by VARCHAR(64),
  usage_status VARCHAR(16) NOT NULL DEFAULT 'ISSUED',
  INDEX idx_part_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='备件领用流水';

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64) NOT NULL COMMENT '操作人',
  action VARCHAR(64) NOT NULL COMMENT '实体.动作',
  target_type VARCHAR(32) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  detail VARCHAR(512) COMMENT '按 logTemplates 渲染后的中文描述',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_target (target_type, target_id),
  INDEX idx_audit_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作审计日志';
