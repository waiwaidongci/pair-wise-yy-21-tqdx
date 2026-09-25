# 电力配网抢修工单系统

面向供电所值班室的配网故障报修 → 技能匹配派工 → 班组占用 → 复电确认闭环平台。
报修登记即关联台账资产，系统按故障类型自动匹配具备相应技能的待命班组；已有未结工单的班组不能接单；复电确认时同步释放班组并把资产健康恢复为正常。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

- 前端：<http://localhost:20104>
- 后端健康检查：<http://localhost:21104/health>

> 后端运行态使用 JSON 文件持久化（`backend/data.json`，首次启动自动按种子生成，已在 `.gitignore` 中忽略）；
> `database/init.sql` 提供与实体一致的 MySQL 规范表结构。如需重置数据，删除 `backend/data.json` 后重启后端，或执行 `docker compose restart backend`（重建镜像时数据卷不影响该文件）。

## 本地开发方式

```bash
# 后端（默认 3000 端口）
cd backend && npm install && npm run dev

# 前端（20104，/api 已在 vite.config.ts 代理到 http://localhost:3000）
cd frontend && npm install && npm run dev
```

## 报修 → 复电 业务闭环

| 环节 | 触发 | 同一事务内联动更新 |
|---|---|---|
| 登记故障 | `POST /api/fault-report` | 关联台账资产；资产健康按故障类型降级（停电/设备损坏/隐患→危险，低电压→降级，跳闸→关注） |
| 候选评估 | `GET /api/repair-ticket/candidates?faultReportId=` | 只读返回每个班组的可接单结论与**全部阻断原因**、当前占用工单号 |
| 派工 | `POST /api/repair-ticket/dispatch` | 生成工单（已派工）；班组 `current_ticket_id` 占用；故障单转「抢修中」 |
| 到场 / 抢修 | `POST /api/repair-ticket/:id/arrive`、`/repair` | 工单状态流转并记录到场时间 |
| 复电确认 | `POST /api/repair-ticket/:id/restore` | 工单转「已复电」记复电时间；**释放班组占用**；故障单转「已复电」；**资产健康恢复 NORMAL** |

派工三条接单规则（缺一不可，命中多条会全部返回）：

1. 班组处于待命（`ON_DUTY`）；离线休整直接阻断。
2. 班组技能标签命中故障所需技能（见后端 `constants/dispatchRules.ts`）。
3. 班组没有未结工单占用（`current_ticket_id` 为空）；有未结工单时阻断并显示工单号。

状态不满足时接口返回 409 和 `code/message/detail.reasons`，前端在故障页候选面板与工单页直接展示阻断原因与当前占用。

## 规则 / 存储 / 页面 三层分离

项目刻意按职责分层，业务规则不落在页面或存储里：

- **规则层（backend/src/services + backend/src/constants）**
  - `DispatchPolicy.ts`：纯函数实现待命/技能/占用三条资格规则，输出阻断原因。
  - `RepairTicketService.ts`：派工、流转、复电的事务编排；`FaultReportService.ts` 登记与资产降级。
  - `dispatchRules.ts`（故障类型→技能）、`healthRules.ts`（故障→健康/复电恢复）、`ticketFlow.ts`（未结状态集合）。
- **存储层（backend/src/store + repositories）**
  - `store/dataStore.ts`：JSON 持久化 + `transaction()` 事务快照回滚；各 `repositories/*` 只做读写，不含规则。
  - 派工/复电在一个事务里同时改故障单、工单、班组、资产，任一失败整体回滚。
- **页面层（frontend/src/pages + components + hooks）**
  - 只负责展示与调用：`FaultsPage` 登记与候选阻断面板，`TicketsPage` 流转/时间线/占用，`DashboardPage` 态势，`AssetsPage` 台账。
  - `hooks/useCrewAvailability.ts` 拉取阻断画像，`hooks/useTicketFlow.ts` 控制流转按钮，写后用 `useWorkspaceData.refreshAfterWrite()` 联动刷新。

## 主要接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/grid-asset` | 资产台账（含故障统计、最近故障） |
| GET/POST | `/api/fault-report` | 故障列表 / 登记故障（关联资产并降级） |
| GET | `/api/repair-ticket` | 工单列表（聚合故障、班组、资产、备件） |
| GET | `/api/repair-ticket/candidates` | 候选班组评估与阻断原因 |
| POST | `/api/repair-ticket/dispatch` | 派工（可传 `team_id`，不传自动选合格班组） |
| POST | `/api/repair-ticket/:id/arrive` `/repair` `/restore` | 到场 / 抢修 / 复电确认 |
| GET | `/api/crew` | 班组列表（含当前占用工单号、是否可接单） |
| GET | `/api/spare-part-usage` | 备件领用记录 |
| GET | `/api/audit-log` | 操作审计日志（所有写操作按模板落日志） |

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | MySQL 8.0（规范表结构 `database/init.sql`）；运行态 JSON 持久化 |
| 部署 | Docker Compose（前端 Nginx 反代 `/api`） |

## 项目目录结构

```text
frontend/src/
├── api/            # 统一 client + 按实体分文件
├── stores/         # 按实体分 Pinia store
├── types/          # 共享类型
├── constants/      # 枚举、技能/健康文案
├── constructors/   # 表单默认结构
├── components/common/  # StatusBadge/PriorityTag/CrewCard/TimelineList/AssetTree/StatCard/EmptyState
├── hooks/          # useCrewAvailability/useTicketFlow/useWorkspaceData/usePagination
├── pages/          # Dashboard/Assets/Faults/Tickets/Parts
├── router/ utils/ mocks/

backend/src/
├── routes/ controllers/ services/   # 接口 → 控制器包装 → 规则服务
├── repositories/ store/             # 数据访问 + JSON 事务存储
├── models/ types/ constructors/
├── constants/                       # 枚举、匹配规则、错误码/消息、日志模板
├── middlewares/ utils/ config/
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`：默认 `grid-repair`
- `FRONTEND_PORT` / `BACKEND_PORT`：默认 `20104` / `21104`
- `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`：MySQL 端口与凭据
- `JWT_SECRET`：本地演示密钥
- `DATA_FILE`（后端，可选）：JSON 存储文件路径，默认 `backend/data.json`

## Docker 部署说明

- 顶层 `name: grid-repair`，容器名均带 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 前端 `${FRONTEND_PORT:-20104}:80`，后端 `${BACKEND_PORT:-21104}:3000`。
- MySQL 使用命名卷 `db_data`；数据库带 healthcheck，后端 `depends_on: condition: service_healthy`。
- 端口占用时改 `.env`；需要重置数据库卷执行 `docker compose down -v`。
- `docker compose config --quiet` 可用于校验编排文件。

## 枚举/常量出现位置清单

- **FaultType**（OUTAGE/VOLTAGE_LOW/TRIP/EQUIPMENT_DAMAGE/SAFETY_RISK）
  - 后端：`constants/FaultType.ts`（含类型守卫）、`constants/dispatchRules.ts`、`constants/healthRules.ts`、`services/FaultReportService.ts`、`services/DispatchPolicy.ts`
  - 前端：`constants/FaultType.ts`、`constants/healthText.ts`、`types/FaultReport.ts`、`utils/formatters.ts`、`pages/FaultsPage.vue`
- **TicketStatus**（WAIT_DISPATCH/ASSIGNED/ARRIVED/REPAIRING/RESTORED/CLOSED）
  - 后端：`constants/TicketStatus.ts`、`constants/ticketFlow.ts`、`services/RepairTicketService.ts`
  - 前端：`constants/TicketStatus.ts`、`types/RepairTicket.ts`、`components/common/StatusBadge.vue`、`hooks/useTicketFlow.ts`、`utils/formatters.ts`、`pages/TicketsPage.vue`
- **AssetHealthStatus**（NORMAL/WATCH/DEGRADED/DANGEROUS）
  - 后端：`constants/AssetHealthStatus.ts`、`constants/healthRules.ts`、`services/FaultReportService.ts`、`services/RepairTicketService.ts`
  - 前端：`constants/AssetHealthStatus.ts`、`components/common/StatusBadge.vue`、`components/common/AssetTree.vue`、`utils/formatters.ts`
- 另有 **FaultStatus**（PENDING/PROCESSING/RESOLVED）与 **CrewDutyStatus**（ON_DUTY/OFF_DUTY）分别在前后端 `constants/` 成对定义。

## 为什么会牵一发动全身

实体字段、枚举、匹配规则、日志模板、错误码/消息、DTO 工厂、store、组件被刻意拆分到多个目录并由多层直接引用：
例如新增一个故障类型，需要同时改技能匹配规则、健康降级规则、前后端枚举与文案、登记页下拉与展示徽标；调整派工规则只需改规则层，但会同时影响候选评估、派工事务与页面阻断提示。

## License

MIT
