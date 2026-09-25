-- 电力配网抢修工单系统：报修 -> 派工 -> 复电 全链路
-- 派工业务规则同时落在后端 rules/ 与本库视图 v_crew_dispatch_eligibility，
-- 页面与服务只消费判定结果，不自行拼规则。

CREATE TABLE IF NOT EXISTS grid_asset (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_code VARCHAR(64) NOT NULL,
  asset_type VARCHAR(64),
  feeder_line VARCHAR(128),
  voltage_level VARCHAR(16),
  location_desc VARCHAR(255),
  health_status ENUM('NORMAL','WATCH','DEGRADED','DANGEROUS') NOT NULL DEFAULT 'NORMAL',
  owner_team_id INT NULL
);

CREATE TABLE IF NOT EXISTS fault_report (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reporter_name VARCHAR(64) NOT NULL,
  phone VARCHAR(32),
  asset_id INT NOT NULL,
  fault_type ENUM('OUTAGE','VOLTAGE_LOW','TRIP','EQUIPMENT_DAMAGE','SAFETY_RISK') NOT NULL,
  address_desc VARCHAR(255),
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  report_channel VARCHAR(32),
  status ENUM('WAIT_DISPATCH','ASSIGNED','ARRIVED','REPAIRING','RESTORED','CLOSED') NOT NULL DEFAULT 'WAIT_DISPATCH',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fault_asset FOREIGN KEY (asset_id) REFERENCES grid_asset(id)
);

CREATE TABLE IF NOT EXISTS repair_ticket (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fault_report_id INT NOT NULL,
  team_id INT NULL,
  dispatcher_id INT NULL,
  priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('WAIT_DISPATCH','ASSIGNED','ARRIVED','REPAIRING','RESTORED','CLOSED') NOT NULL DEFAULT 'WAIT_DISPATCH',
  assigned_at DATETIME NULL,
  restored_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_fault FOREIGN KEY (fault_report_id) REFERENCES fault_report(id)
);

CREATE TABLE IF NOT EXISTS crew (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  leader_id INT,
  skill_tags VARCHAR(255) COMMENT '逗号分隔技能码：OUTAGE_REPAIR/LINE_MAINT/EQUIP_REPAIR/HOTLINE_MAINT',
  duty_status ENUM('ON_DUTY','OFF_DUTY','RESTING') NOT NULL DEFAULT 'ON_DUTY',
  current_ticket_id INT NULL COMMENT '非空=被未结工单占用，派工阻断',
  contact_phone VARCHAR(32)
);

-- 故障类型 -> 必备技能（规则表，与 backend/src/rules/skillMatrix.ts 同口径）
CREATE TABLE IF NOT EXISTS fault_skill_rule (
  fault_type ENUM('OUTAGE','VOLTAGE_LOW','TRIP','EQUIPMENT_DAMAGE','SAFETY_RISK') PRIMARY KEY,
  required_skill ENUM('OUTAGE_REPAIR','LINE_MAINT','EQUIP_REPAIR','HOTLINE_MAINT') NOT NULL,
  skill_label VARCHAR(32) NOT NULL
);
INSERT INTO fault_skill_rule (fault_type, required_skill, skill_label) VALUES
  ('OUTAGE',             'OUTAGE_REPAIR', '停电抢修'),
  ('VOLTAGE_LOW',        'LINE_MAINT',    '线路检修'),
  ('TRIP',               'LINE_MAINT',    '线路检修'),
  ('EQUIPMENT_DAMAGE',   'EQUIP_REPAIR',  '设备检修'),
  ('SAFETY_RISK',        'HOTLINE_MAINT', '带电作业')
ON DUPLICATE KEY UPDATE required_skill = VALUES(required_skill), skill_label = VALUES(skill_label);

CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  part_code VARCHAR(64),
  part_name VARCHAR(128),
  quantity INT,
  warehouse_name VARCHAR(64),
  approved_by VARCHAR(64),
  usage_status VARCHAR(32),
  CONSTRAINT fk_part_ticket FOREIGN KEY (ticket_id) REFERENCES repair_ticket(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(128),
  target_type VARCHAR(32),
  target_id VARCHAR(32),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 班组当前占用视图：未结工单 = ASSIGNED/ARRIVED/REPAIRING
CREATE OR REPLACE VIEW v_crew_occupancy AS
SELECT c.id AS crew_id, c.name AS crew_name, c.duty_status,
       t.id AS open_ticket_id, t.status AS ticket_status
FROM crew c
LEFT JOIN repair_ticket t
  ON t.team_id = c.id AND t.status IN ('ASSIGNED','ARRIVED','REPAIRING');

-- 派工资格视图：按故障类型逐班组判定三类阻断（技能/待命/未结工单）
CREATE OR REPLACE VIEW v_crew_dispatch_eligibility AS
SELECT f.id AS fault_report_id, f.fault_type, r.required_skill,
       c.id AS crew_id, c.name AS crew_name, c.duty_status,
       FIND_IN_SET(r.required_skill, REPLACE(c.skill_tags, ' ', '')) > 0 AS skill_matched,
       c.duty_status = 'ON_DUTY' AS on_duty,
       t.id IS NULL AS free,
       t.id AS blocking_ticket_id,
       (FIND_IN_SET(r.required_skill, REPLACE(c.skill_tags, ' ', '')) > 0
        AND c.duty_status = 'ON_DUTY'
        AND t.id IS NULL) AS eligible
FROM fault_report f
JOIN fault_skill_rule r ON r.fault_type = f.fault_type
JOIN crew c
LEFT JOIN repair_ticket t
  ON t.team_id = c.id AND t.status IN ('ASSIGNED','ARRIVED','REPAIRING')
WHERE f.status = 'WAIT_DISPATCH';
